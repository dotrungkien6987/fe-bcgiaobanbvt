# Task 2.5: "Công việc của tôi" Page - Status Tabs Refactor

**Tổng thời gian:** 8 giờ  
**Ước tính chi tiết:** 3h + 1.5h + 3.5h  
**Trạng thái:** 📋 Planning - Chờ review

**⚠️ Scope Change:** Chỉ implement page "Công việc của tôi" (Individual view). "Quản lý công việc" (Manager view) deferred to Task 2.6+.

---

## 🎯 Mục tiêu

Chuyển đổi **CongViecByNhanVienPage** (716 dòng) thành **MyTasksPage** với:

- ✅ Single page: "Công việc của tôi" (tasks I received)
- ✅ Status tabs (1 level): Tất cả / Đã giao / Đang làm / Chờ duyệt
- ✅ URL params integration
- ✅ Deadline warnings (⚠️ ⏰) from schema
- ✅ Mobile optimization
- ✅ Recent completed preview

**Note:** "Việc tôi giao" (Manager view) sẽ là separate page trong Task 2.6+.

---

## 📊 UI/UX Visualization

### **BEFORE: Current State (CongViecByNhanVienPage.js - 716 lines)**

```
┌─────────────────────────────────────────────────────────────┐
│  Công việc của tôi                                          │
├─────────────────────────────────────────────────────────────┤
│  [Tab: Việc tôi nhận]  [Tab: Việc tôi giao]                │  ← ⚠️ WILL SPLIT into 2 pages
│  └─ Active: Việc tôi nhận (Task 2.5)                       │
│  └─ Defer: Việc tôi giao → Task 2.6+ (separate page)      │
├─────────────────────────────────────────────────────────────┤
│  🔍 Filter Panel:                                           │
│  • Trạng thái: [Dropdown ▼]  ← Tất cả / Đã giao / Đang làm│
│  • Tìm kiếm: [___________]                                  │
│  • Người giao: [Dropdown ▼]                                 │
│  • Từ ngày: [____] Đến ngày: [____]  ← ⚠️ ONLY for archived│
├─────────────────────────────────────────────────────────────┤
│  📋 Table: 12 công việc                                     │
│  ┌──────────┬──────────┬──────────┬──────────┐            │
│  │ Tên      │ Trạng thái│ Deadline │ Actions  │            │
│  ├──────────┼──────────┼──────────┼──────────┤            │
│  │ Task 1   │ Đang làm │ 15/01    │ [...]    │            │
│  │ Task 2   │ Chờ duyệt│ 20/01    │ [...]    │            │
│  └──────────┴──────────┴──────────┴──────────┘            │
└─────────────────────────────────────────────────────────────┘

❌ Vấn đề:
- 2 tabs trong 1 page → Workflows khác nhau (nhận vs giao)
- Trạng thái ẩn trong filter dropdown → 2 clicks để lọc
- Không có deadline warnings visible
- URL không reflect trạng thái hiện tại
- Server-side pagination → Chuyển tab phải request lại
- Date filter dùng cho cả active và archived tasks
```

---

### **AFTER: Target State - MyTasksPage.js (~450 lines)**

**📌 Key Changes:**

- ✅ Single page: ONLY "Công việc của tôi" (tasks I received)
- ✅ Data: Fetch 500 active tasks (A1 strategy)
- ✅ Pagination: Client-side (B1 strategy)
- ✅ Date filter: ONLY for Recent Completed section (not for active tasks)
- ❌ "Việc tôi giao" → Moved to separate page (Task 2.6+)

**Desktop View:**

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️ 2 việc quá hạn, 5 việc trong vùng cảnh báo  [Xem] [✕] │ ← Global UrgentAlertBanner
│                                                              │    (from TinhTrangThoiHan)
├─────────────────────────────────────────────────────────────┤
│  Công việc của tôi (23)                         [+ Tạo]    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┬─────────┬─────────┬─────────┐                │
│  │ Tất cả  │ Đã giao │ Đang làm│ Chờ duyệt│                │  ← StatusTabs
│  │  (23)   │   (3)   │   (8)   │   (2)   │                │     (client-side filter)
│  │  ⚠️2 ⏰5 │         │  ⚠️1 ⏰3 │   ⏰2   │                │     + deadline badges
│  └─────────┴─────────┴─────────┴─────────┘                │
├─────────────────────────────────────────────────────────────┤
│  🔍 Filter Panel (Collapsed - click to expand):            │
│  [▼ Bộ lọc nâng cao] 🔄 Refresh                            │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐     │
│  │ • Tìm kiếm: [___________]                         │     │
│  │ • Người giao: [Dropdown ▼]                        │     │
│  │ • Từ ngày: [____] Đến ngày: [____]               │     │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘     │
├─────────────────────────────────────────────────────────────┤
│  📋 Table: 8 công việc (filtered by "Đang làm")            │
│  ┌──────────┬──────────┬──────────┬──────────┐            │
│  │ Tên      │ Ưu tiên  │ Deadline │ Actions  │            │
│  ├──────────┼──────────┼──────────┼──────────┤            │
│  │ Task 1   │ 🔴 Cao   │ 15/01    │ [...]    │            │
│  │ Task 3   │ 🟡 TB    │ 18/01    │ [...]    │            │
│  └──────────┴──────────┴──────────┴──────────┘            │
│  Pagination: 1 2 3 > [10/page ▼]                           │
├─────────────────────────────────────────────────────────────┤
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  📚 ĐÃ HOÀN THÀNH GẦN ĐÂY (7 ngày)                        │
│  ✅ Task X | 15/12 | ⏱️ 3 ngày                            │
│  ✅ Task Y | 14/12 | ⏱️ 5 ngày                            │
│  [Xem tất cả lịch sử →]                                    │
└─────────────────────────────────────────────────────────────┘

