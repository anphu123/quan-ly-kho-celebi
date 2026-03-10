import { Module } from '@nestjs/common';
import { SerialItemsController } from './serial-items.controller';
import { SerialItemsService } from './serial-items.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { StockModule } from '../stock/stock.module';

@Module({
  imports: [PrismaModule, StockModule],
  controllers: [SerialItemsController],
  providers: [SerialItemsService],
  exports: [SerialItemsService],
})
export class SerialItemsModule {}