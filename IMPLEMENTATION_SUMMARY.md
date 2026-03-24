# TÓM TẮT IMPLEMENTATION - STOCK LEVEL & MOVEMENT

## ✅ ĐÃ HOÀN THÀNH

### 1. Database Schema
- ✅ Thêm model `StockLevel` với đầy đủ các trạng thái:
  - `physicalQty` - Tổng tồn vật lý
  - `incomingQty` - Chờ QC
  - `qcInProgressQty` - Đang QC
  - `availableQty` - Sẵn sàng bán ⭐
  - `reservedQty` - Đã đặt trước
  - `refurbishingQty` - Đang sửa
  - `damagedQty` - Hỏng
  - `returnedQty` - Trả lại

- ✅ Thêm model `StockMovement` để track xuất nhập:
  - Ghi lại mọi biến động IN/OUT kho vật lý
  - Link đến SerialItem cụ thể
  - Snapshot balance before/after

- ✅ Thêm enum `MovementType`:
  - IN, OUT, TRANSFER_IN, TRANSFER_OUT, ADJUSTMENT, RESERVE, UNRESERVE

- ✅ Migration thành công: `20260309104655_add_stock_level_and_movement`

### 2. Stock Service
- ✅ Tạo `StockService` với các chức năng:
  - `getOrCreateStockLevel()` - Lấy hoặc tạo stock level
  - `updateStockLevelOnStatusChange()` - Tự động cập nhật khi đổi status
  - `recalculateStockLevel()` - Tính lại từ SerialItems (sync)
  - `getStockLevelsByWarehouse()` - Query tồn kho theo kho
  - `getStockLevelsByProduct()` - Query tồn kho theo sản phẩm
  - `getLowStockProducts()` - Sản phẩm sắp hết
  - `getStockMovements()` - Lịch sử xuất nhập

### 3. Stock Controller
- ✅ Tạo `StockController` với các API:
  - `GET /stock/levels?warehouseId=xxx` - Xem tồn kho
  - `GET /stock/levels/product/:productId` - Tồn kho 1 sản phẩm
  - `GET /stock/low-stock` - Sản phẩm sắp hết
  - `GET /stock/movements` - Lịch sử xuất nhập
  - `POST /stock/recalculate/:productId/:warehouseId` - Sync lại

### 4. Integration
- ✅ Thêm `StockModule` vào `AppModule`
- ✅ Import `StockModule` vào `InboundModule`
- ✅ Inject `StockService` vào `InboundService`
- ✅ Tự động cập nhật stock level khi complete inbound

---

## 🔄 CẦN HOÀN THIỆN

### 1. Tích hợp vào các module khác

#### SerialItemsModule
**File:** `apps/backend/src/modules/serial-items/serial-items.module.ts`
```typescript
import { StockModule } from '../stock/stock.module';

@Module({
  imports: [StockModule], // Thêm dòng này
  // ...
})
```

**File:** `apps/backend/src/modules/serial-items/serial-items.service.ts`
```typescript
import { StockService } from '../stock/stock.service';

export class SerialItemsService {
  constructor(
    private prisma: PrismaService,
    private stockService: StockService, // Inject
  ) {}

  // Trong updateStatus()
  async updateStatus(...) {
    // ... existing code ...
    
    // ⭐ Thêm sau khi update status
    await this.stockService.updateStockLevelOnStatusChange(
      id,
      oldStatus,
      newStatus,
      userId,
    );
  }
}
```

#### QCInspectionModule
Khi complete QC và chuyển status INCOMING → AVAILABLE:
```typescript
await this.stockService.updateStockLevelOnStatusChange(
  serialItemId,
  SerialStatus.INCOMING,
  SerialStatus.AVAILABLE,
  userId,
);
```

#### POSModule / SalesModule
Khi bán hàng (AVAILABLE → SOLD):
```typescript
await this.stockService.updateStockLevelOnStatusChange(
  serialItemId,
  SerialStatus.AVAILABLE,
  SerialStatus.SOLD,
  userId,
);
```

#### OutboundModule
Khi xuất kho (RESERVED → SOLD/DISPOSED):
```typescript
await this.stockService.updateStockLevelOnStatusChange(
  serialItemId,
  SerialStatus.RESERVED,
  SerialStatus.SOLD, // hoặc DISPOSED
  userId,
);
```

---

## 📊 CÁCH SỬ DỤNG

### 1. Xem tồn kho theo warehouse
```bash
GET /stock/levels?warehouseId=xxx

Response:
[
  {
    "id": "...",
    "productTemplate": {
      "name": "iPhone 15 Pro Max 256GB",
      "sku": "IP15PM-256"
    },
    "warehouse": {
      "name": "Kho chính Celebi"
    },
    "grade": "GRADE_A",
    "physicalQty": 45,
    "availableQty": 32,
    "reservedQty": 8,
    "qcInProgressQty": 2,
    "refurbishingQty": 3,
    "averageCost": 30000000,
    "totalValue": 1350000000
  }
]
```

### 2. Xem sản phẩm sắp hết
```bash
GET /stock/low-stock?warehouseId=xxx

Response: Các sản phẩm có availableQty <= reorderPoint
```

### 3. Xem lịch sử xuất nhập
```bash
GET /