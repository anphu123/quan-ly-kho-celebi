# ĐỀ XUẤT GIẢI PHÁP CẢI THIỆN HỆ THỐNG KHO

## 🎯 MỤC TIÊU

Nâng cấp hệ thống quản lý kho từ **serial-tracking đơn giản** lên **hệ thống ERP kho đầy đủ** với:
- Tồn kho tổng hợp real-time
- Báo cáo xuất nhập tồn chuẩn
- Chuyển kho nội bộ hoàn chỉnh
- Kiểm kê định kỳ
- Performance tốt với 100k+ serial items

---

## 📋 PHASE 1: STOCK LEVEL & MOVEMENT (2-3 ngày)

### 1.1. Thêm bảng StockLevel vào schema

**File:** `apps/backend/prisma/schema.prisma`

```prisma
// Thêm sau model Warehouse
model StockLevel {
  id                String   @id @default(cuid())
  productTemplateId String
  warehouseId       String
  grade             Grade?
  
  // ===== TỒN KHO THEO TRẠNG THÁI =====
  // Tồn vật lý = tổng tất cả trong kho
  physicalQty       Int      @default(0)
  
  // Phân tích chi tiết theo status
  incomingQty       Int      @default(0) // INCOMING - Chờ QC
  qcInProgressQty   Int      @default(0) // QC_IN_PROGRESS - Đang thẩm định
  availableQty      Int      @default(0) // AVAILABLE - Sẵn sàng bán ⭐ QUAN TRỌNG
  reservedQty       Int      @default(0) // RESERVED - Đã đặt trước
  refurbishingQty   Int      @default(0) // REFURBISHING - Đang sửa chữa
  damagedQty        Int      @default(0) // DAMAGED - Hỏng
  returnedQty       Int      @default(0) // RETURNED - Trả lại
  
  // physicalQty = sum of all above
  // availableQty = số lượng có thể bán ngay
  
  // ===== GIÁ TRỊ =====
  averageCost       Decimal  @db.Decimal(15, 2)
  totalValue        Decimal  @db.Decimal(15, 2)
  
  // ===== NGƯỠNG CẢNH BÁO =====
  minStockLevel     Int      @default(5)
  maxStockLevel     Int      @default(100)
  reorderPoint      Int      @default(10)
  
  // Relations
  productTemplate ProductTemplate @relation(fields: [productTemplateId], references: [id])
  warehouse       Warehouse       @relation(fields: [warehouseId], references: [id])
  
  lastUpdated DateTime @updatedAt
  createdAt   DateTime @default(now())
  
  @@unique([productTemplateId, warehouseId, grade])
  @@index([warehouseId, availableQty]) // Index cho tồn khả dụng
  @@index([productTemplateId, physicalQty])
  @@map("stock_levels")
}
```

### 1.2. Thêm bảng StockMovement

```prisma
model StockMovement {
  id                String       @id @default(cuid())
  productTemplateId String
  warehouseId       String
  
  type              MovementType
  quantity          Int          // +/- số lượng
  
  // Reference to source document
  referenceType     String?      // "INBOUND", "SALES", "OUTBOUND", "TRANSFER", "ADJUSTMENT"
  referenceId       String?      // ID của phiếu nguồn
  serialItemId      String?      // Link to specific serial item
  
  // Financial
  unitCost          Decimal      @db.Decimal(15, 2)
  totalValue        Decimal      @db.Decimal(15, 2)
  
  // Stock level snapshot
  balanceBefore     Int          // Tồn trước khi di chuyển
  balanceAfter      Int          // Tồn sau khi di chuyển
  
  notes             String?
  createdById       String
  
  // Relations
  productTemplate ProductTemplate @relation(fields: [productTemplateId], references: [id])
  warehouse       Warehouse       @relation(fields: [warehouseId], references: [id])
  createdBy       User            @relation(fields: [createdById], references: [id])
  
  createdAt DateTime @default(now())
  
  @@index([productTemplateId, warehouseId, createdAt])
  @@index([referenceType, referenceId])
  @@map("stock_movements")
}

enum MovementType {
  IN           // Nhập kho
  OUT          // Xuất kho
  TRANSFER_OUT // Chuyển đi
  TRANSFER_IN  // Chuyển đến
  ADJUSTMENT   // Điều chỉnh kiểm kê
  RESERVE      // Đặt trước
  UNRESERVE    // Hủy đặt trước
}
```

### 1.3. Update ProductTemplate relation

```prisma
model ProductTemplate {
  // ... existing fields
  
  stockLevels   StockLevel[]     // Thêm relation
  stockMovements StockMovement[]  // Thêm relation
}

model Warehouse {
  // ... existing fields
  
  stockLevels    StockLevel[]     // Thêm relation
  stockMovements StockMovement[]  // Thêm relation
}
```

### 1.4. Chạy migration

```bash
cd apps/backend
npx prisma migrate dev --name add_stock_level_and_movement
```

---

## 📋 PHASE 2: STOCK SERVICE (1-2 ngày)

### 2.1. Tạo Stock Service

**File:** `apps/backend/src/modules/stock/stock.service.ts`
