import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MasterdataService {
    constructor(private prisma: PrismaService) { }

    // ==========================================
    // CUSTOMERS
    // ==========================================
    async findAllCustomers(page = 1, limit = 10, search = '') {
        const where = search
            ? { OR: [{ fullName: { contains: search, mode: 'insensitive' as any } }, { phone: { contains: search } }] }
            : {};
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.customer.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' } }),
            this.prisma.customer.count({ where })
        ]);

        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    async createCustomer(data: any) {
        const code = 'CUS-' + Date.now().toString().slice(-6);
        return this.prisma.customer.create({ data: { ...data, code } });
    }

    async deleteCustomer(id: string) { return this.prisma.customer.delete({ where: { id } }); }

    // ==========================================
    // SUPPLIERS
    // ==========================================
    async findAllSuppliers(page = 1, limit = 10, search = '') {
        const where = search
            ? { OR: [{ name: { contains: search, mode: 'insensitive' as any } }, { code: { contains: search, mode: 'insensitive' as any } }] }
            : {};
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.supplier.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' } }),
            this.prisma.supplier.count({ where })
        ]);

        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    async createSupplier(data: any) {
        const code = 'SUP-' + Date.now().toString().slice(-6);
        return this.prisma.supplier.create({
            data: {
                code,
                name: data.name,
                contactPerson: data.contactPerson,
                phone: data.phone,
                email: data.email,
                address: data.address,
                taxCode: data.taxCode,
                bankAccount: data.bankAccount,
                notes: data.notes,
            }
        });
    }

    async updateSupplier(id: string, data: any) {
        return this.prisma.supplier.update({
            where: { id },
            data: {
                name: data.name,
                contactPerson: data.contactPerson,
                phone: data.phone,
                email: data.email,
                address: data.address,
                taxCode: data.taxCode,
                bankAccount: data.bankAccount,
                notes: data.notes,
            }
        });
    }

    async deleteSupplier(id: string) {
        return this.prisma.supplier.delete({ where: { id } });
    }

    // ==========================================
    // WAREHOUSES
    // ==========================================
    async findAllWarehouses(page = 1, limit = 10, search = '') {
        const where = search ? { name: { contains: search, mode: 'insensitive' as any } } : {};
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.warehouse.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' } }),
            this.prisma.warehouse.count({ where })
        ]);
        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    async createWarehouse(data: any) {
        const code = 'WH-' + Date.now().toString().slice(-4);
        return this.prisma.warehouse.create({ data: { ...data, code } });
    }

    async findWarehouseById(id: string) { return this.prisma.warehouse.findUniqueOrThrow({ where: { id } }); }

    async updateWarehouse(id: string, data: any) { return this.prisma.warehouse.update({ where: { id }, data }); }

    async deleteWarehouse(id: string) { return this.prisma.warehouse.delete({ where: { id } }); }

    // ==========================================
    // CATEGORIES & BRANDS & UNITS
    // ==========================================
    async findAllCategories() { return this.prisma.category.findMany(); }
    async findAllBrands() { return this.prisma.brand.findMany(); }

    // ==========================================
    // PRODUCTS (Product templates mapping)
    // ==========================================
    async findAllProducts(page = 1, limit = 10, search = '') {
        const where = search ? { OR: [{ name: { contains: search, mode: 'insensitive' as any } }, { sku: { contains: search, mode: 'insensitive' as any } }] } : {};
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.productTemplate.findMany({
                where, skip, take: Number(limit),
                include: { category: true, brand: true, serialItems: { select: { id: true, status: true, warehouseId: true } } },
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.productTemplate.count({ where })
        ]);

        // Map to frontend expected shape
        const mappedData = data.map(item => ({
            id: item.id,
            sku: item.sku,
            name: item.name,
            description: item.description,
            categoryId: item.categoryId,
            brandId: item.brandId,
            category: item.category,
            brand: item.brand,
            costPrice: Number(item.baseWholesalePrice || 0),
            sellingPrice: Number(item.baseRetailPrice || 0),
            minStockLevel: 5, // mock configs
            stockLevels: [{ quantity: item.serialItems.filter(s => s.status === 'AVAILABLE').length, warehouse: { id: 'any', name: 'All' } }],
            isActive: item.isActive,
            createdAt: item.createdAt,
        }));

        return { data: mappedData, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    async createProduct(data: any) {
        return this.prisma.productTemplate.create({
            data: {
                sku: data.sku,
                name: data.name,
                description: data.description,
                categoryId: data.categoryId,
                brandId: data.brandId,
                baseWholesalePrice: data.costPrice,
                baseRetailPrice: data.sellingPrice,
            }
        });
    }

    async deleteProduct(id: string) { return this.prisma.productTemplate.delete({ where: { id } }); }
}
