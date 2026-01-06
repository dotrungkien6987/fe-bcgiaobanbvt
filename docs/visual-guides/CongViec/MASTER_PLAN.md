# 📋 MASTER PLAN - CongViec Module Documentation

> **Module**: QuanLyCongViec/CongViec (Task Management)  
> **Ngày bắt đầu**: 5/1/2026  
> **Status**: Planning Phase

---

## 🎯 MỤC TIÊU

Tạo documentation đầy đủ và trực quan cho module **CongViec** - một trong những module phức tạp nhất của hệ thống với:

- ✅ **State Machine** với 5 trạng thái, 8 actions
- ✅ **Optimistic Concurrency Control** để xử lý race conditions
- ✅ **Comment Threading** với lazy loading
- ✅ **File Management** riêng biệt cho task và comments
- ✅ **Permission System** phức tạp (Assigner/Main/Participant)
- ✅ **Subtasks Hierarchy** với Path & Depth
- ✅ **Deadline Notifications** qua Agenda scheduler
- ✅ **KPI Integration** với routine tasks

---

## 📚 CẤU TRÚC DOCUMENTATION (9 Files)

### **Priority: HIGH** 🔥

| File                               | Topics                                               | Pages | Time      |
| ---------------------------------- | ---------------------------------------------------- | ----- | --------- |
| **00_OVERVIEW.md**                 | Tổng quan kiến trúc, Technology Stack, Core Features | 8-10  | 15-20 min |
| **01_STATE_MACHINE_WORKFLOW.md**   | State transitions, 8 actions, Permission matrix      | 12-15 | 25-30 min |
| **02_OPTIMISTIC_CONCURRENCY.md**   | If-Unmodified-Since, Version conflict resolution     | 10-12 | 20-25 min |
| **05_PERMISSION_AUTHORIZATION.md** | Role-based permissions, Field-level access           | 12-14 | 25-30 min |

### **Priority: MEDIUM** 📊

| File                               | Status | Topics                                               | Pages | Time      |
| ---------------------------------- | ------ | ---------------------------------------------------- | ----- | --------- |
| **03_COMMENT_THREADING_SYSTEM.md** | ✅     | Parent/Reply, Lazy loading, Recall mechanism         | 10-12 | 20-25 min |
| **04_FILE_MANAGEMENT.md**          | ✅     | Task files vs Comment files, Storage, Access control | 10-12 | 20-25 min |
| **06_SUBTASKS_HIERARCHY.md**       | ✅     | Path & Depth, Parent-child constraints               | 10-12 | 20-25 min |
| **07_DEADLINE_NOTIFICATIONS.md**   | ✅     | Deadline calculation, Agenda jobs                    | 10-12 | 20-25 min |

### **Priority: LOW** 📖

| File                               | Status | Topics                                         | Pages | Time      |
| ---------------------------------- | ------ | ---------------------------------------------- | ----- | --------- |
| **08_ROUTINE_TASK_INTEGRATION.md** | ✅     | KPI system integration, Cycle-based tasks      | 8-10  | 15-20 min |
| **09_API_REFERENCE.md**            | ✅     | Complete API catalog, Request/Response schemas | 15-20 | Reference |

**Total**: ~100-120 pages, ~3-4 giờ đọc

**STATUS**: ✅ **ALL 9 FILES COMPLETE!** 🎉

---

## 🗂️ KEY FILES MAPPING (Code References)

### Frontend (React + Redux)

```
fe-bcgiaobanbvt/src/features/QuanLyCongViec/CongViec/
├── congviecSlice.js                    (1832 lines - CORE REDUX)
├── components/
│   ├── CongViecForm.js                 (800+ lines - Main form)
│   ├── BinhLuanSection.js              (Comment UI)
│   ├── RepliesList.js                  (Lazy loading)
│   ├── SubtasksSection.jsx             (Subtasks)
│   ├── FilesSidebar.jsx                (File management)
│   └── VersionConflictNotice.jsx       (Concurrency warning)
├── utils/
│   ├── workActions.js                  (Available actions calculator)
│   ├── permissions.js                  (Frontend permission helpers)
│   └── textPermission.js               (Permission messages)
├── QuanLyTepTin/                       (File management sub-module)
│   └── quanlyteptinSlice.js
└── pages/
    ├── CongViecReceivedListPage.js
    └── CongViecAssignedListPage.js
```

### Backend (Express + MongoDB)

