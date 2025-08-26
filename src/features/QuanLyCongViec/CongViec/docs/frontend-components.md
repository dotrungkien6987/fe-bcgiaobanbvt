# Frontend Components & Vai trò

## 1. Cấp Trang / Container

| Component                | Mô tả                                                                                        |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| `CongViecByNhanVienPage` | Entry page: điều phối tab Received / Assigned, dispatch fetch list.                          |
| `CongViecTabs`           | UI tabs chuyển giữa danh sách được giao và đã giao.                                          |
| `CongViecFilterPanel`    | Bộ lọc: search, trạng thái, ưu tiên, khoảng ngày, Tình Trạng Hạn, ... Gửi filters vào slice. |
| `CongViecTable`          | Render danh sách + phân trang + actions (view/edit/delete).                                  |

## 2. Dialog / Form chính

| Component                  | Vai trò chính                                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `CongViecFormDialog`       | Tạo / chỉnh sửa công việc: formik + yup, build payload participants, cảnh báo hạn (percent/fixed), routine task mapping. |
| `CongViecDetailDialog`     | Chi tiết: header metadata, tiến độ, action buttons (transition), comments, files, history, color config, quick progress. |
| `AdminColorSettingsDialog` | Cho phép admin thay đổi màu trạng thái & ưu tiên (ghi vào colorConfig).                                                  |
| `ColorLegendDialog`        | Tham chiếu màu hiện tại (overrides + default).                                                                           |

## 3. Khối chức năng trong Detail

| Component            | Nội dung                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| `WarningConfigBlock` | Hiển thị cấu hình cảnh báo (NgàyCanhBao hoặc %).                                                     |
| `MetricsBlock`       | Số liệu: tiến độ, giờ trễ, hoursLeft, due status.                                                    |
| `HistoryAccordion`   | (Nếu dữ liệu history có) hiển thị log chuyển trạng thái.                                             |
| `TaskMetaSidebar`    | Thông tin phụ: nhóm việc, routine task selector, participants.                                       |
| `FilesSidebar`       | Danh sách file cấp công việc (không phải file bên trong từng bình luận). Drag & drop / paste upload. |

## 4. Bình luận & Replies

| Component         | Vai trò                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------- |
| `CommentComposer` | Ô nhập bình luận gốc (text + file).                                                         |
| `CommentsList`    | Liệt kê bình luận gốc (BinhLuans) sort DESC. Mỗi item có button show replies.               |
| `ReplyComposer`   | Gửi reply (text only hoặc kèm upload tùy mở rộng).                                          |
| `RepliesList`     | Lazy load replies mỗi bình luận (gọi thunk `fetchReplies`). Cache bucket `repliesByParent`. |

## 5. Hooks & Utils

| Tên              | Mục đích                                                                |
| ---------------- | ----------------------------------------------------------------------- |
| `useFilePreview` | Xử lý mở xem / tải file (inlineUrl, downloadUrl).                       |
| `congViecUtils`  | Hàm tính tình trạng hạn, màu, label, số giờ trễ, validate, sort/filter. |

## 6. State & Props Key Patterns

- Tên prop `congViec` hoặc `congViecs` nhất quán.
- FormDialog yêu cầu prop `isEdit`, `nhanVienId` (default cho NguoiChinh), `open`, `onClose`.
- DetailDialog yêu cầu `congViecId`, `onEdit`, `open`.
- Table yêu cầu `onView(id)`, `onEdit(cv)`, `onDelete(cv)`.

## 7. Xử lý màu chip

- Table sử dụng `getStatusColor` + override từ `statusColors` slice (màu hex trực tiếp -> Chip background).
- Ưu tiên: `getPriorityColor` tương tự.
- Extended due status: `EXT_DUE_COLOR_MAP` + label.

## 8. Tối ưu UX

| Kỹ thuật                      | Mô tả                                                                     |
| ----------------------------- | ------------------------------------------------------------------------- |
| Prepend comment mới           | `addCommentSuccess` đặt bình luận mới đầu danh sách để thấy ngay.         |
| Patch transition              | Áp dụng patch -> UI phản hồi tức thì.                                     |
| Quick progress slider + input | Đồng bộ state local rồi commit khi blur hoặc nhấn enter (tối ưu gọi API). |
| Lazy replies                  | Chỉ fetch khi người dùng mở.                                              |
| Drag & drop file              | FilesSidebar + CommentComposer (pending file list).                       |

## 9. Access Control FE (Hiển thị UI)

- `getAvailableActions` xác định action buttons.
- Nút delete trong Table disable nếu: task hoàn thành & user không phải admin; hoặc user không phải admin/manager/owner.

## 10. Patterns để mở rộng

- Tách logic form thành hook (`useCongViecForm`) nếu form lớn thêm.
- Memo hóa tính toán heavy (ví dụ build participants) với `useMemo`.
- Virtualize comment list nếu >200 items.

## 11. Tên gọi quan trọng

| Tên                                      | Mô tả                                                |
| ---------------------------------------- | ---------------------------------------------------- |
| `NguoiChinhProfile` / `NguoiGiaoProfile` | Object embed profile vào list để tránh request thêm. |
| `SoGioTre`                               | Số giờ trễ render ở cột Giờ trễ.                     |

## 12. Anti-pattern cần tránh

| Vấn đề                                     | Giải pháp                                    |
| ------------------------------------------ | -------------------------------------------- |
| Thay đổi trực tiếp `TrangThai` từ Form     | Đã loại bỏ – dùng transition unified.        |
| Gửi filter rỗng                            | Đã sanitize: xóa key rỗng trước khi gọi API. |
| Chạy nhiều fetch song song không cần thiết | Dùng cache routine tasks / replies.          |

---

Tiếp tục: `redux-store-and-flows.md`.
