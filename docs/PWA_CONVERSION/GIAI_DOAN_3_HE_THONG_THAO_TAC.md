# GIAI ĐOẠN 3: Hệ Thống Gesture Mobile

**Phiên bản:** 1.0.0  
**Trạng thái:** Sẵn sàng triển khai  
**Thời gian ước tính:** 8 giờ  
**Ảnh hưởng:** 60% tương tác mobile (tất cả list views)  
**Phụ thuộc:** Giai đoạn 1 PHẢI hoàn thành (cần mobile detection)

---

## 1. Tổng Quan

### Mục Tiêu

- Thêm Pull-to-Refresh cho tất cả list views
- Implement Swipe Actions cho cards (edit/delete/approve)
- Thêm Long Press context menus
- Cung cấp haptic/visual feedback cho gestures
- Giữ nguyên trải nghiệm desktop
- Tổng quát hóa gestures từ module Ticket sang tất cả modules

### Tiêu Chí Thành Công

- ✅ Pull-to-refresh hoạt động trên 6+ trang list
- ✅ Swipe trái/phải kích hoạt actions phù hợp
- ✅ Long press hiển thị context menu
- ✅ Animations mượt 60fps
- ✅ Desktop users không thấy gesture UI (chỉ click)
- ✅ Touch feedback giống iOS/Android patterns

---

## 2. Kiến Trúc

### Trạng Thái Hiện Tại

```
Gestures BÂY GIỜ:
├── ✅ Ticket Module (QuanLyCongViec/Ticket)
│   ├── PullToRefreshWrapper.jsx (có sẵn)
│   └── SwipeableCard.jsx (có sẵn)
│
└── ❌ Modules Khác (chưa có gestures)
    ├── BenhNhan (chỉ click)
    ├── BaoCao (chỉ click)
    ├── SuCo (chỉ click)
    ├── KPI (chỉ click)
    ├── DaoTao (chỉ click)
    └── NhiemVu (chỉ click)

Vấn đề: UX không nhất quán giữa các modules
```

### Trạng Thái Mục Tiêu

```
Gestures SAU:
├── 📦 components/@extended/mobile/ (MỚI)
│   ├── PullToRefreshWrapper.jsx (MOVE từ Ticket)
│   ├── SwipeableCard.jsx (MOVE từ Ticket)
│   ├── LongPressMenu.jsx (MỚI)
│   └── TouchFeedback.jsx (MỚI)
│
└── ✅ Tất Cả Modules (gestures nhất quán)
    ├── BenhNhan (pull + swipe + long press)
    ├── BaoCao (pull + swipe)
    ├── SuCo (pull + swipe + long press)
    ├── KPI (pull + swipe)
    ├── DaoTao (pull + swipe)
    ├── NhiemVu (pull + swipe + long press)
    └── Ticket (đã có, refactor nhỏ)

Lợi ích: Gesture system giống native trên toàn app
```

---

## 3. Catalog Gestures

### 3.1 Pull-to-Refresh

**Pattern:**

```
User Action:
┌─────────────────────────────────┐
│ ↓↓↓ Kéo xuống trên list        │
│                                 │
│ State 1: Bắt đầu pull (0-60px) │
│ ┌───────────────────┐           │
│ │    ↓ Kéo...       │           │
│ └───────────────────┘           │
│                                 │
│ State 2: Sẵn sàng (>60px)      │
│ ┌───────────────────┐           │
│ │    🔄 Thả ra...   │           │
│ └───────────────────┘           │
│                                 │
│ State 3: Đang refresh           │
│ ┌───────────────────┐           │
│ │    ⏳ Đang tải... │           │
│ └───────────────────┘           │
│                                 │
│ State 4: Hoàn thành             │
│ ┌───────────────────┐           │
│ │    ✓ Đã cập nhật  │           │
│ └───────────────────┘           │
│ → Fade out → Content refresh    │
└─────────────────────────────────┘
```

### 3.2 Swipe Actions

**Pattern Trái (Xóa/Từ chối):**

