# Phase 6: Testing & QA

**Thời gian:** 15 giờ  
**Ưu tiên:** 🔴 HIGH  
**Trạng thái:** ⏸️ Blocked by Phase 0-5

---

## 🎯 Mục Tiêu

Comprehensive testing trước khi production deployment: Functional, UI/UX, Performance, Cross-browser, Cross-device.

### Testing Pyramid

```
        /\         Unit Tests (skipped - focus on integration)
       /  \
      /────\       Integration Tests (API + Redux)
     /──────\
    /────────\     E2E Tests (Critical paths)
   /──────────\
  /────────────\   Manual QA (Exploratory)
 ────────────────
```

---

## 📦 Deliverables

### 6A. Functional Testing (8h)

- ✅ Test all Phase 0-5 features
- ✅ Regression testing (existing features)
- ✅ Edge cases & error states

### 6B. Performance & Compatibility (4h)

- ✅ Performance testing (Lighthouse)
- ✅ Cross-browser testing
- ✅ Cross-device testing

### 6C. User Acceptance Testing (3h)

- ✅ UAT with stakeholders
- ✅ Feedback collection
- ✅ Bug fixes

---

## 📋 Task Breakdown (15h)

## PHASE 6A: Functional Testing (8h)

### Task 6A.1: Phase 0 Testing - Navigation (1h)

**Test Scope:** navigationHelper + WorkManagementBreadcrumb

**Test Cases:**

| ID    | Test Case                                  | Expected Result                                              | Status |
| ----- | ------------------------------------------ | ------------------------------------------------------------ | ------ |
| P0-01 | Call `WorkRoutes.congViecList(nhanVienId)` | Navigate to `/quanlycongviec/congviec/nhanvien/:id`          | ⏳     |
| P0-02 | Call `WorkRoutes.congViecDetail(id)`       | Navigate to `/quanlycongviec/congviec/:id`                   | ⏳     |
| P0-03 | Call `WorkRoutes.kpiDashboard()`           | Navigate to `/quanlycongviec/kpi/dashboard`                  | ⏳     |
| P0-04 | Breadcrumb on CongViec list page           | Show "Trang chủ > Quản lý công việc > Công việc > Danh sách" | ⏳     |
| P0-05 | Breadcrumb on CongViec detail              | Show "... > Chi tiết công việc"                              | ⏳     |
| P0-06 | Click breadcrumb "Quản lý công việc"       | Navigate to `/quanlycongviec`                                | ⏳     |
| P0-07 | All 40+ navigation calls work              | No console errors                                            | ⏳     |

**Test Script:**

```javascript
// Manual test or Cypress
describe("Phase 0: Navigation", () => {
  it("should navigate using WorkRoutes helpers", () => {
    cy.visit("/quanlycongviec");

    // Test CongViec navigation
    cy.contains("Công việc của tôi").click();
    cy.url().should("include", "/congviec/nhanvien/");

    // Test breadcrumb
    cy.get('[data-testid="breadcrumb"]').should("be.visible");
    cy.get('[data-testid="breadcrumb"]').contains("Công việc");
  });
});
```

---

### Task 6A.2: Phase 1 Testing - Mobile Bottom Nav (1h)

**Test Scope:** useMobileLayout + MobileBottomNav + feature flags

**Test Cases:**

| ID    | Test Case                             | Expected Result                | Status |
| ----- | ------------------------------------- | ------------------------------ | ------ |
| P1-01 | Open on mobile (375px width)          | Bottom nav visible             | ⏳     |
| P1-02 | Open on desktop (1920px)              | Bottom nav hidden              | ⏳     |
| P1-03 | Click "Trang chủ" tab                 | Navigate to dashboard          | ⏳     |
| P1-04 | Click "Công việc" tab                 | Navigate to CongViec dashboard | ⏳     |
| P1-05 | Active tab highlighted                | Blue color + icon filled       | ⏳     |
| P1-06 | Badge on "Thông báo" tab              | Shows count (e.g., "5")        | ⏳     |
| P1-07 | Feature flag `enableMobileNav: false` | Bottom nav hidden on mobile    | ⏳     |
| P1-08 | MainLayout + MainLayoutAble both work | No layout conflicts            | ⏳     |

