# Đoàn Vào — Tài liệu kỹ thuật

Mục tiêu: Xây dựng chức năng Quản lý Đoàn Vào tương tự Đoàn Ra, giữ UI/UX và component pattern thống nhất, nhưng khác biệt dữ liệu theo mô hình BE.

## 1) Khác biệt chính so với Đoàn Ra

- Thành viên:
  - Đoàn Ra: chọn Nhân viên (ref NhanVien) → gửi mảng ObjectId.
  - Đoàn Vào: nhập danh sách thành viên embedded (Ten, NgaySinh, GioiTinh, ChucVu, DonViCongTac, QuocTich, DonViGioiThieu).
- Trường thời gian:
  - Đoàn Ra: `ThoiGianXuatCanh`
  - Đoàn Vào: `ThoiGianVaoLamViec`
- Các trường còn lại tương đối tương đồng: `NgayKyVanBan`, `SoVanBanChoPhep`, `MucDichXuatCanh`, `BaoCao`, `GhiChu`.
- BE Đoàn Vào có thêm `NhanVienID` (người tạo/phụ trách), populate cơ bản trong GET.

## 2) Data model (tham chiếu BE)

Model DoanVao:

- NgayKyVanBan: Date (required)
- NhanVienID: ObjectId (required theo route POST)
- SoVanBanChoPhep: string
- MucDichXuatCanh: string
- ThoiGianVaoLamViec: Date
- BaoCao: string
- GhiChu: string
- ThanhVien: array of embedded objects:
  - Ten (required), NgaySinh (required), GioiTinh (0=Nam,1=Nữ), ChucVu, DonViCongTac, QuocTich, DonViGioiThieu
- isDeleted: boolean

Lưu ý: BE routes có phân trang cho GET list và có thống kê `/stats`.

## 3) FE/BE mapping

- GET `/api/doanvao` — list (page, limit, search, fromDate, toDate)
- GET `/api/doanvao/:id` — detail
- POST `/api/doanvao` — create (validate NgayKyVanBan, NhanVienID, ThanhVien.\*)
- PUT `/api/doanvao/:id` — update (validate optional)
- DELETE `/api/doanvao/:id` — soft delete

Attachments: Hạ tầng Attachments đã có thể tái sử dụng với `ownerType=DoanVao`, `field=file` như Đoàn Ra.

- Upload: POST `/api/attachments/DoanVao/:id/file/files`
- List: GET `/api/attachments/DoanVao/:id/file/files`
- Batch count: POST `/api/attachments/batch-count`
- Preview/Download: GET `/api/attachments/files/:id/inline|download`

## 4) Kiến trúc & Component dự kiến

- Redux slice: `doanvaoSlice.js`
  - State: list, currentDoanVao, isLoading/error, attachmentsCount (map)
  - Thunks: getDoanVaos, getDoanVaoById, createDoanVao, updateDoanVao, deleteDoanVao, fetchDoanVaoAttachmentsCount, refreshDoanVaoAttachmentCountOne
- API helper: `api.js` (GET/POST/PUT/DELETE `/doanvao`)
- Table: `DoanVaoTable.js`
  - Cột tương tự Đoàn Ra: Ngày ký, Số VB, Mục đích, Thời gian vào làm việc, Ghi chú, # Tệp, Actions
  - Expand row → `DoanVaoView`
  - Button Add/Update/Delete dùng component tương tự Đoàn Ra
  - Popover file list lazy + refresh giống Đoàn Ra
- Form: `DoanVaoForm.js`
  - Các trường cơ bản như BE yêu cầu
  - `ThanhVien`: editor dạng bảng in-form (add/remove dòng, các cột: Tên, Ngày sinh, Giới tính, Chức vụ, Đơn vị công tác, Quốc tịch, Đơn vị giới thiệu)
  - Upload tệp sau khi có `_id` với `AttachmentSection`
- View: `DoanVaoView.js`
  - Hiển thị đủ trường + bảng thành viên (đọc từ embedded list)
  - Đính kèm: ưu tiên embedded Attachments nếu có; nếu không, lazy fetch như Đoàn Ra

## 5) UX & Validation

- Form validation: giống pattern Yup + RHF; validate ThanhVien.\* theo BE (Tên/Ngày sinh bắt buộc, Giới tính enum)
- Loading/Toast: theo Redux pattern chuẩn của dự án
- Dialog close guard: áp dụng fix tương tự Đoàn Ra để tránh auto-close

## 6) Edge cases

- Không có thành viên: hiển thị empty state
- Ngày không hợp lệ: bỏ qua hoặc hiển thị dạng raw
- Đếm tệp: món này dùng batch count; refresh khi upload/xóa

## 7) Lộ trình thực thi

1. Tạo slice + api + table rỗng chạy được danh sách
2. Thêm form create/update (chưa có attachments)
3. Bổ sung editor Thành viên embedded
4. Thêm attachments (chip # Tệp + popover + upload/refresh)
5. Xây view chi tiết
6. Tối ưu, test, docs

## 8) Đề xuất cải tiến

- Server-side pagination/search đã có ở BE: thêm UI filter/search, điều khiển page/limit
- Stats UI: tận dụng `/api/doanvao/stats` để vẽ biểu đồ tháng
- Quy ước quốc tịch/quốc gia: có thể dùng danh sách chuẩn cho autocomplete
- Xuất báo cáo: đánh dấu mốc để tích hợp output sau
