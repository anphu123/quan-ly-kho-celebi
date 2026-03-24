# PHÂN TÍCH LUỒNG XUẤT NHẬP TỒN KHO

## 📊 TỔNG QUAN HỆ THỐNG

Hệ thống quản lý kho theo mô hình **SERIAL-BASED** (quản lý từng cá thể sản phẩm), phù hợp cho đồ điện tử cũ có IMEI/Serial Number.

### Đặc điểm chính:
- ✅ Mỗi sản phẩm là 1 SerialItem độc lập (không quản lý theo số lượng)
- ✅ Theo dõi lịch sử di chuyển qua SerialTransaction
- ✅ Hỗ trợ QC grading (Grade A → D)
- ✅ Quản lý vị trí chi tiết (BinLocation)
- ✅ Tích hợp sửa chữa/tân trang

---

## 🔄 LUỒNG CHÍNH

### 1️⃣ NHẬP KHO (INBOUND)

**Module:** `apps/backend/src/modules/inbound/`

#### Quy trình:
```
1. Tạo InboundRequest (REQUESTED)
   ↓
2. Bắt đầu nhận hàng (IN_PROGRESS)
   ↓
3. Nhập từng item → Tạo SerialItem
   ↓
4. Hoàn thành (COMPLETED)
```

#### Chi tiết kỹ thuật:

**Bước 1: Tạo yêu cầu nhập**
- API: `POST /inbound`
- Tạo InboundRequest với status = REQUESTED
- Thêm danh sách InboundItem (chưa có SerialItem)

**Bước 2: Bắt đầu nhận hàng**
- API: `POST /inbound/:id/start-receiving`
- Chuyển status → IN_PROGRESS
- Cho phép nhập từng item

**Bước 3: Hoàn thành nhập kho** ⭐ QUAN TRỌNG
- API: `POST /inbound/complete`
- Service: `completeInboundRequest()`
- Logic:
  ```typescript
  for each InboundItem:
    1. Tạo SerialItem mới
       - status = INCOMING
       - purchasePrice = giá thu mua
       - warehouseId = kho đích
       - binLocation = vị trí cụ thể
    
    2. Tạo SerialTransaction
       - type = INBOUND
       - fromStatus = null
       - toStatus = INCOMING
       - costChange = purchasePrice
    
    3. Update InboundItem
       - isReceived = true
       - serialItemId = link to SerialItem
  ```

#### ⚠️ VẤN ĐỀ PHÁT HIỆN:

**1. Không có cập nhật tồn kho tổng hợp**
- SerialItem được tạo nhưng không có bảng StockLevel tổng hợp
- Phải query SerialItem.groupBy() mỗi lần → CHẬM với dữ liệu lớn

**2. Thiếu validation tồn kho kho**
- Không check maxCapacity của Warehouse
- Không check maxItems của BinLocation

**3. Giá vốn không được cập nhật đầy đủ**
- currentCostPrice = purchasePrice ban đầu
- Không tự động cộng chi phí sửa chữa sau này

---

### 2️⃣ QC & GRADING

**Module:** `apps/backend/src/modules/qc-inspection/`

#### Quy trình:
```
INCOMING → QC_IN_PROGRESS → AVAILABLE/REFURBISHING/DAMAGED
```

#### Chi tiết:
1. Tạo QCInspection cho SerialItem
2. Thẩm định theo QCTemplate
3. Tính điểm → Gợi ý Grade
4. Cập nhật SerialItem:
   - status → AVAILABLE (nếu pass)
   - grade → GRADE_A/B/C...
   - suggestedPrice (dựa trên grade)

#### ⚠️ VẤN ĐỀ:

**1. Không tự động chuyển status sau QC**
- Phải manual update status
- Thiếu API `completeQC()` tự động

**2. Giá bán không tự động tính**
- suggestedPrice không được set theo grade
- Thiếu công thức: `baseRetailPrice * gradeMultiplier`

