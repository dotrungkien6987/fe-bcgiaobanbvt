# 🎯 Kế Hoạch Hợp Nhất: PWA + UX/UI Enhancement 2026

**Ngày bắt đầu:** 09/01/2026  
**Trạng thái:** � Phase 2 Complete - Phase 3 Ready  
**Phiên bản:** 2.1 (Revised)  
**Tổng thời gian:** ~126.5 giờ (~16 ngày làm việc, ~5 tháng @ 60% capacity)  
**⚠️ Revision:** Saved 13.5h from reusing existing implementations (PullToRefresh, Service Worker)

> **📍 HỘI THOẠI MỚI?** Đọc [CONTEXT_FOR_NEW_CONVERSATION.md](./CONTEXT_FOR_NEW_CONVERSATION.md) trước!

---

## 📊 Executive Summary

### Nguồn Gốc

Kế hoạch này hợp nhất từ 2 plans trước:

- **PWA_CONVERSION** (docs/PWA_CONVERSION/) - Mobile-first infrastructure, gestures, performance
- **UX_IMPROVEMENT_2026** (docs/UX_IMPROVEMENT_2026/) - Navigation unification, dashboard architecture

**Quyết định:** Git reset --hard về clean state, làm lại từ đầu với 1 kế hoạch duy nhất.

### Mục Tiêu

1. ✅ **Navigation Consistency** - Tất cả routes về `/quanlycongviec/*` prefix
2. ✅ **Native Mobile Experience** - Bottom nav, gestures, splash, skeleton
3. ✅ **Dashboard Architecture** - Visual overview thay vì flat lists
4. ✅ **"Công việc của tôi" Redesign** - CongViecByNhanVienPage (716 dòng) → Dashboard + Nested tabs
5. ✅ **Performance Optimization** - Bundle split, lazy loading, offline support
6. ✅ **Dual Theme Support** - Works with both MainLayout (Basic) and MainLayoutAble (Able)

### Phạm Vi KHÔNG Bao Gồm

- ❌ Desktop navigation changes (sidebar/drawer preserved 100%)
- ❌ Non-QuanLyCongViec modules (BenhNhan, BaoCao, SuCo - defer to future)
- ❌ Real-time WebSocket notifications (use polling for now)

---

## 🗺️ Tổng Quan 8 Phases

```
Timeline: 16 ngày làm việc (126.5 giờ - revised from 140h)

┌────────────┬────────────┬────────────┬────────────┬────────────┐
│  Tuần 1-2  │  Tuần 3-4  │  Tuần 5-6  │  Tuần 7-8  │  Tuần 9+   │
├────────────┼────────────┼────────────┼────────────┼────────────┤
│  PHASE 0   │  PHASE 2   │  PHASE 3   │  PHASE 4   │  PHASE 6   │
│Navigation  │ Dashboard  │Splash+     │ Gestures   │  Testing   │
│  (24h) ✅  │  (44h) ✅  │Layouts     │   (5h) ⬇️  │   (15h)    │
│            │            │ (28.5h) ⬇️ │            │            │
│            │  PHASE 1   │            │  PHASE 5   │            │
│            │ Mobile Nav │            │Performance │            │
│            │  (5h) ✅   │            │  (4h) ⬇️   │            │
└────────────┴────────────┴────────────┴────────────┴────────────┘

✅ Complete  ⬇️ Reduced effort (existing implementations reused)
```

### Dependency Graph

```
                    PHASE 0: Navigation Refactor (24h)
                            │ BLOCKS ALL
        ┌───────────────────┴───────────────────┐
        ▼                                       ▼
  PHASE 1: Mobile Nav (5h)             PHASE 2: Dashboard (40h)
        │                                       │
        │                                       ├─► 2A: Backend APIs (2h)
        │                                       ├─► 2B: Unified Dashboard (15h)
        │                                       └─► 2C: CongViec UI/UX (23h)
        │                                               │
        └───────────────────┬───────────────────────────┘
                            ▼
                   PHASE 3: Splash + Layouts (33h)
                            │
        ┌───────────────────┴───────────────────┐
        ▼                                       ▼
  PHASE 4: Gestures (8h)              PHASE 5: Performance (10h)
        │                                       │
        └───────────────────┬───────────────────┘
                            ▼
                   PHASE 6: Testing (15h)
```

---

## 📋 Phase Summaries

### **Phase 0: Navigation Refactor (24h) - 🔴 BLOCKING**

**File chi tiết:** [PHASE_0_NAVIGATION.md](./PHASE_0_NAVIGATION.md)

**Mục tiêu:** Chuẩn hóa tất cả routes về `/quanlycongviec/*` prefix

**Deliverables:**

