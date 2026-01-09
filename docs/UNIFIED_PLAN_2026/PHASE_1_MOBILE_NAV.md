# Phase 1: Mobile Bottom Navigation

**Thời gian:** 5 giờ  
**Ưu tiên:** 🔴 HIGH  
**Trạng thái:** ⏸️ Blocked by Phase 0

---

## 🎯 Mục Tiêu

Tạo bottom navigation bar native-like cho mobile devices, tương thích với cả 2 theme systems (Basic + Able).

### Vision

```
Desktop (không đổi):          Mobile (mới):
┌──┬──────────────┐          ┌──────────────┐
│S │ Content      │          │ Content      │
│I │              │          │ (full width) │
│D │              │          │              │
│E │              │          ├──────────────┤
│  │              │          │[🏠][📊][✓]  │
└──┴──────────────┘          │ [🔔][👤]    │
                             └──────────────┘
```

---

## 📦 Deliverables

1. ✅ `src/hooks/useMobileLayout.js` - Mobile detection hook
2. ✅ `src/components/MobileBottomNav.js` - 5-tab bottom navigation
3. ✅ `src/config/featureFlags.js` - PWA feature toggles
4. ✅ Updated MainLayout & MainLayoutAble - Integration
5. ✅ Badge notifications on tabs

---

## 📋 Task Breakdown (5h)

### Task 1.1: Create useMobileLayout.js (1h)

**File:** `src/hooks/useMobileLayout.js`

**Purpose:** Shared hook for mobile detection + theme awareness

**Implementation:**

```javascript
import { useMediaQuery, useTheme } from "@mui/material";

/**
 * useMobileLayout - Mobile detection hook
 * Works with both Basic and Able themes
 *
 * @returns {object} Mobile layout helpers
 */
export const useMobileLayout = () => {
  const theme = useTheme();

  // Breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // < 960px
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md")); // 600-960px
  const isPhone = useMediaQuery(theme.breakpoints.down("sm")); // < 600px
  const isDesktop = useMediaQuery(theme.breakpoints.up("md")); // >= 960px

  // Theme detection
  const isAbleTheme = theme.palette.mode !== undefined; // Able theme has dark mode

  // Touch target sizing (iOS/Android guidelines)
  const minTouchTarget = 48; // px minimum
  const optimalTouchTarget = 56; // px optimal

  // Spacing helpers
  const mobileSpacing = {
    xs: 1, // 8px
    sm: 1.5, // 12px
    md: 2, // 16px
    lg: 3, // 24px
  };

  const desktopSpacing = {
    xs: 1, // 8px
    sm: 2, // 16px
    md: 3, // 24px
    lg: 4, // 32px
  };

  return {
    // Device detection
    isMobile,
    isTablet,
    isPhone,
    isDesktop,

    // Theme detection
    isAbleTheme,
    isBasicTheme: !isAbleTheme,

    // Layout decisions
    showBottomNav: isMobile, // Show bottom nav on mobile
    showDrawer: isDesktop, // Show sidebar on desktop

    // Sizing
    minTouchTarget,
    optimalTouchTarget,
    spacing: isMobile ? mobileSpacing : desktopSpacing,

    // Helpers
    getResponsiveValue: (mobile, desktop) => (isMobile ? mobile : desktop),
  };
};

export default useMobileLayout;
```

**Usage Examples:**

```javascript
import { useMobileLayout } from "hooks/useMobileLayout";

function MyComponent() {
  const { isMobile, showBottomNav, minTouchTarget } = useMobileLayout();

  return (
    <Button
      sx={{
        minHeight: minTouchTarget,
        minWidth: minTouchTarget,
      }}
    >
      {isMobile ? "Tap" : "Click"}
    </Button>
  );
}
```

---

### Task 1.2: Create featureFlags.js (0.5h)

**File:** `src/config/featureFlags.js`

**Purpose:** Feature toggles for gradual PWA rollout

**Implementation:**

