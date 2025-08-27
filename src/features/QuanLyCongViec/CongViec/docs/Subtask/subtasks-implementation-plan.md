# SUBTASKS – KẾ HOẠCH TRIỂN KHAI RÚT GỌN (SLIM PLAN)

Mục tiêu: Bổ sung khả năng tạo công việc con (subtask) với thay đổi nhỏ nhất, thấy kết quả ngay trên UI, giữ nguyên mọi flow đang chạy.

---

## 0. Nguyên Tắc Rút Gọn

- Không feature flag giai đoạn đầu (có thể thêm sau).
- Không thay đổi hành vi endpoints cũ (backward compatible).
- Mọi thay đổi là “additive”: thêm field, thêm endpoint, thêm section UI.
- Ưu tiên hiển thị danh sách con (flat) trước, tree view sau.
- Tạm bỏ qua: re-parent, thống kê sâu, cache phức tạp, metrics.

---

## 1. Schema (Backend) – Bước Duy Nhất

| Việc | Mô tả | Kết quả |
| ---- | ----- | ------- |
| S1.1 | Thêm vào CongViec schema: `CongViecChaID:ObjectId|null`, `Path:[ObjectId]`, `Depth:Number`, `ChildrenCount:Number` (default 0) | Build OK |
| S1.2 | Pre-save (chỉ khi create mới): nếu có `CongViecChaID` → fetch cha: validate cha.TrangThai != HOAN_THANH → `Path = [...parent.Path, parent._id]`, `Depth = parent.Depth + 1` | Subtask có Depth/Path đúng |
| S1.3 | Sau khi save subtask: `parent.ChildrenCount++` (updateOne) | Count tăng |
| S1.4 | Xóa mềm / hoàn thành cha hiện có → không auto đụng children (chỉ chặn khi hoàn thành, xử lý ở API) | An toàn |

Rollback: Revert file model (các field thừa sẽ bị bỏ qua khi đọc).

---

## 2. API Tối Thiểu

| Việc | Mô tả | Output |
| ---- | ----- | ------ |
| A2.1 | POST /workmanagement/congviec/:id/subtasks | Tạo subtask (re-use validator của create) |
| A2.2 | GET /workmanagement/congviec/:id/children | List con trực tiếp (sort by createdAt desc) |
| A2.3 | GET /workmanagement/congviec/detail/:id mở rộng | Thêm: `CongViecChaID`, `ChildrenCount`, `ChildrenSummary = { total, done, active, incomplete }`, `AllChildrenDone:boolean`, `Ancestors:[{_id,TieuDe}]` |
| A2.4 | PATCH /workmanagement/congviec/:id/transition (hiện có) thêm rule: nếu target = HOAN_THANH và còn con chưa HOAN_THANH → 409 CHILDREN_INCOMPLETE | Lock đúng |
| A2.5 | DELETE /workmanagement/congviec/:id (nếu có) → nếu ChildrenCount>0 → 409 PARENT_HAS_CHILDREN | Chặn xóa cha có con |

Query ChildrenSummary: 1 aggregate đơn giản `$match {CongViecChaID:id}` + `$group`.

Rollback: Bỏ phần bổ sung trong service + route mới.

---

## 3. Redux / FE State

| Việc | Mô tả | Ghi chú |
| ---- | ----- | ------- |
| F3.1 | Thêm `subtasksByParent: { [parentId]: { ids:[], loaded:boolean, loading:boolean } }` vào congViecSlice | Không động tới congViecDetail |
| F3.2 | Thêm thunk `fetchSubtasks(parentId)` → call A2.2, cache đơn giản (nếu đã loaded không gọi lại) | Có thể thêm forceReload param sau |
| F3.3 | Thêm thunk `createSubtask(parentId, formData)` → call A2.1 → push ID vào `subtasksByParent[parentId].ids` + increment `congViecDetail.ChildrenCount` nếu đang mở | Optimistic đơn giản |
| F3.4 | Khi mở detail: nếu ChildrenCount > 0 hoặc luôn → dispatch fetchSubtasks(parentId) lazy (sau khi detail xong) | Tránh block render |

---

## 4. UI Tối Thiểu (Trong CongViecDetailDialog)

| Việc | Mô tả | Kết quả |
| ---- | ----- | ------- |
| U4.1 | Section mới dưới mô tả: “Công việc con (n)” + nút “Thêm” (chỉ NgườiChính & task chưa HOAN_THANH) | List con hiển thị |
| U4.2 | Table/List đơn giản cột: Tiêu đề | Trạng thái | % | Hạn | Người chính | Không tree lúc này |
| U4.3 | Click row → mở dialog detail (re-use dialog hiện có) | Flow cũ |
| U4.4 | Nút “Thêm” mở `CreateSubtaskDialog` (reuse form rút gọn: TieuDe, NguoiChinh, NgayHetHan, MoTa) | Submit tạo xong đóng |
| U4.5 | Nếu `AllChildrenDone && TrangThai === DANG_THUC_HIEN` → Banner nhỏ “Tất cả công việc con đã hoàn thành – Hoàn thành công việc này?” với nút → call transition HOAN_THANH | Gợi ý |

