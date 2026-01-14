# Phase 2 UI/UX - Trang Chủ (UnifiedDashboardPage)

**Part 2 of 5**  
**Screen:** UnifiedDashboardPage  
**Type:** Refactor Existing  
**Effort:** 2h  
**Status:** ⚠️ Needs Refactoring

---

## 📱 Screen Layout (Mobile)

```
┌────────────────────────────────────────────────┐
│ ← Quản Lý Công Việc          [🔔3] [👤 Menu]  │
├────────────────────────────────────────────────┤
│                                                │
│  🏠 Trang Chủ                    [↻ Refresh]  │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ 📋 CÔNG VIỆC                  [Xem →]   │ │ ← Compact SummaryCard
│  │ ───────────────────────────────────────  │ │
│  │  Tổng: 12 việc    🔥 Khẩn: 5 việc       │ │
│  │  ━━━━━━━━░░░░░░░░ 60% hoàn thành        │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ 📝 YÊU CẦU                    [Xem →]   │ │ ← Compact SummaryCard
│  │ ───────────────────────────────────────  │ │
│  │  Đã gửi: 6       ⚠️ Cần xử lý: 4        │ │
│  │  Đang xử lý: 3   ✅ Hoàn thành: 7       │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ 🏆 ĐÁNH GIÁ KPI              [Xem →]   │ │ ← Compact SummaryCard
│  │ ───────────────────────────────────────  │ │
│  │  Điểm TB: 85/100  ⏳ Chờ duyệt: 3      │ │
│  │  ★★★★☆ Tốt       ✅ Đã duyệt: 8        │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ⚠️ CÔNG VIỆC ƯU TIÊN (5)                     │
│  ┌──────────────────────────────────────────┐ │
│  │ 🔴 CV-001: Báo cáo tháng 12  [Quá hạn]  │ │
│  │ 🟠 CV-015: Họp phòng ban     [1 ngày]   │ │
│  │ 🟡 CV-023: Review tài liệu   [2 ngày]   │ │
│  │              ... (xem tất cả)            │ │
│  └──────────────────────────────────────────┘ │
│                                                │
└────────────────────────────────────────────────┘
│ [🏠 Trang chủ] [📝 Yêu cầu] [📋 Công việc] [🏆 KPI] [⊕]
└────────────────────────────────────────────────┘
```

---

## 🗂️ File Structure

### Files Involved

```
fe-bcgiaobanbvt/src/
├─ features/QuanLyCongViec/
│  └─ Dashboard/
│     ├─ UnifiedDashboardPage.js         [REFACTOR] ⚠️
│     └─ dashboardSlice.js               [UPDATE] ⚠️
│
├─ components/
│  └─ SummaryCards/                      [CREATE] ❌
│     ├─ CongViecSummaryCard.js          [NEW]
│     ├─ YeuCauSummaryCard.js            [NEW]
│     ├─ KPISummaryCard.js               [NEW]
│     └─ index.js                        [NEW]
│
└─ hooks/
   └─ useDebouncedLoad.js                [CREATE] ❌ (optional)
```

### Backend Files

```
giaobanbv-be/
├─ controllers/
│  └─ dashboard.controller.js             [EXISTS] ✅ (Medical module - DO NOT MODIFY)
│
└─ modules/workmanagement/controllers/
   ├─ congViec.controller.js              [UPDATE] ⚠️
   │  └─ Add: getCongViecDashboard(), getCongViecSummary()
   ├─ yeuCau.controller.js                [UPDATE] ⚠️
   │  ├─ Reuse: layDashboardMetrics() ✅
   │  └─ Add: getYeuCauSummary()
   ├─ kpi.controller.js                   [UPDATE] ⚠️
   │  ├─ Keep: getDashboard() ✅ (manager)
   │  └─ Add: getPersonalDashboard(), getKPISummary()
   └─ workmanagement.dashboard.controller.js [CREATE] ❌ (optional)
      └─ Add: getSummaryAll() (aggregates all modules)
```

**⚠️ NAMING CONFLICT RESOLVED:**

- `dashboard.controller.js` already exists at root `controllers/` folder (medical module)
- Work management dashboard methods go into existing module controllers
- Optional: create `workmanagement.dashboard.controller.js` for unified endpoint

---

## 🎨 Component Breakdown

### 1. UnifiedDashboardPage Component

**File:** `Dashboard/UnifiedDashboardPage.js`

**Changes Required:**

