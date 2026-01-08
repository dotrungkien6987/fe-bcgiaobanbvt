# 🎯 PWA Conversion Master Plan

## Kế Hoạch Chuyển Đổi Native-like Progressive Web App

> **Mục tiêu:** Chuyển đổi Hospital Management System từ desktop-first sang mobile-first PWA với cảm giác native app hoàn chỉnh

---

## 📊 Current State Assessment

### ✅ Điểm Mạnh Hiện Tại

```
Infrastructure Layer (85% Complete):
├── ✅ Manifest.json (standalone mode, icons, theme)
├── ✅ Service Worker (cache strategy, offline fallback)
├── ✅ SW Registration (auto-update, notifications ready)
└── ✅ PWA Meta Tags (iOS, Android compatible)

Native Patterns (Partial - 30% Complete):
├── ✅ Pull-to-Refresh (Ticket module only)
├── ✅ Swipe Actions (Ticket module only)
├── ⚠️  Skeleton Loading (NavSkeleton only)
└── ❌ Bottom Navigation (không có)

Performance:
├── ⚠️  Bundle Size: ~2.5MB initial (chưa lazy load)
├── ⚠️  Route Loading: Eager (tất cả imports trực tiếp)
└── ⚠️  API Caching: Disabled (commented out)
```

### ❌ Vấn Đề Cần Giải Quyết

```
UX Issues:
┌─────────────────────────────────────────────────────┐
│ 1. NAVIGATION KHÔNG NATIVE                          │
│    Desktop Pattern:  [☰ Sidebar] → 2-3 taps        │
│    Mobile Expect:    [Bottom Tabs] → 1 tap         │
│                                                     │
│ 2. LOADING EXPERIENCE XẤU                           │
│    Current: Blank white screen → sudden content    │
│    Expect:  Splash → Skeleton → Smooth transition  │
│                                                     │
│ 3. GESTURES THIẾU                                   │
│    Only Ticket module có Pull/Swipe                │
│    Các module khác: Click only (không native)      │
│                                                     │
│ 4. OFFLINE KHÔNG HOÀN CHỈNH                         │
│    Chỉ cache static assets                         │
│    API responses không cache                        │
│    Mutations bị mất khi offline                    │
└─────────────────────────────────────────────────────┘
```

### 🎯 Target Vision

```
MOBILE EXPERIENCE COMPARISON:

┌───────────── BEFORE ─────────────┐   ┌───────────── AFTER ──────────────┐
│                                   │   │                                   │
│  App Start:                       │   │  App Start:                       │
│  ⏱️  White screen (2s)            │   │  ⏱️  Splash screen (0.5s)        │
│  💥 Content flash (layout shift)  │   │  🎨 Skeleton fade-in (0.5s)      │
│                                   │   │  ✨ Content smooth transition     │
│  Navigation:                      │   │                                   │
│  [☰] → Sidebar → Click → Close   │   │  Navigation:                      │
│  (3 taps, sidebar covers content) │   │  [🏠 📊 ✓ 🔔 👤] Bottom tabs     │
│                                   │   │  (1 tap, thumb-friendly)          │
│  Refresh:                         │   │                                   │
│  ❌ No gesture                    │   │  Refresh:                         │
│  Click button only                │   │  ✅ Pull-to-refresh (all lists)  │
│                                   │   │                                   │
│  Actions:                         │   │  Actions:                         │
│  Click "..." menu → Dialog        │   │  Swipe card left/right            │
│  (2 taps)                         │   │  (1 gesture, instant feedback)    │
│                                   │   │                                   │
│  Offline:                         │   │  Offline:                         │
│  ❌ API errors, blank screens     │   │  ✅ Cached data + queue mutations │
│  No indication of offline state   │   │  🔔 "Offline mode" banner         │
│                                   │   │                                   │
└───────────────────────────────────┘   └───────────────────────────────────┘

Native Feel Score:  40/100              Native Feel Score:  90/100 ⭐
```

---

## 🗺️ Implementation Roadmap

### Phase Overview

```
Timeline: 6-7 Weeks Total

Critical Path:     Phase 1 ──→ Phase 3 ──→ Phase 6
Parallel Track:    Phase 2, 4, 5 (có thể làm đồng thời)

┌──────┬──────┬──────┬──────┬──────┬──────┬──────┐
│ W1-2 │ W2-3 │ W3-4 │ W4-5 │ W5-6 │ W6-7 │ W7+  │
├──────┼──────┼──────┼──────┼──────┼──────┼──────┤
│ P1   │ P2   │ P3   │ P4   │ P5   │ P6   │Test  │
│ Nav  │ Load │Gestur│Route │Offlin│Polish│Deploy│
│ ████ │ ████ │ ████ │ ████ │ ████ │ ████ │ ████ │
│      │ ████ │      │ ████ │ ████ │      │      │
└──────┴──────┴──────┴──────┴──────┴──────┴──────┘
  ^      ^      ^      ^      ^      ^      ^
  │      │      │      │      │      │      └─ UAT + Rollout
  │      │      │      │      │      └─────── Component Polish
  │      │      │      │      └──────────── Offline Strategy
  │      │      │      └─────────────────── Bundle Optimization
  │      │      └────────────────────────── Gesture System
  │      └───────────────────────────────── Loading Experience
  └──────────────────────────────────────── Mobile Navigation
```

### Dependency Graph

```
                    MASTER_PLAN (bạn đang đọc)
                            │
                            ├─────────────┬──────────────┬───────────────┐
                            ▼             ▼              ▼               ▼
                    ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐
                    │  PHASE 1  │  │  PHASE 2  │  │  PHASE 4  │  │  PHASE 5  │
                    │   NavBar  │  │  Splash   │  │  Lazy Load│  │  Offline  │
                    │  🔴 HIGH  │  │  🟡 MED   │  │  🟡 MED   │  │  🟡 MED   │
                    └─────┬─────┘  └───────────┘  └───────────┘  └───────────┘
                          │             │              │                │
                          │             │(independent) │(independent)   │
                          │             └──────┬───────┴────────────────┘
                          ▼                    ▼
                    ┌───────────┐       ┌───────────┐
                    │  PHASE 3  │       │  PHASE 6  │
                    │  Gestures │       │  Polish   │
                    │  🔴 HIGH  │◀──────│  🟢 LOW   │
                    └───────────┘       └───────────┘
                          │                    │
                          └─────────┬──────────┘
                                    ▼
                            ┌───────────────┐
                            │ INTEGRATION   │
                            │   TESTING     │
                            └───────────────┘
```

---

## � Critical Project Considerations

### 🎨 Dual Theme System Impact

**Current Architecture:**

```
src/routes/index.js:
├── Route Group 1: ThemeProvider (basic theme)
│   └── MainLayout
│       └── /home, /dashboard, /khoa, etc. (~20 routes)
│
└── Route Group 2: ThemeCustomization (Able theme)
    └── MainLayoutAble
        └── /nhanvien, /lopdaotao, /dev, etc. (~30 routes)

Theme Files:
├── src/theme/index.js          → ThemeProvider (basic, simple)
└── src/theme/index1.js         → ThemeCustomization (advanced Able theme)

Redux Menu:
├── features/Menu/menuSlice.js
│   ├── openDrawer (toggle sidebar)
│   ├── drawerOpen state
│   ├── activeItem (menu selection)
│   └── openItem (expandable menu items)
└── Used by: MainLayoutAble only
```

