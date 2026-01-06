# 📱 Mobile UX Improvements - Ticket System

**Version:** 1.0.0  
**Date:** December 26, 2025  
**Priority:** 🔴 HIGH - Quick Wins  
**Estimated Effort:** 5-7 ngày

---

## 🎯 Mục Tiêu

Tối ưu hóa trải nghiệm mobile với các nguyên tắc:

- **Touch-First:** Mọi thao tác dễ dàng với một tay
- **Progressive Disclosure:** Hiển thị thông tin quan trọng trước
- **Gesture-Driven:** Swipe, pull-to-refresh cho tốc độ
- **Context-Aware:** UI thay đổi theo vai trò và trạng thái

---

## 📋 Danh Sách Cải Tiến

### 1. Smart Progress Indicator với SLA Tracking

### 2. Touch-Optimized Action Buttons (48dp+)

### 3. Bottom Sheet Dialogs

### 4. Swipe Gestures cho Quick Actions

### 5. Pull-to-Refresh

### 6. Sticky Action Bar

### 7. Compact Timeline View

### 8. Quick Actions Sidebar (Tablet/Desktop)

---

## 1️⃣ Smart Progress Indicator với SLA Tracking

### Vấn Đề Hiện Tại

- Người dùng không biết yêu cầu đang ở bước nào
- Không thấy ai đang hold ticket
- Không có cảnh báo deadline sắp đến

### Giải Pháp

**Visual Design:**

```
┌─────────────────────────────────────────────────────────┐
│  YC #123: Sửa máy in tầng 3                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────┐    ┌───────┐    ┌───────┐    ┌───────┐    │
│  │  Mới  │───▶│ Đang  │───▶│Hoàn   │───▶│ Đóng  │    │
│  │       │    │  xử lý│    │thành  │    │       │    │
│  └───────┘    └───●───┘    └───────┘    └───────┘    │
│                   ▲                                     │
│                   │                                     │
│              [Bạn đang ở đây]                          │
│                                                         │
│  👤 Chờ: Nguyễn Văn A (Người xử lý)                    │
│  ⏰ Deadline: 16:00 hôm nay (còn 2 giờ)                │
│  ⚠️ [Nguy cơ trễ hạn - 85% thời gian đã qua]           │
│                                                         │
│  📊 Thống kê: 80% yêu cầu tương tự hoàn thành trong 4h │
└─────────────────────────────────────────────────────────┘
```

### Implementation

**Component: `YeuCauProgressIndicator.jsx`**

