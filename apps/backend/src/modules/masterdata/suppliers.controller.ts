import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MasterdataService } from './masterdata.service';

@ApiTags('Suppliers')
@Controller('suppliers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SuppliersController {
    constructor(private readonly masterdataService: MasterdataService) {}

    @Get()
    @ApiOperation({ summary: 'Get all suppliers with pagination' })
    async findAll(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
        @Query('search') search = ''
    ) {
        return this.masterdataService.findAllSuppliers(Number(page), Number(limit), search);
    }

    @Post()
    @ApiOperation({ summary: 'Create new supplier' })
    async create(@Body() data: any) {
        return this.masterdataService.createSupplier(data);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update supplier' })
    async update(@Param('id') id: string, @Body() data: any) {
        return this.masterdataService.updateSupplier(id, data);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete supplier' })
    async delete(@Param('id') id: string) {
        return this.masterdataService.deleteSupplier(id);
    }
}
