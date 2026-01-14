# Implementation Plan: CongViecDashboardPage Refactor

**Created:** 2026-01-13  
**Status:** 🟡 Ready to Implement  
**Estimated Effort:** 6-8 hours  
**Location:** `features/QuanLyCongViec/Dashboard/CongViecDashboard/`

---

## 📋 Executive Summary

Refactor CongViecDashboardPage theo brain storm design mới:

- ✅ **Zero backend changes** - Reuse existing APIs (`/me` + `/assigned`)
- ✅ **Reuse existing components** - DateRangePresets, useCongViecCounts hook
- ✅ **Client-side metrics** - avgProgress, onTimeRate calculated on frontend
- ✅ **Removed invalid items** - "Từ chối", "Cần bổ sung" status cards
- ✅ **Added context** - Date range filter with 10 presets (default: "Tuần này")

---

## 🎯 Design Changes from Original Spec

### ❌ Removed from UI_UX_03 Spec

| Item                                | Reason                                         | Impact                               |
| ----------------------------------- | ---------------------------------------------- | ------------------------------------ |
| **"Từ chối", "Cần bổ sung" status** | Backend không có status này cho received tasks | Remove 2 cards from Received section |
| **"Cần kiểm tra" separate card**    | Không tồn tại trong backend logic              | Merge vào CHO_DUYET với subtext      |
| **`/dashboard/:id` backend API**    | Không tận dụng được - data không đủ chi tiết   | Use `/me` + `/assigned` thay thế     |
| **StatusGrid `items` array prop**   | Component interface không match                | Tạo custom grid layout               |
| **FAB button**                      | Over-engineered cho dashboard đơn giản         | Simplify UI                          |
| **Tools menu**                      | Low priority - defer to Phase 2                | Remove from scope                    |

### ✅ Added to Design

| Item                           | Reason                             | Benefit                           |
| ------------------------------ | ---------------------------------- | --------------------------------- |
| **DateRangePresets component** | Reuse từ CompletedTasksArchivePage | 10 presets sẵn có, consistent UX  |
| **Top metrics section**        | Quick overview without scrolling   | 4 key metrics at a glance         |
| **Client-side aggregation**    | No backend changes needed          | Use proven useCongViecCounts hook |
| **Timeline context**           | Rõ ràng thời gian filter           | "Tuần này: 08 - 15/01/2026"       |
| **Clickable overdue alert**    | Better UX                          | Navigate to detail page on click  |

---

## 📂 File Structure

### New Folder Organization

```
features/QuanLyCongViec/Dashboard/
├─ UnifiedDashboardPage.js                     [Existing]
├─ dashboardSlice.js                           [Existing]
└─ CongViecDashboard/                          [NEW]
   ├─ CongViecDashboardPage.js                [MOVED from pages/]
   ├─ components/                              [NEW]
   │  ├─ OverallMetrics.js                    [CREATE]
   │  ├─ ReceivedDashboardSection.js          [CREATE]
   │  ├─ AssignedDashboardSection.js          [CREATE]
   │  └─ DeadlineAlertCard.js                 [CREATE]
   ├─ IMPLEMENTATION_PLAN_CONGVIEC_DASHBOARD.md   [This file]
   ├─ UI_UX_03_CONGVIEC_DASHBOARD.md          [Updated spec]
   └─ DATABASE_INDEXES.md                      [Migration guide]

CongViec/                                      [Reuse existing]
├─ components/
│  ├─ DateRangePresets.js                    [REUSE ✅]
│  └─ UrgentAlertBanner.js                   [REUSE ✅]
└─ hooks/
   └─ useCongViecCounts.js                   [REUSE ✅]
```

### Why This Structure?

1. **Grouped by feature** - All dashboard code in one place
2. **Separation of concerns** - Components subfolder for reusables
3. **Documentation co-located** - Easy to find implementation notes
4. **Follows existing pattern** - Similar to CongViec/ structure

---

## 🏗️ Component Architecture

### 1. CongViecDashboardPage (Main Container)

**File:** `CongViecDashboardPage.js` (REFACTOR existing)  
**Current Lines:** 300  
**New Lines:** ~350 (add date filter)

**Responsibilities:**

- Manage date range state (default: "thisWeek")
- Fetch data from 2 APIs: `/me` + `/assigned`
- Orchestrate 4 child sections
- Handle loading/error states

