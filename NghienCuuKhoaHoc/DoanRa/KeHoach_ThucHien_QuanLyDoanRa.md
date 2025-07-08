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

- Hiển thị danh sách Đoàn Ra dạng bảng (table)
- Các cột: Ngày ký, Số văn bản, Mục đích, Thời gian xuất cảnh, Quốc gia đến, Ghi chú, ...
- Có nút Thêm mới, Sửa, Xóa trên từng dòng hoặc cuối bảng
- Kết nối với redux để lấy dữ liệu

---

### Bước 4: Xây dựng form thêm/sửa Đoàn Ra (`DoanRaForm.js`)

- Hiển thị popup form khi Thêm/Sửa
- Các trường nhập: Ngày ký, Số văn bản, Mục đích, Thời gian xuất cảnh, Quốc gia đến, Ghi chú, TaiLieuKemTheo (nhập link), Thành Viên (multi-select)
- Không hiển thị các trường isDeleted, timestamps
- Kết nối redux để submit dữ liệu

---

### Bước 5: Xây dựng component chọn thành viên (`SelectNhanVienTable.js`)

- Tham khảo SeLectHocVienTable để xây dựng bảng chọn nhiều nhân viên
- Lấy danh sách nhân viên từ redux hoặc gọi API getAll
- Trả về danh sách nhân viên đã chọn cho form Đoàn Ra

---

### Bước 6: Kết nối các component và hoàn thiện luồng CRUD

- Khi nhấn Thêm/Sửa ở bảng, mở popup form, truyền dữ liệu cần thiết
- Khi submit form, gọi redux thunk để tạo/cập nhật Đoàn Ra
- Khi nhấn Xóa, xác nhận rồi gọi redux thunk xóa Đoàn Ra
- Sau mỗi thao tác, cập nhật lại bảng danh sách

---

### Bước 7: Kiểm thử và hoàn thiện UI/UX

- Đảm bảo các thao tác mượt mà, popup đóng/mở đúng, dữ liệu cập nhật realtime
- Kiểm tra lại các trường hợp lỗi, loading, empty state
- Đảm bảo UI/UX đồng nhất với các module khác (Khoa, SeLectHocVienTable)

---

### Bước 8: Review, bổ sung, tối ưu

- Review từng bước, bổ sung validate nếu cần
- Tối ưu code, tách nhỏ component nếu cần
- Bổ sung hướng dẫn sử dụng, comment code rõ ràng

---

**Lưu ý:**

- Mỗi bước nên hoàn thành và kiểm thử trước khi chuyển sang bước tiếp theo
- Có thể tách nhỏ hơn nữa nếu cần (ví dụ: chỉ làm bước 2.1, 2.2...)
- Nếu cần sinh code từng phần, hãy chỉ định rõ bước và file cần sinh code
