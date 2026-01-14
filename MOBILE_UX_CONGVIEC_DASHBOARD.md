# Mobile UX Improvements - Dashboard Công Việc (v2.1)

**Ngày triển khai:** 13/01/2026  
**Phiên bản:** 2.1  
**Tác giả:** Development Team

## 📋 Tổng quan

Nâng cấp giao diện CongViecDashboardPage với mobile-first approach, bổ sung filter drawer, collapsible alert cards phân biệt rõ ràng giữa "việc nhận" và "việc giao", cảnh báo cả quá hạn và sắp hết hạn.

## 🎯 Mục tiêu

1. **Mobile-Friendly:** Tối ưu trải nghiệm trên thiết bị di động (< 960px)
2. **Filter UX:** Di chuyển DateRangePresets vào drawer trên mobile, giảm clutter
3. **Alert Clarity:** Phân biệt rõ ràng 4 loại cảnh báo:
   - Việc nhận quá hạn (⚠️ Error)
   - Việc nhận sắp hết hạn (⏰ Warning)
   - Việc giao quá hạn (⚠️ Error)
   - Việc giao sắp hết hạn (⏰ Warning)
4. **Dismissible Alerts:** Cho phép ẩn alerts với cooldown 24h
5. **Collapsible UI:** Alert cards có thể collapse trên mobile để tiết kiệm không gian

## 📂 Cấu trúc File Mới

```
features/QuanLyCongViec/Dashboard/CongViecDashboard/
├── CongViecDashboardPage.js (✏️ UPDATED)
├── components/
│   ├── OverallMetrics.js (✅ Existing)
│   ├── ReceivedDashboardSection.js (✅ Existing)
│   ├── AssignedDashboardSection.js (✅ Existing)
│   ├── DeadlineAlertCard.js (⚠️ Deprecated - replaced by CollapsibleAlertCard)
│   ├── CollapsibleAlertCard.js (🆕 NEW)
│   └── MobileFilterDrawer.js (🆕 NEW)
└── utils/
    └── taskAlertHelpers.js (🆕 NEW)
```

## 🆕 Components Mới

### 1. `taskAlertHelpers.js` (Utility Functions)

**Mục đích:** Centralized helper functions cho filtering và formatting task alerts

**Exported Functions:**

```javascript
// Filtering
filterOverdueTasks(tasks) → Array<Task>
filterUpcomingTasks(tasks) → Array<Task>

// Calculations
calculateDaysOverdue(deadline) → number
calculateDaysUntilDeadline(deadline) → number

// Formatting
formatDeadlineText(deadline, type) → string  // "Quá 5 ngày" | "Còn 2 ngày"
formatDeadlineDate(deadline) → string        // "15/01/2026"

// UI Helpers
getPriorityColor(priority) → string          // MUI color value
getPriorityLabel(priority) → string          // Vietnamese label
getStatusLabel(status) → string              // Vietnamese label
```

**Sử dụng:**

```javascript
import {
  filterOverdueTasks,
  formatDeadlineText,
} from "../utils/taskAlertHelpers";

const overdueTasks = filterOverdueTasks(receivedCongViecs);
const badgeText = formatDeadlineText(task.NgayHetHan, "overdue"); // "Quá 5 ngày"
```

### 2. `CollapsibleAlertCard.js` (Enhanced Alert Card)

**Mục đích:** Thay thế `DeadlineAlertCard` với nhiều tính năng hơn

**Props:**

| Prop               | Type                       | Default      | Description                                          |
| ------------------ | -------------------------- | ------------ | ---------------------------------------------------- |
| `tasks`            | `Array<CongViec>`          | `[]`         | Danh sách công việc để filter                        |
| `type`             | `"overdue" \| "upcoming"`  | `"overdue"`  | Loại cảnh báo                                        |
| `taskSource`       | `"received" \| "assigned"` | `"received"` | Nguồn công việc (nhận/giao)                          |
| `userId`           | `string`                   | `undefined`  | User ID cho localStorage dismiss                     |
| `defaultCollapsed` | `boolean \| null`          | `null`       | `null` = auto (mobile collapsed), true/false = force |
| `dismissible`      | `boolean`                  | `true`       | Cho phép dismiss alert                               |

**Features:**

