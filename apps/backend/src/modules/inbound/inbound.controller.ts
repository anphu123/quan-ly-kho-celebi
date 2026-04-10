import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  HttpCode, 
  HttpStatus 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiParam, 
  ApiQuery 
} from '@nestjs/swagger';
import { InboundService } from './inbound.service';
import { 
  CreateInboundRequestDto, 
  UpdateInboundRequestDto, 
  CompleteInboundDto, 
  InboundQueryDto,
  UpdateInboundItemDto 
} from './dto/inbound.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('inbound')
@Controller('inbound')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InboundController {
  constructor(private inboundService: InboundService) {}

  // ===========================
  // INBOUND REQUEST ENDPOINTS
  // ===========================

  @Post('requests')
  @ApiOperation({ summary: 'Create new inbound request' })
  @ApiResponse({ status: 201, description: 'Inbound request created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Warehouse not found' })
  async createInboundRequest(
    @Body() dto: CreateInboundRequestDto,
    @CurrentUser() user: any,
  ) {
    return this.inboundService.createInboundRequest(dto, user.id);
  }

  @Get('requests')
  @ApiOperation({ summary: 'Get all inbound requests with filtering' })
  @ApiResponse({ status: 200, description: 'List of inbound requests' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'supplierType', required: false, description: 'Filter by supplier type' })
  @ApiQuery({ name: 'warehouseId', required: false, description: 'Filter by warehouse' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in code, supplier name, notes' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 20 })
  async getAllInboundRequests(@Query() query: InboundQueryDto) {
    return this.inboundService.getAllInboundRequests(query);
  }

  @Get('requests/:id')
  @ApiOperation({ summary: 'Get inbound request by ID' })
  @ApiResponse({ status: 200, description: 'Inbound request details' })
  @ApiResponse({ status: 404, description: 'Inbound request not found' })
  @ApiParam({ name: 'id', description: 'Inbound request ID' })
  async getInboundRequestById(@Param('id') id: string) {
    return this.inboundService.getInboundRequestById(id);
  }

  @Put('requests/:id')
  @ApiOperation({ summary: 'Update inbound request' })
  @ApiResponse({ status: 200, description: 'Inbound request updated successfully' })
  @ApiResponse({ status: 404, description: 'Inbound request not found' })
  @ApiParam({ name: 'id', description: 'Inbound request ID' })
  async updateInboundRequest(
    @Param('id') id: string,
    @Body() dto: UpdateInboundRequestDto,
  ) {
    return this.inboundService.updateInboundRequest(id, dto);
  }

  @Delete('requests/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete inbound request' })
  @ApiResponse({ status: 204, description: 'Inbound request deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete inbound request' })
  @ApiResponse({ status: 404, description: 'Inbound request not found' })
  @ApiParam({ name: 'id', description: 'Inbound request ID' })
  async deleteInboundRequest(@Param('id') id: string) {
    return this.inboundService.deleteInboundRequest(id);
  }

  // ===========================
  // INBOUND ITEM ENDPOINTS
  // ===========================

  @Put('items/:itemId')
  @ApiOperation({ summary: 'Update inbound item' })
  @ApiResponse({ status: 200, description: 'Inbound item updated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot update item' })
  @ApiResponse({ status: 404, description: 'Inbound item not found' })
  @ApiParam({ name: 'itemId', description: 'Inbound item ID' })
  async updateInboundItem(
    @Param('itemId') itemId: string,
    @Body() dto: UpdateInboundItemDto,
  ) {
    return this.inboundService.updateInboundItem(itemId, dto);
  }

  @Delete('items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete inbound item' })
  @ApiResponse({ status: 204, description: 'Inbound item deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete item' })
  @ApiResponse({ status: 404, description: 'Inbound item not found' })
  @ApiParam({ name: 'itemId', description: 'Inbound item ID' })
  async deleteInboundItem(@Param('itemId') itemId: string) {
    return this.inboundService.deleteInboundItem(itemId);
  }

  // ===========================
  // RECEIVING WORKFLOW ENDPOINTS
  // ===========================

  @Post('requests/:id/receive-items')
  @ApiOperation({ summary: 'Mark items as received (simple workflow)' })
  @ApiResponse({ status: 200, description: 'Items marked as received' })
  @ApiParam({ name: 'id', description: 'Inbound request ID' })
  async receiveItems(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    // Simple workflow: just mark as received, move to IN_PROGRESS
    return this.inboundService.startReceivingProcess(id, user.id);
  }

  @Post('requests/:id/complete-qc')
  @ApiOperation({ summary: 'Complete QC. For CUSTOMER_TRADE_IN: moves to PENDING_WAREHOUSE_ENTRY awaiting thủ kho approval. For others: creates serial items immediately.' })
  @ApiResponse({ status: 200, description: 'QC completed' })
  @ApiParam({ name: 'id', description: 'Inbound request ID' })
  async completeQCSimple(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body?: { notes?: string },
  ) {
    const request = await this.inboundService.getInboundRequestById(id);

    // Trade-in: after QC → submit for warehouse entry approval (thủ kho duyệt nhập kho)
    if ((request as any).supplierType === 'CUSTOMER_TRADE_IN') {
      return this.inboundService.submitQCForWarehouseApproval(id);
    }

    // Regular inbound: complete immediately
    const items = (request as any).items.map((item: any) => {
      const estimatedValue = Number(item.estimatedValue) || 0;
      const otherCosts = Number(item.otherCosts) || 0;
      const topUp = Number(item.topUp) || 0;
      const purchasePrice = Math.max(estimatedValue + otherCosts + topUp, 1000);
      return {
        inboundItemId: item.id,
        serialNumber: item.serialNumber || null,
        condition: item.condition || item.notes || 'Đã kiểm tra',
        purchasePrice: Math.round(purchasePrice * 100) / 100,
        binLocation: null,
        notes: item.notes || null,
        customAttributes: [],
      };
    });

    const dto: CompleteInboundDto = {
      inboundRequestId: id,
      items,
      notes: body?.notes,
      skipQC: true,
    };

    return this.inboundService.completeInboundRequest(dto, user.id);
  }

  @Post('requests/:id/confirm-entry')
  @ApiOperation({ summary: 'Thủ kho duyệt nhập kho (PENDING_WAREHOUSE_ENTRY → COMPLETED)' })
  @ApiResponse({ status: 200, description: 'Warehouse entry confirmed, serial items created' })
  @ApiParam({ name: 'id', description: 'Inbound request ID' })
  async confirmWarehouseEntry(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.inboundService.confirmWarehouseEntry(id, user.id);
  }

  @Post('requests/:id/start-receiving')
  @ApiOperation({ summary: 'Start receiving process for inbound request' })
  @ApiResponse({ status: 200, description: 'Receiving process started' })
  @ApiResponse({ status: 400, description: 'Invalid status for starting process' })
  @ApiResponse({ status: 404, description: 'Inbound request not found' })
  @ApiParam({ name: 'id', description: 'Inbound request ID' })
  async startReceivingProcess(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.inboundService.startReceivingProcess(id, user.id);
  }

  @Post('requests/:id/submit')
  @ApiOperation({ summary: 'Submit inbound request for approval (REQUESTED → PENDING_APPROVAL)' })
  @ApiResponse({ status: 200, description: 'Phiếu submitted for approval' })
  @ApiParam({ name: 'id', description: 'Inbound request ID' })
  async submitForApproval(@Param('id') id: string) {
    return this.inboundService.submitForApproval(id);
  }

  @Post('requests/:id/approve')
  @ApiOperation({ summary: 'Approve inbound request (PENDING_APPROVAL → IN_PROGRESS) — thủ kho only' })
  @ApiResponse({ status: 200, description: 'Phiếu approved and moved to IN_PROGRESS' })
  @ApiParam({ name: 'id', description: 'Inbound request ID' })
  async approveInbound(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.inboundService.approveInbound(id, user.id);
  }

  @Post('requests/:id/reject')
  @ApiOperation({ summary: 'Reject inbound request (PENDING_APPROVAL → REJECTED) — thủ kho only' })
  @ApiResponse({ status: 200, description: 'Phiếu rejected' })
  @ApiParam({ name: 'id', description: 'Inbound request ID' })
  async rejectInbound(
    @Param('id') id: string,
    @Body() body?: { reason?: string },
  ) {
    return this.inboundService.rejectInbound(id, body?.reason);
  }

  @Post('complete')
  @ApiOperation({ summary: 'Complete inbound receiving process' })
  @ApiResponse({ status: 200, description: 'Inbound process completed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status or data for completion' })
  @ApiResponse({ status: 404, description: 'Inbound request or items not found' })
  async completeInboundRequest(
    @Body() dto: CompleteInboundDto,
    @CurrentUser() user: any,
  ) {
    return this.inboundService.completeInboundRequest(dto, user.id);
  }

  // ===========================
  // ANALYTICS & REPORTING ENDPOINTS
  // ===========================

  @Get('pending-approvals')
  @ApiOperation({ summary: 'Get pending approval requests for current user (filtered by managed warehouses)' })
  @ApiResponse({ status: 200, description: 'Pending approval requests' })
  async getPendingApprovals(@CurrentUser() user: any) {
    return this.inboundService.getPendingApprovalsForUser(user.id, user.role);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get inbound statistics' })
  @ApiResponse({ status: 200, description: 'Inbound statistics' })
  @ApiQuery({ name: 'warehouseId', required: false, description: 'Filter by warehouse' })
  async getInboundStats(@Query('warehouseId') warehouseId?: string) {
    return this.inboundService.getInboundStats(warehouseId);
  }

  // ===========================
  // QUICK ACCESS ENDPOINTS
  // ===========================

  @Get('requests/pending/summary')
  @ApiOperation({ summary: 'Get summary of pending inbound requests' })
  @ApiResponse({ status: 200, description: 'Pending requests summary' })
  async getPendingRequestsSummary() {
    return this.inboundService.getAllInboundRequests({ 
      status: 'REQUESTED' as any,
      limit: 50 
    });
  }

  @Get('requests/in-progress/summary')
  @ApiOperation({ summary: 'Get summary of in-progress inbound requests' })
  @ApiResponse({ status: 200, description: 'In-progress requests summary' })
  async getInProgressRequestsSummary() {
    return this.inboundService.getAllInboundRequests({ 
      status: 'IN_PROGRESS' as any,
      limit: 50 
    });
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent inbound activities' })
  @ApiResponse({ status: 200, description: 'Recent inbound activities' })
  async getRecentActivities() {
    return this.inboundService.getAllInboundRequests({ 
      limit: 10 
    });
  }

  // ===========================
  // SUPPLIER & ITEM HELPERS
  // ===========================

  @Get('suppliers/recent')
  @ApiOperation({ summary: 'Get recently used suppliers for quick selection' })
  @ApiResponse({ status: 200, description: 'Recent suppliers list' })
  async getRecentSuppliers() {
    // This could be enhanced with a dedicated supplier management system
    const recentRequests = await this.inboundService.getAllInboundRequests({ 
      limit: 20 
    });
    
    const suppliers = recentRequests.data.map(req => ({
      name: req.supplierName,
      phone: req.supplierPhone,
      email: req.supplierEmail,
      type: req.supplierType,
    }));

    // Remove duplicates based on supplier name
    const uniqueSuppliers = suppliers.filter((supplier, index, self) => 
      index === self.findIndex(s => s.name === supplier.name)
    );

    return uniqueSuppliers.slice(0, 10);
  }
}