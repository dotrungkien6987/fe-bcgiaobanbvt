# 📊 PHASE 3: Unified Dashboard + CongViec Module Enhancement

**Timeline:** Ngày 7-10 (38 giờ)  
**Priority:** 🟡 MEDIUM  
**Dependencies:** Phase 1 (routes)  
**Status:** 📋 Planning

> **📍 RESUME POINT:** Nếu bắt đầu hội thoại mới, đọc [PROGRESS_TRACKER.md](./PROGRESS_TRACKER.md) để xem checkpoint hiện tại

---

## 🎯 Objectives

1. ✅ Tạo **UnifiedDashboardPage** - Tích hợp 3 modules summary
2. ✅ Backend API cho dashboard summary
3. ✅ Module-level dashboards (CongViec, KPI, Ticket)
4. ✅ Redux dashboard state management

---

## 🎨 Design Overview

### Unified Dashboard (/quanlycongviec/dashboard)

```
┌──────────────────────────────────────────────────────────────┐
│ 👋 Xin chào, Nguyễn Văn A                   [Tạo công việc▾] │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐   │
│ │ 📋 CÔNG VIỆC   │ │ 📊 KPI         │ │ 🎫 YÊU CẦU     │   │
│ ├────────────────┤ ├────────────────┤ ├────────────────┤   │
│ │ Cần xử lý  5 ⚠│ │ Chu kỳ hiện tại│ │ Chờ tiếp nhận 3│   │
│ │ Đang làm  12  │ │ Chưa tự đánh giá│ │ Đang xử lý 8  │   │
│ │ Chờ duyệt  2  │ │                 │ │ Đã hoàn thành 15│  │
│ │ [Xem chi tiết]│ │ [Tự đánh giá]  │ │ [Xem chi tiết]│   │
│ └────────────────┘ └────────────────┘ └────────────────┘   │
│                                                               │
│ ┌───────── HOẠT ĐỘNG GẦN ĐÂY ────────────────────────────┐  │
│ │ 🔴 #CV-125 - Cập nhật BHYT        2h trước  [Xem]     │  │
│ │ 🟡 #YC-089 - Sửa máy in           5h trước  [Xem]     │  │
│ │ ✅ #CV-120 - Báo cáo tháng        1 ngày   [Xem]     │  │
│ └──────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔧 Implementation

### 1. Backend APIs (8h)

#### API 1: Unified Dashboard Summary (4h)

**Endpoint:** `GET /api/workmanagement/dashboard/summary`

**Response:**

```json
{
  "success": true,
  "data": {
    "congViec": {
      "received": {
        "canXuLy": 5, // DA_GIAO
        "dangLam": 12, // DANG_THUC_HIEN
        "choDuyet": 2, // CHO_DUYET
        "hoanThanh": 34 // HOAN_THANH (this month)
      },
      "assigned": {
        "quaHan": 3,
        "dangThucHien": 8,
        "hoanThanh": 45
      }
    },
    "kpi": {
      "currentCycle": {
        "TenChuKy": "Tháng 1/2026",
        "hasSelfAssessed": false,
        "hasManagerScored": false,
        "isApproved": false
      },
      "pendingActions": {
        "needSelfAssess": true,
        "needManagerScore": false
      }
    },
    "ticket": {
      "choTiepNhan": 3, // MOI (assigned to me)
      "dangXuLy": 8, // DANG_XU_LY
      "daHoanThanh": 15 // DA_DONG (this month)
    },
    "recentActivities": [
      {
        "_id": "...",
        "type": "congviec", // 'congviec' | 'yeucau' | 'kpi'
        "title": "Cập nhật hệ thống BHYT",
        "code": "CV-125",
        "action": "Chờ duyệt", // Status change
        "timestamp": "2026-01-08T10:30:00Z",
        "relatedPerson": "Nguyễn A",
        "priority": "high" // for icon color
      }
      // ... 9 more items
    ]
  }
}
```

**Backend Service (Node.js):**

```javascript
// services/dashboard.service.js
const getDashboardSummary = async (nhanVienId) => {
  const nhanVien = await NhanVien.findById(nhanVienId);
  if (!nhanVien) throw new AppError(404, "Nhân viên not found");

  // Parallel queries cho performance
  const [congViecSummary, kpiSummary, ticketSummary, recentActivities] =
    await Promise.all([
      getCongViecSummary(nhanVienId),
      getKPISummary(nhanVienId),
      getTicketSummary(nhanVienId),
      getRecentActivities(nhanVienId, 10),
    ]);

  return {
    congViec: congViecSummary,
    kpi: kpiSummary,
    ticket: ticketSummary,
    recentActivities,
  };
};

const getCongViecSummary = async (nhanVienId) => {
  const startOfMonth = dayjs().startOf("month").toDate();

  // Received tasks (I am NguoiChinhID)
  const received = await CongViec.aggregate([
    { $match: { NguoiChinhID: nhanVienId } },
    {
      $group: {
        _id: "$TrangThai",
        count: { $sum: 1 },
      },
    },
  ]);

  // Assigned tasks (I am NguoiGiaoViec)
  const assigned = await CongViec.aggregate([
    { $match: { NguoiGiaoViec: nhanVienId } },
    {
      $facet: {
        quaHan: [
          {
            $match: {
              TrangThai: { $in: ["DA_GIAO", "DANG_THUC_HIEN"] },
              NgayHetHan: { $lt: new Date() },
            },
          },
          { $count: "total" },
        ],
        dangThucHien: [
          { $match: { TrangThai: "DANG_THUC_HIEN" } },
          { $count: "total" },
        ],
        hoanThanh: [
          {
            $match: {
              TrangThai: "HOAN_THANH",
              NgayHoanThanh: { $gte: startOfMonth },
            },
          },
          { $count: "total" },
        ],
      },
    },
  ]);

  return {
    received: {
      canXuLy: received.find((r) => r._id === "DA_GIAO")?.count || 0,
      dangLam: received.find((r) => r._id === "DANG_THUC_HIEN")?.count || 0,
      choDuyet: received.find((r) => r._id === "CHO_DUYET")?.count || 0,
      hoanThanh: received.find((r) => r._id === "HOAN_THANH")?.count || 0,
    },
    assigned: {
      quaHan: assigned[0].quaHan[0]?.total || 0,
      dangThucHien: assigned[0].dangThucHien[0]?.total || 0,
      hoanThanh: assigned[0].hoanThanh[0]?.total || 0,
    },
  };
};

