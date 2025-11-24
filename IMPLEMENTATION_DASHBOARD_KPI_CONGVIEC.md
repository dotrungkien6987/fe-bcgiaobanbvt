# Dashboard Công Việc - KPI Evaluation Integration

## 📋 Tổng quan

Tính năng mới cho phép **managers xem dashboard công việc của nhân viên** khi chấm điểm KPI, giúp đánh giá hiệu suất dựa trên dữ liệu thực tế của các công việc đã giao liên quan đến nhiệm vụ thường quy.

## 🎯 Vị trí tích hợp

**Trang:** KPI Evaluation Page (`ChamDiemKPIDialog.js`)  
**Vị trí:** Trong bảng chấm điểm (`ChamDiemKPITable.js`), khi expand row của từng nhiệm vụ thường quy  
**Giao diện:** 2 Tabs - "✏️ Chấm điểm" và "📋 Công việc"

### Luồng sử dụng:

1. Manager mở dialog chấm điểm KPI cho nhân viên
2. Click expand button (⌄) trên dòng nhiệm vụ thường quy
3. Chọn tab "📋 Công việc" để xem dashboard
4. Dashboard tự động load dữ liệu công việc liên quan đến nhiệm vụ đó trong chu kỳ đánh giá

## 🔌 Backend API

### Endpoint

```
GET /api/workmanagement/congviec/dashboard-by-nhiemvu
```

### Query Parameters

| Tên                  | Bắt buộc | Mô tả                          |
| -------------------- | -------- | ------------------------------ |
| `nhiemVuThuongQuyID` | ✅       | ID của nhiệm vụ thường quy     |
| `nhanVienID`         | ✅       | ID của nhân viên được đánh giá |
| `chuKyDanhGiaID`     | ✅       | ID của chu kỳ đánh giá KPI     |

### Response Structure

```javascript
{
  "success": true,
  "data": {
    "summary": {
      "total": 15,                  // Tổng số công việc
      "completed": 12,              // Đã hoàn thành
      "completionRate": 80,         // Tỷ lệ hoàn thành (%)
      "late": 3,                    // Hoàn thành trễ
      "lateRate": 20,               // Tỷ lệ trễ (%)
      "active": 2,                  // Đang thực hiện
      "overdue": 1,                 // Quá hạn
      "avgProgress": 85,            // Tiến độ trung bình (%)
      "onTimeRate": 75              // Tỷ lệ đúng hạn (%)
    },
    "timeMetrics": {
      "avgLateHours": 24.5,         // Trung bình giờ trễ
      "maxLateHours": 72,           // Tối đa giờ trễ
      "avgCompletionDays": 5.2,     // TB thời gian hoàn thành
      "onTimeCount": 9,             // Số CV đúng hạn
      "lateCount": 3                // Số CV trễ hạn
    },
    "statusDistribution": [
      { "status": "HOAN_THANH", "count": 12, "percentage": 80 },
      { "status": "DANG_THUC_HIEN", "count": 2, "percentage": 13.3 },
      { "status": "CHO_DUYET", "count": 1, "percentage": 6.7 }
    ],
    "priorityDistribution": [
      {
        "priority": "CAO",
        "total": 5,
        "completed": 4,
        "late": 1,
        "active": 1
      }
    ],
    "collaboration": {
      "avgTeamSize": 2.3,           // TB số người mỗi CV
      "avgComments": 5.8,           // TB số bình luận
      "multiPersonTasks": 8,        // Số CV nhiều người
      "multiPersonRate": 53.3       // Tỷ lệ phối hợp (%)
    },
    "tasks": [
      // Full CongViec objects với populated data
      {
        "_id": "...",
        "MaCongViec": "CV001",
        "TieuDe": "Chuẩn bị báo cáo tháng",
        "TrangThai": "HOAN_THANH",
        "PhanTramTienDoTong": 100,
        "NgayHetHan": "2024-01-15",
        "SoGioTre": 0,
        "HoanThanhTreHan": false
      }
    ]
  }
}
```

