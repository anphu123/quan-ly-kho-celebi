# ✅ HOÀN THÀNH: STOCK LEVEL & MOVEMENT TRACKING

## 📦 ĐÃ IMPLEMENT

### 1. Database Schema ✅

**Bảng StockLevel** - Tồn kho tổng hợp
```prisma
model StockLevel {
  // Phân loại tồn theo trạng thái
  physicalQty       Int  // Tổng trong kho
  incomingQty       Int  // Chờ QC
  qcInProgressQty   Int  // Đang QC
  availableQty      Int  // Sẵn bán ⭐
  reservedQty       Int  // Đã đặt
  refurbishingQty   Int  // Đang sửa
  damagedQty        Int  // Hỏng
  returnedQty       Int  // Trả lại
  
  // Giá trị
  averageCost       Decimal
  totalValue        Decimal
  
  // Ngưỡng cảnh báo
  minStockLevel     Int
  maxStockLevel     Int
  reorderPoint      Int
}
```

**Bảng StockMovement** - Lịch sử xuất nhập
```prisma
model StockMovement {
  type              MovementType  // IN, OUT, TRANSFER, ADJUSTMENT
  quantity          Int
  
  // Nguồn hàng
  referenceType     String?  // "INBOUND", "SALES", "OUTBOUND"
  referenceId       String?  // ID phiếu nguồn
  serialItemId      String?
  
  // Giá trị
  unitCost          Decimal
  totalValue        Decimal
  
  // Snapshot
  balanceBefore     Int
  balanceAfter      Int
  
  notes             String?  // Chứa thông tin nguồn hàng
}
```

**Enum MovementType**
- IN - Nhập kho
- OUT - Xuất kho
- TRANSFER_OUT - Chuyển đi
- TRANSFER_IN - Chuyển đến
- ADJUSTMENT - Điều chỉnh kiểm kê
- RESERVE - Đặt trước
- UNRESERVE - Hủy đặt trước

---

### 2. Backend Services ✅

**StockService** (`apps/backend/src/modules/stock/stock.service.ts`)

Các method chính:

1. **getOrCreateStockLevel()** - Lấy hoặc tạo stock level
2. **updateStockLevelOnStatusChange()** - Tự động cập nhật khi đổi status
   - Tự động phân loại tồn theo status
   - Tạo StockMovement khi IN/OUT kho
   - Track nguồn hàng (CUSTOMER_TRADE_IN, LIQUIDATION, etc.)
3. **recalculateStockLevel()** - Tính lại tồn từ SerialItems
4. **getAllStockLevels()** - Lấy tất cả tồn kho
5. **getStockLevelsByWarehouse()** - Tồn kho theo kho
6. **getStockLevelsByProduct()** - Tồn kho theo sản phẩm
7. **getLowStockProducts()** - Sản phẩm sắp hết
8. **getStockMovements()** - Lịch sử xuất nhập
9. **getInboundBySource()** - Báo cáo nhập theo nguồn ⭐ NEW

---

### 3. API Endpoints ✅

**StockController** (`apps/backend/src/modules/stock/stock.controller.ts`)

```
GET    /stock/levels?warehouseId=xxx
       → Lấy tồn kho (tất cả hoặc theo kho)

GET    /stock/levels/product/:productId
       → Tồn kho của 1 sản phẩm ở tất cả kho

GET    /stock/low-stock?warehouseId=xxx
       → Sản phẩm sắp hết hàng

GET    /stock/movements?productId=xxx&warehouseId=xxx&startDate=xxx&endDate=xxx
       → Lịch sử xuất nhập tồn

POST   /stock/recalculate/:productId/:warehouseId?grade=xxx
       → Tính lại tồn kho (sync)

GET    /stock/reports/inbound-by-source?warehouseId=xxx&startDate=xxx&endDate=xxx
       → Báo cáo nhập kho theo nguồn hàng ⭐ NEW
```

---

### 4. Tích hợp tự động ✅

**InboundService** - Tự động cập nhật khi nhập hàng
```typescript
// Trong completeInboundRequest()
await this.stockService.updateStockLevelOnStatusChange(
  serialItem.id,
  null,
  SerialStatus.INCOMING,
  userId,
  'INBOUND',
  request.id,  // Track nguồn
);
```

**SerialItemsService** - Tự động cập nhật khi đổi status
```typescript
// Trong updateStatus()
await this.stockService.updateStockLevelOnStatusChange(
  id,
  oldStatus,
  newStatus,
  userId,
);
```

---

### 5. Tracking nguồn hàng ✅

Hệ thống track 4 loại nguồn hàng (từ SupplierType):

1. **CUSTOMER_TRADE_IN** - Khách hàng đổi cũ lấy mới
2. **INTERNAL_RETURN** - Hàng trả lại nội bộ
3. **LIQUIDATION** - Thanh lý từ doanh nghiệp
4. **INDIVIDUAL_SELLER** - Người bán lẻ

