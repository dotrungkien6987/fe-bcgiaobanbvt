# ĐẶC TẢ NGHIỆP VỤ HỆ THỐNG QUẢN LÝ TÀI LIỆU ISO BỆNH VIỆN

## 1. TỔNG QUAN
Hệ thống quản lý việc lưu trữ, kiểm soát phiên bản và phân phối các tài liệu quy trình ISO từ Phòng Quản lý chất lượng (QLCL) đến các Khoa/Phòng trong bệnh viện.

## 2. THÀNH PHẦN DỮ LIỆU (ENTITIES)

### 2.1. Quy trình ISO (Document/Process)
Mỗi quy trình là một tập hợp thông tin bao gồm:
- **Thông tin cơ bản:** Tên quy trình, Mã quy trình.
- **Thông tin quản lý:**
    - Khoa xây dựng (Đơn vị soạn thảo gốc).
    - Phiên bản (Version - ví dụ: 01, 02).
    - Ngày hiệu lực (Ngày bắt đầu áp dụng phiên bản này).
    - Ghi chú (Mô tả nội dung thay đổi hoặc hướng dẫn).
- **Tệp đính kèm (Files):**
    - 01 File định dạng **PDF** (Nội dung quy trình chuẩn).
    - Nhiều (N) File định dạng **Word** (Các biểu mẫu đính kèm để sử dụng).

### 2.2. Đơn vị & Người dùng (Department & User)
- **Khoa/Phòng:** Danh mục các đơn vị trong bệnh viện.
- **Người dùng:** Mỗi người dùng bắt buộc phải thuộc về một Khoa/Phòng cụ thể.

## 3. PHÂN QUYỀN (ROLES)

### 3.1. Người dùng Phân phối (Distributor)
- Thường là nhân viên Phòng Quản lý chất lượng.
- Quyền hạn:
    - Quản lý danh mục Quy trình (Thêm, sửa, xóa).
    - Quản lý thông tin phiên bản và file upload (PDF, Word).
    - **Quyền đặc biệt:** Quyết định quy trình nào được phân phối cho những khoa nào.

### 3.2. Người dùng Bình thường (Normal User)
- Nhân viên thuộc các khoa chuyên môn.
- Quyền hạn:
    - Xem danh sách quy trình được phân phối riêng cho khoa của mình.
    - Xem trực tuyến file PDF.
    - Tải về các file biểu mẫu Word.

---

## 4. LOGIC NGHIỆP VỤ CỐT LÕI (CORE BUSINESS LOGIC)

### 4.1. Cơ chế Phân phối (Distribution Logic)
Đây là logic quan trọng nhất của hệ thống:
- Tài liệu không mặc định hiển thị cho tất cả mọi người.
- Khi một quy trình được tạo ra, Người dùng Phân phối phải chọn danh sách các Khoa nhận tài liệu.
- **Công thức truy cập:** `Quyền xem = (Khoa của Người dùng) NẰM TRONG (Danh sách Khoa được phân phối)`.

### 4.2. Quản lý Tệp tin
- Hệ thống phải phân biệt rõ ràng giữa tài liệu đọc (PDF) và tài liệu dùng để soạn thảo mẫu (Word).
- Một quy trình không thể thiếu file PDF nội dung.

### 4.3. Quản lý Phiên bản
- Hệ thống luôn hiển thị phiên bản có "Ngày hiệu lực" mới nhất cho người dùng bình thường.
- Cần lưu lại lịch sử thay đổi thông qua trường "Ghi chú" và số phiên bản.

---

## 5. QUY TRÌNH VẬN HÀNH (WORKFLOW)

1. **Khởi tạo:** Khoa chuyên môn soạn quy trình -> Gửi cho Phòng QLCL.
2. **Cập nhật dữ liệu:** Người dùng Phân phối nhập thông tin quy trình, phiên bản, ngày hiệu lực và upload file (PDF + Word).
3. **Phân phối:** Người dùng Phân phối chọn các khoa liên quan sẽ áp dụng quy trình này.
4. **Tiếp cận:** Nhân viên khoa đăng nhập -> Chỉ thấy danh sách quy trình đã được phân phối cho khoa mình -> Xem PDF/Tải Word.
i