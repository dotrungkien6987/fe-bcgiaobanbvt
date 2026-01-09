# Phase 2: Dashboard Architecture

**Thời gian:** 40 giờ  
**Ưu tiên:** 🔴 HIGH  
**Trạng thái:** ⏸️ Blocked by Phase 0

---

## 🎯 Mục Tiêu

Tạo dashboard system cho QuanLyCongViec module + Redesign "Công việc của tôi" (716 dòng → Dashboard drill-down architecture).

### Vision

```
Current:                          Target:
┌─────────────────────┐          ┌─────────────────────┐
│ List View (flat)    │          │ Dashboard Overview  │
│ ┌─────────────────┐ │          │ ┌───────┬─────────┐ │
│ │ Filter: Status  │ │          │ │Nhận 5 │Giao 3   │ │
│ └─────────────────┘ │   →      │ ├───────┼─────────┤ │
│ • Task 1 Đã giao   │          │ │Làm 12 │TH 8     │ │
│ • Task 2 Đang làm  │          │ └───────┴─────────┘ │
│ • Task 3 Chờ duyệt │          │  Click card → List  │
│ • ...              │          └─────────────────────┘
└─────────────────────┘
```

---

## 📦 Deliverables

### 2A. Backend APIs (2h)

- ✅ `GET /workmanagement/dashboard/summary` - Unified dashboard
- ✅ `GET /workmanagement/congviec/dashboard-summary/:nhanVienId` - CongViec stats

### 2B. Unified Dashboard (15h)

- ✅ `UnifiedDashboardPage.js` - Entry point
- ✅ 3 Summary cards (CongViec, KPI, Ticket)
- ✅ Redux `dashboardSlice`

### 2C. "Công việc của tôi" UI/UX (23h) ⭐ CORE

- ✅ **2C.1: Dashboard Pages (14h)** - CongViecDashboardPage với 8 StatusCards
- ✅ **2C.2: List Page Refactor (14h)** - CongViecListPage với nested tabs

---

## 📋 Task Breakdown (40h)

## PHASE 2A: Backend APIs (2h)

### Task 2A.1: Dashboard Summary API (1h)

**File:** `giaobanbv-be/modules/workmanagement/controllers/dashboard.controller.js`

**Purpose:** Aggregate data từ 3 modules (CongViec, KPI, Ticket)

**Implementation:**

```javascript
const {
  catchAsync,
  sendResponse,
  AppError,
} = require("../../../helpers/utils");
const CongViec = require("../models/CongViec");
const DanhGiaKPI = require("../models/DanhGiaKPI");
const YeuCau = require("../models/YeuCau");

/**
 * GET /api/workmanagement/dashboard/summary
 * Unified dashboard summary for all 3 modules
 */
dashboardController.getDashboardSummary = catchAsync(async (req, res, next) => {
  const { userId } = req; // From auth middleware
  const { nhanVienId } = req.query; // Current employee ID

  if (!nhanVienId) {
    throw new AppError(400, "NhanVienID is required", "MISSING_PARAM");
  }

  // Parallel aggregations for performance
  const [congViecSummary, kpiSummary, yeuCauSummary] = await Promise.all([
    // CongViec summary
    CongViec.aggregate([
      {
        $match: {
          $or: [
            { NguoiChinhID: nhanVienId }, // Received tasks
            { NguoiGiaoID: nhanVienId }, // Assigned tasks
          ],
        },
      },
      {
        $group: {
          _id: null,
          totalReceived: {
            $sum: { $cond: [{ $eq: ["$NguoiChinhID", nhanVienId] }, 1, 0] },
          },
          totalAssigned: {
            $sum: { $cond: [{ $eq: ["$NguoiGiaoID", nhanVienId] }, 1, 0] },
          },
          receivedPending: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$NguoiChinhID", nhanVienId] },
                    { $eq: ["$TrangThai", "DA_GIAO"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          receivedInProgress: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$NguoiChinhID", nhanVienId] },
                    { $eq: ["$TrangThai", "DANG_LAM"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          receivedCompleted: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$NguoiChinhID", nhanVienId] },
                    { $eq: ["$TrangThai", "HOAN_THANH"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]).then((result) => result[0] || {}),

    // KPI summary
    DanhGiaKPI.aggregate([
      { $match: { NhanVienID: nhanVienId } },
      {
        $group: {
          _id: null,
          totalEvaluations: { $sum: 1 },
          pendingEvaluations: {
            $sum: { $cond: [{ $eq: ["$TrangThai", "CHUA_DUYET"] }, 1, 0] },
          },
          approvedEvaluations: {
            $sum: { $cond: [{ $eq: ["$TrangThai", "DA_DUYET"] }, 1, 0] },
          },
          avgScore: { $avg: "$TongDiemKPI" },
        },
      },
    ]).then((result) => result[0] || {}),

    // YeuCau/Ticket summary
    YeuCau.aggregate([
      {
        $match: {
          $or: [
            { NguoiGuiID: userId }, // Sent requests
            { NguoiXuLyID: nhanVienId }, // Handling requests
          ],
        },
      },
      {
        $group: {
          _id: null,
          totalSent: {
            $sum: { $cond: [{ $eq: ["$NguoiGuiID", userId] }, 1, 0] },
          },
          totalHandling: {
            $sum: { $cond: [{ $eq: ["$NguoiXuLyID", nhanVienId] }, 1, 0] },
          },
          pendingRequests: {
            $sum: { $cond: [{ $eq: ["$TrangThai", "CHO_XU_LY"] }, 1, 0] },
          },
          resolvedRequests: {
            $sum: { $cond: [{ $eq: ["$TrangThai", "DA_XU_LY"] }, 1, 0] },
          },
        },
      },
    ]).then((result) => result[0] || {}),
  ]);

  const summary = {
    congViec: congViecSummary,
    kpi: kpiSummary,
    yeuCau: yeuCauSummary,
  };

  return sendResponse(
    res,
    200,
    true,
    { summary },
    null,
    "Lấy dashboard summary thành công"
  );
});

module.exports = dashboardController;
```

