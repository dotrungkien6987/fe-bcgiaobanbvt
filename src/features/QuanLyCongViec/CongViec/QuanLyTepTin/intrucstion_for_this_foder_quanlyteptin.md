## Kế hoạch triển khai: Quản lý Tệp Tin đính kèm cho Công Việc và Bình Luận (Agent Guide)

Tài liệu này là ngữ cảnh chi tiết để AI vận hành chế độ agent, triển khai end-to-end tính năng đính kèm tệp tin lưu local, gắn với Công Việc và Bình Luận, có phân quyền, soft delete và UI/UX đầy đủ.

### Checklist yêu cầu (nguồn: chủ repo)

- Lưu local path: yes. Cây thư mục dưới `uploads/` theo CôngViệc và BìnhLuận.
- Base URL/Truy cập: không public trần; truy cập qua API có kiểm quyền; cung cấp endpoint inline/download.
- Giới hạn dung lượng và loại file: đề xuất ở dưới (mặc định an toàn, có env override).
- Phân quyền: Xem/Tải = tất cả người liên quan công việc (Người giao, người chính, người phối hợp) và admin; Xóa = chỉ người tải lên (uploader) hoặc admin.
- Gắn với Bình luận: 1 request multipart để tạo comment + upload files.
- Xóa bình luận: giữ file, bỏ liên kết (unset BinhLuanID), file vẫn thuộc CôngViec.
- Metadata: cho phép sửa tên hiển thị (TenGoc) và mô tả (MoTa) sau khi upload.
- Preview/Thumbnail: có; ảnh preview trực tiếp; PDF xem bằng pdfjs trên FE; thumbnail ảnh server-side (tùy chọn); PDF thumbnail FE.
- NguoiTaiLenID: tham chiếu NhanVien (ánh xạ 1-1 với User).
- Dọn dẹp: cascade soft delete khi CôngViệc bị xóa mềm; không xóa vật lý mặc định.
- UX: kéo-thả, paste ảnh clipboard, multi-upload, progress; badge số file ở danh sách task.

---

## 1) Cấu hình & tiêu chuẩn

Env (giaobanbv-be/.env):

- UPLOAD_DIR=./uploads
- MAX_FILE_SIZE_MB=50
- MAX_TOTAL_UPLOAD_MB=200
- ALLOWED_MIME=image/\*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain
- ENABLE_IMAGE_THUMBNAIL=true

Quy ước lưu trữ local (Windows/Linux an toàn bằng path.join):

- Ảnh/tệp thuộc công việc (không theo bình luận): `uploads/congviec/{CongViecID}/YYYY/MM/{unique}`
- Tệp gắn bình luận: `uploads/congviec/{CongViecID}/comments/{BinhLuanID}/YYYY/MM/{unique}`
- Thumbnail ảnh (nếu bật): cùng thư mục, tên `{basename}.thumb.jpg`

Tên file vật lý:

- `{timestamp}-{rand6}-{slug(TenGoc)}.{ext}` để tránh đụng độ và dễ truy vết.

Bảo mật truy cập:

- Không expose `uploads/` trực tiếp qua static công khai.
- Tải/xem qua API: `/api/files/:id/(inline|download)` có kiểm quyền.

Giới hạn & kiểm tra:

- Per-file ≤ MAX_FILE_SIZE_MB (mặc định 50MB).
- Tổng request ≤ MAX_TOTAL_UPLOAD_MB (mặc định 200MB).
- Whitelist ALLOWED_MIME.
- Loại bỏ file có đường dẫn bất thường (path traversal), sanitize TenGoc.

---

## 2) Model & dữ liệu

Hiện trạng: `modules/workmanagement/models/TepTin.js` đã có các trường cần thiết, trong đó `NguoiTaiLenID` đang `ref: "User"`.

Thay đổi (không phá vỡ dữ liệu cũ, nhưng khuyến nghị):

- Đổi `ref` của `NguoiTaiLenID` sang `"NhanVien"` để phù hợp phân quyền thực tế. Mapping từ `req.user` → `req.user.NhanVienID`.
- Thêm index tổng hợp tối ưu: `{ CongViecID: 1, TrangThai: 1, NgayTaiLen: -1 }`.
- Không cần thêm trường vào `CongViec.js`. Khuyến nghị thêm virtual:
  - `CongViec.virtual('TepTins', { ref: 'TepTin', localField: '_id', foreignField: 'CongViecID', options: { match: { TrangThai: 'ACTIVE' }, sort: { NgayTaiLen: -1 } } })`.

Đối tượng trả về cho FE (contract):

