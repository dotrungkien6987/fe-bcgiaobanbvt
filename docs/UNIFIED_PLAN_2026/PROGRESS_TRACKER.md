# � Progress Tracker - Unified Plan 2026

**Last Updated:** 11/01/2026 15:45  
**Current Phase:** Phase 2 (Dashboard Redesign) - IN PROGRESS ⏳  
**Total Progress:** 26.75 / 44.25 hours (60.5%)

---

## 🎯 Overall Status

```
Progress: [██████░░░░] 60.5%

Phase 0: [██████████] 24 / 24h ✅ COMPLETE
Phase 1: [██████████] 5 / 5h ✅ COMPLETE
Phase 2: [██████░░░░] 26.75 / 44.25h ⏳ IN PROGRESS
  - Task 2.5: MyTasksPage ✅ (12.25h)
  - Task 2.6: Manager View ✅ (8h)
  - Task 2.7: Archive Page ✅ (9h)
  - Remaining: Tasks 2.3, 2.4, 2.8
Phase 3: [░░░░░░░░░░] 0 / 33h
Phase 4: [░░░░░░░░░░] 0 / 8h
Phase 5: [░░░░░░░░░░] 0 / 10h
Phase 6: [░░░░░░░░░░] 0 / 15h
```

---

## Phase 0: Navigation Refactor (24 / 24h) ✅ COMPLETE

**Status:** ✅ Complete  
**Priority:** 🔴 CRITICAL - BLOCKS ALL OTHER PHASES  
**Started:** 09/01/2026 10:00  
**Completed:** 09/01/2026 18:00

### Tasks

- [x] **0.1 Create navigationHelper.js (4h)** ✅

  - [x] Define WorkRoutes object with 40+ route builder methods
  - [x] Add JSDoc documentation for each method
  - [x] Export helper functions (buildBreadcrumbs, etc.)
  - **Completed:** 09/01/2026 11:00

- [x] **0.2 Create WorkManagementBreadcrumb.js (3h)** ✅

  - [x] Auto-generate breadcrumbs from location
  - [x] Handle all QuanLyCongViec routes
  - [x] Responsive design (hide on mobile)
  - **Completed:** 09/01/2026 12:30

- [x] **0.3 Update routes/index.js (4h)** ✅

  - [x] Migrate all routes to `/quanlycongviec/*`
  - [x] Update route configurations
  - [x] Test all route transitions
  - **Completed:** 09/01/2026 14:00 (by user in separate conversation)

- [x] **0.4 Update Navigation Calls (8h)** ✅

  - [x] YeuCauDetailPage.js (3 occurrences)
  - [x] QuanLyNhanVienPage.js (3 occurrences)
  - [x] DeleteChuKyDanhGiaButton.js (1 occurrence)
  - [x] ChuKyDanhGiaView.js (1 occurrence)
  - [x] ChuKyDanhGiaList.js (1 occurrence)
  - [x] NotificationDropdown.js (1 occurrence)
  - **Completed:** 09/01/2026 16:00

- [x] **0.5 Integration & Testing (5h)** ✅
  - [x] Discovered 7 additional files with hardcoded navigation
  - [x] Fixed all compile errors (ESLint export pattern + unused import)
  - [x] Verified 100% WorkRoutes adoption (17 navigation calls updated)
  - [x] Created comprehensive testing report
  - **Completed:** 09/01/2026 18:00

### Summary

- **Total Files Updated:** 13 navigation files
- \*\*Tot- Phase 0 complete, all blockers removed ✅

### Notes

- ✅ All navigation unified under `/quanlycongviec/*`
- ✅ All hardcoded strings replaced with WorkRoutes helpers
- ✅ Zero compile errors across workspace
- ✅ ESLint compliant, no linting warnings
- **Phase 1 can begin immediately**

---

## Phase 1: Mobile Bottom Navigation (5 / 5h) ✅ COMPLETE

**Status:** ✅ Complete  
**Priority:** 🔴 HIGH  
**Started:** 09/01/2026 18:15  
**Completed:** 09/01/2026 19:30

