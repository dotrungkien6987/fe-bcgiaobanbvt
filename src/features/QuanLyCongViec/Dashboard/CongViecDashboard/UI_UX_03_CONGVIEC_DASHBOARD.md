# UI/UX Specification: CongViecDashboardPage (Updated V2)

**Version:** 2.0  
**Last Updated:** 2026-01-13  
**Status:** 🟢 Approved (Brain Storm Design)  
**Original Spec:** UI_UX_03.md (V1 - Deprecated)

---

## 📋 Document History

| Version | Date | Changes | Reason |
|---------|------|---------|--------|
| 1.0 | 2026-01-10 | Initial spec with StatusGrid pattern | First draft |
| 2.0 | 2026-01-13 | **Complete redesign** based on brain storm | - Removed invalid status cards<br>- Added date filter context<br>- Changed API strategy<br>- Added client-side metrics |

---

## 🎯 Overview

**Purpose:** Dashboard chính cho module "Quản lý công việc", cung cấp overview nhanh về:
- Công việc tôi nhận (4 trạng thái)
- Công việc tôi giao (5 trạng thái)
- Deadline warnings (quá hạn, sắp hạn)
- Performance metrics (avgProgress, onTimeRate)

**Target Users:**
- **Employees** - Xem việc nhận, track progress
- **Managers** - Xem việc giao, monitor team performance

**Navigation:**
- Entry: Bottom nav button "Công việc" → `/cong-viec-dashboard`
- Exit: Back button → `/quanlycongviec`, Click cards → Detail pages with filters

---

## 🖥️ Screen Layout

### Desktop (≥ 960px)

```
┌───────────────────────────────────────────────────────────────────────┐
│ [←] 📋 Dashboard Công Việc                         [🔄 Refresh]       │
│     Tuần này: 08 - 15/01/2026                                         │
├───────────────────────────────────────────────────────────────────────┤
│ [Date Range Presets - 10 Chips in Horizontal Scroll]                 │
│ Hôm nay | 7 ngày qua | 30 ngày qua | Tuần này | ...                  │
├───────────────────────────────────────────────────────────────────────┤
│ ━━━━━━━━━━ [Loading Progress Bar] ━━━━━━━━━━━━━━                     │
├───────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ╔═══════════╦═══════════╦═══════════╦═══════════╗                     │
│ ║ [Task]    ║ [Danger]  ║ [Clock]   ║[TickCircle]║  Overall Metrics  │
│ ║ Tổng CV   ║ Quá hạn   ║ Sắp hạn   ║ Hoàn thành║                    │
│ ║   12      ║    3      ║    5      ║    34     ║  (4 Cards)         │
│ ║ 7 nhận    ║ 2 nhận    ║ Cảnh báo  ║ 92% đúng  ║                    │
│ ║ 5 giao    ║ 1 giao    ║ deadline  ║   hạn     ║                    │
│ ╚═══════════╩═══════════╩═══════════╩═══════════╝                     │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐ │
│ │ ⚠️ Cảnh báo: 3 công việc quá hạn                                 │ │
│ │                                                                   │ │
│ │ ┌─────────────────────────────────────────────────────────────┐ │ │
│ │ │ Hoàn thiện báo cáo tháng 12               [Quá 7 ngày]      │ │ │
│ │ │ Ưu tiên: KHAN_CAP                                            │ │ │
│ │ └─────────────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────────────┐ │ │
│ │ │ Review thiết kế UI mới                    [Quá 3 ngày]      │ │ │
│ │ └─────────────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────────────┐ │ │
│ │ │ Cập nhật tài liệu API                     [Quá 2 ngày]      │ │ │
│ │ └─────────────────────────────────────────────────────────────┘ │ │
│ │                                                                   │ │
│ │ [Xem tất cả (5 việc)]                                            │ │
│ └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐ │
│ │ 📥 VIỆC TÔI NHẬN (12)                      [Xem tất cả →]       │ │
│ │                                                                   │ │
│ │ ╔══════════╦══════════╦══════════╦══════════╗                    │ │
│ │ ║ [Receive]║ [Task]   ║ [Clock]  ║[TickCircle]                   │ │
│ │ ║ Chờ nhận ║ Đang làm ║ Chờ duyệt║ Hoàn thành║  Status Cards    │ │
│ │ ║    3     ║    7     ║    2     ║    34    ║  (4 Cards)        │ │
│ │ ║ Đã giao  ║          ║          ║          ║                    │ │
│ │ ║ chưa nhận║          ║          ║          ║                    │ │
│ │ ╚══════════╩══════════╩══════════╩══════════╝                    │ │
│ │                                                                   │ │
│ │ Deadline: 🔴 2 quá hạn | 🟡 3 sắp hạn                            │ │
│ └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐ │
│ │ 📤 VIỆC TÔI GIAO (18)                      [Xem tất cả →]       │ │
│ │                                                                   │ │
│ │ ╔═════╦═════╦═════╦═════╦══════╗                                 │ │
│ │ ║[Doc]║[Send]║[Task]║[Eye]║[Tick]║  Status Cards (5)            │ │
│ │ ║Tạo  ║Đã   ║Đang ║Chờ  ║Hoàn  ║                                │ │
│ │ ║mới  ║giao ║thực ║duyệt║thành ║                                │ │
│ │ ║  2  ║  5  ║hiện║ (Cần║  7   ║                                │ │
│ │ ║Chưa ║     ║  3  ║kiểm ║      ║                                │ │
│ │ ║giao ║     ║     ║tra) ║      ║                                │ │
│ │ ╚═════╩═════╩═════╩═════╩══════╝                                 │ │
│ │                                                                   │ │
│ │ Deadline: 🔴 1 quá hạn | 🟡 2 sắp hạn                            │ │
│ │ Progress: ⏳ TB 65% | ✅ 88% đúng hạn                             │ │
│ └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└───────────────────────────────────────────────────────────────────────┘
```