```jsx
import React from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Chip,
  LinearProgress,
  Alert,
  Avatar,
  Stack,
} from "@mui/material";
import {
  AccessTime as ClockIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { TRANG_THAI, TRANG_THAI_LABELS } from "../yeuCau.constants";

const STEPS = [
  { value: TRANG_THAI.MOI, label: "Mới" },
  { value: TRANG_THAI.DANG_XU_LY, label: "Đang xử lý" },
  { value: TRANG_THAI.DA_HOAN_THANH, label: "Hoàn thành" },
  { value: TRANG_THAI.DA_DONG, label: "Đã đóng" },
];

function calculateSLA(yeuCau) {
  if (!yeuCau.ThoiGianHen) return null;

  const now = dayjs();
  const deadline = dayjs(yeuCau.ThoiGianHen);
  const created = dayjs(yeuCau.createdAt);

  const totalTime = deadline.diff(created, "minute");
  const elapsed = now.diff(created, "minute");
  const remaining = deadline.diff(now, "minute");

  const percentUsed = (elapsed / totalTime) * 100;

  return {
    deadline,
    remaining,
    percentUsed,
    isOverdue: remaining < 0,
    isNearDeadline: remaining > 0 && remaining < 120, // 2 hours
    remainingText:
      remaining > 0
        ? `còn ${Math.floor(remaining / 60)}h ${remaining % 60}p`
        : `quá hạn ${Math.abs(Math.floor(remaining / 60))}h`,
  };
}

function getWaitingPerson(yeuCau) {
  const { TrangThai, NguoiXuLyID, NguoiDuocDieuPhoiID, NguoiYeuCauID } = yeuCau;

  if (TrangThai === TRANG_THAI.MOI) {
    if (NguoiDuocDieuPhoiID) {
      return {
        person: NguoiDuocDieuPhoiID,
        role: "Người được điều phối",
        action: "tiếp nhận",
      };
    }
    return {
      person: null,
      role: "Điều phối viên",
      action: "phân công",
    };
  }

  if (TrangThai === TRANG_THAI.DANG_XU_LY) {
    return {
      person: NguoiXuLyID,
      role: "Người xử lý",
      action: "hoàn thành",
    };
  }

  if (TrangThai === TRANG_THAI.DA_HOAN_THANH) {
    return {
      person: NguoiYeuCauID,
      role: "Người gửi",
      action: "đánh giá",
    };
  }

  return null;
}

export default function YeuCauProgressIndicator({ yeuCau, compact = false }) {
  const activeStep = STEPS.findIndex((s) => s.value === yeuCau.TrangThai);
  const sla = calculateSLA(yeuCau);
  const waiting = getWaitingPerson(yeuCau);

  if (compact) {
    // Mobile compact view
    return (
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Chip
            label={TRANG_THAI_LABELS[yeuCau.TrangThai]}
            size="small"
            color={
              yeuCau.TrangThai === TRANG_THAI.DA_DONG
                ? "default"
                : yeuCau.TrangThai === TRANG_THAI.DANG_XU_LY
                ? "warning"
                : "info"
            }
          />
          {sla && (
            <Chip
              icon={sla.isOverdue ? <WarningIcon /> : <ClockIcon />}
              label={sla.remainingText}
              size="small"
              color={
                sla.isOverdue
                  ? "error"
                  : sla.isNearDeadline
                  ? "warning"
                  : "default"
              }
            />
          )}
        </Stack>

        {sla && (
          <Box sx={{ mb: 1 }}>
            <LinearProgress
              variant="determinate"
              value={Math.min(sla.percentUsed, 100)}
              color={
                sla.isOverdue
                  ? "error"
                  : sla.percentUsed > 85
                  ? "warning"
                  : "primary"
              }
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        )}

        {waiting && waiting.person && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar
              src={waiting.person.Avatar}
              sx={{ width: 24, height: 24 }}
            />
            <Typography variant="caption" color="text.secondary">
              Chờ: {waiting.person.HoTen} ({waiting.role})
            </Typography>
          </Stack>
        )}
      </Box>
    );
  }

  // Desktop full view
  return (
    <Box sx={{ mb: 3 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {STEPS.map((step) => (
          <Step key={step.value}>
            <StepLabel>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {sla && (
        <Box sx={{ mt: 2 }}>
          {sla.isOverdue && (
            <Alert severity="error" icon={<WarningIcon />}>
              <strong>Quá hạn {sla.remainingText}</strong> - Cần xử lý ngay!
            </Alert>
          )}

          {!sla.isOverdue && sla.isNearDeadline && (
            <Alert severity="warning" icon={<ClockIcon />}>
              <strong>Sắp đến hạn</strong> - {sla.remainingText} (
              {Math.round(sla.percentUsed)}% thời gian đã qua)
            </Alert>
          )}

          {!sla.isOverdue && !sla.isNearDeadline && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Deadline: {sla.deadline.format("DD/MM/YYYY HH:mm")} (
                {sla.remainingText})
              </Typography>
              <LinearProgress
                variant="determinate"
                value={sla.percentUsed}
                color="primary"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          )}
        </Box>
      )}

      {waiting && (
        <Box sx={{ mt: 2, p: 2, bgcolor: "action.hover", borderRadius: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <PersonIcon color="action" />
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {waiting.person
                  ? `Chờ ${waiting.person.HoTen} (${waiting.role})`
                  : `Chờ ${waiting.role}`}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Cần: {waiting.action}
              </Typography>
            </Box>
          </Stack>
        </Box>
      )}
    </Box>
  );
}
```

