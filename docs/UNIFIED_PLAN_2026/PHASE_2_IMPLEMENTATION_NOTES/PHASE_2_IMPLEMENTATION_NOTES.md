# Phase 2 Implementation Notes - Dashboard Architecture Refinement

**Created:** 12/01/2026  
**Status:** ⚠️ Needs Revision Before Implementation  
**Revised Estimate:** 51h (was 49h, originally 40h)  
**Context:** Brain storm session on Bottom Nav + Dashboard strategy  
**Audit Date:** 12/01/2026  
**Audit Score:** 6.5/10 - See Risk Assessment section  
**Latest Update:** 12/01/2026 - Added comprehensive MenuGridPage with 7 sections

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Decisions](#architecture-decisions)
3. [Existing Resources Audit](#existing-resources-audit)
4. [Implementation Order](#implementation-order)
5. [API Strategy](#api-strategy)
6. [Component Structure](#component-structure)
7. [Week-by-Week Plan](#week-by-week-plan)
8. [Testing Strategy](#testing-strategy)
9. [Performance Considerations](#performance-considerations)

---

## 🎯 Executive Summary

### Key Decisions from Brain Storm

**1. Bottom Navigation Structure:**

- ✅ **4-Tab + FAB** (instead of 5-tab)
- Structure: `[🏠 Trang chủ | 📝 Yêu cầu | 📋 Công việc | 🏆 KPI]` + FAB Menu
- Benefits: 25% larger touch targets, follows iOS/Android guidelines
- Menu items moved to Grid Dashboard in FAB

**2. Dashboard Architecture:**

- ✅ **Hybrid API Strategy**: Lite API for Trang chủ, Full APIs for modules
- ✅ **Component Reuse**: Single SummaryCard with `variant` prop
- ✅ **Implementation Order**: Module dashboards FIRST → Trang chủ LAST (reuse)

**3. Trang chủ Strategy:**

- ✅ **Option A**: Unified Dashboard with 3 cards + priority list
- ✅ **Debounced Loading**: 2s delay to avoid wasted API calls
- ✅ **Cache 1 minute**: Prevent redundant queries

**4. Module Dashboards:**

- ✅ **CongViec**: StatusGrid (8 cards) + FAB for tools (Tree, Mind Map)
- ✅ **YeuCau**: Role-based sections (Employee/Manager/Admin)
- ✅ **KPI**: Role-adaptive (Employee vs Manager view)

### Effort Breakdown

```
Original Phase 2:     40h
├─ 2A: Backend APIs:   2h
├─ 2B: Unified:       15h
└─ 2C: CongViec:      23h

Revised Phase 2 (v3): 51h (+11h from original)
├─ 2A: Backend APIs:   5h    (+3h - NEW dashboard APIs)
├─ 2A.5: Path Audit:   1h    (NEW - consistency check)
├─ 2B: Core Comps:     2h    (extracted from 2B)
├─ 2C: CongViec Dash:  8h    (from original 2C)
├─ 2D: YeuCau Dash:    3h    (NEW)
├─ 2E: KPI Dash:       3h    (NEW)
├─ 2F: MyTasks:       12.25h (from original 2C)
├─ 2G: Assigned:       8h    (NEW)
├─ 2H: Archive:        9h    (NEW - marked complete)
├─ 2I: Unified:        2h    (revised, reuse all)
└─ 2J: BottomNav+Menu: 6h    (+2h - MenuGridPage 7 sections)

Critical Additions:
├─ Backend work increased 2.5h → 5h (APIs don't exist)
├─ Path audit 1h (nav consistency issues found)
├─ MenuGridPage complexity 2h → 4h (7 sections with role logic)
└─ Total buffer: +6.75h for integration testing
```

---

## 🔍 RISK ASSESSMENT FINDINGS (Audit 12/01/2026)

### ✅ Verified Resources

**Frontend (Confirmed Existence):**

- ✅ UnifiedDashboardPage.js (369 lines) - **SummaryCard at line 59 as described**
- ✅ dashboardSlice.js (341 lines) - **Currently using MOCK DATA (line 153-189)**
- ✅ MyTasksPage.js, AssignedTasksPage.js - Complete ✅
- ✅ StatusGrid.js, UrgentAlertBanner.js - Reusable components ready
- ✅ MobileBottomNav.js - **Currently 5-TAB** (needs revision)

**Backend (Confirmed Existence):**

- ✅ congViec.api.js - Has received/assigned endpoints
- ✅ yeucau.api.js - Exists (path needs verification)
- ✅ KPI APIs - `dashboard-by-nhiemvu`, `summary-other-tasks` exist
  - ⚠️ **BUT**: These are for KPI evaluation context (need chuKyDanhGiaID)
  - ⚠️ **NOT** suitable for general dashboard use

### ❌ Critical Gaps Found

**Backend (Corrected findings 12/01/2026):**

- ✅ `dashboard.controller.js` - **EXISTS** at `controllers/dashboard.controller.js` (Medical Reporting module)
  - ⚠️ **DO NOT modify** - belongs to different module (training/research dashboards)
  - ⚠️ **Naming conflict** - cannot create file with same name
- ✅ `yeuCau.controller.js::layDashboardMetrics()` - **EXISTS and usable**
- ⚠️ `congViec.controller.js::getDashboardByNhiemVu()` - **EXISTS but KPI context** (requires nhiemVuThuongQuyID + chuKyDanhGiaID)
- ⚠️ `kpi.controller.js::getDashboard()` - **EXISTS but manager context** (requires chuKyId)
- ❌ General dashboard methods (without cycle/nhiemvu dependencies) - **Need to add to existing controllers**

**Frontend (Expected Missing):**

- ❌ CongViecDashboardPage.js, YeuCauDashboardPage.js, KPIDashboardPage.js
- ❌ SummaryCards/ folder with extracted components
- ❌ MenuGridPage.js, FABMenuButton.js

### 🔴 High Risk Issues

#### Issue #1: API Strategy Mismatch (UPDATED 12/01/2026)

**Problem:**

- Plan assumes "lite vs full API" pattern with simple nhanVienId param
- Existing backend APIs are KPI-context specific (require `nhiemVuThuongQuyID`, `chuKyDanhGiaID`)
- Example: `getDashboardByNhiemVu()` is for KPI evaluation, NOT general dashboard
- **NEW:** File `dashboard.controller.js` EXISTS (Medical module) - naming conflict

**Findings:**

- ✅ `yeuCau.controller.js::layDashboardMetrics()` - works without KPI context, can reuse
- ⚠️ `congViec.controller.js::getDashboardByNhiemVu()` - requires KPI params, cannot reuse
- ⚠️ `kpi.controller.js::getDashboard()` - requires chuKyId, cannot reuse for personal view
- ⚠️ Cannot create `dashboard.controller.js` - file exists for medical module

**Impact:**

- Cannot reuse existing KPI-context APIs as plan suggests
- Must ADD methods to existing controllers (not create new file)
- Backend effort remains: 5h (add methods + routes + indexes + testing)

**Resolution:**

- ❌ DO NOT create new `dashboard.controller.js` (naming conflict)
- ✅ ADD methods to existing `modules/workmanagement/controllers/`:
  - `congViec.controller.js`: getCongViecDashboard(), getCongViecSummary()
  - `yeuCau.controller.js`: getYeuCauSummary() (reuse layDashboardMetrics())
  - `kpi.controller.js`: getPersonalDashboard(), getKPISummary()
- ✅ Optional: Create `workmanagement.dashboard.controller.js` for unified endpoint
- ✅ Keep KPI-specific APIs separate (no modification)

#### Issue #2: Path Consistency Unknown

**Problem:**

- MobileBottomNav uses `/cong-viec-cua-toi` (line 47)
- Plan wants to change to `/cong-viec`
- Routes config not verified - MyTasksPage actual path unknown

**Impact:**

- Navigation may break if paths misaligned
- User bookmarks invalidated

**Resolution:**

- ✅ Add Task 2A.5: Path Audit (1h)
- ✅ Document current routes → desired routes migration
- ✅ Update MobileBottomNav + route config synchronously

#### Issue #3: Mock Data Dependency

**Problem:**

- dashboardSlice.js line 153: Uses mock data with TODO comment
- Plan assumes "just uncomment API call"
- Reality: Backend doesn't exist yet

**Impact:**

- Cannot implement frontend until backend is ready
- Must strictly follow backend-first order

**Resolution:**

- ✅ Enforce implementation order: Backend → Core Components → Module Dashboards
- ✅ No parallel work on frontend until backend endpoints tested

### 🟡 Medium Risk Issues

#### Issue #4: Badge Count API Unclear

**Problem:**

- Plan references `badge-counts-page` endpoint for YeuCau
- Endpoint not found in routes/ directory search
- May exist but with different name

**Resolution:**

- 🔍 Verify yeucau.api.js for badge endpoint (add to Task 2A.5)
- 📝 Document actual endpoint name and params

#### Issue #5: MongoDB Indexes Not Detailed

**Problem:**

- Plan mentions adding indexes but no checklist
- Performance targets (< 200ms) depend on this

**Resolution:**

- ✅ Add specific index creation to Task 2A checklist
- ✅ Include in Postman testing verification

### 📊 Implementation Readiness Score: 6.5/10

**Breakdown:**

- ✅ **+3.0** Well-structured plan, clear component patterns
- ✅ **+2.0** Frontend resources (StatusGrid, Pages) exist and reusable
- ✅ **+1.5** Detailed implementation steps with code examples
- ❌ **-1.0** Backend APIs missing (not just "uncomment")
- ❌ **-1.0** Path consistency issues (cong-viec-cua-toi vs cong-viec)
- ⚠️ **-0.5** API strategy assumptions don't match KPI-context reality

**Verdict:** 🟡 **CAN IMPLEMENT with revisions**

- Must create dashboard.controller.js from scratch (not just enable APIs)
- Must audit routes before changing MobileBottomNav paths
- Backend-first order is CRITICAL (no shortcuts)

---

## 🏗️ Architecture Decisions

### 1. Data Layer Strategy: Hybrid Approach

**Problem Identified:**

- Unified Dashboard gọi 1 API → lấy 3 modules summary
- Module Dashboards gọi riêng API → chi tiết hơn
- ⚠️ Có overlap data nếu user vào Trang chủ → Module

**Solution: Lite vs Full APIs**

⚠️ **CRITICAL UPDATE (Audit 12/01/2026):**

- Existing KPI APIs (`dashboard-by-nhiemvu`, `summary-other-tasks`) are **NOT suitable** for general dashboard
- They require `chuKyDanhGiaID` + `nhiemVuThuongQuyID` (KPI evaluation context)
- Must create **NEW dashboard.controller.js** with simplified aggregations
- Effort increased: 2.5h → 5h

```
┌─────────────────────────────────────────┐
│         Trang chủ (Unified)             │
│  API: GET /dashboard/summary-lite       │
│  ⚠️ MUST CREATE - Does NOT exist yet   │
│  Response: ~1KB, 200ms                  │
│  {                                      │
│    congViec: { total: 12, urgent: 5 }, │
│    yeuCau: { sent: 6, needAction: 4 }, │
│    kpi: { score: 85, pending: 3 }      │
│  }                                      │
└─────────────────────────────────────────┘
                  ↓
      User clicks module card
                  ↓
┌─────────────────────────────────────────┐
│      Module Dashboard (Detailed)        │
│  API: GET /congviec/dashboard/:id      │
│  Response: ~3KB, 300ms                  │
│  {                                      │
│    received: {                          │
│      byStatus: { DA_GIAO: 3, ... },    │
│      byDeadline: { overdue: 3, ... },  │
│      recentItems: [...]                 │
│    },                                   │
│    assigned: { ... }                    │
│  }                                      │
└─────────────────────────────────────────┘
```

**Benefits:**

- ✅ No duplicate data (different scopes)
- ✅ Trang chủ ultra-fast (minimal query)
- ✅ Module dashboards have full context
- ✅ Clear separation of concerns

---

### 2. Component Reuse Pattern

**Current State:**

- ❌ SummaryCard embedded in UnifiedDashboardPage.js (line 59)
- ❌ Not reusable across module dashboards

**Refactored Structure:**

```
src/features/QuanLyCongViec/components/SummaryCards/
├─ CongViecSummaryCard.js     (exported)
├─ YeuCauSummaryCard.js       (exported)
├─ KPISummaryCard.js          (exported)
└─ index.js                   (barrel export)

// Usage pattern:
<CongViecSummaryCard
  data={summary}
  variant="compact"    // Trang chủ
  onClick={navigate}
/>

<CongViecSummaryCard
  data={fullData}
  variant="detailed"   // Module dashboard
  showActions={true}
/>
```

**Variant Differences:**

| Variant      | Data Depth     | Actions         | Size           | Use Case         |
| ------------ | -------------- | --------------- | -------------- | ---------------- |
| **compact**  | Counts only    | Navigate button | xs={12} sm={6} | Trang chủ        |
| **detailed** | Full breakdown | Quick actions   | xs={12}        | Module dashboard |

---

### 3. Implementation Order: Modules First!

**Why This Order?**

```
Week 2-3: BUILD MODULE DASHBOARDS
  ├─ CongViecDashboardPage  (8h)
  ├─ YeuCauDashboardPage    (3h)
  └─ KPIDashboardPage       (3h)
         ↓
    Extract common patterns
    Test thoroughly
         ↓
Week 4: REFACTOR TRANG CHỦ
  └─ Reuse battle-tested components
     Minimal new code
     Higher quality
```

**Benefits:**

1. ✅ Module dashboards are **source of truth**
2. ✅ Trang chủ becomes **aggregation view** (low risk)
3. ✅ Test each module independently
4. ✅ No duplicate logic (DRY principle)

---

## 📦 Existing Resources Audit

### ✅ Can Reuse (Already Built)

#### **Frontend Components:**

```javascript
// ✅ Dashboard Infrastructure
src/features/QuanLyCongViec/Dashboard/
├─ UnifiedDashboardPage.js (369 lines)
│  └─ NEEDS: Extract SummaryCard, add debounce
├─ dashboardSlice.js (341 lines)
│  └─ NEEDS: Connect real API (currently mock)

// ✅ CongViec Pages (Complete!)
src/features/QuanLyCongViec/CongViec/
├─ MyTasksPage.js (618 lines) ✅
│  ├─ StatusGrid component
│  ├─ UrgentAlertBanner
│  ├─ RecentCompletedPreview
│  └─ URL params sync
├─ AssignedTasksPage.js (626 lines) ✅
│  ├─ 5 status tabs (manager view)
│  ├─ useAssignedTaskCounts hook
│  └─ Progress tracking
├─ CompletedTasksArchivePage.js ✅
│  ├─ 2 tabs (My/Team)
│  ├─ Stats cards
│  └─ Date range filters

// ✅ Reusable Components
src/features/QuanLyCongViec/CongViec/components/
├─ StatusGrid.js ✅
│  └─ 8-card grid for status breakdown
├─ UrgentAlertBanner.js ✅
│  └─ Deadline warnings
├─ RecentCompletedPreview.js ✅
│  └─ Last 30 days completed tasks
└─ ActiveFilterChips.js ✅
   └─ Display active filters

// ✅ Hooks
src/features/QuanLyCongViec/CongViec/hooks/
├─ useMyTasksUrlParams.js ✅
├─ useTaskCounts.js ✅
├─ useAssignedTasksUrlParams.js ✅
└─ useAssignedTaskCounts.js ✅

// ✅ YeuCau Infrastructure
src/features/QuanLyCongViec/Ticket/
├─ YeuCauPage.js
├─ YeuCauToiGuiPage.js
├─ YeuCauXuLyPage.js
├─ YeuCauDieuPhoiPage.js (manager)
├─ YeuCauQuanLyKhoaPage.js (admin)
└─ yeuCauSlice.js
   └─ getBadgeCounts() - polling 30s ✅

// ✅ KPI Infrastructure
src/features/QuanLyCongViec/KPI/
├─ pages/
│  ├─ TuDanhGiaKPIPage.js (self-assessment)
│  ├─ DanhGiaKPIPage.js (manager evaluation)
│  ├─ XemKPIPage.js (view own)
│  └─ BaoCaoKPIPage.js (admin reports)
└─ kpiSlice.js
   ├─ getNhanVienCoTheGiaoViec() ✅
   └─ getDanhGiaKPIs() ✅
```

#### **Backend APIs:**

```javascript
// ✅ CongViec Endpoints
giaobanbv-be/modules/workmanagement/routes/congViec.api.js
├─ GET /congviec/:nhanvienid/received ✅
├─ GET /congviec/:nhanvienid/assigned ✅
└─ GET /congviec/detail/:id ✅

// ✅ YeuCau Endpoints
routes/yeucau.api.js
├─ GET /yeucau/badge-counts-page?pageKey=... ✅
├─ GET /yeucau (list with filters) ✅
└─ POST /yeucau (create) ✅

// ✅ KPI Endpoints
routes/kpi.api.js
├─ GET /kpi/dashboard/:cycleId ✅
│  └─ Returns: { summary: { totalNhanVien, completed, inProgress } }
├─ GET /kpi/nhanvien/:nhanVienId ✅
└─ GET /kpi/danh-gia/:id ✅

// ✅ Service Layer
services/congViec.service.js
└─ getDashboardByNhiemVu() ✅ (line 3375)
   └─ Used in KPI evaluation context
```

---

### ❌ Need to Create (Missing Components)

#### **Frontend - NEW Components:**

```javascript
// ❌ Module Dashboard Pages
src/features/QuanLyCongViec/Dashboard/
├─ CongViecDashboardPage.js (NEW - 8h)
│  ├─ StatusGrid reuse ✅
│  ├─ Navigate to MyTasksPage/AssignedTasksPage
│  └─ FAB menu for tools (Tree, Mind Map)
│
├─ YeuCauDashboardPage.js (NEW - 3h)
│  ├─ Role-based sections (conditional)
│  ├─ Priority list for "Cần xử lý"
│  └─ Navigate to YeuCau pages
│
└─ KPIDashboardPage.js (NEW - 3h)
   ├─ Personal KPI summary (employee)
   ├─ Team management (manager)
   └─ Navigate to evaluation pages

// ❌ Extracted Components
src/features/QuanLyCongViec/components/SummaryCards/
├─ CongViecSummaryCard.js (NEW - extract from UnifiedDashboard)
├─ YeuCauSummaryCard.js (NEW - extract from UnifiedDashboard)
├─ KPISummaryCard.js (NEW - extract from UnifiedDashboard)
└─ index.js (barrel export)

// ❌ Menu Components
src/features/QuanLyCongViec/Menu/
├─ MenuGridPage.js (NEW - 2h)
│  └─ Grid dashboard with grouped items
└─ FABMenuButton.js (NEW - 1h)
   └─ Floating action button with badge

// ❌ Bottom Nav Revision
src/components/MobileBottomNav.js
└─ REVISE: 5-tab → 4-tab + FAB integration
```

#### **Backend - NEW Endpoints:**

```javascript
// ❌ Dashboard Lite API (NEW)
giaobanbv-be/modules/workmanagement/controllers/dashboard.controller.js
exports.getSummaryLite = async (req, res) => {
  // Minimal aggregation (counts only)
  const [congViecCounts, yeuCauCounts, kpiSummary] = await Promise.all([
    CongViec.aggregate([
      { $match: { NguoiNhanID: nhanVienId } },
      { $group: { _id: "$TrangThai", count: { $sum: 1 } } }
    ]),
    // YeuCau aggregation...
    // KPI aggregation...
  ]);

  return sendResponse(res, 200, true, {
    congViec: { total: ..., urgent: ... },
    yeuCau: { sent: ..., needAction: ... },
    kpi: { score: ..., pending: ... }
  });
};

/**
 * ❌ CongViec Dashboard API (NEW)
 * FILE: modules/workmanagement/controllers/congViec.controller.js
 * Add alongside existing getDashboardByNhiemVu() method
 */
controller.getCongViecDashboard = catchAsync(async (req, res) => {
  const { nhanVienId } = req.params;

  const [received, assigned] = await Promise.all([
    CongViec.aggregate([
      { $match: { NguoiNhanID: nhanVienId, TrangThai: { $ne: "HOAN_THANH" } } },
      {
        $group: {
          _id: "$TrangThai",
          count: { $sum: 1 },
          overdueCount: {
            $sum: {
              $cond: [
                { $lt: ["$NgayHetHan", new Date()] },
                1,
                0
              ]
            }
          }
        }
      }
    ]),
    // Assigned tasks aggregation...
  ]);

  return sendResponse(res, 200, true, { received, assigned });
};

// ⚠️ YeuCau Dashboard - OPTIONAL (reuse existing badge API)
// Can aggregate badge counts from multiple pageKeys

// ⚠️ KPI Dashboard - OPTIONAL (reuse existing)
// /kpi/dashboard/:cycleId already returns summary
```

---

## 📅 Implementation Order

### Week 1: Foundation (6h - REVISED)

**2A. Backend Dashboard APIs** (5h - INCREASED)

⚠️ **CRITICAL FINDINGS (12/01/2026):**

**Existing Files Discovery:**

- ✅ `controllers/dashboard.controller.js` EXISTS (Medical Reporting module - training/research dashboards)
- ✅ `yeuCau.controller.js` has `layDashboardMetrics()` - CAN REUSE ✅
- ⚠️ `congViec.controller.js` has `getDashboardByNhiemVu()` - KPI context, CANNOT reuse
- ⚠️ `kpi.controller.js` has `getDashboard()` - Manager context with chuKyId, CANNOT reuse

**Naming Convention Decision:**

- ❌ DO NOT create new `dashboard.controller.js` (conflicts with medical module)
- ✅ ADD methods to existing controllers: `congViec.controller.js`, `yeuCau.controller.js`, `kpi.controller.js`

```javascript
// Priority order (SEQUENTIAL):

1. CongViec Dashboard Methods (2h)
   File: modules/workmanagement/controllers/congViec.controller.js

   // Keep existing (KPI context)
   ✅ getDashboardByNhiemVu() - requires nhiemVuThuongQuyID, chuKyDanhGiaID

   // Add new (general context)
   🆕 getCongViecDashboard() - detailed stats by status + deadline
   🆕 getCongViecSummary() - lite counts for Trang chủ

   └─ Routes: /congviec/dashboard/:nhanVienId, /congviec/summary/:nhanVienId

2. YeuCau Dashboard Methods (1h)
   File: modules/workmanagement/controllers/yeuCau.controller.js

   ✅ layDashboardMetrics() - EXISTING, CAN REUSE
   🆕 getYeuCauSummary() - lite counts for Trang chủ

   └─ Routes: /yeucau/dashboard/metrics ✅, /yeucau/summary/:nhanVienId 🆕

3. KPI Dashboard Methods (1.5h)
   File: modules/workmanagement/controllers/kpi.controller.js

   ✅ getDashboard() - EXISTING (manager view with chuKyId)
   🆕 getPersonalDashboard() - personal view, auto-detect latest cycle
   🆕 getKPISummary() - lite score for Trang chủ

   └─ Routes: /kpi/dashboard/:chuKyId ✅, /kpi/personal-dashboard 🆕, /kpi/summary/:nhanVienId 🆕

4. Unified Summary Endpoint (0.5h) - OPTIONAL
   File: modules/workmanagement/controllers/workmanagement.dashboard.controller.js (NEW)
   OR add to existing controller

   🆕 getSummaryAll() - aggregates all 3 modules for Trang chủ

   └─ Route: /workmanagement/dashboard/summary

5. MongoDB Indexes (0.5h)
   └─ CongViec.index({ NguoiNhanID: 1, TrangThai: 1 })
   └─ CongViec.index({ NguoiGiaoID: 1, TrangThai: 1 })
   └─ CongViec.index({ NgayHetHan: 1 })
   └─ DanhGiaKPI.index({ NhanVienID: 1, ChuKyDanhGiaID: 1 })

6. Testing (0.5h)
   └─ Test with Postman
   └─ Verify response time < 300ms
   └─ Check aggregation correctness
```

**2A.5 Path Consistency Audit** (1h - NEW)

```javascript
// Critical check before MobileBottomNav changes
1. Audit current routes config (0.5h)
   └─ Check MyTasksPage actual route
   └─ Check AssignedTasksPage actual route
   └─ Document all /cong-viec* paths

2. Plan migration strategy (0.5h)
   └─ /cong-viec-cua-toi → /cong-viec ?
   └─ Add route redirects if needed
   └─ Update MobileBottomNav.js synchronously
   └─ Document breaking changes
```

**Testing:**

- [ ] Postman test all 2 new endpoints
- [ ] Verify aggregation logic with sample data
- [ ] Check response time < 500ms

---

### Week 1-2: Core Components (2h)

**2B. Extract & Enhance SummaryCard Components** (2h)

```javascript
// Task 2B.1: Extract CongViecSummaryCard (40 min)
src/features/QuanLyCongViec/components/SummaryCards/CongViecSummaryCard.js

Props:
- data: { total, urgent, byStatus, byDeadline }
- variant: "compact" | "detailed"
- onClick: () => navigate(...)
- showActions: boolean (default false)

Variants:
- compact: 3-4 metrics, "Xem chi tiết →" button
- detailed: StatusGrid (8 cards), quick actions

// Task 2B.2: Extract YeuCauSummaryCard (40 min)
YeuCauSummaryCard.js
- Similar pattern
- Role-based data (sent, received, coordinating)

// Task 2B.3: Extract KPISummaryCard (40 min)
KPISummaryCard.js
- Personal score + pending count
- Manager: team summary (if applicable)
```

**Testing:**

- [ ] Storybook stories for 3 components
- [ ] Test compact variant (mobile)
- [ ] Test detailed variant (desktop)
- [ ] Test onClick navigation

---

### Week 2: Module Dashboards (14h)

**2C. CongViecDashboardPage** (8h)

```javascript
// File: src/features/QuanLyCongViec/Dashboard/CongViecDashboardPage.js

Layout:
┌─────────────────────────────────────────┐
│ 📋 Công việc              [+ Tạo mới]   │
├─────────────────────────────────────────┤
│ 📥 VIỆC TÔI NHẬN (12)        [Xem →]   │ ← Navigate MyTasksPage
│ [StatusGrid - 8 cards: Chờ nhận, ...] │
│                                         │
│ 📤 VIỆC TÔI GIAO (5)         [Xem →]   │ ← Navigate AssignedTasksPage
│ [StatusGrid - 8 cards: Chưa giao, ...] │
│                                         │
│ 🗂️ LỊCH SỬ & BÁO CÁO                   │
│ [Lịch sử hoàn thành] [Xem tất cả →]   │
│                                         │
│ 🛠️ CÔNG CỤ & XEM KHÁC                  │
│ [FAB Menu with: Tree, Mind Map, ...]   │ ← Opens drawer
└─────────────────────────────────────────┘

Features:
- Reuse StatusGrid component (2 instances)
- Click card → navigate to filtered list
- FAB menu for advanced tools
- Responsive: xs={12}, sm={6} for cards
```

**Subtasks:**

- [ ] Create page component (2h)
- [ ] Integrate Redux: getCongViecDashboard() (1h)
- [ ] Add StatusGrid for received (1h)
- [ ] Add StatusGrid for assigned (1h)
- [ ] FAB menu drawer (2h)
- [ ] Navigation integration (0.5h)
- [ ] Mobile testing (0.5h)

---

**2D. YeuCauDashboardPage** (3h)

```javascript
// File: src/features/QuanLyCongViec/Dashboard/YeuCauDashboardPage.js

Layout:
┌─────────────────────────────────────────┐
│ 📝 Yêu cầu                  [+ Tạo mới] │
├─────────────────────────────────────────┤
│ 📤 YÊU CẦU TÔI GỬI (6)      [Xem →]    │
│ [3 cards: Mới, Đang xử lý, Hoàn thành] │
│                                         │
│ 📥 CẦN XỬ LÝ (4) ⚠️         [Xem →]    │
│ [Priority list - 3 urgent items]       │
│                                         │
│ 👥 ĐIỀU PHỐI (2) [Manager]  [Xem →]    │ ← Conditional
│ [2 cards: Chờ phân, Đang xử lý]        │
│                                         │
│ 📋 QUẢN LÝ KHOA (8) [Admin] [Xem →]    │ ← Conditional
│ [Summary: 3 yêu cầu chờ phê duyệt]     │
└─────────────────────────────────────────┘

Features:
- Role-based sections (PhanQuyen check)
- Priority list for overdue items
- Navigate to YeuCau pages with filters
```

**Subtasks:**

- [ ] Create page component (1h)
- [ ] Role-based rendering (0.5h)
- [ ] Priority list component (0.5h)
- [ ] Integration with yeuCauSlice (0.5h)
- [ ] Testing (0.5h)

---

**2E. KPIDashboardPage** (3h)

```javascript
// File: src/features/QuanLyCongViec/Dashboard/KPIDashboardPage.js

Layout (Employee):
┌─────────────────────────────────────────┐
│ 🏆 Đánh giá KPI             [Lịch sử▼] │
├─────────────────────────────────────────┤
│ 🎯 CHU KỲ: Tháng 01/2026      [Đổi]   │
│                                         │
│ 📊 TIẾN ĐỘ CỦA TÔI                     │
│ Điểm hiện tại: 85/100                  │
│ ━━━━━━━━━━━━━░░░░ 85%                │
│                                         │
│ ✅ Đã duyệt: 8/12 nhiệm vụ             │
│ ⏳ Chưa đánh giá: 3 nhiệm vụ           │
│                                         │
│ [📝 Tự đánh giá ngay →]                │
│                                         │
│ 📋 CHI TIẾT NHIỆM VỤ                    │
│ [List: NVTQ-01, NVTQ-05, ...]          │
└─────────────────────────────────────────┘

Layout (Manager) - Additional Section:
│ 👥 NHÓM TÔI QUẢN LÝ (5 người) [Xem →]  │
│ [3 cards: Hoàn thành, Đang ĐG, Chưa]   │

Features:
- Cycle selector dropdown
- Big number display (score)
- Role-adaptive (employee vs manager)
- Navigate to evaluation pages
```

**Subtasks:**

- [ ] Create page component (1h)
- [ ] Cycle selector integration (0.5h)
- [ ] Role-adaptive rendering (0.5h)
- [ ] Integration with kpiSlice (0.5h)
- [ ] Testing (0.5h)

---

### Week 3: List Pages (29.25h)

**Note:** These are already completed in previous tasks, just listed for completeness.

- ✅ **2F. MyTasksPage refactor** (12.25h) - DONE
- ✅ **2G. AssignedTasksPage** (8h) - DONE
- ✅ **2H. CompletedTasksArchivePage** (9h) - DONE

---

### Week 4: Unified Dashboard (2h)

**2I. Refactor UnifiedDashboardPage** (2h)

```javascript
// File: src/features/QuanLyCongViec/Dashboard/UnifiedDashboardPage.js
// REFACTOR: Use extracted SummaryCard components

Changes:
1. Remove embedded SummaryCard definition (line 59+)
2. Import from components/SummaryCards
3. Add debounced loading (2s delay)
4. Add priority list (aggregate from modules)

const UnifiedDashboardPage = () => {
  const [shouldLoad, setShouldLoad] = useState(false);

  // Debounce: Only load if user stays > 2s
  useEffect(() => {
    const timer = setTimeout(() => setShouldLoad(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (shouldLoad && (!summary || isStale(summary))) {
      dispatch(getDashboardSummaryLite());
    }
  }, [shouldLoad]);

  return (
    <Stack spacing={2}>
      <CongViecSummaryCard
        data={summary?.congViec}
        variant="compact"
        onClick={() => navigate('/quanlycongviec/cong-viec')}
      />
      <YeuCauSummaryCard
        data={summary?.yeuCau}
        variant="compact"
        onClick={() => navigate('/quanlycongviec/yeucau')}
      />
      <KPISummaryCard
        data={summary?.kpi}
        variant="compact"
        onClick={() => navigate('/quanlycongviec/kpi')}
      />

      {/* Priority list - unique to Trang chủ */}
      <PriorityTasksList limit={5} />
    </Stack>
  );
};
```

**Subtasks:**

- [ ] Refactor to use extracted components (0.5h)
- [ ] Add debounced loading (0.5h)
- [ ] Add priority list component (0.5h)
- [ ] Update dashboardSlice: connect real API (0.5h)

---

### Week 5: Bottom Nav + Menu (6h - REVISED)

**Phase 1 Revision: 4-Tab + FAB**

```javascript
// File: src/components/MobileBottomNav.js
// REVISE: 5-tab → 4-tab

const NAV_ITEMS = [
  {
    label: "Trang chủ",
    path: "/quanlycongviec",
    icon: Home,
    exactMatch: true,
  },
  {
    label: "Yêu cầu",
    path: "/quanlycongviec/yeucau",
    icon: MessageQuestion,
    badge: "yeuCauCount",
  },
  {
    label: "Công việc",
    path: "/quanlycongviec/cong-viec", // ✅ FIX: was /cong-viec-cua-toi
    icon: Task,
    badge: "congViecCount", // NEW
  },
  {
    label: "KPI",
    path: "/quanlycongviec/kpi",
    icon: MedalStar,
    badge: "kpiCount", // NEW
  },
];

// FAB Menu (separate component)
<FABMenuButton
  badge={notificationCount}
  onClick={() => navigate("/quanlycongviec/menu")}
/>;
```

**Subtasks:**

- [ ] Update NAV_ITEMS to 4-tab (0.5h)
- [ ] Add badge logic for congViecCount, kpiCount (0.5h)
- [ ] Create FABMenuButton component (1h)
- [ ] Create MenuGridPage **with 7 sections** (4h - INCREASED)
  - [ ] Implement section expand/collapse logic
  - [ ] Add role-based filtering (admin, daotao, manager)
  - [ ] Integrate with all 8 menu modules
  - [ ] Add search functionality
  - [ ] Add quick access section (4 most-used items)
  - [ ] Test on mobile/tablet/desktop

**MenuGridPage Layout (Comprehensive):**

```
┌─────────────────────────────────────────┐
│ 🔍 [Tìm kiếm...]        [Profile▼]      │
├─────────────────────────────────────────┤
│ 🔥 NHANH CHÓNG                          │
│ [Dashboard] [CV nhận] [Yêu cầu] [KPI]  │
│                                         │
│ ⭐ CÔNG VIỆC & KPI ▼ (9 items)         │
│ 🏥 BÁO CÁO Y TẾ ▶ (6 items)            │
│ 📚 ĐÀO TẠO ▶ (5 items, role: daotao)   │
│ 🔬 NGHIÊN CỨU ▶ (4 items)              │
│ 📅 LỊCH TRỰC ▶ (2 items)                │
│ 🔔 THÔNG BÁO (3 items, always visible) │
│ ⚙️ QUẢN TRỊ ▶ (Admin only)             │
│                                         │
│ [🚪 Đăng xuất]                          │
└─────────────────────────────────────────┘
```

**Key Features:**

- ✅ 7 collapsible sections
- ✅ Role-based visibility (admin, daotao, manager)
- ✅ Search across all menu items
- ✅ Quick access shortcuts
- ✅ ~400 lines of code (was 200)

---

## 🔌 API Strategy

### Backend Endpoint Specifications

#### **1. Dashboard Lite API** (NEW)

⚠️ **IMPLEMENTATION NOTE (UPDATED 12/01/2026):**

- File `dashboard.controller.js` EXISTS at `controllers/dashboard.controller.js` (Medical Reporting module)
- Do NOT create new file with same name - use existing controllers in `modules/workmanagement/controllers/`
- Existing dashboard methods:
  - ✅ `yeuCau.controller.js::layDashboardMetrics()` - can reuse
  - ⚠️ `congViec.controller.js::getDashboardByNhiemVu()` - KPI context, requires nhiemVuThuongQuyID + chuKyDanhGiaID
  - ⚠️ `kpi.controller.js::getDashboard()` - Manager context, requires chuKyId param
- Must add NEW methods to existing controllers WITHOUT cycle/nhiemvu dependencies

```javascript
/**
 * @route   GET /api/workmanagement/dashboard/summary
 * @desc    Get lightweight summary for Trang chủ (GENERAL dashboard, not KPI-specific)
 * @access  Private
 * @query   nhanVienId (optional, defaults to req.user.NhanVienID)
 *
 * FILE: modules/workmanagement/controllers/[NEW OR EXISTING].controller.js
 * OPTIONS:
 *   A) Add to new file: workmanagement.dashboard.controller.js
 *   B) Add to existing: congViec.controller.js as getSummaryAll()
 */
exports.getSummaryAll = catchAsync(async (req, res) => {
  const nhanVienId = req.query.nhanVienId || req.user?.NhanVienID;

  if (!nhanVienId) {
    throw new AppError(400, "NhanVienID required", "MISSING_NHANVIEN_ID");
  }

  // Parallel aggregation for performance
  const [congViecData, yeuCauData, kpiData] = await Promise.all([
    // CongViec aggregation
    CongViec.aggregate([
      {
        $match: {
          NguoiNhanID: mongoose.Types.ObjectId(nhanVienId),
          TrangThai: { $ne: "HOAN_THANH" }
        }
      },
      {
        $facet: {
          total: [{ $count: "count" }],
          urgent: [
            {
              $match: {
                $or: [
                  { NgayHetHan: { $lt: new Date() } }, // Overdue
                  { MucDoUuTien: "cao" }
                ]
              }
            },
            { $count: "count" }
          ]
        }
      }
    ]),

    // YeuCau aggregation (reuse badge logic)
    YeuCau.aggregate([
      {
        $match: {
          $or: [
            { NguoiGuiID: req.userId },
            { KhoaNhanID: req.user.KhoaID }
          ]
        }
      },
      {
        $facet: {
          sent: [
            { $match: { NguoiGuiID: req.userId } },
            { $count: "count" }
          ],
          needAction: [
            {
              $match: {
                KhoaNhanID: req.user.KhoaID,
                TrangThai: { $in: ["MOI", "DANG_XU_LY"] }
              }
            },
            { $count: "count" }
          ]
        }
      }
    ]),

    // KPI aggregation
    DanhGiaKPI.aggregate([
      {
        $match: {
          NhanVienID: mongoose.Types.ObjectId(nhanVienId),
          ChuKyID: await getCurrentCycleId() // Helper function
        }
      },
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$TongDiemKPI" },
          pending: {
            $sum: {
              $cond: [{ $eq: ["$TrangThai", "CHUA_DUYET"] }, 1, 0]
            }
          }
        }
      }
    ])
  ]);

  return sendResponse(res, 200, true, {
    congViec: {
      total: congViecData[0]?.total[0]?.count || 0,
      urgent: congViecData[0]?.urgent[0]?.count || 0
    },
    yeuCau: {
      sent: yeuCauData[0]?.sent[0]?.count || 0,
      needAction: yeuCauData[0]?.needAction[0]?.count || 0
    },
    kpi: {
      score: Math.round(kpiData[0]?.avgScore || 0),
      pending: kpiData[0]?.pending || 0
    }
  });
});

// Response example:
{
  "success": true,
  "data": {
    "congViec": { "total": 12, "urgent": 5 },
    "yeuCau": { "sent": 6, "needAction": 4 },
    "kpi": { "score": 85, "pending": 3 }
  }
}

// Performance target: < 200ms
```

---

#### **2. CongViec Dashboard API** (NEW)

```javascript
/**
 * @route   GET /api/workmanagement/congviec/dashboard/:nhanVienId
 * @desc    Get detailed CongViec dashboard for module page
 * @access  Private
 */
exports.getCongViecDashboard = catchAsync(async (req, res) => {
  const { nhanVienId } = req.params;

  const [received, assigned] = await Promise.all([
    // Received tasks breakdown
    CongViec.aggregate([
      {
        $match: {
          NguoiNhanID: mongoose.Types.ObjectId(nhanVienId),
          TrangThai: { $ne: "HOAN_THANH" }
        }
      },
      {
        $facet: {
          byStatus: [
            {
              $group: {
                _id: "$TrangThai",
                count: { $sum: 1 }
              }
            }
          ],
          byDeadline: [
            {
              $bucket: {
                groupBy: "$NgayHetHan",
                boundaries: [
                  new Date(0), // Past
                  new Date(), // Now
                  addDays(new Date(), 3), // 3 days
                  addDays(new Date(), 7), // 7 days
                  new Date("2099-12-31") // Future
                ],
                default: "none",
                output: {
                  count: { $sum: 1 }
                }
              }
            }
          ],
          total: [{ $count: "count" }]
        }
      }
    ]),

    // Assigned tasks breakdown
    CongViec.aggregate([
      {
        $match: {
          NguoiGiaoID: mongoose.Types.ObjectId(nhanVienId),
          TrangThai: { $ne: "HOAN_THANH" }
        }
      },
      {
        $facet: {
          byStatus: [
            {
              $group: {
                _id: "$TrangThai",
                count: { $sum: 1 }
              }
            }
          ],
          total: [{ $count: "count" }]
        }
      }
    ])
  ]);

  return sendResponse(res, 200, true, {
    received: {
      total: received[0]?.total[0]?.count || 0,
      byStatus: received[0]?.byStatus || [],
      byDeadline: received[0]?.byDeadline || []
    },
    assigned: {
      total: assigned[0]?.total[0]?.count || 0,
      byStatus: assigned[0]?.byStatus || []
    }
  });
});

// Response example:
{
  "success": true,
  "data": {
    "received": {
      "total": 12,
      "byStatus": [
        { "_id": "DA_GIAO", "count": 3 },
        { "_id": "DANG_THUC_HIEN", "count": 7 },
        { "_id": "CHO_DUYET", "count": 2 }
      ],
      "byDeadline": [
        { "_id": 0, "count": 3 }, // Overdue
        { "_id": 1, "count": 5 }, // 0-3 days
        { "_id": 2, "count": 2 }, // 3-7 days
        { "_id": 3, "count": 2 }  // > 7 days
      ]
    },
    "assigned": {
      "total": 5,
      "byStatus": [
        { "_id": "DA_GIAO", "count": 2 },
        { "_id": "DANG_THUC_HIEN", "count": 3 }
      ]
    }
  }
}
```

---

#### **3. YeuCau Dashboard** (REUSE EXISTING)

```javascript
// ✅ REUSE: /api/workmanagement/yeucau/badge-counts-page
// Already returns counts for multiple page keys

// Frontend aggregation:
const yeuCauSummary = {
  sent: badgeCounts["YEU_CAU_TOI_GUI"]?.total || 0,
  needAction: badgeCounts["YEU_CAU_TOI_XU_LY"]?.total || 0,
  coordinating: badgeCounts["YEU_CAU_DIEU_PHOI"]?.total || 0,
  management: badgeCounts["YEU_CAU_QUAN_LY_KHOA"]?.total || 0,
};

// No new backend API needed ✅
```

---

#### **4. KPI Dashboard** (REUSE EXISTING)

```javascript
// ✅ REUSE: /api/workmanagement/kpi/dashboard/:cycleId
// Already returns:
{
  "summary": {
    "totalNhanVien": 10,
    "completed": 3,
    "inProgress": 5,
    "notStarted": 2
  },
  "nhanVienList": [ ... ]
}

// For personal view:
// ✅ REUSE: /api/workmanagement/kpi/nhanvien/:nhanVienId
{
  "danhGiaKPIs": [ ... ],
  "summary": {
    "avgScore": 85,
    "pending": 3
  }
}

// No new backend API needed ✅
```

---

## 🧪 Testing Strategy

### Unit Tests (Per Component)

```javascript
// SummaryCard Components
describe("CongViecSummaryCard", () => {
  it("renders compact variant with minimal data", () => {
    const data = { total: 12, urgent: 5 };
    render(<CongViecSummaryCard data={data} variant="compact" />);
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders detailed variant with StatusGrid", () => {
    const data = {
      byStatus: [
        { _id: "DA_GIAO", count: 3 },
        { _id: "DANG_THUC_HIEN", count: 7 },
      ],
    };
    render(<CongViecSummaryCard data={data} variant="detailed" />);
    expect(screen.getByText("Chờ nhận")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = jest.fn();
    render(<CongViecSummaryCard data={{}} onClick={handleClick} />);
    fireEvent.click(screen.getByText("Xem chi tiết"));
    expect(handleClick).toHaveBeenCalled();
  });
});

// Dashboard Pages
describe("CongViecDashboardPage", () => {
  it("loads dashboard data on mount", async () => {
    render(<CongViecDashboardPage />);
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: "congViec/getCongViecDashboard" })
      );
    });
  });

  it("navigates to MyTasksPage when clicking received section", () => {
    render(<CongViecDashboardPage />);
    fireEvent.click(screen.getByText("Việc tôi nhận"));
    expect(mockNavigate).toHaveBeenCalledWith("/quanlycongviec/viec-toi-nhan");
  });
});
```

---

### Integration Tests

```javascript
// Dashboard API Integration
describe("Dashboard API", () => {
  it("GET /dashboard/summary-lite returns correct structure", async () => {
    const response = await request(app)
      .get("/api/workmanagement/dashboard/summary-lite")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty("congViec");
    expect(response.body.data).toHaveProperty("yeuCau");
    expect(response.body.data).toHaveProperty("kpi");
  });

  it("returns 401 without authentication", async () => {
    await request(app)
      .get("/api/workmanagement/dashboard/summary-lite")
      .expect(401);
  });
});

// Redux Thunks
describe("dashboardSlice thunks", () => {
  it("getDashboardSummaryLite dispatches correct actions", async () => {
    const store = mockStore({ dashboard: initialState });
    await store.dispatch(getDashboardSummaryLite());

    const actions = store.getActions();
    expect(actions[0].type).toBe("dashboard/startLoading");
    expect(actions[1].type).toBe("dashboard/getSummarySuccess");
  });
});
```

---

### E2E Tests (Cypress)

```javascript
describe("Dashboard Navigation Flow", () => {
  beforeEach(() => {
    cy.login("user@hospital.com", "password");
  });

  it("navigates from Trang chủ to CongViec dashboard", () => {
    cy.visit("/quanlycongviec");
    cy.contains("CÔNG VIỆC").click();
    cy.url().should("include", "/cong-viec");
    cy.contains("Việc tôi nhận").should("be.visible");
  });

  it("displays correct badge counts on bottom nav", () => {
    cy.visit("/quanlycongviec");
    cy.get('[data-testid="bottom-nav-congviec"]')
      .find('[data-testid="badge"]')
      .should("have.text", "5"); // 5 urgent tasks
  });

  it("debounces Trang chủ API call", () => {
    cy.intercept("GET", "/api/workmanagement/dashboard/summary-lite").as(
      "summaryLite"
    );
    cy.visit("/quanlycongviec");

    // Should NOT call immediately
    cy.wait(1000);
    cy.get("@summaryLite.all").should("have.length", 0);

    // Should call after 2s
    cy.wait(1500);
    cy.get("@summaryLite.all").should("have.length", 1);
  });
});
```

---

## ⚡ Performance Considerations

### 1. API Optimization

**MongoDB Indexes:**

```javascript
// Add to CongViec model
CongViec.index({ NguoiNhanID: 1, TrangThai: 1 });
CongViec.index({ NguoiGiaoID: 1, TrangThai: 1 });
CongViec.index({ NgayHetHan: 1 }); // For deadline queries

// Add to YeuCau model
YeuCau.index({ NguoiGuiID: 1, TrangThai: 1 });
YeuCau.index({ KhoaNhanID: 1, TrangThai: 1 });

// Add to DanhGiaKPI model
DanhGiaKPI.index({ NhanVienID: 1, ChuKyID: 1 });
DanhGiaKPI.index({ ChuKyID: 1, TrangThai: 1 });
```

**Query Performance Targets:**

- Dashboard Lite API: < 200ms
- Module Dashboard APIs: < 300ms
- Badge count APIs: < 100ms (cached)

---

### 2. Frontend Caching

**Redux Cache Strategy:**

```javascript
// dashboardSlice.js
const CACHE_DURATION = 60000; // 1 minute

const isStale = (timestamp) => {
  if (!timestamp) return true;
  return Date.now() - new Date(timestamp).getTime() > CACHE_DURATION;
};

export const getDashboardSummaryLite = () => async (dispatch, getState) => {
  const { lastUpdated } = getState().dashboard;

  // Skip if fresh data exists
  if (!isStale(lastUpdated)) {
    return;
  }

  dispatch(startLoading());
  // ... fetch logic
};
```

**Component Memoization:**

```javascript
// Prevent unnecessary re-renders
export const CongViecSummaryCard = React.memo(
  ({ data, variant, onClick }) => {
    // Component logic
  },
  (prevProps, nextProps) => {
    return (
      prevProps.data === nextProps.data &&
      prevProps.variant === nextProps.variant
    );
  }
);
```

---

### 3. Debounced Loading

**Trang chủ Optimization:**

```javascript
const UnifiedDashboardPage = () => {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Wait 2s before loading
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (shouldLoad) {
      dispatch(getDashboardSummaryLite());
    }
  }, [shouldLoad]);

  // Show skeleton immediately
  if (!shouldLoad || isLoading) {
    return <DashboardSkeleton />;
  }

  return <DashboardContent />;
};
```

**Benefits:**

- If user navigates away < 2s → No API call wasted
- If user stays → Smooth loading experience
- Reduces server load for "tab switchers"

---

### 4. Badge Update Strategy

**Polling Frequency:**

```javascript
// yeuCauSlice.js - existing pattern
const POLLING_INTERVAL = 30000; // 30 seconds

useEffect(() => {
  dispatch(getBadgeCounts("YEU_CAU_TOI_XU_LY"));

  const interval = setInterval(() => {
    dispatch(getBadgeCounts("YEU_CAU_TOI_XU_LY"));
  }, POLLING_INTERVAL);

  return () => clearInterval(interval);
}, []);

// NEW: CongViec badge (derive from existing data)
const selectCongViecBadgeCount = createSelector(
  [(state) => state.congViec.receivedCongViecs],
  (tasks) => {
    const now = new Date();
    return tasks.filter(
      (task) =>
        task.TrangThai === "DA_GIAO" ||
        (task.NgayHetHan && new Date(task.NgayHetHan) < now)
    ).length;
  }
);

// No polling needed - reuse existing data ✅
```

---

## 📝 Checklist for Completion

### ⚠️ CRITICAL PREREQUISITES (1h - NEW)

- [ ] **Path Consistency Audit** (Task 2A.5)
  - [ ] Check MyTasksPage actual route in routes config
  - [ ] Check AssignedTasksPage actual route
  - [ ] Verify MobileBottomNav path `/cong-viec-cua-toi` is correct
  - [ ] Document migration plan if changing to `/cong-viec`
  - [ ] Find and verify `badge-counts-page` endpoint name
- [ ] **Backend API Reality Check**
  - [ ] Confirm `dashboard.controller.js` does NOT exist
  - [ ] Confirm KPI APIs cannot be reused (cycle dependency)
  - [ ] Allocate 5h for backend (not 2.5h)

### Backend APIs (5h - REVISED)

- [ ] Create `dashboard.controller.js` (NEW FILE)
  - [ ] Import required models (CongViec, DanhGiaKPI, YeuCau)
  - [ ] Set up catchAsync error handling
  - [ ] Export controller object
- [ ] Implement `getSummaryLite()` (2h)
  - [ ] Aggregation WITHOUT chuKyDanhGiaID dependency
  - [ ] Test with multiple users
  - [ ] Verify response < 200ms
- [ ] Implement `getCongViecDashboard()` (2h)
  - [ ] Detailed stats by status
  - [ ] Deadline grouping aggregation
  - [ ] Test with large datasets (1000+ tasks)
- [ ] Add routes to `modules/workmanagement/routes/index.js`
  - [ ] `router.use('/dashboard', dashboardRoute);`
- [ ] Add MongoDB indexes (CRITICAL for performance)
  - [ ] `CongViec.index({ NguoiNhanID: 1, TrangThai: 1 });`
  - [ ] `CongViec.index({ NguoiGiaoID: 1, TrangThai: 1 });`
  - [ ] `CongViec.index({ NgayHetHan: 1 });`
  - [ ] `DanhGiaKPI.index({ NhanVienID: 1, ChuKyID: 1 });`
- [ ] Test with Postman
  - [ ] Summary-lite: 5 different users
  - [ ] CongViec dashboard: edge cases (0 tasks, 1000+ tasks)
- [ ] Verify response time < 300ms
  - [ ] Run aggregations with .explain() to check index usage

---

### Core Components (2h)

- [ ] Extract `CongViecSummaryCard.js`
- [ ] Extract `YeuCauSummaryCard.js`
- [ ] Extract `KPISummaryCard.js`
- [ ] Add `variant` prop (compact/detailed)
- [ ] Create barrel export `index.js`
- [ ] Write Storybook stories
- [ ] Test responsive behavior

---

### Module Dashboards (14h)

**CongViecDashboardPage:**

- [ ] Create page component
- [ ] Add Redux integration
- [ ] Reuse StatusGrid (received)
- [ ] Reuse StatusGrid (assigned)
- [ ] Add FAB menu drawer
- [ ] Add navigation handlers
- [ ] Test on mobile

**YeuCauDashboardPage:**

- [ ] Create page component
- [ ] Add role-based sections
- [ ] Add priority list
- [ ] Test conditional rendering

**KPIDashboardPage:**

- [ ] Create page component
- [ ] Add cycle selector
- [ ] Add role-adaptive rendering
- [ ] Test employee view
- [ ] Test manager view

---

### Unified Dashboard (2h)

- [ ] Refactor UnifiedDashboardPage
- [ ] Remove embedded SummaryCard
- [ ] Import extracted components
- [ ] Add debounced loading (2s)
- [ ] Add priority list
- [ ] Update dashboardSlice (real API)
- [ ] Test cache behavior

---

### Bottom Nav + Menu (4h)

- [ ] Update MobileBottomNav to 4-tab
- [ ] Fix broken route `/cong-viec-cua-toi`
- [ ] Add badge selectors (congViec, KPI)
- [ ] Create FABMenuButton component
- [ ] Create MenuGridPage
- [ ] Test navigation flow
- [ ] Test badge updates

---

### Testing (Per Module)

- [ ] Unit tests for SummaryCards
- [ ] Unit tests for Dashboard pages
- [ ] Integration tests for APIs
- [ ] Redux thunk tests
- [ ] E2E tests (Cypress)
- [ ] Mobile device testing

---

### Performance

- [ ] Add MongoDB indexes
- [ ] Verify API response times
- [ ] Test cache behavior (1 min TTL)
- [ ] Test debounced loading (2s delay)
- [ ] Profile bundle size impact
- [ ] Lighthouse audit (target: 90+)

---

## 🚨 Known Risks & Mitigation

### Risk 0: Backend API Does Not Exist (NEW - HIGH)

**Discovered:** Audit 12/01/2026

**Concern:** Plan assumed APIs just need "uncommenting" but reality is dashboard.controller.js doesn't exist

**Impact:**

- Frontend cannot proceed until backend is complete
- Increased effort: 2.5h → 5h
- No parallel work possible

**Mitigation:**

- ✅ Strictly enforce backend-first implementation order
- ✅ Complete Postman testing before touching frontend
- ✅ Create dashboard.controller.js from scratch (use congViec.controller.js as template)
- ✅ NO shortcuts - do not try to adapt KPI APIs
- ⚠️ Block frontend tasks until backend endpoints return 200 OK in Postman

### Risk 1: API Performance with Large Data

**Concern:** Dashboard aggregations might be slow with 10,000+ tasks

**Mitigation:**

- ✅ Add MongoDB indexes on query fields (see checklist)
- ✅ Use `$facet` for parallel aggregation
- ✅ Limit date range (e.g., last 3 months only)
- ✅ Add pagination if needed
- ✅ Use `.explain()` to verify index usage

---

### Risk 2: Stale Cache Issues

**Concern:** User sees outdated counts after creating new task

**Mitigation:**

- ✅ Invalidate cache on CRUD actions
- ✅ Show "Refreshing..." indicator
- ✅ Manual refresh button available
- ✅ 1-minute TTL is acceptable trade-off

---

### Risk 3: Role Confusion (Employee vs Manager)

**Concern:** Manager sees employee view, or vice versa

**Mitigation:**

- ✅ Explicit `PhanQuyen` checks in components
- ✅ Backend validation on role-specific endpoints
- ✅ Clear visual indicators (badges, sections)
- ✅ Test with different user roles

---

## 📚 References

### Existing Documentation

- [MASTER_PLAN.md](./00_MASTER_PLAN.md) - Overall project plan
- [PHASE_2_DASHBOARD.md](./PHASE_2_DASHBOARD.md) - Original Phase 2 spec
- [Brain Storm Session](./conversations/2026-01-12-bottom-nav-brainstorm.md) - Full discussion

### Code References

**Frontend:**

- `src/features/QuanLyCongViec/Dashboard/UnifiedDashboardPage.js` (369 lines)
- `src/features/QuanLyCongViec/Dashboard/dashboardSlice.js` (341 lines)
- `src/features/QuanLyCongViec/CongViec/MyTasksPage.js` (618 lines)
- `src/features/QuanLyCongViec/CongViec/AssignedTasksPage.js` (626 lines)

**Backend:**

- `giaobanbv-be/modules/workmanagement/routes/congViec.api.js`
- `giaobanbv-be/modules/workmanagement/services/congViec.service.js`

---

## ⚠️ Ready to Implement WITH REVISIONS

**CRITICAL CHANGES FROM AUDIT:**

- Backend work: 2.5h → 5h (APIs don't exist)
- New task: Path Audit 1h (nav consistency)
- Total effort: 44.25h → 49h
- Implementation readiness: 6.5/10

**Blockers to Resolve First:**

1. ❌ Verify YeuCau badge-counts-page endpoint exists
2. ❌ Audit routes config for path consistency
3. ❌ Confirm allocation for 5h backend work (not 2.5h)

**Revised Next Steps:**

1. **Path Audit** (Day 0 - 1h):

   - Check MyTasksPage/AssignedTasksPage routes
   - Document /cong-viec-cua-toi vs /cong-viec decision
   - Verify YeuCau badge endpoint name

2. **Backend First** (Day 1-2 - 5h):

   - Create dashboard.controller.js (NEW FILE)
   - Implement 2 APIs from scratch (lite + CongViec)
   - Add MongoDB indexes
   - Test thoroughly with Postman
   - **BLOCKER:** Frontend cannot start until this is done

3. **Extract Components** (Day 2-3 - 2h):

   - Refactor SummaryCards
   - Create Storybook stories
   - Test variants

4. **Module Dashboards** (Day 3-5):

   - CongViecDashboardPage (priority)
   - YeuCauDashboardPage
   - KPIDashboardPage

5. **Unified Dashboard** (Day 6):

   - Refactor to reuse components
   - Add debounce + cache

6. **Bottom Nav** (Day 7):
   - 4-tab revision
   - Menu Grid Page
   - FAB integration

**Estimated Timeline:** 8-9 working days (1 full-time dev) - REVISED

**Risk Level:** 🟡 Medium (was 🟢 Low)

- Backend creation adds complexity
- Path migration needs careful planning
- No parallel work until backend complete

---

**Document Version:** 1.1  
**Last Updated:** 12/01/2026  
**Audit Date:** 12/01/2026  
**Changes:** Added Risk Assessment, revised backend effort 2.5h→5h, added Path Audit task 1h, updated readiness score to 6.5/10  
**Author:** AI Assistant + User Brain Storm Session  
**Auditor:** AI Assistant (Codebase Reality Check)
