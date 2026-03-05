import { Controller, Get, Post, Patch, Body, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { MasterdataService } from './masterdata.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('warehouses')
@UseGuards(JwtAuthGuard)
export class WarehousesController {
    constructor(private readonly masterdataService: MasterdataService) { }

    @Get()
    findAll(@Query('page') page: string, @Query('limit') limit: string, @Query('search') search: string) {
        return this.masterdataService.findAllWarehouses(Number(page) || 1, Number(limit) || 10, search);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.masterdataService.findWarehouseById(id);
    }

    @Post()
    create(@Body() createDto: any) {
        return this.masterdataService.createWarehouse(createDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: any) {
        return this.masterdataService.updateWarehouse(id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.masterdataService.deleteWarehouse(id);
    }
}
