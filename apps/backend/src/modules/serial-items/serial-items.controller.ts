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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SerialItemsService } from './serial-items.service';
import { 
  CreateSerialItemDto, 
  UpdateSerialItemDto, 
  SerialItemsQueryDto 
} from './dto/serial-items.dto';

@ApiTags('serial-items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('serial-items')
export class SerialItemsController {
  constructor(private readonly serialItemsService: SerialItemsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all serial items with filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['INCOMING', 'QC_IN_PROGRESS', 'AVAILABLE', 'RESERVED', 'SOLD', 'REFURBISHING', 'DAMAGED', 'RETURNED', 'DISPOSED'] })
  @ApiQuery({ name: 'grade', required: false, enum: ['GRADE_A_NEW', 'GRADE_A', 'GRADE_B_PLUS', 'GRADE_B', 'GRADE_C_PLUS', 'GRADE_C', 'GRADE_D'] })
  @ApiQuery({ name: 'productTemplateId', required: false, type: String })
  @ApiQuery({ name: 'warehouseId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by serial number, internal code, or product name' })
  async findAll(@Query() query: SerialItemsQueryDto) {
    return this.serialItemsService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get serial items statistics' })
  async getStats(@Query('warehouseId') warehouseId?: string) {
    return this.serialItemsService.getStats(warehouseId);
  }

  @Get('by-template/:productTemplateId')
  @ApiOperation({ summary: 'Get serial items by product template' })
  async findByTemplate(
    @Param('productTemplateId') productTemplateId: string,
    @Query() query: Partial<SerialItemsQueryDto>
  ) {
    return this.serialItemsService.findByProductTemplate(productTemplateId, query);
  }

  @Get('search/:identifier')
  @ApiOperation({ summary: 'Quick search by serial number or internal code' })
  async quickSearch(@Param('identifier') identifier: string) {
    return this.serialItemsService.findByIdentifier(identifier);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get serial item by ID with full details' })
  async findOne(@Param('id') id: string) {
    return this.serialItemsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new serial item' })
  async create(
    @Body() createDto: CreateSerialItemDto,
    @CurrentUser() user: any
  ) {
    return this.serialItemsService.create(createDto, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update serial item' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSerialItemDto,
    @CurrentUser() user: any
  ) {
    return this.serialItemsService.update(id, updateDto, user.id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update serial item status' })
  async updateStatus(
    @Param('id') id: string,
    @Body() statusDto: { status: string; notes?: string; binLocation?: string },
    @CurrentUser() user: any
  ) {
    return this.serialItemsService.updateStatus(id, statusDto.status as any, statusDto.notes, statusDto.binLocation, user.id);
  }

  @Put(':id/grade')
  @ApiOperation({ summary: 'Update serial item grade and pricing' })
  async updateGrade(
    @Param('id') id: string,
    @Body() gradeDto: { grade: string; conditionNotes?: string; suggestedPrice?: number },
    @CurrentUser() user: any
  ) {
    return this.serialItemsService.updateGrade(id, gradeDto.grade as any, user.id, gradeDto.conditionNotes, gradeDto.suggestedPrice);
  }

  @Put(':id/location')
  @ApiOperation({ summary: 'Move serial item to different location' })
  async moveLocation(
    @Param('id') id: string,
    @Body() locationDto: { warehouseId?: string; binLocation?: string },
    @CurrentUser() user: any
  ) {
    return this.serialItemsService.moveLocation(id, locationDto.warehouseId, locationDto.binLocation, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete serial item' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.serialItemsService.remove(id, user.id);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get serial item transaction history' })
  async getHistory(@Param('id') id: string) {
    return this.serialItemsService.getTransactionHistory(id);
  }

  @Get(':id/specs')
  @ApiOperation({ summary: 'Get serial item dynamic specifications' })
  async getSpecs(@Param('id') id: string) {
    return this.serialItemsService.getDynamicSpecs(id);
  }

  @Put(':id/specs')
  @ApiOperation({ summary: 'Update serial item dynamic specifications' })
  async updateSpecs(
    @Param('id') id: string,
    @Body() specsDto: { attributeId: string; value: any }[],
    @CurrentUser() user: any
  ) {
    return this.serialItemsService.updateDynamicSpecs(id, specsDto, user.id);
  }
}