**Usage:**

```jsx
// In YeuCauDetailPage.js
import YeuCauProgressIndicator from './components/YeuCauProgressIndicator';

// Desktop view
<YeuCauProgressIndicator yeuCau={yeuCau} />

// Mobile compact view
<YeuCauProgressIndicator yeuCau={yeuCau} compact />
```

### Breakpoint Rules

```jsx
const isMobile = useMediaQuery(theme.breakpoints.down("md"));

<YeuCauProgressIndicator yeuCau={yeuCau} compact={isMobile} />;
```

---

## 2️⃣ Touch-Optimized Action Buttons

### Vấn Đề Hiện Tại

- Buttons nhỏ (32px height) → khó bấm bằng ngón tay
- Khoảng cách giữa buttons < 8dp → bấm nhầm
- Icon buttons không có label → không rõ chức năng

### Giải Pháp

**Touch Target Guidelines:**

```
┌────────────────────────────────────────────┐
│  Minimum Touch Target: 48x48 dp            │
├────────────────────────────────────────────┤
│                                            │
│  ┌──────────────────────────┐             │
│  │  [✓] Tiếp nhận          │ 56dp height │
│  └──────────────────────────┘             │
│         ↕ 8dp spacing                      │
│  ┌──────────────────────────┐             │
│  │  [✗] Từ chối            │ 56dp height │
│  └──────────────────────────┘             │
│                                            │
│  Thumb zone (bottom 1/3 screen):          │
│  ┌────────────────────────────────────┐   │
│  │  Most important actions here       │   │
│  └────────────────────────────────────┘   │
└────────────────────────────────────────────┘
```

**Component: Enhanced `YeuCauActionButtons.jsx`**

```jsx
import React from "react";
import {
  Button,
  IconButton,
  Stack,
  useMediaQuery,
  useTheme,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Tooltip,
} from "@mui/material";
import { HANH_DONG, ACTION_CONFIG } from "../yeuCau.constants";

export default function YeuCauActionButtons({
  availableActions = [],
  onActionClick,
  loading = false,
  orientation = "horizontal", // 'horizontal' | 'vertical' | 'fab'
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Mobile: Use size="large" for better touch targets
  const buttonSize = isMobile ? "large" : "medium";

  // Primary actions (show directly)
  const primaryActions = availableActions.filter(
    (action) => ACTION_CONFIG[action]?.primary
  );

  // Secondary actions (show in menu)
  const secondaryActions = availableActions.filter(
    (action) => !ACTION_CONFIG[action]?.primary
  );

  // FAB mode for mobile (sticky bottom)
  if (orientation === "fab" && isMobile) {
    return (
      <SpeedDial
        ariaLabel="Thao tác"
        sx={{
          position: "fixed",
          bottom: 80, // Above bottom nav if exists
          right: 16,
          "& .MuiFab-root": {
            width: 56,
            height: 56, // 56dp = comfortable for thumb
          },
        }}
        icon={<SpeedDialIcon />}
      >
        {availableActions.map((action) => {
          const config = ACTION_CONFIG[action];
          return (
            <SpeedDialAction
              key={action}
              icon={config.icon}
              tooltipTitle={config.label}
              onClick={() => onActionClick(action)}
              FabProps={{
                sx: {
                  minWidth: 56,
                  minHeight: 56, // Touch target size
                },
              }}
            />
          );
        })}
      </SpeedDial>
    );
  }

  // Vertical stack for mobile
  if (orientation === "vertical" || isMobile) {
    return (
      <Stack spacing={1.5}>
        {" "}
        {/* 12dp spacing = 1.5 * 8dp */}
        {primaryActions.map((action) => {
          const config = ACTION_CONFIG[action];
          return (
            <Button
              key={action}
              variant={config.variant}
              color={config.color}
              size={buttonSize}
              fullWidth
              startIcon={config.icon}
              onClick={() => onActionClick(action)}
              disabled={loading}
              sx={{
                minHeight: 48, // WCAG minimum
                justifyContent: "flex-start",
                px: 3, // Extra padding for comfortable tap
                fontSize: isMobile ? "1rem" : "0.875rem",
              }}
            >
              {config.label}
            </Button>
          );
        })}
        {secondaryActions.length > 0 && (
          <Button
            variant="outlined"
            size={buttonSize}
            fullWidth
            onClick={() => {
              /* Open menu */
            }}
            sx={{ minHeight: 48 }}
          >
            Thêm thao tác ({secondaryActions.length})
          </Button>
        )}
      </Stack>
    );
  }

  // Horizontal for desktop
  return (
    <Stack direction="row" spacing={2}>
      {availableActions.map((action) => {
        const config = ACTION_CONFIG[action];
        return (
          <Button
            key={action}
            variant={config.variant}
            color={config.color}
            size={buttonSize}
            startIcon={config.icon}
            onClick={() => onActionClick(action)}
            disabled={loading}
          >
            {config.label}
          </Button>
        );
      })}
    </Stack>
  );
}
```

