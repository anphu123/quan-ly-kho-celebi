# PHÂN TÍCH & THIẾT KẾ HỆ THỐNG: QUẢN LÝ XUẤT - NHẬP - TỒN & BÁN HÀNG (CELEBI)

> **Ngày tạo:** 02/03/2026  
> **Phiên bản:** 1.0  
> **Dự án:** quan_ly_kho_celebi

---

## MỤC LỤC

1. [Phân tích yêu cầu](#1-phân-tích-yêu-cầu)
2. [Kiến trúc hệ thống](#2-kiến-trúc-hệ-thống)
3. [Lựa chọn công nghệ](#3-lựa-chọn-công-nghệ)
4. [Cấu trúc Source Code](#4-cấu-trúc-source-code)
5. [Thiết kế Database Schema](#5-thiết-kế-database-schema)
6. [API Design](#6-api-design)
7. [Xử lý nghiệp vụ phức tạp](#7-xử-lý-nghiệp-vụ-phức-tạp)
8. [Kế hoạch triển khai (Roadmap)](#8-kế-hoạch-triển-khai-roadmap)
9. [Deployment & DevOps](#9-deployment--devops)

---

## 1. PHÂN TÍCH YÊU CẦU

### 1.1 Phân rã Module hệ thống

```
┌─────────────────────────────────────────────────────────────────┐
│                    CELEBI INVENTORY & POS                       │
├─────────┬──────────┬──────────┬──────────┬──────────┬──────────┤
│  AUTH   │  MASTER  │ INBOUND  │ OUTBOUND │INVENTORY │ FINANCE  │
│ & RBAC  │  DATA    │ (Mua/    │ (Bán/    │   OPS    │ (Sổ quỹ │
│         │          │  Nhập)   │  Xuất)   │          │  Công nợ)│
├─────────┴──────────┴──────────┴──────────┴──────────┴──────────┤
│                    REPORTS & DASHBOARD                          │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Ma trận phân quyền (RBAC Matrix)

| Chức năng               | Super Admin | QL Kho | Thu ngân | Kế toán |
|--------------------------|:-----------:|:------:|:--------:|:-------:|
| Cấu hình hệ thống       | ✅          | ❌     | ❌       | ❌      |
| Quản lý người dùng       | ✅          | ❌     | ❌       | ❌      |
| Danh mục hàng hóa (CRUD) | ✅          | ✅     | 👁 (Xem) | 👁      |
| Giá vốn (xem/sửa)       | ✅          | ❌     | ❌       | ✅      |
| Giá bán (xem/sửa)       | ✅          | ✅     | 👁       | 👁      |
| Tạo PO (Đơn nhập hàng)  | ✅          | ✅     | ❌       | 👁      |
| Phiếu nhập kho           | ✅          | ✅     | ❌       | 👁      |
| POS Bán hàng             | ✅          | ❌     | ✅       | ❌      |
| Trả hàng (Return)        | ✅          | ✅     | ✅*      | 👁      |
| Kiểm kê kho              | ✅          | ✅     | ❌       | ❌      |
| Chuyển kho                | ✅          | ✅     | ❌       | ❌      |
| Thẻ kho / Lịch sử        | ✅          | ✅     | 👁       | 👁      |
| Sổ quỹ thu/chi           | ✅          | ❌     | ❌       | ✅      |
| Công nợ KH (AR)          | ✅          | ❌     | 👁       | ✅      |
| Công nợ NCC (AP)         | ✅          | ❌     | ❌       | ✅      |
| BC Doanh thu & Lợi nhuận | ✅          | ❌     | ❌       | ✅      |
| BC Tồn kho               | ✅          | ✅     | 👁       | 👁      |
| BC Xuất Nhập Tồn         | ✅          | ✅     | ❌       | ✅      |
| Dashboard tổng quan      | ✅          | ✅*    | ❌       | ✅*     |

> `✅` = Toàn quyền, `👁` = Chỉ xem, `❌` = Không truy cập, `*` = Hạn chế

### 1.3 Phân tích Domain & Bounded Context (DDD)

```
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│   IDENTITY BC    │   │   CATALOG BC     │   │  PURCHASING BC   │
│                  │   │                  │   │                  │
│ - User           │   │ - Product        │   │ - PurchaseOrder  │
│ - Role           │   │ - Category       │   │ - GoodsReceipt   │
│ - Permission     │   │ - Brand          │   │ - CostAllocation │
│ - Session        │   │ - UnitOfMeasure  │   │ - Supplier       │
│                  │   │ - PriceList      │   │                  │
│                  │   │ - Barcode        │   │                  │
└──────────────────┘   └──────────────────┘   └──────────────────┘

┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│    SALES BC      │   │  INVENTORY BC    │   │   FINANCE BC     │
│                  │   │                  │   │                  │
│ - SalesOrder     │   │ - Warehouse      │   │ - CashBook       │
│ - SalesReturn    │   │ - StockLevel     │   │ - CashEntry      │
│ - POSSession     │   │ - StockMovement  │   │ - AccountRecv    │
│ - Invoice        │   │ - Stocktake      │   │ - AccountPay     │
│ - Payment        │   │ - Adjustment     │   │ - PaymentRecord  │
│ - Customer       │   │ - Transfer       │   │                  │
│ - Discount       │   │ - StockLedger    │   │                  │
└──────────────────┘   └──────────────────┘   └──────────────────┘
```

---

## 2. KIẾN TRÚC HỆ THỐNG

### 2.1 Architecture Pattern: **Modular Monolith → Microservices-ready**

Lý do chọn Modular Monolith thay vì Microservices ngay từ đầu:
- **Đội nhỏ** (1-3 devs giai đoạn đầu) → Monolith dễ phát triển, deploy, debug
- **Tách module rõ ràng** → Có thể tách thành Microservices khi scale
- **Single database** ban đầu → Đảm bảo data consistency cho nghiệp vụ tài chính
- **Lower operational cost** → Không cần Kubernetes, service mesh từ đầu

### 2.2 System Architecture Diagram

```
                    ┌─────────────────────────────────────┐
                    │           CLIENTS                    │
                    │                                      │
                    │  ┌──────────┐    ┌────────────────┐ │
                    │  │ Web App  │    │  Mobile App    │ │
                    │  │ (React)  │    │   (Flutter)    │ │
                    │  └────┬─────┘    └───────┬────────┘ │
                    └───────┼──────────────────┼──────────┘
                            │                  │
                            ▼                  ▼
                    ┌──────────────────────────────────────┐
                    │          NGINX / Reverse Proxy        │
                    │      (Load Balancer + SSL + Static)   │
                    └──────────────┬───────────────────────┘
                                   │
                    ┌──────────────▼───────────────────────┐
                    │        API GATEWAY / BACKEND          │
                    │           (NestJS - Node.js)          │
                    │                                       │
                    │  ┌─────────┐ ┌──────────┐ ┌────────┐│
                    │  │  Auth   │ │ Catalog  │ │Purchase││
                    │  │ Module  │ │  Module  │ │ Module ││
                    │  └─────────┘ └──────────┘ └────────┘│
                    │  ┌─────────┐ ┌──────────┐ ┌────────┐│
                    │  │  Sales  │ │Inventory │ │Finance ││
                    │  │ Module  │ │  Module  │ │ Module ││
                    │  └─────────┘ └──────────┘ └────────┘│
                    │  ┌─────────┐ ┌──────────┐           │
                    │  │ Report  │ │  Print   │           │
                    │  │ Module  │ │  Module  │           │
                    │  └─────────┘ └──────────┘           │
                    └──┬────────┬──────────┬──────────────┘
                       │        │          │
              ┌────────▼─┐  ┌──▼────┐  ┌──▼──────────┐
              │PostgreSQL │  │ Redis │  │ MinIO/S3    │
              │(Primary   │  │Cache +│  │(File/Image  │
              │ Database) │  │Queue  │  │  Storage)   │
              └───────────┘  └───────┘  └─────────────┘
```

### 2.3 Communication Flow

```
┌──────────┐     REST API      ┌──────────────┐
│  Client  │ ◄──────────────► │   Backend    │
│ (Web/    │                   │   (NestJS)   │
│  Mobile) │ ◄─ WebSocket ──► │              │
└──────────┘   (Real-time      └──────┬───────┘
                inventory)            │
                                      │ Prisma ORM
                               ┌──────▼───────┐
                               │  PostgreSQL   │
                               └──────────────┘
```

---

## 3. LỰA CHỌN CÔNG NGHỆ

### 3.1 Tech Stack Overview

| Layer              | Technology                | Lý do chọn                                                |
|--------------------|---------------------------|------------------------------------------------------------|
| **Backend**        | NestJS (Node.js + TS)     | Modular, DI, Guards/Interceptors phù hợp RBAC, TypeScript |
| **Frontend Web**   | React 19 + Vite + TS      | Component-based, ecosystem lớn, SSR-ready                  |
| **UI Framework**   | TailwindCSS + shadcn/ui   | Rapid UI, accessible, customizable                         |
| **Mobile**         | Flutter (Dart)            | Native performance, camera (scan barcode), offline-first, rich UI widgets |
| **Database**       | PostgreSQL 16             | ACID, JSON support, Window Functions cho báo cáo           |
| **ORM**            | Prisma                    | Type-safe, migration, schema-first                         |
| **Cache**          | Redis                     | Inventory cache, session, rate limiting                    |
| **Queue**          | BullMQ (Redis-based)      | Background jobs: báo cáo, email, sync                      |
| **Auth**           | JWT (Access + Refresh)    | Stateless, phù hợp REST API                               |
| **Real-time**      | Socket.IO                 | Inventory updates, POS notifications                       |
| **Barcode**        | JsBarcode + QuaggaJS      | Generate + Scan barcodes                                   |
| **Print**          | ESC/POS + node-thermal-printer | In hóa đơn nhiệt 58mm/80mm                          |
| **File Storage**   | MinIO (Self-hosted S3)    | Lưu ảnh SP, file xuất báo cáo                             |
| **Validation**     | Zod + class-validator     | Schema validation cả FE lẫn BE                            |
| **State Mgmt**     | Zustand + TanStack Query  | Lightweight state, server-state caching                    |
| **Testing**        | Vitest + Playwright       | Unit + E2E testing                                         |
| **Monorepo**       | Turborepo + pnpm          | Share packages giữa web/backend (Flutter riêng workspace)  |
| **API Docs**       | Swagger (via NestJS)      | Auto-generated API documentation                           |

### 3.2 Tại sao KHÔNG chọn các alternatives?

| Không chọn       | Lý do                                                              |
|------------------|--------------------------------------------------------------------|
| Django/Flask     | Python chậm hơn Node cho real-time; không match React Native stack |
| Spring Boot      | Overkill cho team nhỏ, thời gian phát triển lâu hơn               |
| Next.js Fullstack| Không phù hợp cho API-first design, khó tách mobile               |
| MongoDB          | Dữ liệu tài chính cần ACID, quan hệ phức tạp → SQL phù hợp hơn  |
| GraphQL          | Over-engineering cho CRUD-heavy app, REST đủ tốt                   |
| React Native     | Performance kém hơn Flutter, bridge overhead, UI không mượt bằng  |

---

## 4. CẤU TRÚC SOURCE CODE

### 4.1 Monorepo Structure

```
quan_ly_kho_celebi/
├── docs/                           # Tài liệu dự án
│   ├── SYSTEM_ANALYSIS.md
│   ├── API_DOCS.md
│   └── DATABASE_SCHEMA.md
│
├── packages/                       # Shared packages
│   ├── shared-types/               # TypeScript types dùng chung
│   │   ├── src/
│   │   │   ├── auth.types.ts
│   │   │   ├── product.types.ts
│   │   │   ├── inventory.types.ts
│   │   │   ├── sales.types.ts
│   │   │   ├── finance.types.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── shared-utils/               # Utility functions dùng chung
│   │   ├── src/
│   │   │   ├── currency.ts         # Format tiền VND
│   │   │   ├── barcode.ts          # Barcode generation logic
│   │   │   ├── date.ts             # Date helpers
│   │   │   ├── validators.ts       # Zod schemas dùng chung
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── shared-constants/           # Hằng số dùng chung
│       ├── src/
│       │   ├── roles.ts            # Role definitions
│       │   ├── permissions.ts      # Permission matrix
│       │   ├── payment-methods.ts
│       │   ├── stock-movement-types.ts
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── apps/
│   ├── backend/                    # ===== NESTJS BACKEND =====
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   │
│   │   │   ├── common/             # Cross-cutting concerns
│   │   │   │   ├── decorators/
│   │   │   │   │   ├── roles.decorator.ts
│   │   │   │   │   ├── current-user.decorator.ts
│   │   │   │   │   └── permissions.decorator.ts
│   │   │   │   ├── guards/
│   │   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   │   ├── roles.guard.ts
│   │   │   │   │   └── permissions.guard.ts
│   │   │   │   ├── interceptors/
│   │   │   │   │   ├── transform.interceptor.ts
│   │   │   │   │   ├── logging.interceptor.ts
│   │   │   │   │   └── timeout.interceptor.ts
│   │   │   │   ├── filters/
│   │   │   │   │   ├── http-exception.filter.ts
│   │   │   │   │   └── prisma-exception.filter.ts
│   │   │   │   ├── pipes/
│   │   │   │   │   └── validation.pipe.ts
│   │   │   │   └── middleware/
│   │   │   │       ├── correlation-id.middleware.ts
│   │   │   │       └── rate-limit.middleware.ts
│   │   │   │
│   │   │   ├── config/
│   │   │   │   ├── app.config.ts
│   │   │   │   ├── database.config.ts
│   │   │   │   ├── redis.config.ts
│   │   │   │   ├── jwt.config.ts
│   │   │   │   └── print.config.ts
│   │   │   │
│   │   │   ├── prisma/
│   │   │   │   ├── prisma.module.ts
│   │   │   │   ├── prisma.service.ts
│   │   │   │   └── migrations/
│   │   │   │
│   │   │   ├── modules/
│   │   │   │   │
│   │   │   │   ├── auth/            # ── Authentication & Authorization
│   │   │   │   │   ├── auth.module.ts
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── strategies/
│   │   │   │   │   │   ├── jwt.strategy.ts
│   │   │   │   │   │   └── refresh-token.strategy.ts
│   │   │   │   │   └── dto/
│   │   │   │   │       ├── login.dto.ts
│   │   │   │   │       ├── register.dto.ts
│   │   │   │   │       └── refresh-token.dto.ts
│   │   │   │   │
│   │   │   │   ├── users/           # ── User Management
│   │   │   │   │   ├── users.module.ts
│   │   │   │   │   ├── users.controller.ts
│   │   │   │   │   ├── users.service.ts
│   │   │   │   │   └── dto/
│   │   │   │   │       ├── create-user.dto.ts
│   │   │   │   │       └── update-user.dto.ts
│   │   │   │   │
│   │   │   │   ├── catalog/         # ── Master Data: Sản phẩm, Danh mục
│   │   │   │   │   ├── catalog.module.ts
│   │   │   │   │   ├── controllers/
│   │   │   │   │   │   ├── products.controller.ts
│   │   │   │   │   │   ├── categories.controller.ts
│   │   │   │   │   │   ├── brands.controller.ts
│   │   │   │   │   │   └── units.controller.ts
│   │   │   │   │   ├── services/
│   │   │   │   │   │   ├── products.service.ts
│   │   │   │   │   │   ├── categories.service.ts
│   │   │   │   │   │   ├── brands.service.ts
│   │   │   │   │   │   ├── units.service.ts
│   │   │   │   │   │   ├── price-list.service.ts
│   │   │   │   │   │   └── barcode.service.ts
│   │   │   │   │   └── dto/
│   │   │   │   │       ├── create-product.dto.ts
│   │   │   │   │       ├── update-product.dto.ts
│   │   │   │   │       ├── product-filter.dto.ts
│   │   │   │   │       └── unit-conversion.dto.ts
│   │   │   │   │
│   │   │   │   ├── partners/        # ── Khách hàng & Nhà cung cấp
│   │   │   │   │   ├── partners.module.ts
│   │   │   │   │   ├── controllers/
│   │   │   │   │   │   ├── customers.controller.ts
│   │   │   │   │   │   └── suppliers.controller.ts
│   │   │   │   │   ├── services/
│   │   │   │   │   │   ├── customers.service.ts
│   │   │   │   │   │   └── suppliers.service.ts
│   │   │   │   │   └── dto/
│   │   │   │   │
│   │   │   │   ├── purchasing/      # ── Mua hàng & Nhập kho
│   │   │   │   │   ├── purchasing.module.ts
│   │   │   │   │   ├── controllers/
│   │   │   │   │   │   ├── purchase-orders.controller.ts
│   │   │   │   │   │   └── goods-receipts.controller.ts
│   │   │   │   │   ├── services/
│   │   │   │   │   │   ├── purchase-orders.service.ts
│   │   │   │   │   │   ├── goods-receipts.service.ts
│   │   │   │   │   │   └── cost-allocation.service.ts
│   │   │   │   │   └── dto/
│   │   │   │   │
│   │   │   │   ├── sales/           # ── Bán hàng & POS
│   │   │   │   │   ├── sales.module.ts
│   │   │   │   │   ├── controllers/
│   │   │   │   │   │   ├── pos.controller.ts
│   │   │   │   │   │   ├── sales-orders.controller.ts
│   │   │   │   │   │   └── sales-returns.controller.ts
│   │   │   │   │   ├── services/
│   │   │   │   │   │   ├── pos.service.ts
│   │   │   │   │   │   ├── sales-orders.service.ts
│   │   │   │   │   │   ├── sales-returns.service.ts
│   │   │   │   │   │   ├── discount.service.ts
│   │   │   │   │   │   └── payment.service.ts
│   │   │   │   │   ├── gateways/
│   │   │   │   │   │   └── pos.gateway.ts   # WebSocket cho POS
│   │   │   │   │   └── dto/
│   │   │   │   │
│   │   │   │   ├── inventory/       # ── Quản lý Kho
│   │   │   │   │   ├── inventory.module.ts
│   │   │   │   │   ├── controllers/
│   │   │   │   │   │   ├── stock.controller.ts
│   │   │   │   │   │   ├── stocktake.controller.ts
│   │   │   │   │   │   ├── adjustments.controller.ts
│   │   │   │   │   │   ├── transfers.controller.ts
│   │   │   │   │   │   └── warehouses.controller.ts
│   │   │   │   │   ├── services/
│   │   │   │   │   │   ├── stock.service.ts          # Core: Trừ/Cộng tồn
│   │   │   │   │   │   ├── stock-ledger.service.ts   # Thẻ kho
│   │   │   │   │   │   ├── stocktake.service.ts      # Kiểm kê
│   │   │   │   │   │   ├── adjustments.service.ts    # Điều chỉnh
│   │   │   │   │   │   ├── transfers.service.ts      # Chuyển kho
│   │   │   │   │   │   ├── warehouses.service.ts
│   │   │   │   │   │   └── costing.service.ts        # MAC/FIFO
│   │   │   │   │   └── dto/
│   │   │   │   │
│   │   │   │   ├── finance/         # ── Sổ quỹ & Công nợ
│   │   │   │   │   ├── finance.module.ts
│   │   │   │   │   ├── controllers/
│   │   │   │   │   │   ├── cash-book.controller.ts
│   │   │   │   │   │   ├── accounts-receivable.controller.ts
│   │   │   │   │   │   └── accounts-payable.controller.ts
│   │   │   │   │   ├── services/
│   │   │   │   │   │   ├── cash-book.service.ts
│   │   │   │   │   │   ├── accounts-receivable.service.ts
│   │   │   │   │   │   └── accounts-payable.service.ts
│   │   │   │   │   └── dto/
│   │   │   │   │
│   │   │   │   ├── reports/         # ── Báo cáo & Dashboard
│   │   │   │   │   ├── reports.module.ts
│   │   │   │   │   ├── controllers/
│   │   │   │   │   │   ├── sales-reports.controller.ts
│   │   │   │   │   │   ├── inventory-reports.controller.ts
│   │   │   │   │   │   ├── finance-reports.controller.ts
│   │   │   │   │   │   └── dashboard.controller.ts
│   │   │   │   │   ├── services/
│   │   │   │   │   │   ├── sales-reports.service.ts
│   │   │   │   │   │   ├── inventory-reports.service.ts
│   │   │   │   │   │   ├── xnt-report.service.ts     # Xuất-Nhập-Tồn
│   │   │   │   │   │   ├── finance-reports.service.ts
│   │   │   │   │   │   └── dashboard.service.ts
│   │   │   │   │   └── dto/
│   │   │   │   │
│   │   │   │   └── printing/       # ── In ấn (Bill, Barcode Label)
│   │   │   │       ├── printing.module.ts
│   │   │   │       ├── printing.controller.ts
│   │   │   │       ├── services/
│   │   │   │       │   ├── thermal-printer.service.ts
│   │   │   │       │   └── barcode-label.service.ts
│   │   │   │       └── templates/
│   │   │   │           ├── invoice.template.ts
│   │   │   │           └── barcode-label.template.ts
│   │   │   │
│   │   │   └── jobs/               # Background jobs (BullMQ)
│   │   │       ├── report-generation.job.ts
│   │   │       ├── stock-alert.job.ts
│   │   │       └── data-cleanup.job.ts
│   │   │
│   │   ├── prisma/
│   │   │   └── schema.prisma       # Database schema
│   │   ├── test/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── .env.example
│   │
│   ├── web/                        # ===== REACT WEB APP =====
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── App.tsx
│   │   │   ├── routes/
│   │   │   │   ├── index.tsx           # Route definitions
│   │   │   │   ├── auth.routes.tsx
│   │   │   │   ├── admin.routes.tsx
│   │   │   │   └── pos.routes.tsx
│   │   │   │
│   │   │   ├── layouts/
│   │   │   │   ├── AdminLayout.tsx     # Layout cho Admin/Kế toán
│   │   │   │   ├── POSLayout.tsx       # Layout cho thu ngân (full-screen)
│   │   │   │   └── AuthLayout.tsx
│   │   │   │
│   │   │   ├── pages/
│   │   │   │   ├── auth/
│   │   │   │   │   └── LoginPage.tsx
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── DashboardPage.tsx
│   │   │   │   ├── catalog/
│   │   │   │   │   ├── ProductsPage.tsx
│   │   │   │   │   ├── ProductDetailPage.tsx
│   │   │   │   │   ├── CategoriesPage.tsx
│   │   │   │   │   └── BrandsPage.tsx
│   │   │   │   ├── partners/
│   │   │   │   │   ├── CustomersPage.tsx
│   │   │   │   │   └── SuppliersPage.tsx
│   │   │   │   ├── purchasing/
│   │   │   │   │   ├── PurchaseOrdersPage.tsx
│   │   │   │   │   ├── PurchaseOrderDetailPage.tsx
│   │   │   │   │   └── GoodsReceiptsPage.tsx
│   │   │   │   ├── pos/
│   │   │   │   │   └── POSPage.tsx          # ⭐ Màn hình POS chính
│   │   │   │   ├── inventory/
│   │   │   │   │   ├── StockOverviewPage.tsx
│   │   │   │   │   ├── StocktakePage.tsx
│   │   │   │   │   ├── StockLedgerPage.tsx
│   │   │   │   │   └── TransfersPage.tsx
│   │   │   │   ├── finance/
│   │   │   │   │   ├── CashBookPage.tsx
│   │   │   │   │   ├── AccountsReceivablePage.tsx
│   │   │   │   │   └── AccountsPayablePage.tsx
│   │   │   │   ├── reports/
│   │   │   │   │   ├── SalesReportPage.tsx
│   │   │   │   │   ├── InventoryReportPage.tsx
│   │   │   │   │   └── XNTReportPage.tsx
│   │   │   │   └── settings/
│   │   │   │       ├── UsersPage.tsx
│   │   │   │       ├── RolesPage.tsx
│   │   │   │       └── SystemSettingsPage.tsx
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── ui/                 # shadcn/ui components
│   │   │   │   │   ├── button.tsx
│   │   │   │   │   ├── input.tsx
│   │   │   │   │   ├── table.tsx
│   │   │   │   │   ├── dialog.tsx
│   │   │   │   │   ├── select.tsx
│   │   │   │   │   ├── toast.tsx
│   │   │   │   │   └── ...
│   │   │   │   ├── common/
│   │   │   │   │   ├── DataTable.tsx       # Reusable data table
│   │   │   │   │   ├── SearchInput.tsx
│   │   │   │   │   ├── StatusBadge.tsx
│   │   │   │   │   ├── MoneyDisplay.tsx    # Format VND
│   │   │   │   │   ├── DateRangePicker.tsx
│   │   │   │   │   ├── ConfirmDialog.tsx
│   │   │   │   │   └── LoadingSpinner.tsx
│   │   │   │   ├── pos/
│   │   │   │   │   ├── ProductGrid.tsx     # Grid sản phẩm (POS)
│   │   │   │   │   ├── CartPanel.tsx       # Giỏ hàng
│   │   │   │   │   ├── PaymentDialog.tsx   # Dialog thanh toán
│   │   │   │   │   ├── BarcodeScanner.tsx  # Scanner component
│   │   │   │   │   ├── CustomerSearch.tsx
│   │   │   │   │   └── DiscountInput.tsx
│   │   │   │   ├── inventory/
│   │   │   │   │   ├── StockCard.tsx
│   │   │   │   │   ├── StockAlertBanner.tsx
│   │   │   │   │   └── MovementTimeline.tsx
│   │   │   │   └── charts/
│   │   │   │       ├── RevenueChart.tsx
│   │   │   │       ├── TopProductsChart.tsx
│   │   │   │       └── StockValueChart.tsx
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── usePermission.ts
│   │   │   │   ├── useProducts.ts
│   │   │   │   ├── useCart.ts
│   │   │   │   ├── useBarcode.ts
│   │   │   │   ├── useInventory.ts
│   │   │   │   ├── usePrint.ts
│   │   │   │   └── useWebSocket.ts
│   │   │   │
│   │   │   ├── stores/               # Zustand stores
│   │   │   │   ├── auth.store.ts
│   │   │   │   ├── cart.store.ts      # POS cart state
│   │   │   │   ├── pos.store.ts
│   │   │   │   └── ui.store.ts
│   │   │   │
│   │   │   ├── services/             # API service layer
│   │   │   │   ├── api.ts            # Axios instance + interceptors
│   │   │   │   ├── auth.api.ts
│   │   │   │   ├── products.api.ts
│   │   │   │   ├── inventory.api.ts
│   │   │   │   ├── sales.api.ts
│   │   │   │   ├── purchasing.api.ts
│   │   │   │   ├── finance.api.ts
│   │   │   │   └── reports.api.ts
│   │   │   │
│   │   │   ├── lib/
│   │   │   │   ├── utils.ts
│   │   │   │   ├── format.ts         # Currency, date formatting
│   │   │   │   └── permissions.ts    # FE permission checks
│   │   │   │
│   │   │   └── styles/
│   │   │       └── globals.css
│   │   │
│   │   ├── public/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── mobile/                      # ===== FLUTTER APP =====
│       ├── lib/
│       │   ├── main.dart
│       │   ├── app.dart
│       │   │
│       │   ├── core/                 # Core layer
│       │   │   ├── config/
│       │   │   │   ├── app_config.dart
│       │   │   │   ├── routes.dart
│       │   │   │   └── theme.dart
│       │   │   ├── constants/
│       │   │   │   ├── api_endpoints.dart
│       │   │   │   └── app_constants.dart
│       │   │   ├── network/
│       │   │   │   ├── api_client.dart        # Dio HTTP client
│       │   │   │   ├── api_interceptor.dart   # Auth token interceptor
│       │   │   │   └── api_exceptions.dart
│       │   │   ├── storage/
│       │   │   │   ├── local_storage.dart      # Hive/SharedPrefs
│       │   │   │   └── secure_storage.dart     # flutter_secure_storage
│       │   │   └── utils/
│       │   │       ├── currency_formatter.dart
│       │   │       ├── date_formatter.dart
│       │   │       └── validators.dart
│       │   │
│       │   ├── data/                 # Data layer
│       │   │   ├── models/
│       │   │   │   ├── product_model.dart
│       │   │   │   ├── stock_model.dart
│       │   │   │   ├── sales_model.dart
│       │   │   │   └── user_model.dart
│       │   │   ├── repositories/
│       │   │   │   ├── auth_repository.dart
│       │   │   │   ├── product_repository.dart
│       │   │   │   ├── inventory_repository.dart
│       │   │   │   ├── sales_repository.dart
│       │   │   │   └── report_repository.dart
│       │   │   └── datasources/
│       │   │       ├── remote/               # API calls
│       │   │       │   ├── auth_remote_ds.dart
│       │   │       │   ├── product_remote_ds.dart
│       │   │       │   └── inventory_remote_ds.dart
│       │   │       └── local/                # Offline cache
│       │   │           ├── product_local_ds.dart
│       │   │           └── stock_local_ds.dart
│       │   │
│       │   ├── domain/               # Domain layer (entities, usecases)
│       │   │   ├── entities/
│       │   │   │   ├── product.dart
│       │   │   │   ├── stock_level.dart
│       │   │   │   └── sales_order.dart
│       │   │   └── usecases/
│       │   │       ├── scan_barcode.dart
│       │   │       ├── check_stock.dart
│       │   │       └── get_dashboard.dart
│       │   │
│       │   ├── presentation/         # UI layer
│       │   │   ├── providers/               # Riverpod providers
│       │   │   │   ├── auth_provider.dart
│       │   │   │   ├── dashboard_provider.dart
│       │   │   │   ├── inventory_provider.dart
│       │   │   │   └── report_provider.dart
│       │   │   ├── screens/
│       │   │   │   ├── auth/
│       │   │   │   │   └── login_screen.dart
│       │   │   │   ├── dashboard/
│       │   │   │   │   └── dashboard_screen.dart
│       │   │   │   ├── inventory/
│       │   │   │   │   ├── stock_overview_screen.dart
│       │   │   │   │   └── stock_detail_screen.dart
│       │   │   │   ├── scanner/
│       │   │   │   │   └── barcode_scan_screen.dart
│       │   │   │   └── reports/
│       │   │   │       ├── sales_report_screen.dart
│       │   │   │       └── inventory_report_screen.dart
│       │   │   └── widgets/
│       │   │       ├── common/
│       │   │       │   ├── app_bar_widget.dart
│       │   │       │   ├── loading_widget.dart
│       │   │       │   └── error_widget.dart
│       │   │       ├── charts/
│       │   │       │   ├── revenue_chart.dart
│       │   │       │   └── stock_chart.dart
│       │   │       └── cards/
│       │   │           ├── stat_card.dart
│       │   │           └── product_card.dart
│       │   │
│       │   └── di/                   # Dependency Injection
│       │       └── injection.dart    # GetIt / Riverpod setup
│       │
│       ├── test/
│       │   ├── unit/
│       │   ├── widget/
│       │   └── integration/
│       ├── android/
│       ├── ios/
│       ├── pubspec.yaml
│       ├── analysis_options.yaml
│       └── README.md
│
├── docker/
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   └── nginx/
│       └── nginx.conf
│
├── scripts/
│   ├── seed.ts                     # Seed data (demo products, users)
│   └── generate-barcode.ts
│
├── turbo.json                      # Turborepo config
├── pnpm-workspace.yaml
├── package.json
├── .gitignore
├── .env.example
├── .eslintrc.js
├── .prettierrc
└── README.md
```

---

## 5. THIẾT KẾ DATABASE SCHEMA

### 5.1 Entity Relationship Diagram (Tóm tắt)

```
┌─────────┐     ┌──────────┐     ┌──────────────┐
│  User   │     │ Category │     │    Brand     │
│─────────│     │──────────│     │──────────────│
│ id      │     │ id       │     │ id           │
│ email   │     │ name     │     │ name         │
│ password│     │ parentId │◄──┐ │              │
│ role    │     └──────────┘   │ └──────┬───────┘
└─────────┘                    │        │
                               │        │
┌──────────────────────────────┼────────┼──────────────────────┐
│                    PRODUCT   │        │                      │
│──────────────────────────────┼────────┼──────────────────────│
│ id (PK)                      │        │                      │
│ sku (UNIQUE)            categoryId────┘                      │
│ barcode (UNIQUE)        brandId───────────────────────────────┘
│ name                                                          │
│ description                                                   │
│ baseUnitId ──────────────────► UnitOfMeasure                 │
│ costPrice (Giá vốn MAC)                                      │
│ retailPrice (Giá bán lẻ)                                     │
│ wholesalePrice (Giá sỉ)                                      │
│ minStock / maxStock                                           │
│ imageUrl                                                      │
│ isActive                                                      │
└──────────────┬───────────────────────────────────────────────┘
               │
    ┌──────────┼──────────────────────────────────────────┐
    │          │                                           │
    ▼          ▼                                           ▼
┌────────┐ ┌────────────────┐                   ┌──────────────────┐
│UnitConv│ │  StockLevel    │                   │  StockMovement   │
│────────│ │────────────────│                   │──────────────────│
│productId││ productId (FK) │                   │ id               │
│fromUnit │ │ warehouseId    │                   │ productId (FK)   │
│toUnit   │ │ quantity       │                   │ warehouseId      │
│factor   │ │ reservedQty    │                   │ type (IN/OUT/ADJ)│
│         │ │ availableQty   │                   │ quantity (+/-)   │
└────────┘ └────────────────┘                   │ referenceType    │
                                                │ referenceId      │
                                                │ costPrice        │
                                                │ runningBalance   │
                                                │ note             │
                                                │ createdAt        │
                                                └──────────────────┘
```

### 5.2 Prisma Schema (Chi tiết)

```prisma
// ============== IDENTITY & AUTH ==============

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  phone         String?   @unique
  passwordHash  String
  fullName      String
  role          UserRole
  isActive      Boolean   @default(true)
  lastLoginAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  salesOrders      SalesOrder[]
  purchaseOrders   PurchaseOrder[]
  goodsReceipts    GoodsReceipt[]
  stocktakes       Stocktake[]
  cashEntries      CashEntry[]
  stockMovements   StockMovement[]
}

enum UserRole {
  SUPER_ADMIN
  INVENTORY_MANAGER
  CASHIER
  ACCOUNTANT
}

// ============== CATALOG ==============

model Category {
  id        String    @id @default(cuid())
  name      String
  parentId  String?
  parent    Category? @relation("CategoryTree", fields: [parentId], references: [id])
  children  Category[] @relation("CategoryTree")
  products  Product[]
  sortOrder Int       @default(0)
  isActive  Boolean   @default(true)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Brand {
  id        String    @id @default(cuid())
  name      String    @unique
  logoUrl   String?
  isActive  Boolean   @default(true)
  products  Product[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model UnitOfMeasure {
  id          String   @id @default(cuid())
  name        String   @unique   // "Lon", "Thùng", "Kg", "Chai"
  shortName   String              // "lon", "th", "kg"
  createdAt   DateTime @default(now())
  
  productsAsBase  Product[]  @relation("BaseUnit")
  conversionsFrom UnitConversion[] @relation("FromUnit")
  conversionsTo   UnitConversion[] @relation("ToUnit")
}

model Product {
  id              String    @id @default(cuid())
  sku             String    @unique
  barcode         String?   @unique
  name            String
  description     String?
  
  categoryId      String
  category        Category  @relation(fields: [categoryId], references: [id])
  
  brandId         String?
  brand           Brand?    @relation(fields: [brandId], references: [id])
  
  baseUnitId      String
  baseUnit        UnitOfMeasure @relation("BaseUnit", fields: [baseUnitId], references: [id])
  
  // Pricing
  costPrice       Decimal   @default(0) @db.Decimal(15, 2)  // Giá vốn (MAC)
  retailPrice     Decimal   @default(0) @db.Decimal(15, 2)  // Giá bán lẻ
  wholesalePrice  Decimal   @default(0) @db.Decimal(15, 2)  // Giá sỉ
  
  // Stock Limits
  minStock        Int       @default(0)    // Tồn tối thiểu
  maxStock        Int       @default(0)    // Tồn tối đa (0 = không giới hạn)
  
  imageUrl        String?
  isActive        Boolean   @default(true)
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  unitConversions   UnitConversion[]
  stockLevels       StockLevel[]
  stockMovements    StockMovement[]
  salesOrderItems   SalesOrderItem[]
  purchaseOrderItems PurchaseOrderItem[]
  goodsReceiptItems  GoodsReceiptItem[]
  stocktakeItems    StocktakeItem[]

  @@index([name])
  @@index([barcode])
  @@index([sku])
  @@index([categoryId])
}

model UnitConversion {
  id          String   @id @default(cuid())
  productId   String
  product     Product  @relation(fields: [productId], references: [id])
  
  fromUnitId  String
  fromUnit    UnitOfMeasure @relation("FromUnit", fields: [fromUnitId], references: [id])
  
  toUnitId    String
  toUnit      UnitOfMeasure @relation("ToUnit", fields: [toUnitId], references: [id])
  
  factor      Decimal  @db.Decimal(10, 4)  // 1 Thùng = 24 Lon → factor = 24
  
  @@unique([productId, fromUnitId, toUnitId])
}

// ============== PARTNERS ==============

model Customer {
  id              String    @id @default(cuid())
  code            String    @unique          // Mã KH
  name            String
  phone           String?   @unique
  email           String?
  address         String?
  
  // Loyalty
  membershipTier  MembershipTier @default(REGULAR)
  totalSpent      Decimal   @default(0) @db.Decimal(15, 2)
  points          Int       @default(0)
  
  // Credit
  creditLimit     Decimal   @default(0) @db.Decimal(15, 2)  // Hạn mức nợ
  currentDebt     Decimal   @default(0) @db.Decimal(15, 2)  // Nợ hiện tại
  
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  salesOrders     SalesOrder[]
  receivables     AccountReceivable[]
}

enum MembershipTier {
  REGULAR
  SILVER
  GOLD
  PLATINUM
}

model Supplier {
  id          String    @id @default(cuid())
  code        String    @unique
  name        String
  contactName String?
  phone       String?
  email       String?
  address     String?
  taxCode     String?                        // Mã số thuế
  bankAccount String?
  bankName    String?
  
  currentDebt Decimal   @default(0) @db.Decimal(15, 2)
  
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  purchaseOrders PurchaseOrder[]
  payables       AccountPayable[]
}

// ============== WAREHOUSE & INVENTORY ==============

model Warehouse {
  id          String    @id @default(cuid())
  code        String    @unique
  name        String
  address     String?
  isDefault   Boolean   @default(false)
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  
  stockLevels     StockLevel[]
  stockMovements  StockMovement[]
  transfersFrom   StockTransfer[] @relation("FromWarehouse")
  transfersTo     StockTransfer[] @relation("ToWarehouse")
}

model StockLevel {
  id            String    @id @default(cuid())
  productId     String
  product       Product   @relation(fields: [productId], references: [id])
  warehouseId   String
  warehouse     Warehouse @relation(fields: [warehouseId], references: [id])
  
  quantity      Decimal   @default(0) @db.Decimal(15, 4)  // Tồn thực tế
  reservedQty   Decimal   @default(0) @db.Decimal(15, 4)  // Đang giữ (chưa xuất)
  
  // availableQty = quantity - reservedQty (computed)
  
  updatedAt     DateTime  @updatedAt
  
  @@unique([productId, warehouseId])
  @@index([warehouseId])
}

// Thẻ kho - Stock Ledger (Lưu vết mọi biến động)
model StockMovement {
  id              String    @id @default(cuid())
  productId       String
  product         Product   @relation(fields: [productId], references: [id])
  warehouseId     String
  warehouse       Warehouse @relation(fields: [warehouseId], references: [id])
  
  type            StockMovementType
  quantity        Decimal   @db.Decimal(15, 4)    // + nhập, - xuất
  unitCost        Decimal   @default(0) @db.Decimal(15, 2) // Giá vốn tại thời điểm
  runningBalance  Decimal   @db.Decimal(15, 4)    // Tồn sau biến động
  runningCost     Decimal   @default(0) @db.Decimal(15, 2) // Giá vốn BQ sau biến động
  
  // Truy vết nguồn gốc
  referenceType   String    // 'GOODS_RECEIPT', 'SALES_ORDER', 'ADJUSTMENT', 'TRANSFER', 'RETURN'
  referenceId     String    // ID của chứng từ gốc
  
  note            String?
  createdById     String
  createdBy       User      @relation(fields: [createdById], references: [id])
  createdAt       DateTime  @default(now())
  
  @@index([productId, warehouseId, createdAt])
  @@index([referenceType, referenceId])
}

enum StockMovementType {
  INBOUND       // Nhập kho (mua hàng)
  OUTBOUND      // Xuất kho (bán hàng)
  ADJUSTMENT    // Điều chỉnh (kiểm kê)
  TRANSFER_IN   // Nhận chuyển kho
  TRANSFER_OUT  // Xuất chuyển kho
  RETURN_IN     // Nhận trả hàng
  RETURN_OUT    // Trả hàng NCC
}

// ============== PURCHASING (Mua hàng & Nhập kho) ==============

model PurchaseOrder {
  id            String    @id @default(cuid())
  code          String    @unique             // PO-20260302-001
  supplierId    String
  supplier      Supplier  @relation(fields: [supplierId], references: [id])
  
  status        POStatus  @default(DRAFT)
  orderDate     DateTime  @default(now())
  expectedDate  DateTime?                     // Ngày giao dự kiến
  
  subtotal      Decimal   @default(0) @db.Decimal(15, 2)
  discount      Decimal   @default(0) @db.Decimal(15, 2)
  totalAmount   Decimal   @default(0) @db.Decimal(15, 2)
  
  note          String?
  createdById   String
  createdBy     User      @relation(fields: [createdById], references: [id])
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  items         PurchaseOrderItem[]
  goodsReceipts GoodsReceipt[]
}

enum POStatus {
  DRAFT
  CONFIRMED
  PARTIALLY_RECEIVED
  FULLY_RECEIVED
  CANCELLED
}

model PurchaseOrderItem {
  id              String    @id @default(cuid())
  purchaseOrderId String
  purchaseOrder   PurchaseOrder @relation(fields: [purchaseOrderId], references: [id])
  
  productId       String
  product         Product   @relation(fields: [productId], references: [id])
  
  quantity        Decimal   @db.Decimal(15, 4)
  unitPrice       Decimal   @db.Decimal(15, 2)
  discount        Decimal   @default(0) @db.Decimal(15, 2) // Chiết khấu/SP
  receivedQty     Decimal   @default(0) @db.Decimal(15, 4) // Đã nhận
  lineTotal       Decimal   @db.Decimal(15, 2)
  
  @@index([purchaseOrderId])
}

model GoodsReceipt {
  id              String    @id @default(cuid())
  code            String    @unique             // GR-20260302-001
  purchaseOrderId String?
  purchaseOrder   PurchaseOrder? @relation(fields: [purchaseOrderId], references: [id])
  
  status          GRStatus  @default(DRAFT)
  receiptDate     DateTime  @default(now())
  
  subtotal        Decimal   @default(0) @db.Decimal(15, 2) // Tổng tiền hàng
  shippingCost    Decimal   @default(0) @db.Decimal(15, 2) // Phí vận chuyển
  otherCost       Decimal   @default(0) @db.Decimal(15, 2) // Chi phí khác
  totalAmount     Decimal   @default(0) @db.Decimal(15, 2) // Tổng giá trị = subtotal + shipping + other
  
  note            String?
  createdById     String
  createdBy       User      @relation(fields: [createdById], references: [id])
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  items           GoodsReceiptItem[]
}

enum GRStatus {
  DRAFT
  CONFIRMED    // Đã nhập kho
  CANCELLED
}

model GoodsReceiptItem {
  id              String    @id @default(cuid())
  goodsReceiptId  String
  goodsReceipt    GoodsReceipt @relation(fields: [goodsReceiptId], references: [id])
  
  productId       String
  product         Product   @relation(fields: [productId], references: [id])
  
  quantity        Decimal   @db.Decimal(15, 4)
  unitPrice       Decimal   @db.Decimal(15, 2)
  discount        Decimal   @default(0) @db.Decimal(15, 2)
  allocatedCost   Decimal   @default(0) @db.Decimal(15, 2) // Chi phí phân bổ
  totalCost       Decimal   @db.Decimal(15, 2)              // = (qty * price - discount) + allocatedCost
  
  @@index([goodsReceiptId])
}

// ============== SALES (Bán hàng) ==============

model SalesOrder {
  id              String    @id @default(cuid())
  code            String    @unique             // SO-20260302-001
  
  customerId      String?
  customer        Customer? @relation(fields: [customerId], references: [id])
  
  status          SOStatus  @default(COMPLETED)
  orderDate       DateTime  @default(now())
  
  subtotal        Decimal   @default(0) @db.Decimal(15, 2)
  discountAmount  Decimal   @default(0) @db.Decimal(15, 2)  // Giảm giá tổng đơn
  discountPercent Decimal   @default(0) @db.Decimal(5, 2)
  taxAmount       Decimal   @default(0) @db.Decimal(15, 2)
  totalAmount     Decimal   @default(0) @db.Decimal(15, 2)
  
  // Thanh toán
  paymentMethod   PaymentMethod @default(CASH)
  paidAmount      Decimal   @default(0) @db.Decimal(15, 2)
  changeAmount    Decimal   @default(0) @db.Decimal(15, 2)  // Tiền thối
  debtAmount      Decimal   @default(0) @db.Decimal(15, 2)  // Tiền nợ
  
  // COGS (Cost of Goods Sold) - Giá vốn hàng bán
  totalCOGS       Decimal   @default(0) @db.Decimal(15, 2)
  
  note            String?
  createdById     String
  createdBy       User      @relation(fields: [createdById], references: [id])
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  items           SalesOrderItem[]
  returns         SalesReturn[]
  payments        SalesPayment[]
  
  warehouseId     String
  
  @@index([orderDate])
  @@index([customerId])
  @@index([createdById])
}

enum SOStatus {
  COMPLETED
  RETURNED          // Đã trả hàng (toàn bộ)
  PARTIALLY_RETURNED
  CANCELLED
}

enum PaymentMethod {
  CASH
  BANK_TRANSFER
  CARD
  DEBT          // Mua nợ
  MIXED         // Kết hợp
}

model SalesOrderItem {
  id              String    @id @default(cuid())
  salesOrderId    String
  salesOrder      SalesOrder @relation(fields: [salesOrderId], references: [id])
  
  productId       String
  product         Product   @relation(fields: [productId], references: [id])
  
  quantity        Decimal   @db.Decimal(15, 4)
  unitPrice       Decimal   @db.Decimal(15, 2)     // Giá bán
  costPrice       Decimal   @db.Decimal(15, 2)     // Giá vốn tại thời điểm bán
  discount        Decimal   @default(0) @db.Decimal(15, 2)
  lineTotal       Decimal   @db.Decimal(15, 2)     // = qty * unitPrice - discount
  
  returnedQty     Decimal   @default(0) @db.Decimal(15, 4) // Số lượng đã trả
  
  @@index([salesOrderId])
}

model SalesPayment {
  id              String    @id @default(cuid())
  salesOrderId    String
  salesOrder      SalesOrder @relation(fields: [salesOrderId], references: [id])
  
  method          PaymentMethod
  amount          Decimal   @db.Decimal(15, 2)
  reference       String?                           // Mã giao dịch CK
  paidAt          DateTime  @default(now())
}

model SalesReturn {
  id              String    @id @default(cuid())
  code            String    @unique                  // SR-20260302-001
  salesOrderId    String
  salesOrder      SalesOrder @relation(fields: [salesOrderId], references: [id])
  
  returnDate      DateTime  @default(now())
  totalAmount     Decimal   @db.Decimal(15, 2)
  refundMethod    PaymentMethod
  reason          String?
  
  createdById     String
  createdAt       DateTime  @default(now())
  
  items           SalesReturnItem[]
}

model SalesReturnItem {
  id              String    @id @default(cuid())
  salesReturnId   String
  salesReturn     SalesReturn @relation(fields: [salesReturnId], references: [id])
  
  productId       String
  quantity        Decimal   @db.Decimal(15, 4)
  unitPrice       Decimal   @db.Decimal(15, 2)
  lineTotal       Decimal   @db.Decimal(15, 2)
}

// ============== INVENTORY OPERATIONS ==============

model Stocktake {
  id              String    @id @default(cuid())
  code            String    @unique
  warehouseId     String
  status          StocktakeStatus @default(IN_PROGRESS)
  
  startedAt       DateTime  @default(now())
  completedAt     DateTime?
  
  note            String?
  createdById     String
  createdBy       User      @relation(fields: [createdById], references: [id])
  createdAt       DateTime  @default(now())
  
  items           StocktakeItem[]
}

enum StocktakeStatus {
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

model StocktakeItem {
  id              String    @id @default(cuid())
  stocktakeId     String
  stocktake       Stocktake @relation(fields: [stocktakeId], references: [id])
  
  productId       String
  product         Product   @relation(fields: [productId], references: [id])
  
  bookQty         Decimal   @db.Decimal(15, 4)  // Tồn sổ sách
  actualQty       Decimal   @db.Decimal(15, 4)  // Tồn thực tế
  diffQty         Decimal   @db.Decimal(15, 4)  // = actualQty - bookQty
  
  reason          String?   // Lý do lệch (hư hỏng, mất mát, ...)
  
  @@index([stocktakeId])
}

model StockTransfer {
  id              String    @id @default(cuid())
  code            String    @unique
  
  fromWarehouseId String
  fromWarehouse   Warehouse @relation("FromWarehouse", fields: [fromWarehouseId], references: [id])
  
  toWarehouseId   String
  toWarehouse     Warehouse @relation("ToWarehouse", fields: [toWarehouseId], references: [id])
  
  status          TransferStatus @default(PENDING)
  transferDate    DateTime  @default(now())
  note            String?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  items           StockTransferItem[]
}

enum TransferStatus {
  PENDING
  IN_TRANSIT
  COMPLETED
  CANCELLED
}

model StockTransferItem {
  id              String    @id @default(cuid())
  transferId      String
  transfer        StockTransfer @relation(fields: [transferId], references: [id])
  
  productId       String
  quantity        Decimal   @db.Decimal(15, 4)
}

// ============== FINANCE ==============

model CashEntry {
  id              String    @id @default(cuid())
  code            String    @unique
  type            CashEntryType     // THU / CHI
  category        String              // "Tiền điện", "Lương", "Thu tiền KH"...
  
  amount          Decimal   @db.Decimal(15, 2)
  paymentMethod   PaymentMethod @default(CASH)
  
  referenceType   String?             // 'SALES_ORDER', 'PURCHASE_ORDER', null
  referenceId     String?
  
  description     String?
  entryDate       DateTime  @default(now())
  
  createdById     String
  createdBy       User      @relation(fields: [createdById], references: [id])
  createdAt       DateTime  @default(now())
  
  @@index([entryDate])
  @@index([type])
}

enum CashEntryType {
  INCOME    // Thu
  EXPENSE   // Chi
}

model AccountReceivable {
  id              String    @id @default(cuid())
  customerId      String
  customer        Customer  @relation(fields: [customerId], references: [id])
  
  salesOrderId    String?
  amount          Decimal   @db.Decimal(15, 2)  // Số tiền nợ
  paidAmount      Decimal   @default(0) @db.Decimal(15, 2)
  remainingAmount Decimal   @db.Decimal(15, 2)  // = amount - paidAmount
  
  dueDate         DateTime?
  status          DebtStatus @default(UNPAID)
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([customerId])
  @@index([status])
}

model AccountPayable {
  id              String    @id @default(cuid())
  supplierId      String
  supplier        Supplier  @relation(fields: [supplierId], references: [id])
  
  purchaseOrderId String?
  amount          Decimal   @db.Decimal(15, 2)
  paidAmount      Decimal   @default(0) @db.Decimal(15, 2)
  remainingAmount Decimal   @db.Decimal(15, 2)
  
  dueDate         DateTime?
  status          DebtStatus @default(UNPAID)
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([supplierId])
  @@index([status])
}

enum DebtStatus {
  UNPAID
  PARTIALLY_PAID
  PAID
  OVERDUE
}
```

---

## 6. API DESIGN

### 6.1 RESTful API Endpoints

```
BASE URL: /api/v1

# ── Auth ──────────────────────────────────────
POST   /auth/login                    # Đăng nhập
POST   /auth/refresh                  # Refresh token
POST   /auth/logout                   # Đăng xuất
GET    /auth/me                       # Profile hiện tại

# ── Users ─────────────────────────────────────
GET    /users                         # Danh sách users
POST   /users                         # Tạo user
PATCH  /users/:id                     # Sửa user
DELETE /users/:id                     # Xóa (soft delete)

# ── Catalog ───────────────────────────────────
GET    /products                      # DS sản phẩm (search, filter, paginate)
GET    /products/:id                  # Chi tiết SP
POST   /products                      # Tạo SP
PATCH  /products/:id                  # Sửa SP
DELETE /products/:id                  # Xóa SP
GET    /products/:id/stock-ledger     # Thẻ kho của SP
GET    /products/barcode/:barcode     # Tìm SP theo barcode (POS)
POST   /products/:id/barcode/generate # Tạo mã vạch

GET    /categories                    # DS danh mục
POST   /categories
PATCH  /categories/:id
DELETE /categories/:id

GET    /brands
POST   /brands
PATCH  /brands/:id

GET    /units
POST   /units
POST   /units/conversions             # Tạo quy đổi ĐVT

# ── Partners ──────────────────────────────────
GET    /customers                     # DS khách hàng
GET    /customers/:id
POST   /customers
PATCH  /customers/:id
GET    /customers/:id/debt            # Công nợ KH
GET    /customers/search?phone=xxx    # Tìm KH theo SĐT

GET    /suppliers
GET    /suppliers/:id
POST   /suppliers
PATCH  /suppliers/:id
GET    /suppliers/:id/debt            # Công nợ NCC

# ── Purchasing ────────────────────────────────
GET    /purchase-orders               # DS đơn nhập
GET    /purchase-orders/:id
POST   /purchase-orders               # Tạo PO
PATCH  /purchase-orders/:id           # Sửa PO
POST   /purchase-orders/:id/confirm   # Xác nhận PO
POST   /purchase-orders/:id/cancel    # Hủy PO

POST   /goods-receipts               # Tạo phiếu nhập kho
GET    /goods-receipts/:id
POST   /goods-receipts/:id/confirm   # Xác nhận nhập → cập nhật tồn kho
POST   /goods-receipts/:id/print-labels # In tem nhãn

# ── Sales (POS) ──────────────────────────────
POST   /sales/orders                  # Tạo đơn bán hàng (POS checkout)
GET    /sales/orders                  # DS đơn hàng
GET    /sales/orders/:id
POST   /sales/orders/:id/print       # In hóa đơn

POST   /sales/returns                 # Trả hàng
GET    /sales/returns

# ── Inventory ─────────────────────────────────
GET    /inventory/stock               # Tồn kho tổng hợp
GET    /inventory/stock/:productId    # Tồn kho theo SP
GET    /inventory/movements           # Lịch sử biến động
GET    /inventory/alerts              # Hàng dưới/vượt định mức

GET    /inventory/warehouses
POST   /inventory/warehouses
PATCH  /inventory/warehouses/:id

POST   /inventory/stocktakes          # Tạo phiếu kiểm kê
GET    /inventory/stocktakes/:id
POST   /inventory/stocktakes/:id/complete  # Hoàn tất → tạo điều chỉnh

POST   /inventory/adjustments         # Điều chỉnh kho
POST   /inventory/transfers           # Chuyển kho
PATCH  /inventory/transfers/:id/confirm

# ── Finance ───────────────────────────────────
GET    /finance/cash-book             # Sổ quỹ
POST   /finance/cash-entries          # Tạo phiếu thu/chi

GET    /finance/receivables           # Công nợ KH
POST   /finance/receivables/:id/pay   # Thanh toán công nợ KH

GET    /finance/payables              # Công nợ NCC
POST   /finance/payables/:id/pay      # Thanh toán công nợ NCC

# ── Reports ───────────────────────────────────
GET    /reports/sales                 # BC bán hàng (doanh thu, LN)
GET    /reports/sales/top-products    # Top SP bán chạy
GET    /reports/inventory             # BC tồn kho hiện tại
GET    /reports/inventory/xnt         # BC Xuất-Nhập-Tồn
GET    /reports/inventory/value       # Giá trị tồn kho
GET    /reports/finance/cashflow      # BC dòng tiền

GET    /dashboard/summary             # Dashboard tổng quan
GET    /dashboard/realtime            # Dữ liệu realtime (WebSocket)
```

### 6.2 Response Format

```typescript
// Success Response
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Sản phẩm 'Bia Tiger' chỉ còn 5 lon trong kho",
    "details": { "available": 5, "requested": 10 }
  }
}
```

---

## 7. XỬ LÝ NGHIỆP VỤ PHỨC TẠP

### 7.1 Race Condition - Xử lý tranh chấp tồn kho

**Vấn đề:** 2 thu ngân cùng bán 1 SP cuối cùng cùng lúc.

**Giải pháp: Optimistic Locking + Database Transaction + SELECT FOR UPDATE**

```typescript
// stock.service.ts
async deductStock(productId: string, warehouseId: string, quantity: number) {
  return this.prisma.$transaction(async (tx) => {
    // SELECT FOR UPDATE → Lock row, prevent concurrent read
    const stock = await tx.$queryRaw`
      SELECT * FROM "StockLevel"
      WHERE "productId" = ${productId}
        AND "warehouseId" = ${warehouseId}
      FOR UPDATE
    `;

    const available = stock[0].quantity - stock[0].reservedQty;
    
    if (available < quantity) {
      throw new InsufficientStockException(productId, available, quantity);
    }

    // Trừ tồn kho
    await tx.stockLevel.update({
      where: { productId_warehouseId: { productId, warehouseId } },
      data: { quantity: { decrement: quantity } }
    });

    // Ghi Stock Movement (Thẻ kho)
    await tx.stockMovement.create({
      data: {
        productId,
        warehouseId,
        type: 'OUTBOUND',
        quantity: -quantity,
        runningBalance: available - quantity,
        // ...
      }
    });
  }, {
    isolationLevel: 'Serializable', // Highest isolation
    timeout: 5000,
  });
}
```

### 7.2 Tính Giá vốn - Moving Average Cost (MAC)

```typescript
// costing.service.ts
async recalculateMAC(productId: string, newQty: number, newUnitCost: number) {
  const product = await this.prisma.product.findUnique({
    where: { id: productId },
    include: { stockLevels: true },
  });

  const currentQty = product.stockLevels.reduce((sum, sl) => sum + sl.quantity, 0);
  const currentCost = product.costPrice;

  // Công thức MAC:
  // New Cost = (Current Qty × Current Cost + New Qty × New Cost) ÷ (Current Qty + New Qty)
  const newMACCost = 
    (currentQty * currentCost + newQty * newUnitCost) / (currentQty + newQty);

  await this.prisma.product.update({
    where: { id: productId },
    data: { costPrice: newMACCost },
  });

  return newMACCost;
}
```

### 7.3 Phân bổ chi phí nhập hàng

```typescript
// cost-allocation.service.ts
async allocateCosts(goodsReceiptId: string) {
  const receipt = await this.getReceiptWithItems(goodsReceiptId);
  
  const additionalCost = receipt.shippingCost + receipt.otherCost;
  const totalItemValue = receipt.items.reduce(
    (sum, item) => sum + (item.quantity * item.unitPrice - item.discount), 0
  );

  // Phân bổ theo tỷ trọng giá trị
  for (const item of receipt.items) {
    const itemValue = item.quantity * item.unitPrice - item.discount;
    const ratio = itemValue / totalItemValue;
    const allocatedCost = additionalCost * ratio;
    
    // totalCost = itemValue + allocatedCost
    // → Giá vốn/đơn vị = totalCost / quantity
    await this.prisma.goodsReceiptItem.update({
      where: { id: item.id },
      data: {
        allocatedCost,
        totalCost: itemValue + allocatedCost,
      },
    });
  }
}
```

### 7.4 Quy đổi Đơn vị tính (Unit Conversion)

```typescript
// units.service.ts
async convertToBaseUnit(
  productId: string, 
  fromUnitId: string, 
  quantity: number
): Promise<{ baseQuantity: number; baseUnitId: string }> {
  
  const product = await this.prisma.product.findUnique({
    where: { id: productId },
    include: { unitConversions: true },
  });

  // Nếu đã là ĐVT gốc → trả thẳng
  if (fromUnitId === product.baseUnitId) {
    return { baseQuantity: quantity, baseUnitId: product.baseUnitId };
  }

  // Tìm tỷ lệ quy đổi
  const conversion = product.unitConversions.find(
    (c) => c.fromUnitId === fromUnitId && c.toUnitId === product.baseUnitId
  );

  if (!conversion) throw new BadRequestException('Không tìm thấy quy đổi ĐVT');

  // Ví dụ: Bán 1 Thùng, factor = 24 → trừ 24 Lon
  return {
    baseQuantity: quantity * conversion.factor,
    baseUnitId: product.baseUnitId,
  };
}
```

### 7.5 Báo cáo Xuất-Nhập-Tồn

```typescript
// xnt-report.service.ts
async getXNTReport(warehouseId: string, startDate: Date, endDate: Date) {
  // Tồn đầu kỳ = Tổng movements trước startDate
  // Nhập trong kỳ = Tổng movements type IN trong kỳ
  // Xuất trong kỳ = Tổng movements type OUT trong kỳ
  // Tồn cuối kỳ = Tồn đầu kỳ + Nhập - Xuất

  const report = await this.prisma.$queryRaw`
    WITH opening_stock AS (
      SELECT "productId",
             SUM(quantity) as opening_qty,
             SUM(quantity * "unitCost") as opening_value
      FROM "StockMovement"
      WHERE "warehouseId" = ${warehouseId}
        AND "createdAt" < ${startDate}
      GROUP BY "productId"
    ),
    period_movements AS (
      SELECT "productId",
             SUM(CASE WHEN quantity > 0 THEN quantity ELSE 0 END) as inbound_qty,
             SUM(CASE WHEN quantity > 0 THEN quantity * "unitCost" ELSE 0 END) as inbound_value,
             SUM(CASE WHEN quantity < 0 THEN ABS(quantity) ELSE 0 END) as outbound_qty,
             SUM(CASE WHEN quantity < 0 THEN ABS(quantity * "unitCost") ELSE 0 END) as outbound_value
      FROM "StockMovement"  
      WHERE "warehouseId" = ${warehouseId}
        AND "createdAt" >= ${startDate}
        AND "createdAt" <= ${endDate}
      GROUP BY "productId"
    )
    SELECT 
      p.id, p.sku, p.name,
      COALESCE(os.opening_qty, 0) as opening_qty,
      COALESCE(os.opening_value, 0) as opening_value,
      COALESCE(pm.inbound_qty, 0) as inbound_qty,
      COALESCE(pm.inbound_value, 0) as inbound_value,
      COALESCE(pm.outbound_qty, 0) as outbound_qty,
      COALESCE(pm.outbound_value, 0) as outbound_value,
      (COALESCE(os.opening_qty, 0) + COALESCE(pm.inbound_qty, 0) - COALESCE(pm.outbound_qty, 0)) as closing_qty
    FROM "Product" p
    LEFT JOIN opening_stock os ON p.id = os."productId"
    LEFT JOIN period_movements pm ON p.id = pm."productId"
    ORDER BY p.name
  `;

  return report;
}
```

---

## 8. KẾ HOẠCH TRIỂN KHAI (ROADMAP)

### Phase 1: Foundation (2-3 tuần)
| # | Task | Ước lượng |
|---|------|-----------|
| 1 | Setup monorepo (Turborepo + pnpm) | 1 ngày |
| 2 | Setup NestJS backend + Prisma + PostgreSQL + Redis | 2 ngày |
| 3 | Database schema + Migration + Seed data | 2 ngày |
| 4 | Auth module (JWT, RBAC Guards) | 2 ngày |
| 5 | Setup React web (Vite + TailwindCSS + shadcn/ui) | 1 ngày |
| 6 | Login page + Auth flow + Route guards | 2 ngày |
| 7 | Admin layout + Sidebar navigation | 1 ngày |
| 8 | Docker Compose (dev environment) | 1 ngày |

### Phase 2: Master Data (1-2 tuần)
| # | Task | Ước lượng |
|---|------|-----------|
| 1 | CRUD Categories, Brands, Units | 2 ngày |
| 2 | CRUD Products + Unit Conversion | 3 ngày |
| 3 | Barcode generation (JsBarcode) | 1 ngày |
| 4 | CRUD Customers, Suppliers | 2 ngày |
| 5 | Warehouses setup | 1 ngày |

### Phase 3: Inventory Core (2 tuần)
| # | Task | Ước lượng |
|---|------|-----------|
| 1 | Stock Level management + Real-time tracking | 3 ngày |
| 2 | Stock Movement / Thẻ kho (Stock Ledger) | 2 ngày |
| 3 | Costing service (MAC) | 2 ngày |
| 4 | Stock alerts (min/max) | 1 ngày |
| 5 | Kiểm kê kho (Stocktake) | 2 ngày |
| 6 | Điều chỉnh kho (Adjustments) | 1 ngày |
| 7 | Chuyển kho (Transfers) | 2 ngày |

### Phase 4: Purchasing (1 tuần)
| # | Task | Ước lượng |
|---|------|-----------|
| 1 | Purchase Orders (CRUD + Workflow) | 2 ngày |
| 2 | Goods Receipt + Cost Allocation | 2 ngày |
| 3 | Label printing (Barcode labels) | 1 ngày |

### Phase 5: POS & Sales (2-3 tuần) ⭐ Core Feature
| # | Task | Ước lượng |
|---|------|-----------|
| 1 | POS Layout (full-screen, optimized UI) | 2 ngày |
| 2 | Product grid/list + Barcode scanner | 2 ngày |
| 3 | Cart management (Zustand) | 2 ngày |
| 4 | Discount (%, VND, mã giảm giá) | 1 ngày |
| 5 | Payment flow (Cash/Card/Transfer/Debt) | 2 ngày |
| 6 | Invoice printing (ESC/POS 80mm/58mm) | 2 ngày |
| 7 | Sales Return flow | 2 ngày |
| 8 | WebSocket real-time stock updates | 1 ngày |

### Phase 6: Finance (1-2 tuần)
| # | Task | Ước lượng |
|---|------|-----------|
| 1 | Sổ quỹ Thu/Chi (Cash Book) | 2 ngày |
| 2 | Công nợ Khách hàng (AR) | 2 ngày |
| 3 | Công nợ Nhà cung cấp (AP) | 2 ngày |

### Phase 7: Reports & Dashboard (2 tuần)
| # | Task | Ước lượng |
|---|------|-----------|
| 1 | Dashboard tổng quan (Recharts) | 2 ngày |
| 2 | BC Bán hàng (Doanh thu, Lợi nhuận gộp) | 2 ngày |
| 3 | BC Tồn kho + Cảnh báo | 1 ngày |
| 4 | BC Xuất-Nhập-Tồn | 2 ngày |
| 5 | Export PDF/Excel (báo cáo) | 2 ngày |

### Phase 8: Mobile App - Flutter (3-4 tuần)
| # | Task | Ước lượng |
|---|------|-----------|
| 1 | Setup Flutter project + Clean Architecture | 1 ngày |
| 2 | Core layer (Dio, Auth, Storage, Theme) | 2 ngày |
| 3 | Login + Auth flow (flutter_secure_storage) | 2 ngày |
| 4 | Dashboard screen (fl_chart) | 3 ngày |
| 5 | Barcode scan (mobile_scanner / camera) | 2 ngày |
| 6 | Stock overview + detail screens | 3 ngày |
| 7 | Reports screens (Sales, Inventory) | 3 ngày |
| 8 | Offline cache (Hive) + Connectivity | 2 ngày |
| 9 | Push notifications (Firebase Cloud Messaging) | 2 ngày |

### Phase 9: Testing & Polish (1-2 tuần)
| # | Task | Ước lượng |
|---|------|-----------|
| 1 | Unit tests (Vitest) | 3 ngày |
| 2 | E2E tests (Playwright) | 3 ngày |
| 3 | Performance optimization | 2 ngày |
| 4 | Security audit | 1 ngày |
| 5 | UAT (User Acceptance Testing) | 2 ngày |

**Tổng ước lượng: ~14-18 tuần (3.5-4.5 tháng) cho 1-2 developer**

---

## 9. DEPLOYMENT & DEVOPS

### 9.1 Development Environment

```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: celebi_db
      POSTGRES_USER: celebi_user
      POSTGRES_PASSWORD: celebi_pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minio_admin
      MINIO_ROOT_PASSWORD: minio_password
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  minio_data:
```

### 9.2 Production Deployment Options

| Option | Chi phí/tháng | Phù hợp |
|--------|--------------|----------|
| **VPS (Contabo/Hetzner)** | ~$10-20 | Startup, 1-2 cửa hàng |
| **DigitalOcean App Platform** | ~$25-50 | Auto-scaling, managed |
| **AWS (EC2 + RDS)** | ~$50-100 | Enterprise, multi-store |
| **On-premise (Máy chủ local)** | Một lần | Nếu cần offline-first |

### 9.3 CI/CD Pipeline

```
GitHub Push → GitHub Actions → Build → Test → Deploy
                                ↓
                         Docker Build → Push to Registry
                                ↓
                         Deploy to VPS (docker-compose)
                         hoặc
                         Deploy to DigitalOcean/AWS
```

### 9.4 Environment Variables

```env
# .env.example
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/celebi_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# MinIO / S3
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minio_admin
S3_SECRET_KEY=minio_password
S3_BUCKET=celebi-files

# App
APP_PORT=3000
APP_ENV=development
FRONTEND_URL=http://localhost:5173
```

---

## 10. TỔNG KẾT CÔNG NGHỆ & QUYẾT ĐỊNH KIẾN TRÚC

### Decision Records

| # | Quyết định | Lý do |
|---|------------|-------|
| DR-01 | Modular Monolith (NestJS) | Team nhỏ, deploy đơn giản, tách module khi cần scale |
| DR-02 | PostgreSQL (không MongoDB) | Data tài chính cần ACID, quan hệ phức tạp, Window Functions mạnh |
| DR-03 | Prisma ORM | Type-safe, schema-first, migration tốt, query builder mạnh |
| DR-04 | Redis cho cache + queue | Tồn kho real-time cache, BullMQ cho background jobs |
| DR-05 | Zustand (không Redux) | Lightweight, boilerplate ít, phù hợp POS state |
| DR-06 | Monorepo (Turborepo) + Flutter riêng | Share types/utils giữa web + backend; Flutter có workspace riêng do Dart ecosystem |
| DR-07 | SELECT FOR UPDATE | Giải quyết race condition tồn kho, đảm bảo integrity |
| DR-08 | MAC (Moving Average Cost) | Phương pháp tính giá vốn phổ biến cho bán lẻ VN |
| DR-09 | ESC/POS protocol | Standard cho máy in nhiệt, hỗ trợ cả 58mm và 80mm |
| DR-10 | shadcn/ui + TailwindCSS | Accessible, customizable, không vendor lock-in |

---

> **Bước tiếp theo:** Sau khi review tài liệu này, có thể bắt đầu setup project scaffold (Phase 1) với tất cả cấu trúc thư mục, config files, và database schema.
