import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SerialStatus, Grade, MovementType } from '@prisma/client';

@Injectable()
export class StockService {
  private readonly logger = new Logger(StockService.name);

  constructor(private prisma: PrismaService) {}

  // ===========================
  // STOCK LEVEL MANAGEMENT
  // ===========================

  /**
   * Lấy hoặc tạo StockLevel cho product/warehouse/grade
   */
  async getOrCreateStockLevel(
    productTemplateId: string,
    warehouseId: string,
    grade: Grade | null,
    tx?: any, // Thêm transaction client
  ) {
    const client = tx || this.prisma;
    const normalizedGrade = grade ?? null;
    let stockLevel = normalizedGrade === null
      ? await client.stockLevel.findFirst({
        where: {
          productTemplateId,
          warehouseId,
          grade: null,
        },
      })
      : await client.stockLevel.findUnique({
        where: {
          productTemplateId_warehouseId_grade: {
            productTemplateId,
            warehouseId,
            grade: normalizedGrade,
          },
        },
      });

    if (!stockLevel) {
      stockLevel = await client.stockLevel.create({
        data: {
          productTemplateId,
          warehouseId,
          grade: normalizedGrade,
          physicalQty: 0,
          incomingQty: 0,
          qcInProgressQty: 0,
          availableQty: 0,
          reservedQty: 0,
          refurbishingQty: 0,
          damagedQty: 0,
          returnedQty: 0,
          averageCost: 0,
          totalValue: 0,
        },
      });
    }

    return stockLevel;
  }