**Dependencies:** Phase 0 ✅ Complete

### Tasks

- [x] **1.1 Create useMobileLayout.js (1h)** ✅

  - [x] Mobile detection via useMediaQuery
  - [x] Theme-aware breakpoint logic
  - [x] Export showBottomNav, showDrawer helpers
  - **Completed:** 09/01/2026 18:45

- [x] **1.2 Create config/featureFlags.js (0.5h)** ✅

  - [x] PWA feature toggle system
  - [x] Environment variable support
  - [x] 10+ feature flags defined
  - [x] FeatureFlagContext and provider
  - **Completed:** 09/01/2026 19:00

- [x] **1.3 Create MobileBottomNav.js (2h)** ✅

  - [x] 5 navigation items (Home, Công việc, Yêu cầu, Thông báo, Cài đặt)
  - [x] Badge support for notifications
  - [x] Active state highlighting
  - [x] Material Design 3 styling
  - **Completed:** 09/01/2026 19:20

- [x] **1.4 Integration with MainLayout (1h)** ✅

  - [x] FeatureFlagProvider in App.js
  - [x] Conditional rendering in MainLayoutAble
  - [x] Bottom padding adjustment
  - [x] Drawer visibility logic
  - **Completed:** 09/01/2026 19:30

- [x] **1.5 Testing (0.5h)** ✅
  - [x] Compile error check (0 errors)
  - [x] Import validation
  - [x] Code cleanup

### Summary

- **Files Created:** 4 (useMobileLayout, featureFlags, FeatureFlagContext, MobileBottomNav)
- **Files Modified:** 2 (App.js, MainLayout/index.js)
- **Lines of Code:** ~500 (hook + flags + component + context)
- **Feature Flags:** 10+ toggles with environment variable support
- **Zero Compile Errors:** All imports clean and working

### Blockers

- None - Phase 1 complete ✅

### Notes

- ✅ Mobile detection working via breakpoints
- ✅ Feature flag system operational
- ✅ Bottom nav renders conditionally
- ✅ Badge counts integrated from Redux
- **Manual browser testing pending** (requires dev server check)

### ⚠️ Technical Debt (Phase 1)

**High Priority - Fix in Phase 2:**

1. **"Trang chủ" button** → `/quanlycongviec` không có dashboard

   - Hiện tại: Redirect đến `/congviec/nhanvien/me`
   - Cần: Tạo `UnifiedDashboardPage` với overview cards
   - Impact: User không có trang tổng quan thực sự

2. **"Công việc" button** → `/quanlycongviec/congviec` thiếu index route

   - Hiện tại: Path không match route nào
   - Cần: Thêm `<Route index element={<Navigate to="nhanvien/me" />} />`
   - Impact: Click button sẽ không navigate đúng

3. **"Cài đặt" button** → `/quanlycongviec/cai-dat` thiếu index route
   - Hiện tại: Chỉ có `/cai-dat/thong-bao`
   - Cần: Tạo `SettingsPage` hoặc redirect
   - Impact: Click button navigate đến 404

**Resolution Plan:**

- Items 1: Resolved in Phase 2 Task 2.1 (Dashboard creation)
- Items 2-3: Quick fix before Phase 2 starts (5 minute26.75 / 44.25h) ⏳ IN PROGRESS

**Status:** ⏳ In Progress (60.5% complete)  
**Priority:** ⭐ CORE - User's Primary Request  
**Started:** 09/01/2026 20:00  
**Expected Completion:** Mid-January 2026

**Dependencies:** Phase 0 ✅ + Phase 1 ✅ Complete

**⚠️ Scope Updates:**

