# 📋 MASTER PLAN - KPI Module Documentation

> **Module**: QuanLyCongViec/KPI (Performance Evaluation System)  
> **Ngày bắt đầu**: 5/1/2026  
> **Status**: Planning Phase

---

## 🎯 MỤC TIÊU

Tạo documentation đầy đủ và trực quan cho module **KPI** - hệ thống đánh giá hiệu suất làm việc với:

- ✅ **Criteria-Based Evaluation** - Đánh giá theo tiêu chí (TieuChiDanhGia)
- ✅ **Cycle Management** - Quản lý chu kỳ đánh giá (ChuKyDanhGia)
- ✅ **Multi-Source Scoring** - Điểm từ manager + self-assessment
- ✅ **Weighted Calculation** - Công thức tính điểm với MucDoKho
- ✅ **Approval Workflow** - CHUA_DUYET → DA_DUYET với audit trail
- ✅ **Batch Operations** - Duyệt hàng loạt nhiều đánh giá
- ✅ **Task Integration** - Dashboard metrics từ CongViec/YeuCau
- ✅ **Routine Duty Management** - NhiemVuThuongQuy assignment
- ✅ **Reports & Export** - PowerPoint/PDF export

---

## 📚 CẤU TRÚC DOCUMENTATION (9 Files)

### **Priority: HIGH** 🔥 ✅ COMPLETE (4/4)

| File                           | Topics                                                        | Pages | Time      | Status |
| ------------------------------ | ------------------------------------------------------------- | ----- | --------- | ------ |
| **00_OVERVIEW.md**             | System architecture, Data models, Core concepts               | 10-12 | 20-25 min | ✅     |
| **01_EVALUATION_CYCLE.md**     | ChuKyDanhGia lifecycle, Cycle states, Period management       | 10-12 | 20-25 min | ✅     |
| **02_CRITERIA_SYSTEM.md**      | TieuChiDanhGia structure, Scoring rubrics, Weight calculation | 12-14 | 25-30 min | ✅     |
| **03_CALCULATION_FORMULAS.md** | DiemNhiemVu formula, TongDiemKPI weighted sum, Edge cases     | 12-14 | 25-30 min | ✅     |

### **Priority: MEDIUM** 📊 ✅ COMPLETE (4/4)

| File                        | Topics                                                               | Pages | Time      | Status |
| --------------------------- | -------------------------------------------------------------------- | ----- | --------- | ------ |
| **04_APPROVAL_WORKFLOW.md** | Status transitions, Audit trail (LichSuDuyet/HuyDuyet), Undo approve | 10-12 | 20-25 min | ✅     |
| **05_TASK_INTEGRATION.md**  | CongViec dashboard, YeuCau metrics, Cross-cycle tasks                | 12-14 | 25-30 min | ✅     |
| **06_SELF_ASSESSMENT.md**   | DiemTuDanhGia flow, Manager override, Conflict resolution            | 18-20 | 35-40 min | ✅     |
| **07_BATCH_OPERATIONS.md**  | Bulk approve, Batch scoring, Performance optimization                | 18-20 | 35-40 min | ✅     |

### **Priority: LOW** 📖 🚧 IN PROGRESS (1/2)

| File                     | Topics                                           | Pages | Time      | Status |
| ------------------------ | ------------------------------------------------ | ----- | --------- | ------ |
| **08_REPORTS_EXPORT.md** | PowerPoint generation, PDF reports, Excel export | 20-22 | 40-45 min | ✅     |
| **09_API_REFERENCE.md**  | Complete API catalog, Request/Response schemas   | 20-22 | Reference | ✅     |

**Total**: ~145-160 pages, ~5 giờ đọc

**Tiến độ**: 9/9 files (100%) 🎉 ALL COMPLETE

---

## 🗂️ KEY FILES MAPPING (Code References)

### Frontend (React + Redux)

