# CELEBI Monorepo

Monorepo cho hệ thống quản lý kho và bán hàng gồm:

- `apps/web`: frontend React + Vite
- `apps/backend`: backend NestJS + Prisma + MongoDB/GridFS
- `packages/*`: shared constants, types, utils

## Chạy local

```bash
pnpm install
cp .env.example .env
pnpm build
pnpm dev
```

## Build

```bash
pnpm build
```

Luồng build hiện tại:

- root `postinstall` sẽ generate Prisma Client cho backend
- backend `build` tự chạy `prebuild` để bảo đảm Prisma types luôn tồn tại
- Vercel dùng một lệnh duy nhất: `pnpm run build:vercel` tương đương `pnpm build`

## Deploy Vercel

`vercel.json` đã được cấu hình để:

- build frontend ra `apps/web/dist`
- build backend NestJS ra `apps/backend/dist`
- expose API qua `api/index.ts`
- rewrite `/api/v1/*` vào serverless handler của backend

## Ghi chú dọn repo

- `apps/backend/uploads` không còn là storage chính của hệ thống vì ảnh hiện được phục vụ qua GridFS
- `.vite`, `dist` và artifact tương tự đã được ignore khỏi Git
- thư mục lồng `quan-ly-kho-celebi` là repo riêng, hiện được loại khỏi upload Vercel để tránh làm phình deployment context