**Route:**

```javascript
// giaobanbv-be/modules/workmanagement/routes/dashboard.route.js
const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");
const { loginRequired } = require("../../../middlewares/authentication");

router.get("/summary", loginRequired, dashboardController.getDashboardSummary);

module.exports = router;
```

**Index route:**

```javascript
// giaobanbv-be/modules/workmanagement/routes/index.js
const dashboardRoute = require("./dashboard.route");
router.use("/dashboard", dashboardRoute);
```

---

### Task 2A.2: CongViec Dashboard API (1h)

**File:** `giaobanbv-be/modules/workmanagement/controllers/congviec.controller.js`

**New Method:**

```javascript
/**
 * GET /api/workmanagement/congviec/dashboard-summary/:nhanVienId
 * Detailed stats for "Công việc của tôi" dashboard
 */
congViecController.getDashboardSummary = catchAsync(async (req, res, next) => {
  const { nhanVienId } = req.params;

  if (!nhanVienId) {
    throw new AppError(400, "NhanVienID is required", "MISSING_PARAM");
  }

  // Aggregation for received tasks
  const receivedStats = await CongViec.aggregate([
    { $match: { NguoiChinhID: nhanVienId } },
    {
      $facet: {
        byStatus: [
          {
            $group: {
              _id: "$TrangThai",
              count: { $sum: 1 },
              avgProgress: { $avg: "$TienDoHoanThanh" },
            },
          },
        ],
        overdue: [
          {
            $match: {
              NgayHetHan: { $lt: new Date() },
              TrangThai: { $nin: ["HOAN_THANH", "HUY"] },
            },
          },
          { $count: "count" },
        ],
        dueSoon: [
          {
            $match: {
              NgayHetHan: {
                $gte: new Date(),
                $lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Next 3 days
              },
              TrangThai: { $nin: ["HOAN_THANH", "HUY"] },
            },
          },
          { $count: "count" },
        ],
      },
    },
  ]);

  // Aggregation for assigned tasks
  const assignedStats = await CongViec.aggregate([
    { $match: { NguoiGiaoID: nhanVienId } },
    {
      $facet: {
        byStatus: [
          {
            $group: {
              _id: "$TrangThai",
              count: { $sum: 1 },
              avgProgress: { $avg: "$TienDoHoanThanh" },
            },
          },
        ],
        overdue: [
          {
            $match: {
              NgayHetHan: { $lt: new Date() },
              TrangThai: { $nin: ["HOAN_THANH", "HUY"] },
            },
          },
          { $count: "count" },
        ],
        completionRate: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              completed: {
                $sum: { $cond: [{ $eq: ["$TrangThai", "HOAN_THANH"] }, 1, 0] },
              },
            },
          },
          {
            $project: {
              rate: {
                $multiply: [{ $divide: ["$completed", "$total"] }, 100],
              },
            },
          },
        ],
      },
    },
  ]);

  // Transform to frontend-friendly format
  const formatStatusCounts = (facetResult) => {
    const byStatus = facetResult[0]?.byStatus || [];
    const statusMap = {
      DA_GIAO: 0,
      DANG_LAM: 0,
      CHO_DUYET: 0,
      HOAN_THANH: 0,
    };

    byStatus.forEach((item) => {
      if (statusMap.hasOwnProperty(item._id)) {
        statusMap[item._id] = item.count;
      }
    });

    return {
      daGiao: statusMap.DA_GIAO,
      dangLam: statusMap.DANG_LAM,
      choDuyet: statusMap.CHO_DUYET,
      hoanThanh: statusMap.HOAN_THANH,
      avgProgress: byStatus.find((s) => s._id === "DANG_LAM")?.avgProgress || 0,
      quaHan: facetResult[0]?.overdue[0]?.count || 0,
      sapQuaHan: facetResult[0]?.dueSoon[0]?.count || 0,
    };
  };

  const summary = {
    received: formatStatusCounts(receivedStats),
    assigned: {
      ...formatStatusCounts(assignedStats),
      completionRate: assignedStats[0]?.completionRate[0]?.rate || 0,
    },
  };

  return sendResponse(
    res,
    200,
    true,
    { summary },
    null,
    "Lấy CongViec dashboard summary thành công"
  );
});
```