- Task 2.5: 10h → 12.25h (+UX + Mobile additions)
- Task 2.6: Created from scope analysis (8h)
- Task 2.7: Created from scope analysis (9h

**Dependencies:** Phase 0 ✅ + Phase 1 ✅ Complete

**⚠️ Scope Update (10/01/2026):** Task 2.5 increased from 10h → 12.25h (+UX + Mobile additions)

### Tasks

- [x] **2.0 Quick Fixes (0.5h)** ✅

  - [x] Add index route for `/congviec` → redirect to `/nhanvien/me`
  - [x] Add index route for `/cai-dat` → redirect to `/thong-bao`
  - **Completed:** 09/01/2026 20:05

- [x] **2.1 Create UnifiedDashboardPage (3h)** ✅

  - [x] 3 Summary cards (Công việc, KPI, Yêu cầu)
  - [x] Click card to drill down
  - [x] Mobile-optimized grid layout
  - [x] Mock data with realistic stats
  - [x] Replace root redirect with dashboard component
  - **Completed:** 09/01/2026 20:30

- [x] **2.2 Create dashboardSlice (2h)** ✅

  - [x] Redux slice with summary state
  - [x] Mock API integration (temporary)
  - [x] Loading states (isLoading, isRefreshing)
  - [x] Error handling with toast notifications
  - [x] Thunks: getDashboardSummary, refreshDashboard, individual module updates
  - [x] Selectors for all state paths
  - [x] Fixed selector state path (workDashboard)
  - [x] Connected to UnifiedDashboardPage
  - [x] Fixed navigation onClick handlers
  - **Completed:** 09/01/2026 21:45

- [ ] **2.3 Backend Dashboard API (2h)** 🔄 TECHNICAL DEBT

  - Lý do hoãn: Cần nghiên cứu thêm về các giá trị cần tổng hợp
  - [ ] Aggregate CongViec stats (cần chi tiết hóa)
  - [ ] Aggregate KPI stats (cần chi tiết hóa)
  - [ ] Aggregate Yêu cầu stats (cần chi tiết hóa)
  - [ ] Single endpoint for all 3 modules
  - **Status:** Tạm hoãn - Làm sau Phase 2.5

- [ ] **2.4 CongViecDashboardPage (8h)** 🔄 TECHNICAL DEBT

  - Lý do hoãn: Phụ thuộc vào Task 2.3, cần thiết kế lại dashboard metrics
  - [ ] 4 status cards với số liệu chi tiết
  - [ ] Filters: Trạng thái, Ngày, Người giao/nhận
  - [ ] Công việc table với sorting/pagination
  - [ ] Click card → filter tự động
  - [ ] Mobile responsive
  - **Status:** Tạm hoãn - Làm sau Phase 2.5

- [x] **2.5 MyTasksPage refactor (12.25h)** ✅ COMPLETE

  - **Completed:** 11/01/2026 10:30
  - **Scope:** Expanded with UX + Mobile additions
  - **Original:** 8h → **Final:** 12.25h (+4.25h)

  **Breakdown:**

  - [x] Phase A: Components & Hooks (3h) ✅

    - [x] useTaskCounts hook (0.75h)
    - [x] StatusTabs component (1.5h)
    - [x] UrgentAlertBanner component (0.75h)

  - [x] Phase B: URL & Data (2.5h) ✅

    - [x] useMyTasksUrlParams hook (0.75h)
    - [x] Update congViecSlice (0.5h)
    - [x] 📱 RecentCompletedPreview detail (1h) - 5 fields display

  - [x] Phase C: Page Refactor (6.75h) ✅
    - [x] Steps 1-5: Core refactor (3.5h)
    - [x] 📱 Step 5.5: CongViecCard component (1h)
    - [x] 📱 Step 5.6: CongViecTable responsive (1h)
    - [x] Step 6: Update CongViecFilterPanel (0.33h)
    - [x] ✨ Step 7: ActiveFilterChips (0.5h)
    - [x] ✨ Step 8: Empty state (0.5h)
    - [x] ✨ Step 9: Toast config (0.25h)
    - [x] Step 10: Sticky columns fix (0.5h) - Theme override with !important

  **Completed Features:**

  - ✅ Single page: "Công việc của tôi" (individual view)
  - ✅ Status tabs with deadline badges (⚠️ ⏰)
  - ✅ URL params integration (?status=XXX)
  - ✅ Client-side filtering & pagination (500 tasks)
  - ✅ UrgentAlertBanner with dismissible state
  - ✅ RecentCompletedPreview with 5-field detail display
  - ✅ ActiveFilterChips for visual feedback
  - ✅ Mobile card view (table ↔ cards at ≤768px)
  - ✅ Sticky columns ("Mã" left, "Thao tác" right)
  - ✅ Empty states for completed tasks
  - ✅ Toast stack limit (max 3 concurrent)

  **Files Created:** 7 new components/hooks

  - StatusTabs.js (~180 lines)
  - UrgentAlertBanner.js (~120 lines)
  - RecentCompletedPreview.js (~200 lines)
  - ActiveFilterChips.js (~60 lines)
  - CongViecCard.js (~80 lines)
  - useMyTasksUrlParams.js (~80 lines)
  - useTaskCounts.js (~100 lines)

  **Files Updated:** 5 existing files

  - MyTasksPage.js (716→450 lines, -37%)
    -x] **2.6 "Việc tôi giao" - Manager View (8h)** ✅ COMPLETE

  - **Completed:** 11/01/2026 13:00
  - **Scope:** AssignedTasksPage with 5 status tabs, manager filters

  **Breakdown:**

  - [x] Phase A: Component Adjustments (2h) ✅

    - [x] useAssignedTaskCounts hook (0.5h)
    - [x] useAssignedTasksUrlParams hook (0.75h)
    - [x] CongViecCardManager component (0.75h)

  - [x] Phase B: Page Implementation (4.5h) ✅

    - [x] AssignedTasksPage.js creation (3h)
    - [x] Redux congViecSlice updates (0.75h)
    - [x] Route integration (0.25h)
    - [x] Menu item addition (0.5h)

  - [x] Phase C: Testing & Polish (1.5h) ✅
    - [x] Compile error fixes (0.5h)
    - [x] Filter logic validation (0.5h)
    - [x] UI/UX refinements (0.5h)

  **Completed Features:**

  - ✅ 5 status tabs: Chưa giao, Đã giao, Đang làm, Chờ tôi duyệt, Hoàn thành
  - ✅ Filter by Người xử lý chính (from nhanVienDuocQuanLy)
  - ✅ Manager-specific actions (Edit, Delete, Tree view)
  - ✅ UrgentAlertBanner for team deadlines
  - ✅ RecentCompletedPreview with client pagination
  - ✅ Mobile card view with progress bars
  - ✅ URL params sync (?status=XXX)

  **Files Created:** 3 new components

  - AssignedTasksPage.js (~480 lines)
  - useAssignedTaskCounts.js (~140 lines)
  - useAssignedTasksUrlParams.js (~90 lines)

  **Files Updated:** 3 existing files

  - congViecSlice.js (+assignedCongViecs state)
  - routes/index.js (+route /viec-toi-giao)
  - menu-items/quanlycongviec.js (+menu item)

  **Status:** ✅ Complete - Ready for testing