```
giaobanbv-be/modules/workmanagement/
├── models/
│   └── CongViec.js                     (386 lines - Mongoose schema)
├── controllers/
│   └── congviec.controller.js          (4099 lines - Business logic)
├── services/
│   ├── congviec.service.js             (752 lines - Core service)
│   ├── file.service.js
│   └── notificationService.js
├── helpers/
│   ├── workActions.constants.js        (Action definitions)
│   ├── filePermissions.js              (Access control)
│   ├── transitionBuilder.js            (State machine logic)
│   └── deadlineScheduler.js            (Agenda jobs)
├── routes/
│   ├── congviec.api.js
│   └── files.api.js
└── validators/
    └── congviec.validators.js
```

---

## 📅 TIMELINE & MILESTONES

### **Week 1: HIGH Priority Files** (4 files)

**Ngày 1-2** (5-6/1/2026):

- ✅ Tạo MASTER_PLAN.md
- 📝 **00_OVERVIEW.md**
  - Research: 2h
  - Writing: 3h
  - Review: 1h
- 📝 **01_STATE_MACHINE_WORKFLOW.md**
  - Research: 3h
  - Writing: 4h
  - Review: 1h

**Ngày 3-4** (7-8/1/2026):

- 📝 **02_OPTIMISTIC_CONCURRENCY.md**
  - Research: 2h
  - Writing: 3h
  - Review: 1h
- 📝 **05_PERMISSION_AUTHORIZATION.md**
  - Research: 3h
  - Writing: 4h
  - Review: 1h

**Milestone 1**: ✅ Core architecture documented, critical patterns explained

---

### **Week 2: MEDIUM Priority Files** (4 files)

**Ngày 5-6** (9-10/1/2026):

- 📝 **03_COMMENT_THREADING_SYSTEM.md**
- 📝 **04_FILE_MANAGEMENT.md**

**Ngày 7-8** (11-12/1/2026):

- 📝 **06_SUBTASKS_HIERARCHY.md**
- 📝 **07_DEADLINE_NOTIFICATIONS.md**

**Milestone 2**: ✅ All important features documented

---

### **Week 3: LOW Priority + Polish** (2 files + review)

**Ngày 9-10** (13-14/1/2026):

- 📝 **08_ROUTINE_TASK_INTEGRATION.md**
- 📝 **09_API_REFERENCE.md**

**Ngày 11-12** (15-16/1/2026):

- 🔍 Review tất cả files
- 🎨 Polish diagrams, fix typos
- ✅ Update README.md
- 📊 Create summary document

**Milestone 3**: ✅ Complete documentation suite

---

## 🎯 Completion Status

### **Session 1** ✅ Complete (5/1/2026)

- ✅ Created MASTER_PLAN.md
- ✅ Researched code for 00_OVERVIEW.md
- ✅ Wrote 00_OVERVIEW.md (1,240 lines with 11 Mermaid diagrams)
- ✅ Updated MASTER_PLAN status

### **Session 2** ✅ Complete (5/1/2026)

- ✅ Researched code for 01_STATE_MACHINE_WORKFLOW.md
  - Read workActions.constants.js (FE & BE)
  - Read congViecSlice.js getAvailableActions()
  - Read congViec.service.js buildActionMap() & transition()
- ✅ Wrote 01_STATE_MACHINE_WORKFLOW.md (1,240+ lines)
  - 5 States với state diagram
  - 8 Actions với detailed description
  - Permission Matrix với ROLE_REQUIREMENTS
  - Approval vs No-approval workflows
  - Business rules (subtask, auto-normalize, auto-complete)
  - Error handling với error codes
  - Complete Mermaid diagrams
- ✅ Updated MASTER_PLAN status

### **Session 3** ✅ Complete (5/1/2026)

- ✅ Researched code for 02_OPTIMISTIC_CONCURRENCY.md
  - Read congViecSlice.js version conflict handling
  - Read VersionConflictNotice.jsx component
  - Read congViec.service.js version check logic
  - Read updateProgress, assignRoutineTask, transition implementations
- ✅ Wrote 02_OPTIMISTIC_CONCURRENCY.md (1,300+ lines)
  - If-Unmodified-Since mechanism explained
  - Version tracking với updatedAt field
  - Complete conflict detection flow diagrams
  - Frontend/Backend implementation patterns
  - 4 Race condition scenarios với solutions
  - Error recovery strategies (auto-refresh, manual, retry)
  - User experience flow với warning banner
  - Code references với line numbers