- [ ] `src/utils/navigationHelper.js` - 40+ route builder methods
- [ ] `src/features/QuanLyCongViec/components/WorkManagementBreadcrumb.js` - Auto breadcrumb
- [ ] Updated `src/routes/index.js` - All routes unified
- [ ] 40+ files updated with new navigation calls
- [ ] Updated menu items (MainLayout + MainLayoutAble)

**Critical:** BLOCKS tất cả phases khác

---

### **Phase 1: Mobile Bottom Navigation (5h) - 🔴 HIGH**

**File chi tiết:** [PHASE_1_MOBILE_NAV.md](./PHASE_1_MOBILE_NAV.md)

**Mục tiêu:** Bottom navigation bar cho mobile (5 tabs)

**Deliverables:**

- [ ] `src/hooks/useMobileLayout.js` - Mobile detection + theme-aware
- [ ] `src/components/MobileBottomNav.js` - 5-tab bottom nav
- [ ] `src/config/featureFlags.js` - PWA feature toggles
- [ ] MainLayout + MainLayoutAble integration
- [ ] Badge notifications on tabs

**Dependencies:** Phase 0 (needs routes)

---

### **Phase 2: Dashboard Architecture (40h) - 🔴 HIGH**

**File chi tiết:** [PHASE_2_DASHBOARD.md](./PHASE_2_DASHBOARD.md)

**Mục tiêu:** Tạo dashboard system + "Công việc của tôi" redesign

**Deliverables:**

#### **2A. Backend APIs (2h)**

- [ ] `GET /workmanagement/dashboard/summary` - Unified dashboard data
- [ ] `GET /workmanagement/congviec/dashboard-summary/:nhanVienId` - CongViec stats

#### **2B. Unified Dashboard (15h)**

- [ ] `UnifiedDashboardPage.js` - Entry point with 3 module summaries
- [ ] `CongViecSummaryCard.js` - Task stats card
- [ ] `KPISummaryCard.js` - KPI stats card
- [ ] `TicketSummaryCard.js` - Ticket stats card
- [ ] Redux `dashboardSlice` with 5-min cache

#### **2C. "Công việc của tôi" UI/UX (23h)** ⭐ CORE FEATURE

**2C.1 Dashboard Pages (14h):**

- [ ] `CongViecDashboardPage.js` - Visual overview with 8 StatusCards
- [ ] `StatusCard.js` - Clickable status card component
- [ ] Mobile responsive layout (2-column → stack)
- [ ] Integration with navigationHelper breadcrumbs

**2C.2 List Page Refactor (14h):**

- [ ] Rename `CongViecByNhanVienPage.js` → `CongViecListPage.js`
- [ ] `CongViecNestedTabs.js` - Two-level tabs (Role × Status)
- [ ] URL params sync (`?role=received&status=DA_GIAO`)
- [ ] Remove TrangThai from FilterPanel (replaced by tabs)
- [ ] Extract hooks: `useCongViecFilters()`, `useCongViecPagination()`
- [ ] Backend: Move `TinhTrangHan` filter to server-side (+2h)

**Navigation Flow:**

```
Menu "Công việc của tôi" → CongViecDashboardPage (overview)
                               ↓ Click StatusCard
                          CongViecListPage (filtered)
```

**Dependencies:** Phase 0 (needs routes + breadcrumbs)

---

### **Phase 3: Splash + Mobile Layouts (33h) - 🟡 MEDIUM**

**File chi tiết:** [PHASE_3_SPLASH_LAYOUTS.md](./PHASE_3_SPLASH_LAYOUTS.md)

**Mục tiêu:** Loading UX + Responsive detail pages

**Deliverables:**

#### **3A. Splash & Skeleton (5h)**

- [ ] `SplashScreen.jsx` - Framer Motion animation
- [ ] `Skeletons.jsx` - PageSkeleton, CardListSkeleton, FormSkeleton
- [ ] Suspense boundaries in `App.js`

#### **3B. Mobile Detail Layouts (28h)**

- [ ] `MobileDetailLayout.js` - Reusable responsive wrapper (tabs mobile, 2-col desktop)
- [ ] Refactor `CongViecDetailPage.js` - Extract 4 sections (Info, Progress, Files, Comments)
- [ ] Refactor `CycleAssignmentDetailPage.js` - 1,299 lines → modular
- [ ] Fixed bottom action bar (Save/Cancel)
- [ ] Mobile testing on real devices

**Dependencies:** Phase 0 (breadcrumbs), Phase 1 (mobile detection hook)

---

### **Phase 4: Gesture System (8h) - 🔴 HIGH**

**File chi tiết:** [PHASE_4_GESTURES.md](./PHASE_4_GESTURES.md)

**Mục tiêu:** Native gestures across all modules

**Deliverables:**

