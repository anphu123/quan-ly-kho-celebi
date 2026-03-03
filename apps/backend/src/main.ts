import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGINS')?.split(',') || '*',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Swagger documentation
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

  const port = configService.get('APP_PORT', 6868);
  const host = configService.get('APP_HOST', '0.0.0.0');

  await app.listen(port, host);
  
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🏪 CELEBI Inventory & POS System                           ║
║                                                               ║
║   🚀 Server running at: http://localhost:${port}                ║
║   📚 API Documentation: http://localhost:${port}/api            ║
║   🔧 Environment: ${configService.get('NODE_ENV')}                              ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