### Mobile (< 600px)

```
┌───────────────────────────────┐
│ [←] 📋 Dashboard              │
│     Tuần này: 08-15/01        │
├───────────────────────────────┤
│ [Date Presets - Horizontal]   │
│ Hôm nay | 7 ngày | Tuần này   │
├───────────────────────────────┤
│ ━━━━━━ [Loading] ━━━━━━━      │
├───────────────────────────────┤
│                                │
│ ╔═══════╦═══════╗  Metrics    │
│ ║ 12    ║  3    ║  (2x2 Grid)│
│ ║ Tổng  ║ Quá   ║              │
│ ╠═══════╬═══════╣              │
│ ║  5    ║  34   ║              │
│ ║ Sắp   ║ Hoàn  ║              │
│ ╚═══════╩═══════╝              │
│                                │
│ ⚠️ 3 việc quá hạn             │
│ ┌──────────────────────────┐  │
│ │ Hoàn thiện BC  [Quá 7]   │  │
│ └──────────────────────────┘  │
│ ┌──────────────────────────┐  │
│ │ Review UI      [Quá 3]   │  │
│ └──────────────────────────┘  │
│ [Xem tất cả]                  │
│                                │
│ 📥 VIỆC NHẬN (12)  [Xem →]   │
│ ╔═══════╦═══════╗              │
│ ║   3   ║   7   ║  (2x2 Grid)│
│ ║ Chờ   ║ Đang  ║              │
│ ║ nhận  ║ làm   ║              │
│ ╠═══════╬═══════╣              │
│ ║   2   ║  34   ║              │
│ ║ Chờ   ║ Hoàn  ║              │
│ ║ duyệt ║ thành ║              │
│ ╚═══════╩═══════╝              │
│ 🔴 2 quá | 🟡 3 sắp           │
│                                │
│ 📤 VIỆC GIAO (18)  [Xem →]   │
│ ╔═══════╦═══════╗              │
│ ║   2   ║   5   ║  (3 rows)  │
│ ║ Tạo   ║ Đã    ║              │
│ ║ mới   ║ giao  ║              │
│ ╠═══════╬═══════╣              │
│ ║   3   ║   1   ║              │
│ ║ Đang  ║ Chờ   ║              │
│ ╠═══════╬═══════╣              │
│ ║       7       ║              │
│ ║   Hoàn thành  ║              │
│ ╚═══════════════╝              │
│ 🔴 1 quá | 🟡 2 sắp           │
│ ⏳ TB 65% | ✅ 88% đúng hạn    │
│                                │
│ [Bottom Navigation - 5 Tabs]  │
└───────────────────────────────┘
```

---

## 🎨 Visual Design Tokens

### Colors (MUI Theme)

| Element | Token | Hex Value | Usage |
|---------|-------|-----------|-------|
| **Primary** | `primary.main` | `#1976D2` | Đang thực hiện status |
| **Error** | `error.main` | `#D32F2F` | Quá hạn alerts |
| **Warning** | `warning.main` | `#ED6C02` | Sắp hạn, Chờ duyệt |
| **Success** | `success.main` | `#2E7D32` | Hoàn thành |
| **Info** | `info.main` | `#0288D1` | Đã giao, Chờ nhận |
| **Default** | `grey[500]` | `#9E9E9E` | Tạo mới (inactive) |
| **Background** | `background.paper` | `#FFFFFF` | Card backgrounds |

### Typography

| Element | Variant | Font Size | Weight | Usage |
|---------|---------|-----------|--------|-------|
| Page Title | `h5` | 24px | 600 | "Dashboard Công Việc" |
| Section Title | `h6` | 18px | 600 | "VIỆC TÔI NHẬN" |
| Metric Value | `h4` | 34px | 600 | Count numbers |
| Card Label | `body2` | 14px | 400 | Status labels |
| Subtext | `caption` | 12px | 400 | "(Đã giao chưa nhận)" |
| Date Context | `caption` | 12px | 400 | "Tuần này: 08-15/01" |

### Spacing

```javascript
// MUI spacing scale (1 unit = 8px)
{
  cardPadding: 3,        // 24px
  sectionGap: 3,         // 24px between sections
  cardGap: 2,            // 16px between cards
  metricGap: 1,          // 8px icon-to-text
  headerMargin: 3,       // 24px below header
  bottomNavHeight: 8,    // 64px
}
```

### Iconography

All icons from **iconsax-react** library:

| Icon Component | Variant | Size | Usage |
|----------------|---------|------|-------|
| `Task` | Bold | 32px | Tổng công việc, Đang làm |
| `Danger` | Bold | 32px | Quá hạn |
| `Clock` | Bold | 32px | Sắp hạn, Chờ duyệt |
| `TickCircle` | Bold | 32px | Hoàn thành |
| `Receive` | Bold | 32px | Chờ nhận |
| `Send` | Bold | 32px | Đã giao |
| `DocumentText` | Bold | 32px | Tạo mới |
| `Eye` | Bold | 32px | Chờ duyệt (Cần kiểm tra) |
| `ArrowLeft` | Linear | 24px | Back button |
| `Refresh` | Linear | 20px | Refresh button |
| `ArrowRight` | Linear | 16px | "Xem tất cả" button |

---

## 📊 Component Breakdown

### 1. Header Section

**Component:** `Box` with flexbox layout

**Elements:**
```javascript
<Stack direction="row" alignItems="center" spacing={2}>
  {/* Back button */}
  <IconButton onClick={() => navigate("/quanlycongviec")} size="large">
    <ArrowLeft size={24} />
  </IconButton>

  {/* Title + Date Context */}
  <Box flex={1}>
    <Typography variant="h5" fontWeight={600}>
      📋 Dashboard Công Việc
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {formatDateRangeContext(dateRange)}
    </Typography>
  </Box>

  {/* Refresh button */}
  <Tooltip title="Làm mới">
    <IconButton onClick={handleRefresh} disabled={isLoading}>
      <Refresh size={20} />
    </IconButton>
  </Tooltip>
</Stack>
```

**formatDateRangeContext logic:**
```javascript
function formatDateRangeContext(dateRange) {
  const { from, to } = dateRange;
  const fromDay = dayjs(from);
  const toDay = dayjs(to);

  // Same day
  if (fromDay.isSame(toDay, "day")) {
    return `Hôm nay: ${fromDay.format("DD/MM/YYYY")}`;
  }

  // Same week
  if (fromDay.isSame(dayjs().startOf("week")) && toDay.isSame(dayjs().endOf("week"))) {
    return `Tuần này: ${fromDay.format("DD")} - ${toDay.format("DD/MM/YYYY")}`;
  }

  // Same month
  if (fromDay.month() === toDay.month()) {
    return `Tháng ${fromDay.format("MM/YYYY")}: ${fromDay.format("DD")} - ${toDay.format("DD")}`;
  }

  // Generic range
  return `${fromDay.format("DD/MM")} - ${toDay.format("DD/MM/YYYY")}`;
}
```

---

### 2. DateRangePresets Component (Reuse)

**File:** `features/QuanLyCongViec/CongViec/components/DateRangePresets.js`

**Props Interface:**
```typescript
interface DateRangePresetsProps {
  onSelectPreset: (from: string, to: string, key: string) => void;
  selectedPreset?: string;
  disabled?: boolean;
}
```

**Usage:**
```javascript
import DateRangePresets from "../CongViec/components/DateRangePresets";

const [selectedPreset, setSelectedPreset] = useState("week");
const [dateRange, setDateRange] = useState({
  from: dayjs().startOf("week").format("YYYY-MM-DD"),
  to: dayjs().endOf("week").format("YYYY-MM-DD"),
});

const handleDatePresetChange = (from, to, key) => {
  setDateRange({ from, to });
  setSelectedPreset(key);
};

<DateRangePresets
  onSelectPreset={handleDatePresetChange}
  selectedPreset={selectedPreset}
  disabled={isLoading}
/>
```

**10 Presets Available:**
1. `today` - Hôm nay
2. `last7days` - 7 ngày qua
3. `last30days` - 30 ngày qua
4. `week` - Tuần này ⭐ **Default**
5. `lastWeek` - Tuần trước
6. `month` - Tháng này
7. `lastMonth` - Tháng trước
8. `quarter` - Quý này
9. `lastQuarter` - Quý trước
10. `year` - Năm nay

---

### 3. OverallMetrics Component

**File:** `components/OverallMetrics.js` (NEW)

**Props:**
```typescript
interface OverallMetricsProps {
  receivedCounts: CongViecCounts;
  assignedCounts: CongViecCounts;
  dateRange: { from: string; to: string };
}
```

**Layout:** 4-column grid on desktop, 2x2 on mobile

```javascript
<Grid container spacing={2}>
  <Grid item xs={6} sm={3}>
    <MetricCard {...totalCard} />
  </Grid>
  <Grid item xs={6} sm={3}>
    <MetricCard {...overdueCard} />
  </Grid>
  <Grid item xs={6} sm={3}>
    <MetricCard {...dueSoonCard} />
  </Grid>
  <Grid item xs={6} sm={3}>
    <MetricCard {...completedCard} />
  </Grid>
</Grid>
```

**MetricCard Structure:**
```javascript
<Card sx={{ cursor: clickable ? "pointer" : "default" }}>
  <CardContent>
    <Stack spacing={1} alignItems="center">
      {/* Icon */}
      <Icon size={32} color={colorValue} variant="Bold" />
      
      {/* Value */}
      <Typography variant="h4" fontWeight={600}>
        {value}
      </Typography>
      
      {/* Label */}
      <Typography variant="body2" color="text.secondary" textAlign="center">
        {label}
      </Typography>
      
      {/* Subtext */}
      {subtext && (
        <Typography variant="caption" color="text.secondary">
          {subtext}
        </Typography>
      )}
    </Stack>
  </CardContent>
</Card>
```

