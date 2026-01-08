# GIAI ĐOẠN 2: Splash Screen & Skeleton Loading

**Phiên bản:** 1.0.0  
**Trạng thái:** Sẵn sàng triển khai  
**Thời gian ước tính:** 6 giờ  
**Ảnh hưởng:** 100% trải nghiệm tải trang ban đầu  
**Phụ thuộc:** Không (có thể chạy song song với Giai đoạn 1)

---

## 1. Tổng Quan

### Mục Tiêu

- Loại bỏ màn hình trắng khi khởi động app
- Thêm splash screen chuyên nghiệp với animation logo
- Triển khai skeleton loading states cho transition mượt mà
- Hỗ trợ cả hai theme Basic và Able
- Cải thiện perceived performance

### Tiêu Chí Thành Công

- ✅ Splash screen hiển thị ngay lập tức khi khởi động (< 100ms)
- ✅ Transition mượt mà từ splash → skeleton → content
- ✅ Không có layout shift trong quá trình loading
- ✅ Skeleton khớp với cấu trúc trang thật
- ✅ Hoạt động giống nhau cho cả hai theme
- ✅ Có thể bật/tắt qua feature flag

---

## 2. Kiến Trúc

### Trạng Thái Hiện Tại

```
Trải nghiệm người dùng HIỆN TẠI:
┌──────────────────────────────────────┐
│ 0.0s: Nhấn icon app                  │
│   ↓                                   │
│ 0.0-2.5s: ⬜ MÀN HÌNH TRẮNG         │
│   (không có gì, người dùng bối rối)  │
│   ↓                                   │
│ 2.5s: 💥 NỘI DUNG XUẤT HIỆN ĐỘT NGỘT│
│   (nhảy màn hình, không mượt)        │
└──────────────────────────────────────┘

Vấn đề:
❌ Không có phản hồi trong quá trình khởi tạo
❌ Người dùng không biết app có hoạt động không
❌ Ấn tượng đầu tiên kém
❌ Layout shift khi content load
```

### Trạng Thái Mục Tiêu

```
Trải nghiệm người dùng SAU KHI CẢI THIỆN:
┌──────────────────────────────────────┐
│ 0.0s: Nhấn icon app                  │
│   ↓                                   │
│ 0.0-0.5s: 🎨 SPLASH SCREEN          │
│   ┌────────────────┐                 │
│   │                │                 │
│   │   [🏥 LOGO]   │ ← Fade in       │
│   │ Báo Cáo        │ ← Scale up      │
│   │ Bệnh Viện Thủ  │                 │
│   │     Đức        │                 │
│   │    ⏳ ...      │ ← Pulse         │
│   └────────────────┘                 │
│   ↓                                   │
│ 0.5-1.5s: 📦 SKELETON LOADING       │
│   ┌────────────────┐                 │
│   │ ▭▭▭▭▭▭▭▭      │ ← Header        │
│   │                │                 │
│   │ ▬▬▬ ▬▬▬ ▬▬▬   │ ← Cards         │
│   │ ▬▬▬ ▬▬▬ ▬▬▬   │                 │
│   │ ▬▬▬ ▬▬▬ ▬▬▬   │                 │
│   └────────────────┘                 │
│   ↓                                   │
│ 1.5s: ✨ CHUYỂN MƯỢT SANG NỘI DUNG  │
│   (opacity: 0 → 1, không shift)     │
└──────────────────────────────────────┘

Lợi ích:
✅ Phản hồi trực quan ngay lập tức
✅ Trải nghiệm chuyên nghiệp như app native
✅ Người dùng biết app đang loading
✅ Mượt mà, không có transition giật lag
✅ Giống pattern iOS/Android native
```

---

## 3. Thiết Kế Component

### 3.1 Splash Screen Component

**File:** `src/components/SplashScreen.js`

**Tính năng:**

- Logo bệnh viện với fade-in animation
- Tiêu đề app bằng tiếng Việt
- Loading indicator (pulse animation)
- Tự động điều chỉnh màu theo theme
- Tự động ẩn sau khi data sẵn sàng

**Timeline Animation:**

```
Timeline (500ms tổng cộng):
├── 0-150ms:   Logo fade in (opacity 0 → 1)
├── 100-250ms: Logo scale up (scale 0.8 → 1)
├── 200-300ms: Title fade in
└── 300-500ms: Pulse animation (lặp lại cho đến khi data sẵn sàng)

Framer Motion variants:
const logoVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};
```