- ✅ Auto-collapse on mobile (`useMediaQuery(theme.breakpoints.down("md"))`)
- ✅ Dismissible với localStorage (24h cooldown)
- ✅ Show top 3 tasks on mobile, top 5 on desktop
- ✅ Click task → navigate to detail page
- ✅ Icons: `Danger` (overdue), `Warning2` (upcoming)
- ✅ Severity colors: `error` (red), `warning` (orange)
- ✅ Collapsible với `ArrowDown2`/`ArrowUp2` icons

**Sử dụng:**

```javascript
// Việc nhận quá hạn
<CollapsibleAlertCard
  tasks={receivedCongViecs}
  type="overdue"
  taskSource="received"
  userId={user?._id}
  dismissible={true}
/>

// Việc giao sắp hết hạn
<CollapsibleAlertCard
  tasks={assignedCongViecs}
  type="upcoming"
  taskSource="assigned"
  userId={user?._id}
  dismissible={true}
/>
```

**LocalStorage Keys:**

- Dismiss state: `alert-{type}-{taskSource}-{userId}-dismissed`
- Dismiss time: `alert-{type}-{taskSource}-{userId}-dismissed-time`

**Ví dụ:** `alert-overdue-received-64f3cb6035c717ab00d75b8b-dismissed`

### 3. `MobileFilterDrawer.js` (Filter Drawer)

**Mục đích:** Mobile-friendly drawer chứa DateRangePresets + Deadline Status filter

**Props:**

| Prop                     | Type                      | Description                    |
| ------------------------ | ------------------------- | ------------------------------ |
| `open`                   | `boolean`                 | Drawer open state              |
| `onClose`                | `() => void`              | Close callback                 |
| `dateRange`              | `{ from, to }`            | Current date range             |
| `selectedPreset`         | `string`                  | Current preset key             |
| `onDatePresetChange`     | `(from, to, key) => void` | Date preset change handler     |
| `deadlineFilter`         | `string`                  | Current deadline filter value  |
| `onDeadlineFilterChange` | `(value) => void`         | Deadline filter change handler |
| `onApply`                | `() => void`              | Apply button callback          |
| `onReset`                | `() => void`              | Reset button callback          |

**Layout:**

```
┌─────────────────────────────┐
│ Header (Fixed)              │
│ 🔍 Bộ lọc             [×]   │
├─────────────────────────────┤
│ Content (Scrollable)        │
│                             │
│ 📅 Khoảng thời gian         │
│ [DateRangePresets Chips]    │
│                             │
│ ⏱️ Tình trạng hạn           │
│ [📋 Tất cả] [⚠️ Quá hạn]    │
│ [⏰ Sắp hết hạn] [✅ Đúng hạn]│
│                             │
│ 💡 Lưu ý: ...               │
├─────────────────────────────┤
│ Footer (Sticky)             │
│ [Áp dụng bộ lọc]            │
│ [Đặt lại mặc định]          │
└─────────────────────────────┘
```

**Responsive Width:**

- Mobile (xs): 85% screen width
- Desktop (sm+): 360px fixed

**Deadline Filter Options:**

- `ALL`: 📋 Tất cả (default)
- `QUA_HAN`: ⚠️ Quá hạn
- `SAP_QUA_HAN`: ⏰ Sắp hết hạn
- `DUNG_HAN`: ✅ Đúng hạn

**Sử dụng:**

```javascript
const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
const [deadlineFilter, setDeadlineFilter] = useState("ALL");

<MobileFilterDrawer
  open={filterDrawerOpen}
  onClose={() => setFilterDrawerOpen(false)}
  dateRange={dateRange}
  selectedPreset={selectedPreset}
  onDatePresetChange={handleDatePresetChange}
  deadlineFilter={deadlineFilter}
  onDeadlineFilterChange={setDeadlineFilter}
/>;
```

## ✏️ Thay Đổi Trong `CongViecDashboardPage.js`

### A. State Management

**New State:**

```javascript
// Mobile detection
const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down("md"));

// Filter drawer state
const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
const [deadlineFilter, setDeadlineFilter] = useState("ALL");

// Active filter count for badge
const activeFilterCount = deadlineFilter !== "ALL" ? 1 : 0;
```

### B. Header Changes

**Before:**

```javascript
<Stack direction="row" alignItems="center" spacing={2} mb={3}>
  <IconButton onClick={() => navigate("/quanlycongviec")}>
    <ArrowLeft size={24} />
  </IconButton>
  <Box flex={1}>
    <Typography variant="h5">📋 Dashboard Công Việc</Typography>
    <Typography variant="caption">
      {formatDateRangeContext(dateRange)}
    </Typography>
  </Box>
  <Tooltip title="Làm mới">
    <IconButton onClick={handleRefresh}>
      <Refresh size={20} />
    </IconButton>
  </Tooltip>
</Stack>
```

