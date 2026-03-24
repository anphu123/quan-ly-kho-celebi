import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MasterdataService } from './masterdata.service';

@ApiTags('Customers')
@Controller('customers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomersController {
    constructor(private readonly masterdataService: MasterdataService) {}

    @Get()
    @ApiOperation({ summary: 'Get all customers with pagination' })
    async findAll(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
        @Query('search') search = ''
    ) {
        return this.masterdataService.findAllCustomers(Number(page), Number(limit), search);
    }

    @Post()
    @ApiOperation({ summary: 'Create new customer' })
    async create(@Body() data: any) {
        return this.masterdataService.createCustomer(data);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete customer' })
    async delete(@Param('id') id: string) {
        return this.masterdataService.deleteCustomer(id);
    }
}