### MongoDB Aggregations (Backend Implementation)

Backend sử dụng **5 parallel aggregations** để tối ưu performance:

1. **statusDistribution** - Group by TrangThai với count và percentage
2. **timeMetrics** - Tính toán metrics thời gian cho các CV đã hoàn thành
3. **collaborationMetrics** - Lookup comments và đếm NguoiThamGia
4. **priorityBreakdown** - Group by MucDoUuTien với cross-tab status counts
5. **taskList** - Full tasks sorted by SoGioTre DESC (prioritize overdue)

## 🎨 Frontend Components

### Component Tree

```
CongViecDashboard (Container)
├── OverviewCards (8 metric cards)
│   └── StatCard × 8
├── StatusChart (Recharts horizontal bar)
├── TaskListMini (Compact table với filters)
└── InsightsPanel (Collapsible accordion)
```

### 1. StatCard

**File:** `src/features/QuanLyCongViec/KPI/v2/components/dashboard/StatCard.js`

Reusable metric card với:

- Color-coded left border (4px)
- Icon emoji + Label
- Large value display
- Subtitle text
- Hover animation

**Props:**

```javascript
{
  icon: "📊",                        // Emoji icon
  label: "Tổng số công việc",        // Metric label
  value: "15",                       // Main value
  subtitle: "Trong chu kỳ",         // Subtitle
  color: "success" | "warning" | "error" | "info"
}
```

### 2. OverviewCards

**File:** `src/features/QuanLyCongViec/KPI/v2/components/dashboard/OverviewCards.js`

8-card grid layout (2 rows × 4 columns) với responsive breakpoints:

**Cards:**

1. 📊 Tổng số CV (info)
2. ✅ Hoàn thành (dynamic: green/yellow/red based on completion rate)
3. 🔴 Hoàn thành trễ (dynamic: severity based on late rate)
4. 🟡 Đang thực hiện (warning if có overdue)
5. ⏱️ Tỷ lệ đúng hạn (dynamic: quality rating)
6. 📈 Tiến độ TB (dynamic: quality rating)
7. 👥 Số người TB (info)
8. 💬 Bình luận TB (info)

**Dynamic Color Logic:**

```javascript
// Completion rate
>= 80%: success (green)
60-80%: warning (yellow)
< 60%: error (red)

// Late rate
< 10%: success
10-20%: warning
> 20%: error

// Progress
>= 75%: success
50-75%: warning
< 50%: error
```

### 3. StatusChart

**File:** `src/features/QuanLyCongViec/KPI/v2/components/dashboard/StatusChart.js`

Horizontal bar chart sử dụng Recharts:

**Features:**

- Vertical layout (layout="vertical")
- Color-coded bars matching status colors
- Custom tooltip with percentage
- 250px height

**Status Colors:**

- TAO_MOI: #94a3b8 (slate)
- DA_GIAO: #64748b (gray)
- DANG_THUC_HIEN: #f59e0b (amber)
- CHO_DUYET: #3b82f6 (blue)
- HOAN_THANH: #10b981 (green)

### 4. TaskListMini

**File:** `src/features/QuanLyCongViec/KPI/v2/components/dashboard/TaskListMini.js`

Compact table với filtering:

**Features:**

- ButtonGroup filters: Tất cả | 🔴 Trễ | 🟡 Đang làm | 🟢 Hoàn thành
- 7 columns: Mã, Tiêu đề, Trạng thái, Tiến độ, Hạn chót, Giờ trễ, 👁️
- Inline progress bars (LinearProgress)
- Max height 300px với scroll
- Click 👁️ → Open CongViecDetailDialog (read-only)

**Filter Logic:**

```javascript
"all": All tasks
"late": HoanThanhTreHan OR (not completed AND overdue)
"active": TrangThai === "DANG_THUC_HIEN"
"completed": TrangThai === "HOAN_THANH"
```

### 5. InsightsPanel

