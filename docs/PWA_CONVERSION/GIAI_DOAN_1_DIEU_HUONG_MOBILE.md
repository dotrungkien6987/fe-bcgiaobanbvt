# GIAI ĐOẠN 1: Hệ Thống Điều Hướng Mobile

**Phiên bản:** 1.0.0  
**Trạng thái:** Sẵn sàng triển khai  
**Thời gian ước tính:** 5 giờ  
**Ảnh hưởng:** 100% màn hình mobile  
**Phụ thuộc:** Không (giai đoạn nền tảng)

---

## 1. Tổng Quan

### Mục Tiêu

- Thay thế drawer navigation desktop bằng bottom navigation thân thiện mobile (<1024px)
- Hỗ trợ cả hai kiến trúc theme: Basic và Able
- Giữ nguyên trải nghiệm desktop
- Kiểm soát bằng feature flag để rollout dần dần

### Tiêu Chí Thành Công

- ✅ Bottom navigation hiển thị trên mobile (<1024px) cho tất cả routes
- ✅ Desktop drawer không thay đổi (≥1024px)
- ✅ Cả hai theme (Basic + Able) hoạt động giống nhau
- ✅ Highlight tab đang active với badge thông báo
- ✅ Transitions mượt mà không layout shift

---

## 2. Kiến Trúc

### Trạng Thái Hiện Tại

```
Mobile (<1024px):
├─ Header (full width, hamburger menu)
├─ Drawer (slide-in overlay)          ← VẤN ĐỀ: Desktop pattern
└─ Content

Desktop (≥1024px):
├─ Header (navigation bar)
├─ Drawer (persistent sidebar)
└─ Content
```

### Trạng Thái Mục Tiêu

```
Mobile (<1024px):
├─ Header (gọn nhẹ, giống app)
├─ Content (full height)
└─ Bottom Nav (5 tabs)                ← COMPONENT MỚI

Desktop (≥1024px):
├─ Header (không đổi)
├─ Drawer (không đổi)
└─ Content (không đổi)
```

---

## 3. Thiết Kế Component

### Cấu Trúc Bottom Navigation

**5 Tab Chính:**

1. **🏠 Trang chủ** → `/` hoặc `/dashboard`
2. **📊 Báo cáo** → `/khoa` (Basic) hoặc `/nhanvien` (Able)
3. **✓ Công việc** → `/congviec/assigned-to-me`
4. **🔔 Thông báo** → `/notification` (với badge đếm số)
5. **👤 Cá nhân** → `/profile` hoặc `/account/profile`

**Visual Hierarchy:**

```
┌────────────────────────────────────────┐
│  [🏠]  [📊]  [✓]  [🔔⁵]  [👤]          │
│  Home  Report Task  Notif  Profile     │
│   ●                                     │ ← Chỉ báo active
└────────────────────────────────────────┘
```

**Tính Năng Chính:**

- Position fixed ở bottom (z-index: 1100)
- Height 56px (tuân thủ iOS safe area)
- Tab active: màu primary với chấm chỉ báo
- Badge: hình tròn đỏ với số trắng (thông báo)
- Ripple effect khi tap (Material-UI)

---

## 4. Chiến Lược Dual Theme

### Vấn Đề

- **Basic Theme** (ThemeProvider): Không Redux, 20 routes
- **Able Theme** (ThemeCustomization): Redux menu, 30 routes

### Giải Pháp: Theme-Aware Hook

```javascript
// src/hooks/useMobileLayout.js (MỚI)
import { useMediaQuery, useTheme } from "@mui/material";

export const useMobileLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Phát hiện theme đang active
  const isAbleTheme = theme.palette.mode !== undefined;

  return {
    isMobile,
    isAbleTheme,
    showBottomNav: isMobile,
    showDrawer: !isMobile,
  };
};
```

**Sử dụng trong cả MainLayout & MainLayoutAble:**

```javascript
const { isMobile, showBottomNav, showDrawer } = useMobileLayout();

{
  showBottomNav && <MobileBottomNav />;
}
{
  showDrawer && <Drawer />;
}
```

---

## 5. Implementation

### File 1: `src/hooks/useMobileLayout.js` (MỚI)

```javascript
import { useMediaQuery, useTheme } from "@mui/material";

export const useMobileLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isAbleTheme = Boolean(theme.palette.mode);

  return {
    isMobile,
    isAbleTheme,
    showBottomNav: isMobile,
    showDrawer: !isMobile,
  };
};
```

### File 2: `src/components/MobileBottomNav.js` (MỚI)

