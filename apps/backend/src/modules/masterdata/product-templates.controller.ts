import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MasterdataService } from './masterdata.service';
import { CreateProductTemplateDto, UpdateProductTemplateDto, ProductTemplateQueryDto } from './dto/masterdata.dto';

@ApiTags('Product Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('product-templates')
export class ProductTemplatesController {
    constructor(private readonly masterdataService: MasterdataService) {}

    @Get()
    @ApiOperation({ summary: 'Get all product templates' })
    async findAll(@Query() query: ProductTemplateQueryDto) {
        return this.masterdataService.findAllProductTemplates(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get product template by ID' })
    async findOne(@Param('id') id: string) {
        return this.masterdataService.findProductTemplateById(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create new product template' })
    async create(@Body() data: CreateProductTemplateDto) {
        return this.masterdataService.createProductTemplate(data);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update product template' })
    async update(@Param('id') id: string, @Body() data: UpdateProductTemplateDto) {
        return this.masterdataService.updateProductTemplate(id, data);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete product template' })
    async delete(@Param('id') id: string) {
        return this.masterdataService.deleteProductTemplate(id);
    }
}