**File:** `src/features/QuanLyCongViec/KPI/v2/components/dashboard/InsightsPanel.js`

Collapsible accordion với 3 sections:

**Sections:**

1. ⏱️ Hiệu suất thời gian

   - Tỷ lệ hoàn thành đúng hạn
   - TB giờ trễ (khi trễ)
   - Giờ trễ tối đa
   - Thời gian hoàn thành TB

2. 👥 Cộng tác & Tương tác

   - Số người TB mỗi CV
   - TB bình luận
   - Số CV nhiều người
   - Tỷ lệ phối hợp

3. 🎯 Phân tích theo độ ưu tiên
   - Grid 4 columns (Thấp, TB, Cao, Rất cao)
   - Mỗi priority: Total + Completed/Active/Late breakdown

### 6. CongViecDashboard (Container)

**File:** `src/features/QuanLyCongViec/KPI/v2/components/dashboard/CongViecDashboard.js`

Main container với data fetching và state management:

**Features:**

- Lazy loading (only fetch when `open=true`)
- Redux integration (`fetchCongViecDashboard` thunk)
- Loading state với skeleton loaders
- Error state với Alert
- Layout: OverviewCards + (StatusChart | TaskListMini) + InsightsPanel

**Props:**

```javascript
{
  nhiemVuThuongQuyID: string,  // Required
  nhanVienID: string,           // Required
  chuKyDanhGiaID: string,       // Required
  open: boolean,                // Trigger lazy load
  onViewTask: (taskId) => {}    // Callback for view task
}
```

## 🔄 Redux State Management

### State Structure (kpiSlice.js)

```javascript
initialState: {
  // ... existing KPI state
  congViecDashboard: {
    // Keyed by "${nhiemVuThuongQuyID}_${chuKyDanhGiaID}"
    "66a1234...._66b5678...": {
      data: { /* dashboard data */ },
      isLoading: false,
      error: null
    }
  }
}
```

### Reducers

```javascript
// Pending
fetchCongViecDashboardPending(state, action);
// Set loading=true, clear error

// Success
fetchCongViecDashboardSuccess(state, action);
// Store data keyed by nhiemVuID + chuKyID

// Rejected
fetchCongViecDashboardRejected(state, action);
// Store error message
```

### Thunk Action

```javascript
export const fetchCongViecDashboard = (params) => async (dispatch) => {
  const { nhiemVuThuongQuyID, nhanVienID, chuKyDanhGiaID } = params;

  dispatch(slice.actions.fetchCongViecDashboardPending({ ... }));

  try {
    const response = await apiService.get(
      `/workmanagement/congviec/dashboard-by-nhiemvu`,
      { params }
    );
    dispatch(slice.actions.fetchCongViecDashboardSuccess({ ... }));
  } catch (error) {
    dispatch(slice.actions.fetchCongViecDashboardRejected({ ... }));
    console.error("Failed to fetch CongViec dashboard:", error.message);
  }
};
```

**Note:** Silent error handling (no toast) - error hiển thị trong UI Alert.

## 🔗 Integration với ChamDiemKPITable

### Modified Components

**1. ChamDiemKPITable.js**

**New Props:**

```javascript
{
  // ... existing props
  nhanVienID: string,      // ✅ NEW: For dashboard
  chuKyDanhGiaID: string,  // ✅ NEW: For dashboard
}
```

**New State:**

```javascript
const [activeTabByRow, setActiveTabByRow] = useState({});
// Structure: { [rowId]: 0 | 1 }
// 0 = Chấm điểm tab, 1 = Công việc tab
```

**New Handlers:**

```javascript
const handleTabChange = useCallback((rowId, newValue) => {
  setActiveTabByRow((prev) => ({ ...prev, [rowId]: newValue }));
}, []);
```

**Expanded Row Content:**