**Test Script:**

```javascript
describe("Phase 1: Mobile Bottom Nav", () => {
  beforeEach(() => {
    cy.viewport(375, 667); // iPhone SE
  });

  it("should show bottom nav on mobile", () => {
    cy.visit("/quanlycongviec");
    cy.get('[data-testid="mobile-bottom-nav"]').should("be.visible");
    cy.get('[data-testid="mobile-bottom-nav"] button').should("have.length", 5);
  });

  it("should highlight active tab", () => {
    cy.visit("/quanlycongviec/congviec");
    cy.get('[data-testid="tab-congviec"]').should(
      "have.attr",
      "aria-selected",
      "true"
    );
  });
});
```

---

### Task 6A.3: Phase 2 Testing - Dashboard & CongViec UI (3h)

**Test Scope:** UnifiedDashboard + CongViecDashboard + CongViecListPage refactor

**Test Cases:**

| ID                             | Test Case                                 | Expected Result                                             | Status |
| ------------------------------ | ----------------------------------------- | ----------------------------------------------------------- | ------ |
| **2A: Backend APIs**           |                                           |                                                             |        |
| P2-01                          | GET /dashboard/summary                    | Returns congViec, kpi, yeuCau objects                       | ⏳     |
| P2-02                          | GET /congviec/dashboard-summary/:id       | Returns 8 status counts                                     | ⏳     |
| P2-03                          | TinhTrangHan filter QUA_HAN               | Returns only overdue tasks                                  | ⏳     |
| **2B: Unified Dashboard**      |                                           |                                                             |        |
| P2-04                          | Open /quanlycongviec/dashboard            | Show 3 summary cards                                        | ⏳     |
| P2-05                          | Click CongViec card                       | Navigate to CongViec dashboard                              | ⏳     |
| P2-06                          | Click refresh button                      | Re-fetch data                                               | ⏳     |
| P2-07                          | 5-min cache works                         | No API call if < 5 min                                      | ⏳     |
| **2C: CongViec Dashboard**     |                                           |                                                             |        |
| P2-08                          | Open CongViec dashboard                   | Show 8 StatusCards                                          | ⏳     |
| P2-09                          | "Việc tôi nhận" section                   | Shows 4 cards (Đã giao, Đang làm, Chờ duyệt, Hoàn thành)    | ⏳     |
| P2-10                          | "Việc tôi giao" section                   | Shows 4 cards + completion rate                             | ⏳     |
| P2-11                          | "Quá hạn" card (if > 0)                   | Red badge + warning icon                                    | ⏳     |
| P2-12                          | Click "Đang làm" card                     | Navigate to list with filter ?role=received&status=DANG_LAM | ⏳     |
| **2C: CongViec List Refactor** |                                           |                                                             |        |
| P2-13                          | Open list page                            | Show nested tabs (Role + Status)                            | ⏳     |
| P2-14                          | Click "Việc tôi giao" tab                 | URL changes to ?role=assigned                               | ⏳     |
| P2-15                          | Click "Chờ duyệt" tab                     | URL changes to ?role=assigned&status=CHO_DUYET              | ⏳     |
| P2-16                          | Browser back button                       | Navigate back correctly                                     | ⏳     |
| P2-17                          | Deep link ?role=received&status=DA_GIAO   | Opens with correct filters                                  | ⏳     |
| P2-18                          | Mobile: Status chips                      | Shows chips instead of tabs                                 | ⏳     |
| P2-19                          | TrangThai filter removed from FilterPanel | Filter not visible                                          | ⏳     |

**Critical Path Test:**

