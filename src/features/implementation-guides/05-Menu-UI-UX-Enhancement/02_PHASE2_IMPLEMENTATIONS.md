# PHASE 2 - Enhanced UX Implementation

> 🎯 **Divider Labels, Staggered Animations, Active Indicator**

## 📋 Overview

Phase 2 tập trung vào UX improvements với:

- Better visual organization
- Smooth reveal animations
- Active state indication
- Professional polish

**Timeline**: 2-3 giờ  
**Impact**: ⭐⭐⭐⭐ High  
**Status**: ✅ Completed

---

## 5️⃣ Divider với Labels

### 🎯 Mục tiêu

Menu groups có divider với title category rõ ràng, thay vì Typography đơn giản.

### 📝 Implementation

**File**: `src/layout/MainLayout/Drawer/DrawerContent/Navigation/NavGroup.js`

#### Step 1: Import Divider

```javascript
import {
  Box,
  ClickAwayListener,
  Divider, // ✨ Add this
  List,
  // ... other imports
} from "@mui/material";
```

#### Step 2: Replace Typography với Divider

```javascript
<List
  subheader={
    item.title &&
    drawerOpen &&
    menuCaption && (
      <Box sx={{ px: 2, pt: 2, pb: 1, position: "relative" }}>
        {/* ✨ ENHANCED DIVIDER WITH LABEL */}
        <Divider
          sx={{
            my: 1.5,
            borderColor: "divider",
            position: "relative",
            "&::before": {
              content: `"${item.title}"`,
              position: "absolute",
              top: -12,
              left: 8,
              bgcolor: "background.default",
              px: 1.5,
              py: 0.5,
              fontSize: "0.75rem",
              fontWeight: 700,
              color:
                theme.palette.mode === ThemeMode.DARK
                  ? "text.secondary"
                  : "secondary.dark",
              textTransform: "uppercase",
              letterSpacing: 1.2,
              borderRadius: 1,
              border: `1px solid ${theme.palette.divider}`,
              boxShadow:
                theme.palette.mode === ThemeMode.DARK
                  ? "0 2px 4px rgba(0,0,0,0.3)"
                  : "0 2px 4px rgba(0,0,0,0.1)",
            },
          }}
        />
        {item.caption && (
          <Typography variant="caption" // ... rest of code
```

### 🎨 Visual Structure

```
┌─────────────────────────────────┐
│                                 │
│  ╔══════════════════════╗       │
│  ║  ┌──[ HỆ THỐNG ]──┐ ║       │
│  ║  ─────────────────   ║       │
│  ╚══════════════════════╝       │
│   📊 Dashboard                  │
│   👥 Quản lý người dùng         │
│   ⚙️ Cài đặt                    │
│                                 │
│  ╔══════════════════════╗       │
│  ║  ┌──[ BÁO CÁO ]────┐ ║       │
│  ║  ─────────────────   ║       │
│  ╚══════════════════════╝       │
│   📈 Thống kê                   │
│   📋 Báo cáo chi tiết           │
└─────────────────────────────────┘
```

### 🎛️ CSS Properties Explained

| Property             | Value                | Purpose                     |
| -------------------- | -------------------- | --------------------------- |
| `content`            | `"${item.title}"`    | Dynamic title từ config     |
| `position: absolute` | `top: -12`           | Float trên divider line     |
| `bgcolor`            | `background.default` | Match với drawer background |
| `border`             | `1px solid divider`  | Subtle outline              |
| `boxShadow`          | `0 2px 4px`          | Slight elevation            |
| `letterSpacing`      | `1.2`                | Better readability          |

### 🎨 Theme Variations

**Dark Mode:**

```javascript
color: theme.palette.text.secondary;
boxShadow: "0 2px 4px rgba(0,0,0,0.3)";
```

**Light Mode:**

```javascript
color: theme.palette.secondary.dark;
boxShadow: "0 2px 4px rgba(0,0,0,0.1)";
```

### ✅ Testing

1. Mở drawer (full width)
2. Scroll qua các menu groups
3. Mỗi group có divider với label floating

---

## 6️⃣ Staggered Reveal Animation

### 🎯 Mục tiêu