✅ Cải thiện:
- Trạng thái = tabs → 1 click, visual clear
- Badges hiển thị số lượng + deadline warnings (⚠️ ⏰)
- Global banner cho urgent items
- URL: /cong-viec-cua-toi?status=DANG_LAM
- Filter panel thu gọn → nhiều không gian cho table
- Recent completed preview ở bottom
```

---

### **AFTER: Target State (Mobile)**

**📱 Mobile View - Single Page:**

```
┌────────────────────────────────┐
│  ⚠️ 2 quá hạn, 5 sắp hết  [✕] │ ← Compact alert banner
├────────────────────────────────┤
│  Công việc của tôi (23)  [≡]  │
├────────────────────────────────┤
│  Status Chips (scroll →):      │  ← Horizontal scrollable chips
│  ┌───────────────────────────┐ │     (NO việc nhận/giao tabs)
│  │ [Tất cả 23] [Đã giao 3..  │ │
│  │  ⚠️2 ⏰5                    │ │     Deadline badges inline
│  └───────────────────────────┘ │
│  Swipe → để xem thêm           │
├────────────────────────────────┤
│  [🔍 Tìm kiếm]  [🔄]          │
├────────────────────────────────┤
│  📋 List (Compact cards):      │
│  ┌──────────────────────────┐ │
│  │ Task 1        🔴 15/01   │ │
│  │ Đang làm               ⋮ │ │  ← Swipe left for quick actions
│  ├──────────────────────────┤ │
│  │ Task 3        🟡 18/01   │ │
│  │ Đang làm               ⋮ │ │
│  └──────────────────────────┘ │
│  Pull to refresh ↻             │
└────────────────────────────────┘

✅ Mobile UX:
- Tabs stack vertically (không ngang)
- Chips cuộn ngang (swipeable)
- Cards thay vì table
- Pull-to-refresh native gesture
```

---

---

## 📊 Data Fetching & Filtering Strategy

### **Decision Summary (Confirmed)**

| Aspect                 | Strategy                | Rationale                                   |
| ---------------------- | ----------------------- | ------------------------------------------- |
| **Active tasks fetch** | **A1**: Fetch max 500   | Most users have <200 active tasks           |
| **Pagination**         | **B1**: Client-side     | Instant tab switching, better UX            |
| **Status filter**      | Client-side (useMemo)   | From URL param `?status=XXX`                |
| **Search filter**      | Client-side (useMemo)   | No delay, works with paginated data         |
| **Date filter**        | ❌ NOT for active tasks | ✅ ONLY for Recent Completed (7/30/90 days) |
| **Deadline warnings**  | Backend virtual field   | `TinhTrangThoiHan` (QUA_HAN / SAP_QUA_HAN)  |

### **API Calls**

#### **1. Get Active Tasks (on mount)**

```javascript
// GET /api/workmanagement/congviec/nhanvien/:nhanVienId
const params = {
  excludeStatus: "HOAN_THANH", // Exclude completed
  limit: 500, // Fetch all active (max)
  page: 1, // Always page 1
};
// Returns: { data: CongViec[], total: number }
// ⚠️ NO date filter, NO status filter (filter client-side)
```

#### **2. Get Recent Completed (on mount)**

```javascript
// GET /api/workmanagement/congviec/recent-completed/:nhanVienId
const params = {
  days: 7, // Last 7 days (default)
  limit: 10, // Max 10 items for preview
};
// Returns: { data: CongViec[], total: number }
```

### **Client-side Filtering Flow**

```javascript
// 1️⃣ Fetch once (500 active tasks)
const allActiveTasks = useSelector((state) => state.congViec.receivedCongViecs);

// 2️⃣ Filter by status (from URL)
const filteredByStatus = useMemo(() => {
  if (status === "ALL") return allActiveTasks;
  return allActiveTasks.filter((t) => t.TrangThai === status);
}, [allActiveTasks, status]);

// 3️⃣ Filter by search
const filteredBySearch = useMemo(() => {
  if (!search) return filteredByStatus;
  return filteredByStatus.filter((t) =>
    t.TenCongViec.toLowerCase().includes(search.toLowerCase())
  );
}, [filteredByStatus, search]);

// 4️⃣ Filter by urgent (if banner clicked)
const filteredByUrgent = useMemo(() => {
  if (!showUrgentOnly) return filteredBySearch;
  return filteredBySearch.filter((t) =>
    ["QUA_HAN", "SAP_QUA_HAN"].includes(t.TinhTrangThoiHan)
  );
}, [filteredBySearch, showUrgentOnly]);

// 5️⃣ Client-side pagination
const paginatedData = useMemo(() => {
  const start = (page - 1) * rowsPerPage;
  return filteredByUrgent.slice(start, start + rowsPerPage);
}, [filteredByUrgent, page, rowsPerPage]);
```

### **Deadline Warning Visibility**

**✅ User sees urgent tasks IMMEDIATELY in 3 places:**

1. **Global UrgentAlertBanner** (top of page)

   - Red alert: `overdueCount > 0` (⚠️ icon)
   - Yellow alert: `upcomingCount > 0` (⏰ icon)
   - Click "Xem" → Filter to show only urgent tasks
   - Dismissible with localStorage (show again after 24h)

2. **StatusTabs badges** (on each tab)

   - "Tất cả (23) ⚠️2 ⏰5" - Total counts with deadline indicators
   - "Đang làm (8) ⚠️1 ⏰3" - Per-status counts
   - Real-time update via `useTaskCounts(allActiveTasks)`

3. **Table inline badges** (on each row)
   - Deadline column: "15/01 ⚠️" (overdue) or "18/01 ⏰" (upcoming)
   - Color-coded: Red (overdue) / Yellow (upcoming) / Green (on track)

**Data source:** Backend virtual field `TinhTrangThoiHan`

- Calculated based on user's `NgayCanhBao` and `CanhBaoSapHetHanPercent` settings
- No frontend calculation needed

---

## 🗂️ File Structure & Changes

```
src/features/QuanLyCongViec/
├── CongViec/
│   ├── CongViecByNhanVienPage.js     ← 🔄 RENAME + REFACTOR (716 → ~450 dòng)
│   │                                     → MyTasksPage.js
│   │
│   ├── CongViecTabs.js               ← 🗑️ DEPRECATED (sẽ xóa sau khi migrate)
│   │
│   ├── components/                    ← 📁 NEW FOLDER
│   │   ├── StatusTabs.js              ← ✨ NEW (Task 2.5.1)
│   │   │   • Simple status tabs (1 level)
│   │   │   • Desktop: Horizontal tabs with badges
│   │   │   • Mobile: Horizontal scrollable chips
│   │   │   • Deadline badges (⚠️ ⏰) integration
│   │   │
│   │   ├── UrgentAlertBanner.js       ← ✨ NEW (Task 2.5.1)
│   │   │   • Global alert for overdue/upcoming
│   │   │   • Click to filter urgent items
│   │   │   • Dismissible
│   │   │
│   │   └── RecentCompletedPreview.js  ← ✨ NEW (Task 2.5.1)
│   │       • Show last 7 days completed
│   │       • Link to full archive
│   │
│   ├── hooks/                         ← 📁 NEW FOLDER
│   │   ├── useMyTasksUrlParams.js     ← ✨ NEW (Task 2.5.2)
│   │   │   • useSearchParams wrapper
│   │   │   • Sync URL ↔ State (only status param)
│   │   │   • Browser back/forward support
│   │   │
│   │   └── useTaskCounts.js           ← ✨ NEW (Task 2.5.1)
│   │       • Calculate status badge counts
│   │       • Calculate deadline badges (⚠️ ⏰)
│   │       • Real-time from TinhTrangThoiHan
│   │       • Memoized for performance
│   │
│   ├── congViecSlice.js              ← 🔄 MINOR UPDATE
│   │   • Simplify state (no role switching)
│   │   • Add recentCompleted state
│   │
│   ├── CongViecFilterPanel.js        ← 🔄 UPDATE
│   │   • Remove TrangThai dropdown (moved to tabs)
│   │   • Add collapse/expand state
│   │   • Smaller UI footprint
│   │
│   ├── CongViecTable.js              ← ✅ NO CHANGE
│   ├── CongViecDetailDialog.js       ← ✅ NO CHANGE
│   └── CongViecFormDialog.js         ← ✅ NO CHANGE
│
└── Dashboard/
    └── UnifiedDashboardPage.js        ← 🔄 UPDATE
        • Update navigation: link to /cong-viec-cua-toi

routes/
└── index.js                           ← 🔄 UPDATE
    • Add route: /cong-viec-cua-toi
    • Support query params: ?status=XXX
```

---

## 📝 Implementation Plan

### **Task 2.5.1: Create UI Components (3h)**

#### **File 1: StatusTabs.js** (~150 dòng)

**Props Interface:**

```javascript
{
  status: 'ALL' | 'DA_GIAO' | 'DANG_LAM' | 'CHO_DUYET',
  onStatusChange: (newStatus) => void,
  counts: {                           // Badge counts
    all: 23,
    daGiao: 3,
    dangLam: 8,
    choDuyet: 2,
    // Deadline indicators
    deadlineStatus: {
      overdue: 2,      // QUA_HAN from TinhTrangThoiHan
      upcoming: 5      // SAP_QUA_HAN from TinhTrangThoiHan
    },
    byStatus: {
      DA_GIAO: { overdue: 1, upcoming: 0 },
      DANG_LAM: { overdue: 1, upcoming: 3 },
      CHO_DUYET: { overdue: 0, upcoming: 2 }
    }
  },
  isMobile: boolean
}
```

**Pseudocode:**

```javascript
function StatusTabs({ status, onStatusChange, counts, isMobile }) {
  const statusTabs = [
    { value: "ALL", label: "Tất cả", icon: ListIcon },
    { value: "DA_GIAO", label: "Đã giao", icon: SendIcon },
    { value: "DANG_LAM", label: "Đang làm", icon: PlayIcon },
    { value: "CHO_DUYET", label: "Chờ duyệt", icon: ClockIcon },
  ];

  if (isMobile) {
    // Mobile: Horizontal scrollable chips
    return (
      <Box sx={{ display: "flex", gap: 1, overflowX: "auto", py: 1 }}>
        {statusTabs.map((tab) => {
          const statusCount =
            tab.value === "ALL" ? counts.all : counts[camelCase(tab.value)];
          const deadlineInfo =
            tab.value === "ALL"
              ? counts.deadlineStatus
              : counts.byStatus[tab.value];

          return (
            <Chip
              key={tab.value}
              label={
                <Box>
                  {tab.label} ({statusCount})
                  {deadlineInfo?.overdue > 0 && ` ⚠️${deadlineInfo.overdue}`}
                  {deadlineInfo?.upcoming > 0 && ` ⏰${deadlineInfo.upcoming}`}
                </Box>
              }
              color={status === tab.value ? "primary" : "default"}
              onClick={() => onStatusChange(tab.value)}
              sx={{ minWidth: 120, flexShrink: 0 }}
            />
          );
        })}
      </Box>
    );
  }

  // Desktop: Horizontal tabs
  return (
    <Tabs
      value={status}
      onChange={(e, val) => onStatusChange(val)}
      variant="scrollable"
    >
      {statusTabs.map((tab) => {
        const statusCount =
          tab.value === "ALL" ? counts.all : counts[camelCase(tab.value)];
        const deadlineInfo =
          tab.value === "ALL"
            ? counts.deadlineStatus
            : counts.byStatus[tab.value];

        return (
          <Tab
            key={tab.value}
            label={
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexDirection: "column",
                }}
              >
                {/* Main count */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Icon>{tab.icon}</Icon>
                  {tab.label}
                  <Chip label={statusCount} size="small" color="primary" />
                </Box>

                {/* Deadline badges */}
                {(deadlineInfo?.overdue > 0 || deadlineInfo?.upcoming > 0) && (
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    {deadlineInfo.overdue > 0 && (
                      <Chip
                        label={deadlineInfo.overdue}
                        size="small"
                        color="error"
                        icon={<Warning />}
                      />
                    )}
                    {deadlineInfo.upcoming > 0 && (
                      <Chip
                        label={deadlineInfo.upcoming}
                        size="small"
                        color="warning"
                        icon={<Clock />}
                      />
                    )}
                  </Box>
                )}
              </Box>
            }
            value={tab.value}
          />
        );
      })}
    </Tabs>
  );
}
```

---

#### **File 2: UrgentAlertBanner.js** (~100 dòng)

```javascript
function UrgentAlertBanner({
  overdueCount,
  upcomingCount,
  onViewClick,
  onDismiss,
}) {
  if (overdueCount === 0 && upcomingCount === 0) return null;

  const severity = overdueCount > 0 ? "error" : "warning";
  const message =
    overdueCount > 0
      ? `${overdueCount} công việc quá hạn, ${upcomingCount} công việc trong vùng cảnh báo`
      : `${upcomingCount} công việc trong vùng cảnh báo`;

  return (
    <Alert
      severity={severity}
      action={
        <>
          <Button color="inherit" onClick={onViewClick}>
            Xem
          </Button>
          <IconButton color="inherit" onClick={onDismiss}>
            <Close />
          </IconButton>
        </>
      }
    >
      {message}
    </Alert>
  );
}
```

---

#### **File 3: RecentCompletedPreview.js** (~80 dòng)

```javascript
function RecentCompletedPreview({ recentTasks, onViewAll }) {
  if (!recentTasks || recentTasks.length === 0) return null;

  return (
    <Box mt={4}>
      <Divider />
      <Box mt={2} mb={1}>
        <Typography variant="h6" fontWeight={600}>
          📚 Đã hoàn thành gần đây (7 ngày)
        </Typography>
      </Box>
      <Stack spacing={1}>
        {recentTasks.slice(0, 10).map((task) => (
          <Box
            key={task._id}
            sx={{ p: 1, bgcolor: "grey.50", borderRadius: 1 }}
          >
            <Typography variant="body2">
              ✅ {task.TieuDe} | {dayjs(task.NgayHoanThanh).format("DD/MM")}
            </Typography>
          </Box>
        ))}
      </Stack>
      <Button variant="outlined" fullWidth sx={{ mt: 2 }} onClick={onViewAll}>
        Xem tất cả lịch sử →
      </Button>
    </Box>
  );
}
```

---

#### **File 4: useTaskCounts.js** (~120 dòng)

**Purpose:** Calculate badge counts + deadline indicators từ data

```javascript
function useTaskCounts(tasksData) {
  const counts = useMemo(() => {
    if (!tasksData || tasksData.length === 0) {
      return {
        all: 0,
        daGiao: 0,
        dangLam: 0,
        choDuyet: 0,
        deadlineStatus: { overdue: 0, upcoming: 0 },
        byStatus: {},
      };
    }

    // Helper: Count by TrangThai
    const countByStatus = (status) => {
      return tasksData.filter((cv) => cv.TrangThai === status).length;
    };

    // Helper: Count deadline issues
    const countDeadlineIssues = (tasks) => {
      const overdue = tasks.filter(
        (cv) => cv.TinhTrangThoiHan === "QUA_HAN"
      ).length;
      const upcoming = tasks.filter(
        (cv) => cv.TinhTrangThoiHan === "SAP_QUA_HAN"
      ).length;
      return { overdue, upcoming };
    };

    // Overall counts
    const all = tasksData.length;
    const daGiao = countByStatus("DA_GIAO");
    const dangLam = countByStatus("DANG_LAM");
    const choDuyet = countByStatus("CHO_DUYET");

    // Overall deadline status
    const deadlineStatus = countDeadlineIssues(tasksData);

    // Per-status deadline breakdown
    const byStatus = {
      DA_GIAO: countDeadlineIssues(
        tasksData.filter((cv) => cv.TrangThai === "DA_GIAO")
      ),
      DANG_LAM: countDeadlineIssues(
        tasksData.filter((cv) => cv.TrangThai === "DANG_LAM")
      ),
      CHO_DUYET: countDeadlineIssues(
        tasksData.filter((cv) => cv.TrangThai === "CHO_DUYET")
      ),
    };

    return {
      all,
      daGiao,
      dangLam,
      choDuyet,
      deadlineStatus,
      byStatus,
    };
  }, [tasksData]);

  return counts;
}
```

if (isMobile) {
return (
<Box>
{/_ Level 1: Full-width tabs _/}
<Tabs
value={role}
onChange={(e, val) => onRoleChange(val)}
variant="fullWidth" >
<Tab
label={
<>
Việc tôi nhận <Badge>{counts.received?.all}</Badge>
</>
}
value="received"
/>
<Tab
label={
<>
Việc tôi giao <Badge>{counts.assigned?.all}</Badge>
</>
}
value="assigned"
/>
</Tabs>

        {/* Level 2: Horizontal scrollable chips */}
        <Box sx={{ display: "flex", gap: 1, overflowX: "auto", py: 1 }}>
          {statusTabs.map((tab) => (
            <Chip
              key={tab.value}
              label={`${tab.label} (${
                currentCounts[camelCase(tab.value)] || 0
              })`}
              color={status === tab.value ? "primary" : "default"}
              onClick={() => onStatusChange(tab.value)}
              sx={{ minWidth: 100, flexShrink: 0 }}
            />
          ))}
        </Box>
      </Box>
    );

}

// Desktop: Two-level horizontal tabs
return (
<Box>
{/_ Level 1 _/}
<Tabs value={role} onChange={(e, val) => onRoleChange(val)}>
<Tab label="Việc tôi nhận" value="received" />
<Tab label="Việc tôi giao" value="assigned" />
</Tabs>

      {/* Level 2 with badges */}
      <Tabs
        value={status}
        onChange={(e, val) => onStatusChange(val)}
        variant="scrollable"
      >
        {statusTabs.map((tab) => (
          <Tab
            key={tab.value}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Icon>{tab.icon}</Icon>
                {tab.label}
                <Chip
                  label={currentCounts[camelCase(tab.value)] || 0}
                  size="small"
                />
              </Box>
            }
            value={tab.value}
          />
        ))}
      </Tabs>
    </Box>

);
}

````

---

#### **File 2: useCongViecCounts.js** (~80 dòng)

**Purpose:** Calculate real-time badge counts từ filtered data

**Pseudocode:**

```javascript
function useCongViecCounts(receivedData, assignedData) {
  const counts = useMemo(() => {
    // Helper: Count by status
    const countByStatus = (dataArray) => ({
      all: dataArray.length,
      daGiao: dataArray.filter((cv) => cv.TrangThai === "DA_GIAO").length,
      dangLam: dataArray.filter((cv) => cv.TrangThai === "DANG_LAM").length,
      choDuyet: dataArray.filter((cv) => cv.TrangThai === "CHO_DUYET").length,
      hoanThanh: dataArray.filter((cv) => cv.TrangThai === "HOAN_THANH").length,
    });

    return {
      received: countByStatus(receivedData || []),
      assigned: countByStatus(assignedData || []),
    };
  }, [receivedData, assignedData]);

  return counts;
}
````

