import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SerialStatus, Grade, TransactionType } from '@prisma/client';
import { 
  CreateSerialItemDto, 
  UpdateSerialItemDto, 
  SerialItemsQueryDto 
} from './dto/serial-items.dto';
import { StockService } from '../stock/stock.service';

@Injectable()
export class SerialItemsService {
  constructor(
    private prisma: PrismaService,
    private stockService: StockService,
  ) {}

  async findAll(query: SerialItemsQueryDto) {
    const {
      page = 1,
      limit = 20,
      status,
      grade,
      productTemplateId,
      warehouseId,
      search,
    } = query;

    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = {};
    
    if (status) where.status = status;
    if (grade) where.grade = grade;
    if (productTemplateId) where.productTemplateId = productTemplateId;
    if (warehouseId) where.warehouseId = warehouseId;
    
    if (search) {
      where.OR = [
        { serialNumber: { contains: search, mode: 'insensitive' } },
        { internalCode: { contains: search, mode: 'insensitive' } },
        { productTemplate: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.serialItem.findMany({
        where,
        skip,
        take: limit,
        include: {
          productTemplate: {
            include: {
              category: true,
              brand: true,
            },
          },
          warehouse: true,
          qcInspections: {
            orderBy: { startedAt: 'desc' },
            take: 1,
            include: {
              inspector: {
                select: { fullName: true, email: true },
              },
            },
          },
        },
        orderBy: [
          { createdAt: 'desc' },
        ],
      }),
      this.prisma.serialItem.count({ where }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStats(warehouseId?: string) {
    const where = warehouseId ? { warehouseId } : {};

    const [
      totalItems,
      statusStats,
      gradeStats,
      valueStats,
    ] = await Promise.all([
      this.prisma.serialItem.count({ where }),
      
      // Count by status
      this.prisma.serialItem.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      
      // Count by grade
      this.prisma.serialItem.groupBy({
        by: ['grade'],
        where: { ...where, grade: { not: null } },
        _count: true,
      }),
      
      // Value statistics
      this.prisma.serialItem.aggregate({
        where,
        _sum: {
          currentCostPrice: true,
          suggestedPrice: true,
        },
        _avg: {
          currentCostPrice: true,
          suggestedPrice: true,
        },
      }),
    ]);

    return {
      totalItems,
      byStatus: statusStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count;
        return acc;
      }, {} as Record<string, number>),
      byGrade: gradeStats.reduce((acc, stat) => {
        if (stat.grade) acc[stat.grade] = stat._count;
        return acc;
      }, {} as Record<string, number>),
      totalCostValue: valueStats._sum.currentCostPrice || 0,
      totalSuggestedValue: valueStats._sum.suggestedPrice || 0,
      averageCostPrice: valueStats._avg.currentCostPrice || 0,
      averageSuggestedPrice: valueStats._avg.suggestedPrice || 0,
    };
  }

  async findByProductTemplate(productTemplateId: string, query: Partial<SerialItemsQueryDto> = {}) {
    const where = { 
      productTemplateId,
      ...(query.status && { status: query.status }),
      ...(query.grade && { grade: query.grade }),
    };

    return this.prisma.serialItem.findMany({
      where,
      include: {
        productTemplate: {
          include: {
            category: true,
            brand: true,
          },
        },
        warehouse: true,
        dynamicSpecs: {
          include: {
            attribute: true,
          },
          orderBy: { recordedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: query.limit || 50,
    });
  }

  async findByIdentifier(identifier: string) {
    const item = await this.prisma.serialItem.findFirst({
      where: {
        OR: [
          { serialNumber: identifier },
          { internalCode: identifier },
        ],
      },
      include: {
        productTemplate: {
          include: {
            category: true,
            brand: true,
          },
        },
        warehouse: true,
        dynamicSpecs: {
          include: {
            attribute: true,
          },
          orderBy: { recordedAt: 'desc' },
        },
        qcInspections: {
          orderBy: { startedAt: 'desc' },
          take: 3,
          include: {
            inspector: {
              select: { fullName: true },
            },
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException(`Serial item with identifier "${identifier}" not found`);
    }

    return item;
  }

  async findOne(id: string) {
    const item = await this.prisma.serialItem.findUnique({
      where: { id },
      include: {
        productTemplate: {
          include: {
            category: true,
            brand: true,
            staticSpecs: {
              include: {
                attribute: true,
              },
            },
          },
        },
        warehouse: true,
        dynamicSpecs: {
          include: {
            attribute: true,
          },
          orderBy: { recordedAt: 'desc' },
        },
        qcInspections: {
          orderBy: { startedAt: 'desc' },
          include: {
            inspector: {
              select: { fullName: true, email: true },
            },
            template: true,
          },
        },
        refurbishmentJobs: {
          orderBy: { createdAt: 'desc' },
          include: {
            technician: {
              select: { fullName: true },
            },
          },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            performedBy: {
              select: { fullName: true },
            },
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException(`Serial item with ID "${id}" not found`);
    }

    return item;
  }

  async create(createDto: CreateSerialItemDto, userId: string) {
    const { productTemplateId, warehouseId, serialNumber, internalCode } = createDto;

    // Validate product template exists
    const productTemplate = await this.prisma.productTemplate.findUnique({
      where: { id: productTemplateId },
    });
    if (!productTemplate) {
      throw new BadRequestException('Product template not found');
    }

    // Validate warehouse exists
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id: warehouseId },
    });
    if (!warehouse) {
      throw new BadRequestException('Warehouse not found');
    }

    // Check for duplicate identifiers
    if (serialNumber) {
      const existingBySerial = await this.prisma.serialItem.findUnique({
        where: { serialNumber },
      });
      if (existingBySerial) {
        throw new BadRequestException(`Serial number "${serialNumber}" already exists`);
      }
    }

    const existingByInternal = await this.prisma.serialItem.findUnique({
      where: { internalCode },
    });
    if (existingByInternal) {
      throw new BadRequestException(`Internal code "${internalCode}" already exists`);
    }

    // Generate internal code if not provided
    const finalInternalCode = internalCode || await this.generateInternalCode(productTemplate.sku);

    // Create serial item
    const serialItem = await this.prisma.serialItem.create({
      data: {
        ...createDto,
        internalCode: finalInternalCode,
        status: 'INCOMING',
        currentCostPrice: createDto.purchasePrice,
      },
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

    // Create transaction record
    await this.prisma.serialTransaction.create({
      data: {
        serialItemId: serialItem.id,
        type: 'INBOUND',
        fromLocation: 'External',
        toLocation: createDto.binLocation || warehouse.code,
        fromStatus: null,
        toStatus: 'INCOMING',
        notes: `Item received - ${createDto.source || 'Unknown source'}`,
        performedById: userId,
      },
    });

    return serialItem;
  }

  async update(id: string, updateDto: UpdateSerialItemDto, userId: string) {
    const existingItem = await this.findOne(id);
    
    // Check for duplicate identifiers if changing
    if (updateDto.serialNumber && updateDto.serialNumber !== existingItem.serialNumber) {
      const existing = await this.prisma.serialItem.findUnique({
        where: { serialNumber: updateDto.serialNumber },
      });
      if (existing && existing.id !== id) {
        throw new BadRequestException(`Serial number "${updateDto.serialNumber}" already exists`);
      }
    }

    if (updateDto.internalCode && updateDto.internalCode !== existingItem.internalCode) {
      const existing = await this.prisma.serialItem.findUnique({
        where: { internalCode: updateDto.internalCode },
      });
      if (existing && existing.id !== id) {
        throw new BadRequestException(`Internal code "${updateDto.internalCode}" already exists`);
      }
    }

    const updateData = {
      ...updateDto,
      // Add audit note for tracking
      notes: updateDto.notes || `Updated by user ${userId}`,
    };

    return this.prisma.serialItem.update({
      where: { id },
      data: updateData,
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
  }

  async updateStatus(
    id: string, 
    status: SerialStatus,
    userId: string,
    notes?: string, 
    binLocation?: string
  ) {
    const item = await this.prisma.serialItem.findUnique({
      where: { id },
      include: { warehouse: true },
    });

    if (!item) {
      throw new NotFoundException('Serial item not found');
    }

    const oldStatus = item.status;
    const oldLocation = item.binLocation;

    // Update the item
    const updatedItem = await this.prisma.serialItem.update({
      where: { id },
      data: {
        status,
        ...(binLocation && { binLocation }),
      },
      include: {
        productTemplate: true,
        warehouse: true,
      },
    });

    // Create transaction record
    await this.prisma.serialTransaction.create({
      data: {
        serialItemId: id,
        type: this.getTransactionTypeFromStatus(status),
        fromLocation: oldLocation || item.warehouse.code,
        toLocation: binLocation || item.warehouse.code,
        fromStatus: oldStatus,
        toStatus: status,
        notes: notes || `Status changed from ${oldStatus} to ${status}`,
        performedById: userId,
      },
    });

    // ⭐ Update stock level
    await this.stockService.updateStockLevelOnStatusChange(
      id,
      oldStatus,
      status,
      userId,
    );

    return updatedItem;
  }

  async updateGrade(
    id: string,
    grade: Grade,
    userId: string,
    conditionNotes?: string,
    suggestedPrice?: number
  ) {
    const item = await this.prisma.serialItem.findUnique({
      where: { id },
      include: { productTemplate: true },
    });

    if (!item) {
      throw new NotFoundException('Serial item not found');
    }

    // Calculate suggested price if not provided
    let finalSuggestedPrice = suggestedPrice;
    if (!finalSuggestedPrice && item.productTemplate.baseRetailPrice) {
      finalSuggestedPrice = Number(this.calculatePriceByGrade(
        item.productTemplate.baseRetailPrice,
        grade
      ));
    }

    return this.prisma.serialItem.update({
      where: { id },
      data: {
        grade,
        conditionNotes: conditionNotes || `Grade updated to ${grade} by user ${userId}`,
        suggestedPrice: finalSuggestedPrice,
      },
      include: {
        productTemplate: true,
        warehouse: true,
      },
    });
  }

  async moveLocation(
    id: string,
    userId: string,
    warehouseId?: string,
    binLocation?: string
  ) {
    const item = await this.prisma.serialItem.findUnique({
      where: { id },
      include: { warehouse: true },
    });

    if (!item) {
      throw new NotFoundException('Serial item not found');
    }

    if (warehouseId && warehouseId !== item.warehouseId) {
      const warehouse = await this.prisma.warehouse.findUnique({
        where: { id: warehouseId },
      });
      if (!warehouse) {
        throw new BadRequestException('Warehouse not found');
      }
    }

    const oldLocation = `${item.warehouse.name} - ${item.binLocation || 'N/A'}`;
    
    const updatedItem = await this.prisma.serialItem.update({
      where: { id },
      data: {
        ...(warehouseId && { warehouseId }),
        ...(binLocation !== undefined && { binLocation }),
      },
      include: {
        warehouse: true,
        productTemplate: true,
      },
    });

    const newLocation = `${updatedItem.warehouse.name} - ${updatedItem.binLocation || 'N/A'}`;

    // Create transaction record
    await this.prisma.serialTransaction.create({
      data: {
        serialItemId: id,
        type: 'MOVE_TO_SALE', // Generic movement type
        fromLocation: oldLocation,
        toLocation: newLocation,
        notes: `Item moved to new location`,
        performedById: userId,
      },
    });

    return updatedItem;
  }

  async remove(id: string, userId: string) {
    const item = await this.prisma.serialItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Serial item not found');
    }

    // Soft delete by changing status
    return this.updateStatus(id, 'DISPOSED', 'Item removed from inventory', undefined, userId);
  }

  async getTransactionHistory(id: string) {
    return this.prisma.serialTransaction.findMany({
      where: { serialItemId: id },
      include: {
        performedBy: {
          select: { fullName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDynamicSpecs(id: string) {
    return this.prisma.dynamicSpec.findMany({
      where: { serialItemId: id },
      include: {
        attribute: {
          include: {
            attributeGroup: true,
          },
        },
      },
      orderBy: [
        { attribute: { attributeGroup: { sortOrder: 'asc' } } },
        { attribute: { sortOrder: 'asc' } },
        { recordedAt: 'desc' },
      ],
    });
  }

  async updateDynamicSpecs(
    id: string,
    specsDto: { attributeId: string; value: any }[],
    userId: string
  ) {
    const item = await this.prisma.serialItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Serial item not found');
    }

    // Update each specification
    const updatedSpecs = await Promise.all(
      specsDto.map(async (spec) => {
        return this.prisma.dynamicSpec.create({
          data: {
            serialItemId: id,
            attributeId: spec.attributeId,
            value: spec.value,
            recordedById: userId,
          },
          include: {
            attribute: true,
          },
        });
      })
    );

    return updatedSpecs;
  }

  // Private helper methods

  private async generateInternalCode(productSku: string): Promise<string> {
    const prefix = productSku.substring(0, 6).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    
    let code = `${prefix}-${timestamp}-${random}`;
    let counter = 1;

    // Ensure uniqueness
    while (await this.prisma.serialItem.findUnique({ where: { internalCode: code } })) {
      code = `${prefix}-${timestamp}-${random}-${counter}`;
      counter++;
    }

    return code;
  }

  private getTransactionTypeFromStatus(status: SerialStatus): TransactionType {
    switch (status) {
      case 'QC_IN_PROGRESS': return 'QC_START';
      case 'AVAILABLE': return 'QC_COMPLETE';
      case 'REFURBISHING': return 'MOVE_TO_REFURB';
      case 'SOLD': return 'SOLD';
      case 'RETURNED': return 'RETURNED';
      case 'DISPOSED': return 'DISPOSAL';
      default: return 'INBOUND';
    }
  }

  private calculatePriceByGrade(basePrice: any, grade: Grade): number {
    const basePriceNum = Number(basePrice);
    
    const gradeMultipliers = {
      GRADE_A_NEW: 1.0,     // 100%
      GRADE_A: 0.95,        // 95%
      GRADE_B_PLUS: 0.90,   // 90%
      GRADE_B: 0.85,        // 85%
      GRADE_C_PLUS: 0.80,   // 80%
      GRADE_C: 0.75,        // 75%
      GRADE_D: 0.60,        // 60%
    };

    return basePriceNum * (gradeMultipliers[grade] || 0.85);
  }
}