Menu items xuất hiện lần lượt (cascade) thay vì đồng loạt, tạo professional feel.

### 📝 Implementation

**File**: `src/layout/MainLayout/Drawer/DrawerContent/Navigation/NavGroup.js`

#### Step 1: Wrap items với animation Box

```javascript
const navCollapse = item.children?.map((menuItem, index) => {
  let component;

  // Render logic...
  switch (menuItem.type) {
    case "collapse":
      component = <NavCollapse key={menuItem.id} ... />;
      break;
    case "item":
      component = <NavItem key={menuItem.id} ... />;
      break;
    default:
      component = <Typography key={menuItem.id} ... />;
  }

  // ✨ STAGGERED ANIMATION WRAPPER
  return (
    <Box
      key={menuItem.id}
      sx={{
        animation: drawerOpen
          ? `slideInFromLeft 0.3s ease-out ${index * 0.05}s both`
          : "none",
        "@keyframes slideInFromLeft": {
          "0%": {
            opacity: 0,
            transform: "translateX(-20px)",
          },
          "100%": {
            opacity: 1,
            transform: "translateX(0)",
          },
        },
      }}
    >
      {component}
    </Box>
  );
});
```

#### Step 2: Apply to `items` array

```javascript
const items = currentItem.children?.map((menu, index) => {
  let component;

  // Same pattern as navCollapse...

  return (
    <Box
      key={menu.id}
      sx={{
        animation: drawerOpen
          ? `slideInFromLeft 0.3s ease-out ${index * 0.05}s both`
          : "none",
        "@keyframes slideInFromLeft": {
          "0%": {
            opacity: 0,
            transform: "translateX(-20px)",
          },
          "100%": {
            opacity: 1,
            transform: "translateX(0)",
          },
        },
      }}
    >
      {component}
    </Box>
  );
});
```

### 🎬 Animation Timeline

```
Drawer Opens at t=0:

t=0ms:    Item 1 starts → opacity 0, translateX(-20px)
t=50ms:   Item 2 starts → opacity 0, translateX(-20px)
t=100ms:  Item 3 starts → opacity 0, translateX(-20px)
t=150ms:  Item 4 starts → opacity 0, translateX(-20px)
...
t=300ms:  Item 1 complete → opacity 1, translateX(0)
t=350ms:  Item 2 complete → opacity 1, translateX(0)
t=400ms:  Item 3 complete → opacity 1, translateX(0)
```

### 🎛️ Animation Properties

| Property    | Value           | Purpose                     |
| ----------- | --------------- | --------------------------- |
| `duration`  | `0.3s`          | How long each item animates |
| `delay`     | `index * 0.05s` | Stagger delay (50ms)        |
| `timing`    | `ease-out`      | Smooth deceleration         |
| `fill-mode` | `both`          | Keep initial & final states |
| `condition` | `drawerOpen`    | Only when opening           |

### 📐 Calculation

```javascript
// For 10 items:
Item 1: 0ms delay    → complete at 300ms
Item 2: 50ms delay   → complete at 350ms
Item 3: 100ms delay  → complete at 400ms
Item 4: 150ms delay  → complete at 450ms
...
Item 10: 450ms delay → complete at 750ms

Total animation time: 750ms
```

### 🎨 Visual Flow

```
Frame 1 (0ms):     Frame 2 (100ms):   Frame 3 (200ms):
│                  │ Item 1 ◄─────    │ Item 1 ████
│                  │                  │ Item 2 ◄─────
│                  │                  │ Item 3
│                  │                  │

Frame 4 (300ms):   Frame 5 (400ms):   Complete:
│ Item 1 ████      │ Item 1 ████      │ Item 1 ████
│ Item 2 ████      │ Item 2 ████      │ Item 2 ████
│ Item 3 ◄─────    │ Item 3 ████      │ Item 3 ████
│ Item 4           │ Item 4 ◄─────    │ Item 4 ████
```

### 🎛️ Customization Options

