# Phase 2 UI/UX - Components & Navigation

**Part 5 of 5**  
**Components:** SummaryCards, MobileBottomNav, MenuGridPage, FABMenuButton  
**Type:** Extract/Refactor + New  
**Effort:** 4h  
**Status:** ❌ Need to Create

---

## 📦 Component 1: SummaryCard Family (Extracted)

### Purpose

Reusable card components for displaying module summaries in 2 variants:

- **Compact:** For Trang chủ (UnifiedDashboardPage)
- **Detailed:** For module dashboards (optional)

### Files to Create

```
fe-bcgiaobanbvt/src/components/SummaryCards/
├─ CongViecSummaryCard.js       [CREATE] ❌
├─ YeuCauSummaryCard.js         [CREATE] ❌
├─ KPISummaryCard.js            [CREATE] ❌
├─ SummaryCardBase.js           [CREATE] ❌ (shared base)
└─ index.js                     [CREATE] ❌ (barrel export)
```

---

### SummaryCardBase (Shared Logic)

**File:** `components/SummaryCards/SummaryCardBase.js` [CREATE]

```javascript
import React from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Box,
  Typography,
  Divider,
  Skeleton,
  alpha,
  useTheme,
} from "@mui/material";
import { ArrowRight } from "iconsax-react";

/**
 * Base component for all summary cards
 * Provides consistent layout and hover effects
 */
export const SummaryCardBase = ({
  title,
  icon: Icon,
  color = "primary",
  onClick,
  isLoading = false,
  children,
}) => {
  const theme = useTheme();
  const colorValue = theme.palette[color]?.main || theme.palette.primary.main;

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="rectangular" height={120} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: "100%",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <CardActionArea onClick={onClick} sx={{ height: "100%" }}>
        <CardContent>
          {/* Header */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: alpha(colorValue, 0.1),
                }}
              >
                <Icon size={28} color={colorValue} variant="Bold" />
              </Box>
              <Typography variant="h6" fontWeight={600}>
                {title}
              </Typography>
            </Stack>
            <ArrowRight size={20} color={theme.palette.text.secondary} />
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {/* Custom Content */}
          {children}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
```

---

### CongViecSummaryCard

**File:** `components/SummaryCards/CongViecSummaryCard.js` [CREATE]

```javascript
import React from "react";
import { Grid, Box, Typography, LinearProgress } from "@mui/material";
import { Task, Danger, TickCircle, Timer1 } from "iconsax-react";
import { SummaryCardBase } from "./SummaryCardBase";

/**
 * Props:
 * - data: { total, urgent, completionRate }
 * - variant: "compact" | "detailed"
 * - onClick: () => void
 * - isLoading: boolean
 */
export const CongViecSummaryCard = ({
  data = {},
  variant = "compact",
  onClick,
  isLoading = false,
}) => {
  const { total = 0, urgent = 0, completionRate = 0 } = data;

  return (
    <SummaryCardBase
      title="CÔNG VIỆC"
      icon={Task}
      color="primary"
      onClick={onClick}
      isLoading={isLoading}
    >
      <Grid container spacing={1.5}>
        {/* Stat 1: Total */}
        <Grid item xs={6}>
          <StatBox
            icon={Task}
            label="Tổng"
            value={total}
            color="primary.main"
          />
        </Grid>

        {/* Stat 2: Urgent */}
        <Grid item xs={6}>
          <StatBox
            icon={Danger}
            label="Khẩn"
            value={urgent}
            color="error.main"
          />
        </Grid>

        {/* Progress bar (if data available) */}
        {completionRate > 0 && (
          <Grid item xs={12}>
            <Box>
              <LinearProgress
                variant="determinate"
                value={completionRate}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" color="text.secondary" mt={0.5}>
                {completionRate}% hoàn thành
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </SummaryCardBase>
  );
};

// Helper component
const StatBox = ({ icon: Icon, label, value, color }) => (
  <Box
    sx={{
      p: 1.5,
      borderRadius: 1.5,
      bgcolor: (theme) => theme.palette.grey[100],
      textAlign: "center",
    }}
  >
    <Stack
      direction="row"
      spacing={0.5}
      alignItems="center"
      justifyContent="center"
    >
      <Icon size={16} color={color} />
      <Typography variant="h6" fontWeight={700}>
        {value}
      </Typography>
    </Stack>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
  </Box>
);
```