**Key Refactors:**

```javascript
// ❌ OLD (remove)
import { fetchAllDashboardSummaries } from "features/WorkDashboard/workDashboardSlice";
const { congViecSummary } = useSelector((state) => state.workDashboard);

// ✅ NEW (add)
import {
  fetchCongViecByMe,
  fetchCongViecAssigned,
} from "../CongViec/congViecSlice";
import DateRangePresets from "../CongViec/components/DateRangePresets";
import { useCongViecCounts } from "../CongViec/hooks";
import dayjs from "dayjs";

// Date range state (default: this week)
const [dateRange, setDateRange] = useState({
  from: dayjs().startOf("week").format("YYYY-MM-DD"),
  to: dayjs().endOf("week").format("YYYY-MM-DD"),
});
const [selectedPreset, setSelectedPreset] = useState("week");

// Fetch data on mount and date change
useEffect(() => {
  if (user?.NhanVienID && dateRange) {
    const params = {
      page: 1,
      limit: 500,
      NgayBatDau: dateRange.from,
      NgayHetHan: dateRange.to,
    };

    dispatch(fetchCongViecByMe(params));
    dispatch(fetchCongViecAssigned(params));
  }
}, [user?.NhanVienID, dateRange]);

// Get tasks from Redux
const { receivedTasks, assignedTasks } = useSelector((state) => state.congViec);

// Count using hook
const receivedCounts = useCongViecCounts(receivedTasks.data || []);
const assignedCounts = useCongViecCounts(assignedTasks.data || []);
```

**New Sections:**

```javascript
return (
  <Container maxWidth="xl" sx={{ py: 3, pb: 10 }}>
    {/* Header with date context */}
    <Stack direction="row" alignItems="center" spacing={2} mb={3}>
      <IconButton onClick={() => navigate("/quanlycongviec")}>
        <ArrowLeft size={24} />
      </IconButton>
      <Box flex={1}>
        <Typography variant="h5" fontWeight={600}>
          📋 Dashboard Công Việc
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatDateRangeContext(dateRange)}{" "}
          {/* "Tuần này: 08 - 15/01/2026" */}
        </Typography>
      </Box>
      <Tooltip title="Làm mới">
        <IconButton onClick={handleRefresh} disabled={isLoading}>
          <Refresh size={20} />
        </IconButton>
      </Tooltip>
    </Stack>

    {/* Date Range Filter */}
    <DateRangePresets
      onSelectPreset={handleDatePresetChange}
      selectedPreset={selectedPreset}
      disabled={isLoading}
    />

    {isLoading && <LinearProgress sx={{ mb: 2 }} />}

    {/* 4 Sections */}
    <Stack spacing={3}>
      <OverallMetrics
        receivedCounts={receivedCounts}
        assignedCounts={assignedCounts}
        dateRange={dateRange}
      />

      <DeadlineAlertCard tasks={receivedTasks.data || []} />

      <ReceivedDashboardSection
        counts={receivedCounts}
        tasks={receivedTasks.data || []}
        isLoading={receivedTasks.isLoading}
      />

      <AssignedDashboardSection
        counts={assignedCounts}
        tasks={assignedTasks.data || []}
        dateRange={dateRange}
        isLoading={assignedTasks.isLoading}
      />
    </Stack>
  </Container>
);
```

---

### 2. OverallMetrics Component (NEW)

**File:** `components/OverallMetrics.js`  
**Purpose:** Top-level 4 metric cards  
**Estimated Lines:** ~120 lines

**Props Interface:**

```typescript
interface OverallMetricsProps {
  receivedCounts: {
    total: number;
    active: number;
    overdue: number;
    dueSoon: number;
    byStatus: { [status: string]: number };
  };
  assignedCounts: {
    total: number;
    active: number;
    // ... similar structure
  };
  dateRange: {
    from: string; // "YYYY-MM-DD"
    to: string;
  };
}
```

**Layout:**