---

### **Task 2.5.2: URL Params Integration (1.5h)**

#### **File: useMyTasksUrlParams.js** (~80 dòng)

**Purpose:** Sync status tab ↔ URL query params

**Pseudocode:**

```javascript
function useMyTasksUrlParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  // Read from URL (with default)
  const status = searchParams.get("status") || "ALL";

  // Write to URL
  const updateStatus = useCallback(
    (newStatus) => {
      setSearchParams({ status: newStatus });
    },
    [setSearchParams]
  );

  // Sync to Redux when URL changes
  useEffect(() => {
    dispatch(setFilters({ TrangThai: status === "ALL" ? "" : status }));
  }, [status, dispatch]);

  return { status, updateStatus };
}
```

**URL Examples:**

```
/cong-viec-cua-toi
  → Default: status=ALL

/cong-viec-cua-toi?status=DANG_LAM
  → Shows: Đang làm tab active

/cong-viec-cua-toi?status=CHO_DUYET
  → Shows: Chờ duyệt tab active
```

**Browser behavior:**

- Back button: URL changes → tab changes ✅
- Forward button: URL changes → tab changes ✅
- Refresh page: URL persists → same tab restored ✅
- Copy/paste URL: Deep link works ✅

---

### **Task 2.5.3: Refactor to MyTasksPage (3.5h)**

