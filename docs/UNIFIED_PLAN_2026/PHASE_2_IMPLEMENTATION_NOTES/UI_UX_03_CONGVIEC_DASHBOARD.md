# Phase 2 UI/UX - Công Việc Dashboard

**Part 3 of 5**  
**Screen:** CongViecDashboardPage  
**Type:** New Page  
**Effort:** 8h  
**Status:** ❌ Need to Create

---

## 📱 Screen Layout (Mobile)

```
┌────────────────────────────────────────────────┐
│ ← Công Việc                    [+ Tạo] [⋮]    │
├────────────────────────────────────────────────┤
│                                                │
│  📥 VIỆC TÔI NHẬN (12)            [Xem tất cả →]│
│  ┌──────────────────────────────────────────┐ │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │ │
│  │  │ Chờ  │ │Đang  │ │ Chờ  │ │Hoàn  │    │ │
│  │  │nhận  │ │làm   │ │duyệt │ │thành │    │ │
│  │  │  3   │ │  7   │ │  2   │ │ 34   │    │ │
│  │  └──────┘ └──────┘ └──────┘ └──────┘    │ │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │ │
│  │  │Từ    │ │Cần   │ │Quá   │ │Sắp   │    │ │
│  │  │chối  │ │bổ sung│ │hạn   │ │hạn   │    │ │
│  │  │  1   │ │  2   │ │  3   │ │  5   │    │ │
│  │  └──────┘ └──────┘ └──────┘ └──────┘    │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ⚠️ CẢNH BÁO DEADLINE (3)                     │
│  ┌──────────────────────────────────────────┐ │
│  │ 🔴 CV-001: Báo cáo tháng...   [Quá hạn]  │ │
│  │ 🟠 CV-015: Họp phòng ban      [1 ngày]   │ │
│  │ 🟡 CV-023: Review tài liệu    [2 ngày]   │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  📤 VIỆC TÔI GIAO (5)             [Xem tất cả →]│
│  ┌──────────────────────────────────────────┐ │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │ │
│  │  │Chưa  │ │Đã    │ │Đang  │ │Hoàn  │    │ │
│  │  │giao  │ │giao  │ │thực  │ │thành │    │ │
│  │  │  1   │ │  2   │ │hiện  │ │ 15   │    │ │
│  │  │      │ │      │ │  3   │ │      │    │ │
│  │  └──────┘ └──────┘ └──────┘ └──────┘    │ │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │ │
│  │  │Chờ    │ │Cần   │ │Tiến  │ │Tỷ lệ │    │ │
│  │  │duyệt  │ │kiểm  │ │độ TB │ │đúng  │    │ │
│  │  │  2   │ │tra   │ │ 65%  │ │hạn   │    │ │
│  │  │      │ │  1   │ │      │ │ 80%  │    │ │
│  │  └──────┘ └──────┘ └──────┘ └──────┘    │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  🗂️ LỊCH SỬ & BÁO CÁO                         │
│  ┌──────────────────────────────────────────┐ │
│  │ 📊 Lịch sử hoàn thành        [Xem →]     │ │
│  │    Tháng này: 34 việc, TB: 2.3 ngày     │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  🛠️ CÔNG CỤ & XEM KHÁC                        │
│  [🌳 Cây công việc] [🧠 Mind Map] [📊 Báo cáo]│
│                                                │
└────────────────────────────────────────────────┘
```

---

## 🗂️ File Structure

### Frontend Files

```
fe-bcgiaobanbvt/src/features/QuanLyCongViec/
├─ Dashboard/
│  ├─ CongViecDashboardPage.js           [CREATE] ❌
│  └─ components/
│     ├─ ReceivedSectionDashboard.js     [CREATE] ❌
│     ├─ AssignedSectionDashboard.js     [CREATE] ❌
│     ├─ DeadlineAlertBanner.js          [CREATE] ❌
│     └─ ToolsMenu.js                    [CREATE] ❌
│
├─ CongViec/
│  └─ components/
│     └─ StatusGrid.js                   [REUSE] ✅
│
└─ components/
   └─ SummaryCards/
      └─ CongViecSummaryCard.js          [REUSE] ✅
```

