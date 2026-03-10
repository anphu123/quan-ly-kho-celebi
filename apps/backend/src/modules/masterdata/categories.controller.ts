import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MasterdataService } from './masterdata.service';
import { CreateCategoryDto, UpdateCategoryDto, CategoryQueryDto } from './dto/masterdata.dto';

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
    constructor(private readonly masterdataService: MasterdataService) {}

    @Get()
    @ApiOperation({ summary: 'Get all categories' })
    async findAll(@Query() query: CategoryQueryDto) {
        return this.masterdataService.findAllCategories(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get category by ID' })
    async findOne(@Param('id') id: string) {
        return this.masterdataService.findCategoryById(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create new category' })
    async create(@Body() data: CreateCategoryDto) {
        return this.masterdataService.createCategory(data);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update category' })
    async update(@Param('id') id: string, @Body() data: UpdateCategoryDto) {
        return this.masterdataService.updateCategory(id, data);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete category' })
    async delete(@Param('id') id: string) {
        return this.masterdataService.deleteCategory(id);
    }
}
