import { Module } from '@nestjs/common';
import { TradeInProgramsController } from './trade-in-programs.controller';
import { TradeInProgramsService } from './trade-in-programs.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TradeInProgramsController],
  providers: [TradeInProgramsService],
  exports: [TradeInProgramsService],
})
export class TradeInProgramsModule {}