#### **File: MyTasksPage.js** (renamed from CongViecByNhanVienPage.js)

**Current structure (716 dòng):**

```javascript
CongViecByNhanVienPage
├── useState: dialogs, refreshKey, rowsPerPage
├── useSelector: receivedCongViecs, assignedCongViecs, filters, etc.
├── useEffect: Fetch data on mount/tab change
├── Handlers: openDetail, openForm, handleDelete, etc.
├── Filter logic: 8 different filter conditions
└── JSX:
    ├── CongViecTabs (old component)            ← ❌ REMOVE
    ├── CongViecFilterPanel (with TrangThai)    ← 🔄 UPDATE
    ├── CongViecTable
    └── Dialogs (Detail, Form, Confirm, Tree)
```

**New structure (~500 dòng - 30% reduction):**

**Current structure (716 dòng):**

```javascript
CongViecByNhanVienPage
├── useState: dialogs, refreshKey, rowsPerPage, activeTab
├── useSelector: receivedCongViecs, assignedCongViecs, filters
├── useEffect: Fetch data on mount/tab change
├── Handlers: openDetail, openForm, handleDelete
├── Filter logic: 8 different filter conditions
└── JSX:
    ├── CongViecTabs (old component)            ← ❌ REMOVE
    ├── CongViecFilterPanel (with TrangThai)    ← 🔄 UPDATE
    ├── CongViecTable
    └── Dialogs (Detail, Form, Confirm, Tree)
```

