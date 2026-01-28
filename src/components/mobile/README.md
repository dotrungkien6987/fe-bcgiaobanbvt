# 📱 Mobile Components Architecture

**Location:** `src/components/mobile/`  
**Purpose:** Centralized mobile-optimized UI components  
**Last Updated:** 2026-01-19

---

## 📚 Overview

Thư mục này chứa tất cả components được tối ưu hóa cho mobile view. Tách biệt rõ ràng giữa mobile và desktop components giúp:

- ✅ Dễ maintain và scale
- ✅ Tối ưu bundle size (code splitting)
- ✅ Consistent mobile UX
- ✅ Developer experience tốt hơn

---

## 📁 Folder Structure

```
src/components/mobile/
├── README.md                    ← This file
│
├── gestures/                    ← Touch gesture components
│   ├── index.js                 ← Export all gestures
│   ├── PullToRefresh.js         ← Pull-down refresh
│   ├── SwipeableCard.js         ← Swipe-to-reveal actions
│   ├── LongPressMenu.js         ← Long press context menu
│   └── __tests__/
│       ├── PullToRefresh.test.js
│       ├── SwipeableCard.test.js
│       └── LongPressMenu.test.js
│
├── layout/                      ← Mobile layout components
│   ├── index.js
│   ├── MobileDetailLayout/      ← Detail page layout
│   │   ├── index.js
│   │   └── README.md
│   ├── MobileBottomNav/         ← Bottom navigation bar
│   │   ├── index.js
│   │   └── MobileMenuGrid.js
│   └── MobilePageHeader.js      ← Sticky page header
│
├── cards/                       ← Mobile-optimized cards
│   ├── index.js
│   ├── BaseMobileCard.js        ← Base card component
│   ├── SwipeableMobileCard.js   ← Card with swipe gestures
│   └── CompactCard.js           ← Compact layout variant
│
├── feedback/                    ← Loading, toasts, alerts
│   ├── index.js
│   ├── LoadingScreen.js         ← Full-screen loading
│   ├── SkeletonLoader/          ← Content placeholders
│   │   ├── index.js
│   │   ├── CardSkeleton.js
│   │   ├── TableSkeleton.js
│   │   └── ListSkeleton.js
│   ├── SplashScreen/            ← App launch splash
│   │   └── index.js
│   └── MobileToast.js           ← Mobile-friendly toast
│
└── utils/                       ← Mobile utility hooks/helpers
    ├── index.js
    ├── useMobileGesture.js      ← Custom gesture hook
    ├── useMobileSafeArea.js     ← Safe area detection
    └── mobileDetection.js       ← Device detection utils
```

---

## 🎯 Design Principles

### 1. Mobile-First

Tất cả components trong folder này được thiết kế **chỉ cho mobile**:

```javascript
// ❌ BAD: Check mobile inside component
function MyComponent() {
  const { isMobile } = useMobileLayout();

  if (!isMobile) return null; // Waste of bundle size

  return <MobileContent />;
}

// ✅ GOOD: Check mobile at usage site
function ParentPage() {
  const { isMobile } = useMobileLayout();

  if (isMobile) {
    return <MobilePage />; // Only load mobile code
  }

  return <DesktopPage />;
}
```

### 2. Progressive Enhancement

Components work without JavaScript, enhance with gestures:

```javascript
// Base functionality without gestures
<Card onClick={handleClick}>{content}</Card>;

// Enhanced with gestures on mobile
{
  isMobile ? (
    <SwipeableCard
      rightActions={[{ icon: <DeleteIcon />, onClick: handleDelete }]}
    >
      <Card onClick={handleClick}>{content}</Card>
    </SwipeableCard>
  ) : (
    <Card onClick={handleClick}>{content}</Card>
  );
}
```

### 3. Performance

Components tối ưu cho mobile devices:

- ✅ Hardware-accelerated animations (CSS transforms)
- ✅ 60 FPS target
- ✅ Lazy load heavy components
- ✅ Memoize expensive renders
- ✅ Debounce/throttle touch events

```javascript
// Hardware acceleration
sx={{
  transform: `translateX(${offset}px)`,
  willChange: 'transform',
}}

// Memoization
const MemoizedCard = React.memo(MobileCard);
```

### 4. Touch Target Size

Tất cả interactive elements ≥ 48x48px:

```javascript
// Minimum touch target
<IconButton sx={{ width: 48, height: 48 }}>
  <DeleteIcon />
</IconButton>
```

---

## 📦 Component Categories

### Gestures (`gestures/`)

Touch-based interactions:

| Component       | Purpose             | When to Use                 |
| --------------- | ------------------- | --------------------------- |
| `PullToRefresh` | Pull down to reload | Lists, dashboards, feeds    |
| `SwipeableCard` | Swipe for actions   | List items with edit/delete |
| `LongPressMenu` | Long press menu     | Multiple secondary actions  |