**Interaction:**
- **Hover effect** (if clickable): `transform: translateY(-2px)`, `boxShadow: 3`
- **onClick**: Navigate to filtered page
  - Tổng CV: No action (summary only)
  - Quá hạn: `/cong-viec-cua-toi?tinhTrangHan=QUA_HAN`
  - Sắp hạn: `/cong-viec-cua-toi?tinhTrangHan=SAP_QUA_HAN`
  - Hoàn thành: No action (read-only metric)

---

### 4. DeadlineAlertCard Component

**File:** `components/DeadlineAlertCard.js` (NEW)

**Props:**
```typescript
interface DeadlineAlertCardProps {
  tasks: CongViec[];
}
```

**Conditional Rendering:**
```javascript
const overdueTasks = useMemo(() => {
  return tasks
    .filter(t => t.TinhTrangThoiHan === "QUA_HAN")
    .sort((a, b) => new Date(a.NgayHetHan) - new Date(b.NgayHetHan))
    .slice(0, 5);
}, [tasks]);

if (overdueTasks.length === 0) {
  return null; // Don't render if no overdue
}
```

**Layout:**
```javascript
<Alert severity="error" icon={<Danger variant="Bold" size={24} />}>
  <AlertTitle>
    ⚠️ Cảnh báo: {overdueTasks.length} công việc quá hạn
  </AlertTitle>
  
  <Stack spacing={1.5} mt={1}>
    {overdueTasks.map(task => (
      <Box
        key={task._id}
        sx={{
          p: 1.5,
          borderRadius: 1,
          bgcolor: "rgba(255, 255, 255, 0.1)",
          cursor: "pointer",
          "&:hover": { bgcolor: "rgba(255, 255, 255, 0.2)" },
        }}
        onClick={() => navigate(`/quanlycongviec/congviec/${task._id}`)}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="body2" fontWeight={600} flex={1}>
            {task.TieuDe}
          </Typography>
          <Chip
            label={`Quá ${getDaysOverdue(task.NgayHetHan)} ngày`}
            size="small"
            color="error"
          />
        </Stack>
      </Box>
    ))}
    
    {overdueTasks.length === 5 && (
      <Button size="small" onClick={() => navigate("/cong-viec-cua-toi?tinhTrangHan=QUA_HAN")}>
        Xem tất cả ({tasks.filter(t => t.TinhTrangThoiHan === "QUA_HAN").length} việc)
      </Button>
    )}
  </Stack>
</Alert>
```

**getDaysOverdue Helper:**
```javascript
function getDaysOverdue(deadline) {
  return dayjs().diff(dayjs(deadline), "day");
}
```

---

### 5. ReceivedDashboardSection Component

**File:** `components/ReceivedDashboardSection.js` (NEW)

**Props:**
```typescript
interface ReceivedDashboardSectionProps {
  counts: CongViecCounts;
  tasks: CongViec[];
  isLoading: boolean;
}
```

**Layout:**
```javascript
<Card>
  <CardContent>
    {/* Header */}
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
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

    {/* Status Grid */}
    {isLoading ? (
      <StatusGridSkeleton columns={4} />
    ) : (
      <Grid container spacing={2}>
        {statusCards.map(card => (
          <Grid item xs={6} sm={3} key={card.id}>
            <StatusCardItem {...card} />
          </Grid>
        ))}
      </Grid>
    )}

    {/* Deadline Summary */}
    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
      Deadline: 🔴 {counts.overdue || 0} quá hạn | 🟡 {counts.dueSoon || 0} sắp hạn
    </Typography>
  </CardContent>
</Card>
```

**Status Cards Configuration:**

| ID | Label | Subtext | Icon | Color | Backend Status | onClick URL |
|----|-------|---------|------|-------|----------------|-------------|
| `DA_GIAO` | Chờ nhận | (Đã giao chưa nhận) | Receive | info | `DA_GIAO` | `/cong-viec-cua-toi?trangThai=DA_GIAO` |
| `DANG_THUC_HIEN` | Đang làm | - | Task | primary | `DANG_THUC_HIEN` | `/cong-viec-cua-toi?trangThai=DANG_THUC_HIEN` |
| `CHO_DUYET` | Chờ duyệt | - | Clock | warning | `CHO_DUYET` | `/cong-viec-cua-toi?trangThai=CHO_DUYET` |
| `HOAN_THANH` | Hoàn thành | - | TickCircle | success | `HOAN_THANH` | `/quanlycongviec/lich-su-hoan-thanh` |

**❌ Removed from V1 Spec:**
- ~~"Từ chối"~~ - Backend không có status này cho received tasks
- ~~"Cần bổ sung"~~ - Backend không có status này

---

### 6. AssignedDashboardSection Component

**File:** `components/AssignedDashboardSection.js` (NEW)

**Props:**
```typescript
interface AssignedDashboardSectionProps {
  counts: CongViecCounts;
  tasks: CongViec[];
  dateRange: { from: string; to: string };
  isLoading: boolean;
}
```

