import { Controller, Get, Query, Param, Post, UseGuards } from '@nestjs/common';
import { StockService } from './stock.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Grade } from '@prisma/client';

@Controller('stock')
@UseGuards(JwtAuthGuard)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  /**
   * GET /stock/levels?warehouseId=xxx
   * Lấy tồn kho theo warehouse
   */
  @Get('levels')
  async getStockLevels(@Query('warehouseId') warehouseId?: string) {
    if (warehouseId) {
      return this.stockService.getStockLevelsByWarehouse(warehouseId);
    }

    // Nếu không có warehouseId, trả về tất cả
    return this.stockService.getAllStockLevels();
  }

  /**
   * GET /stock/levels/product/:productId
   * Lấy tồn kho của 1 sản phẩm ở tất cả kho
   */
  @Get('levels/product/:productId')
  async getStockLevelsByProduct(@Param('productId') productId: string) {
    return this.stockService.getStockLevelsByProduct(productId);
  }

  /**
   * GET /stock/low-stock?warehouseId=xxx
   * Lấy danh sách sản phẩm sắp hết hàng
   */
  @Get('low-stock')
  async getLowStockProducts(@Query('warehouseId') warehouseId?: string) {
    return this.stockService.getLowStockProducts(warehouseId);
  }

  /**
   * GET /stock/movements?productId=xxx&warehouseId=xxx&startDate=xxx&endDate=xxx
   * Lấy lịch sử xuất nhập tồn
   */
  @Get('movements')
  async getStockMovements(
    @Query('productId') productId?: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ) {
    return this.stockService.getStockMovements({
      productTemplateId: productId,
      warehouseId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  /**
   * POST /stock/recalculate/:productId/:warehouseId?grade=xxx
   * Tính lại tồn kho từ SerialItems (dùng khi cần sync)
   */
  @Post('recalculate/:productId/:warehouseId')
  async recalculateStockLevel(
    @Param('productId') productId: string,
    @Param('warehouseId') warehouseId: string,
    @Query('grade') grade?: Grade,
  ) {
    return this.stockService.recalculateStockLevel(
      productId,
      warehouseId,
      grade || null,
    );
  }

  /**
   * GET /stock/reports/inbound-by-source?warehouseId=xxx&startDate=xxx&endDate=xxx
   * Báo cáo nhập kho theo nguồn hàng
   */
  @Get('reports/inbound-by-source')
  async getInboundBySource(
    @Query('warehouseId') warehouseId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.stockService.getInboundBySource(
      warehouseId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}
