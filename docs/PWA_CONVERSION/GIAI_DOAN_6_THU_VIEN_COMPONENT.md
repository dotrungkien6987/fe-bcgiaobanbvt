# GIAI ĐOẠN 6: Thư Viện Component Mobile

**Phiên bản:** 1.0.0  
**Trạng thái:** Sẵn sàng triển khai  
**Thời gian ước tính:** 7 giờ  
**Ảnh hưởng:** 70% interactions (tất cả touch points)  
**Phụ thuộc:** Giai đoạn 1 (cần useMobileLayout hook)

---

## 1. Tổng Quan

### Mục Tiêu

- Tạo thư viện component tối ưu cho mobile
- Enforce touch target size tối thiểu 48x48px
- Responsive typography scale cho mobile
- Dialog/Sheet components với animations native-like
- Hướng dẫn migration từ components desktop
- Đảm bảo accessibility (a11y)

### Tiêu Chí Thành Công

- ✅ Touch targets ≥48px (iOS/Android guidelines)
- ✅ Typography đọc được trên màn nhỏ
- ✅ Dialogs full-screen trên mobile
- ✅ Animations mượt 60fps
- ✅ Components reusable & documented
- ✅ Accessibility scores >90

---

## 2. Design Principles

### Touch Target Guidelines

```
Apple iOS Human Interface Guidelines:
┌──────────────────────────────────────┐
│ Minimum: 44x44 pt (≈48px)           │
│ Recommended: 56x56 px                │
│ Spacing: 8px between targets        │
└──────────────────────────────────────┘

Material Design Guidelines:
┌──────────────────────────────────────┐
│ Minimum: 48x48 dp                    │
│ Recommended: 56x56 dp (buttons)      │
│ Spacing: 8-16dp                      │
└──────────────────────────────────────┘

VẤN ĐỀ HIỆN TẠI:
❌ Desktop buttons: 36px height → quá nhỏ
❌ Icons: 24px → khó tap chính xác
❌ List items: 48px → ổn nhưng chưa đủ padding
```

### Typography Scale

```
Desktop vs Mobile:
┌─────────────────┬──────────┬──────────┐
│ Element         │ Desktop  │ Mobile   │
├─────────────────┼──────────┼──────────┤
│ H1 (Page Title) │ 32px     │ 24px ✅  │
│ H2 (Section)    │ 24px     │ 20px ✅  │
│ Body            │ 16px     │ 16px ✅  │
│ Caption         │ 14px     │ 14px ✅  │
│ Button          │ 14px     │ 16px ✅  │
└─────────────────┴──────────┴──────────┘

Line height: 1.5 → 1.6 (dễ đọc hơn trên mobile)
Letter spacing: Normal → +0.01em (iOS style)
```

---

## 3. Component Library

### 3.1 MobileCard

**Specs:**

```
Desktop Card:
├─ Padding: 16px
├─ Min height: 56px
└─ Border radius: 4px

Mobile Card (MỚI):
├─ Padding: 20px (lớn hơn, dễ đọc)
├─ Min height: 72px (touch target)
├─ Border radius: 12px (modern, iOS-like)
└─ Touch feedback: Ripple + scale
```

**Implementation:**

```javascript
// src/components/@extended/mobile/MobileCard.jsx
import { Card, CardContent, CardActions } from "@mui/material";
import { useMobileLayout } from "hooks/useMobileLayout";

const MobileCard = ({ children, onClick, actions, sx = {}, ...props }) => {
  const { isMobile } = useMobileLayout();

  return (
    <Card
      onClick={onClick}
      sx={{
        // Mobile-specific styles
        ...(isMobile && {
          borderRadius: 3, // 12px
          minHeight: 72,
          "& .MuiCardContent-root": {
            padding: 2.5, // 20px
          },
          // Touch feedback
          transition: "transform 0.1s, box-shadow 0.1s",
          "&:active": {
            transform: onClick ? "scale(0.98)" : "none",
            boxShadow: 2,
          },
        }),
        // Desktop styles
        ...(!isMobile && {
          borderRadius: 1,
          minHeight: 56,
        }),
        ...sx,
      }}
      {...props}
    >
      <CardContent>{children}</CardContent>
      {actions && <CardActions>{actions}</CardActions>}
    </Card>
  );
};

export default MobileCard;
```

### 3.2 TouchButton

**Specs:**

