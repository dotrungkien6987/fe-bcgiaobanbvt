# ✅ Checklist Tổng Hợp - UX Improvement 2026

**Mục đích:** Track tiến độ cho tất cả 4 phases

---

## 📊 Progress Overview

```
Overall Progress: 0/100 hours (0%)

Phase 1: [ ] 0/24h    ████████████░░░░░░░░  0%
Phase 2: [ ] 0/28h    ████████████░░░░░░░░  0%
Phase 3: [ ] 0/38h    ████████████░░░░░░░░  0%
Phase 4: [ ] 0/10h    ████████████░░░░░░░░  0%
```

---

## 🎯 PHASE 1: Navigation & Breadcrumb (24h)

### Planning (2h)

- [ ] Review route mapping table
- [ ] Identify all files cần update
- [ ] Setup feature branch `ux-improvement/phase-1-navigation`

### Implementation (18h)

#### Route Definitions (2h)

- [ ] Update `src/routes/index.js`
  - [ ] Remove old routes (quan-ly-cong-viec, /congviec, /yeu-cau)
  - [ ] Add unified prefix routes (/quanlycongviec/\*)
  - [ ] Add dashboard routes (unified + module-specific)

#### Navigation Calls - CongViec Module (4h)

- [ ] `CongViecByNhanVienPage.js` - Update navigate calls
- [ ] `CongViecTable.js` - Update row click navigation
- [ ] `CongViecDetailDialog.js` - Update breadcrumb links
- [ ] `CongViecFormDialog.js` - Update after-save navigation
- [ ] `CongViecTreeDialog.js` - Update tree node links
- [ ] Test all navigation flows

#### Navigation Calls - Ticket Module (4h)

- [ ] `YeuCauPage.js` - Update base routes
- [ ] `YeuCauToiGuiPage.js` - Update tab navigation
- [ ] `YeuCauXuLyPage.js` - Update tab navigation
- [ ] `YeuCauDieuPhoiPage.js` - Update tab navigation
- [ ] `YeuCauQuanLyKhoaPage.js` - Update tab navigation
- [ ] `YeuCauDetailPage.js` - Update breadcrumbs
- [ ] `YeuCauList.js` - Update row click handlers
- [ ] `YeuCauCard.js` - Update card click handlers
- [ ] Test all ticket flows

#### Navigation Calls - GiaoNhiemVu Module (1h)

- [ ] `CycleAssignmentListPage.js` - Update navigation
- [ ] `CycleAssignmentDetailPage.js` - Update breadcrumbs
- [ ] Test assignment flows

#### Menu Items (1h)

- [ ] `MainLayout/Sidebar/MenuList/items/index.js` - Update URLs
- [ ] `MainLayoutAble/Drawer/DrawerContent/Navigation/index.js` - Update URLs
- [ ] Test menu active states

#### Breadcrumb Component (3h)

- [ ] Create `WorkManagementBreadcrumb.js`
  - [ ] Support dynamic items prop
  - [ ] Home icon + links
  - [ ] Current page (no link)
  - [ ] Mobile responsive
- [ ] Integrate vào CongViecDetailPage
- [ ] Integrate vào CycleAssignmentDetailPage
- [ ] Integrate vào YeuCauDetailPage
- [ ] Integrate vào 3 KPI detail pages
- [ ] Test breadcrumb navigation

#### Utility Helper (1h)

- [ ] Create `utils/navigationHelper.js`
  - [ ] `buildWorkManagementUrl(module, path, params)`
  - [ ] `getModuleBreadcrumbs(module, currentPage)`
  - [ ] JSDoc documentation

#### Redux Updates (2h)

- [ ] Update Redux thunks có navigate()
  - [ ] `congViecSlice.js` - After create/update
  - [ ] `yeuCauSlice.js` - After create/update
  - [ ] `cycleAssignmentSlice.js` - After create
- [ ] Test Redux navigation flows