**Documentation:** [GESTURE_INTEGRATION_GUIDE.md](../../docs/UNIFIED_PLAN_2026/GESTURE_INTEGRATION_GUIDE.md)

### Layout (`layout/`)

Page structure components:

| Component            | Purpose              | When to Use              |
| -------------------- | -------------------- | ------------------------ |
| `MobileDetailLayout` | Detail page template | Detail/view pages        |
| `MobileBottomNav`    | Bottom navigation    | App-wide navigation      |
| `MobilePageHeader`   | Sticky header        | Page titles with actions |

### Cards (`cards/`)

Mobile-optimized card variants:

| Component             | Purpose         | When to Use             |
| --------------------- | --------------- | ----------------------- |
| `BaseMobileCard`      | Base card style | Extend for custom cards |
| `SwipeableMobileCard` | Card + swipe    | Quick actions on cards  |
| `CompactCard`         | Compact layout  | Space-constrained lists |

### Feedback (`feedback/`)

User feedback components:

| Component        | Purpose             | When to Use            |
| ---------------- | ------------------- | ---------------------- |
| `LoadingScreen`  | Full-screen loader  | Page transitions       |
| `SkeletonLoader` | Content placeholder | Loading states         |
| `SplashScreen`   | App launch          | First load             |
| `MobileToast`    | Toast notification  | Success/error messages |

### Utils (`utils/`)

Helper hooks and utilities:

| Hook/Util           | Purpose             | When to Use        |
| ------------------- | ------------------- | ------------------ |
| `useMobileGesture`  | Custom gesture hook | Complex gestures   |
| `useMobileSafeArea` | Safe area padding   | iOS notch handling |
| `mobileDetection`   | Device detection    | Feature detection  |

---

## 🚀 Quick Start

### 1. Import Components

```javascript
// Named imports (recommended)
import {
  PullToRefresh,
  SwipeableCard,
  LongPressMenu,
} from "components/mobile/gestures";

import { MobileDetailLayout, MobileBottomNav } from "components/mobile/layout";

// Default imports
import PullToRefresh from "components/mobile/gestures/PullToRefresh";
```

### 2. Use with Mobile Detection

```javascript
import { useMobileLayout } from "hooks/useMobileLayout";

function MyPage() {
  const { isMobile } = useMobileLayout();

  if (isMobile) {
    return <MobilePage />; // Use mobile components
  }

  return <DesktopPage />; // Use desktop components
}
```

### 3. Common Patterns

#### Pattern A: List with Gestures

```javascript
function CongViecListMobile() {
  const dispatch = useDispatch();
  const items = useSelector(selectItems);

  return (
    <PullToRefresh onRefresh={() => dispatch(fetchItems())}>
      <Stack spacing={2}>
        {items.map((item) => (
          <SwipeableCard
            key={item.id}
            rightActions={[
              { icon: <DeleteIcon />, onClick: () => handleDelete(item.id) },
            ]}
          >
            <CongViecCard data={item} />
          </SwipeableCard>
        ))}
      </Stack>
    </PullToRefresh>
  );
}
```

#### Pattern B: Detail Page with Layout

```javascript
function CongViecDetailMobile({ id }) {
  const item = useSelector((state) => selectItemById(state, id));

  return (
    <MobileDetailLayout
      title={item.TenCongViec}
      subtitle={`Mã: ${item.MaCongViec}`}
      backPath="/congviec"
      actions={<ActionsMenu item={item} />}
      footer={<ActionButtons item={item} />}
      enablePullToRefresh
      onRefresh={() => dispatch(fetchItem(id))}
    >
      <CongViecDetailContent data={item} />
    </MobileDetailLayout>
  );
}
```

---

## 🔧 Migration Guide

### Migrating Existing Components

#### Step 1: Identify Mobile-Specific Code

```javascript
// BEFORE: Mixed mobile/desktop in one component
function MyComponent() {
  const { isMobile } = useMobileLayout();

  return (
    <Box>
      {isMobile ? (
        <MobileLayout>...</MobileLayout>
      ) : (
        <DesktopLayout>...</DesktopLayout>
      )}
    </Box>
  );
}
```

#### Step 2: Extract Mobile Component

```javascript
// NEW: Separate mobile component
// src/components/mobile/MyMobileComponent.js
function MyMobileComponent() {
  // Mobile-only code
  return <MobileLayout>...</MobileLayout>;
}

// Original component - desktop only
function MyComponent() {
  // Desktop-only code
  return <DesktopLayout>...</DesktopLayout>;
}
```

#### Step 3: Conditional Import at Route Level