**After:**

```javascript
<Stack direction="row" alignItems="center" spacing={2} mb={3}>
  <IconButton onClick={() => navigate("/quanlycongviec")}>
    <ArrowLeft size={24} />
  </IconButton>
  <Box flex={1}>
    <Typography variant="h5">📋 Dashboard Công Việc</Typography>
    <Typography variant="caption">
      {formatDateRangeContext(dateRange)}
    </Typography>
  </Box>

  {/* 🆕 Filter button (Mobile only) */}
  {isMobile && (
    <Tooltip title="Bộ lọc">
      <IconButton onClick={() => setFilterDrawerOpen(true)}>
        <Badge badgeContent={activeFilterCount} color="primary">
          <Filter size={20} />
        </Badge>
      </IconButton>
    </Tooltip>
  )}

  <Tooltip title="Làm mới">
    <IconButton onClick={handleRefresh}>
      <Refresh size={20} />
    </IconButton>
  </Tooltip>
</Stack>
```

### C. DateRangePresets Conditional Rendering

**Before:** Always visible inline

```javascript
<DateRangePresets
  onSelectPreset={handleDatePresetChange}
  selectedPreset={selectedPreset}
  disabled={isLoading}
/>
```

**After:** Desktop only (moved to drawer on mobile)

```javascript
{
  !isMobile && (
    <DateRangePresets
      onSelectPreset={handleDatePresetChange}
      selectedPreset={selectedPreset}
      disabled={isLoading}
    />
  );
}
```

### D. Alert Cards Replacement

**Before:** 1 alert card (overdue only, unclear source)

```javascript
<DeadlineAlertCard tasks={receivedCongViecs || []} />
```

**After:** 4 collapsible alert cards (2×2 matrix)

```javascript
{
  /* Việc nhận - Quá hạn */
}
<CollapsibleAlertCard
  tasks={receivedCongViecs || []}
  type="overdue"
  taskSource="received"
  userId={user?._id}
  dismissible={true}
/>;

{
  /* Việc nhận - Sắp hết hạn */
}
<CollapsibleAlertCard
  tasks={receivedCongViecs || []}
  type="upcoming"
  taskSource="received"
  userId={user?._id}
  dismissible={true}
/>;

{
  /* Việc giao - Quá hạn */
}
<CollapsibleAlertCard
  tasks={assignedCongViecs || []}
  type="overdue"
  taskSource="assigned"
  userId={user?._id}
  dismissible={true}
/>;

{
  /* Việc giao - Sắp hết hạn */
}
<CollapsibleAlertCard
  tasks={assignedCongViecs || []}
  type="upcoming"
  taskSource="assigned"
  userId={user?._id}
  dismissible={true}
/>;
```

### E. Mobile Filter Drawer Integration

**Added at end of component:**

```javascript
{
  /* Mobile Filter Drawer */
}
<MobileFilterDrawer
  open={filterDrawerOpen}
  onClose={() => setFilterDrawerOpen(false)}
  dateRange={dateRange}
  selectedPreset={selectedPreset}
  onDatePresetChange={handleDatePresetChange}
  deadlineFilter={deadlineFilter}
  onDeadlineFilterChange={handleDeadlineFilterChange}
  onApply={() => {
    // Filter is applied on parent state change
  }}
  onReset={() => {
    // Reset callback placeholder
  }}
/>;
```

## 🎨 UI/UX Cải Thiện

### Desktop (≥ 960px)

- ✅ DateRangePresets inline như cũ
- ✅ 4 alert cards hiển thị đầy đủ (có thể collapse manually)
- ✅ No filter drawer (không cần thiết)

### Mobile (< 960px)

- ✅ DateRangePresets ẩn, thay bằng Filter icon button
- ✅ Filter button có badge hiển thị số filter active
- ✅ Alert cards collapsed by default (user có thể expand)
- ✅ Top 3 tasks hiển thị trong mỗi alert (thay vì 5)
- ✅ Filter drawer slides từ bên phải

### Alert Cards Behavior

**Overdue (Quá hạn):**

- Severity: `error` (red background)
- Icon: `Danger` (Bold variant)
- Title: "⚠️ Cảnh báo: X công việc [nhận/giao] quá hạn"
- Badge: "Quá X ngày" (số ngày quá hạn)
- Filter: `TinhTrangThoiHan === "QUA_HAN"`

