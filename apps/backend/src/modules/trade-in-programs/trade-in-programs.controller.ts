import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TradeInProgramsService } from './trade-in-programs.service';
import { CreateTradeInProgramDto, UpdateTradeInProgramDto } from './dto/trade-in-program.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('trade-in-programs')
@ApiBearerAuth()
@Controller('trade-in-programs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TradeInProgramsController {
  constructor(private readonly service: TradeInProgramsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  create(@Body() dto: CreateTradeInProgramDto, @Request() req: any) {
    return this.service.create(dto, req.user?.id);
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateTradeInProgramDto) {
    console.log("UPDATE DTO:", dto); return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
