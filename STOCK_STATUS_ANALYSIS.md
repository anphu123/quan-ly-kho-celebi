# PHÂN TÍCH TRẠNG THÁI VÀ TỒN KHO

## 🔄 CÁC TRẠNG THÁI SERIALITEM

### Lifecycle của 1 sản phẩm:

```
┌─────────────────────────────────────────────────────────────┐
│                    VÒNG ĐỜI SẢN PHẨM                        │
└─────────────────────────────────────────────────────────────┘

1. INCOMING          → Vừa nhập kho, chờ QC
   ↓
2. QC_IN_PROGRESS    → Đang thẩm định chất lượng
   ↓
   ├─→ 3a. AVAILABLE      → Pass QC, sẵn sàng bán
   │      ↓
   │      ├─→ RESERVED    → Khách đặt cọc/đang xử lý đơn
   │      │   ↓
   │      │   └─→ SOLD    → Đã bán (OUT khỏi kho)
   │      │
   │      └─→ RETURNED    → Khách trả lại
   │          ↓
   │          └─→ QC lại hoặc DISPOSED
   │
   └─→ 3b. REFURBISHING   → Cần sửa chữa
          ↓
          ├─→ AVAILABLE   → Sửa xong, lên kệ
          └─→ DAMAGED     → Sửa không được
              ↓
              └─→ DISPOSED → Thanh lý/hủy
```

---

## 📊 PHÂN LOẠI TRẠNG THÁI

### 🟢 TRONG KHO (In Stock)
Những trạng thái này sản phẩm **VẪN Ở TRONG KHO**:

1. **INCOMING** - Đã nhập kho vật lý, chờ QC
2. **QC_IN_PROGRESS** - Đang thẩm định
3. **AVAILABLE** - Sẵn sàng bán (tồn kho khả dụng)
4. **RESERVED** - Đã đặt trước (tồn kho đã cam kết)
5. **REFURBISHING** - Đang sửa chữa (trong kho sửa chữa)
6. **DAMAGED** - Hỏng, chờ thanh lý
7. **RETURNED** - Hàng trả lại, chờ xử lý

### 🔴 NGOÀI KHO (Out of Stock)
Những trạng thái này sản phẩm **ĐÃ RA KHỎI KHO**:

1. **SOLD** - Đã bán cho khách
2. **DISPOSED** - Đã thanh lý/hủy

---

## 📈 CÁCH TÍNH TỒN KHO

### 1. Tồn kho VẬT LÝ (Physical Stock)
**= Tất cả sản phẩm đang ở trong kho**

```sql
SELECT COUNT(*) 
FROM serial_items 
WHERE status IN (
  'INCOMING',
  'QC_IN_PROGRESS', 
  'AVAILABLE',
  'RESERVED',
  'REFURBISHING',
  'DAMAGED',
  'RETURNED'
)
AND warehouseId = ?
```

### 2. Tồn kho KHẢ DỤNG (Available Stock)
**= Sản phẩm có thể bán ngay**

```sql
SELECT COUNT(*) 
FROM serial_items 
WHERE status = 'AVAILABLE'
AND warehouseId = ?
```

### 3. Tồn kho ĐÃ CAM KẾT (Committed Stock)
**= Sản phẩm đã đặt trước, chưa xuất**

```sql
SELECT COUNT(*) 
FROM serial_items 
WHERE status = 'RESERVED'
AND warehouseId = ?
```

### 4. Tồn kho CHỜ XỬ LÝ (Pending Stock)
**= Sản phẩm chờ QC, sửa chữa, hoặc xử lý trả hàng**

```sql
SELECT COUNT(*) 
FROM serial_items 
WHERE status IN ('INCOMING', 'QC_IN_PROGRESS', 'REFURBISHING', 'RETURNED')
AND warehouseId = ?
```

### 5. Tồn kho HỎNG (Damaged Stock)
**= Sản phẩm hỏng, chờ thanh lý**

```sql
SELECT COUNT(*) 
FROM serial_items 
WHERE status = 'DAMAGED'
AND warehouseId = ?
```