**Route:**

```javascript
// giaobanbv-be/modules/workmanagement/routes/congviec.route.js
router.get(
  "/dashboard-summary/:nhanVienId",
  loginRequired,
  congViecController.getDashboardSummary
);
```

**Add indexes for performance:**

```javascript
// giaobanbv-be/modules/workmanagement/models/CongViec.js
CongViecSchema.index({ NguoiChinhID: 1, TrangThai: 1 });
CongViecSchema.index({ NguoiGiaoID: 1, TrangThai: 1 });
CongViecSchema.index({ NgayHetHan: 1, TrangThai: 1 });
```

---

## PHASE 2B: Unified Dashboard (15h)

### Task 2B.1: Create dashboardSlice (3h)

**File:** `src/features/QuanLyCongViec/Dashboard/dashboardSlice.js`

**Implementation:**

```javascript
import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import apiService from "app/apiService";

const initialState = {
  isLoading: false,
  error: null,

  // Unified dashboard data
  summary: {
    congViec: null,
    kpi: null,
    yeuCau: null,
  },
  lastFetchedAt: null,

  // Cache duration (5 minutes)
  cacheDuration: 5 * 60 * 1000,
};

const slice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
      state.error = null;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getDashboardSummarySuccess(state, action) {
      state.isLoading = false;
      state.summary = action.payload;
      state.lastFetchedAt = Date.now();
    },
    clearDashboard(state) {
      state.summary = initialState.summary;
      state.lastFetchedAt = null;
    },
  },
});

export const {
  startLoading,
  hasError,
  getDashboardSummarySuccess,
  clearDashboard,
} = slice.actions;

/**
 * Get dashboard summary (with cache)
 */
export const getDashboardSummary =
  (nhanVienId, forceRefresh = false) =>
  async (dispatch, getState) => {
    const { lastFetchedAt, cacheDuration } = getState().dashboard;

    // Check cache
    if (!forceRefresh && lastFetchedAt) {
      const age = Date.now() - lastFetchedAt;
      if (age < cacheDuration) {
        console.log("Using cached dashboard data");
        return;
      }
    }

    dispatch(startLoading());
    try {
      const response = await apiService.get(
        `/workmanagement/dashboard/summary?nhanVienId=${nhanVienId}`
      );
      dispatch(getDashboardSummarySuccess(response.data.data.summary));
    } catch (error) {
      dispatch(hasError(error.message));
      toast.error(error.message);
    }
  };

export default slice.reducer;
```

**Add to store:**

```javascript
// src/app/store.js
import dashboardReducer from "features/QuanLyCongViec/Dashboard/dashboardSlice";

export const store = configureStore({
  reducer: {
    // ...existing
    dashboard: dashboardReducer,
  },
});
```

---

### Task 2B.2: Create UnifiedDashboardPage (6h)

**File:** `src/features/QuanLyCongViec/Dashboard/UnifiedDashboardPage.js`

**Implementation:**

```javascript
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Grid, Typography, Box, IconButton } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

import WorkManagementBreadcrumb from "../components/WorkManagementBreadcrumb";
import CongViecSummaryCard from "./components/CongViecSummaryCard";
import KPISummaryCard from "./components/KPISummaryCard";
import TicketSummaryCard from "./components/TicketSummaryCard";
import { getDashboardSummary } from "./dashboardSlice";
import { useAuth } from "hooks/useAuth";
import LoadingScreen from "components/LoadingScreen";

function UnifiedDashboardPage() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const nhanVienId = user?.NhanVienID;

  const { isLoading, summary } = useSelector((state) => state.dashboard);

  useEffect(() => {
    if (nhanVienId) {
      dispatch(getDashboardSummary(nhanVienId));
    }
  }, [dispatch, nhanVienId]);

  const handleRefresh = () => {
    dispatch(getDashboardSummary(nhanVienId, true)); // Force refresh
  };

  if (isLoading && !summary.congViec) {
    return <LoadingScreen />;
  }

  return (
    <Container maxWidth="xl">
      <WorkManagementBreadcrumb />

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Dashboard Quản lý công việc</Typography>
        <IconButton onClick={handleRefresh} disabled={isLoading}>
          <RefreshIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* CongViec Summary */}
        <Grid item xs={12} md={4}>
          <CongViecSummaryCard data={summary.congViec} loading={isLoading} />
        </Grid>

        {/* KPI Summary */}
        <Grid item xs={12} md={4}>
          <KPISummaryCard data={summary.kpi} loading={isLoading} />
        </Grid>

        {/* Ticket/YeuCau Summary */}
        <Grid item xs={12} md={4}>
          <TicketSummaryCard data={summary.yeuCau} loading={isLoading} />
        </Grid>
      </Grid>
    </Container>
  );
}

export default UnifiedDashboardPage;
```