```javascript
// ❌ REMOVE: Embedded SummaryCard component (line 59-150)
// ✅ ADD: Import extracted components
import {
  CongViecSummaryCard,
  YeuCauSummaryCard,
  KPISummaryCard,
} from "components/SummaryCards";

// ✅ ADD: Debounced loading hook
const [shouldLoad, setShouldLoad] = useState(false);
useEffect(() => {
  const timer = setTimeout(() => setShouldLoad(true), 2000);
  return () => clearTimeout(timer);
}, []);

// ✅ MODIFY: Render with extracted components
return (
  <Container>
    <Stack spacing={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between">
        <Typography variant="h5">🏠 Trang Chủ</Typography>
        <IconButton onClick={handleRefresh}>
          <Refresh />
        </IconButton>
      </Box>

      {/* Summary Cards */}
      <CongViecSummaryCard
        data={summary?.congViec}
        variant="compact"
        onClick={() => navigate("/quanlycongviec/cong-viec")}
        isLoading={!shouldLoad || isLoading}
      />

      <YeuCauSummaryCard
        data={summary?.yeuCau}
        variant="compact"
        onClick={() => navigate("/quanlycongviec/yeucau")}
        isLoading={!shouldLoad || isLoading}
      />

      <KPISummaryCard
        data={summary?.kpi}
        variant="compact"
        onClick={() => navigate("/quanlycongviec/kpi")}
        isLoading={!shouldLoad || isLoading}
      />

      {/* Priority List */}
      <PriorityTasksList limit={5} />
    </Stack>
  </Container>
);
```

**Estimated Lines:** ~180 lines (down from 369)

---

### 2. CongViecSummaryCard (Extracted)

**File:** `components/SummaryCards/CongViecSummaryCard.js` [NEW]

**Props Interface:**

```typescript
interface CongViecSummaryCardProps {
  data: {
    total: number;
    urgent: number;
    completionRate?: number;
  };
  variant: "compact" | "detailed";
  onClick?: () => void;
  isLoading?: boolean;
}
```

**Component Structure:**

```javascript
export const CongViecSummaryCard = ({
  data,
  variant = "compact",
  onClick,
  isLoading = false,
}) => {
  if (isLoading) {
    return <Skeleton variant="rectangular" height={120} />;
  }

  return (
    <Card sx={{ ...hoverEffect }}>
      <CardActionArea onClick={onClick}>
        <CardContent>
          {/* Header */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              <Task size={24} color={theme.palette.primary.main} />
            </Box>
            <Typography variant="h6">CÔNG VIỆC</Typography>
            <Box flex={1} />
            <ArrowRight size={20} />
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* Stats */}
          {variant === "compact" ? (
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <StatItem
                  label="Tổng"
                  value={data.total}
                  icon={Task}
                  color="primary"
                />
              </Grid>
              <Grid item xs={6}>
                <StatItem
                  label="Khẩn"
                  value={data.urgent}
                  icon={Danger}
                  color="error"
                />
              </Grid>
              {data.completionRate && (
                <Grid item xs={12}>
                  <LinearProgress
                    variant="determinate"
                    value={data.completionRate}
                  />
                  <Typography variant="caption">
                    {data.completionRate}% hoàn thành
                  </Typography>
                </Grid>
              )}
            </Grid>
          ) : (
            // Detailed variant - show more metrics
            <DetailedStats data={data} />
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
```

**Estimated Lines:** ~100 lines

---

### 3. PriorityTasksList Component (NEW)

**File:** `Dashboard/components/PriorityTasksList.js` [CREATE]

**Purpose:** Show top 5 urgent/overdue tasks

```javascript
export const PriorityTasksList = ({ limit = 5 }) => {
  const { priorityTasks, isLoading } = useSelector(
    (state) => state.dashboard.priorityList
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          ⚠️ CÔNG VIỆC ƯU TIÊN ({priorityTasks.length})
        </Typography>

        <Stack spacing={1.5}>
          {priorityTasks.slice(0, limit).map((task) => (
            <Box
              key={task._id}
              sx={{
                p: 1.5,
                borderRadius: 1,
                bgcolor: getUrgencyColor(task),
                cursor: "pointer",
              }}
              onClick={() => navigate(`/congviec/detail/${task._id}`)}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box>
                  {getUrgencyIcon(task)}
                  <Typography variant="body2" fontWeight={600}>
                    {task.TieuDe}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDeadline(task.NgayHetHan)}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          ))}

          {priorityTasks.length > limit && (
            <Button fullWidth variant="text">
              Xem tất cả ({priorityTasks.length} việc)
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
```

---

## 🔌 API Integration

### API Endpoint (NEW)