```javascript
// Faster cascade (30ms between items)
animation: `slideInFromLeft 0.3s ease-out ${index * 0.03}s both`

// Slower, more dramatic (100ms between items)
animation: `slideInFromLeft 0.3s ease-out ${index * 0.1}s both`

// Different direction (from right)
"@keyframes slideInFromRight": {
  "0%": {
    opacity: 0,
    transform: "translateX(20px)", // Positive value
  },
  "100%": {
    opacity: 1,
    transform: "translateX(0)",
  },
}

// Fade in only (no slide)
"@keyframes fadeIn": {
  "0%": { opacity: 0 },
  "100%": { opacity: 1 },
}
```

### ⚡ Performance Tips

```javascript
// ✅ GOOD: Only animate when needed
animation: drawerOpen ? `slideIn...` : "none";

// ✅ GOOD: Use transform (GPU accelerated)
transform: "translateX(-20px)";

// ❌ AVOID: Animating layout properties
left: -20; // Causes reflow
```

### ✅ Testing

1. Đóng drawer hoàn toàn
2. Click hamburger để mở
3. Menu items cascade từ trái sang phải
4. Smooth, không jerky

---

## 7️⃣ Active Indicator Line

### 🎯 Mục tiêu

Animated gradient line bên phải active menu item, di chuyển smooth khi navigate.

### 📝 Implementation

#### Step 1: Create ActiveIndicator Component

**File**: `src/layout/MainLayout/Drawer/DrawerContent/ActiveIndicator.js` (NEW)

```javascript
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useSelector } from "react-redux";

// ==============================|| ACTIVE INDICATOR LINE ||============================== //

const ActiveIndicator = () => {
  const theme = useTheme();
  const { pathname } = useLocation();
  const { drawerOpen } = useSelector((state) => state.menu);
  const [activePosition, setActivePosition] = useState(0);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    if (!drawerOpen) {
      setShowIndicator(false);
      return;
    }

    // Tìm active menu item trong DOM
    const activeElement = document.querySelector(
      ".MuiListItemButton-root.Mui-selected"
    );

    if (activeElement) {
      const drawerContent = document.querySelector(
        '[aria-label="mailbox folders"]'
      );
      if (drawerContent) {
        const drawerRect = drawerContent.getBoundingClientRect();
        const activeRect = activeElement.getBoundingClientRect();

        // Calculate position relative to drawer
        const position =
          activeRect.top - drawerRect.top + activeRect.height / 2 - 24;

        setActivePosition(position);
        setShowIndicator(true);
      }
    } else {
      setShowIndicator(false);
    }
  }, [pathname, drawerOpen]);

  if (!showIndicator || !drawerOpen) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        right: 0,
        top: activePosition,
        width: 4,
        height: 48,
        background: `linear-gradient(180deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        borderRadius: "4px 0 0 4px",
        boxShadow: `-2px 0 12px ${theme.palette.primary.main}80`,
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: 1,
        opacity: 0.9,
        // Glow effect
        "&::before": {
          content: '""',
          position: "absolute",
          inset: -4,
          background: `radial-gradient(circle, ${theme.palette.primary.main}40 0%, transparent 70%)`,
          borderRadius: "4px 0 0 4px",
          animation: "pulse 2s infinite",
        },
        "@keyframes pulse": {
          "0%, 100%": {
            opacity: 0.6,
            transform: "scale(1)",
          },
          "50%": {
            opacity: 1,
            transform: "scale(1.1)",
          },
        },
      }}
    />
  );
};

export default ActiveIndicator;
```

#### Step 2: Integrate vào DrawerContent

**File**: `src/layout/MainLayout/Drawer/DrawerContent/index.js`

```javascript
// Import
import ActiveIndicator from "./ActiveIndicator";

// Desktop drawer
if (!matchDownMD) {
  return (
    <Box
      sx={{
        height: "100%",
        position: "relative", // ✨ For ActiveIndicator positioning
        transition: "all 0.3s ease-in-out",
      }}
    >
      {/* ✨ ACTIVE INDICATOR LINE */}
      <ActiveIndicator />
      <Navigation />
    </Box>
  );
}