---

### Task 2B.3: Create Summary Card Components (6h)

**File:** `src/features/QuanLyCongViec/Dashboard/components/CongViecSummaryCard.js`

```javascript
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
} from "@mui/material";
import { WorkRoutes } from "utils/navigationHelper";

function CongViecSummaryCard({ data, loading }) {
  const navigate = useNavigate();

  if (loading || !data) {
    return (
      <Card>
        <CardContent>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  const { totalReceived, totalAssigned, receivedPending, receivedInProgress } =
    data;

  return (
    <Card
      sx={{ cursor: "pointer", "&:hover": { boxShadow: 6 } }}
      onClick={() => navigate(WorkRoutes.congViecDashboard())}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Công việc của tôi
        </Typography>

        <Box display="flex" justifyContent="space-between" mt={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Việc nhận
            </Typography>
            <Typography variant="h4">{totalReceived || 0}</Typography>
            <Box mt={1}>
              <Chip
                label={`Cần xử lý: ${receivedPending || 0}`}
                size="small"
                color="warning"
              />
            </Box>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Việc giao
            </Typography>
            <Typography variant="h4">{totalAssigned || 0}</Typography>
            <Box mt={1}>
              <Chip
                label={`Đang làm: ${receivedInProgress || 0}`}
                size="small"
                color="info"
              />
            </Box>
          </Box>
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          mt={2}
          display="block"
        >
          Click để xem chi tiết →
        </Typography>
      </CardContent>
    </Card>
  );
}

export default CongViecSummaryCard;
```

**Similar for KPISummaryCard.js and TicketSummaryCard.js**

---

## PHASE 2C: "Công việc của tôi" UI/UX Redesign (23h) ⭐

### Sub-Phase 2C.1: Dashboard Pages (14h)

#### Task 2C.1.1: Backend Performance Optimization (2h)

**Move TinhTrangHan filter to server-side:**

```javascript
// giaobanbv-be/modules/workmanagement/controllers/congviec.controller.js

/**
 * GET /api/workmanagement/congviec/by-nhanvien/:nhanVienId
 * Add TinhTrangHan server-side filter
 */
congViecController.getCongViecByNhanVien = catchAsync(
  async (req, res, next) => {
    const { nhanVienId } = req.params;
    const { role, status, TinhTrangHan, ...otherFilters } = req.query;

    let filter = {};

    // Role filter
    if (role === "received") {
      filter.NguoiChinhID = nhanVienId;
    } else if (role === "assigned") {
      filter.NguoiGiaoID = nhanVienId;
    } else {
      // Both
      filter.$or = [{ NguoiChinhID: nhanVienId }, { NguoiGiaoID: nhanVienId }];
    }

    // Status filter
    if (status && status !== "ALL") {
      filter.TrangThai = status;
    }

    // TinhTrangHan filter (NEW - server-side)
    if (TinhTrangHan) {
      const now = new Date();
      switch (TinhTrangHan) {
        case "QUA_HAN":
          filter.NgayHetHan = { $lt: now };
          filter.TrangThai = { $nin: ["HOAN_THANH", "HUY"] };
          break;
        case "SAP_QUA_HAN":
          filter.NgayHetHan = {
            $gte: now,
            $lte: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
          };
          filter.TrangThai = { $nin: ["HOAN_THANH", "HUY"] };
          break;
        case "DUNG_HAN":
          filter.NgayHetHan = { $gte: now };
          break;
      }
    }

    // Other filters...

    const congViecs = await CongViec.find(filter)
      .populate("NguoiChinhID", "HoTen")
      .populate("NguoiGiaoID", "HoTen")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalCount = await CongViec.countDocuments(filter);

    return sendResponse(
      res,
      200,
      true,
      { congViecs, totalCount, totalPages: Math.ceil(totalCount / limit) },
      null,
      "Lấy danh sách công việc thành công"
    );
  }
);
```

**Add index:**

```javascript
// models/CongViec.js
CongViecSchema.index({ NgayHetHan: 1, TrangThai: 1 });
```

---

#### Task 2C.1.2: Create CongViecDashboardPage (8h)

