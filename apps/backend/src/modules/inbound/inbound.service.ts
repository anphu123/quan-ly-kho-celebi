import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { 
  CreateInboundRequestDto, 
  UpdateInboundRequestDto, 
  CompleteInboundDto, 
  InboundQueryDto,
  UpdateInboundItemDto 
} from './dto/inbound.dto';
import { InboundStatus, SerialStatus, TransactionType } from '@prisma/client';

@Injectable()
export class InboundService {
  constructor(private prisma: PrismaService) {}

  // ===========================
  // INBOUND REQUEST OPERATIONS
  // ===========================

  async createInboundRequest(dto: CreateInboundRequestDto, _userId: string) {
    // Generate unique code
    const code = await this.generateInboundCode();

    // Validate warehouse exists
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id: dto.warehouseId },
    });

    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    // Create inbound request with items (userId can be used for audit trails later)
    return this.prisma.inboundRequest.create({
      data: {
        code,
        warehouseId: dto.warehouseId,
        supplierType: dto.supplierType,
        supplierName: dto.supplierName,
        supplierPhone: dto.supplierPhone,
        supplierEmail: dto.supplierEmail,
        expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : null,
        totalEstimatedValue: dto.totalEstimatedValue,
        notes: dto.notes,
        items: {
          create: dto.items.map(item => ({
            productTemplateId: item.productTemplateId,
            categoryId: item.categoryId,
            brandId: item.brandId,
            serialNumber: item.serialNumber,
            modelName: item.modelName,
            condition: item.condition,
            estimatedValue: item.estimatedValue,
            notes: item.notes,
          })),
        },
      },
      include: {
        warehouse: true,
        items: {
          include: {
            category: true,
            brand: true,
            productTemplate: true,
          },
        },
      },
    });
  }

  async getAllInboundRequests(query: InboundQueryDto) {
    const { status, supplierType, warehouseId, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) where.status = status;
    if (supplierType) where.supplierType = supplierType;
    if (warehouseId) where.warehouseId = warehouseId;
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { supplierName: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [requests, total] = await Promise.all([
      this.prisma.inboundRequest.findMany({
        where,
        include: {
          warehouse: true,
          receivedBy: { select: { id: true, fullName: true, email: true } },
          items: {
            include: {
              category: true,
              brand: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.inboundRequest.count({ where }),
    ]);

    return {
      data: requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getInboundRequestById(id: string) {
    const request = await this.prisma.inboundRequest.findUnique({
      where: { id },
      include: {
        warehouse: true,
        receivedBy: { select: { id: true, fullName: true, email: true } },
        items: {
          include: {
            category: true,
            brand: true,
            productTemplate: true,
            serialItem: true, // Include created serial item if any
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Inbound request not found');
    }

    return request;
  }

  async updateInboundRequest(id: string, dto: UpdateInboundRequestDto) {
    const request = await this.prisma.inboundRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Inbound request not found');
    }

    return this.prisma.inboundRequest.update({
      where: { id },
      data: {
        ...dto,
        expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : undefined,
        receivedDate: dto.receivedDate ? new Date(dto.receivedDate) : undefined,
      },
      include: {
        warehouse: true,
        items: {
          include: {
            category: true,
            brand: true,
          },
        },
      },
    });
  }

  async deleteInboundRequest(id: string) {
    const request = await this.prisma.inboundRequest.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!request) {
      throw new NotFoundException('Inbound request not found');
    }

    if (request.status !== InboundStatus.REQUESTED) {
      throw new BadRequestException('Cannot delete inbound request that is not in REQUESTED status');
    }

    // Check if any items have been received
    const receivedItems = request.items.filter(item => item.isReceived);
    if (receivedItems.length > 0) {
      throw new BadRequestException('Cannot delete inbound request with received items');
    }

    return this.prisma.inboundRequest.delete({
      where: { id },
    });
  }

  // ===========================
  // INBOUND ITEM OPERATIONS  
  // ===========================

  async updateInboundItem(itemId: string, dto: UpdateInboundItemDto) {
    const item = await this.prisma.inboundItem.findUnique({
      where: { id: itemId },
      include: { inboundRequest: true },
    });

    if (!item) {
      throw new NotFoundException('Inbound item not found');
    }

    if (item.inboundRequest.status === InboundStatus.COMPLETED) {
      throw new BadRequestException('Cannot update items of completed inbound request');
    }

    return this.prisma.inboundItem.update({
      where: { id: itemId },
      data: {
        ...dto,
        receivedAt: dto.isReceived ? new Date() : item.receivedAt,
      },
      include: {
        category: true,
        brand: true,
        productTemplate: true,
      },
    });
  }

  async deleteInboundItem(itemId: string) {
    const item = await this.prisma.inboundItem.findUnique({
      where: { id: itemId },
      include: { inboundRequest: true },
    });

    if (!item) {
      throw new NotFoundException('Inbound item not found');
    }

    if (item.isReceived) {
      throw new BadRequestException('Cannot delete received item');
    }

    if (item.inboundRequest.status !== InboundStatus.REQUESTED) {
      throw new BadRequestException('Cannot delete items from non-requested inbound');
    }

    return this.prisma.inboundItem.delete({
      where: { id: itemId },
    });
  }

  // ===========================
  // RECEIVING WORKFLOW
  // ===========================

  async startReceivingProcess(requestId: string, userId: string) {
    const request = await this.prisma.inboundRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Inbound request not found');
    }

    if (request.status !== InboundStatus.REQUESTED) {
      throw new BadRequestException('Inbound request is not in REQUESTED status');
    }

    return this.prisma.inboundRequest.update({
      where: { id: requestId },
      data: {
        status: InboundStatus.IN_PROGRESS,
        receivedById: userId,
      },
      include: {
        warehouse: true,
        items: {
          include: {
            category: true,
            brand: true,
          },
        },
      },
    });
  }

  async completeInboundRequest(dto: CompleteInboundDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.inboundRequest.findUnique({
        where: { id: dto.inboundRequestId },
        include: {
          warehouse: true,
          items: true,
        },
      });

      if (!request) {
        throw new NotFoundException('Inbound request not found');
      }

      if (request.status !== InboundStatus.IN_PROGRESS) {
        throw new BadRequestException('Inbound request is not in progress');
      }

      // Create SerialItems for received items
      for (const receiveItem of dto.items) {
        const inboundItem = await tx.inboundItem.findUnique({
          where: { id: receiveItem.inboundItemId },
          include: { productTemplate: true },
        });

        if (!inboundItem) {
          throw new NotFoundException(`Inbound item ${receiveItem.inboundItemId} not found`);
        }

        // Generate internal code if no serial number
        const internalCode = receiveItem.serialNumber || await this.generateInternalCode(tx);

        // Create SerialItem
        const serialItem = await tx.serialItem.create({
          data: {
            productTemplateId: inboundItem.productTemplateId || await this.createProductTemplate(tx, inboundItem),
            serialNumber: receiveItem.serialNumber,
            internalCode,
            source: `Inbound-${request.code}`,
            purchasePrice: receiveItem.purchasePrice,
            purchaseDate: new Date(),
            purchaseBatch: request.code,
            status: SerialStatus.INCOMING,
            conditionNotes: receiveItem.condition || inboundItem.condition,
            currentCostPrice: receiveItem.purchasePrice,
            warehouseId: request.warehouseId,
            binLocation: receiveItem.binLocation,
          },
        });

        // Update inbound item
        await tx.inboundItem.update({
          where: { id: receiveItem.inboundItemId },
          data: {
            isReceived: true,
            receivedAt: new Date(),
            serialItemId: serialItem.id,
            condition: receiveItem.condition || inboundItem.condition,
            notes: receiveItem.notes || inboundItem.notes,
          },
        });

        // Create transaction record
        await tx.serialTransaction.create({
          data: {
            serialItemId: serialItem.id,
            type: TransactionType.INBOUND,
            toLocation: receiveItem.binLocation,
            toStatus: SerialStatus.INCOMING,
            costChange: receiveItem.purchasePrice,
            notes: `Received via inbound ${request.code}`,
            performedById: userId,
          },
        });
      }

      // Complete the inbound request
      return tx.inboundRequest.update({
        where: { id: dto.inboundRequestId },
        data: {
          status: InboundStatus.COMPLETED,
          receivedDate: new Date(),
          totalActualValue: dto.totalActualValue,
          notes: dto.notes || request.notes,
        },
        include: {
          warehouse: true,
          receivedBy: { select: { id: true, fullName: true } },
          items: {
            include: {
              category: true,
              brand: true,
              serialItem: true,
            },
          },
        },
      });
    });
  }

  // ===========================
  // HELPER METHODS
  // ===========================

  private async generateInboundCode(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    // Find the latest code for this month
    const latestRequest = await this.prisma.inboundRequest.findFirst({
      where: {
        code: {
          startsWith: `INB-${year}${month}`,
        },
      },
      orderBy: { code: 'desc' },
    });

    let sequence = 1;
    if (latestRequest) {
      const lastSequence = parseInt(latestRequest.code.split('-').pop() || '0');
      sequence = lastSequence + 1;
    }

    return `INB-${year}${month}-${String(sequence).padStart(3, '0')}`;
  }

  private async generateInternalCode(tx: any): Promise<string> {
    const count = await tx.serialItem.count();
    return `INT-${String(count + 1).padStart(6, '0')}`;
  }

  private async createProductTemplate(tx: any, inboundItem: any): Promise<string> {
    // Create a basic product template if none exists
    const template = await tx.productTemplate.create({
      data: {
        sku: `AUTO-${Date.now()}`,
        name: inboundItem.modelName,
        categoryId: inboundItem.categoryId,
        brandId: inboundItem.brandId || null,
        description: `Auto-generated from inbound item: ${inboundItem.modelName}`,
      },
    });

    return template.id;
  }

  // ===========================
  // ANALYTICS & REPORTING
  // ===========================

  async getInboundStats(warehouseId?: string) {
    const where = warehouseId ? { warehouseId } : {};

    const [
      totalRequests,
      pendingRequests,
      inProgressRequests,
      completedRequests,
      totalItemsReceived,
      totalValueReceived,
    ] = await Promise.all([
      this.prisma.inboundRequest.count({ where }),
      this.prisma.inboundRequest.count({ 
        where: { ...where, status: InboundStatus.REQUESTED },
      }),
      this.prisma.inboundRequest.count({ 
        where: { ...where, status: InboundStatus.IN_PROGRESS },
      }),
      this.prisma.inboundRequest.count({ 
        where: { ...where, status: InboundStatus.COMPLETED },
      }),
      this.prisma.inboundItem.count({
        where: {
          isReceived: true,
          inboundRequest: where,
        },
      }),
      this.prisma.inboundRequest.aggregate({
        where: { ...where, status: InboundStatus.COMPLETED },
        _sum: {
          totalActualValue: true,
        },
      }),
    ]);

    return {
      totalRequests,
      pendingRequests, 
      inProgressRequests,
      completedRequests,
      totalItemsReceived,
      totalValueReceived: totalValueReceived._sum.totalActualValue || 0,
    };
  }
}