**Backend:** `dashboard.controller.js` [CREATE]

```javascript
/**
 * GET /api/workmanagement/dashboard/summary-lite
 * Lightweight dashboard summary for Trang chủ
 */
exports.getSummaryLite = catchAsync(async (req, res) => {
  const nhanVienId = req.query.nhanVienId || req.user?.NhanVienID;

  // Parallel aggregation for performance
  const [congViecData, yeuCauData, kpiData, priorityTasks] = await Promise.all([
    // CongViec summary
    CongViec.aggregate([
      {
        $match: {
          NguoiNhanID: mongoose.Types.ObjectId(nhanVienId),
          TrangThai: { $ne: "HOAN_THANH" },
        },
      },
      {
        $facet: {
          total: [{ $count: "count" }],
          urgent: [
            {
              $match: {
                $or: [
                  { NgayHetHan: { $lt: new Date() } },
                  { MucDoUuTien: "cao" },
                ],
              },
            },
            { $count: "count" },
          ],
        },
      },
    ]),

    // YeuCau summary
    YeuCau.aggregate([
      {
        $match: {
          $or: [{ NguoiGuiID: req.userId }, { KhoaNhanID: req.user.KhoaID }],
        },
      },
      {
        $facet: {
          sent: [{ $match: { NguoiGuiID: req.userId } }, { $count: "count" }],
          needAction: [
            {
              $match: {
                KhoaNhanID: req.user.KhoaID,
                TrangThai: { $in: ["MOI", "DANG_XU_LY"] },
              },
            },
            { $count: "count" },
          ],
        },
      },
    ]),

    // KPI summary
    DanhGiaKPI.aggregate([
      {
        $match: {
          NhanVienID: mongoose.Types.ObjectId(nhanVienId),
          ChuKyID: await getCurrentCycleId(),
        },
      },
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$TongDiemKPI" },
          pending: {
            $sum: {
              $cond: [{ $eq: ["$TrangThai", "CHUA_DUYET"] }, 1, 0],
            },
          },
        },
      },
    ]),

    // Priority tasks (top 5 urgent/overdue)
    CongViec.find({
      NguoiNhanID: nhanVienId,
      TrangThai: { $ne: "HOAN_THANH" },
      $or: [{ NgayHetHan: { $lt: new Date() } }, { MucDoUuTien: "cao" }],
    })
      .sort({ NgayHetHan: 1, MucDoUuTien: -1 })
      .limit(10)
      .select("TieuDe NgayHetHan MucDoUuTien TrangThai")
      .lean(),
  ]);

  return sendResponse(
    res,
    200,
    true,
    {
      congViec: {
        total: congViecData[0]?.total[0]?.count || 0,
        urgent: congViecData[0]?.urgent[0]?.count || 0,
      },
      yeuCau: {
        sent: yeuCauData[0]?.sent[0]?.count || 0,
        needAction: yeuCauData[0]?.needAction[0]?.count || 0,
      },
      kpi: {
        score: Math.round(kpiData[0]?.avgScore || 0),
        pending: kpiData[0]?.pending || 0,
      },
      priorityTasks: priorityTasks,
    },
    null,
    "Lấy dashboard summary thành công"
  );
});
```

**Route:** `dashboard.route.js` [CREATE]

```javascript
const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");
const { loginRequired } = require("../../../middlewares/authentication");

router.get("/summary-lite", loginRequired, dashboardController.getSummaryLite);

module.exports = router;
```

**Index route:** `routes/index.js` [UPDATE]

```javascript
// Add this line
const dashboardRoute = require("./dashboard.route");

// Register route
router.use("/dashboard", dashboardRoute);
```

---

### Redux Integration

**File:** `Dashboard/dashboardSlice.js` [UPDATE]

**Changes:**

```javascript
// ❌ REMOVE: Mock data (line 153-189)
// ✅ ADD: Real API call

export const getDashboardSummary =
  (nhanVienId, options = {}) =>
  async (dispatch, getState) => {
    const { refresh = false } = options;

    // Check cache (1 minute TTL)
    const { lastUpdated } = getState().dashboard;
    if (!refresh && lastUpdated) {
      const elapsed = Date.now() - new Date(lastUpdated).getTime();
      if (elapsed < 60000) {
        // 1 minute
        return; // Use cached data
      }
    }

    dispatch(refresh ? startRefreshing() : startLoading());

    try {
      const response = await apiService.get(
        "/workmanagement/dashboard/summary-lite",
        {
          params: { nhanVienId },
        }
      );

      dispatch(
        getSummarySuccess({
          summary: response.data.data,
          nhanVienId,
        })
      );

      if (refresh) {
        toast.success("Đã làm mới dữ liệu dashboard");
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
```