---

## 🎯 CẤU TRÚC STOCKLEVEL MỚI

Dựa trên phân tích trên, bảng StockLevel cần track nhiều loại tồn:

```prisma
model StockLevel {
  id                String   @id @default(cuid())
  productTemplateId String
  warehouseId       String
  grade             Grade?
  
  // ===== PHÂN LOẠI TỒN KHO =====
  
  // Tồn vật lý (tổng số trong kho)
  physicalQty       Int      @default(0)
  
  // Phân tích theo trạng thái
  incomingQty       Int      @default(0) // Chờ QC
  qcInProgressQty   Int      @default(0) // Đang QC
  availableQty      Int      @default(0) // Sẵn sàng bán ⭐ QUAN TRỌNG
  reservedQty       Int      @default(0) // Đã đặt trước
  refurbishingQty   Int      @default(0) // Đang sửa
  damagedQty        Int      @default(0) // Hỏng
  returnedQty       Int      @default(0) // Trả lại
  
  // Tồn khả dụng thực tế = availableQty (không trừ reserved)
  // Vì reserved vẫn chưa xuất kho
  
  // ===== GIÁ TRỊ =====
  averageCost       Decimal  @db.Decimal(15, 2)
  totalValue        Decimal  @db.Decimal(15, 2)
  
  // ===== NGƯỠNG CẢNH BÁO =====
  minStockLevel     Int      @default(5)   // Tồn tối thiểu
  maxStockLevel     Int      @default(100) // Tồn tối đa
  reorderPoint      Int      @default(10)  // Điểm đặt hàng lại
  
  // Relations
  productTemplate ProductTemplate @relation(fields: [productTemplateId], references: [id])
  warehouse       Warehouse       @relation(fields: [warehouseId], references: [id])
  
  lastUpdated DateTime @updatedAt
  createdAt   DateTime @default(now())
  
  @@unique([productTemplateId, warehouseId, grade])
  @@index([warehouseId, availableQty]) // Index cho query tồn khả dụng
  @@map("stock_levels")
}
```

---

## 🔄 TRIGGER CẬP NHẬT STOCKLEVEL

### Khi nào cập nhật?

**1. Tạo SerialItem mới (Inbound)**
```typescript
// Status = INCOMING
physicalQty += 1
incomingQty += 1
```

**2. Chuyển status INCOMING → QC_IN_PROGRESS**
```typescript
incomingQty -= 1
qcInProgressQty += 1
```

**3. Chuyển status QC_IN_PROGRESS → AVAILABLE**
```typescript
qcInProgressQty -= 1
availableQty += 1
```

**4. Chuyển status AVAILABLE → RESERVED**
```typescript
availableQty -= 1
reservedQty += 1
```

**5. Chuyển status RESERVED → SOLD**
```typescript
physicalQty -= 1  // Ra khỏi kho
reservedQty -= 1
// Tạo StockMovement (type = OUT)
```

**6. Chuyển status AVAILABLE → REFURBISHING**
```typescript
availableQty -= 1
refurbishingQty += 1
```

**7. Chuyển status REFURBISHING → AVAILABLE**
```typescript
refurbishingQty -= 1
availableQty += 1
```

**8. Chuyển status REFURBISHING → DAMAGED**
```typescript
refurbishingQty -= 1
damagedQty += 1
```

**9. Chuyển status DAMAGED → DISPOSED**
```typescript
physicalQty -= 1  // Ra khỏi kho
damagedQty -= 1
// Tạo StockMovement (type = OUT, reason = DISPOSAL)
```

**10. Chuyển status SOLD → RETURNED**
```typescript
physicalQty += 1  // Vào lại kho
returnedQty += 1
// Tạo StockMovement (type = IN, reason = RETURN)
```

---

## 📊 BÁO CÁO TỒN KHO

### Dashboard Tồn Kho