**CSS for Ripple Effect:**

```jsx
// Enhance touch feedback
<Button
  sx={{
    "&:active": {
      transform: "scale(0.98)", // Subtle press effect
    },
    "& .MuiTouchRipple-root": {
      color: "primary.main",
    },
  }}
>
  Tiếp nhận
</Button>
```

---

## 3️⃣ Bottom Sheet Dialogs

### Vấn Đề Hiện Tại

- Dialogs ở giữa màn hình → khó với điện thoại to
- Dismiss bằng backdrop click → dễ nhầm
- Không thể xem nội dung bên dưới khi điền form

### Giải Pháp

**Visual Design:**

```
Mobile:
┌────────────────────────┐
│  Content behind        │ ← Dimmed but visible
│  (previous page)       │
│                        │
│  ╔════════════════════╗│
│  ║ Dialog Title       ║│ ← Swipe down to dismiss
│  ║ ────────────────── ║│
│  ║                    ║│
│  ║ Form content...    ║│
│  ║                    ║│
│  ║ [Button] [Button]  ║│
│  ╚════════════════════╝│
└────────────────────────┘
```

**Component: `BottomSheetDialog.jsx`**

```jsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useMediaQuery,
  useTheme,
  Slide,
  Box,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function BottomSheetDialog({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = "sm",
  fullScreen = false,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (!isMobile) {
    // Desktop: Regular dialog
    return (
      <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
        <DialogTitle>
          {title}
          <IconButton
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>{children}</DialogContent>
        {actions && <DialogActions>{actions}</DialogActions>}
      </Dialog>
    );
  }

  // Mobile: Bottom sheet
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      TransitionComponent={Transition}
      sx={{
        "& .MuiDialog-paper": {
          position: "fixed",
          bottom: 0,
          m: 0,
          borderRadius: "16px 16px 0 0",
          maxHeight: "90vh",
          width: "100%",
        },
        "& .MuiDialogContent-root": {
          overflowY: "auto",
          WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
        },
      }}
      // Swipe to dismiss
      PaperProps={{
        sx: {
          touchAction: "pan-y", // Allow vertical scroll
        },
      }}
    >
      {/* Drag handle */}
      <Box
        sx={{
          width: 40,
          height: 4,
          bgcolor: "action.disabled",
          borderRadius: 2,
          mx: "auto",
          mt: 1,
          mb: 1,
        }}
      />

      <DialogTitle sx={{ pb: 1 }}>
        {title}
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            minWidth: 48,
            minHeight: 48, // Touch target
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>{children}</DialogContent>

      {actions && (
        <DialogActions sx={{ px: 3, py: 2 }}>{actions}</DialogActions>
      )}
    </Dialog>
  );
}
```

