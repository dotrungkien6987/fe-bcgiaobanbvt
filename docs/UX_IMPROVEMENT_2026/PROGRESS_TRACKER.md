# 📍 Progress Tracker - UX Improvement 2026

> **MỤC ĐÍCH:** File này dùng để track trạng thái thực hiện khi chuyển sang hội thoại mới  
> **CÁCH SỬ DỤNG:** Khi bắt đầu hội thoại mới, đọc file này để biết đang ở đâu và làm gì tiếp theo

**Last Updated:** 08/01/2026 - Planning Phase  
**Current Status:** 📋 Planning Complete, Ready to Start Implementation

---

## 🎯 Overall Status

```
┌─────────────────────────────────────────────────────────────┐
│ PROJECT STATUS: PLANNING COMPLETE ✅                        │
│                                                              │
│ Phase 1: 📋 NOT STARTED    (0/24h)   Next: Setup branch    │
│ Phase 2: ⏸️  BLOCKED        (0/28h)   Depends: Phase 1      │
│ Phase 3: ⏸️  BLOCKED        (0/38h)   Depends: Phase 1      │
│ Phase 4: ⏸️  BLOCKED        (0/10h)   Depends: All phases   │
│                                                              │
│ Total Progress: 0/100 hours (0%)                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start for New Conversation

### Nếu đang ở Phase 1 (Navigation):

```
Tôi đang tiếp tục dự án UX Improvement cho module QuanLyCongViec.
Hiện tại ở Phase 1 - Navigation & Breadcrumb.

[Copy checkpoint từ Phase 1 Progress bên dưới]

Hãy tiếp tục từ checkpoint: [tên checkpoint]
```

### Nếu đang ở Phase 2 (Mobile):

```
Tôi đang tiếp tục dự án UX Improvement cho module QuanLyCongViec.
Hiện tại ở Phase 2 - Mobile Redesign.

[Copy checkpoint từ Phase 2 Progress bên dưới]

Hãy tiếp tục từ checkpoint: [tên checkpoint]
```

### Nếu đang ở Phase 3 (Dashboard):

```
Tôi đang tiếp tục dự án UX Improvement cho module QuanLyCongViec.
Hiện tại ở Phase 3 - Dashboard + CongViec Module Enhancement.

[Copy checkpoint từ Phase 3 Progress bên dưới]

Hãy tiếp tục từ checkpoint: [tên checkpoint]
```

---

## 📊 PHASE 1: Navigation & Breadcrumb (24h)

**Status:** 📋 NOT STARTED  
**Branch:** `ux-improvement/phase-1-navigation`  
**Started:** [Empty]  
**Last Checkpoint:** [Empty]

### Progress Checkpoints

```
PLANNING
├─ [PENDING] P1.1: Review route mapping table (30min)
├─ [PENDING] P1.2: Identify all files to update (1h)
└─ [PENDING] P1.3: Setup feature branch (30min)

ROUTE DEFINITIONS
├─ [PENDING] R1.1: Update routes/index.js - Remove old routes (1h)
└─ [PENDING] R1.2: Add unified prefix routes (1h)

NAVIGATION HELPER
├─ [PENDING] N1.1: Create utils/navigationHelper.js (2h)
└─ [PENDING] N1.2: Add WorkRoutes object with all methods (2h)

BREADCRUMB COMPONENT
├─ [PENDING] B1.1: Create WorkManagementBreadcrumb.js (3h)
└─ [PENDING] B1.2: Test breadcrumb component (1h)

CONGVIEC MODULE UPDATES
├─ [PENDING] C1.1: CongViecByNhanVienPage.js - navigate calls (1h)
├─ [PENDING] C1.2: CongViecTable.js - row click navigation (1h)
├─ [PENDING] C1.3: CongViecDetailDialog.js - breadcrumb links (1h)
├─ [PENDING] C1.4: CongViecFormDialog.js - after-save nav (1h)
└─ [PENDING] C1.5: CongViecTreeDialog.js - tree node links (1h)

TICKET MODULE UPDATES (4h)
├─ [PENDING] T1.1: YeuCauPage.js - base routes (1h)
├─ [PENDING] T1.2: YeuCauToiGuiPage.js - tab navigation (1h)
└─ [PENDING] T1.3: YeuCauXuLyPage.js - tab navigation (2h)