```javascript
describe("Phase 2: CongViec Dashboard Flow", () => {
  it("should complete full dashboard drill-down flow", () => {
    // 1. Open unified dashboard
    cy.visit("/quanlycongviec/dashboard");
    cy.contains("Công việc của tôi").should("be.visible");

    // 2. Click CongViec card
    cy.contains("Công việc của tôi").click();
    cy.url().should("include", "/congviec/dashboard");

    // 3. Click "Đang làm" card
    cy.contains("Đang làm").click();
    cy.url().should("include", "role=received&status=DANG_LAM");

    // 4. Verify list filtered
    cy.get("table tbody tr").should("exist");

    // 5. Test back navigation
    cy.go("back");
    cy.url().should("include", "/congviec/dashboard");
  });
});
```

---

### Task 6A.4: Phase 3 Testing - Splash & Mobile Layouts (1h)

**Test Cases:**

| ID    | Test Case                                | Expected Result                   | Status |
| ----- | ---------------------------------------- | --------------------------------- | ------ |
| P3-01 | App launch (first time)                  | Splash screen shows for 1s        | ⏳     |
| P3-02 | Splash screen animation                  | Logo fades in, progress bar fills | ⏳     |
| P3-03 | Feature flag `enableSplashScreen: false` | No splash screen                  | ⏳     |
| P3-04 | Open CongViec detail on mobile           | MobileDetailLayout renders        | ⏳     |
| P3-05 | Mobile detail: Back button               | Navigate back                     | ⏳     |
| P3-06 | Mobile detail: Actions menu              | Shows Edit/Delete                 | ⏳     |
| P3-07 | Mobile detail: Content scrollable        | Smooth scroll with momentum       | ⏳     |
| P3-08 | Desktop: Same pages                      | Original layout unchanged         | ⏳     |
| P3-09 | Pull-to-refresh placeholder              | Shows "Đang tải..."               | ⏳     |

---

### Task 6A.5: Phase 4 Testing - Gestures (1h)

**Test Cases:**

| ID    | Test Case                      | Expected Result                | Status |
| ----- | ------------------------------ | ------------------------------ | ------ |
| P4-01 | Pull down on CongViec list     | Refresh indicator appears      | ⏳     |
| P4-02 | Pull > 80px                    | Triggers refresh               | ⏳     |
| P4-03 | Pull < 80px                    | Bounces back                   | ⏳     |
| P4-04 | Swipe left on card             | Right actions revealed         | ⏳     |
| P4-05 | Swipe right on card            | Left actions revealed          | ⏳     |
| P4-06 | Click action button            | Action triggered + card closes | ⏳     |
| P4-07 | Long press 500ms               | Context menu shows             | ⏳     |
| P4-08 | Long press + move              | Menu cancelled                 | ⏳     |
| P4-09 | Haptic feedback (if supported) | Vibrates on trigger            | ⏳     |

**Note:** Gestures require real device testing (not just browser DevTools)

---

### Task 6A.6: Phase 5 Testing - Performance (1h)

**Test Cases:**

| ID    | Test Case                    | Expected Result         | Status |
| ----- | ---------------------------- | ----------------------- | ------ |
| P5-01 | Initial page load            | < 2s FCP                | ⏳     |
| P5-02 | Lighthouse Performance score | > 85                    | ⏳     |
| P5-03 | Initial bundle size          | < 500KB                 | ⏳     |
| P5-04 | Route navigation             | Lazy loads chunk        | ⏳     |
| P5-05 | Heavy component load         | Shows skeleton          | ⏳     |
| P5-06 | Service Worker (if Phase 5B) | Registered successfully | ⏳     |
| P5-07 | Offline mode (if Phase 5B)   | Shows offline page      | ⏳     |

**Lighthouse Test:**

```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run audit
lhci autorun --collect.url=http://localhost:3000/quanlycongviec
```

**Expected Scores:**

- Performance: > 85
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 80

---

## PHASE 6B: Performance & Compatibility (4h)

### Task 6B.1: Cross-Browser Testing (2h)

**Browsers to Test:**