// Add DB indexes for performance
CongViecSchema.index({ NguoiChinhID: 1, TrangThai: 1 });
CongViecSchema.index({ NguoiGiaoViec: 1, TrangThai: 1, NgayHetHan: 1 });
```

#### API 2-3: Module-specific dashboard APIs (4h)

Similar aggregation queries cho CongViec và Ticket module-level dashboards.

---

### 2. Frontend Components (13h)

#### Redux Slice (3h)

**File:** `src/features/QuanLyCongViec/Dashboard/dashboardSlice.js` (NEW)

```javascript
import { createSlice } from "@reduxjs/toolkit";
import apiService from "app/apiService";
import { toast } from "react-toastify";

const initialState = {
  isLoading: false,
  error: null,
  summaryData: {
    congViec: null,
    kpi: null,
    ticket: null,
    recentActivities: [],
  },
  lastFetch: null, // Cache timestamp
};

const slice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    startLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    hasError: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    getDashboardSuccess: (state, action) => {
      state.isLoading = false;
      state.summaryData = action.payload;
      state.lastFetch = Date.now();
    },
  },
});

// Thunks
export const getDashboardSummary =
  (forceRefresh = false) =>
  async (dispatch, getState) => {
    const { dashboard } = getState();

    // Cache 5 phút
    const cacheValid =
      dashboard.lastFetch && Date.now() - dashboard.lastFetch < 5 * 60 * 1000;

    if (!forceRefresh && cacheValid) {
      return; // Use cached data
    }

    dispatch(slice.actions.startLoading());
    try {
      const response = await apiService.get(
        "/workmanagement/dashboard/summary"
      );
      dispatch(slice.actions.getDashboardSuccess(response.data.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error("Không thể tải dashboard");
    }
  };

// Selectors
export const selectCongViecSummary = (state) =>
  state.dashboard.summaryData.congViec;
export const selectKPISummary = (state) => state.dashboard.summaryData.kpi;
export const selectTicketSummary = (state) =>
  state.dashboard.summaryData.ticket;
export const selectRecentActivities = (state) =>
  state.dashboard.summaryData.recentActivities;

export default slice.reducer;
```

#### UnifiedDashboardPage (4h)

**File:** `src/features/QuanLyCongViec/Dashboard/UnifiedDashboardPage.js` (NEW)

```javascript
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Menu,
  MenuItem,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

import CongViecSummaryCard from "./components/CongViecSummaryCard";
import KPISummaryCard from "./components/KPISummaryCard";
import TicketSummaryCard from "./components/TicketSummaryCard";
import RecentActivityFeed from "./components/RecentActivityFeed";
import { getDashboardSummary } from "./dashboardSlice";
import useAuth from "hooks/useAuth";

function UnifiedDashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isLoading } = useSelector((state) => state.dashboard);

  const [anchorEl, setAnchorEl] = React.useState(null);

  useEffect(() => {
    dispatch(getDashboardSummary());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(getDashboardSummary(true)); // Force refresh
  };

  const handleCreateMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCreateMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            👋 Xin chào, {user?.HoTen}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tổng quan công việc của bạn
          </Typography>
        </Box>

        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateMenuOpen}
          >
            Tạo mới
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCreateMenuClose}
          >
            <MenuItem onClick={() => navigate("/quanlycongviec/congviec/new")}>
              Công việc mới
            </MenuItem>
            <MenuItem onClick={() => navigate("/quanlycongviec/yeucau/new")}>
              Yêu cầu mới
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <CongViecSummaryCard loading={isLoading} />
        </Grid>
        <Grid item xs={12} md={4}>
          <KPISummaryCard loading={isLoading} />
        </Grid>
        <Grid item xs={12} md={4}>
          <TicketSummaryCard loading={isLoading} />
        </Grid>
      </Grid>

      {/* Recent Activities */}
      <RecentActivityFeed loading={isLoading} />
    </Container>
  );
}

export default UnifiedDashboardPage;
```

#### Summary Cards (3h each = 9h total)

**Example: CongViecSummaryCard.js**

```javascript
import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Stack,
  Chip,
  Button,
  Skeleton,
} from "@mui/material";
import { CheckCircle as TaskIcon } from "@mui/icons-material";
import { selectCongViecSummary } from "../dashboardSlice";
import { WorkRoutes } from "utils/navigationHelper";

