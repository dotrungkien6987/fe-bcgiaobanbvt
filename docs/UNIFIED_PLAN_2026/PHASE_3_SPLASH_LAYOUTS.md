# Phase 3: Splash Screen + Mobile Layouts

**Thời gian:** 33 giờ  
**Ưu tiên:** 🟡 MEDIUM  
**Trạng thái:** ⏸️ Blocked by Phase 0, Phase 1

---

## 🎯 Mục Tiêu

Tạo splash screen system + Mobile-optimized detail layouts cho QuanLyCongViec module.

### Vision

```
App Launch Flow:           Mobile Detail Layouts:
┌──────────────────┐      ┌──────────────────┐
│ Splash Screen    │      │ ← Header (56px)  │
│  [Logo + Text]   │  →   │ ─────────────────│
│  [Progress bar]  │      │ Content Area     │
└──────────────────┘      │ (scrollable)     │
        ↓                  │ ─────────────────│
┌──────────────────┐      │ Footer (optional)│
│ App Content      │      └──────────────────┘
└──────────────────┘
```

---

## 📦 Deliverables

### 3A. Splash Screen + Skeleton (5h)

- ✅ `SplashScreen.js` - Logo + progress bar
- ✅ `SkeletonLoader.js` - Content placeholders
- ✅ Preload logic for critical data

### 3B. Mobile Detail Layouts (28h)

- ✅ `MobileDetailLayout.js` - Shared layout component
- ✅ 10+ detail page refactors (CongViec, KPI, YeuCau, etc.)
- ✅ Responsive patterns documented

---

## 📋 Task Breakdown (33h)

## PHASE 3A: Splash Screen + Skeleton (5h)

### Task 3A.1: Create SplashScreen Component (2h)

**File:** `src/components/SplashScreen.js`

**Implementation:**

```javascript
import React, { useEffect, useState } from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import { keyframes } from "@mui/system";

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => onComplete?.(), 300); // Fade out duration
          return 100;
        }
        return prev + 10;
      });
    }, 100); // 1 second total (10% * 100ms)

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "background.default",
        zIndex: 9999,
        animation: progress >= 100 ? `${fadeIn} 0.3s ease-out reverse` : "none",
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          animation: `${fadeIn} 0.5s ease-out`,
        }}
      >
        <img
          src="/logo192.png" // From public folder
          alt="Hospital Logo"
          style={{ width: 120, height: 120, marginBottom: 24 }}
        />
      </Box>

      {/* App Name */}
      <Typography
        variant="h4"
        sx={{
          mb: 4,
          animation: `${fadeIn} 0.5s ease-out 0.2s both`,
        }}
      >
        Hệ thống Quản lý Bệnh viện
      </Typography>

      {/* Progress Bar */}
      <Box sx={{ width: 240, animation: `${fadeIn} 0.5s ease-out 0.4s both` }}>
        <LinearProgress variant="determinate" value={progress} />
        <Typography
          variant="caption"
          color="text.secondary"
          align="center"
          mt={1}
        >
          Đang tải...
        </Typography>
      </Box>
    </Box>
  );
}

export default SplashScreen;
```

---

### Task 3A.2: Integrate SplashScreen in App (1h)

**File:** `src/App.js`

```javascript
import React, { useState, useEffect } from "react";
import SplashScreen from "components/SplashScreen";

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // Preload critical data
    const preloadData = async () => {
      try {
        // Example: Preload user profile, permissions, etc.
        await Promise.all([
          // apiService.get("/auth/me"),
          // apiService.get("/config/app-settings"),
        ]);
      } catch (error) {
        console.error("Preload error:", error);
      } finally {
        setIsAppReady(true);
      }
    };

    preloadData();
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (showSplash || !isAppReady) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return <BrowserRouter>{/* Existing app content */}</BrowserRouter>;
}
```

**Feature Flag:**

```javascript
// src/config/featureFlags.js
export const featureFlags = {
  // ...existing
  enableSplashScreen: true, // Toggle splash screen
};
```

**Conditional rendering:**

```javascript
// In App.js
import { featureFlags } from "config/featureFlags";

if (featureFlags.enableSplashScreen && (showSplash || !isAppReady)) {
  return <SplashScreen onComplete={handleSplashComplete} />;
}
```

---

### Task 3A.3: Create SkeletonLoader Components (2h)

**File:** `src/components/SkeletonLoader/CardSkeleton.js`

```javascript
import React from "react";
import { Card, CardContent, Skeleton, Box } from "@mui/material";

function CardSkeleton({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="text" width="40%" />
            <Box display="flex" justifyContent="space-between" mt={2}>
              <Skeleton variant="rectangular" width={80} height={40} />
              <Skeleton variant="rectangular" width={80} height={40} />
            </Box>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export default CardSkeleton;
```

**File:** `src/components/SkeletonLoader/TableSkeleton.js`

