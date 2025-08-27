# Subtasks – API Design

Base prefix (giữ nguyên tiền tố module hiện tại, ví dụ): `/workmanagement`.

## 1. POST /workmanagement/tasks/:parentId/subtasks

Tạo công việc con.

- Auth: bắt buộc.
- Rules: user phải là NgườiChính của parent (hoặc admin).
- Body:

```json
{
  "TieuDe": "Chuẩn bị hồ sơ",
  "MoTa": "...",
  "NgayHetHan": "2025-09-30T10:00:00.000Z",
  "NguoiChinhID": "<userId>",
  "Priority": "CAO" // optional
}
```

- Response 201:

```json
{
  "_id": "...",
  "CongViecChaID": "parentId",
  "Depth": 2,
  "Path": ["rootId", "parentId"],
  "TrangThai": "TAO_MOI",
  "TienDo": 0
}
```

- Errors: 404 PARENT_NOT_FOUND, 403 NOT_ALLOWED, 409 PARENT_COMPLETED.

## 2. GET /workmanagement/tasks/:id/children

Trả về danh sách con trực tiếp (có phân trang).

- Query: `page=1&limit=20&status=DANG_THUC_HIEN` (status optional multi)
- Response:

```json
{
  "items": [
    {
      "_id": "...",
      "TieuDe": "...",
      "TrangThai": "DANG_THUC_HIEN",
      "PhanTramTienDoTong": 40,
      "ChildrenCount": 2
    },
    {
      "_id": "...",
      "TieuDe": "...",
      "TrangThai": "HOAN_THANH",
      "PhanTramTienDoTong": 100,
      "ChildrenCount": 0
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 57
}
```

## 3. GET /workmanagement/tasks/:id/tree

Lazy tree (độ sâu giới hạn).

- Query: `depth=2` (mặc định 1, max 5 để tránh overload). Depth tính từ node hiện tại.
- Response:

```json
{
  "_id": "parentId",
  "TieuDe": "...",
  "children": [
    {
      "_id": "c1",
      "TieuDe": "...",
      "children": [{ "_id": "gc1", "TieuDe": "..." }]
    },
    { "_id": "c2", "TieuDe": "..." }
  ]
}
```

- Chỉ trả về các field nhẹ: `_id, TieuDe, TrangThai, PhanTramTienDoTong, ChildrenCount`.

## 4. GET /workmanagement/tasks/:id/ancestors

Breadcrumb.

- Response: array theo thứ tự root→cha.

```json
[
  { "_id": "root", "TieuDe": "Gói thầu" },
  { "_id": "parent", "TieuDe": "Hạng mục A" }
]
```

## 5. PATCH /workmanagement/tasks/:id/status (đã tồn tại)

- Bổ sung rule: nếu chuyển sang HOAN_THANH và node có `ChildrenCount>0` thì validate tất cả con HOAN_THANH.
- Error 409 `CHILDREN_INCOMPLETE` kèm danh sách tối đa 5 con chưa hoàn thành.
- Nếu phát hiện chênh lệch (ví dụ `ChildrenCount>0` nhưng truy vấn children trả 0) → trả thêm `anomaly: true` để FE có thể ẩn nút hoàn thành và log.

## 6. DELETE /workmanagement/tasks/:id

- Rule mới: nếu `ChildrenCount>0` → 409 `PARENT_HAS_CHILDREN` trả về danh sách rút gọn (tối đa 10) cho FE hiển thị cảnh báo.

## 7. GET /workmanagement/tasks/:id/detail (mở rộng)

- Bổ sung trường:

```json
{
  "ChildrenCount": 5,
  "ChildrenSummary": { "total": 5, "done": 3, "inProgress": 1, "late": 1 },
  "AllChildrenDone": false
}
```

## 8. Gợi ý Hoàn Thành Cha

- FE nhận `AllChildrenDone=true` + `TrangThai=DANG_THUC_HIEN` hiển thị banner.
- Banner action: gọi PATCH status HOAN_THANH (đang có sẵn flow).

## 9. Error Payload Chuẩn

```json
{
  "error": {
    "code": "PARENT_HAS_CHILDREN",
    "message": "Không thể xóa vì còn 3 công việc con",
    "data": {
      "children": [
        { "_id": "...", "TieuDe": "..", "TrangThai": "DANG_THUC_HIEN" }
      ]
    }
  }
}
```

Mở rộng code dự kiến:
| Code | Ý nghĩa |
|------|---------|
| `ANOMALY_CHILD_COUNT` | Lệch giữa ChildrenCount và thực tế (gợi ý recount) |
| `PARENT_COMPLETED` | Cha đã hoàn thành (không tạo con) |
| `CHILDREN_INCOMPLETE` | Còn con chưa hoàn thành khi hoàn tất cha |

## 10. Authorization Middleware Sketch

```js
function canCreateSubtask(user, parent) {
  if (user.isAdmin) return true;
  return isPrincipal(parent, user); // mở rộng sau nếu cần
}
function canViewTask(user, task) {
  if (user.isAdmin) return true;
  if (
    isPrincipal(task, user) ||
    isAssigner(task, user) ||
    isParticipant(task, user)
  )
    return true;
  return userIsManagerOfAnyAncestor(user, task.Path); // dựa trên QuanLyNhanVien
}
```

## 11. Performance Considerations

| Endpoint        | Rủi ro            | Mitigation                              |
| --------------- | ----------------- | --------------------------------------- |
| /tree           | Depth lớn gây tải | Giới hạn depth param + cache ngắn (60s) |
| /children       | N+1 expand        | Lazy + only light fields                |
| /detail summary | Nhiều con         | Aggregation với index CongViecChaID     |

## 12. Migration Steps

1. Thêm field mới vào schema (nullable) – deploy.
2. Viết script backfill: set `Path=[]`, `Depth=0`, `ChildrenCount` = count children (có thể deferred).
3. Thêm index nền.
4. Cập nhật API create subtask.
5. Rollout FE tree sau khi BE ổn định.
6. (Optional) Endpoint bảo trì: `POST /workmanagement/tasks/recount-children` (admin) để đồng bộ.

## 13. Open Points (Future)

- Re-parent API.
- Bulk subtree export.
- Notifications engine.

---

Tham chiếu: `subtasks-data-model.md`, `subtasks-feature-overview.md`, `subtasks-frontend-plan.md`.