| Browser       | Version | Priority  | Status |
| ------------- | ------- | --------- | ------ |
| Chrome        | Latest  | 🔴 HIGH   | ⏳     |
| Edge          | Latest  | 🟡 MEDIUM | ⏳     |
| Safari        | Latest  | 🔴 HIGH   | ⏳     |
| Firefox       | Latest  | 🟡 MEDIUM | ⏳     |
| Chrome Mobile | Latest  | 🔴 HIGH   | ⏳     |
| Safari iOS    | Latest  | 🔴 HIGH   | ⏳     |

**Test Matrix:**

| Feature        | Chrome | Safari | Firefox | Edge | Chrome Mobile | Safari iOS |
| -------------- | ------ | ------ | ------- | ---- | ------------- | ---------- |
| Navigation     | ⏳     | ⏳     | ⏳      | ⏳   | ⏳            | ⏳         |
| Bottom Nav     | ⏳     | ⏳     | ⏳      | ⏳   | ⏳            | ⏳         |
| Dashboard      | ⏳     | ⏳     | ⏳      | ⏳   | ⏳            | ⏳         |
| Mobile Layouts | ⏳     | ⏳     | ⏳      | ⏳   | ⏳            | ⏳         |
| Gestures       | N/A    | N/A    | N/A     | N/A  | ⏳            | ⏳         |

**Common Issues:**

- Safari: Sticky positioning, CSS Grid bugs
- Firefox: Flexbox inconsistencies
- iOS: Touch event handling, scroll momentum

---

### Task 6B.2: Cross-Device Testing (2h)

**Devices to Test:**

| Device             | Screen Size | Viewport     | Priority  | Status |
| ------------------ | ----------- | ------------ | --------- | ------ |
| iPhone SE          | 375x667     | Small        | 🔴 HIGH   | ⏳     |
| iPhone 12 Pro      | 390x844     | Medium       | 🔴 HIGH   | ⏳     |
| Samsung Galaxy S21 | 360x800     | Medium       | 🟡 MEDIUM | ⏳     |
| iPad               | 768x1024    | Tablet       | 🟡 MEDIUM | ⏳     |
| iPad Pro           | 1024x1366   | Large tablet | 🟢 LOW    | ⏳     |
| Desktop            | 1920x1080   | Desktop      | 🔴 HIGH   | ⏳     |

**Test Checklist per Device:**

- [ ] Layout renders correctly
- [ ] Text readable (no overflow)
- [ ] Touch targets ≥ 48px
- [ ] No horizontal scroll
- [ ] Images load correctly
- [ ] Forms usable
- [ ] Gestures work (mobile only)

**Tool:** BrowserStack or real devices

---

## PHASE 6C: User Acceptance Testing (3h)

### Task 6C.1: Prepare UAT Environment (0.5h)

**Setup:**

1. Deploy to staging server
2. Create test user accounts
3. Seed test data (congviec, kpi, yeuCau)
4. Prepare UAT checklist

**UAT URL:** `https://staging.hospital-mgmt.com`

---

### Task 6C.2: Conduct UAT Sessions (2h)

**Participants:**

- Product Owner / Business Analyst
- End users (2-3 managers, 2-3 staff)
- QA lead

**UAT Scenarios:**

1. **Scenario 1: Dashboard Navigation (15 min)**

   - Login as manager
   - View unified dashboard
   - Click into CongViec dashboard
   - Drill down to filtered list
   - Navigate back

2. **Scenario 2: Mobile Usage (20 min)**

   - Login on mobile device
   - Use bottom navigation
   - View CongViec detail
   - Pull to refresh
   - Swipe card actions

3. **Scenario 3: Existing Features Still Work (15 min)**

   - Create new CongViec
   - Edit CongViec
   - Add comment
   - Upload file
   - Delete CongViec

4. **Scenario 4: Performance Check (10 min)**
   - Load dashboard (measure time)
   - Navigate between pages
   - Check loading states
   - Verify no errors

**Feedback Form:**