```javascript
/**
 * Feature Flags for PWA features
 * Control via environment variables
 */

export const FEATURE_FLAGS = {
  // Master PWA toggle
  ENABLE_PWA: process.env.REACT_APP_ENABLE_PWA !== "false",

  // Phase 1: Mobile Navigation
  ENABLE_MOBILE_BOTTOM_NAV: process.env.REACT_APP_ENABLE_BOTTOM_NAV !== "false",

  // Phase 2: Dashboard (will add in Phase 2)
  ENABLE_UNIFIED_DASHBOARD: process.env.REACT_APP_ENABLE_DASHBOARD !== "false",

  // Phase 3: Splash & Skeleton
  ENABLE_SPLASH_SCREEN: process.env.REACT_APP_ENABLE_SPLASH !== "false",
  ENABLE_SKELETON_LOADING: process.env.REACT_APP_ENABLE_SKELETON !== "false",

  // Phase 4: Gestures
  ENABLE_PULL_TO_REFRESH: process.env.REACT_APP_ENABLE_PULL_REFRESH !== "false",
  ENABLE_SWIPE_ACTIONS: process.env.REACT_APP_ENABLE_SWIPE !== "false",
  ENABLE_LONG_PRESS: process.env.REACT_APP_ENABLE_LONG_PRESS !== "false",

  // Phase 5: Performance
  ENABLE_LAZY_LOADING: process.env.REACT_APP_ENABLE_LAZY_LOAD !== "false",
  ENABLE_OFFLINE_MODE: process.env.REACT_APP_ENABLE_OFFLINE !== "false",

  // Emergency kill switch
  FORCE_DESKTOP_MODE: process.env.REACT_APP_FORCE_DESKTOP === "true",
};

/**
 * Check if PWA features are enabled
 */
export const isPWAEnabled = () => {
  return FEATURE_FLAGS.ENABLE_PWA && !FEATURE_FLAGS.FORCE_DESKTOP_MODE;
};

/**
 * Check if specific feature is enabled
 */
export const isFeatureEnabled = (feature) => {
  if (FEATURE_FLAGS.FORCE_DESKTOP_MODE) return false;
  if (!FEATURE_FLAGS.ENABLE_PWA) return false;
  return FEATURE_FLAGS[feature] !== false;
};

/**
 * Get all enabled features (for debugging)
 */
export const getEnabledFeatures = () => {
  return Object.entries(FEATURE_FLAGS)
    .filter(([key, value]) => value === true)
    .map(([key]) => key);
};

export default FEATURE_FLAGS;
```

**.env.development:**

```bash
# PWA Feature Flags (Development - All ON by default)
REACT_APP_ENABLE_PWA=true
REACT_APP_ENABLE_BOTTOM_NAV=true
REACT_APP_ENABLE_DASHBOARD=false  # Phase 2 not ready yet
REACT_APP_ENABLE_SPLASH=false     # Phase 3 not ready yet
REACT_APP_ENABLE_SKELETON=false
REACT_APP_ENABLE_PULL_REFRESH=false
REACT_APP_ENABLE_SWIPE=false
REACT_APP_ENABLE_LONG_PRESS=false
REACT_APP_ENABLE_LAZY_LOAD=false
REACT_APP_ENABLE_OFFLINE=false

# Emergency kill switch
REACT_APP_FORCE_DESKTOP=false
```

**.env.production:**

```bash
# Production - Gradual rollout
REACT_APP_ENABLE_PWA=true
REACT_APP_ENABLE_BOTTOM_NAV=true  # Phase 1 stable
# ... enable more as phases complete
```

---

### Task 1.3: Create MobileBottomNav.js (2h)

**File:** `src/components/MobileBottomNav.js`

**Purpose:** Native-like bottom navigation with 5 tabs

**Implementation:**

