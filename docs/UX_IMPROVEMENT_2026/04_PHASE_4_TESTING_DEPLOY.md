# ✅ PHASE 4: Testing & Deployment

**Timeline:** Ngày 10-11 (10 giờ)  
**Priority:** 🟢 LOW (nhưng bắt buộc trước deploy)  
**Dependencies:** Tất cả phases 1-3 hoàn thành  
**Status:** 📋 Planning

> **📍 RESUME POINT:** Nếu bắt đầu hội thoại mới, đọc [PROGRESS_TRACKER.md](./PROGRESS_TRACKER.md) để xem checkpoint hiện tại

---

## 🎯 Objectives

1. ✅ Test toàn bộ 17 scenarios critical
2. ✅ Cross-browser & device testing
3. ✅ Performance benchmarks
4. ✅ Deploy & rollout an toàn

---

## 🧪 Test Scenarios (6h)

### 1. Navigation Tests (2h)

#### Scenario 1: Menu Navigation

```
✅ PASS CRITERIA:
- Click "Dashboard" menu → Loads /quanlycongviec/dashboard
- Click "Công việc" menu → Loads dashboard or list
- Active menu item highlighted correctly
- Browser back button returns to previous page
```

**Test Steps:**

```javascript
// Cypress test
describe("Menu Navigation", () => {
  it("navigates from dashboard to detail and back", () => {
    cy.visit("/quanlycongviec/dashboard");
    cy.get('[data-testid="congviec-card"]').click();
    cy.url().should("include", "/quanlycongviec/congviec/dashboard");
    cy.go("back");
    cy.url().should("include", "/dashboard");
  });
});
```

#### Scenario 2: Breadcrumb Navigation

```
✅ PASS CRITERIA:
- All breadcrumb links clickable
- Navigate back to parent pages correctly
- Current page not clickable (no link)
```

#### Scenario 3: Deep Links

```
✅ PASS CRITERIA:
- Copy detail page URL → Paste in new tab → Loads correctly
- Bookmark a page → Reopen → Works
- URL params preserved (filters, tab states)
```

#### Scenario 4: Browser History

```
✅ PASS CRITERIA:
- Back button navigates correctly
- Forward button works
- No duplicate history entries
```

---

### 2. Mobile Responsive Tests (2h)

#### Scenario 5: Mobile Detail Pages

```
DEVICES: iPhone 12 (375px), iPad (768px), Android (360px)

✅ PASS CRITERIA:
- Stacked layout on mobile (<960px)
- Two-column on desktop (≥960px)
- Tabs scrollable horizontally
- Touch targets ≥44px
- No horizontal scroll
- Bottom action bar fixed and visible
```

**Test Steps:**

```javascript
// Cypress mobile test
describe("Mobile CongViecDetailPage", () => {
  beforeEach(() => {
    cy.viewport("iphone-12");
  });

  it("shows stacked layout and bottom actions", () => {
    cy.visit("/quanlycongviec/congviec/123");
    cy.get('[data-testid="mobile-tabs"]').should("be.visible");
    cy.get('[data-testid="bottom-action-bar"]').should("be.visible");
    // Check for no horizontal scroll
    cy.window().then((win) => {
      expect(win.scrollX).to.equal(0);
      cy.get("body").invoke("width").should("be.lte", 375);
    });
  });
});
```

#### Scenario 6: Touch Gestures

```
✅ PASS CRITERIA:
- Tap on cards/buttons responds quickly (<100ms)
- Swipe on tables/lists works
- No accidental double-tap zoom
```

---

### 3. Dashboard Tests (1h)

#### Scenario 7: Summary Cards Load

```
✅ PASS CRITERIA:
- All 3 cards load data within 2 seconds
- Loading skeletons show immediately
- Error states show friendly message
- Counts match actual data
```

#### Scenario 8: Click Cards Navigate

```
✅ PASS CRITERIA:
- Click "Cần xử lý (5)" chip → Navigate to filtered list
- URL includes filter params
- Filtered list shows exactly 5 items
```

#### Scenario 9: Recent Activities

```
✅ PASS CRITERIA:
- Shows last 10 activities
- Click activity → Navigate to detail
- Time ago formatting correct ("2h trước", "1 ngày")
```

---

### 4. Error Handling Tests (1h)