const CongViecSummaryCard = ({ loading }) => {
  const navigate = useNavigate();
  const summary = useSelector(selectCongViecSummary);

  if (loading || !summary) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="rectangular" height={200} />
        </CardContent>
      </Card>
    );
  }

  const { received, assigned } = summary;

  return (
    <Card
      sx={{
        height: "100%",
        "&:hover": { boxShadow: 4 },
        transition: "box-shadow 0.3s",
      }}
    >
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <TaskIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h6">Công việc</Typography>
        </Stack>

        {/* Received Section */}
        <Box mb={2}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Việc tôi nhận
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" mt={0.5}>
            <Chip
              label={`Cần xử lý: ${received.canXuLy}`}
              size="small"
              color={received.canXuLy > 0 ? "error" : "default"}
              onClick={() =>
                navigate(
                  WorkRoutes.congViecList(user.NhanVienID) + "?status=DA_GIAO"
                )
              }
            />
            <Chip
              label={`Đang làm: ${received.dangLam}`}
              size="small"
              color="warning"
            />
            <Chip
              label={`Chờ duyệt: ${received.choDuyet}`}
              size="small"
              color="info"
            />
          </Stack>
        </Box>

        {/* Assigned Section */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Việc tôi giao
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" mt={0.5}>
            <Chip
              label={`Quá hạn: ${assigned.quaHan}`}
              size="small"
              color={assigned.quaHan > 0 ? "error" : "default"}
            />
            <Chip
              label={`Đang thực hiện: ${assigned.dangThucHien}`}
              size="small"
              color="warning"
            />
            <Chip
              label={`Hoàn thành: ${assigned.hoanThanh}`}
              size="small"
              color="success"
            />
          </Stack>
        </Box>
      </CardContent>

      <CardActions>
        <Button
          size="small"
          onClick={() => navigate(WorkRoutes.congViecDashboard())}
        >
          Xem chi tiết
        </Button>
      </CardActions>
    </Card>
  );
};

export default CongViecSummaryCard;
```

**Similar for:**

- `KPISummaryCard.js` (3h)
- `TicketSummaryCard.js` (3h)
- `RecentActivityFeed.js` (3h)

---

### 3. Integration (2h)

#### Update routes

```javascript
// routes/index.js
<Route path="/quanlycongviec/dashboard" element={<UnifiedDashboardPage />} />
```

#### Update menu to point to dashboard

```javascript
// menu items
{
  id: 'dashboard',
  title: 'Dashboard',
  url: '/quanlycongviec/dashboard',
  icon: icons.IconDashboard,
}
```

---

## ✅ Testing Checklist

### Data Accuracy

- [ ] Summary counts match actual database
- [ ] Recent activities show correct items
- [ ] Click cards navigate to correct filtered views

### Performance

- [ ] Dashboard loads in < 2s
- [ ] Cache works (no refetch within 5 min)
- [ ] Force refresh button works

### UX

- [ ] Loading skeletons show immediately
- [ ] Error states handled gracefully
- [ ] Mobile responsive (stacked cards)

---

## 🎯 SECTION 4: CongViec Module Enhancement (23h) ⭐

> **PHẦN QUAN TRỌNG - Core UX improvement cho module CongViec**

**Dependencies:** Section 1-3 complete, Phase 1 routes migrated  
**Goal:** Dashboard drill-down + nested tabs (Role × Status) thay thế CongViecByNhanVienPage

---

### 📊 Overview

```
User Journey:
Unified Dashboard → CongViecDashboardPage → CongViecListPage (Nested Tabs)
     (Section 1)           (Section 4.1)            (Section 4.2)
```

**Timeline:**

- 4.1 CongViecDashboardPage (8h)
- 4.2 Nested Tabs Implementation (10h)
- 4.3 Backend API (2h)
- 4.4 Integration Testing (3h)

---

### 4.1 CongViecDashboardPage Component (8h)

#### Design Mockup (Desktop)

```
┌──────────────────────────────────────────────────────────────┐
│  📊 Tổng quan công việc                          [+ Tạo]     │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌─────────────────────────┐  ┌─────────────────────────────┐│
│ │ 🔵 VIỆC TÔI NHẬN        │  │ 🟠 VIỆC TÔI GIAO            ││
│ ├─────────────────────────┤  ├─────────────────────────────┤│
│ │ ⚠️  Đã giao        5    │  │ ⚠️  Quá hạn          3     ││
│ │     → Cần bắt đầu       │  │     → Follow up ngay        ││
│ ├─────────────────────────┤  ├─────────────────────────────┤│
│ │ 🔄 Đang làm        12   │  │ 🔄 Đang thực hiện   8      ││
│ │     Tiến độ TB: 65%     │  │     Tiến độ TB: 72%         ││
│ │     3 sắp quá hạn       │  │     2 cần check             ││
│ ├─────────────────────────┤  ├─────────────────────────────┤│
│ │ ⏳ Chờ duyệt        2   │  │ ⏳ Chờ duyệt        5      ││
│ │     1 sắp quá hạn       │  │     2 sắp quá hạn           ││
│ ├─────────────────────────┤  ├─────────────────────────────┤│
│ │ ✅ Hoàn thành      34   │  │ ✅ Hoàn thành      45      ││
│ │     Tháng này           │  │     Tỷ lệ đúng hạn: 88%    ││
│ └─────────────────────────┘  └─────────────────────────────┘│
│                                                               │
│         [Xem tất cả công việc →]                            │
└──────────────────────────────────────────────────────────────┘
```

#### Mobile Layout

```
┌──────────────────────────┐
│ 📊 Công việc   [+ Tạo]   │
├──────────────────────────┤
│ 🔵 VIỆC TÔI NHẬN         │
│ ┌────────────────────┐   │
│ │ ⚠️ Đã giao   5     │ ← Tap → Navigate with
│ └────────────────────┘   │   ?role=received&status=DA_GIAO
│ ┌────────────────────┐   │
│ │ 🔄 Đang làm  12    │   │
│ │    65% hoàn thành  │   │
│ └────────────────────┘   │
│ ┌────────────────────┐   │
│ │ ⏳ Chờ duyệt  2    │   │
│ └────────────────────┘   │
│                          │
│ 🟠 VIỆC TÔI GIAO         │
│ ┌────────────────────┐   │
│ │ ⚠️ Quá hạn    3    │   │
│ └────────────────────┘   │
│ ┌────────────────────┐   │
│ │ 🔄 Đang làm   8    │   │
│ └────────────────────┘   │
└──────────────────────────┘
```

#### Component Implementation (3h)

**File:** `src/features/QuanLyCongViec/CongViec/CongViecDashboardPage.js` (NEW)

```javascript
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Skeleton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Assignment,
  AssignmentTurnedIn,
  HourglassEmpty,
  CheckCircle,
  Warning,
  TrendingUp,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { getCongViecDashboard } from "./congViecSlice";