**Cấu trúc:**

```jsx
<Box
  sx={{
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.primary.main,
    zIndex: 9999,
  }}
>
  <motion.div variants={logoVariants} initial="hidden" animate="visible">
    <Avatar src="/logo192.png" sx={{ width: 120, height: 120, mb: 3 }} />
  </motion.div>

  <motion.div variants={logoVariants}>
    <Typography variant="h4" color="white" fontWeight={600} textAlign="center">
      Báo Cáo Giao Ban
    </Typography>
    <Typography
      variant="h6"
      color="white"
      textAlign="center"
      sx={{ opacity: 0.9 }}
    >
      Bệnh Viện Thủ Đức
    </Typography>
  </motion.div>

  <motion.div variants={pulseVariants} animate="pulse">
    <CircularProgress size={40} thickness={4} sx={{ mt: 4, color: "white" }} />
  </motion.div>
</Box>
```

---

### 3.2 Skeleton Components

**3.2.1 Page Skeleton** (`src/components/skeletons/PageSkeleton.js`)

Skeleton tổng quát cho trang dashboard/summary:

```
┌────────────────────────────────────┐
│ ▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭           │ ← Header (Skeleton)
├────────────────────────────────────┤
│                                    │
│ ▬▬▬▬▬▬▬▬▬▬▬▬▬  ▬▬▬▬▬▬▬▬▬▬▬▬   │ ← Title row
│                                    │
│ ┌──────────┐  ┌──────────┐       │
│ │ ▬▬▬▬▬▬  │  │ ▬▬▬▬▬▬  │       │ ← Stat cards
│ │ ▬▬▬      │  │ ▬▬▬      │       │
│ │ ▬▬▬▬▬    │  │ ▬▬▬▬▬    │       │
│ └──────────┘  └──────────┘       │
│                                    │
│ ┌──────────┐  ┌──────────┐       │
│ │ ▬▬▬▬▬▬  │  │ ▬▬▬▬▬▬  │       │
│ │ ▬▬▬      │  │ ▬▬▬      │       │
│ └──────────┘  └──────────┘       │
└────────────────────────────────────┘

Cách dùng:
<PageSkeleton rows={4} cards={4} />
```

**3.2.2 Card List Skeleton** (`src/components/skeletons/CardListSkeleton.js`)

Cho các trang danh sách (Bệnh nhân, Báo cáo, Sự cố):

```
┌────────────────────────────────────┐
│ ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬           │ ← Search bar
├────────────────────────────────────┤
│ ┌────────────────────────────────┐│
│ │ ▬▬▬▬▬▬▬▬▬▬    ▬▬▬▬▬▬▬▬      ││ ← Card 1
│ │ ▬▬▬▬▬▬▬        ▬▬▬▬▬▬        ││
│ └────────────────────────────────┘│
│ ┌────────────────────────────────┐│
│ │ ▬▬▬▬▬▬▬▬▬▬    ▬▬▬▬▬▬▬▬      ││ ← Card 2
│ │ ▬▬▬▬▬▬▬        ▬▬▬▬▬▬        ││
│ └────────────────────────────────┘│
│ ┌────────────────────────────────┐│
│ │ ▬▬▬▬▬▬▬▬▬▬    ▬▬▬▬▬▬▬▬      ││ ← Card 3
│ │ ▬▬▬▬▬▬▬        ▬▬▬▬▬▬        ││
│ └────────────────────────────────┘│
└────────────────────────────────────┘

Cách dùng:
<CardListSkeleton count={5} />
```

**3.2.3 Form Skeleton** (`src/components/skeletons/FormSkeleton.js`)

Cho các dialog/page form:

```
┌────────────────────────────────────┐
│ ▬▬▬▬▬▬▬▬▬▬▬                      │ ← Dialog title
├────────────────────────────────────┤
│                                    │
│ ▬▬▬▬▬                             │ ← Label
│ ▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭  │ ← Input field
│                                    │
│ ▬▬▬▬▬                             │
│ ▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭  │
│                                    │
│ ▬▬▬▬▬                             │
│ ▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭  │
│                                    │
│ ▬▬▬▬▬                             │
│ ▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭  │
│                                    │
├────────────────────────────────────┤
│                  ▭▭▭▭▭  ▭▭▭▭▭    │ ← Action buttons
└────────────────────────────────────┘

Cách dùng:
<FormSkeleton fields={4} />
```