**Layout:**
```javascript
<Card>
  <CardContent>
    {/* Header */}
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
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

    {/* Status Grid (5 cards) */}
    {isLoading ? (
      <StatusGridSkeleton columns={5} />
    ) : (
      <Grid container spacing={2}>
        {statusCards.map(card => (
          <Grid item xs={6} sm={2.4} key={card.id}>
            <StatusCardItem {...card} />
          </Grid>
        ))}
      </Grid>
    )}

    {/* Metrics Summary */}
    <Stack 
      direction={{ xs: "column", sm: "row" }} 
      spacing={3} 
      sx={{ mt: 2 }}
    >
      <Typography variant="caption" color="text.secondary">
        Deadline: 🔴 {counts.overdue || 0} quá hạn | 🟡 {counts.dueSoon || 0} sắp hạn
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Progress: ⏳ TB {avgProgress}% | ✅ {onTimeRate}% đúng hạn
      </Typography>
    </Stack>
  </CardContent>
</Card>
```

**Status Cards Configuration:**

| ID | Label | Subtext | Icon | Color | Backend Status | onClick URL |
|----|-------|---------|------|-------|----------------|-------------|
| `TAO_MOI` | Tạo mới | (Chưa giao) | DocumentText | default | `TAO_MOI` | `/viec-toi-giao?trangThai=TAO_MOI` |
| `DA_GIAO` | Đã giao | - | Send | info | `DA_GIAO` | `/viec-toi-giao?trangThai=DA_GIAO` |
| `DANG_THUC_HIEN` | Đang thực hiện | - | Task | primary | `DANG_THUC_HIEN` | `/viec-toi-giao?trangThai=DANG_THUC_HIEN` |
| `CHO_DUYET` | Chờ duyệt | (Cần kiểm tra) | Eye | warning | `CHO_DUYET` | `/viec-toi-giao?trangThai=CHO_DUYET` |
| `HOAN_THANH` | Hoàn thành | - | TickCircle | success | `HOAN_THANH` | `/viec-toi-giao?trangThai=HOAN_THANH` |

**Metrics Calculations:**

1. **avgProgress (%)** - Average progress of active tasks:
```javascript
const avgProgress = useMemo(() => {
  const activeTasks = tasks.filter(t => 
    ["DA_GIAO", "DANG_THUC_HIEN", "CHO_DUYET"].includes(t.TrangThai)
  );
  
  if (activeTasks.length === 0) return 0;
  
  const totalProgress = activeTasks.reduce((sum, task) => 
    sum + (task.PhanTramTienDoTong || 0), 0
  );
  
  return Math.round(totalProgress / activeTasks.length);
}, [tasks]);
```

2. **onTimeRate (%)** - Percentage of tasks completed on time in date range:
```javascript
const onTimeRate = useMemo(() => {
  const completedInRange = tasks.filter(t => 
    t.TrangThai === "HOAN_THANH" &&
    t.NgayHoanThanh >= dateRange.from &&
    t.NgayHoanThanh <= dateRange.to
  );
  
  if (completedInRange.length === 0) return 100; // No tasks = 100% on-time
  
  const onTime = completedInRange.filter(t => 
    new Date(t.NgayHoanThanh) <= new Date(t.NgayHetHan)
  );
  
  return Math.round((onTime.length / completedInRange.length) * 100);
}, [tasks, dateRange]);
```

---

## 🔌 Data & API Integration

### Redux Slices Used

**Primary:**
- `state.congViec.receivedTasks` - From `fetchCongViecByMe()`
- `state.congViec.assignedTasks` - From `fetchCongViecAssigned()`
- `state.auth.user` - For `NhanVienID`

**NOT USED (Deprecated):**
- ~~`state.workDashboard.congViecSummary`~~ - Too limited, doesn't have full task data

### API Calls

**1. Fetch Received Tasks:**
```javascript
GET /api/workmanagement/congviec/me
Query Params:
  - page: 1
  - limit: 500
  - NgayBatDau: "2026-01-08"  // dateRange.from
  - NgayHetHan: "2026-01-15"  // dateRange.to

Response:
{
  success: true,
  data: {
    tasks: CongViec[],
    total: 46,
    currentPage: 1,
    totalPages: 1
  }
}
```

**2. Fetch Assigned Tasks:**
```javascript
GET /api/workmanagement/congviec/assigned
Query Params: (same as above)

Response: (same structure)
```

**Redux Dispatch Pattern:**
```javascript
useEffect(() => {
  if (user?.NhanVienID && dateRange) {
    const params = {
      page: 1,
      limit: 500,
      NgayBatDau: dateRange.from,
      NgayHetHan: dateRange.to,
    };
    
    // Parallel fetch
    dispatch(fetchCongViecByMe(params));
    dispatch(fetchCongViecAssigned(params));
  }
}, [user?.NhanVienID, dateRange]);
```

### CongViec Model Structure

```typescript
interface CongViec {
  _id: string;
  TieuDe: string;
  MoTa?: string;
  TrangThai: "TAO_MOI" | "DA_GIAO" | "DANG_THUC_HIEN" | "CHO_DUYET" | "HOAN_THANH";
  
  // People
  NguoiTaoID: { _id: string; HoTen: string };
  NguoiGiaoViecID: { _id: string; HoTen: string };
  NguoiNhanID: { _id: string; HoTen: string };
  
  // Dates
  NgayTao: string; // ISO date
  NgayBatDau: string;
  NgayHetHan: string;
  NgayHoanThanh?: string;
  
  // Progress
  PhanTramTienDoTong?: number; // 0-100
  
  // Computed fields (backend virtual)
  TinhTrangThoiHan?: "DUNG_HAN" | "SAP_QUA_HAN" | "QUA_HAN";
  
  // Priority
  MucDoUuTien?: "THAP" | "BINH_THUONG" | "CAO" | "KHAN_CAP";
  
  // Other
  GhiChu?: string;
  Files?: string[];
  createdAt: string;
  updatedAt: string;
}
```