```javascript
<Grid container spacing={2} sx={{ mb: 3 }}>
  <Grid item xs={6} sm={3}>
    <MetricCard
      label="Tổng công việc"
      value={receivedCounts.active + assignedCounts.active}
      subtext={`${receivedCounts.active} nhận | ${assignedCounts.active} giao`}
      icon={Task}
      color="primary"
    />
  </Grid>

  <Grid item xs={6} sm={3}>
    <MetricCard
      label="Quá hạn"
      value={receivedCounts.overdue + assignedCounts.overdue}
      subtext={`${receivedCounts.overdue} nhận | ${assignedCounts.overdue} giao`}
      icon={Danger}
      color="error"
      onClick={() => navigate("/cong-viec-cua-toi?tinhTrangHan=QUA_HAN")}
      clickable
    />
  </Grid>

  <Grid item xs={6} sm={3}>
    <MetricCard
      label="Sắp hạn (2 ngày)"
      value={receivedCounts.dueSoon + assignedCounts.dueSoon}
      subtext="Cảnh báo deadline"
      icon={Clock}
      color="warning"
      onClick={() => navigate("/cong-viec-cua-toi?tinhTrangHan=SAP_QUA_HAN")}
      clickable
    />
  </Grid>

  <Grid item xs={6} sm={3}>
    <MetricCard
      label="Hoàn thành"
      value={completedInRange}
      subtext={`${onTimeRate}% đúng hạn`}
      icon={TickCircle}
      color="success"
    />
  </Grid>
</Grid>
```

**Key Logic:**

```javascript
// Calculate completed in range
const completedInRange = useMemo(() => {
  const receivedCompleted = receivedCounts.byStatus?.HOAN_THANH || 0;
  const assignedCompleted = assignedCounts.byStatus?.HOAN_THANH || 0;
  return receivedCompleted + assignedCompleted;
}, [receivedCounts, assignedCounts]);

// Calculate on-time rate (for completed tasks)
const onTimeRate = useMemo(() => {
  // This requires access to raw tasks to check NgayHoanThanh vs NgayHetHan
  // Will be passed from parent
}, []);
```

---

### 3. ReceivedDashboardSection (NEW)

**File:** `components/ReceivedDashboardSection.js`  
**Purpose:** "Việc tôi nhận" section với 4 status cards  
**Estimated Lines:** ~150 lines

**Props Interface:**

```typescript
interface ReceivedDashboardSectionProps {
  counts: {
    byStatus: {
      DA_GIAO?: number;
      DANG_THUC_HIEN?: number;
      CHO_DUYET?: number;
      HOAN_THANH?: number;
    };
    total: number;
    overdue: number;
    dueSoon: number;
  };
  tasks: CongViec[];
  isLoading: boolean;
}
```

**Layout:**

```javascript
<Card sx={{ mb: 3 }}>
  <CardContent>
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      mb={2}
    >
      <Typography variant="h6">
        📥 VIỆC TÔI NHẬN ({counts.total || 0})
      </Typography>
      <Button
        size="small"
        endIcon={<ArrowRight size={16} />}
        onClick={() => navigate("/quanlycongviec/cong-viec-cua-toi")}
      >
        Xem tất cả
      </Button>
    </Box>

    {isLoading ? (
      <StatusGridSkeleton columns={4} />
    ) : (
      <Grid container spacing={2}>
        {statusCards.map((card) => (
          <Grid item xs={6} sm={3} key={card.id}>
            <StatusCardItem {...card} />
          </Grid>
        ))}
      </Grid>
    )}

    {/* Deadline summary */}
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ mt: 2, display: "block" }}
    >
      Deadline: 🔴 {counts.overdue || 0} quá hạn | 🟡 {counts.dueSoon || 0} sắp
      hạn
    </Typography>
  </CardContent>
</Card>
```

**Status Cards Config:**

```javascript
const statusCards = [
  {
    id: "DA_GIAO",
    label: "Chờ nhận",
    subtext: "(Đã giao chưa nhận)",
    count: counts.byStatus?.DA_GIAO || 0,
    color: "info",
    icon: Receive,
    onClick: () => navigate("/cong-viec-cua-toi?trangThai=DA_GIAO"),
  },
  {
    id: "DANG_THUC_HIEN",
    label: "Đang làm",
    count: counts.byStatus?.DANG_THUC_HIEN || 0,
    color: "primary",
    icon: Task,
    onClick: () => navigate("/cong-viec-cua-toi?trangThai=DANG_THUC_HIEN"),
  },
  {
    id: "CHO_DUYET",
    label: "Chờ duyệt",
    count: counts.byStatus?.CHO_DUYET || 0,
    color: "warning",
    icon: Clock,
    onClick: () => navigate("/cong-viec-cua-toi?trangThai=CHO_DUYET"),
  },
  {
    id: "HOAN_THANH",
    label: "Hoàn thành",
    count: counts.byStatus?.HOAN_THANH || 0,
    color: "success",
    icon: TickCircle,
    onClick: () => navigate("/quanlycongviec/lich-su-hoan-thanh"),
  },
];
```

