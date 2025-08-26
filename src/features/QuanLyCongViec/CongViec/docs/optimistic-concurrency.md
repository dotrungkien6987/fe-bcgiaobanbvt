# Optimistic Concurrency & Patch Strategy

## 1. Mục tiêu

Tránh ghi đè thay đổi người khác vừa cập nhật và giảm latency UI khi chuyển trạng thái.

## 2. Cơ chế Version

- FE lưu `updatedAt` của `congViec` vào field phụ `__version` (local).
- Khi update hoặc transition FE truyền `expectedVersion=updatedAt`.
- Header gửi: `If-Unmodified-Since: <expectedVersion>` (ở thunk `updateCongViec`).
- BE so sánh; nếu lệch -> ném lỗi `VERSION_CONFLICT`.

## 3. Xử lý Conflict phía FE

```
catch(error) {
  if (error.message==='VERSION_CONFLICT') {
    setVersionConflict({ id, type, action?, payload, timestamp })
    toast.warning("Công việc đã được cập nhật bởi người khác...")
    // Auto silent refetch detail để user có thể refresh UI thủ công
  }
}
```

`versionConflict` được hiển thị (có thể bổ sung dialog confirm merge trong tương lai).

## 4. Patch Update Flow (Transition)

- Endpoint `/congviec/:id/transition` có thể trả:

```
{ action, patch:{ _id, TrangThai, NgayHoanThanh?, SoGioTre?, updatedAt } }
```

- FE reducer `applyCongViecPatch` merge patch vào cả 2 lists + detail.
- Sau đó gọi thầm `getCongViecDetail(id)` để đồng bộ các field phụ (history, counts...).

## 5. Lợi ích

| Kỹ thuật                  | Hiệu quả                                       |
| ------------------------- | ---------------------------------------------- |
| Optimistic merge patch    | UI phản hồi gần như tức thì                    |
| Conditional full object   | Giảm payload network                           |
| Silent background refresh | Đồng bộ thông tin phụ mà không chặn người dùng |

## 6. Nguy cơ & Giảm thiểu

| Nguy cơ                            | Biện pháp                                                               |
| ---------------------------------- | ----------------------------------------------------------------------- |
| Patch bỏ sót field quan trọng      | Danh sách field patch cần định nghĩa rõ ràng (white-list)               |
| Clock skew giữa servers            | Dùng `updatedAt` từ DB (server time chuẩn)                              |
| Merge conflict logic thiếu mở rộng | Lưu full payload hành động trong `versionConflict.payload` để retry sau |

## 7. Đề xuất Nâng cấp

| Đề xuất                            | Lý do                                            |
| ---------------------------------- | ------------------------------------------------ |
| Dùng ETag thay If-Unmodified-Since | Chuẩn HTTP caching/concurrency phổ biến          |
| Thêm endpoint HEAD /version        | Check nhanh version trước khi submit form dài    |
| Automatic retry w/ confirm         | Cho phép user xem diff trước khi overwrite       |
| Client diff viewer                 | Giúp so sánh local form vs server state mới nhất |

## 8. Mã ví dụ gửi update

```js
await dispatch(
  updateCongViec({
    id,
    data: { ...changes, expectedVersion: congViec.__version },
  })
);
```

---

Tiếp: `data-lifecycle-sequences.md`.