#### Scenario 10: 404 Not Found

```
✅ PASS CRITERIA:
- Navigate to /quanlycongviec/nonexistent → 404 page
- 404 page shows helpful message
- "Go back" button works
```

#### Scenario 11: API Errors

```
✅ PASS CRITERIA:
- Backend down → Shows error boundary
- Timeout → Shows retry button
- Network error → Shows offline indicator
```

#### Scenario 12: Invalid Data

```
✅ PASS CRITERIA:
- Detail page with invalid ID → Error message
- Missing required params → Redirect to list
```

---

## 🌐 Cross-Browser Testing (2h)

### Browsers to Test

| Browser | Version | Platform | Priority  |
| ------- | ------- | -------- | --------- |
| Chrome  | Latest  | Windows  | 🔴 High   |
| Safari  | Latest  | macOS    | 🔴 High   |
| Firefox | Latest  | Windows  | 🟡 Medium |
| Edge    | Latest  | Windows  | 🟡 Medium |
| Safari  | iOS 15+ | iPhone   | 🔴 High   |
| Chrome  | Latest  | Android  | 🟡 Medium |

### Scenario 13: Cross-Browser Navigation

```
✅ PASS CRITERIA (each browser):
- All navigation flows work
- No console errors
- CSS layout consistent
- Fonts render correctly
```

### Known Browser Issues to Check:

- Safari: Date picker format
- Firefox: Flexbox gaps
- Edge: CSS Grid support
- Mobile Safari: Fixed position + keyboard

---

## ⚡ Performance Testing (2h)

### Scenario 14: Lighthouse Audit

**Target Scores:**

```
Performance:   >80 (mobile), >90 (desktop)
Accessibility: >90
Best Practices: >90
SEO:           >80
```

**Run audit:**

```bash
npm run lighthouse -- --url=http://localhost:3000/quanlycongviec/dashboard
```

### Scenario 15: Bundle Size

```
✅ PASS CRITERIA:
- Initial bundle < 2.5MB (no increase from baseline)
- Lazy-loaded routes work
- No unused dependencies
```

**Check size:**

```bash
npm run build
npm run analyze  # webpack-bundle-analyzer
```

### Scenario 16: API Response Times

```
✅ PASS CRITERIA:
- Dashboard summary API: <500ms
- Detail page API: <300ms
- No N+1 queries
```

**Test with:**

```bash
# Backend performance test
npm run test:perf
```

---

## 🚀 Deployment Plan (2h)

### Pre-Deployment Checklist

#### Code Quality

- [ ] All tests passing (`npm test`)
- [ ] No console.log in production code
- [ ] No TODO comments for critical issues
- [ ] ESLint warnings < 10
- [ ] TypeScript errors = 0 (if applicable)

#### Documentation

- [ ] README updated with route changes
- [ ] CHANGELOG.md updated
- [ ] Migration guide sent to team
- [ ] API docs updated (if backend changes)

#### Database

- [ ] DB indexes added (see Phase 3 backend)
- [ ] Migration scripts tested
- [ ] Backup created

### Deployment Steps

#### Step 1: Staging Deploy (30 min)

```bash
# Deploy to staging environment
npm run build
npm run deploy:staging

# Smoke test staging
npm run test:smoke -- --env=staging
```

**Smoke Test Checklist:**

- [ ] Homepage loads
- [ ] Login works
- [ ] Dashboard loads
- [ ] Navigate to detail page
- [ ] Create new CongViec
- [ ] No errors in browser console
- [ ] No errors in server logs

#### Step 2: UAT (User Acceptance Testing) (1h)

```
TESTERS: 3-5 key users (1 admin, 2 managers, 2 employees)

TEST FLOWS:
1. Admin: Create cycle → Assign duties → View dashboard
2. Manager: View dashboard → Evaluate KPI → Approve
3. Employee: View dashboard → Self-assess → Submit task
```

**UAT Feedback Template:**

```markdown
## UAT Feedback - [Tên người test]

**Ngày:** 08/01/2026  
**Môi trường:** Staging  
**Browser:** Chrome 120 / Windows 11

### Issues Found:

- [ ] Issue 1: ...
- [ ] Issue 2: ...

### Positive Feedback:

- ...

### Suggestions:

- ...
```

#### Step 3: Production Deploy (30 min)