**PWA Impact Assessment:**

```
┌──────────────────────────────────────────────────────────┐
│ IMPACT LEVEL: 🟡 MEDIUM (manageable)                     │
├──────────────────────────────────────────────────────────┤
│ What's Affected:                                         │
│ ├── Phase 1: Bottom Nav works với BOTH themes           │
│ │   └── Strategy: Detect theme, adjust styling          │
│ ├── Phase 2: Splash/Skeleton independent                │
│ ├── Phase 3: Gestures work với BOTH layouts             │
│ ├── Phase 4-6: Theme-agnostic                           │
│                                                          │
│ Redux Menu Complexity:                                   │
│ ├── ✅ KHÔNG conflict với PWA features                  │
│ ├── ✅ openDrawer still works on desktop                │
│ └── ⚠️  Mobile bottom nav bypasses Redux menu           │
│     (new navigation path, không replace Redux)          │
└──────────────────────────────────────────────────────────┘
```

**Implementation Strategy for Dual Theme:**

```javascript
// Strategy: Theme-aware mobile detection

// src/hooks/useMobileLayout.js (NEW)
import { useMediaQuery, useTheme } from "@mui/material";

export const useMobileLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Detect which theme system is active
  const isAbleTheme = theme.palette.mode !== undefined; // Able theme has mode

  return {
    isMobile,
    isAbleTheme,
    showBottomNav: isMobile, // Both themes show bottom nav on mobile
    showDrawer: !isMobile, // Both themes show drawer on desktop
  };
};

// Usage in both MainLayout & MainLayoutAble:
const { isMobile, showBottomNav, showDrawer } = useMobileLayout();

{
  showBottomNav && <MobileBottomNav />;
}
{
  showDrawer && <Drawer />;
}
```

**Dual Theme Compatibility Matrix:**

```
┌──────────────────┬─────────────┬──────────────────┐
│ Feature          │ Basic Theme │ Able Theme       │
├──────────────────┼─────────────┼──────────────────┤
│ Bottom Nav       │ ✅ Works    │ ✅ Works         │
│ Splash Screen    │ ✅ Works    │ ✅ Works         │
│ Gestures         │ ✅ Works    │ ✅ Works         │
│ Lazy Loading     │ ✅ Works    │ ✅ Works         │
│ Offline          │ ✅ Works    │ ✅ Works         │
│                  │             │                  │
│ Redux Menu       │ N/A         │ ✅ Still works   │
│ (desktop only)   │             │ (not affected)   │
└──────────────────┴─────────────┴──────────────────┘
```

**Files Requiring Dual Theme Handling:**

```
src/
├── layout/
│   ├── MainLayout/index.js           [EDIT] Add mobile detection (basic theme)
│   └── MainLayoutAble/index.js       [EDIT] Add mobile detection (Able theme)
│       → SAME logic, different wrapper
│
├── hooks/
│   └── useMobileLayout.js            [NEW]  Shared mobile detection logic
│
└── components/
    └── MobileBottomNav.js            [NEW]  Works with BOTH themes
        → Adapts styling based on active theme
```

---

## 🎛️ Feature Flags Strategy

### Enable Phased Rollout & Easy Rollback

**Why Feature Flags?**

```
Benefits:
├── ✅ Gradually enable PWA features
├── ✅ A/B test mobile UX
├── ✅ Quick disable if issues found
├── ✅ Desktop protection (100% safe)
└── ✅ Per-user or per-role rollout
```

**Implementation:**

#### Step 1: Create Feature Flag Config

```javascript
// src/config/featureFlags.js (NEW)

export const FEATURE_FLAGS = {
  // Master toggle for all PWA features
  ENABLE_PWA: process.env.REACT_APP_ENABLE_PWA !== "false", // Default: true

  // Phase-specific toggles
  ENABLE_MOBILE_BOTTOM_NAV: process.env.REACT_APP_ENABLE_BOTTOM_NAV !== "false",
  ENABLE_SPLASH_SCREEN: process.env.REACT_APP_ENABLE_SPLASH !== "false",
  ENABLE_GESTURES: process.env.REACT_APP_ENABLE_GESTURES !== "false",
  ENABLE_LAZY_LOADING: process.env.REACT_APP_ENABLE_LAZY_LOAD !== "false",
  ENABLE_OFFLINE_MODE: process.env.REACT_APP_ENABLE_OFFLINE !== "false",

  // Fine-grained controls
  ENABLE_PULL_TO_REFRESH: process.env.REACT_APP_ENABLE_PULL_REFRESH !== "false",
  ENABLE_SWIPE_ACTIONS: process.env.REACT_APP_ENABLE_SWIPE !== "false",

  // Desktop safety net
  FORCE_DESKTOP_MODE: process.env.REACT_APP_FORCE_DESKTOP === "true", // Default: false
};

// Helper function
export const isPWAEnabled = () => FEATURE_FLAGS.ENABLE_PWA;
export const isFeatureEnabled = (feature) =>
  FEATURE_FLAGS[feature] && !FEATURE_FLAGS.FORCE_DESKTOP_MODE;
```

#### Step 2: .env Configuration

```bash
# .env.development (Default: All ON)
REACT_APP_ENABLE_PWA=true
REACT_APP_ENABLE_BOTTOM_NAV=true
REACT_APP_ENABLE_SPLASH=true
REACT_APP_ENABLE_GESTURES=true
REACT_APP_ENABLE_LAZY_LOAD=true
REACT_APP_ENABLE_OFFLINE=true
REACT_APP_ENABLE_PULL_REFRESH=true
REACT_APP_ENABLE_SWIPE=true
REACT_APP_FORCE_DESKTOP=false

# .env.production.staging (Gradual rollout)
REACT_APP_ENABLE_PWA=true
REACT_APP_ENABLE_BOTTOM_NAV=true
REACT_APP_ENABLE_SPLASH=true
REACT_APP_ENABLE_GESTURES=false    # ← Not ready yet
REACT_APP_ENABLE_LAZY_LOAD=true
REACT_APP_ENABLE_OFFLINE=false     # ← Testing phase
REACT_APP_FORCE_DESKTOP=false

# .env.production.emergency (Rollback)
REACT_APP_ENABLE_PWA=false         # ← Kill switch!
# or
REACT_APP_FORCE_DESKTOP=true       # ← Force desktop mode
```

#### Step 3: Usage in Components

```javascript
// Example: MobileBottomNav.js
import { FEATURE_FLAGS, isFeatureEnabled } from 'config/featureFlags';

export default function MobileBottomNav() {
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Guard: Only show if feature enabled AND mobile
  if (!isFeatureEnabled('ENABLE_MOBILE_BOTTOM_NAV') || !isMobile) {
    return null;
  }

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, ... }}>
      {/* Bottom nav UI */}
    </Paper>
  );
}

// Example: PullToRefreshWrapper.jsx
import { isFeatureEnabled } from 'config/featureFlags';

export default function PullToRefreshWrapper({ children, onRefresh }) {
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // If feature disabled OR not mobile, render children directly
  if (!isFeatureEnabled('ENABLE_PULL_TO_REFRESH') || !isMobile) {
    return <Box>{children}</Box>;
  }

  // Otherwise, enable pull-to-refresh
  return (
    <Box onTouchStart={...} onTouchMove={...}>
      {/* Pull-to-refresh logic */}
    </Box>
  );
}

// Example: App.js (Splash screen)
import { isFeatureEnabled } from 'config/featureFlags';

function App() {
  const [isLoading, setIsLoading] = useState(
    isFeatureEnabled('ENABLE_SPLASH_SCREEN') // ← Only show if enabled
  );

  if (isLoading) return <SplashScreen />;

  return <Router />;
}
```

