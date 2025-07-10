## Mục tiêu

Sinh code hoàn chỉnh chức năng quản lý Đoàn Ra trong thư mục `NghienCuuKhoaHoc/DoanRa` theo chuẩn UI/UX, gồm các tính năng:

- Xem danh sách Đoàn Ra (table)
- Thêm mới, sửa, xóa Đoàn Ra (popup form)
- Chọn thành viên tham gia từ danh sách nhân viên (multi-select, tham khảo file SeLectHocVienTable)
- Không nhập các trường: `isDeleted`, `timestamps`
- Trường `TaiLieuKemTheo`: nhập link (string hoặc array string), chưa cần upload file
- Không cần phân quyền, không cần filter nâng cao, không cần thống kê quốc gia
- Có thể bổ sung API getAll nếu cần

## Yêu cầu chi tiết

### 1. Giao diện

- Trang chính hiển thị danh sách Đoàn Ra dạng bảng (table), mỗi dòng là 1 Đoàn Ra, có các cột: Ngày ký, Số văn bản, Mục đích, Thời gian xuất cảnh, Quốc gia đến, Ghi chú, ...
- Có nút Thêm mới, Sửa, Xóa trên từng dòng hoặc cuối bảng
- Khi Thêm/Sửa, hiển thị popup form nhập thông tin Đoàn Ra, các trường theo BE (trừ isDeleted, timestamps)
- Trường Thành Viên: sử dụng component chọn nhiều nhân viên, thao tác như file SeLectHocVienTable (table chọn nhiều dòng, có checkbox)
- Trường TaiLieuKemTheo: nhập link (có thể nhập nhiều link, mỗi link 1 dòng hoặc ngăn cách bởi dấu phẩy)
- Không cần filter nâng cao, không cần phân quyền, không cần thống kê quốc gia

### 2. Logic

- CRUD đầy đủ: lấy danh sách, thêm mới, sửa, xóa Đoàn Ra
- Khi lấy danh sách nhân viên để chọn thành viên, gọi API lấy tất cả nhân viên (có thể bổ sung slice getAll nếu chưa có)
- Khi thêm/sửa, gửi đúng định dạng dữ liệu như BE yêu cầu (Thành Viên là mảng ObjectId)
- Không gửi các trường không cần thiết (isDeleted, timestamps)
- Khi xóa, xác nhận trước khi thực hiện

### 3. Kỹ thuật

- Sử dụng Redux Toolkit cho state, gọi API
- Sử dụng MUI hoặc Ant Design cho UI (ưu tiên giống file SeLectHocVienTable và bảng Khoa)
- Tách các component: Table, Form, SelectNhanVien (nếu cần)
- Đảm bảo chuẩn hóa code, dễ mở rộng

### 4. Tham khảo

- Tham khảo file SeLectHocVienTable để xây dựng component chọn thành viên
- Tham khảo thư mục Khoa về cách tổ chức code, UI/UX, popup thêm/sửa

### 5. Bổ sung

- Nếu cần, bổ sung slice API getAll nhân viên để phục vụ chọn thành viên

---

**Lưu ý:**

- Không sinh code phân quyền, filter nâng cao, thống kê quốc gia
- Không sinh code upload file cho TaiLieuKemTheo
- Chỉ nhập các trường cần thiết, đúng định dạng BE
- Ưu tiên UI/UX giống các module đã có (Khoa, SeLectHocVienTable)