- [ ] Generalize Ticket patterns to `src/components/@extended/mobile/`
- [ ] `PullToRefreshWrapper.jsx` - Apply to all list views
- [ ] `SwipeableCard.jsx` - Swipe actions
- [ ] `LongPressMenu.jsx` - Context menu
- [ ] Apply to 6+ modules: BenhNhan, BaoCao, SuCo, KPI, DaoTao, CongViec tables

**Dependencies:** Phase 1 (mobile detection), Phase 3 (layouts)

---

### **Phase 5: Performance Optimization (10h) - 🟡 MEDIUM**

**File chi tiết:** [PHASE_5_PERFORMANCE.md](./PHASE_5_PERFORMANCE.md)

**Mục tiêu:** Bundle optimization + Offline support

**Deliverables:**

#### **5A. Route Lazy Loading (4h)**

- [ ] Convert 50+ routes to `React.lazy()`
- [ ] Bundle split: 2.5MB → 0.8MB main chunk
- [ ] Suspense boundaries with skeletons

#### **5B. Offline Strategy (6h)** - OPTIONAL

- [ ] Service Worker API caching strategies
- [ ] IndexedDB queue for offline mutations
- [ ] Auto-sync when online
- [ ] Offline mode banner UI

**Dependencies:** Phase 3 (skeletons for Suspense)

---

### **Phase 6: Testing & Deploy (15h) - 🔴 FINAL**

**File chi tiết:** [PHASE_6_TESTING.md](./PHASE_6_TESTING.md)

**Mục tiêu:** Comprehensive testing + Production deployment

**Deliverables:**

- [ ] Navigation flow testing (20+ scenarios)
- [ ] Dashboard data accuracy testing
- [ ] Mobile gesture testing (iOS + Android)
- [ ] Cross-browser testing (Chrome, Safari, Firefox, Edge)
- [ ] Performance testing (Lighthouse score > 90)
- [ ] Accessibility audit
- [ ] Deployment checklist
- [ ] User communication plan

**Dependencies:** All phases 0-5 complete

---

## 📊 Chi Phí Chi Tiết

| Phase       | Frontend | Backend | Testing | Total    | Priority |
| ----------- | -------- | ------- | ------- | -------- | -------- |
| **Phase 0** | 20h      | 0h      | 4h      | **24h**  | 🔴 BLOCK |
| **Phase 1** | 5h       | 0h      | 0h      | **5h**   | 🔴 HIGH  |
| **Phase 2** | 30h      | 2h      | 8h      | **40h**  | 🔴 HIGH  |
| **Phase 3** | 28h      | 0h      | 5h      | **33h**  | 🟡 MED   |
| **Phase 4** | 8h       | 0h      | 0h      | **8h**   | 🔴 HIGH  |
| **Phase 5** | 10h      | 0h      | 0h      | **10h**  | 🟡 MED   |
| **Phase 6** | 0h       | 0h      | 15h     | **15h**  | 🔴 FINAL |
| **TOTAL**   | **101h** | **2h**  | **32h** | **135h** |          |

**Breakdown by Role:**

- **Frontend Developer:** 101 giờ
- **Backend Developer:** 2 giờ (can parallelize)
- **QA/Tester:** 32 giờ (integrated in phases + final)

**Timeline Estimates:**

- **1 Full-time Dev (8h/day):** 18 ngày làm việc (3.5 tuần)
- **1 Dev @ 60% capacity:** ~30 ngày (6 tuần / 1.5 tháng)
- **2 Parallel Devs:** ~10 ngày (2 tuần)

---

## 🎯 Success Criteria

### Functional Requirements

- [ ] **Navigation:** Tất cả routes dùng `/quanlycongviec/*`, no broken links
- [ ] **Breadcrumbs:** Hiển thị đúng trên tất cả pages
- [ ] **Mobile Nav:** Bottom nav 5 tabs, thumb-friendly (iOS + Android)
- [ ] **Dashboard:** Load đủ 3 modules summary < 2s
- [ ] **CongViec UI:** Dashboard overview → drill-down to filtered lists
- [ ] **Responsive:** 320px (mobile) - 1920px (desktop), no overflow
- [ ] **Gestures:** Pull-to-refresh + Swipe actions on 6+ modules
- [ ] **Performance:** Lighthouse Mobile score > 90

### Non-Functional Requirements

- [ ] **Page Load:** < 2 seconds (3G network)
- [ ] **Bundle Size:** Main chunk < 1MB (hiện tại 2.5MB)
- [ ] **Accessibility:** WCAG 2.1 AA, score > 90
- [ ] **Browser Support:** Chrome 90+, Safari 14+, Firefox 88+, Edge 90+
- [ ] **Zero Console Errors:** Production deployment
- [ ] **Dual Theme:** Works on both Basic + Able themes