```javascript
import { useNavigate, useLocation } from "react-router-dom";
import {
  BottomNavigation,
  BottomNavigationAction,
  Badge,
  Paper,
} from "@mui/material";
import {
  Home,
  Assessment,
  CheckCircle,
  Notifications,
  Person,
} from "@mui/icons-material";
import { useMobileLayout } from "hooks/useMobileLayout";
import { FEATURE_FLAGS } from "config/featureFlags";

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showBottomNav } = useMobileLayout();

  // Feature flag check
  if (!FEATURE_FLAGS.ENABLE_MOBILE_BOTTOM_NAV || !showBottomNav) {
    return null;
  }

  // Badge count (giả lập - thay bằng Redux selector thực tế)
  const notificationCount = 5; // TODO: useSelector(state => state.notification.unreadCount)

  const tabs = [
    { label: "Trang chủ", value: "/", icon: <Home /> },
    { label: "Báo cáo", value: "/khoa", icon: <Assessment /> },
    {
      label: "Công việc",
      value: "/congviec/assigned-to-me",
      icon: <CheckCircle />,
    },
    {
      label: "Thông báo",
      value: "/notification",
      icon: (
        <Badge badgeContent={notificationCount} color="error">
          <Notifications />
        </Badge>
      ),
    },
    { label: "Cá nhân", value: "/account/profile", icon: <Person /> },
  ];

  // Xác định tab active
  const currentTab =
    tabs.find(
      (tab) =>
        location.pathname === tab.value ||
        (tab.value !== "/" && location.pathname.startsWith(tab.value))
    )?.value || "/";

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
      }}
      elevation={3}
    >
      <BottomNavigation
        value={currentTab}
        onChange={(event, newValue) => {
          navigate(newValue);
        }}
        showLabels
        sx={{
          height: 56,
          "& .Mui-selected": {
            color: "primary.main",
            "& .MuiBottomNavigationAction-label": {
              fontSize: "0.75rem",
              fontWeight: 600,
            },
          },
        }}
      >
        {tabs.map((tab) => (
          <BottomNavigationAction
            key={tab.value}
            label={tab.label}
            value={tab.value}
            icon={tab.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default MobileBottomNav;
```

### File 3: `src/config/featureFlags.js` (MỚI)

```javascript
export const FEATURE_FLAGS = {
  ENABLE_PWA: process.env.REACT_APP_ENABLE_PWA !== "false",
  ENABLE_MOBILE_BOTTOM_NAV: process.env.REACT_APP_ENABLE_BOTTOM_NAV !== "false",
  ENABLE_SPLASH_SCREEN: process.env.REACT_APP_ENABLE_SPLASH !== "false",
  ENABLE_GESTURES: process.env.REACT_APP_ENABLE_GESTURES !== "false",
  ENABLE_LAZY_LOADING: process.env.REACT_APP_ENABLE_LAZY_LOAD !== "false",
  ENABLE_OFFLINE_MODE: process.env.REACT_APP_ENABLE_OFFLINE !== "false",
  FORCE_DESKTOP_MODE: process.env.REACT_APP_FORCE_DESKTOP === "true",
};

export const isFeatureEnabled = (feature) =>
  FEATURE_FLAGS[feature] && !FEATURE_FLAGS.FORCE_DESKTOP_MODE;
```

### File 4: Cập Nhật `src/layout/MainLayout/index.js`

```javascript
// Thêm imports
import { useMobileLayout } from "hooks/useMobileLayout";
import MobileBottomNav from "components/MobileBottomNav";

const MainLayout = () => {
  const { isMobile, showBottomNav, showDrawer } = useMobileLayout();

  return (
    <Box sx={{ display: "flex", width: "100%" }}>
      <Header />

      {/* Drawer chỉ hiện trên desktop */}
      {showDrawer && <Drawer />}

      <Box
        component="main"
        sx={{
          width: "100%",
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          // Thêm padding bottom khi có bottom nav
          pb: showBottomNav ? 9 : { xs: 2, sm: 3 },
        }}
      >
        <Outlet />
      </Box>

      {/* Bottom Nav chỉ hiện trên mobile */}
      {showBottomNav && <MobileBottomNav />}
    </Box>
  );
};
```

### File 5: Cập Nhật `src/layout/MainLayoutAble/index.js`

```javascript
// MIRROR các thay đổi giống MainLayout
import { useMobileLayout } from "hooks/useMobileLayout";
import MobileBottomNav from "components/MobileBottomNav";

const MainLayoutAble = () => {
  const { showBottomNav, showDrawer } = useMobileLayout();

  return (
    <Box sx={{ display: "flex", width: "100%" }}>
      <Header />
      {showDrawer && <Drawer />}

      <Box
        component="main"
        sx={{
          width: "100%",
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          pb: showBottomNav ? 9 : { xs: 2, sm: 3 },
        }}
      >
        <Outlet />
      </Box>

      {showBottomNav && <MobileBottomNav />}
    </Box>
  );
};
```

---

## 6. Cấu Hình Environment