```javascript
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Skeleton,
} from "@mui/material";

function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          {Array.from({ length: columns }).map((_, i) => (
            <TableCell key={i}>
              <Skeleton variant="text" />
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <TableCell key={colIndex}>
                <Skeleton variant="text" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default TableSkeleton;
```

**Usage Example:**

```javascript
// In CongViecListPage.js
import { TableSkeleton } from "components/SkeletonLoader";

{
  isLoading && !congViecs.length ? (
    <TableSkeleton rows={10} columns={6} />
  ) : (
    <CongViecTable data={congViecs} />
  );
}
```

---

## PHASE 3B: Mobile Detail Layouts (28h)

### Task 3B.1: Create MobileDetailLayout Component (4h)

**File:** `src/components/layouts/MobileDetailLayout.js`

**Purpose:** Reusable mobile-optimized layout for detail pages

**Features:**

- 56px header with back button
- Scrollable content area
- Optional sticky footer
- Gesture support (Pull to Refresh, Swipe to go back)

**Implementation:**

```javascript
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import { useMobileLayout } from "hooks/useMobileLayout";

function MobileDetailLayout({
  title,
  subtitle,
  backPath,
  onBack,
  actions, // Actions for top-right (e.g., Edit, Delete)
  children,
  footer, // Optional sticky footer
  enablePullToRefresh = false,
  onRefresh,
}) {
  const navigate = useNavigate();
  const theme = useTheme();
  const { isMobile } = useMobileLayout();
  const contentRef = useRef(null);

  const [refreshing, setRefreshing] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  const handleRefresh = async () => {
    if (!onRefresh || refreshing) return;

    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  // Pull-to-refresh logic (simplified)
  const handleTouchStart = (e) => {
    // TODO: Implement pull-to-refresh gesture
    // See Phase 4 for full implementation
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <AppBar
        position="static"
        elevation={isMobile ? 0 : 1}
        sx={{
          borderBottom: isMobile
            ? `1px solid ${theme.palette.divider}`
            : "none",
        }}
      >
        <Toolbar sx={{ minHeight: 56, px: 1 }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" noWrap>
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                color="inherit"
                sx={{ opacity: 0.7 }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          {actions}
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Box
        ref={contentRef}
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
          px: isMobile ? 2 : 3,
          py: 2,
        }}
        onTouchStart={enablePullToRefresh ? handleTouchStart : undefined}
      >
        {refreshing && (
          <Box display="flex" justifyContent="center" py={2}>
            <Typography variant="caption">Đang tải...</Typography>
          </Box>
        )}

        {children}
      </Box>

      {/* Footer (optional) */}
      {footer && (
        <Box
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            p: 2,
            backgroundColor: "background.paper",
          }}
        >
          {footer}
        </Box>
      )}
    </Box>
  );
}

export default MobileDetailLayout;
```

---

### Task 3B.2: Refactor CongViecDetailPage (3h)

**File:** `src/features/QuanLyCongViec/CongViec/CongViecDetailPage.js`

**Before:** Desktop-optimized, no mobile layout  
**After:** Uses MobileDetailLayout on mobile, keeps desktop layout

```javascript
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Container, Box, IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import MobileDetailLayout from "components/layouts/MobileDetailLayout";
import { useMobileLayout } from "hooks/useMobileLayout";
import { getCongViecById, deleteCongViec } from "./congViecSlice";
import { WorkRoutes } from "utils/navigationHelper";

// Import detail sections
import CongViecHeader from "./components/CongViecHeader";
import CongViecInfoSection from "./components/CongViecInfoSection";
import CongViecCommentsSection from "./components/CongViecCommentsSection";
import CongViecFilesSection from "./components/CongViecFilesSection";

function CongViecDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isMobile } = useMobileLayout();

  const { selectedCongViec, isLoading } = useSelector(
    (state) => state.congviec
  );

  const [anchorEl, setAnchorEl] = React.useState(null);

  useEffect(() => {
    dispatch(getCongViecById(id));
  }, [dispatch, id]);

  const handleEdit = () => {
    navigate(WorkRoutes.congViecEdit(id));
    setAnchorEl(null);
  };

  const handleDelete = () => {
    if (window.confirm("Xác nhận xóa công việc này?")) {
      dispatch(deleteCongViec(id));
      navigate(WorkRoutes.congViecList());
    }
    setAnchorEl(null);
  };

  const handleRefresh = async () => {
    await dispatch(getCongViecById(id));
  };

  // Actions menu
  const actionsMenu = (
    <>
      <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={handleEdit}>Chỉnh sửa</MenuItem>
        <MenuItem onClick={handleDelete}>Xóa</MenuItem>
      </Menu>
    </>
  );

  // Render content
  const content = (
    <>
      <CongViecHeader data={selectedCongViec} />
      <CongViecInfoSection data={selectedCongViec} />
      <CongViecFilesSection congViecId={id} />
      <CongViecCommentsSection congViecId={id} />
    </>
  );

  // Mobile: Use MobileDetailLayout
  if (isMobile) {
    return (
      <MobileDetailLayout
        title={selectedCongViec?.TenCongViec || "Chi tiết công việc"}
        subtitle={`#${selectedCongViec?.MaCongViec || ""}`}
        backPath={WorkRoutes.congViecList()}
        actions={actionsMenu}
        enablePullToRefresh
        onRefresh={handleRefresh}
      >
        {content}
      </MobileDetailLayout>
    );
  }

  // Desktop: Keep existing layout
  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" mb={2}>
        {actionsMenu}
      </Box>
      {content}
    </Container>
  );
}