**New structure (~450 dòng - 37% reduction):**

```javascript
MyTasksPage
├── Custom hooks:
│   ├── useMyTasksUrlParams()                   ← ✨ NEW
│   ├── useTaskCounts()                         ← ✨ NEW
│   └── useMobileLayout()                       ← Existing
│
├── useState: dialogs, rowsPerPage (less state!)
├── useSelector: receivedCongViecs, recentCompleted
│
├── Handlers: (same as before)
│
└── JSX:
    ├── UrgentAlertBanner                       ← ✨ NEW
    │   counts={counts.deadlineStatus}
    │
    ├── StatusTabs                              ← ✨ NEW
    │   status={status}
    │   onStatusChange={updateStatus}
    │   counts={counts}
    │
    ├── CongViecFilterPanel                     ← 🔄 UPDATED
    │   (no TrangThai dropdown)
    │   collapsible={true}
    │
    ├── CongViecTable
    │
    ├── RecentCompletedPreview                  ← ✨ NEW
    │   recentTasks={recentCompleted}
    │
    └── Dialogs (unchanged)
```

**Migration steps:**

**Step 1:** Rename file and route

```bash
mv CongViecByNhanVienPage.js MyTasksPage.js
```

**Step 2:** Import new components & hooks

```javascript
// Old imports to REMOVE
// import CongViecTabs from './CongViecTabs';

// New imports to ADD
import StatusTabs from "./components/StatusTabs";
import UrgentAlertBanner from "./components/UrgentAlertBanner";
import RecentCompletedPreview from "./components/RecentCompletedPreview";
import useMyTasksUrlParams from "./hooks/useMyTasksUrlParams";
import useTaskCounts from "./hooks/useTaskCounts";
```

**Step 3:** Replace state management

```javascript
// OLD: Local state for activeTab
// const [activeTab, setActiveTab] = useState('received');

// NEW: URL params hook
const { status, updateStatus } = useMyTasksUrlParams();

// NEW: Badge counts with deadline indicators
const counts = useTaskCounts(receivedCongViecs);
```

**Step 4:** Update data fetching logic