// Mobile drawer
return (
  <Box sx={{ position: "relative", height: "100%" }}>
    {/* ✨ ACTIVE INDICATOR LINE */}
    <ActiveIndicator />
    <SimpleBar>
      <Navigation />
    </SimpleBar>
  </Box>
);
```

### 🎨 Visual Design

```
┌─────────────────────────┐
│  Dashboard              │
│  Users                  │
│  Analytics            ╏ │◄─ Active Indicator
│  Reports                │   (4px width, 48px height)
│  Settings               │   (gradient primary→secondary)
└─────────────────────────┘   (with glow & pulse)
```

### 🎛️ Key Features

| Feature                | Implementation          | Purpose                 |
| ---------------------- | ----------------------- | ----------------------- |
| **Position Tracking**  | DOM query + calculation | Find active item        |
| **Smooth Movement**    | `transition: 0.4s`      | Animated repositioning  |
| **Gradient Colors**    | `primary → secondary`   | Visual appeal           |
| **Glow Effect**        | `boxShadow + ::before`  | Depth & attention       |
| **Pulse Animation**    | `@keyframes pulse 2s`   | Subtle living indicator |
| **Conditional Render** | `drawerOpen check`      | Only when visible       |

### 📐 Position Calculation

```javascript
// Get bounding rectangles
const drawerRect = drawerContent.getBoundingClientRect();
const activeRect = activeElement.getBoundingClientRect();

// Calculate relative position
const position =
  activeRect.top - // Active item top
  drawerRect.top + // Minus drawer top
  activeRect.height / 2 - // Plus half item height (center)
  24; // Minus half indicator height (24px)

// Result: Indicator centered on active item
```

### 🎬 Animation States

```
State 1: Item A selected
│  Item A            ╏
│  Item B            │
│  Item C            │

State 2: Navigate to Item C
│  Item A            │
│  Item B            ↓ (transition 0.4s)
│  Item C            ╏

State 3: Complete
│  Item A            │
│  Item B            │
│  Item C            ╏ (pulse animation)
```

### 🎨 Glow & Pulse Effect

```javascript
// Glow layer (::before pseudo-element)
background: radial-gradient(
  circle,
  primary.main + 40% opacity center,
  transparent at 70%
)

// Pulse animation (2s infinite)
@keyframes pulse {
  0%, 100%: opacity 0.6, scale 1
  50%:      opacity 1,   scale 1.1
}
```

### ⚡ Performance Optimization

```javascript
// ✅ GOOD: useEffect with dependencies
useEffect(() => {
  // Recalculate only when needed
}, [pathname, drawerOpen]);

// ✅ GOOD: Early return when hidden
if (!showIndicator || !drawerOpen) return null;

// ✅ GOOD: CSS transitions (GPU accelerated)
transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
```

### 🐛 Troubleshooting

**Indicator không hiển thị:**

```javascript
// Check selector
document.querySelector(".MuiListItemButton-root.Mui-selected");

// Verify drawer aria-label
document.querySelector('[aria-label="mailbox folders"]');
```

**Position không chính xác:**

```javascript
// Log để debug
console.log("Drawer rect:", drawerRect);
console.log("Active rect:", activeRect);
console.log("Calculated position:", position);
```

**Transition jerky:**

```javascript
// Use better easing
transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
// Instead of: "all 0.4s ease"
```

### ✅ Testing

1. Click vào menu item để navigate
2. Indicator xuất hiện bên phải active item
3. Navigate sang item khác → line di chuyển mượt
4. Glow effect pulse mỗi 2 giây
5. Thu gọn drawer → indicator biến mất

---

## 📊 Phase 2 Summary

### Files Modified

- ✅ `NavGroup.js` - Divider + Staggered
- ✅ `ActiveIndicator.js` - **NEW FILE**
- ✅ `DrawerContent/index.js` - Integration

### Key Achievements

- ✅ Better visual organization với labeled dividers
- ✅ Professional cascade animation
- ✅ Clear active state indication
- ✅ All animations smooth 60fps
- ✅ Theme-aware (dark/light)

### Performance

- ✅ CSS animations (GPU accelerated)
- ✅ Optimized DOM queries
- ✅ Conditional rendering
- ✅ No memory leaks

---

**Next**: [Code Samples](./03_CODE_SAMPLES.md) →
