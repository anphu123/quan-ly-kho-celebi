import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('sales')
@Controller('sales')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SalesController {
    constructor(private readonly salesService: SalesService) { }

    @Get('stats')
    @ApiOperation({ summary: 'Get overall sales statistics' })
    async getStats() {
        return this.salesService.getStats();
    }

    @Get()
    @ApiOperation({ summary: 'Get a list of all sales orders' })
    async findAll(@Query() query: any) {
        return this.salesService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get details of a specific sales order' })
    async findOne(@Param('id') id: string) {
        return this.salesService.findOne(id);
    }
}