```javascript
// routes/index.js or parent component
const MyDesktopComponent = lazy(() => import("components/MyComponent"));
const MyMobileComponent = lazy(() =>
  import("components/mobile/MyMobileComponent")
);

function MyPage() {
  const { isMobile } = useMobileLayout();

  if (isMobile) {
    return (
      <Suspense>
        <MyMobileComponent />
      </Suspense>
    );
  }

  return (
    <Suspense>
      <MyDesktopComponent />
    </Suspense>
  );
}
```

---

## ✅ Best Practices

### DO ✅

```javascript
// ✅ Import from mobile folder for mobile-only code
import { SwipeableCard } from 'components/mobile/gestures';

// ✅ Check mobile at usage site, not inside component
const { isMobile } = useMobileLayout();
if (isMobile) return <MobileView />;

// ✅ Use named exports for tree-shaking
export { PullToRefresh, SwipeableCard, LongPressMenu };

// ✅ Memoize heavy mobile components
const MemoizedMobileCard = React.memo(MobileCard);

// ✅ Hardware-accelerate animations
sx={{ transform: 'translateX(0)', willChange: 'transform' }}
```

### DON'T ❌

```javascript
// ❌ Don't check mobile inside mobile component
function MobileComponent() {
  const { isMobile } = useMobileLayout(); // Redundant!
  if (!isMobile) return null;
  // ...
}

// ❌ Don't use pointer events on mobile components
onMouseEnter={...} // Use onTouchStart instead

// ❌ Don't use small touch targets
<IconButton sx={{ width: 32, height: 32 }}> {/* Too small! */}

// ❌ Don't override native gestures
onTouchMove={(e) => e.preventDefault()} {/* Blocks scroll! */}

// ❌ Don't mix mobile/desktop code in same file
if (isMobile) return <Mobile />; else return <Desktop />; // Split into files!
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Test on iOS Safari (real device)
- [ ] Test on Android Chrome (real device)
- [ ] Test gestures work smoothly (60 FPS)
- [ ] Test touch targets are ≥ 48px
- [ ] Test safe area padding (iPhone notch)
- [ ] Test haptic feedback (if applicable)
- [ ] Test conflicts with native gestures (swipe back, pull to refresh)

### Automated Testing

```javascript
// Example test setup
import { render, fireEvent } from "@testing-library/react";
import { SwipeableCard } from "components/mobile/gestures";

describe("Mobile Components", () => {
  beforeEach(() => {
    // Mock mobile detection
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query === "(max-width: 600px)",
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));
  });

  it("renders mobile component on mobile", () => {
    const { getByTestId } = render(<SwipeableCard>Content</SwipeableCard>);
    expect(getByTestId("swipeable-card")).toBeInTheDocument();
  });
});
```

---

## 📊 Component Status

| Category         | Components | Status      | Last Updated |
| ---------------- | ---------- | ----------- | ------------ |
| **Gestures**     | 3          | 🟡 Partial  | 2026-01-19   |
| ├─ PullToRefresh | 1          | ✅ Complete | 2026-01-15   |
| ├─ SwipeableCard | 1          | ⏳ Planned  | -            |
| └─ LongPressMenu | 1          | ⏳ Planned  | -            |
| **Layout**       | 3          | 🟢 Complete | 2026-01-10   |
| **Cards**        | 3          | ⏳ Planned  | -            |
| **Feedback**     | 4          | 🟢 Complete | 2026-01-12   |
| **Utils**        | 3          | ⏳ Planned  | -            |

**Legend:**

- ✅ Complete - Fully implemented and tested
- 🟡 Partial - Some components complete
- ⏳ Planned - Not yet implemented
- 🟢 Complete - All components in category done

---

## 🔗 Related Documentation

- [GESTURE_INTEGRATION_GUIDE.md](../../docs/UNIFIED_PLAN_2026/GESTURE_INTEGRATION_GUIDE.md) - Gesture usage guide
- [PHASE_4_GESTURES.md](../../docs/UNIFIED_PLAN_2026/PHASE_4_GESTURES.md) - Implementation plan
- [UNIFIED_PLAN_2026/](../../docs/UNIFIED_PLAN_2026/) - Overall mobile UX plan

---

## 🆘 Support

### Questions?

- Check [GESTURE_INTEGRATION_GUIDE.md](../../docs/UNIFIED_PLAN_2026/GESTURE_INTEGRATION_GUIDE.md) for detailed usage
- Review examples in feature modules (YeuCau, CongViec)
- Contact team lead for architecture questions

### Contributing

1. Follow folder structure above
2. Add tests for new components
3. Update this README with new components
4. Document props and usage examples

---

**Version:** 1.0.0  
**Last Updated:** 2026-01-19  
**Maintained by:** Frontend Team
