# 📦 Technical Debt: Code Splitting Implementation

**Ngày tạo:** 19/01/2026  
**Ưu tiên:** 🟡 MEDIUM (Nice-to-have)  
**Effort:** 4 giờ dev + 2 ngày QA  
**Impact:** 50% performance improvement  
**Risk Level:** 🟢 LOW (nếu có rollback plan)

---

## 🎯 Tóm Tắt Vấn Đề

### Hiện Trạng

```
Bundle Size: 850KB (main.js)
Initial Load Time: 3.5s (trên 3G)
User Bounce Rate: ~15% (users bỏ app khi chờ)
Memory Usage: ~80MB (toàn bộ code load 1 lần)
```

### Mục Tiêu

```
Bundle Size: 400KB (main.js) + lazy chunks
Initial Load Time: 1.5s (-57%) ⭐
User Bounce Rate: ~5% (improvement)
Memory Usage: ~40MB (chỉ load code cần thiết)
```

**ROI:** 4h effort cho 50%+ performance boost

---

## 📊 Impact Analysis

### ✅ Lợi Ích

| Benefit                 | Impact                          | Evidence             |
| ----------------------- | ------------------------------- | -------------------- |
| **Faster Initial Load** | -57% load time (3.5s → 1.5s)    | 🟢🟢🟢🟢 HIGH        |
| **Better UX**           | User thấy UI nhanh hơn          | 🟢🟢🟢⚠️ MEDIUM-HIGH |
| **Reduced Bounce**      | 15% → 5% users bỏ app           | 🟢🟢🟢⚠️ MEDIUM-HIGH |
| **Lower Mobile Data**   | 5GB → 2.5GB/tháng (100 users)   | 🟢🟢⚠️⚠️ MEDIUM      |
| **Better Memory**       | Ít crash trên thiết bị cũ       | 🟢🟢⚠️⚠️ MEDIUM      |
| **Future-Proof**        | Tự động split khi thêm features | 🟢🟢🟢🟢 HIGH        |

### ⚠️ Nhược Điểm

| Drawback             | Impact                      | Mitigation                       |
| -------------------- | --------------------------- | -------------------------------- |
| **Loading Flicker**  | User thấy loading spinner   | 🟡 LOW → Delay 200ms             |
| **Cache Complexity** | Version mismatch sau deploy | 🟡 MEDIUM → Auto reload on error |
| **Build Time**       | +3s (45s → 48s)             | 🟢 MINIMAL → Acceptable          |
| **Dev Complexity**   | Lazy import syntax          | 🟢 MINIMAL → Helper functions    |

---

## 🚨 Risk Assessment

### Risk Matrix

| Risk               | Probability  | Impact          | Severity  | Mitigation                    |
| ------------------ | ------------ | --------------- | --------- | ----------------------------- |
| **Lazy Load Fail** | 🟡 10-15%    | 😡😡😡 Critical | 🔴 HIGH   | Error Boundary + Retry (3x)   |
| **Cache Mismatch** | 🟡 On Deploy | 😡😡 High       | 🟡 MEDIUM | Auto reload on ChunkLoadError |
| **Loading UX**     | 🔴 Every Nav | 😐 Medium       | 🟡 LOW    | Delay indicator 200ms         |
| **Circular Deps**  | 🟢 Low       | 😡😡 High       | 🟡 MEDIUM | Check with madge before       |
| **Custom Webpack** | 🟢 Low (CRA) | 😡 Medium       | 🟢 LOW    | Test on staging first         |

**Overall Risk:** 🟢 LOW (nếu follow implementation plan)

---

## 🛠️ Implementation Plan

### Phase 1: Preparation (30 phút)

**Task 1.1: Check Circular Dependencies**

```bash
npm install -D madge
npx madge --circular src/

# Expected output:
# ✓ No circular dependency found!
#
# Nếu có circular deps:
# ✗ Circular dependency:
#   ComponentA → ComponentB → ComponentA
# → Cần refactor trước khi tiếp tục
```

