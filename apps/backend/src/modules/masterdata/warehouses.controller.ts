import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MasterdataService } from './masterdata.service';

@ApiTags('Warehouses')
@Controller('warehouses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WarehousesController {
    constructor(private readonly masterdataService: MasterdataService) {}

    @Get()
    @ApiOperation({ summary: 'Get all warehouses with pagination' })
    async findAll(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
        @Query('search') search = ''
    ) {
        return this.masterdataService.findAllWarehouses(Number(page), Number(limit), search);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get warehouse by ID' })
    async findOne(@Param('id') id: string) {
        return this.masterdataService.findWarehouseById(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create new warehouse' })
    async create(@Body() data: any) {
        return this.masterdataService.createWarehouse(data);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update warehouse' })
    async update(@Param('id') id: string, @Body() data: any) {
        return this.masterdataService.updateWarehouse(id, data);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete warehouse' })
    async delete(@Param('id') id: string) {
        return this.masterdataService.deleteWarehouse(id);
    }
}