**Estimated Lines:** ~100 lines

---

### YeuCauSummaryCard

**File:** `components/SummaryCards/YeuCauSummaryCard.js` [CREATE]

**Similar structure, different stats:**

```javascript
import React from "react";
import { Grid } from "@mui/material";
import { MessageQuestion, Send, ClockCircle, TickCircle } from "iconsax-react";
import { SummaryCardBase } from "./SummaryCardBase";
import { StatBox } from "./StatBox"; // Extract shared component

export const YeuCauSummaryCard = ({
  data = {},
  variant = "compact",
  onClick,
  isLoading = false,
}) => {
  const { sent = 0, needAction = 0, inProgress = 0, completed = 0 } = data;

  return (
    <SummaryCardBase
      title="YÊU CẦU"
      icon={MessageQuestion}
      color="warning"
      onClick={onClick}
      isLoading={isLoading}
    >
      <Grid container spacing={1.5}>
        <Grid item xs={6}>
          <StatBox icon={Send} label="Đã gửi" value={sent} color="info.main" />
        </Grid>
        <Grid item xs={6}>
          <StatBox
            icon={ClockCircle}
            label="Cần xử lý"
            value={needAction}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={6}>
          <StatBox
            icon={Timer1}
            label="Đang xử lý"
            value={inProgress}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={6}>
          <StatBox
            icon={TickCircle}
            label="Hoàn thành"
            value={completed}
            color="success.main"
          />
        </Grid>
      </Grid>
    </SummaryCardBase>
  );
};
```

---

### KPISummaryCard

**File:** `components/SummaryCards/KPISummaryCard.js` [CREATE]

**Shows score + pending count:**

```javascript
import React from "react";
import { Box, Typography, Stack, Chip } from "@mui/material";
import { MedalStar, Star1, ClockCircle } from "iconsax-react";
import { SummaryCardBase } from "./SummaryCardBase";

export const KPISummaryCard = ({
  data = {},
  variant = "compact",
  onClick,
  isLoading = false,
}) => {
  const { score = 0, pending = 0, approved = 0 } = data;

  // Score rating
  const getRating = (score) => {
    if (score >= 90) return { text: "Xuất sắc", color: "success" };
    if (score >= 80) return { text: "Tốt", color: "info" };
    if (score >= 70) return { text: "Khá", color: "warning" };
    return { text: "Cần cải thiện", color: "error" };
  };

  const rating = getRating(score);

  return (
    <SummaryCardBase
      title="ĐÁNH GIÁ KPI"
      icon={MedalStar}
      color="success"
      onClick={onClick}
      isLoading={isLoading}
    >
      {/* Big score display */}
      <Box textAlign="center" mb={2}>
        <Typography variant="h3" fontWeight={700} color="success.main">
          {score}
          <Typography variant="h5" component="span" color="text.secondary">
            /100
          </Typography>
        </Typography>
        <Stack
          direction="row"
          spacing={0.5}
          justifyContent="center"
          alignItems="center"
        >
          {"★★★★☆".split("").map((star, i) => (
            <Star1
              key={i}
              size={20}
              variant={i < Math.floor(score / 20) ? "Bold" : "Linear"}
              color={i < Math.floor(score / 20) ? "gold" : "rgba(0,0,0,0.2)"}
            />
          ))}
          <Chip label={rating.text} size="small" color={rating.color} />
        </Stack>
      </Box>

      {/* Stats row */}
      <Stack direction="row" spacing={2} justifyContent="space-around">
        <Box textAlign="center">
          <Typography variant="h6" fontWeight={700}>
            {approved}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Đã duyệt
          </Typography>
        </Box>
        <Box textAlign="center">
          <Typography variant="h6" fontWeight={700} color="warning.main">
            {pending}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Chờ duyệt
          </Typography>
        </Box>
      </Stack>
    </SummaryCardBase>
  );
};
```

---

### Barrel Export

**File:** `components/SummaryCards/index.js` [CREATE]

```javascript
export { CongViecSummaryCard } from "./CongViecSummaryCard";
export { YeuCauSummaryCard } from "./YeuCauSummaryCard";
export { KPISummaryCard } from "./KPISummaryCard";
export { SummaryCardBase } from "./SummaryCardBase";
```