- [x] **2.7 Completed Tasks Archive (9h)** ✅ COMPLETE

  - **Completed:** 11/01/2026 15:30
  - **Scope:** Full archive page with stats, filters, pagination

  **Breakdown:**

  - [x] Phase 1-2: Core Structure + Stats (4h) ✅

    - [x] Redux completedArchive state (1h)
    - [x] CompletedTasksArchivePage component (2h)
    - [x] CompletedStatsCards component (1h)

  - [x] Phase 3: Advanced Filters (3h) ✅

    - [x] DateRangePresets component (1h)
    - [x] Custom date pickers (1h)
    - [x] Filter drawer integration (1h)

  - [x] Phase 4: Export (SKIPPED per user choice) ✅

  - [x] Phase 5-6: Polish & Testing (2h) ✅
    - [x] URL sync hook (1h)
    - [x] Performance optimization (0.5h)
    - [x] Mobile optimization (0.5h)

  **Completed Features:**

  - ✅ 2 tabs: My completed / Team completed
  - ✅ 4 stats cards (compact mobile layout)
  - ✅ 10 date range presets (today, 7/30 days, week/month/quarter)
  - ✅ Custom date pickers with validation
  - ✅ Drawer-based filter UI (consistent with MyTasksPage)
  - ✅ Conditional filters (VaiTroCuaToi for my, NguoiChinhID for team)
  - ✅ Backend NgayHoanThanh filter support
  - ✅ URL params sync (shareable links)
  - ✅ Pagination with row count selection
  - ✅ Mobile responsive (2 cards per row)

  **Files Created:** 4 new components

  - CompletedTasksArchivePage.js (~530 lines)
  - CompletedStatsCards.js (~160 lines)
  - DateRangePresets.js (~98 lines)
  - useCompletedArchiveUrlParams.js (~135 lines)

  **Files Updated:** 5 existing files

  - congViecSlice.js (+completedArchive state, 9 reducers, 2 thunks)
  - congViec.service.js (+NgayHoanThanh filter in buildCongViecFilter)
  - routes/index.js (+route /lich-su-hoan-thanh)
  - menu-items/quanlycongviec.js (+menu item with Clock icon)
  - CongViecFilterPanel.js (conditional excludeFields support)

  **Status:** ✅ Complete - Export skipped per user choice (option C)

