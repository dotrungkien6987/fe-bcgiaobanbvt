# 📚 PWA Conversion - FAQ & Clarifications

> **Mục đích:** Trả lời chi tiết các câu hỏi quan trọng về kiến trúc, rủi ro, và maintenance

**Last Updated:** 2026-01-07  
**Related:** [MASTER_PLAN.md](MASTER_PLAN.md)

---

## Table of Contents

1. [PWA vs FCM Integration](#1-pwa-vs-fcm-integration)
2. [Frontend vs Backend Changes](#2-frontend-vs-backend-changes)
3. [Component Strategy: New vs Modify](#3-component-strategy)
4. [Desktop View Protection](#4-desktop-view-protection)
5. [Future Maintenance Overhead](#5-future-maintenance-overhead)
6. [Dual Theme System](#6-dual-theme-system)
7. [Feature Flags Strategy](#7-feature-flags-strategy)

---

## 1. PWA vs FCM Integration

### Q: PWA Conversion hoàn toàn độc lập với FCM?

**A: ✅ Có, 95% độc lập**

```
PWA Conversion (Current Plan):
├── UI/UX improvements (bottom nav, gestures, etc.)
├── Service Worker: Cache strategies
├── Offline support: IndexedDB queue
└── Browser Notifications API (generic)

FCM Integration (Future, separate):
├── Firebase Admin SDK (backend)
├── firebase/messaging (frontend library)
└── Service Worker: FCM-specific push handlers

Overlap: ~5% (service worker file merge)
```

### Merge Strategy

Khi cần integrate FCM sau này:

```javascript
// public/service-worker.js

// ============================================
// PWA SECTION (Current plan - Phase 5)
// ============================================
const CACHE_NAME = "hospital-pwa-v0.1.0";

self.addEventListener("fetch", (event) => {
  // Cache strategies from Phase 5
});

self.addEventListener("sync", (event) => {
  // Background sync from Phase 5
});

// ============================================
// FCM SECTION (Future integration)
// ============================================
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  // Firebase config
});

const messaging = firebase.messaging();

self.addEventListener("push", (event) => {
  // FCM push notification handler
  const payload = event.data.json();
  const { title, body, icon } = payload.notification;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge: "/badge-icon.png",
      data: payload.data,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  // FCM notification click handler
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
```

**Timeline:**

```
Now:      PWA Conversion (Phase 1-6)
         ↓
Week 8:   FCM Planning
         ↓
Week 9:   FCM Backend (Firebase Admin SDK)
         ↓
Week 10:  FCM Frontend + SW Merge
         ↓
Week 11:  Testing & Rollout
```

---

## 2. Frontend vs Backend Changes

### Q: Phân bố thay đổi FE/BE là bao nhiêu?

**A: 95% Frontend, 5% Backend (optional)**

### Detailed Breakdown

```
┌─────────────────────────────────────────────────────┐
│ FRONTEND: 95%                                       │
├─────────────────────────────────────────────────────┤
│ New Components:           40%                       │
│ ├── Mobile navigation     (Phase 1)                 │
│ ├── Splash/Skeletons      (Phase 2)                 │
│ ├── Gesture wrappers      (Phase 3)                 │
│ └── Mobile UI library     (Phase 6)                 │
│                                                     │
│ Layout Modifications:     25%                       │
│ ├── MainLayout            (Phase 1)                 │
│ ├── MainLayoutAble        (Phase 1)                 │
│ └── Header responsive     (Phase 1)                 │
│                                                     │
│ Route Optimization:       15%                       │
│ └── Lazy loading          (Phase 4)                 │
│                                                     │
│ Theme/Styling:            10%                       │
│ ├── Breakpoint updates    (Phase 1)                 │
│ └── Touch target sizing   (Phase 6)                 │
│                                                     │
│ Service Worker:           5%                        │
│ └── Cache/offline logic   (Phase 5)                 │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ BACKEND: 5% (OPTIONAL)                              │
├─────────────────────────────────────────────────────┤
│ API Cache Headers:        100% of backend work      │
│ └── Add `Cache-Control` to responses               │
│                                                     │
│ Estimate: 30 minutes                                │
│ Impact: Improves offline experience                 │
│ Required: No (frontend caching works without it)    │
└─────────────────────────────────────────────────────┘
```

### Backend Changes Detail

**File:** `giaobanbv-be/helpers/utils.js`

```javascript
// Current sendResponse
const sendResponse = (res, status, success, data, errors, message) => {
  return res.status(status).json({
    success,
    data,
    errors,
    message,
  });
};

// Enhanced with cache headers (optional)
const sendResponse = (
  res,
  status,
  success,
  data,
  errors,
  message,
  cacheOptions = {}
) => {
  // Add cache headers if specified
  if (cacheOptions.maxAge) {
    res.setHeader("Cache-Control", `public, max-age=${cacheOptions.maxAge}`);
  }
  if (cacheOptions.etag !== false) {
    res.setHeader("ETag", generateETag(data)); // Optional ETag
  }

  return res.status(status).json({
    success,
    data,
    errors,
    message,
  });
};
```

**Usage in routes:**

```javascript
// giaobanbv-be/controllers/khoaController.js

// Current:
return sendResponse(res, 200, true, khoas, null, "Get Khoa list");

// With caching (optional):
return sendResponse(
  res,
  200,
  true,
  khoas,
  null,
  "Get Khoa list",
  { maxAge: 86400 } // 24 hours for master data
);
```

**Files needing cache headers (~5 files):**

```
giaobanbv-be/controllers/
├── khoaController.js         (maxAge: 86400 - 24h)
├── nhanvienController.js     (maxAge: 3600 - 1h)
├── datafixController.js      (maxAge: 86400 - 24h)
└── ... (only master data endpoints)
```

---

## 3. Component Strategy

### Q: Tạo mới hay sửa component cũ? Tỷ lệ bao nhiêu?

**A: 60% New, 20% Modify, 20% Wrap**

### Strategy Breakdown

```
┌────────────────────────────────────────────────────┐
│ 1. TẠO MỚI (60%) - Low Risk                       │
├────────────────────────────────────────────────────┤
│ Mobile-specific components không ảnh hưởng desktop │
│                                                    │
│ src/components/@extended/mobile/                   │
│ ├── MobileBottomNav.js                             │
│ ├── PullToRefreshWrapper.jsx                      │
│ ├── SwipeableCard.jsx                             │
│ ├── MobileCard.js                                 │
│ ├── MobileDialog.js                               │
│ └── TouchButton.js                                │
│                                                    │
│ src/components/skeletons/                          │
│ ├── PageSkeleton.js                               │
│ ├── CardListSkeleton.js                           │
│ └── FormSkeleton.js                               │
│                                                    │
│ Risk: 🟢 LOW                                       │
│ └── Desktop không import → không ảnh hưởng         │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│ 2. SỬA RESPONSIVE (20%) - Medium Risk              │
├────────────────────────────────────────────────────┤
│ Add mobile detection, không xóa logic cũ           │
│                                                    │
│ src/layout/MainLayout/index.js                     │
│ BEFORE:                                            │
│   const drawerWidth = DRAWER_WIDTH;                │
│                                                    │
│ AFTER:                                             │
│   const isMobile = useMediaQuery(...);             │
│   const drawerWidth = isMobile ? 0 : DRAWER_WIDTH; │
│   // ↑ ADD logic, not replace                     │
│                                                    │
│ src/theme/index.js                                 │
│ BEFORE:                                            │
│   breakpoints: { xs: 0, sm: 600, md: 900 }        │
│                                                    │
│ AFTER:                                             │
│   breakpoints: { xs: 0, sm: 768, md: 1024 }       │
│   // ↑ Adjust values, not remove keys             │
│                                                    │
│ src/components/form/FTextField.js                  │
│ AFTER:                                             │
│   sx={{                                            │
│     ...existingStyles,                            │
│     minHeight: isMobile ? 48 : 36  // ADD         │
│   }}                                               │
│                                                    │
│ Risk: 🟡 MEDIUM                                    │
│ └── Need thorough testing on desktop + mobile      │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│ 3. WRAP (20%) - Low Risk                          │
├────────────────────────────────────────────────────┤
│ Không sửa component, chỉ wrap bên ngoài           │
│                                                    │
│ Example: BenhNhanListPage.js                       │
│                                                    │
│ BEFORE:                                            │
│ <Box>                                              │
│   <Stack spacing={2}>                             │
│     {list.map(item => (                           │
│       <BenhNhanCard data={item} />                │
│     ))}                                           │
│   </Stack>                                        │
│ </Box>                                             │
│                                                    │
│ AFTER:                                             │
│ <PullToRefreshWrapper onRefresh={...}>  ← WRAP   │
│   <Box>                                            │
│     <Stack spacing={2}>                           │
│       {list.map(item => (                         │
│         <BenhNhanCard data={item} />  ← KHÔNG SỬA │
│       ))}                                         │
│     </Stack>                                      │
│   </Box>                                           │
│ </PullToRefreshWrapper>                            │
│                                                    │
│ Risk: 🟢 LOW                                       │
│ └── Inner logic untouched                          │
└────────────────────────────────────────────────────┘
```

### Decision Tree

```
Need mobile feature?
│
├─ Feature specific to mobile UI?
│  └─ ✅ CREATE NEW component
│     Examples: Bottom nav, swipe card, pull-refresh
│
├─ Responsive behavior for existing component?
│  ├─ Simple (padding, sizing)?
│  │  └─ ✅ MODIFY component (add conditional props)
│  │
│  └─ Complex (different layout)?
│     └─ ⚠️  Consider NEW component OR conditional render
│
└─ Add mobile feature to existing page?
   └─ ✅ WRAP page with mobile wrapper
      Examples: Wrap list with PullToRefresh
```

---

## 4. Desktop View Protection

### Q: Làm sao đảm bảo desktop không bị ảnh hưởng?

**A: 4 lớp protection mechanisms**

### Protection Layer 1: Mobile Detection Guard

```javascript
// Pattern áp dụng 100% mobile features

import { useMediaQuery } from "@mui/material";

const isMobile = useMediaQuery(theme.breakpoints.down("md")); // < 1024px

// Mobile-only features
{
  isMobile && <MobileBottomNav />;
}
{
  isMobile && <PullToRefresh />;
}

// Desktop-only features (giữ nguyên)
{
  !isMobile && <Drawer />;
}
{
  !isMobile && <SidebarFilters />;
}
```

**Breakpoint Definition:**

```javascript
// src/theme/index1.js (Able theme already correct!)
breakpoints: {
  xs: 0,       // Phone portrait
  sm: 768,     // Phone landscape / Tablet portrait
  md: 1024,    // Tablet landscape ← DESKTOP STARTS HERE
  lg: 1266,    // Desktop
  xl: 1440     // Large desktop
}

Desktop = md (1024px) and up
Mobile  = < md (< 1024px)
```

### Protection Layer 2: Feature Flags

```javascript
// src/config/featureFlags.js

export const FEATURE_FLAGS = {
  ENABLE_PWA: true,
  FORCE_DESKTOP_MODE: false, // ← Emergency kill switch!
};

// Usage:
const showMobileFeature =
  isFeatureEnabled("ENABLE_PWA") &&
  isMobile &&
  !FEATURE_FLAGS.FORCE_DESKTOP_MODE;
```

**Emergency Rollback:**

```bash
# If any issues on desktop, set:
REACT_APP_FORCE_DESKTOP=true

# Rebuild & deploy
npm run build
# Takes ~5 minutes, all mobile features disabled
```

### Protection Layer 3: CSS Isolation

```css
/* Mobile-only styles */
@media (max-width: 1023px) {
  .mobile-bottom-nav {
    display: flex;
  }
  .desktop-drawer {
    display: none;
  }
}

/* Desktop-only styles (unchanged) */
@media (min-width: 1024px) {
  .mobile-bottom-nav {
    display: none;
  }
  .desktop-drawer {
    display: flex;
  }
}
```

### Protection Layer 4: Testing Protocol

```
Desktop Testing Checklist:
├── [ ] Test on 1920x1080 (desktop)
│       → Sidebar visible
│       → Bottom nav HIDDEN
│       → No touch gestures
│       → Hover effects work
│
├── [ ] Test on 1366x768 (laptop)
│       → Same as desktop
│
├── [ ] Test on 1024x768 (tablet landscape)
│       → Should show DESKTOP view
│
└── [ ] Test all existing workflows
        → Forms still work
        → Tables still work
        → Navigation still works
```

### What Changes on Desktop?

```
Changes: 2% of UI

What Changes:
├── Theme breakpoint values (cosmetic only)
│   └── From 600/900 → 768/1024 (better mobile threshold)
│
└── Form touch targets (still usable with mouse)
    └── From 36px → 44px min-height (accessibility win!)

What Stays EXACTLY Same: 98%
├── ✅ Sidebar navigation
├── ✅ Layout structure
├── ✅ All business logic
├── ✅ Redux state management
├── ✅ API calls
├── ✅ Form validation
├── ✅ User workflows
├── ✅ Table sorting/filtering
└── ✅ All existing features
```

---

## 5. Future Maintenance Overhead

### Q: Sau này sửa UI phải sửa nhiều chỗ không?

**A: Trung bình +15% overhead, có thể optimize đến ~5%**

### Scenario Analysis

#### Scenario A: Sửa Shared Component (0% overhead)

```javascript
// Example: Change all card shadows

// WITHOUT PWA (current):
Files to edit: ~15 feature card components
Time: ~2 hours

// WITH PWA (proposed):
Files to edit:
├── src/components/@extended/mobile/MobileCard.js  (1 line)
├── src/theme/index.js (MuiCard override)           (1 line)
└── Done!

Time: 5 minutes
Overhead: 0% (actually BETTER!)

All cards (mobile + desktop) auto-update!
```

#### Scenario B: Sửa Form Component (0% overhead)

```javascript
// Example: Add validation error icon

// File: src/components/form/FTextField.js
<TextField
  {...props}
  error={!!error}
  helperText={error}
  InputProps={{
    endAdornment: error && <ErrorIcon />  // ADD 1 line
  }}
/>

Affected: All 50+ forms (desktop + mobile)
Overhead: 0% (single file change)
```

#### Scenario C: Sửa Feature-Specific UI (10-100% overhead)

```javascript
// Example: Change BenhNhanCard layout

// Option 1: Conditional Rendering (10% overhead)
File: src/features/BenhNhan/BenhNhanCard.js

const BenhNhanCard = ({ data }) => {
  const isMobile = useMediaQuery(...);

  return (
    <Card>
      {isMobile ? (
        <MobileLayout data={data} />
      ) : (
        <DesktopLayout data={data} />
      )}
    </Card>
  );
};

Files: 1
Overhead: ~10% (1 condition)

// Option 2: Separate Components (100% overhead)
Files:
├── BenhNhanCard.js (desktop)
├── BenhNhanCardMobile.js (mobile)
└── BenhNhanListPage.js (switch logic)

Files: 2 + switch logic
Overhead: ~100%
```

### Recommended Patterns to Minimize Overhead

#### Pattern 1: Shared Component with Responsive Props

```javascript
// ✅ GOOD: Single component, responsive behavior
<Card
  padding={isMobile ? 3 : 2}
  minHeight={isMobile ? 72 : 56}
  onClick={handleClick}
>
  {children}
</Card>

Maintenance: 1 file
Overhead: ~5%
```

#### Pattern 2: Theme-Level Responsive Styles

```javascript
// ✅ GOOD: Define once, apply everywhere
const theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 44,  // Mobile default
          [theme.breakpoints.up('md')]: {
            minHeight: 36  // Desktop override
          }
        }
      }
    }
  }
});

Maintenance: 1 definition
Overhead: 0%
```

#### Pattern 3: Custom Hook for Logic

```javascript
// ✅ GOOD: Reusable responsive logic
const useMobileStyles = () => {
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  return {
    padding: isMobile ? 24 : 16,
    minHeight: isMobile ? 72 : 56,
    fontSize: isMobile ? 16 : 14,
  };
};

// Usage: 1 line per component
const styles = useMobileStyles();
<Card sx={styles}>...</Card>

Maintenance: 1 hook
Overhead: ~3%
```

### Maintenance Overhead by Component Type

```
┌──────────────────────────┬───────────┬───────────┐
│ Component Type           │ Overhead  │ Strategy  │
├──────────────────────────┼───────────┼───────────┤
│ Shared UI (MobileCard)   │ 0%        │ Theme     │
│ Shared Forms (FTextField)│ 0%        │ Single    │
│ Feature Cards (condition)│ ~10%      │ Hook      │
│ Feature Cards (separate) │ ~100%     │ Avoid!    │
│ Layout Components        │ ~15%      │ Condition │
│ Page Wrappers            │ ~5%       │ Wrap      │
├──────────────────────────┼───────────┼───────────┤
│ Average (with best      │ ~15%      │           │
│ practices)              │           │           │
│                         │           │           │
│ Optimized (theme +      │ ~5%       │           │
│ hooks)                  │           │           │
└──────────────────────────┴───────────┴───────────┘
```

---

## 6. Dual Theme System

### Q: 2 theme system (ThemeProvider + ThemeCustomization) ảnh hưởng như thế nào?

**A: 🟡 MEDIUM impact, có chiến lược xử lý rõ ràng**

### Current Architecture

```
App.js (both commented out currently)
├── ThemeProvider (src/theme/index.js)      → Basic theme
└── ThemeCustomization (src/theme/index1.js) → Able theme (advanced)

routes/index.js splits routes:
├── <ThemeProvider>           → MainLayout
│   └── /home, /dashboard, /khoa, etc. (~20 routes)
│
└── <ThemeCustomization>      → MainLayoutAble
    └── /nhanvien, /dev, /lopdaotao, etc. (~30 routes)

Redux menuSlice:
└── Only used by MainLayoutAble
    ├── openDrawer (toggle sidebar)
    ├── drawerOpen state
    └── activeItem (menu selection)
```

### Impact Assessment

```
┌──────────────────────────────────────────────────┐
│ COMPATIBILITY MATRIX                             │
├────────────────────┬──────────────┬──────────────┤
│ PWA Feature        │ Basic Theme  │ Able Theme   │
├────────────────────┼──────────────┼──────────────┤
│ Bottom Nav         │ ✅ Works     │ ✅ Works     │
│ Splash Screen      │ ✅ Works     │ ✅ Works     │
│ Gestures           │ ✅ Works     │ ✅ Works     │
│ Lazy Loading       │ ✅ Works     │ ✅ Works     │
│ Offline            │ ✅ Works     │ ✅ Works     │
│                    │              │              │
│ Redux Menu         │ N/A          │ ✅ Unchanged │
│ (desktop only)     │              │ (no conflict)│
└────────────────────┴──────────────┴──────────────┘
```

### Implementation Strategy

#### Step 1: Shared Mobile Detection Hook

```javascript
// src/hooks/useMobileLayout.js (NEW)

import { useMediaQuery, useTheme } from "@mui/material";

export const useMobileLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Detect which theme is active
  const isAbleTheme = !!theme.components?.MuiDrawer; // Able theme has custom drawer

  return {
    isMobile,
    isAbleTheme,
    showBottomNav: isMobile, // Both themes
    showDrawer: !isMobile, // Both themes
  };
};
```

#### Step 2: Apply to Both Layouts

```javascript
// src/layout/MainLayout/index.js (Basic theme)
import { useMobileLayout } from "hooks/useMobileLayout";

const MainLayout = () => {
  const { isMobile, showBottomNav, showDrawer } = useMobileLayout();

  return (
    <Box sx={{ display: "flex", width: "100%" }}>
      <Header />
      {showDrawer && <Drawer />}
      <Box
        component="main"
        sx={{
          width: isMobile ? "100%" : `calc(100% - ${DRAWER_WIDTH}px)`,
          pb: showBottomNav ? 8 : 0,
        }}
      >
        <Outlet />
      </Box>
      {showBottomNav && <MobileBottomNav />}
    </Box>
  );
};

// src/layout/MainLayoutAble/index.js (Able theme)
// ⚠️ COPY EXACT SAME PATTERN above!
// Only difference: theme-specific styling
```

#### Step 3: Theme-Aware Bottom Nav

```javascript
// src/layout/MainLayout/MobileBottomNav.js

export default function MobileBottomNav() {
  const { isAbleTheme } = useMobileLayout();

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        // Theme-specific styling
        bgcolor: isAbleTheme
          ? "background.paper" // Able theme
          : "secondary.100", // Basic theme
      }}
    >
      <BottomNavigation>{/* Nav items */}</BottomNavigation>
    </Paper>
  );
}
```

### Redux Menu Compatibility

```
Desktop Experience (unchanged):
┌─────────────────────────────────────┐
│ MainLayoutAble (Able theme routes)  │
├─────────────────────────────────────┤
│ Redux menuSlice:                    │
│ ├── openDrawer action               │
│ │   → Toggles sidebar               │
│ │   → Works EXACTLY as before       │
│ │                                   │
│ ├── drawerOpen state                │
│ │   → Controls sidebar visibility   │
│ │                                   │
│ └── activeItem                      │
│     → Highlights selected menu      │
│                                     │
│ ✅ NO CHANGES to Redux logic        │
└─────────────────────────────────────┘

Mobile Experience (new):
┌─────────────────────────────────────┐
│ Bottom Nav (mobile only)            │
├─────────────────────────────────────┤
│ Navigation:                         │
│ ├── Direct routing (no Redux)      │
│ ├── Independent state               │
│ └── Uses react-router only          │
│                                     │
│ Redux menuSlice:                    │
│ └── Not used on mobile              │
│     (drawer hidden)                 │
│                                     │
│ ✅ NO CONFLICT with Redux           │
└─────────────────────────────────────┘
```

### Files Requiring Dual Theme Handling

```
src/
├── hooks/
│   └── useMobileLayout.js          [NEW] Shared logic (1 file)
│
├── layout/
│   ├── MainLayout/
│   │   ├── index.js                [EDIT] Add mobile detection
│   │   └── MobileBottomNav.js      [NEW]  Works with both themes
│   │
│   └── MainLayoutAble/
│       └── index.js                [EDIT] Mirror MainLayout changes
│           ⚠️ Keep logic identical!
│
└── components/@extended/mobile/    [NEW] All theme-agnostic
    └── (All mobile components work with both themes)

Total extra maintenance: ~10%
└── MainLayoutAble mirrors MainLayout (just copy logic)
```

### Testing Strategy for Dual Theme

```
Test Matrix:
├── Basic Theme + Desktop  (current workflow)
├── Basic Theme + Mobile   (new bottom nav)
├── Able Theme + Desktop   (current workflow + Redux menu)
└── Able Theme + Mobile    (new bottom nav)

4 test scenarios, but mobile logic identical!
```

---

## 7. Feature Flags Strategy

### Q: Feature flags hoạt động như thế nào?

**A: Environment variables + runtime checks**

(See detailed implementation in [MASTER_PLAN.md - Feature Flags Strategy section](MASTER_PLAN.md#feature-flags-strategy))

### Quick Reference

```javascript
// src/config/featureFlags.js
export const FEATURE_FLAGS = {
  ENABLE_PWA: process.env.REACT_APP_ENABLE_PWA !== "false",
  ENABLE_MOBILE_BOTTOM_NAV: process.env.REACT_APP_ENABLE_BOTTOM_NAV !== "false",
  ENABLE_GESTURES: process.env.REACT_APP_ENABLE_GESTURES !== "false",
  FORCE_DESKTOP_MODE: process.env.REACT_APP_FORCE_DESKTOP === "true",
};

// Usage:
{
  isFeatureEnabled("ENABLE_MOBILE_BOTTOM_NAV") && isMobile && (
    <MobileBottomNav />
  );
}

// Emergency rollback:
// .env.production: REACT_APP_FORCE_DESKTOP=true
// → All mobile features disabled instantly
```

---

## 📊 Summary Table

| Question                 | Answer                            | Risk Level | Mitigation                         |
| ------------------------ | --------------------------------- | ---------- | ---------------------------------- |
| **FCM độc lập?**         | ✅ 95% độc lập                    | 🟢 Low     | Merge service-worker sau           |
| **FE/BE split**          | 95% FE, 5% BE                     | 🟢 Low     | Backend optional                   |
| **Component strategy**   | 60% new, 20% modify, 20% wrap     | 🟢 Low     | Desktop untouched                  |
| **Desktop protection**   | 4 lớp bảo vệ                      | 🟢 Low     | Feature flags + testing            |
| **Maintenance overhead** | +15% avg, optimize to ~5%         | 🟡 Medium  | Use shared components              |
| **Dual theme impact**    | MainLayoutAble mirrors MainLayout | 🟡 Medium  | Shared hook + testing              |
| **Redux menu**           | No conflict                       | 🟢 Low     | Desktop uses Redux, mobile doesn't |

---

**Next:** Read [MASTER_PLAN.md](MASTER_PLAN.md) for full implementation details.