```
fe-bcgiaobanbvt/src/features/QuanLyCongViec/KPI/
├── kpiSlice.js                         (~800 lines - V1 Redux logic)
├── kpiEvaluationSlice.js              (~1200 lines - V2 Redux logic)
├── v2/
│   ├── pages/
│   │   ├── DanhGiaKPIDashboard.js     (Main KPI dashboard)
│   │   └── index.js                   (Route exports)
│   └── components/
│       ├── ChamDiemKPITable.js        (~1700 lines - Scoring table)
│       ├── ChamDiemKPIDialog.js       (Evaluation dialog with tabs)
│       ├── NhiemVuAccordion.js        (Routine duty accordion)
│       ├── TieuChiGrid.js             (Criteria grid layout)
│       ├── QuickScoreDialog.js        (Quick scoring popup)
│       ├── CongViecCompactCard.js     (Task metrics card)
│       ├── YeuCauCompactCard.js       (Request metrics card)
│       ├── CrossCycleTasksCompactCard.js
│       ├── KPIHistoryDialog.js        (Approval history viewer)
│       └── dashboard/
│           └── YeuCauDashboard.js     (Request dashboard)
├── components/                         (V1 legacy components)
├── pages/                              (V1 legacy pages)
└── docs/                               (Existing implementation docs)
```

### Backend (Express + MongoDB)

```
giaobanbv-be/modules/workmanagement/
├── models/
│   ├── DanhGiaKPI.js                  (344 lines - Main evaluation)
│   ├── DanhGiaNhiemVuThuongQuy.js     (Duty evaluation sub-doc)
│   ├── ChuKyDanhGia.js                (Evaluation cycle)
│   ├── TieuChiDanhGia.js              (Criteria definition)
│   ├── NhiemVuThuongQuy.js            (Routine duties)
│   ├── NhanVienNhiemVu.js             (Employee-duty assignment)
│   └── QuanLyNhanVien.js              (Employee master)
├── controllers/
│   ├── kpi.controller.js              (KPI CRUD & approval)
│   ├── chuKyDanhGia.controller.js     (Cycle management)
│   └── nhiemVuThuongQuy.controller.js (Duty management)
├── services/
│   ├── kpi.service.js                 (Business logic)
│   ├── kpiCalculation.service.js      (Formula calculations)
│   ├── congviec.service.js            (Dashboard metrics)
│   └── baoCaoKPI.service.js           (Report generation)
├── routes/
│   ├── kpi.api.js                     (KPI endpoints)
│   ├── chuKyDanhGia.api.js           (Cycle endpoints)
│   └── nhiemVuThuongQuy.api.js       (Duty endpoints)
└── helpers/
    ├── kpiCalculation.js              (Shared calculation utils)
    └── kpiNotification.js             (Notification triggers)
```

### Shared Utilities

```
fe-bcgiaobanbvt/src/utils/
└── kpiCalculation.js                   (Frontend calculation mirror)
```

---

## 📅 TIMELINE & MILESTONES

### **Week 1: HIGH Priority Files** (4 files)

**Ngày 1-2** (5-6/1/2026):

- ✅ **00_OVERVIEW.md** - COMPLETED (973 lines)

  - System architecture diagram
  - Data model relationships (5 core models)
  - Evaluation flow overview
  - Status: ✅ Done

- ✅ **01_EVALUATION_CYCLE.md** - COMPLETED (1,100+ lines)
  - Cycle lifecycle & state machine (DANG_MO ↔ DA_DONG)
  - Auto-selection logic (3-tier priority)
  - CRUD operations & validation rules
  - FIXED criteria protection
  - Status: ✅ Done

**Ngày 3-4** (7-8/1/2026):

- ✅ **02_CRITERIA_SYSTEM.md** - COMPLETED (1,200+ lines)

  - TieuChiDanhGia structure & ChiTietDiem
  - FIXED vs User-Defined criteria (IsMucDoHoanThanh)
  - TANG_DIEM/GIAM_DIEM logic with examples
  - MucDoKho weight calculation (1.0-10.0)
  - Customization per employee
  - Status: ✅ Done