### Summary (Phase 2 Progress)

- **Time Spent:** 26.75 hours
  - Previous: 5.5h (2.0, 2.1, 2.2)
  - Task 2.5: 12.25h (MyTasksPage)
  - Task 2.6: 8h (AssignedTasksPage)
  - Task 2.7: 9h (Archive)
  - Remaining: 17.5h (2.3, 2.4, 2.8)
- **Tasks Completed:** 6 of 7 (2.0, 2.1, 2.2, 2.5, 2.6, 2.7)
- **Files Created:** 16 new components/hooks
- **Files Modified:** 16 existing files
- **Code Stats:**
  - MyTasksPage: 716→450 lines (-37%)
  - AssignedTasksPage: 480 lines (new)
  - CompletedTasksArchivePage: 530 lines (new)
  - Total new code: ~2,200 lines
- **Technical Debt Created:** 2 tasks (2.3, 2.4 - deferred for design review)
- **Technical Debt Resolved:** Sticky columns, filter drawer patterns
- **Status:** 60.5% complete, 3 major pages operational

### Next Steps

**Immediate:**

- [ ] Manual testing all 3 pages (MyTasks, AssignedTasks, Archive)
- [ ] Performance testing with real data (500+ tasks)
- [ ] Mobile device testing (iOS/Android)

**Remaining Tasks:**

- [ ] **Task 2.3:** Backend Dashboard API (2h) - DEFERRED (needs design review)
- [ ] **Task 2.4:** CongViecDashboardPage (8h) - DEFERRED (depends on 2.3)
- [ ] **Task 2.8:** Testing & Polish (10h) - Can start with completed tasks

**Decision Point:**

- Continue with Task 2.8 (testing current features), or
- Move to Phase 3 (Splash + Mobile Layouts), or
- Address technical debt (Tasks 2.3, 2.4)

### Blockers

- None for immediate work
- Tasks 2.3, 2.4 require backend API design discussioniao" page (separate planning)
- [ ] **Task 2.7:** Mobile optimizations (5h)
- [ ] **Task 2.8:** Testing & Polish (10h)

### Blockers

- None - Task 2.6 can proceed (independent from 2.3, 2.4)
- Tasks 2.3, 2.4 require backend design review

  - [ ] Theme-aware detection
  - [ ] Export showBottomNav, showDrawer helpers

- [ ] **1.2 Create config/featureFlags.js (0.5h)**

  - [ ] PWA feature toggle system
  - [ ] Environment variable support

- [ ] **1.3 Create MobileBottomNav.js (2h)**

  - [ ] 5-tab bottom navigation
  - [ ] Badge notifications
  - [ ] Active state highlighting

- [ ] **1.4 Layout Integration (1.5h)**
  - [ ] MainLayout updates
  - [ ] MainLayoutAble updates
  - [ ] Test both themes

### Blockers

- ⚠️ Phase 0 must complete (needs unified routes)

### Notes

- Test on both Basic and Able themes
- Verify thumb-friendly tap targets (48px+)