### Testing (4h)

- [ ] Manual testing
  - [ ] Test all navigation từ dashboard
  - [ ] Test all breadcrumb clicks
  - [ ] Test browser back/forward
  - [ ] Test deep links (copy/paste URL)
- [ ] Update unit tests
  - [ ] Navigation helper tests
  - [ ] Breadcrumb component tests
- [ ] Update integration tests
  - [ ] Update route paths trong Cypress
  - [ ] Update assertions

### Documentation (1h)

- [ ] Update README với route changes
- [ ] Document navigation patterns
- [ ] Create migration guide for team

---

## 🎯 PHASE 2: Mobile-First Redesign (28h)

### Planning (2h)

- [ ] Review MUI responsive breakpoints
- [ ] Sketch mobile layouts
- [ ] Setup feature branch `ux-improvement/phase-2-mobile`

### Shared Component (4h)

- [ ] Create `MobileDetailLayout.js`
  - [ ] Props: sections, tabs, actions
  - [ ] Stacked layout on mobile (<md)
  - [ ] Two-column on desktop (≥md)
  - [ ] Sticky header on mobile
  - [ ] Bottom action bar on mobile
- [ ] Create Storybook stories
- [ ] Test on 3 breakpoints (xs, sm, md)

### CongViecDetailPage Refactor (8h)

- [ ] Analyze current layout structure
- [ ] Extract sections into sub-components
  - [ ] `CongViecInfoSection.js`
  - [ ] `CongViecProgressSection.js`
  - [ ] `CongViecFilesSection.js`
  - [ ] `CongViecCommentsSection.js`
- [ ] Integrate MobileDetailLayout
- [ ] Responsive testing
  - [ ] iPhone 12 (375px)
  - [ ] iPad (768px)
  - [ ] Desktop (1920px)
- [ ] Fix any layout bugs

### CycleAssignmentDetailPage Refactor (8h)

- [ ] Analyze current two-column layout
- [ ] Extract sections
  - [ ] `CycleInfoSection.js`
  - [ ] `AssignmentListSection.js`
  - [ ] `EmployeeInfoSection.js`
- [ ] Integrate MobileDetailLayout
- [ ] Responsive testing (3 breakpoints)
- [ ] Fix layout bugs

### Additional Pages (Optional - 4h)

- [ ] YeuCauDetailPage - Make responsive
- [ ] KPI detail pages - Make responsive

### Testing (6h)

- [ ] Device testing
  - [ ] Real iPhone testing
  - [ ] Real Android testing
  - [ ] iPad testing
- [ ] Cross-browser mobile
  - [ ] Safari iOS
  - [ ] Chrome Android
  - [ ] Firefox mobile
- [ ] Performance testing
  - [ ] Lighthouse mobile score > 80
  - [ ] No layout shifts (CLS)
- [ ] Touch gestures testing

---

## 🎯 PHASE 3: Unified Dashboard + CongViec Module Enhancement (38h)

### Planning (2h)

- [ ] Define dashboard metrics
- [ ] Sketch dashboard layout (unified + module-specific)
- [ ] Design nested tabs UX (Role × Status)
- [ ] Setup feature branch `ux-improvement/phase-3-dashboard`

### Backend APIs (10h)

#### API Endpoints (8h)

- [ ] `GET /workmanagement/dashboard/summary`
  - [ ] CongViec summary (received/assigned counts by status)
  - [ ] KPI summary (current cycle status)
  - [ ] Ticket summary (counts by tab)
  - [ ] Recent activities (last 10 items)
  - [ ] Aggregation queries optimized
  - [ ] Add DB indexes
- [ ] `GET /workmanagement/congviec/dashboard-summary/:nhanVienId` ⭐ **NEW**
  - [ ] Received stats (daGiao, dangLam, choDuyet, hoanThanh)
  - [ ] Assigned stats (quaHan, dangThucHien, choDuyet, hoanThanh)
  - [ ] Progress averages (avgProgress)
  - [ ] Deadline warnings (sapQuaHan, canCheck)
  - [ ] Completion rates (tyLeDungHan)
  - [ ] Use MongoDB $facet aggregation
  - [ ] Add composite indexes for performance