**StatusCardItem Sub-component:**

```javascript
function StatusCardItem({ label, subtext, count, color, icon: Icon, onClick }) {
  const theme = useTheme();
  const colorValue = theme.palette[color]?.main;

  return (
    <Card
      sx={{
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s",
        "&:hover": onClick
          ? {
              transform: "translateY(-2px)",
              boxShadow: 3,
            }
          : {},
      }}
      onClick={onClick}
    >
      <CardContent>
        <Stack spacing={1} alignItems="center">
          <Icon size={32} color={colorValue} variant="Bold" />
          <Typography variant="h4" fontWeight={600}>
            {count}
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {label}
          </Typography>
          {subtext && (
            <Typography variant="caption" color="text.secondary">
              {subtext}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
```

---

### 4. AssignedDashboardSection (NEW)

**File:** `components/AssignedDashboardSection.js`  
**Purpose:** "Việc tôi giao" section với 5 status cards + metrics  
**Estimated Lines:** ~200 lines

**Props Interface:**

```typescript
interface AssignedDashboardSectionProps {
  counts: {
    byStatus: {
      TAO_MOI?: number;
      DA_GIAO?: number;
      DANG_THUC_HIEN?: number;
      CHO_DUYET?: number;
      HOAN_THANH?: number;
    };
    total: number;
    overdue: number;
    dueSoon: number;
  };
  tasks: CongViec[];
  dateRange: { from: string; to: string };
  isLoading: boolean;
}
```

**Layout:**

```javascript
<Card>
  <CardContent>
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      mb={2}
    >
      <Typography variant="h6">
        📤 VIỆC TÔI GIAO ({counts.total || 0})
      </Typography>
      <Button
        size="small"
        endIcon={<ArrowRight size={16} />}
        onClick={() => navigate("/quanlycongviec/viec-toi-giao")}
      >
        Xem tất cả
      </Button>
    </Box>

    {isLoading ? (
      <StatusGridSkeleton columns={5} />
    ) : (
      <Grid container spacing={2}>
        {statusCards.map((card) => (
          <Grid item xs={6} sm={2.4} key={card.id}>
            <StatusCardItem {...card} />
          </Grid>
        ))}
      </Grid>
    )}

    {/* Metrics summary */}
    <Stack direction="row" spacing={3} sx={{ mt: 2 }}>
      <Typography variant="caption" color="text.secondary">
        Deadline: 🔴 {counts.overdue || 0} quá hạn | 🟡 {counts.dueSoon || 0}{" "}
        sắp hạn
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Progress: ⏳ TB {avgProgress}% | ✅ {onTimeRate}% đúng hạn
      </Typography>
    </Stack>
  </CardContent>
</Card>
```

**Status Cards Config:**

```javascript
const statusCards = [
  {
    id: "TAO_MOI",
    label: "Tạo mới",
    subtext: "(Chưa giao)",
    count: counts.byStatus?.TAO_MOI || 0,
    color: "default",
    icon: DocumentText,
    onClick: () => navigate("/viec-toi-giao?trangThai=TAO_MOI"),
  },
  {
    id: "DA_GIAO",
    label: "Đã giao",
    count: counts.byStatus?.DA_GIAO || 0,
    color: "info",
    icon: Send,
    onClick: () => navigate("/viec-toi-giao?trangThai=DA_GIAO"),
  },
  {
    id: "DANG_THUC_HIEN",
    label: "Đang thực hiện",
    count: counts.byStatus?.DANG_THUC_HIEN || 0,
    color: "primary",
    icon: Task,
    onClick: () => navigate("/viec-toi-giao?trangThai=DANG_THUC_HIEN"),
  },
  {
    id: "CHO_DUYET",
    label: "Chờ duyệt",
    subtext: "(Cần kiểm tra)",
    count: counts.byStatus?.CHO_DUYET || 0,
    color: "warning",
    icon: Eye,
    onClick: () => navigate("/viec-toi-giao?trangThai=CHO_DUYET"),
  },
  {
    id: "HOAN_THANH",
    label: "Hoàn thành",
    count: counts.byStatus?.HOAN_THANH || 0,
    color: "success",
    icon: TickCircle,
    onClick: () => navigate("/viec-toi-giao?trangThai=HOAN_THANH"),
  },
];
```