import { WorkRoutes } from "utils/navigationHelper";
import WorkManagementBreadcrumb from "../components/WorkManagementBreadcrumb";
import useAuth from "hooks/useAuth";

const StatusCard = ({
  title,
  count,
  icon,
  color,
  subtitle,
  onClick,
  loading,
}) => {
  if (loading) {
    return (
      <Card sx={{ cursor: "pointer", "&:hover": { boxShadow: 4 } }}>
        <CardContent>
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="text" width="40%" height={48} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: "pointer",
        transition: "all 0.2s",
        "&:hover": { boxShadow: 4, transform: "translateY(-2px)" },
        borderLeft: `4px solid ${color}`,
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="start">
          <Box flex={1}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h3" fontWeight="bold" color={color}>
              {count}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" mt={1}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              bgcolor: `${color}15`,
              borderRadius: 2,
              p: 1,
              display: "flex",
            }}
          >
            {React.cloneElement(icon, { sx: { color, fontSize: 32 } })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

function CongViecDashboardPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user } = useAuth();

  const { dashboardSummary, loadingDashboard } = useSelector(
    (state) => state.congViec
  );

  const nhanVienId = user?.NhanVienID;

  useEffect(() => {
    if (nhanVienId) {
      dispatch(getCongViecDashboard(nhanVienId));
    }
  }, [dispatch, nhanVienId]);

  const handleCardClick = (role, status) => {
    const url = WorkRoutes.congViecList(nhanVienId, { role, status });
    navigate(url);
  };

  const breadcrumbItems = [
    { label: "Trang chủ", path: "/" },
    { label: "Dashboard", path: WorkRoutes.unifiedDashboard() },
    { label: "Công việc", path: null },
  ];

  const received = dashboardSummary?.received || {};
  const assigned = dashboardSummary?.assigned || {};

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <WorkManagementBreadcrumb items={breadcrumbItems} />

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" fontWeight="bold">
          Tổng quan công việc
        </Typography>
        <Button
          variant="contained"
          startIcon={<Assignment />}
          onClick={() => navigate(WorkRoutes.congViecCreate())}
        >
          Tạo công việc
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* VIỆC TÔI NHẬN */}
        <Grid item xs={12} md={6}>
          <Typography
            variant="h6"
            gutterBottom
            color="primary"
            fontWeight="bold"
          >
            🔵 VIỆC TÔI NHẬN
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <StatusCard
                title="Đã giao"
                count={received.daGiao || 0}
                icon={<Warning />}
                color={theme.palette.error.main}
                subtitle="Cần bắt đầu làm"
                onClick={() => handleCardClick("received", "DA_GIAO")}
                loading={loadingDashboard}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StatusCard
                title="Đang làm"
                count={received.dangLam || 0}
                icon={<TrendingUp />}
                color={theme.palette.warning.main}
                subtitle={`TB: ${received.avgProgress || 0}% | ${
                  received.sapQuaHan || 0
                } sắp hạn`}
                onClick={() => handleCardClick("received", "DANG_THUC_HIEN")}
                loading={loadingDashboard}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StatusCard
                title="Chờ duyệt"
                count={received.choDuyet || 0}
                icon={<HourglassEmpty />}
                color={theme.palette.info.main}
                subtitle={`${received.choDuyetSapQuaHan || 0} sắp quá hạn`}
                onClick={() => handleCardClick("received", "CHO_DUYET")}
                loading={loadingDashboard}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StatusCard
                title="Hoàn thành"
                count={received.hoanThanh || 0}
                icon={<CheckCircle />}
                color={theme.palette.success.main}
                subtitle={`Tháng này | ${received.tyLeDungHan || 0}% đúng hạn`}
                onClick={() => handleCardClick("received", "HOAN_THANH")}
                loading={loadingDashboard}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* VIỆC TÔI GIAO */}
        <Grid item xs={12} md={6}>
          <Typography
            variant="h6"
            gutterBottom
            color="warning.main"
            fontWeight="bold"
          >
            🟠 VIỆC TÔI GIAO
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <StatusCard
                title="Quá hạn"
                count={assigned.quaHan || 0}
                icon={<Warning />}
                color={theme.palette.error.main}
                subtitle="Cần follow up ngay"
                onClick={() => handleCardClick("assigned", "QUA_HAN")}
                loading={loadingDashboard}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StatusCard
                title="Đang thực hiện"
                count={assigned.dangThucHien || 0}
                icon={<TrendingUp />}
                color={theme.palette.warning.main}
                subtitle={`TB: ${assigned.avgProgress || 0}% | ${
                  assigned.canCheck || 0
                } cần check`}
                onClick={() => handleCardClick("assigned", "DANG_THUC_HIEN")}
                loading={loadingDashboard}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StatusCard
                title="Chờ duyệt"
                count={assigned.choDuyet || 0}
                icon={<HourglassEmpty />}
                color={theme.palette.info.main}
                subtitle={`${assigned.choDuyetSapQuaHan || 0} sắp quá hạn`}
                onClick={() => handleCardClick("assigned", "CHO_DUYET")}
                loading={loadingDashboard}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StatusCard
                title="Hoàn thành"
                count={assigned.hoanThanh || 0}
                icon={<CheckCircle />}
                color={theme.palette.success.main}
                subtitle={`Tháng này | ${assigned.tyLeDungHan || 0}% đúng hạn`}
                onClick={() => handleCardClick("assigned", "HOAN_THANH")}
                loading={loadingDashboard}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Box mt={4} textAlign="center">
        <Button
          variant="outlined"
          size="large"
          onClick={() => navigate(WorkRoutes.congViecList(nhanVienId))}
        >
          Xem tất cả công việc →
        </Button>
      </Box>
    </Container>
  );
}