---

## 📱 Component 2: MobileBottomNav (Revised)

### Changes Required

**File:** `components/MobileBottomNav.js` [UPDATE]

**Current:** 5 tabs  
**Target:** 4 tabs + FAB

**Changes:**

```javascript
// ❌ REMOVE: 5th tab (Settings or Notifications)
// ✅ UPDATE: NAV_ITEMS array

const NAV_ITEMS = [
  {
    label: "Trang chủ",
    path: "/quanlycongviec",
    icon: Home,
    exactMatch: true,
  },
  {
    label: "Yêu cầu",
    path: "/quanlycongviec/yeucau",
    icon: MessageQuestion, // Changed from Category
    matcher: (pathname) => pathname.startsWith("/quanlycongviec/yeucau"),
    badge: "yeuCauCount",
  },
  {
    label: "Công việc",
    path: "/quanlycongviec/cong-viec", // ⚠️ VERIFY THIS PATH
    icon: Task,
    matcher: (pathname) =>
      pathname.startsWith("/quanlycongviec/cong-viec") ||
      pathname.startsWith("/quanlycongviec/congviec"),
    badge: "congViecCount", // NEW - calculate from urgent tasks
  },
  {
    label: "KPI",
    path: "/quanlycongviec/kpi",
    icon: MedalStar,
    matcher: (pathname) => pathname.startsWith("/quanlycongviec/kpi"),
    badge: "kpiCount", // NEW - calculate from pending evaluations
  },
];

// ✅ ADD: Badge calculation selectors
const getBadgeCount = (badgeKey) => {
  if (badgeKey === "yeuCauCount") {
    return yeuCauBadges
      ? Object.values(yeuCauBadges).reduce((sum, val) => sum + (val || 0), 0)
      : 0;
  }
  if (badgeKey === "congViecCount") {
    // Calculate from urgent/overdue tasks
    return urgentTasksCount || 0; // From Redux
  }
  if (badgeKey === "kpiCount") {
    // Calculate from pending KPI evaluations
    return pendingKPICount || 0; // From Redux
  }
  return 0;
};
```

**Estimated Changes:** ~50 lines modified

---

## 📱 Component 3: MenuGridPage (NEW)

### Purpose

Comprehensive menu page providing access to **all 8 modules** of the hospital management system:

- Work Management (Công việc & KPI)
- Medical Reporting (Báo cáo Y tế)
- Training Management (Đào tạo)
- Research & Science (Nghiên cứu)
- Scheduling (Lịch trực)
- Notifications & Settings
- Administration (Quản trị)

### Layout (Expanded Structure)

```
┌────────────────────────────────────────────────┐
│ 🔍 [Tìm kiếm menu...]      [👤 Profile ▼]     │
├────────────────────────────────────────────────┤
│                                                │
│ 🔥 NHANH CHÓNG (4 mục thường dùng)            │
│ [📊 Dashboard] [📋 CV nhận] [📝 YC] [🏆 KPI]  │
│                                                │
│ ⭐ CÔNG VIỆC & KPI ▼ (Expanded)               │
│ ┌─────────┬─────────┬─────────┐              │
│ │📊 Dash  │📋 CV    │📤 CV    │              │
│ │  board  │  nhận   │  giao   │              │
│ └─────────┴─────────┴─────────┘              │
│ ┌─────────┬─────────┬─────────┐              │
│ │📝 YC    │✅ YC    │🏆 KPI   │              │
│ │  gửi    │  xử lý  │  tôi    │              │
│ └─────────┴─────────┴─────────┘              │
│ ┌─────────┬─────────┬─────────┐              │
│ │✍️ Tự    │⏰ Lịch  │📋 NVTQ  │              │
│ │  ĐG     │  sử     │         │              │
│ └─────────┴─────────┴─────────┘              │
│                                                │
│ 🏥 BÁO CÁO Y TẾ ▶ (Collapsed)                │
│                                                │
│ 📚 ĐÀO TẠO ▶ (Collapsed, role: admin/daotao) │
│                                                │
│ 🔬 NGHIÊN CỨU ▶ (Collapsed)                   │
│                                                │
│ 📅 LỊCH TRỰC ▶ (Collapsed)                    │
│                                                │
│ 🔔 THÔNG BÁO (Always visible)                │
│ ┌─────────┬─────────┬─────────┐              │
│ │🔔 Thông │⚙️ Cài   │👤 Tài   │              │
│ │  báo ●3 │  đặt    │  khoản  │              │
│ └─────────┴─────────┴─────────┘              │
│                                                │
│ ⚙️ QUẢN TRỊ ▶ (Admin only)                    │
│                                                │
│ ┌──────────────────────────────────────────┐  │
│ │        🚪 Đăng xuất                      │  │
│ └──────────────────────────────────────────┘  │
│                                                │
└────────────────────────────────────────────────┘
```

