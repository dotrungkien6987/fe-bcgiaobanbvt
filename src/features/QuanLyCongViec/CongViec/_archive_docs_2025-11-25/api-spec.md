# API Specification (Module WorkManagement - CongViec)

Base prefix: `/api/workmanagement`
Authentication: `authentication.loginRequired` middleware (token -> req.user, req.nhanVienId ...)
All responses chuẩn: `{ success, data, message, errors? }`

## 1. Nhân viên

### GET `/nhanvien/:nhanvienid`

Trả thông tin nhân viên. FE lưu vào `currentNhanVien`.

## 2. Danh sách công việc

### GET `/congviec/:nhanvienid/received`

Công việc nhân viên là người xử lý chính.
Query params:

- page (>=1)
- limit (<=100)
- search
- TrangThai
- MucDoUuTien
- NgayBatDau
- NgayHetHan
- MaCongViec
- NguoiChinhID (lọc nâng cao)
  Response data shape:

```
{
  CongViecs: [...],
  totalItems, totalPages, currentPage
}
```

### GET `/congviec/:nhanvienid/assigned`

Tương tự, nhưng nhân viên là người giao việc.

## 3. Chi tiết

### GET `/congviec/detail/:id`

Trả full đối tượng `CongViec` (bao gồm `BinhLuans` sort DESC theo NgayBinhLuan).

## 4. Tạo & cập nhật

### POST `/congviec`

Body tối thiểu:

```
{
  TieuDe, MoTa?, NgayBatDau, NgayHetHan, MucDoUuTien, NguoiChinh,
  NguoiThamGia:[{NhanVienID,VaiTro}],
  CanhBaoMode, CanhBaoSapHetHanPercent?, NgayCanhBao?, CoDuyetHoanThanh?, NhomViecUserID?
}
```

Returns 201 + object.

### PUT `/congviec/:id`

Header (tùy chọn): `If-Unmodified-Since: <updatedAt>` (FE truyền `expectedVersion`).
Body: partial update (các field hợp lệ). BE tính & trả lại updated object.

## 5. Transition hợp nhất

### POST `/congviec/:id/transition`

Body:

```
{ action, lyDo?, ghiChu?, expectedVersion? }
```

Actions (ENUM): `GIAO_VIEC, HUY_GIAO, TIEP_NHAN, HOAN_THANH_TAM, HUY_HOAN_THANH_TAM, DUYET_HOAN_THANH, HOAN_THANH, MO_LAI_HOAN_THANH`.
Response:

```
{ action, patch, congViec? }
```

- Nếu chỉ cần tối ưu: trả `patch` (subset fields + updatedAt)
- Nếu query `?full=1`: kèm `congViec` full.

Conflict: Trả lỗi có `message: 'VERSION_CONFLICT'` -> FE set `versionConflict`.

## 6. Bình luận

### POST `/congviec/:id/comment`

Body: `{ NoiDung, parentId? }` (parentId để tạo reply).
Trả comment object (nếu reply: chứa BinhLuanChaID?). FE prepend vào danh sách hoặc bucket replies.

### DELETE `/binhluan/:id`

Thu hồi bình luận: soft delete text + đánh dấu file (service thực hiện). FE cập nhật trạng thái bình luận thành `DELETED` + rỗng nội dung.

### PATCH `/binhluan/:id/text`

Chỉ xóa nội dung text, giữ file. FE gọi `recallCommentText`.

### GET `/binhluan/:id/replies`

Lazy load reply list cho bình luận cha.

## 7. Tệp tin (trích yếu - file service riêng)

Không thấy đầy đủ trong snippet FE, nhưng util hiển thị inline/download:
`/files/:id/inline` và `/files/:id/download`.
Upload: (suy luận) POST `/congviec/:id/teptin` hoặc thông qua slice `quanLyTepTinSlice`.

## 8. Routine Tasks

### GET `/nhiemvuthuongquy/my`

Trả danh sách nhiệm vụ thường quy của người dùng đăng nhập: dùng populate select nhanh.
Cache 5 phút trên FE.

## 9. Color Config

### GET `/colors`

### PUT `/colors`

Cho phép admin chỉnh màu trạng thái / ưu tiên.

## 10. Permission Error Mapping

BE có thể trả codes: `NOT_ASSIGNER`, `NOT_MAIN`, `FORBIDDEN`. FE map sang tiếng Việt trong `PERMISSION_ERROR_MESSAGES`.

## 11. Mã lỗi đặc biệt

| Message          | Ý nghĩa                  | FE xử lý                             |
| ---------------- | ------------------------ | ------------------------------------ |
| VERSION_CONFLICT | Thất bại optimistic lock | Set `versionConflict`, toast warning |

## 12. Mẫu Response Chuẩn

```
{
  "success": true,
  "data": {...},
  "message": "..."
}
```

Error:

```
{
  "success": false,
  "errors": {"message":"FORBIDDEN"}
}
```

FE lấy `errors.message` hoặc `error.message` fallback.

## 13. Phân trang

- FE sanitize: bỏ param rỗng, ép page>=1, limit<=100.
- BE cũng validate tránh NaN -> an toàn 2 lớp.

## 14. Gợi ý mở rộng

- Chuẩn hóa toàn bộ transition return patch list field cố định.
- Thêm ETag thay vì If-Unmodified-Since.
- Thêm endpoint `HEAD /congviec/:id/version` để FE check nhẹ.

---

Đọc tiếp: `workflow-status-actions.md`.