Thông tin nguồn được lưu trong:
- `StockMovement.notes` - Format: "Nhập kho từ: {SupplierType} - {SupplierName} | ..."
- `StockMovement.referenceType` - "INBOUND"
- `StockMovement.referenceId` - ID của InboundRequest

API `GET /stock/reports/inbound-by-source` phân tích và group theo nguồn.

---

## 🎯 CÁCH HOẠT ĐỘNG

### Luồng nhập kho:

```
1. Tạo InboundRequest
   - supplierType: CUSTOMER_TRADE_IN
   - supplierName: "Nguyễn Văn A"

2. Complete inbound → Tạo SerialItem
   - status: INCOMING
   
3. StockService tự động:
   ✅ Tạo/Update StockLevel
      - physicalQty += 1
      - incomingQty += 1
   
   ✅ Tạo StockMovement
      - type: IN
      - referenceType: "INBOUND"
      - referenceId: inboundRequest.id
      - notes: "Nhập kho từ: CUSTOMER_TRADE_IN - Nguyễn Văn A"
```

### Luồng đổi status:

```
SerialItem: INCOMING → AVAILABLE

StockService tự động:
   ✅ Update StockLevel
      - incomingQty -= 1
      - availableQty += 1
   
   ❌ KHÔNG tạo StockMovement
      (vì vẫn trong kho, chỉ đổi trạng thái)
```

### Luồng xuất kho (bán):

```
SerialItem: AVAILABLE → SOLD

StockService tự động:
   ✅ Update StockLevel
      - availableQty -= 1
      - physicalQty -= 1
   
   ✅ Tạo StockMovement
      - type: OUT
      - referenceType: "SALES"
      - notes: "Xuất kho: AVAILABLE → SOLD"
```

---

## 📊 DỮ LIỆU MẪU

### StockLevel Example:
```json
{
  "id": "clx123",
  "productTemplateId": "ip15pm",
  "warehouseId": "wh-main",
  "grade": "GRADE_A",
  
  "physicalQty": 45,
  "incomingQty": 2,
  "qcInProgressQty": 0,
  "availableQty": 32,
  "reservedQty": 8,
  "refurbishingQty": 3,
  "damagedQty": 0,
  "returnedQty": 0,
  
  "averageCost": 30000000,
  "totalValue": 1350000000,
  
  "minStockLevel": 5,
  "maxStockLevel": 100,
  "reorderPoint": 10
}
```

### StockMovement Example:
```json
{
  "id": "mov123",
  "type": "IN",
  "quantity": 1,
  "referenceType": "INBOUND",
  "referenceId": "inb-001",
  "serialItemId": "ser-123",
  "unitCost": 28000000,
  "totalValue": 28000000,
  "balanceBefore": 44,
  "balanceAfter": 45,
  "notes": "Nhập kho từ: CUSTOMER_TRADE_IN - Nguyễn Văn A | Status: null → INCOMING",
  "createdAt": "2024-03-09T10:30:00Z"
}
```

---

## ✅ CHECKLIST HOÀN THÀNH

- [x] Schema: StockLevel model
- [x] Schema: StockMovement model
- [x] Schema: MovementType enum
- [x] Migration: add_stock_level_and_movement
- [x] Service: StockService với đầy đủ methods
- [x] Controller: StockController với API endpoints
- [x] Module: StockModule
- [x] Integration: InboundService tự động update
- [x] Integration: SerialItemsService tự động update
- [x] Tracking: Nguồn hàng (SupplierType)
- [x] Report: Báo cáo nhập theo nguồn
- [x] Build: Backend compile thành công

---

## 🚀 TIẾP THEO

### Frontend cần làm:

1. **Stock Levels Page** - Trang tồn kho tổng hợp
   - Hiển thị tồn theo sản phẩm/kho/grade
   - Phân loại theo status (incoming, available, reserved, etc.)
   - Cảnh báo sắp hết hàng
   - Filter theo kho, sản phẩm, grade

2. **Stock Movements Page** - Lịch sử xuất nhập
   - Bảng movements với filter
   - Chart xuất nhập theo thời gian
   - Báo cáo theo nguồn hàng

3. **Dashboard Widget** - Thống kê tồn kho
   - Tổng tồn vật lý
   - Tồn khả dụng
   - Sắp hết hàng
   - Giá trị tồn

4. **Integration** - Tích hợp vào các page hiện có
   - Warehouse Detail: Hiển thị stock level
   - Product Detail: Hiển thị tồn ở các kho
   - Inbound: Hiển thị impact lên tồn kho

---

## 📝 GHI CHÚ KỸ THUẬT

### Performance:
- StockLevel được index trên `availableQty` và `physicalQty`
- StockMovement được index trên `createdAt` và `referenceId`
- Query tồn kho NHANH vì đã tổng hợp sẵn

### Data Integrity:
- Dùng transaction để đảm bảo consistency
- StockLevel có thể recalculate từ SerialItems
- Cascade delete khi xóa product/warehouse

### Extensibility:
- Dễ thêm loại movement mới (enum MovementType)
- Dễ thêm nguồn hàng mới (enum SupplierType)
- referenceType/referenceId linh hoạt cho nhiều loại phiếu