- [ ] `GET /workmanagement/yeucau/dashboard-summary/:nhanVienId`
  - [ ] Detailed Ticket metrics
  - [ ] Response time stats

#### Testing (2h)

- [ ] Unit tests cho controllers
- [ ] Integration tests cho endpoints
- [ ] Load testing (100 concurrent requests)
- [ ] Verify aggregation accuracy

### Frontend Components (23h)

#### Redux State (4h)

- [ ] Update `congViecSlice.js` ⭐ **NEW**
  - [ ] Add dashboardSummary state (received, assigned)
  - [ ] Add loadingDashboard, lastDashboardFetch
  - [ ] Thunk: getCongViecDashboard(nhanVienId, forceRefresh)
  - [ ] 5-minute cache logic
  - [ ] Selectors: selectReceivedSummary, selectAssignedSummary
- [ ] Create/update `dashboardSlice.js`
  - [ ] State: summaryData, recentActivities, loading, error
  - [ ] Thunks: getDashboardSummary, refreshDashboard
  - [ ] Selectors: selectCongViecSummary, selectKPISummary, etc.
- [ ] Unit tests cho both slices

#### Unified Dashboard (4h)

- [ ] Create `UnifiedDashboardPage.js`
  - [ ] Layout: 3 columns (CongViec, KPI, Ticket)
  - [ ] Responsive: Stack on mobile
  - [ ] Recent activities section
  - [ ] Quick actions (Tạo công việc, Tạo yêu cầu)
- [ ] Create summary cards
  - [ ] `CongViecSummaryCard.js`
  - [ ] `KPISummaryCard.js`
  - [ ] `TicketSummaryCard.js`
- [ ] Create `RecentActivityFeed.js`
  - [ ] Activity items with icons
  - [ ] Time ago formatting
  - [ ] Click to navigate to detail

#### CongViec Module Dashboard (8h) ⭐ **NEW**

- [ ] Create `CongViecDashboardPage.js`
  - [ ] Grid layout: 2 columns (Received | Assigned)
  - [ ] 8 status cards (4 per column)
  - [ ] Click card → Navigate to filtered list
  - [ ] Loading skeletons
  - [ ] Mobile responsive (stacked)
- [ ] Create `StatusCard.js` component
  - [ ] Props: title, count, icon, color, subtitle, onClick
  - [ ] Hover effect (shadow + translateY)
  - [ ] Color-coded border-left
- [ ] Route: `/quanlycongviec/congviec/dashboard`
- [ ] Update menu item to point to dashboard
- [ ] Breadcrumb integration

#### CongViec Nested Tabs (10h) ⭐ **NEW**

- [ ] Create `CongViecNestedTabs.js` component
  - [ ] Desktop: Two-level horizontal tabs
    - [ ] Level 1: Role tabs (Received | Assigned)
    - [ ] Level 2: Status tabs (All, Đã giao, Đang làm, Chờ duyệt, Hoàn thành)
    - [ ] Scrollable Level 2 (variant="scrollable")
    - [ ] Status badges with counts
  - [ ] Mobile: Segment control + Dropdown
    - [ ] ToggleButtonGroup for Role
    - [ ] Select for Status
  - [ ] Props: roleTab, statusTab, onRoleChange, onStatusChange, counts
- [ ] Refactor `CongViecByNhanVienPage.js` → `CongViecListPage.js`
  - [ ] Integrate CongViecNestedTabs
  - [ ] URL params: `?role=received&status=DA_GIAO`
  - [ ] Sync tabs with URL (useSearchParams)
  - [ ] Calculate status counts dynamically
  - [ ] Remove TrangThai from CongViecFilterPanel