Rollback UI: Remove section + related imports.

---

## 5. Tree View (Tùy Chọn – Sau Khi Có Flat List)

| Việc | Mô tả | Ghi chú |
| ---- | ----- | ------- |
| T5.1 | Thay bảng bằng tree collapsible (MUI TreeView / recursive UL) | Chỉ depth mở rộng khi click |
| T5.2 | Khi expand node chưa load con → gọi fetchSubtasks(nodeId) | Lazy |
| T5.3 | Node label: Tên + mini progress bar (width ~60px) + chip trạng thái | Tối ưu render |
| T5.4 | Hiển thị breadcrumb (ancestors) ở top nếu Depth > 0 | Dùng `Ancestors` từ detail |

Có thể trì hoãn toàn bộ block T5 mà không ảnh hưởng core.

---

## 6. Logic Hoàn Thành Cha

| Việc | Mô tả |
| ---- | ----- |
| L6.1 | Ở FE khi bấm chuyển HOAN_THANH: cứ gọi API như cũ → nếu 409 CHILDREN_INCOMPLETE → show toast “Còn X/Y công việc con chưa hoàn thành” |
| L6.2 | Sau một update con thành HOAN_THANH → FE không cần tự tính; rely vào refetch detail nếu đang mở (hoặc update ChildrenSummary thủ công nhỏ) |
| L6.3 | Banner gợi ý (U4.5) chỉ hiện nếu AllChildrenDone từ API |

---

## 7. Trường Hợp Cạnh & Đơn Giản Hóa

| Case | Xử lý rút gọn |
| ---- | ------------- |
| Subtask của subtask | Y chang – parentId là subtask |
| Xóa cha có con | Block 409 (không soft cascade) |
| Di chuyển con sang cha khác | Không hỗ trợ (reject 400 nếu có route) |
| Rebuild ChildrenCount lệch | Viết script rời (chưa tự động) |
| Progress cha | Không tự động, chỉ thủ công |

---

## 8. Test Nhanh (Manual Checklist)

1. Tạo task A (root) → mở detail → ChildrenCount = 0.
2. Tạo subtask B dưới A → A.ChildrenCount = 1 → list hiển thị B.
3. Tạo subtask C dưới B (depth=2) → mở B detail thấy C.
4. Chuyển B HOAN_THANH khi C chưa HOAN_THANH → OK (độc lập).
5. Chuyển A HOAN_THANH khi B chưa HOAN_THANH → 409.
6. Hoàn thành B & C → A detail: AllChildrenDone = true → banner xuất hiện.
7. Xóa A (có B) → 409 PARENT_HAS_CHILDREN.
8. Reload trang danh sách: không crash cột mới (vì chưa sửa bảng chính – optional).

---

## 9. Ưu Tiên Thực Thi (Đường Thẳng)

1. Schema + pre-save + parent increment (S1.*)
2. API create subtask + children + detail mở rộng (A2.1–A2.3)
3. Redux: fetchSubtasks + createSubtask (F3.*)
4. UI danh sách con + dialog tạo (U4.1–U4.4)
5. Lock hoàn thành + banner (A2.4 + U4.5 + L6.*)
6. (Optional) Tree view (T5.*)

---

## 10. Điểm Ảnh Hưởng Tối Thiểu

| Module cũ | Ảnh hưởng | Cách giảm |
| --------- | --------- | --------- |
| congViecSlice | Thêm state mới dưới namespace (vd: `subtasks`) | Không sửa reducers cũ |
| CongViecDetailDialog | Thêm section mới | Không động logic comment / file / progress |
| Backend update/transition | Thêm 1 validate block khi target HOAN_THANH | Không đổi response format cũ |
| Lịch sử | Optional bổ sung entry “TAO_SUBTASK” sau này | Có thể bỏ qua giai đoạn 1 |

---

## 11. Kết Luận

Luồng rút gọn chỉ thêm một “dimension” quan hệ cha–con mà không bẻ gãy bất kỳ quy trình nào có sẵn. Xây dựng tuyến tính, thấy giá trị ngay sau mỗi bước, chi phí rollback thấp (xóa section + route). Tree nâng cao có thể làm sau khi đã ổn định danh sách con phẳng.

> OK để bắt đầu thực hiện từ Bước 1 (Schema) & Bước 2 (API create + children). Khi bạn xác nhận, mình sẽ chuẩn bị patch code tương ứng.
