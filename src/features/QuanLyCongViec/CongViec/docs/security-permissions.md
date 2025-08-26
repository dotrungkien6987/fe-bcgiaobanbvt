# Bảo mật & Phân quyền

## 1. Authentication

- Middleware `authentication.loginRequired` áp dụng cho toàn bộ route `/api/workmanagement/*`.
- Sau xác thực: `req.user`, `req.nhanVienId` có sẵn để service kiểm tra quyền.

## 2. Role / Vai trò liên quan

| Vai trò                    | Ý nghĩa tổng quát                                            |
| -------------------------- | ------------------------------------------------------------ |
| Admin                      | Toàn quyền (xóa, đổi màu, mở lại,...)                        |
| Manager                    | (Suy đoán) Có quyền xóa hoặc giao việc cho nhân viên quản lý |
| Assigner (chủ sở hữu task) | Người giao việc cụ thể (NguoiGiaoViecID)                     |
| Main (Executor)            | Người chính thực hiện (NguoiChinhID)                         |
| Collaborator               | Người phối hợp (PHOI_HOP)                                    |

## 3. Kiểm soát Hành động Workflow

| Action                              | Kiểm tra                                               |
| ----------------------------------- | ------------------------------------------------------ |
| GIAO_VIEC / HUY_GIAO                | `req.user` == `NguoiGiaoViecID`                        |
| TIEP_NHAN                           | `req.user` == `NguoiChinhID`                           |
| HOAN_THANH_TAM / HUY_HOAN_THANH_TAM | `req.user` == `NguoiChinhID` + `CoDuyetHoanThanh=true` |
| DUYET_HOAN_THANH                    | `req.user` == `NguoiGiaoViecID`                        |
| HOAN_THANH                          | `req.user` == `NguoiGiaoViecID` (khi không duyệt)      |
| MO_LAI_HOAN_THANH                   | `req.user` == `NguoiGiaoViecID`                        |

## 4. Mapping Lỗi Quyền sang FE

BE có thể trả JSON với `errors.message` = một trong:
| Code | FE Hiển thị |
|------|-------------|
| NOT_ASSIGNER | Chỉ người giao việc được thực hiện hành động này |
| NOT_MAIN | Chỉ người thực hiện chính được thực hiện hành động này |
| FORBIDDEN | Bạn không có quyền thực hiện hành động này |
FE map trong `PERMISSION_ERROR_MESSAGES` rồi `toast.error(mapped)`.

## 5. Thu hồi bình luận & file

- Chỉ chủ bình luận hoặc người có quyền cao hơn (admin/assigner?) được thu hồi (chi tiết service).
- Xóa công việc: soft delete -> ẩn bình luận + file kèm meta (commentCount, fileCount) báo FE.

## 6. Optimistic Lock

- Ngăn cập nhật chồng lên bằng `If-Unmodified-Since`/`expectedVersion`.
- Lỗi conflict không phải vấn đề quyền, FE hiển thị riêng (warning, không error đỏ).

## 7. Gợi ý Bổ sung

| Tính năng                                               | Lợi ích                                       |
| ------------------------------------------------------- | --------------------------------------------- |
| Scope-based permissions (e.g. TASK_DELETE, TASK_ASSIGN) | Linh hoạt cấp quyền granular                  |
| Audit log endpoint                                      | Truy vết thay đổi (ai, khi nào, hành động gì) |
| Field-level mask                                        | Ẩn thông tin nhạy cảm cho vai trò thấp        |
| Rate limiting comment                                   | Chống spam                                    |
| Soft-delete retention policy                            | Tự động purge sau X ngày                      |

## 8. An toàn File

| Rủi ro                      | Mitigation                                 |
| --------------------------- | ------------------------------------------ |
| Upload thực thi mã (script) | Kiểm MIME + extension whitelist            |
| File quá lớn                | Giới hạn dung lượng & streaming            |
| Truy cập trái phép URL      | Kiểm tra quyền trước khi cung cấp download |

---

Tiếp: `improvement-suggestions.md`.