#### Step 4: Admin UI for Runtime Toggles (Optional - Phase 7)

```javascript
// Future enhancement: Admin panel to toggle features without redeploy

// src/features/Admin/FeatureFlagPanel.js
const FeatureFlagPanel = () => {
  const [flags, setFlags] = useState(FEATURE_FLAGS);

  const handleToggle = (flag) => {
    // Store in localStorage for current session
    localStorage.setItem(`flag_${flag}`, !flags[flag]);
    setFlags({ ...flags, [flag]: !flags[flag] });
  };

  return (
    <Card>
      <Typography variant="h5">PWA Feature Flags</Typography>
      {Object.keys(FEATURE_FLAGS).map((flag) => (
        <FormControlLabel
          key={flag}
          control={
            <Switch checked={flags[flag]} onChange={() => handleToggle(flag)} />
          }
          label={flag}
        />
      ))}
    </Card>
  );
};
```

**Rollout Strategy with Feature Flags:**

```
Week 1-2: Phase 1 (Bottom Nav)
├── Development: ENABLE_BOTTOM_NAV=true
├── Staging: ENABLE_BOTTOM_NAV=true (internal testing)
└── Production: ENABLE_BOTTOM_NAV=false (not ready)

Week 3: Production Rollout Phase 1
├── Production: ENABLE_BOTTOM_NAV=true
└── Monitor for 1 week

Week 4-5: Phase 2-3 (Splash + Gestures)
├── Development: All true
├── Staging: Phase 1-3 true
└── Production: Phase 1 true, Phase 2-3 false

Week 6: Full Rollout
├── All environments: All true
└── Monitor metrics

Emergency Rollback (if issues):
├── Set REACT_APP_FORCE_DESKTOP=true
└── Rebuild & deploy (5 minutes)
```

**Feature Flag Benefits for Dual Theme System:**

```javascript
// Can enable PWA features per theme!

// src/config/featureFlags.js
export const FEATURE_FLAGS = {
  // Enable bottom nav only for Able theme routes
  ENABLE_BOTTOM_NAV_BASIC: true,
  ENABLE_BOTTOM_NAV_ABLE: true, // Can disable separately if Redux menu conflicts

  // Enable gestures only for specific modules
  ENABLE_GESTURES_BENHNHAN: true,
  ENABLE_GESTURES_BAOCAO: true,
  ENABLE_GESTURES_SUCO: false, // Not ready yet
};

// Usage:
const isAbleTheme = useIsAbleTheme();
const showBottomNav = isAbleTheme
  ? isFeatureEnabled("ENABLE_BOTTOM_NAV_ABLE")
  : isFeatureEnabled("ENABLE_BOTTOM_NAV_BASIC");
```

---

## �📚 Document Structure

### Documents to be Created

```
docs/PWA_CONVERSION/
├── 📘 MASTER_PLAN.md                          ← BẠN ĐANG ĐỌC
├── 📗 PHASE_1_MOBILE_NAVIGATION.md            ← Bottom Nav + Layout
├── 📗 PHASE_2_SPLASH_SKELETON.md              ← Loading Experience
├── 📗 PHASE_3_GESTURE_SYSTEM.md               ← Pull/Swipe Patterns
├── 📗 PHASE_4_ROUTE_OPTIMIZATION.md           ← Lazy Loading
├── 📗 PHASE_5_OFFLINE_STRATEGY.md             ← Cache + Queue
├── 📗 PHASE_6_COMPONENT_LIBRARY.md            ← Mobile-First UI
└── 📙 TESTING_DEPLOYMENT.md                   ← QA Checklist
```

### Document Format Standard

Mỗi PHASE document sẽ có cấu trúc chuẩn:

```markdown
# PHASE_X: [Tên Phase]

## 🎯 Objectives & Scope

- [ ] Goal 1
- [ ] Goal 2

## 📐 Architecture Overview

[Diagrams: Component tree, data flow]

## 🗂️ File Structure Changes

[Tree showing new/modified files]

## 🔧 Implementation Steps

### Step 1: [Action]

**Files:** [paths]
**Changes:** [pseudo code/diagram]

### Step 2: [Action]

...

## ✅ Testing Checklist

- [ ] Test case 1
- [ ] Test case 2

## 📚 References

- Related files
- External docs
```

---

## 📋 Phase Summaries

### 🔴 **PHASE 1: Mobile Navigation** (Week 1-2)

**Status:** 🔴 Critical - Foundation for all mobile UX  
**Dual Theme Impact:** ⚠️ Affects Both Themes (requires dual implementation)

```
Impact: ████████████████████ 100% (affects all screens)

What Changes:
┌─────────────────────────────────────────┐
│ Desktop (unchanged):                    │
│ ┌──┬──────────────────────────┐        │
│ │S │ Content                  │        │
│ │I │                          │        │
│ │D │                          │        │
│ │E │                          │        │
│ └──┴──────────────────────────┘        │
│                                         │
│ Mobile (new):                           │
│ ┌──────────────────────────────┐       │
│ │ Content (full width)         │       │
│ │                              │       │
│ │                              │       │
│ ├──────────────────────────────┤       │
│ │ [🏠] [📊] [✓] [🔔] [👤]    │       │
│ └──────────────────────────────┘       │
└─────────────────────────────────────────┘

BOTH themes get same mobile navigation!
```

**Key Deliverables:**

- ✅ `MobileBottomNav.js` component (theme-aware)
- ✅ `useMobileLayout.js` hook (shared logic)
- ✅ Updated `MainLayout/index.js` (basic theme)
- ✅ Updated `MainLayoutAble/index.js` (Able theme) - MIRROR CHANGES
- ✅ Route badge notifications
- ✅ Active state highlighting
- ✅ Feature flag controlled

**Files to Change:**

```
src/
├── config/
│   └── featureFlags.js                 [NEW]  Feature toggle config
│
├── hooks/
│   └── useMobileLayout.js              [NEW]  Dual theme mobile detection
│
├── layout/
│   ├── MainLayout/
│   │   ├── index.js                    [EDIT] Add mobile detection (basic theme)
│   │   ├── Header/index.js             [EDIT] Conditionally hide on scroll
│   │   └── MobileBottomNav.js          [NEW]  Bottom navigation component
│   │
│   └── MainLayoutAble/                 [EDIT] Same changes as MainLayout
│       └── (mirror changes above)      ⚠️  IMPORTANT: Keep in sync!
│
└── routes/
    └── config/navItems.js              [NEW]  Navigation items config

.env files:
├── .env.development                    [EDIT] Add PWA flags (all true)
├── .env.production                     [EDIT] Add PWA flags (controlled rollout)
└── .env.production.staging             [NEW]  Staging environment flags
```

**Dual Theme Implementation Pattern:**

