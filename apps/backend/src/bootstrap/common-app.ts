import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import type { INestApplication } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';

export function configureCommonApp(app: INestApplication, configService: ConfigService) {
  app.setGlobalPrefix('api/v1');

  const corsOriginsStr = configService.get('CORS_ORIGINS', '*');
  const corsOrigin: boolean | string[] =
    corsOriginsStr === '*'
      ? true
      : corsOriginsStr.split(',').map((origin) => origin.trim());

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
}

export function setupSwagger(app: NestExpressApplication) {
  const config = new DocumentBuilder()
    .setTitle('CELEBI Inventory & POS API')
    .setDescription(`
## CELEBI Warehouse Management System

Hệ thống quản lý kho hàng điện tử cũ — Serial-based tracking, QC grading, Trade-in programs.

### Auth
Dùng JWT Bearer token. Lấy token qua \`POST /api/v1/auth/login\`.
    `)
    .setVersion('2.0')
    .addBearerAuth()
    // Identity & Auth
    .addTag('auth', 'Đăng nhập / đăng ký / refresh token')
    .addTag('users', 'Quản lý người dùng & phân quyền')
    // Master data
    .addTag('Categories', 'Danh mục sản phẩm')
    .addTag('Brands', 'Thương hiệu')
    .addTag('Product Templates', 'Mẫu sản phẩm (template)')
    .addTag('Suppliers', 'Nhà cung cấp')
    .addTag('Customers', 'Khách hàng')
    .addTag('Warehouses', 'Kho hàng')
    .addTag('attributes', 'Thuộc tính động (EAV)')
    // Operations
    .addTag('inbound', 'Nhập kho / Thu cũ')
    .addTag('serial-items', 'Quản lý serial / IMEI')
    .addTag('qc-inspections', 'Kiểm định QC')
    .addTag('stock', 'Tồn kho & xuất nhập')
    .addTag('outbound', 'Xuất kho')
    .addTag('trade-in-programs', 'Chương trình thu cũ')
    // Sales
    .addTag('pos', 'Bán hàng (POS)')
    .addTag('sales', 'Đơn hàng bán')
    // Utilities
    .addTag('uploads', 'Upload file / ảnh')
    .addTag('Inventory', 'Inventory helpers')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
}
