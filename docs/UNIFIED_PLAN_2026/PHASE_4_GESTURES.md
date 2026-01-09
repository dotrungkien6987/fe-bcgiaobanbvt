# Phase 4: Gesture Components

**Thời gian:** 8 giờ  
**Ưu tiên:** 🟢 LOW  
**Trạng thái:** ⏸️ Blocked by Phase 1, Phase 3

---

## 🎯 Mục Tiêu

Tạo reusable gesture components cho mobile interactions: Pull to Refresh, Swipeable Cards, Long Press.

### Vision

```
Gestures:
┌────────────────────────┐
│ ↓ Pull to Refresh      │ ← Pull down to reload
│ ────────────────────── │
│ [Item] ← Swipe left    │ ← Swipe to reveal actions
│ [Item] Long press...   │ ← Long press for context menu
└────────────────────────┘
```

---

## 📦 Deliverables

### 4A. Core Gesture Components (5h)

- ✅ `PullToRefresh.js` - Pull-down refresh indicator
- ✅ `SwipeableCard.js` - Swipe-to-reveal actions
- ✅ `LongPressMenu.js` - Long-press context menu

### 4B. Apply to Modules (3h)

- ✅ Apply to CongViec list (2h)
- ✅ Apply to YeuCau list (1h)
- ✅ Documentation for other modules

---

## 📋 Task Breakdown (8h)

## PHASE 4A: Core Gesture Components (5h)

### Task 4A.1: Create PullToRefresh Component (2h)

**File:** `src/components/gestures/PullToRefresh.js`

**Features:**

- Detects pull-down gesture on scroll container
- Shows refresh indicator with progress
- Triggers onRefresh callback
- Haptic feedback (if supported)

**Implementation:**

```javascript
import React, { useRef, useState, useEffect } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

const PULL_THRESHOLD = 80; // pixels to trigger refresh
const DRAG_RESISTANCE = 3; // resistance factor

function PullToRefresh({ onRefresh, children }) {
  const containerRef = useRef(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const startY = useRef(0);

  const handleTouchStart = (e) => {
    const scrollTop = containerRef.current?.scrollTop || 0;

    // Only allow pull at top of scroll
    if (scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    // Only pull down, not up
    if (diff > 0) {
      // Apply resistance
      const distance = diff / DRAG_RESISTANCE;
      setPullDistance(Math.min(distance, PULL_THRESHOLD + 20));

      // Prevent default scroll when pulling
      if (distance > 10) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    setIsDragging(false);

    if (pullDistance >= PULL_THRESHOLD && !refreshing) {
      setRefreshing(true);

      // Haptic feedback (if supported)
      if (window.navigator?.vibrate) {
        window.navigator.vibrate(50);
      }

      try {
        await onRefresh?.();
      } finally {
        setRefreshing(false);
        setPullDistance(0);
      }
    } else {
      // Bounce back
      setPullDistance(0);
    }
  };

  // Calculate refresh indicator state
  const progress = Math.min((pullDistance / PULL_THRESHOLD) * 100, 100);
  const shouldRefresh = pullDistance >= PULL_THRESHOLD;

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "relative",
        height: "100%",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Refresh Indicator */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: pullDistance,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          transition: refreshing || !isDragging ? "height 0.3s ease" : "none",
          backgroundColor: "background.paper",
          zIndex: 1,
        }}
      >
        {refreshing ? (
          <Box display="flex" alignItems="center" gap={1}>
            <CircularProgress size={24} />
            <Typography variant="caption">Đang tải...</Typography>
          </Box>
        ) : pullDistance > 0 ? (
          <Box display="flex" alignItems="center" gap={1}>
            <CircularProgress
              variant="determinate"
              value={progress}
              size={24}
            />
            <Typography variant="caption">
              {shouldRefresh ? "Thả để làm mới" : "Kéo xuống để làm mới"}
            </Typography>
          </Box>
        ) : null}
      </Box>

      {/* Content */}
      <Box
        sx={{
          transform: refreshing
            ? `translateY(${PULL_THRESHOLD}px)`
            : `translateY(${pullDistance}px)`,
          transition:
            refreshing || !isDragging ? "transform 0.3s ease" : "none",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default PullToRefresh;
```

