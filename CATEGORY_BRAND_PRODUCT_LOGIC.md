# Logic Quản lý Danh mục - Thương hiệu - Sản phẩm

## 📋 Cấu trúc phân cấp

```
Danh mục (Category)
    ├── Thương hiệu (Brand)
    │   └── Sản phẩm Template (ProductTemplate)
    │       └── Serial Item (Cá thể sản phẩm)
```

## 1. DANH MỤC (Category)

### Mục đích:
- Phân loại sản phẩm theo nhóm lớn
- Hỗ trợ cấu trúc phân cấp (parent-child)
- Xác định phương thức tracking (Serial-based / Quantity-based)

### Ví dụ:
```
Điện tử (ELECTRONICS)
├── Smartphone
│   ├── iPhone
│   ├── Samsung Galaxy
│   └── Xiaomi
├── Laptop
│   ├── MacBook
│   ├── ThinkPad
│   └── Dell
└── Tablet
    ├── iPad
    └── Samsung Tab
```

### Thuộc tính:
- `name`: Tên danh mục (VD: "Smartphone", "Laptop")
- `code`: Mã danh mục (VD: "PHONE", "LAPTOP")
- `productType`: Loại sản phẩm (ELECTRONICS, APPLIANCE_LARGE, etc.)
- `trackingMethod`: SERIAL_BASED (theo IMEI/Serial) hoặc QUANTITY_BASED (theo số lượng)
- `parentId`: Danh mục cha (cho cấu trúc phân cấp)

### Quy tắc:
1. Mỗi danh mục có thể có nhiều danh mục con
2. Danh mục xác định cách tracking sản phẩm
3. Danh mục có thể có nhiều thương hiệu
4. Không thể xóa danh mục đang có sản phẩm

---

## 2. THƯƠNG HIỆU (Brand)

### Mục đích:
- Quản lý nhà sản xuất/thương hiệu
- Không phụ thuộc vào danh mục cụ thể
- Một thương hiệu có thể có sản phẩm ở nhiều danh mục

### Ví dụ:
```
Apple
├── iPhone (Smartphone)
├── MacBook (Laptop)
├── iPad (Tablet)
└── Apple Watch (Wearable)

Samsung
├── Galaxy S (Smartphone)
├── Galaxy Book (Laptop)
├── Galaxy Tab (Tablet)
└── Galaxy Watch (Wearable)
```

### Thuộc tính:
- `name`: Tên thương hiệu (VD: "Apple", "Samsung")
- `code`: Mã thương hiệu (VD: "APPLE", "SAMSUNG")
- `logo`: URL logo thương hiệu

### Quy tắc:
1. Thương hiệu độc lập với danh mục
2. Một thương hiệu có thể có sản phẩm ở nhiều danh mục
3. Thương hiệu là optional (có thể null)
4. Không thể xóa thương hiệu đang có sản phẩm

---

## 3. SẢN PHẨM TEMPLATE (ProductTemplate)

### Mục đích:
- "Khuôn mẫu" sản phẩm, không lưu tồn kho
- Định nghĩa thông tin chung cho một model sản phẩm
- Là template để tạo SerialItem (cá thể thực tế)

### Ví dụ:
```
ProductTemplate: "iPhone 15 Pro Max 256GB Natural Titanium"
├── Category: Smartphone
├── Brand: Apple
├── SKU: IP15PM-256-NT
├── Base Price: 30,000,000đ
└── Specs:
    ├── RAM: 8GB
    ├── Storage: 256GB
    ├── Screen: 6.7 inch
    └── Color: Natural Titanium
```

### Thuộc tính:
- `sku`: Mã SKU duy nhất
- `name`: Tên sản phẩm đầy đủ
- `model`: Model number (VD: "A3108")
- `categoryId`: Thuộc danh mục nào
- `brandId`: Thuộc thương hiệu nào (optional)
- `baseWholesalePrice`: Giá thu mua chuẩn (Grade A)
- `baseRetailPrice`: Giá bán chuẩn (Grade A)
- `staticSpecs`: Thông số cố định (RAM, Storage, etc.)

