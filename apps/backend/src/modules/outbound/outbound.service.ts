import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateOutboundDto } from './dto/outbound.dto';
import { SerialStatus, TransactionType } from '@prisma/client';

export interface OutboundRequest {
    id: string;
    code: string;
    warehouseId: string;
    type: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    requestedBy: string;
    processedBy?: string;
    items: Array<{
        id: string;
        serialItemId: string;
        notes?: string;
    }>;
    notes?: string;
    createdAt: Date;
    completedAt?: Date;
}

@Injectable()
export class OutboundService {
    constructor(private prisma: PrismaService) { }

    // ===========================
    // OUTBOUND REQUEST WORKFLOW
    // ===========================

    async createOutboundRequest(dto: {
        warehouseId: string;
        type: 'SALE' | 'RETURN_TO_VENDOR' | 'INTERNAL_TRANSFER' | 'DISPOSAL';
        items: Array<{
            serialItemId: string;
            notes?: string;
        }>;
        notes?: string;
        userId: string;
    }) {
        const { warehouseId, type, items, userId } = dto;

        if (!items || items.length === 0) {
            throw new BadRequestException('Outbound request must contain at least one item');
        }

        return this.prisma.$transaction(async (tx) => {
            // Verify warehouse exists
            const warehouse = await tx.warehouse.findUnique({
                where: { id: warehouseId },
            });

            if (!warehouse) {
                throw new NotFoundException('Warehouse not found');
            }

            // Verify all items exist and are available
            const serialItemIds = items.map(item => item.serialItemId);
            const serialItems = await tx.serialItem.findMany({
                where: {
                    id: { in: serialItemIds },
                    warehouseId,
                    status: SerialStatus.AVAILABLE,
                },
                include: {
                    productTemplate: {
                        include: { category: true, brand: true },
                    },
                },
            });

            if (serialItems.length !== items.length) {
                const found = serialItems.map(item => item.id);
                const missing = serialItemIds.filter(id => !found.includes(id));
                throw new BadRequestException(`Items not available for outbound: ${missing.join(', ')}`);
            }

            // Generate outbound code
            const code = await this.generateOutboundCode(tx);

            // Create outbound request (simulated in SerialTransaction with grouped code)
            const outboundItems = [];
            for (const requestItem of items) {
                const serialItem = serialItems.find(si => si.id === requestItem.serialItemId);

                // Reserve the item
                await tx.serialItem.update({
                    where: { id: requestItem.serialItemId },
                    data: { status: SerialStatus.RESERVED },
                });

                // Create reservation transaction
                await tx.serialTransaction.create({
                    data: {
                        serialItemId: requestItem.serialItemId,
                        type: TransactionType.RESERVED,
                        fromStatus: SerialStatus.AVAILABLE,
                        toStatus: SerialStatus.RESERVED,
                        fromLocation: serialItem.binLocation,
                        notes: `Reserved for outbound ${code} - ${type} - ${requestItem.notes || ''}`,
                        performedById: userId,
                    },
                });

                outboundItems.push({
                    serialItemId: requestItem.serialItemId,
                    serialItem,
                    notes: requestItem.notes,
                });
            }

            return {
                success: true,
                outboundCode: code,
                type,
                warehouseId,
                warehouse: warehouse.name,
                itemsReserved: outboundItems.length,
                totalValue: serialItems.reduce((sum, item) => sum + Number(item.currentCostPrice || 0), 0),
                items: outboundItems.map(item => ({
                    id: item.serialItemId,
                    serialNumber: item.serialItem.serialNumber,
                    internalCode: item.serialItem.internalCode,
                    product: item.serialItem.productTemplate.name,
                    notes: item.notes,
                })),
                message: `Outbound request ${code} created successfully with ${outboundItems.length} items reserved`,
            };
        });
    }