```javascript
// OLD: Fetch based on activeTab (received vs assigned) + server pagination
useEffect(() => {
  if (activeTab === "received") {
    dispatch(getReceivedCongViecs({ nhanVienId, filters, page, limit }));
  } else {
    dispatch(getAssignedCongViecs({ nhanVienId, filters, page, limit }));
  }
}, [activeTab, filters, page]); // Re-fetch on every filter/page change

// NEW: Fetch once (Strategy A1) + client-side filtering (Strategy B1)
useEffect(() => {
  // 📌 STRATEGY A1: Fetch all active tasks (max 500)
  // - Excludes HOAN_THANH status only
  // - NO date filter (date filter only for Recent Completed)
  // - NO status filter (filter client-side with useMemo)
  // - NO pagination params (paginate client-side)
  dispatch(
    getReceivedCongViecs({
      nhanVienId,
      excludeStatus: "HOAN_THANH", // Exclude completed
      limit: 500, // Fetch all active (max)
      page: 1, // Always page 1
      // ❌ NO: filters, TuNgay, DenNgay, TrangThai
    })
  );

  // 📋 Also fetch recent completed (SEPARATE call)
  // ✅ Date filter: ONLY for this section (7/30/90 days)
  dispatch(
    getRecentCompleted({
      nhanVienId,
      days: 7, // Default 7 days
      limit: 10, // Max 10 for preview
    })
  );
}, [nhanVienId]); // ⚠️ NO filters dependency - we filter client-side!

// 📊 Client-side filtering (Step 5 will add this logic)
// See "Client-side Filtering Flow" section above
```

````

**Step 5:** Implement client-side filtering & pagination

```javascript
// 📋 Get all active tasks from Redux
const allActiveTasks = useSelector(
  (state) => state.congViec.receivedCongViecs
);
const recentCompleted = useSelector(
  (state) => state.congViec.recentCompleted
);
const isLoading = useSelector((state) => state.congViec.isLoading);

// 🎯 1. Filter by status (from URL param)
const filteredByStatus = useMemo(() => {
  if (status === 'ALL') return allActiveTasks;
  return allActiveTasks.filter(task => task.TrangThai === status);
}, [allActiveTasks, status]);

// 🔍 2. Filter by search (from FilterPanel)
const filteredBySearch = useMemo(() => {
  if (!filters.search) return filteredByStatus;
  const searchLower = filters.search.toLowerCase();
  return filteredByStatus.filter(task =>
    task.TenCongViec.toLowerCase().includes(searchLower) ||
    task.MoTa?.toLowerCase().includes(searchLower)
  );
}, [filteredByStatus, filters.search]);

// ⚠️ 3. Filter by urgent (when UrgentAlertBanner clicked)
const filteredByUrgent = useMemo(() => {
  if (!showUrgentOnly) return filteredBySearch;
  return filteredBySearch.filter(task =>
    task.TinhTrangThoiHan === 'QUA_HAN' ||
    task.TinhTrangThoiHan === 'SAP_QUA_HAN'
  );
}, [filteredBySearch, showUrgentOnly]);

// 📏 4. Client-side pagination (Strategy B1)
const paginatedData = useMemo(() => {
  const startIndex = (currentPage - 1) * rowsPerPage;
  return filteredByUrgent.slice(startIndex, startIndex + rowsPerPage);
}, [filteredByUrgent, currentPage, rowsPerPage]);

// 📊 5. Calculate counts for badges
const counts = useTaskCounts(allActiveTasks);
// Returns: { ALL: 23, DA_GIAO: 3, DANG_LAM: 8, CHO_DUYET: 2,
//            deadlineStatus: { overdue: 2, upcoming: 5, onTrack: 16 } }
````

**Step 6:** Replace JSX structure

```javascript
return (
  <Container>
    {/* 1️⃣ Global alert banner - VISIBLE IMMEDIATELY */}
    {(counts.deadlineStatus.overdue > 0 ||
      counts.deadlineStatus.upcoming > 0) && (
      <UrgentAlertBanner
        overdueCount={counts.deadlineStatus.overdue}
        upcomingCount={counts.deadlineStatus.upcoming}
        onViewClick={() => setShowUrgentOnly(true)} // Filter to urgent
        onDismiss={() => {
          localStorage.setItem(`alert_dismissed_${user._id}`, Date.now());
        }}
      />
    )}

    {/* 2️⃣ Page header */}
    <Typography variant="h4">
      Công việc của tôi ({allActiveTasks.length})
    </Typography>

    {/* 3️⃣ Status tabs - WITH DEADLINE BADGES */}
    <StatusTabs
      status={status}
      onStatusChange={updateStatus}
      counts={counts} // Shows badges: ⚠️2 ⏰5
      isMobile={isMobile}
    />

    {/* 4️⃣ Filter panel (collapsed by default on desktop) */}
    <CongViecFilterPanel
      filters={filters}
      onFilterChange={(newFilters) => dispatch(setFilters(newFilters))}
      excludeFields={["TrangThai"]} // ← Trạng thái moved to tabs
      collapsible={true} // ← Enable collapse accordion
      defaultCollapsed={!isMobile} // ← Desktop: collapsed, Mobile: expanded
    />

    {/* 5️⃣ Task table with inline deadline badges */}
    <CongViecTable
      data={paginatedData} // Client-side paginated
      total={filteredByUrgent.length}
      page={currentPage}
      rowsPerPage={rowsPerPage}
      onPageChange={setCurrentPage}
      onRowsPerPageChange={setRowsPerPage}
      isLoading={isLoading}
    />

    {/* 6️⃣ Recent completed preview - WITH DATE FILTER */}
    <RecentCompletedPreview
      recentTasks={recentCompleted}
      onViewAll={() => navigate("/quanlycongviec/lich-su")}
      // Date filter: 7/30/90 days selector INSIDE this component
    />

    {/* 7️⃣ Dialogs (unchanged) */}
    {/* Detail, Form, Confirm, Tree dialogs */}
  </Container>
);
```

      recentTasks={recentCompleted}
      onViewAll={() => navigate("/quanlycongviec/lich-su")}
    />

    {/* Dialogs (unchanged) */}

  </Container>
);
```

**Step 6:** Update Redux slice

```javascript
// congViecSlice.js - Add new state
initialState: {
  receivedCongViecs: [],
  // Remove: assignedCongViecs (moved to separate page)
  recentCompleted: [],  // NEW
  // ...
}

// Add new thunk
export const getRecentCompleted = (params) => async (dispatch) => {
  // Fetch last 7 days completed tasks
};
```

**Step 7:** Update routes

