# Tính năng Cây Công Việc (Subtasks) – Tổng Quan

## 1. Mục tiêu

Cho phép phân rã một công việc lớn thành nhiều công việc con (subtasks) tạo thành cấu trúc cây không giới hạn độ sâu. Hỗ trợ quản trị tiến độ, phân vai và kiểm soát hoàn thành theo phân cấp.

## 2. Phạm vi

| Hạng mục               | Trong phạm vi                                        | Ngoài phạm vi (giai đoạn này)                |
| ---------------------- | ---------------------------------------------------- | -------------------------------------------- |
| Tạo subtask            | ✅ Chỉ NgườiChính của công việc cha                  | ❌ Tạo hàng loạt qua import                  |
| Cập nhật tiến độ       | ✅ Mỗi node cập nhật độc lập thủ công                | ❌ Tự động gộp lên cha                       |
| Khóa hoàn thành cha    | ✅ Nếu còn con chưa HOAN_THANH                       | ❌ Tự động ép hoàn thành                     |
| Gợi ý hoàn thành cha   | ✅ Khi tất cả con HOAN_THANH                         | ❌ Auto transition                           |
| Bình luận + Tệp        | ✅ Bất kỳ cấp nào (theo quyền)                       | ❌ Tag @mention nâng cao                     |
| Xóa công việc cha      | ✅ Chặn nếu có con                                   | ❌ Cascade delete recursive                  |
| Cây vô hạn depth       | ✅ Có chống vòng                                     | ❌ Re-parent (di chuyển node)                |
| Quyền xem xuyên cấp    | ✅ Ancestor principals/managers có thể xem/bình luận | ❌ Chia sẻ tạm thời riêng lẻ                 |
| Thống kê con (summary) | ✅ Ở API detail                                      | ❌ Dashboard phân tích nâng cao              |
| Tìm kiếm               | ✅ Như hiện tại theo task phẳng                      | ❌ Search toàn bộ subtree theo text nâng cao |
| Thông báo              | Placeholder (sau)                                    | Triển khai toàn bộ rule email/push           |

## 3. Vai trò & Quyền chính

| Vai trò                                         | Tạo subtask | Cập nhật tiến độ node | Hoàn thành node    | Bình luận | Xem tất cả descendants    |
| ----------------------------------------------- | ----------- | --------------------- | ------------------ | --------- | ------------------------- |
| NgườiChính node                                 | ✅          | ✅                    | ✅ (nếu điều kiện) | ✅        | ✅ (các con)              |
| NgườiGiao node                                  | ❌          | ❌                    | ✅ (nếu workflow)  | ✅        | ✅ (các con)              |
| NgườiPhốiHợp node                               | ❌          | ❌                    | ❌                 | ✅        | ❌ (trừ khi thêm vào con) |
| Quản lý (QuanLyNhanVien KPI/Giao_Viec) ancestor | ❌          | ❌                    | ❌                 | ✅        | ✅                        |
| Admin                                           | ✅          | ✅                    | ✅                 | ✅        | ✅                        |

## 4. Khái niệm & Thuật ngữ

- **Node / Công việc**: Một document `CongViec` độc lập, có thể là root hoặc con.
- **CongViecChaID**: Tham chiếu tới công việc cha trực tiếp (null nếu root).
- **Path**: Mảng ancestor IDs từ root -> cha (Materialized Path) hỗ trợ truy vấn nhanh.
- **Depth**: Số cấp (root = 0).
- **ChildrenCount**: Số con trực tiếp (denormalized).
- **ChildrenSummary**: Thống kê con (total, done, inProgress, late) trả về ở API detail.
- **AllChildrenDone**: Cờ boolean trả về nếu tất cả con HOAN_THANH.

## 5. Business Rule Cốt lõi

1. Chỉ NgườiChính của cha được tạo subtask mới (khi cha chưa HOAN_THANH).
2. Không thể tạo subtask nếu cha đã HOAN_THANH.
3. Không thể chuyển cha sang HOAN_THANH nếu còn ít nhất 1 con chưa HOAN_THANH.
4. Khi tất cả con HOAN_THANH: API detail trả về `AllChildrenDone=true` → FE hiển thị banner gợi ý hoàn thành.
5. Tiến độ (%) của node không phụ thuộc con (không auto roll-up). (Giai đoạn sau có thể bổ sung “SuggestedProgress”).
6. Xóa node cha bị chặn nếu `ChildrenCount > 0` – trả về danh sách rút gọn các con (ID + tên + trạng thái).
7. Cây không giới hạn nhưng chống vòng bằng việc thiết lập Path tại create (không cho sửa CongViecChaID giai đoạn này).

## 6. Anti-Cycle & Integrity

- Flow tạo subtask không cho phép đặt cha sau khi tạo → không phát sinh vòng.
- Tương lai nếu hỗ trợ re-parent sẽ phải kiểm Path mới không chứa chính node.

## 7. Chỉ báo & UI/UX chính (tham chiếu tài liệu FE)

- Mini progress bar cạnh tên trong tree.
- Chip trạng thái + màu ưu tiên.
- Banner gợi ý hoàn thành cha (khi đủ điều kiện).

## 8. Rủi ro & Giảm thiểu