---

### File Structure

**File:** `features/QuanLyCongViec/Menu/MenuGridPage.js` [CREATE]

```javascript
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Stack,
  Box,
  Badge,
  Divider,
  Button,
  TextField,
  Collapse,
  IconButton,
} from "@mui/material";
import {
  Notification,
  Setting2,
  Profile,
  Chart,
  People,
  Task,
  Refresh,
  FolderOpen,
  Diagram,
  Book,
  InfoCircle,
  Logout,
  ArrowDown2,
  ArrowUp2,
  SearchNormal1,
  Home,
  Hospital,
  GraduationCap,
  MicroscopeScience,
  Calendar,
  HomeTrendUp,
  MessageQuestion,
  MedalStar,
  Send,
  TickCircle,
  StatusUp,
  Clock,
  MenuBoard,
} from "iconsax-react";
import useAuth from "hooks/useAuth";

const MenuGridPage = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    work: true, // Expand by default
    medical: false,
    training: false,
    research: false,
    schedule: false,
    notification: true, // Always visible
    admin: false,
  });

  const notificationCount = 3; // From Redux
  const isManager = ["manager", "admin"].includes(user?.PhanQuyen);
  const isAdmin = user?.PhanQuyen === "admin";
  const isDaoTao = ["admin", "daotao"].includes(user?.PhanQuyen);

  const toggleSection = (key) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Quick access items (most frequently used)
  const quickAccessItems = [
    {
      icon: HomeTrendUp,
      label: "Dashboard",
      path: "/quanlycongviec",
      color: "primary",
    },
    {
      icon: Task,
      label: "CV nhận",
      path: "/quanlycongviec/cong-viec-cua-toi",
      color: "primary",
    },
    {
      icon: MessageQuestion,
      label: "Yêu cầu",
      path: "/quanlycongviec/yeucau",
      color: "warning",
    },
    {
      icon: MedalStar,
      label: "KPI",
      path: "/quanlycongviec/kpi/xem",
      color: "success",
    },
  ];

  const menuSections = [
    {
      key: "work",
      title: "⭐ CÔNG VIỆC & KPI",
      icon: MenuBoard,
      roles: ["all"],
      items: [
        {
          icon: HomeTrendUp,
          label: "Dashboard",
          path: "/quanlycongviec",
        },
        {
          icon: Task,
          label: "CV tôi nhận",
          path: "/quanlycongviec/cong-viec-cua-toi",
        },
        {
          icon: Send,
          label: "CV tôi giao",
          path: "/quanlycongviec/viec-toi-giao",
        },
        {
          icon: MessageQuestion,
          label: "YC tôi gửi",
          path: "/quanlycongviec/yeucau/toi-gui",
        },
        {
          icon: TickCircle,
          label: "YC xử lý",
          path: "/quanlycongviec/yeucau/xu-ly",
        },
        {
          icon: MedalStar,
          label: "KPI của tôi",
          path: "/quanlycongviec/kpi/xem",
        },
        {
          icon: StatusUp,
          label: "Tự đánh giá",
          path: "/quanlycongviec/kpi/tu-danh-gia",
        },
        {
          icon: Clock,
          label: "Lịch sử",
          path: "/quanlycongviec/lich-su-hoan-thanh",
        },
        {
          icon: Task,
          label: "NVTQ",
          path: "/quanlycongviec/nhiem-vu-thuong-quy",
          roles: ["admin"],
        },
      ],
    },
    {
      key: "medical",
      title: "🏥 BÁO CÁO Y TẾ",
      icon: Hospital,
      roles: ["all"],
      items: [
        {
          icon: Home,
          label: "Nội dung GB",
          path: "/",
        },
        {
          icon: Hospital,
          label: "Báo cáo ngày",
          path: "/baocao",
        },
        {
          icon: Clock,
          label: "Tổng trực",
          path: "/tongtruc",
        },
        {
          icon: HomeTrendUp,
          label: "Dash toàn viện",
          path: "/dashboard-toan-vien",
        },
        {
          icon: InfoCircle,
          label: "DS Sự cố",
          path: "/danhsach",
        },
        {
          icon: Chart,
          label: "BC Sự cố",
          path: "/baocaosuco",
        },
      ],
    },
    {
      key: "training",
      title: "📚 ĐÀO TẠO",
      icon: GraduationCap,
      roles: ["admin", "daotao"],
      items: [
        {
          icon: People,
          label: "DS Cán bộ",
          path: "/nhanvien",
        },
        {
          icon: Book,
          label: "Khóa đào tạo",
          path: "/lopdaotaos",
        },
        {
          icon: HomeTrendUp,
          label: "Dash ĐT",
          path: "/dashboarddaotao",
        },
        {
          icon: Chart,
          label: "Tín chỉ",
          path: "/tonghopdaotao",
        },
        {
          icon: Chart,
          label: "BC Số lượng",
          path: "/tonghopsoluong",
        },
      ],
    },
    {
      key: "research",
      title: "🔬 NGHIÊN CỨU",
      icon: MicroscopeScience,
      roles: ["all"],
      items: [
        {
          icon: Book,
          label: "SHKH",
          path: "/lopdaotaos/NCKH06",
        },
        {
          icon: Chart,
          label: "Đề tài & SI",
          path: "/lopdaotaos/NCKH01",
        },
        {
          icon: InfoCircle,
          label: "HTQT",
          path: "/doanvao",
        },
        {
          icon: Book,
          label: "Tập san",
          path: "/tapsan",
        },
      ],
    },
    {
      key: "schedule",
      title: "📅 LỊCH TRỰC",
      icon: Calendar,
      roles: ["all"],
      items: [
        {
          icon: Calendar,
          label: "Lịch trực khoa",
          path: "/lichtruc",
        },
        {
          icon: Refresh,
          label: "PC Chu kỳ",
          path: "/quanlycongviec/giao-nhiemvu",
        },
      ],
    },
    {
      key: "notification",
      title: "🔔 THÔNG BÁO",
      icon: Notification,
      roles: ["all"],
      alwaysExpanded: true,
      items: [
        {
          icon: Notification,
          label: "Thông báo",
          badge: notificationCount,
          path: "/quanlycongviec/thong-bao",
        },
        {
          icon: Setting2,
          label: "Cài đặt",
          path: "/quanlycongviec/cai-dat/thong-bao",
        },
        {
          icon: Profile,
          label: "Tài khoản",
          path: "/quanlycongviec/ho-so",
        },
      ],
    },
    {
      key: "admin",
      title: "⚙️ QUẢN TRỊ",
      icon: Setting2,
      roles: ["admin"],
      items: [
        {
          icon: People,
          label: "Users",
          path: "/usersable",
        },
        {
          icon: FolderOpen,
          label: "QL File",
          path: "/admin/files",
        },
        {
          icon: Notification,
          label: "QL Thông báo",
          path: "/admin/notification-types",
        },
        {
          icon: Diagram,
          label: "Cây CV",
          path: "/quanlycongviec/tree-view",
        },
      ],
    },
  ];

  // Filter sections by role
  const visibleSections = menuSections.filter((section) => {
    if (section.roles.includes("all")) return true;
    if (isAdmin && section.roles.includes("admin")) return true;
    if (isDaoTao && section.roles.includes("daotao")) return true;
    return false;
  });

  // Search filter
  const filterItems = (items) => {
    if (!searchTerm) return items;
    return items.filter((item) =>
      item.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight={600}>
            ☰ Menu
          </Typography>
          <Button
            variant="text"
            startIcon={<Profile />}
            onClick={() => navigate("/quanlycongviec/ho-so")}
          >
            {user?.HoTen}
          </Button>
        </Box>

        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder="Tìm kiếm menu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchNormal1 size={20} />,
          }}
          size="small"
        />

        {/* Quick Access */}
        {!searchTerm && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" mb={2}>
              🔥 NHANH CHÓNG
            </Typography>
            <Grid container spacing={2}>
              {quickAccessItems.map((item, idx) => (
                <Grid item xs={3} key={idx}>
                  <Card sx={{ bgcolor: `${item.color}.lighter` }}>
                    <CardActionArea onClick={() => navigate(item.path)}>
                      <CardContent sx={{ textAlign: "center", p: 1.5 }}>
                        <item.icon size={28} variant="Bold" />
                        <Typography variant="caption" display="block" mt={0.5}>
                          {item.label}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Divider sx={{ mt: 3 }} />
          </Box>
        )}

        {/* Menu Sections */}
        {visibleSections.map((section, idx) => {
          const filteredItems = filterItems(section.items).filter(
            (item) => !item.roles || item.roles.includes(user?.PhanQuyen)
          );

          if (filteredItems.length === 0) return null;

          const isExpanded =
            section.alwaysExpanded || expandedSections[section.key];

          return (
            <Box key={section.key}>
              {/* Section Header */}
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
                onClick={() =>
                  !section.alwaysExpanded && toggleSection(section.key)
                }
                sx={{
                  cursor: section.alwaysExpanded ? "default" : "pointer",
                  userSelect: "none",
                }}
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  {section.title}
                </Typography>
                {!section.alwaysExpanded && (
                  <IconButton size="small">
                    {isExpanded ? (
                      <ArrowUp2 size={16} />
                    ) : (
                      <ArrowDown2 size={16} />
                    )}
                  </IconButton>
                )}
              </Box>

              {/* Section Items */}
              <Collapse in={isExpanded}>
                <Grid container spacing={2}>
                  {filteredItems.map((item, itemIdx) => (
                    <Grid item xs={4} sm={3} key={itemIdx}>
                      <Card>
                        <CardActionArea
                          onClick={() => navigate(item.path)}
                          sx={{ height: "100%" }}
                        >
                          <CardContent sx={{ textAlign: "center", p: 2 }}>
                            <Badge badgeContent={item.badge} color="error">
                              <item.icon size={32} variant="Bulk" />
                            </Badge>
                            <Typography
                              variant="caption"
                              display="block"
                              mt={1}
                              fontWeight={500}
                            >
                              {item.label}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Collapse>

              {idx < visibleSections.length - 1 && <Divider sx={{ mt: 3 }} />}
            </Box>
          );
        })}

        {/* Logout Button */}
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<Logout />}
          onClick={handleLogout}
        >
          Đăng xuất
        </Button>
      </Stack>
    </Container>
  );
};

export default MenuGridPage;
```

