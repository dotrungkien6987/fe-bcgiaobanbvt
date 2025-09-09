# Hướng dẫn triển khai CRUD Tập San (React + Redux + MUI) kèm đính kèm tệp kehoach/file

Mục tiêu

- Hoàn thiện CRUD cho thực thể TapSan từ BE đến FE.
- Cho phép đính kèm nhiều tệp cho 2 “slot” của một Tập san:
  - kehoach: file kế hoạch
  - file: file xuất bản của tập san
- Dùng hạ tầng đính kèm chung (OwnerType/OwnerID/OwnerField) đã chuẩn hóa; DB lưu đường dẫn tương đối; login-required.
- UI/UX chuẩn: rõ ràng, dễ dùng, có trạng thái tải, xem/tải/xóa file.

Phạm vi bước này

- Chỉ mô tả chi tiết công việc (đặc tả và checklist). Chưa chỉnh sửa code. Agent sẽ thực thi theo tài liệu này ở các bước tiếp theo.

Quy ước & quyết định đã chốt

- FE: React + Redux + MUI (Material UI). Tham khảo phong cách tại `features/QuanLyCongViec`.
- OwnerField dùng slug viết thường: `kehoach` và `file` (tránh lệch hoa/thường).
- TapSan cần unique theo bộ (Loai, NamXuatBan, SoXuatBan).
- TepTin dùng soft delete (TrangThai: ACTIVE/DELETED). Chưa cần thumbnail/preview.
- Upload root cấu hình qua `.env` backend: `WM_UPLOAD_ROOT` (đã có).

---

1. Backend (BE)

1.1. Model TapSan (đã có cơ bản)

- File: `giaobanbv-be/models/TapSan.js`
- Trường chính: `Loai` ('YHTH' | 'TTT'), `NamXuatBan` (string, 4 ký tự), `SoXuatBan` (number > 0), `isDeleted` (boolean, soft delete record TapSan).
- Thêm ràng buộc & index (khi code): - Validate `NamXuatBan` là chuỗi năm 4 ký tự (regex `^\d{4}$`). - Compound unique index: `{ Loai: 1, NamXuatBan: 1, SoXuatBan: 1 }`, sparse theo `isDeleted` nếu cần (hoặc enforce ở service khi tạo/sửa để tránh trùng logic).

  1.2. API CRUD TapSan

- Tạo controller `controllers/tapsan.controller.js` với các hàm:
  - `createTapSan(req, res)`: validate đầu vào; check unique; tạo mới.
  - `listTapSan(req, res)`: phân trang, filter theo `Loai`, `NamXuatBan`, `SoXuatBan`, từ khóa; exclude `isDeleted=true`.
  - `getTapSan(req, res)`: lấy chi tiết theo id (kèm đếm file kehoach/file để hiển thị nhanh nếu muốn).
  - `updateTapSan(req, res)`: cập nhật; nếu thay đổi key unique thì kiểm tra trùng.
  - `deleteTapSan(req, res)`: soft delete (set `isDeleted=true`).
  - (Tùy chọn) `restoreTapSan(req, res)`: set `isDeleted=false`.
- Route `routes/tapsan.api.js` (mount dưới `/api/tapsan`) với `authentication.loginRequired`: - `POST /api/tapsan` - `GET /api/tapsan` - `GET /api/tapsan/:id` - `PATCH /api/tapsan/:id` - `DELETE /api/tapsan/:id` - `PATCH /api/tapsan/:id/restore` (optional)

  1.3. Đính kèm tệp cho TapSan (dùng API generic đã có)

- Upload (multipart, field name: `files`):
  - `POST /api/attachments/TapSan/:tapSanId/kehoach/files`
  - `POST /api/attachments/TapSan/:tapSanId/file/files`
- Liệt kê/Đếm:
  - `GET /api/attachments/TapSan/:tapSanId/kehoach/files`
  - `GET /api/attachments/TapSan/:tapSanId/kehoach/files/count`
  - `GET /api/attachments/TapSan/:tapSanId/file/files`
  - `GET /api/attachments/TapSan/:tapSanId/file/files/count`
- Xem/Tải theo fileId (sử dụng URL trả về trong DTO; mặc định của service generic là):
  - `GET /api/attachments/files/:fileId/inline`
  - `GET /api/attachments/files/:fileId/download`
- Xóa/Sửa thông tin file:
  - `DELETE /api/attachments/files/:fileId`
  - `PATCH /api/attachments/files/:fileId` body: `{ TenGoc?, MoTa? }`
- Lưu ý: Service đính kèm sẽ điền `OwnerType='TapSan'`, `OwnerID=<tapSanId>`, `OwnerField='kehoach'|'file'` và lưu `DuongDan` dạng tương đối.

  1.4. Kiểm thử BE nhanh (sau khi code)

- Tạo TapSan → Upload 2 loại file → List/Count → Inline/Download → Xóa file (soft delete) → List/Count cập nhật đúng.

---

2. Frontend (FE) – React + Redux + MUI

2.1. Cấu trúc đề xuất (tham khảo phong cách `features/QuanLyCongViec`)

