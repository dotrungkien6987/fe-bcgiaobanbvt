# Tài liệu Tổng Quan Chức Năng Quản Lý Công Việc

Bộ tài liệu này giúp người mới nhanh chóng nắm toàn bộ kiến trúc và luồng nghiệp vụ của module "Quản Lý Công Việc" (CongViec) bao gồm:

- Kiến trúc tổng quan FE - Redux - BE
- Mô hình dữ liệu & cấu trúc DB liên quan
- API backend & quyền truy cập
- Luồng trạng thái & hành động (workflow)
- Luồng tạo / chỉnh sửa / chuyển trạng thái / bình luận / tệp đính kèm
- Ý nghĩa các component chính FE
- Cách đồng bộ màu trạng thái / ưu tiên (Color Config)
- Chiến lược đồng bộ dữ liệu, optimistic update & xử lý xung đột phiên bản
- Checklist mở rộng & gợi ý cải tiến

Các file con:

| File                          | Nội dung                                                                |
| ----------------------------- | ----------------------------------------------------------------------- |
| `architecture-overview.md`    | Kiến trúc tổng quan & mapping FE-Redux-BE                               |
| `domain-models.md`            | Mô hình dữ liệu & quan hệ chính                                         |
| `api-spec.md`                 | Danh sách API, request/response & notes triển khai                      |
| `workflow-status-actions.md`  | Trạng thái, hành động chuyển đổi, điều kiện & bảo toàn dữ liệu          |
| `frontend-components.md`      | Danh sách component & vai trò nghiệp vụ                                 |
| `redux-store-and-flows.md`    | Chi tiết slice `congViec`, state shape & thunks                         |
| `comment-and-file-flow.md`    | Luồng bình luận & quản lý tệp đính kèm + replies cache                  |
| `color-config.md`             | Quản lý cấu hình màu động trạng thái & ưu tiên                          |
| `routine-tasks.md`            | Luồng nhiệm vụ thường quy (NhiemVuThuongQuy) tích hợp trong form/detail |
| `optimistic-concurrency.md`   | Cơ chế version, patch, xử lý xung đột & refresh mềm                     |
| `data-lifecycle-sequences.md` | Biểu đồ tuần tự (text) cho các nghiệp vụ chính                          |
| `security-permissions.md`     | Quyền & thông điệp lỗi chuẩn hóa (mapping FE)                           |
| `improvement-suggestions.md`  | Gợi ý nâng cấp & kỹ thuật tiếp theo                                     |

> Ghi chú: Tài liệu này tổng hợp từ source code hiện tại (FE & BE) và có thể khác chút so với thiết kế lý tưởng. Luôn kiểm tra commit gần nhất khi cập nhật.

---

## Bắt đầu đọc thế nào?

1. Đọc `architecture-overview.md` để hiểu mô hình tổng.
2. Xem `workflow-status-actions.md` để nắm luồng trạng thái.
3. Tham khảo `api-spec.md` khi cần chi tiết request/response.
4. Khi sửa giao diện: xem `frontend-components.md` + `redux-store-and-flows.md`.
5. Khi xử lý file/bình luận: đọc `comment-and-file-flow.md`.
6. Khi thêm logic nâng cao: đọc `optimistic-concurrency.md` & `improvement-suggestions.md`.

---

## Thuật ngữ nhanh

- Công việc (CongViec): Task / Work Item
- Người giao việc: Assigner
- Người chính (NguoiChinh): Main executor
- Người tham gia phối hợp: Collaborators (VaiTro = PHOI_HOP)
- Bình luận: Comment (BinhLuan)
- Tệp tin: TepTin (File Attachments)
- Nhiệm vụ thường quy: Routine Task (NhiemVuThuongQuy)
- Cảnh báo hạn: Warning threshold (NgayCanhBao hoặc % thời lượng)

---

## Sơ đồ rút gọn (ASCII)

```
[UI Components] -> [Redux Slice congViec] -> [apiService] -> [BE Routes /workmanagement]
   |                        |                        |
   |--- local UI state      |--- cache, paging       |--- controllers -> services -> DB (models)
   |--- dialogs/forms       |--- replies cache       |--- enforce permissions, version
```

---

## Đóng góp

Khi thay đổi logic BE hoặc FE, cập nhật tài liệu tương ứng. Có thể thêm mục CHANGELOG trong tương lai.