export default CongViecDashboardPage;
```

**Key Features:**

- ✅ 8 drill-down cards (4 received + 4 assigned)
- ✅ Click → Navigate với query params: `?role=received&status=DA_GIAO`
- ✅ Responsive grid (stacked on mobile)
- ✅ Loading skeletons
- ✅ Color-coded by priority (error/warning/info/success)

---

### 4.2 Nested Tabs Implementation (10h)

#### Desktop: Two-Level Tabs

```
┌─────────────────────────────────────────────────────────────┐
│ Level 1 (Role):                                             │
│ [ Việc tôi nhận (12) ]  |  Việc tôi giao (8)               │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ Level 2 (Status - Scrollable):                              │
│ [Tất cả 12] [Đã giao 5] [Đang làm 12] [Chờ duyệt 2] [✅ 34]│
│     ●                                                        │
└─────────────────────────────────────────────────────────────┘
```

#### Mobile: Segment Control + Dropdown

```
┌──────────┬───────────┐
│Nhận (12) │ Giao (8)  │  ← ToggleButtonGroup
└──────────┴───────────┘
┌──────────────────────┐
│ [Đã giao (5)    ▾]  │  ← Select Dropdown
└──────────────────────┘
```

#### Component: CongViecNestedTabs.js (2h)

**File:** `src/features/QuanLyCongViec/CongViec/components/CongViecNestedTabs.js` (NEW)

```javascript
import React from "react";
import {
  Tabs,
  Tab,
  Box,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
} from "@mui/material";

const STATUS_CONFIGS = {
  received: [
    { key: "all", label: "Tất cả", color: "default" },
    { key: "DA_GIAO", label: "Đã giao", color: "error" },
    { key: "DANG_THUC_HIEN", label: "Đang làm", color: "warning" },
    { key: "CHO_DUYET", label: "Chờ duyệt", color: "info" },
    { key: "HOAN_THANH", label: "Hoàn thành", color: "success" },
  ],
  assigned: [
    { key: "all", label: "Tất cả", color: "default" },
    { key: "QUA_HAN", label: "Quá hạn", color: "error" },
    { key: "DANG_THUC_HIEN", label: "Đang thực hiện", color: "warning" },
    { key: "CHO_DUYET", label: "Chờ duyệt", color: "info" },
    { key: "HOAN_THANH", label: "Hoàn thành", color: "success" },
  ],
};