  /**
   * Cập nhật StockLevel khi SerialItem thay đổi status
   */
  async updateStockLevelOnStatusChange(
    serialItemId: string,
    oldStatus: SerialStatus | null,
    newStatus: SerialStatus,
    userId: string,
    referenceType?: string,
    referenceId?: string,
    tx?: any, // Thêm transaction client
  ) {
    const client = tx || this.prisma;
    const serialItem = await client.serialItem.findUnique({
      where: { id: serialItemId },
      include: { 
        productTemplate: true,
        inboundItems: {
          include: {
            inboundRequest: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!serialItem) {
      throw new Error(`SerialItem ${serialItemId} not found`);
    }

    const { productTemplateId, warehouseId, grade } = serialItem;

    const performUpdate = async (txClient: any) => {
      // Get or create stock level
      const stockLevel = await this.getOrCreateStockLevel(
        productTemplateId,
        warehouseId,
        grade,
        txClient,
      );

      // Calculate changes
      const changes: any = {};

      // Trừ từ status cũ
      if (oldStatus) {
        const oldField = this.getStatusField(oldStatus);
        if (oldField) {
          changes[oldField] = { decrement: 1 };
        }
      }

      // Cộng vào status mới
      const newField = this.getStatusField(newStatus);
      if (newField) {
        changes[newField] = { increment: 1 };
      }

      // Cập nhật physicalQty
      const isOldInStock = oldStatus ? this.isInStock(oldStatus) : false;
      const isNewInStock = this.isInStock(newStatus);

      if (!isOldInStock && isNewInStock) {
        // Nhập kho (null → INCOMING hoặc SOLD → RETURNED)
        changes.physicalQty = { increment: 1 };
      } else if (isOldInStock && !isNewInStock) {
        // Xuất kho (AVAILABLE → SOLD hoặc DAMAGED → DISPOSED)
        changes.physicalQty = { decrement: 1 };
      }

      // Update stock level
      const updatedStockLevel = await txClient.stockLevel.update({
        where: { id: stockLevel.id },
        data: changes,
      });

      // Tạo StockMovement nếu IN/OUT kho vật lý
      if (!isOldInStock && isNewInStock) {
        // IN movement
        const inboundRequest = serialItem.inboundItems[0]?.inboundRequest;
        const supplierInfo = inboundRequest 
          ? `${inboundRequest.supplierType} - ${inboundRequest.supplierName}`
          : serialItem.source || 'Unknown source';

        await txClient.stockMovement.create({
          data: {
            productTemplateId,
            warehouseId,
            type: MovementType.IN,
            quantity: 1,
            serialItemId,
            referenceType: referenceType || 'INBOUND',
            referenceId: referenceId || inboundRequest?.id,
            unitCost: Number(serialItem.currentCostPrice),
            totalValue: Number(serialItem.currentCostPrice),
            balanceBefore: stockLevel.physicalQty,
            balanceAfter: stockLevel.physicalQty + 1,
            notes: `Nhập kho từ: ${supplierInfo} | Status: ${oldStatus || 'null'} → ${newStatus}`,
            createdById: userId,
          },
        });
      } else if (isOldInStock && !isNewInStock) {
        // OUT movement
        await txClient.stockMovement.create({
          data: {
            productTemplateId,
            warehouseId,
            type: MovementType.OUT,
            quantity: -1,
            serialItemId,
            referenceType: referenceType || (newStatus === SerialStatus.SOLD ? 'SALES' : 'OUTBOUND'),
            referenceId,
            unitCost: Number(serialItem.currentCostPrice),
            totalValue: -Number(serialItem.currentCostPrice),
            balanceBefore: stockLevel.physicalQty,
            balanceAfter: stockLevel.physicalQty - 1,
            notes: `Xuất kho: ${oldStatus} → ${newStatus}`,
            createdById: userId,
          },
        });
      }

      this.logger.log(
        `Stock level updated for ${serialItem.productTemplate.name} at warehouse ${warehouseId}: ${oldStatus} → ${newStatus}`,
      );

      return updatedStockLevel;
    };

    // Nếu đã có transaction (tx), dùng luôn. Nếu không, tạo mới $transaction.
    if (tx) {
      return performUpdate(tx);
    } else {
      return this.prisma.$transaction(async (newTx) => {
        return performUpdate(newTx);
      });
    }
  }

  /**
   * Recalculate stock level từ SerialItems (dùng khi cần sync lại)
   */
  async recalculateStockLevel(
    productTemplateId: string,
    warehouseId: string,
    grade: Grade | null,
  ) {
    const normalizedGrade = grade ?? null;
    const serialItems = await this.prisma.serialItem.findMany({
      where: {
        productTemplateId,
        warehouseId,
        grade: normalizedGrade,
      },
    });

    const counts = {
      physicalQty: 0,
      incomingQty: 0,
      qcInProgressQty: 0,
      availableQty: 0,
      reservedQty: 0,
      refurbishingQty: 0,
      damagedQty: 0,
      returnedQty: 0,
    };

    let totalCost = 0;

    for (const item of serialItems) {
      if (this.isInStock(item.status)) {
        counts.physicalQty++;
        totalCost += Number(item.currentCostPrice);
      }

      const field = this.getStatusField(item.status);
      if (field && field in counts) {
        counts[field as keyof typeof counts]++;
      }
    }

    const averageCost = counts.physicalQty > 0 ? totalCost / counts.physicalQty : 0;

    const existing = normalizedGrade === null
      ? await this.prisma.stockLevel.findFirst({
        where: { productTemplateId, warehouseId, grade: null },
      })
      : await this.prisma.stockLevel.findUnique({
        where: {
          productTemplateId_warehouseId_grade: {
            productTemplateId,
            warehouseId,
            grade: normalizedGrade,
          },
        },
      });

    if (existing) {
      return this.prisma.stockLevel.update({
        where: { id: existing.id },
        data: {
          ...counts,
          averageCost,
          totalValue: totalCost,
        },
      });
    }

    return this.prisma.stockLevel.create({
      data: {
        productTemplateId,
        warehouseId,
        grade: normalizedGrade,
        ...counts,
        averageCost,
        totalValue: totalCost,
      },
    });
  }

  // ===========================
  // QUERY METHODS
  // ===========================

  /**
   * Lấy tất cả tồn kho
   */
  async getAllStockLevels() {
    return this.prisma.stockLevel.findMany({
      include: {
        productTemplate: {
          include: {
            category: true,
            brand: true,
          },
        },
        warehouse: true,
      },
      orderBy: [
        { availableQty: 'desc' },
        { productTemplate: { name: 'asc' } },
      ],
    });
  }

  /**
   * Lấy tồn kho theo warehouse
   */
  async getStockLevelsByWarehouse(warehouseId: string) {
    return this.prisma.stockLevel.findMany({
      where: { warehouseId },
      include: {
        productTemplate: {
          include: {
            category: true,
            brand: true,
          },
        },
        warehouse: true,
      },
      orderBy: [
        { availableQty: 'desc' },
        { productTemplate: { name: 'asc' } },
      ],
    });
  }

  /**
   * Lấy tồn kho theo product
   */
  async getStockLevelsByProduct(productTemplateId: string) {
    return this.prisma.stockLevel.findMany({
      where: { productTemplateId },
      include: {
        warehouse: true,
        productTemplate: {
          include: {
            category: true,
            brand: true,
          },
        },
      },
    });
  }

  /**
   * Lấy sản phẩm sắp hết hàng
   */
  async getLowStockProducts(warehouseId?: string) {
    const where: any = {
      availableQty: { lte: this.prisma.stockLevel.fields.reorderPoint },
    };

    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    return this.prisma.stockLevel.findMany({
      where,
      include: {
        productTemplate: {
          include: {
            category: true,
            brand: true,
          },
        },
        warehouse: true,
      },
      orderBy: { availableQty: 'asc' },
    });
  }

  /**
   * Lấy stock movements (lịch sử xuất nhập)
   */
  async getStockMovements(filters: {
    productTemplateId?: string;
    warehouseId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    const where: any = {};

    if (filters.productTemplateId) {
      where.productTemplateId = filters.productTemplateId;
    }

    if (filters.warehouseId) {
      where.warehouseId = filters.warehouseId;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    return this.prisma.stockMovement.findMany({
      where,
      include: {
        productTemplate: {
          include: {
            category: true,
            brand: true,
          },
        },
        warehouse: true,
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 100,
    });
  }

  /**
   * Báo cáo nhập kho theo nguồn hàng
   */
  async getInboundBySource(warehouseId?: string, startDate?: Date, endDate?: Date) {
    const where: any = {
      type: MovementType.IN,
    };

    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const movements = await this.prisma.stockMovement.findMany({
      where,
      include: {
        productTemplate: {
          include: {
            category: true,
            brand: true,
          },
        },
        warehouse: true,
      },
    });

    // Group by source (extract from notes)
    const bySource: Record<string, {
      source: string;
      quantity: number;
      totalValue: number;
      items: any[];
    }> = {};

    for (const movement of movements) {
      // Extract source from notes: "Nhập kho từ: CUSTOMER_TRADE_IN - Nguyễn Văn A | ..."
      const match = movement.notes?.match(/Nhập kho từ: (.+?) \|/);
      const source = match ? match[1] : 'Unknown';

      if (!bySource[source]) {
        bySource[source] = {
          source,
          quantity: 0,
          totalValue: 0,
          items: [],
        };
      }

      bySource[source].quantity += movement.quantity;
      bySource[source].totalValue += Number(movement.totalValue);
      bySource[source].items.push(movement);
    }

    return {
      summary: Object.values(bySource).sort((a, b) => b.totalValue - a.totalValue),
      total: {
        quantity: movements.reduce((sum, m) => sum + m.quantity, 0),
        value: movements.reduce((sum, m) => sum + Number(m.totalValue), 0),
      },
    };
  }

  // ===========================
  // HELPER METHODS
  // ===========================

  /**
   * Map SerialStatus to StockLevel field
   */
  private getStatusField(status: SerialStatus): string | null {
    const mapping: Record<SerialStatus, string> = {
      INCOMING: 'incomingQty',
      QC_IN_PROGRESS: 'qcInProgressQty',
      AVAILABLE: 'availableQty',
      RESERVED: 'reservedQty',
      REFURBISHING: 'refurbishingQty',
      DAMAGED: 'damagedQty',
      RETURNED: 'returnedQty',
      SOLD: null, // Không tính trong tồn kho
      DISPOSED: null, // Không tính trong tồn kho
    };

    return mapping[status];
  }

  /**
   * Check if status is in stock
   */
  private isInStock(status: SerialStatus): boolean {
    const outOfStockStatuses: SerialStatus[] = [SerialStatus.SOLD, SerialStatus.DISPOSED];
    return !outOfStockStatuses.includes(status);
  }
}