```javascript
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Badge,
  Box,
} from "@mui/material";
import {
  Home as HomeIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
} from "@mui/icons-material";

import { useMobileLayout } from "hooks/useMobileLayout";
import { isFeatureEnabled } from "config/featureFlags";
import { WorkRoutes } from "utils/navigationHelper";

/**
 * MobileBottomNav - 5-tab bottom navigation
 * Only shows on mobile (< 960px)
 * Works with both Basic and Able themes
 */
const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showBottomNav, optimalTouchTarget } = useMobileLayout();

  // Feature flag check
  if (!isFeatureEnabled("ENABLE_MOBILE_BOTTOM_NAV")) {
    return null;
  }

  // Hide on desktop
  if (!showBottomNav) {
    return null;
  }

  // Determine active tab from pathname
  const getActiveTab = () => {
    const path = location.pathname;

    if (path === "/" || path === "/home" || path === "/dashboard") return 0;
    if (path.startsWith("/quanlycongviec/congviec")) return 1;
    if (path.startsWith("/quanlycongviec/yeucau")) return 2;
    if (path.startsWith("/notifications")) return 3;
    if (path.startsWith("/profile") || path.startsWith("/nhanvien")) return 4;

    return 0; // Default to home
  };

  const [value, setValue] = React.useState(getActiveTab());

  // Sync with location changes
  React.useEffect(() => {
    setValue(getActiveTab());
  }, [location.pathname]);

  const handleChange = (event, newValue) => {
    setValue(newValue);

    switch (newValue) {
      case 0:
        navigate("/dashboard");
        break;
      case 1:
        // Navigate to "Công việc của tôi"
        // Will update in Phase 2 to dashboard
        const userId = localStorage.getItem("currentUserId"); // Or from useAuth()
        navigate(WorkRoutes.congViecList(userId));
        break;
      case 2:
        navigate(WorkRoutes.yeuCauDashboard());
        break;
      case 3:
        navigate("/notifications");
        break;
      case 4:
        navigate("/profile");
        break;
      default:
        break;
    }
  };

  // Badge counts (mock - will integrate with Redux in future)
  const badges = {
    congViec: 5, // Unread tasks
    yeuCau: 3, // Pending requests
    notifications: 12,
  };

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        borderTop: 1,
        borderColor: "divider",
      }}
      elevation={8}
    >
      <BottomNavigation
        value={value}
        onChange={handleChange}
        showLabels
        sx={{
          height: optimalTouchTarget + 8, // 64px total height
          "& .MuiBottomNavigationAction-root": {
            minWidth: "auto",
            padding: "6px 12px",
          },
          "& .MuiBottomNavigationAction-label": {
            fontSize: "0.75rem",
            marginTop: "4px",
          },
        }}
      >
        <BottomNavigationAction
          label="Trang chủ"
          icon={<HomeIcon />}
          sx={{ minHeight: optimalTouchTarget }}
        />

        <BottomNavigationAction
          label="Công việc"
          icon={
            <Badge badgeContent={badges.congViec} color="error" max={99}>
              <AssignmentIcon />
            </Badge>
          }
          sx={{ minHeight: optimalTouchTarget }}
        />

        <BottomNavigationAction
          label="Yêu cầu"
          icon={
            <Badge badgeContent={badges.yeuCau} color="warning" max={99}>
              <CheckCircleIcon />
            </Badge>
          }
          sx={{ minHeight: optimalTouchTarget }}
        />

        <BottomNavigationAction
          label="Thông báo"
          icon={
            <Badge badgeContent={badges.notifications} color="primary" max={99}>
              <NotificationsIcon />
            </Badge>
          }
          sx={{ minHeight: optimalTouchTarget }}
        />

        <BottomNavigationAction
          label="Cá nhân"
          icon={<PersonIcon />}
          sx={{ minHeight: optimalTouchTarget }}
        />
      </BottomNavigation>
    </Paper>
  );
};

export default MobileBottomNav;
```

**Features:**

- ✅ 5 tabs: Home, Công việc, Yêu cầu, Thông báo, Cá nhân
- ✅ Badge notifications (counts)
- ✅ Active state highlighting
- ✅ 56px optimal touch targets
- ✅ Fixed position at bottom
- ✅ Syncs with route changes
- ✅ Feature flag controlled

---

### Task 1.4: Layout Integration (1.5h)

**Goal:** Show bottom nav on mobile, sidebar on desktop

#### **1.4.1 Update MainLayout (Basic Theme) - 0.75h**

**File:** `src/layout/MainLayout/index.js`

```javascript
import React from "react";
import { Outlet } from "react-router-dom";
import { Box, useMediaQuery } from "@mui/material";

import Header from "./Header";
import Sidebar from "./Sidebar";
import MobileBottomNav from "components/MobileBottomNav";
import { useMobileLayout } from "hooks/useMobileLayout";

const MainLayout = () => {
  const { showBottomNav, showDrawer } = useMobileLayout();
  const [drawerOpen, setDrawerOpen] = React.useState(showDrawer);

  // Responsive drawer behavior
  React.useEffect(() => {
    setDrawerOpen(showDrawer);
  }, [showDrawer]);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box sx={{ display: "flex", width: "100%" }}>
      {/* Header - always show */}
      <Header onDrawerToggle={handleDrawerToggle} drawerOpen={drawerOpen} />

      {/* Sidebar - only desktop */}
      {showDrawer && (
        <Sidebar open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          width: "100%",
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          mt: "64px", // Header height
          mb: showBottomNav ? "64px" : 0, // Bottom nav height on mobile
          ml: drawerOpen && showDrawer ? "260px" : 0, // Sidebar width on desktop
          transition: (theme) =>
            theme.transitions.create(["margin", "width"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Outlet />
      </Box>

      {/* Bottom Nav - only mobile */}
      {showBottomNav && <MobileBottomNav />}
    </Box>
  );
};

export default MainLayout;
```

**Key Changes:**

- Import `MobileBottomNav` and `useMobileLayout`
- Conditionally render sidebar (desktop only)
- Conditionally render bottom nav (mobile only)
- Add bottom margin when bottom nav present
- Responsive drawer behavior

#### **1.4.2 Update MainLayoutAble (Able Theme) - 0.75h**

**File:** `src/layout/MainLayoutAble/index.js`