**File:** `src/features/QuanLyCongViec/CongViec/CongViecDashboardPage.js`

```javascript
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Grid,
  Typography,
  Box,
  IconButton,
  Divider,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

import WorkManagementBreadcrumb from "../components/WorkManagementBreadcrumb";
import StatusCard from "./components/StatusCard";
import { getCongViecDashboardSummary } from "./congViecSlice";
import { useAuth } from "hooks/useAuth";
import LoadingScreen from "components/LoadingScreen";
import { WorkRoutes } from "utils/navigationHelper";

function CongViecDashboardPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const nhanVienId = user?.NhanVienID;

  const { dashboardSummary, isLoadingDashboard } = useSelector(
    (state) => state.congviec
  );

  useEffect(() => {
    if (nhanVienId) {
      dispatch(getCongViecDashboardSummary(nhanVienId));
    }
  }, [dispatch, nhanVienId]);

  const handleRefresh = () => {
    dispatch(getCongViecDashboardSummary(nhanVienId, true));
  };

  const handleCardClick = (role, status) => {
    // Navigate to list page with filters
    navigate(
      `${WorkRoutes.congViecList(nhanVienId)}?role=${role}&status=${status}`
    );
  };

  if (isLoadingDashboard && !dashboardSummary) {
    return <LoadingScreen />;
  }

  const { received = {}, assigned = {} } = dashboardSummary || {};

  return (
    <Container maxWidth="xl">
      <WorkManagementBreadcrumb />

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Công việc của tôi</Typography>
        <IconButton onClick={handleRefresh} disabled={isLoadingDashboard}>
          <RefreshIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* VIỆC TÔI NHẬN */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Việc tôi nhận
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <StatusCard
                title="Đã giao"
                count={received.daGiao || 0}
                color="warning"
                icon="inbox"
                onClick={() => handleCardClick("received", "DA_GIAO")}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <StatusCard
                title="Đang làm"
                count={received.dangLam || 0}
                subtitle={`Tiến độ TB: ${Math.round(
                  received.avgProgress || 0
                )}%`}
                color="info"
                icon="trending_up"
                onClick={() => handleCardClick("received", "DANG_LAM")}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <StatusCard
                title="Chờ duyệt"
                count={received.choDuyet || 0}
                color="secondary"
                icon="schedule"
                onClick={() => handleCardClick("received", "CHO_DUYET")}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <StatusCard
                title="Hoàn thành"
                count={received.hoanThanh || 0}
                color="success"
                icon="check_circle"
                onClick={() => handleCardClick("received", "HOAN_THANH")}
              />
            </Grid>

            {received.quaHan > 0 && (
              <Grid item xs={12}>
                <StatusCard
                  title="⚠️ Quá hạn"
                  count={received.quaHan}
                  color="error"
                  icon="warning"
                  onClick={() => handleCardClick("received", "QUA_HAN")}
                />
              </Grid>
            )}
          </Grid>
        </Grid>

        {/* VIỆC TÔI GIAO */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Việc tôi giao
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            {assigned.quaHan > 0 && (
              <Grid item xs={12}>
                <StatusCard
                  title="🔴 Quá hạn"
                  count={assigned.quaHan}
                  color="error"
                  icon="error"
                  onClick={() => handleCardClick("assigned", "QUA_HAN")}
                />
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <StatusCard
                title="Đang thực hiện"
                count={assigned.dangLam || 0}
                subtitle={`Tiến độ TB: ${Math.round(
                  assigned.avgProgress || 0
                )}%`}
                color="info"
                icon="trending_up"
                onClick={() => handleCardClick("assigned", "DANG_LAM")}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <StatusCard
                title="Chờ duyệt"
                count={assigned.choDuyet || 0}
                color="secondary"
                icon="schedule"
                onClick={() => handleCardClick("assigned", "CHO_DUYET")}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <StatusCard
                title="Hoàn thành"
                count={assigned.hoanThanh || 0}
                subtitle={`Tỷ lệ: ${Math.round(assigned.completionRate || 0)}%`}
                color="success"
                icon="check_circle"
                onClick={() => handleCardClick("assigned", "HOAN_THANH")}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}

export default CongViecDashboardPage;
```

---

#### Task 2C.1.3: Create StatusCard Component (2h)

**File:** `src/features/QuanLyCongViec/CongViec/components/StatusCard.js`

```javascript
import React from "react";
import { Card, CardContent, Typography, Box, Icon } from "@mui/material";

function StatusCard({
  title,
  count,
  subtitle,
  color = "primary",
  icon,
  onClick,
}) {
  return (
    <Card
      sx={{
        cursor: "pointer",
        transition: "all 0.2s",
        "&:hover": {
          boxShadow: 6,
          transform: "translateY(-2px)",
        },
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h3" color={`${color}.main`}>
              {count}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                color="text.secondary"
                mt={1}
                display="block"
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          <Icon
            sx={{
              fontSize: 48,
              color: `${color}.light`,
              opacity: 0.5,
            }}
          >
            {icon}
          </Icon>
        </Box>
      </CardContent>
    </Card>
  );
}

export default StatusCard;
```

