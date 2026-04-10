# CELEBI — Hệ thống Quản lý Kho & Bán hàng

Monorepo cho hệ thống quản lý kho thiết bị điện tử (điện thoại, máy tính bảng, phụ kiện) bao gồm nhập hàng, thu cũ đổi mới, kiểm định, bán hàng và POS.

---

## Tech Stack

| Layer | Công nghệ |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Backend | NestJS 10 + TypeScript |
| ORM | Prisma 5 |
| Database | MongoDB (via Prisma MongoDB provider) |
| File Storage | MongoDB GridFS |
| Auth | JWT (access token 15m + refresh token 7d) |
| Monorepo | Turborepo + pnpm workspaces |
| Deploy | Vercel (frontend + NestJS serverless) |

---

## Cấu trúc project

```
quan_ly_kho_celebi/
├── apps/
│   ├── backend/                  # NestJS API
│   │   ├── prisma/
│   │   │   └── schema.prisma     # Database schema (MongoDB)
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/         # Đăng nhập, JWT, refresh token
│   │   │   │   ├── users/        # Quản lý tài khoản & phân quyền
│   │   │   │   ├── masterdata/   # Danh mục, thương hiệu, kho, sản phẩm
│   │   │   │   ├── attributes/   # Nhóm thuộc tính EAV
│   │   │   │   ├── inbound/      # Phiếu nhập hàng
│   │   │   │   ├── outbound/     # Phiếu xuất hàng
│   │   │   │   ├── serial-items/ # Thiết bị theo serial/IMEI
│   │   │   │   ├── stock/        # Tồn kho & lịch sử biến động
│   │   │   │   ├── qc-inspection/# Kiểm định chất lượng
│   │   │   │   ├── sales/        # Quản lý đơn hàng bán
│   │   │   │   ├── pos/          # Point of Sale
│   │   │   │   ├── trade-in-programs/ # Chương trình thu cũ đổi mới
│   │   │   │   └── upload/       # Upload ảnh / GridFS
│   │   │   └── app.module.ts
│   │   └── api/
│   │       └── index.ts          # Vercel serverless entry
│   └── web/                      # React frontend
│       ├── src/
│       │   ├── pages/            # Các trang UI
│       │   ├── api/              # API client functions
│       │   ├── lib/api/          # Axios instances, warehouse API
│       │   ├── layouts/          # MainLayout, sidebar nav
│       │   └── App.tsx           # Routes
│       └── vite.config.ts
├── packages/
│   ├── shared-constants/         # Enum, hằng số dùng chung
│   └── shared-types/             # TypeScript types dùng chung
├── turbo.json
├── pnpm-workspace.yaml
└── vercel.json
```

---

## Chạy local

### Yêu cầu

- Node.js >= 20
- pnpm >= 8
- MongoDB instance (local hoặc Atlas)

### Cài đặt

```bash
# Clone repo
git clone <repo-url>
cd quan_ly_kho_celebi

# Cài dependencies
pnpm install
# postinstall tự chạy `prisma generate`

# Tạo file env
cp .env.example apps/backend/.env
# Điền các biến bắt buộc (xem bảng biến môi trường bên dưới)

# Chạy dev (backend :6868 + frontend :5173)
pnpm dev
```

### Sau khi thay đổi schema Prisma

```bash
cd apps/backend
npx prisma generate
# Sau đó restart toàn bộ process để webpack load lại Prisma types
```

---

## Biến môi trường

File: `apps/backend/.env`

