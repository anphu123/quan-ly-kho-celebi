import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: true,
  });

  // Increase body size limit for image uploads (50mb)
  app.use(require('express').json({ limit: '50mb' }));
  app.use(require('express').urlencoded({ limit: '50mb', extended: true }));

  // Serve uploaded files as static assets
  const uploadDir = join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadDir, { prefix: '/uploads' });

  const configService = app.get(ConfigService);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  const corsOriginsStr = configService.get('CORS_ORIGINS', '*');
  let corsOrigin: boolean | string | string[] = true; // true reflects the exact request origin which fixes the wildcard + credentials issue

  if (corsOriginsStr !== '*') {
    corsOrigin = corsOriginsStr.split(',').map(o => o.trim());
  }

  app.enableCors({
    origin: corsOrigin,
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

  // Get network addresses
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  const addresses: string[] = [];

  Object.values(networkInterfaces).forEach((interfaces: any) => {
    interfaces?.forEach((iface: any) => {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    });
  });

  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🏪 CELEBI Inventory & POS System                           ║
║                                                               ║
║   ➜  Local:   http://localhost:${port}                           ║
║   ➜  Network: ${addresses.map(ip => `http://${ip}:${port}`).join('\n║             ')}${addresses.length === 0 ? 'No network interface found' : ''}
║   📚 API Docs: http://localhost:${port}/api                       ║
║   🔧 Environment: ${configService.get('NODE_ENV')}                              ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
