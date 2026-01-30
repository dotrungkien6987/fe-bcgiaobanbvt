# Implementation Plan: Home Page Enhancement

## Tổng quan

**Mục tiêu**: Cải tiến UnifiedDashboardPage thành Home page thông minh với 2 layouts theo role (Manager vs Employee), thêm Priority Section và Recent Activities.

| Metric                 | Value                   |
| ---------------------- | ----------------------- |
| **Thời gian ước tính** | 2.5 - 3 ngày            |
| **Files mới**          | 6 files                 |
| **Files chỉnh sửa**    | 4 files                 |
| **API mới**            | 1 endpoint              |
| **Risk**               | Thấp (đa số reuse code) |

---

## ⚠️ CRITICAL: Logic "isManager" Đúng

### ❌ SAI:

```javascript
const isManager = user?.PhanQuyen === "manager"; // ❌ WRONG!
```

### ✅ ĐÚNG:

```javascript
// Manager được xác định qua quan hệ QuanLyNhanVien trong DB
// Nếu user có bất kỳ nhân viên nào được quản lý -> isManager = true

// Model: QuanLyNhanVien
{
  NhanVienQuanLy: ObjectId,      // Manager's NhanVienID
  NhanVienDuocQuanLy: ObjectId,  // Employee being managed
  LoaiQuanLy: "KPI" | "Giao_Viec",
  isDeleted: Boolean
}

// Frontend check:
const { managedEmployees } = useSelector((state) => state.nhanvienManagement);
const isManager = managedEmployees && managedEmployees.length > 0;
```

---

## Phase 1: Backend API - getUrgentTasks (4 giờ)

### Status: 🔴 Not Started

### Files cần chỉnh sửa:

**1. giaobanbv-be/modules/workmanagement/controllers/congViec.controller.js**

Thêm method mới sau `getCongViecSummary`:

```javascript
/**
 * Get urgent tasks for Home page
 * @route GET /api/workmanagement/congviec/urgent/:nhanVienId
 * @desc Get top N tasks with upcoming deadlines
 * @query {Number} limit - Default 5, max 20
 * @query {Number} daysAhead - Default 3 (deadline within N days)
 */
controller.getUrgentTasks = catchAsync(async (req, res, next) => {
  const { nhanVienId } = req.params;
  const { limit = 5, daysAhead = 3 } = req.query;

  if (!nhanVienId) {
    throw new AppError(400, "Thiếu nhanVienId trong params", "MISSING_PARAMS");
  }

  const mongoose = require("mongoose");
  const CongViec = require("../models/CongViec");
  const objectId = mongoose.Types.ObjectId;

  const deadlineThreshold = new Date();
  deadlineThreshold.setDate(deadlineThreshold.getDate() + parseInt(daysAhead));

  const tasks = await CongViec.find({
    $or: [
      { NguoiNhanID: objectId(nhanVienId) },
      { NguoiGiaoID: objectId(nhanVienId) },
    ],
    TrangThai: { $nin: ["HOAN_THANH", "DA_HUY"] },
    NgayHetHan: { $exists: true, $lte: deadlineThreshold },
    isDeleted: { $ne: true },
  })
    .sort({ NgayHetHan: 1, MucDoUuTien: -1 })
    .limit(parseInt(limit))
    .populate("NguoiGiaoViecID", "HoTen Images MaNhanVien")
    .populate("NguoiChinhID", "HoTen Images")
    .lean();

  // Calculate remaining time
  const now = new Date();
  const tasksWithCountdown = tasks.map((task) => ({
    ...task,
    DaysRemaining: Math.ceil(
      (new Date(task.NgayHetHan) - now) / (1000 * 60 * 60 * 24),
    ),
    HoursRemaining: Math.ceil(
      (new Date(task.NgayHetHan) - now) / (1000 * 60 * 60),
    ),
  }));

  // Get total count for "see all" link
  const total = await CongViec.countDocuments({
    $or: [
      { NguoiNhanID: objectId(nhanVienId) },
      { NguoiGiaoID: objectId(nhanVienId) },
    ],
    TrangThai: { $nin: ["HOAN_THANH", "DA_HUY"] },
    NgayHetHan: { $exists: true, $lte: deadlineThreshold },
    isDeleted: { $ne: true },
  });

  return sendResponse(
    res,
    200,
    true,
    { tasks: tasksWithCountdown, total },
    null,
    "Lấy danh sách công việc gấp thành công",
  );
});
```