```bash
# .env.development
REACT_APP_ENABLE_PWA=true
REACT_APP_ENABLE_BOTTOM_NAV=true

# .env.production (rollout dần)
REACT_APP_ENABLE_BOTTOM_NAV=false  # Bật sau khi test kỹ

# Emergency rollback
REACT_APP_FORCE_DESKTOP=true       # Kill switch!
```

---

## 7. Testing Checklist

### Manual Testing

```
[ ] Desktop (≥1024px):
    [ ] Drawer vẫn hiển thị bình thường
    [ ] Không thấy bottom nav
    [ ] Navigation hoạt động như cũ

[ ] Tablet (768px-1023px):
    [ ] Bottom nav xuất hiện
    [ ] Drawer ẩn đi
    [ ] 5 tabs hiển thị đầy đủ

[ ] Mobile (375px-767px):
    [ ] Bottom nav fixed ở bottom
    [ ] Tab active có màu primary
    [ ] Badge thông báo hiển thị
    [ ] Tap vào tab → navigate đúng route
    [ ] Ripple effect khi tap

[ ] Cả Hai Theme:
    [ ] Basic theme: Bottom nav hoạt động
    [ ] Able theme: Bottom nav hoạt động
    [ ] Styles nhất quán giữa hai theme

[ ] Feature Flags:
    [ ] ENABLE_BOTTOM_NAV=false → không có bottom nav
    [ ] FORCE_DESKTOP=true → chỉ desktop mode
```

### Responsive Breakpoints

```javascript
Test trên các kích thước:
- iPhone SE (375px)        ← Bottom nav
- iPhone 12 Pro (390px)    ← Bottom nav
- iPad Mini (768px)        ← Bottom nav
- iPad Pro (1024px)        ← Drawer
- Desktop (1920px)         ← Drawer
```

---

## 8. Rollout Strategy

### Week 1: Development

```
Day 1-2: Tạo components (useMobileLayout, MobileBottomNav, featureFlags)
Day 3: Tích hợp vào MainLayout
Day 4: Tích hợp vào MainLayoutAble (mirror changes)
Day 5: Testing + bug fixes
```

### Week 2: Staging

```
Deploy lên staging với ENABLE_BOTTOM_NAV=false
→ Bật flag cho internal team test
→ Thu thập feedback
→ Fix issues nếu có
```

### Week 3: Production Rollout

```
Option A - Big Bang:
  Deploy với ENABLE_BOTTOM_NAV=true cho tất cả

Option B - Gradual (Khuyên dùng):
  Day 1: 10% users (canary)
  Day 3: 50% users
  Day 5: 100% users

  Theo dõi metrics:
  - Error rate
  - User engagement với bottom nav
  - Navigation time giảm?
```

---

## 9. Troubleshooting

### Vấn Đề 1: Bottom Nav Che Content

**Triệu chứng:** Nội dung cuối trang bị che bởi bottom nav

**Giải pháp:**

```javascript
// Thêm padding bottom khi có bottom nav
<Box sx={{ pb: showBottomNav ? 9 : 2 }}>
  <Outlet />
</Box>
```

### Vấn Đề 2: Active State Không Chính Xác

**Triệu chứng:** Tab không highlight đúng khi ở nested route

**Giải pháp:**

```javascript
// Dùng startsWith() thay vì exact match
const currentTab =
  tabs.find(
    (tab) =>
      location.pathname === tab.value ||
      (tab.value !== "/" && location.pathname.startsWith(tab.value))
  )?.value || "/";
```

### Vấn Đề 3: Badge Count Không Cập Nhật

**Triệu chứng:** Số thông báo không real-time

**Giải pháp:**

```javascript
// Kết nối với Redux store
import { useSelector } from "react-redux";

const notificationCount = useSelector(
  (state) => state.notification.unreadCount
);
```

---

## 10. Performance Considerations

```
Optimizations:
├── useMemo() cho tabs array
├── React.memo() cho MobileBottomNav
├── Throttle navigate calls (debounce rapid taps)
└── Lazy load badge count (không block render)

Expected Impact:
- Component re-render: <10ms
- Navigation time: <100ms
- Memory overhead: ~50KB (negligible)
```

---

## 11. Next Steps

**Sau khi hoàn thành Giai đoạn 1:**

1. ✅ Bottom navigation hoạt động trên mobile
2. ➡️ **Giai đoạn 2:** Thêm Splash Screen & Skeleton Loading
3. ➡️ **Giai đoạn 3:** Implement Gesture System (phụ thuộc Giai đoạn 1)

```bash
# Kiểm tra kết quả
npm start
# Mở Chrome DevTools
# Toggle device toolbar (Cmd+Shift+M)
# Test trên mobile viewport
```

---

**Phiên bản:** 1.0.0  
**Ngày cập nhật:** 2026-01-07  
**Files cần tạo/sửa:** 5 files  
**Thời gian triển khai:** 5 giờ

**Sẵn sàng bắt đầu! 🚀**
