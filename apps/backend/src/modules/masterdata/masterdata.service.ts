import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
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
    // CATEGORIES
    // ==========================================
    async findAllCategories(query?: any) {
        const where: any = {};
        
        if (query?.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { code: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        
        if (query?.productType) where.productType = query.productType;
        if (query?.trackingMethod) where.trackingMethod = query.trackingMethod;
        if (query?.brandId) {
            where.brandCategories = { some: { brandId: query.brandId } };
        }

        return this.prisma.category.findMany({
            where,
            include: {
                parent: true,
                children: true,
                brandCategories: {
                    include: { brand: true }
                },
                _count: {
                    select: { productTemplates: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findCategoryById(id: string) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                parent: true,
                children: true,
                brandCategories: {
                    include: { brand: true }
                },
                productTemplates: {
                    take: 10,
                    include: { brand: true }
                },
                _count: {
                    select: { productTemplates: true }
                }
            }
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return category;
    }

    async createCategory(data: any) {
        // Validate parent exists if provided
        if (data.parentId) {
            const parent = await this.prisma.category.findUnique({
                where: { id: data.parentId }
            });
            if (!parent) {
                throw new BadRequestException('Parent category not found');
            }
        }

        // Check code uniqueness
        const existing = await this.prisma.category.findUnique({
            where: { code: data.code }
        });
        if (existing) {
            throw new ConflictException('Category code already exists');
        }

        const created = await this.prisma.category.create({
            data: {
                name: data.name,
                code: data.code,
                productType: data.productType,
                trackingMethod: data.trackingMethod || 'SERIAL_BASED',
                description: data.description,
                parentId: data.parentId,
            },
            include: {
                parent: true,
                _count: {
                    select: { productTemplates: true }
                }
            }
        });

        if (data.brandIds?.length) {
            const brands = await this.prisma.brand.findMany({ where: { id: { in: data.brandIds } } });
            if (brands.length !== data.brandIds.length) {
                const found = new Set(brands.map(b => b.id));
                const missing = data.brandIds.filter((id: string) => !found.has(id));
                throw new BadRequestException(`Brands not found: ${missing.join(', ')}`);
            }
            await this.prisma.brandCategory.createMany({
                data: data.brandIds.map((brandId: string) => ({ brandId, categoryId: created.id })),
                skipDuplicates: true
            });
        }

        return created;
    }

    async updateCategory(id: string, data: any) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: { _count: { select: { productTemplates: true } } }
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        if (data.code && data.code !== category.code) {
            const existing = await this.prisma.category.findUnique({
                where: { code: data.code }
            });
            if (existing) {
                throw new ConflictException('Category code already exists');
            }
        }

        // Don't allow changing trackingMethod if has products
        if (data.trackingMethod && data.trackingMethod !== category.trackingMethod) {
            if (category._count.productTemplates > 0) {
                throw new BadRequestException('Cannot change tracking method for category with existing products');
            }
        }

        const updated = await this.prisma.category.update({
            where: { id },
            data,
            include: {
                parent: true,
                _count: {
                    select: { productTemplates: true }
                }
            }
        });

        if (data.brandIds) {
            const brands = await this.prisma.brand.findMany({ where: { id: { in: data.brandIds } } });
            if (brands.length !== data.brandIds.length) {
                const found = new Set(brands.map(b => b.id));
                const missing = data.brandIds.filter((bid: string) => !found.has(bid));
                throw new BadRequestException(`Brands not found: ${missing.join(', ')}`);
            }
            await this.prisma.brandCategory.deleteMany({ where: { categoryId: id } });
            if (data.brandIds.length > 0) {
                await this.prisma.brandCategory.createMany({
                    data: data.brandIds.map((brandId: string) => ({ brandId, categoryId: id })),
                    skipDuplicates: true
                });
            }
        }

        return updated;
    }

    async deleteCategory(id: string) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: { _count: { select: { productTemplates: true } } }
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        if (category._count.productTemplates > 0) {
            throw new ConflictException('Cannot delete category with existing products');
        }

        return this.prisma.category.delete({ where: { id } });
    }

    // ==========================================
    // BRANDS
    // ==========================================
    async findAllBrands(query?: any) {
        const where: any = {};
        
        if (query?.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { code: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        if (query?.categoryId) {
            where.brandCategories = { some: { categoryId: query.categoryId } };
        }

        return this.prisma.brand.findMany({
            where,
            include: {
                brandCategories: {
                    include: { category: true }
                },
                _count: {
                    select: { productTemplates: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findBrandById(id: string) {
        const brand = await this.prisma.brand.findUnique({
            where: { id },
            include: {
                brandCategories: {
                    include: { category: true }
                },
                productTemplates: {
                    take: 10,
                    include: { category: true }
                },
                _count: {
                    select: { productTemplates: true }
                }
            }
        });

        if (!brand) {
            throw new NotFoundException('Brand not found');
        }

        return brand;
    }

    async createBrand(data: any) {
        // Check code uniqueness
        const existing = await this.prisma.brand.findUnique({
            where: { code: data.code }
        });
        if (existing) {
            throw new ConflictException('Brand code already exists');
        }

        const created = await this.prisma.brand.create({
            data: {
                name: data.name,
                code: data.code,
                logo: data.logo,
            },
            include: {
                _count: {
                    select: { productTemplates: true }
                }
            }
        });

        if (data.categoryIds?.length) {
            const categories = await this.prisma.category.findMany({ where: { id: { in: data.categoryIds } } });
            if (categories.length !== data.categoryIds.length) {
                const found = new Set(categories.map(c => c.id));
                const missing = data.categoryIds.filter((id: string) => !found.has(id));
                throw new BadRequestException(`Categories not found: ${missing.join(', ')}`);
            }
            await this.prisma.brandCategory.createMany({
                data: data.categoryIds.map((categoryId: string) => ({ brandId: created.id, categoryId })),
                skipDuplicates: true
            });
        }

        return created;
    }

    async updateBrand(id: string, data: any) {
        const brand = await this.prisma.brand.findUnique({
            where: { id }
        });

        if (!brand) {
            throw new NotFoundException('Brand not found');
        }

        if (data.code && data.code !== brand.code) {
            const existing = await this.prisma.brand.findUnique({
                where: { code: data.code }
            });
            if (existing) {
                throw new ConflictException('Brand code already exists');
            }
        }

        const updated = await this.prisma.brand.update({
            where: { id },
            data,
            include: {
                _count: {
                    select: { productTemplates: true }
                }
            }
        });

        if (data.categoryIds) {
            const categories = await this.prisma.category.findMany({ where: { id: { in: data.categoryIds } } });
            if (categories.length !== data.categoryIds.length) {
                const found = new Set(categories.map(c => c.id));
                const missing = data.categoryIds.filter((cid: string) => !found.has(cid));
                throw new BadRequestException(`Categories not found: ${missing.join(', ')}`);
            }
            await this.prisma.brandCategory.deleteMany({ where: { brandId: id } });
            if (data.categoryIds.length > 0) {
                await this.prisma.brandCategory.createMany({
                    data: data.categoryIds.map((categoryId: string) => ({ brandId: id, categoryId })),
                    skipDuplicates: true
                });
            }
        }

        return updated;
    }

    async deleteBrand(id: string) {
        const brand = await this.prisma.brand.findUnique({
            where: { id },
            include: { _count: { select: { productTemplates: true } } }
        });

        if (!brand) {
            throw new NotFoundException('Brand not found');
        }

        if (brand._count.productTemplates > 0) {
            throw new ConflictException('Cannot delete brand with existing products');
        }

        return this.prisma.brand.delete({ where: { id } });
    }

    // ==========================================
    // PRODUCT TEMPLATES
    // ==========================================
    async findAllProductTemplates(query?: any) {
        const where: any = {};
        
        if (query?.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { sku: { contains: query.search, mode: 'insensitive' } },
                { model: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        
        if (query?.categoryId) where.categoryId = query.categoryId;
        if (query?.brandId) where.brandId = query.brandId;

        const page = Number(query?.page) || 1;
        const limit = Number(query?.limit) || 20;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.productTemplate.findMany({
                where,
                include: {
                    category: true,
                    brand: true,
                    _count: {
                        select: { serialItems: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.productTemplate.count({ where })
        ]);

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async findProductTemplateById(id: string) {
        const product = await this.prisma.productTemplate.findUnique({
            where: { id },
            include: {
                category: true,
                brand: true,
                serialItems: {
                    where: { status: 'AVAILABLE' },
                    take: 10
                },
                _count: {
                    select: { serialItems: true }
                }
            }
        });

        if (!product) {
            throw new Error('Product template not found');
        }

        return product;
    }

    async createProductTemplate(data: any) {
        // Validate category exists
        const category = await this.prisma.category.findUnique({
            where: { id: data.categoryId }
        });
        if (!category) {
            throw new Error('Category not found');
        }

        // Validate brand exists if provided
        if (data.brandId) {
            const brand = await this.prisma.brand.findUnique({
                where: { id: data.brandId }
            });
            if (!brand) {
                throw new Error('Brand not found');
            }
            const binding = await this.prisma.brandCategory.findUnique({
                where: {
                    brandId_categoryId: {
                        brandId: data.brandId,
                        categoryId: data.categoryId,
                    }
                }
            });
            if (!binding) {
                throw new BadRequestException('Brand không thuộc danh mục đã chọn');
            }
        }

        // Check SKU uniqueness
        const existing = await this.prisma.productTemplate.findUnique({
            where: { sku: data.sku }
        });
        if (existing) {
            throw new Error('SKU already exists');
        }

        return this.prisma.productTemplate.create({
            data: {
                sku: data.sku,
                name: data.name,
                model: data.model,
                description: data.description,
                categoryId: data.categoryId,
                brandId: data.brandId,
                baseWholesalePrice: data.baseWholesalePrice,
                baseRetailPrice: data.baseRetailPrice,
                image: data.image,
                isActive: data.isActive !== false,
            },
            include: {
                category: true,
                brand: true,
                _count: {
                    select: { serialItems: true }
                }
            }
        });
    }

    async updateProductTemplate(id: string, data: any) {
        const product = await this.prisma.productTemplate.findUnique({
            where: { id },
            include: { _count: { select: { serialItems: true } } }
        });

        if (!product) {
            throw new Error('Product template not found');
        }

        // Don't allow changing category if has serial items
        if (data.categoryId && data.categoryId !== product.categoryId) {
            if (product._count.serialItems > 0) {
                throw new Error('Cannot change category for product with existing serial items');
            }
        }

        if (data.brandId || data.categoryId) {
            const brandId = data.brandId ?? product.brandId;
            const categoryId = data.categoryId ?? product.categoryId;
            if (brandId) {
                const binding = await this.prisma.brandCategory.findUnique({
                    where: { brandId_categoryId: { brandId, categoryId } }
                });
                if (!binding) {
                    throw new BadRequestException('Brand không thuộc danh mục đã chọn');
                }
            }
        }

        return this.prisma.productTemplate.update({
            where: { id },
            data,
            include: {
                category: true,
                brand: true,
                _count: {
                    select: { serialItems: true }
                }
            }
        });
    }

    async deleteProductTemplate(id: string) {
        const product = await this.prisma.productTemplate.findUnique({
            where: { id },
            include: { _count: { select: { serialItems: true } } }
        });

        if (!product) {
            throw new Error('Product template not found');
        }

        if (product._count.serialItems > 0) {
            throw new Error('Cannot delete product template with existing serial items');
        }

        return this.prisma.productTemplate.delete({ where: { id } });
    }
}
