import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import type { Express } from 'express';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { configureCommonApp } from './bootstrap/common-app';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const expressApp: Express = require('express')();
let cachedApp: Express | null = null;

export async function createServerlessHandler(): Promise<Express> {
  if (cachedApp) return cachedApp;

  const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    logger: ['error', 'warn'],
  });

  const configService = nestApp.get(ConfigService);
  configureCommonApp(nestApp, configService);

  await nestApp.init();
  cachedApp = expressApp;
  return cachedApp;
}
