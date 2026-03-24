import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MasterdataService } from './masterdata.service';
import { CreateBrandDto, UpdateBrandDto, BrandQueryDto } from './dto/masterdata.dto';

@ApiTags('Brands')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('brands')
export class BrandsController {
    constructor(private readonly masterdataService: MasterdataService) {}

    @Get()
    @ApiOperation({ summary: 'Get all brands' })
    async findAll(@Query() query: BrandQueryDto) {
        return this.masterdataService.findAllBrands(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get brand by ID' })
    async findOne(@Param('id') id: string) {
        return this.masterdataService.findBrandById(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create new brand' })
    async create(@Body() data: CreateBrandDto) {
        return this.masterdataService.createBrand(data);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update brand' })
    async update(@Param('id') id: string, @Body() data: UpdateBrandDto) {
        return this.masterdataService.updateBrand(id, data);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete brand' })
    async delete(@Param('id') id: string) {
        return this.masterdataService.deleteBrand(id);
    }
}
