import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import type { Express } from 'express';
import { AppModule } from './app.module';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const expressApp: Express = require('express')();
let cachedApp: Express | null = null;

export async function createServerlessHandler(): Promise<Express> {
  if (cachedApp) return cachedApp;

  const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    logger: ['error', 'warn'],
  });

  nestApp.setGlobalPrefix('api/v1');

  const corsOriginsStr = process.env.CORS_ORIGINS || '*';
  nestApp.enableCors({
    origin: corsOriginsStr === '*' ? true : corsOriginsStr.split(',').map((o) => o.trim()),
    credentials: true,
  });

  nestApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await nestApp.init();
  cachedApp = expressApp;
  return cachedApp;
}