### Quy tắc:
1. Mỗi ProductTemplate phải thuộc 1 danh mục
2. ProductTemplate có thể có hoặc không có thương hiệu
3. ProductTemplate là template, không có tồn kho
4. Tồn kho được tính từ SerialItem

---

## 4. SERIAL ITEM (Cá thể sản phẩm)

### Mục đích:
- Đại diện cho 1 sản phẩm vật lý cụ thể
- Có IMEI/Serial number riêng
- Có trạng thái, grade, giá riêng

### Ví dụ:
```
SerialItem #1:
├── ProductTemplate: "iPhone 15 Pro Max 256GB"
├── Serial: 123456789012345
├── Grade: GRADE_A (95-97%)
├── Status: AVAILABLE
├── Purchase Price: 28,000,000đ
├── Suggested Price: 32,000,000đ
└── Location: Kho A - Kệ 1 - Vị trí 05

SerialItem #2:
├── ProductTemplate: "iPhone 15 Pro Max 256GB"
├── Serial: 987654321098765
├── Grade: GRADE_B (85-89%)
├── Status: SOLD
├── Purchase Price: 25,000,000đ
├── Suggested Price: 28,000,000đ
└── Location: Đã bán
```

### Thuộc tính:
- `serialNumber`: IMEI/Serial (unique)
- `internalCode`: Mã nội bộ nếu không có serial
- `productTemplateId`: Template sản phẩm
- `status`: INCOMING, AVAILABLE, SOLD, etc.
- `grade`: GRADE_A, GRADE_B, GRADE_C, etc.
- `purchasePrice`: Giá thu mua thực tế
- `currentCostPrice`: Giá vốn hiện tại (bao gồm sửa chữa)
- `suggestedPrice`: Giá bán đề xuất
- `warehouseId`: Kho hiện tại
- `binLocation`: Vị trí cụ thể trong kho

---

## 🔄 WORKFLOW THỰC TẾ

### Kịch bản 1: Nhập kho iPhone cũ

```
1. Chọn Danh mục: "Smartphone"
   └── Hệ thống hiển thị các thương hiệu phổ biến

2. Chọn Thương hiệu: "Apple"
   └── Hệ thống hiển thị các ProductTemplate của Apple trong Smartphone

3. Chọn/Tạo ProductTemplate: "iPhone 15 Pro Max 256GB"
   └── Nếu chưa có, tạo mới với thông số cơ bản

4. Nhập thông tin cá thể:
   ├── Serial: 123456789012345
   ├── Tình trạng: "Rất đẹp, không trầy"
   ├── Giá thu: 28,000,000đ
   └── Vị trí: Kho A - Kệ 1

5. QC đánh giá:
   ├── Grade: GRADE_A (95-97%)
   ├── Giá bán đề xuất: 32,000,000đ
   └── Status: AVAILABLE

6. Tạo SerialItem:
   └── Sản phẩm sẵn sàng bán
```

### Kịch bản 2: Tạo sản phẩm mới hoàn toàn

```
1. Tạo Danh mục (nếu chưa có):
   ├── Name: "Smart Watch"
   ├── Code: "WATCH"
   ├── Type: ELECTRONICS
   └── Tracking: SERIAL_BASED

2. Tạo Thương hiệu (nếu chưa có):
   ├── Name: "Garmin"
   ├── Code: "GARMIN"
   └── Logo: URL

3. Tạo ProductTemplate:
   ├── SKU: GARMIN-FENIX7-BLK
   ├── Name: "Garmin Fenix 7 Black"
   ├── Category: Smart Watch
   ├── Brand: Garmin
   ├── Base Price: 15,000,000đ
   └── Specs: [GPS, Heart Rate, etc.]

4. Nhập cá thể khi có hàng:
   └── Tạo SerialItem với serial cụ thể
```

---