```javascript
// hooks/useMobileLayout.js - SHARED by both themes
export const useMobileLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isAbleTheme = !!theme.components?.MuiDrawer; // Detect Able theme

  return {
    isMobile,
    isAbleTheme,
    showBottomNav: isMobile && isFeatureEnabled("ENABLE_MOBILE_BOTTOM_NAV"),
    showDrawer: !isMobile,
  };
};

// layout/MainLayout/index.js (Basic theme)
import { useMobileLayout } from "hooks/useMobileLayout";

const MainLayout = () => {
  const { isMobile, showBottomNav, showDrawer } = useMobileLayout();

  return (
    <Box sx={{ display: "flex" }}>
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

// layout/MainLayoutAble/index.js (Able theme)
// ⚠️ SAME PATTERN - Just copy the mobile detection logic above!
```

**Redux Menu Compatibility:**

```
Redux menuSlice (MainLayoutAble):
├── openDrawer → Still works on desktop (unchanged)
├── drawerOpen state → Controls sidebar on desktop
└── Mobile: Bottom nav bypasses Redux (new path)

NO CONFLICT:
├── Desktop: Redux menu + sidebar (as before)
└── Mobile: Bottom nav replaces sidebar (Redux not used)
```

---

### 🟡 **PHASE 2: Splash & Skeleton** (Week 2-3)

**Status:** 🟡 Medium - Can run parallel with Phase 1  
**Dual Theme Impact:** ✅ No Impact (theme-agnostic)

```
Impact: ███████░░░░░░░░░░░░░ 35% (first-load experience)

User Journey:
┌────────────────────────────────────────────────────────┐
│ 0.0s: Tap app icon                                     │
│   ↓                                                     │
│ 0.0s-0.5s: 🎨 Splash Screen                           │
│   ┌──────────────┐                                     │
│   │              │                                     │
│   │   [LOGO]     │                                     │
│   │ BC Bệnh viện │                                     │
│   │   ⏳ ...     │                                     │
│   └──────────────┘                                     │
│   ↓                                                     │
│ 0.5s-1.0s: 📦 Skeleton Loading                        │
│   ┌──────────────┐                                     │
│   │ ▭▭▭▭▭▭▭▭    │ ← Header skeleton                  │
│   │ ▬▬▬ ▬▬▬ ▬▬▬ │ ← Cards skeleton                   │
│   │ ▬▬▬ ▬▬▬ ▬▬▬ │                                     │
│   └──────────────┘                                     │
│   ↓                                                     │
│ 1.0s: ✨ Smooth Fade to Real Content                  │
└────────────────────────────────────────────────────────┘

Works identically for BOTH themes!
```

**Key Deliverables:**

- ✅ `SplashScreen.js` với Framer Motion animation
- ✅ Route-specific skeleton components
- ✅ Suspense boundaries với fallbacks
- ✅ Smooth transitions
- ✅ Feature flag controlled

**Files to Change:**

```
src/
├── App.js                          [EDIT] Add splash state with feature flag
├── components/
│   ├── SplashScreen.js             [NEW]  App splash screen
│   └── skeletons/
│       ├── PageSkeleton.js         [NEW]  Generic page skeleton
│       ├── CardListSkeleton.js     [NEW]  List view skeleton
│       └── FormSkeleton.js         [NEW]  Form skeleton
└── routes/index.js                 [EDIT] Wrap with Suspense

⚠️ Theme-agnostic: Single implementation works for both!
```

---

### 🔴 **PHASE 3: Gesture System** (Week 3-4)

**Status:** 🔴 High - Defines native feel  
**Prerequisites:** ⚠️ Phase 1 MUST complete (needs mobile detection)  
**Dual Theme Impact:** ✅ Works with Both (uses shared mobile detection hook)

```
Impact: ████████████████████ 100% (affects all screens)

What Changes:
┌─────────────────────────────────────────┐
│ Desktop (unchanged):                    │
│ ┌──┬──────────────────────────┐        │
│ │S │ Content                  │        │
│ │I │                          │        │
│ │D │                          │        │
│ │E │                          │        │
│ └──┴──────────────────────────┘        │
│                                         │
│ Mobile (new):                           │
│ ┌──────────────────────────────┐       │
│ │ Content (full width)         │       │
│ │                              │       │
│ │                              │       │
│ ├──────────────────────────────┤       │
│ │ [🏠] [📊] [✓] [🔔] [👤]    │       │
│ └──────────────────────────────┘       │
└─────────────────────────────────────────┘
```

**Key Deliverables:**

- ✅ `MobileBottomNav.js` component
- ✅ Updated `MainLayout/index.js` với mobile detection
- ✅ Route badge notifications (e.g., unread count)
- ✅ Active state highlighting

**Files to Change:**

```
src/
├── config/
│   └── featureFlags.js                 [NEW]  Feature toggle config
│
├── hooks/
│   └── useMobileLayout.js              [NEW]  Dual theme mobile detection
│
├── layout/
│   ├── MainLayout/
│   │   ├── index.js                    [EDIT] Add mobile detection (basic theme)
│   │   ├── Header/index.js             [EDIT] Conditionally hide on scroll
│   │   └── MobileBottomNav.js          [NEW]  Bottom navigation component
│   │
│   └── MainLayoutAble/                 [EDIT] Same changes as MainLayout
│       └── (mirror changes above)
│
└── routes/
    └── config/navItems.js              [NEW]  Navigation items config

.env files:
├── .env.development                    [EDIT] Add PWA flags (all true)
├── .env.production                     [EDIT] Add PWA flags (controlled rollout)
└── .env.production.staging             [NEW]  Staging environment flags
```

**Dual Theme Handling:**

```javascript
// Both MainLayout & MainLayoutAble will use same pattern:

import { useMobileLayout } from "hooks/useMobileLayout";
import { isFeatureEnabled } from "config/featureFlags";

const MainLayout = () => {
  // or MainLayoutAble
  const { isMobile, showBottomNav, showDrawer } = useMobileLayout();

  return (
    <Box sx={{ display: "flex", width: "100%" }}>
      <Header />

      {/* Desktop: Show drawer (both themes) */}
      {showDrawer && <Drawer />}

      <Box
        component="main"
        sx={{
          width: isMobile ? "100%" : `calc(100% - ${DRAWER_WIDTH}px)`,
          pb: showBottomNav ? 8 : 0, // Space for bottom nav
        }}
      >
        <Outlet />
      </Box>

      {/* Mobile: Show bottom nav (both themes) */}
      {showBottomNav && isFeatureEnabled("ENABLE_MOBILE_BOTTOM_NAV") && (
        <MobileBottomNav />
      )}
    </Box>
  );
};
```

**Redux Menu Compatibility:**

```
Redux menuSlice (unchanged):
├── openDrawer action → Still works on desktop
├── drawerOpen state → Still controls sidebar on desktop
└── activeItem → Still tracks menu selection

Mobile Bottom Nav (new):
├── Direct navigation (no Redux needed)
├── Independent state from Redux menu
└── Only visible on mobile (< 1024px)

Result: NO CONFLICT
├── Desktop users: Redux menu works as before
└── Mobile users: Bottom nav replaces sidebar
```

---

### 🟡 **PHASE 2: Splash & Skeleton** (Week 2-3)