```jsx
<Collapse in={isExpanded}>
  <Box sx={{ mx: 2, my: 1 }}>
    <Tabs value={activeTabByRow[rowId] || 0} onChange={handleTabChange}>
      <Tab label="✏️ Chấm điểm" />
      <Tab label={<Badge badgeContent={taskCount}>📋 Công việc</Badge>} />
    </Tabs>

    {/* Tab Panel 0: Scoring table */}
    {(activeTabByRow[rowId] === 0 || !activeTabByRow[rowId]) && (
      <Box>{/* Existing scoring content */}</Box>
    )}

    {/* Tab Panel 1: Dashboard */}
    {activeTabByRow[rowId] === 1 && (
      <CongViecDashboard
        nhiemVuThuongQuyID={nhiemVu.NhiemVuThuongQuyID._id}
        nhanVienID={nhanVienID}
        chuKyDanhGiaID={chuKyDanhGiaID}
        open={activeTabByRow[rowId] === 1}
        onViewTask={(taskId) => console.log("View task:", taskId)}
      />
    )}
  </Box>
</Collapse>
```

**2. ChamDiemKPIDialog.js**

Pass new props to table:

```javascript
<ChamDiemKPITable
  // ... existing props
  nhanVienID={nhanVien?._id}
  chuKyDanhGiaID={
    currentDanhGiaKPI?.ChuKyDanhGiaID?._id || currentDanhGiaKPI?.ChuKyDanhGiaID
  }
/>
```

## 🎬 Workflow

### User Journey

1. Manager: Navigate to KPI Dashboard → Select employee → Click "Chấm điểm"
2. Dialog opens with scoring table
3. Click expand button (⌄) on a routine duty row
4. Tab 0 "✏️ Chấm điểm" shows by default (existing scoring UI)
5. Click Tab 1 "📋 Công việc"
6. **Dashboard lazy loads:**
   - Shows skeleton loaders
   - Fetches data from backend via Redux thunk
   - Displays 8 metric cards, chart, task table, insights
7. Manager reviews:
   - Completion rate, late rate, progress
   - Status distribution chart
   - Individual tasks with filters
   - Detailed time/collaboration metrics
8. Click 👁️ on task → Opens CongViecDetailDialog (read-only)
9. Manager returns to Tab 0 to input scores based on insights

### Data Flow

```
User Action (Click Tab 1)
  ↓
CongViecDashboard useEffect detects open=true
  ↓
dispatch(fetchCongViecDashboard({ nhiemVuID, nhanVienID, chuKyID }))
  ↓
Redux thunk → apiService.get(...)
  ↓
Backend: MongoDB aggregations (5 parallel queries)
  ↓
Response → Redux reducer → Update state
  ↓
CongViecDashboard re-renders with data
  ↓
Child components receive props and display metrics
```

## 🎨 UI/UX Design Principles

### Lazy Loading

- Dashboard data chỉ fetch khi:
  1. Row được expand
  2. Tab "Công việc" được click lần đầu
- Prevents unnecessary API calls khi user chỉ chấm điểm

### Loading States

- **Initial load:** Skeleton loaders (8 cards + 2 sections)
- **Subsequent opens:** Cache data từ Redux (no re-fetch)

### Error Handling

- Silent console.error (no toast interruption)
- Display error Alert trong dashboard area
- Allow user tiếp tục chấm điểm nếu dashboard fail

### Responsive Design

- **Desktop (≥960px):**
  - OverviewCards: 4 columns
  - StatusChart (40%) | TaskListMini (60%)
- **Tablet (600-960px):**
  - OverviewCards: 4 columns (narrower)
  - Chart + Table stack vertically
- **Mobile (<600px):**
  - OverviewCards: 2 columns
  - All sections stack vertically

### Color Coding

Consistent color scheme:

- 🟢 Success (green): Good performance (>80%, <10% late)
- 🟡 Warning (yellow): Acceptable (60-80%, 10-20% late)
- 🔴 Error (red): Needs improvement (<60%, >20% late)
- 🔵 Info (blue): Neutral metrics

## 🧪 Testing Checklist

### API Testing