## 📊 QUAN HỆ DATABASE

```sql
Category (1) ----< (N) ProductTemplate
Brand (1) ----< (N) ProductTemplate
ProductTemplate (1) ----< (N) SerialItem
Warehouse (1) ----< (N) SerialItem

-- Một Category có nhiều ProductTemplate
-- Một Brand có nhiều ProductTemplate
-- Một ProductTemplate có nhiều SerialItem
-- Một Warehouse chứa nhiều SerialItem
```

---

## ✅ QUY TẮC NGHIỆP VỤ

### Category:
- ✅ Có thể tạo cấu trúc phân cấp (parent-child)
- ✅ Xác định phương thức tracking
- ❌ Không thể xóa nếu có ProductTemplate
- ❌ Không thể thay đổi trackingMethod nếu có SerialItem

### Brand:
- ✅ Độc lập với Category
- ✅ Có thể có sản phẩm ở nhiều Category
- ✅ Optional (ProductTemplate có thể không có Brand)
- ❌ Không thể xóa nếu có ProductTemplate

### ProductTemplate:
- ✅ Phải thuộc 1 Category
- ✅ Có thể có hoặc không có Brand
- ✅ Là template, không có tồn kho
- ✅ Có thể có nhiều SerialItem
- ❌ Không thể xóa nếu có SerialItem
- ❌ Không thể thay đổi Category nếu có SerialItem

### SerialItem:
- ✅ Phải có ProductTemplate
- ✅ Phải có Serial hoặc InternalCode (unique)
- ✅ Có trạng thái và grade riêng
- ✅ Có giá riêng (khác với template)
- ✅ Có vị trí kho cụ thể
- ❌ Không thể xóa nếu đã SOLD
- ❌ Serial/InternalCode không thể trùng

---

## 🎯 LỢI ÍCH CỦA THIẾT KẾ NÀY

1. **Linh hoạt**: Thương hiệu không bị gắn chặt với danh mục
2. **Mở rộng**: Dễ dàng thêm danh mục, thương hiệu mới
3. **Tracking chính xác**: Mỗi sản phẩm có serial riêng
4. **Định giá linh hoạt**: Giá thay đổi theo grade và tình trạng
5. **Báo cáo chính xác**: Tồn kho theo serial, không ước lượng
6. **Truy xuất nguồn gốc**: Biết chính xác từng sản phẩm đến từ đâu

---

## 📝 VÍ DỤ THỰC TẾ

### Ví dụ 1: Cửa hàng điện thoại cũ
```
Category: Smartphone
├── Brand: Apple
│   ├── iPhone 15 Pro Max 256GB (Template)
│   │   ├── Serial: 123... (Grade A, 32tr)
│   │   ├── Serial: 456... (Grade B, 28tr)
│   │   └── Serial: 789... (Grade A, 32tr)
│   └── iPhone 14 Pro 128GB (Template)
│       ├── Serial: 111... (Grade A, 25tr)
│       └── Serial: 222... (Grade C, 18tr)
└── Brand: Samsung
    └── Galaxy S23 Ultra 256GB (Template)
        ├── Serial: 333... (Grade A, 28tr)
        └── Serial: 444... (Grade B, 24tr)
```

### Ví dụ 2: Cửa hàng đa dạng
```
Category: Smartphone
└── Brand: Xiaomi
    └── Redmi Note 13 Pro (Template)

Category: Laptop
└── Brand: Xiaomi
    └── Mi Notebook Pro (Template)

Category: Smart Watch
└── Brand: Xiaomi
    └── Mi Watch S1 (Template)
```

---

## 🚀 KẾT LUẬN

Thiết kế này cho phép:
- ✅ Quản lý linh hoạt danh mục và thương hiệu
- ✅ Tracking chính xác từng sản phẩm
- ✅ Định giá theo tình trạng thực tế
- ✅ Mở rộng dễ dàng
- ✅ Báo cáo chính xác
- ✅ Truy xuất nguồn gốc đầy đủ
