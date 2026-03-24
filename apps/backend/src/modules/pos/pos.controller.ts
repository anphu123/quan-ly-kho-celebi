import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PosService } from './pos.service';
import { CheckoutDto } from './dto/pos.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('pos')
@Controller('pos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PosController {
    constructor(private readonly posService: PosService) { }

    @Post('checkout')
    @ApiOperation({ summary: 'Process POS checkout, deducting stock and creating order' })
    @ApiResponse({ status: 201, description: 'SalesOrder created successfully' })
    @ApiResponse({ status: 400, description: 'Products not available or empty cart' })
    async checkout(
        @Body() dto: CheckoutDto,
        @CurrentUser() user: any
    ) {
        return this.posService.checkout(dto, user.id);
    }

    @Get('search')
    @ApiOperation({ summary: 'Search available products in warehouse for POS' })
    @ApiQuery({ name: 'warehouseId', description: 'Warehouse ID to search in', required: true })
    @ApiQuery({ name: 'keyword', description: 'Keyword (SKU, Serial, name)', required: true })
    async searchItems(
        @Query('warehouseId') warehouseId: string,
        @Query('keyword') keyword: string
    ) {
        return this.posService.searchPosItems(warehouseId, keyword);
    }
}