---

## 🚨 Risks & Mitigation

| Risk                          | Probability | Impact    | Mitigation                                                                                                              |
| ----------------------------- | ----------- | --------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Breaking bookmarked links** | 🟡 Medium   | 🟡 Medium | - Email users 1 week before<br>- 404 page with redirect guide<br>- Optional: Add temporary redirects                    |
| **Redux state conflicts**     | 🟢 Low      | 🔴 High   | - Clear state on unmount<br>- Separate slices (dashboard vs congviec)<br>- Unit tests for thunks                        |
| **Mobile layout bugs**        | 🟡 Medium   | 🟡 Medium | - Test on 3+ devices<br>- Chrome DevTools + BrowserStack<br>- Incremental rollout with feature flags                    |
| **Dashboard API performance** | 🟢 Low      | 🟡 Medium | - MongoDB indexes on `TrangThai`, `NguoiChinhID`<br>- 5-min frontend cache<br>- Parallel aggregations (`Promise.all()`) |
| **Dual theme conflicts**      | 🟢 Low      | 🟡 Medium | - Test on BOTH themes each commit<br>- Shared `useMobileLayout` hook<br>- Theme-agnostic components                     |
| **Scope creep**               | 🟡 Medium   | 🔴 High   | - Strict phase boundaries<br>- Feature flags to disable incomplete work<br>- "No" to new features mid-project           |

---

## 📞 Communication Plan

### Trước Khi Bắt Đầu (Ngày 0)

- [ ] Review plan với team lead
- [ ] Thông báo users về upcoming route changes
- [ ] Document route mapping (old → new) for support team
- [ ] Setup feature flags in `.env`

### Trong Khi Dev (Tuần 1-8)

- [ ] Daily standup updates (15 min)
- [ ] Demo sau mỗi phase complete
- [ ] Collect feedback từ 2-3 key users
- [ ] Update PROGRESS_TRACKER.md mỗi ngày

### Trước Deploy (Tuần 9)

- [ ] UAT với 5 users (1 admin, 2 managers, 2 staff)
- [ ] Final walkthrough demo
- [ ] Prepare rollback plan
- [ ] Communication email draft

### Sau Deploy (Ngày 1+)

- [ ] Monitor errors 48h đầu
- [ ] Quick fix session (reserve 4h)
- [ ] Collect user feedback survey
- [ ] Retrospective meeting

---

## 🔗 Quick Links

### Phase Documents

- [Phase 0: Navigation Refactor](./PHASE_0_NAVIGATION.md) - 24h, BLOCKS ALL
- [Phase 1: Mobile Bottom Nav](./PHASE_1_MOBILE_NAV.md) - 5h
- [Phase 2: Dashboard Architecture](./PHASE_2_DASHBOARD.md) - 40h ⭐ CORE
- [Phase 3: Splash + Mobile Layouts](./PHASE_3_SPLASH_LAYOUTS.md) - 33h
- [Phase 4: Gesture System](./PHASE_4_GESTURES.md) - 8h
- [Phase 5: Performance Optimization](./PHASE_5_PERFORMANCE.md) - 10h
- [Phase 6: Testing & Deploy](./PHASE_6_TESTING.md) - 15h

### Reference Docs

- [Context for New Conversation](./CONTEXT_FOR_NEW_CONVERSATION.md) - Hội thoại mới bắt đầu từ đây!
- [Progress Tracker](./PROGRESS_TRACKER.md) - Real-time progress
- [Route Mapping Table](./ROUTE_MAPPING_REFERENCE.md) - Old vs New routes
- [Feature Flags Guide](./FEATURE_FLAGS_GUIDE.md) - Toggle PWA features

### Archived Plans (Reference Only)

- [docs/PWA_CONVERSION/](../PWA_CONVERSION/) - Original PWA plan (3,600+ lines)
- [docs/UX_IMPROVEMENT_2026/](../UX_IMPROVEMENT_2026/) - Original UX plan (2,500+ lines)

---

## 📝 Change Log

| Date       | Version | Changes                                  | Author       |
| ---------- | ------- | ---------------------------------------- | ------------ |
| 09/01/2026 | 2.0     | Unified plan created, merged PWA + UX    | AI Assistant |
| 09/01/2026 | 2.1     | Added Phase 2C (CongViec UI/UX redesign) | AI Assistant |

---

**Next Action:**

1. ✅ Review master plan với team
2. ✅ Setup git branch: `feature/pwa-ux-unified-2026`
3. ➡️ Bắt đầu **Phase 0** (Navigation Refactor)

**Estimated Start:** Ready to begin  
**Estimated Completion:** ~6 tháng (1 dev @ 60% capacity)