---

### 3️⃣ TỒN KHO (INVENTORY)

**Module:** `apps/backend/src/modules/masterdata/inventory.service.ts`

#### API hiện tại:
- `GET /inventory/stock-levels` - Xem tồn kho theo sản phẩm/kho/grade

#### Cách tính:
```typescript
SerialItem.groupBy({
  by: ['productTemplateId', 'warehouseId', 'grade'],
  where: { status: 'AVAILABLE' },
  _count: { id: true },
  _avg: { currentCostPrice, suggestedPrice }
})
```

#### ⚠️ VẤN ĐỀ NGHIÊM TRỌNG:

**1. Không có bảng tồn kho tổng hợp**
- Mỗi lần xem tồn phải groupBy toàn bộ SerialItem
- Với 100k+ serial items → Query RẤT CHẬM
- Không có snapshot tồn kho theo thời gian

**2. Không theo dõi biến động tồn**
- Không biết tồn đầu kỳ, nhập, xuất, tồn cuối kỳ
- Không có báo cáo xuất nhập tồn chuẩn

**3. Thiếu cảnh báo tồn kho**
- Có field minStockLevel, maxStockLevel nhưng không dùng
- Không có notification khi hết hàng

---

### 4️⃣ XUẤT KHO (OUTBOUND)

**Module:** `apps/backend/src/modules/outbound/`

#### Các loại xuất:
1. **SALE** - Bán hàng (qua POS)
2. **RETURN_TO_VENDOR** - Trả hàng nhà cung cấp
3. **DISPOSAL** - Thanh lý hỏng
4. **INTERNAL_TRANSFER** - Chuyển kho nội bộ

#### Quy trình 2 bước:

**Bước 1: Tạo yêu cầu xuất (Reserve)**
- API: `POST /outbound/request`
- Logic:
  ```typescript
  for each item:
    1. Update SerialItem.status → RESERVED
    2. Create SerialTransaction
       - type = RESERVED
       - notes = "outbound {code} - {type}"
  ```

**Bước 2: Xác nhận xuất**
- API: `POST /outbound/process`
- Logic:
  ```typescript
  for each reserved item:
    if confirmed:
      - Update status → SOLD/RETURNED/DISPOSED
      - Create transaction (type = SOLD/RETURNED/DISPOSAL)
    else:
      - Rollback status → AVAILABLE
  ```

#### ⚠️ VẤN ĐỀ:

**1. Không có bảng Outbound riêng**
- Chỉ dùng SerialTransaction để track
- Khó query "danh sách phiếu xuất kho"
- Không có thông tin người nhận, lý do chi tiết

**2. INTERNAL_TRANSFER không hoàn chỉnh**
- Chỉ đổi status → RESERVED
- Không có logic chuyển sang kho đích
- Thiếu bảng StockTransfer

**3. Không validate tồn kho trước xuất**
- Không check item có đang AVAILABLE không
- Có thể xuất item đang QC/REFURBISHING

---

### 5️⃣ BÁN HÀNG (POS/SALES)

**Module:** `apps/backend/src/modules/pos/` & `sales/`

#### Quy trình:
```
1. Tạo SalesOrder (DRAFT)
2. Thêm SerialItem vào SalesOrderItem
3. Xác nhận → Update SerialItem.status = SOLD
4. Tạo SerialTransaction (type = SOLD)
```

#### ⚠️ VẤN ĐỀ:

**1. Trùng logic với Outbound**
- POS tự update status = SOLD
- Outbound cũng có type = SALE
- Nên merge thành 1 luồng

**2. Không tự động trừ tồn**
- Vì không có bảng StockLevel
- Phải re-query để biết còn bao nhiêu

---

## 🚨 CÁC VẤN ĐỀ NGHIÊM TRỌNG CẦN SỬA

### ❌ 1. THIẾU BẢNG STOCK_LEVEL TỔNG HỢP