**Task 1.2: Create Feature Branch**

```bash
git checkout -b feature/code-splitting
git push -u origin feature/code-splitting
```

**Task 1.3: Backup Current Build Metrics**

```bash
npm run build

# Record current metrics:
# - Bundle size: ___ KB
# - Build time: ___ s
# - Number of files: ___
```

---

### Phase 2: Implementation (3-4 giờ)

**Task 2.1: Create LoadingScreen Component (10 phút)**

**File:** `src/components/LoadingScreen.js`

```javascript
import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function LoadingScreen({ message = "Đang tải..." }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: 2,
      }}
    >
      <CircularProgress size={48} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}
```

**Checklist:**

- [ ] File created at correct path
- [ ] Component renders correctly
- [ ] No console errors

---

**Task 2.2: Create Error Boundary (30 phút)**

**File:** `src/components/LazyLoadErrorBoundary.js`

```javascript
import React from "react";
import { Box, Button, Typography, Alert } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

class LazyLoadErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Lazy load error:", error, errorInfo);

    // ChunkLoadError = version mismatch → Auto reload
    if (error.name === "ChunkLoadError") {
      console.log("ChunkLoadError detected, reloading page...");
      setTimeout(() => window.location.reload(), 1000);
      return;
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < 3) {
      this.setState({
        hasError: false,
        error: null,
        retryCount: this.state.retryCount + 1,
      });
    } else {
      // Retry 3 lần thất bại → Reload page
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "50vh",
            p: 3,
            gap: 2,
          }}
        >
          <Alert severity="error" sx={{ maxWidth: 500 }}>
            <Typography variant="h6" gutterBottom>
              ⚠️ Không tải được trang
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {this.state.error?.message || "Lỗi không xác định"}
            </Typography>
          </Alert>

          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={this.handleRetry}
          >
            🔄 Thử lại ({this.state.retryCount}/3)
          </Button>

          {this.state.retryCount >= 3 && (
            <Typography variant="caption" color="text.secondary">
              Đã thử lại 3 lần. Click để tải lại toàn bộ trang.
            </Typography>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}

export default LazyLoadErrorBoundary;
```

**Checklist:**

- [ ] Error boundary catches lazy load errors
- [ ] Auto reload on ChunkLoadError
- [ ] Retry mechanism works (up to 3 times)
- [ ] UI shows helpful error message

---

**Task 2.3: Refactor routes/index.js (2-3 giờ)**

**File:** `src/routes/index.js`

**Changes:**

1. Add imports for lazy loading:

```javascript
import React, { lazy, Suspense } from "react";
import LoadingScreen from "components/LoadingScreen";
import LazyLoadErrorBoundary from "components/LazyLoadErrorBoundary";
```

2. Convert ALL page imports from direct to lazy:

```javascript
// BEFORE:
import HomePage from "../pages/HomePage";
import CongViecByNhanVienPage from "features/QuanLyCongViec/CongViec/CongViecByNhanVienPage";

// AFTER:
const HomePage = lazy(() => import("../pages/HomePage"));
const CongViecByNhanVienPage = lazy(() =>
  import("features/QuanLyCongViec/CongViec/CongViecByNhanVienPage")
);
```

3. Create LazyRoute wrapper:

```javascript
function LazyRoute({ component: Component, ...props }) {
  return (
    <LazyLoadErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <Component {...props} />
      </Suspense>
    </LazyLoadErrorBoundary>
  );
}
```

4. Update all Route elements:

```javascript
// BEFORE:
<Route path="/" element={<HomePage />} />

// AFTER:
<Route path="/" element={<LazyRoute component={HomePage} />} />
```

**Checklist:**

- [ ] All ~100 imports converted to lazy
- [ ] LazyRoute wrapper created
- [ ] All Route elements use LazyRoute
- [ ] No console errors after changes
- [ ] Core components NOT lazified (MainLayout, AuthRequire, etc.)

**⚠️ Core Components to KEEP Direct Import:**

