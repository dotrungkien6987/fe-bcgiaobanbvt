## KẾ HOẠCH TỪNG BƯỚC — QUẢN LÝ ĐOÀN VÀO

### Bước 1: Khởi tạo cấu trúc và API helper

- Tạo file: `api.js`, `doanvaoSlice.js`, `DoanVaoTable.js`, `DoanVaoForm.js`, `DoanVaoView.js`
- `api.js`: map đầy đủ CRUD `/doanvao`

Chấp nhận khi: gọi được GET `/doanvao` và render bảng rỗng.

### Bước 2: Redux slice cơ bản

- Khai báo state, reducers, thunks: getDoanVaos/getDoanVaoById/create/update/delete
- Chuẩn hóa ngày hiển thị `NgayKyVanBanFormatted`, `ThoiGianVaoLamViecFormatted`

Chấp nhận khi: tạo/cập nhật/xóa cập nhật bảng và `currentDoanVao`.

### Bước 3: Bảng danh sách + Actions

- Hiển thị cột: Ngày ký, Số VB, Mục đích, Thời gian vào làm việc, Ghi chú, # Tệp, Actions
- Expand row hiển thị `DoanVaoView`

Chấp nhận khi: có thể mở form thêm/sửa và xem chi tiết.

### Bước 4: Form + Editor Thành viên

- Form RHF + Yup
- Editor embedded ThanhVien: thêm/xóa dòng; validate Tên/Ngày sinh/Giới tính
- NhanVienID: chọn hoặc auto set user hiện tại (nếu có auth context)

Chấp nhận khi: submit thành công và dữ liệu trả về đúng BE.

### Bước 5: Attachments

- Thêm cột `# Tệp` + Popover lazy load
- `AttachmentSection` ở form (sau khi có \_id)
- Thunks: fetchDoanVaoAttachmentsCount, refreshDoanVaoAttachmentCountOne

Chấp nhận khi: upload/xóa file → đếm cập nhật.

### Bước 6: View chi tiết

- Hiển thị đầy đủ trường và bảng thành viên
- Nếu không embed Attachments → lazy-fetch danh sách file

Chấp nhận khi: detail hiển thị đầy đủ và ổn định.

### Bước 7: Cải tiến/Hoàn thiện

- Thêm filter “Có tệp”
- Tìm kiếm/phân trang UI (tận dụng BE)
- (Tuỳ chọn) Widget thống kê từ `/api/doanvao/stats`

Chấp nhận khi: bàn giao tài liệu & UI/UX đồng nhất với Đoàn Ra.