---

## Phase 2: Dashboard Architecture (0 / 40h) 🔴 HIGH

**Status:** ⏸️ Blocked by Phase 0  
**Priority:** 🔴 HIGH  
**Started:** -  
**Expected Completion:** -

### Phase 2A: Backend APIs (0 / 2h)

- [ ] **2A.1 Dashboard Summary API (1h)**

  - [ ] `GET /workmanagement/dashboard/summary`
  - [ ] MongoDB aggregation for 3 modules

- [ ] **2A.2 CongViec Dashboard API (1h)**
  - [ ] `GET /workmanagement/congviec/dashboard-summary/:nhanVienId`
  - [ ] 8 status aggregations
  - [ ] Add composite indexes

### Phase 2B: Unified Dashboard (0 / 15h)

- [ ] **2B.1 Create UnifiedDashboardPage (6h)**

  - [ ] Layout with 3 summary cards
  - [ ] Recent activity feed
  - [ ] Quick actions

- [ ] **2B.2 Summary Card Components (6h)**

  - [ ] CongViecSummaryCard
  - [ ] KPISummaryCard
  - [ ] TicketSummaryCard

- [ ] **2B.3 Redux Dashboard Slice (3h)**
  - [ ] Create dashboardSlice
  - [ ] Thunks for data fetching
  - [ ] 5-min cache logic

### Phase 2C: "Công việc của tôi" UI/UX (0 / 23h) ⭐ CORE

#### **Sub-phase 2C.1: Dashboard Pages (0 / 14h)**

- [ ] **2C.1.1 Backend Performance Optimization (2h)**

  - [ ] Move TinhTrangHan filter to server-side
  - [ ] Add query optimization
  - [ ] Test performance improvements

- [ ] **2C.1.2 Create CongViecDashboardPage (8h)**

  - [ ] 2-column layout (Nhận | Giao)
  - [ ] 8 StatusCard components
  - [ ] Click-to-filter navigation
  - [ ] Mobile responsive (stack vertically)

- [ ] **2C.1.3 Redux Integration (2h)**

  - [ ] Update congViecSlice
  - [ ] Add dashboard summary state
  - [ ] Thunks for fetching

- [ ] **2C.1.4 Testing & Bug Fixes (2h)**
  - [ ] Test data accuracy
  - [ ] Test responsive layout
  - [ ] Fix discovered issues

#### **Sub-phase 2C.2: List Page Refactor (0 / 14h)**

- [ ] **2C.2.1 Create CongViecNestedTabs (4h)**

  - [ ] Two-level tab component
  - [ ] Level 1: Role tabs (Nhận | Giao)
  - [ ] Level 2: Status tabs (5 tabs)
  - [ ] Desktop horizontal, mobile vertical

- [ ] **2C.2.2 URL Params Integration (2h)**

  - [ ] Sync tabs with URL (?role=received&status=DA_GIAO)
  - [ ] Browser back button support
  - [ ] Deep linking support

- [ ] **2C.2.3 Refactor CongViecByNhanVienPage (6h)**

  - [ ] Rename to CongViecListPage
  - [ ] Replace TabContext with CongViecNestedTabs
  - [ ] Remove TrangThai from FilterPanel
  - [ ] Extract hooks: useCongViecFilters, useCongViecPagination
  - [ ] Update imports and exports

- [ ] **2C.2.4 Testing & Integration (2h)**
  - [ ] Test tab filtering
  - [ ] Test URL sync
  - [ ] Test pagination
  - [ ] End-to-end navigation flow

### Blockers

- ⚠️ Phase 0 must complete (needs navigationHelper + breadcrumbs)

### Notes

- Sub-phases are SEQUENTIAL: 2C.1 → 2C.2
- Dashboard must work before refactoring list page
- Test with real data from multiple users

---

## Phase 3: Splash + Mobile Layouts (0 / 33h) 🟡 MEDIUM

**Status:** ⏸️ Blocked by Phase 0, 1  
**Priority:** 🟡 MEDIUM  
**Started:** -  
**Expected Completion:** -