### useCongViecCounts Hook

**File:** `features/QuanLyCongViec/CongViec/hooks/useCongViecCounts.js`

**Usage:**
```javascript
import { useCongViecCounts } from "../CongViec/hooks";

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

**Implementation (Reference):**
```javascript
function useCongViecCounts(tasks) {
  return useMemo(() => {
    const byStatus = {};
    let total = 0;
    let active = 0;
    let overdue = 0;
    let dueSoon = 0;
    let onTrack = 0;

    tasks.forEach(task => {
      // Count by status
      const status = task.TrangThai;
      byStatus[status] = (byStatus[status] || 0) + 1;
      total++;

      // Active tasks
      if (status !== "HOAN_THANH") {
        active++;
      }

      // Deadline status
      if (task.TinhTrangThoiHan === "QUA_HAN") {
        overdue++;
      } else if (task.TinhTrangThoiHan === "SAP_QUA_HAN") {
        dueSoon++;
      } else if (task.TinhTrangThoiHan === "DUNG_HAN") {
        onTrack++;
      }
    });

    return {
      byStatus,
      total,
      active,
      overdue,
      dueSoon,
      onTrack,
      byPriority: {}, // Implement if needed
    };
  }, [tasks]);
}
```

---

## 🎭 Interaction States

### Loading States

**Scenario 1: Initial Page Load**
```javascript
{isLoading && <LinearProgress sx={{ mb: 2 }} />}

// All sections show skeleton
<StatusGridSkeleton columns={4} />
<StatusGridSkeleton columns={5} />
```

**Scenario 2: Date Filter Change**
```javascript
// Same as initial load - show skeletons
```

**Scenario 3: Manual Refresh**
```javascript
// Refresh button disabled
<IconButton onClick={handleRefresh} disabled={isLoading}>
  <Refresh size={20} />
</IconButton>

