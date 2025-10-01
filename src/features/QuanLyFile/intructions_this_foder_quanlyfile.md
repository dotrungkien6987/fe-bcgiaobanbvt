## Quản lý Tệp tin (Admin) – Kế hoạch triển khai Full Stack

Mục tiêu: Tạo một trang quản trị dành cho Admin để quản lý tất cả tệp tin trong hệ thống (xem danh sách, cây thư mục, thống kê dung lượng/loại, xem trạng thái xóa mềm, phục hồi, xóa vĩnh viễn, dọn dẹp chênh lệch DB/FS). UI cho Công việc và Bình luận giữ nguyên, không ảnh hưởng nghiệp vụ hiện tại.

### Phạm vi và nguyên tắc

- Phạm vi: Chỉ Admin có quyền truy cập (RBAC). Không thay đổi UI hiện có ở Công việc/Bình luận.
- Dữ liệu cốt lõi dùng model `TepTin` (Mongoose) với các trường: TenFile, TenGoc, LoaiFile, KichThuoc, DuongDan, OwnerType, OwnerID, OwnerField, CongViecID, YeuCauHoTroID, BinhLuanID, NguoiTaiLenID, MoTa, TrangThai (ACTIVE|DELETED), NgayTaiLen.
- Soft-delete mặc định (TrangThai=DELETED). Force delete sẽ xóa cả file vật lý (nếu còn) và record DB.
- Mặc định sắp xếp theo thời gian tải lên mới nhất (NgayTaiLen desc). Hỗ trợ phân trang, lọc, tìm kiếm cơ bản.

---

## Backend

### 1) Kiến trúc & nơi thêm mới

- Reuse model: `modules/workmanagement/models/TepTin.js` (đã có indexes, virtuals, statics `thongKeTheoLoaiFile`, `thongKeKichThuoc`).
- Tạo controller admin riêng: `modules/workmanagement/controllers/fileAdmin.controller.js`.
- Tạo route admin: `modules/workmanagement/routes/fileAdmin.api.js` và mount dưới prefix `/api/workmanagement/admin` trong router chính của module WorkManagement.
- Áp dụng middleware xác thực hiện có (ví dụ `authentication.loginRequired`) + kiểm tra quyền Admin ở controller (hoặc middleware `authorizeAdmin`).

### 2) Biến môi trường & cấu hình

- `WM_UPLOAD_ROOT`: thư mục gốc nơi lưu file vật lý (mặc định `uploads/`).
- `MAX_FILE_SIZE_MB`, `ALLOWED_MIME` (nếu cần cho tác vụ cleanup/kiểm tra file).

### 3) Hợp đồng API (Admin-only)

Base: `/api/workmanagement/admin`

1. GET `/files`

- Mô tả: Liệt kê tất cả tệp (bao gồm ACTIVE/DELETED), hỗ trợ phân trang/lọc.
- Query params: `page` (default 1), `size` (default 50), `q` (search TenGoc/MoTa), `TrangThai` (`ACTIVE|DELETED`), `LoaiFile`, `OwnerType`, `OwnerID`, `OwnerField`, `NguoiTaiLenID`, `sort` (mặc định `-NgayTaiLen`).
- Response:
  - `items[]`: danh sách TepTinDTO (kèm `inlineUrl`, `downloadUrl`).
  - `page`, `size`, `total`, `totalPages`.

2. GET `/files/stats`

- Mô tả: Thống kê dung lượng và số lượng file.
- Response `data`:
  - `byType[]`: `{ _id: LoaiFile, soLuong, tongKichThuoc }` (từ `thongKeTheoLoaiFile`).
  - `sizeStats`: `{ tongKichThuoc, soLuongFile, kichThuocTrungBinh }` (từ `thongKeKichThuoc`).

3. GET `/files/tree?by=owner|path`

- `by=owner`: group theo `{ OwnerType, OwnerID, OwnerField }`, trả về `count`, `size`.
- `by=path`: dựng cây theo `DuongDan` (chuỗi path `/`), gộp `count`, `size` theo từng nút.

4. PATCH `/files/:id/restore`

- Mô tả: Phục hồi file đã xóa mềm (set `TrangThai=ACTIVE`).

5. DELETE `/files/:id`

- Mô tả: Xóa mềm tệp (set `TrangThai=DELETED`).
- Query `force=1`: Xóa vĩnh viễn (xóa vật lý + record DB).

6. POST `/files/cleanup?fix=1`

- Mô tả: Quét chênh lệch DB/FS. Nếu `fix=1` thì tự động đánh dấu DELETED với những record không còn file vật lý.
- Response: `{ total, missingOnDisk, markedDeleted, fixed }`.

