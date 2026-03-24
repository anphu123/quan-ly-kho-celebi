import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { QCInspectionService } from './qc-inspection.service';
import { 
  CreateQCInspectionDto,
  UpdateInspectionResultsDto,
  CompleteInspectionDto,
  InspectionQueryDto 
} from './dto/qc-inspection.dto';

@ApiTags('qc-inspections')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('qc-inspections')
export class QCInspectionController {
  constructor(private readonly qcInspectionService: QCInspectionService) {}

  @Post()
  @ApiOperation({ summary: 'Create new QC inspection' })
  @ApiResponse({ status: 201, description: 'QC inspection created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or serial item not eligible for QC' })
  async create(
    @Body() createDto: CreateQCInspectionDto,
    @CurrentUser() user: any
  ) {
    return this.qcInspectionService.create(createDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all QC inspections with filters' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by inspection status' })
  @ApiQuery({ name: 'inspectorId', required: false, description: 'Filter by inspector' })
  @ApiQuery({ name: 'serialItemId', required: false, description: 'Filter by serial item' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: 'number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: 'number' })
  async findAll(@Query() query: InspectionQueryDto) {
    return this.qcInspectionService.findAll(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get QC inspection statistics' })
  @ApiQuery({ name: 'inspectorId', required: false, description: 'Filter by inspector' })
  async getStatistics(@Query('inspectorId') inspectorId?: string) {
    return this.qcInspectionService.getStatistics(inspectorId);
  }

  @Get('templates/:categoryId')
  @ApiOperation({ summary: 'Get QC templates for category' })
  @ApiResponse({ status: 200, description: 'QC templates retrieved successfully' })
  async getTemplatesForCategory(@Param('categoryId') categoryId: string) {
    return this.qcInspectionService.getTemplatesForCategory(categoryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get QC inspection details' })
  @ApiResponse({ status: 200, description: 'QC inspection retrieved successfully' })
  @ApiResponse({ status: 404, description: 'QC inspection not found' })
  async findOne(@Param('id') id: string) {
    return this.qcInspectionService.findOne(id);
  }

  @Patch(':id/results')
  @ApiOperation({ summary: 'Update QC inspection results' })
  @ApiResponse({ status: 200, description: 'Inspection results updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid results or inspection not editable' })
  @ApiResponse({ status: 404, description: 'Inspection not found' })
  async updateResults(
    @Param('id') id: string,
    @Body() updateDto: UpdateInspectionResultsDto,
    @CurrentUser() user: any
  ) {
    return this.qcInspectionService.updateResults(id, updateDto, user.id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete QC inspection' })
  @ApiResponse({ status: 200, description: 'Inspection completed successfully' })
  @ApiResponse({ status: 400, description: 'Cannot complete inspection' })
  @ApiResponse({ status: 404, description: 'Inspection not found' })
  async complete(
    @Param('id') id: string,
    @Body() completeDto: CompleteInspectionDto,
    @CurrentUser() user: any
  ) {
    return this.qcInspectionService.complete(id, completeDto, user.id);
  }
}