- [ ] Update `CongViecFilterPanel.js`
  - [ ] Add `hideTrangThaiFilter` prop
  - [ ] Conditional rendering of TrangThai field
- [ ] Route: `/quanlycongviec/congviec/list/:nhanVienId`
- [ ] Test all 10 tab combinations (2 roles × 5 statuses each)

#### Integration & Testing (3h)

- [ ] Connect dashboards to routes
  - [ ] Add `/quanlycongviec/dashboard` → UnifiedDashboardPage
  - [ ] Add `/quanlycongviec/congviec/dashboard` → CongViecDashboardPage
  - [ ] Add `/quanlycongviec/congviec/list/:nhanVienId` → CongViecListPage
- [ ] Update menu items
  - [ ] Dashboard menu → Unified dashboard
  - [ ] Công việc menu → Module dashboard
- [ ] Update navigationHelper.js
  - [ ] WorkRoutes.unifiedDashboard()
  - [ ] WorkRoutes.congViecDashboard()
  - [ ] WorkRoutes.congViecList(nhanVienId, {role, status})
- [ ] Breadcrumb integration for all pages
- [ ] Test navigation flows
  - [ ] Unified → Module → List
  - [ ] Card drill-down with pre-selected tabs
  - [ ] Browser back/forward
- [ ] Add loading states & error boundaries
- [ ] Mobile responsive testing
  - [ ] Dashboard cards stack correctly
  - [ ] Nested tabs mobile view works
  - [ ] Touch targets ≥44px

---

## 🎯 PHASE 4: Testing & Deploy (10h)

### Comprehensive Testing (6h)

#### Test Scenarios (3h)

- [ ] **Navigation Tests**
  - [ ] Old bookmarks không hoạt động (expected)
  - [ ] All menu items navigate correctly
  - [ ] Breadcrumbs navigate correctly
  - [ ] Browser back/forward works
  - [ ] Deep links work
- [ ] **Mobile Tests**
  - [ ] All detail pages responsive
  - [ ] Touch targets ≥44px
  - [ ] No horizontal scroll
  - [ ] Stacked layout on mobile
- [ ] **Dashboard Tests**
  - [ ] Summary cards load data
  - [ ] Click cards navigate to filtered views
  - [ ] Recent activities update
  - [ ] Module dashboards work
- [ ] **Cross-browser Tests**
  - [ ] Chrome (Windows)
  - [ ] Safari (Mac/iOS)
  - [ ] Firefox
  - [ ] Edge

#### Performance Testing (2h)

- [ ] Lighthouse audit
  - [ ] Performance score > 80
  - [ ] Accessibility score > 90
  - [ ] Best practices score > 90
- [ ] Bundle size check (no increase > 10%)
- [ ] API response times < 500ms

#### User Acceptance Testing (1h)

- [ ] 3-5 key users test all flows
- [ ] Collect feedback
- [ ] Fix critical issues

### Deployment (4h)

#### Pre-deploy Checklist (1h)

- [ ] All phases tested
- [ ] No console errors
- [ ] No broken links
- [ ] Documentation updated
- [ ] Rollback plan ready

#### Deploy Steps (2h)

- [ ] Merge feature branches to develop
- [ ] Deploy to staging
- [ ] Smoke test staging
- [ ] Deploy to production
- [ ] Monitor errors for 2 hours

#### Post-deploy (1h)

- [ ] Send announcement email
- [ ] Monitor error logs
- [ ] Collect user feedback
- [ ] Create quick-fix tickets nếu cần

---

## 📝 Notes & Blockers

### Decisions Made

- [ ] Decision 1: ...
- [ ] Decision 2: ...

### Blockers

- [ ] Blocker 1: ...
- [ ] Blocker 2: ...

### Lessons Learned

- [ ] Lesson 1: ...
- [ ] Lesson 2: ...

---

**Last Updated:** 08/01/2026  
**Next Review:** After each phase completion