---

#### Task 2C.1.4: Update congViecSlice (2h)

**File:** `src/features/QuanLyCongViec/CongViec/congViecSlice.js`

**Add dashboard state:**

```javascript
const initialState = {
  // ...existing state

  // Dashboard state (NEW)
  dashboardSummary: null,
  isLoadingDashboard: false,
  lastDashboardFetch: null,
  dashboardCacheDuration: 5 * 60 * 1000, // 5 minutes
};

const slice = createSlice({
  name: "congviec",
  initialState,
  reducers: {
    // ...existing reducers

    // Dashboard reducers (NEW)
    startLoadingDashboard(state) {
      state.isLoadingDashboard = true;
    },
    getDashboardSummarySuccess(state, action) {
      state.isLoadingDashboard = false;
      state.dashboardSummary = action.payload;
      state.lastDashboardFetch = Date.now();
    },
    dashboardHasError(state, action) {
      state.isLoadingDashboard = false;
      state.error = action.payload;
    },
  },
});

export const {
  // ...existing exports
  startLoadingDashboard,
  getDashboardSummarySuccess,
  dashboardHasError,
} = slice.actions;

/**
 * Get CongViec dashboard summary (with cache)
 */
export const getCongViecDashboardSummary =
  (nhanVienId, forceRefresh = false) =>
  async (dispatch, getState) => {
    const { lastDashboardFetch, dashboardCacheDuration } = getState().congviec;

    // Check cache
    if (!forceRefresh && lastDashboardFetch) {
      const age = Date.now() - lastDashboardFetch;
      if (age < dashboardCacheDuration) {
        return;
      }
    }

    dispatch(startLoadingDashboard());
    try {
      const response = await apiService.get(
        `/workmanagement/congviec/dashboard-summary/${nhanVienId}`
      );
      dispatch(getDashboardSummarySuccess(response.data.data.summary));
    } catch (error) {
      dispatch(dashboardHasError(error.message));
      toast.error(error.message);
    }
  };
```

---

### Sub-Phase 2C.2: List Page Refactor (14h)

#### Task 2C.2.1: Create CongViecNestedTabs Component (4h)

**File:** `src/features/QuanLyCongViec/CongViec/components/CongViecNestedTabs.js`

```javascript
import React from "react";
import { Tabs, Tab, Box, Chip, useMediaQuery, useTheme } from "@mui/material";

function CongViecNestedTabs({
  role,
  status,
  onRoleChange,
  onStatusChange,
  counts = {},
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const statusTabs = [
    { value: "ALL", label: "Tất cả", count: counts.all || 0 },
    { value: "DA_GIAO", label: "Đã giao", count: counts.daGiao || 0 },
    { value: "DANG_LAM", label: "Đang làm", count: counts.dangLam || 0 },
    { value: "CHO_DUYET", label: "Chờ duyệt", count: counts.choDuyet || 0 },
    { value: "HOAN_THANH", label: "Hoàn thành", count: counts.hoanThanh || 0 },
  ];

  if (isMobile) {
    // Mobile: Vertical stacked
    return (
      <Box>
        {/* Level 1: Role tabs */}
        <Tabs
          value={role}
          onChange={(e, newValue) => onRoleChange(newValue)}
          variant="fullWidth"
          sx={{ mb: 2 }}
        >
          <Tab label="Việc tôi nhận" value="received" />
          <Tab label="Việc tôi giao" value="assigned" />
        </Tabs>

        {/* Level 2: Status chips */}
        <Box display="flex" gap={1} flexWrap="wrap">
          {statusTabs.map((tab) => (
            <Chip
              key={tab.value}
              label={`${tab.label} (${tab.count})`}
              color={status === tab.value ? "primary" : "default"}
              variant={status === tab.value ? "filled" : "outlined"}
              onClick={() => onStatusChange(tab.value)}
              sx={{ minWidth: 80 }}
            />
          ))}
        </Box>
      </Box>
    );
  }

  // Desktop: Two-level horizontal tabs
  return (
    <Box>
      {/* Level 1: Role tabs */}
      <Tabs
        value={role}
        onChange={(e, newValue) => onRoleChange(newValue)}
        sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
      >
        <Tab label="Việc tôi nhận" value="received" />
        <Tab label="Việc tôi giao" value="assigned" />
      </Tabs>

      {/* Level 2: Status tabs */}
      <Tabs
        value={status}
        onChange={(e, newValue) => onStatusChange(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2 }}
      >
        {statusTabs.map((tab) => (
          <Tab
            key={tab.value}
            label={
              <Box display="flex" alignItems="center" gap={1}>
                {tab.label}
                <Chip label={tab.count} size="small" color="primary" />
              </Box>
            }
            value={tab.value}
          />
        ))}
      </Tabs>
    </Box>
  );
}

export default CongViecNestedTabs;
```