---

### Task 4A.2: Create SwipeableCard Component (2h)

**File:** `src/components/gestures/SwipeableCard.js`

**Features:**

- Swipe left/right to reveal actions
- Configurable left/right action buttons
- Auto-close on outside click
- Smooth animations

**Implementation:**

```javascript
import React, { useRef, useState } from "react";
import { Box, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const SWIPE_THRESHOLD = 50; // pixels to trigger action reveal
const MAX_SWIPE = 100; // max swipe distance

function SwipeableCard({
  children,
  leftActions, // Array of { icon, color, onClick }
  rightActions,
  disabled = false,
}) {
  const cardRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);

  const handleTouchStart = (e) => {
    if (disabled) return;
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;

    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;

    // Clamp offset
    const clampedOffset = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, diff));
    setOffset(clampedOffset);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    // Snap to revealed or closed state
    if (Math.abs(offset) >= SWIPE_THRESHOLD) {
      // Reveal actions
      setOffset(offset > 0 ? MAX_SWIPE : -MAX_SWIPE);
    } else {
      // Close
      setOffset(0);
    }
  };

  const handleActionClick = (action) => {
    action.onClick?.();
    setOffset(0); // Close after action
  };

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        touchAction: "pan-y", // Allow vertical scroll
      }}
    >
      {/* Left Actions (revealed on right swipe) */}
      {leftActions && (
        <Box
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            pl: 1,
            opacity: offset > 0 ? 1 : 0,
            transition: isDragging ? "none" : "opacity 0.2s",
          }}
        >
          {leftActions.map((action, index) => (
            <IconButton
              key={index}
              onClick={() => handleActionClick(action)}
              sx={{ color: action.color || "primary.main" }}
            >
              {action.icon}
            </IconButton>
          ))}
        </Box>
      )}

      {/* Card Content */}
      <Box
        ref={cardRef}
        sx={{
          transform: `translateX(${offset}px)`,
          transition: isDragging ? "none" : "transform 0.3s ease",
          backgroundColor: "background.paper",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </Box>

      {/* Right Actions (revealed on left swipe) */}
      {rightActions && (
        <Box
          sx={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            pr: 1,
            opacity: offset < 0 ? 1 : 0,
            transition: isDragging ? "none" : "opacity 0.2s",
          }}
        >
          {rightActions.map((action, index) => (
            <IconButton
              key={index}
              onClick={() => handleActionClick(action)}
              sx={{ color: action.color || "error.main" }}
            >
              {action.icon}
            </IconButton>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default SwipeableCard;
```

**Usage Example:**

```javascript
// In CongViecListPage.js (mobile)
<SwipeableCard
  leftActions={[
    {
      icon: <EditIcon />,
      color: "info.main",
      onClick: () => handleEdit(item.id),
    },
  ]}
  rightActions={[
    {
      icon: <DeleteIcon />,
      color: "error.main",
      onClick: () => handleDelete(item.id),
    },
  ]}
>
  <CongViecCard data={item} />
</SwipeableCard>
```

---

### Task 4A.3: Create LongPressMenu Component (1h)

**File:** `src/components/gestures/LongPressMenu.js`

**Features:**

- Detects long press (500ms)
- Shows context menu at touch position
- Closes on outside click

**Implementation:**