### Phase 3A: Splash & Skeleton (0 / 5h)

- [ ] **3A.1 Create SplashScreen.jsx (1.5h)**

  - [ ] Framer Motion animation
  - [ ] Hospital logo + branding

- [ ] **3A.2 Create Skeleton Components (2h)**

  - [ ] PageSkeleton
  - [ ] CardListSkeleton
  - [ ] FormSkeleton

- [ ] **3A.3 App.js Integration (1h)**

  - [ ] Suspense boundaries
  - [ ] Splash on initial load

- [ ] **3A.4 Testing (0.5h)**
  - [ ] Smooth transitions
  - [ ] Loading states

### Phase 3B: Mobile Detail Layouts (0 / 28h)

- [ ] **3B.1 Create MobileDetailLayout (4h)**

  - [ ] Responsive wrapper component
  - [ ] Tab navigation (mobile)
  - [ ] 2-column layout (desktop)

- [ ] **3B.2 Refactor CongViecDetailPage (12h)**

  - [ ] Extract CongViecInfoSection
  - [ ] Extract CongViecProgressSection
  - [ ] Extract CongViecFilesSection
  - [ ] Extract CongViecCommentsSection
  - [ ] Apply MobileDetailLayout

- [ ] **3B.3 Refactor CycleAssignmentDetailPage (10h)**

  - [ ] Modularize 1,299 lines
  - [ ] Extract employee sections
  - [ ] Extract assignment sections
  - [ ] Apply MobileDetailLayout

- [ ] **3B.4 Mobile Testing (2h)**
  - [ ] Test on iOS Safari
  - [ ] Test on Android Chrome
  - [ ] Fix touch target issues

### Blockers

- ⚠️ Phase 0 (breadcrumbs)
- ⚠️ Phase 1 (useMobileLayout hook)

### Notes

- Test on real devices, not just DevTools
- Verify 320px - 1920px responsive range

---

## Phase 4: Gesture System (0 / 8h) 🔴 HIGH

**Status:** ⏸️ Blocked by Phase 1, 3  
**Priority:** 🔴 HIGH  
**Started:** -  
**Expected Completion:** -

### Tasks

- [ ] **4.1 Generalize Gesture Components (2h)**

  - [ ] Move from Ticket to src/components/@extended/mobile/
  - [ ] PullToRefreshWrapper.jsx
  - [ ] SwipeableCard.jsx
  - [ ] Create LongPressMenu.jsx (new)

- [ ] **4.2 Apply to 6+ Modules (4h)**

  - [ ] BenhNhanTable (pull-to-refresh + swipe)
  - [ ] BaoCaoTable (pull-to-refresh + swipe)
  - [ ] SuCoTable (pull-to-refresh + swipe)
  - [ ] KPITable (pull-to-refresh + swipe)
  - [ ] DaoTaoTable (pull-to-refresh + swipe)
  - [ ] CongViecTable (pull-to-refresh + swipe)

- [ ] **4.3 Testing (2h)**
  - [ ] Test all gestures on iOS
  - [ ] Test all gestures on Android
  - [ ] Verify 60fps animations
  - [ ] Fix discovered issues

### Blockers

- ⚠️ Phase 1 (mobile detection)
- ⚠️ Phase 3 (layouts)

### Notes

- Native feel is critical - must be smooth
- Test on real devices

---

## Phase 5: Performance Optimization (0 / 10h) 🟡 MEDIUM

**Status:** ⏸️ Blocked by Phase 3  
**Priority:** 🟡 MEDIUM  
**Started:** -  
**Expected Completion:** -

### Phase 5A: Route Lazy Loading (0 / 4h)

- [ ] **5A.1 Convert Routes to React.lazy() (2h)**

  - [ ] 50+ route conversions
  - [ ] Dynamic imports

- [ ] **5A.2 Suspense Boundaries (1h)**

  - [ ] Add skeleton fallbacks
  - [ ] Preload critical routes

- [ ] **5A.3 Bundle Analysis (1h)**
  - [ ] Webpack bundle analyzer
  - [ ] Verify < 1MB main chunk

