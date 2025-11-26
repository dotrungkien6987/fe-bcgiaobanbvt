# Color Config (Tùy biến màu Trạng thái & Ưu tiên)

## 1. Mục tiêu

Cho phép admin điều chỉnh màu hiển thị (hex) cho các trạng thái công việc (status) và mức ưu tiên (priority) mà không phải chỉnh code.

## 2. Nguồn dữ liệu

- Slice `colorConfigSlice` (không đính kèm ở đây) fetch từ endpoint `/api/workmanagement/colors`.
- Lưu vào state: `{ statusColors: {CODE:hex}, priorityColors: {CODE:hex} }`.

## 3. Ứng dụng vào UI

- `CongViecTable` và `CongViecDetailDialog` gọi util `getStatusColor(status, overrides)`.
- `overrides` = `statusColors` từ slice (nếu có key trùng thì dùng override). Nếu không: fallback `STATUS_COLOR_MAP` trong `congViecUtils`.

## 4. Admin Dialog

`AdminColorSettingsDialog` hiển thị danh sách các trạng thái & ưu tiên cho phép nhập màu hex:

- Validate: định dạng `#RRGGBB` hoặc `#RGB`.
- Bấm lưu: PUT `/api/workmanagement/colors` -> cập nhật slice -> toast.

## 5. Legend Dialog

`ColorLegendDialog` đọc cả mặc định + overrides và trình bày bảng màu cho người dùng thông thường.

## 6. Quy tắc Màu Khuyến nghị

| Loại              | Gợi ý                     |
| ----------------- | ------------------------- |
| TAO_MOI           | Xanh nhạt (nhẹ nhàng)     |
| DA_GIAO           | Xanh thương hiệu đậm      |
| DANG_THUC_HIEN    | Xanh primary (tiến trình) |
| CHO_DUYET         | Tím / cam nhấn mạnh chờ   |
| HOAN_THANH        | Xanh lá ổn định           |
| QUA_HAN           | Đỏ / cảnh báo mạnh        |
| SAP_QUA_HAN       | Cam                       |
| KHAN_CAP priority | Đỏ đậm                    |

## 7. Sync & Cache

- Fetch 1 lần khi mở detail (có thể nâng cấp: preload trong app root). Cache trong Redux đến khi refresh trình duyệt.
- Khi admin thay đổi: invalidation tại chỗ (FE cập nhật state). Không cần refetch toàn bộ task.

## 8. Gợi ý mở rộng

| Tính năng                   | Lợi ích                                                     |
| --------------------------- | ----------------------------------------------------------- |
| Thêm trường `contrastColor` | Chủ động màu chữ nếu hex nền quá sáng/tối.                  |
| Preset theme templates      | Người dùng chọn nhanh "Default", "Accessibility", ...       |
| Soft preview                | Cho phép chỉnh tạm, xem preview table trước khi commit PUT. |
| Export/Import JSON          | Chuyển cấu hình màu giữa môi trường.                        |

---

Tiếp tục: `routine-tasks.md`.
