# Hướng dẫn Sử dụng — Hệ thống CELEBI

> Dành cho: Quản trị viên, Thủ kho, Kiểm định viên, Nhân viên bán hàng

---

## Mục lục

1. [Đăng nhập & Phân quyền](#1-đăng-nhập--phân-quyền)
2. [Tổng quan Dashboard](#2-tổng-quan-dashboard)
3. [Quản lý Kho hàng](#3-quản-lý-kho-hàng)
4. [Nhập hàng (Inbound)](#4-nhập-hàng-inbound)
5. [Chương trình Thu cũ (Trade-in)](#5-chương-trình-thu-cũ-trade-in)
6. [Kiểm định (QC)](#6-kiểm-định-qc)
7. [Tồn kho](#7-tồn-kho)
8. [Bán hàng & POS](#8-bán-hàng--pos)
9. [Quản lý sản phẩm & Danh mục](#9-quản-lý-sản-phẩm--danh-mục)
10. [Tài khoản & Phân quyền (Admin)](#10-tài-khoản--phân-quyền-admin)

---

## 1. Đăng nhập & Phân quyền

### Đăng nhập

1. Truy cập hệ thống theo địa chỉ do quản trị viên cung cấp.
2. Nhập **Email** và **Mật khẩu**.
3. Nhấn **Đăng nhập**.

> Nếu quên mật khẩu, liên hệ Quản trị viên để đặt lại.

### Các vai trò trong hệ thống

| Vai trò | Quyền hạn |
|---|---|
| **Quản trị viên** (SUPER_ADMIN) | Toàn quyền: tạo tài khoản, phân quyền, cấu hình hệ thống, xem tất cả dữ liệu |
| **Thủ kho** (INVENTORY_MANAGER) | Nhập hàng, thu cũ, kiểm định, quản lý tồn kho |
| **Kiểm định viên** (QC_INSPECTOR) | Kiểm định thiết bị, cập nhật tình trạng |
| **Nhân viên bán hàng** (SALES_STAFF) | POS, tạo đơn bán, xem tồn kho |
| **Kế toán** (ACCOUNTANT) | Xem báo cáo, xuất dữ liệu |

---

## 2. Tổng quan Dashboard

Sau khi đăng nhập, màn hình **Dashboard** hiển thị:

- **Thống kê nhanh**: tổng phiếu nhập hôm nay, tổng giá trị, số thiết bị trong kho.
- **Biểu đồ**: biến động nhập/xuất theo thời gian.
- **Hoạt động gần đây**: các phiếu vừa tạo hoặc cập nhật.

---

## 3. Quản lý Kho hàng

**Menu:** Kho hàng → Danh sách kho

### Xem danh sách kho

Hiển thị tất cả kho hàng trong hệ thống kèm thông tin:
- Tên kho, mã kho
- Địa chỉ, số điện thoại
- **Thủ kho** phụ trách
- Trạng thái (Đang hoạt động / Tạm dừng)

### Tạo kho mới _(Quản trị viên)_

1. Nhấn **+ Thêm kho**.
2. Điền **Tên kho**, **Địa chỉ**, **Số điện thoại** (tùy chọn).
3. Chọn **Thủ kho** từ danh sách tài khoản có vai trò Thủ kho hoặc Quản trị viên.
4. Nhấn **Lưu**.

> Mã kho (code) được hệ thống tự sinh, không cần nhập thủ công.

### Chỉnh sửa / Tắt kho

- Nhấn biểu tượng **Sửa** (bút chì) trên thẻ kho.
- Có thể thay đổi tên, địa chỉ, thủ kho, hoặc chuyển trạng thái sang **Tạm dừng**.

---

## 4. Nhập hàng (Inbound)

**Menu:** Nhập hàng → Danh sách phiếu nhập

### Tạo phiếu nhập mới

1. Nhấn **+ Tạo phiếu nhập**.
2. Chọn **Loại nhập**:
   - **Nhập từ nhà cung cấp**: mua mới từ supplier.
   - **Thu cũ từ khách hàng**: thiết bị đổi cũ lấy mới.
3. Chọn **Kho nhập**, điền thông tin nhà cung cấp / khách hàng.
4. Thêm **Danh sách mặt hàng**:
   - Chọn sản phẩm (mẫu sản phẩm).
   - Nhập số lượng, giá nhập, tình trạng máy.
   - Nhập **Serial / IMEI** cho từng thiết bị (nếu có).
5. Nhấn **Lưu phiếu**.

### Trạng thái phiếu nhập

| Trạng thái | Ý nghĩa |
|---|---|
| **Nháp** (DRAFT) | Phiếu đang soạn, chưa gửi kiểm định |
| **Chờ kiểm định** (PENDING_QC) | Đã gửi, đang chờ QC duyệt |
| **Đang kiểm định** (IN_QC) | QC đang tiến hành |
| **Hoàn tất** (COMPLETED) | Đã nhập kho thành công |
| **Hủy** (CANCELLED) | Phiếu bị hủy |

### Hoàn tất nhập kho

Sau khi kiểm định xong:
1. Mở phiếu nhập → nhấn **Hoàn tất nhập kho**.
2. Hệ thống sẽ:
   - Tạo bản ghi **SerialItem** cho từng thiết bị.
   - Cộng tồn kho vào kho được chỉ định.
   - Ghi lịch sử biến động (StockMovement).

---

## 5. Chương trình Thu cũ (Trade-in)

**Menu:** Thu cũ (Trade-in) → Danh sách chương trình

### Quản lý chương trình

Mỗi chương trình thu cũ (VD: "Thu cũ Xiaomi 2025", "Samsung Galaxy Upgrade") được quản lý độc lập.

**Tạo chương trình mới** _(Quản trị viên / Thủ kho)_:
1. Nhấn **+ Tạo chương trình**.
2. Điền:
   - **Tên chương trình** (VD: Thu cũ Xiaomi 2025)
   - **Mã code** (VD: XIAOMI-2025) — duy nhất, không thay đổi sau khi tạo
   - **Mô tả**, **Ngày bắt đầu**, **Ngày kết thúc** (tùy chọn)
3. Nhấn **Lưu**.

### Tạo phiếu thu cũ đơn lẻ

1. Trong danh sách chương trình, nhấn **Xem phiếu** trên chương trình muốn thao tác.
2. Nhấn **+ Tạo phiếu**.
3. Điền thông tin khách hàng: tên, số điện thoại.
4. Thêm thiết bị thu cũ: model, tình trạng, **Serial/IMEI**, giá thu dự kiến.
5. Nhấn **Lưu phiếu**.

### Import hàng loạt

1. Từ trang chương trình, nhấn **Import hàng loạt**.
2. Tải file mẫu Excel.
3. Điền dữ liệu theo mẫu, upload file.
4. Xác nhận và gửi kiểm định.

### Theo dõi phiếu theo chương trình

Trang chi tiết chương trình hiển thị:
- Tổng số phiếu, số phiếu đã hoàn tất.
- Tổng giá trị ước tính.
- Danh sách phiếu: mã hợp đồng, khách hàng, thiết bị, giá, trạng thái.

---

## 6. Kiểm định (QC)

### Quy trình kiểm định

1. Phiếu nhập ở trạng thái **Chờ kiểm định** sẽ xuất hiện trong hàng đợi QC.
2. Kiểm định viên mở phiếu → nhấn **Bắt đầu kiểm định**.
3. Với từng thiết bị trong phiếu:
   - Kiểm tra tình trạng thực tế.
   - Cập nhật **Grade** (A/B/C/D hoặc theo quy định công ty).
   - Ghi chú nếu cần.
4. Sau khi kiểm tra hết, nhấn **Hoàn tất kiểm định**.

### Kết quả kiểm định

- Thiết bị đạt → nhập kho bình thường.
- Thiết bị không đạt → có thể đánh dấu hủy hoặc trả lại nhà cung cấp.

---

## 7. Tồn kho

**Menu:** Tồn kho → Mức tồn kho

### Xem tồn kho tổng hợp

Bảng tồn kho hiển thị:
- **Sản phẩm**: tên, mã, danh mục.
- **Kho**: từng kho hàng.
- **Số lượng**: số thiết bị đang có trong kho (không tính đã bán hoặc hủy).
- **Giá trị**: tổng giá trị ước tính theo tồn kho.

### Xem chi tiết theo thiết bị

Nhấn vào dấu **▶ mũi tên** bên trái một dòng tồn kho để mở rộng và xem:
- Danh sách từng thiết bị vật lý (serial/IMEI).
- Mã nội bộ, vị trí trong kho (bin location).
- Giá nhập, giá bán dự kiến.
- Trạng thái hiện tại (Trong kho / Đang kiểm định / v.v.).

> Thiết bị đã bán (Đã bán) và đã hủy (Disposed) **không** hiển thị trong tồn kho.

### Lịch sử biến động

**Menu:** Tồn kho → Lịch sử biến động

Theo dõi mọi thay đổi: nhập kho, xuất kho, điều chuyển, kiểm kê.

---

## 8. Bán hàng & POS

### Point of Sale (POS)

**Menu:** POS _(mở toàn màn hình)_

1. Tìm kiếm sản phẩm bằng tên hoặc quét mã vạch/IMEI.
2. Chọn thiết bị cụ thể (theo serial) từ danh sách có sẵn.
3. Nhập thông tin khách hàng (tên, số điện thoại).
4. Chọn phương thức thanh toán.
5. Nhấn **Hoàn tất đơn hàng**.

Sau khi hoàn tất:
- Thiết bị chuyển trạng thái → **Đã bán**.
- Tồn kho tự động giảm.
- Phiếu bán hàng được in hoặc gửi qua SMS/email.

### Quản lý đơn hàng

**Menu:** Bán hàng → Danh sách đơn hàng

- Xem lịch sử đơn hàng.
- Lọc theo ngày, khách hàng, trạng thái.
- Xuất báo cáo doanh thu.

---

## 9. Quản lý sản phẩm & Danh mục

### Danh mục & Thương hiệu

**Menu:** Danh mục / Thương hiệu

- **Tạo danh mục**: nhấn **+ Thêm**, điền tên, chọn danh mục cha (nếu là danh mục con).
- **Tạo thương hiệu**: nhấn **+ Thêm**, điền tên và logo.

### Mẫu sản phẩm (Product Template)

Mẫu sản phẩm định nghĩa loại thiết bị (VD: iPhone 15 Pro Max 256GB Titan Đen).

**Tạo mẫu sản phẩm**:
1. Vào **Sản phẩm** → nhấn **+ Tạo sản phẩm**.
2. Điền:
   - Tên sản phẩm, SKU.
   - Chọn **Danh mục** và **Thương hiệu**.
   - Giá niêm yết, giá bán tham khảo.
   - Upload ảnh sản phẩm.
   - Điền thuộc tính (màu sắc, dung lượng, v.v.) theo nhóm thuộc tính đã cấu hình.

---

## 10. Tài khoản & Phân quyền (Admin)

> Chỉ dành cho **Quản trị viên** (SUPER_ADMIN)

**Menu:** Quản trị → Tài khoản & Phân quyền

### Tạo tài khoản mới

1. Nhấn **+ Tạo tài khoản**.
2. Điền:
   - **Email** (dùng để đăng nhập).
   - **Họ tên đầy đủ**.
   - **Vai trò**: chọn phù hợp với công việc.
   - **Mật khẩu tạm thời** (yêu cầu nhân viên đổi sau lần đầu đăng nhập).
3. Nhấn **Lưu**.

### Chỉnh sửa tài khoản

- Thay đổi tên, vai trò.
- **Tắt tài khoản**: khi nhân viên nghỉ việc — tài khoản bị vô hiệu hóa, không thể đăng nhập nhưng dữ liệu lịch sử vẫn giữ nguyên.

### Đặt lại mật khẩu

1. Tìm tài khoản cần reset.
2. Nhấn **Đặt lại mật khẩu**.
3. Nhập mật khẩu mới và xác nhận.
4. Thông báo mật khẩu mới cho nhân viên qua kênh nội bộ.

> **Lưu ý bảo mật**: Quản trị viên không thể tự thay đổi vai trò hoặc tắt tài khoản của chính mình.

### Gán Thủ kho cho Kho hàng

Xem hướng dẫn tại [Quản lý Kho hàng](#3-quản-lý-kho-hàng).

---

## Câu hỏi thường gặp

**Q: Tôi không thấy menu "Tài khoản & Phân quyền"?**
> Bạn chưa có quyền Quản trị viên. Liên hệ admin để được cấp quyền.

**Q: Thiết bị đã kiểm định xong nhưng tồn kho chưa cập nhật?**
> Cần nhấn **Hoàn tất nhập kho** trên phiếu nhập tương ứng. Tồn kho chỉ được cộng sau bước này.

**Q: Serial/IMEI bị trùng khi nhập?**
> Hệ thống kiểm tra trùng lặp tự động. Kiểm tra lại thiết bị — có thể đã được nhập trước đó trong phiếu khác.

**Q: Muốn chuyển thiết bị từ kho này sang kho khác?**
> Hiện tại dùng chức năng **Phiếu xuất** (xuất khỏi kho nguồn) + **Phiếu nhập** (nhập vào kho đích). Chức năng điều chuyển trực tiếp đang được phát triển.

**Q: Xóa phiếu nhập đã hoàn tất được không?**
> Không. Phiếu đã hoàn tất không thể xóa để đảm bảo tính toàn vẹn dữ liệu. Nếu nhập sai, tạo phiếu xuất đính chính.

---

_Tài liệu cập nhật: 03/2025 — Phiên bản hệ thống CELEBI_