### Backend Files

```
giaobanbv-be/modules/workmanagement/
├─ controllers/
│  └─ dashboard.controller.js            [UPDATE] ⚠️
│     └─ getCongViecDashboard()          [ADD METHOD]
│
└─ routes/
   └─ dashboard.route.js                 [UPDATE] ⚠️
      └─ GET /dashboard/congviec/:nhanVienId
```

---

## 🎨 Component Breakdown

### 1. CongViecDashboardPage (Main Container)

**File:** `Dashboard/CongViecDashboardPage.js` [CREATE]

**Structure:**

```javascript
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Stack,
  Box,
  Typography,
  IconButton,
  Button,
  Fab,
} from "@mui/material";
import { Add, More, Refresh } from "iconsax-react";
import useAuth from "hooks/useAuth";
import {
  getCongViecDashboard,
  selectCongViecDashboard,
  selectDashboardLoading,
} from "./dashboardSlice";
import StatusGrid from "../CongViec/components/StatusGrid";
import DeadlineAlertBanner from "./components/DeadlineAlertBanner";
import ToolsMenu from "./components/ToolsMenu";
import LoadingScreen from "components/LoadingScreen";

const CongViecDashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const nhanVienId = user?.NhanVienID;

  const dashboard = useSelector(selectCongViecDashboard);
  const isLoading = useSelector(selectDashboardLoading);

  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);

  // Fetch dashboard data on mount
  useEffect(() => {
    if (nhanVienId) {
      dispatch(getCongViecDashboard(nhanVienId));
    }
  }, [dispatch, nhanVienId]);

  const handleRefresh = () => {
    dispatch(getCongViecDashboard(nhanVienId, { refresh: true }));
  };

  const handleCreateTask = () => {
    navigate("/quanlycongviec/cong-viec/tao-moi");
  };

  if (isLoading && !dashboard) {
    return <LoadingScreen />;
  }

  return (
    <Container maxWidth="lg" sx={{ pb: 10 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight={600}>
            📋 Công Việc
          </Typography>
          <Stack direction="row" spacing={1}>
            <IconButton onClick={handleRefresh} size="small">
              <Refresh />
            </IconButton>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateTask}
            >
              Tạo mới
            </Button>
          </Stack>
        </Box>

        {/* Deadline Alert Banner */}
        {dashboard?.received?.overdueTasks?.length > 0 && (
          <DeadlineAlertBanner tasks={dashboard.received.overdueTasks} />
        )}

        {/* Received Section */}
        <ReceivedSectionDashboard
          data={dashboard?.received}
          onNavigate={(filter) =>
            navigate(`/quanlycongviec/cong-viec-cua-toi?${filter}`)
          }
        />

        {/* Assigned Section */}
        <AssignedSectionDashboard
          data={dashboard?.assigned}
          onNavigate={(filter) =>
            navigate(`/quanlycongviec/viec-toi-giao?${filter}`)
          }
        />

        {/* History & Reports */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🗂️ LỊCH SỬ & BÁO CÁO
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate("/quanlycongviec/lich-su-hoan-thanh")}
            >
              📊 Lịch sử hoàn thành → Xem tất cả
            </Button>
            <Typography variant="caption" color="text.secondary" mt={1}>
              Tháng này: {dashboard?.history?.completedThisMonth || 0} việc, TB:{" "}
              {dashboard?.history?.avgCompletionTime || 0} ngày
            </Typography>
          </CardContent>
        </Card>

        {/* Tools & Other Views */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🛠️ CÔNG CỤ & XEM KHÁC
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button
                variant="outlined"
                startIcon={<TreeIcon />}
                onClick={() => navigate("/quanlycongviec/tree-view")}
              >
                Cây công việc
              </Button>
              <Button
                variant="outlined"
                startIcon={<MindMapIcon />}
                onClick={() => navigate("/quanlycongviec/mind-map")}
              >
                Mind Map
              </Button>
              <Button
                variant="outlined"
                startIcon={<ChartIcon />}
                onClick={() => navigate("/quanlycongviec/bao-cao")}
              >
                Báo cáo
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* FAB for mobile */}
      <Fab
        color="primary"
        sx={{ position: "fixed", bottom: 80, right: 16 }}
        onClick={() => setToolsMenuOpen(true)}
      >
        <More />
      </Fab>

      {/* Tools Menu Drawer */}
      <ToolsMenu open={toolsMenuOpen} onClose={() => setToolsMenuOpen(false)} />
    </Container>
  );
};

export default CongViecDashboardPage;
```