| Biến | Bắt buộc | Mô tả |
|---|---|---|
| `DATABASE_URL` | ✅ | MongoDB connection string (Prisma) |
| `MONGODB_URI` | ✅ | MongoDB URI cho Mongoose/GridFS |
| `JWT_SECRET` | ✅ | Secret key cho access token |
| `JWT_REFRESH_SECRET` | ✅ | Secret key cho refresh token |
| `JWT_EXPIRES_IN` | | Thời hạn access token (mặc định: `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | | Thời hạn refresh token (mặc định: `7d`) |
| `APP_PORT` | | Port backend (mặc định: `6868`) |
| `FRONTEND_URL` | | URL frontend cho CORS (mặc định: `http://localhost:5173`) |
| `NODE_ENV` | | `development` hoặc `production` |

---

## Scripts

```bash
pnpm dev          # Chạy cả backend lẫn frontend ở chế độ watch
pnpm build        # Build production (backend + frontend)
pnpm lint         # Lint toàn bộ workspace
pnpm clean        # Xóa dist, node_modules, build cache
```

---

## API Endpoints

Base URL: `http://localhost:6868/api/v1`

Swagger UI: `http://localhost:6868/api`

### Auth

| Method | Path | Mô tả |
|---|---|---|
| POST | `/auth/login` | Đăng nhập, trả về access + refresh token |
| POST | `/auth/refresh` | Lấy access token mới từ refresh token |
| GET | `/auth/profile` | Thông tin user đang đăng nhập |

### Users (SUPER_ADMIN)

| Method | Path | Mô tả |
|---|---|---|
| GET | `/users` | Danh sách tài khoản |
| POST | `/users` | Tạo tài khoản mới |
| GET | `/users/:id` | Chi tiết tài khoản |
| PUT | `/users/:id` | Cập nhật tài khoản (tên, role, isActive) |
| PUT | `/users/:id/reset-password` | Đặt lại mật khẩu |
| DELETE | `/users/:id` | Vô hiệu hóa tài khoản (soft delete) |

### Master Data

| Method | Path | Mô tả |
|---|---|---|
| GET/POST | `/categories` | Danh mục sản phẩm |
| GET/PUT/DELETE | `/categories/:id` | Chi tiết danh mục |
| GET/POST | `/brands` | Thương hiệu |
| GET/PUT/DELETE | `/brands/:id` | Chi tiết thương hiệu |
| GET/POST | `/warehouses` | Kho hàng |
| GET/PUT/DELETE | `/warehouses/:id` | Chi tiết kho |
| GET/POST | `/product-templates` | Mẫu sản phẩm |
| GET/PUT/DELETE | `/product-templates/:id` | Chi tiết mẫu sản phẩm |

### Inbound (Nhập hàng)

| Method | Path | Mô tả |
|---|---|---|
| GET | `/inbound` | Danh sách phiếu nhập |
| POST | `/inbound` | Tạo phiếu nhập mới |
| GET | `/inbound/:id` | Chi tiết phiếu nhập |
| PUT | `/inbound/:id` | Cập nhật phiếu nhập |
| POST | `/inbound/:id/complete-qc` | Hoàn tất kiểm định & nhập kho |

### Trade-in Programs (Thu cũ)

| Method | Path | Mô tả |
|---|---|---|
| GET | `/trade-in-programs` | Danh sách chương trình thu cũ |
| POST | `/trade-in-programs` | Tạo chương trình mới |
| GET | `/trade-in-programs/:id` | Chi tiết chương trình |
| PUT | `/trade-in-programs/:id` | Cập nhật chương trình |
| DELETE | `/trade-in-programs/:id` | Tắt chương trình (soft delete) |

### Stock

| Method | Path | Mô tả |
|---|---|---|
| GET | `/stock/levels` | Tồn kho tổng hợp theo sản phẩm + kho |
| GET | `/stock/movements` | Lịch sử biến động tồn kho |

### Serial Items (Thiết bị)

| Method | Path | Mô tả |
|---|---|---|
| GET | `/serial-items` | Danh sách thiết bị theo serial/IMEI |
| GET | `/serial-items/:id` | Chi tiết thiết bị |
| PUT | `/serial-items/:id` | Cập nhật thông tin thiết bị |

### POS

| Method | Path | Mô tả |
|---|---|---|
| GET | `/pos/products` | Sản phẩm có sẵn để bán |
| POST | `/pos/orders` | Tạo đơn hàng POS |

---

## Frontend Routes

| Path | Mô tả | Phân quyền |
|---|---|---|
| `/login` | Đăng nhập | Public |
| `/dashboard` | Tổng quan | Tất cả |
| `/products` | Quản lý sản phẩm | Tất cả |
| `/inventory` | Danh sách thiết bị | Tất cả |
| `/inventory/:id` | Chi tiết thiết bị | Tất cả |
| `/inventory/print-label` | In nhãn thiết bị | Tất cả |
| `/stock/levels` | Tồn kho theo kho | Tất cả |
| `/inbound` | Phiếu nhập hàng | Tất cả |
| `/inbound/new` | Tạo phiếu nhập | Tất cả |
| `/inbound/:id` | Chi tiết phiếu nhập | Tất cả |
| `/trade-in` | Chương trình thu cũ | Tất cả |
| `/trade-in/programs/:id` | Phiếu theo chương trình | Tất cả |
| `/trade-in/programs/:id/create-single` | Tạo phiếu thu cũ | Tất cả |
| `/trade-in/create` | Import hàng loạt | Tất cả |
| `/warehouses` | Quản lý kho | Tất cả |
| `/sales` | Đơn hàng bán | Tất cả |
| `/pos` | Point of Sale | Tất cả |
| `/users` | Tài khoản & phân quyền | SUPER_ADMIN |
| `/admin-ops` | Bảng vận hành quản trị | SUPER_ADMIN |

---

## Phân quyền

| Role | Code | Mô tả |
|---|---|---|
| Quản trị viên | `SUPER_ADMIN` | Toàn quyền, quản lý tài khoản, cấu hình hệ thống |
| Thủ kho | `INVENTORY_MANAGER` | Nhập hàng, thu cũ, kiểm định, tồn kho |
| Kiểm định viên | `QC_INSPECTOR` | Kiểm định thiết bị |
| Nhân viên bán hàng | `SALES_STAFF` | POS, tạo đơn hàng, xem tồn kho |
| Kế toán | `ACCOUNTANT` | Xem báo cáo, xuất dữ liệu |

---

## Database Schema (tóm tắt)

```
User                    — Tài khoản người dùng
Warehouse               — Kho hàng (có manager là User)
Category                — Danh mục sản phẩm
Brand                   — Thương hiệu
ProductTemplate         — Mẫu sản phẩm (loại thiết bị)
AttributeGroup          — Nhóm thuộc tính (VD: Bộ nhớ, Màu sắc)
InboundRequest          — Phiếu nhập hàng (SUPPLIER / CUSTOMER_TRADE_IN)
  └── InboundItem       — Mặt hàng trong phiếu nhập
TradeInProgram          — Chương trình thu cũ (FK → InboundRequest)
SerialItem              — Thiết bị vật lý (serial / IMEI)
StockMovement           — Biến động tồn kho
OutboundRequest         — Phiếu xuất / đơn bán
  └── OutboundItem      — Mặt hàng trong phiếu xuất
SaleOrder               — Đơn hàng bán (POS / online)
```

---

## Deploy Vercel

`vercel.json` cấu hình:

- Build frontend → `apps/web/dist`
- Build backend NestJS → `apps/backend/dist`
- Expose API qua `api/index.ts` (serverless function)
- Rewrite `/api/v1/*` → NestJS serverless handler

```bash
# Deploy production
vercel --prod
```

---

## Ghi chú phát triển

- **Prisma types**: Sau khi thay đổi `schema.prisma`, chạy `npx prisma generate` trong `apps/backend/` rồi **restart toàn bộ process** (webpack watch giữ cache cũ trong bộ nhớ).
- **GridFS**: Ảnh sản phẩm được lưu trong MongoDB GridFS, không phải filesystem. Endpoint: `GET /api/v1/upload/image/:id`.
- **Soft delete**: User và TradeInProgram dùng `isActive: false` thay vì xóa thật.
- **Serial tracking**: Mỗi thiết bị được theo dõi qua serial/IMEI. Tồn kho tính live từ `SerialItem` (loại trừ trạng thái `SOLD` và `DISPOSED`).
- **Rate limiting**: Backend throttle 100 requests/60 giây per IP.