**Estimated Lines:** ~400 lines  
**Key Features:**

- ✅ 7 sections with expand/collapse
- ✅ Role-based filtering (admin, daotao, manager)
- ✅ Search functionality
- ✅ Quick access (4 most-used items)
- ✅ Integration with all 8 menu modules
- ✅ Badge support for notifications

---

## 📱 Component 4: FABMenuButton (NEW)

### Purpose

Floating Action Button to open MenuGridPage (mobile-specific)

**File:** `features/QuanLyCongViec/Menu/FABMenuButton.js` [CREATE]

```javascript
import React from "react";
import { Fab, Badge } from "@mui/material";
import { More } from "iconsax-react";
import { useNavigate } from "react-router-dom";

/**
 * FAB button for mobile navigation to Menu
 * Shows badge for notifications
 */
export const FABMenuButton = ({ badge = 0 }) => {
  const navigate = useNavigate();

  return (
    <Fab
      color="secondary"
      sx={{
        position: "fixed",
        bottom: 80, // Above bottom nav
        right: 16,
        zIndex: 1000,
      }}
      onClick={() => navigate("/quanlycongviec/menu")}
    >
      <Badge badgeContent={badge} color="error">
        <More size={24} color="white" />
      </Badge>
    </Fab>
  );
};
```

