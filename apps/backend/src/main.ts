import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { readFileSync, existsSync } from 'fs';
import { AppModule } from './app.module';
import { configureCommonApp, setupSwagger } from './bootstrap/common-app';

const loadEnvFile = (filePath: string) => {
  if (!existsSync(filePath)) return;
  try {
    const content = readFileSync(filePath, 'utf-8');
    content.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const idx = trimmed.indexOf('=');
      if (idx === -1) return;
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('\"') && val.endsWith('\"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    });
  } catch {
    // ignore
  }
};

async function bootstrap() {
  const envPath = process.env.ENV_PATH || join(process.cwd(), '.env');
  loadEnvFile(envPath);

  const httpsKeyPath = process.env.HTTPS_KEY_PATH;
  const httpsCertPath = process.env.HTTPS_CERT_PATH;

  const httpsOptions = httpsKeyPath && httpsCertPath && existsSync(httpsKeyPath) && existsSync(httpsCertPath)
    ? {
      key: readFileSync(httpsKeyPath),
      cert: readFileSync(httpsCertPath),
    }
    : undefined;

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: true,
    httpsOptions,
  });

  // Increase body size limit for image uploads (50mb)
  app.use(require('express').json({ limit: '50mb' }));
  app.use(require('express').urlencoded({ limit: '50mb', extended: true }));

  const configService = app.get(ConfigService);

  if (!httpsOptions) {
    if (!httpsKeyPath || !httpsCertPath) {
      console.warn('[HTTPS] Disabled: set HTTPS_KEY_PATH and HTTPS_CERT_PATH to enable HTTPS.');
    } else {
      console.warn('[HTTPS] Disabled: key/cert file not found. Check HTTPS_KEY_PATH and HTTPS_CERT_PATH.');
    }
  }

  configureCommonApp(app, configService);
  setupSwagger(app);

  // Render.com provides PORT, fallback to APP_PORT, then default
  const port = configService.get('PORT') || configService.get('APP_PORT', 6868);
  const host = configService.get('APP_HOST', '0.0.0.0');

  await app.listen(port, host);

  const proto = httpsOptions ? 'https' : 'http';

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
║   ➜  Local:   ${proto}://localhost:${port}                           ║
║   ➜  Network: ${addresses.map(ip => `${proto}://${ip}:${port}`).join('\n║             ')}${addresses.length === 0 ? 'No network interface found' : ''}
║   📚 API Docs: ${proto}://localhost:${port}/api                       ║
║   🔧 Environment: ${configService.get('NODE_ENV')}                              ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
