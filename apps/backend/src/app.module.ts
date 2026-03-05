import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { SerialItemsModule } from './modules/serial-items/serial-items.module';
import { QCInspectionModule } from './modules/qc-inspection/qc-inspection.module';
import { InboundModule } from './modules/inbound/inbound.module';
import { AttributesModule } from './modules/attributes/attributes.module';
import { PosModule } from './modules/pos/pos.module';
import { SalesModule } from './modules/sales/sales.module';
import { OutboundModule } from './modules/outbound/outbound.module';
import { MasterdataModule } from './modules/masterdata/masterdata.module';
import { UploadModule } from './modules/upload/upload.module';

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
    AttributesModule, // ⭐ Custom Attributes (EAV)
    PosModule, // ⭐ Point of Sale
    SalesModule, // ⭐ Sales History and Orders
    OutboundModule, // ⭐ Outbound operations (Returns, Disposals)
    MasterdataModule, // ⭐ Core Master Data (Products, Customers, etc.)
    UploadModule, // ⭐ File uploads
  ],
})
export class AppModule { }
