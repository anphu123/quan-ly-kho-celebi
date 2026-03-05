import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { MasterdataService } from './masterdata.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
    constructor(private readonly masterdataService: MasterdataService) { }

    @Get()
    findAll(@Query('page') page: string, @Query('limit') limit: string, @Query('search') search: string) {
        return this.masterdataService.findAllProducts(Number(page) || 1, Number(limit) || 10, search);
    }

    @Post()
    create(@Body() createDto: any) {
        return this.masterdataService.createProduct(createDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.masterdataService.deleteProduct(id);
    }
}