```javascript
import React from "react";
import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Box, Toolbar, useMediaQuery, useTheme } from "@mui/material";

import Header from "./Header";
import Drawer from "./Drawer";
import MobileBottomNav from "components/MobileBottomNav";
import { useMobileLayout } from "hooks/useMobileLayout";
import { openDrawer } from "features/Menu/menuSlice";

const MainLayoutAble = () => {
  const theme = useTheme();
  const { showBottomNav, showDrawer } = useMobileLayout();

  const dispatch = useDispatch();
  const drawerOpen = useSelector((state) => state.menu.drawerOpen);

  // Auto-close drawer on mobile
  React.useEffect(() => {
    if (!showDrawer && drawerOpen) {
      dispatch(openDrawer(false));
    }
  }, [showDrawer, drawerOpen, dispatch]);

  const handleDrawerToggle = () => {
    dispatch(openDrawer(!drawerOpen));
  };

  return (
    <Box sx={{ display: "flex", width: "100%" }}>
      {/* Header */}
      <Header onDrawerToggle={handleDrawerToggle} />

      {/* Drawer - only desktop or when explicitly opened on mobile */}
      {showDrawer && <Drawer open={drawerOpen} />}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          width: "100%",
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          mb: showBottomNav ? "64px" : 0, // Space for bottom nav
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>

      {/* Bottom Nav - only mobile */}
      {showBottomNav && <MobileBottomNav />}
    </Box>
  );
};

export default MainLayoutAble;
```

**Key Changes:**

- Import `MobileBottomNav` and `useMobileLayout`
- Conditionally show drawer (desktop only)
- Add bottom nav (mobile only)
- Add bottom margin for content
- Sync drawer state with breakpoint

---

## ✅ Success Criteria

- [ ] Bottom nav shows on mobile (< 960px)
- [ ] Bottom nav hides on desktop (>= 960px)
- [ ] Sidebar shows on desktop
- [ ] Sidebar hides on mobile
- [ ] 5 tabs work: Home, Công việc, Yêu cầu, Thông báo, Cá nhân
- [ ] Active tab highlights correctly
- [ ] Badge counts display (mock data)
- [ ] Tap targets >= 48px
- [ ] Works on both Basic and Able themes
- [ ] Feature flag can disable bottom nav
- [ ] No layout shifts during transitions
- [ ] No content hidden behind bottom nav

---

## 🧪 Testing Checklist

### Responsive Tests

- [ ] Resize browser 320px → 1920px (smooth transitions)
- [ ] Bottom nav appears at 960px breakpoint
- [ ] Sidebar disappears at 960px breakpoint
- [ ] No content overlap

### Navigation Tests

- [ ] Tap Home tab → Navigate to /dashboard
- [ ] Tap Công việc tab → Navigate to work list
- [ ] Tap Yêu cầu tab → Navigate to requests
- [ ] Tap Thông báo tab → Navigate to notifications
- [ ] Tap Cá nhân tab → Navigate to profile
- [ ] Active tab stays highlighted
- [ ] Badge counts display correctly

### Theme Tests

- [ ] Works with MainLayout (Basic theme)
- [ ] Works with MainLayoutAble (Able theme)
- [ ] Dark mode compatible (Able theme)
- [ ] Colors match theme

### Device Tests (Real Devices)

- [ ] iPhone 13 (390x844) - Safari
- [ ] iPhone SE (375x667) - Safari
- [ ] Samsung Galaxy S21 (360x800) - Chrome
- [ ] iPad (768x1024) - Safari
- [ ] All tap targets easy to reach with thumb

### Feature Flag Tests

- [ ] `ENABLE_MOBILE_BOTTOM_NAV=false` → No bottom nav
- [ ] `FORCE_DESKTOP_MODE=true` → No bottom nav
- [ ] `ENABLE_PWA=false` → No bottom nav

---

## 🚧 Dependencies

**Required:**

- ⚠️ **Phase 0 must complete** - Needs `WorkRoutes` from navigationHelper

**Optional:**

- Phase 2 (Dashboard) will update "Công việc" tab destination
- Future: Badge counts from Redux state

---

## 🚨 Risks & Mitigation

| Risk                      | Mitigation                                                        |
| ------------------------- | ----------------------------------------------------------------- |
| Bottom nav covers content | - Add `mb: 64px` to main content<br>- Test all pages              |
| Theme conflicts           | - Use theme-agnostic `useMobileLayout` hook<br>- Test both themes |
| Badge count bugs          | - Use mock data initially<br>- Redux integration in Phase 2       |
| Drawer conflicts          | - Sync drawer state with breakpoint<br>- Test transitions         |

---

## 📝 Notes

- **Touch Targets:** 56px optimal (iOS/Android standard)
- **z-index:** Bottom nav = appBar level (1100)
- **Badges:** Mock data now, Redux state later
- **Icons:** Material-UI icons (already installed)
- **Animation:** Native MUI transitions
- **Accessibility:** ARIA labels on all tabs

---

**Next Phase:** Phase 2 - Dashboard Architecture (can start after Phase 0)