**Upcoming (Sắp hết hạn):**

- Severity: `warning` (orange background)
- Icon: `Warning2` (Bold variant)
- Title: "⏰ Lưu ý: X công việc [nhận/giao] sắp hết hạn"
- Badge: "Còn X ngày" (số ngày còn lại)
- Filter: `TinhTrangThoiHan === "SAP_QUA_HAN"`

**Dismiss Behavior:**

- Click `CloseCircle` icon → Alert ẩn
- localStorage key: `alert-{type}-{taskSource}-{userId}-dismissed`
- Cooldown: 24 hours
- Auto re-appear sau 24h

**Collapse Behavior:**

- Mobile: Default collapsed
- Desktop: Default expanded
- User có thể toggle bằng `ArrowDown2`/`ArrowUp2` icon

## 📱 Responsive Breakpoints

| Device  | Width        | Behavior                                   |
| ------- | ------------ | ------------------------------------------ |
| Mobile  | < 600px (xs) | Filter drawer 85% width, alerts collapsed  |
| Tablet  | 600-960px    | Filter drawer 360px, alerts collapsed      |
| Desktop | ≥ 960px (md) | Inline filters, no drawer, alerts expanded |

## 🔍 Filter Logic

### Deadline Filter (Future Enhancement)

Hiện tại `deadlineFilter` state được lưu nhưng **chưa được apply** trong logic filtering. Đây là placeholder cho future enhancement:

```javascript
// TODO: Apply deadline filter to tasks
const filteredReceivedTasks = useMemo(() => {
  if (deadlineFilter === "ALL") return receivedCongViecs;
  return receivedCongViecs.filter(
    (task) => task.TinhTrangThoiHan === deadlineFilter
  );
}, [receivedCongViecs, deadlineFilter]);
```

**Lý do chưa implement:**

- Dashboard hiện tại fetch **tất cả** công việc chưa hoàn thành (theo user decision)
- Alert cards đã tự động filter theo `TinhTrangThoiHan`
- Sections (ReceivedDashboardSection, AssignedDashboardSection) hiển thị toàn bộ data
- Filter này có thể được thêm sau nếu user muốn ẩn sections dựa trên deadline status

## 🐛 Known Issues & Future Enhancements

### ✅ Resolved

- ✅ Import error sau khi move file → Fixed với correct path
- ✅ API naming mismatch → Used correct action names
- ✅ Date params unnecessary → Removed from API calls

### 🔜 Future Enhancements

1. **Apply Deadline Filter to Sections:**

   - Hiện tại filter chỉ dùng để highlight trong drawer
   - Có thể extend để filter tasks trong ReceivedDashboardSection/AssignedDashboardSection

2. **Priority Filter:**

   - Thêm priority chips trong drawer (Khẩn cấp/Cao/Bình thường/Thấp)
   - Apply vào sections

3. **Custom Date Range Picker:**

   - Thêm DatePicker manual trong drawer
   - Alternative cho presets

4. **Pull-to-Refresh:**

   - Mobile gesture cho refresh data

5. **Empty State Illustrations:**

   - Show illustration khi không có công việc nào

6. **Search/Filter trong Sections:**
   - Quick search box trong mỗi section
   - Filter by người tham gia, tags, etc.

## 📊 Performance Considerations

### Optimizations Applied

- ✅ `useMemo` cho filtering tasks in alert cards
- ✅ Conditional rendering với `isMobile` check
- ✅ Alert cards auto-hide khi không có data
- ✅ Lazy render: Drawer chỉ render khi `open={true}`

### Potential Bottlenecks

- ⚠️ 4 alert cards render đồng thời (mỗi card filter toàn bộ tasks array)
- ⚠️ `useTaskCounts` hook chạy 2 lần (received + assigned)

**Solution (nếu cần):**

```javascript
// Memoize filtered tasks ở parent level
const memoizedReceivedOverdue = useMemo(
  () => filterOverdueTasks(receivedCongViecs),
  [receivedCongViecs]
);

// Pass pre-filtered tasks to alert cards
<CollapsibleAlertCard tasks={memoizedReceivedOverdue} type="overdue" ... />
```

## 🧪 Testing Checklist

### Mobile Testing (< 960px)

