# 📚 Documentation Index - Quản Lý Công Việc

**Version:** 1.0  
**Last Updated:** 25/11/2025  
**Module:** Work Management System (QuanLyCongViec)

> **💡 Mục đích:** File này là danh mục tổng hợp tất cả tài liệu trong hệ thống Quản lý công việc, giúp bạn tìm nhanh tài liệu cần thiết.

---

## 🎯 Bắt đầu từ đâu?

### Nếu bạn là...

| Vai trò             | Nên đọc tài liệu nào      | Thứ tự đọc                                                                                                                            |
| ------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Developer mới**   | Hiểu tổng quan trước      | 1. [WORKMANAGEMENT_GUIDE.md](#workmanagement_guidemd) → 2. [MODULE_ARCHITECTURE.md](#module_architecturemd) → 3. Chọn module quan tâm |
| **Frontend Dev**    | Làm việc với React/Redux  | Đọc module-specific guide (TASK_GUIDE, KPI_GUIDE, etc.)                                                                               |
| **Backend Dev**     | Xây dựng API              | [MODULE_ARCHITECTURE.md](#module_architecturemd) + module API specs                                                                   |
| **Product Manager** | Hiểu features & workflows | [WORKMANAGEMENT_GUIDE.md](#workmanagement_guidemd) + Quick Start sections                                                             |
| **QA/Tester**       | Viết test cases           | Module-specific Testing Guide sections                                                                                                |

---

## 📁 Cấu trúc tài liệu tổng quan

```
QuanLyCongViec/
│
├── 📘 WORKMANAGEMENT_GUIDE.md          ← START HERE (Entry point)
├── 📑 DOCUMENTATION_INDEX.md           ← File này
├── 📐 MODULE_ARCHITECTURE.md           ← Technical deep dive
│
├── 📄 CRUD_TEMPLATE.md                 ← Code generation template
├── 📄 promt_template_v2.md             ← AI agent prompt template
├── 📄 Step-spec.template_v2.md         ← UI/UX spec template
│
└── [8 Module Folders] ─────────────────┐
    ├── CongViec/                       │
    ├── KPI/                            │
    ├── GiaoNhiemVu/                    │ ← See detailed breakdown below
    ├── ChuKyDanhGia/                   │
    ├── Notification/                   │
    ├── Ticket/                         │
    ├── NhiemVuThuongQuy/               │
    └── BaoCaoThongKeKPI/               │
```

---

## 📖 Tài liệu Root Level

### WORKMANAGEMENT_GUIDE.md

**Path:** `QuanLyCongViec/WORKMANAGEMENT_GUIDE.md`  
**Type:** 📘 Overview Document  
**Status:** ✅ Complete  
**Lines:** ~400

**Nội dung:**

- Tổng quan toàn bộ hệ thống (5 sub-modules)
- Quick start navigation table
- User roles & permissions
- Data flow examples
- Links to all module documentation

**Khi nào đọc:** Điểm khởi đầu cho mọi người - đọc đầu tiên!

**Link:** [WORKMANAGEMENT_GUIDE.md](./WORKMANAGEMENT_GUIDE.md)

---

### MODULE_ARCHITECTURE.md

**Path:** `QuanLyCongViec/MODULE_ARCHITECTURE.md`  
**Type:** 📐 Technical Architecture  
**Status:** ✅ Complete  
**Lines:** ~600

**Nội dung:**

- ASCII dependency graph (module relationships)
- Data flow patterns (3 detailed flows)
- **Event System for Notification** (13 event types)
- Integration points between modules
- Business rules (5 critical rules)

**Khi nào đọc:** Sau khi đọc WORKMANAGEMENT_GUIDE, trước khi code

**Link:** [MODULE_ARCHITECTURE.md](./MODULE_ARCHITECTURE.md)

---

### CRUD_TEMPLATE.md

**Path:** `QuanLyCongViec/CRUD_TEMPLATE.md`  
**Type:** 📄 Code Template  
**Status:** ✅ Active  
**Lines:** 734

**Nội dung:**

- Reusable code generation patterns
- MongoDB schema templates
- Backend controller/route examples
- Frontend Redux slice patterns
- Form component templates

**Khi nào đọc:** Khi cần tạo feature CRUD mới

**Link:** [CRUD_TEMPLATE.md](./CRUD_TEMPLATE.md)

---

### promt_template_v2.md

**Path:** `QuanLyCongViec/promt_template_v2.md`  
**Type:** 📄 AI Agent Template  
**Status:** ✅ Active  
**Lines:** 302

**Nội dung:**

- Vietnamese prompt template for AI coding agents
- End-to-end feature implementation guide
- Backend → Redux → Frontend workflow
- Testing checklist

**Khi nào đọc:** Khi dùng AI agent (GitHub Copilot, etc.) để gen code

**Link:** [promt_template_v2.md](./promt_template_v2.md)

---

### Step-spec.template_v2.md

**Path:** `QuanLyCongViec/Step-spec.template_v2.md`  
**Type:** 📄 UI/UX Spec Template  
**Status:** ✅ Active  
**Lines:** 339

**Nội dung:**

- Step-by-step UI design specifications
- Component structure templates
- Interaction flow patterns
- Mock-up guidelines

**Khi nào đọc:** Khi thiết kế UI mới hoặc refactor UX

**Link:** [Step-spec.template_v2.md](./Step-spec.template_v2.md)

---

## 📦 Module Documentation

### 1️⃣ CongViec (Task Management) ⭐ BEST DOCUMENTED

**Path:** `QuanLyCongViec/CongViec/`  
**Status:** ✅ Production Ready  
**Documentation:** 🆕 **V2.0 (November 25, 2025)** - Complete rewrite with code verification

#### 📌 **IMPORTANT UPDATE:**

Old documentation (15 files, ~1,900 lines) has been **archived** to `_archive_docs_2025-11-25/` due to critical inaccuracies (wrong state names, outdated API specs).

**New V2.0 documentation** (7 files, ~3,400 lines) is **100% code-verified** with direct references to actual code files.

---

#### ✅ **NEW V2.0 Main Files (in `docs/` folder):**

| File                     | Type              | Lines | Description                                                             | Status      |
| ------------------------ | ----------------- | ----- | ----------------------------------------------------------------------- | ----------- |
| **README.md**            | 📗 Entry Point    | 600+  | Overview, 5 core features, quick start guides, troubleshooting          | ✅ Complete |
| **ARCHITECTURE.md**      | 📐 Technical Deep | 700+  | Frontend (1705 lines slice), Backend (3317 lines service), data flows   | ✅ Complete |
| **WORKFLOW.md**          | 🔄 State Machine  | 500+  | **FIXED:** 5 correct states (TAO_MOI, DA_GIAO, etc.), 8 actions         | ✅ Complete |
| **API_REFERENCE.md**     | 🔌 Backend API    | 900+  | 28+ endpoints verified from routes file, full request/response examples | ✅ Complete |
| **UI_COMPONENTS.md**     | 🖼️ Frontend UI    | 600+  | 24 React components, Redux slices, dependency graph                     | ✅ Complete |
| **FILE_MANAGEMENT.md**   | 📎 File System    | 400+  | Soft delete pattern, owner-based permissions, upload/delete flows       | ✅ Complete |
| **PERMISSION_MATRIX.md** | 🔒 Security       | 350+  | Field-level permissions, role-based access, code examples               | ✅ Complete |

**Total:** ~4,050 lines of verified documentation

---

#### 🔑 **Key Improvements in V2.0:**

1. **✅ CRITICAL FIX:** State names corrected

   - ❌ Old: MOI_TAO, CHO_PHAN_CONG, DA_PHAN_CONG (9 states - WRONG)
   - ✅ New: TAO_MOI, DA_GIAO, DANG_THUC_HIEN, CHO_DUYET, HOAN_THANH (5 states - CORRECT)

2. **📋 Code References:** Every code example includes file path + line numbers

   - Example: `congViecSlice.js:1275-1300` for `getAvailableActions()`

3. **🔍 Verified Accuracy:** All content derived from actual code files

   - Frontend: congViecSlice.js (1705 lines verified)
   - Backend: congViec.service.js (3317 lines), congViec.controller.js (693 lines)
   - Model: CongViec.js (349 lines)

4. **📊 Complete API Coverage:** 28+ endpoints documented (vs 12 in old docs)

5. **🎨 UI Components Catalog:** All 24 components with props, usage examples

---

#### 📚 **Recommended Reading Order:**

| Step | Document                 | Purpose                                     |
| ---- | ------------------------ | ------------------------------------------- |
| 1    | **README.md**            | Understand 5 core features + quick start    |
| 2    | **WORKFLOW.md**          | Learn state machine (CRITICAL for workflow) |
| 3    | **PERMISSION_MATRIX.md** | Master who can do what                      |
| 4    | **ARCHITECTURE.md**      | Deep dive into technical design             |
| 5    | **API_REFERENCE.md**     | Backend API reference                       |
| 6    | **UI_COMPONENTS.md**     | Frontend component library                  |
| 7    | **FILE_MANAGEMENT.md**   | File upload/delete system                   |

---

#### 🗄️ **Archived Documentation (Reference Only):**

**Path:** `CongViec/_archive_docs_2025-11-25/`  
**Content:** 15 old files (TASK_GUIDE.md, api-spec.md, workflow-status-actions.md, etc.)  
**Status:** ⚠️ DO NOT USE - Contains critical errors  
**Keep for:** Historical reference, migration comparison

---

#### 🎯 **Quick Links:**

- **Entry Point:** [CongViec/docs/README.md](./CongViec/docs/README.md)
- **Workflow Guide:** [CongViec/docs/WORKFLOW.md](./CongViec/docs/WORKFLOW.md)
- **API Reference:** [CongViec/docs/API_REFERENCE.md](./CongViec/docs/API_REFERENCE.md)

**Links:**

- [TASK_GUIDE.md](./CongViec/TASK_GUIDE.md)
- [docs/DOCS_INDEX.md](./CongViec/docs/DOCS_INDEX.md)

---

### 2️⃣ KPI (Performance Evaluation)

**Path:** `QuanLyCongViec/KPI/`  
**Status:** ✅ Production Ready (V2.0 - Completely Rewritten)  
**Documentation:** 7 files (~3,200+ lines - NEW!)

#### 📚 New Documentation Structure (V2.0 - 25/11/2025)

**⚠️ IMPORTANT:** Tài liệu đã được viết lại hoàn toàn dựa trên code thực tế. Tài liệu cũ đã được archive.

| File                            | Type                | Lines | Description                                                      | Status |
| ------------------------------- | ------------------- | ----- | ---------------------------------------------------------------- | ------ |
| **docs/README.md**              | 📘 Entry Point      | 500+  | Overview, features, quick start guide                            | ✅ NEW |
| **docs/ARCHITECTURE.md**        | 🏗️ Technical        | 600+  | Frontend/Backend architecture, models, data flow                 | ✅ NEW |
| **docs/FORMULA_CALCULATION.md** | 📊 Business Logic   | 400+  | **CRITICAL:** Formula V2 with 2 full examples                    | ✅ NEW |
| **docs/WORKFLOW.md**            | 🔄 Business Process | 450+  | 7-stage workflow: Setup → Assign → Self-assess → Score → Approve | ✅ NEW |
| **docs/API_REFERENCE.md**       | 🔌 API Docs         | 800+  | 29 endpoints với params/response chi tiết                        | ✅ NEW |
| **docs/UI_COMPONENTS.md**       | 🎨 Frontend         | 500+  | Pages, components, Redux slices, utils                           | ✅ NEW |
| **docs/MIGRATION_V2.md**        | 🔄 Migration Guide  | 300+  | V1 → V2 breaking changes, migration script                       | ✅ NEW |

**📦 Archived (Old Docs - Potentially Outdated):**

- `_archive_docs_2025-11-25/KPI_GUIDE.md` (465 lines)
- `_archive_docs_2025-11-25/KPI_FORMULA.md` (870 lines)

**Key Topics (V2):**

- **Formula V2:** `(DiemQL × 2 + DiemTuDanhGia) / 3` với IsMucDoHoanThanh
- Cycle-based evaluation workflow
- Dashboard với progress tracking
- Real-time preview (frontend) vs snapshot on approval (backend)
- Audit trail: LichSuDuyet[], LichSuHuyDuyet[]
- 29 API endpoints (CRUD, Scoring, Approval, Dashboard, Reports, Utilities)
- 44 frontend files: kpiSlice (1704 lines), kpiEvaluationSlice (283 lines)
- Backend: kpi.controller.js (3040 lines)

**📖 Reading Order:**

1. **START:** [docs/README.md](./KPI/docs/README.md) - Hiểu tổng quan
2. **CRITICAL:** [docs/FORMULA_CALCULATION.md](./KPI/docs/FORMULA_CALCULATION.md) - Hiểu logic tính điểm
3. **Workflow:** [docs/WORKFLOW.md](./KPI/docs/WORKFLOW.md) - Hiểu 7 giai đoạn
4. **Technical:** [docs/ARCHITECTURE.md](./KPI/docs/ARCHITECTURE.md) - Kiến trúc chi tiết
5. **API:** [docs/API_REFERENCE.md](./KPI/docs/API_REFERENCE.md) - Integrate backend
6. **UI:** [docs/UI_COMPONENTS.md](./KPI/docs/UI_COMPONENTS.md) - Frontend components
7. **Migration:** [docs/MIGRATION_V2.md](./KPI/docs/MIGRATION_V2.md) - Nếu cần migrate từ V1

**🔗 Quick Links:**

- 📂 [KPI/docs/](./KPI/docs/) - New documentation folder
- 🗃️ [KPI/\_archive_docs_2025-11-25/](./KPI/_archive_docs_2025-11-25/) - Old docs (reference only)

---

### 3️⃣ GiaoNhiemVu (Task Assignment)

**Path:** `QuanLyCongViec/GiaoNhiemVu/`  
**Status:** ✅ Production Ready  
**Documentation:** 1 file (326 lines)

#### Main File:

| File                    | Type            | Lines | Description                                           |
| ----------------------- | --------------- | ----- | ----------------------------------------------------- |
| **ASSIGNMENT_GUIDE.md** | 📒 Module Guide | 326   | v2.1 with batch operations, copy, remove all features |

**Key Features:**

- Cycle-based assignments (link to ChuKyDanhGia)
- Permanent assignments (ChuKyDanhGiaID = null)
- Batch assign/update with validation
- Copy from previous cycle
- Protection: Cannot delete if KPI scored

**Links:**

- [ASSIGNMENT_GUIDE.md](./GiaoNhiemVu/ASSIGNMENT_GUIDE.md)

---

### 4️⃣ ChuKyDanhGia (Evaluation Cycles)

**Path:** `QuanLyCongViec/ChuKyDanhGia/`  
**Status:** ✅ Production Ready  
**Documentation:** 1 file (245 lines)

#### Main File:

| File               | Type            | Lines | Description                               |
| ------------------ | --------------- | ----- | ----------------------------------------- |
| **CYCLE_GUIDE.md** | 📓 Module Guide | 245   | Simplified 2-state workflow (Open/Closed) |

**Key Features:**

- Open/Close cycles with `isDong` flag
- Criteria configuration per cycle (TieuChiCauHinh[])
- Delete validation (blocks if has KPI/Assignments)
- Duplicate prevention
- Auto-close on NgayKetThuc (future)

**Links:**

- [CYCLE_GUIDE.md](./ChuKyDanhGia/CYCLE_GUIDE.md)

---

### 5️⃣ Notification (Real-time Notifications) 🚧

**Path:** `QuanLyCongViec/Notification/`  
**Status:** 🚧 In Development (Planning Phase)  
**Documentation:** 1 file (479 lines)

#### Main File:

| File                     | Type           | Lines | Description                                               |
| ------------------------ | -------------- | ----- | --------------------------------------------------------- |
| **NOTIFICATION_SPEC.md** | 📕 Design Spec | 479   | Event-driven architecture, WebSocket integration, roadmap |

**Planned Features:**

- Real-time notifications via Socket.IO
- 13 event types (8 Priority 1, 5 Priority 2)
- Unread badge counter
- Notification center with filters
- User preferences (enable/disable events)
- Browser push notifications

**Implementation Roadmap:** 4 phases (Core → Events → UI/UX → Advanced)

**Links:**

- [NOTIFICATION_SPEC.md](./Notification/NOTIFICATION_SPEC.md)
- [Event specifications in MODULE_ARCHITECTURE.md](./MODULE_ARCHITECTURE.md#-output-events-for-notification-module)

---

### 6️⃣ Ticket (Issue Management) 🚧

**Path:** `QuanLyCongViec/Ticket/`  
**Status:** 🚧 In Development (Planning Phase)  
**Documentation:** 1 file (624 lines)

#### Main File:

| File               | Type           | Lines | Description                                   |
| ------------------ | -------------- | ----- | --------------------------------------------- |
| **TICKET_SPEC.md** | 📔 Design Spec | 624   | SLA tracking, priority queue, workflow design |

**Planned Features:**

- Priority queue (URGENT, HIGH, MEDIUM, LOW)
- SLA tracking (response time, resolution time)
- Workflow: OPEN → IN_PROGRESS → RESOLVED → CLOSED
- Link to CongViec, KPI, NhiemVuThuongQuy
- Auto-escalation on overdue
- Satisfaction rating

**Implementation Roadmap:** 5 phases (CRUD → Workflow → Integration → Dashboard → Polish)

**Links:**

- [TICKET_SPEC.md](./Ticket/TICKET_SPEC.md)

---

### 7️⃣ NhiemVuThuongQuy (Routine Tasks)

**Path:** `QuanLyCongViec/NhiemVuThuongQuy/`  
**Status:** ✅ Production Ready (Master Data)  
**Documentation:** 1 file (382 lines)

#### Main File:

| File                                  | Type                    | Lines | Description                                       |
| ------------------------------------- | ----------------------- | ----- | ------------------------------------------------- |
| **NHIEMVU_THUONGQUY_INSTRUCTIONS.md** | 📄 Implementation Guide | 382   | CRUD specs, schema, backend/frontend requirements |

**Purpose:** Master data for recurring duties (e.g., "Khám bệnh", "Viết báo cáo")

**Links:**

- [NHIEMVU_THUONGQUY_INSTRUCTIONS.md](./NhiemVuThuongQuy/NHIEMVU_THUONGQUY_INSTRUCTIONS.md)

---

### 8️⃣ BaoCaoThongKeKPI (KPI Reports)

**Path:** `QuanLyCongViec/BaoCaoThongKeKPI/`  
**Status:** ✅ Production Ready  
**Documentation:** 1 file (993 lines)

#### Main File:

| File                       | Type                   | Lines | Description                                         |
| -------------------------- | ---------------------- | ----- | --------------------------------------------------- |
| **IMPLEMENTATION_PLAN.md** | 📊 Implementation Plan | 993   | Analytics, visualization, filters, Excel/PDF export |

**Features:**

- Department/employee/cycle filtering
- Chart visualizations (line, bar, pie)
- Excel export with formatting
- PDF reports with charts
- Performance metrics dashboard

**Links:**

- [IMPLEMENTATION_PLAN.md](./BaoCaoThongKeKPI/IMPLEMENTATION_PLAN.md)

---

## 🔍 Tìm kiếm nhanh theo chủ đề

### Nếu bạn cần tìm hiểu về...

| Chủ đề                   | Tài liệu liên quan                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| **API Endpoints**        | [CongViec/docs/api-spec.md](./CongViec/docs/api-spec.md)                                         |
| **Data Models**          | [CongViec/docs/domain-models.md](./CongViec/docs/domain-models.md)                               |
| **State Machine**        | [CongViec/docs/workflow-status-actions.md](./CongViec/docs/workflow-status-actions.md)           |
| **Redux Patterns**       | [CongViec/docs/redux-store-and-flows.md](./CongViec/docs/redux-store-and-flows.md)               |
| **KPI Formulas**         | [KPI/docs/FORMULA_CALCULATION.md](./KPI/docs/FORMULA_CALCULATION.md) ← **Business logic (V2)**   |
| **Event System**         | [MODULE_ARCHITECTURE.md#events](./MODULE_ARCHITECTURE.md#-output-events-for-notification-module) |
| **Module Dependencies**  | [MODULE_ARCHITECTURE.md#dependencies](./MODULE_ARCHITECTURE.md#2-module-dependencies)            |
| **Security/Permissions** | [CongViec/docs/security-permissions.md](./CongViec/docs/security-permissions.md)                 |
| **Code Templates**       | [CRUD_TEMPLATE.md](./CRUD_TEMPLATE.md)                                                           |
| **UI/UX Specs**          | [Step-spec.template_v2.md](./Step-spec.template_v2.md)                                           |

---

## 📊 Thống kê tài liệu

| Metric                      | Value                      |
| --------------------------- | -------------------------- |
| **Total markdown files**    | 31 files                   |
| **Total lines**             | ~7,500+ lines              |
| **Production modules**      | 6/8 (75%)                  |
| **Planning modules**        | 2/8 (25%)                  |
| **Most documented**         | CongViec (16 files)        |
| **Critical business logic** | KPI_FORMULA.md (870 lines) |

---

## 🗺️ Lộ trình đọc đề xuất

### Path 1: Full Stack Developer (New to project)

```
1. WORKMANAGEMENT_GUIDE.md           (30 phút - tổng quan)
2. MODULE_ARCHITECTURE.md            (45 phút - kiến trúc)
3. CongViec/TASK_GUIDE.md            (20 phút - quick ref)
4. CongViec/docs/DOCS_INDEX.md       (5 phút - scan topics)
5. Pick relevant CongViec docs        (1-2 giờ - deep dive)
6. KPI/KPI_GUIDE.md                  (30 phút)
7. KPI/KPI_FORMULA.md                (1 giờ - business logic)
8. Other modules as needed

Total time: ~4-5 hours for comprehensive understanding
```

### Path 2: Frontend Developer (UI focus)

```
1. WORKMANAGEMENT_GUIDE.md           (Quick scan modules)
2. CongViec/TASK_GUIDE.md            (Features overview)
3. CongViec/docs/frontend-components.md  (Component structure)
4. CongViec/docs/redux-store-and-flows.md  (State management)
5. KPI/KPI_GUIDE.md                  (UI components section)

Total time: ~2 hours
```

### Path 3: Backend Developer (API focus)

```
1. MODULE_ARCHITECTURE.md            (Data flow & dependencies)
2. CongViec/docs/api-spec.md         (All endpoints)
3. CongViec/docs/domain-models.md    (Schemas)
4. KPI/KPI_FORMULA.md                (Calculation logic)
5. CRUD_TEMPLATE.md                  (Patterns)

Total time: ~2.5 hours
```

### Path 4: QA/Tester

```
1. WORKMANAGEMENT_GUIDE.md           (User workflows)
2. Module-specific "Testing" sections
3. CongViec/docs/data-lifecycle-sequences.md  (Test scenarios)
4. KPI/KPI_FORMULA.md                (Edge cases)

Total time: ~2 hours
```

---

## 🎯 Quick Reference Card

**Cần gì?** → **Đọc file nào?**

| Tình huống         | Tài liệu                                                                  |
| ------------------ | ------------------------------------------------------------------------- |
| Tôi mới vào dự án  | [WORKMANAGEMENT_GUIDE.md](./WORKMANAGEMENT_GUIDE.md)                      |
| Cần hiểu kiến trúc | [MODULE_ARCHITECTURE.md](./MODULE_ARCHITECTURE.md)                        |
| Build feature mới  | [CRUD_TEMPLATE.md](./CRUD_TEMPLATE.md)                                    |
| Sửa bug CongViec   | [CongViec/docs/DOCS_INDEX.md](./CongViec/docs/DOCS_INDEX.md) → chọn topic |
| Hiểu công thức KPI | [KPI/docs/FORMULA_CALCULATION.md](./KPI/docs/FORMULA_CALCULATION.md)      |
| Setup Notification | [Notification/NOTIFICATION_SPEC.md](./Notification/NOTIFICATION_SPEC.md)  |
| Design UI mới      | [Step-spec.template_v2.md](./Step-spec.template_v2.md)                    |
| Dùng AI agent      | [promt_template_v2.md](./promt_template_v2.md)                            |

---

## 📝 Quy ước đặt tên file

**Sau khi refactor (25/11/2025):**

| Pattern             | Example                              | Purpose                           |
| ------------------- | ------------------------------------ | --------------------------------- |
| `*_GUIDE.md`        | TASK_GUIDE.md, KPI_GUIDE.md          | Module overview & quick reference |
| `*_SPEC.md`         | NOTIFICATION_SPEC.md, TICKET_SPEC.md | Planning docs for future modules  |
| `*_FORMULA.md`      | KPI_FORMULA.md                       | Business logic & calculations     |
| `*_ARCHITECTURE.md` | MODULE_ARCHITECTURE.md               | Technical architecture            |
| `*_INDEX.md`        | DOCS_INDEX.md                        | Table of contents                 |
| `*_TEMPLATE.md`     | CRUD_TEMPLATE.md                     | Reusable code patterns            |
| `*_INSTRUCTIONS.md` | NHIEMVU_THUONGQUY_INSTRUCTIONS.md    | Implementation guides             |

**Old naming (deprecated):** Multiple `README.md` files causing confusion

---

## 🔄 Maintenance

**Last Refactor:** 25/11/2025  
**Reason:** Too many `README.md` files (10 instances) caused navigation confusion

**Changes Made:**

- ✅ Root: README.md → WORKMANAGEMENT_GUIDE.md
- ✅ Root: ARCHITECTURE.md → MODULE_ARCHITECTURE.md
- ✅ CongViec: README.md → TASK_GUIDE.md
- ✅ CongViec/docs: README.md → DOCS_INDEX.md
- ✅ KPI: README.md → KPI_GUIDE.md, FORMULA.md → KPI_FORMULA.md
- ✅ GiaoNhiemVu: README.md → ASSIGNMENT_GUIDE.md
- ✅ ChuKyDanhGia: README.md → CYCLE_GUIDE.md
- ✅ Notification: README.md → NOTIFICATION_SPEC.md
- ✅ Ticket: README.md → TICKET_SPEC.md

**Next Review:** After Notification module completion (Q1 2026)

---

## 🆘 Vẫn không tìm được tài liệu?

1. **Search trong IDE:** Ctrl+Shift+F → tìm keyword
2. **Grep search:** `grep -r "keyword" QuanLyCongViec/**/*.md`
3. **Check archive:** `_archive_legacy_docs_2025-11-25/README_ARCHIVE.md`
4. **Ask team lead:** Nếu tài liệu thiếu hoặc outdated

---

**Maintained by:** Development Team  
**Contact:** dotrungkien6987@gmail.com  
**Last Updated:** 25/11/2025

---

> **💡 Pro Tip:** Bookmark file này! Đây là điểm trung tâm để navigate toàn bộ documentation.
