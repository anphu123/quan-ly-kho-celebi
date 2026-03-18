import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { mongoConfig } from './config/mongodb.config';
import { AuthModule } from './modules/auth/auth.module';
import { SerialItemsModule } from './modules/serial-items/serial-items.module';
import { QCInspectionModule } from './modules/qc-inspection/qc-inspection.module';
import { InboundModule } from './modules/inbound/inbound.module';
import { MasterdataModule } from './modules/masterdata/masterdata.module';
import { StockModule } from './modules/stock/stock.module';
import { UploadModule } from './modules/upload/upload.module';
import { AttributesModule } from './modules/attributes/attributes.module';
import { OutboundModule } from './modules/outbound/outbound.module';

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
    MongooseModule.forRoot(mongoConfig.getUri(), mongoConfig.options),
    PrismaModule,

    // Feature modules  
    AuthModule,
    SerialItemsModule, // ⭐ Serial-based inventory tracking
    QCInspectionModule, // ⭐ Quality control workflow
    InboundModule, // ⭐ Receiving & inbound operations
    MasterdataModule, // ⭐ Core Master Data (Categories, Brands, Products)
    StockModule, // ⭐ Stock Level & Movement Tracking
    UploadModule, // ⭐ File uploads
    AttributesModule, // ⭐ EAV Attribute Groups & Attributes
    OutboundModule,   // ⭐ Outbound / Sales operations
  ],
})
export class AppModule { }