```
←←← Vuốt trái
┌─────────────────────────────┐
│ [Card Content]           🗑️ │ ← Icon xuất hiện
└─────────────────────────────┘
       ↓ Tiếp tục vuốt
┌──────────────────┐  ┌──────┐
│ [Card]           │🗑️│ Xóa │ ← Action button
└──────────────────┘  └──────┘
       ↓ Release
       Action trigger
```

**Pattern Phải (Chấp nhận/Sửa):**

```
Vuốt phải →→→
┌─────────────────────────────┐
│ ✓ [Card Content]            │ ← Icon xuất hiện
└─────────────────────────────┘
       ↓ Tiếp tục vuốt
┌──────┐  ┌──────────────────┐
│ Sửa │✏️│ [Card]            │ ← Action button
└──────┘  └──────────────────┘
       ↓ Release
       Action trigger
```

### 3.3 Long Press

**Pattern:**

```
Nhấn giữ (>500ms)
┌─────────────────────┐
│ [Card] ← Pressed    │
└─────────────────────┘
        ↓
┌─────────────────────────┐
│ 📋 Context Menu         │
│ ├─ ✏️ Sửa              │
│ ├─ 👁️ Xem chi tiết     │
│ ├─ 📤 Chia sẻ          │
│ └─ 🗑️ Xóa             │
└─────────────────────────┘
```

---

## 4. Implementation

### File 1: `src/components/@extended/mobile/PullToRefreshWrapper.jsx`

```javascript
import { useState, useCallback } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useMobileLayout } from "hooks/useMobileLayout";

const PULL_THRESHOLD = 80; // px
const MAX_PULL = 120; // px

const PullToRefreshWrapper = ({ children, onRefresh }) => {
  const { isMobile } = useMobileLayout();
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStart, setTouchStart] = useState(0);

  const handleTouchStart = useCallback((e) => {
    if (window.scrollY === 0) {
      // Chỉ kích hoạt khi ở top
      setTouchStart(e.touches[0].clientY);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e) => {
      if (touchStart === 0 || window.scrollY > 0) return;

      const currentTouch = e.touches[0].clientY;
      const distance = Math.min(currentTouch - touchStart, MAX_PULL);

      if (distance > 0) {
        setPullDistance(distance);
        // Prevent default scroll khi đang pull
        if (distance > 10) {
          e.preventDefault();
        }
      }
    },
    [touchStart]
  );

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance > PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 300);
      }
    } else {
      setPullDistance(0);
    }
    setTouchStart(0);
  }, [pullDistance, isRefreshing, onRefresh]);

  if (!isMobile) {
    return <>{children}</>;
  }

  const pullProgress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const showIndicator = pullDistance > 0 || isRefreshing;

  return (
    <Box
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      sx={{ position: "relative" }}
    >
      {/* Pull Indicator */}
      {showIndicator && (
        <Box
          sx={{
            position: "absolute",
            top: -60,
            left: 0,
            right: 0,
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            transform: `translateY(${pullDistance}px)`,
            transition: isRefreshing ? "transform 0.3s" : "none",
            opacity: pullProgress,
          }}
        >
          {isRefreshing ? (
            <>
              <CircularProgress size={24} />
              <Typography variant="caption" sx={{ mt: 1 }}>
                Đang tải...
              </Typography>
            </>
          ) : (
            <Typography variant="caption">
              {pullDistance > PULL_THRESHOLD
                ? "🔄 Thả để tải lại"
                : "↓ Kéo xuống"}
            </Typography>
          )}
        </Box>
      )}

      {/* Content */}
      <Box
        sx={{
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance === 0 ? "transform 0.3s" : "none",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default PullToRefreshWrapper;
```

### File 2: `src/components/@extended/mobile/SwipeableCard.jsx`