```
Desktop Button:
├─ Height: 36px ❌ Quá nhỏ
├─ Padding: 8px 16px
└─ Min width: 64px

Mobile TouchButton (MỚI):
├─ Height: 48px ✅ Touch-friendly
├─ Padding: 12px 24px (lớn hơn)
├─ Min width: 88px (iOS guideline)
└─ Haptic feedback (nếu hỗ trợ)
```

**Implementation:**

```javascript
// src/components/@extended/mobile/TouchButton.jsx
import { Button } from "@mui/material";
import { useMobileLayout } from "hooks/useMobileLayout";

const TouchButton = ({
  children,
  onClick,
  haptic = true,
  sx = {},
  ...props
}) => {
  const { isMobile } = useMobileLayout();

  const handleClick = (e) => {
    // Haptic feedback
    if (isMobile && haptic && navigator.vibrate) {
      navigator.vibrate(10); // 10ms subtle vibration
    }
    onClick?.(e);
  };

  return (
    <Button
      onClick={handleClick}
      sx={{
        ...(isMobile && {
          minHeight: 48, // Touch target
          minWidth: 88,
          px: 3, // 24px
          fontSize: "1rem", // 16px
          fontWeight: 500,
        }),
        ...(!isMobile && {
          minHeight: 36,
          px: 2,
        }),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default TouchButton;
```

### 3.3 MobileDialog

**Pattern:**

```
Desktop Dialog:
┌──────────────────────┐
│                      │
│  ┌──────────────┐   │
│  │   Dialog     │   │ ← Centered, max-width 600px
│  │   Content    │   │
│  └──────────────┘   │
│                      │
└──────────────────────┘

Mobile Dialog (Bottom Sheet):
┌──────────────────────┐
│                      │
│                      │ ← Full screen
│  ╔══════════════╗   │
│  ║   Dialog     ║   │ ← Slide up from bottom
│  ║   Content    ║   │
│  ╚══════════════╝   │
└──────────────────────┘
```

**Implementation:**

```javascript
// src/components/@extended/mobile/MobileDialog.jsx
import {
  Dialog,
  Slide,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { forwardRef } from "react";
import { useMobileLayout } from "hooks/useMobileLayout";

const SlideTransition = forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));

const MobileDialog = ({
  open,
  onClose,
  title,
  children,
  actions,
  ...props
}) => {
  const { isMobile } = useMobileLayout();

  if (isMobile) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen
        TransitionComponent={SlideTransition}
        {...props}
      >
        {/* Mobile App Bar */}
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={onClose}
              aria-label="close"
              sx={{ minWidth: 48, minHeight: 48 }} // Touch target
            >
              <Close />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6">
              {title}
            </Typography>
            {actions}
          </Toolbar>
        </AppBar>

        {/* Content */}
        <div style={{ padding: 16 }}>{children}</div>
      </Dialog>
    );
  }

  // Desktop mode - regular dialog
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth {...props}>
      {children}
    </Dialog>
  );
};

export default MobileDialog;
```

### 3.4 TouchIconButton

```javascript
// src/components/@extended/mobile/TouchIconButton.jsx
import { IconButton } from "@mui/material";
import { useMobileLayout } from "hooks/useMobileLayout";

const TouchIconButton = ({ sx = {}, ...props }) => {
  const { isMobile } = useMobileLayout();

  return (
    <IconButton
      sx={{
        ...(isMobile && {
          width: 48, // Touch target
          height: 48,
          "& .MuiSvgIcon-root": {
            fontSize: "1.5rem", // 24px icon
          },
        }),
        ...sx,
      }}
      {...props}
    />
  );
};

export default TouchIconButton;
```

### 3.5 MobileList

```javascript
// src/components/@extended/mobile/MobileList.jsx
import { List, ListItem, ListItemButton } from "@mui/material";
import { useMobileLayout } from "hooks/useMobileLayout";

export const MobileList = ({ children, sx = {}, ...props }) => {
  const { isMobile } = useMobileLayout();

  return (
    <List
      sx={{
        ...(isMobile && {
          "& .MuiListItem-root": {
            minHeight: 56, // Touch target
            px: 2.5, // 20px
          },
        }),
        ...sx,
      }}
      {...props}
    >
      {children}
    </List>
  );
};

export const MobileListItem = ({ children, onClick, sx = {}, ...props }) => {
  const { isMobile } = useMobileLayout();

  const Component = onClick ? ListItemButton : ListItem;

  return (
    <Component
      onClick={onClick}
      sx={{
        ...(isMobile && {
          minHeight: 56,
          // Touch feedback
          "&:active": {
            backgroundColor: "action.selected",
          },
        }),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Component>
  );
};
```