- [ ] Test với nhiemVuID không có công việc → Empty state
- [ ] Test với 1 công việc → Verify calculations
- [ ] Test với 100+ công việc → Performance check
- [ ] Test với tất cả CV completed → 100% completion rate
- [ ] Test với tất cả CV late → High late rate warnings
- [ ] Test với invalid IDs → Error handling

### Frontend Testing

- [ ] Lazy loading works (network tab: no fetch until tab click)
- [ ] Skeleton loaders display correctly
- [ ] Error state shows Alert message
- [ ] Empty state (0 tasks) displays friendly message
- [ ] Tab switching preserves dashboard state
- [ ] Collapse/expand row resets tab to 0
- [ ] Filter buttons in TaskListMini work correctly
- [ ] Charts render correctly with Recharts
- [ ] Responsive breakpoints work (test on 3 screen sizes)

### Integration Testing

- [ ] Props passed correctly from Dialog → Table → Dashboard
- [ ] Redux state updates correctly
- [ ] Multiple expanded rows maintain separate tab states
- [ ] Re-open same row loads cached data
- [ ] Change cycle/employee triggers new fetch

### Edge Cases

- [ ] ChuKyDanhGiaID as ObjectId vs String
- [ ] NhiemVuThuongQuyID.\_id vs NhiemVuThuongQuyID
- [ ] currentDanhGiaKPI null on initial load
- [ ] Tasks with missing data (null NgayHetHan, etc.)
- [ ] Very long task titles (ellipsis truncation)
- [ ] 0 comments, 0 team members (no division by zero)

## 📝 TODO - Remaining Tasks

### High Priority

- [ ] **Task Detail Dialog Integration**
  - Import `CongViecDetailDialog` vào `CongViecDashboard.js`
  - Replace `console.log` với actual dialog open
  - Pass `taskId` và `readOnly=true`
  - Test view task flow

### Medium Priority

- [ ] **Badge Task Count**

  - Tính task count từ dashboard data
  - Display trên Tab label "📋 Công việc (15)"
  - Update khi data changes

- [ ] **Empty State Enhancement**
  - Design empty state illustration
  - Message: "Chưa có công việc nào được giao cho nhiệm vụ này"
  - Suggest action: "Giao công việc mới"

### Low Priority

- [ ] **Export Dashboard to PDF**

  - Add export button
  - Generate PDF with charts và tables
  - Attach to KPI evaluation record

- [ ] **Real-time Updates**
  - Socket.io integration
  - Auto-refresh dashboard when task status changes
  - Show notification badge

## 🐛 Known Issues

1. **Task Count Badge:** Hiện tại hiển thị "?" vì chưa tính từ dashboard data
2. **View Task:** Click 👁️ chỉ log ra console, chưa open dialog
3. **Cache Invalidation:** Dashboard không auto-refresh khi task update trong session khác

## 📚 References

### Related Files

- **Backend Service:** `giaobanbv-be/modules/workmanagement/services/congViec.service.js`
- **Backend Controller:** `giaobanbv-be/modules/workmanagement/controllers/congViec.controller.js`
- **Backend Routes:** `giaobanbv-be/modules/workmanagement/routes/congViec.api.js`
- **Redux Slice:** `src/features/QuanLyCongViec/KPI/kpiSlice.js`
- **Main Dialog:** `src/features/QuanLyCongViec/KPI/v2/components/ChamDiemKPIDialog.js`
- **Scoring Table:** `src/features/QuanLyCongViec/KPI/v2/components/ChamDiemKPITable.js`
- **Dashboard Components:** `src/features/QuanLyCongViec/KPI/v2/components/dashboard/*.js`

### External Dependencies

- **Recharts:** `^2.x` - For charts visualization
- **Material-UI:** `^5.x` - UI components
- **Redux Toolkit:** State management
- **Axios:** API calls via apiService

---

**Document Version:** 1.0  
**Last Updated:** 2024-01-20  
**Author:** AI Agent  
**Status:** ✅ Implementation Complete (6/12 tasks done)
