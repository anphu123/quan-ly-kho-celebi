# ✅ KIỂM TRA LUỒNG TRADE-IN DATA FLOW

## 📊 TỔNG QUAN

Trade-in là một loại **Inbound Request** với `supplierType = CUSTOMER_TRADE_IN`.

---

## 🔄 LUỒNG DỮ LIỆU HIỆN TẠI

### 1. Tạo Trade-in Request

**Frontend:** `CreateTradeInPage.tsx` hoặc `CreateSingleTradeInPage.tsx`

```typescript
inboundApi.createRequest({
  warehouseId,
  supplierType: 'CUSTOMER_TRADE_IN',  // ⭐ Đánh dấu là trade-in
  supplierName: customerName,
  supplierPhone: customerPhone,
  supplierEmail: customerEmail,
  items: [{
    categoryId,
    brandId,
    modelName,
    serialNumber,
    condition,
    estimatedValue,
    // Trade-in specific fields:
    sourceCustomerName,
    sourceCustomerPhone,
    sourceCustomerAddress,
    sourceCustomerIdCard,
    bankAccount,
    bankName,
    contractNumber,
    purchaseDate,
    employeeName,
    otherCosts,
    topUp,
    repairCost,
    imageUrl,
    deviceImages,
    cccdFrontUrl,
    cccdBackUrl,
  }]
})
```

**Backend:** `InboundService.createInboundRequest()`
- Tạo `InboundRequest` với status = REQUESTED
- Tạo `InboundItem[]` với đầy đủ trade-in fields
- ✅ Data được lưu đầy đủ

---

### 2. Nhận hàng (Receive Items)

**Frontend:** `TradeInDetailPage.tsx` → Button "Nhận hàng"

```typescript
inboundApi.receiveItems(requestId)
```

**Backend:** `InboundService.startReceivingProcess()`
- Update status: REQUESTED → IN_PROGRESS
- ✅ Chưa tạo SerialItem (đúng)

---

### 3. Hoàn thành nhập kho (Complete Inbound)

**Frontend:** `TradeInXiaomiPage.tsx` → Button "Hoàn thành QC"

```typescript
inboundApi.completeQC(requestId)
```

**Backend:** `InboundService.completeInboundRequest()`

```typescript
for each InboundItem:
  1. Tạo SerialItem
     - status = INCOMING
     - source = `Inbound-${request.code}`
     - purchasePrice = từ InboundItem
     - warehouseId = từ InboundRequest
  
  2. Tạo SerialTransaction
     - type = INBOUND
     - notes = "Received via inbound {code}"
  
  3. ⭐ Update StockLevel (TỰ ĐỘNG)
     await stockService.updateStockLevelOnStatusChange(
       serialItem.id,
       null,
       SerialStatus.INCOMING,
       userId,
       'INBOUND',
       request.id
     )
     
     → Tạo StockMovement với:
       - type = IN
       - referenceType = 'INBOUND'
       - referenceId = request.id
       - notes = "Nhập kho từ: CUSTOMER_TRADE_IN - {customerName}"
```

✅ **LUỒNG ĐÚNG!** Trade-in data tự động tạo StockMovement với source tracking.

---

## 📋 DATA MAPPING

### InboundRequest (Trade-in)
```
supplierType: CUSTOMER_TRADE_IN
supplierName: Tên khách hàng trade-in
supplierPhone: SĐT khách
supplierEmail: Email khách
```

### InboundItem (Trade-in specific)
```
// Thông tin khách hàng
sourceCustomerName: TÊN KHÁCH HÀNG
sourceCustomerPhone: SỐ ĐIỆN THOẠI
sourceCustomerAddress: ĐỊA CHỈ
sourceCustomerIdCard: CCCD SỐ
idCardIssueDate: Ngày cấp CCCD
idCardIssuePlace: Nơi cấp CCCD
bankAccount: SỐ TÀI KHOẢN
bankName: TẠI NGÂN HÀNG

// Thông tin giao dịch
contractNumber: SỐ HỢP ĐỒNG
purchaseDate: NGÀY MUA
employeeName: TÊN NHÂN VIÊN

// Chi phí
otherCosts: Chi phí khác
topUp: TOP UP
repairCost: GIÁ SỬA CHỮA

// Hình ảnh
imageUrl: Ảnh thiết bị chính
deviceImages: JSON array các ảnh
cccdFrontUrl: Ảnh CCCD mặt trước
cccdBackUrl: Ảnh CCCD mặt sau
```

### SerialItem (Sau khi complete)
```
source: "Inbound-{code}"
purchasePrice: Giá thu mua
status: INCOMING
warehouseId: Kho nhận
```

### StockMovement (Tự động tạo)
```
type: IN
referenceType: 'INBOUND'
referenceId: inboundRequest.id
notes: "Nhập kho từ: CUSTOMER_TRADE_IN - {customerName} | Status: null → INCOMING"
```

---

## ✅ KIỂM TRA DATA FLOW

### 1. Trade-in → Inbound ✅
- Frontend tạo InboundRequest với supplierType = CUSTOMER_TRADE_IN
- Backend lưu đầy đủ trade-in fields trong InboundItem
- **Status:** ĐÚNG

