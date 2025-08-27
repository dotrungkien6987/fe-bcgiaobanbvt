# Subtasks – Rủi Ro & Chiến Lược Giảm Thiểu

## 1. Danh Mục Rủi Ro

| ID  | Nhóm        | Rủi ro                              | Mức        | Ảnh hưởng                 | Dấu hiệu                       | Giảm thiểu                       | Kế hoạch khắc phục                   |
| --- | ----------- | ----------------------------------- | ---------- | ------------------------- | ------------------------------ | -------------------------------- | ------------------------------------ |
| R1  | Dữ liệu     | ChildrenCount lệch thực tế          | Trung bình | UI hiển thị sai, khóa sai | Diff >0 qua integrity report   | Recompute định kỳ                | Script recount + cập nhật atomic     |
| R2  | Hiệu năng   | N+1 fetch sâu                       | Thấp       | Chậm khi expand nhiều cấp | Nhiều request liên tiếp        | Cache byParent + TTL             | Gộp fetch batch (tương lai)          |
| R3  | UX          | Người dùng kỳ vọng tiến độ cha auto | Cao        | Nhầm quy trình báo cáo    | Nhiều câu hỏi hỗ trợ           | Tooltip + tài liệu               | Cân nhắc SuggestedProgress           |
| R4  | Quyền       | Người không đủ quyền tạo con        | Trung bình | Bypass phân cấp           | Log audit bất thường           | Kiểm tra server-side isPrincipal | Alert admin nếu >N lỗi 403 liên tiếp |
| R5  | Xóa         | Xóa cha có con đã phân công         | Cao        | Mất cấu trúc              | Nhiều 409 liên tục             | Chặn + hiển thị danh sách con    | Soft delete (giai đoạn sau)          |
| R6  | Race        | Hai user tạo con đồng thời          | Thấp       | Count lệch tạm            | Ghi log $inc liên tiếp         | $inc atomic                      | Recount nếu mismatch > threshold     |
| R7  | Aggregation | Summary chậm với nhiều con          | Trung bình | Detail load delay >1s     | Slow log > 1000ms              | Projection tối giản + index      | Cache ephemeral 30s                  |
| R8  | UI quá sâu  | Cây sâu khó đọc                     | Thấp       | Scroll dài                | Depth > 12                     | Collapse auto cấp > 8            | Breadcrumb ancestors                 |
| R9  | An ninh     | Lộ ID ancestor không có quyền       | Thấp       | Suy đoán cấu trúc         | Truy cập Path khi unauthorized | Kiểm tra quyền trước trả Path    | Ẩn Path nếu not allowed              |
| R10 | Rollback    | FE hiển thị nút tạo khi BE rollback | Thấp       | 500 lỗi                   | 5xx spike                      | Feature flag ẩn nút              | Hotfix env flag                      |

## 2. Chỉ Số Theo Dõi (Observability)

| Metric                    | Mục đích                            |
| ------------------------- | ----------------------------------- |
| subtask.create.count      | Số subtasks tạo / ngày              |
| subtask.create.error.4xx  | Lỗi quyền / rule                    |
| subtask.complete.blocked  | Số lần bị chặn hoàn thành cha       |
| subtask.children.fetch.ms | Thời gian fetch children trung bình |
| subtask.detail.summary.ms | Thời gian aggregation summary       |
| subtask.children.anomaly  | Số trường hợp ANOMALY_CHILD_COUNT   |

## 3. Alert Gợi Ý

| Điều kiện                                   | Cảnh báo                               |
| ------------------------------------------- | -------------------------------------- |
| subtask.detail.summary.ms p95 > 1500ms (5m) | “Aggregation summary chậm”             |
| subtask.create.error.4xx rate > 20%         | “Nhiều lỗi tạo subtask (quyền / rule)” |
| subtask.children.anomaly > 0                | “Phát hiện lệch ChildrenCount”         |

## 4. Quy Trình Recount (Manual)

1. Chạy aggregation integrity (xem data model doc).
2. Lấy danh sách parent lệch.
3. Gọi endpoint admin (tương lai) hoặc script Node `recountChildren([...ids])`.
4. Ghi log action + thời điểm.

## 5. Feature Flags

| Flag                     | Mục đích          | Default            |
| ------------------------ | ----------------- | ------------------ |
| SUBTASK_TREE_ENABLED     | Bật hiển thị cây  | true (sau rollout) |
| SUBTASK_CREATE_ENABLED   | Cho phép tạo mới  | true               |
| SUBTASK_SUGGEST_COMPLETE | Hiện banner gợi ý | true               |

## 6. Rollout Chiến Lược

| Giai đoạn | Mô tả                            |
| --------- | -------------------------------- |
| Canary    | Bật flags cho 1 nhóm user nội bộ |
| Phase 1   | Bật SUBTASK_TREE_ENABLED         |
| Phase 2   | Bật SUBTASK_CREATE_ENABLED       |
| Phase 3   | Bật SUBTASK_SUGGEST_COMPLETE     |

## 7. Checklist Trước Deploy

- [ ] Thêm field schema & index chạy thành công.
- [ ] Script backfill test trên staging (< N bản ghi).
- [ ] Endpoint create / children trả đúng JSON schema.
- [ ] FE ẩn an toàn nếu flags off.
- [ ] Tài liệu hướng dẫn người dùng (tooltip / FAQ) cập nhật.

## 8. Kịch Bản Thử Nghiệm Căng (Stress Scenario)

| Scenario                              | Mục tiêu                 |
| ------------------------------------- | ------------------------ |
| 1 user tạo 100 subtasks liên tiếp     | Kiểm tra $inc và latency |
| 10 user song song tạo dưới cùng 1 cha | Race & atomic integrity  |
| Cây 5 cấp, mỗi cấp 50 node            | Expand performance       |
| Xóa cha có 120 con                    | Thông báo & chặn ổn định |

## 9. FAQ Nội Bộ (Tóm tắt)

| Câu hỏi                           | Trả lời ngắn                                |
| --------------------------------- | ------------------------------------------- |
| Vì sao tiến độ cha không tự động? | Tránh mơ hồ & giữ quyền chủ động NgườiChính |
| Muốn gộp tiến độ tổng?            | Giai đoạn sau với SuggestedProgress         |
| Re-parent khi nào có?             | Sau khi ổn định model + nhu cầu rõ ràng     |
| Nếu mất đồng bộ ChildrenCount?    | Dùng script recount hoặc endpoint admin     |

---

Liên quan: `subtasks-feature-overview.md`, `subtasks-data-model.md`, `subtasks-api-design.md`.