- ✅ Updated MASTER_PLAN status

**Next Session**: Create 05_PERMISSION_AUTHORIZATION.md (skip 03/04 for now to complete HIGH priority)

---

### **Session 5 Part 2** ✅ Complete (5/1/2026)

- ✅ Researched KPI integration system
  - Read NhiemVuThuongQuy.js (routine duty model)
  - Read CongViec.js linking fields (NhiemVuThuongQuyID, FlagNVTQKhac)
  - Read congViec.service.js getDashboardByNhiemVu (~140 lines)
  - Read DanhGiaKPI.js (KPI evaluation model)
  - Analyzed overlap date logic (3-case filtering)
- ✅ Wrote 08_ROUTINE_TASK_INTEGRATION.md (~2,400 lines)
  - KPI System Architecture Overview (3-layer design)
  - NVTQ-CongViec relationship (linking patterns)
  - Cycle-based filtering (overlap logic, 3 cases)
  - Dashboard metrics (5 parallel aggregations)
  - KPI evaluation flow (approval workflow, formula)
  - "Other" tasks category (FlagNVTQKhac usage)
  - Code references (files, APIs, queries)
  - 8+ Mermaid diagrams (ER, sequence, flow)
- ✅ Updated MASTER_PLAN status

**Next Session**: Create 09_API_REFERENCE.md (final file, 100% completion)

---

## 🎯 THỨ TỰ ĐỌC CHO CÁC ĐỐI TƯỢNG

### 👶 **Người Mới (Beginner)**

Mục tiêu: Hiểu cơ bản về module, biết cách sử dụng

1. **00_OVERVIEW.md** - Tổng quan
2. **01_STATE_MACHINE_WORKFLOW.md** - Core business logic
3. **03_COMMENT_THREADING_SYSTEM.md** - Feature thường dùng
4. **04_FILE_MANAGEMENT.md** - Feature thường dùng
5. **09_API_REFERENCE.md** - Tra cứu khi cần

**Thời gian**: ~2 giờ

---

### 👨‍💻 **Developer (Intermediate)**

Mục tiêu: Có thể maintain và fix bugs

1. **00_OVERVIEW.md**
2. **01_STATE_MACHINE_WORKFLOW.md**
3. **02_OPTIMISTIC_CONCURRENCY.md** ⚠️ Critical
4. **05_PERMISSION_AUTHORIZATION.md** ⚠️ Security
5. **06_SUBTASKS_HIERARCHY.md**
6. **07_DEADLINE_NOTIFICATIONS.md**
7. **03_COMMENT_THREADING_SYSTEM.md**
8. **04_FILE_MANAGEMENT.md**
9. **08_ROUTINE_TASK_INTEGRATION.md**
10. **09_API_REFERENCE.md**

**Thời gian**: ~3.5 giờ

---

### 🏗️ **Architect/Lead Developer**

Mục tiêu: Hiểu toàn bộ hệ thống, có thể refactor và mở rộng

- Đọc tất cả 9 files theo thứ tự **00 → 09**
- Focus đặc biệt vào:
  - State Machine design patterns
  - Concurrency control strategies
  - Permission system architecture
  - Scalability considerations

**Thời gian**: ~4 giờ

---

## ✅ COMPLETION CRITERIA

Mỗi file documentation phải có:

### **Content Requirements**

- ✅ **Vietnamese language** - Giải thích bằng tiếng Việt
- ✅ **Technical terms in English** - Giữ nguyên thuật ngữ kỹ thuật
- ✅ **Mermaid diagrams** - Flowcharts, state diagrams, sequence diagrams
- ✅ **Tables** - Reference data, comparison matrices
- ✅ **Code references** - File paths, line numbers (chính xác)
- ✅ **Edge cases** - Các trường hợp đặc biệt đã được xử lý
- ✅ **Best practices** - Hướng dẫn sử dụng đúng cách
- ✅ **Troubleshooting** - Common issues & solutions

### **Quality Standards**

- ✅ **Accuracy** - Dựa trên code thực tế đang chạy
- ✅ **Clarity** - Dễ hiểu cho cả người mới
- ✅ **Completeness** - Cover tất cả aspects của topic
- ✅ **Visual** - Nhiều diagrams, ít text walls
- ✅ **Practical** - Focus vào logic, ít code snippets dài

### **Testing Checklist**