**Status:** 🟡 Medium - Can run parallel with Phase 1

**Dual Theme Impact:** ✅ No Impact (theme-agnostic)

```
Impact: ███████░░░░░░░░░░░░░ 35% (first-load experience)

User Journey:
┌────────────────────────────────────────────────────────┐
│ 0.0s: Tap app icon                                     │
│   ↓                                                     │
│ 0.0s-0.5s: 🎨 Splash Screen                           │
│   ┌──────────────┐                                     │
│   │              │                                     │
│   │   [LOGO]     │                                     │
│   │ BC Bệnh viện │                                     │
│   │   ⏳ ...     │                                     │
│   └──────────────┘                                     │
│   ↓                                                     │
│ 0.5s-1.0s: 📦 Skeleton Loading                        │
│   ┌──────────────┐                                     │
│   │ ▭▭▭▭▭▭▭▭    │ ← Header skeleton                  │
│   │ ▬▬▬ ▬▬▬ ▬▬▬ │ ← Cards skeleton                   │
│   │ ▬▬▬ ▬▬▬ ▬▬▬ │                                     │
│   └──────────────┘                                     │
│   ↓                                                     │
│ 1.0s: ✨ Smooth Fade to Real Content                  │
└────────────────────────────────────────────────────────┘
```

**Key Deliverables:**

- ✅ `SplashScreen.js` với Framer Motion animation
- ✅ Route-specific skeleton components
- ✅ Suspense boundaries với fallbacks
- ✅ Smooth transitions
- ✅ Feature flag controlled

**Files to Change:**

```
src/
├── App.js                          [EDIT] Add splash state with feature flag
├── components/
│   ├── SplashScreen.js             [NEW]  App splash screen
│   └── skeletons/
│       ├── PageSkeleton.js         [NEW]  Generic page skeleton
│       ├── CardListSkeleton.js     [NEW]  List view skeleton
│       └── FormSkeleton.js         [NEW]  Form skeleton
└── routes/index.js                 [EDIT] Wrap with Suspense

Works with both themes! (no theme-specific code)
```

---

### 🔴 **PHASE 3: Gesture System** (Week 3-4)

**Status:** 🔴 High - Defines native feel  
**Prerequisites:** ⚠️ Phase 1 MUST complete (needs mobile detection)  
**Dual Theme Impact:** ✅ Works with Both (uses shared mobile detection)

```
Impact: ███████░░░░░░░░░░░░░ 35% (first-load experience)

User Journey:
┌────────────────────────────────────────────────────────┐
│ 0.0s: Tap app icon                                     │
│   ↓                                                     │
│ 0.0s-0.5s: 🎨 Splash Screen                           │
│   ┌──────────────┐                                     │
│   │              │                                     │
│   │   [LOGO]     │                                     │
│   │ BC Bệnh viện │                                     │
│   │   ⏳ ...     │                                     │
│   └──────────────┘                                     │
│   ↓                                                     │
│ 0.5s-1.0s: 📦 Skeleton Loading                        │
│   ┌──────────────┐                                     │
│   │ ▭▭▭▭▭▭▭▭    │ ← Header skeleton                  │
│   │ ▬▬▬ ▬▬▬ ▬▬▬ │ ← Cards skeleton                   │
│   │ ▬▬▬ ▬▬▬ ▬▬▬ │                                     │
│   └──────────────┘                                     │
│   ↓                                                     │
│ 1.0s: ✨ Smooth Fade to Real Content                  │
└────────────────────────────────────────────────────────┘
```

**Key Deliverables:**

- ✅ `SplashScreen.js` với Framer Motion animation
- ✅ Route-specific skeleton components
- ✅ Suspense boundaries với fallbacks
- ✅ Smooth transitions

**Files to Change:**

```
src/
├── App.js                          [EDIT] Add splash state
├── components/
│   ├── SplashScreen.js             [NEW]  App splash screen
│   └── skeletons/
│       ├── PageSkeleton.js         [NEW]  Generic page skeleton
│       ├── CardListSkeleton.js     [NEW]  List view skeleton
│       └── FormSkeleton.js         [NEW]  Form skeleton
└── routes/index.js                 [EDIT] Wrap with Suspense
```

---

### 🔴 **PHASE 3: Gesture System** (Week 3-4)

**Status:** 🔴 High - Defines native feel

```
Impact: ████████████░░░░░░░░ 60% (all list views)

Gesture Catalog:
┌─────────────────────────────────────────────────────┐
│ 1. PULL-TO-REFRESH                                  │
│    ↓↓↓ Pull down on list                           │
│    ┌───────────┐                                    │
│    │    🔄     │ ← Spinner appears                  │
│    │ Updating  │                                    │
│    └───────────┘                                    │
│                                                     │
│ 2. SWIPE ACTIONS                                    │
│    ←←← Swipe left          Swipe right →→→         │
│    ┌─────────────┐         ┌─────────────┐         │
│    │ [Card]    ✗ │         │ ✓ [Card]    │         │
│    └─────────────┘         └─────────────┘         │
│     Delete/Reject           Accept/Edit            │
│                                                     │
│ 3. LONG PRESS                                       │
│    Press & hold → Context menu                     │
│                                                     │
│ 4. PINCH TO ZOOM (images)                          │
│    Pinch in/out on image galleries                 │
└─────────────────────────────────────────────────────┘
```

**Key Deliverables:**

- ✅ Move Ticket patterns to `components/@extended/mobile/`
- ✅ Generic `PullToRefresh`, `SwipeableCard`, `LongPressMenu`
- ✅ Apply to 6 main modules (BệnhNhân, BáoCáo, SựCố, CôngViệc, KPI, Đào tạo)
- ✅ Touch feedback animations

**Files to Change:**

```
src/
├── components/@extended/mobile/
│   ├── PullToRefreshWrapper.jsx    [MOVE] From Ticket module
│   ├── SwipeableCard.jsx           [MOVE] From Ticket module
│   ├── LongPressMenu.jsx           [NEW]  Long press handler
│   └── TouchFeedback.jsx           [NEW]  Ripple + haptic
└── features/
    ├── BenhNhan/
    │   └── BenhNhanListPage.js     [EDIT] Add gestures
    ├── BaoCao/
    │   └── BaoCaoListPage.js       [EDIT] Add gestures
    ├── SuCo/
    │   └── SuCoListPage.js         [EDIT] Add gestures
    └── ... (6 modules total)
```

---

### 🟡 **PHASE 4: Route Optimization** (Week 4-5)

**Status:** 🟡 Medium - Performance boost