- ✅ **03_CALCULATION_FORMULAS.md** - COMPLETED (1,400+ lines)
  - DiemNhiemVu formula: `(DiemQL×2 + DiemTD)/3` vs `DiemQL`
  - TongDiemKPI simple sum (no normalization)
  - 6 edge cases with solutions (negative scores, missing data)
  - 4 real-world examples with step-by-step calculation
  - Frontend/Backend sync pattern
  - Rounding & precision (2 decimals display)
  - Status: ✅ Done

**Milestone 1**: ✅ HIGH priority (4/4 files) completed!

---

### **Week 2: MEDIUM Priority Files** (4 files)

**Ngày 5-6** (9-10/1/2026):

- 📝 **04_APPROVAL_WORKFLOW.md**
- 📝 **05_TASK_INTEGRATION.md**

**Ngày 7-8** (11-12/1/2026):

- 📝 **06_SELF_ASSESSMENT.md**
- 📝 **07_BATCH_OPERATIONS.md**

**Milestone 2**: ✅ All workflows documented

---

### **Week 3: LOW Priority + Polish** (2 files + review)

**Ngày 9-10** (13-14/1/2026):

- 📝 **08_REPORTS_EXPORT.md**
- 📝 **09_API_REFERENCE.md**

**Ngày 11-12** (15-16/1/2026):

- 🔍 Review tất cả files
- 🎨 Polish diagrams, fix typos
- ✅ Update README.md
- 📊 Create summary document

**Ngày 8** (13/1/2026):

- ✅ **09_API_REFERENCE.md** - COMPLETED (3,400+ lines)
  - Complete API catalog (52 endpoints)
  - 12 main sections (Auth, Schemas, Cycle, Evaluation, Approval, Batch, Reports, Stats, Errors)
  - TypeScript schema definitions
  - Request/response examples
  - Error code reference tables
  - Best practices & changelog
  - Status: ✅ Done

**Milestone 3**: ✅ Complete documentation suite - PROJECT 100% COMPLETE 🎉

---

## 🎯 THỨ TỰ ĐỌC CHO CÁC ĐỐI TƯỢNG

### 👶 **Người Mới (Beginner)**

Mục tiêu: Hiểu cơ bản về hệ thống KPI

1. **00_OVERVIEW.md** - Tổng quan
2. **01_EVALUATION_CYCLE.md** - Chu kỳ đánh giá
3. **02_CRITERIA_SYSTEM.md** - Tiêu chí đánh giá
4. **03_CALCULATION_FORMULAS.md** - Công thức tính điểm
5. **09_API_REFERENCE.md** - Tra cứu khi cần

**Thời gian**: ~2 giờ

---

### 👨‍💻 **Developer (Intermediate)**

Mục tiêu: Có thể maintain và fix bugs

1. **00_OVERVIEW.md**
2. **01_EVALUATION_CYCLE.md**
3. **02_CRITERIA_SYSTEM.md**
4. **03_CALCULATION_FORMULAS.md** ⚠️ Critical
5. **04_APPROVAL_WORKFLOW.md** ⚠️ State management
6. **05_TASK_INTEGRATION.md** - Dashboard logic
7. **06_SELF_ASSESSMENT.md**
8. **07_BATCH_OPERATIONS.md** - Performance
9. **08_REPORTS_EXPORT.md**
10. **09_API_REFERENCE.md**

**Thời gian**: ~3.5 giờ

---

### 🏗️ **Architect/Lead Developer**

Mục tiêu: Hiểu toàn bộ hệ thống, có thể refactor

- Đọc tất cả 9 files theo thứ tự **00 → 09**
- Focus đặc biệt vào:
  - Calculation formulas & edge cases
  - Approval workflow & audit trail
  - Task integration architecture
  - Performance optimization strategies

**Thời gian**: ~4 giờ

---

## 🚀 KEY FEATURES TO DOCUMENT

### 1. Core Data Models

**DanhGiaKPI** (Main evaluation):