---

#### Task 2C.2.2: URL Params Integration (2h)

**File:** `src/features/QuanLyCongViec/CongViec/CongViecListPage.js` (partial - URL logic)

```javascript
import { useSearchParams } from "react-router-dom";

function CongViecListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get params from URL
  const role = searchParams.get("role") || "received";
  const status = searchParams.get("status") || "ALL";

  const handleRoleChange = (newRole) => {
    setSearchParams({ role: newRole, status: "ALL" }); // Reset status
  };

  const handleStatusChange = (newStatus) => {
    setSearchParams({ role, status: newStatus });
  };

  // Update filters when URL changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      role,
      TrangThai: status === "ALL" ? "" : status,
    }));
  }, [role, status]);

  // ... rest of component
}
```

**Browser back button support:** Works automatically with `useSearchParams`  
**Deep linking:** URL like `/quanlycongviec/congviec/nhanvien/123?role=received&status=DANG_LAM` works

---

#### Task 2C.2.3: Refactor CongViecByNhanVienPage → CongViecListPage (6h)

**File:** Rename `CongViecByNhanVienPage.js` → `CongViecListPage.js`

**Major changes:**

```javascript
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Container, Box, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import WorkManagementBreadcrumb from "../components/WorkManagementBreadcrumb";
import CongViecNestedTabs from "./components/CongViecNestedTabs";
import CongViecTable from "./components/CongViecTable";
import FilterPanel from "./components/FilterPanel";
import CreateCongViecDialog from "./components/CreateCongViecDialog";
import { getCongViecByNhanVien } from "./congViecSlice";
import { useCongViecFilters, useCongViecPagination } from "./hooks";

function CongViecListPage() {
  const { nhanVienId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  // URL params
  const role = searchParams.get("role") || "received";
  const statusParam = searchParams.get("status") || "ALL";

  // Custom hooks
  const { filters, setFilters, debouncedFilters } = useCongViecFilters();
  const { page, limit, handlePageChange, handleLimitChange } =
    useCongViecPagination();

  // Redux state
  const { congViecs, totalCount, isLoading } = useSelector(
    (state) => state.congviec
  );

  // Dialog states
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  // Tab change handlers
  const handleRoleChange = useCallback(
    (newRole) => {
      setSearchParams({ role: newRole, status: "ALL" });
    },
    [setSearchParams]
  );

  const handleStatusChange = useCallback(
    (newStatus) => {
      setSearchParams({ role, status: newStatus });
    },
    [role, setSearchParams]
  );

  // Sync URL params with filters
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      role,
      TrangThai: statusParam === "ALL" ? "" : statusParam,
    }));
  }, [role, statusParam, setFilters]);

  // Fetch data
  useEffect(() => {
    const fetchParams = {
      ...debouncedFilters,
      role,
      status: statusParam === "ALL" ? "" : statusParam,
      page,
      limit,
    };

    dispatch(getCongViecByNhanVien(nhanVienId, fetchParams));
  }, [dispatch, nhanVienId, debouncedFilters, role, statusParam, page, limit]);

  // Calculate status counts (for tabs)
  const statusCounts = useMemo(() => {
    // TODO: Get from dashboard summary or calculate
    return {
      all: totalCount,
      daGiao: 0, // From backend
      dangLam: 0,
      choDuyet: 0,
      hoanThanh: 0,
    };
  }, [totalCount]);

  return (
    <Container maxWidth="xl">
      <WorkManagementBreadcrumb />

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateDialog(true)}
        >
          Tạo công việc mới
        </Button>
      </Box>

      {/* Nested Tabs (replaces TabContext) */}
      <CongViecNestedTabs
        role={role}
        status={statusParam}
        onRoleChange={handleRoleChange}
        onStatusChange={handleStatusChange}
        counts={statusCounts}
      />

      {/* Filter Panel (TrangThai removed) */}
      <FilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        hideTrangThai // NEW PROP - hide status filter (now in tabs)
      />

      {/* Table */}
      <CongViecTable
        data={congViecs}
        loading={isLoading}
        totalCount={totalCount}
        page={page}
        limit={limit}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />

      {/* Create Dialog */}
      <CreateCongViecDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
      />
    </Container>
  );
}

export default CongViecListPage;
```

**Key Changes:**

1. ✅ Renamed file
2. ✅ `TabContext` → `CongViecNestedTabs`
3. ✅ URL params with `useSearchParams`
4. ✅ `TrangThai` removed from FilterPanel (now in tabs)
5. ✅ Custom hooks extracted