**Metrics Calculation:**

```javascript
// Average progress (for active tasks)
const avgProgress = useMemo(() => {
  const activeTasks = tasks.filter((t) =>
    ["DA_GIAO", "DANG_THUC_HIEN", "CHO_DUYET"].includes(t.TrangThai)
  );

  if (activeTasks.length === 0) return 0;

  const totalProgress = activeTasks.reduce(
    (sum, task) => sum + (task.PhanTramTienDoTong || 0),
    0
  );

  return Math.round(totalProgress / activeTasks.length);
}, [tasks]);

// On-time rate (for completed tasks in date range)
const onTimeRate = useMemo(() => {
  const completedInRange = tasks.filter(
    (t) =>
      t.TrangThai === "HOAN_THANH" &&
      t.NgayHoanThanh >= dateRange.from &&
      t.NgayHoanThanh <= dateRange.to
  );

  if (completedInRange.length === 0) return 100;

  const onTime = completedInRange.filter(
    (t) => new Date(t.NgayHoanThanh) <= new Date(t.NgayHetHan)
  );

  return Math.round((onTime.length / completedInRange.length) * 100);
}, [tasks, dateRange]);
```

---

### 5. DeadlineAlertCard (NEW)

**File:** `components/DeadlineAlertCard.js`  
**Purpose:** Show top 5 overdue tasks  
**Estimated Lines:** ~100 lines

**Props Interface:**

```typescript
interface DeadlineAlertCardProps {
  tasks: CongViec[];
}
```

**Logic:**

```javascript
const overdueTasks = useMemo(() => {
  return tasks
    .filter((t) => t.TinhTrangThoiHan === "QUA_HAN")
    .sort((a, b) => new Date(a.NgayHetHan) - new Date(b.NgayHetHan)) // Oldest deadline first
    .slice(0, 5);
}, [tasks]);

if (overdueTasks.length === 0) {
  return null; // Don't render if no overdue tasks
}

const getDaysOverdue = (deadline) => {
  return dayjs().diff(dayjs(deadline), "day");
};

return (
  <Alert
    severity="error"
    icon={<Danger variant="Bold" size={24} />}
    sx={{ mb: 3 }}
  >
    <AlertTitle>
      <Typography variant="subtitle2" fontWeight={600}>
        ⚠️ Cảnh báo: {overdueTasks.length} công việc quá hạn
      </Typography>
    </AlertTitle>

    <Stack spacing={1.5} mt={1}>
      {overdueTasks.map((task) => (
        <Box
          key={task._id}
          sx={{
            p: 1.5,
            borderRadius: 1,
            bgcolor: "rgba(255, 255, 255, 0.1)",
            cursor: "pointer",
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: "rgba(255, 255, 255, 0.2)",
            },
          }}
          onClick={() => navigate(`/quanlycongviec/congviec/${task._id}`)}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="body2" fontWeight={600} flex={1}>
              {task.TieuDe || "Công việc"}
            </Typography>
            <Chip
              label={`Quá ${getDaysOverdue(task.NgayHetHan)} ngày`}
              size="small"
              color="error"
              variant="filled"
            />
          </Stack>
          {task.MucDoUuTien && (
            <Typography variant="caption" sx={{ mt: 0.5, opacity: 0.8 }}>
              Ưu tiên: {task.MucDoUuTien}
            </Typography>
          )}
        </Box>
      ))}

      {overdueTasks.length === 5 &&
        tasks.filter((t) => t.TinhTrangThoiHan === "QUA_HAN").length > 5 && (
          <Button
            size="small"
            fullWidth
            variant="text"
            onClick={() => navigate("/cong-viec-cua-toi?tinhTrangHan=QUA_HAN")}
          >
            Xem tất cả (
            {tasks.filter((t) => t.TinhTrangThoiHan === "QUA_HAN").length} việc)
          </Button>
        )}
    </Stack>
  </Alert>
);
```

