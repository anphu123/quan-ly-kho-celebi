import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class SalesService {
    constructor(private prisma: PrismaService) { }

    async findAll(query: any) {
        const { page = 1, limit = 10, search, status, startDate, endDate } = query;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {};

        if (status) {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { code: { contains: search, mode: 'insensitive' } },
                { customer: { fullName: { contains: search, mode: 'insensitive' } } },
                { customer: { phone: { contains: search, mode: 'insensitive' } } },
            ];
        }

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }

        const [data, total] = await Promise.all([
            this.prisma.salesOrder.findMany({
                where,
                include: {
                    customer: true,
                    salesPerson: { select: { id: true, fullName: true } },
                    items: {
                        include: {
                            serialItem: {
                                include: {
                                    productTemplate: { select: { sku: true, name: true } }
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit),
            }),
            this.prisma.salesOrder.count({ where })
        ]);

        return {
            data,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            }
        };
    }

    async findOne(id: string) {
        return this.prisma.salesOrder.findUniqueOrThrow({
            where: { id },
            include: {
                customer: true,
                salesPerson: { select: { id: true, fullName: true } },
                items: {
                    include: {
                        serialItem: {
                            include: {
                                productTemplate: { select: { sku: true, name: true, brand: true, category: true } }
                            }
                        }
                    }
                }
            }
        });
    }

    async getStats() {
        const [totalOrders, totalRevenueData] = await Promise.all([
            this.prisma.salesOrder.count(),
            this.prisma.salesOrder.aggregate({
                _sum: { totalAmount: true }
            })
        ]);

        return {
            totalOrders,
            totalRevenue: totalRevenueData._sum.totalAmount || 0,
            todayOrders: 0, // Placeholder for today's queries if needed
            todayRevenue: 0
        };
    }
}