**Vấn đề:**
- Không có bảng lưu tồn kho tổng hợp theo sản phẩm/kho
- Mỗi lần xem tồn phải groupBy SerialItem → CHẬM

**Giải pháp:**
Tạo bảng `StockLevel`:
```prisma
model StockLevel {
  id                String  @id @default(cuid())
  productTemplateId String
  warehouseId       String
  grade             Grade?
  
  quantity          Int     @default(0)
  averageCost       Decimal @db.Decimal(15, 2)
  totalValue        Decimal @db.Decimal(15, 2)
  
  // Thresholds
  minStockLevel     Int     @default(5)
  maxStockLevel     Int     @default(100)
  reorderPoint      Int     @default(10)
  
  lastUpdated       DateTime @updatedAt
  
  @@unique([productTemplateId, warehouseId, grade])
  @@map("stock_levels")
}
```

**Cập nhật tự động:**
- Khi tạo SerialItem (INBOUND) → +1
- Khi đổi status → SOLD/DISPOSED → -1
- Khi chuyển kho → -1 kho cũ, +1 kho mới

---

### ❌ 2. THIẾU BẢNG STOCK_MOVEMENT (XUẤT NHẬP TỒN)

**Vấn đề:**
- Không có báo cáo xuất nhập tồn chuẩn
- Không biết tồn đầu kỳ, nhập, xuất, tồn cuối kỳ

**Giải pháp:**
Tạo bảng `StockMovement`:
```prisma
model StockMovement {
  id                String   @id @default(cuid())
  productTemplateId String
  warehouseId       String
  
  type              MovementType // IN, OUT, TRANSFER, ADJUSTMENT
  quantity          Int
  
  // Reference
  referenceType     String?  // "INBOUND", "SALES", "OUTBOUND"
  referenceId       String?  // ID của phiếu
  serialItemId      String?  // Link to serial item
  
  // Values
  unitCost          Decimal  @db.Decimal(15, 2)
  totalValue        Decimal  @db.Decimal(15, 2)
  
  notes             String?
  createdById       String
  createdAt         DateTime @default(now())
  
  @@index([productTemplateId, warehouseId, createdAt])
  @@map("stock_movements")
}

enum MovementType {
  IN           // Nhập kho
  OUT          // Xuất kho
  TRANSFER_OUT // Chuyển đi
  TRANSFER_IN  // Chuyển đến
  ADJUSTMENT   // Điều chỉnh (kiểm kê)
}
```

**Trigger tự động:**
- Inbound complete → Create movement (type=IN)
- Sales complete → Create movement (type=OUT)
- Transfer → Create 2 movements (OUT + IN)

---

### ❌ 3. INTERNAL_TRANSFER KHÔNG HOÀN CHỈNH

**Vấn đề:**
- Chỉ đổi status → RESERVED
- Không có logic chuyển warehouseId

**Giải pháp:**
Tạo bảng `StockTransfer`:
```prisma
model StockTransfer {
  id              String         @id @default(cuid())
  code            String         @unique
  fromWarehouseId String
  toWarehouseId   String
  status          TransferStatus @default(PENDING)
  
  requestedById   String
  approvedById    String?
  receivedById    String?
  
  requestedAt     DateTime       @default(now())
  approvedAt      DateTime?
  completedAt     DateTime?
  
  notes           String?
  
  items           TransferItem[]
  
  @@map("stock_transfers")
}

model TransferItem {
  id           String  @id @default(cuid())
  transferId   String
  serialItemId String
  
  notes        String?
  
  transfer     StockTransfer @relation(fields: [transferId], references: [id])
  serialItem   SerialItem    @relation(fields: [serialItemId], references: [id])
  
  @@map("transfer_items")
}

enum TransferStatus {
  PENDING    // Chờ duyệt
  APPROVED   // Đã duyệt, chờ chuyển
  IN_TRANSIT // Đang vận chuyển
  COMPLETED  // Đã nhận
  CANCELLED  // Hủy
}
```