```javascript
// routes/index.js
<Route path="cong-viec-cua-toi" element={<MyTasksPage />} />
// OLD: <Route path="congviec/nhanvien/:id" element={<CongViecByNhanVienPage />} />
```

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     User Interaction                            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
         ┌──────────────────────────────────────┐
         │  Click Status Tab (Đang làm, etc.)  │
         └──────────────────────────────────────┘
                                │
                                ▼
         ┌──────────────────────────────────────┐
         │  useMyTasksUrlParams.updateStatus()  │
         │  → setSearchParams({ status: 'xxx' })│
         └──────────────────────────────────────┘
                                │
                                ▼
         ┌──────────────────────────────────────┐
         │  URL changes (browser history entry) │
         │  ?status=DANG_LAM                    │
         └──────────────────────────────────────┘
                                │
                                ▼
         ┌──────────────────────────────────────┐
         │  useEffect in hook detects change    │
         │  → dispatch(setFilters({ TrangThai }))│
         └──────────────────────────────────────┘
                                │
                                ▼
         ┌──────────────────────────────────────┐
         │  Redux state updates                 │
         │  → filters.TrangThai: 'DANG_LAM'     │
         └──────────────────────────────────────┘
                                │
                                ▼
         ┌──────────────────────────────────────┐
         │  Component re-renders                │
         │  → Client-side filter applies        │
         │  → Updates table display             │
         └──────────────────────────────────────┘