**Estimated Lines:** ~250 lines

---

### 2. ReceivedSectionDashboard Component

**File:** `Dashboard/components/ReceivedSectionDashboard.js` [CREATE]

**Purpose:** Display "Việc tôi nhận" with StatusGrid

```javascript
import React from "react";
import { Box, Typography, Button, Card, CardContent } from "@mui/material";
import StatusGrid from "../../CongViec/components/StatusGrid";

const ReceivedSectionDashboard = ({ data, onNavigate }) => {
  const statusConfig = [
    {
      id: "DA_GIAO",
      label: "Chờ nhận",
      count: data?.byStatus?.DA_GIAO || 0,
      color: "info",
      icon: "⏳",
      onClick: () => onNavigate("status=DA_GIAO"),
    },
    {
      id: "DANG_THUC_HIEN",
      label: "Đang làm",
      count: data?.byStatus?.DANG_THUC_HIEN || 0,
      color: "primary",
      icon: "⚡",
      onClick: () => onNavigate("status=DANG_THUC_HIEN"),
    },
    {
      id: "CHO_DUYET",
      label: "Chờ duyệt",
      count: data?.byStatus?.CHO_DUYET || 0,
      color: "warning",
      icon: "⏰",
      onClick: () => onNavigate("status=CHO_DUYET"),
    },
    {
      id: "HOAN_THANH",
      label: "Hoàn thành",
      count: data?.byStatus?.HOAN_THANH || 0,
      color: "success",
      icon: "✅",
      onClick: () => onNavigate("status=HOAN_THANH"),
    },
    {
      id: "TU_CHOI",
      label: "Từ chối",
      count: data?.byStatus?.TU_CHOI || 0,
      color: "error",
      icon: "❌",
      onClick: () => onNavigate("status=TU_CHOI"),
    },
    {
      id: "CAN_BO_SUNG",
      label: "Cần bổ sung",
      count: data?.byStatus?.CAN_BO_SUNG || 0,
      color: "secondary",
      icon: "📝",
      onClick: () => onNavigate("status=CAN_BO_SUNG"),
    },
    {
      id: "OVERDUE",
      label: "Quá hạn",
      count: data?.overdueCount || 0,
      color: "error",
      icon: "🔴",
      onClick: () => onNavigate("overdue=true"),
    },
    {
      id: "DUE_SOON",
      label: "Sắp hạn",
      count: data?.dueSoonCount || 0,
      color: "warning",
      icon: "🟡",
      onClick: () => onNavigate("dueSoon=true"),
    },
  ];

  return (
    <Card>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">
            📥 VIỆC TÔI NHẬN ({data?.total || 0})
          </Typography>
          <Button size="small" onClick={() => onNavigate("")}>
            Xem tất cả →
          </Button>
        </Box>

        <StatusGrid items={statusConfig} columns={{ xs: 2, sm: 4 }} />
      </CardContent>
    </Card>
  );
};

export default ReceivedSectionDashboard;
```

**Estimated Lines:** ~100 lines

---

### 3. AssignedSectionDashboard Component

**File:** `Dashboard/components/AssignedSectionDashboard.js` [CREATE]

**Purpose:** Display "Việc tôi giao" with metrics

