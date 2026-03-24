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
    .setDescription('API Documentation for CELEBI Inventory Management System')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication & Authorization')
    .addTag('users', 'User Management')
    .addTag('products', 'Product Catalog')
    .addTag('inventory', 'Inventory Operations')
    .addTag('sales', 'Sales & POS')
    .addTag('purchasing', 'Purchasing & Goods Receipt')
    .addTag('finance', 'Finance & Accounting')
    .addTag('reports', 'Reports & Dashboard')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
}
