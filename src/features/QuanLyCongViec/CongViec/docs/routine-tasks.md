# Routine Tasks (Nhiệm Vụ Thường Quy)

## 1. Mục đích

Cho phép liên kết một công việc với một 'nhiệm vụ thường quy' (định kỳ) để quản lý KPI hoặc phân loại ổn định.

## 2. Dữ liệu FE

- Slice `congViec`: trường `myRoutineTasks` chứa danh sách nhiệm vụ cá nhân.
- Thunks: `fetchMyRoutineTasks()` gọi GET `/nhiemvuthuongquy/my`.
- Cache TTL: mặc định 5 phút (`maxAgeMs = 5*60*1000`). Có thể ép refetch bằng `{force:true}`.

## 3. Sử dụng trong UI

- `CongViecFormDialog`: (có thể) thêm chọn Routine Task (hiện form code lấy `myNhomViecs` – mở rộng tương tự routine tasks nếu cần).
- `CongViecDetailDialog`: Khi mở dialog gọi `fetchMyRoutineTasks()` để đảm bảo lựa chọn mới nhất.

## 4. Giao thức Update

- Liên kết hoặc gỡ liên kết routine task = cập nhật công việc (`PUT /congviec/:id`):

```
updateCongViec({ id, data: { NhiemVuThuongQuyID, expectedVersion } })
```

- Nếu user chọn "Khác": gửi `{ NhiemVuThuongQuyID:null, FlagNVTQKhac:true }` (pattern trong `handleSelectRoutine`).

## 5. UX & Hiệu năng

| Tối ưu                    | Giải thích                                             |
| ------------------------- | ------------------------------------------------------ |
| Cache 5 phút              | Tránh gọi API lặp lại khi mở nhiều dialog nhanh        |
| Fallback khi đang loading | Cho phép hiển thị select disabled hoặc skeleton        |
| expectedVersion           | Bảo vệ ghi đè không mong muốn nếu người khác đổi trước |

## 6. Gợi ý mở rộng

| Ý tưởng                    | Lợi ích                                            |
| -------------------------- | -------------------------------------------------- |
| Autocomplete filter        | Dễ tìm routine task dài                            |
| Phân trang / lazy load     | Khi số routine tasks lớn (>500)                    |
| Tagging tasks theo routine | Thống kê KPI nhanh ở dashboard                     |
| Đồng bộ lịch tạo tự động   | Khi routine task đến kỳ -> tạo CongViec mới (cron) |

---

Tiếp tục: `optimistic-concurrency.md`.