| Rủi ro                                | Mô tả                            | Giải pháp                                               |
| ------------------------------------- | -------------------------------- | ------------------------------------------------------- |
| N+1 query subtree                     | Lặp nhiều request khi expand sâu | API children riêng + lazy load depth                    |
| Tải lớn cây sâu                       | Quá nhiều node render            | Virtualize / pagination cấp con                         |
| Deadlock update counters              | Cập nhật ChildrenCount đồng thời | Dùng atomic $inc                                        |
| Người dùng nhầm tưởng tiến độ tự động | Kỳ vọng khác biệt                | Thêm tooltip giải thích tiến độ cha độc lập             |
| Truy vấn summary chậm                 | Nhiều con (hàng nghìn)           | Aggregation + projection tối giản + index CongViecChaID |

## 9. Kế hoạch Release (High-level)

1. BE: Model & migration + API create/get children + summary detail.
2. FE: Tree section read-only.
3. FE: Tạo subtask modal.
4. FE: Banner gợi ý hoàn thành.
5. BE: Lock rule khi hoàn thành cha.
6. QA: Kiểm thử sâu + edge cases.

## 10. Mở rộng Giai đoạn Sau

- Re-parent subtasks.
- SuggestedProgress (auto compute) song song manual.
- Bulk operations trên subtree.
- Full-text subtree search.
- Notifications rule engine.

## 11. Tương Thích Ngược & Rollback

| Khía cạnh                      | Ảnh hưởng                         | Chiến lược an toàn               |
| ------------------------------ | --------------------------------- | -------------------------------- |
| Task cũ không có field mới     | Không lỗi (Mongo bỏ qua)          | Field mới đều nullable + default |
| FE cũ (chưa deploy tree)       | Bỏ qua trường trả về mới          | Không thay đổi shape bắt buộc    |
| Rollback BE sau khi thêm field | Field thừa vẫn nằm trong document | Không cần migration down ngay    |
| Script backfill dở giữa chừng  | Một số ChildrenCount sai          | Có endpoint recompute (planned)  |
| Tạo subtask trong khi rollback | 409 nếu API bị remove             | FE hiển thị lỗi graceful         |

Rollback nhanh: tắt nút tạo subtask bằng feature flag FE (ẩn UI), giữ BE nguyên.

## 12. Hiệu Năng & Ngưỡng Khuyến Nghị

| Tình huống               | Ngưỡng khuyến nghị | Ghi chú                                  |
| ------------------------ | ------------------ | ---------------------------------------- |
| Số con trực tiếp / node  | <= 200             | Trên 200 cân nhắc paging children        |
| Tổng node một cây thường | < 5.000            | Trên nữa dùng cached summary / phân tán  |
| Độ sâu thực tế           | < 8                | Không giới hạn logic nhưng UI sẽ co rộng |

## 13. Logging & Audit (Giai đoạn 1 tối giản)

- Ghi log tạo subtask: action `CREATE_SUBTASK` lưu parentId, newId.
- Ghi log chặn hoàn thành cha: action `BLOCK_COMPLETE_CHILDREN_ACTIVE`.
- Không ghi riêng bảng audit mới (tận dụng lịch sử trạng thái / action log hiện có).

## 14. Bổ Sung Rủi Ro (Chi Tiết)

| Rủi ro                                             | Khả năng           | Ảnh hưởng          | Giảm thiểu                                       |
| -------------------------------------------------- | ------------------ | ------------------ | ------------------------------------------------ |
| Chênh lệch ChildrenCount nếu lỗi server giữa chừng | Thấp               | Hiển thị count sai | Cung cấp script `recount-children.js`            |
| Người dùng spam tạo nhiều cấp sâu                  | Trung bình         | Gây khó đọc        | Giới hạn UI hiển thị >15 cấp cần expand thủ công |
| Tấn công enumeration qua Path                      | Thấp               | Lộ ID ancestor     | Kiểm tra quyền trước trả về tree / ancestors     |
| Aggregation summary chậm                           | Trung bình (large) | Delay detail load  | Cache nhẹ 30s (nếu cần)                          |

## 15. Feature Flags (Đề Xuất)

- `SUBTASK_CREATE_ENABLED`: Bật / tắt nút tạo.
- `SUBTASK_TREE_ENABLED`: Bật hiển thị section cây.

## 16. Matrix Kiểm Thử Nhanh

| Case                                   | Bước                       | Kết quả mong đợi               |
| -------------------------------------- | -------------------------- | ------------------------------ |
| Tạo subtask chuẩn                      | Parent đang DANG_THUC_HIEN | 201, ChildrenCount++           |
| Tạo subtask khi parent HOAN_THANH      | Gọi POST                   | 409 PARENT_COMPLETED           |
| Hoàn thành cha còn con active          | PATCH status               | 409 CHILDREN_INCOMPLETE        |
| Hoàn thành cha sau khi tất cả con xong | PATCH status               | 200 + trạng thái HOAN_THANH    |
| Xóa cha có con                         | DELETE                     | 409 PARENT_HAS_CHILDREN + list |
| Load detail node sâu                   | GET detail                 | Trả về Depth chính xác         |
| Không có con                           | GET children               | items=[] total=0               |

---

---

Tài liệu liên quan: `subtasks-data-model.md`, `subtasks-api-design.md`, tài liệu FE tại thư mục frontend.
