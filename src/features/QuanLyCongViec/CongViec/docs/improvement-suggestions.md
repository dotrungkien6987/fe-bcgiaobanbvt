# Gợi ý Cải tiến & Lộ trình

## 1. Trải nghiệm Người dùng

| Hạng mục                      | Mô tả                                                 |
| ----------------------------- | ----------------------------------------------------- |
| Notification realtime         | WebSocket/SignalR để push transition, comment mới.    |
| Inline edit tiêu đề           | Cho phép sửa nhanh TieuDe ngay trong Detail header.   |
| Bulk actions                  | Chọn nhiều task để gán lại người chính / đổi ưu tiên. |
| Saved filters                 | Lưu bộ lọc hay dùng (localStorage).                   |
| Dark mode color config preset | Tự động sinh màu tối tương phản.                      |

## 2. Kiến trúc FE

| Hạng mục                  | Mô tả                                                            |
| ------------------------- | ---------------------------------------------------------------- |
| Entity normalization      | Dùng `createEntityAdapter` cho tasks & comments lớn.             |
| Suspense + React Query    | Tách API layer sang react-query để cache/bộ nhớ thông minh.      |
| Form hook                 | Extract `useCongViecForm` để test dễ hơn.                        |
| Unit tests critical flows | Test reducer: transition patch, version conflict, replies cache. |

## 3. Hiệu năng

| Hạng mục                 | Mô tả                                     |
| ------------------------ | ----------------------------------------- |
| Virtualized comment list | React-window cho >200 comment.            |
| Delta update progress    | Gửi chỉ field thay đổi (đã làm một phần). |
| Prefetch next page       | Khi user gần cuối trang, prefetch page+1. |

## 4. BE & Data

| Hạng mục                    | Mô tả                                             |
| --------------------------- | ------------------------------------------------- |
| State machine library       | Xác định biểu đồ trạng thái rõ & validate cứng.   |
| ETag + 304                  | Giảm bandwidth cho detail reload.                 |
| Soft delete TTL             | Cron xóa dữ liệu mềm hết hạn.                     |
| Full text search index      | Tối ưu filter `search` (tiêu đề + mô tả).         |
| Aggregated metrics endpoint | Dashboard hiệu suất (số task trễ, đúng hạn, ...). |

## 5. Bảo mật & Observability

| Hạng mục           | Mô tả                                   |
| ------------------ | --------------------------------------- |
| Structured logging | Gắn correlationId mỗi request để trace. |
| Audit trail UI     | Trang xem lịch sử hành động.            |
| Sentry / APM       | Theo dõi lỗi runtime.                   |
| Rate limit comment | Giảm spam.                              |

## 6. Quy trình DevOps

| Hạng mục               | Mô tả                                         |
| ---------------------- | --------------------------------------------- |
| CI lint + test         | Chặn merge nếu test reducer fail.             |
| Storybook components   | Tài liệu hóa UI, test visual regression.      |
| Infrastructure as Code | Template deploy module (Terraform / Ansible). |

## 7. Khả năng Mở rộng Nghiệp vụ

| Hạng mục             | Mô tả                                        |
| -------------------- | -------------------------------------------- |
| Subtasks (hierarchy) | Quan hệ cha-con giữa công việc.              |
| SLA policies         | Cảnh báo escalations tự động qua email/chat. |
| KPI integration      | Tính điểm KPI từ tiến độ & đúng hạn.         |
| Time tracking        | Ghi log thời gian làm việc (check-in/out).   |
| Kanban board view    | Trực quan trạng thái bằng drag & drop.       |

## 8. Chất lượng Dữ liệu

| Hạng mục                   | Mô tả                                      |
| -------------------------- | ------------------------------------------ |
| Validation server mạnh hơn | Ràng buộc percent range, ngày logic.       |
| Duplicate detection        | Cảnh báo khi tạo task trùng tiêu đề + hạn. |
| Historical snapshots       | Lưu diff khi transition để audit.          |

## 9. Quốc tế hóa (i18n)

| Hạng mục               | Mô tả                              |
| ---------------------- | ---------------------------------- |
| Extract labels         | Tách text tiếng Việt ra file JSON. |
| Locale date formatting | Dùng Dayjs locale dynamic.         |

## 10. Khác

| Hạng mục                 | Mô tả                                              |
| ------------------------ | -------------------------------------------------- |
| Accessibility            | ARIA labels cho chips & sliders.                   |
| Mobile responsive tối ưu | Điều chỉnh layout detail dialog trên thiết bị nhỏ. |

---

Kết thúc bộ tài liệu. Hãy cập nhật khi logic thay đổi.
