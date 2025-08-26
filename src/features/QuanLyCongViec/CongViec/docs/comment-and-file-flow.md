# Luồng Bình luận & Quản lý Tệp

## 1. Bình luận (Comment)

### Đặc điểm

- Danh sách bình luận gốc được trả trong `congViecDetail.BinhLuans` (sort DESC bởi FE).
- Reply không load sẵn (lazy load mỗi parent comment).
- Thu hồi bình luận = soft delete: set `TrangThai=DELETED`, xóa `NoiDung`.
- Thu hồi chỉ text: giữ file, chỉ clear `NoiDung`.

### Thêm bình luận gốc

```
addCongViecComment({congViecId,noiDung})
 -> POST /congviec/:id/comment {NoiDung}
 -> reducer addCommentSuccess: prepend vào congViecDetail.BinhLuans
```

### Thêm reply

```
addReply({congViecId,parentId,noiDung})
 -> POST /congviec/:id/comment {NoiDung,parentId}
 -> reducer addCommentSuccess: thêm vào repliesByParent[parentId].items (đầu danh sách)
 -> Tăng RepliesCount của parent
```

### Load replies

```
fetchReplies(parentId)
 if cached.loaded && !error -> return items
 else: fetch -> set repliesByParent[parentId] = {items,loaded:true}
```

### Thu hồi bình luận toàn phần

```
recallComment(congViecId, binhLuanId)
 -> DELETE /binhluan/:id
 -> reducer recallCommentSuccess: mark DELETED ở BinhLuans hoặc trong replies bucket
```

### Thu hồi chỉ text

```
recallCommentText(congViecId, binhLuanId)
 -> PATCH /binhluan/:id/text
 -> reducer recallCommentTextSuccess: set NoiDung="" (giữ Files)
```

## 2. File trong Bình luận

- Mỗi comment có mảng `Files` với field `_id, TenGoc, TrangThai, inlineUrl, downloadUrl`.
- Xóa file: `markCommentFileDeleted` áp dụng optimistic (set TrangThai=DELETED) trước/hoặc sau thunk delete.
- Quy tắc: không xóa cứng, duyệt lịch sử vẫn còn placeholder.

## 3. File ở cấp Công việc (FilesSidebar)

- Tách khỏi file của bình luận (phạm vi 'CONG_VIEC').
- Slice `quanLyTepTin` quản lý: `byTask[taskId] = { items, total, loading }` + `counts[taskId]`.
- Khi mở `CongViecDetailDialog`: dispatch `fetchFilesByTask(congViecId)` và `countFilesByTask(congViecId)`.

### Upload

(Chi tiết trong slice `quanLyTepTinSlice.js`, không trích ở đây):

- Có thể hỗ trợ drag & drop/paste.
- Thêm file vào pending list trước khi upload.
- Sau upload: refresh list hoặc append ngay nếu BE trả record.

### Xóa

- Gọi thunk deleteFile -> BE soft delete -> cập nhật lại danh sách / mark trạng thái.

## 4. Trạng thái UI liên quan

| State                                     | Vai trò                                    |
| ----------------------------------------- | ------------------------------------------ |
| `pendingFiles` (local)                    | Giữ file mới chọn trước khi gửi bình luận. |
| `dragCommentActive` / `dragSidebarActive` | Highlight vùng drop.                       |
| `submittingComment`                       | Disable composer khi đang gửi.             |

## 5. Chiến lược Hiệu năng

| Kỹ thuật                    | Giải thích                                            |
| --------------------------- | ----------------------------------------------------- |
| Lazy replies                | Không tải mọi reply ngay để tránh over-fetch.         |
| Optimistic mark delete file | Người dùng thấy kết quả tức thì; rollback ít xảy ra.  |
| Separate counts             | Hiển thị số file trước khi list xong (nếu BE hỗ trợ). |

## 6. Gợi ý Nâng cấp

| Ý tưởng                         | Lợi ích                                 |
| ------------------------------- | --------------------------------------- |
| WebSocket push new comment      | Realtime collaboration.                 |
| Infinite scroll comments        | Tránh tải lớn khi >500 comment.         |
| Deduplicate file uploads (hash) | Giảm lưu trữ trùng lặp.                 |
| Virus scan hook                 | An toàn tệp (bên thứ 3).                |
| Inline preview PDF/Image        | Nâng UX (sẵn có hook `useFilePreview`). |

---

Tiếp tục: `color-config.md`.