```

---

## 🧪 Testing Checklist

### **Functional Tests**

- [ ] **Status Tab Change**

  - [ ] Click "Tất cả" → URL = `?status=ALL`
  - [ ] Click "Đã giao" → URL = `?status=DA_GIAO`
  - [ ] Click "Đang làm" → URL = `?status=DANG_LAM`
  - [ ] Click "Chờ duyệt" → URL = `?status=CHO_DUYET`
  - [ ] Table filters correctly for each status
  - [ ] Badge counts update dynamically

- [ ] **Deadline Warning System**

  - [ ] UrgentAlertBanner shows when overdue/upcoming tasks exist
  - [ ] Deadline badges render correctly (⚠️ overdue, ⏰ upcoming)
  - [ ] Click banner "Xem ngay" filters to urgent items
  - [ ] Dismiss banner persists in localStorage
  - [ ] Counts respect user's NgayCanhBao settings

- [ ] **Recent Completed Preview**

  - [ ] Shows last 7 days completed tasks (max 10)
  - [ ] "Xem tất cả" navigates to archive page
  - [ ] Empty state shows when no recent completed
  - [ ] Data refreshes after status change to HOAN_THANH

- [ ] **URL Params**

  - [ ] Deep link `/cong-viec-cua-toi?status=CHO_DUYET` works
  - [ ] Browser back button changes tabs
  - [ ] Browser forward button changes tabs
  - [ ] Refresh page preserves selected tab
  - [ ] Invalid params fallback to ALL

- [ ] **Badge Counts**

  - [ ] Counts match actual data length
  - [ ] Counts update after creating new công việc
  - [ ] Counts update after changing status
  - [ ] Counts update after deleting công việc
  - [ ] TinhTrangThoiHan badges calculated correctly

- [ ] **Filter Integration**
  - [ ] Other filters (search, người giao, ngày) work with tabs
  - [ ] Clear filters button resets everything except status
  - [ ] Multiple filters combine correctly (AND logic)

### **Mobile Tests**

- [ ] Status tabs render as scrollable chips
- [ ] Touch swipe works on chip scroll
- [ ] Active chip has correct styling
- [ ] Tap chip changes status immediately
- [ ] Layout doesn't break on small screens (320px)
- [ ] UrgentAlertBanner responsive on mobile

### **Edge Cases**

- [ ] No data → Empty state shows correctly
- [ ] Loading state → Skeleton UI for tabs/table
- [ ] Error state → Error message displays
- [ ] Rapid tab switching → No race conditions
- [ ] Very long công việc names → Text truncates
- [ ] 100+ công việc → Performance OK (client-side filtering)
- [ ] 0 overdue/upcoming → UrgentAlertBanner doesn't render

---

## 📦 Deliverables Summary

| File                        | Type          | Lines   | Status         |
| --------------------------- | ------------- | ------- | -------------- |
| `StatusTabs.js`             | New Component | ~180    | ⏳ To Create   |
| `UrgentAlertBanner.js`      | New Component | ~120    | ⏳ To Create   |
| `RecentCompletedPreview.js` | New Component | ~150    | ⏳ To Create   |
| `useMyTasksUrlParams.js`    | New Hook      | ~80     | ⏳ To Create   |
| `useTaskCounts.js`          | New Hook      | ~100    | ⏳ To Create   |
| `MyTasksPage.js`            | Refactor      | 716→450 | ⏳ To Refactor |
| `CongViecFilterPanel.js`    | Update        | +20     | ⏳ To Update   |
| `congViecSlice.js`          | Update        | +50     | ⏳ To Update   |
| `CongViecTabs.js`           | Deprecate     | -150    | ⏳ To Remove   |

**Total:** 5 new files (630 lines), 3 updates (+70 lines), 1 removal (-150 lines), net reduction ~266 lines (716→450)

---

## 🚀 Implementation Order

### **Phase A: Components & Hooks (3h)**

1. **Create `useTaskCounts.js` hook** (45 min)

   - Memoized calculations with TinhTrangThoiHan
   - Test with mock data
   - Verify badge logic matches schema

2. **Create `StatusTabs.js` component** (1.5h)

   - Desktop tabs (full width)
   - Mobile chips (scrollable)
   - Badge rendering with deadline icons
   - Test responsive breakpoints

3. **Create `UrgentAlertBanner.js` component** (45 min)
   - Warning styles (overdue = red, upcoming = orange)
   - Dismissible with localStorage persistence
   - "Xem ngay" action triggers filter
   - Test empty state (no banner when counts = 0)

### **Phase B: URL Integration & Data Fetching (1.5h)**

1. **Create `useMyTasksUrlParams.js` hook** (45 min)

   - URL read/write (status only)
   - Redux sync (dispatch setFilters)
   - Browser history integration
   - Test back/forward/refresh/deep link

2. **Update `congViecSlice.js`** (30 min)

   - Add `recentCompleted` state
   - Create `getRecentCompleted` thunk (7 days, limit 10)
   - Test thunk with mock API

3. **Create `RecentCompletedPreview.js` component** (15 min)
   - Timeline display (last 7 days)
   - "Xem tất cả" link to archive
   - Empty state when no recent completed

### **Phase C: Page Refactor (3.5h)**

1. **Backup & rename file** (10 min)

   ```bash
   cp CongViecByNhanVienPage.js CongViecByNhanVienPage.js.bak
   mv CongViecByNhanVienPage.js MyTasksPage.js
   ```

2. **Replace imports & hooks** (45 min)

   - Remove CongViecTabs
   - Add new 5 components/hooks
   - Update route in router config

3. **Update state management** (30 min)

   - Replace activeTab with useMyTasksUrlParams
   - Add useTaskCounts for badges
   - Remove assignedCongViecs selector (not needed)

4. **Update data fetching logic** (45 min)

   - Single useEffect for receivedCongViecs
   - Add getRecentCompleted call
   - Remove role-based conditional fetching
   - Add excludeStatus: 'HOAN_THANH' filter

5. **Replace JSX structure** (1h)

   - Add UrgentAlertBanner at top
   - Replace CongViecTabs with StatusTabs
   - Update FilterPanel props (excludeFields, collapsible)
   - Add RecentCompletedPreview at bottom
   - Test all visual components render

6. **Update `CongViecFilterPanel.js`** (20 min)

   - Add excludeFields prop support
   - Add collapsible accordion functionality
   - Add defaultCollapsed prop (mobile vs desktop)

7. **Full integration testing** (30 min)
   - All functional tests from checklist
   - Mobile responsive testing
   - Edge case verification

---

## ⚠️ Risk Assessment

| Risk                                              | Impact    | Probability | Mitigation                                                               |
| ------------------------------------------------- | --------- | ----------- | ------------------------------------------------------------------------ |
| TinhTrangThoiHan calculation mismatch             | 🔴 High   | � Low       | Use backend virtual field, don't recalculate on frontend                 |
| URL params conflict with existing filters         | 🟡 Medium | 🟢 Low      | Only store status in URL, other filters in Redux only                    |
| Performance with 500+ tasks client-side filtering | 🟡 Medium | 🟡 Medium   | Use useMemo for filtering, monitor performance, add pagination if needed |
| UrgentAlertBanner dismissed forever               | 🟢 Low    | 🟡 Medium   | Store timestamp, show again after 24h or when new urgent task appears    |
| Recent completed fetch on every status change     | 🟢 Low    | 🟡 Medium   | Cache with TTL (5 min), only refetch on task completion                  |

---

## ✅ Success Criteria

**User Experience:**

- ✅ Single-level status tabs (clean, intuitive)
- ✅ URL deep linking works (shareable links)
- ✅ Browser back/forward navigation works
- ✅ Urgent tasks are highly visible (global banner)
- ✅ Recent completed tasks accessible (7-day preview)
- ✅ Mobile responsive (≥320px width)

**Technical:**

- ✅ Net code reduction: 716→450 lines (-37%)
- ✅ No prop drilling (hooks + Redux)
- ✅ Deadline badges use schema fields (no hardcoded logic)
- ✅ Client-side performance acceptable (≤500 tasks)
- ✅ All tests pass (functional + mobile + edge cases)

**Business:**

- ✅ Users see urgent tasks immediately (deadline warnings)
- ✅ Quick access to recent completed work (motivation)
- ✅ Clear status progression (Đã giao → Đang làm → Chờ duyệt → Hoàn thành)
- ✅ Ready for Phase 2.6: Manager view (separate page)

---

## 📝 Notes

**Architecture Change Summary:**

- **Original plan:** 1 page with 3-level nested tabs (Nhận/Giao + Status)
- **Final decision:** 2 separate pages
  - **Task 2.5:** "Công việc của tôi" (single page, status tabs only)
  - **Task 2.6+:** "Quản lý công việc" (manager view, deferred for separate planning)

**Rationale:**

- Simpler scope → Faster implementation (10h → 8h)
- Clearer separation of concerns (individual vs manager views)
- Easier to test and maintain
- Better scalability for manager features later

**Next Steps After Task 2.5:**

1. User testing and feedback
2. Performance monitoring with real data (500+ tasks)
3. Plan Task 2.6: Manager view page
4. Consider advanced features: bulk actions, task templates, analytics

---

**End of Task 2.5 Plan** 🎯
| Browser back button breaks pagination | 🟡 Medium | 🟢 Low | Don't store pagination in URL (localStorage instead) |
| Badge counts performance issue with large dataset | 🟡 Medium | 🟡 Medium | Memoize calculations, consider backend aggregation later |
| Mobile chip scroll UX not intuitive | 🟢 Low | 🟡 Medium | Add scroll indicators, test with real users |
| Breaking change for existing users | 🟡 Medium | 🔴 High | Keep old component temporarily, feature flag rollout |

---

## 💡 Future Enhancements (Out of Scope)

- [ ] **Drag-and-drop tabs reordering** - User customize tab order
- [ ] **Tab presets** - Save favorite filter combinations
- [ ] **Keyboard shortcuts** - `Ctrl+1/2/3` to switch status tabs
- [ ] **Swipe gestures on mobile** - Swipe left/right to change tabs
- [ ] **Real-time badge updates** - WebSocket for live counts
- [ ] **Custom status colors** - User-defined colors per status
- [ ] **Tab analytics** - Track which tabs users click most

---

## 📋 Review Checklist

**Trước khi bắt đầu implement, xác nhận:**

- [ ] UI/UX design phù hợp với workflow người dùng
- [ ] Mobile design đã được review
- [ ] File structure hợp lý, không duplicate code
- [ ] URL params naming convention clear
- [ ] Testing checklist đầy đủ
- [ ] Performance considerations đã được xem xét
- [ ] Backward compatibility plan rõ ràng
- [ ] Ước tính thời gian realistic

---

**Người review:** **\*\*\*\***\_**\*\*\*\***  
**Ngày:** **\*\*\*\***\_**\*\*\*\***  
**Phê duyệt:** ☐ Approved ☐ Needs Changes ☐ Rejected  
**Ghi chú:**