```
TepTinDTO {
	_id: string,
	TenFile: string,        // tên vật lý lưu server
	TenGoc: string,         // tên hiển thị (sửa được)
	LoaiFile: string,       // mime
	KichThuoc: number,      // bytes
	DuongDan: string,       // đường dẫn nội bộ server (không public)
	CongViecID: string,
	BinhLuanID?: string | null,
	NguoiTaiLenID: string,  // NhanVien _id
	MoTa?: string,
	TrangThai: 'ACTIVE' | 'DELETED',
	NgayTaiLen: string,
	KichThuocFormat?: string, // virtual
	DuoiFile?: string,        // virtual
	inlineUrl: string,        // API xem inline
	downloadUrl: string,      // API tải file
	thumbnailUrl?: string     // nếu là ảnh và thumbnail có sẵn
}
```

---

## 3) BE: API & Middleware

Thư viện: `multer`, `mime-types`, `uuid` (hoặc nanoid), `sharp` (tùy chọn thumbnail ảnh).

Middleware chung:

- `auth` lấy `req.user` + `req.user.NhanVienID`.
- `canAccessCongViec(congViecId, nhanVienId)` trả true nếu là người giao, người chính, người phối hợp, hoặc admin.
- `canDeleteFile(file, nhanVienId)` trả true nếu `file.NguoiTaiLenID === nhanVienId` hoặc admin.

Multer storage:

- diskStorage với dynamic destination theo `{CongViecID,BinhLuanID}`
- Kiểm MIME, size trước khi ghi; reject sớm.

Endpoints (v1):

1. Upload file cho công việc (không comment)

- POST `/api/congviec/:congViecId/files`
- Form: `files[]` (multi), `moTa?`
- Quyền: `canAccessCongViec`
- Trả về: `TepTinDTO[]`

2. Tạo bình luận + upload file (1 request multipart)

- POST `/api/congviec/:congViecId/comments`
- Form: `noiDung` (text), `files[]` (optional multi), `parentId?`
- Flow: tạo BinhLuan → lưu file (kèm `BinhLuanID`) → trả về `BinhLuan` đã populate `files`

3. Danh sách file theo công việc

- GET `/api/congviec/:congViecId/files`
- Quyền: `canAccessCongViec`
- Query: `page,size,sort` (mặc định `NgayTaiLen desc`)

4. Danh sách file theo bình luận

- GET `/api/binhluan/:binhLuanId/files`
- Quyền: `canAccessCongViec` của công việc chứa bình luận

5. Xem/tải file (stream có kiểm quyền)

- GET `/api/files/:id/inline` → header `Content-Disposition: inline`
- GET `/api/files/:id/download` → header `Content-Disposition: attachment`
- Quyền: `canAccessCongViec(file.CongViecID, req.user.NhanVienID)`

6. Xóa (soft) file

- DELETE `/api/files/:id`
- Quyền: `canDeleteFile`
- Hành vi: set `TrangThai='DELETED'`, không xóa vật lý.

7. Đổi tên/Mô tả file

- PATCH `/api/files/:id`
- Body: `{ TenGoc?, MoTa? }`
- Quyền: uploader hoặc admin

8. Đếm file (badge)

- GET `/api/congviec/:congViecId/files/count`
- Quyền: `canAccessCongViec`

Logic khi xóa bình luận:

- Service xóa bình luận sẽ `unset BinhLuanID` trên các TepTin liên kết (không đổi CongViecID, giữ ACTIVE).

Cascade khi xóa mềm công việc:

- Service công việc set TrangThai/IsDeleted → cập nhật tất cả TepTin `TrangThai='DELETED'` (soft), giữ file vật lý.

Thumbnail ảnh (tùy chọn):

- Nếu `ENABLE_IMAGE_THUMBNAIL=true` và là `image/*`, tạo `{basename}.thumb.jpg` (width 320, chất lượng 75) bằng `sharp`.
- Expose thumbnail qua `/api/files/:id/thumbnail` (stream).

---

## 4) FE: API client, Redux, UI/UX

API client (axios):

- `uploadFilesForTask(congViecId, files, { moTa? }, onProgress?) => TepTinDTO[]`
- `createCommentWithFiles(congViecId, { noiDung, parentId? }, files, onProgress?) => CommentDTO`
- `listFilesByTask(congViecId, query?) => { items: TepTinDTO[], total }`
- `listFilesByComment(binhLuanId) => TepTinDTO[]`
- `deleteFile(fileId)`; `renameFile(fileId, { TenGoc?, MoTa? })`
- `countFilesByTask(congViecId) => number`

Redux slice `quanLyTepTinSlice` (features/QuanLyCongViec/CongViec/QuanLyTepTin/):

- state per `congViecId`: `items`, `loading`, `error`, `total`
- actions: `fetchByTask`, `uploadToTask`, `deleteOne`, `renameOne`, `countByTask`
- selectors: `selectFilesByTask(congViecId)`, `selectFileCount(congViecId)`

UI Components:

- `FileUploadArea` (drag-drop, paste ảnh, multi-upload, progress, size/mime validation client-side)
- `FileList` (icon theo loại, tên, mô tả, kích thước, người tải lên, thời gian; actions: preview/download/delete/rename)
- `FileBadge` (hiển thị số lượng file, dùng ở bảng công việc)
- `CommentComposer` tích hợp file (1 request): preview file trước khi gửi, có thể bỏ chọn.