---

## 4. Các Bước Triển Khai

### Bước 1: Cài Đặt Dependencies (nếu cần)

```bash
cd fe-bcgiaobanbvt

# Kiểm tra framer-motion đã cài chưa
npm list framer-motion

# Nếu chưa có:
npm install framer-motion
```

### Bước 2: Tạo Feature Flag Configuration

**File:** `src/config/featureFlags.js` (MỚI)

```javascript
// src/config/featureFlags.js
export const FEATURE_FLAGS = {
  // Master toggle
  ENABLE_PWA: process.env.REACT_APP_ENABLE_PWA !== "false",

  // Phase-specific toggles
  ENABLE_MOBILE_BOTTOM_NAV: process.env.REACT_APP_ENABLE_BOTTOM_NAV !== "false",
  ENABLE_SPLASH_SCREEN: process.env.REACT_APP_ENABLE_SPLASH !== "false",
  ENABLE_SKELETON_LOADING: process.env.REACT_APP_ENABLE_SKELETON !== "false",

  // Desktop safety net
  FORCE_DESKTOP_MODE: process.env.REACT_APP_FORCE_DESKTOP === "true",
};

export const isFeatureEnabled = (feature) =>
  FEATURE_FLAGS[feature] && !FEATURE_FLAGS.FORCE_DESKTOP_MODE;

export const isPWAEnabled = () => FEATURE_FLAGS.ENABLE_PWA;
```

**Cập nhật `.env.development`:**

```bash
# Thêm vào fe-bcgiaobanbvt/.env.development
REACT_APP_ENABLE_PWA=true
REACT_APP_ENABLE_SPLASH=true
REACT_APP_ENABLE_SKELETON=true
REACT_APP_FORCE_DESKTOP=false
```

### Bước 3: Tạo Splash Screen Component

**File:** `src/components/SplashScreen.js` (MỚI)

```javascript
// src/components/SplashScreen.js
import { Box, Typography, CircularProgress, Avatar } from "@mui/material";
import { motion } from "framer-motion";
import { useTheme } from "@mui/material/styles";

const logoVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export default function SplashScreen() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.palette.primary.main,
        zIndex: 9999,
      }}
    >
      {/* Logo Animation */}
      <motion.div variants={logoVariants} initial="hidden" animate="visible">
        <Avatar
          src="/logo192.png"
          alt="Logo"
          sx={{
            width: 120,
            height: 120,
            mb: 3,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        />
      </motion.div>

      {/* Title Animation */}
      <motion.div
        variants={logoVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
      >
        <Typography
          variant="h4"
          color="white"
          fontWeight={600}
          textAlign="center"
          sx={{ mb: 0.5 }}
        >
          Báo Cáo Giao Ban
        </Typography>
        <Typography
          variant="h6"
          color="white"
          textAlign="center"
          sx={{ opacity: 0.9 }}
        >
          Bệnh Viện Thủ Đức
        </Typography>
      </motion.div>

      {/* Loading Indicator */}
      <motion.div variants={pulseVariants} animate="pulse">
        <CircularProgress
          size={40}
          thickness={4}
          sx={{ mt: 4, color: "white" }}
        />
      </motion.div>
    </Box>
  );
}
```

### Bước 4: Tạo Skeleton Components

**File:** `src/components/skeletons/PageSkeleton.js` (MỚI)

```javascript
// src/components/skeletons/PageSkeleton.js
import { Box, Grid, Skeleton, Paper } from "@mui/material";

export default function PageSkeleton({ rows = 4, cards = 4 }) {
  return (
    <Box sx={{ p: 3 }}>
      {/* Header Skeleton */}
      <Skeleton
        variant="rectangular"
        height={60}
        sx={{ mb: 3, borderRadius: 1 }}
      />

      {/* Title Row */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Skeleton variant="text" width="40%" height={40} />
        <Skeleton
          variant="rectangular"
          width={120}
          height={40}
          sx={{ borderRadius: 1 }}
        />
      </Box>

      {/* Stat Cards Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {Array.from({ length: cards }).map((_, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Skeleton variant="text" width="60%" height={30} />
              <Skeleton variant="text" width="40%" height={50} />
              <Skeleton variant="text" width="80%" height={20} />
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Content Rows */}
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton
          key={index}
          variant="rectangular"
          height={80}
          sx={{ mb: 2, borderRadius: 1 }}
        />
      ))}
    </Box>
  );
}
```

