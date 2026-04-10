import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CheckoutDto } from './dto/pos.dto';
import { SerialStatus, SalesOrderStatus, TransactionType } from '@prisma/client';

@Injectable()
export class PosService {
    constructor(private prisma: PrismaService) { }

    async checkout(dto: CheckoutDto, userId: string) {
        if (!dto.items || dto.items.length === 0) {
            throw new BadRequestException('Giỏ hàng trống!');
        }

        return this.prisma.$transaction(async (tx) => {
            let totalAmount = 0;
            const orderItemsData = [];
            const serialIds = dto.items.map(i => i.serialItemId);

            // 1. Lock rows to prevent double-selling (SELECT FOR UPDATE equivalent in Prisma via findMany + checks inside transaction)
            const serialItems = await tx.serialItem.findMany({
                where: { id: { in: serialIds } },
                include: { productTemplate: true }
            });

            if (serialItems.length !== dto.items.length) {
                throw new BadRequestException('Một số sản phẩm không tồn tại trong hệ thống.');
            }

            for (const item of dto.items) {
                const dbItem = serialItems.find(si => si.id === item.serialItemId);

                if (dbItem.status !== SerialStatus.AVAILABLE) {
                    throw new BadRequestException(`Sản phẩm ${dbItem.serialNumber || dbItem.internalCode} đang ở trạng thái ${dbItem.status}, không thể bán.`);
                }

                if (dbItem.warehouseId !== dto.warehouseId) {
                    throw new BadRequestException(`Sản phẩm ${dbItem.serialNumber || dbItem.internalCode} không nằm trong kho hiện tại.`);
                }

                const finalPrice = item.unitPrice - (item.discount || 0);
                totalAmount += finalPrice;

                orderItemsData.push({
                    serialItemId: item.serialItemId,
                    unitPrice: item.unitPrice,
                    discount: item.discount || 0,
                    finalPrice: finalPrice,
                });
            }

            // Generate Order Code
            const orderCode = await this.generateOrderCode(tx);

            // 2. Create SalesOrder
            const salesOrder = await tx.salesOrder.create({
                data: {
                    code: orderCode,
                    warehouseId: dto.warehouseId,
                    customerId: dto.customerId,
                    salesPersonId: userId,
                    status: SalesOrderStatus.COMPLETED, // Finish immediately for POS
                    totalAmount: totalAmount,
                    paidAmount: dto.paidAmount ?? totalAmount, // default fully paid
                    notes: dto.notes,
                    items: {
                        create: orderItemsData,
                    }
                },
                include: { items: true, customer: true }
            });

            // 3. Update Serial Items and record transactions
            for (const item of orderItemsData) {
                const dbItem = serialItems.find(si => si.id === item.serialItemId);

                // Update serial
                await tx.serialItem.update({
                    where: { id: item.serialItemId },
                    data: { status: SerialStatus.SOLD }
                });

                // Record log
                await tx.serialTransaction.create({
                    data: {
                        serialItemId: item.serialItemId,
                        type: TransactionType.SOLD,
                        fromStatus: SerialStatus.AVAILABLE,
                        toStatus: SerialStatus.SOLD,
                        fromLocation: dbItem.binLocationId,
                        notes: `Sold in Order ${orderCode}`,
                        performedById: userId,
                    }
                });
            }

            // Optional: Update global product stock counts if we had a summary table, 
            // but since it's serial-based, looking up count(status=AVAILABLE) is usually sufficient.

            return salesOrder;
        });
    }

    // --- Helpers ---

    private async generateOrderCode(tx: any): Promise<string> {
        const now = new Date();
        const prefix = `SO${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;

        const count = await tx.salesOrder.count({
            where: { code: { startsWith: prefix } }
        });

        return `${prefix}${String(count + 1).padStart(4, '0')}`;
    }

    // Search products for POS
    async searchPosItems(warehouseId: string, keyword: string) {
        if (!keyword) return [];

        return this.prisma.serialItem.findMany({
            where: {
                warehouseId,
                status: SerialStatus.AVAILABLE,
                OR: [
                    { serialNumber: { contains: keyword, mode: 'insensitive' } },
                    { internalCode: { contains: keyword, mode: 'insensitive' } },
                    { productTemplate: { name: { contains: keyword, mode: 'insensitive' } } },
                    { productTemplate: { sku: { contains: keyword, mode: 'insensitive' } } }
                ]
            },
            include: {
                productTemplate: {
                    include: { category: true, brand: true }
                }
            },
            take: 20
        });
    }
}