- Fields: ChuKyDanhGiaID, NhanVienID, NguoiDanhGiaID, TongDiemKPI
- Status: CHUA_DUYET | DA_DUYET
- Audit: LichSuDuyet, LichSuHuyDuyet

**DanhGiaNhiemVuThuongQuy** (Duty evaluation):

- Fields: NhiemVuThuongQuyID, DiemQL, DiemTuDanhGia
- ChiTietDiem array (per-criteria scores)

**ChuKyDanhGia** (Evaluation cycle):

- Period: NgayBatDau, NgayKetThuc
- Status: CHO_MO, DANG_MO, DA_DONG

**TieuChiDanhGia** (Criteria):

- Fixed vs Variable criteria
- TrongSo (weight 0-1)
- ChoPhepTuDanhGia flag

**NhanVienNhiemVu** (Assignment):

- Links NhanVien to NhiemVuThuongQuy
- MucDoKho (difficulty 1-10)
- TieuChiDanhGia array (custom per employee)

---

### 2. Calculation System

**DiemNhiemVu Formula**:

```javascript
// With self-assessment
DiemNhiemVu = (DiemQL × 2 + DiemTuDanhGia) / 3

// Without self-assessment
DiemNhiemVu = DiemQL
```

**TongDiemKPI Formula**:

```javascript
TongDiemKPI = Σ (DiemNhiemVu × MucDoKho) / Σ MucDoKho
```

**Edge cases**:

- Missing criteria
- Zero weights
- Incomplete evaluations

---

### 3. Approval Workflow

**States**:

- CHUA_DUYET: Draft, can edit
- DA_DUYET: Approved, read-only

**Transitions**:

- Approve: `duyet(nhanXet, nguoiDuyetId)` method
- Undo: `huyDuyet(nguoiHuyId, lyDo)` method

**Audit Trail**:

- LichSuDuyet: Approval history
- LichSuHuyDuyet: Undo history with reasons

---

### 4. Task Integration

**Dashboard Endpoints**:

- `/congviec/dashboard-by-nhiemvu` - Metrics per routine duty
- `/congviec/summary-other-tasks` - "Other" tasks
- `/congviec/summary-collab-tasks` - Collaboration tasks
- `/congviec/summary-cross-cycle-tasks` - Carryover tasks

**YeuCau Integration**:

- Similar dashboard structure
- Counts grouped by NhiemVuThuongQuy
- Badge display in KPI table

---

### 5. Batch Operations

**Batch Approve**:

- Select multiple evaluations
- Single transaction
- Notification broadcast

**Validation**:

- All selected must be CHUA_DUYET
- Manager must have permission
- Criteria completeness check

---

### 6. Reports & Export

**PowerPoint Export**:

- Template-based generation
- Charts & tables
- Vietnamese formatting

**PDF Reports**:

- Summary page
- Detail per employee
- Signature blocks

---

## ✅ COMPLETION CRITERIA

Mỗi file documentation phải có:

### **Content Requirements**

- ✅ **Vietnamese language** - Giải thích bằng tiếng Việt
- ✅ **Technical terms in English** - Giữ nguyên thuật ngữ
- ✅ **Mermaid diagrams** - Flowcharts, ER diagrams, sequence diagrams
- ✅ **Tables** - Formula breakdown, field reference
- ✅ **Code references** - File paths, line numbers
- ✅ **Calculation examples** - Step-by-step with real numbers
- ✅ **Edge cases** - Các trường hợp đặc biệt
- ✅ **Best practices** - Hướng dẫn sử dụng

### **Quality Standards**

- ✅ **Accuracy** - Dựa trên code thực tế
- ✅ **Clarity** - Dễ hiểu cho người mới
- ✅ **Completeness** - Cover tất cả aspects
- ✅ **Visual** - Nhiều diagrams, formulas rõ ràng
- ✅ **Practical** - Focus vào business logic

---

## 🔄 WORKFLOW QUA NHIỀU PHIÊN

### **Session Checkpoint Pattern**