### Phase 5B: Offline Strategy (0 / 6h) - OPTIONAL

- [ ] **5B.1 Service Worker Cache (3h)**

  - [ ] API caching strategies
  - [ ] Cache invalidation

- [ ] **5B.2 IndexedDB Queue (2h)**

  - [ ] Offline mutation queue
  - [ ] Auto-sync when online

- [ ] **5B.3 Offline UI (1h)**
  - [ ] Offline mode banner
  - [ ] Queue status indicator

### Blockers

- ⚠️ Phase 3 (skeletons for Suspense)

### Notes

- Phase 5B (Offline) can be deferred to future release
- Focus on Phase 5A first

---

## Phase 6: Testing & Deploy (0 / 15h) 🔴 FINAL

**Status:** ⏸️ Blocked by ALL previous phases  
**Priority:** 🔴 FINAL  
**Started:** -  
**Expected Completion:** -

### Tasks

- [ ] **6.1 Navigation Testing (3h)**

  - [ ] Test 20+ navigation flows
  - [ ] Breadcrumb accuracy
  - [ ] Deep linking

- [ ] **6.2 Dashboard Testing (2h)**

  - [ ] Data accuracy verification
  - [ ] Click-through flows
  - [ ] Mobile responsive

- [ ] **6.3 Gesture Testing (2h)**

  - [ ] All pull-to-refresh scenarios
  - [ ] All swipe actions
  - [ ] Long press menus

- [ ] **6.4 Cross-Browser Testing (2h)**

  - [ ] Chrome 90+
  - [ ] Safari 14+
  - [ ] Firefox 88+
  - [ ] Edge 90+

- [ ] **6.5 Performance Testing (2h)**

  - [ ] Lighthouse audit (target > 90)
  - [ ] Bundle size verification
  - [ ] Load time metrics

- [ ] **6.6 Accessibility Audit (2h)**

  - [ ] WCAG 2.1 AA compliance
  - [ ] Screen reader testing
  - [ ] Keyboard navigation

- [ ] **6.7 Deployment (2h)**
  - [ ] Deployment checklist
  - [ ] Rollback plan
  - [ ] User communication
  - [ ] Production deploy
  - [ ] Post-deploy monitoring

### Blockers

- ⚠️ ALL phases 0-5 must complete

### Notes

- DO NOT skip testing
- Reserve 4h for quick fixes post-deploy

---

## 📈 Metrics

### Hours Breakdown

| Category    | Planned  | Completed | Remaining |
| ----------- | -------- | --------- | --------- |
| Navigation  | 24h      | 0h        | 24h       |
| Mobile Nav  | 5h       | 0h        | 5h        |
| Dashboard   | 40h      | 0h        | 40h       |
| Layouts     | 33h      | 0h        | 33h       |
| Gestures    | 8h       | 0h        | 8h        |
| Performance | 10h      | 0h        | 10h       |
| Testing     | 15h      | 0h        | 15h       |
| **TOTAL**   | **135h** | **0h**    | **135h**  |

### Phase Completion

- Phase 0: 0% (0 / 5 tasks)
- Phase 1: 0% (0 / 4 tasks)
- Phase 2: 0% (0 / 3 sub-phases)
- Phase 3: 0% (0 / 2 sub-phases)
- Phase 4: 0% (0 / 3 tasks)
- Phase 5: 0% (0 / 2 sub-phases)
- Phase 6: 0% (0 / 7 tasks)

---

## 🚧 Current Blockers

- **Phase 1-6:** Blocked by Phase 0 (Navigation Refactor)
- **No active blockers** - Can start Phase 0 immediately

---

## 📝 Daily Log

### 2026-01-09

- ✅ Project planning complete
- ✅ Master plan created (00_MASTER_PLAN.md)
- ✅ Context document for new conversations (CONTEXT_FOR_NEW_CONVERSATION.md)
- ✅ Progress tracker initialized (this file)
- ⏳ Phase 0 ready to start

---

**Next Update:** When Phase 0 tasks begin  
**Responsible:** Development team  
**Review Frequency:** Daily during development
