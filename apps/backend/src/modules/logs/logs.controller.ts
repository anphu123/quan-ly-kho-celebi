import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { LogsService, LogType } from './logs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('logs')
@ApiBearerAuth()
@Controller('logs')
@UseGuards(JwtAuthGuard)
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy nhật ký hoạt động hệ thống' })
  @ApiQuery({ name: 'type', required: false, enum: ['ALL', 'SERIAL', 'STOCK', 'INBOUND'] })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'warehouseId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getLogs(
    @Query('type') type?: LogType,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.logsService.getLogs({ type, search, startDate, endDate, warehouseId, page: Number(page) || 1, limit: Number(limit) || 50 });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Thống kê hoạt động 24h gần nhất' })
  getStats() {
    return this.logsService.getLogStats();
  }
}