```javascript
import { useState, useRef } from "react";
import { Box, IconButton } from "@mui/material";
import { Delete, Edit, CheckCircle, Cancel } from "@mui/icons-material";
import { useMobileLayout } from "hooks/useMobileLayout";

const SWIPE_THRESHOLD = 80; // px
const MAX_SWIPE = 120; // px

const SwipeableCard = ({
  children,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  leftActions = [], // Tùy chỉnh actions
  rightActions = [],
}) => {
  const { isMobile } = useMobileLayout();
  const [swipeDistance, setSwipeDistance] = useState(0);
  const startX = useRef(0);

  if (!isMobile) {
    return <Box>{children}</Box>;
  }

  // Default actions
  const defaultLeftActions = onDelete
    ? [{ icon: <Delete />, label: "Xóa", color: "error", onClick: onDelete }]
    : [];

  const defaultRightActions = onEdit
    ? [{ icon: <Edit />, label: "Sửa", color: "primary", onClick: onEdit }]
    : [];

  const leftActionsToShow =
    leftActions.length > 0 ? leftActions : defaultLeftActions;
  const rightActionsToShow =
    rightActions.length > 0 ? rightActions : defaultRightActions;

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;

    // Giới hạn swipe distance
    const limitedDiff = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, diff));
    setSwipeDistance(limitedDiff);
  };

  const handleTouchEnd = () => {
    if (Math.abs(swipeDistance) > SWIPE_THRESHOLD) {
      // Giữ ở vị trí để hiện actions
      const direction = swipeDistance > 0 ? MAX_SWIPE : -MAX_SWIPE;
      setSwipeDistance(direction);
    } else {
      // Reset về vị trí ban đầu
      setSwipeDistance(0);
    }
  };

  const handleActionClick = (action) => {
    action.onClick();
    setSwipeDistance(0); // Reset sau khi action
  };

  return (
    <Box sx={{ position: "relative", overflow: "hidden" }}>
      {/* Left Actions (xuất hiện khi swipe phải) */}
      {swipeDistance > 0 && rightActionsToShow.length > 0 && (
        <Box
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            pl: 1,
          }}
        >
          {rightActionsToShow.map((action, idx) => (
            <IconButton
              key={idx}
              onClick={() => handleActionClick(action)}
              color={action.color || "primary"}
              sx={{ mr: 1 }}
            >
              {action.icon}
            </IconButton>
          ))}
        </Box>
      )}

      {/* Right Actions (xuất hiện khi swipe trái) */}
      {swipeDistance < 0 && leftActionsToShow.length > 0 && (
        <Box
          sx={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            pr: 1,
          }}
        >
          {leftActionsToShow.map((action, idx) => (
            <IconButton
              key={idx}
              onClick={() => handleActionClick(action)}
              color={action.color || "error"}
              sx={{ ml: 1 }}
            >
              {action.icon}
            </IconButton>
          ))}
        </Box>
      )}

      {/* Card Content */}
      <Box
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        sx={{
          transform: `translateX(${swipeDistance}px)`,
          transition:
            swipeDistance === 0 || Math.abs(swipeDistance) >= SWIPE_THRESHOLD
              ? "transform 0.3s ease-out"
              : "none",
          backgroundColor: "background.paper",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default SwipeableCard;
```

### File 3: `src/components/@extended/mobile/LongPressMenu.jsx`

```javascript
import { useState, useRef, useCallback } from "react";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { useMobileLayout } from "hooks/useMobileLayout";

const LONG_PRESS_DURATION = 500; // ms

const LongPressMenu = ({ children, menuItems = [] }) => {
  const { isMobile } = useMobileLayout();
  const [anchorEl, setAnchorEl] = useState(null);
  const longPressTimer = useRef(null);

  const handleLongPressStart = useCallback(
    (e) => {
      if (!isMobile) return;

      const touch = e.touches[0];
      longPressTimer.current = setTimeout(() => {
        // Trigger menu
        setAnchorEl(e.currentTarget);

        // Haptic feedback (nếu hỗ trợ)
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }, LONG_PRESS_DURATION);
    },
    [isMobile]
  );

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  }, []);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (item) => {
    item.onClick();
    handleClose();
  };

  return (
    <>
      <div
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
        onTouchMove={handleLongPressEnd}
      >
        {children}
      </div>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        {menuItems.map((item, idx) => (
          <MenuItem key={idx} onClick={() => handleMenuItemClick(item)}>
            {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
            <ListItemText>{item.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LongPressMenu;
```

