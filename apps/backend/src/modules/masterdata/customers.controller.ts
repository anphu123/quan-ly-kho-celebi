import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { MasterdataService } from './masterdata.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
    constructor(private readonly masterdataService: MasterdataService) { }

    @Get()
    findAll(@Query('page') page: string, @Query('limit') limit: string, @Query('search') search: string) {
        return this.masterdataService.findAllCustomers(Number(page) || 1, Number(limit) || 10, search);
    }

    @Post()
    create(@Body() createDto: any) {
        return this.masterdataService.createCustomer(createDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.masterdataService.deleteCustomer(id);
    }
}