function CongViecNestedTabs({
  roleTab, // 'received' | 'assigned'
  statusTab, // 'all' | 'DA_GIAO' | ...
  onRoleChange, // (newRole) => void
  onStatusChange, // (newStatus) => void
  receivedCount, // Total count for received
  assignedCount, // Total count for assigned
  statusCounts, // { all: 12, DA_GIAO: 5, ... }
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const statusTabs = STATUS_CONFIGS[roleTab];

  if (!isMobile) {
    // Desktop: Two-level horizontal tabs
    return (
      <Box>
        {/* Level 1: Role Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs
            value={roleTab}
            onChange={(e, v) => onRoleChange(v)}
            sx={{ "& .MuiTab-root": { fontSize: 16, fontWeight: 600 } }}
          >
            <Tab label={`Việc tôi nhận (${receivedCount})`} value="received" />
            <Tab label={`Việc tôi giao (${assignedCount})`} value="assigned" />
          </Tabs>
        </Box>

        {/* Level 2: Status Tabs (Scrollable) */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={statusTab}
            onChange={(e, v) => onStatusChange(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ "& .MuiTab-root": { minHeight: 48 } }}
          >
            {statusTabs.map((tab) => (
              <Tab
                key={tab.key}
                value={tab.key}
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    {tab.label}
                    {statusCounts[tab.key] > 0 && (
                      <Chip
                        label={statusCounts[tab.key]}
                        size="small"
                        color={tab.color}
                        sx={{ height: 20, fontSize: 12 }}
                      />
                    )}
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Box>
      </Box>
    );
  }

  // Mobile: Segment Control + Dropdown
  return (
    <Box mb={2}>
      {/* Level 1: Segment Control */}
      <Box display="flex" justifyContent="center" mb={2}>
        <ToggleButtonGroup
          value={roleTab}
          exclusive
          onChange={(e, v) => v && onRoleChange(v)}
          fullWidth
          sx={{ maxWidth: 400 }}
        >
          <ToggleButton value="received">Nhận ({receivedCount})</ToggleButton>
          <ToggleButton value="assigned">Giao ({assignedCount})</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Level 2: Dropdown */}
      <Select
        value={statusTab}
        onChange={(e) => onStatusChange(e.target.value)}
        fullWidth
      >
        {statusTabs.map((tab) => (
          <MenuItem key={tab.key} value={tab.key}>
            <Box display="flex" justifyContent="space-between" width="100%">
              <span>{tab.label}</span>
              {statusCounts[tab.key] > 0 && (
                <Chip
                  label={statusCounts[tab.key]}
                  size="small"
                  color={tab.color}
                  sx={{ height: 20 }}
                />
              )}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}

export default CongViecNestedTabs;
```

---

#### CongViecListPage Component (4h)

**File:** Rename `src/features/QuanLyCongViec/CongViec/CongViecByNhanVienPage.js` → `CongViecListPage.js`

```javascript
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { Container, Typography, Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import WorkManagementBreadcrumb from "../components/WorkManagementBreadcrumb";
import CongViecNestedTabs from "./components/CongViecNestedTabs";
import CongViecFilterPanel from "./CongViecFilterPanel";
import CongViecTable from "./CongViecTable";
import { getReceivedCongViecs, getAssignedCongViecs } from "./congViecSlice";
import { WorkRoutes } from "utils/navigationHelper";
import useAuth from "hooks/useAuth";

function CongViecListPage() {
  const { nhanVienId } = useParams();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get params from URL (default: received + all)
  const roleTab = searchParams.get("role") || "received";
  const statusTab = searchParams.get("status") || "all";

  const {
    receivedCongViecs,
    assignedCongViecs,
    receivedTotal,
    assignedTotal,
    isLoading,
  } = useSelector((state) => state.congViec);

  const [statusCounts, setStatusCounts] = useState({});

  useEffect(() => {
    // Fetch data based on role + status
    const filters = statusTab !== "all" ? { TrangThai: statusTab } : {};

    if (roleTab === "received") {
      dispatch(
        getReceivedCongViecs(nhanVienId, { page: 1, limit: 20, ...filters })
      );
    } else {
      dispatch(
        getAssignedCongViecs(nhanVienId, { page: 1, limit: 20, ...filters })
      );
    }
  }, [dispatch, nhanVienId, roleTab, statusTab]);

  // Calculate status counts for badges
  useEffect(() => {
    const data = roleTab === "received" ? receivedCongViecs : assignedCongViecs;
    const configs =
      roleTab === "received"
        ? ["all", "DA_GIAO", "DANG_THUC_HIEN", "CHO_DUYET", "HOAN_THANH"]
        : ["all", "QUA_HAN", "DANG_THUC_HIEN", "CHO_DUYET", "HOAN_THANH"];

    const counts = configs.reduce((acc, key) => {
      if (key === "all") {
        acc[key] = data.length;
      } else if (key === "QUA_HAN") {
        acc[key] = data.filter(
          (item) =>
            new Date(item.NgayHetHan) < new Date() &&
            item.TrangThai !== "HOAN_THANH"
        ).length;
      } else {
        acc[key] = data.filter((item) => item.TrangThai === key).length;
      }
      return acc;
    }, {});

    setStatusCounts(counts);
  }, [receivedCongViecs, assignedCongViecs, roleTab]);

  const handleRoleChange = (newRole) => {
    setSearchParams({ role: newRole, status: "all" });
  };

  const handleStatusChange = (newStatus) => {
    setSearchParams({ role: roleTab, status: newStatus });
  };

  const breadcrumbItems = [
    { label: "Trang chủ", path: "/" },
    { label: "Dashboard", path: WorkRoutes.unifiedDashboard() },
    { label: "Công việc", path: WorkRoutes.congViecDashboard() },
    {
      label: roleTab === "received" ? "Việc tôi nhận" : "Việc tôi giao",
      path: null,
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <WorkManagementBreadcrumb items={breadcrumbItems} />

      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Công việc của tôi
      </Typography>

      {/* Nested Tabs */}
      <CongViecNestedTabs
        roleTab={roleTab}
        statusTab={statusTab}
        onRoleChange={handleRoleChange}
        onStatusChange={handleStatusChange}
        receivedCount={receivedTotal}
        assignedCount={assignedTotal}
        statusCounts={statusCounts}
      />

      {/* Filters (without TrangThai - now in tabs) */}
      <CongViecFilterPanel
        filters={{}}
        onFilterChange={() => {}}
        hideTrangThaiFilter // NEW PROP
      />

      {/* Table */}
      <CongViecTable
        data={roleTab === "received" ? receivedCongViecs : assignedCongViecs}
        loading={isLoading}
      />
    </Container>
  );
}

export default CongViecListPage;
```

**Changes:**

- ✅ Replace `CongViecTabs` (2-tab) → `CongViecNestedTabs` (2-level)
- ✅ URL params control tabs: `?role=received&status=DA_GIAO`
- ✅ Remove TrangThai from filter panel (now in Level 2 tabs)
- ✅ Mobile responsive automatic

---

### 4.3 Backend API (2h)

#### Endpoint: Dashboard Summary

**Route:** `GET /api/workmanagement/congviec/dashboard-summary/:nhanVienId`

**Controller:** `modules/workmanagement/controllers/congViec.controller.js`

```javascript
const getDashboardSummary = catchAsync(async (req, res) => {
  const { nhanVienId } = req.params;

  const startOfMonth = dayjs().startOf("month").toDate();
  const twoDaysLater = dayjs().add(2, "days").toDate();
  const now = new Date();

  // Parallel aggregations
  const [receivedData, assignedData] = await Promise.all([
    CongViec.aggregate([
      { $match: { NguoiChinhID: mongoose.Types.ObjectId(nhanVienId) } },
      {
        $facet: {
          daGiao: [{ $match: { TrangThai: "DA_GIAO" } }, { $count: "total" }],
          dangLam: [
            { $match: { TrangThai: "DANG_THUC_HIEN" } },
            { $count: "total" },
          ],
          choDuyet: [
            { $match: { TrangThai: "CHO_DUYET" } },
            { $count: "total" },
          ],
          hoanThanh: [
            {
              $match: {
                TrangThai: "HOAN_THANH",
                NgayHoanThanh: { $gte: startOfMonth },
              },
            },
            { $count: "total" },
          ],
          avgProgress: [
            { $match: { TrangThai: { $in: ["DANG_THUC_HIEN", "CHO_DUYET"] } } },
            { $group: { _id: null, avg: { $avg: "$TienDo" } } },
          ],
          sapQuaHan: [
            {
              $match: {
                TrangThai: { $in: ["DA_GIAO", "DANG_THUC_HIEN"] },
                NgayHetHan: { $lt: twoDaysLater, $gt: now },
              },
            },
            { $count: "total" },
          ],
          tyLeDungHan: [
            {
              $match: {
                TrangThai: "HOAN_THANH",
                NgayHoanThanh: { $gte: startOfMonth },
              },
            },
            {
              $project: {
                isDungHan: {
                  $cond: {
                    if: { $lte: ["$NgayHoanThanh", "$NgayHetHan"] },
                    then: 1,
                    else: 0,
                  },
                },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                dungHan: { $sum: "$isDungHan" },
              },
            },
            {
              $project: {
                tyLe: { $multiply: [{ $divide: ["$dungHan", "$total"] }, 100] },
              },
            },
          ],
        },
      },
    ]),
    CongViec.aggregate([
      { $match: { NguoiGiaoViec: mongoose.Types.ObjectId(nhanVienId) } },
      {
        $facet: {
          quaHan: [
            {
              $match: {
                NgayHetHan: { $lt: now },
                TrangThai: { $nin: ["HOAN_THANH", "HUY"] },
              },
            },
            { $count: "total" },
          ],
          dangThucHien: [
            { $match: { TrangThai: "DANG_THUC_HIEN" } },
            { $count: "total" },
          ],
          choDuyet: [
            { $match: { TrangThai: "CHO_DUYET" } },
            { $count: "total" },
          ],
          hoanThanh: [
            {
              $match: {
                TrangThai: "HOAN_THANH",
                NgayHoanThanh: { $gte: startOfMonth },
              },
            },
            { $count: "total" },
          ],
          avgProgress: [
            { $match: { TrangThai: "DANG_THUC_HIEN" } },
            { $group: { _id: null, avg: { $avg: "$TienDo" } } },
          ],
          canCheck: [
            {
              $match: {
                TrangThai: "DANG_THUC_HIEN",
                NgayHetHan: { $lt: twoDaysLater },
              },
            },
            { $count: "total" },
          ],
          tyLeDungHan: [
            {
              $match: {
                TrangThai: "HOAN_THANH",
                NgayHoanThanh: { $gte: startOfMonth },
              },
            },
            {
              $project: {
                isDungHan: {
                  $cond: {
                    if: { $lte: ["$NgayHoanThanh", "$NgayHetHan"] },
                    then: 1,
                    else: 0,
                  },
                },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                dungHan: { $sum: "$isDungHan" },
              },
            },
            {
              $project: {
                tyLe: { $multiply: [{ $divide: ["$dungHan", "$total"] }, 100] },
              },
            },
          ],
        },
      },
    ]),
  ]);

  const extractCount = (facet, key) => facet[0]?.[key]?.[0]?.total || 0;
  const extractAvg = (facet, key) => Math.round(facet[0]?.[key]?.[0]?.avg || 0);
  const extractRate = (facet, key) =>
    Math.round(facet[0]?.[key]?.[0]?.tyLe || 0);

  const summary = {
    received: {
      daGiao: extractCount(receivedData, "daGiao"),
      dangLam: extractCount(receivedData, "dangLam"),
      choDuyet: extractCount(receivedData, "choDuyet"),
      hoanThanh: extractCount(receivedData, "hoanThanh"),
      avgProgress: extractAvg(receivedData, "avgProgress"),
      sapQuaHan: extractCount(receivedData, "sapQuaHan"),
      tyLeDungHan: extractRate(receivedData, "tyLeDungHan"),
      choDuyetSapQuaHan: 0, // Optional enhancement
    },
    assigned: {
      quaHan: extractCount(assignedData, "quaHan"),
      dangThucHien: extractCount(assignedData, "dangThucHien"),
      choDuyet: extractCount(assignedData, "choDuyet"),
      hoanThanh: extractCount(assignedData, "hoanThanh"),
      avgProgress: extractAvg(assignedData, "avgProgress"),
      canCheck: extractCount(assignedData, "canCheck"),
      tyLeDungHan: extractRate(assignedData, "tyLeDungHan"),
      choDuyetSapQuaHan: 0, // Optional
    },
  };

  return sendResponse(
    res,
    200,
    true,
    summary,
    null,
    "Lấy dashboard summary thành công"
  );
});
```

**Add to routes:**

```javascript
router.get("/dashboard-summary/:nhanVienId", getDashboardSummary);
```

**Add indexes (if not exist):**

```javascript
CongViecSchema.index({ NguoiChinhID: 1, TrangThai: 1, NgayHoanThanh: 1 });
CongViecSchema.index({ NguoiGiaoViec: 1, TrangThai: 1, NgayHetHan: 1 });
```

---

### 4.4 Redux Integration (2h)

**File:** `src/features/QuanLyCongViec/CongViec/congViecSlice.js`

```javascript
// Add to initialState
const initialState = {
  // ... existing state ...

  dashboardSummary: {
    received: null,
    assigned: null,
  },
  loadingDashboard: false,
  lastDashboardFetch: null, // Cache timestamp
};

// Add to reducers
const slice = createSlice({
  name: "congViec",
  initialState,
  reducers: {
    // ... existing reducers ...

    startLoadingDashboard: (state) => {
      state.loadingDashboard = true;
    },
    getDashboardSuccess: (state, action) => {
      state.loadingDashboard = false;
      state.dashboardSummary = action.payload;
      state.lastDashboardFetch = Date.now();
    },
    getDashboardError: (state, action) => {
      state.loadingDashboard = false;
      toast.error(action.payload);
    },
  },
});

// Add thunk
export const getCongViecDashboard =
  (nhanVienId, forceRefresh = false) =>
  async (dispatch, getState) => {
    const { congViec } = getState();

    // Cache 5 minutes
    const cacheValid =
      congViec.lastDashboardFetch &&
      Date.now() - congViec.lastDashboardFetch < 5 * 60 * 1000;

    if (!forceRefresh && cacheValid) {
      return; // Use cached data
    }

    dispatch(slice.actions.startLoadingDashboard());
    try {
      const response = await apiService.get(
        `/workmanagement/congviec/dashboard-summary/${nhanVienId}`
      );
      dispatch(slice.actions.getDashboardSuccess(response.data.data));
    } catch (error) {
      dispatch(slice.actions.getDashboardError(error.message));
    }
  };
```

---

### 4.5 Route & Menu Updates (1h)

**File:** `src/routes/index.js`

```javascript
// Replace old route
// OLD: <Route path="/congviec/:id" element={<CongViecByNhanVienPage />} />

// NEW:
<Route path="/quanlycongviec/congviec/dashboard" element={<CongViecDashboardPage />} />
<Route path="/quanlycongviec/congviec/list/:nhanVienId" element={<CongViecListPage />} />
```

**File:** `src/layouts/MainLayout/MenuItems.js`

```javascript
// Update menu item
{
  id: 'congviec',
  title: 'Công việc',
  type: 'item',
  url: '/quanlycongviec/congviec/dashboard', // Changed from /congviec/:id
  icon: icons.IconCheckbox,
}
```

**File:** `src/utils/navigationHelper.js`

```javascript
export const WorkRoutes = {
  // ... existing routes ...

  congViecDashboard: () => "/quanlycongviec/congviec/dashboard",

  congViecList: (nhanVienId, params = {}) => {
    const { role = "received", status = "all" } = params;
    return `/quanlycongviec/congviec/list/${nhanVienId}?role=${role}&status=${status}`;
  },

  congViecCreate: () => "/quanlycongviec/congviec/tao-moi",
};
```

---

### 4.6 CongViecFilterPanel Update (1h)

**File:** `src/features/QuanLyCongViec/CongViec/CongViecFilterPanel.js`

Add prop to hide TrangThai filter (now in tabs):

```javascript
function CongViecFilterPanel({
  filters,
  onFilterChange,
  hideTrangThaiFilter = false, // NEW PROP
}) {
  return (
    <Box>
      {/* ... other filters ... */}

      {!hideTrangThaiFilter && (
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select
            value={filters.TrangThai || ""}
            onChange={(e) => onFilterChange("TrangThai", e.target.value)}
          >
            {/* ... options ... */}
          </Select>
        </FormControl>
      )}

      {/* ... other filters ... */}
    </Box>
  );
}
```

---

### ✅ Testing Checklist (Section 4)

#### Dashboard Testing

- [ ] Summary counts accurate (vs DB)
- [ ] Click card navigates with correct URL params
- [ ] Mobile stacked layout works
- [ ] Loading skeletons show
- [ ] Cache works (no refetch < 5 min)

#### Nested Tabs Testing

- [ ] Desktop: Both levels work
- [ ] Mobile: Segment + dropdown work
- [ ] URL params sync with tabs
- [ ] Browser back/forward works
- [ ] Status counts update correctly
- [ ] Filters sync with active tab

#### Integration Testing

- [ ] Flow: Unified Dashboard → Module Dashboard → List View
- [ ] Pre-selected tabs work (from card drill-down)
- [ ] Menu navigation correct
- [ ] Breadcrumbs accurate

#### Data Consistency

- [ ] Received vs Assigned data correct
- [ ] Status filtering accurate
- [ ] Quá hạn logic correct (overdue calculation)
- [ ] Pagination works per tab

---

## 📊 Phase 3 Summary

### Total Timeline: 38h (was 23h + 15h added)

| Section | Component             | Hours | Status     |
| ------- | --------------------- | ----- | ---------- |
| 1-3     | Unified Dashboard     | 23h   | Documented |
| 4.1     | CongViecDashboardPage | 8h    | ✅ Added   |
| 4.2     | Nested Tabs           | 10h   | ✅ Added   |
| 4.3     | Backend API           | 2h    | ✅ Added   |
| 4.4     | Integration           | 3h    | ✅ Added   |

### Key Deliverables

1. ✅ **Unified Dashboard** - Cross-module summary
2. ✅ **CongViec Module Dashboard** - Drill-down cards
3. ✅ **Nested Tabs Pattern** - 2-level (Role × Status)
4. ✅ **Mobile Responsive** - Segment + dropdown
5. ✅ **Backend APIs** - Dashboard aggregations

---

**Next Phase:** [04_PHASE_4_TESTING_DEPLOY.md](./04_PHASE_4_TESTING_DEPLOY.md)
