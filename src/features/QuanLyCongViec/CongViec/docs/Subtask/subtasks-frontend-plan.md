# Subtasks – Frontend Implementation Plan

## 1. Mục tiêu FE

Hiển thị cấu trúc cây trong trang chi tiết công việc, hỗ trợ tạo subtask, gợi ý hoàn thành cha, xem nhanh trạng thái/tiến độ các node con. Không thay đổi danh sách 2 tab chính hiện tại.

## 2. Thành phần Mới / Chỉnh sửa

| Component              | Loại | Mô tả                                                                               |
| ---------------------- | ---- | ----------------------------------------------------------------------------------- |
| `TaskTreeSection`      | mới  | Khối hiển thị cây & nút thêm subtask                                                |
| `SubtaskCreateDialog`  | mới  | Dialog tạo nhanh subtask                                                            |
| `TaskNodeItem`         | mới  | Render một node trong tree (label + progress + chips)                               |
| `useTaskTree` hook     | mới  | Quản lý cache children, loading, expand state                                       |
| `CongViecDetailDialog` | sửa  | Chèn `TaskTreeSection` dưới phần mô tả/trước History                                |
| `congViecSlice`        | sửa  | Thêm thunks: fetchChildren(id), fetchTree(id, depth), createSubtask(parentId, data) |

## 3. State & Redux

```ts
interface TaskTreeState {
  byParent: {
    [parentId: string]: {
      loading: boolean;
      error?: string;
      items: string[]; // child IDs
      loadedAt?: number;
    };
  };
  entities: { [id: string]: TaskLight };
}
interface TaskLight {
  _id: string;
  TieuDe: string;
  TrangThai: string;
  PhanTramTienDoTong?: number;
  ChildrenCount: number;
}
```

- Normalization giúp update trạng thái một node không re-render toàn bộ.

## 4. Thunks

1. `fetchChildren(parentId)` → GET /tasks/:id/children
2. `createSubtask({ parentId, payload })`
3. (Optional) `fetchAncestors(id)` nếu cần breadcrumb.

## 5. UI Luồng

1. Khi mở dialog detail: nếu node có `ChildrenCount > 0` hiển thị section cây collapsed mặc định.
2. Expand: dispatch `fetchChildren(parentId)` nếu chưa có.
3. Loading: skeleton 3 dòng.
4. Mỗi node có caret (▶/▼) nếu `ChildrenCount>0`.
5. Bấm caret: fetch con (lazy).
6. Nút `+ Thêm việc con`: mở dialog.
7. Sau khi tạo subtask: prepend vào danh sách con + tăng `ChildrenCount` cha local.
8. Banner gợi ý hoàn thành: nếu props detail trả `AllChildrenDone`.

## 6. TaskNodeItem Layout (Pseudo JSX)

```jsx
<Box
  className="task-node"
  sx={{ display: "flex", alignItems: "center", gap: 1, pl: depth * 1.25 }}
>
  {hasChildren && (
    <IconButton size="small" onClick={toggle}>
      {" "}
      {expanded ? <ExpandMore /> : <ChevronRight />}{" "}
    </IconButton>
  )}
  {!hasChildren && <Box sx={{ width: 32 }} />}
  <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1 }}>
    <StatusDot trangThai={TrangThai} />
    <Typography variant="body2" noWrap>
      {TieuDe}
    </Typography>
    <MiniProgress value={PhanTramTienDoTong || 0} />
    {ChildrenCount > 0 && <Chip size="small" label={ChildrenCount} />}
  </Box>
</Box>
```

## 7. MiniProgress Component

```jsx
<Box
  sx={{
    width: 60,
    height: 6,
    borderRadius: 3,
    bgcolor: "grey.200",
    overflow: "hidden",
  }}
>
  <Box
    sx={{
      width: `${value}%`,
      height: "100%",
      bgcolor: value === 100 ? "success.main" : "primary.main",
    }}
  />
</Box>
```

## 8. SubtaskCreateDialog

Fields:

- TieuDe (required)
- NguoiChinhID (select – mặc định chính mình)
- NgayHetHan (optional)
- MoTa (optional)
  Validation: TieuDe >= 3 ký tự.

## 9. Gợi ý Hoàn Thành Cha (Banner)

```jsx
{
  detail.AllChildrenDone && detail.TrangThai === "DANG_THUC_HIEN" && (
    <Alert
      severity="info"
      action={
        <Button size="small" onClick={onComplete}>
          Đánh dấu hoàn thành
        </Button>
      }
    >
      Tất cả việc con đã hoàn thành.
    </Alert>
  );
}
```

## 10. Permission FE

- Nút `+ Thêm việc con`: hiển thị nếu `isPrincipal && TrangThai !== 'HOAN_THANH'`.
- Ẩn caret expand nếu ChildrenCount=0.

## 11. Loading & Error UX

- Lỗi fetch children: hiển thị dòng `<Typography color='error' variant='caption'>Không tải được danh sách</Typography>` + nút retry nhỏ.

## 12. Hiệu Năng

- Không re-fetch children trong vòng 30s (cache TTL) trừ khi tạo mới.
- Giới hạn simultaneous fetch < 5.

## 13. Mã Màu Trạng Thái (tham chiếu status palette hiện có)

- Map sẵn trong selector: `getStatusColor(status)`.

## 14. Bổ sung congViecSlice (phác thảo)

```js
const taskTreeSlice = createSlice({
  name: 'taskTree',
  initialState,
  reducers: {
    childrenRequested(state, action) { ... },
    childrenReceived(state, action) { ... },
    childrenFailed(state, action) { ... },
    subtaskAdded(state, action) { ... },
  }
});
```

Có thể gộp vào `congViecSlice` nếu không muốn tách.

## 15. Roadmap FE Chi Tiết

| Sprint | Hạng mục                             | Mô tả                             |
| ------ | ------------------------------------ | --------------------------------- |
| 1      | Slice + API client                   | fetchChildren + createSubtask     |
| 1      | TaskTreeSection read-only            | Expand, lazy load                 |
| 2      | SubtaskCreateDialog + optimistic add | Append UI ngay, rollback nếu fail |
| 2      | Banner gợi ý hoàn thành              | Kết nối flow trạng thái           |
| 3      | Ancestors breadcrumb (optional)      | Điều hướng nhanh                  |
| 3      | Perf tuning (cache TTL)              | TTL + retry                       |

## 16. Test Checklist FE

- Expand root có con → hiển thị children.
- Expand node sâu (depth >2) → lazy load chính xác.
- Tạo subtask → xuất hiện ngay, ChildrenCount tăng.
- Không hiện nút tạo khi cha HOAN_THANH.
- Banner gợi ý xuất hiện khi mọi con HOAN_THANH.
- Quyền: user không phải principal → không có nút tạo.

## 17. Khả năng Mở Rộng

- Re-parent: drag & drop + PATCH /reparent.
- Bulk complete: chọn nhiều node.
- Search inline trong subtree.

---

Tài liệu BE: `subtasks-api-design.md`, `subtasks-data-model.md`. Tổng quan: `subtasks-feature-overview.md`.