**Estimated Lines:** ~40 lines

---

## 🗺️ Route Configuration Updates

**File:** `routes/index.js` or similar [UPDATE]

**Add new routes:**

```javascript
// Dashboard routes
<Route path="cong-viec" element={<CongViecDashboardPage />} />
<Route path="yeucau" element={<YeuCauDashboardPage />} />
<Route path="kpi" element={<KPIDashboardPage />} />
<Route path="menu" element={<MenuGridPage />} />

// Existing detail routes remain unchanged
<Route path="cong-viec-cua-toi" element={<MyTasksPage />} />
<Route path="viec-toi-giao" element={<AssignedTasksPage />} />
// ... etc
```

---

## 🔧 Integration Checklist

### SummaryCards Integration

- [ ] Create `components/SummaryCards/` folder
- [ ] Implement 3 card components + base component
- [ ] Update `UnifiedDashboardPage.js` to use extracted components
- [ ] Remove embedded SummaryCard code (line 59+)
- [ ] Test compact variant on Trang chủ
- [ ] Create Storybook stories (optional)

### MobileBottomNav Update

- [ ] Update `NAV_ITEMS` to 4-tab configuration
- [ ] Verify `/cong-viec` path in routes
- [ ] Add badge selectors for congViec and KPI
- [ ] Test navigation on mobile device
- [ ] Verify badge counts update correctly