**Usage:**

```jsx
// Replace Dialog with BottomSheetDialog
import BottomSheetDialog from "./BottomSheetDialog";

<BottomSheetDialog
  open={openTiepNhanDialog}
  onClose={() => setOpenTiepNhanDialog(false)}
  title="Tiếp nhận yêu cầu"
  actions={
    <>
      <Button onClick={handleClose} size="large" fullWidth>
        Hủy
      </Button>
      <Button onClick={handleSubmit} variant="contained" size="large" fullWidth>
        Xác nhận
      </Button>
    </>
  }
>
  <TiepNhanForm />
</BottomSheetDialog>;
```

---

## 4️⃣ Swipe Gestures cho Quick Actions

### Giải Pháp

**Visual:**

```
Swipe Right → Tiếp nhận:
┌────────────────────────────────────────┐
│ ◄◄◄ [✓] YC #123: Sửa máy in           │ ← Swipe right reveals
└────────────────────────────────────────┘

Swipe Left → Từ chối:
┌────────────────────────────────────────┐
│        YC #123: Sửa máy in       [✗] ►►► │ ← Swipe left reveals
└────────────────────────────────────────┘
```

**Component: `SwipeableYeuCauCard.jsx`**

```jsx
import React, { useRef, useState } from "react";
import { Card, CardContent, Box, IconButton } from "@mui/material";
import { Check as AcceptIcon, Close as RejectIcon } from "@mui/icons-material";

export default function SwipeableYeuCauCard({
  yeuCau,
  onSwipeAction,
  leftAction = { icon: <AcceptIcon />, color: "success", action: "TIEP_NHAN" },
  rightAction = { icon: <RejectIcon />, color: "error", action: "TU_CHOI" },
}) {
  const cardRef = useRef(null);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const SWIPE_THRESHOLD = 100; // pixels

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientX - startX;
    setCurrentX(diff);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    if (Math.abs(currentX) > SWIPE_THRESHOLD) {
      if (currentX > 0 && leftAction) {
        onSwipeAction(leftAction.action);
      } else if (currentX < 0 && rightAction) {
        onSwipeAction(rightAction.action);
      }
    }

    setCurrentX(0);
  };

  return (
    <Box sx={{ position: "relative", overflow: "hidden" }}>
      {/* Background actions */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
        }}
      >
        {leftAction && (
          <IconButton
            sx={{
              bgcolor: `${leftAction.color}.main`,
              color: "white",
              opacity:
                currentX > 0 ? Math.min(currentX / SWIPE_THRESHOLD, 1) : 0,
              "&:hover": { bgcolor: `${leftAction.color}.dark` },
            }}
          >
            {leftAction.icon}
          </IconButton>
        )}

        {rightAction && (
          <IconButton
            sx={{
              bgcolor: `${rightAction.color}.main`,
              color: "white",
              opacity:
                currentX < 0
                  ? Math.min(Math.abs(currentX) / SWIPE_THRESHOLD, 1)
                  : 0,
              "&:hover": { bgcolor: `${rightAction.color}.dark` },
            }}
          >
            {rightAction.icon}
          </IconButton>
        )}
      </Box>

      {/* Card */}
      <Card
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        sx={{
          position: "relative",
          transform: `translateX(${currentX}px)`,
          transition: isDragging ? "none" : "transform 0.3s ease-out",
          touchAction: "pan-y", // Allow vertical scroll
        }}
      >
        <CardContent>{/* Your existing YeuCauCard content */}</CardContent>
      </Card>
    </Box>
  );
}
```

---

## 5️⃣ Pull-to-Refresh

**Component: `PullToRefreshWrapper.jsx`**