### 2. Inbound → SerialItem ✅
- Complete inbound tạo SerialItem với source tracking
- SerialItem.source = "Inbound-{code}"
- **Status:** ĐÚNG

### 3. SerialItem → StockLevel ✅
- StockService.updateStockLevelOnStatusChange() tự động được gọi
- StockLevel.incomingQty += 1
- StockLevel.physicalQty += 1
- **Status:** ĐÚNG

### 4. StockMovement tracking ✅
- StockMovement được tạo với type = IN
- referenceType = 'INBOUND', referenceId = request.id
- notes chứa: "Nhập kho từ: CUSTOMER_TRADE_IN - {customerName}"
- **Status:** ĐÚNG

### 5. Báo cáo theo nguồn ✅
- API: GET /stock/reports/inbound-by-source
- Parse notes để group theo CUSTOMER_TRADE_IN
- **Status:** ĐÚNG

---

## 🎯 LUỒNG HOÀN CHỈNH

```
┌─────────────────────────────────────────────────────────────┐
│ 1. KHÁCH HÀNG TRADE-IN                                      │
│    - Mang máy cũ đến cửa hàng                               │
│    - Nhân viên tạo Trade-in Request                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. TẠO INBOUND REQUEST                                      │
│    Frontend: CreateTradeInPage                              │
│    Backend: InboundService.createInboundRequest()           │
│    → InboundRequest (supplierType = CUSTOMER_TRADE_IN)      │
│    → InboundItem[] (với trade-in fields)                    │
│    Status: REQUESTED                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. NHẬN HÀNG                                                │
│    Frontend: TradeInDetailPage → "Nhận hàng"               │
│    Backend: InboundService.startReceivingProcess()          │
│    Status: REQUESTED → IN_PROGRESS                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. HOÀN THÀNH NHẬP KHO                                      │
│    Frontend: TradeInXiaomiPage → "Hoàn thành QC"           │
│    Backend: InboundService.completeInboundRequest()         │
│                                                             │
│    A. Tạo SerialItem                                        │
│       - status = INCOMING                                   │
│       - source = "Inbound-{code}"                           │
│       - purchasePrice = giá thu mua                         │
│                                                             │
│    B. Tạo SerialTransaction                                 │
│       - type = INBOUND                                      │
│                                                             │
│    C. ⭐ Update StockLevel (TỰ ĐỘNG)                        │
│       StockService.updateStockLevelOnStatusChange()         │
│       - incomingQty += 1                                    │
│       - physicalQty += 1                                    │
│                                                             │
│    D. ⭐ Tạo StockMovement (TỰ ĐỘNG)                        │
│       - type = IN                                           │
│       - referenceType = 'INBOUND'                           │
│       - referenceId = request.id                            │
│       - notes = "Nhập kho từ: CUSTOMER_TRADE_IN - {name}"  │
│                                                             │
│    Status: IN_PROGRESS → COMPLETED                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. XEM BÁO CÁO                                              │
│    - Stock Levels Page: Xem tồn kho                         │
│    - Stock Movements: Xem lịch sử nhập                      │
│    - Inbound by Source: Group theo CUSTOMER_TRADE_IN        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 KIỂM TRA CÁC NGUỒN HÀNG

Hệ thống hỗ trợ 4 loại nguồn (SupplierType):

1. **CUSTOMER_TRADE_IN** ✅
   - Trade-in từ khách hàng
   - Có đầy đủ thông tin CCCD, hợp đồng
   - Tracking trong StockMovement

2. **INTERNAL_RETURN** ✅
   - Hàng trả lại nội bộ
   - Cùng luồng Inbound
   - Tracking trong StockMovement

3. **LIQUIDATION** ✅
   - Thanh lý từ doanh nghiệp
   - Cùng luồng Inbound
   - Tracking trong StockMovement

4. **INDIVIDUAL_SELLER** ✅
   - Người bán lẻ
   - Cùng luồng Inbound
   - Tracking trong StockMovement

**Tất cả đều đi qua cùng 1 luồng Inbound → SerialItem → StockLevel → StockMovement**

---

## ✅ KẾT LUẬN

### Data Flow: HOÀN HẢO ✅

1. ✅ Trade-in data được lưu đầy đủ trong InboundItem
2. ✅ Complete inbound tự động tạo SerialItem
3. ✅ StockLevel tự động cập nhật (tích hợp StockService)
4. ✅ StockMovement tự động tracking nguồn hàng
5. ✅ Báo cáo theo nguồn hoạt động đúng

### Không cần sửa gì! 🎉

Luồng Trade-in đã tích hợp hoàn hảo với Stock system mới:
- Tự động cập nhật tồn kho
- Tự động tracking nguồn hàng
- Tự động tạo movement history
- Báo cáo theo nguồn chính xác

---

## 📝 GHI CHÚ

### Điểm mạnh:
- Trade-in là 1 loại Inbound → Tái sử dụng code
- Tự động tích hợp Stock system
- Tracking đầy đủ thông tin khách hàng
- Hỗ trợ nhiều loại nguồn hàng

### Có thể cải thiện (tương lai):
- Thêm workflow phê duyệt trade-in
- Tự động tính giá thu mua dựa trên grade
- Tích hợp với CRM để track khách hàng trade-in
- Báo cáo trade-in performance (số lượng, giá trị theo thời gian)