---

## 🎬 User Interactions

### Interaction 1: Load Dashboard

**Trigger:** User navigates to `/quanlycongviec`

**Flow:**

```
1. Component mounts
   ↓
2. Wait 2 seconds (debounce)
   ↓
3. Check if data is cached (< 1 min)
   ↓
4. If stale → Dispatch getDashboardSummary(nhanVienId)
   ↓
5. API call: GET /dashboard/summary-lite
   ↓
6. Render 3 summary cards + priority list
```

**Code:**

```javascript
const UnifiedDashboardPage = () => {
  const [shouldLoad, setShouldLoad] = useState(false);

  // Debounce loading
  useEffect(() => {
    const timer = setTimeout(() => setShouldLoad(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch data when ready
  useEffect(() => {
    if (shouldLoad && nhanVienId) {
      dispatch(getDashboardSummary(nhanVienId));
    }
  }, [shouldLoad, nhanVienId]);
};
```

### Interaction 2: Tap Summary Card

**Trigger:** User taps on "CÔNG VIỆC" card

**Flow:**

```
1. User taps card
   ↓
2. onClick handler fires
   ↓
3. navigate("/quanlycongviec/cong-viec")
   ↓
4. Navigate to CongViecDashboardPage
```

**Code:**

```javascript
<CongViecSummaryCard
  data={summary?.congViec}
  onClick={() => navigate("/quanlycongviec/cong-viec")}
/>
```

### Interaction 3: Manual Refresh

**Trigger:** User taps refresh button (↻)

**Flow:**

```
1. User taps refresh icon
   ↓
2. handleRefresh() fires
   ↓
3. dispatch(refreshDashboard(nhanVienId))
   ↓
4. Force new API call (ignore cache)
   ↓
5. Show toast: "Đã làm mới dữ liệu"
```

**Code:**

```javascript
const handleRefresh = () => {
  dispatch(refreshDashboard(nhanVienId));
};
```

---

## 📊 State Management

### Redux State Shape

```javascript
{
  dashboard: {
    summary: {
      congViec: {
        total: 12,
        urgent: 5,
        completionRate: 60
      },
      yeuCau: {
        sent: 6,
        needAction: 4,
        inProgress: 3,
        completed: 7
      },
      kpi: {
        score: 85,
        pending: 3,
        approved: 8
      }
    },
    priorityList: [
      {
        _id: "...",
        TieuDe: "Báo cáo tháng 12",
        NgayHetHan: "2026-01-10T00:00:00Z",
        MucDoUuTien: "cao",
        TrangThai: "DANG_THUC_HIEN"
      }
    ],
    isLoading: false,
    isRefreshing: false,
    error: null,
    lastUpdated: "2026-01-12T10:30:00Z",
    nhanVienId: "66b1dba74f79822a4752d90d"
  }
}
```

---

## ✅ Acceptance Criteria

- [ ] Page loads with 2-second debounce (no API call if user navigates away quickly)
- [ ] 3 summary cards display correct data from API
- [ ] Tapping each card navigates to correct module dashboard
- [ ] Priority tasks list shows top 5 urgent/overdue items
- [ ] Manual refresh button works and updates data
- [ ] Cache prevents redundant API calls (1-minute TTL)
- [ ] Skeleton loading states display correctly
- [ ] Mobile responsive (cards stack vertically)
- [ ] Tablet/Desktop responsive (cards in grid)
- [ ] Error handling shows toast notification

---

## 🧪 Testing Checklist

### Unit Tests

- [ ] CongViecSummaryCard renders with compact variant
- [ ] YeuCauSummaryCard renders with data
- [ ] KPISummaryCard handles missing data gracefully
- [ ] Debounce hook delays loading correctly
- [ ] Redux thunk dispatches correct actions

### Integration Tests

- [ ] API endpoint returns correct structure
- [ ] 401 error when not authenticated
- [ ] 200 response with valid data
- [ ] Cache works (no second API call within 1 min)

### E2E Tests (Cypress)

- [ ] Navigate to Trang chủ → see 3 cards
- [ ] Tap Công việc card → navigate to CongViecDashboard
- [ ] Tap priority task → navigate to task detail
- [ ] Pull-to-refresh updates data
- [ ] Badge counts match API response

---

**Next:** [Part 3 - Công Việc Dashboard →](./UI_UX_03_CONGVIEC_DASHBOARD.md)
