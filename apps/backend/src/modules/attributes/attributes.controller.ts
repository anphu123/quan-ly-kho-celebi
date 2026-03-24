import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AttributesService } from './attributes.service';
import { CreateAttributeGroupDto, CreateAttributeDto } from './dto/attribute.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('attributes')
@Controller('attributes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AttributesController {
    constructor(private readonly attributesService: AttributesService) { }

    // --- GROUPS ---

    @Post('groups')
    @Roles('SUPER_ADMIN', 'INVENTORY_MANAGER')
    @ApiOperation({ summary: 'Create a new attribute group' })
    @ApiResponse({ status: 201, description: 'Group created' })
    async createGroup(@Body() dto: CreateAttributeGroupDto) {
        return this.attributesService.createGroup(dto);
    }

    @Get('groups')
    @ApiOperation({ summary: 'Get all attribute groups' })
    async getGroups() {
        return this.attributesService.getGroups();
    }

    @Get('categories/:categoryId/groups')
    @ApiOperation({ summary: 'Get all groups and attributes for a specific category' })
    @ApiParam({ name: 'categoryId' })
    async getGroupsByCategory(@Param('categoryId') categoryId: string) {
        return this.attributesService.getGroupsByCategory(categoryId);
    }

    @Delete('groups/:id')
    @Roles('SUPER_ADMIN')
    @ApiOperation({ summary: 'Delete an attribute group' })
    async deleteGroup(@Param('id') id: string) {
        return this.attributesService.deleteGroup(id);
    }

    // --- ATTRIBUTES ---

    @Post()
    @Roles('SUPER_ADMIN', 'INVENTORY_MANAGER')
    @ApiOperation({ summary: 'Create a new attribute in a group' })
    @ApiResponse({ status: 201, description: 'Attribute created' })
    async createAttribute(@Body() dto: CreateAttributeDto) {
        return this.attributesService.createAttribute(dto);
    }

    @Delete(':id')
    @Roles('SUPER_ADMIN')
    @ApiOperation({ summary: 'Delete an attribute' })
    async deleteAttribute(@Param('id') id: string) {
        return this.attributesService.deleteAttribute(id);
    }
}