---

## 🔌 Data Flow

### API Integration

**No backend changes needed** - Reuse existing endpoints:

```javascript
// File: features/QuanLyCongViec/CongViec/congViecSlice.js
// Thunks already exist:

export const fetchCongViecByMe = (params) => async (dispatch) => {
  // GET /api/workmanagement/congviec/me
  // Params: { page, limit, NgayBatDau, NgayHetHan, ... }
};

export const fetchCongViecAssigned = (params) => async (dispatch) => {
  // GET /api/workmanagement/congviec/assigned
  // Params: { page, limit, NgayBatDau, NgayHetHan, ... }
};
```

**Redux State Structure (Existing):**

```javascript
state.congViec = {
  receivedTasks: {
    data: CongViec[],    // Full task objects
    isLoading: boolean,
    error: string | null,
    total: number,
    currentPage: number,
  },
  assignedTasks: {
    data: CongViec[],
    isLoading: boolean,
    error: string | null,
    total: number,
    currentPage: number,
  },
  // ... other slices
}
```

### useCongViecCounts Hook (Reuse)

**File:** `features/QuanLyCongViec/CongViec/hooks/useCongViecCounts.js`

**Interface:**

```typescript
interface CongViecCounts {
  // Status counts
  byStatus: {
    [key: string]: number; // DA_GIAO: 3, DANG_THUC_HIEN: 7, etc.
  };

  // Totals
  total: number; // All tasks
  active: number; // Excludes HOAN_THANH

  // Deadline counts
  overdue: number; // TinhTrangThoiHan === "QUA_HAN"
  dueSoon: number; // TinhTrangThoiHan === "SAP_QUA_HAN"
  onTrack: number; // TinhTrangThoiHan === "DUNG_HAN"

  // Priority counts
  byPriority: {
    [key: string]: number;
  };
}

function useCongViecCounts(tasks: CongViec[]): CongViecCounts;
```

**Usage:**

```javascript
const receivedCounts = useCongViecCounts(receivedTasks.data || []);

console.log(receivedCounts);
// {
//   byStatus: { DA_GIAO: 3, DANG_THUC_HIEN: 7, CHO_DUYET: 2, HOAN_THANH: 34 },
//   total: 46,
//   active: 12,
//   overdue: 3,
//   dueSoon: 5,
//   onTrack: 4,
//   byPriority: { THAP: 2, BINH_THUONG: 5, CAO: 3, KHAN_CAP: 2 }
// }
```

---

## 📅 Implementation Timeline

### Phase 1: Setup & Refactor Main Page (2-3h)

**Tasks:**

- [x] Create folder structure ✅
- [x] Move CongViecDashboardPage.js ✅
- [ ] Update route in `routes/index.js`:

  ```javascript
  // OLD
  import CongViecDashboardPage from "pages/CongViecDashboardPage";

  // NEW
  import CongViecDashboardPage from "features/QuanLyCongViec/Dashboard/CongViecDashboard/CongViecDashboardPage";
  ```

- [ ] Refactor CongViecDashboardPage.js:
  - [ ] Remove fetchAllDashboardSummaries logic
  - [ ] Add DateRangePresets integration
  - [ ] Add fetchCongViecByMe + fetchCongViecAssigned
  - [ ] Add useCongViecCounts hook
  - [ ] Add date range state management
  - [ ] Update header with date context

**Acceptance:**

- Page loads without errors
- Date filter shows 10 presets
- API calls triggered on date change
- Console shows correct data structure

---

### Phase 2: Build Components (3-4h)

**2.1. OverallMetrics Component (1h)**

- [ ] Create `components/OverallMetrics.js`
- [ ] Build 4 MetricCard sub-components
- [ ] Wire up counts from props
- [ ] Add onClick navigation for clickable metrics
- [ ] Add loading skeleton
- [ ] Test with real data

**2.2. ReceivedDashboardSection Component (1h)**

- [ ] Create `components/ReceivedDashboardSection.js`
- [ ] Build StatusCardItem sub-component
- [ ] Configure 4 status cards
- [ ] Add deadline summary text
- [ ] Add onClick navigation
- [ ] Test filters propagation to MyTasksPage

**2.3. AssignedDashboardSection Component (1.5h)**