export default CongViecDetailPage;
```

---

### Task 3B.3: Refactor 9 More Detail Pages (21h @ 2.3h each)

**Pages to refactor:**

1. **YeuCauDetailPage** (2h) - Similar pattern to CongViec
2. **DanhGiaKPIDetailPage** (3h) - Complex layout with nested tables
3. **NhiemVuThuongQuyDetailPage** (2h)
4. **PhongBanDetailPage** (2h)
5. **NhanVienDetailPage** (3h) - Profile layout
6. **ChuKyDetailPage** (2h)
7. **TieuChiDetailPage** (2h)
8. **BaoCaoNgayDetailPage** (3h) - Patient images
9. **BaoCaoSuCoDetailPage** (2h) - Incident workflow

**Refactor Pattern (same for all):**

```javascript
import { useMobileLayout } from "hooks/useMobileLayout";
import MobileDetailLayout from "components/layouts/MobileDetailLayout";

function SomeDetailPage() {
  const { isMobile } = useMobileLayout();

  // ... existing logic

  const content = (
    // Existing detail sections
  );

  if (isMobile) {
    return (
      <MobileDetailLayout
        title={item?.Name}
        backPath={backPath}
        actions={actionsMenu}
        enablePullToRefresh
        onRefresh={handleRefresh}
      >
        {content}
      </MobileDetailLayout>
    );
  }

  return (
    <Container maxWidth="lg">
      {content}
    </Container>
  );
}
```

**Common Changes:**

- ✅ Wrap content in conditional layout
- ✅ Extract actions to menu
- ✅ Add refresh handler
- ✅ Preserve desktop layout
- ✅ Test mobile scrolling

---

## ✅ Success Criteria

### Phase 3A: Splash Screen

- [ ] SplashScreen shows on app launch
- [ ] Logo animation smooth
- [ ] Progress bar fills in 1 second
- [ ] Preload logic works
- [ ] Feature flag toggles splash
- [ ] Skeleton loaders render correctly

### Phase 3B: Mobile Layouts

- [ ] MobileDetailLayout has 56px header
- [ ] Back button navigates correctly
- [ ] Content scrollable with momentum
- [ ] Actions menu works
- [ ] Pull-to-refresh placeholder works
- [ ] 10 detail pages refactored
- [ ] Desktop layouts unchanged
- [ ] No layout shifts

---

## 🧪 Testing Checklist

### Splash Screen Tests

- [ ] Logo renders on app start
- [ ] Progress bar completes in ~1s
- [ ] Fade-out animation smooth
- [ ] No flash of content before splash
- [ ] Works on all screen sizes
- [ ] Feature flag disables splash

### Mobile Layout Tests

- [ ] Header sticky on scroll
- [ ] Back button navigates
- [ ] Content scrolls smoothly
- [ ] Actions menu opens
- [ ] Refresh indicator shows
- [ ] Footer sticky (if present)
- [ ] No horizontal scroll
- [ ] Touch targets ≥ 48px

### Cross-Device Tests

- [ ] iPhone SE (375px width)
- [ ] iPhone 12 Pro (390px)
- [ ] Android mid-range (360px)
- [ ] iPad (768px - should use desktop layout)
- [ ] Desktop (1920px - unchanged)

---

## 🚧 Dependencies

**Required:**

- ⚠️ **Phase 0** - Navigation helper
- ⚠️ **Phase 1** - `useMobileLayout` hook

**Optional:**

- Phase 4 (Gestures) - Full Pull-to-Refresh implementation

---

## 🚨 Risks & Mitigation

| Risk                   | Mitigation                                                                 |
| ---------------------- | -------------------------------------------------------------------------- |
| Layout regressions     | - Keep desktop unchanged<br>- Test both layouts<br>- Feature flag rollback |
| Performance issues     | - Skeleton loaders<br>- Lazy load images<br>- Virtual scrolling if needed  |
| Touch scrolling bugs   | - WebkitOverflowScrolling<br>- Test on real devices                        |
| Complex nested content | - Start with simple pages<br>- Refactor incrementally                      |

---

## 📝 Notes

- **Non-breaking:** Desktop layouts unchanged, mobile-only additions
- **Progressive enhancement:** Splash screen optional via feature flag
- **Reusable pattern:** MobileDetailLayout standardizes all detail pages
- **Phase 4 dependency:** Pull-to-refresh gesture in Phase 4

---

**Next Phase:** Phase 4 - Gesture Components