**2. giaobanbv-be/modules/workmanagement/routes/congViec.api.js**

Thêm route:

```javascript
router.get("/urgent/:nhanVienId", congViecController.getUrgentTasks);
```

---

## Phase 2: Redux Slice Updates (2 giờ)

### Status: 🔴 Not Started

### File: fe-bcgiaobanbvt/src/features/WorkDashboard/workDashboardSlice.js

**Thêm vào initialState:**

```javascript
urgentTasks: {
  items: [],
  total: 0,
  isLoading: false,
},
recentActivities: {
  items: [],
  isLoading: false,
},
```

**Thêm reducers:**

```javascript
// Urgent Tasks
startLoadingUrgentTasks(state) {
  state.urgentTasks.isLoading = true;
},
getUrgentTasksSuccess(state, action) {
  state.urgentTasks.isLoading = false;
  state.urgentTasks.items = action.payload.tasks;
  state.urgentTasks.total = action.payload.total;
},
getUrgentTasksError(state, action) {
  state.urgentTasks.isLoading = false;
  state.error = action.payload;
},

// Recent Activities
startLoadingRecentActivities(state) {
  state.recentActivities.isLoading = true;
},
getRecentActivitiesSuccess(state, action) {
  state.recentActivities.isLoading = false;
  state.recentActivities.items = action.payload;
},
getRecentActivitiesError(state, action) {
  state.recentActivities.isLoading = false;
  state.error = action.payload;
},
```

**Thêm thunks:**

```javascript
export const fetchUrgentTasks =
  (nhanVienId, limit = 5) =>
  async (dispatch) => {
    if (!nhanVienId) return;

    dispatch(startLoadingUrgentTasks());
    try {
      const response = await apiService.get(
        `/workmanagement/congviec/urgent/${nhanVienId}?limit=${limit}`,
      );
      if (response.data.success) {
        dispatch(getUrgentTasksSuccess(response.data.data));
      }
    } catch (error) {
      dispatch(getUrgentTasksError(error.message));
      console.error("Error fetching urgent tasks:", error);
    }
  };

export const fetchRecentActivities =
  (limit = 10) =>
  async (dispatch) => {
    dispatch(startLoadingRecentActivities());
    try {
      const response = await apiService.get(
        `/workmanagement/congviec/hoat-dong-gan-day?limit=${limit}`,
      );
      if (response.data.success) {
        dispatch(getRecentActivitiesSuccess(response.data.data));
      }
    } catch (error) {
      dispatch(getRecentActivitiesError(error.message));
      console.error("Error fetching recent activities:", error);
    }
  };
```

---

## Phase 3: GreetingSection Component (1 giờ)

### Status: 🔴 Not Started

### File: fe-bcgiaobanbvt/src/features/QuanLyCongViec/Dashboard/components/GreetingSection.js

```javascript
/**
 * GreetingSection - Header với avatar, tên, role badge, ngày, refresh button
 *
 * Props:
 * - user: Object (từ useAuth)
 * - onRefresh: Function
 * - isLoading: Boolean
 */
```

**UI Elements:**

- Avatar (40px)
- "Xin chào {HoTen}"
- Role chip (Manager: purple, Employee: blue)
- Date: "Thứ 4, 29/01/2026"
- Refresh icon button

---

## Phase 4: UrgentTaskCard Component (1.5 giờ)

### Status: 🔴 Not Started

### File: fe-bcgiaobanbvt/src/features/QuanLyCongViec/Dashboard/components/UrgentTaskCard.js

```javascript
/**
 * UrgentTaskCard - Card hiển thị task gấp
 *
 * Props:
 * - task: Object { MaCongViec, TieuDe, NgayHetHan, DaysRemaining, MucDoUuTien, NguoiGiaoViecID, PhanTramTienDoTong }
 * - onClick: Function
 */
```

**UI Elements:**

- Task code + Title (truncated)
- Deadline countdown với color coding:
  - Red: < 1 day
  - Orange: 1-2 days
  - Yellow: 3 days
- Priority badge (CAO/TRUNG_BINH/THAP)
- Assignor avatar
- Progress percentage

---

## Phase 5: PriorityTasksWidget (Employee View) (1.5 giờ)

### Status: 🔴 Not Started

### File: fe-bcgiaobanbvt/src/features/QuanLyCongViec/Dashboard/components/PriorityTasksWidget.js