**Quy trình:**
1. Tạo StockTransfer (PENDING)
2. Approve → APPROVED, update SerialItem.status = RESERVED
3. Ship → IN_TRANSIT
4. Receive → COMPLETED, update SerialItem.warehouseId + status = AVAILABLE

---

### ❌ 4. KHÔNG CÓ KIỂM KÊ (STOCKTAKE)

**Vấn đề:**
- Có model Stocktake trong schema nhưng không implement
- Không có API để kiểm kê

**Giải pháp:**
Implement module Stocktake:
```typescript
// API endpoints:
POST   /stocktake          // Tạo phiếu kiểm kê
POST   /stocktake/:id/start // Bắt đầu kiểm
POST   /stocktake/:id/count // Nhập số lượng thực tế
POST   /stocktake/:id/complete // Hoàn thành → Tạo adjustment
```

---

### ❌ 5. GIÁ VỐN KHÔNG TỰ ĐỘNG CẬP NHẬT

**Vấn đề:**
- currentCostPrice = purchasePrice ban đầu
- Khi sửa chữa, chi phí không cộng vào giá vốn

**Giải pháp:**
Trong `RefurbishmentJob.complete()`:
```typescript
await prisma.serialItem.update({
  where: { id: serialItemId },
  data: {
    currentCostPrice: {
      increment: actualCost // Cộng thêm chi phí sửa
    }
  }
})
```

---

### ❌ 6. KHÔNG CÓ BÁO CÁO TỒN KHO

**Thiếu các báo cáo:**
- Xuất nhập tồn theo kỳ
- Tồn kho theo sản phẩm/kho/grade
- Hàng tồn lâu (aging)
- Hàng sắp hết
- Giá trị tồn kho

**Giải pháp:**
Tạo module Reports với các API:
```typescript
GET /reports/stock-summary        // Tổng hợp tồn kho
GET /reports/stock-movement       // Xuất nhập tồn
GET /reports/aging-analysis       // Phân tích hàng tồn lâu
GET /reports/low-stock            // Hàng sắp hết
GET /reports/inventory-valuation  // Định giá tồn kho
```

---

## ✅ KHUYẾN NGHỊ ƯU TIÊN

### 🔥 CRITICAL (Làm ngay):
1. ✅ Tạo bảng `StockLevel` + trigger tự động cập nhật
2. ✅ Tạo bảng `StockMovement` để track xuất nhập tồn
3. ✅ Fix giá vốn tự động cộng chi phí sửa chữa

### 🟡 HIGH (Làm trong 1-2 tuần):
4. ✅ Implement `StockTransfer` hoàn chỉnh
5. ✅ Implement module Stocktake
6. ✅ Tạo báo cáo xuất nhập tồn cơ bản

### 🟢 MEDIUM (Làm sau):
7. ✅ Merge logic POS và Outbound
8. ✅ Thêm validation tồn kho (maxCapacity, minStock)
9. ✅ Tạo notification hết hàng

---

## 📝 KẾT LUẬN

Hệ thống hiện tại có **nền tảng tốt** với serial-based tracking, nhưng còn **thiếu các tính năng quản lý tồn kho chuẩn**:

**Điểm mạnh:**
- ✅ Tracking từng serial item chi tiết
- ✅ Lịch sử giao dịch đầy đủ
- ✅ Hỗ trợ QC grading
- ✅ Quản lý vị trí bin location

**Điểm yếu:**
- ❌ Không có tồn kho tổng hợp → Query chậm
- ❌ Không có báo cáo xuất nhập tồn
- ❌ Chuyển kho nội bộ chưa hoàn chỉnh
- ❌ Không có kiểm kê
- ❌ Giá vốn không tự động cập nhật

**Cần làm ngay:** Tạo bảng StockLevel và StockMovement để hệ thống có thể scale với dữ liệu lớn.
