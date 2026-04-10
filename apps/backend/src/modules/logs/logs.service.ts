import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type LogType = 'ALL' | 'SERIAL' | 'STOCK' | 'INBOUND';

@Injectable()
export class LogsService {
  constructor(private prisma: PrismaService) {}

  async getLogs(params: {
    type?: LogType;
    search?: string;
    startDate?: string;
    endDate?: string;
    warehouseId?: string;
    page?: number;
    limit?: number;
  }) {
    const { type = 'ALL', search, startDate, endDate, warehouseId, page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;

    const dateFilter = startDate || endDate ? {
      createdAt: {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)) } : {}),
      },
    } : {};

    const results: any[] = [];

    // ── SERIAL TRANSACTIONS ──────────────────────────────────────────
    if (type === 'ALL' || type === 'SERIAL') {
      const where: any = { ...dateFilter };
      if (warehouseId) where.serialItem = { warehouseId };
      if (search) {
        where.OR = [
          { serialItem: { serialNumber: { contains: search, mode: 'insensitive' } } },
          { serialItem: { internalCode: { contains: search, mode: 'insensitive' } } },
          { notes: { contains: search, mode: 'insensitive' } },
        ];
      }

      const rows = await this.prisma.serialTransaction.findMany({
        where,
        include: {
          serialItem: {
            include: { productTemplate: { select: { name: true, sku: true } }, warehouse: { select: { name: true } } },
          },
          performedBy: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: type === 'SERIAL' ? limit : 200,
        skip: type === 'SERIAL' ? skip : 0,
      });

      rows.forEach(r => results.push({
        id: r.id,
        logType: 'SERIAL',
        createdAt: r.createdAt,
        action: r.type,
        description: `[${r.serialItem?.productTemplate?.name || '?'}] ${r.serialItem?.internalCode || ''} ${r.fromStatus ? r.fromStatus + ' → ' : ''}${r.toStatus || ''}`,
        detail: r.notes,
        subject: r.serialItem?.internalCode || r.serialItem?.id,
        subjectId: r.serialItemId,
        warehouse: r.serialItem?.warehouse?.name,
        actor: r.performedBy?.fullName,
        actorId: r.performedBy?.id,
        meta: { fromStatus: r.fromStatus, toStatus: r.toStatus, fromLocation: r.fromLocation, toLocation: r.toLocation },
      }));
    }

    // ── STOCK MOVEMENTS ──────────────────────────────────────────────
    if (type === 'ALL' || type === 'STOCK') {
      const where: any = { ...dateFilter };
      if (warehouseId) where.warehouseId = warehouseId;
      if (search) {
        where.OR = [
          { productTemplate: { name: { contains: search, mode: 'insensitive' } } },
          { notes: { contains: search, mode: 'insensitive' } },
        ];
      }

      const rows = await this.prisma.stockMovement.findMany({
        where,
        include: {
          productTemplate: { select: { name: true, sku: true } },
          warehouse: { select: { name: true } },
          createdBy: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: type === 'STOCK' ? limit : 200,
        skip: type === 'STOCK' ? skip : 0,
      });

      rows.forEach(r => results.push({
        id: r.id,
        logType: 'STOCK',
        createdAt: r.createdAt,
        action: r.type,
        description: `[${r.productTemplate?.name || '?'}] ${r.type} qty: ${r.quantity > 0 ? '+' : ''}${r.quantity}`,
        detail: r.notes,
        subject: r.productTemplate?.name,
        subjectId: r.productTemplateId,
        warehouse: r.warehouse?.name,
        actor: r.createdBy?.fullName,
        actorId: r.createdBy?.id,
        meta: { quantity: r.quantity, unitCost: r.unitCost, balanceBefore: r.balanceBefore, balanceAfter: r.balanceAfter, referenceType: r.referenceType, referenceId: r.referenceId },
      }));
    }

    // ── INBOUND REQUESTS ────────────────────────────────────────────
    if (type === 'ALL' || type === 'INBOUND') {
      const where: any = { ...dateFilter };
      if (warehouseId) where.warehouseId = warehouseId;
      if (search) {
        where.OR = [
          { code: { contains: search, mode: 'insensitive' } },
          { supplierName: { contains: search, mode: 'insensitive' } },
          { notes: { contains: search, mode: 'insensitive' } },
        ];
      }

      const rows = await this.prisma.inboundRequest.findMany({
        where,
        include: {
          warehouse: { select: { name: true } },
          receivedBy: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: type === 'INBOUND' ? limit : 200,
        skip: type === 'INBOUND' ? skip : 0,
      });

      rows.forEach(r => results.push({
        id: r.id,
        logType: 'INBOUND',
        createdAt: r.createdAt,
        action: r.status,
        description: `[${r.code}] ${r.supplierType} — ${r.supplierName}`,
        detail: r.notes,
        subject: r.code,
        subjectId: r.id,
        warehouse: r.warehouse?.name,
        actor: r.receivedBy?.fullName,
        actorId: r.receivedBy?.id,
        meta: { supplierType: r.supplierType, status: r.status, totalEstimatedValue: r.totalEstimatedValue },
      }));
    }

    // Sort all by createdAt desc, paginate for ALL
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = results.length;
    const paged = type === 'ALL' ? results.slice(skip, skip + limit) : results;

    return {
      data: paged,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getLogStats() {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000); // last 24h
    const [serialCount, stockCount, inboundCount] = await Promise.all([
      this.prisma.serialTransaction.count({ where: { createdAt: { gte: since } } }),
      this.prisma.stockMovement.count({ where: { createdAt: { gte: since } } }),
      this.prisma.inboundRequest.count({ where: { createdAt: { gte: since } } }),
    ]);
    return { serial24h: serialCount, stock24h: stockCount, inbound24h: inboundCount, total24h: serialCount + stockCount + inboundCount };
  }
}