---

## 4. Responsive Typography

### File: `src/theme/typography.js` (Cập nhật)

```javascript
const typography = {
  fontFamily: [
    "Roboto",
    "-apple-system",
    "BlinkMacSystemFont",
    "sans-serif",
  ].join(","),

  // Responsive scale
  h1: {
    fontSize: "2rem", // Desktop: 32px
    "@media (max-width:768px)": {
      fontSize: "1.5rem", // Mobile: 24px
    },
    fontWeight: 600,
    lineHeight: 1.3,
  },

  h2: {
    fontSize: "1.5rem", // Desktop: 24px
    "@media (max-width:768px)": {
      fontSize: "1.25rem", // Mobile: 20px
    },
    fontWeight: 600,
    lineHeight: 1.4,
  },

  h3: {
    fontSize: "1.25rem", // 20px
    fontWeight: 600,
    lineHeight: 1.4,
  },

  body1: {
    fontSize: "1rem", // 16px (giữ nguyên)
    lineHeight: 1.6, // Mobile-friendly
    "@media (max-width:768px)": {
      letterSpacing: "0.01em", // iOS-style
    },
  },

  body2: {
    fontSize: "0.875rem", // 14px
    lineHeight: 1.6,
  },

  button: {
    fontSize: "0.875rem", // Desktop: 14px
    "@media (max-width:768px)": {
      fontSize: "1rem", // Mobile: 16px (dễ đọc)
    },
    fontWeight: 500,
    textTransform: "none", // Không uppercase (modern)
  },

  caption: {
    fontSize: "0.75rem", // 12px
    lineHeight: 1.5,
  },
};

export default typography;
```

---

## 5. Migration Guide

### Bước 1: Replace Components Dần Dần

```javascript
// TRƯỚC (Desktop-only):
import { Card, Button, Dialog } from "@mui/material";

<Card>
  <CardContent>...</CardContent>
</Card>

<Button onClick={handleClick}>Submit</Button>

<Dialog open={open}>...</Dialog>

// SAU (Mobile-aware):
import MobileCard from "components/@extended/mobile/MobileCard";
import TouchButton from "components/@extended/mobile/TouchButton";
import MobileDialog from "components/@extended/mobile/MobileDialog";

<MobileCard onClick={handleCardClick}>
  {children}
</MobileCard>

<TouchButton onClick={handleClick} haptic>
  Submit
</TouchButton>

<MobileDialog open={open} title="Form" onClose={handleClose}>
  {children}
</MobileDialog>
```

### Bước 2: Audit Touch Targets

```bash
# Tool: Accessibility Inspector (Chrome DevTools)
# Hoặc: Lighthouse audit → "Tap targets are not sized appropriately"

# Checklist:
[ ] Buttons ≥48px height
[ ] Icons trong IconButton ≥48px clickable area
[ ] List items ≥56px height
[ ] Spacing giữa buttons ≥8px
[ ] Form inputs ≥48px height
```

### Bước 3: Test Với Ngón Tay Thật

```
Test Matrix:
┌─────────────────┬───────────┬───────────┐
│ Device          │ Screen    │ Thumb Zone│
├─────────────────┼───────────┼───────────┤
│ iPhone SE       │ 4.7"      │ Nhỏ       │
│ iPhone 12 Pro   │ 6.1"      │ Trung     │
│ iPhone 14 Pro   │ 6.7"      │ Lớn       │
│ Samsung S21     │ 6.2"      │ Trung     │
│ iPad Mini       │ 8.3"      │ N/A       │
└─────────────────┴───────────┴───────────┘

Kiểm tra:
✓ Tap được chính xác không miss
✓ Không tap nhầm targets gần nhau
✓ Cảm giác "responsive" (feedback ngay)
```

---

## 6. Component Catalog

### File: `src/components/@extended/mobile/index.js`