7. (Tùy chọn) GET `/files/:id` (lấy metadata chi tiết), PATCH `/files/:id` (cập nhật meta `MoTa`, `TenGoc`).

TepTinDTO (chuẩn hóa client dùng):

```
{
	_id, TenFile, TenGoc, LoaiFile, KichThuoc, DuongDan,
	OwnerType, OwnerID, OwnerField,
	CongViecID, YeuCauHoTroID, BinhLuanID,
	NguoiTaiLenID: { _id, HoTen, MaNhanVien } | _id,
	MoTa, TrangThai, NgayTaiLen,
	inlineUrl: "/api/workmanagement/files/:id/inline",
	downloadUrl: "/api/workmanagement/files/:id/download",
	createdAt, updatedAt
}
```

### 4) Quyền truy cập

- Chỉ tài khoản có vai trò Admin mới sử dụng các endpoint trên. Controller kiểm tra `req.user.role` hoặc `req.user.PhanQuyen`.
- Ghi log (audit) cho các thao tác nhạy cảm: force delete, restore, cleanup (tùy chọn mở rộng sau).

### 5) Edge cases & hiệu năng

- File vật lý đã bị xóa thủ công: cleanup sẽ đánh dấu DELETED (khi `fix=1`).
- Record mồ côi (Owner không còn tồn tại): vẫn hiển thị; Admin có thể xóa/force delete.
- Phân trang lớn: dựa trên index `NgayTaiLen`, `TrangThai`, `OwnerType/OwnerID/OwnerField`.
- Sort an toàn: chấp nhận whitelist trường sort (`NgayTaiLen`, `KichThuoc`, `TenGoc`).
- Dung lượng lớn: dùng aggregate hiện có (đã đơn giản và có filter `TrangThai: ACTIVE` trong statics).

---

## Frontend

### 1) Công nghệ & nguyên tắc

- React 18 + Redux Toolkit + MUI v5 + React Hook Form + Yup; toast theo chuẩn dự án.
- Sử dụng `apiService` và `REACT_APP_BACKEND_API` từ `.env`.
- UI thuần Việt, responsive, có loading và thông báo lỗi/thành công.

### 2) Cấu trúc thư mục mới

```
src/features/QuanLyFile/
	intructions_this_foder_quanlyfile.md  # Tài liệu này
	tepTinAdminSlice.js                   # Redux slice cho admin files
	pages/
		TepTinAdminPage.js                  # Trang chính: bảng + filter + hành động
	components/
		StatsCards.js                       # Thẻ thống kê dung lượng/loại
		TepTinTreePanel.js                  # TreeView theo owner/path
		FileRowActions.js                   # Restore / Soft delete / Force delete
		FileFilters.js                      # Bộ lọc: TrangThai/LoaiFile/OwnerType/OwnerID/Field/NguoiTaiLen
```

Router: thêm route Admin (ví dụ):

- Path: `/admin/teptin` → `TepTinAdminPage`.
- Ẩn/hiện theo role Admin (guard tại route hoặc trong page).

### 3) Redux slice – chuẩn dự án

- State: `{ isLoading, error, items, page, size, total, stats, tree }`.
- Actions/Thunks:
  - `listFiles(params)` → GET `/workmanagement/admin/files` → `listSuccess`.
  - `getStats()` → GET `/workmanagement/admin/files/stats` → `statsSuccess`.
  - `getTree(by)` → GET `/workmanagement/admin/files/tree?by=...` → `treeSuccess`.
  - `restoreFile(id)` → PATCH `/workmanagement/admin/files/:id/restore` → `updateOne` + toast.
  - `softDeleteFile(id)` → DELETE `/workmanagement/admin/files/:id` → `updateOne(TrangThai=DELETED)` + toast.
  - `forceDeleteFile(id)` → DELETE `/workmanagement/admin/files/:id?force=1` → `removeOne` + toast.
  - `cleanup(fix)` → POST `/workmanagement/admin/files/cleanup?fix=1` → toast kết quả.

Lưu ý: tuân theo pattern `startLoading/hasError/success` và có toast thông báo thành công/thất bại như guideline.

### 4) Trang `TepTinAdminPage` – chức năng

- Bảng dữ liệu:
  - Cột: Tên gốc, Loại, Kích thước (định dạng MB/KB), Trạng thái, OwnerType/OwnerID/OwnerField, Người tải lên, Ngày tải lên, Hành động.
  - Tìm kiếm nhanh (q), lọc nâng cao (TrangThai, LoaiFile, Owner, Người tải lên), phân trang, sắp xếp.
  - Hành động trên từng dòng: Xem (inline/download), Restore, Soft Delete, Force Delete.
