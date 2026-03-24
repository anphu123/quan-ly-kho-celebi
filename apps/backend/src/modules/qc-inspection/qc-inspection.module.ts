import { Module } from '@nestjs/common';
import { QCInspectionController } from './qc-inspection.controller';
import { QCInspectionService } from './qc-inspection.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [QCInspectionController],
  providers: [QCInspectionService],
  exports: [QCInspectionService], // Export for use in other modules
})
export class QCInspectionModule {}