// Linear progress at top
<LinearProgress sx={{ mb: 2 }} />
```

**StatusGridSkeleton Component:**
```javascript
function StatusGridSkeleton({ columns }) {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: columns }).map((_, i) => (
        <Grid item xs={6} sm={12 / columns} key={i}>
          <Card>
            <CardContent>
              <Stack spacing={1} alignItems="center">
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="text" width={60} height={40} />
                <Skeleton variant="text" width={80} height={20} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
```

---

### Empty States

**Scenario 1: No Tasks in Date Range**
```javascript
{receivedCounts.total === 0 && (
  <Box textAlign="center" py={4}>
    <Typography variant="body2" color="text.secondary">
      Chưa có công việc trong khoảng thời gian này
    </Typography>
  </Box>
)}
```

**Scenario 2: No Overdue Tasks**
```javascript
// DeadlineAlertCard returns null - No alert shown
```

---

### Error States

**Scenario: API Failure**
```javascript
{error && (
  <Alert severity="error" sx={{ mb: 2 }}>
    <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
    {error}
    <Button size="small" onClick={handleRetry} sx={{ mt: 1 }}>
      Thử lại
    </Button>
  </Alert>
)}
```

---

### Hover States

**Metric Cards (Clickable):**
```javascript
sx={{
  cursor: "pointer",
  transition: "all 0.2s",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: 3,
  },
}}
```

**Overdue Task Items:**
```javascript
sx={{
  cursor: "pointer",
  transition: "all 0.2s",
  "&:hover": {
    bgcolor: "rgba(255, 255, 255, 0.2)",
  },
}}
```

---

## 📱 Responsive Behavior

### Breakpoint Strategy

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| **xs** | 0-599px | - 2-column grid for metrics<br>- 2-column grid for status cards<br>- Stack metrics summary vertically<br>- Hide "Xem tất cả" button text (show icon only) |
| **sm** | 600-959px | - 4-column metrics<br>- 4-column received cards<br>- 2-column assigned cards (5 cards = 3 rows)<br>- Show full button text |
| **md** | 960-1279px | - 4-column metrics<br>- 4-column received cards<br>- 5-column assigned cards (1 row)<br>- Full width content |
| **lg+** | 1280px+ | - Same as md<br>- Max width: `xl` (1536px)<br>- Centered container |

### Mobile-Specific Adjustments

```javascript
// Header title
<Typography variant={{ xs: "h6", sm: "h5" }} fontWeight={600}>
  📋 Dashboard Công Việc
</Typography>

// Date context - hide year on mobile
<Typography variant="caption" color="text.secondary">
  {dateRange.isSameYear ? 
    `Tuần này: 08 - 15/01` : 
    `Tuần này: 08 - 15/01/2026`
  }
</Typography>

// Metric cards - smaller text
<Typography variant={{ xs: "h5", sm: "h4" }} fontWeight={600}>
  {value}
</Typography>

// Overdue alert - shorter title
<AlertTitle>
  <Typography variant="subtitle2" fontWeight={600}>
    {isMobile ? `⚠️ ${count} việc quá hạn` : `⚠️ Cảnh báo: ${count} công việc quá hạn`}
  </Typography>
</AlertTitle>

// "Xem tất cả" button
<Button 
  size="small" 
  endIcon={!isMobile && <ArrowRight size={16} />}
>
  {isMobile ? "Xem" : "Xem tất cả"}
</Button>
```

---

## 🔗 Navigation Flow

### Entry Points

1. **Bottom Navigation** (Primary)
   - Tab: "Công việc" icon
   - Path: `/cong-viec-dashboard`
   - Always visible on mobile

2. **MenuGridPage** (Secondary)
   - Card: "Dashboard Công Việc"
   - Path: `/cong-viec-dashboard`
   - Desktop + Mobile

3. **Direct URL**
   - User bookmarks page
   - Deep link from notification

### Exit Points & Filters

| Source Element | Destination | URL Query Params | Purpose |
|----------------|-------------|------------------|---------|
| Overall Metrics: Quá hạn | MyTasksPage | `?tinhTrangHan=QUA_HAN` | Show overdue tasks |
| Overall Metrics: Sắp hạn | MyTasksPage | `?tinhTrangHan=SAP_QUA_HAN` | Show due-soon tasks |
| Received: Chờ nhận | MyTasksPage | `?trangThai=DA_GIAO` | Show pending acceptance |
| Received: Đang làm | MyTasksPage | `?trangThai=DANG_THUC_HIEN` | Show in-progress |
| Received: Chờ duyệt | MyTasksPage | `?trangThai=CHO_DUYET` | Show awaiting approval |
| Received: Hoàn thành | CompletedArchive | - | Show completed history |
| Received: "Xem tất cả" | MyTasksPage | - | Show all received tasks |
| Assigned: Tạo mới | AssignedTasksPage | `?trangThai=TAO_MOI` | Show draft tasks |
| Assigned: Đã giao | AssignedTasksPage | `?trangThai=DA_GIAO` | Show assigned |
| Assigned: Đang thực hiện | AssignedTasksPage | `?trangThai=DANG_THUC_HIEN` | Show in-progress |
| Assigned: Chờ duyệt | AssignedTasksPage | `?trangThai=CHO_DUYET` | Show needs review |
| Assigned: Hoàn thành | AssignedTasksPage | `?trangThai=HOAN_THANH` | Show completed |
| Assigned: "Xem tất cả" | AssignedTasksPage | - | Show all assigned tasks |
| Overdue Alert: Task Item | TaskDetailPage | - | Show task details |
| Overdue Alert: "Xem tất cả" | MyTasksPage | `?tinhTrangHan=QUA_HAN` | Show all overdue |
| Header: Back Button | WorkManagement | `/quanlycongviec` | Main menu |
| Bottom Nav: Other Tab | Other Dashboard | - | Switch dashboard |

**Navigation Implementation:**
```javascript
const navigate = useNavigate();
const location = useLocation();

// Preserve state when navigating back
const handleCardClick = (status) => {
  navigate(`/cong-viec-cua-toi?trangThai=${status}`, {
    state: { from: location.pathname, dateRange }, // Pass context
  });
};

// Receive state when navigating back from detail
const { from, dateRange: savedRange } = location.state || {};
if (from === "/cong-viec-cua-toi" && savedRange) {
  setDateRange(savedRange); // Restore previous date filter
}
```

---

## ⚡ Performance Considerations

### Data Fetching Strategy

**1. Parallel Fetch (Recommended)**
```javascript
useEffect(() => {
  const fetchData = async () => {
    const params = { page: 1, limit: 500, NgayBatDau, NgayHetHan };
    
    // Parallel dispatch - both run simultaneously
    await Promise.all([
      dispatch(fetchCongViecByMe(params)),
      dispatch(fetchCongViecAssigned(params)),
    ]);
  };
  
  fetchData();
}, [dateRange]);
```

**2. Debounced Date Filter**
```javascript
const [dateRange, setDateRange] = useState(defaultRange);
const debouncedDateRange = useDebounce(dateRange, 300); // Wait 300ms after last change

useEffect(() => {
  // Fetch only after user stops changing date
  fetchData(debouncedDateRange);
}, [debouncedDateRange]);
```

---

### Memoization

**useMemo for Expensive Calculations:**
```javascript
// Counts (via hook already memoized)
const receivedCounts = useCongViecCounts(receivedTasks.data || []);

// Overdue tasks
const overdueTasks = useMemo(() => {
  return tasks
    .filter(t => t.TinhTrangThoiHan === "QUA_HAN")
    .sort((a, b) => new Date(a.NgayHetHan) - new Date(b.NgayHetHan))
    .slice(0, 5);
}, [tasks]);

// Metrics
const avgProgress = useMemo(() => {
  // Calculation logic
}, [tasks]);
```

---

### Bundle Size

**Lazy Load Dashboard:**
```javascript
// routes/index.js
const CongViecDashboardPage = lazy(() => 
  import("features/QuanLyCongViec/Dashboard/CongViecDashboard/CongViecDashboardPage")
);

<Route 
  path="/cong-viec-dashboard" 
  element={
    <Suspense fallback={<LoadingScreen />}>
      <CongViecDashboardPage />
    </Suspense>
  } 
/>
```

---

## ♿ Accessibility

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Navigate between clickable cards |
| `Enter` / `Space` | Activate focused card |
| `Escape` | Close any open dialogs |
| `Alt + R` | Trigger refresh (keyboard shortcut) |

**Implementation:**
```javascript
// Add keyboard handler
useEffect(() => {
  const handleKeyPress = (e) => {
    if (e.altKey && e.key === "r") {
      handleRefresh();
    }
  };
  
  window.addEventListener("keydown", handleKeyPress);
  return () => window.removeEventListener("keydown", handleKeyPress);
}, []);

// Make cards keyboard accessible
<Card
  tabIndex={0}
  role="button"
  aria-label={`${label}: ${count} công việc`}
  onKeyPress={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      onClick();
    }
  }}
