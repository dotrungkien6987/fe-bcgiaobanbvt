# Phase 4: Mobile Components Migration Plan

**Tác giả:** AI Assistant  
**Ngày tạo:** 19/01/2026  
**Trạng thái:** 🟡 PENDING  
**Ước tính:** 3.5 giờ

---

## 📋 Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Phân Tích Rủi Ro](#phân-tích-rủi-ro)
3. [Critical Issue: StatusGridSkeleton Duplicate](#critical-issue)
4. [Kế Hoạch Di Chuyển](#kế-hoạch-di-chuyển)
5. [Testing Checklist](#testing-checklist)
6. [Rollback Plan](#rollback-plan)

---

## 🎯 Tổng Quan

### Mục Tiêu

Di chuyển 6 mobile components từ `src/components/` sang cấu trúc mới `src/components/mobile/` với mục đích:

- ✅ Tổ chức code tốt hơn (mobile-specific components riêng biệt)
- ✅ Tree-shaking hiệu quả hơn cho code splitting (Phase 5)
- ✅ Developer experience tốt hơn (rõ ràng components nào dành cho mobile)
- ✅ Chuẩn bị cho việc mở rộng mobile features

### Components Cần Di Chuyển

| Component            | Hiện tại                           | Đích đến                            | Files sử dụng | Rủi ro    |
| -------------------- | ---------------------------------- | ----------------------------------- | ------------- | --------- |
| PullToRefreshWrapper | `components/PullToRefreshWrapper/` | `mobile/gestures/PullToRefresh/`    | 9             | 🟡 MEDIUM |
| MobileDetailLayout   | `components/MobileDetailLayout/`   | `mobile/layout/MobileDetailLayout/` | 4             | 🟢 LOW    |
| MobileBottomNav      | `components/MobileBottomNav.js`    | `mobile/layout/MobileBottomNav/`    | 2             | 🟢 LOW    |
| LoadingScreen        | `components/LoadingScreen.js`      | `mobile/feedback/LoadingScreen/`    | 14            | 🟡 MEDIUM |
| SkeletonLoader       | `components/SkeletonLoader/`       | `mobile/feedback/SkeletonLoader/`   | 2             | 🟢 LOW    |
| SplashScreen         | `components/SplashScreen/`         | `mobile/feedback/SplashScreen/`     | 3             | 🟢 LOW    |

### Ước Tính Thời Gian

```
Phase 0: Fix Critical Issues    →  15 phút  ⚠️ BẮT BUỘC TRƯỚC
Phase 1: Low Risk Components    →  45 phút  ✅ An toàn
Phase 2: LoadingScreen Refactor →  60 phút  🔧 Cần refactor trước
Phase 3: PullToRefresh Migration →  45 phút  ⚙️ Backward compatibility
Phase 4: Testing & Cleanup      →  45 phút  ✅ Final validation
─────────────────────────────────────────────
TOTAL                           →  3.5 giờ
```

---

## 📊 Phân Tích Rủi Ro

### 🔴 HIGH RISK: LoadingScreen (14 files)

**Files ảnh hưởng:**

- **Auth Guards (4 files - CRITICAL):**
  - `src/routes/AuthRequire.js`
  - `src/routes/AdminRequire.js`
  - `src/routes/DashboardRequire.js`
  - `src/routes/QuanLyKhoaOrAdminRequire.js`
- **Feature Pages (10 files):**
  - `src/pages/NhanVienMePage.js`
  - `src/features/QuanLyCongViec/KPI/pages/KPIEvaluationPage.js`
  - `src/features/QuanLyCongViec/KPI/components/KPIEvaluationDialog.js`
  - `src/features/QuanLyCongViec/ChuKyDanhGia/ChuKyDanhGiaView.js`
  - `src/features/NhanVien/NhanVienView1.js`
  - `src/features/BaoCaoNgay/BCKhoaKhamBenh.js`
  - `src/features/BaoCaoNgay/BCNgayLamSangNoi.js`
  - `src/features/Daotao/BaoCaoTongHopDaoTao/TongHopSoLuong/CoCauNguonNhanLuc.js`
  - Docs/demos (2 files)

**Tại sao HIGH RISK:**

- Auth guards break → TOÀN BỘ protected routes fail
- Component hiện tại quá đơn giản (chỉ CircularProgress)
- Cần refactor thêm props trước khi di chuyển

**Mitigation:**

1. Refactor LoadingScreen thêm props trước
2. Test kỹ trên auth guards
3. Update tất cả 14 files cùng lúc (không làm dần)

---

### 🟡 MEDIUM RISK: PullToRefreshWrapper (9 files)

**Files ảnh hưởng:**

**Direct imports (4 files):**

1. `src/pages/YeuCauDashboardPage.js` (line 32)
2. `src/features/QuanLyCongViec/Ticket/YeuCauDetailPage.js` (line 45)
3. `src/components/MobileDetailLayout/index.js` (line 47)
4. `src/features/QuanLyCongViec/GiaoNhiemVu/CycleAssignmentListPage.js` (line 51)

**Re-export imports (5 files) - qua `Ticket/components/index.js`:** 5. `src/features/QuanLyCongViec/Ticket/YeuCauDieuPhoiPage.js` (line 44) 6. `src/features/QuanLyCongViec/Ticket/YeuCauXuLyPage.js` (line 42) 7. `src/features/QuanLyCongViec/Ticket/YeuCauToiGuiPage.js` (line 38) 8. `src/features/QuanLyCongViec/Ticket/YeuCauQuanLyKhoaPage.js` (line 46) 9. `src/features/QuanLyCongViec/Ticket/YeuCauPage.js` (line 30)

**Tại sao MEDIUM RISK:**

- Có backward-compatible re-export (đã tồn tại)
- 5 files dùng qua re-export → Phức tạp hơn
- Gesture component → Cần test kỹ touch interactions

**Mitigation:**

1. Giữ nguyên deprecated wrapper tại `components/PullToRefreshWrapper/index.js`
2. Update từng file dần (không cần cùng lúc)
3. Testing kỹ pull-to-refresh gesture

---

### 🟢 LOW RISK Components (3 components)

#### MobileBottomNav (2 files)

- `src/layout/MainLayout/index.js` - **Production use**
- `src/components/mobile/README.md` - Documentation

**Tại sao LOW RISK:** Chỉ 1 file production, dễ test (xuất hiện mọi trang mobile)

#### MobileDetailLayout (4 files)

- `src/pages/ComponentPreviewPage.js` - Demo
- `src/features/QuanLyCongViec/GiaoNhiemVu/CycleAssignmentListPage.js`
- `src/features/QuanLyCongViec/GiaoNhiemVu/CycleAssignmentDetailPage.js`
- Docs/references

**Tại sao LOW RISK:** Ít files, tất cả direct imports

#### SplashScreen (3 files)

- `src/App.js` - **ROOT LEVEL** (cần test kỹ)
- `src/pages/ComponentPreviewPage.js` - Demo
- `src/config/featureFlags.js` - Config reference

**Tại sao LOW RISK:** Feature flag controlled, dễ rollback

#### SkeletonLoader (2 files)

- `src/pages/ComponentPreviewPage.js` - Demo all 6 skeleton types
- Docs/references

**Tại sao LOW RISK:** Đã centralized tốt với named exports

---

## 🔥 Critical Issue: StatusGridSkeleton Duplicate

### Vấn Đề

**DUPLICATE 100% CODE:**

```javascript
// ✅ CHÍNH: src/components/SkeletonLoader/index.js
export function StatusGridSkeleton({ columns = 4 }) {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: columns }).map((_, i) => (
        <Grid item xs={6} sm={12 / columns} key={i}>
          <Card>
            <CardContent>
              <Stack spacing={1} alignItems="center">
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="text" width={60} height={40} />
                <Skeleton variant="text" width={80} height={20} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

// 🔴 DUPLICATE: src/features/QuanLyCongViec/Dashboard/CongViecDashboard/components/shared/StatusGridSkeleton.js
export default function StatusGridSkeleton({ columns }) {
  // ← Chỉ khác default param
  // ... GIỐNG HỆT CODE TRÊN
}
```

### Files Bị Ảnh Hưởng

**Đang dùng version duplicate (2 files):**

1. `src/features/QuanLyCongViec/Dashboard/CongViecDashboard/components/ReceivedDashboardSection.js`
2. `src/features/QuanLyCongViec/Dashboard/CongViecDashboard/components/AssignedDashboardSection.js`

```javascript
// Import hiện tại (SAI):
import StatusGridSkeleton from "./shared/StatusGridSkeleton";

// Cần đổi thành:
import { StatusGridSkeleton } from "components/SkeletonLoader";
```

### Fix Plan

**⏱️ 5 PHÚT - BẮT BUỘC LÀM TRƯỚC TẤT CẢ**

```bash
# Step 1: Xóa file duplicate
rm src/features/QuanLyCongViec/Dashboard/CongViecDashboard/components/shared/StatusGridSkeleton.js

# Step 2: Update imports (2 files)
# Xem phần "Phase 0" bên dưới
```

**Tại sao phải làm trước:**

- Nếu di chuyển SkeletonLoader mà chưa fix duplicate → 2 files này sẽ BREAK
- Duplicate code = technical debt tăng
- SkeletonLoader migration phụ thuộc vào việc này hoàn thành

---

## 📋 Kế Hoạch Di Chuyển

### Phase 0: Fix Critical Issues ⚠️ (15 phút)

**⏱️ THỜI GIAN:** 15 phút  
**📌 TRẠNG THÁI:** 🔴 BLOCKING - Phải làm trước tất cả  
**🎯 MỤC TIÊU:** Loại bỏ duplicate code

#### Checklist

- [ ] **Step 1:** Backup các file bị ảnh hưởng

  ```bash
  # Tạo backup
  cp src/features/QuanLyCongViec/Dashboard/CongViecDashboard/components/ReceivedDashboardSection.js \
     src/features/QuanLyCongViec/Dashboard/CongViecDashboard/components/ReceivedDashboardSection.js.backup

  cp src/features/QuanLyCongViec/Dashboard/CongViecDashboard/components/AssignedDashboardSection.js \
     src/features/QuanLyCongViec/Dashboard/CongViecDashboard/components/AssignedDashboardSection.js.backup
  ```

- [ ] **Step 2:** Update import trong ReceivedDashboardSection.js

  ```javascript
  // Tìm dòng:
  import StatusGridSkeleton from "./shared/StatusGridSkeleton";

  // Thay bằng:
  import { StatusGridSkeleton } from "components/SkeletonLoader";
  ```

- [ ] **Step 3:** Update import trong AssignedDashboardSection.js

  ```javascript
  // Tìm dòng:
  import StatusGridSkeleton from "./shared/StatusGridSkeleton";

  // Thay bằng:
  import { StatusGridSkeleton } from "components/SkeletonLoader";
  ```

- [ ] **Step 4:** Xóa file duplicate

  ```bash
  rm src/features/QuanLyCongViec/Dashboard/CongViecDashboard/components/shared/StatusGridSkeleton.js
  ```

- [ ] **Step 5:** Test Công Việc Dashboard

  - [ ] Mở `/cong-viec-cua-toi` (hoặc CongViecDashboard page)
  - [ ] Refresh page với network throttling (Slow 3G)
  - [ ] Skeleton grid hiển thị đúng (4 cards placeholder)
  - [ ] Data load xong → Skeleton biến mất
  - [ ] Không có console errors

- [ ] **Step 6:** Commit
  ```bash
  git add .
  git commit -m "fix: Remove StatusGridSkeleton duplicate, use centralized version"
  ```

**✅ DEFINITION OF DONE:**

- File duplicate đã xóa
- 2 files import từ `components/SkeletonLoader`
- Dashboard hiển thị bình thường
- Không có errors

---

### Phase 1: Low Risk Components (45 phút)

**⏱️ THỜI GIAN:** 45 phút  
**📌 DEPENDENCY:** Phase 0 hoàn thành  
**🎯 MỤC TIÊU:** Di chuyển 4 components an toàn

---

#### 1.1. MobileBottomNav (10 phút)

**Files cần update:** 1 file production

- [ ] **Step 1:** Tạo folder structure

  ```bash
  mkdir -p src/components/mobile/layout/MobileBottomNav
  ```

- [ ] **Step 2:** Di chuyển file

  ```bash
  mv src/components/MobileBottomNav.js src/components/mobile/layout/MobileBottomNav/index.js
  ```

- [ ] **Step 3:** Update import trong MainLayout

  ```javascript
  // File: src/layout/MainLayout/index.js
  // Tìm dòng:
  import MobileBottomNav from "components/MobileBottomNav";

  // Thay bằng:
  import MobileBottomNav from "components/mobile/layout/MobileBottomNav";
  ```

- [ ] **Step 4:** Test mobile navigation

  - [ ] Mở app trên mobile viewport (DevTools responsive mode)
  - [ ] Bottom nav hiển thị với 4 tabs
  - [ ] Click từng tab → Navigate đúng route
  - [ ] Active tab highlight đúng
  - [ ] Icons + labels render đúng

- [ ] **Step 5:** Commit
  ```bash
  git add .
  git commit -m "refactor: Move MobileBottomNav to mobile/layout/"
  ```

---

#### 1.2. MobileDetailLayout (15 phút)

**Files cần update:** 4 files (1 demo + 2 GiaoNhiemVu + docs)

- [ ] **Step 1:** Tạo folder

  ```bash
  mkdir -p src/components/mobile/layout/MobileDetailLayout
  ```

- [ ] **Step 2:** Di chuyển folder

  ```bash
  # Copy toàn bộ folder (giữ nguyên structure)
  cp -r src/components/MobileDetailLayout/* src/components/mobile/layout/MobileDetailLayout/
  rm -rf src/components/MobileDetailLayout
  ```

- [ ] **Step 3:** Update imports (4 files)

  **File 1: ComponentPreviewPage.js**

  ```javascript
  // Tìm:
  import MobileDetailLayout from "components/MobileDetailLayout";

  // Thay:
  import MobileDetailLayout from "components/mobile/layout/MobileDetailLayout";
  ```

  **File 2: CycleAssignmentListPage.js**

  ```javascript
  // Tìm:
  import MobileDetailLayout from "components/MobileDetailLayout";

  // Thay:
  import MobileDetailLayout from "components/mobile/layout/MobileDetailLayout";
  ```

  **File 3: CycleAssignmentDetailPage.js**

  ```javascript
  // Tìm:
  import MobileDetailLayout from "components/MobileDetailLayout";

  // Thay:
  import MobileDetailLayout from "components/mobile/layout/MobileDetailLayout";
  ```

  **File 4: mobile/README.md**

  ```markdown
  <!-- Update đường dẫn trong documentation -->
  ```

- [ ] **Step 4:** Update internal imports trong MobileDetailLayout

  ```javascript
  // File: src/components/mobile/layout/MobileDetailLayout/index.js
  // Kiểm tra import PullToRefreshWrapper vẫn đúng:
  import PullToRefreshWrapper from "components/PullToRefreshWrapper";
  // ↑ Giữ nguyên (chưa di chuyển PullToRefresh)
  ```

- [ ] **Step 5:** Test layout

  - [ ] Mở `/giao-nhiem-vu/chu-ky` trên mobile
  - [ ] Header sticky với back button
  - [ ] Content scroll mượt
  - [ ] Pull-to-refresh hoạt động
  - [ ] FAB buttons (nếu có) hiển thị đúng

- [ ] **Step 6:** Commit
  ```bash
  git add .
  git commit -m "refactor: Move MobileDetailLayout to mobile/layout/"
  ```

---

#### 1.3. SplashScreen (10 phút)

**Files cần update:** 3 files (App.js + ComponentPreviewPage + featureFlags)

- [ ] **Step 1:** Tạo folder

  ```bash
  mkdir -p src/components/mobile/feedback/SplashScreen
  ```

- [ ] **Step 2:** Di chuyển folder

  ```bash
  cp -r src/components/SplashScreen/* src/components/mobile/feedback/SplashScreen/
  rm -rf src/components/SplashScreen
  ```

- [ ] **Step 3:** Update imports

  **File 1: App.js (CRITICAL)**

  ```javascript
  // Tìm:
  import SplashScreen from "components/SplashScreen";

  // Thay:
  import SplashScreen from "components/mobile/feedback/SplashScreen";
  ```

  **File 2: ComponentPreviewPage.js**

  ```javascript
  // Tìm:
  import SplashScreen from "components/SplashScreen";

  // Thay:
  import SplashScreen from "components/mobile/feedback/SplashScreen";
  ```

  **File 3: featureFlags.js**

  ```javascript
  // Chỉ comment reference, không cần đổi code
  ```

- [ ] **Step 4:** Test splash screen

  - [ ] Clear browser cache + localStorage
  - [ ] Hard reload (Ctrl+Shift+R)
  - [ ] Splash screen xuất hiện 1.2s
  - [ ] Animation fade in/out mượt
  - [ ] Logo + progress bar render đúng
  - [ ] Sau splash → App load bình thường

- [ ] **Step 5:** Commit
  ```bash
  git add .
  git commit -m "refactor: Move SplashScreen to mobile/feedback/"
  ```

---

#### 1.4. SkeletonLoader (10 phút)

**Files cần update:** 2 files (ComponentPreviewPage + docs)

- [ ] **Step 1:** Tạo folder

  ```bash
  mkdir -p src/components/mobile/feedback/SkeletonLoader
  ```

- [ ] **Step 2:** Di chuyển folder

  ```bash
  cp -r src/components/SkeletonLoader/* src/components/mobile/feedback/SkeletonLoader/
  rm -rf src/components/SkeletonLoader
  ```

- [ ] **Step 3:** Update imports

  **File 1: ComponentPreviewPage.js**

  ```javascript
  // Tìm:
  import {
    CardSkeleton,
    TableSkeleton,
    FormSkeleton,
    StatusGridSkeleton,
    ListSkeleton,
    PageSkeleton,
  } from "components/SkeletonLoader";

  // Thay:
  import {
    CardSkeleton,
    TableSkeleton,
    FormSkeleton,
    StatusGridSkeleton,
    ListSkeleton,
    PageSkeleton,
  } from "components/mobile/feedback/SkeletonLoader";
  ```

  **File 2: ReceivedDashboardSection.js & AssignedDashboardSection.js**

  ```javascript
  // Tìm:
  import { StatusGridSkeleton } from "components/SkeletonLoader";

  // Thay:
  import { StatusGridSkeleton } from "components/mobile/feedback/SkeletonLoader";
  ```

- [ ] **Step 4:** Test skeletons

  - [ ] Mở Component Preview page
  - [ ] Test từng skeleton type (6 types):
    - [ ] CardSkeleton
    - [ ] TableSkeleton
    - [ ] FormSkeleton
    - [ ] StatusGridSkeleton
    - [ ] ListSkeleton
    - [ ] PageSkeleton
  - [ ] Không có console errors

- [ ] **Step 5:** Commit
  ```bash
  git add .
  git commit -m "refactor: Move SkeletonLoader to mobile/feedback/"
  ```

**✅ PHASE 1 DONE:**

- 4 components đã di chuyển
- All tests pass
- No breaking changes

---

### Phase 2: LoadingScreen Refactor + Migration (60 phút)

**⏱️ THỜI GIAN:** 60 phút  
**📌 DEPENDENCY:** Phase 1 hoàn thành  
**🎯 MỤC TIÊU:** Refactor LoadingScreen + Di chuyển an toàn

---

#### 2.1. Refactor LoadingScreen Component (20 phút)

**Hiện tại (quá đơn giản):**

```javascript
// src/components/LoadingScreen.js
export default function LoadingScreen() {
  return (
    <Box
      sx={{
        position: "absolute",
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CircularProgress />
    </Box>
  );
}
```

**Sau refactor (thêm props):**

- [ ] **Step 1:** Backup file hiện tại

  ```bash
  cp src/components/LoadingScreen.js src/components/LoadingScreen.js.backup
  ```

- [ ] **Step 2:** Refactor component

  ```javascript
  // src/components/LoadingScreen.js
  import React from "react";
  import { Box, CircularProgress, Typography } from "@mui/material";
  import PropTypes from "prop-types";

  /**
   * LoadingScreen - Full-screen loading overlay
   *
   * @param {string} message - Optional loading message
   * @param {number} size - CircularProgress size (default: 40)
   * @param {string} position - CSS position: 'absolute' | 'fixed' (default: 'absolute')
   * @param {boolean} showMessage - Show message below spinner (default: false)
   */
  function LoadingScreen({
    message = "Đang tải...",
    size = 40,
    position = "absolute",
    showMessage = false,
  }) {
    return (
      <Box
        sx={{
          position: position,
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor:
            position === "fixed" ? "rgba(255, 255, 255, 0.9)" : "transparent",
          zIndex: position === "fixed" ? 9998 : "auto", // Below splash (9999)
        }}
      >
        <CircularProgress size={size} />
        {showMessage && (
          <Typography
            variant="body2"
            sx={{
              mt: 2,
              color: "text.secondary",
              textAlign: "center",
            }}
          >
            {message}
          </Typography>
        )}
      </Box>
    );
  }

  LoadingScreen.propTypes = {
    message: PropTypes.string,
    size: PropTypes.number,
    position: PropTypes.oneOf(["absolute", "fixed"]),
    showMessage: PropTypes.bool,
  };

  export default LoadingScreen;
  ```

- [ ] **Step 3:** Test component với props mới (backward compatible)

  ```javascript
  // Tất cả usage cũ vẫn hoạt động:
  <LoadingScreen /> // ✅ Works - dùng default props

  // New usage với props:
  <LoadingScreen message="Đang xác thực..." showMessage />
  <LoadingScreen size={60} />
  <LoadingScreen position="fixed" message="Vui lòng đợi..." showMessage />
  ```

- [ ] **Step 4:** Commit refactor
  ```bash
  git add .
  git commit -m "refactor: Enhance LoadingScreen with props (backward compatible)"
  ```

---

#### 2.2. Test Auth Guards (15 phút)

**CRITICAL FILES - TEST KỸ:**

- [ ] **AuthRequire.js** - Tất cả protected routes

  - [ ] Logout → Redirect to login
  - [ ] Login → Protected route accessible
  - [ ] LoadingScreen hiển thị khi checking auth

- [ ] **AdminRequire.js** - Admin-only routes

  - [ ] Non-admin user → Redirect với message
  - [ ] Admin user → Route accessible

- [ ] **DashboardRequire.js** - Dashboard access

  - [ ] Authorized user → Dashboard loads
  - [ ] LoadingScreen khi checking permissions

- [ ] **QuanLyKhoaOrAdminRequire.js** - Department manager/admin
  - [ ] Manager của khoa → Access granted
  - [ ] User khác → Access denied

**Testing Script:**

```bash
# 1. Open app in incognito mode
# 2. Try accessing protected route directly
# 3. Should see LoadingScreen → Redirect to login
# 4. Login with different roles
# 5. Verify appropriate redirects
```

---

#### 2.3. Di chuyển LoadingScreen (15 phút)

- [ ] **Step 1:** Tạo folder

  ```bash
  mkdir -p src/components/mobile/feedback/LoadingScreen
  ```

- [ ] **Step 2:** Di chuyển file

  ```bash
  mv src/components/LoadingScreen.js src/components/mobile/feedback/LoadingScreen/index.js
  ```

- [ ] **Step 3:** Update imports trong Auth Guards (4 files)

  **AuthRequire.js:**

  ```javascript
  // Tìm:
  import LoadingScreen from "../components/LoadingScreen";

  // Thay:
  import LoadingScreen from "../components/mobile/feedback/LoadingScreen";
  ```

  **AdminRequire.js, DashboardRequire.js, QuanLyKhoaOrAdminRequire.js:**

  ```javascript
  // Tương tự - update path
  ```

- [ ] **Step 4:** Update imports trong Feature Pages (10 files)

  **Pattern tìm:**

  ```javascript
  import LoadingScreen from "components/LoadingScreen";
  import LoadingScreen from "../components/LoadingScreen"; // Relative paths
  import LoadingScreen from "../../components/LoadingScreen";
  ```

  **Thay tất cả bằng:**

  ```javascript
  import LoadingScreen from "components/mobile/feedback/LoadingScreen";
  ```

---

#### 2.4. Full Regression Testing (10 phút)

- [ ] **Authentication Flow**

  - [ ] Login page loads
  - [ ] Login successful → Redirect to dashboard
  - [ ] LoadingScreen during auth check

- [ ] **Protected Routes**

  - [ ] Access admin route as user → Blocked
  - [ ] Access admin route as admin → Allowed

- [ ] **Feature Pages**

  - [ ] KPI Evaluation page loads
  - [ ] NhanVien page loads
  - [ ] BaoCaoNgay pages load

- [ ] **No Console Errors**

  - [ ] Check browser console
  - [ ] No import errors
  - [ ] No PropTypes warnings

- [ ] **Step 5:** Commit
  ```bash
  git add .
  git commit -m "refactor: Move LoadingScreen to mobile/feedback/"
  ```

**✅ PHASE 2 DONE:**

- LoadingScreen enhanced với props
- All 14 files updated
- Auth guards working
- No breaking changes

---

### Phase 3: PullToRefresh Migration với Backward Compatibility (45 phút)

**⏱️ THỜI GIAN:** 45 phút  
**📌 DEPENDENCY:** Phase 2 hoàn thành  
**🎯 MỤC TIÊU:** Di chuyển gesture component phức tạp nhất

---

#### 3.1. Tạo Deprecated Wrapper (5 phút)

**Strategy:** Giữ old path với deprecation warning

- [ ] **Step 1:** Tạo folder mới

  ```bash
  mkdir -p src/components/mobile/gestures/PullToRefresh
  ```

- [ ] **Step 2:** Copy component

  ```bash
  cp -r src/components/PullToRefreshWrapper/* src/components/mobile/gestures/PullToRefresh/
  ```

- [ ] **Step 3:** Update old location thành deprecated wrapper

  ```javascript
  // src/components/PullToRefreshWrapper/index.js
  /**
   * @deprecated Use "components/mobile/gestures/PullToRefresh" instead
   * This file is kept for backward compatibility and will be removed in v2.0
   */

  import PullToRefresh from "../mobile/gestures/PullToRefresh";

  // Optional: Log deprecation warning in dev mode
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "[DEPRECATED] PullToRefreshWrapper: Import from 'components/mobile/gestures/PullToRefresh' instead. " +
        "Old path will be removed in v2.0"
    );
  }

  export default PullToRefresh;
  ```

- [ ] **Step 4:** Test wrapper hoạt động
  - [ ] Các files cũ vẫn import từ old path
  - [ ] Component render bình thường
  - [ ] Console warning xuất hiện (dev mode)

---

#### 3.2. Update Direct Imports (20 phút)

**4 files import trực tiếp:**

- [ ] **File 1: YeuCauDashboardPage.js**

  ```javascript
  // Tìm (line 32):
  import PullToRefreshWrapper from "components/PullToRefreshWrapper";

  // Thay bằng:
  import PullToRefresh from "components/mobile/gestures/PullToRefresh";

  // Update usage (line 255):
  <PullToRefresh onRefresh={handleRefresh}>{/* content */}</PullToRefresh>;
  ```

- [ ] **File 2: YeuCauDetailPage.js**

  ```javascript
  // Tìm (line 45):
  import PullToRefreshWrapper from "components/PullToRefreshWrapper";

  // Thay:
  import PullToRefresh from "components/mobile/gestures/PullToRefresh";

  // Update usage (line 523):
  <PullToRefresh onRefresh={handleRefresh}>{/* content */}</PullToRefresh>;
  ```

- [ ] **File 3: MobileDetailLayout/index.js**

  ```javascript
  // Tìm (line 47):
  import PullToRefreshWrapper from "components/PullToRefreshWrapper";

  // Thay:
  import PullToRefresh from "../gestures/PullToRefresh"; // Relative path

  // Update usage (line 198):
  <PullToRefresh onRefresh={onRefresh} disabled={!onRefresh}>
    {children}
  </PullToRefresh>;
  ```

- [ ] **File 4: CycleAssignmentListPage.js**

  ```javascript
  // Tìm (line 51):
  import PullToRefreshWrapper from "components/PullToRefreshWrapper";

  // Thay:
  import PullToRefresh from "components/mobile/gestures/PullToRefresh";

  // Update usage (line 772):
  <PullToRefresh onRefresh={handleRefresh}>{/* content */}</PullToRefresh>;
  ```

---

#### 3.3. Update Re-export trong Ticket Module (10 phút)

**File: src/features/QuanLyCongViec/Ticket/components/PullToRefreshWrapper.jsx**

- [ ] **Option A: Giữ re-export (khuyến nghị)**

  ```javascript
  // Giữ nguyên file này để backward compatible
  /**
   * @deprecated Import directly from 'components/mobile/gestures/PullToRefresh'
   * This re-export is kept for backward compatibility
   */
  export { default } from "components/mobile/gestures/PullToRefresh";
  ```

- [ ] **Option B: Update 5 files trong Ticket module (nếu muốn clean hơn)**

  ```javascript
  // YeuCauDieuPhoiPage, YeuCauXuLyPage, YeuCauToiGuiPage, YeuCauQuanLyKhoaPage, YeuCauPage

  // Tìm:
  import { PullToRefreshWrapper } from "./components";

  // Thay:
  import PullToRefresh from "components/mobile/gestures/PullToRefresh";
  ```

**Khuyến nghị:** Chọn Option A (giữ re-export) để giảm risk

---

#### 3.4. Testing Pull-to-Refresh Gesture (10 phút)

**Test trên Mobile Viewport (DevTools responsive mode):**

- [ ] **YeuCau Dashboard**

  - [ ] Mở `/yeu-cau-dashboard`
  - [ ] Pull down → Progress indicator xuất hiện
  - [ ] Release → `onRefresh` trigger
  - [ ] Data refresh successfully
  - [ ] Haptic feedback (nếu có)

- [ ] **YeuCau Detail Page**

  - [ ] Mở detail page bất kỳ
  - [ ] Pull-to-refresh hoạt động
  - [ ] Comments/files reload

- [ ] **Cycle Assignment List**

  - [ ] Mở `/giao-nhiem-vu/chu-ky`
  - [ ] Pull-to-refresh reload danh sách

- [ ] **Desktop Behavior**

  - [ ] Mở trên desktop viewport
  - [ ] Pull gesture không trigger (desktop fallback)
  - [ ] Scroll hoạt động bình thường

- [ ] **Edge Cases**
  - [ ] Pull khi đang loading → Không double-trigger
  - [ ] Pull khi scroll không ở top → Không trigger
  - [ ] Fast pull → Release → Animate mượt

---

#### 3.5. Commit và Cleanup (5 phút)

- [ ] **Commit changes**

  ```bash
  git add .
  git commit -m "refactor: Move PullToRefresh to mobile/gestures/ with backward compatibility"
  ```

- [ ] **Document deprecated paths**
  ```javascript
  // Update mobile/README.md
  // Add migration guide for deprecated imports
  ```

**✅ PHASE 3 DONE:**

- PullToRefresh migrated
- Backward compatibility maintained
- All gesture tests pass

---

### Phase 4: Testing & Cleanup (45 phút)

**⏱️ THỜI GIAN:** 45 phút  
**📌 DEPENDENCY:** Phase 3 hoàn thành  
**🎯 MỤC TIÊU:** Full regression testing + cleanup

---

#### 4.1. Full Component Testing (25 phút)

**Test mỗi component đã di chuyển:**

- [ ] **SplashScreen**

  - [ ] Clear cache + hard reload
  - [ ] Splash xuất hiện 1.2s
  - [ ] Animation mượt
  - [ ] Transition to app smooth

- [ ] **SkeletonLoader** (6 types)

  - [ ] CardSkeleton renders
  - [ ] TableSkeleton renders
  - [ ] FormSkeleton renders
  - [ ] StatusGridSkeleton renders (test trên dashboard)
  - [ ] ListSkeleton renders
  - [ ] PageSkeleton renders

- [ ] **LoadingScreen**

  - [ ] Auth guards show loading
  - [ ] KPI page loading
  - [ ] Other pages loading
  - [ ] Props work (message, size)

- [ ] **PullToRefresh**

  - [ ] YeuCau dashboard refresh
  - [ ] Detail pages refresh
  - [ ] Cycle assignment refresh
  - [ ] Touch gestures smooth

- [ ] **MobileDetailLayout**

  - [ ] Header sticky
  - [ ] Content scrollable
  - [ ] Back button works
  - [ ] FAB positioning correct

- [ ] **MobileBottomNav**
  - [ ] 4 tabs visible
  - [ ] Navigation works
  - [ ] Active state correct
  - [ ] Icons + labels render

---

#### 4.2. Cross-Browser Testing (10 phút)

- [ ] **Chrome** (primary)

  - [ ] Desktop view
  - [ ] Mobile responsive mode
  - [ ] Touch simulation

- [ ] **Firefox**

  - [ ] Basic functionality
  - [ ] Mobile view

- [ ] **Safari** (nếu có Mac)

  - [ ] iOS Safari behavior
  - [ ] Touch gestures

- [ ] **Mobile Real Device** (khuyến nghị)
  - [ ] Pull-to-refresh on actual phone
  - [ ] Touch responsiveness

---

#### 4.3. Performance Checks (5 phút)

- [ ] **Bundle Size**

  ```bash
  npm run build
  # Kiểm tra bundle size không tăng đột biến
  ```

- [ ] **Lighthouse Audit**

  - [ ] Performance score không giảm
  - [ ] No new console warnings

- [ ] **Network Throttling**
  - [ ] Test với Slow 3G
  - [ ] Skeleton loaders xuất hiện
  - [ ] Loading states appropriate

---

#### 4.4. Cleanup Tasks (5 phút)

- [ ] **Xóa backup files**

  ```bash
  rm src/components/LoadingScreen.js.backup
  rm src/features/QuanLyCongViec/Dashboard/CongViecDashboard/components/*.backup
  ```

- [ ] **Update mobile/README.md**

  - [ ] Document component locations mới
  - [ ] Add migration guide cho deprecated paths
  - [ ] Update component status tracking

- [ ] **Update import paths trong docs**

  - [ ] GESTURE_INTEGRATION_GUIDE.md
  - [ ] PHASE_4_GESTURES.md
  - [ ] Các docs khác reference components

- [ ] **Create migration summary**

  ```markdown
  # Mobile Components Migration Summary

  ## Completed:

  - ✅ PullToRefresh: components/PullToRefreshWrapper → mobile/gestures/PullToRefresh
  - ✅ MobileDetailLayout: components/MobileDetailLayout → mobile/layout/MobileDetailLayout
  - ✅ MobileBottomNav: components/MobileBottomNav → mobile/layout/MobileBottomNav
  - ✅ LoadingScreen: components/LoadingScreen → mobile/feedback/LoadingScreen
  - ✅ SkeletonLoader: components/SkeletonLoader → mobile/feedback/SkeletonLoader
  - ✅ SplashScreen: components/SplashScreen → mobile/feedback/SplashScreen

  ## Deprecated Paths (backward compatible):

  - components/PullToRefreshWrapper → Use mobile/gestures/PullToRefresh

  ## Files Updated: 30+ files

  ## Breaking Changes: NONE (all backward compatible)
  ```

- [ ] **Final commit**
  ```bash
  git add .
  git commit -m "docs: Update mobile components documentation after migration"
  git push origin main
  ```

**✅ PHASE 4 DONE:**

- All components tested
- Documentation updated
- Cleanup complete
- Migration successful

---

## ✅ Testing Checklist

### Functional Testing

#### SplashScreen

- [ ] Splash xuất hiện khi khởi động app (feature flag enabled)
- [ ] Duration đúng (1200ms default)
- [ ] onComplete callback trigger
- [ ] Animation fade in/out mượt
- [ ] Logo + title hiển thị đúng
- [ ] Progress bar animate từ 0 → 100%

#### SkeletonLoader

- [ ] CardSkeleton: Skeleton cards render với columns đúng
- [ ] TableSkeleton: Table rows skeleton với rowCount đúng
- [ ] FormSkeleton: Form fields skeleton với fieldCount đúng
- [ ] StatusGridSkeleton: Status grid với columns đúng
- [ ] ListSkeleton: List items với itemCount đúng
- [ ] PageSkeleton: Full page skeleton layout

#### LoadingScreen

- [ ] Auth guards hiển thị loading khi check permissions
- [ ] Component accept props: message, size, position, showMessage
- [ ] Default props hoạt động (backward compatible)
- [ ] Position absolute vs fixed hoạt động đúng
- [ ] CircularProgress size thay đổi theo prop
- [ ] Message hiển thị khi showMessage=true

#### PullToRefresh

- [ ] Mobile: Pull down trigger refresh
- [ ] Threshold 80px hoạt động đúng
- [ ] Resistance curve smooth (3x multiplier)
- [ ] Release animation mượt
- [ ] onRefresh callback trigger
- [ ] Desktop: Fallback to normal scroll
- [ ] Disabled prop hoạt động
- [ ] Không double-trigger khi đang loading

#### MobileDetailLayout

- [ ] Header sticky ở top (56px height)
- [ ] Back button navigate đúng
- [ ] Title + subtitle hiển thị
- [ ] Actions (FAB/buttons) render đúng
- [ ] Content area scrollable
- [ ] Footer sticky (nếu có)
- [ ] Pull-to-refresh tích hợp (nếu enabled)
- [ ] Desktop: Switch to 2-column layout

#### MobileBottomNav

- [ ] 4 tabs hiển thị: Home, Công việc, Yêu cầu, Menu
- [ ] Icons render đúng
- [ ] Labels hiển thị
- [ ] Active tab highlight
- [ ] Click tab navigate đúng route
- [ ] Bottom nav sticky ở bottom (64px height)
- [ ] Desktop: Hidden (showBottomNav=false)

---

### Visual Regression

- [ ] Không có layout shifts
- [ ] Spacing/padding đúng với design
- [ ] Colors match theme (light/dark mode)
- [ ] Typography consistent
- [ ] Responsive breakpoints hoạt động
- [ ] No visual glitches khi switch mobile/desktop

---

### Performance

- [ ] Không có memory leaks (check DevTools Performance tab)
- [ ] Animations 60 FPS (check với "Show paint flashing")
- [ ] Bundle size không tăng đột biến
- [ ] Lazy loading hoạt động (nếu có)
- [ ] No unnecessary re-renders (React DevTools Profiler)

---

### Cross-Browser

- [ ] Chrome: All features work
- [ ] Firefox: All features work
- [ ] Safari (iOS): Touch gestures work
- [ ] Edge: All features work

---

### Accessibility

- [ ] LoadingScreen có aria-label="Loading"
- [ ] SplashScreen có role="status"
- [ ] MobileBottomNav có aria-label cho mỗi tab
- [ ] Keyboard navigation hoạt động (Tab/Enter)
- [ ] Screen reader friendly

---

## 🔄 Rollback Plan

### Nếu Cần Rollback (Emergency)

#### Quick Rollback (5 phút)

```bash
# Revert về commit trước migration
git log --oneline -10  # Tìm commit trước migration
git revert <commit-hash> --no-edit
git push origin main
```

#### Selective Rollback (Từng Component)

**PullToRefresh:**

```bash
# Restore deprecated wrapper
git checkout HEAD~1 -- src/components/PullToRefreshWrapper/
git commit -m "rollback: Restore PullToRefreshWrapper"
```

**LoadingScreen:**

```bash
git checkout HEAD~1 -- src/components/LoadingScreen.js
# Update lại 14 imports về old path
git commit -m "rollback: Restore LoadingScreen"
```

**MobileBottomNav:**

```bash
git checkout HEAD~1 -- src/components/MobileBottomNav.js
# Update MainLayout import
git commit -m "rollback: Restore MobileBottomNav"
```

#### Full Rollback (30 phút)

```bash
# 1. Restore tất cả old files
git checkout <commit-before-migration> -- src/components/

# 2. Xóa mobile folder
rm -rf src/components/mobile/

# 3. Update lại tất cả imports
# Dùng find & replace:
# mobile/gestures/PullToRefresh → PullToRefreshWrapper
# mobile/layout/MobileDetailLayout → MobileDetailLayout
# mobile/layout/MobileBottomNav → MobileBottomNav
# mobile/feedback/LoadingScreen → LoadingScreen
# mobile/feedback/SkeletonLoader → SkeletonLoader
# mobile/feedback/SplashScreen → SplashScreen

# 4. Commit
git add .
git commit -m "rollback: Restore original component structure"
git push origin main
```

---

### Rollback Decision Matrix

| Scenario                    | Action                                  | Time   |
| --------------------------- | --------------------------------------- | ------ |
| 1 component broken          | Fix component only                      | 10 min |
| 2-3 components broken       | Selective rollback                      | 20 min |
| Auth guards broken          | FULL ROLLBACK immediately               | 30 min |
| >50% tests fail             | FULL ROLLBACK                           | 30 min |
| Performance regression >20% | Investigate first, rollback if critical | 1h     |

---

## 📊 Success Metrics

### Definition of Done

- [ ] **All 6 components migrated** to `mobile/` folder
- [ ] **StatusGridSkeleton duplicate fixed**
- [ ] **30+ files updated** with new import paths
- [ ] **All tests pass** (functional + visual + performance)
- [ ] **No console errors** in production build
- [ ] **Backward compatibility** maintained (deprecated paths still work)
- [ ] **Documentation updated** (README, migration guide)
- [ ] **Commit history clean** with descriptive messages

### Quality Gates

- [ ] **Build Success:** `npm run build` completes without errors
- [ ] **Lint Pass:** `npm run lint` passes all files
- [ ] **No PropTypes Warnings:** Console clean in dev mode
- [ ] **Bundle Size:** No increase >5% from baseline
- [ ] **Lighthouse Score:** Performance ≥90

---

## 📝 Migration Summary Template

```markdown
# Mobile Components Migration - Completion Report

**Date:** 19/01/2026
**Duration:** X hours (estimated 3.5h)
**Status:** ✅ COMPLETE / 🟡 IN PROGRESS / 🔴 BLOCKED

## Components Migrated

| Component          | Old Path                           | New Path                            | Files Updated | Status |
| ------------------ | ---------------------------------- | ----------------------------------- | ------------- | ------ |
| PullToRefresh      | `components/PullToRefreshWrapper/` | `mobile/gestures/PullToRefresh/`    | 9             | ✅     |
| MobileDetailLayout | `components/MobileDetailLayout/`   | `mobile/layout/MobileDetailLayout/` | 4             | ✅     |
| MobileBottomNav    | `components/MobileBottomNav.js`    | `mobile/layout/MobileBottomNav/`    | 2             | ✅     |
| LoadingScreen      | `components/LoadingScreen.js`      | `mobile/feedback/LoadingScreen/`    | 14            | ✅     |
| SkeletonLoader     | `components/SkeletonLoader/`       | `mobile/feedback/SkeletonLoader/`   | 2             | ✅     |
| SplashScreen       | `components/SplashScreen/`         | `mobile/feedback/SplashScreen/`     | 3             | ✅     |

## Issues Fixed

- ✅ StatusGridSkeleton duplicate removed
- ✅ LoadingScreen enhanced with props
- ✅ Backward compatibility wrappers created

## Testing Results

- Functional Tests: XX/XX passed
- Visual Tests: XX/XX passed
- Performance Tests: XX/XX passed
- Cross-Browser: XX/XX passed

## Deprecated Paths (Backward Compatible)

- `components/PullToRefreshWrapper` → Use `mobile/gestures/PullToRefresh`
- Will be removed in v2.0

## Next Steps

- [ ] Phase 5: Code Splitting (lazy loading routes)
- [ ] Monitor production for 1 week
- [ ] Remove deprecated paths in v2.0
```

---

## 🚀 Quick Start Guide

### Bắt Đầu Migration (Copy-Paste Commands)

```bash
# 1. Create branch
git checkout -b feature/mobile-components-migration

# 2. Backup important files
cp src/layout/MainLayout/index.js src/layout/MainLayout/index.js.backup
cp src/App.js src/App.js.backup

# 3. Phase 0: Fix duplicate (5 min)
# [Manual: Update 2 imports theo hướng dẫn Phase 0]
rm src/features/QuanLyCongViec/Dashboard/CongViecDashboard/components/shared/StatusGridSkeleton.js
git add .
git commit -m "fix: Remove StatusGridSkeleton duplicate"

# 4. Phase 1: Low risk (45 min)
# [Follow checklist Phase 1]

# 5. Phase 2: LoadingScreen (60 min)
# [Follow checklist Phase 2]

# 6. Phase 3: PullToRefresh (45 min)
# [Follow checklist Phase 3]

# 7. Phase 4: Testing (45 min)
# [Follow checklist Phase 4]

# 8. Merge
git push origin feature/mobile-components-migration
# Create PR → Review → Merge
```

---

## 📞 Support & References

### Documentation Links

- [Gesture Integration Guide](./GESTURE_INTEGRATION_GUIDE.md)
- [Mobile Components README](../../src/components/mobile/README.md)
- [Phase 4 Gestures Plan](./PHASE_4_GESTURES.md)

### Troubleshooting

**Import errors:**

- Check path từ `components/` sang `components/mobile/`
- Verify folder structure đúng

**Component not rendering:**

- Check console for errors
- Verify props passed correctly
- Check deprecated wrapper đúng

**Tests failing:**

- Clear browser cache
- Hard reload (Ctrl+Shift+R)
- Check DevTools console

**Need help:**

- Review detailed analysis trong chat history
- Check component source code
- Test trên Component Preview page

---

**END OF PLAN**

Last Updated: 19/01/2026  
Version: 1.0  
Status: 🟡 READY TO EXECUTE