- `MainLayout`
- `MainLayoutAble`
- `BlankLayout`
- `AuthRequire`
- `AdminRequire`
- `ThemeProvider`
- `ThemeCustomization`

---

**Task 2.4: Optimize Loading UX (30 phút)**

**File:** `src/components/SmartLoadingScreen.js`

```javascript
import React, { useState, useEffect } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

// Only show loading if chunk takes > 200ms
function SmartLoadingScreen({ message = "Đang tải..." }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null; // Không hiện loading ngay

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: 2,
      }}
    >
      <CircularProgress size={48} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}

export default SmartLoadingScreen;
```

**Update routes/index.js to use SmartLoadingScreen:**

```javascript
import SmartLoadingScreen from "components/SmartLoadingScreen";

function LazyRoute({ component: Component, ...props }) {
  return (
    <LazyLoadErrorBoundary>
      <Suspense fallback={<SmartLoadingScreen />}>
        <Component {...props} />
      </Suspense>
    </LazyLoadErrorBoundary>
  );
}
```

**Checklist:**

- [ ] Loading indicator only shows if > 200ms
- [ ] Fast navigation feels instant (no flicker)
- [ ] Slow navigation shows loading

---

### Phase 3: Testing (1-2 ngày)

**Task 3.1: Local Testing (2 giờ)**

```bash
# 1. Start dev server
npm start

# 2. Test checklist:
# [ ] App loads without errors
# [ ] Navigate to all major pages
# [ ] Check DevTools → Network tab
# [ ] Verify chunks load correctly
# [ ] Test error boundary (disconnect internet → navigate)
# [ ] Test retry mechanism
# [ ] Check console for warnings

# 3. Build & analyze
npm run build

# Verify:
# [ ] Bundle size reduced (~400KB main)
# [ ] Multiple chunk files created (10-30 files)
# [ ] Build completes without errors
```

**Task 3.2: Network Simulation (1 giờ)**

```bash
# Chrome DevTools:
# 1. F12 → Network tab
# 2. Throttle: Fast 3G
# 3. Navigate app
#
# Verify:
# [ ] Loading indicators show properly
# [ ] No timeout errors
# [ ] Chunks load within 5s
# [ ] Error handling works on slow network
```

**Task 3.3: Staging Deployment (1 ngày)**

```bash
git push origin feature/code-splitting

# Deploy to staging environment

# Test on real devices:
# [ ] iPhone Safari (iOS)
# [ ] Android Chrome
# [ ] Desktop Chrome/Edge/Firefox
#
# Test scenarios:
# [ ] Fresh install (clear cache)
# [ ] Reload while navigating
# [ ] Network interruption
# [ ] Multiple tabs
# [ ] Deploy new version while using app
```

---

### Phase 4: Production Deployment (1 giờ)

**Task 4.1: Pre-deployment Checklist**

```bash
# [ ] All staging tests passed
# [ ] No console errors
# [ ] Performance metrics collected
# [ ] Rollback plan reviewed
# [ ] Team notified about deployment
```

**Task 4.2: Deploy**

```bash
git checkout main
git merge feature/code-splitting
git push origin main

# Trigger production deployment
# (Vercel/Netlify/AWS/etc.)
```

**Task 4.3: Post-deployment Monitoring (2 ngày)**

```bash
# Monitor for 48 hours:
#
# Metrics to track:
# [ ] Error rate (should be < 1%)
# [ ] Average load time
# [ ] Bounce rate
# [ ] User complaints
# [ ] ChunkLoadError frequency
#
# Tools:
# - Sentry/error tracking
# - Google Analytics
# - Server logs
```

---

## 🔄 Rollback Strategy

### Scenario 1: High Error Rate (> 5%)

```bash
# Immediate rollback via Git revert
git revert HEAD
git push origin main

# Deploy immediately
# → App returns to previous version in 5 minutes
```

### Scenario 2: Deploy Platform Rollback

