# 📊 Progress Tracker - Unified Plan 2026

**Last Updated:** 09/01/2026  
**Current Phase:** Not Started  
**Total Progress:** 0 / 140 hours (0%)

---

## 🎯 Overall Status

```
Progress: [░░░░░░░░░░░░░░░░░░░░] 0%

Phase 0: [░░░░░░░░░░] 0 / 24h
Phase 1: [░░░░░░░░░░] 0 / 5h
Phase 2: [░░░░░░░░░░] 0 / 40h
Phase 3: [░░░░░░░░░░] 0 / 33h
Phase 4: [░░░░░░░░░░] 0 / 8h
Phase 5: [░░░░░░░░░░] 0 / 10h
Phase 6: [░░░░░░░░░░] 0 / 15h
```

---

## Phase 0: Navigation Refactor (0 / 24h) 🔴 BLOCKING

**Status:** ⏳ Not Started  
**Priority:** 🔴 CRITICAL - BLOCKS ALL OTHER PHASES  
**Started:** -  
**Expected Completion:** -

### Tasks

- [ ] **0.1 Create navigationHelper.js (4h)**

  - [ ] Define WorkRoutes object with 40+ route builder methods
  - [ ] Add JSDoc documentation for each method
  - [ ] Export helper functions (buildBreadcrumbs, etc.)

- [ ] **0.2 Create WorkManagementBreadcrumb.js (3h)**

  - [ ] Auto-generate breadcrumbs from location
  - [ ] Handle all QuanLyCongViec routes
  - [ ] Responsive design (hide on mobile)

- [ ] **0.3 Update routes/index.js (4h)**

  - [ ] Migrate all routes to `/quanlycongviec/*`
  - [ ] Update route configurations
  - [ ] Test all route transitions

- [ ] **0.4 Update Navigation Calls (8h)**

  - [ ] CongViec module (5 files)
  - [ ] Ticket/YeuCau module (6 files)
  - [ ] KPI module (2 files)
  - [ ] Menu items (2 files)
  - [ ] Redux thunks (3 files)
  - [ ] Other references (10+ files)

- [ ] **0.5 Integration & Testing (5h)**
  - [ ] Integrate breadcrumbs in 8+ pages
  - [ ] Test all navigation flows
  - [ ] Verify no broken links
  - [ ] Cross-browser testing
  - [ ] Documentation

### Blockers

- None (can start immediately)

### Notes

- This phase MUST complete before any other work
- Breaking change - communicate to team before deploy

---

## Phase 1: Mobile Bottom Navigation (0 / 5h) 🔴 HIGH

**Status:** ⏸️ Blocked by Phase 0  
**Priority:** 🔴 HIGH  
**Started:** -  
**Expected Completion:** -

### Tasks

- [ ] **1.1 Create useMobileLayout.js (1h)**

  - [ ] Mobile detection logic
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
