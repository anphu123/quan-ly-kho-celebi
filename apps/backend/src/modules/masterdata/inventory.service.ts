import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SerialStatus, TransactionType } from '@prisma/client';

@Injectable()
export class InventoryService {
    constructor(private prisma: PrismaService) { }

    // ===========================
    // STOCK LEVEL MANAGEMENT
    // ===========================

    async getStockLevels(warehouseId?: string, productTemplateId?: string) {
        const where: any = {
            status: 'AVAILABLE',
        };

        if (warehouseId) where.warehouseId = warehouseId;
        if (productTemplateId) where.productTemplateId = productTemplateId;

        // Get grouped stock levels
        const stockGroups = await this.prisma.serialItem.groupBy({
            by: ['productTemplateId', 'warehouseId', 'grade'],
            where,
            _count: { id: true },
            _avg: { currentCostPrice: true, suggestedPrice: true },
        });

        // Get related data
        const [productTemplates, warehouses] = await Promise.all([
            this.prisma.productTemplate.findMany({
                include: { category: true, brand: true },
            }),
            this.prisma.warehouse.findMany(),
        ]);

        // Build comprehensive inventory view
        const result = [];
        for (const group of stockGroups) {
            const product = productTemplates.find(x => x.id === group.productTemplateId);
            const warehouse = warehouses.find(x => x.id === group.warehouseId);
            
            if (product && warehouse) {
                const stockItem = {
                    id: `${group.productTemplateId}_${group.warehouseId}_${group.grade || 'UNGRADED'}`,
                    productId: product.id,
                    warehouseId: warehouse.id,
                    grade: group.grade,
                    quantity: group._count.id,
                    averageCost: Number(group._avg.currentCostPrice || 0),
                    averagePrice: Number(group._avg.suggestedPrice || 0),
                    totalValue: group._count.id * Number(group._avg.currentCostPrice || 0),
                    
                    // Stock management
                    minStockLevel: 5, // TODO: Make configurable
                    maxStockLevel: 100,
                    reorderPoint: 10,
                    
                    // Status indicators
                    isLowStock: group._count.id <= 10,
                    isOverstock: group._count.id >= 100,
                    
                    // Relations
                    product: {
                        id: product.id,
                        name: product.name,
                        sku: product.sku,
                        category: product.category,
                        brand: product.brand,
                    },
                    warehouse: {
                        id: warehouse.id,
                        name: warehouse.name,
                        code: warehouse.code,
                    },
                };
                
                result.push(stockItem);
            }
        }

        // Sort by product name, then warehouse
        return result.sort((a, b) => {
            const productCompare = a.product.name.localeCompare(b.product.name);
            if (productCompare !== 0) return productCompare;
            return a.warehouse.name.localeCompare(b.warehouse.name);
        });
    }

    async markAsAvailable(dto: {
        serialItemIds: string[];
        grade?: string;
        suggestedPrice?: number;
        notes?: string;
        userId: string;
    }) {
        const { serialItemIds, grade, suggestedPrice, notes, userId } = dto;

        return this.prisma.$transaction(async (tx) => {
            const items = await tx.serialItem.findMany({
                where: {
                    id: { in: serialItemIds },
                    status: { in: [SerialStatus.INCOMING, SerialStatus.QC_IN_PROGRESS] },
                },
            });

            if (items.length !== serialItemIds.length) {
                throw new BadRequestException('Some items are not in a state that can be made available');
            }

            const results = [];
            for (const item of items) {
                const oldStatus = item.status;
                
                const updated = await tx.serialItem.update({
                    where: { id: item.id },
                    data: {
                        status: SerialStatus.AVAILABLE,
                        // grade: grade || item.grade, // Skip grade update for now
                        suggestedPrice: suggestedPrice ? Number(suggestedPrice) : item.suggestedPrice,
                    },
                });

                await tx.serialTransaction.create({
                    data: {
                        serialItemId: item.id,
                        type: TransactionType.MOVE_TO_SALE, // Use existing enum value
                        fromStatus: oldStatus,
                        toStatus: SerialStatus.AVAILABLE,
                        notes: notes || `Made available with grade ${grade || 'unspecified'}`,
                        performedById: userId,
                    },
                });

                results.push(updated);
            }

            return {
                success: true,
                itemsProcessed: results.length,
                message: `Successfully made ${results.length} items available for sale`,
                items: results,
            };
        });
    }

    async getLowStockProducts() {
        const stockLevels = await this.getStockLevels();
        return stockLevels.filter(s => s.quantity <= s.reorderPoint);
    }
}