```javascript
/**
 * PriorityTasksWidget - Widget hiển thị 5 task urgent cho employee
 *
 * Uses:
 * - Redux: workDashboard.urgentTasks
 * - Component: UrgentTaskCard
 */
```

**UI Elements:**

- Header: "🔥 CẦN XỬ LÝ NGÀY HÔM NAY"
- 5 UrgentTaskCard
- "Xem tất cả N công việc khác >" link
- Empty state: "Không có công việc gấp 🎉"

---

## Phase 6: TeamOverviewWidget (Manager View) (2 giờ)

### Status: 🔴 Not Started

### File: fe-bcgiaobanbvt/src/features/QuanLyCongViec/Dashboard/components/TeamOverviewWidget.js

```javascript
/**
 * TeamOverviewWidget - Widget hiển thị team overview cho manager
 *
 * Uses:
 * - API: GET /kpi/dashboard/:chuKyId
 * - Redux: state.nhanvienManagement.managedEmployees
 */
```

**UI Elements:**

- Header: "👥 Đội ngũ của bạn"
- Stat: "X đánh giá chờ duyệt"
- Avatar stack (max 5)
- "Xem dashboard KPI" button

---

## Phase 7: RecentActivitiesTimeline (2 giờ)

### Status: 🔴 Not Started

### File: fe-bcgiaobanbvt/src/features/QuanLyCongViec/Dashboard/components/RecentActivitiesTimeline.js

```javascript
/**
 * RecentActivitiesTimeline - Timeline hoạt động gần đây
 *
 * Uses:
 * - API: GET /congviec/hoat-dong-gan-day (đã có)
 * - Redux: workDashboard.recentActivities
 */
```

**Activity Types:**

- TRANG_THAI: Edit icon - "thay đổi trạng thái"
- TIEN_DO: Timer1 icon - "cập nhật tiến độ"
- BINH_LUAN: MessageText icon - "bình luận"

**UI Elements:**

- Vertical timeline với left border
- Collapsible (mặc định collapsed)
- "Xem hoạt động" toggle button
- 10 items max

---

## Phase 8: Integrate UnifiedDashboardPage (2 giờ)

### Status: 🔴 Not Started

### File: fe-bcgiaobanbvt/src/features/QuanLyCongViec/Dashboard/UnifiedDashboardPage.js

**Changes:**

1. **Import components mới:**

```javascript
import {
  GreetingSection,
  PriorityTasksWidget,
  TeamOverviewWidget,
  RecentActivitiesTimeline,
} from "./components";
```

2. **Import nhanvienManagement slice:**

```javascript
import { getManagedEmployees } from "features/QuanLyCongViec/NhanVien/nhanvienManagementSlice";
```

3. **Add selector:**

```javascript
const { managedEmployees } = useSelector((state) => state.nhanvienManagement);
```

4. **Add isManager logic:**

```javascript
const isManager = useMemo(() => {
  return managedEmployees && managedEmployees.length > 0;
}, [managedEmployees]);
```

5. **Update useEffect:**

```javascript
useEffect(() => {
  if (user?.NhanVienID) {
    dispatch(fetchAllDashboardSummaries(user.NhanVienID));
    dispatch(getManagedEmployees(user.NhanVienID)); // NEW
    dispatch(fetchUrgentTasks(user.NhanVienID, 5)); // NEW
    dispatch(fetchRecentActivities(10)); // NEW
  }
}, [dispatch, user?.NhanVienID]);
```

6. **Update render:**

```jsx
return (
  <Container>
    {/* NEW: Greeting Section */}
    <GreetingSection
      user={user}
      onRefresh={handleRefresh}
      isLoading={isLoading}
    />

    {/* NEW: Priority Section - Role-based */}
    {isManager ? (
      <TeamOverviewWidget managedEmployees={managedEmployees} />
    ) : (
      <PriorityTasksWidget />
    )}

    {/* EXISTING: Summary Cards */}
    <Grid container spacing={3}>
      {/* ... existing cards ... */}
    </Grid>

    {/* NEW: Recent Activities */}
    <RecentActivitiesTimeline />

    {/* EXISTING: FAB */}
    <FABMenuButton />
  </Container>
);
```

---

## Phase 9: Testing & QA (3 giờ)

### Status: 🔴 Not Started

### Test Cases:

| #   | Scenario                            | Expected Result                      |
| --- | ----------------------------------- | ------------------------------------ |
| 1   | Employee login, có urgent tasks     | PriorityTasksWidget với tasks        |
| 2   | Employee login, không có tasks      | Empty state message                  |
| 3   | Manager login (có managedEmployees) | TeamOverviewWidget                   |
| 4   | Click refresh button                | Reload tất cả data                   |
| 5   | Click task card                     | Navigate to /congviec/responsive/:id |
| 6   | Click "Xem tất cả"                  | Navigate to task list                |
| 7   | Mobile 375px width                  | Vertical stack layout                |
| 8   | Tablet 768px width                  | 2 column layout                      |
| 9   | Loading state                       | Skeletons hiển thị                   |
| 10  | API error                           | Error message + retry                |

---

## File Structure

```
fe-bcgiaobanbvt/src/
├── features/
│   └── QuanLyCongViec/
│       └── Dashboard/
│           ├── UnifiedDashboardPage.js          [🔧 MODIFY]
│           ├── IMPLEMENTATION_PLAN_HOME_PAGE.md [📄 THIS FILE]
│           └── components/
│               ├── index.js                     [🆕 NEW]
│               ├── GreetingSection.js           [🆕 NEW]
│               ├── UrgentTaskCard.js            [🆕 NEW]
│               ├── PriorityTasksWidget.js       [🆕 NEW]
│               ├── TeamOverviewWidget.js        [🆕 NEW]
│               └── RecentActivitiesTimeline.js  [🆕 NEW]

giaobanbv-be/
└── modules/workmanagement/
    ├── controllers/
    │   └── congViec.controller.js               [🔧 MODIFY]
    └── routes/
        └── congViec.api.js                      [🔧 MODIFY]
```

---

## API Endpoints Summary

| Endpoint                          | Status      | Purpose           |
| --------------------------------- | ----------- | ----------------- |
| `GET /congviec/summary/:id`       | ✅ Existing | Task counts       |
| `GET /kpi/summary/:id`            | ✅ Existing | KPI score         |
| `GET /yeucau/summary/:id`         | ✅ Existing | Request counts    |
| `GET /congviec/hoat-dong-gan-day` | ✅ Existing | Recent activities |
| `GET /quanlynhanvien/:id/managed` | ✅ Existing | Check isManager   |
| `GET /kpi/dashboard/:chuKyId`     | ✅ Existing | Team KPI summary  |
| `GET /congviec/urgent/:id`        | 🆕 NEW      | Urgent task list  |

---

## UI/UX Mockup

### Mobile Layout (375px)

```
┌─────────────────────────────────┐
│ 👤 Xin chào Kiên      [Manager] │
│ 📅 Thứ 4, 29/01/2026      🔄    │
├─────────────────────────────────┤
│ 🔥 CẦN XỬ LÝ NGÀY HÔM NAY      │
│ ┌─────────────────────────────┐ │
│ │ CV-001: Báo cáo tháng 1     │ │
│ │ ⏰ 8h  🔴CAO  👤A  📊45%    │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ CV-002: Họp tuần            │ │
│ │ ⏰ 1d  🟠TB   👤B  📊20%    │ │
│ └─────────────────────────────┘ │
│ [Xem tất cả 7 công việc >]      │
├─────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐        │
│ │CV:12│ │KPI  │ │YC:5 │        │
│ │⚡3  │ │87.5 │ │     │        │
│ └─────┘ └─────┘ └─────┘        │
├─────────────────────────────────┤
│ 🕐 HOẠT ĐỘNG GẦN ĐÂY [Thu gọn] │
│ ● Kiên cập nhật CV-001  2h ago │
│ ● Lan bình luận CV-002  4h ago │
│ ● Tuấn thay đổi CV-003  Hq     │
└─────────────────────────────────┘
│ [🏠] [📋] [💬] [🏆] [☰]        │
└─────────────────────────────────┘
```

---

## Rollback Plan

Nếu có issues:

1. Git revert các commits
2. Backend API mới không ảnh hưởng existing code
3. Feature flag có thể thêm:

```javascript
const ENABLE_NEW_HOME = process.env.REACT_APP_ENABLE_NEW_HOME === "true";
```

---

## Execution Timeline

```
Day 1 (Morning):  Phase 1 + Phase 2
Day 1 (Afternoon): Phase 3 + Phase 4
Day 2 (Morning):  Phase 5 + Phase 6
Day 2 (Afternoon): Phase 7 + Phase 8
Day 3 (Morning):  Phase 9 (Testing)
```

---

## Next Steps

Bắt đầu với **Phase 1: Backend API** vì tất cả frontend phases đều phụ thuộc vào API này.
