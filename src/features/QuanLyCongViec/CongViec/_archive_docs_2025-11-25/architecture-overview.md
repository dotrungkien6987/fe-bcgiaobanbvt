# Kiến trúc Tổng quan

## 1. Phân lớp

- UI (React/MUI Components)
- State Management: Redux Toolkit slice `congViecSlice` + các slice phụ (`colorConfigSlice`, `quanLyTepTinSlice`, `nhomViecUserSlice` ...)
- API Layer: `apiService` (axios wrapper) gọi các endpoint `/api/workmanagement/...`
- Backend: Express routers (folder `modules/workmanagement/routes`) -> Controllers -> Services -> Models (MongoDB/Mongoose?)

## 2. Dòng chảy chung

1. Người dùng mở trang danh sách.
2. Component container dispatch thunk `getReceivedCongViecs` hoặc `getAssignedCongViecs` dựa trên tab.
3. Slice set `isLoading`, gọi API, nhận data (items + phân trang) => cập nhật state.
4. Bảng (`CongViecTable`) render danh sách, hiển thị chip trạng thái, ưu tiên, tiến độ, cảnh báo hạn (tính từ util +/hoặc BE field `TinhTrangThoiHan`).
5. Người dùng chọn xem chi tiết -> `CongViecDetailDialog` dispatch `getCongViecDetail` + load file + color config + routine tasks.
6. Trong dialog có thể: cập nhật tiến độ, comment (kèm file), đổi action trạng thái (transition), chỉnh sửa form đầy đủ (mở `CongViecFormDialog`).
7. Các thao tác cập nhật gọi thunks tương ứng (`updateCongViec`, `transitionCongViec`, `addCongViecComment`, `uploadFilesForTask`...).
8. BE trả về full object hoặc patch (transition tối ưu) -> slice cập nhật danh sách + detail.

## 3. Khả năng tái sử dụng

- Utils thời hạn (`congViecUtils.js`) gom logic tính toán tình trạng hạn, số giờ trễ, mapping màu/label.
- `getAvailableActions` dùng chung FE để xác định button actions phù hợp dựa trên vai trò + trạng thái.
- Replies cache: `repliesByParent[parentCommentId] = {items, loading, loaded, error}` giúp lazy load phản hồi.

## 4. Caching & Performance

| Cơ chế                      | Mô tả                                                                    |
| --------------------------- | ------------------------------------------------------------------------ |
| Pagination server-side      | Tham số page, limit FE sanitize trước khi gửi                            |
| Routine tasks cache         | `myRoutineTasks` có timestamp, chỉ refetch sau 5 phút hoặc force         |
| Replies lazy cache          | Chỉ fetch khi user mở xem replies từng bình luận                         |
| Patch update                | Transition trả patch tối thiểu, FE áp dụng rồi background refresh detail |
| Optimistic file mark delete | Đánh dấu file bình luận đã xóa trước khi gọi BE                          |

## 5. Optimistic Concurrency

- FE gửi header `If-Unmodified-Since` (giá trị `expectedVersion` = `updatedAt` hiện tại) khi update/transition.
- Nếu BE phát hiện lệch -> trả lỗi `VERSION_CONFLICT`, FE set `versionConflict` trong slice và toast cảnh báo.
- FE tự động refetch detail ẩn để làm mới dữ liệu nền.

## 6. Quản lý màu động

- Color config fetch 1 lần khi vào detail (có thể tách thành global preload).
- Override map trạng thái & ưu tiên qua `statusColors`, `priorityColors` trong slice `colorConfig`.
- Component table/detail ưu tiên override trước map mặc định.

## 7. Thành phần chính FE

| Thành phần                         | Vai trò                                                                 |
| ---------------------------------- | ----------------------------------------------------------------------- |
| `CongViecTable`                    | Hiển thị danh sách, phân trang, thao tác nhanh xem / sửa / xóa          |
| `CongViecFormDialog`               | Tạo / chỉnh sửa công việc, build payload participants & cảnh báo hạn    |
| `CongViecDetailDialog`             | Tổng hợp chi tiết, tiến độ, bình luận, file, history, màu, routine task |
| `CommentsList` + `CommentComposer` | Thread bình luận gốc, tạo bình luận mới                                 |
| `RepliesList` + `ReplyComposer`    | Quản lý reply theo parent comment với cache                             |
| `FilesSidebar`                     | Danh sách tệp của công việc (khác tệp trong bình luận)                  |
| `WarningConfigBlock`               | UI cấu hình cảnh báo hạn (percent vs fixed date)                        |
| `MetricsBlock`                     | Hiển thị các số liệu (tiến độ, giờ trễ,...)                             |
| `HistoryAccordion`                 | Lịch sử thay đổi trạng thái (nếu BE trả)                                |
| `AdminColorSettingsDialog`         | Admin tinh chỉnh màu                                                    |

## 8. Lược đồ Sequence (rút gọn)

### Tạo công việc

```
User -> FormDialog: Submit
FormDialog -> congViecSlice: createCongViec(data)
congViecSlice -> API POST /congviec
API -> Service -> DB : insert
Service -> Controller -> FE: new task (with updatedAt)
Slice: unshift vào assigned list
UI: close dialog + toast
```

### Chuyển trạng thái (transition)

```
User -> DetailDialog: click action button
DetailDialog -> slice: transitionCongViec({id, action, expectedVersion})
Slice -> API POST /congviec/:id/transition
API -> Service: validate quyền + version + state machine
Service -> Controller: return {patch} (hoặc full)
Slice: apply patch + fetch detail background (để cập nhật history,... nếu chỉ patch)
UI: toast success
```

### Bình luận + file

```
User attach files & text -> DetailDialog: createCommentWithFiles
Thunk upload: POST /files (nếu triển khai) & POST /congviec/:id/comment
Slice: addCommentSuccess -> prepend comment vào BinhLuans
UI: reset composer
```

## 9. State Shape (Tóm tắt)

Xem chi tiết tại `redux-store-and-flows.md`.

```
{
  isLoading, error,
  currentNhanVien,
  activeTab,
  receivedCongViecs[], assignedCongViecs[],
  receivedTotal, assignedTotal, receivedPages, assignedPages,
  currentPage: {received, assigned},
  filters: { received:{...}, assigned:{...} },
  congViecDetail,
  repliesByParent: { [commentId]: {items, loading, loaded, error} },
  versionConflict,
  myRoutineTasks[], loadingRoutineTasks, myRoutineTasksLoaded, myRoutineTasksLastFetch
}
```

## 10. Phụ thuộc chính

- React, @mui/material, dayjs, formik + yup, react-toastify.
- BE: Express, middleware auth, service layer.

---

**Tiếp tục đọc**: `domain-models.md` để hiểu cấu trúc DB.