**File:** `src/components/skeletons/CardListSkeleton.js` (MỚI)

```javascript
// src/components/skeletons/CardListSkeleton.js
import { Box, Card, CardContent, Skeleton, Stack } from "@mui/material";

export default function CardListSkeleton({ count = 5 }) {
  return (
    <Box sx={{ p: 2 }}>
      {/* Search Bar Skeleton */}
      <Skeleton
        variant="rectangular"
        height={56}
        sx={{ mb: 2, borderRadius: 1 }}
      />

      {/* Card List */}
      <Stack spacing={2}>
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index}>
            <CardContent>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Skeleton variant="text" width="70%" height={30} />
                <Skeleton variant="text" width="20%" height={30} />
              </Box>
              <Skeleton variant="text" width="50%" height={20} />
              <Skeleton variant="text" width="60%" height={20} />
              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <Skeleton
                  variant="rectangular"
                  width={80}
                  height={28}
                  sx={{ borderRadius: 1 }}
                />
                <Skeleton
                  variant="rectangular"
                  width={80}
                  height={28}
                  sx={{ borderRadius: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
```

**File:** `src/components/skeletons/FormSkeleton.js` (MỚI)

```javascript
// src/components/skeletons/FormSkeleton.js
import { Box, Skeleton, Stack } from "@mui/material";

export default function FormSkeleton({ fields = 4 }) {
  return (
    <Box sx={{ p: 3 }}>
      {/* Title */}
      <Skeleton variant="text" width="40%" height={40} sx={{ mb: 3 }} />

      {/* Form Fields */}
      <Stack spacing={3}>
        {Array.from({ length: fields }).map((_, index) => (
          <Box key={index}>
            <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
            <Skeleton
              variant="rectangular"
              height={56}
              sx={{ borderRadius: 1 }}
            />
          </Box>
        ))}
      </Stack>

      {/* Action Buttons */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
        <Skeleton
          variant="rectangular"
          width={100}
          height={40}
          sx={{ borderRadius: 1 }}
        />
        <Skeleton
          variant="rectangular"
          width={100}
          height={40}
          sx={{ borderRadius: 1 }}
        />
      </Box>
    </Box>
  );
}
```

### Bước 5: Cập Nhật App.js

**File:** `src/App.js` (SỬA)

Thêm splash screen state và timing:

```javascript
// src/App.js
import { useState, useEffect } from "react";
import SplashScreen from "components/SplashScreen";
import { isFeatureEnabled } from "config/featureFlags";

// ... các import hiện tại

function App() {
  const [showSplash, setShowSplash] = useState(
    isFeatureEnabled("ENABLE_SPLASH_SCREEN")
  );

  useEffect(() => {
    if (showSplash) {
      // Ẩn splash sau thời gian tối thiểu
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 500); // 500ms tối thiểu

      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  // Hiển thị splash screen
  if (showSplash) {
    return <SplashScreen />;
  }

  // ... JSX App hiện tại
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>{/* routes hiện tại */}</Router>
    </ThemeProvider>
  );
}

export default App;
```

### Bước 6: Thêm Suspense Boundaries vào Routes

**File:** `src/routes/index.js` (SỬA)

Wrap routes với Suspense và skeleton fallbacks:

```javascript
// src/routes/index.js
import { lazy, Suspense } from "react";
import PageSkeleton from "components/skeletons/PageSkeleton";
import CardListSkeleton from "components/skeletons/CardListSkeleton";
import FormSkeleton from "components/skeletons/FormSkeleton";
import { isFeatureEnabled } from "config/featureFlags";

// Lazy load components (sẽ làm ở Giai đoạn 4, nhưng chuẩn bị trước)
// const DashboardPage = lazy(() => import('pages/DashboardPage'));

// Helper để wrap Skeleton
const withSkeleton = (Component, SkeletonComponent) => (
  <Suspense
    fallback={
      isFeatureEnabled("ENABLE_SKELETON_LOADING") ? (
        <SkeletonComponent />
      ) : (
        <div>Đang tải...</div>
      )
    }
  >
    <Component />
  </Suspense>
);

// Cách dùng trong routes:
const routes = [
  {
    path: "/dashboard",
    element: withSkeleton(DashboardPage, PageSkeleton),
  },
  {
    path: "/khoa/benhnhan",
    element: withSkeleton(BenhNhanPage, CardListSkeleton),
  },
  // ... các routes khác
];
```