Sau mỗi session làm việc:

1. **Commit progress** - Save file ngay
2. **Update MASTER_PLAN** - Mark status (✅/🚧/📝)
3. **Note blockers** - Ghi lại issues
4. **Plan next session** - File tiếp theo

---

## 📝 DEPENDENCIES BETWEEN FILES

| File                    | Depends On | Blocks     |
| ----------------------- | ---------- | ---------- |
| 00_OVERVIEW             | -          | ALL        |
| 01_EVALUATION_CYCLE     | 00         | 04, 05, 07 |
| 02_CRITERIA_SYSTEM      | 00         | 03, 06     |
| 03_CALCULATION_FORMULAS | 00, 02     | 04, 06     |
| 04_APPROVAL_WORKFLOW    | 00, 01, 03 | 07         |
| 05_TASK_INTEGRATION     | 00, 01     | -          |
| 06_SELF_ASSESSMENT      | 00, 02, 03 | -          |
| 07_BATCH_OPERATIONS     | 00, 04     | -          |
| 08_REPORTS_EXPORT       | 00         | -          |
| 09_API_REFERENCE        | ALL        | -          |

**Quy tắc**: Không viết file con trước khi file cha (Dependencies) hoàn thành

---

## 🚀 NEXT STEPS

### **Immediate Actions** (Session 1)

1. ✅ Create MASTER_PLAN.md
2. 📝 Research code for 00_OVERVIEW.md
   - Read DanhGiaKPI.js model
   - Read kpiEvaluationSlice.js
   - Analyze calculation formulas
3. 📝 Write 00_OVERVIEW.md (draft)
4. 🔍 Review & polish 00_OVERVIEW.md

### **Confirmation Needed**

- ❓ Format có ok không? (giống CongViec docs)
- ❓ Bắt đầu với 00_OVERVIEW.md?
- ❓ Có điều chỉnh nào về scope hoặc timeline?

---

## 📝 NOTES & DECISIONS

### **Design Decisions**

- ✅ Chia thành 9 files (không merge) - Dễ maintain
- ✅ Priority-based order - HIGH trước
- ✅ Code references với line numbers - Dễ trace
- ✅ Formula focus - KPI system cần hiểu rõ công thức
- ✅ Visual calculation examples - Numbers thay vì text

### **Risks & Mitigations**

| Risk                             | Impact | Mitigation                              |
| -------------------------------- | ------ | --------------------------------------- |
| Complex formulas hard to explain | High   | Step-by-step examples with real numbers |
| Multiple versions (V1/V2)        | Medium | Focus on V2, note V1 differences        |
| Calculation edge cases           | High   | Dedicated section per file              |
| Time overrun                     | Medium | Flexible timeline, prioritize HIGH      |

---

## 📞 SUPPORT & QUESTIONS

Reference format:

- [CongViec MASTER_PLAN](../CongViec/MASTER_PLAN.md)
- [TAI_LIEU_DINH_KEM_VISUAL_GUIDE](../TapSan/TAI_LIEU_DINH_KEM_VISUAL_GUIDE.md)

---

**Status**: ✅ Milestone 2 Complete | 📝 Starting Milestone 3 (LOW priority)  
**Next Session**: 07_BATCH_OPERATIONS.md (Bulk approve, batch scoring, performance)  
**Last Updated**: 5/1/2026

**Session Notes**:

- ✅ All HIGH priority files (4/4) completed
- ✅ All MEDIUM priority files (4/4) completed
- ✅ 06_SELF_ASSESSMENT.md **COMPLETE** (~2,100 lines)
  - All 12 sections filled with comprehensive content
  - 3 real-world examples with full calculations
  - 6 edge cases documented with solutions
  - 8 troubleshooting issues with debug steps
  - Best practices for employees, managers, and admins
  - Complete self-assessment workflow from start to finish
- 📝 Next: 07_BATCH_OPERATIONS.md (bulk approve, performance optimization)
- 📊 Overall progress: 7/9 files (77.8%)
