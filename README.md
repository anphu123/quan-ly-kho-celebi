# 🏪 CELEBI - Hệ thống Quản lý Xuất - Nhập - Tồn & Bán hàng

> **Version:** 1.0.0  
> **Date:** March 2, 2026

## 📋 Tổng quan

Hệ thống quản lý kho hàng và POS (Point of Sale) toàn diện cho doanh nghiệp bán lẻ, hỗ trợ:

- ✅ Quản lý tồn kho real-time với Moving Average Cost (MAC)
- ✅ POS bán hàng tối ưu cho thu ngân
- ✅ Quản lý mua hàng & nhập kho với phân bổ chi phí
- ✅ Sổ quỹ & công nợ khách hàng/nhà cung cấp
- ✅ Báo cáo doanh thu, lợi nhuận, xuất-nhập-tồn
- ✅ Phân quyền RBAC: Super Admin, Quản lý Kho, Thu ngân, Kế toán
- ✅ Mobile app (Flutter) cho quản lý xem báo cáo realtime

## 🏗️ Kiến trúc

**Modular Monolith** với NestJS, sẵn sàng tách microservices khi scale.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Web App   │────▶│   Backend   │────▶│ PostgreSQL  │
│   (React)   │     │  (NestJS)   │     │   + Redis   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    ▼             ▼
              ┌──────────┐  ┌──────────┐
              │ Mobile   │  │  MinIO   │
              │(Flutter) │  │  (S3)    │
              └──────────┘  └──────────┘
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | NestJS + TypeScript + Prisma ORM |
| **Database** | PostgreSQL 16 |
| **Cache/Queue** | Redis + BullMQ |
| **Frontend** | React 19 + Vite + TailwindCSS + shadcn/ui |
| **Mobile** | Flutter + Dart |
| **Real-time** | Socket.IO |
| **Monorepo** | Turborepo + pnpm |

## 📁 Cấu trúc Project

```
quan_ly_kho_celebi/
├── apps/
│   ├── backend/        # NestJS API
│   └── web/            # React Web App
├── packages/
│   ├── shared-types/   # TypeScript types
│   ├── shared-utils/   # Utility functions
│   └── shared-constants/ # Constants
├── docs/               # Documentation
├── docker/             # Docker configs
└── scripts/            # Utility scripts
```

## 🚀 Bắt đầu

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 8.0.0
- Docker & Docker Compose
- PostgreSQL 16 (hoặc dùng Docker)

### Installation

```bash
# Clone repo
git clone <repo-url>
cd quan_ly_kho_celebi

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env

# Start Docker services (PostgreSQL, Redis, MinIO)
docker-compose up -d

# Run database migrations
pnpm db:migrate

# Seed initial data
pnpm db:seed

# Start development servers
pnpm dev
```

### Development URLs

- **Backend API:** http://localhost:6868
- **API Docs (Swagger):** http://localhost:6868/api
- **Web App:** http://localhost:5173
- **Prisma Studio:** http://localhost:5555 (run `pnpm db:studio`)
- **MinIO Console:** http://localhost:9001

## 📖 Documentation

- [System Analysis & Design](docs/SYSTEM_ANALYSIS.md) - Phân tích hệ thống chi tiết
- [API Documentation](docs/API_DOCS.md) - API endpoints reference
- [Database Schema](docs/DATABASE_SCHEMA.md) - Database design

## 🔐 User Roles

| Role | Permissions |
|------|-------------|
| **Super Admin** | Toàn quyền hệ thống + xem lợi nhuận |
| **Inventory Manager** | Quản lý kho, nhập xuất, kiểm kê |
| **Cashier** | POS bán hàng, in hóa đơn |
| **Accountant** | Sổ quỹ, công nợ, báo cáo tài chính |

## 📝 License

MIT

## 👥 Team

**Celebi Development Team**

---

> **Status:** 🚧 In Development - Phase 1 (Foundation)