```javascript
import React, { useRef, useState } from "react";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";

const LONG_PRESS_DURATION = 500; // ms

function LongPressMenu({ children, menuItems, disabled = false }) {
  const [anchorPosition, setAnchorPosition] = useState(null);
  const longPressTimer = useRef(null);

  const handleTouchStart = (e) => {
    if (disabled) return;

    const touch = e.touches[0];
    longPressTimer.current = setTimeout(() => {
      // Haptic feedback
      if (window.navigator?.vibrate) {
        window.navigator.vibrate(50);
      }

      setAnchorPosition({
        top: touch.clientY,
        left: touch.clientX,
      });
    }, LONG_PRESS_DURATION);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleClose = () => {
    setAnchorPosition(null);
  };

  return (
    <>
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchEnd} // Cancel on move
        style={{ cursor: "pointer" }}
      >
        {children}
      </div>

      <Menu
        open={Boolean(anchorPosition)}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={anchorPosition}
      >
        {menuItems.map((item, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              item.onClick?.();
              handleClose();
            }}
          >
            {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
            <ListItemText>{item.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default LongPressMenu;
```

**Usage Example:**

```javascript
// In CongViecCard.js
<LongPressMenu
  menuItems={[
    { label: "Chỉnh sửa", icon: <EditIcon />, onClick: handleEdit },
    { label: "Xóa", icon: <DeleteIcon />, onClick: handleDelete },
    { label: "Sao chép", icon: <CopyIcon />, onClick: handleCopy },
  ]}
>
  <CongViecCard data={item} />
</LongPressMenu>
```

---

## PHASE 4B: Apply to Modules (3h)

### Task 4B.1: Apply PullToRefresh to CongViec List (1h)

**File:** `src/features/QuanLyCongViec/CongViec/CongViecListPage.js`

**Integration:**

```javascript
import PullToRefresh from "components/gestures/PullToRefresh";
import { useMobileLayout } from "hooks/useMobileLayout";

function CongViecListPage() {
  const { isMobile } = useMobileLayout();

  const handleRefresh = async () => {
    await dispatch(getCongViecByNhanVien(nhanVienId, filters, true)); // Force refresh
  };

  const listContent = (
    <>
      <CongViecNestedTabs {...tabProps} />
      <FilterPanel {...filterProps} />
      <CongViecTable data={congViecs} />
    </>
  );

  if (isMobile) {
    return (
      <Container>
        <PullToRefresh onRefresh={handleRefresh}>{listContent}</PullToRefresh>
      </Container>
    );
  }

  return <Container>{listContent}</Container>;
}
```

---

### Task 4B.2: Apply SwipeableCard to CongViec Cards (1h)

**File:** `src/features/QuanLyCongViec/CongViec/components/CongViecMobileCard.js` (new)

```javascript
import React from "react";
import { Card, CardContent, Typography, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import SwipeableCard from "components/gestures/SwipeableCard";
import { WorkRoutes } from "utils/navigationHelper";

function CongViecMobileCard({ data, onEdit, onDelete }) {
  const navigate = useNavigate();

  return (
    <SwipeableCard
      leftActions={[
        {
          icon: <EditIcon />,
          color: "info.main",
          onClick: () => onEdit(data._id),
        },
      ]}
      rightActions={[
        {
          icon: <DeleteIcon />,
          color: "error.main",
          onClick: () => onDelete(data._id),
        },
      ]}
    >
      <Card onClick={() => navigate(WorkRoutes.congViecDetail(data._id))}>
        <CardContent>
          <Typography variant="h6" noWrap>
            {data.TenCongViec}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            #{data.MaCongViec}
          </Typography>
          <Chip label={data.TrangThai} size="small" sx={{ mt: 1 }} />
        </CardContent>
      </Card>
    </SwipeableCard>
  );
}

export default CongViecMobileCard;
```

**Use in list:**

```javascript
// In CongViecListPage.js
{
  isMobile ? (
    congViecs.map((item) => (
      <CongViecMobileCard
        key={item._id}
        data={item}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    ))
  ) : (
    <CongViecTable data={congViecs} />
  );
}
```

---

### Task 4B.3: Apply to YeuCau Module (1h)