KPI MODULE UPDATES (2h)
├─ [PENDING] K1.1: Update all KPI module navigation (2h)

MENU UPDATES (1h)
├─ [PENDING] M1.1: MainLayout MenuItems (30min)
└─ [PENDING] M1.2: MainLayoutAble MenuItems (30min)

TESTING (3h)
├─ [PENDING] TEST1.1: Manual testing all navigation (1h)
├─ [PENDING] TEST1.2: Browser back/forward testing (1h)
└─ [PENDING] TEST1.3: Update unit tests (1h)

DOCUMENTATION (1h)
└─ [PENDING] DOC1.1: Update README & migration guide (1h)
```

### Resume Instructions

**Nếu đang ở Planning:**

1. Đọc [ROUTE_MAPPING_REFERENCE.md](./ROUTE_MAPPING_REFERENCE.md) để xem tất cả 22 route mappings
2. Đọc [01_PHASE_1_NAVIGATION.md](./01_PHASE_1_NAVIGATION.md) để xem chi tiết implementation
3. Bắt đầu setup branch: `git checkout -b ux-improvement/phase-1-navigation`

**Nếu đang implement:**

- Mở file [CHECKLIST.md](./CHECKLIST.md) để xem task chi tiết
- Check trạng thái các checkpoints ở trên
- Tiếp tục từ checkpoint chưa hoàn thành

---

## 📊 PHASE 2: Mobile Redesign (28h)

**Status:** ⏸️ BLOCKED (Depends on Phase 1)  
**Branch:** `ux-improvement/phase-2-mobile`  
**Started:** [Empty]  
**Last Checkpoint:** [Empty]

### Progress Checkpoints

```
PLANNING
├─ [PENDING] P2.1: Review MUI responsive breakpoints (1h)
└─ [PENDING] P2.2: Sketch mobile layouts (1h)

SHARED COMPONENT
├─ [PENDING] S2.1: Create MobileDetailLayout.js (3h)
└─ [PENDING] S2.2: Create Storybook stories (1h)

CONGVIEC DETAIL REFACTOR (8h)
├─ [PENDING] CV2.1: Extract CongViecInfoSection (2h)
├─ [PENDING] CV2.2: Extract CongViecProgressSection (2h)
├─ [PENDING] CV2.3: Extract CongViecFilesSection (2h)
└─ [PENDING] CV2.4: Integrate MobileDetailLayout (2h)

TICKET DETAIL REFACTOR (6h)
├─ [PENDING] TK2.1: Extract YeuCauInfoSection (2h)
├─ [PENDING] TK2.2: Extract YeuCauResponseSection (2h)
└─ [PENDING] TK2.3: Integrate MobileDetailLayout (2h)

KPI DETAIL REFACTOR (4h)
├─ [PENDING] KPI2.1: Extract sections (2h)
└─ [PENDING] KPI2.2: Integrate MobileDetailLayout (2h)

CYCLE DETAIL (SKIP - Not Priority)
└─ [SKIPPED] CycleAssignmentDetailPage (1,299 lines)

TESTING (4h)
├─ [PENDING] MOB2.1: Test iPhone 12, iPad, Desktop (2h)
├─ [PENDING] MOB2.2: Lighthouse mobile score > 80 (1h)
└─ [PENDING] MOB2.3: Touch gestures testing (1h)

DOCUMENTATION (1h)
└─ [PENDING] DOC2.1: Document mobile patterns (1h)
```

### Resume Instructions

**Nếu Phase 1 đã xong:**

1. Checkout branch: `git checkout -b ux-improvement/phase-2-mobile`
2. Đọc [02_PHASE_2_MOBILE_REDESIGN.md](./02_PHASE_2_MOBILE_REDESIGN.md)
3. Bắt đầu từ MobileDetailLayout component

**Dependencies:**

- Phase 1 MUST complete trước (routes, breadcrumb)
- CongViecByNhanVienPage.js đã có breadcrumb integration

---

## 📊 PHASE 3: Dashboard + CongViec Module (38h)

**Status:** ⏸️ BLOCKED (Depends on Phase 1)  
**Branch:** `ux-improvement/phase-3-dashboard`  
**Started:** [Empty]  
**Last Checkpoint:** [Empty]

### Progress Checkpoints

```
PLANNING
├─ [PENDING] P3.1: Define dashboard metrics (1h)
└─ [PENDING] P3.2: Design nested tabs UX (1h)