### MenuGridPage Creation

- [ ] Create `Menu/MenuGridPage.js`
- [ ] Implement role-based menu items
- [ ] Add logout functionality
- [ ] Create route `/menu`
- [ ] Test navigation from FAB
- [ ] Test on mobile/tablet/desktop

### FABMenuButton

- [ ] Create `Menu/FABMenuButton.js`
- [ ] Add to layout (conditionally on mobile)
- [ ] Test positioning (fixed bottom-right)
- [ ] Test badge display
- [ ] Verify z-index doesn't conflict

---

## 📊 State Management Updates

### Redux State Additions

**File:** `Dashboard/dashboardSlice.js` [UPDATE]

```javascript
// Add badge count selectors
export const selectUrgentTasksCount = createSelector(
  [(state) => state.dashboard.congViecDashboard],
  (dashboard) => {
    return (
      (dashboard?.received?.overdueCount || 0) +
      (dashboard?.received?.dueSoonCount || 0)
    );
  }
);

export const selectPendingKPICount = createSelector(
  [(state) => state.kpi.danhGiaKPIs],
  (danhGiaKPIs) => {
    return danhGiaKPIs?.filter((d) => d.TrangThai === "CHUA_DUYET").length || 0;
  }
);
```

---

## ✅ Final Acceptance Criteria

### SummaryCards

- [ ] 3 card components render correctly
- [ ] Compact variant used on Trang chủ
- [ ] Loading skeleton displays
- [ ] Hover effects work
- [ ] onClick navigation works
- [ ] Consistent styling across cards

### MobileBottomNav

- [ ] 4 tabs display correctly
- [ ] Active tab highlights
- [ ] Badges show on 3 tabs (Yêu cầu, Công việc, KPI)
- [ ] Navigation works for all tabs
- [ ] Mobile responsive

### MenuGridPage

- [ ] Grid layout responsive (xs=4, sm=3 columns)
- [ ] Role-based items show/hide correctly
- [ ] All navigation links work
- [ ] Logout button works
- [ ] Notification badge displays

### FABMenuButton

- [ ] FAB positioned correctly (fixed bottom-right)
- [ ] Opens MenuGridPage on tap
- [ ] Badge displays notification count
- [ ] Only visible on mobile/tablet

---

## 📚 Summary: All 5 Parts

| Part | File                        | Screens/Components                             | Status      |
| ---- | --------------------------- | ---------------------------------------------- | ----------- |
| 1    | UI_UX_01_OVERVIEW.md        | Navigation overview, flow map                  | ✅ Complete |
| 2    | UI_UX_02_TRANG_CHU.md       | UnifiedDashboardPage (refactor)                | ✅ Complete |
| 3    | UI_UX_03_CONGVIEC_DASHBOARD | CongViecDashboardPage (new)                    | ✅ Complete |
| 4    | UI_UX_04_YEUCAU_KPI         | YeuCauDashboardPage + KPIDashboardPage (new)   | ✅ Complete |
| 5    | UI_UX_05_COMPONENTS_NAV.md  | SummaryCards, MobileBottomNav, Menu components | ✅ Complete |

**Total Documentation:** 5 files, ~2,500 lines  
**Total Implementation Effort:** 49h (as per PHASE_2_IMPLEMENTATION_NOTES.md)

---

**End of Phase 2 UI/UX Documentation**