    async processOutbound(dto: {
        outboundCode: string;
        items: Array<{
            serialItemId: string;
            confirmed: boolean;
            reason?: string;
        }>;
        notes?: string;
        userId: string;
    }) {
        const { outboundCode, items, notes, userId } = dto;

        return this.prisma.$transaction(async (tx) => {
            // Find reserved items for this outbound
            const reservedTransactions = await tx.serialTransaction.findMany({
                where: {
                    type: TransactionType.RESERVED,
                    notes: { contains: `outbound ${outboundCode}` },
                },
                include: {
                    serialItem: {
                        include: {
                            productTemplate: true,
                            warehouse: true,
                        },
                    },
                },
            });

            if (reservedTransactions.length === 0) {
                throw new NotFoundException(`No reserved items found for outbound ${outboundCode}`);
            }

            const results = {
                processed: [],
                cancelled: [],
                errors: [],
            };

            for (const requestItem of items) {
                const reservation = reservedTransactions.find(
                    tx => tx.serialItemId === requestItem.serialItemId
                );

                if (!reservation) {
                    results.errors.push({
                        serialItemId: requestItem.serialItemId,
                        error: 'Item not reserved for this outbound',
                    });
                    continue;
                }

                // Extract outbound type from notes
                const outboundType = reservation.notes?.includes('SALE') ? 'SALE' :
                    reservation.notes?.includes('RETURN_TO_VENDOR') ? 'RETURN_TO_VENDOR' :
                        reservation.notes?.includes('INTERNAL_TRANSFER') ? 'INTERNAL_TRANSFER' :
                            reservation.notes?.includes('DISPOSAL') ? 'DISPOSAL' : 'DISPOSAL';

                if (requestItem.confirmed) {
                    // Process the outbound
                    const { nextStatus, transactionType } = this.getOutboundDestination(outboundType);

                    await tx.serialItem.update({
                        where: { id: requestItem.serialItemId },
                        data: { status: nextStatus },
                    });

                    await tx.serialTransaction.create({
                        data: {
                            serialItemId: requestItem.serialItemId,
                            type: transactionType,
                            fromStatus: SerialStatus.RESERVED,
                            toStatus: nextStatus,
                            fromLocation: reservation.serialItem.warehouse.code,
                            toLocation: outboundType === 'INTERNAL_TRANSFER' ? 'TRANSFER_PENDING' : null,
                            notes: `${outboundType} completed - ${outboundCode} - ${requestItem.reason || notes || ''}`,
                            performedById: userId,
                        },
                    });

                    results.processed.push({
                        serialItemId: requestItem.serialItemId,
                        newStatus: nextStatus,
                        product: reservation.serialItem.productTemplate.name,
                    });
                } else {
                    // Cancel - return to available
                    await tx.serialItem.update({
                        where: { id: requestItem.serialItemId },
                        data: { status: SerialStatus.AVAILABLE },
                    });

                    await tx.serialTransaction.create({
                        data: {
                            serialItemId: requestItem.serialItemId,
                            type: TransactionType.MOVE_TO_SALE, // Use existing type for unreserving
                            fromStatus: SerialStatus.RESERVED,
                            toStatus: SerialStatus.AVAILABLE,
                            notes: `Outbound cancelled - ${outboundCode} - ${requestItem.reason || 'No reason provided'}`,
                            performedById: userId,
                        },
                    });

                    results.cancelled.push({
                        serialItemId: requestItem.serialItemId,
                        product: reservation.serialItem.productTemplate.name,
                        reason: requestItem.reason,
                    });
                }
            }

            return {
                success: true,
                outboundCode,
                summary: {
                    processed: results.processed.length,
                    cancelled: results.cancelled.length,
                    errors: results.errors.length,
                },
                details: results,
                message: `Outbound ${outboundCode} completed: ${results.processed.length} processed, ${results.cancelled.length} cancelled`,
            };
        });
    }

    // ===========================
    // DIRECT OUTBOUND (Legacy)
    // ===========================

