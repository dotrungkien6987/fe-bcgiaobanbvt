# Visual Guides - Tài Liệu Trực Quan Hệ Thống

> **Mục đích**: Tài liệu hóa các module phức tạp với sơ đồ Mermaid, flowcharts, và giải thích logic nghiệp vụ
>
> **Ngôn ngữ**: Kết hợp Việt-Anh (giải thích tiếng Việt, thuật ngữ kỹ thuật tiếng Anh)
>
> **Phong cách**: Focus vào logic, ít code snippets, nhiều diagrams trực quan

---

## 📚 Danh Sách Tài Liệu

### 1. TapSan - Quản Lý Tập San & Bài Báo

- **[TAI_LIEU_DINH_KEM_VISUAL_GUIDE.md](./TapSan/TAI_LIEU_DINH_KEM_VISUAL_GUIDE.md)** ✅
  - Xử lý tài liệu đính kèm (Attachment Handling)
  - File upload validation, permission matrix, security layers
  - **Status**: Complete (5/1/2026)

### 2. CongViec - Quản Lý Công Việc (Task Management)

- **[00_OVERVIEW.md](./CongViec/00_OVERVIEW.md)** 🚧

  - Tổng quan kiến trúc module CongViec
  - Technology stack, core features, file map
  - **Status**: Complete (5/1/2026)

- **[01_STATE_MACHINE_WORKFLOW.md](./CongViec/01_STATE_MACHINE_WORKFLOW.md)** 📝

  - State Machine với 5 trạng thái, 8 actions
  - Permission matrix, transition logic
  - **Status**: Planning

- **[02_OPTIMISTIC_CONCURRENCY.md](./CongViec/02_OPTIMISTIC_CONCURRENCY.md)** 📝

  - Optimistic Concurrency Control với If-Unmodified-Since
  - Version conflict detection & resolution
  - **Status**: Planning

- **[03_COMMENT_THREADING_SYSTEM.md](./CongViec/03_COMMENT_THREADING_SYSTEM.md)** 📝

  - Comment threading với lazy loading
  - Reply system, recall mechanism
  - **Status**: Planning

- **[04_FILE_MANAGEMENT.md](./CongViec/04_FILE_MANAGEMENT.md)** 📝

  - File storage architecture
  - Task files vs Comment files
  - **Status**: Planning

- **[05_PERMISSION_AUTHORIZATION.md](./CongViec/05_PERMISSION_AUTHORIZATION.md)** 📝

  - Permission matrix cho Assigner/Main/Participant
  - Field-level update permissions
  - **Status**: Planning

- **[06_SUBTASKS_HIERARCHY.md](./CongViec/06_SUBTASKS_HIERARCHY.md)** 📝

  - Subtask model với Path & Depth
  - Parent-child constraints
  - **Status**: Planning

- **[07_DEADLINE_NOTIFICATIONS.md](./CongViec/07_DEADLINE_NOTIFICATIONS.md)** 📝

  - Deadline calculation logic
  - Agenda job scheduler integration
  - **Status**: Planning

- **[08_ROUTINE_TASK_INTEGRATION.md](./CongViec/08_ROUTINE_TASK_INTEGRATION.md)** 📝

  - Liên kết với KPI system
  - Routine task assignment workflow
  - **Status**: Planning

- **[09_API_REFERENCE.md](./CongViec/09_API_REFERENCE.md)** 📝
  - Complete API endpoint catalog
  - Request/Response schemas
  - **Status**: Planning

---

## 🎯 Priority Matrix

| Priority   | Module   | Files          | Reason                                         |
| ---------- | -------- | -------------- | ---------------------------------------------- |
| **HIGH**   | CongViec | 00, 01, 02, 05 | Core architecture, critical patterns, security |
| **MEDIUM** | CongViec | 03, 04, 06, 07 | Important features, moderate complexity        |
| **LOW**    | CongViec | 08, 09         | Integration features, reference                |

---

## 📖 Cách Sử Dụng

### Cho Người Mới (Beginner)

1. Đọc **00_OVERVIEW.md** của module để hiểu tổng quan
2. Đọc các file theo thứ tự được đề xuất trong Overview
3. Tham khảo API Reference khi cần

### Cho Developer (Intermediate)

1. Đọc Overview → State Machine → Critical Patterns
2. Focus vào Security & Permission
3. Đọc các feature cụ thể khi làm việc với chúng

### Cho Architect/Lead

- Đọc tất cả file theo thứ tự số để hiểu toàn bộ hệ thống

---

## ✍️ Hướng Dẫn Viết Tài Liệu

### Format Chuẩn

```markdown
# Tiêu Đề - Tên Tính Năng (Feature Name)

> **Module**: Tên Module  
> **Priority**: HIGH/MEDIUM/LOW  
> **Ngày cập nhật**: DD/MM/YYYY

## 📋 Tổng Quan

- Mô tả chức năng
- Vấn đề giải quyết
- Giá trị nghiệp vụ

## 🔄 Luồng Logic (với Mermaid flowchart)

...

## 📁 Data Models

...

## 🔐 Security & Permissions

...

## 🎯 Best Practices

...

## 📚 References

- Code files
- Related docs
```

### Yêu Cầu

- ✅ **Mermaid diagrams** - Trực quan hóa logic
- ✅ **Tables** - Cho reference data
- ✅ **Vietnamese + English** - Kết hợp linh hoạt
- ✅ **Code references** - File paths & line numbers chính xác
- ✅ **Edge cases** - Các trường hợp đặc biệt
- ❌ **Tránh code snippets dài** - Focus vào logic

---

## 🗂️ Cấu Trúc Thư Mục

```
docs/
└── visual-guides/
    ├── README.md (this file)
    ├── TapSan/
    │   └── TAI_LIEU_DINH_KEM_VISUAL_GUIDE.md
    ├── CongViec/
    │   ├── 00_OVERVIEW.md
    │   ├── 01_STATE_MACHINE_WORKFLOW.md
    │   ├── 02_OPTIMISTIC_CONCURRENCY.md
    │   ├── 03_COMMENT_THREADING_SYSTEM.md
    │   ├── 04_FILE_MANAGEMENT.md
    │   ├── 05_PERMISSION_AUTHORIZATION.md
    │   ├── 06_SUBTASKS_HIERARCHY.md
    │   ├── 07_DEADLINE_NOTIFICATIONS.md
    │   ├── 08_ROUTINE_TASK_INTEGRATION.md
    │   └── 09_API_REFERENCE.md
    └── [Future Modules]/
        └── ...
```

---

## 📈 Roadmap

- [x] TapSan - Attachment Handling (Complete)
- [ ] CongViec - Task Management (In Progress)
  - [ ] Week 1: 00, 01, 02, 05
  - [ ] Week 2: 03, 04, 06, 07
  - [ ] Week 3: 08, 09
- [ ] BaoCaoNgay - Daily Medical Reports (Planned)
- [ ] BaoCaoSuCo - Incident Management (Planned)
- [ ] KPI System (Planned)

---

## 📞 Đóng Góp

Nếu bạn muốn bổ sung hoặc cập nhật tài liệu:

1. Follow format chuẩn ở trên
2. Đảm bảo code references chính xác
3. Test Mermaid diagrams hiển thị đúng
4. Update README.md này

---

**Last Updated**: 5/1/2026  
**Maintainer**: Hospital Management System Team