BACKEND APIs (10h)
├─ [PENDING] API3.1: GET /dashboard/summary (4h)
│   ├─ [PENDING] Controller implementation
│   ├─ [PENDING] Aggregation queries
│   └─ [PENDING] Add DB indexes
├─ [PENDING] API3.2: GET /congviec/dashboard-summary/:nhanVienId (4h) ⭐
│   ├─ [PENDING] Received stats aggregation ($facet)
│   ├─ [PENDING] Assigned stats aggregation
│   ├─ [PENDING] Progress averages calculation
│   └─ [PENDING] Add composite indexes
└─ [PENDING] API3.3: Testing all APIs (2h)

REDUX STATE (4h)
├─ [PENDING] REDUX3.1: Update congViecSlice.js (2h) ⭐
│   ├─ [PENDING] Add dashboardSummary state
│   ├─ [PENDING] getCongViecDashboard thunk
│   └─ [PENDING] 5-minute cache logic
└─ [PENDING] REDUX3.2: Create/update dashboardSlice.js (2h)

UNIFIED DASHBOARD (4h)
├─ [PENDING] DASH3.1: Create UnifiedDashboardPage.js (2h)
├─ [PENDING] DASH3.2: Create summary cards (1h)
└─ [PENDING] DASH3.3: Create RecentActivityFeed.js (1h)

CONGVIEC MODULE DASHBOARD (8h) ⭐ CRITICAL
├─ [PENDING] CVDASH3.1: Create CongViecDashboardPage.js (4h)
│   ├─ [PENDING] Grid layout (2 columns: Received | Assigned)
│   ├─ [PENDING] 8 StatusCard components
│   ├─ [PENDING] Click → Navigate with URL params
│   └─ [PENDING] Mobile responsive (stacked)
├─ [PENDING] CVDASH3.2: Create StatusCard.js (1h)
├─ [PENDING] CVDASH3.3: Route & menu integration (1h)
└─ [PENDING] CVDASH3.4: Testing dashboard (2h)

CONGVIEC NESTED TABS (10h) ⭐ CRITICAL
├─ [PENDING] CVTAB3.1: Create CongViecNestedTabs.js (4h)
│   ├─ [PENDING] Desktop: 2-level horizontal tabs
│   ├─ [PENDING] Mobile: Segment control + Dropdown
│   └─ [PENDING] Props & state management
├─ [PENDING] CVTAB3.2: Refactor → CongViecListPage.js (4h)
│   ├─ [PENDING] Integrate CongViecNestedTabs
│   ├─ [PENDING] URL params sync (useSearchParams)
│   ├─ [PENDING] Calculate status counts
│   └─ [PENDING] Remove TrangThai from filter panel
├─ [PENDING] CVTAB3.3: Update CongViecFilterPanel.js (1h)
└─ [PENDING] CVTAB3.4: Testing all tab combinations (1h)

INTEGRATION (3h)
├─ [PENDING] INT3.1: Connect routes (1h)
├─ [PENDING] INT3.2: Update menu & breadcrumbs (1h)
└─ [PENDING] INT3.3: End-to-end testing (1h)
```

### Resume Instructions

**Section 1-3 (Unified Dashboard):**

- Đọc [03_PHASE_3_UNIFIED_DASHBOARD.md](./03_PHASE_3_UNIFIED_DASHBOARD.md) lines 1-569
- Bắt đầu với Backend API `/dashboard/summary`

**Section 4 (CongViec Module) - PHI QUAN TRỌNG:**

- Đọc [03_PHASE_3_UNIFIED_DASHBOARD.md](./03_PHASE_3_UNIFIED_DASHBOARD.md) lines 570-1694
- Bắt đầu với Backend API `/congviec/dashboard-summary/:nhanVienId`
- Tạo CongViecDashboardPage trước, sau đó CongViecNestedTabs

**Critical Files:**

- Backend: `modules/workmanagement/controllers/congViec.controller.js`
- Frontend: `src/features/QuanLyCongViec/CongViec/`
  - CongViecDashboardPage.js (NEW)
  - CongViecNestedTabs.js (NEW)
  - CongViecListPage.js (RENAME from CongViecByNhanVienPage.js)
  - congViecSlice.js (UPDATE)

---

## 📊 PHASE 4: Testing & Deploy (10h)

**Status:** ⏸️ BLOCKED (Depends on All Phases)  
**Branch:** `ux-improvement/phase-4-deploy`  
**Started:** [Empty]  
**Last Checkpoint:** [Empty]

### Progress Checkpoints

```
COMPREHENSIVE TESTING (6h)
├─ [PENDING] TEST4.1: 17 test scenarios (4h)
│   ├─ [PENDING] Navigation flows
│   ├─ [PENDING] Breadcrumb accuracy
│   ├─ [PENDING] Dashboard drill-down
│   ├─ [PENDING] Nested tabs functionality
│   ├─ [PENDING] Mobile responsive
│   └─ [PENDING] Performance testing
├─ [PENDING] TEST4.2: Cross-browser testing (1h)
└─ [PENDING] TEST4.3: Regression testing (1h)