    async createOutbound(dto: CreateOutboundDto, userId: string) {
        if (!dto.items || dto.items.length === 0) {
            throw new BadRequestException('Vui lòng cung cấp danh sách sản phẩm cần xuất kho.');
        }

        return this.prisma.$transaction(async (tx) => {
            const serialIds = dto.items.map(i => i.serialItemId);

            // Lock rows
            const serialItems = await tx.serialItem.findMany({
                where: { id: { in: serialIds } },
                include: { productTemplate: true },
            });

            if (serialItems.length !== dto.items.length) {
                throw new BadRequestException('Một số sản phẩm không tồn tại trong hệ thống.');
            }

            // Check statuses - MUST BE AVAILABLE
            for (const item of serialItems) {
                if (item.status !== SerialStatus.AVAILABLE) {
                    throw new BadRequestException(`Sản phẩm ${item.serialNumber || item.internalCode} đang ở trạng thái ${item.status}, không thể xuất kho. Chỉ có thể xuất sản phẩm đã có sẵn trong tồn kho (AVAILABLE).`);
                }
                if (item.warehouseId !== dto.warehouseId) {
                    throw new BadRequestException(`Sản phẩm ${item.serialNumber || item.internalCode} không nằm trong kho xuất.`);
                }
            }

            // Determine Target Status based on Type
            const { nextStatus, transactionType } = this.getOutboundDestination(dto.type);
            const outboundCode = await this.generateOutboundCode(tx);

            const results = [];
            let totalValue = 0;

            for (const reqItem of dto.items) {
                const dbItem = serialItems.find(si => si.id === reqItem.serialItemId);
                totalValue += Number(dbItem.currentCostPrice || 0);

                // Update serial
                await tx.serialItem.update({
                    where: { id: reqItem.serialItemId },
                    data: { status: nextStatus }
                });

                // Record log
                await tx.serialTransaction.create({
                    data: {
                        serialItemId: reqItem.serialItemId,
                        type: transactionType,
                        fromStatus: SerialStatus.AVAILABLE,
                        toStatus: nextStatus,
                        fromLocation: dbItem.binLocation,
                        notes: `Direct outbound ${outboundCode} - ${dto.type} - ${dto.notes || ''} - ${reqItem.notes || ''}`.trim(),
                        costChange: dto.type === 'DISPOSAL' ? -Number(dbItem.currentCostPrice || 0) : 0,
                        performedById: userId,
                    }
                });

                results.push({
                    id: reqItem.serialItemId,
                    status: nextStatus,
                    product: dbItem.productTemplate?.name,
                });
            }

            return {
                success: true,
                message: 'Xuất kho thành công',
                outboundCode,
                type: dto.type,
                processedItems: results.length,
                totalValue,
                items: results,
            };
        });
    }

    // ===========================
    // HELPER METHODS
    // ===========================

    private getOutboundDestination(type: string): { nextStatus: SerialStatus; transactionType: TransactionType } {
        switch (type) {
            case 'RETURN_TO_VENDOR':
                return { nextStatus: SerialStatus.RETURNED, transactionType: TransactionType.RETURNED };
            case 'INTERNAL_TRANSFER':
                return { nextStatus: SerialStatus.RESERVED, transactionType: TransactionType.RESERVED };
            case 'DISPOSAL':
                return { nextStatus: SerialStatus.DISPOSED, transactionType: TransactionType.DISPOSAL };
            case 'SALE':
                return { nextStatus: SerialStatus.SOLD, transactionType: TransactionType.SOLD };
            default:
                return { nextStatus: SerialStatus.DISPOSED, transactionType: TransactionType.DISPOSAL };
        }
    }