- ✅ Mermaid diagrams render correctly trong VS Code
- ✅ All file paths và line numbers đúng
- ✅ No broken internal links
- ✅ Spelling & grammar check
- ✅ Reviewed by at least one other person

---

## 🔄 WORKFLOW QUA NHIỀU PHIÊN

### **Session Checkpoint Pattern**

Sau mỗi session làm việc:

1. **Commit progress** - Save file ngay lập tức
2. **Update MASTER_PLAN** - Mark status (✅/🚧/📝)
3. **Note blockers** - Ghi lại vấn đề cần resolve
4. **Plan next session** - Xác định file tiếp theo

### **Recovery Strategy**

Nếu bị gián đoạn:

1. Check MASTER_PLAN.md → Xem file nào đang WIP
2. Check file status symbols:
   - ✅ Complete
   - 🚧 In Progress (có thể tiếp tục)
   - 📝 Planning (chưa bắt đầu)
3. Continue từ file 🚧 hoặc bắt đầu file 📝 tiếp theo

### **Version Control**

- Mỗi file hoàn thành → Commit riêng
- Commit message format: `docs: Add CongViec 00_OVERVIEW.md`
- Branch naming: `docs/congviec-visual-guides`

---

## 📊 DEPENDENCIES MATRIX

| File                        | Depends On | Required By |
| --------------------------- | ---------- | ----------- |
| 00_OVERVIEW                 | -          | ALL         |
| 01_STATE_MACHINE_WORKFLOW   | 00         | 05, 07      |
| 02_OPTIMISTIC_CONCURRENCY   | 00         | -           |
| 03_COMMENT_THREADING        | 00         | 04          |
| 04_FILE_MANAGEMENT          | 00, 03     | -           |
| 05_PERMISSION_AUTHORIZATION | 00, 01     | 08          |
| 06_SUBTASKS_HIERARCHY       | 00         | -           |
| 07_DEADLINE_NOTIFICATIONS   | 00, 01     | -           |
| 08_ROUTINE_TASK_INTEGRATION | 00, 05     | -           |
| 09_API_REFERENCE            | ALL        | -           |

**Quy tắc**: Không viết file con trước khi file cha (Dependencies) hoàn thành

---

## 🚀 NEXT STEPS

### **Immediate Actions** (Session 1)

1. ✅ Create MASTER_PLAN.md
2. 📝 Research code for 00_OVERVIEW.md
3. 📝 Write 00_OVERVIEW.md (draft)
4. 🔍 Review & polish 00_OVERVIEW.md

### **Confirmation Needed**

- ❓ Format có ok không? (giống TAI_LIEU_DINH_KEM_VISUAL_GUIDE.md)
- ❓ Bắt đầu với 00_OVERVIEW.md?
- ❓ Có điều chỉnh nào về scope hoặc timeline?

---

## 📝 NOTES & DECISIONS

### **Design Decisions**

- ✅ Chia thành 9 files (không merge) - Dễ maintain, dễ đọc từng phần
- ✅ Priority-based order - HIGH trước để có foundation
- ✅ Code references với line numbers - Dễ trace, nhưng cần update nếu code thay đổi
- ✅ Mermaid cho tất cả diagrams - Native support trong VS Code, không cần external tools

### **Risks & Mitigations**

| Risk                                 | Impact | Mitigation                                 |
| ------------------------------------ | ------ | ------------------------------------------ |
| Code changes invalidate line numbers | Medium | Review và update định kỳ                   |
| Too detailed → quá dài               | Medium | Focus vào logic, bỏ implementation details |
| Mermaid too complex → không render   | Low    | Test diagrams incrementally                |
| Time overrun                         | High   | Flexible timeline, prioritize HIGH files   |

---

## 📞 SUPPORT & QUESTIONS

Nếu có thắc mắc trong quá trình implementation:

1. Check [TAI_LIEU_DINH_KEM_VISUAL_GUIDE.md](../TapSan/TAI_LIEU_DINH_KEM_VISUAL_GUIDE.md) làm reference
2. Review [README.md](../README.md) để xem format guidelines
3. Ask questions trong session tiếp theo

---

**Status**: ✅ Session 5 Part 3 Complete - ALL 9 FILES FINISHED! 🎉  
**Progress**: 9/9 files complete (100%)  
**Documentation Suite**: ~100 pages, comprehensive visual guides  
**Last Updated**: 5/1/2026
