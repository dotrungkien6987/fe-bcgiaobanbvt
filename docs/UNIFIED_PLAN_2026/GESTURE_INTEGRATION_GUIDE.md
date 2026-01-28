# 🎯 Gesture Integration Guide

**Phase 4 Component Documentation**  
**Last Updated:** 2026-01-19

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Available Gestures](#available-gestures)
3. [Installation & Setup](#installation--setup)
4. [Component API Reference](#component-api-reference)
5. [Usage Examples](#usage-examples)
6. [Integration Checklist](#integration-checklist)
7. [Testing Guide](#testing-guide)
8. [Troubleshooting](#troubleshooting)

---

## Overview

Gesture components cung cấp mobile-friendly interactions cho ứng dụng:

- **PullToRefresh**: Pull down để reload data
- **SwipeableCard**: Swipe để hiện actions (edit/delete)
- **LongPressMenu**: Long press để mở context menu

**Đặc điểm:**

- ✅ Mobile-only (tự động disable trên desktop)
- ✅ Haptic feedback support (iOS/Android)
- ✅ Smooth 60 FPS animations
- ✅ Progressive enhancement (app works without JS)

---

## Available Gestures

### 1. PullToRefresh

**Location:** `src/components/mobile/gestures/PullToRefresh.js`

**Visual:**

```
┌────────────────────────┐
│   ↓ Kéo xuống         │ ← Pull down
│   ○ 75% ...           │ ← Progress indicator
├────────────────────────┤
│ [Content list]         │
│ Item 1                 │
│ Item 2                 │
└────────────────────────┘
```

**Khi nào dùng:**

- ✅ List/table cần refresh data
- ✅ Dashboard với real-time data
- ✅ Feed/timeline pages

### 2. SwipeableCard

**Location:** `src/components/mobile/gestures/SwipeableCard.js`

**Visual:**

```
Normal:
┌────────────────────────┐
│ [Card Content]         │
└────────────────────────┘

Swipe Left (reveal right actions):
┌──────────────────┬─────┐
│ [Card Content]   │ 🗑️ │
└──────────────────┴─────┘

Swipe Right (reveal left actions):
┌─────┬──────────────────┐
│ ✏️ │ [Card Content]   │
└─────┴──────────────────┘
```

**Khi nào dùng:**

- ✅ List items với quick actions (edit/delete)
- ✅ Email/message inbox style
- ✅ Task management lists

### 3. LongPressMenu

**Location:** `src/components/mobile/gestures/LongPressMenu.js`

**Visual:**

```
1. Long press (500ms)
┌────────────────────────┐
│ [Card - pressed]       │ ← Vibrate!
└────────────────────────┘

2. Menu appears
┌────────────────────────┐
│ [Card]                 │
└──────┬─────────────────┘
       │ ┌─────────────┐
       └►│ ✏️ Sửa      │
         │ 🗑️ Xóa     │
         │ 📋 Sao chép │
         └─────────────┘
```

**Khi nào dùng:**

- ✅ Nhiều actions (>3) trên 1 item
- ✅ Secondary/advanced actions
- ✅ Context-aware menus

---

## Installation & Setup

### Step 1: Verify Dependencies

```bash
# Check if mobile folder exists
ls src/components/mobile/gestures/

# Should see:
# - PullToRefresh.js
# - SwipeableCard.js
# - LongPressMenu.js
# - index.js
```

### Step 2: Import Hook

```javascript
import { useMobileLayout } from "hooks/useMobileLayout";

function MyComponent() {
  const { isMobile } = useMobileLayout();

  // Only use gestures on mobile
  if (isMobile) {
    // Apply gesture components
  }
}
```

### Step 3: Import Gestures

```javascript
// Option A: Named imports
import {
  PullToRefresh,
  SwipeableCard,
  LongPressMenu,
} from "components/mobile/gestures";

// Option B: Default imports
import PullToRefresh from "components/mobile/gestures/PullToRefresh";
import SwipeableCard from "components/mobile/gestures/SwipeableCard";
import LongPressMenu from "components/mobile/gestures/LongPressMenu";
```

---

## Component API Reference

### PullToRefresh

#### Props

| Prop         | Type                | Required | Default | Description                |
| ------------ | ------------------- | -------- | ------- | -------------------------- |
| `children`   | ReactNode           | ✅       | -       | Content to wrap            |
| `onRefresh`  | () => Promise<void> | ✅       | -       | Async callback khi refresh |
| `threshold`  | number              | ❌       | 80      | Pixels to trigger refresh  |
| `resistance` | number              | ❌       | 3       | Drag resistance factor     |
| `disabled`   | boolean             | ❌       | false   | Disable gesture            |

#### Example

```javascript
<PullToRefresh
  onRefresh={async () => {
    await dispatch(fetchData());
  }}
  threshold={100}
  resistance={2}
>
  <MyList data={items} />
</PullToRefresh>
```

---

### SwipeableCard

#### Props

| Prop           | Type                | Required | Default | Description                     |
| -------------- | ------------------- | -------- | ------- | ------------------------------- |
| `children`     | ReactNode           | ✅       | -       | Card content                    |
| `leftActions`  | Action[]            | ❌       | -       | Actions revealed on right swipe |
| `rightActions` | Action[]            | ❌       | -       | Actions revealed on left swipe  |
| `disabled`     | boolean             | ❌       | false   | Disable swipe                   |
| `threshold`    | number              | ❌       | 50      | Swipe distance to reveal        |
| `maxSwipe`     | number              | ❌       | 100     | Max swipe distance              |
| `onSwipe`      | (direction) => void | ❌       | -       | Callback on swipe               |

#### Action Object

```typescript
type Action = {
  icon: ReactElement; // MUI Icon component
  color?: string; // MUI color (e.g., "error.main")
  onClick: () => void; // Click handler
  label?: string; // Aria label for accessibility
};
```

#### Example

```javascript
<SwipeableCard
  leftActions={[
    {
      icon: <EditIcon />,
      color: "info.main",
      onClick: () => handleEdit(item.id),
      label: "Edit item",
    },
  ]}
  rightActions={[
    {
      icon: <DeleteIcon />,
      color: "error.main",
      onClick: () => handleDelete(item.id),
      label: "Delete item",
    },
  ]}
  threshold={60}
  onSwipe={(direction) => console.log(`Swiped ${direction}`)}
>
  <Card>
    <CardContent>{item.name}</CardContent>
  </Card>
</SwipeableCard>
```

---

### LongPressMenu

#### Props

| Prop        | Type       | Required | Default | Description               |
| ----------- | ---------- | -------- | ------- | ------------------------- |
| `children`  | ReactNode  | ✅       | -       | Pressable content         |
| `menuItems` | MenuItem[] | ✅       | -       | Menu items to show        |
| `duration`  | number     | ❌       | 500     | Long press duration (ms)  |
| `disabled`  | boolean    | ❌       | false   | Disable gesture           |
| `onOpen`    | () => void | ❌       | -       | Callback when menu opens  |
| `onClose`   | () => void | ❌       | -       | Callback when menu closes |

#### MenuItem Object

```typescript
type MenuItem = {
  label: string; // Menu item text
  icon?: ReactElement; // Optional icon
  onClick: () => void; // Click handler
  disabled?: boolean; // Disable item
  divider?: boolean; // Show divider after
};
```

#### Example

```javascript
<LongPressMenu
  menuItems={[
    {
      label: "Chỉnh sửa",
      icon: <EditIcon />,
      onClick: () => handleEdit(item.id),
    },
    {
      label: "Xóa",
      icon: <DeleteIcon />,
      onClick: () => handleDelete(item.id),
      divider: true,
    },
    {
      label: "Sao chép",
      icon: <CopyIcon />,
      onClick: () => handleCopy(item.id),
    },
  ]}
  duration={600}
  onOpen={() => console.log("Menu opened")}
>
  <Card>
    <CardContent>{item.name}</CardContent>
  </Card>
</LongPressMenu>
```

---

## Usage Examples

### Example 1: CongViec List với Full Gestures

```javascript
// File: CongViecListPage.js
import React from "react";
import { Stack } from "@mui/material";
import { useMobileLayout } from "hooks/useMobileLayout";
import { PullToRefresh, SwipeableCard } from "components/mobile/gestures";
import CongViecCard from "./components/CongViecCard";

function CongViecListPage() {
  const { isMobile } = useMobileLayout();
  const dispatch = useDispatch();
  const congViecs = useSelector((state) => state.congviec.list);

  const handleRefresh = async () => {
    await dispatch(getCongViecList(true)); // Force refresh
  };

  const handleEdit = (id) => {
    navigate(`/congviec/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xác nhận xóa?")) {
      await dispatch(deleteCongViec(id));
    }
  };

  if (isMobile) {
    return (
      <PullToRefresh onRefresh={handleRefresh}>
        <Stack spacing={2} p={2}>
          {congViecs.map((item) => (
            <SwipeableCard
              key={item._id}
              leftActions={[
                {
                  icon: <EditIcon />,
                  color: "info.main",
                  onClick: () => handleEdit(item._id),
                },
              ]}
              rightActions={[
                {
                  icon: <DeleteIcon />,
                  color: "error.main",
                  onClick: () => handleDelete(item._id),
                },
              ]}
            >
              <CongViecCard data={item} />
            </SwipeableCard>
          ))}
        </Stack>
      </PullToRefresh>
    );
  }

  // Desktop view
  return <CongViecTable data={congViecs} />;
}

export default CongViecListPage;
```

---

### Example 2: Conditional Gestures Based on Permissions

```javascript
function ProtectedSwipeableCard({ item, canEdit, canDelete }) {
  const leftActions = canEdit
    ? [{ icon: <EditIcon />, onClick: () => handleEdit(item.id) }]
    : undefined;

  const rightActions = canDelete
    ? [{ icon: <DeleteIcon />, onClick: () => handleDelete(item.id) }]
    : undefined;

  // No gestures if no permissions
  if (!canEdit && !canDelete) {
    return <CongViecCard data={item} />;
  }

  return (
    <SwipeableCard leftActions={leftActions} rightActions={rightActions}>
      <CongViecCard data={item} />
    </SwipeableCard>
  );
}
```

---

### Example 3: Nested Gestures (PullToRefresh + Swipeable)

```javascript
<PullToRefresh onRefresh={handleRefresh}>
  <Stack spacing={2}>
    {items.map((item) => (
      <SwipeableCard
        key={item.id}
        rightActions={[
          { icon: <DeleteIcon />, onClick: () => handleDelete(item.id) },
        ]}
      >
        <LongPressMenu
          menuItems={[
            { label: "Copy", onClick: () => handleCopy(item.id) },
            { label: "Share", onClick: () => handleShare(item.id) },
          ]}
        >
          <ItemCard data={item} />
        </LongPressMenu>
      </SwipeableCard>
    ))}
  </Stack>
</PullToRefresh>
```

**Lưu ý:** Touch events được handled đúng thứ tự:

1. LongPress detects first (500ms timeout)
2. If move > 10px → Cancel long press, allow swipe
3. If swipe → Reveal actions
4. If pull at top → Trigger refresh

---

## Integration Checklist

### Pre-Integration

- [ ] Verify `useMobileLayout` hook exists
- [ ] Check gesture components are in `components/mobile/gestures/`
- [ ] Review component API props
- [ ] Plan which gestures to use

### Implementation

- [ ] Import gesture components
- [ ] Wrap content with gesture wrappers
- [ ] Implement callback handlers (onRefresh, onClick, etc.)
- [ ] Add conditional rendering for mobile/desktop
- [ ] Test gestures on localhost

### Post-Integration

- [ ] Test on real iOS device (Safari)
- [ ] Test on real Android device (Chrome)
- [ ] Verify haptic feedback works
- [ ] Check animations are smooth (60 FPS)
- [ ] Test edge cases (fast swipes, interruptions)
- [ ] Update module documentation

---

## Testing Guide

### Manual Testing Steps

#### PullToRefresh

1. **Basic Pull:**

   - [ ] Scroll to top of list
   - [ ] Pull down slowly
   - [ ] Verify indicator shows progress (0-100%)
   - [ ] Release after threshold (80px)
   - [ ] Verify "Đang tải..." message
   - [ ] Verify data refreshes

2. **Edge Cases:**
   - [ ] Pull when not at top → Should not trigger
   - [ ] Pull < threshold → Should bounce back
   - [ ] Rapid pull and release → Should handle gracefully
   - [ ] Pull during existing refresh → Should ignore

#### SwipeableCard

1. **Basic Swipe:**

   - [ ] Swipe left (reveal right actions)
   - [ ] Swipe right (reveal left actions)
   - [ ] Tap action button → Action triggers
   - [ ] Tap outside → Card closes

2. **Edge Cases:**
   - [ ] Swipe < threshold → Should bounce back
   - [ ] Fast swipe (flick) → Should reveal fully
   - [ ] Swipe while scrolling → Should not conflict
   - [ ] Multiple cards swiped → Previous closes automatically

#### LongPressMenu

1. **Basic Long Press:**

   - [ ] Press and hold (500ms)
   - [ ] Verify haptic feedback (vibrate)
   - [ ] Verify menu appears at touch point
   - [ ] Tap menu item → Action triggers
   - [ ] Tap outside → Menu closes

2. **Edge Cases:**
   - [ ] Press < 500ms → No menu
   - [ ] Press + move → Cancel (allow scroll)
   - [ ] Press on disabled item → No action
   - [ ] Rapid press multiple items → Each works independently

---

### Automated Testing (Optional)

```javascript
// Example Jest + React Testing Library
import { render, fireEvent } from "@testing-library/react";
import { SwipeableCard } from "components/mobile/gestures";

describe("SwipeableCard", () => {
  it("reveals right actions on left swipe", () => {
    const onDelete = jest.fn();
    const { getByTestId } = render(
      <SwipeableCard
        rightActions={[{ icon: <DeleteIcon />, onClick: onDelete }]}
      >
        <div data-testid="content">Content</div>
      </SwipeableCard>
    );

    const card = getByTestId("content");
    fireEvent.touchStart(card, { touches: [{ clientX: 100 }] });
    fireEvent.touchMove(card, { touches: [{ clientX: 0 }] }); // Swipe left 100px
    fireEvent.touchEnd(card);

    // Verify action button is visible
    const deleteBtn = getByTestId("action-delete");
    expect(deleteBtn).toBeVisible();
  });
});
```

---

## Troubleshooting

### Issue: Pull to Refresh Not Triggering

**Symptoms:**

- Pull down but nothing happens
- Indicator doesn't show

**Solutions:**

1. **Check scroll position:**

```javascript
// Must be at top of scroll container
const handleTouchStart = (e) => {
  const scrollTop = containerRef.current?.scrollTop || 0;
  if (scrollTop === 0) {
    // Only allow pull at top
  }
};
```

2. **Check container height:**

```javascript
// Container must have fixed height
<PullToRefresh>
  <Box sx={{ height: "100vh", overflowY: "auto" }}>{content}</Box>
</PullToRefresh>
```

3. **Check mobile detection:**

```javascript
const { isMobile } = useMobileLayout();
console.log("isMobile:", isMobile); // Should be true on mobile
```

---

### Issue: Swipe Conflicts with Scroll

**Symptoms:**

- Vertical scroll doesn't work when swiping
- Card swipes when trying to scroll

**Solutions:**

1. **Set touchAction:**

```javascript
<SwipeableCard>
  <Box sx={{ touchAction: "pan-y" }}>
    {" "}
    {/* Allow vertical pan */}
    {content}
  </Box>
</SwipeableCard>
```

2. **Adjust threshold:**

```javascript
<SwipeableCard threshold={80}>
  {" "}
  {/* Increase threshold */}
  {content}
</SwipeableCard>
```

---

### Issue: Long Press Triggers on Scroll

**Symptoms:**

- Menu opens when scrolling
- Menu appears unintentionally

**Solutions:**

1. **Cancel on move:**

```javascript
// Already built-in, but verify:
const handleTouchMove = () => {
  if (longPressTimer.current) {
    clearTimeout(longPressTimer.current); // Cancel if finger moves
  }
};
```

2. **Increase duration:**

```javascript
<LongPressMenu duration={700}>
  {" "}
  {/* 700ms instead of 500ms */}
  {content}
</LongPressMenu>
```

---

### Issue: Animations Janky/Slow

**Symptoms:**

- Gestures feel laggy
- Animations stutter

**Solutions:**

1. **Use CSS transforms:**

```javascript
// Already optimized, but verify:
<Box sx={{
  transform: `translateX(${offset}px)`,
  transition: isDragging ? 'none' : 'transform 0.3s ease',
  willChange: 'transform', // Hardware acceleration
}}>
```

2. **Reduce component complexity:**

```javascript
// Avoid heavy re-renders during gesture
const MemoizedCard = React.memo(CongViecCard);

<SwipeableCard>
  <MemoizedCard data={item} />
</SwipeableCard>;
```

---

## Module Integration Status

| Module          | PullToRefresh | SwipeableCard | LongPressMenu | Status |
| --------------- | ------------- | ------------- | ------------- | ------ |
| **YeuCau**      | ✅ Done       | ✅ Done       | ⏳ Pending    | 66%    |
| **CongViec**    | ⏳ Pending    | ⏳ Pending    | ⏳ Pending    | 0%     |
| **KPI**         | ⏳ Pending    | ⏳ Pending    | ⏳ Pending    | 0%     |
| **GiaoNhiemVu** | ✅ Done       | ⏳ Pending    | ⏳ Pending    | 33%    |
| **Dashboard**   | ✅ Done       | N/A           | N/A           | 100%   |

**Legend:**

- ✅ Done - Fully implemented and tested
- ⏳ Pending - Not yet implemented
- N/A - Not applicable for this module

---

## Best Practices

### DO ✅

- ✅ Always check `isMobile` before applying gestures
- ✅ Provide visual feedback during gesture (progress, animations)
- ✅ Use haptic feedback when available
- ✅ Test on real devices (not just emulators)
- ✅ Keep action buttons ≥ 48px touch target
- ✅ Provide fallback for non-gesture users (desktop)
- ✅ Use meaningful icons and labels

### DON'T ❌

- ❌ Don't mix gestures with click events on same element
- ❌ Don't use gestures for critical actions only (always provide alternative)
- ❌ Don't override native browser gestures (swipe back, pull to reload)
- ❌ Don't use gestures on disabled/read-only content
- ❌ Don't forget to cleanup timers on unmount
- ❌ Don't use gestures without visual hints (show swipe indicator on first use)

---

## Resources

### Documentation

- [React Touch Events](https://react.dev/reference/react-dom/components/common#touch-events)
- [MDN Touch Events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [iOS Safe Areas](https://developer.apple.com/design/human-interface-guidelines/layout)

### Tools

- [Chrome DevTools Device Mode](https://developer.chrome.com/docs/devtools/device-mode/)
- [BrowserStack](https://www.browserstack.com/) - Test on real devices
- [React DevTools](https://react.dev/learn/react-developer-tools)

---

**Questions or Issues?**  
Contact: [Your Team Contact]  
Docs Version: 1.0.0  
Last Updated: 2026-01-19