- [ ] Create `components/AssignedDashboardSection.js`
- [ ] Build StatusCardItem (reuse from Received)
- [ ] Configure 5 status cards
- [ ] Add avgProgress calculation
- [ ] Add onTimeRate calculation
- [ ] Add metrics summary text
- [ ] Test metrics accuracy

**2.4. DeadlineAlertCard Component (0.5h)**

- [ ] Create `components/DeadlineAlertCard.js`
- [ ] Filter overdue tasks (TinhTrangThoiHan === "QUA_HAN")
- [ ] Sort by oldest deadline
- [ ] Display top 5 with "Quá X ngày" badge
- [ ] Add onClick to navigate to detail
- [ ] Conditional render (hide if no overdue)

**Acceptance:**

- All 4 components render correctly
- Metrics show accurate counts
- Click handlers navigate correctly
- Loading states work
- Empty states handled gracefully

---

### Phase 3: Polish & Testing (1-2h)

**3.1. UI Polish (0.5h)**

- [ ] Add loading skeletons for all sections
- [ ] Add empty state messages
- [ ] Adjust spacing/padding for mobile
- [ ] Test responsive breakpoints (xs/sm/md/lg)
- [ ] Add hover effects on clickable cards

**3.2. Error Handling (0.5h)**

- [ ] Add error boundaries
- [ ] Handle API failures gracefully
- [ ] Add retry button on errors
- [ ] Show user-friendly error messages
- [ ] Test with network offline

**3.3. Manual Testing (0.5-1h)**

- [ ] Test all 10 date presets
- [ ] Verify counts match backend data
- [ ] Test navigation to MyTasksPage with filters
- [ ] Test navigation to detail pages
- [ ] Test refresh button
- [ ] Test with 0 tasks, 1 task, 500 tasks
- [ ] Test with overdue tasks vs no overdue

**3.4. Documentation (0.5h)**

- [x] Update UI_UX_03_CONGVIEC_DASHBOARD.md ✅
- [x] Create DATABASE_INDEXES.md ✅
- [ ] Add JSDoc comments to all components
- [ ] Update CHANGELOG.md
- [ ] Take screenshots for docs

**Acceptance:**

- No console errors
- Mobile responsive
- All edge cases handled
- Documentation complete

---

## ✅ Acceptance Criteria

### Functional Requirements

| Requirement                                | Status | Verification        |
| ------------------------------------------ | ------ | ------------------- |
| Page loads data from `/me` + `/assigned`   | ⚪     | Check Network tab   |
| DateRangePresets shows 10 options          | ⚪     | Click each preset   |
| Default date range is "Tuần này"           | ⚪     | Check initial state |
| 4 overall metrics display correctly        | ⚪     | Verify counts       |
| Received section: 4 status cards           | ⚪     | Count cards         |
| Assigned section: 5 status cards + metrics | ⚪     | Check avgProgress   |
| Deadline alert shows when overdue exists   | ⚪     | Create overdue task |
| Click status card → navigate with filter   | ⚪     | Check URL params    |
| Click overdue task → detail page           | ⚪     | Navigate to detail  |
| Refresh button updates data                | ⚪     | Click and verify    |

### Non-Functional Requirements

| Requirement          | Target  | Status | Notes                  |
| -------------------- | ------- | ------ | ---------------------- |
| Page load time       | < 2s    | ⚪     | With 500 tasks         |
| API response time    | < 500ms | ⚪     | Parallel fetch         |
| Time to interactive  | < 3s    | ⚪     | First meaningful paint |
| Bundle size increase | < 50KB  | ⚪     | Check build output     |
| Console errors       | 0       | ⚪     | Clean console          |
| Accessibility score  | > 90    | ⚪     | Lighthouse audit       |
| Mobile responsive    | Yes     | ⚪     | Test 375px width       |
| Desktop responsive   | Yes     | ⚪     | Test 1920px width      |

---

## 🚧 Known Limitations & Mitigations

### 1. Client-side Aggregation Performance

**Issue:** Counting 500 tasks on every render may be slow on low-end devices

**Mitigation:**

- ✅ Use `useMemo` to cache calculations
- ✅ Only recalculate when `tasks` array changes
- ✅ Limit fetch to 500 tasks (backend parameter)
- 🔜 Future: Add pagination or infinite scroll