**Similar pattern:** Apply PullToRefresh + SwipeableCard to YeuCauListPage

**Files:**

- `YeuCauListPage.js` - Add PullToRefresh
- `YeuCauMobileCard.js` - Create with SwipeableCard

---

### Task 4B.4: Document for Other Modules (0h - included in above)

**Documentation:** `docs/UNIFIED_PLAN_2026/GESTURE_INTEGRATION_GUIDE.md`

````markdown
# Gesture Integration Guide

## Quick Start

### Pull to Refresh

```javascript
import PullToRefresh from "components/gestures/PullToRefresh";

<PullToRefresh onRefresh={handleRefresh}>
  {/* Your list content */}
</PullToRefresh>;
```
````

### Swipeable Card

```javascript
import SwipeableCard from "components/gestures/SwipeableCard";

<SwipeableCard
  leftActions={[{ icon: <EditIcon />, onClick: handleEdit }]}
  rightActions={[{ icon: <DeleteIcon />, onClick: handleDelete }]}
>
  {/* Your card content */}
</SwipeableCard>;
```

### Long Press Menu

```javascript
import LongPressMenu from "components/gestures/LongPressMenu";

<LongPressMenu
  menuItems={[{ label: "Edit", icon: <EditIcon />, onClick: handleEdit }]}
>
  {/* Your clickable content */}
</LongPressMenu>;
```

## Modules to Apply

- ✅ CongViec (done in Phase 4B)
- ✅ YeuCau (done in Phase 4B)
- ⏳ KPI (future)
- ⏳ NhiemVuThuongQuy (future)
- ⏳ BaoCaoNgay (future)

```

---

## ✅ Success Criteria

### Core Components
- [ ] PullToRefresh works on iOS/Android
- [ ] Threshold triggers correctly (80px)
- [ ] Haptic feedback works (if supported)
- [ ] SwipeableCard reveals actions on swipe
- [ ] Actions trigger correctly
- [ ] LongPressMenu shows after 500ms
- [ ] Menu positioned at touch point

### Integration
- [ ] CongViec list has pull-to-refresh
- [ ] CongViec cards swipeable
- [ ] YeuCau list has pull-to-refresh
- [ ] No conflicts with vertical scroll
- [ ] Smooth animations (60 FPS)

---

## 🧪 Testing Checklist

### Gesture Tests
- [ ] Pull-to-refresh on iOS Safari
- [ ] Pull-to-refresh on Chrome Android
- [ ] Swipe left reveals right actions
- [ ] Swipe right reveals left actions
- [ ] Long press shows menu (500ms)
- [ ] Touch move cancels long press

### Performance Tests
- [ ] Animations run at 60 FPS
- [ ] No jank on low-end devices
- [ ] Touch targets ≥ 48px
- [ ] No accidental triggers

### Edge Cases
- [ ] Works with nested scroll containers
- [ ] Doesn't block horizontal scroll (if any)
- [ ] Closes on outside click
- [ ] Works with React 18 Concurrent Mode

---

## 🚧 Dependencies

**Required:**
- ⚠️ **Phase 1** - `useMobileLayout` hook
- ⚠️ **Phase 3** - MobileDetailLayout (for context)

**Optional:**
- None

---

## 🚨 Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Touch conflicts | - Test on real devices<br>- Adjust thresholds |
| Performance issues | - Use CSS transforms<br>- Hardware acceleration<br>- Debounce handlers |
| Browser inconsistencies | - Test iOS Safari, Chrome, Firefox<br>- Polyfills if needed |
| Accessibility concerns | - Keep keyboard alternatives<br>- ARIA labels |

---

## 📝 Notes

- **Mobile-only:** Gestures disabled on desktop (pointer events)
- **Progressive enhancement:** App works without gestures
- **Haptic feedback:** Optional, only if supported
- **Minimal dependencies:** Pure React, no gesture libraries

---

**Next Phase:** Phase 5 - Performance Optimization
```
