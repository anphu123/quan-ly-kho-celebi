import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';

// Import pre-compiled NestJS app (built by nest build before Vercel deploys)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { AppModule } = require('../apps/backend/dist/app.module');

const server = express();
let cachedApp: express.Express | null = null;

async function getApp(): Promise<express.Express> {
  if (cachedApp) return cachedApp;

  const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(server), {
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
  cachedApp = server;
  return cachedApp;
}

export default async function handler(req: express.Request, res: express.Response) {
  const app = await getApp();
  app(req, res);
}