```javascript
// Centralized exports
export { default as MobileCard } from "./MobileCard";
export { default as TouchButton } from "./TouchButton";
export { default as TouchIconButton } from "./TouchIconButton";
export { default as MobileDialog } from "./MobileDialog";
export { MobileList, MobileListItem } from "./MobileList";
export { default as PullToRefreshWrapper } from "./PullToRefreshWrapper";
export { default as SwipeableCard } from "./SwipeableCard";
export { default as LongPressMenu } from "./LongPressMenu";
export { PageSkeleton, CardListSkeleton, FormSkeleton } from "./Skeletons";
```

### Usage Example

```javascript
// src/features/BenhNhan/BenhNhanList.js
import {
  MobileCard,
  TouchButton,
  PullToRefreshWrapper,
  SwipeableCard,
} from "components/@extended/mobile";

const BenhNhanList = () => {
  const { benhNhanList } = useSelector((state) => state.benhnhan);

  return (
    <PullToRefreshWrapper onRefresh={handleRefresh}>
      {benhNhanList.map((bn) => (
        <SwipeableCard
          key={bn._id}
          onEdit={() => handleEdit(bn)}
          onDelete={() => handleDelete(bn._id)}
        >
          <MobileCard onClick={() => handleView(bn)}>
            <Typography variant="h6">{bn.HoTen}</Typography>
            <Typography variant="body2" color="text.secondary">
              {bn.MaBN}
            </Typography>
          </MobileCard>
        </SwipeableCard>
      ))}

      <TouchButton
        variant="contained"
        fullWidth
        onClick={handleAdd}
        sx={{ mt: 2 }}
      >
        Thêm Bệnh Nhân
      </TouchButton>
    </PullToRefreshWrapper>
  );
};
```

---

## 7. Testing Checklist

```
[ ] Touch Targets:
    [ ] Tất cả buttons ≥48px
    [ ] Icons trong IconButton ≥48px
    [ ] List items ≥56px
    [ ] Form inputs ≥48px
    [ ] Spacing ≥8px giữa targets

[ ] Typography:
    [ ] Readable trên iPhone SE (4.7")
    [ ] Line height thoải mái (1.6)
    [ ] Button text ≥16px trên mobile

[ ] Dialogs:
    [ ] Full-screen trên mobile
    [ ] Slide-up animation mượt
    [ ] Close button ở top-left
    [ ] Desktop: centered, max-width

[ ] Animations:
    [ ] 60fps (không jank)
    [ ] Touch feedback instant (<100ms)
    [ ] Haptic feedback (nếu hỗ trợ)

[ ] Accessibility:
    [ ] Lighthouse score >90
    [ ] ARIA labels đầy đủ
    [ ] Keyboard navigation work (desktop)
    [ ] Screen reader friendly
```

---

## 8. Performance Optimizations

```javascript
// Memoize mobile components
export const MobileCard = React.memo(MobileCardComponent);
export const TouchButton = React.memo(TouchButtonComponent);

// Lazy load heavy components
const HeavyMobileDialog = lazy(() => import("./HeavyMobileDialog"));

// Virtual scrolling cho long lists
import { FixedSizeList } from "react-window";

<FixedSizeList
  height={600}
  itemCount={benhNhanList.length}
  itemSize={72} // Mobile card height
>
  {({ index, style }) => (
    <div style={style}>
      <MobileCard data={benhNhanList[index]} />
    </div>
  )}
</FixedSizeList>;
```

---

## 9. Documentation

### File: `docs/MOBILE_COMPONENTS.md` (MỚI)

```markdown
# Mobile Component Library

## Quick Start

\`\`\`javascript
import { MobileCard, TouchButton } from "components/@extended/mobile";
\`\`\`

## Components

### MobileCard

Touch-optimized card với 72px min height.

### TouchButton

Button với 48px min height, haptic feedback.

### MobileDialog

Full-screen dialog trên mobile, regular trên desktop.

## Guidelines

- Touch targets: ≥48px
- Spacing: ≥8px
- Typography: 16px body, 20px heading (mobile)
```

---

## 10. Next Steps

```bash
# Sau khi hoàn thành Giai đoạn 6:
✅ Component library hoàn chỉnh
✅ Touch targets tối ưu
✅ Typography responsive
➡️ Testing toàn bộ 6 giai đoạn
➡️ Deploy lên production!
```

---

**Phiên bản:** 1.0.0  
**Ngày cập nhật:** 2026-01-07  
**Files cần tạo/sửa:** 9 files  
**Thời gian triển khai:** 7 giờ

**Native-like components! 📱**