```bash
# Vercel/Netlify:
# 1. Dashboard → Deployments
# 2. Find previous deployment
# 3. Click "Rollback to this deployment"
# 4. Confirm
# → Done in 30 seconds
```

### Scenario 3: User Complaints (Moderate)

```bash
# Option A: Keep monitoring (if error < 3%)
# Option B: Investigate specific issues
# Option C: Rollback if can't fix quickly
```

---

## 📋 Decision Checklist

### ✅ PROCEED with Code Splitting if:

```
[✓] Bundle size > 500KB
[✓] Initial load time > 2s
[✓] App has 50+ routes/pages
[✓] Users complain about slowness
[✓] Have 1-2 days for testing
[✓] Team understands lazy loading
[✓] Have staging environment
[✓] Can rollback quickly if needed
```

### ❌ DEFER Code Splitting if:

```
[✗] App is small (< 500KB bundle)
[✗] Deadline < 1 week
[✗] No staging environment
[✗] Team size = 1 person
[✗] No error tracking setup
[✗] Users don't complain about performance
[✗] Infrastructure doesn't support rollback
```

---

## 📊 Success Metrics

### Before Implementation

```bash
# Collect baseline metrics:
npm run build

# Record:
- Bundle size: _____ KB
- Build time: _____ seconds
- Number of files: _____
- Average load time: _____ s (from analytics)
```

### After Implementation

```bash
# Expected improvements:
✅ Bundle size: -50% (850KB → 400KB)
✅ Initial load: -57% (3.5s → 1.5s)
✅ Build time: +6% (45s → 48s)
✅ Number of chunks: 20-30 files
✅ Error rate: < 1%
✅ User satisfaction: Improved
```

### KPIs to Monitor

| Metric       | Baseline | Target | Actual    | Status |
| ------------ | -------- | ------ | --------- | ------ |
| Bundle Size  | 850KB    | 400KB  | \_\_\_ KB | [ ]    |
| Initial Load | 3.5s     | 1.5s   | \_\_\_ s  | [ ]    |
| Bounce Rate  | 15%      | <8%    | \_\_\_ %  | [ ]    |
| Error Rate   | N/A      | <1%    | \_\_\_ %  | [ ]    |
| Build Time   | 45s      | <50s   | \_\_\_ s  | [ ]    |

---

## 🎯 Final Recommendation

### Priority Level: 🟡 MEDIUM (Nice-to-have)

**Làm NGAY nếu:**

- Users complain về tốc độ
- App dùng trong ca cấp cứu (mission-critical)
- Có kế hoạch thêm nhiều features (3-6 tháng)
- Bundle size đã > 1MB

**Để SAU nếu:**

- Đang gấp deadline
- Không có complaints
- Team chỉ 1 người
- App < 500KB

**KHÔNG CẦN nếu:**

- App dùng nội bộ desktop only
- Users đều có mạng nhanh
- Performance không quan trọng

---

## 📚 References

### Documentation

- [React Code Splitting](https://react.dev/reference/react/lazy)
- [Webpack Code Splitting](https://webpack.js.org/guides/code-splitting/)
- [Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)

### Tools

- [madge](https://github.com/pahen/madge) - Detect circular dependencies
- [webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer) - Analyze bundle size
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance audit

---

**Created:** 2026-01-19  
**Status:** 📝 PROPOSED  
**Assignee:** TBD  
**Estimated Effort:** 4h dev + 2 days QA  
**Risk Level:** 🟢 LOW (with proper testing)

---

## 📝 Implementation Log

_Update this section when implementing:_

- [ ] Phase 1: Preparation - Started: **_ / Completed: _**
- [ ] Phase 2: Implementation - Started: **_ / Completed: _**
- [ ] Phase 3: Testing - Started: **_ / Completed: _**
- [ ] Phase 4: Production Deploy - Started: **_ / Completed: _**

**Notes:**

```
(Add notes here during implementation)
```

**Issues Encountered:**

```
(Document any issues and how they were resolved)
```

**Final Metrics:**

```
(Record actual improvements achieved)
```