---

#### Task 2C.2.4: Extract Custom Hooks (2h)

**File:** `src/features/QuanLyCongViec/CongViec/hooks/useCongViecFilters.js`

```javascript
import { useState, useEffect, useRef } from "react";

export function useCongViecFilters(initialFilters = {}) {
  const [filters, setFilters] = useState({
    textSearch: "",
    MaCongViec: "",
    MucDoUuTien: "",
    NgayBatDau: null,
    NgayHetHan: null,
    NguoiChinhID: "",
    TinhTrangHan: "",
    ...initialFilters,
  });

  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const debounceRef = useRef(null);

  // Debounce filters (250ms)
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 250);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [filters]);

  return { filters, setFilters, debouncedFilters };
}
```

**File:** `src/features/QuanLyCongViec/CongViec/hooks/useCongViecPagination.js`

```javascript
import { useState } from "react";

export function useCongViecPagination(initialPage = 1, initialLimit = 10) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page
  };

  return {
    page,
    limit,
    handlePageChange,
    handleLimitChange,
  };
}
```

**Export from index:**

```javascript
// src/features/QuanLyCongViec/CongViec/hooks/index.js
export * from "./useCongViecFilters";
export * from "./useCongViecPagination";
```

---

## ✅ Success Criteria

### Phase 2A: Backend

- [ ] Dashboard summary API returns data for 3 modules
- [ ] CongViec dashboard API returns 8 status counts
- [ ] APIs return in < 500ms
- [ ] MongoDB indexes created

### Phase 2B: Unified Dashboard

- [ ] UnifiedDashboardPage shows 3 summary cards
- [ ] Cards clickable → Navigate to module dashboards
- [ ] 5-min cache works
- [ ] Refresh button works

### Phase 2C.1: CongViec Dashboard

- [ ] CongViecDashboardPage shows 8 StatusCards (2 columns)
- [ ] Mobile: Cards stack vertically
- [ ] Desktop: 2-column grid
- [ ] Click card → Navigate with filters
- [ ] Badge counts accurate
- [ ] TinhTrangHan filter server-side

### Phase 2C.2: List Page Refactor

- [ ] File renamed to CongViecListPage.js
- [ ] Nested tabs work (2 levels)
- [ ] URL params sync (?role=received&status=DA_GIAO)
- [ ] Browser back button works
- [ ] Deep links work
- [ ] TrangThai removed from FilterPanel
- [ ] Custom hooks extracted
- [ ] Mobile: Chips for status
- [ ] Desktop: Horizontal tabs

---

## 🧪 Testing Checklist

### Backend Tests

- [ ] GET /dashboard/summary returns correct structure
- [ ] GET /congviec/dashboard-summary/:id returns 8 counts
- [ ] TinhTrangHan filter QUA_HAN works
- [ ] TinhTrangHan filter SAP_QUA_HAN works
- [ ] Performance < 500ms

### Navigation Tests

- [ ] Menu "Công việc của tôi" → Dashboard page
- [ ] Click StatusCard → List page with filters
- [ ] URL params persist on refresh
- [ ] Browser back/forward works
- [ ] Deep link works

### UI Tests

- [ ] Dashboard responsive (320px - 1920px)
- [ ] Cards hover effect works
- [ ] Badge counts display
- [ ] Nested tabs work (Level 1 & 2)
- [ ] Mobile chips work
- [ ] Loading states show
- [ ] Error states show

### Data Accuracy Tests

- [ ] StatusCard counts match backend
- [ ] Filters match URL params
- [ ] Cache invalidates after 5 min
- [ ] Refresh forces new fetch

---

## 🚧 Dependencies

**Required:**

- ⚠️ **Phase 0** - Needs `WorkRoutes`, `WorkManagementBreadcrumb`

**Optional:**

- Phase 1 (Mobile Nav) - "Công việc" tab will link to dashboard

---

## 🚨 Risks & Mitigation

| Risk                    | Mitigation                                                    |
| ----------------------- | ------------------------------------------------------------- |
| Backend performance     | - MongoDB indexes<br>- Parallel aggregations<br>- 5-min cache |
| URL params bugs         | - Thorough testing<br>- Default values                        |
| Data sync issues        | - Clear cache on actions<br>- Optimistic updates              |
| 716-line refactor risks | - Incremental approach<br>- Test after each step              |

---

## 📝 Notes

- **Sequential sub-phases:** 2C.1 (Dashboard) must finish before 2C.2 (List refactor)
- **Testing critical:** 716-line refactor is risky - test thoroughly
- **Cache strategy:** 5-min cache for dashboard, no cache for list (real-time)
- **Mobile-first:** StatusCards and nested tabs designed for touch

---

**Next Phase:** Phase 3 - Splash + Mobile Layouts