- Tree panel: tab `Theo owner` và `Theo thư mục`.
  - Theo owner: hiển thị theo cây `OwnerType → OwnerID → OwnerField` kèm (count, size).
  - Theo thư mục (DuongDan): cây thư mục và số lượng/dung lượng từng nút.
- Stats cards: tổng dung lượng, số tệp, trung bình; biểu đồ donut theo LoaiFile (tùy chọn).
- Nút dọn dẹp: mở dialog xác nhận; chạy `cleanup(fix=1)`; hiển thị kết quả.

### 5) Trải nghiệm người dùng (UX)

- Hiển thị trạng thái DELETED bằng màu/nhãn rõ ràng, ẩn nút Restore khi đang ACTIVE.
- Xác nhận 2 bước cho Force Delete; hiển thị cảnh báo không thể phục hồi.
- Tooltip cho Loại file và Kích thước; icon theo loại (image/pdf/doc/xls/video/audio/other).
- Loading skeleton cho bảng/trees/stats.

### 6) Hợp đồng dữ liệu cho FE

- Item: TepTinDTO như mô tả ở phần Backend.
- Tree (owner): mảng các group `{ _id: { OwnerType, OwnerID, OwnerField }, count, size }`.
- Tree (path): đối tượng lồng nhau dạng `{ children: { folder: { count, size, children: {...} } } }`.
- Stats: `byType[]` và `sizeStats`.

---

## Chất lượng & kiểm thử

### Definition of Done

- BE: Tất cả endpoint chạy OK, trả dữ liệu đúng contract; phân quyền Admin; xử lý soft/force delete; cleanup hoạt động với tham số `fix`.
- FE: Trang `/admin/teptin` hoạt động; có filter, phân trang, tree, stats; thao tác Restore/Soft/Force delete, Cleanup có confirm và toast.
- Không làm hỏng UI/luồng upload của Công việc/Bình luận hiện có.

### Quality gates

- Build/lint không lỗi.
- Unit test nhanh (BE): list/stats/tree/restore/delete/cleanup happy path + 1-2 edge.
- Smoke test: liệt kê 20 file gần nhất; restore một file DELETED; force delete một file ACTIVE; cleanup (không fix) và cleanup (fix=1).

### Edge cases cần kiểm thử

- File vật lý không tồn tại nhưng DB là ACTIVE → cleanup đánh dấu DELETED (fix=1).
- File DELETED được restore.
- Force delete thành công khi file vật lý không còn (không lỗi).
- Lọc theo OwnerType + OwnerID + OwnerField.
- Phân trang lớn và sắp xếp theo KichThuoc.

---

## Kế hoạch triển khai (tuần tự ngắn gọn)

1. Backend

   - [ ] Tạo controller `fileAdmin.controller.js` theo các endpoint trên.
   - [ ] Tạo route `fileAdmin.api.js`, mount `/api/workmanagement/admin` trong router chính.
   - [ ] Áp dụng `loginRequired` + kiểm tra Admin.
   - [ ] Kiểm thử nhanh bằng Postman: list, stats, tree(owner/path), restore, delete, force delete, cleanup.

2. Frontend

   - [ ] Tạo `tepTinAdminSlice.js` theo pattern chuẩn Redux của dự án.
   - [ ] Tạo `TepTinAdminPage.js` với bảng + filters + actions + pagination.
   - [ ] Tạo `StatsCards.js`, `TepTinTreePanel.js`, `FileRowActions.js`, `FileFilters.js`.
   - [ ] Thêm route `/admin/teptin` và guard theo role.
   - [ ] Kết nối slice với trang, hoàn thiện UX (loading/toast/confirm).

3. Tài liệu & bàn giao
   - [ ] Cập nhật README/CHANGELOG module WorkManagement.
   - [ ] Ghi chú biến môi trường (`WM_UPLOAD_ROOT`) và quyền Admin.

---

## Ghi chú tích hợp hiện có

- UI Công việc/Bình luận: giữ nguyên (đã có upload/list/xóa theo ngữ cảnh riêng). Trang Admin chỉ đọc/điều hành tệp ở mức hệ thống, không thay đổi hợp đồng hiện tại.
- Endpoint xem/tải nội dung file (inline/download) đã có (giả định: `/api/workmanagement/files/:id/inline|download`), Admin page chỉ cần gắn link từ TepTinDTO.

---

## Nâng cấp tương lai (tùy chọn)

- Audit log cho thao tác xóa/khôi phục.
- Lọc theo kích thước (range), mime, khoảng thời gian.
- Bulk actions: restore/delete nhiều file.
- Export CSV danh sách file theo bộ lọc.
- Bộ nhớ đệm stats (cache ngắn) nếu dữ liệu lớn.

Hết.