```javascript
import React from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import StatusGrid from "../../CongViec/components/StatusGrid";

const AssignedSectionDashboard = ({ data, onNavigate }) => {
  const statusConfig = [
    {
      id: "CHUA_GIAO",
      label: "Chưa giao",
      count: data?.byStatus?.CHUA_GIAO || 0,
      color: "default",
      icon: "📋",
    },
    {
      id: "DA_GIAO",
      label: "Đã giao",
      count: data?.byStatus?.DA_GIAO || 0,
      color: "info",
      icon: "📤",
    },
    {
      id: "DANG_THUC_HIEN",
      label: "Đang thực hiện",
      count: data?.byStatus?.DANG_THUC_HIEN || 0,
      color: "primary",
      icon: "⚡",
    },
    {
      id: "HOAN_THANH",
      label: "Hoàn thành",
      count: data?.byStatus?.HOAN_THANH || 0,
      color: "success",
      icon: "✅",
    },
    {
      id: "CHO_DUYET",
      label: "Chờ duyệt",
      count: data?.byStatus?.CHO_DUYET || 0,
      color: "warning",
      icon: "⏰",
    },
    {
      id: "CAN_KIEM_TRA",
      label: "Cần kiểm tra",
      count: data?.needCheckCount || 0,
      color: "secondary",
      icon: "🔍",
    },
    {
      id: "AVG_PROGRESS",
      label: "Tiến độ TB",
      count: `${data?.avgProgress || 0}%`,
      color: "info",
      icon: "📊",
      isMetric: true,
    },
    {
      id: "ON_TIME_RATE",
      label: "Tỷ lệ đúng hạn",
      count: `${data?.onTimeRate || 0}%`,
      color: "success",
      icon: "⏱️",
      isMetric: true,
    },
  ];

  return (
    <Card>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">
            📤 VIỆC TÔI GIAO ({data?.total || 0})
          </Typography>
          <Button size="small" onClick={() => onNavigate("")}>
            Xem tất cả →
          </Button>
        </Box>

        <StatusGrid items={statusConfig} columns={{ xs: 2, sm: 4 }} />
      </CardContent>
    </Card>
  );
};

export default AssignedSectionDashboard;
```

---

### 4. DeadlineAlertBanner Component

**File:** `Dashboard/components/DeadlineAlertBanner.js` [CREATE]

**Purpose:** Show urgent/overdue tasks prominently

```javascript
import React from "react";
import { Alert, AlertTitle, Stack, Typography, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const DeadlineAlertBanner = ({ tasks }) => {
  const navigate = useNavigate();

  const getUrgencyColor = (task) => {
    const daysLeft = (new Date(task.NgayHetHan) - new Date()) / 86400000;
    if (daysLeft < 0) return "error";
    if (daysLeft < 1) return "error";
    if (daysLeft < 3) return "warning";
    return "info";
  };

  const getDeadlineText = (deadline) => {
    return formatDistanceToNow(new Date(deadline), {
      addSuffix: true,
      locale: vi,
    });
  };

  return (
    <Alert severity="warning" variant="filled">
      <AlertTitle>⚠️ CẢNH BÁO DEADLINE ({tasks.length})</AlertTitle>
      <Stack spacing={1} mt={1}>
        {tasks.slice(0, 3).map((task) => (
          <Box
            key={task._id}
            sx={{
              p: 1,
              bgcolor: "rgba(255,255,255,0.2)",
              borderRadius: 1,
              cursor: "pointer",
              "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
            }}
            onClick={() => navigate(`/congviec/detail/${task._id}`)}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2" fontWeight={600} flex={1}>
                {task.TieuDe}
              </Typography>
              <Chip
                label={getDeadlineText(task.NgayHetHan)}
                size="small"
                color={getUrgencyColor(task)}
              />
            </Stack>
          </Box>
        ))}
        {tasks.length > 3 && (
          <Typography variant="caption">
            và {tasks.length - 3} việc khác...
          </Typography>
        )}
      </Stack>
    </Alert>
  );
};

export default DeadlineAlertBanner;
```

---

## 🔌 API Integration

### Backend API (NEW Method)

**File:** `controllers/dashboard.controller.js` [UPDATE]

**Add Method:**