- [ ] Filter icon xuất hiện ở header
- [ ] DateRangePresets ẩn khỏi main page
- [ ] Click filter icon → Drawer slides từ phải
- [ ] Drawer width = 85% screen
- [ ] Alert cards collapsed by default
- [ ] Top 3 tasks hiển thị trong alert
- [ ] Collapse/expand toggle hoạt động

### Desktop Testing (≥ 960px)

- [ ] Filter icon không xuất hiện
- [ ] DateRangePresets hiển thị inline
- [ ] Alert cards expanded by default
- [ ] Top 5 tasks hiển thị trong alert

### Alert Card Testing

- [ ] 4 alert cards render với đúng data
- [ ] Overdue cards màu đỏ (error)
- [ ] Upcoming cards màu cam (warning)
- [ ] Click task → Navigate to detail
- [ ] Dismiss icon → Alert ẩn
- [ ] Dismiss localStorage lưu đúng key
- [ ] Re-open page trong 24h → Alert vẫn ẩn
- [ ] Re-open page sau 24h → Alert xuất hiện lại

### Filter Drawer Testing

- [ ] DateRangePresets chips hoạt động
- [ ] Deadline filter chips toggle
- [ ] Active filter badge count đúng
- [ ] "Áp dụng bộ lọc" button close drawer
- [ ] "Đặt lại mặc định" reset về week + ALL
- [ ] Close icon (×) close drawer
- [ ] Click outside drawer → Close

## 📚 Dependencies

**Không có dependencies mới.** Tất cả imports sử dụng existing components và libraries:

- `@mui/material` - MUI components
- `iconsax-react` - Icons
- `dayjs` - Date manipulation
- `react-router-dom` - Navigation

## 🔗 Related Files

### Modified

- `CongViecDashboardPage.js` (✏️ 224 lines → ~300 lines)

### Created

- `utils/taskAlertHelpers.js` (🆕 180 lines)
- `components/CollapsibleAlertCard.js` (🆕 210 lines)
- `components/MobileFilterDrawer.js` (🆕 260 lines)

### Deprecated

- `components/DeadlineAlertCard.js` (⚠️ Keep for backward compatibility, recommend replacing)

### Related

- `components/OverallMetrics.js` (No changes)
- `components/ReceivedDashboardSection.js` (No changes)
- `components/AssignedDashboardSection.js` (No changes)
- `CongViec/components/DateRangePresets.js` (Reused in drawer)
- `CongViec/hooks/useTaskCounts.js` (Reused)

## 📝 Migration Notes

### Nếu đã custom DeadlineAlertCard

**Old code:**

```javascript
<DeadlineAlertCard tasks={receivedCongViecs} />
```

**New code:**

```javascript
{
  /* Overdue received */
}
<CollapsibleAlertCard
  tasks={receivedCongViecs}
  type="overdue"
  taskSource="received"
  userId={user?._id}
/>;

{
  /* Upcoming received */
}
<CollapsibleAlertCard
  tasks={receivedCongViecs}
  type="upcoming"
  taskSource="received"
  userId={user?._id}
/>;
```

### Breaking Changes

**NONE.** Đây là additive changes, backward compatible.

- Old `DeadlineAlertCard` vẫn hoạt động nếu không remove
- New components là opt-in

## 🎉 Summary

**Tổng cộng:**

- ✅ 3 file mới tạo (650+ lines)
- ✅ 1 file updated (~100 lines added)
- ✅ 4 alert cards thay vì 1
- ✅ Mobile-first responsive design
- ✅ Filter drawer với 10 date presets + 4 deadline filters
- ✅ Collapsible + dismissible alerts
- ✅ Clear distinction: received vs assigned, overdue vs upcoming

**Kết quả:**

Dashboard công việc giờ đây thân thiện với mobile hơn nhiều, filter dễ dàng, cảnh báo rõ ràng và có thể ẩn/collapse để tiết kiệm không gian màn hình.

---

**Tài liệu này bao gồm:**

- ✅ File structure mới
- ✅ Component APIs với props tables
- ✅ Code examples và usage patterns
- ✅ UI/UX behavior specifications
- ✅ Testing checklist
- ✅ Migration guide
- ✅ Future enhancement suggestions

**Cần thiết cho maintainer/developer:**

- Đọc `taskAlertHelpers.js` để hiểu các helper functions
- Test trên cả desktop lẫn mobile (breakpoint: 960px)
- Review localStorage keys cho dismiss functionality
- Kiểm tra performance với large task arrays

---

**Document version:** 1.0  
**Last updated:** 13/01/2026  
**Next review:** After user feedback from production testing