```typescript
interface StockDashboard {
  // Tổng quan
  totalPhysical: number;      // Tổng tồn vật lý
  totalAvailable: number;     // Có thể bán
  totalReserved: number;      // Đã đặt trước
  totalPending: number;       // Chờ xử lý (incoming + qc + refurb + returned)
  totalDamaged: number;       // Hỏng
  
  // Giá trị
  totalValue: number;         // Tổng giá trị tồn
  availableValue: number;     // Giá trị có thể bán
  
  // Cảnh báo
  lowStockItems: number;      // Số SKU sắp hết
  overstockItems: number;     // Số SKU tồn quá nhiều
  damagedValue: number;       // Giá trị hàng hỏng
}
```

### Báo cáo chi tiết theo sản phẩm

```typescript
interface ProductStockDetail {
  productId: string;
  productName: string;
  sku: string;
  
  // Phân tích theo kho
  byWarehouse: {
    warehouseId: string;
    warehouseName: string;
    
    // Số lượng theo trạng thái
    incoming: number;
    qcInProgress: number;
    available: number;      // ⭐ Có thể bán
    reserved: number;
    refurbishing: number;
    damaged: number;
    returned: number;
    
    total: number;          // Tổng trong kho
  }[];
  
  // Phân tích theo grade
  byGrade: {
    grade: string;
    quantity: number;
    averagePrice: number;
  }[];
  
  // Cảnh báo
  isLowStock: boolean;
  daysOfStock: number;      // Số ngày bán hết (dựa trên tốc độ bán)
}
```

---

## 🎨 UI HIỂN THỊ

### Card Tồn Kho Sản Phẩm

```
┌─────────────────────────────────────────┐
│ iPhone 15 Pro Max 256GB                 │
│ SKU: IP15PM-256                         │
├─────────────────────────────────────────┤
│ 📦 Tồn kho: 45 chiếc                    │
│                                         │
│ ✅ Sẵn bán:     32  (71%)              │
│ 🔒 Đã đặt:       8  (18%)              │
│ 🔧 Đang sửa:     3  (7%)               │
│ ⏳ Chờ QC:       2  (4%)               │
│                                         │
│ [████████████░░░] 71% khả dụng         │
├─────────────────────────────────────────┤
│ 💰 Giá trị: 1,350,000,000đ             │
│ 📊 Trung bình: 30,000,000đ/chiếc       │
└─────────────────────────────────────────┘
```

### Bảng Tồn Kho Chi Tiết

```
┌──────────────┬────────┬────────┬────────┬────────┬────────┬────────┐
│ Sản phẩm     │ Tổng   │ Sẵn bán│ Đã đặt │ Đang QC│ Sửa    │ Hỏng   │
├──────────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ iPhone 15 PM │   45   │   32   │    8   │    2   │    3   │    0   │
│ Samsung S24  │   28   │   20   │    5   │    1   │    2   │    0   │
│ MacBook M3   │   12   │    8   │    2   │    1   │    1   │    0   │
└──────────────┴────────┴────────┴────────┴────────┴────────┴────────┘
```

---

## ✅ KẾT LUẬN

### Điểm quan trọng:

1. **Tồn kho ≠ Có thể bán**
   - Tồn vật lý = Tất cả trong kho
   - Tồn khả dụng = Chỉ status AVAILABLE

2. **RESERVED vẫn tính là tồn kho**
   - Vì chưa xuất kho vật lý
   - Chỉ khi SOLD mới trừ tồn

3. **Cần track nhiều loại tồn**
   - Incoming (chờ QC)
   - QC in progress
   - Available (sẵn bán) ⭐
   - Reserved (đã đặt)
   - Refurbishing (đang sửa)
   - Damaged (hỏng)
   - Returned (trả lại)

4. **StockMovement chỉ ghi khi IN/OUT kho vật lý**
   - IN: Inbound, Return
   - OUT: Sold, Disposed
   - Chuyển status nội bộ không tạo movement

### Cần implement:

1. ✅ Bảng StockLevel với đầy đủ các loại qty
2. ✅ Trigger tự động khi đổi status
3. ✅ API báo cáo tồn kho chi tiết
4. ✅ Dashboard hiển thị trực quan
