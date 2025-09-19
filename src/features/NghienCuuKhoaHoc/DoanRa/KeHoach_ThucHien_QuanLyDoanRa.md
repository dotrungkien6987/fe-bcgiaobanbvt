## KẾ HOẠCH TỪNG BƯỚC XÂY DỰNG CHỨC NĂNG QUẢN LÝ ĐOÀN RA

### Bước 1: Chuẩn bị cấu trúc thư mục và file

- Tạo thư mục `NghienCuuKhoaHoc/DoanRa`
- Tạo các file chính:
  - `DoanRaTable.js` (bảng danh sách)
  - `DoanRaForm.js` (form thêm/sửa)
  - `SelectNhanVienTable.js` (chọn thành viên, tham khảo SeLectHocVienTable)
  - `doanraSlice.js` (redux slice)
  - `api.js` (gọi API Đoàn Ra)
  - `instructions.md` (file hướng dẫn tổng thể)

---

### Bước 2: Xây dựng Redux Slice và API cho Đoàn Ra

- Tạo slice quản lý state Đoàn Ra: danh sách, chi tiết, loading, error, v.v.
- Tạo các async thunk: getAll, getById, create, update, delete
- Đảm bảo slice có thể lấy danh sách, thêm, sửa, xóa Đoàn Ra từ BE

---

### Bước 3: Xây dựng component bảng danh sách Đoàn Ra (`DoanRaTable.js`)

Trạng thái: ĐÃ HOÀN THÀNH

- Hiển thị danh sách dạng bảng với cột `# Tệp` và popover lazy load file.
- Cột hành động: Xem chi tiết (expand), Sửa (mở form), Xóa.
- Batch-load số lượng tệp qua API batch-count.

---

### Bước 4: Xây dựng form thêm/sửa Đoàn Ra (`DoanRaForm.js`)

Trạng thái: ĐÃ HOÀN THÀNH

- Chuẩn hóa `Attachments` (object array), fallback đọc `TaiLieuKemTheo`.
- Upload tệp qua `AttachmentSection` sau khi có `_id`.
- Guard dialog tránh auto-close; giữ form mở sau khi tạo mới để upload ngay.

---

### Bước 5: Xây dựng component chọn thành viên (`SelectNhanVienTable.js`)

Trạng thái: ĐÃ HOÀN THÀNH

- Chọn nhiều nhân viên, hiển thị bảng tóm tắt các trường cần thiết.

---

### Bước 6: Kết nối các component và hoàn thiện luồng CRUD

Trạng thái: ĐÃ HOÀN THÀNH

- Đồng bộ cập nhật, đếm tệp, invalidation cache popover sau upload/xóa.

---

### Bước 7: Kiểm thử và hoàn thiện UI/UX

Trạng thái: TIẾP TỤC CẢI TIẾN

- Đã cải tiến `DoanRaView` (thẻ InfoCard, SectionCard), hiển thị đầy đủ trường.
- Thành viên: làm giàu dữ liệu từ store `nhanvien` nếu BE chưa populate đủ.

---

### Bước 8: Review, bổ sung, tối ưu

Trạng thái: ĐANG LÀM

- Bổ sung tài liệu và hướng dẫn kèm flow đính kèm tệp.
- Đề xuất: filter "Có tệp", phân trang/tìm kiếm BE, mở rộng populate ThanhVien.

---

**Lưu ý:**

- Mỗi bước nên hoàn thành và kiểm thử trước khi chuyển sang bước tiếp theo
- Có thể tách nhỏ hơn nữa nếu cần (ví dụ: chỉ làm bước 2.1, 2.2...)
- Nếu cần sinh code từng phần, hãy chỉ định rõ bước và file cần sinh code