```
Impact: ████████░░░░░░░░░░░░ 40% (initial load time)

Bundle Analysis:
┌────────────────────────────────────────────────────┐
│ BEFORE: Eager Loading                              │
│ ┌──────────────────────────────────────┐           │
│ │ main.chunk.js (2.5 MB)               │           │
│ │ ┌─────────────────────────────┐      │           │
│ │ │ All routes + components     │      │           │
│ │ │ - BenhNhan (200 KB)         │      │           │
│ │ │ - BaoCao (180 KB)           │      │           │
│ │ │ - SuCo (150 KB)             │      │           │
│ │ │ - CongViec (300 KB)         │      │           │
│ │ │ - KPI (220 KB)              │      │           │
│ │ │ - Daotao (250 KB)           │      │           │
│ │ │ - Admin (180 KB)            │      │           │
│ │ │ - Other (1020 KB)           │      │           │
│ │ └─────────────────────────────┘      │           │
│ └──────────────────────────────────────┘           │
│ ⏱️  Initial Load: ~5-8 seconds (3G)                │
│                                                     │
│ AFTER: Lazy Loading                                │
│ ┌────────────┐  ┌────────┐  ┌────────┐            │
│ │main.chunk  │  │BenhNhan│  │BaoCao  │            │
│ │(800 KB)    │  │chunk   │  │chunk   │  ...       │
│ │Core only   │  │(200 KB)│  │(180 KB)│            │
│ └────────────┘  └────────┘  └────────┘            │
│ ⏱️  Initial Load: ~2-3 seconds (3G) ✅             │
│ ⏱️  Route Load: ~0.5s each (on-demand)             │
└────────────────────────────────────────────────────┘
```

**Key Deliverables:**

- ✅ Convert 50+ routes to `React.lazy()`
- ✅ Route-based code splitting
- ✅ Suspense boundaries with skeletons
- ✅ Preload critical routes

**Files to Change:**

```
src/
├── routes/
│   ├── index.js                    [EDIT] Convert to lazy imports
│   └── lazyRoutes.js               [NEW]  Lazy route definitions
└── utils/
    └── preloadRoute.js             [NEW]  Route preload helper
```

---

### 🟡 **PHASE 5: Offline Strategy** (Week 5-6)

**Status:** 🟡 Medium - Resilience feature

```
Impact: ████████░░░░░░░░░░░░ 40% (offline scenarios)

Offline Architecture:
┌─────────────────────────────────────────────────────┐
│                                                     │
│  User Action (e.g., submit form)                   │
│         ↓                                           │
│    ┌────────┐                                       │
│    │ Online?│                                       │
│    └───┬────┘                                       │
│        │                                            │
│    YES │                           NO │             │
│        ↓                              ↓             │
│  ┌──────────┐                  ┌──────────┐        │
│  │ Network  │                  │IndexedDB │        │
│  │ Request  │                  │  Queue   │        │
│  └────┬─────┘                  └────┬─────┘        │
│       │                             │              │
│       ↓                             │              │
│  ✅ Success                         │              │
│  💾 Cache                           │              │
│       │                             │              │
│       │     ┌─────────────┐         │              │
│       └─────│  SW Cache   │◀────────┘              │
│             └─────────────┘                        │
│                    ↓                               │
│         When back online:                          │
│         Process queue → Network → Clear           │
│                                                     │
└─────────────────────────────────────────────────────┘

Cache Strategy by Endpoint Type:
┌─────────────────┬──────────────┬─────────────────┐
│ Endpoint        │ Strategy     │ TTL             │
├─────────────────┼──────────────┼─────────────────┤
│ /api/khoa       │ Cache First  │ 24h (master)    │
│ /api/datafix    │ Cache First  │ 24h (master)    │
│ /api/nhanvien   │ Network First│ 1h              │
│ /api/benhnhan   │ Network First│ 5m              │
│ /api/baocao     │ Network First│ 5m              │
│ POST/PUT/DELETE │ Network Only │ Queue if fail   │
└─────────────────┴──────────────┴─────────────────┘
```

**Key Deliverables:**

- ✅ Enable API caching in service worker
- ✅ IndexedDB queue for offline mutations
- ✅ Offline indicator component
- ✅ Auto-sync when back online

**Files to Change:**

```
public/
└── service-worker.js               [EDIT] Enable cache, add queue

src/
├── utils/
│   ├── offlineQueue.js             [NEW]  IndexedDB queue manager
│   └── networkStatus.js            [NEW]  Online/offline detection
└── components/
    └── OfflineIndicator.js         [NEW]  Offline banner component
```

---

### 🟢 **PHASE 6: Component Library** (Week 6-7)

**Status:** 🟢 Low - Polish & consistency

```
Impact: ██████████████░░░░░░ 70% (all touch interactions)

Mobile-First Component Catalog:
┌─────────────────────────────────────────────────────┐
│ Component          │ Desktop     │ Mobile          │
├────────────────────┼─────────────┼─────────────────┤
│ MobileCard         │ 16px pad    │ 24px pad ✨     │
│                    │ 56px min-h  │ 72px min-h ✨   │
│                    │             │ Active feedback │
├────────────────────┼─────────────┼─────────────────┤
│ MobileDialog       │ Centered    │ Full screen ✨  │
│                    │ max-w 600px │ Slide up anim   │
├────────────────────┼─────────────┼─────────────────┤
│ MobileList         │ Regular     │ Pull/Swipe ✨   │
│                    │             │ Virtual scroll  │
├────────────────────┼─────────────┼─────────────────┤
│ TouchButton        │ 36px min-h  │ 48px min-h ✨   │
│                    │             │ Larger touch    │
├────────────────────┼─────────────┼─────────────────┤
│ ScrollToTop        │ Visible     │ Hide on down ✨ │
│                    │             │ Show on up      │
└─────────────────────────────────────────────────────┘

Touch Target Guidelines:
┌──────────────────────────────────┐
│ Minimum: 48x48 px (iOS/Android)  │
│ Optimal: 56x56 px                │
│ Spacing: 8px between targets     │
│                                  │
│ ❌ BAD:  [32px button] too small │
│ ✅ GOOD: [48px button] easy tap  │
└──────────────────────────────────┘
```

**Key Deliverables:**

- ✅ Mobile-optimized component library
- ✅ Touch target size enforcement
- ✅ Responsive typography scale
- ✅ Migration guide for existing components

**Files to Change:**

```
src/
├── components/@extended/mobile/
│   ├── MobileCard.js               [NEW]  Touch-optimized card
│   ├── MobileDialog.js             [NEW]  Full-screen mobile dialog
│   ├── MobileList.js               [NEW]  Virtualized list
│   ├── TouchButton.js              [NEW]  48px+ button
│   └── ScrollToTop.js              [NEW]  Hide/show FAB
├── theme/
│   ├── index.js                    [EDIT] Add mobile breakpoints
│   └── components.js               [EDIT] Override MUI defaults
└── docs/
    └── MOBILE_COMPONENT_GUIDE.md   [NEW]  Usage guide
```

---

## 📊 Success Metrics

### Performance Targets

```
Metric                    Current    Target     Tool
────────────────────────────────────────────────────────
Initial Bundle Size       2.5 MB     <1 MB      Webpack Analyzer
First Contentful Paint    3.2s       <1.5s      Lighthouse
Time to Interactive       5.8s       <2.5s      Lighthouse
Lighthouse Score (Mobile) 62         >90        Chrome DevTools

Offline Functionality:
- Cache hit rate          0%         >80%       SW logs
- Offline form queue      N/A        100%       IndexedDB

UX Metrics:
- Tap to navigate         3 taps     1 tap      User testing
- Pull-to-refresh         0 pages    All lists  Feature audit
- Swipe actions           1 module   6 modules  Feature audit
```

### Testing Checklist

