import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { SerialItemsModule } from './modules/serial-items/serial-items.module';
import { QCInspectionModule } from './modules/qc-inspection/qc-inspection.module';
import { InboundModule } from './modules/inbound/inbound.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 100, // 100 requests per 60s
      },
    ]),

    // Database
    PrismaModule,

    // Feature modules  
    AuthModule,
    SerialItemsModule, // ⭐ Serial-based inventory tracking
    QCInspectionModule, // ⭐ Quality control workflow
    InboundModule, // ⭐ Receiving & inbound operations
  ],
})
export class AppModule {}
