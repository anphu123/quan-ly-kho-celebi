import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OutboundService } from './outbound.service';
import { CreateOutboundDto } from './dto/outbound.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('outbound')
@Controller('outbound')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OutboundController {
    constructor(private readonly outboundService: OutboundService) { }

    @Post()
    @ApiOperation({ summary: 'Create an outbound transaction (Return, Disposal, Transfer)' })
    async createOutbound(
        @Body() dto: CreateOutboundDto,
        @CurrentUser() user: any
    ) {
        return this.outboundService.createOutbound(dto, user.id);
    }

    @Get('recent')
    @ApiOperation({ summary: 'Get recent outbound transactions' })
    async getRecentOutbounds() {
        return this.outboundService.getRecentOutbounds();
    }
}