```jsx
import React, { useState } from "react";
import { Box, CircularProgress } from "@mui/material";

export default function PullToRefreshWrapper({ onRefresh, children }) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);

  const PULL_THRESHOLD = 80; // pixels to trigger refresh

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e) => {
    if (startY === 0) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;

    if (distance > 0 && window.scrollY === 0) {
      e.preventDefault(); // Prevent default pull behavior
      setPullDistance(Math.min(distance, PULL_THRESHOLD * 1.5));
      setIsPulling(distance > PULL_THRESHOLD);
    }
  };

  const handleTouchEnd = async () => {
    if (isPulling) {
      setPullDistance(PULL_THRESHOLD);
      await onRefresh();
    }

    setStartY(0);
    setPullDistance(0);
    setIsPulling(false);
  };

  return (
    <Box
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      sx={{ position: "relative" }}
    >
      {/* Pull indicator */}
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
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? "none" : "transform 0.3s",
          opacity: Math.min(pullDistance / PULL_THRESHOLD, 1),
        }}
      >
        <CircularProgress
          size={32}
          variant={isPulling ? "indeterminate" : "determinate"}
          value={(pullDistance / PULL_THRESHOLD) * 100}
        />
      </Box>

      {children}
    </Box>
  );
}
```

**Usage:**

```jsx
<PullToRefreshWrapper onRefresh={handleRefresh}>
  <YeuCauList items={yeuCauList} />
</PullToRefreshWrapper>
```

---

## 6️⃣ Sticky Action Bar (Mobile)

```jsx
// In YeuCauDetailPage.js
<Box
  sx={{
    position: "sticky",
    bottom: 0,
    left: 0,
    right: 0,
    bgcolor: "background.paper",
    borderTop: 1,
    borderColor: "divider",
    p: 2,
    zIndex: 1000,
    display: { xs: "block", md: "none" }, // Mobile only
  }}
>
  <YeuCauActionButtons
    availableActions={availableActions}
    onActionClick={handleAction}
    orientation="vertical"
  />
</Box>
```

---

## 📊 Success Metrics

**Quantitative:**

- Touch target compliance: 100% buttons >= 48dp
- Tap error rate: < 5% (reduced from ~15%)
- Action completion time: -30% (mobile)
- User satisfaction (mobile): +1.5 points (3.8 → 5.3/5)

**Qualitative:**

- User feedback: "Dễ bấm hơn nhiều"
- Support tickets about UI: -60%

---

## ✅ Implementation Checklist

**Phase 1: Smart Progress Indicator (Day 1-2)**

- [ ] Create `YeuCauProgressIndicator.jsx` component
- [ ] Implement SLA calculation logic
- [ ] Add "waiting person" detection
- [ ] Test with various states
- [ ] Integrate into detail page

**Phase 2: Touch Buttons (Day 2-3)**

- [ ] Update `YeuCauActionButtons.jsx` with size="large"
- [ ] Add minHeight: 48dp constraint
- [ ] Implement vertical orientation for mobile
- [ ] Add touch ripple effects
- [ ] Test on real mobile devices

**Phase 3: Bottom Sheets (Day 3-4)**

- [ ] Create `BottomSheetDialog.jsx` component
- [ ] Add swipe-to-dismiss gesture
- [ ] Replace all Dialog usages
- [ ] Test transitions and animations

**Phase 4: Swipe & Pull (Day 4-5)**

- [ ] Create `SwipeableYeuCauCard.jsx`
- [ ] Implement left/right swipe detection
- [ ] Create `PullToRefreshWrapper.jsx`
- [ ] Test touch conflicts with scroll
- [ ] Add haptic feedback (optional)

**Phase 5: Polish (Day 6-7)**

- [ ] Add sticky action bar
- [ ] Optimize animations for 60fps
- [ ] Accessibility testing
- [ ] Cross-browser testing
- [ ] Documentation

---

**Next:** [02_PWA_FCM_IMPLEMENTATION.md](./02_PWA_FCM_IMPLEMENTATION.md)