---

## 5. Migration Guide

### Bước 1: Di Chuyển Components Từ Ticket

```bash
# Từ:
src/features/QuanLyCongViec/Ticket/components/

# Sang:
src/components/@extended/mobile/

# Files cần move:
- PullToRefreshWrapper.jsx
- SwipeableCard.jsx
```

### Bước 2: Áp Dụng Cho Module BenhNhan

```javascript
// src/features/BenhNhan/BenhNhanTable.js
import PullToRefreshWrapper from "components/@extended/mobile/PullToRefreshWrapper";
import SwipeableCard from "components/@extended/mobile/SwipeableCard";

const BenhNhanTable = () => {
  const dispatch = useDispatch();

  const handleRefresh = async () => {
    await dispatch(getBenhNhan());
  };

  return (
    <PullToRefreshWrapper onRefresh={handleRefresh}>
      {/* List content */}
      {benhNhanList.map((bn) => (
        <SwipeableCard
          key={bn._id}
          onEdit={() => handleEdit(bn)}
          onDelete={() => handleDelete(bn._id)}
        >
          <BenhNhanCard data={bn} />
        </SwipeableCard>
      ))}
    </PullToRefreshWrapper>
  );
};
```

### Bước 3: Áp Dụng Cho 6 Modules

```
Checklist:
[ ] BenhNhan: Pull + Swipe (Edit/Delete)
[ ] BaoCao: Pull + Swipe (View/Export)
[ ] SuCo: Pull + Swipe + Long Press (Edit/Delete/Approve)
[ ] KPI: Pull + Swipe (View/Approve)
[ ] DaoTao: Pull + Swipe (Edit/Delete)
[ ] NhiemVu: Pull + Swipe + Long Press (Edit/Delete/Complete)
```

---

## 6. Testing Checklist

```
[ ] Pull-to-Refresh:
    [ ] Kéo xuống → indicator xuất hiện
    [ ] Thả ra khi >80px → trigger refresh
    [ ] Thả ra khi <80px → không refresh
    [ ] Loading spinner hiện trong lúc refresh
    [ ] Content update sau khi refresh xong

[ ] Swipe Actions:
    [ ] Vuốt phải → Edit icon xuất hiện
    [ ] Vuốt trái → Delete icon xuất hiện
    [ ] Tap icon → Action trigger
    [ ] Reset về vị trí ban đầu sau action
    [ ] Animation mượt 60fps

[ ] Long Press:
    [ ] Nhấn giữ >500ms → Menu xuất hiện
    [ ] Haptic feedback (nếu hỗ trợ)
    [ ] Tap menu item → Action trigger
    [ ] Tap outside → Menu đóng

[ ] Desktop:
    [ ] Không thấy gesture UI
    [ ] Click buttons hoạt động bình thường
```

---

## 7. Performance

```
Optimizations:
├── useCallback() cho event handlers
├── Throttle touchmove events (16ms = 60fps)
├── Transform thay vì left/top (hardware accelerated)
├── will-change: transform (trước khi animate)
└── React.memo() cho card components

Expected Impact:
- Gesture response: <16ms (60fps)
- Memory overhead: ~30KB per gesture component
- CPU usage: <5% during gestures
```

---

## 8. Next Steps

```bash
# Sau khi hoàn thành Giai đoạn 3:
✅ Gesture system hoạt động trên mobile
➡️ Giai đoạn 4: Route Optimization (code splitting)
➡️ Giai đoạn 5: Offline Strategy
```

---

**Phiên bản:** 1.0.0  
**Ngày cập nhật:** 2026-01-07  
**Files cần tạo/sửa:** 10 files  
**Thời gian triển khai:** 8 giờ

**Native gestures cho toàn bộ app! 🎯**