```
✅ Functional Tests:
   □ Bottom nav routes to correct pages
   □ Pull-to-refresh works on all lists
   □ Swipe actions trigger correct handlers
   □ Offline queue stores and syncs mutations
   □ Splash screen shows on cold start

✅ Performance Tests:
   □ Bundle size <1 MB
   □ FCP <1.5s on 3G
   □ TTI <2.5s on 3G
   □ Lighthouse score >90

✅ Visual Tests:
   □ No layout shifts on load
   □ Smooth animations (60 FPS)
   □ Touch targets ≥48px
   □ No content cutoff on small screens

✅ Device Tests:
   □ iOS Safari (iPhone 12+)
   □ Chrome Android (Pixel 5+)
   □ Tablet (iPad, Android tablet)
   □ Desktop (unchanged experience)
```

---

## � How to Resume Work (Critical for New Conversations)

> **⚠️ QUAN TRỌNG:** Nếu hết token hoặc bắt đầu conversation mới, làm theo checklist này để tiếp tục đúng phase!

### 🎯 Quick Resume Protocol

```bash
# 1. Identify current phase
# Check branch name or last commit message
git log -1 --oneline

# 2. Open corresponding PHASE document
code docs/PWA_CONVERSION/PHASE_X_[NAME].md

# 3. Check phase progress markers in code
# Each phase adds markers in comments:
# "// PWA-PHASE-1: Mobile Navigation - COMPLETED"
# "// PWA-PHASE-2: Splash Screen - IN PROGRESS"

# 4. Tell AI Agent in new conversation:
"Tôi đang làm PWA Conversion Phase [X].
File đã xong: [list files]
File đang làm: [current file]
Vấn đề hiện tại: [if any]
Hãy đọc docs/PWA_CONVERSION/PHASE_X_[NAME].md và tiếp tục."
```

### 📋 Phase Status Tracking

Sau mỗi file hoàn thành, update checklist này:

```markdown
## ✅ PROGRESS TRACKER (Update khi làm xong mỗi file)

### Phase 1: Mobile Navigation

- [ ] src/layout/MainLayout/MobileBottomNav.js (NEW)
- [ ] src/layout/MainLayout/index.js (EDIT)
- [ ] src/layout/MainLayout/Header/index.js (EDIT)
- [ ] src/routes/config/navItems.js (NEW)

### Phase 2: Splash & Skeleton

- [ ] src/App.js (EDIT)
- [ ] src/components/SplashScreen.js (NEW)
- [ ] src/components/skeletons/PageSkeleton.js (NEW)
- [ ] src/components/skeletons/CardListSkeleton.js (NEW)
- [ ] src/routes/index.js (EDIT - add Suspense)

### Phase 3: Gesture System

- [ ] src/components/@extended/mobile/PullToRefreshWrapper.jsx (MOVE)
- [ ] src/components/@extended/mobile/SwipeableCard.jsx (MOVE)
- [ ] src/features/BenhNhan/BenhNhanListPage.js (EDIT)
- [ ] src/features/BaoCao/BaoCaoListPage.js (EDIT)
- [ ] src/features/SuCo/SuCoListPage.js (EDIT)
- [ ] ... (3 more modules)

### Phase 4: Route Optimization

- [ ] src/routes/index.js (EDIT - lazy load)
- [ ] src/routes/lazyRoutes.js (NEW)
- [ ] src/utils/preloadRoute.js (NEW)

### Phase 5: Offline Strategy

- [ ] public/service-worker.js (EDIT)
- [ ] src/utils/offlineQueue.js (NEW)
- [ ] src/utils/networkStatus.js (NEW)
- [ ] src/components/OfflineIndicator.js (NEW)

### Phase 6: Component Library

- [ ] src/components/@extended/mobile/MobileCard.js (NEW)
- [ ] src/components/@extended/mobile/MobileDialog.js (NEW)
- [ ] src/components/@extended/mobile/TouchButton.js (NEW)
- [ ] src/theme/index.js (EDIT)
```

Copy checklist này vào file `docs/PWA_CONVERSION/PROGRESS.md` để track!

---

## 🚀 Getting Started (Per Phase Entry Points)

### Prerequisites (One-time Setup)

```bash
# 1. Backup current branch
git checkout -b pwa-conversion-backup

# 2. Create feature branch
git checkout -b feature/pwa-conversion

# 3. Verify dependencies
cd fe-bcgiaobanbvt
npm list react react-dom @mui/material framer-motion
# All should be installed already

# 4. Verify dev server
npm start
# Should run on http://localhost:3000
```

### 🎯 Phase Entry Points (Jump to Any Phase)

**Mỗi phase CÓ THỂ bắt đầu độc lập nếu có đủ prerequisites!**

```
┌──────────────────────────────────────────────────────────┐
│ PHASE 1: Mobile Navigation                               │
├──────────────────────────────────────────────────────────┤
│ Prerequisites: NONE (can start immediately)              │
│ Entry Command:                                           │
│   code docs/PWA_CONVERSION/PHASE_1_MOBILE_NAVIGATION.md  │
│ Quick Test:                                              │
│   npm start → Open mobile view → Check bottom nav       │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ PHASE 2: Splash & Skeleton                               │
├──────────────────────────────────────────────────────────┤
│ Prerequisites: NONE (independent, can run parallel)      │
│ Entry Command:                                           │
│   code docs/PWA_CONVERSION/PHASE_2_SPLASH_SKELETON.md    │
│ Quick Test:                                              │
│   npm start → Hard refresh → Check splash animation     │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ PHASE 3: Gesture System                                  │
├──────────────────────────────────────────────────────────┤
│ Prerequisites: Phase 1 complete (needs mobile detection) │
│ Entry Command:                                           │
│   code docs/PWA_CONVERSION/PHASE_3_GESTURE_SYSTEM.md     │
│ Verify Prerequisites:                                    │
│   grep -r "isMobile.*useMediaQuery" src/layout/          │
│   # Should find mobile detection in MainLayout          │
│ Quick Test:                                              │
│   npm start → Mobile → Pull down list → Check refresh   │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ PHASE 4: Route Optimization                              │
├──────────────────────────────────────────────────────────┤
│ Prerequisites: NONE (independent)                        │
│ Entry Command:                                           │
│   code docs/PWA_CONVERSION/PHASE_4_ROUTE_OPTIMIZATION.md │
│ Quick Test:                                              │
│   npm run build → Analyze bundle size                   │
│   npx webpack-bundle-analyzer build/static/js/*.js      │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ PHASE 5: Offline Strategy                                │
├──────────────────────────────────────────────────────────┤
│ Prerequisites: NONE (independent)                        │
│ Entry Command:                                           │
│   code docs/PWA_CONVERSION/PHASE_5_OFFLINE_STRATEGY.md   │
│ Quick Test:                                              │
│   npm start → DevTools → Network → Offline → Reload     │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ PHASE 6: Component Library                               │
├──────────────────────────────────────────────────────────┤
│ Prerequisites: Phase 1-5 complete (polish phase)         │
│ Entry Command:                                           │
│   code docs/PWA_CONVERSION/PHASE_6_COMPONENT_LIBRARY.md  │
│ Quick Test:                                              │
│   npm start → Mobile → Check touch target sizes         │
└──────────────────────────────────────────────────────────┘
```

### 📖 Reading Order (Recommended)