Tích hợp màn hình:

- Trong `CongViecDetailDialog`: tab/section “Tệp đính kèm” dùng `FileUploadArea` + `FileList`.
- Trong luồng bình luận (nếu đã có): composer nhận `files[]`, gửi `createCommentWithFiles`.
- Ở bảng danh sách công việc: thêm `FileBadge` (paperclip + count) từ `countFilesByTask`.

Preview:

- Ảnh: dùng `<img>` với `/api/files/:id/inline` hoặc `/api/files/:id/thumbnail`.
- PDF: dùng `pdfjs-dist` (đã có trong repo) để xem inline (trong dialog) từ `inlineUrl`.
- File khác: icon + nút tải.

UX/Khả dụng:

- Hiển thị progress per-file; cho phép hủy upload.
- Hiển thị lỗi rõ ràng: quá dung lượng, sai loại file, quyền.
- Debounce khi gọi `countFilesByTask` hàng loạt (ví dụ trong danh sách).

---

## 5) Quyền & kiểm tra an toàn

Quy tắc:

- Xem/Tải: bất kỳ ai là người giao/chính/phối hợp trong công việc, hoặc admin.
- Xóa/Sửa tên/Mô tả: chỉ uploader (NguoiTaiLenID) hoặc admin.

Edge cases:

- Công việc đã bị soft delete: không cho upload mới; list/inline/download vẫn được nếu policy cho phép (mặc định cho phép) hoặc ẩn tùy cấu hình.
- Bình luận bị xóa: file giữ lại, bỏ liên kết; vẫn hiện ở tab “Tệp đính kèm công việc”.
- Di chuyển file giữa bình luận trong cùng công việc (tương lai): có thể bổ sung API `PATCH /api/files/:id/assign-comment`.

---

## 6) Chất lượng & kiểm thử

BE Tests:

- Upload validation (mime/size), quyền truy cập, xóa soft, stream inline/download header đúng.
- Xóa bình luận → bỏ BinhLuanID, không đổi CongViecID.
- Cascade soft delete công việc → files.set(TrangThai='DELETED').

FE Tests:

- Upload nhiều file, paste ảnh, drag-drop; rename/mô tả; delete chỉ hiện khi là uploader.
- Preview ảnh/PDF; badge số file đồng bộ.

Quality gates:

- Lint/Typecheck PASS; API smoke test với 1 ảnh + 1 PDF; FE smoke test mở dialog, upload, preview, delete.

---

## 7) Các bước thực thi (tuần tự cho agent)

1. BE

- [ ] Thêm env + config upload.
- [ ] Cập nhật `TepTin.js`: `NguoiTaiLenID.ref = 'NhanVien'`, thêm index tổng hợp.
- [ ] Viết middleware `canAccessCongViec`, `canDeleteFile` trong `middlewares/` hoặc `helpers/`.
- [ ] Tạo router `routes/files.route.js` và controller/service tương ứng.
- [ ] Implement các endpoint mục (3) và stream an toàn.
- [ ] Tích hợp vào router chính; thêm hook cascade trong service CôngViệc và xóa bình luận.
- [ ] Optional: thumbnail ảnh với `sharp`.

2. FE

- [ ] Tạo `QuanLyTepTin` module (slice, apiClient, components).
- [ ] Tích hợp vào `CongViecDetailDialog` và comment composer (1 request multipart).
- [ ] Thêm `FileBadge` vào bảng công việc.
- [ ] Sử dụng `pdfjs-dist` cho PDF inline viewer.

3. Docs & Ops

- [ ] Cập nhật README BE (env, cài đặt, lưu ý Windows path).
- [ ] Ghi chú bảo mật, log audit (ai tải/xóa khi nào).

---

## 8) Gợi ý cài đặt phụ thuộc

BE: `multer`, `mime-types`, `uuid` (hoặc `nanoid`), `sharp` (tùy chọn)

FE: `react-dropzone` (hoặc HTML5 drag-drop), `pdfjs-dist`, `file-type-icons` (tùy chọn)

---

## 9) Hợp đồng dữ liệu bình luận (khi tạo với file)

Request (multipart):

- `noiDung`: string (required)
- `parentId`: string (optional)
- `files[]`: binary (0..n)

Response:

```
CommentDTO {
	_id: string,
	CongViecID: string,
	NguoiTaoID: string,      // NhanVien
	NoiDung: string,
	Files: TepTinDTO[],
	CreatedAt: string
}
```

Ghi chú: Nếu không có file, API vẫn tạo comment bình thường; nếu có file, Files sẽ chứa danh sách tệp vừa lưu.

---

Tài liệu này là single source of truth cho tính năng quản lý tệp tin. Nếu có thay đổi quyết định, cập nhật tại đây trước khi code.
