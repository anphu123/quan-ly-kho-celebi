import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards, Patch } from '@nestjs/common';
import { MasterdataService } from './masterdata.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('suppliers')
@UseGuards(JwtAuthGuard)
export class SuppliersController {
    constructor(private readonly masterdataService: MasterdataService) { }

    @Get()
    findAll(@Query('page') page: string, @Query('limit') limit: string, @Query('search') search: string) {
        return this.masterdataService.findAllSuppliers(Number(page) || 1, Number(limit) || 10, search);
    }

    @Post()
    create(@Body() createDto: any) {
        return this.masterdataService.createSupplier(createDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: any) {
        return this.masterdataService.updateSupplier(id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.masterdataService.deleteSupplier(id);
    }
}
