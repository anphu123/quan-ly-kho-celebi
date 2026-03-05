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
  constructor(private prisma: PrismaService) { }

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

    // Validate all categories exist
    const categoryIds = [...new Set(dto.items.map(item => item.categoryId))];
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });

    if (categories.length !== categoryIds.length) {
      const foundIds = categories.map(c => c.id);
      const missingIds = categoryIds.filter(id => !foundIds.includes(id));
      
      // Get available categories to help user
      const availableCategories = await this.prisma.category.findMany({
        select: { id: true, name: true, code: true },
        take: 10
      });
      
      const suggestion = availableCategories.length > 0
        ? `\n\nDanh mục khả dụng:\n${availableCategories.map(c => `- ${c.name} (${c.code}): ${c.id}`).join('\n')}`
        : '\n\nKhông có danh mục nào trong hệ thống. Vui lòng chạy seed database.';
      
      throw new BadRequestException(
        `Danh mục không tồn tại: ${missingIds.join(', ')}. ` +
        `Vui lòng chọn danh mục từ dropdown hoặc làm mới trang để cập nhật dữ liệu.${suggestion}`
      );
    }

    // Validate all brands exist (if provided)
    const brandIds = [...new Set(dto.items.filter(item => item.brandId).map(item => item.brandId))];
    if (brandIds.length > 0) {
      const brands = await this.prisma.brand.findMany({
        where: { id: { in: brandIds } },
      });

      if (brands.length !== brandIds.length) {
        const foundIds = brands.map(b => b.id);
        const missingIds = brandIds.filter(id => !foundIds.includes(id));
        throw new BadRequestException(`Brands not found: ${missingIds.join(', ')}`);
      }
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
            sourceCustomerName: item.sourceCustomerName,
            sourceCustomerPhone: item.sourceCustomerPhone,
            sourceCustomerAddress: item.sourceCustomerAddress,
            sourceCustomerIdCard: item.sourceCustomerIdCard,
            idCardIssueDate: item.idCardIssueDate ? new Date(item.idCardIssueDate) : null,
            idCardIssuePlace: item.idCardIssuePlace,
            bankAccount: item.bankAccount,
            bankName: item.bankName,
            contractNumber: item.contractNumber,
            purchaseDate: item.purchaseDate ? new Date(item.purchaseDate) : null,
            employeeName: item.employeeName,
            otherCosts: item.otherCosts,
            topUp: item.topUp,
            repairCost: item.repairCost,
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
      // Validate and get request
      const request = await tx.inboundRequest.findUnique({
        where: { id: dto.inboundRequestId },
        include: {
          warehouse: true,
          items: {
            include: {
              productTemplate: true,
              category: true,
              brand: true,
            },
          },
        },
      });

      if (!request) {
        throw new NotFoundException('Inbound request not found');
      }

      if (request.status !== InboundStatus.IN_PROGRESS) {
        throw new BadRequestException('Inbound request must be in IN_PROGRESS status');
      }

      // Validate items exist and not already received
      const itemsToProcess = new Map();
      for (const receiveItem of dto.items) {
        const inboundItem = request.items.find(item => item.id === receiveItem.inboundItemId);
        if (!inboundItem) {
          throw new NotFoundException(`Inbound item ${receiveItem.inboundItemId} not found in this request`);
        }
        if (inboundItem.isReceived) {
          throw new BadRequestException(`Item ${receiveItem.inboundItemId} is already received`);
        }

        // Validate purchase price
        if (!receiveItem.purchasePrice || receiveItem.purchasePrice <= 0) {
          throw new BadRequestException(`Invalid purchase price for item ${receiveItem.inboundItemId}`);
        }

        // Validate decimal precision (max 15,2)
        const priceString = receiveItem.purchasePrice.toString();
        const decimalIndex = priceString.indexOf('.');
        if (decimalIndex !== -1) {
          const decimalPart = priceString.substring(decimalIndex + 1);
          if (decimalPart.length > 2) {
            throw new BadRequestException(`Purchase price for item ${receiveItem.inboundItemId} has too many decimal places (max 2)`);
          }
        }

        itemsToProcess.set(receiveItem.inboundItemId, { inboundItem, receiveItem });
      }

      const serialItemsCreated = [];

      // Process each item
      for (const [_itemId, { inboundItem, receiveItem }] of itemsToProcess) {
        // Generate internal code if no serial number provided
        let internalCode = receiveItem.serialNumber;
        if (!internalCode) {
          internalCode = await this.generateInternalCode(tx);
        }

        // Validate serial/internal code uniqueness
        const existingSerial = await tx.serialItem.findFirst({
          where: {
            OR: [
              { serialNumber: receiveItem.serialNumber ? receiveItem.serialNumber : undefined },
              { internalCode },
            ],
          },
        });

        if (existingSerial) {
          throw new BadRequestException(`Serial number or internal code already exists: ${receiveItem.serialNumber || internalCode}`);
        }

        // Ensure product template exists
        let productTemplateId = inboundItem.productTemplateId;
        if (!productTemplateId) {
          productTemplateId = await this.createProductTemplate(tx, inboundItem);
        }

        // Create SerialItem with proper error handling
        try {
          const serialItem = await tx.serialItem.create({
            data: {
              productTemplateId,
              serialNumber: receiveItem.serialNumber || null,
              internalCode,
              source: `Inbound-${request.code}`,
              purchasePrice: Number(receiveItem.purchasePrice),
              purchaseDate: new Date(),
              purchaseBatch: request.code,
              status: SerialStatus.INCOMING,
              conditionNotes: receiveItem.condition || inboundItem.condition,
              currentCostPrice: Number(receiveItem.purchasePrice),
              warehouseId: request.warehouseId,
              binLocation: receiveItem.binLocation || null,
            },
          });

          serialItemsCreated.push(serialItem);

          // Save custom dynamic attributes if provided
          if (receiveItem.customAttributes?.length > 0) {
            await tx.dynamicSpec.createMany({
              data: receiveItem.customAttributes.map(attr => ({
                serialItemId: serialItem.id,
                attributeId: attr.attributeId,
                value: attr.value,
                recordedById: userId,
              })),
            });
          }

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
              fromStatus: null,
              toStatus: SerialStatus.INCOMING,
              fromLocation: null,
              toLocation: receiveItem.binLocation,
              costChange: Number(receiveItem.purchasePrice),
              notes: `Received via inbound ${request.code} - ${receiveItem.condition || 'No condition notes'}`,
              performedById: userId,
            },
          });

        } catch (error: any) {
          console.error(`Error creating serial item for inbound item ${receiveItem.inboundItemId}:`, {
            itemId: receiveItem.inboundItemId,
            modelName: inboundItem.modelName,
            serialNumber: receiveItem.serialNumber,
            internalCode,
            purchasePrice: receiveItem.purchasePrice,
            error: error.message,
            stack: error.stack
          });
          throw new BadRequestException(
            `Failed to create serial item for ${inboundItem.modelName} (${receiveItem.inboundItemId}): ${error.message}`
          );
        }
      }

      // Calculate total actual value from processed items
      const calculatedTotalValue = serialItemsCreated.reduce((sum, item) => sum + Number(item.purchasePrice), 0);

      // Complete the inbound request
      const updatedRequest = await tx.inboundRequest.update({
        where: { id: dto.inboundRequestId },
        data: {
          status: InboundStatus.COMPLETED,
          receivedDate: new Date(),
          receivedById: userId,
          totalActualValue: dto.totalActualValue || calculatedTotalValue,
          notes: dto.notes || request.notes,
        },
        include: {
          warehouse: true,
          receivedBy: { select: { id: true, fullName: true, email: true } },
          items: {
            include: {
              category: true,
              brand: true,
              productTemplate: true,
              serialItem: {
                include: {
                  productTemplate: true,
                },
              },
            },
          },
        },
      });

      return {
        ...updatedRequest,
        summary: {
          totalItemsReceived: serialItemsCreated.length,
          totalValue: calculatedTotalValue,
          message: `Successfully received ${serialItemsCreated.length} items with total value ${calculatedTotalValue}`,
        },
      };
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