**Performance Target:** < 100ms for counts calculation

---

### 2. No Real-time Updates

**Issue:** Data only refreshes on mount or manual refresh

**Mitigation:**

- ✅ Add manual refresh button (visible in header)
- ✅ Show "Last updated: X mins ago" text
- 🔜 Future: Implement polling (5-min interval)
- 🔜 Future: WebSocket updates for high-priority tasks

---

### 3. Date Filter State Not Persisted

**Issue:** Date range resets to "Tuần này" on page reload

**Mitigation:**

- ✅ Default to common case (current week)
- 🔜 Future: Save to localStorage
- 🔜 Future: Sync to URL params

---

### 4. Backend Data Inconsistency

**Issue:** Backend virtual field `TinhTrangThoiHan` may not exist on all tasks

**Mitigation:**

- ✅ Fallback to manual deadline check:
  ```javascript
  const isOverdue =
    task.TinhTrangThoiHan === "QUA_HAN" ||
    (task.NgayHetHan && new Date(task.NgayHetHan) < new Date());
  ```
- ✅ Default to safe values (0) if field missing

---

## 📊 Performance Expectations

### Load Testing Scenarios

**Scenario 1: Average User (50 tasks)**

- Initial load: 500-800ms
- Date filter change: 200-400ms
- Navigation click: 100-200ms
- ✅ **Expected: Smooth experience**

**Scenario 2: Heavy User (200 tasks)**

- Initial load: 1-1.5s
- Date filter change: 400-600ms
- Count calculation: 50-100ms
- ✅ **Expected: Acceptable performance**

**Scenario 3: Power User (500 tasks)**

- Initial load: 2-3s
- Date filter change: 800ms-1.2s
- Count calculation: 100-200ms
- ⚠️ **Expected: Slight lag on filter change**

**Scenario 4: Mobile Low-end (500 tasks, 3G)**

- Initial load: 5-8s
- Date filter change: 1.5-2s
- Count calculation: 200-300ms
- ⚠️ **Expected: Noticeable delays**

### Optimization Opportunities (Future)

1. **Virtualization** - Only render visible cards
2. **Code splitting** - Lazy load components
3. **Caching** - Redis cache on backend for aggregations
4. **Pagination** - Limit to 100 tasks per page
5. **Web Workers** - Offload count calculations

---

## 🔗 Related Documentation

- [UI_UX_03_CONGVIEC_DASHBOARD.md](./UI_UX_03_CONGVIEC_DASHBOARD.md) - Updated UI/UX spec
- [DATABASE_INDEXES.md](./DATABASE_INDEXES.md) - MongoDB indexes for performance
- [Brain Storm Discussion](../../../docs/conversation_2026-01-13.md) - Design decisions
- [Performance Analysis](../../../docs/PERFORMANCE_ANALYSIS_2000_USERS.md) - 2000 concurrent users scenario
- [CongViec Module Architecture](../CongViec/docs/ARCHITECTURE.md) - Understanding existing code

---

## 📈 Progress Tracking

| Phase                   | Tasks  | Completed | Time Spent      | Status           |
| ----------------------- | ------ | --------- | --------------- | ---------------- |
| **Phase 1: Setup**      | 4      | 2/4       | 0.5h            | 🟡 In Progress   |
| **Phase 2: Components** | 4      | 0/4       | 0h              | ⚪ Not Started   |
| **Phase 3: Polish**     | 4      | 0/4       | 0h              | ⚪ Not Started   |
| **Total**               | **12** | **2/12**  | **0.5h / 6-8h** | **17% Complete** |

---

## 🎯 Next Steps

**Immediate (Today):**

1. ✅ Create implementation plan
2. ⏭️ Update route in `routes/index.js`
3. ⏭️ Refactor main page to add DateRangePresets
4. ⏭️ Create OverallMetrics component

**Tomorrow:**

1. Create ReceivedDashboardSection
2. Create AssignedDashboardSection
3. Create DeadlineAlertCard
4. Test with real data

**End of Week:**

1. Polish UI/UX
2. Handle all edge cases
3. Complete documentation
4. Code review & merge

---

**Last Updated:** 2026-01-13 by AI Agent  
**Next Review:** After Phase 2 completion  
**Owner:** Development Team  
**Priority:** 🔴 HIGH