---

## 5. Checklist Kiểm Tra

### Functional Tests

- [ ] Splash screen xuất hiện ngay lập tức khi khởi động
- [ ] Splash screen hiển thị ít nhất 500ms
- [ ] Transition mượt mà từ splash sang content
- [ ] Skeleton loaders xuất hiện trong quá trình fetch data
- [ ] Cấu trúc skeleton khớp với layout trang thật
- [ ] Không có layout shift khi content load
- [ ] Feature flags hoạt động (có thể tắt splash/skeleton)

### Visual Tests

- [ ] Animation logo mượt mà (không giật lag)
- [ ] Màu splash khớp với theme
- [ ] Animation pulse skeleton mượt mà
- [ ] Không có artifacts trong quá trình transition
- [ ] Hoạt động với cả light/dark theme

### Device Tests

- [ ] iOS Safari (iPhone 12+)
- [ ] Chrome Android (Pixel 5+)
- [ ] Desktop browser (không thay đổi)
- [ ] Tablet (iPad, Android)

### Performance Tests

- [ ] Splash hiển thị < 100ms sau khi launch
- [ ] Tổng thời gian splash → skeleton → content < 2s
- [ ] Không có memory leak từ animations
- [ ] Frame rate 60fps trong animations

---

## 6. Tích Hợp Với Các Giai Đoạn Khác

### Với Giai đoạn 1 (Mobile Navigation)

```
Độc lập - không conflict
├── Splash hiển thị trước navigation
└── Skeleton hoạt động với cả desktop/mobile layout
```

### Với Giai đoạn 4 (Lazy Loading)

```
Tương hỗ - skeleton tăng cường lazy loading
├── Suspense boundaries sử dụng skeleton fallbacks
└── Người dùng thấy skeleton trong khi chunk download
```

### Với Cả Hai Theme

```
Theme-agnostic - hoạt động mượt mà
├── Basic Theme: Dùng theme.palette.primary
└── Able Theme: Dùng theme.palette.primary
   (cả hai theme đều có primary color)
```

---

## 7. Tiêu Chí Hoàn Thành

### Code Markers

Thêm comment này vào các file đã hoàn thành:

```javascript
// ============================================
// PWA-GIAI-ĐOẠN-2: Splash & Skeleton - HOÀN THÀNH
// Ngày: [YYYY-MM-DD]
// Thay đổi: Thêm splash screen + skeleton loaders
// ============================================
```

### Files Checklist

- [ ] `src/config/featureFlags.js` (MỚI)
- [ ] `src/components/SplashScreen.js` (MỚI)
- [ ] `src/components/skeletons/PageSkeleton.js` (MỚI)
- [ ] `src/components/skeletons/CardListSkeleton.js` (MỚI)
- [ ] `src/components/skeletons/FormSkeleton.js` (MỚI)
- [ ] `src/App.js` (SỬA - thêm splash state)
- [ ] `src/routes/index.js` (SỬA - thêm Suspense)
- [ ] `.env.development` (SỬA - thêm flags)

### Testing Sign-off

- [ ] Tất cả functional tests passed
- [ ] Visual tests trên 3+ thiết bị
- [ ] Performance metrics chấp nhận được
- [ ] Code reviewed và approved
- [ ] Feature flags đã test (on/off)

---

## 8. Kế Hoạch Rollback

Nếu phát hiện vấn đề:

```bash
# Tắt nhanh qua feature flag
# .env.production
REACT_APP_ENABLE_SPLASH=false
REACT_APP_ENABLE_SKELETON=false

# Rebuild và deploy (5 phút)
npm run build
# Deploy lên server
```

Hoặc rollback code khẩn cấp:

```bash
git revert [phase-2-commit-hash]
git push
npm run build
# Deploy
```

---

## 9. Bước Tiếp Theo

Sau khi hoàn thành Giai đoạn 2:

1. ✅ Cập nhật checklist `TIEN_DO.md`
2. ➡️ **Giai đoạn 3: Gesture System** (yêu cầu Giai đoạn 1)
3. ➡️ **Giai đoạn 4: Route Optimization** (tăng cường skeleton usage)

---

**Giai đoạn 2 có thể triển khai song song với Giai đoạn 1 để tiến độ nhanh hơn!**