DEPLOYMENT (3h)
├─ [PENDING] DEPLOY4.1: Code review & fixes (1h)
├─ [PENDING] DEPLOY4.2: Create deployment checklist (30min)
├─ [PENDING] DEPLOY4.3: Deploy to staging (30min)
├─ [PENDING] DEPLOY4.4: Smoke testing (30min)
└─ [PENDING] DEPLOY4.5: Deploy to production (30min)

DOCUMENTATION (1h)
└─ [PENDING] DOC4.1: Final documentation updates (1h)
```

### Resume Instructions

**Đọc file:** [04_PHASE_4_TESTING_DEPLOY.md](./04_PHASE_4_TESTING_DEPLOY.md)  
**Bắt đầu:** 17 test scenarios từ đầu

---

## 🔄 State Management Guidelines

### Khi bắt đầu hội thoại mới:

1. **Đọc file này** để biết trạng thái hiện tại
2. **Update checkpoint** đã hoàn thành (chuyển [PENDING] → [DONE])
3. **Commit changes** vào PROGRESS_TRACKER.md
4. **Tiếp tục** từ checkpoint tiếp theo

### Khi kết thúc một task:

```markdown
<!-- VD: Hoàn thành NavigationHelper -->

NAVIGATION HELPER
├─ [DONE ✅] N1.1: Create utils/navigationHelper.js (2h)
│ Completed: 08/01/2026 15:30
│ Files: d:\project\webBV\fe-bcgiaobanbvt\src\utils\navigationHelper.js
│ Commit: abc123 - "feat: add WorkRoutes navigation helper"
└─ [IN_PROGRESS 🔄] N1.2: Add WorkRoutes object with all methods (2h)
Started: 08/01/2026 15:45
Next: Add congViecList, kpiDashboard methods
```

### Checkpoint Format:

```
[STATUS] Checkpoint_ID: Description (Time estimate)
  ├─ Status: PENDING | IN_PROGRESS | DONE | SKIPPED
  ├─ Started: [DateTime or Empty]
  ├─ Completed: [DateTime or Empty]
  ├─ Files Modified: [List of files]
  ├─ Commit Hash: [Git commit or Empty]
  ├─ Notes: [Any important notes]
  └─ Next Steps: [What to do next]
```

---

## 📝 Update History

| Date       | Phase    | Checkpoint       | Status  | Notes                  |
| ---------- | -------- | ---------------- | ------- | ---------------------- |
| 08/01/2026 | Planning | All docs created | ✅ DONE | Ready to start Phase 1 |
| -          | -        | -                | -       | -                      |

---

## 🚨 Critical Reminders

### Phase Dependencies (CẤM VI PHẠM):

- Phase 2 và 3 KHÔNG thể bắt đầu trước khi Phase 1 hoàn thành
- Phase 4 cần tất cả phases trước đó hoàn thành

### File Structure:

- **KHÔNG XÓA** các file .md trong docs/UX_IMPROVEMENT_2026/
- **LUÔN UPDATE** PROGRESS_TRACKER.md sau mỗi task
- **LUÔN UPDATE** CHECKLIST.md khi hoàn thành items

### Code Review Checkpoints:

- Sau mỗi 4h implementation → Review code quality
- Sau mỗi module hoàn thành → Update tests
- Trước khi merge → Full regression test

---

**🎯 NEXT ACTION:** Phase 1 - Setup branch & review route mapping