```markdown
# UAT Feedback Form

**Tester:** ******\_\_\_******  
**Date:** ******\_\_\_******  
**Device:** ******\_\_\_******

## Scenarios Tested

- [ ] Scenario 1: Dashboard Navigation
- [ ] Scenario 2: Mobile Usage
- [ ] Scenario 3: Existing Features
- [ ] Scenario 4: Performance

## Issues Found

| ID  | Severity | Description | Screenshot |
| --- | -------- | ----------- | ---------- |
| 1   | Critical | ...         | ...        |
| 2   | Major    | ...         | ...        |
| 3   | Minor    | ...         | ...        |

## Overall Feedback

- Usability (1-5): \_\_\_
- Performance (1-5): \_\_\_
- Design (1-5): \_\_\_

**Comments:** ******\_\_\_******
```

---

### Task 6C.3: Bug Fixes & Retesting (0.5h)

**Bug Prioritization:**

| Severity | Fix Deadline | Example                    |
| -------- | ------------ | -------------------------- |
| Critical | Same day     | App crash, data loss       |
| Major    | 1-2 days     | Feature broken, wrong data |
| Minor    | 1 week       | UI glitch, typo            |
| Cosmetic | Optional     | Color inconsistency        |

**Retest after fixes:**

- [ ] Critical bugs fixed
- [ ] Major bugs fixed
- [ ] Regression testing (ensure fixes didn't break other features)

---

## ✅ Success Criteria

### Functional

- [ ] All Phase 0-5 features work as expected
- [ ] No critical/major bugs
- [ ] < 5 minor bugs
- [ ] Regression testing passed

### Performance

- [ ] Lighthouse score > 85
- [ ] FCP < 1.5s, LCP < 2.5s, TTI < 3s
- [ ] Initial bundle < 500KB

### Compatibility

- [ ] Works on Chrome, Safari, Firefox, Edge
- [ ] Works on iPhone, Android, iPad, Desktop
- [ ] No browser-specific bugs

### UAT

- [ ] Stakeholders approve features
- [ ] Users satisfied with UX
- [ ] All critical feedback addressed

---

## 🧪 Testing Tools

**Manual Testing:**

- Chrome DevTools (Device mode)
- Safari Web Inspector
- Firefox Developer Tools

**Automated Testing:**

- Cypress (E2E tests)
- Lighthouse CI (Performance)
- React Testing Library (Component tests - optional)

**Cross-Device:**

- BrowserStack
- Real devices (iPhone, Android, iPad)

**Performance:**

```bash
npm install -g lighthouse
lighthouse http://localhost:3000/quanlycongviec --view
```

---

## 🚧 Dependencies

**Required:**

- ⚠️ **Phase 0-5** - All features must be implemented

**Optional:**

- None

---

## 🚨 Risks & Mitigation

| Risk                      | Mitigation                                                                 |
| ------------------------- | -------------------------------------------------------------------------- |
| Many bugs found           | - Prioritize critical bugs<br>- Extend testing phase<br>- Defer minor bugs |
| Browser incompatibilities | - Test early<br>- Polyfills<br>- Feature flags                             |
| Performance regressions   | - Lighthouse CI in pipeline<br>- Performance budget                        |
| UAT delays                | - Schedule in advance<br>- Async feedback collection                       |

---

## 📝 Test Execution Tracking

**Day 1 (8h):**

- Morning: Phase 0-2 testing
- Afternoon: Phase 3-5 testing
- Evening: Document bugs

**Day 2 (4h):**

- Morning: Cross-browser testing
- Afternoon: Cross-device testing

**Day 3 (3h):**

- Morning: UAT session
- Afternoon: Bug fixes + retesting

---

## 📊 Test Metrics

**Track:**

- Test cases executed: **_ / _**
- Pass rate: \_\_\_%
- Bugs found: \_\_\_
  - Critical: \_\_\_
  - Major: \_\_\_
  - Minor: \_\_\_
- Bugs fixed: \_\_\_
- Lighthouse score: \_\_\_

---

**Deployment:** After Phase 6 passes, deploy to production! 🚀