    private async generateOutboundCode(tx: any): Promise<string> {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');

        // Find the latest outbound code for this month
        const latestTransaction = await tx.serialTransaction.findFirst({
            where: {
                OR: [
                    { notes: { contains: 'outbound OUT-' } },
                    { notes: { contains: 'Outbound OUT-' } },
                ],
                createdAt: {
                    gte: new Date(year, now.getMonth(), 1),
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        let sequence = 1;
        if (latestTransaction) {
            const codeMatch = latestTransaction.notes.match(/OUT-(\d{6})-(\d+)/);
            if (codeMatch) {
                const lastSequence = parseInt(codeMatch[2]);
                sequence = lastSequence + 1;
            }
        }

        return `OUT-${year}${month}-${String(sequence).padStart(3, '0')}`;
    }

    // ===========================
    // QUERIES & REPORTING
    // ===========================

    async getOutboundRequests(warehouseId?: string) {
        const where: any = {
            type: TransactionType.RESERVED,
        };

        if (warehouseId) {
            where.serialItem = { warehouseId };
        }

        const reservations = await this.prisma.serialTransaction.findMany({
            where,
            include: {
                serialItem: {
                    include: {
                        productTemplate: { include: { brand: true, category: true } },
                        warehouse: true,
                    },
                },
                performedBy: { select: { fullName: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Group by outbound code extracted from notes
        const grouped = new Map();
        for (const tx of reservations) {
            // Extract outbound code from notes
            const codeMatch = tx.notes?.match(/outbound ([A-Z0-9-]+)/);
            const code = codeMatch ? codeMatch[1] : 'UNKNOWN';
            const typeMatch = tx.notes?.includes('SALE') ? 'SALE' :
                tx.notes?.includes('RETURN_TO_VENDOR') ? 'RETURN_TO_VENDOR' :
                    tx.notes?.includes('INTERNAL_TRANSFER') ? 'INTERNAL_TRANSFER' :
                        tx.notes?.includes('DISPOSAL') ? 'DISPOSAL' : 'UNKNOWN';

            if (!grouped.has(code)) {
                grouped.set(code, {
                    code,
                    type: typeMatch,
                    warehouseId: tx.serialItem.warehouseId,
                    warehouse: tx.serialItem.warehouse.name,
                    status: 'PENDING',
                    createdAt: tx.createdAt,
                    requestedBy: tx.performedBy?.fullName,
                    items: [],
                });
            }

            grouped.get(code).items.push({
                serialItemId: tx.serialItemId,
                serialNumber: tx.serialItem.serialNumber,
                internalCode: tx.serialItem.internalCode,
                product: tx.serialItem.productTemplate.name,
                brand: tx.serialItem.productTemplate.brand?.name,
                binLocation: tx.serialItem.binLocation,
            });
        }

        return Array.from(grouped.values()).sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    async getRecentOutbounds(limit: number = 50) {
        const recentTx = await this.prisma.serialTransaction.findMany({
            where: {
                type: {
                    in: [
                        TransactionType.DISPOSAL,
                        TransactionType.RETURNED,
                        TransactionType.SOLD,
                        TransactionType.RESERVED // Use existing enum value
                    ]
                }
            },
            include: {
                serialItem: {
                    include: {
                        productTemplate: {
                            select: { name: true, sku: true },
                            include: { brand: true, category: true }
                        },
                        warehouse: { select: { name: true, code: true } },
                    }
                },
                performedBy: { select: { fullName: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        });

        return recentTx.map(tx => ({
            id: tx.id,
            type: tx.type,
            outboundCode: tx.notes?.match(/outbound ([A-Z0-9-]+)/)?.[1],
            serialNumber: tx.serialItem.serialNumber,
            internalCode: tx.serialItem.internalCode,
            product: tx.serialItem.productTemplate?.name,
            brand: tx.serialItem.productTemplate?.brand?.name,
            category: tx.serialItem.productTemplate?.category?.name,
            warehouse: tx.serialItem.warehouse?.name,
            fromStatus: tx.fromStatus,
            toStatus: tx.toStatus,
            notes: tx.notes,
            performedBy: tx.performedBy?.fullName,
            createdAt: tx.createdAt,
            isDirect: tx.notes?.includes('Direct outbound'),
        }));
    }

    async getOutboundAnalytics(warehouseId?: string, days: number = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const where: any = {
            createdAt: { gte: startDate },
            type: { in: [TransactionType.DISPOSAL, TransactionType.RETURNED, TransactionType.SOLD, TransactionType.RESERVED] },
        };

        if (warehouseId) {
            where.serialItem = { warehouseId };
        }

        const [typeBreakdown, valueAnalysis, dailyStats] = await Promise.all([
            this.prisma.serialTransaction.groupBy({
                by: ['type'],
                where,
                _count: { id: true },
            }),
            this.prisma.serialTransaction.aggregate({
                where,
                _sum: { costChange: true },
            }),
            this.prisma.serialTransaction.groupBy({
                by: ['createdAt'],
                where,
                _count: { id: true },
                orderBy: { createdAt: 'asc' },
            }),
        ]);

        return {
            summary: {
                totalOutbound: typeBreakdown.reduce((sum, type) => sum + type._count.id, 0),
                totalValueImpact: Number(valueAnalysis._sum.costChange || 0),
                period: `${days} days`,
            },
            typeBreakdown: typeBreakdown.map(type => ({
                type: type.type,
                count: type._count.id,
            })),
            dailyActivity: dailyStats.map(day => ({
                date: day.createdAt,
                outboundCount: day._count.id,
            })),
        };
    }
}
