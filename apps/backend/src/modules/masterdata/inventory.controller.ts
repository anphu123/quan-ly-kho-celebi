import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('Inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Get('stock-levels')
    @ApiOperation({ summary: 'Get stock levels by warehouse and product' })
    @ApiQuery({ name: 'warehouseId', required: false, description: 'Filter by warehouse ID' })
    @ApiQuery({ name: 'productTemplateId', required: false, description: 'Filter by product template ID' })
    getStockLevels(
        @Query('warehouseId') warehouseId?: string,
        @Query('productTemplateId') productTemplateId?: string,
    ) {
        return this.inventoryService.getStockLevels(warehouseId, productTemplateId);
    }

    @Get('low-stock')
    @ApiOperation({ summary: 'Get products with low stock' })
    getLowStockProducts() {
        return this.inventoryService.getLowStockProducts();
    }

    @Post('mark-available')
    @ApiOperation({ summary: 'Mark items as available for sale' })
    @ApiResponse({ status: 200, description: 'Items marked as available successfully' })
    markAsAvailable(
        @Body() dto: {
            serialItemIds: string[];
            grade?: string;
            suggestedPrice?: number;
            notes?: string;
        },
        @CurrentUser() user: any,
    ) {
        return this.inventoryService.markAsAvailable({
            ...dto,
            userId: user.id,
        });
    }
}