```bash
# Final checks
git checkout main
git pull origin main
npm run lint
npm test

# Build production
NODE_ENV=production npm run build

# Deploy
npm run deploy:production

# Monitor
npm run logs:production -- --follow
```

#### Step 4: Post-Deploy Monitoring (2 hours)

**Monitor these metrics:**

```javascript
// Setup monitoring alerts
const ALERT_THRESHOLDS = {
  errorRate: 0.1, // >0.1% error rate
  p95ResponseTime: 2000, // >2s response time
  crashRate: 0.01, // >0.01% crash rate
};
```

**Check every 30 minutes:**

- [ ] Error logs (no new critical errors)
- [ ] API response times (< 500ms p95)
- [ ] User feedback (no major complaints)
- [ ] Browser console errors (check Sentry)

---

## 📞 Communication Plan

### T-2 days (Before Deploy)

**Email to team:**

```
Subject: [THÔNG BÁO] Cập nhật giao diện Quản lý Công việc

Kính gửi anh/chị,

Hệ thống sẽ có cập nhật giao diện vào ngày 10/01/2026, 8pm.
Thay đổi chính:
- URL mới cho tất cả trang (/quanlycongviec/*)
- Dashboard tổng hợp mới
- Giao diện mobile cải thiện

LƯU Ý: Bookmarks cũ sẽ không hoạt động, vui lòng bookmark lại.

Tài liệu: [link to migration guide]

Trân trọng,
IT Team
```

### Deploy Day

**Slack announcement:**

```
📢 Đang deploy cập nhật giao diện...
⏰ ETA: 30 phút
🔗 Staging: https://staging.example.com
```

### Post-Deploy

**Success announcement:**

```
✅ Deploy thành công!
🎉 Dashboard mới: /quanlycongviec/dashboard
📱 Mobile responsive improved
🐛 Có vấn đề? Báo tại #support-channel
```

---

## 🔙 Rollback Plan

### When to Rollback

Trigger rollback if:

- Error rate > 1% for 10 minutes
- Critical feature broken (can't create tasks)
- > 5 users report same issue within 1 hour

### Rollback Steps (< 5 minutes)

```bash
# Rollback frontend
git revert HEAD~1  # Revert last commit
npm run deploy:production

# Rollback backend (if needed)
cd ../giaobanbv-be
git revert HEAD~1
npm run deploy:production

# Verify rollback
npm run test:smoke -- --env=production
```

### Post-Rollback Communication

```
⚠️ Đã rollback về phiên bản cũ do lỗi kỹ thuật.
📅 Sẽ deploy lại sau khi fix.
✅ Hệ thống hoạt động bình thường.
```

---

## 📊 Success Metrics (Week 1 Post-Deploy)

Track these KPIs:

| Metric                 | Baseline | Target     | Actual |
| ---------------------- | -------- | ---------- | ------ |
| Error rate             | 0.05%    | <0.1%      | \_\_\_ |
| Avg page load          | 2.5s     | <2s        | \_\_\_ |
| Mobile usability score | 55       | >80        | \_\_\_ |
| User satisfaction      | 3.5/5    | >4/5       | \_\_\_ |
| Dashboard usage        | 0%       | >50% users | \_\_\_ |

**Survey users after 1 week:**

```
1. Bạn có sử dụng Dashboard mới không?
2. Giao diện mobile có tốt hơn không? (1-5 sao)
3. Bạn có gặp vấn đề gì không?
4. Góp ý cải thiện?
```

---

## ✅ Final Checklist

### Before Deploy

- [ ] All 16 test scenarios passed
- [ ] Cross-browser testing done
- [ ] Performance benchmarks met
- [ ] UAT completed
- [ ] Team notified (T-2 days)
- [ ] Rollback plan ready

### During Deploy

- [ ] Staging deploy successful
- [ ] Smoke tests passed
- [ ] Production deploy successful
- [ ] Post-deploy monitoring active

### After Deploy (Week 1)

- [ ] No critical errors reported
- [ ] User feedback collected
- [ ] Success metrics tracked
- [ ] Quick-fix tickets created if needed
- [ ] Post-mortem meeting scheduled

---

**End of Implementation Plan** 🎉

Total time: 85 hours (~11 working days)  
Completion date: ~19/01/2026 (nếu bắt đầu 08/01)
