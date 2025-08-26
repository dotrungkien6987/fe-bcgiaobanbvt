# Data Lifecycle & Sequence Diagrams (Textual)

## 1. Load Danh Sách (Received)

```
User opens page
 -> dispatch getReceivedCongViecs(nhanVienId, filters)
    startLoading
    sanitize filters (remove empty)
    GET /congviec/:id/received?page=x&limit=y...
    Controller -> Service -> DB query (filters + pagination)
    return {CongViecs,totalItems,totalPages,currentPage}
    reducer getReceivedCongViecsSuccess -> update state
UI re-render Table
```

## 2. Load Detail

```
User clicks "Xem"
 -> open CongViecDetailDialog(congViecId)
 -> useEffect: dispatch getCongViecDetail(id)
                fetchFilesByTask(id)
                countFilesByTask(id)
                fetchColorConfig()
                fetchMyRoutineTasks()
 -> GET /congviec/detail/:id
 -> reducer store congViecDetail (sort comments)
UI shows metadata + comments
```

## 3. Create Task

```
Form submit -> buildPayload(values+participants)
 -> POST /congviec
 -> 201 {newTask}
 -> createCongViecSuccess: unshift into assigned list
 -> close dialog + toast
```

## 4. Update Task (Form Edit)

```
Form submit (isEdit)
 -> PUT /congviec/:id (If-Unmodified-Since header)
 -> 200 {updatedTask}
 -> updateCongViecSuccess sync lists + detail
```

## 5. Transition

```
Action button click (e.g. TIEP_NHAN)
 -> transitionCongViec({id,action,extra:{expectedVersion}})
 -> POST /congviec/:id/transition {action,...}
 -> Service validate + mutate + persist
 -> Response {patch} or {patch,congViec}
 -> applyCongViecPatch(patch) OR updateCongViecSuccess(full)
 -> background getCongViecDetail if only patch
```

## 6. Comment + Reply

```
User enters comment + optional files
 -> thunk createCommentWithFiles: (upload files ->) POST /congviec/:id/comment
 -> addCommentSuccess -> prepend
Replies:
 -> click "X xem phản hồi" -> fetchReplies(parentId) (if not cached)
 -> addReply -> POST comment with parentId -> addCommentSuccess updates replies bucket
```

## 7. Delete (Recall) Comment

```
Recall button -> recallComment(congViecId,binhLuanId)
 -> DELETE /binhluan/:id
 -> recallCommentSuccess sets TrangThai=DELETED + clear NoiDung in both root or replies
```

## 8. Update Progress Quick Slider

```
Drag slider -> local state quickProgress
Blur/Enter -> commitProgressUpdate(v)
 -> updateCongViec PUT { PhanTramTienDoTong:v, expectedVersion }
 -> success -> updateCongViecSuccess
```

## 9. File Attachment (Task Level)

```
Drop file in FilesSidebar
 -> upload thunk POST /congviec/:id/teptin
 -> on success: append file item or refetch list
 -> inlineUrl/downloadUrl used for preview/download
```

## 10. Version Conflict Scenario

```
User A opens detail (version v1)
User B updates task -> version becomes v2
User A edits and submits with expectedVersion=v1
 -> PUT returns VERSION_CONFLICT
 -> reducer setVersionConflict + toast
 -> auto background getCongViecDetail (now v2) stored
User A chooses to reload UI or re-apply changes manually
```

## 11. Routine Task Link

```
Select routine task from dropdown
 -> updateCongViec PUT { NhiemVuThuongQuyID, expectedVersion }
 -> success -> updateCongViecSuccess
```

## 12. Color Config Update (Admin)

```
Admin opens settings
Change colors -> PUT /colors
 -> reducer update colorConfig
Task list chips instantly use new overrides
```

---

Next: `security-permissions.md`.