- Thư mục: `src/features/NghienCuuKhoaHoc/TapSan/` - `pages/`: - `TapSanListPage.tsx` - `TapSanFormPage.tsx` (tạo/sửa) - `TapSanDetailPage.tsx` (tabs: Tổng quan | Kế hoạch | Tệp tập san) - `components/`: - `TapSanFilter.tsx` (lọc Loai/Nam/So + từ khóa) - `TapSanTable.tsx` (MUI DataGrid hoặc Table; cột: Loai, Nam, Số, SốFileKeHoach, SốFileFile, Ngày tạo, Hành động) - `AttachmentSection.tsx` (tái sử dụng): props `{ ownerType='TapSan', ownerId, field: 'kehoach'|'file' }` - Kéo-thả + chọn file; tiến trình upload; list + count; xem/tải/xóa. - `slices/`: - `tapsanSlice.ts` (CRUD TapSan) - (tái dùng generic) `attachmentsSlice.ts` hoặc gọi API trực tiếp trong component (nếu đơn giản) - `services/`: - `tapsan.api.ts`: wrap REST CRUD - `attachments.api.ts`: upload/list/count/delete/patch, inline/download URL builder (nếu cần) - `routes/`: đăng ký route tới các page trên.

  2.2. UI/UX

- Danh sách: bộ lọc ở bên trên; nút "Tạo Tập san" nổi bật; bảng có phân trang.
- Form tạo/sửa: kiểm tra hợp lệ (Loai bắt buộc, Nam 4 ký tự, Số > 0); nếu vi phạm unique thì hiển thị thông báo từ server.
- Chi tiết: 3 tab
  - Tổng quan: metadata + các chỉ số đếm file.
  - Kế hoạch: `AttachmentSection` với field `kehoach`.
  - Tệp tập san: `AttachmentSection` với field `file`.
- AttachmentSection: - Upload nhiều file, hiển thị tiến trình (axios `onUploadProgress`). - Danh sách: tên gốc, dung lượng, ngày; nút xem (inline), tải (download), xóa. - Sau khi upload hoặc xóa xong, refresh list/count.

  2.3. API hợp đồng (FE gọi)

- TapSan:
  - `POST /api/tapsan` body: `{ Loai, NamXuatBan, SoXuatBan }`
  - `GET /api/tapsan?page=&size=&Loai=&NamXuatBan=&SoXuatBan=&search=`
  - `GET /api/tapsan/:id`
  - `PATCH /api/tapsan/:id`
  - `DELETE /api/tapsan/:id`
- Attachments (dùng chung): - `POST /api/attachments/TapSan/:tapSanId/:field/files` (field là `kehoach` hoặc `file`) - `GET /api/attachments/TapSan/:tapSanId/:field/files` - `GET /api/attachments/TapSan/:tapSanId/:field/files/count` - `DELETE /api/attachments/files/:fileId` - `PATCH /api/attachments/files/:fileId` (đổi `TenGoc`/`MoTa` nếu muốn) - Xem/Tải: dùng `inlineUrl`/`downloadUrl` trả về trong DTO của list/upload.

  2.4. State & Redux

- tapsanSlice: actions `fetchList`, `create`, `fetchById`, `update`, `remove`; lưu filters & pagination; status flags loading/error.
- attachments (có thể không cần slice riêng): mỗi `AttachmentSection` tự quản list/count theo `ownerId` + `field` để tránh đụng state giữa tabs.

  2.5. Xử lý lỗi & bảo mật

- Luôn gửi `Authorization: Bearer <token>`.
- Hiển thị thông báo rõ ràng khi server trả lỗi: trùng unique, sai MIME, vượt dung lượng.

---

3. Kiểm thử chấp nhận (UAT)

- Tạo TapSan Loai=YHTH, Nam=2025, Số=1 → thành công.
- Upload 2 file vào `kehoach` → list hiển thị 2, count=2, inline/download OK.
- Upload 3 file vào `file` → list hiển thị 3, count=3.
- Xóa 1 file ở `kehoach` → count giảm, file không còn xuất hiện.
- Sửa TapSan (đổi SoXuatBan) → lưu OK (nếu trùng unique, server báo lỗi và FE hiện thông báo).
- Tìm kiếm danh sách theo Loai/Năm/Số → trả kết quả đúng.

---

4. Công việc chi tiết cho Agent (sau khi bạn duyệt)

- BE
  - Tạo controller + route CRUD TapSan; thêm unique check; soft delete.
  - Giữ nguyên API attachments generic (đã có); không cần thay đổi.
- FE
  - Tạo pages List/Form/Detail và route tương ứng.
  - Tạo `AttachmentSection` dùng chung; tích hợp vào 2 tab `kehoach` và `file`.
  - Viết tapsan.api + (tùy chọn) attachments.api; tích hợp Redux slice.
  - Áp dụng phong cách code từ `features/QuanLyCongViec` (cấu trúc file, đặt tên, hooks).

---

5. Ghi chú cấu hình

- Backend `.env` đã có `WM_UPLOAD_ROOT`; nếu đổi thư mục lưu trữ, chỉnh lại và restart BE.
- MIME/size giữ mặc định trong `.env` (ALLOWED_MIME, MAX_FILE_SIZE_MB, MAX_TOTAL_UPLOAD_MB).

---

6. Mở rộng tương lai (không nằm trong bước này)

- Thêm thống kê số file, dung lượng theo TapSan.
- Thêm preview PDF/ảnh; tạo thumbnail.
- Phân quyền chi tiết theo vai trò (hiện tại chỉ cần login).

---

7. Câu hỏi đã được trả lời

- FE stack: React + Redux + MUI.
- Unique (Loai, NamXuatBan, SoXuatBan): CÓ.
- Soft delete cho TepTin: CÓ (đã sử dụng TrangThai ACTIVE/DELETED và filter list theo ACTIVE).
- Thumbnail/preview: CHƯA CẦN.

Hết.