```javascript
/**
 * GET /api/workmanagement/dashboard/congviec/:nhanVienId
 * Detailed CongViec dashboard for module page
 */
exports.getCongViecDashboard = catchAsync(async (req, res) => {
  const { nhanVienId } = req.params;

  if (!nhanVienId) {
    throw new AppError(400, "NhanVienID is required", "MISSING_PARAM");
  }

  const now = new Date();
  const twoDaysLater = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Parallel aggregations for performance
  const [receivedData, assignedData, historyData] = await Promise.all([
    // Received tasks breakdown
    CongViec.aggregate([
      {
        $match: {
          NguoiNhanID: mongoose.Types.ObjectId(nhanVienId),
          isDeleted: { $ne: true },
        },
      },
      {
        $facet: {
          byStatus: [
            {
              $group: {
                _id: "$TrangThai",
                count: { $sum: 1 },
              },
            },
          ],
          total: [{ $count: "count" }],
          overdue: [
            {
              $match: {
                NgayHetHan: { $lt: now },
                TrangThai: { $ne: "HOAN_THANH" },
              },
            },
            { $count: "count" },
            {
              $project: {
                _id: 1,
                TieuDe: 1,
                NgayHetHan: 1,
                MucDoUuTien: 1,
              },
            },
            { $limit: 10 },
          ],
          dueSoon: [
            {
              $match: {
                NgayHetHan: { $gte: now, $lte: twoDaysLater },
                TrangThai: { $ne: "HOAN_THANH" },
              },
            },
            { $count: "count" },
          ],
        },
      },
    ]),

    // Assigned tasks breakdown
    CongViec.aggregate([
      {
        $match: {
          NguoiGiaoID: mongoose.Types.ObjectId(nhanVienId),
          isDeleted: { $ne: true },
        },
      },
      {
        $facet: {
          byStatus: [
            {
              $group: {
                _id: "$TrangThai",
                count: { $sum: 1 },
              },
            },
          ],
          total: [{ $count: "count" }],
          metrics: [
            {
              $group: {
                _id: null,
                avgProgress: { $avg: "$TienDoThucHien" },
                completedOnTime: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$TrangThai", "HOAN_THANH"] },
                          { $lte: ["$NgayHoanThanh", "$NgayHetHan"] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                totalCompleted: {
                  $sum: {
                    $cond: [{ $eq: ["$TrangThai", "HOAN_THANH"] }, 1, 0],
                  },
                },
              },
            },
          ],
          needCheck: [
            {
              $match: {
                TrangThai: "CHO_DUYET",
              },
            },
            { $count: "count" },
          ],
        },
      },
    ]),

    // History (completed this month)
    CongViec.aggregate([
      {
        $match: {
          NguoiNhanID: mongoose.Types.ObjectId(nhanVienId),
          TrangThai: "HOAN_THANH",
          NgayHoanThanh: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          avgCompletionDays: {
            $avg: {
              $divide: [
                { $subtract: ["$NgayHoanThanh", "$NgayBatDau"] },
                86400000, // ms to days
              ],
            },
          },
        },
      },
    ]),
  ]);

  // Format response
  const formatStatusCounts = (facetData) => {
    const byStatus = {};
    facetData[0]?.byStatus.forEach((item) => {
      byStatus[item._id] = item.count;
    });
    return byStatus;
  };

  const response = {
    received: {
      total: receivedData[0]?.total[0]?.count || 0,
      byStatus: formatStatusCounts(receivedData),
      overdueCount: receivedData[0]?.overdue[0]?.count || 0,
      overdueTasks: receivedData[0]?.overdue || [],
      dueSoonCount: receivedData[0]?.dueSoon[0]?.count || 0,
    },
    assigned: {
      total: assignedData[0]?.total[0]?.count || 0,
      byStatus: formatStatusCounts(assignedData),
      avgProgress: Math.round(assignedData[0]?.metrics[0]?.avgProgress || 0),
      onTimeRate: Math.round(
        ((assignedData[0]?.metrics[0]?.completedOnTime || 0) /
          (assignedData[0]?.metrics[0]?.totalCompleted || 1)) *
          100
      ),
      needCheckCount: assignedData[0]?.needCheck[0]?.count || 0,
    },
    history: {
      completedThisMonth: historyData[0]?.count || 0,
      avgCompletionTime: Math.round(historyData[0]?.avgCompletionDays || 0),
    },
  };

  return sendResponse(
    res,
    200,
    true,
    response,
    null,
    "Lấy CongViec dashboard thành công"
  );
});
```

