# Redux Store & Luồng Thunks

## 1. Slice: `congViecSlice`

File: `congViecSlice.js` (~985 lines)

### State Shape

```
{
  isLoading: false,
  error: null,
  currentNhanVien: null,
  activeTab: 'received' | 'assigned',
  receivedCongViecs: [],
  assignedCongViecs: [],
  receivedTotal: 0, assignedTotal: 0,
  receivedPages: 0, assignedPages: 0,
  currentPage: { received:1, assigned:1 },
  filters: {
    received: { search, TrangThai, MucDoUuTien, NgayBatDau, NgayHetHan, MaCongViec, NguoiChinhID, TinhTrangHan },
    assigned: { ...same }
  },
  congViecDetail: null,
  repliesByParent: { [commentId]: { items, loading, loaded, error } },
  versionConflict: null, // {id,type,action?,payload,timestamp}
  myRoutineTasks: [], loadingRoutineTasks:false, myRoutineTasksLoaded:false, myRoutineTasksLastFetch:null
}
```

### Core Reducers

| Tên                                          | Chức năng                                                                   |
| -------------------------------------------- | --------------------------------------------------------------------------- |
| startLoading / hasError                      | Cờ isLoading + error global                                                 |
| getNhanVienSuccess                           | Lưu thông tin nhân viên hiện tại                                            |
| getReceivedCongViecsSuccess / getAssigned... | Lưu list & phân trang                                                       |
| setActiveTab                                 | Chuyển tab UI                                                               |
| setFilters / resetFilters                    | Cập nhật hoặc reset bộ lọc cho tab, reset page=1                            |
| setCurrentPage                               | Đổi page từng tab                                                           |
| deleteCongViecSuccess                        | Xóa item khỏi cả hai list (đảm bảo đồng bộ)                                 |
| clearState                                   | Reset slice nhưng giữ tab, page, filters                                    |
| getCongViecDetailSuccess                     | Lưu chi tiết + sort BinhLuans DESC                                          |
| createCongViecSuccess                        | Unshift vào assigned (vì người tạo là assigner)                             |
| updateCongViecSuccess                        | Update item trong cả received & assigned + detail nếu đang mở               |
| addCommentSuccess                            | Thêm comment (gốc: prepend vào BinhLuans; reply: bucket repliesByParent)    |
| recallCommentSuccess                         | Soft delete (TrangThai=DELETED, clear NoiDung) trong list + repliesByParent |
| recallCommentTextSuccess                     | Chỉ clear NoiDung                                                           |
| markCommentFileDeleted                       | Đổi TrangThai file thành DELETED trong comment / reply                      |
| fetchRepliesStart/Success/Error              | Quản lý cache replies                                                       |
| applyCongViecPatch                           | Gộp patch vào lists + detail                                                |
| setVersionConflict / clearVersionConflict    | Lưu trạng thái xung đột version                                             |
| fetchMyRoutineTasksStart/Success/Error       | Cache routine tasks                                                         |

### Thunks Chính

| Tên                                               | Mô tả                                             |
| ------------------------------------------------- | ------------------------------------------------- |
| getNhanVien(id)                                   | Lấy profile nhân viên                             |
| getReceivedCongViecs(id, filters)                 | List công việc được giao                          |
| getAssignedCongViecs(id, filters)                 | List công việc đã giao                            |
| deleteCongViec(id)                                | Soft delete + toast meta (commentCount/fileCount) |
| getCongViecDetail(id)                             | Load đầy đủ detail                                |
| createCongViec(data)                              | Sanitize + default warning config -> POST         |
| updateCongViec({id,data})                         | PUT with optimistic header (If-Unmodified-Since)  |
| updateCongViecStatus({congViecId,trangThai})      | (Legacy direct status)                            |
| transitionCongViec({id,action,lyDo,ghiChu,extra}) | Unified transition + patch fallback               |
| addCongViecComment({congViecId, noiDung})         | Thêm comment gốc                                  |
| addReply({congViecId,parentId,noiDung})           | Thêm trả lời                                      |
| fetchReplies(parentId)                            | Lazy load replies (skip nếu loaded)               |
| fetchMyRoutineTasks({force,maxAgeMs})             | Cache 5 phút                                      |
| recallComment / recallCommentText                 | Thu hồi toàn bộ bình luận hoặc chỉ text           |

### Sanitization & Defaults

- Khi fetch list: loại bỏ key rỗng để BE filtering gọn.
- Create / Update: loại bỏ field null/undefined; ép `CanhBaoMode` và percent nằm trong [0.5,1].
- Nếu `CanhBaoMode=PERCENT` xoá `NgayCanhBao` khỏi payload.

### Optimistic Concurrency

- Thêm header `If-Unmodified-Since` (copy từ `expectedVersion`).
- Lỗi `VERSION_CONFLICT` -> set `versionConflict` + toast warning.
- Khi transition trả patch: apply patch và background refetch detail.

### Replies Cache Logic

Pseudo:

```
if (bucket.loaded && !bucket.error) return bucket.items
else dispatch(fetchRepliesStart)
try GET /binhluan/:id/replies -> success(items)
catch -> error
```

### Routine Tasks Cache

```
if (!force && loaded && (now-lastFetch<maxAge)) return cached
else fetch -> save items + timestamp
```

### Patch Application

`applyCongViecPatch` duyệt cả `receivedCongViecs` & `assignedCongViecs` để tìm `_id` và gộp shallow merge. Cập nhật detail nếu đang xem.

## 2. Các Slice Khác Liên Quan

| Slice               | Vai trò                                                              |
| ------------------- | -------------------------------------------------------------------- |
| `colorConfigSlice`  | Lưu `statusColors`, `priorityColors` override.                       |
| `quanLyTepTinSlice` | Quản trị tệp theo `byTask[taskId] = {items,total,loading}` + counts. |
| `nhomViecUserSlice` | Cung cấp danh sách nhóm việc (`myNhomViecs`) cho form.               |

## 3. Dòng chảy ví dụ: Transition

```
UI click action -> transitionCongViec thunk
startLoading -> POST /congviec/:id/transition
Success -> if full: updateCongViecSuccess(full)
         -> else if patch: applyCongViecPatch(patch) + silent getCongViecDetail
UI toast success
```

## 4. Error Handling

- Lỗi chung: `hasError(error.message)` + toast.error.
- Permission: map code bằng `PERMISSION_ERROR_MESSAGES[raw]`.
- Version conflict: set `versionConflict` + toast.warning.

## 5. Gợi ý mở rộng

| Ý tưởng                             | Lý do                                                             |
| ----------------------------------- | ----------------------------------------------------------------- |
| Normalization (createEntityAdapter) | Giảm chi phí update O(n) khi list lớn                             |
| Selectors memo hóa                  | Tối ưu re-render table lớn                                        |
| WebSocket subscription              | Nhận patch realtime thay vì polling/refresh                       |
| Side-effects queue                  | Lưu action chờ retry khi offline                                  |
| Unified error object                | Thay `error.message` bằng shape giàu thông tin (code, httpStatus) |

---

Tiếp tục: `comment-and-file-flow.md`.
