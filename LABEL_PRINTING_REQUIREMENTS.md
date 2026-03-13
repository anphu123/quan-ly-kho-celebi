# YÊU CẦU IN TEM CHO ANH HÙNG

## Chức năng chính

### 1. Quét mã vạch để xem thông tin
- Input: Quét barcode/serial number
- Output hiển thị:
  - Model (tên sản phẩm)
  - Hiện trạng (condition)
  - Giá nhập (purchase price)
  - Giá bán (retail price)

### 2. In tem hàng loạt
- Chọn nhiều items từ danh sách
- In tem cho tất cả items đã chọn
- Mỗi tem bao gồm:
  - Mã vạch (barcode)
  - Model name
  - Condition
  - Giá bán

## Thiết kế tem

### Kích thước tem tiêu chuẩn
- 50mm x 30mm (phổ biến cho máy in tem nhiệt)
- Hoặc 40mm x 25mm

### Nội dung tem
```
┌─────────────────────────┐
│  [BARCODE IMAGE]        │
│  Serial: ABC-123456     │
│  iPhone 15 Pro Max      │
│  256GB Natural Titanium │
│  Condition: Excellent   │
│  Price: 32,000,000đ     │
└─────────────────────────┘
```

## Luồng hoạt động

### Trang In Tem (Label Printing Page)
1. Có ô input để quét barcode
2. Khi quét → hiển thị thông tin chi tiết
3. Có nút "Thêm vào danh sách in"
4. Danh sách items đã chọn để in
5. Nút "In tất cả" để in hàng loạt

### API cần thiết
- GET /api/v1/serial-items/:serialNumber - Lấy thông tin theo serial
- GET /api/v1/serial-items - Lấy danh sách items để chọn in

## Công nghệ in
- Sử dụng window.print() với CSS @media print
- Hoặc tích hợp với máy in tem nhiệt qua USB/Bluetooth
- Format: ZPL (Zebra Programming Language) nếu dùng máy Zebra
- Format: ESC/POS nếu dùng máy in nhiệt thông thường