**Route:** `routes/dashboard.route.js` [UPDATE]

```javascript
router.get(
  "/congviec/:nhanVienId",
  loginRequired,
  dashboardController.getCongViecDashboard
);
```

---

### Redux Integration

**File:** `Dashboard/dashboardSlice.js` [UPDATE]

**Add Thunk:**

```javascript
/**
 * Get CongViec dashboard (with cache)
 */
export const getCongViecDashboard =
  (nhanVienId, options = {}) =>
  async (dispatch, getState) => {
    const { refresh = false } = options;

    // Check cache (5 minutes for dashboard)
    const { congViecDashboard, lastCongViecFetch } = getState().dashboard;
    if (!refresh && lastCongViecFetch) {
      const elapsed = Date.now() - new Date(lastCongViecFetch).getTime();
      if (elapsed < 300000) {
        // 5 minutes
        return;
      }
    }

    dispatch(startLoading());

    try {
      const response = await apiService.get(
        `/workmanagement/dashboard/congviec/${nhanVienId}`
      );

      dispatch(getCongViecDashboardSuccess(response.data.data));

      if (refresh) {
        toast.success("Đã làm mới dữ liệu");
      }

      return response.data.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Lỗi khi tải dashboard";
      dispatch(hasError(errorMessage));
      toast.error(errorMessage);
      throw error;
    }
  };

// Add reducer
getCongViecDashboardSuccess(state, action) {
  state.isLoading = false;
  state.congViecDashboard = action.payload;
  state.lastCongViecFetch = Date.now();
}

// Add selector
export const selectCongViecDashboard = (state) =>
  state.dashboard.congViecDashboard;
```

---

## 🎬 User Interactions

### Interaction 1: Navigate from Trang Chủ

```
User on UnifiedDashboardPage
   ↓
Tap "Công việc" card
   ↓
navigate("/quanlycongviec/cong-viec")
   ↓
CongViecDashboardPage mounts
   ↓
useEffect → dispatch(getCongViecDashboard(nhanVienId))
   ↓
API call: GET /dashboard/congviec/:nhanVienId
   ↓
Render StatusGrid + sections
```

### Interaction 2: Tap StatusGrid Card

```
User on CongViecDashboardPage
   ↓
See StatusGrid: "Đang làm (7)"
   ↓
Tap card
   ↓
onNavigate("status=DANG_THUC_HIEN")
   ↓
navigate("/quanlycongviec/cong-viec-cua-toi?status=DANG_THUC_HIEN")
   ↓
MyTasksPage loads with pre-filtered data
```

### Interaction 3: Deadline Alert Action

```
User sees DeadlineAlertBanner (3 overdue tasks)
   ↓
Tap task item
   ↓
navigate("/congviec/detail/:id")
   ↓
CongViecDetailPage opens
```

---

## ✅ Acceptance Criteria

- [ ] Page loads dashboard data from API on mount
- [ ] 2 StatusGrid sections display (Received + Assigned)
- [ ] Each status card shows correct count from API
- [ ] Tapping status card navigates to filtered list page
- [ ] Deadline alert banner shows when overdue tasks exist
- [ ] Tools menu accessible via button/FAB
- [ ] Mobile: 2-column grid, FAB visible
- [ ] Desktop: 4-column grid, no FAB
- [ ] Refresh button updates data
- [ ] Cache prevents redundant API calls (5 min TTL)

---

**Next:** [Part 4 - Yêu Cầu & KPI Dashboards →](./UI_UX_04_YEUCAU_KPI_DASHBOARDS.md)