```
Recommended sequence for FIRST implementation:

1. Read PHASE_1_MOBILE_NAVIGATION.md
   ↓ Implement Phase 1
   ↓ Test on mobile device
   ↓
2. Read PHASE_2_SPLASH_SKELETON.md (parallel với Phase 1)
   ↓ Implement Phase 2
   ↓
3. Read PHASE_3_GESTURE_SYSTEM.md
   ↓ Implement Phase 3 (depends on Phase 1)
   ↓
4. Read PHASE_4 + PHASE_5 (có thể song song)
   ↓ Optimize performance
   ↓
5. Read PHASE_6_COMPONENT_LIBRARY.md
   ↓ Polish & consistency
   ↓
6. Read TESTING_DEPLOYMENT.md
   ↓ QA + Deploy
```

---

## 📞 Support & Resources

### Internal Resources

```
Codebase Patterns:
- Redux patterns:     docs/.github/copilot-instructions.md
- Form patterns:      src/components/form/
- Layout patterns:    src/layout/MainLayout/
- Gesture examples:   src/features/QuanLyCongViec/Ticket/

Configuration:
- Theme:              src/theme/index.js
- Routes:             src/routes/index.js
- Redux:              src/app/store.js
- API:                src/app/apiService.js
```

### External References

```
PWA:
- MDN PWA Guide:      https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
- Service Workers:    https://web.dev/service-workers-cache-storage/
- Workbox:            https://developers.google.com/web/tools/workbox

Mobile UX:
- iOS HIG:            https://developer.apple.com/design/human-interface-guidelines/
- Material Design:    https://material.io/design/platform-guidance/android-mobile.html
- Touch Targets:      https://web.dev/accessible-tap-targets/

Performance:
- Lighthouse:         https://web.dev/lighthouse-performance/
- Bundle Analysis:    https://webpack.js.org/guides/code-splitting/
- React Lazy:         https://react.dev/reference/react/lazy
```

---

## 🎯 Next Steps

**Bước tiếp theo:**

1. ✅ **Bạn đã đọc MASTER_PLAN.md** ← Hiện tại
2. ➡️ **Đọc PHASE_1_MOBILE_NAVIGATION.md** để bắt đầu implementation
3. 🚀 **Implement Phase 1** (Week 1-2)

**Khi đã sẵn sàng:**

```bash
# Open Phase 1 document
code docs/PWA_CONVERSION/PHASE_1_MOBILE_NAVIGATION.md
```

---

## 🤖 Context Handoff Protocol (For AI Agents)

> **Dành cho AI Agent khi resume trong conversation mới**

### Phase Context Template

Khi bắt đầu conversation mới, user sẽ cung cấp:

```markdown
**Project:** PWA Conversion for Hospital Management System
**Current Phase:** [Phase Number & Name]
**Branch:** feature/pwa-conversion
**Progress:** [X/Y files completed]

**Completed Files:**

- ✅ src/layout/MainLayout/MobileBottomNav.js
- ✅ src/layout/MainLayout/index.js
  [list all completed files with checkmarks]

**Current Task:**

- 🔄 Working on: src/features/BenhNhan/BenhNhanListPage.js
- 📝 Step: Adding PullToRefresh wrapper
- ❓ Issue: [if any]

**Reference Documents:**

- Main: docs/PWA*CONVERSION/PHASE*[X]\_[NAME].md
- Progress: docs/PWA_CONVERSION/PROGRESS.md

**Instructions:**
Please read the phase document and continue implementation from current task.
```

### AI Agent Should:

1. **Read phase document first:**

   ```
   read_file("docs/PWA_CONVERSION/PHASE_X_[NAME].md")
   ```

2. **Check completed files:**

   ```
   grep -r "PWA-PHASE-X.*COMPLETED" src/
   ```

3. **Review current file:**

   ```
   read_file("src/features/BenhNhan/BenhNhanListPage.js")
   ```

4. **Continue from documented step** in phase document

### Code Markers to Add

Sau khi hoàn thành mỗi file, thêm marker:

```javascript
// ============================================
// PWA-PHASE-1: Mobile Navigation - COMPLETED
// Date: 2026-01-07
// Changes: Added bottom navigation for mobile
// ============================================
```

Giúp AI Agent identify progress trong conversation mới!

---

## 🔍 Quick Commands Reference

### Check Phase Status

```bash
# See which phase markers exist in code
grep -r "PWA-PHASE" src/ | grep "COMPLETED"

# Count completed vs total files per phase
# Phase 1: 4 files
find src/ -type f -exec grep -l "PWA-PHASE-1.*COMPLETED" {} \; | wc -l

# Phase 2: 5 files
find src/ -type f -exec grep -l "PWA-PHASE-2.*COMPLETED" {} \; | wc -l

# View phase document
cat docs/PWA_CONVERSION/PHASE_[X]_[NAME].md | less
```

### Verify Prerequisites

```bash
# Phase 1: No prerequisites
echo "Ready to start Phase 1"

# Phase 3: Check if Phase 1 complete (needs mobile detection)
grep -r "isMobile.*useMediaQuery" src/layout/MainLayout/index.js
# Should return matches if Phase 1 done

# Phase 6: Check if Phase 1-5 complete
grep -r "PWA-PHASE-[1-5].*COMPLETED" src/ | wc -l
# Should return multiple files
```

### Test Current Phase

```bash
# Phase 1: Test bottom navigation
npm start
# → Open DevTools mobile view
# → Check if bottom nav appears on mobile

# Phase 2: Test splash screen
npm start
# → Hard refresh (Ctrl+Shift+R)
# → Check splash animation

# Phase 3: Test gestures
npm start
# → Mobile view → Navigate to list page
# → Pull down to refresh

# Phase 4: Check bundle size
npm run build
du -sh build/static/js/main.*.js
# Should be <1MB after lazy loading

# Phase 5: Test offline
npm start
# → DevTools → Network tab → Offline checkbox
# → Reload page → Should show cached content
```

---

## 📝 Version History

| Version | Date       | Author   | Changes                                    |
| ------- | ---------- | -------- | ------------------------------------------ |
| 1.0.0   | 2026-01-07 | AI Agent | Initial master plan created                |
| 1.1.0   | 2026-01-07 | AI Agent | Added resume protocol & phase entry points |

---

## 🎯 Next Actions

### For First-Time Implementation:

1. ✅ **Bạn đã đọc MASTER_PLAN.md** ← Hiện tại
2. ➡️ **Create progress tracker:**
   ```bash
   cp docs/PWA_CONVERSION/MASTER_PLAN.md docs/PWA_CONVERSION/PROGRESS.md
   # Edit PROGRESS.md to track your checklist
   ```
3. ➡️ **Choose starting phase** (recommend Phase 1 or 2)
4. 🚀 **Open phase document & start implementation**

### For Resume in New Conversation:

1. 📋 **Check progress:**
   ```bash
   grep -r "PWA-PHASE.*COMPLETED" src/
   cat docs/PWA_CONVERSION/PROGRESS.md
   ```
2. 🎯 **Identify next phase/file** from checklist
3. 📖 **Open corresponding PHASE document**
4. 💬 **Tell AI Agent:** "Resume PWA Phase [X], đã xong [files], đang làm [current file]"

---

**Tài liệu này là overview tổng quát. Mỗi PHASE sẽ có document riêng với chi tiết implementation cụ thể.**

**🚀 Sẵn sàng bắt đầu? Chọn phase và open document tương ứng!**