>
```

---

### Screen Reader Support

**ARIA Labels:**
```javascript
<IconButton 
  onClick={handleRefresh}
  aria-label="Làm mới dữ liệu dashboard"
  aria-busy={isLoading}
>
  <Refresh />
</IconButton>

<Card 
  role="button"
  aria-label={`Công việc quá hạn: ${overdueCount} việc. Nhấn để xem chi tiết`}
>
  <Typography aria-hidden="true">{overdueCount}</Typography>
</Card>

<Alert 
  severity="error"
  role="alert"
  aria-live="polite"
>
  {overdueTasks.length} công việc quá hạn
</Alert>
```

---

## 🧪 Testing Scenarios

### Manual Test Cases

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **Initial Load** | 1. Navigate to `/cong-viec-dashboard`<br>2. Wait for data | - Shows loading<br>- Displays counts<br>- Default: "Tuần này" |
| **Date Filter** | 1. Click "Hôm nay"<br>2. Click "Tháng này" | - Updates counts<br>- Shows correct context<br>- Fetches new data |
| **Empty State** | 1. Filter to date range with 0 tasks | - Shows "Chưa có công việc" |
| **Overdue Alert** | 1. Have ≥1 overdue task | - Shows red alert<br>- Lists top 5<br>- "Quá X ngày" badge |
| **Card Click** | 1. Click "Quá hạn" metric<br>2. Click "Đang làm" card | - Navigates to MyTasksPage<br>- Filters applied |
| **Overdue Click** | 1. Click task in alert | - Opens detail page<br>- Shows task info |
| **Refresh** | 1. Click refresh button | - Re-fetches data<br>- Updates counts |
| **Mobile Responsive** | 1. Resize to 375px | - 2-column grids<br>- Stacked metrics<br>- No horizontal scroll |
| **Error Handling** | 1. Stop backend<br>2. Refresh page | - Shows error message<br>- Offers retry |
| **Performance** | 1. Load with 500 tasks | - < 3s load time<br>- Smooth interactions |

---

## 📝 Change Log

### V2.0 (2026-01-13) - Brain Storm Redesign

**Added:**
- ✅ DateRangePresets component (10 presets)
- ✅ Date context in header ("Tuần này: 08 - 15/01")
- ✅ OverallMetrics section (4 cards)
- ✅ DeadlineAlertCard for overdue tasks
- ✅ Client-side metrics (avgProgress, onTimeRate)
- ✅ Subtext explanations on cards

**Removed:**
- ❌ "Từ chối" status card (không tồn tại backend)
- ❌ "Cần bổ sung" status card (không tồn tại backend)
- ❌ FAB button (over-engineered)
- ❌ Tools menu (deferred to Phase 2)
- ❌ `/dashboard/:id` API usage (not flexible)

**Changed:**
- 🔄 API strategy: `/me` + `/assigned` thay vì `/dashboard/:id`
- 🔄 Counts calculation: Client-side với `useCongViecCounts` hook
- 🔄 Grid layout: Custom grid thay vì reuse `StatusGrid` component
- 🔄 Section structure: 2 sections (Received/Assigned) với metrics riêng
- 🔄 Folder structure: `features/QuanLyCongViec/Dashboard/CongViecDashboard/`

**Fixed:**
- 🐛 Deadline logic: Use backend virtual field `TinhTrangThoiHan`
- 🐛 Metrics accuracy: Correct date range filtering for onTimeRate
- 🐛 Mobile layout: 2x2 grid cho overall metrics

---

### V1.0 (2026-01-10) - Initial Spec

- Basic 4-card layout
- StatusGrid pattern (không phù hợp)
- Missing date context
- Invalid status cards included

---

## 🎯 Success Criteria

Dashboard được coi là **thành công** khi đạt các tiêu chí sau:

### User Experience
- [ ] Load time < 2s cho 90% users
- [ ] Zero console errors
- [ ] Mobile responsive (375px - 1920px)
- [ ] Accessible (Lighthouse score > 90)

### Functional
- [ ] Accurate counts (100% match backend)
- [ ] All 10 date presets work correctly
- [ ] Navigation with filters works
- [ ] Deadline alerts show top 5 overdue
- [ ] Metrics calculations correct (avgProgress, onTimeRate)

### Technical
- [ ] Reuses existing APIs (no backend changes)
- [ ] Reuses existing components (DateRangePresets, useCongViecCounts)
- [ ] Follows established patterns (Redux, MUI)
- [ ] Documented with JSDoc comments
- [ ] No prop-types warnings

---

**Last Updated:** 2026-01-13  
**Owner:** Development Team  
**Reviewers:** UX Team, Backend Team  
**Status:** 🟢 Ready to Implement
