import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateAttributeGroupDto, CreateAttributeDto } from './dto/attribute.dto';

@Injectable()
export class AttributesService {
    constructor(private prisma: PrismaService) { }

    // --- ATTRIBUTE GROUPS ---

    async createGroup(dto: CreateAttributeGroupDto) {
        const category = await this.prisma.category.findUnique({
            where: { id: dto.categoryId }
        });
        if (!category) throw new NotFoundException('Category not found');

        return this.prisma.attributeGroup.create({
            data: dto
        });
    }

    async getGroups() {
        return this.prisma.attributeGroup.findMany({
            include: { category: true, attributes: { orderBy: { sortOrder: 'asc' } } },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getGroupsByCategory(categoryId: string) {
        return this.prisma.attributeGroup.findMany({
            where: { categoryId },
            include: { attributes: { orderBy: { sortOrder: 'asc' } } },
            orderBy: { sortOrder: 'asc' }
        });
    }

    async deleteGroup(id: string) {
        return this.prisma.attributeGroup.delete({ where: { id } });
    }

    // --- ATTRIBUTES ---

    async createAttribute(dto: CreateAttributeDto) {
        const group = await this.prisma.attributeGroup.findUnique({
            where: { id: dto.attributeGroupId }
        });
        if (!group) throw new NotFoundException('Attribute Group not found');

        // Check unique key in group
        const existing = await this.prisma.attribute.findUnique({
            where: {
                attributeGroupId_key: {
                    attributeGroupId: dto.attributeGroupId,
                    key: dto.key
                }
            }
        });

        if (existing) throw new BadRequestException(`Attribute key '${dto.key}' already exists in this group.`);

        return this.prisma.attribute.create({
            data: dto
        });
    }

    async deleteAttribute(id: string) {
        return this.prisma.attribute.delete({ where: { id } });
    }
}
