# Task 2.6: "Việc tôi giao" Page - Manager View

**Tổng thời gian:** 9 giờ  
**Ước tính chi tiết:** 2h + 4.5h + 2.5h  
**Trạng thái:** 📋 Planning - Ready to implement

**Strategy:** Reuse 70% components từ Task 2.5, chỉ adjust data source và labels

---

## 🎯 Mục tiêu

Tạo page **"Việc tôi giao"** (Manager View) với:

- ✅ Reuse 7 components từ Task 2.5 (StatusTabs, UrgentAlertBanner, etc.)
- ✅ 5 status tabs: **Chưa giao** + Đã giao + Đang làm + Chờ tôi duyệt + Hoàn thành
- ✅ URL params: `/viec-toi-giao?status=XXX`
- ✅ Filter: Người xử lý chính (từ `nhanVienDuocQuanLy`)
- ✅ Filter: Tình trạng deadline (Overdue/Upcoming/OnTrack)
- ✅ Mobile card view: Hiển thị Tiến độ + Số người phối hợp
- ✅ Actions: View detail, Edit, Delete, Cây công việc
- ✅ RecentCompleted: Load 30 tasks, client pagination

**Khác biệt với Task 2.5 (Individual View):**

| Aspect           | Individual View (2.5)                         | Manager View (2.6)                                               |
| ---------------- | --------------------------------------------- | ---------------------------------------------------------------- |
| **Data Source**  | `receivedCongViecs`                           | `assignedCongViecs`                                              |
| **Filter**       | Người giao (dropdown)                         | Người xử lý chính (dropdown)                                     |
| **Status Tabs**  | 4 tabs (Tất cả, Đã giao, Đang làm, Chờ duyệt) | 5 tabs (Chưa giao, Đã giao, Đang làm, Chờ tôi duyệt, Hoàn thành) |
| **Tab Labels**   | "Chờ tiếp nhận", "Chờ duyệt"                  | "Đã giao", "Chờ tôi duyệt"                                       |
| **Card Avatar**  | NguoiGiao                                     | NguoiChinh (Người xử lý)                                         |
| **Card Caption** | "Người giao: {HoTen}"                         | "Người xử lý: {HoTen}"                                           |
| **Actions**      | View, Edit (limited)                          | View, Edit (full), Delete, Reassign                              |

---

## 📊 UI/UX Visualization

### **BEFORE: Current State**

```
❌ Không có trang "Việc tôi giao"
- Managers phải vào CongViecByNhanVienPage cũ
- Chọn tab "Việc tôi giao" (nested tab 2 cấp)
- Trạng thái filter ẩn trong dropdown
- Không có urgent alert banner
- Không có recent completed preview
```

---

### **AFTER: Target State - AssignedTasksPage.js (~450 lines)**

**Desktop View:**

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️ 3 việc quá hạn, 7 việc trong vùng cảnh báo  [Xem] [✕] │ ← UrgentAlertBanner
├─────────────────────────────────────────────────────────────┤
│  Việc tôi giao (35)                          [+ Tạo mới]   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┬────────┬─────────┬─────────────┬─────────┐  │
│  │ Chưa giao│Đã giao │ Đang làm│Chờ tôi duyệt│Hoàn thành│  │  ← StatusTabs (5 tabs)
│  │   (5)    │  (8)   │  (12)   │    (6)      │   (4)   │  │
│  │          │ ⚠️2 ⏰3 │ ⚠️1 ⏰4  │    ⏰2      │         │  │  ← Deadline badges
│  └──────────┴────────┴─────────┴─────────────┴─────────┘  │
├─────────────────────────────────────────────────────────────┤
│  🔍 Filter Panel (Collapsed):                               │
│  [▼ Bộ lọc nâng cao] 🔄 Refresh                            │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐     │
│  │ • Tìm kiếm: [___________]                         │     │
│  │ • Người xử lý chính: [Dropdown ▼]                │     │
│  │ • Ưu tiên: [Tất cả ▼]                            │     │
│  │ • Tình trạng deadline: [Tất cả ▼]                │     │  ← NEW filter
│  │ • Từ ngày: [____] Đến ngày: [____]               │     │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘     │
│                                                              │
│  📌 Active Filters:                                         │  ← ActiveFilterChips
│  [Người xử lý: Nguyễn Văn A ✕] [Ưu tiên: Cao ✕]          │
├─────────────────────────────────────────────────────────────┤
│  📋 Table: 12 công việc (filtered by "Đang làm")           │
│  ┌──────┬──────────┬──────────┬──────────┬──────────┐     │
│  │ Mã   │ Tiêu đề  │ NX Lý    │ Tiến độ  │ Actions  │     │  ← Sticky columns
│  ├──────┼──────────┼──────────┼──────────┼──────────┤     │
│  │ CV01 │ Task 1   │ Kiên     │ ━━━━░ 75%│ [🌲][👁][✎]│     │
│  │ CV02 │ Task 2   │ Mai      │ ━━░░░ 40%│ [🌲][👁][✎]│     │
│  └──────┴──────────┴──────────┴──────────┴──────────┘     │
│  Pagination: 1 2 3 > [10/page ▼]                           │
├─────────────────────────────────────────────────────────────┤
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  📚 ĐÃ HOÀN THÀNH GẦN ĐÂY (30 ngày)                       │
│  ✅ Task X | 15/12 | 👤 Kiên | ⏱️ 2 ngày                  │
│  ✅ Task Y | 14/12 | 👤 Mai  | ⏱️ 5 ngày                  │
│  ... (showing 1-10 of 28)                                   │
│  [< 1 2 3 >]  [Xem tất cả lịch sử →]                      │  ← Client pagination
└─────────────────────────────────────────────────────────────┘

Actions legend:
🌲 = Cây công việc (tree view)
👁 = Xem chi tiết (view detail)
✎ = Chỉnh sửa (edit)
🗑 = Xóa (delete)
```

**Mobile View:**

```
┌────────────────────────────────┐
│  ⚠️ 3 quá hạn, 7 sắp hết  [✕] │
├────────────────────────────────┤
│  Việc tôi giao (35)      [+]  │
├────────────────────────────────┤
│  Status Chips (scroll →):      │
│  ┌───────────────────────────┐ │
│  │ [Chưa giao 5] [Đã giao..  │ │  ← 5 tabs scrollable
│  │  ⚠️2 ⏰3                    │ │
│  └───────────────────────────┘ │
│  Swipe → để xem thêm           │
├────────────────────────────────┤
│  [🔍 Tìm kiếm]  [🔄]          │
├────────────────────────────────┤
│  📋 Cards (Compact):            │
│  ┌──────────────────────────┐ │
│  │ Task 1    🔴 15/01 ⚠️    │ │  ← Card with progress
│  │ 👤 Kiên   ━━━━░ 75%      │ │
│  │ 👥 3 người │ Đang làm  ⋮ │ │  ← NEW: Progress + Participants
│  ├──────────────────────────┤ │
│  │ Task 2    🟡 18/01       │ │
│  │ 👤 Mai    ━━░░░ 40%      │ │
│  │ 👥 2 người │ Đang làm  ⋮ │ │
│  └──────────────────────────┘ │
│  Pull to refresh ↻             │
└────────────────────────────────┘
```

---

## 📊 Data Fetching & Filtering Strategy

### **Strategy (Same as Task 2.5)**

| Aspect                 | Strategy              | Notes                                                                   |
| ---------------------- | --------------------- | ----------------------------------------------------------------------- |
| **Active tasks fetch** | A1: Fetch max 500     | `GET /congviec/assigned/:nhanVienId?excludeStatus=HOAN_THANH&limit=500` |
| **Pagination**         | B1: Client-side       | Instant tab switching                                                   |
| **Status filter**      | Client-side (useMemo) | From URL param `?status=XXX`                                            |
| **Search filter**      | Client-side (useMemo) | TenCongViec, MoTa                                                       |
| **Người xử lý filter** | Client-side (useMemo) | From filter panel dropdown                                              |
| **Deadline filter**    | Client-side (useMemo) | NEW: QUA_HAN / SAP_QUA_HAN / ON_TRACK                                   |
| **Recent completed**   | Server-side           | `GET /congviec/recent-completed-assigned/:nhanVienId?days=30&limit=30`  |

### **API Calls**

#### **1. Get Assigned Tasks (on mount)**

```javascript
// GET /api/workmanagement/congviec/assigned/:nhanVienId
const params = {
  excludeStatus: "HOAN_THANH", // Exclude completed
  limit: 500, // Fetch all active (max)
  page: 1, // Always page 1
};
// Returns: { data: CongViec[], total: number }
```

#### **2. Get Recent Completed Assigned (on mount)**

```javascript
// GET /api/workmanagement/congviec/recent-completed-assigned/:nhanVienId
const params = {
  days: 30, // Last 30 days
  limit: 30, // Max 30 for preview (3 pages × 10)
};
// Returns: { data: CongViec[], total: number }
```

#### **3. Get Nhân viên có thể giao việc (for filter dropdown)**

```javascript
// Already in Redux: kpiSlice.nhanVienDuocQuanLy
// Fetched via: dispatch(getNhanVienCoTheGiaoViec())
// Returns: NhanVien[] with _id, HoTen, PhongBanID, etc.
```

### **Client-side Filtering Flow**

```javascript
// 1️⃣ Fetch once (500 assigned tasks)
const allAssignedTasks = useSelector(
  (state) => state.congViec.assignedCongViecs
);

// 2️⃣ Filter by status (from URL)
const filteredByStatus = useMemo(() => {
  if (status === "ALL") return allAssignedTasks;
  return allAssignedTasks.filter((t) => t.TrangThai === status);
}, [allAssignedTasks, status]);

// 3️⃣ Filter by search
const filteredBySearch = useMemo(() => {
  if (!search) return filteredByStatus;
  return filteredByStatus.filter((t) =>
    t.TenCongViec.toLowerCase().includes(search.toLowerCase())
  );
}, [filteredByStatus, search]);

// 4️⃣ Filter by Người xử lý chính (NEW)
const filteredByAssignee = useMemo(() => {
  if (!nguoiXuLyFilter) return filteredBySearch;
  return filteredBySearch.filter(
    (t) => t.NguoiChinhID?._id === nguoiXuLyFilter
  );
}, [filteredBySearch, nguoiXuLyFilter]);

// 5️⃣ Filter by Deadline status (NEW)
const filteredByDeadline = useMemo(() => {
  if (!deadlineFilter || deadlineFilter === "ALL") return filteredByAssignee;
  return filteredByAssignee.filter(
    (t) => t.TinhTrangThoiHan === deadlineFilter // QUA_HAN / SAP_QUA_HAN / ON_TRACK
  );
}, [filteredByAssignee, deadlineFilter]);

// 6️⃣ Filter by urgent (if banner clicked)
const filteredByUrgent = useMemo(() => {
  if (!showUrgentOnly) return filteredByDeadline;
  return filteredByDeadline.filter((t) =>
    ["QUA_HAN", "SAP_QUA_HAN"].includes(t.TinhTrangThoiHan)
  );
}, [filteredByDeadline, showUrgentOnly]);

// 7️⃣ Client-side pagination
const paginatedData = useMemo(() => {
  const start = (page - 1) * rowsPerPage;
  return filteredByUrgent.slice(start, start + rowsPerPage);
}, [filteredByUrgent, page, rowsPerPage]);
```

---

## 🗂️ File Structure & Changes

```
src/features/QuanLyCongViec/CongViec/
├── MyTasksPage.js                     ← ✅ Already exists (Task 2.5)
├── AssignedTasksPage.js               ← 🆕 NEW (~450 lines) - clone MyTasksPage
│
├── components/
│   ├── StatusTabs.js                  ← ✅ Reuse 100%
│   ├── UrgentAlertBanner.js          ← ✅ Reuse 100%
│   ├── RecentCompletedPreview.js     ← 🔄 UPDATE (add client pagination)
│   ├── ActiveFilterChips.js          ← ✅ Reuse 100%
│   ├── CongViecCard.js               ← 🔄 UPDATE (add progress + participants)
│   └── CongViecCardManager.js        ← 🆕 NEW (~100 lines) - manager variant
│
├── hooks/
│   ├── useTaskCounts.js              ← ✅ Reuse pattern
│   ├── useAssignedTaskCounts.js      ← 🆕 NEW (~120 lines) - for 5 statuses
│   ├── useMyTasksUrlParams.js        ← ✅ Already exists
│   └── useAssignedTasksUrlParams.js  ← 🆕 NEW (~80 lines) - for 5 statuses
│
├── CongViecFilterPanel.js            ← 🔄 UPDATE (add deadline filter)
├── CongViecTable.js                  ← ✅ Reuse 100% (already has actions)
├── congViecSlice.js                  ← 🔄 UPDATE (add assignedCongViecs state)
│
└── [Existing files - no change]
    ├── CongViecDetailDialog.js
    ├── CongViecFormDialog.js
    ├── CongViecTreeDialog.js
    └── congViecPermissions.js
```

---

## 📝 Implementation Plan

### **Phase A: Component Adjustments (2h)**

#### **Task A.1: Create useAssignedTaskCounts.js (0.5h)**

**Purpose:** Calculate badge counts for 5 status tabs + deadline indicators

```javascript
// hooks/useAssignedTaskCounts.js (~120 lines)
function useAssignedTaskCounts(assignedTasks) {
  const counts = useMemo(() => {
    if (!assignedTasks || assignedTasks.length === 0) {
      return {
        all: 0,
        chuaGiao: 0, // TAO_MOI
        daGiao: 0, // DA_GIAO
        dangLam: 0, // DANG_LAM / DANG_THUC_HIEN
        choToiDuyet: 0, // CHO_DUYET
        hoanThanh: 0, // HOAN_THANH (if needed)
        deadlineStatus: { overdue: 0, upcoming: 0 },
        byStatus: {},
      };
    }

    // Helper: Count by TrangThai
    const countByStatus = (status) => {
      return assignedTasks.filter((cv) => cv.TrangThai === status).length;
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
    const all = assignedTasks.length;
    const chuaGiao = countByStatus("TAO_MOI");
    const daGiao = countByStatus("DA_GIAO");
    const dangLam = countByStatus("DANG_LAM") + countByStatus("DANG_THUC_HIEN");
    const choToiDuyet = countByStatus("CHO_DUYET");
    const hoanThanh = countByStatus("HOAN_THANH");

    // Overall deadline status
    const deadlineStatus = countDeadlineIssues(assignedTasks);

    // Per-status deadline breakdown
    const byStatus = {
      TAO_MOI: countDeadlineIssues(
        assignedTasks.filter((cv) => cv.TrangThai === "TAO_MOI")
      ),
      DA_GIAO: countDeadlineIssues(
        assignedTasks.filter((cv) => cv.TrangThai === "DA_GIAO")
      ),
      DANG_LAM: countDeadlineIssues(
        assignedTasks.filter((cv) =>
          ["DANG_LAM", "DANG_THUC_HIEN"].includes(cv.TrangThai)
        )
      ),
      CHO_DUYET: countDeadlineIssues(
        assignedTasks.filter((cv) => cv.TrangThai === "CHO_DUYET")
      ),
    };

    return {
      all,
      chuaGiao,
      daGiao,
      dangLam,
      choToiDuyet,
      hoanThanh,
      deadlineStatus,
      byStatus,
    };
  }, [assignedTasks]);

  return counts;
}

export default useAssignedTaskCounts;
```

---

#### **Task A.2: Create useAssignedTasksUrlParams.js (0.5h)**

**Purpose:** Sync 5 status tabs ↔ URL query params

```javascript
// hooks/useAssignedTasksUrlParams.js (~80 lines)
function useAssignedTasksUrlParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  // Read from URL (with default)
  const status = searchParams.get("status") || "ALL";

  // Validate status (5 options)
  const validStatuses = [
    "ALL",
    "CHUA_GIAO",
    "DA_GIAO",
    "DANG_LAM",
    "CHO_TOI_DUYET",
    "HOAN_THANH",
  ];
  const currentStatus = validStatuses.includes(status) ? status : "ALL";

  // Write to URL
  const updateStatus = useCallback(
    (newStatus) => {
      setSearchParams({ status: newStatus });
    },
    [setSearchParams]
  );

  // Sync to Redux when URL changes
  useEffect(() => {
    const filterValue = currentStatus === "ALL" ? "" : currentStatus;
    dispatch(setFilters({ TrangThai: filterValue }));
  }, [currentStatus, dispatch]);

  return { status: currentStatus, updateStatus };
}

export default useAssignedTasksUrlParams;
```

---

#### **Task A.3: Update CongViecCard.js (0.5h)**

**Add props:** `showProgress`, `showParticipants`, `variant="manager"`

```javascript
// components/CongViecCard.js (update ~20 lines)
function CongViecCard({
  data,
  onView,
  onEdit,
  onDelete,
  onTree,
  variant = "individual", // 'individual' | 'manager'
  showProgress = false, // NEW
  showParticipants = false, // NEW
}) {
  const avatarPerson =
    variant === "manager"
      ? data.NguoiChinhID // Show assignee for manager view
      : data.NguoiGiaoID; // Show assignor for individual view

  const caption =
    variant === "manager"
      ? `Người xử lý: ${data.NguoiChinhID?.HoTen || "Chưa phân công"}`
      : `Người giao: ${data.NguoiGiaoID?.HoTen || "N/A"}`;

  return (
    <Card>
      <CardHeader
        avatar={<EmployeeAvatar nhanVienId={avatarPerson?._id} size={40} />}
        title={data.TenCongViec}
        subheader={data.MaCongViec}
        action={<MoreVertIcon />}
      />
      <CardContent>
        {/* Status + Priority + Deadline */}
        <Stack direction="row" spacing={1}>
          <StatusChip status={data.TrangThai} />
          <PriorityChip priority={data.UuTien} />
          <DeadlineChip
            deadline={data.NgayHetHan}
            status={data.TrangThai}
            tinhTrangThoiHan={data.TinhTrangThoiHan}
          />
        </Stack>

        {/* NEW: Progress bar */}
        {showProgress && (
          <Box mt={1}>
            <Typography variant="caption" color="text.secondary">
              Tiến độ: {data.TienDo || 0}%
            </Typography>
            <LinearProgress variant="determinate" value={data.TienDo || 0} />
          </Box>
        )}

        {/* NEW: Participants count */}
        {showParticipants && (
          <Typography
            variant="caption"
            color="text.secondary"
            display="flex"
            alignItems="center"
            gap={0.5}
          >
            <GroupsIcon fontSize="small" />
            {data.SoLuongNguoiThamGia || 0} người phối hợp
          </Typography>
        )}

        {/* Caption */}
        <Typography variant="caption" color="text.secondary" mt={1}>
          {caption}
        </Typography>
      </CardContent>

      <CardActions>
        <IconButton size="small" onClick={() => onTree?.(data)}>
          <AccountTreeIcon />
        </IconButton>
        <IconButton size="small" onClick={() => onView?.(data._id)}>
          <VisibilityIcon />
        </IconButton>
        <IconButton size="small" onClick={() => onEdit?.(data)}>
          <EditIcon />
        </IconButton>
        <IconButton size="small" onClick={() => onDelete?.(data._id)}>
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
}
```

---

#### **Task A.4: Update CongViecFilterPanel.js (0.5h)**

**Add:** Người xử lý chính filter, Deadline filter

```javascript
// CongViecFilterPanel.js (add ~80 lines)
function CongViecFilterPanel({
  filters,
  onFilterChange,
  excludeFields = [],
  variant = "individual", // 'individual' | 'manager'
  collapsible = false,
  defaultCollapsed = false,
}) {
  const { nhanVienDuocQuanLy } = useSelector((s) => s.kpi);

  const showNguoiGiao =
    variant === "individual" && !excludeFields.includes("NguoiGiao");
  const showNguoiXuLy =
    variant === "manager" && !excludeFields.includes("NguoiXuLy");
  const showDeadlineFilter = !excludeFields.includes("TinhTrangThoiHan");

  return (
    <Box>
      {/* ... existing filters ... */}

      {/* NEW: Người xử lý chính (manager only) */}
      {showNguoiXuLy && (
        <FormControl fullWidth>
          <InputLabel>Người xử lý chính</InputLabel>
          <Select
            value={filters.NguoiChinhID || ""}
            onChange={(e) =>
              onFilterChange({ ...filters, NguoiChinhID: e.target.value })
            }
            label="Người xử lý chính"
          >
            <MenuItem value="">Tất cả</MenuItem>
            {nhanVienDuocQuanLy?.map((nv) => (
              <MenuItem key={nv._id} value={nv._id}>
                {nv.HoTen}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* NEW: Tình trạng deadline */}
      {showDeadlineFilter && (
        <FormControl fullWidth>
          <InputLabel>Tình trạng deadline</InputLabel>
          <Select
            value={filters.TinhTrangThoiHan || "ALL"}
            onChange={(e) =>
              onFilterChange({ ...filters, TinhTrangThoiHan: e.target.value })
            }
            label="Tình trạng deadline"
          >
            <MenuItem value="ALL">Tất cả</MenuItem>
            <MenuItem value="QUA_HAN">⚠️ Quá hạn</MenuItem>
            <MenuItem value="SAP_QUA_HAN">⏰ Sắp quá hạn</MenuItem>
            <MenuItem value="ON_TRACK">✅ Đúng hạn</MenuItem>
          </Select>
        </FormControl>
      )}

      {/* ... other filters ... */}
    </Box>
  );
}
```

---

### **Phase B: Page Implementation (4.5h)**

#### **Task B.1: Create AssignedTasksPage.js (3h)**

**Strategy:** Clone MyTasksPage.js, adjust data source and labels

```javascript
// AssignedTasksPage.js (~450 lines)
function AssignedTasksPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useDispatch();
  const { user } = useAuth();
  const navigate = useNavigate();

  // 🔄 CHANGE: Use assignedCongViecs instead of receivedCongViecs
  const allAssignedTasks = useSelector(
    (state) => state.congViec.assignedCongViecs
  );
  const recentCompleted = useSelector(
    (state) => state.congViec.recentCompletedAssigned
  );
  const isLoading = useSelector((state) => state.congViec.isLoading);

  // URL params for 5 statuses
  const { status, updateStatus } = useAssignedTasksUrlParams();

  // Badge counts for 5 tabs
  const counts = useAssignedTaskCounts(allAssignedTasks);

  // Local state
  const [filters, setFilters] = useState({
    search: "",
    NguoiChinhID: "", // NEW: Filter by assignee
    UuTien: "",
    TinhTrangThoiHan: "ALL", // NEW: Filter by deadline
    TuNgay: null,
    DenNgay: null,
  });
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog states (same as Task 2.5)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [treeDialogOpen, setTreeDialogOpen] = useState(false);
  const [selectedCongViec, setSelectedCongViec] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    if (!user?.NhanVienID) return;

    // Fetch assigned tasks (max 500, exclude completed)
    dispatch(
      getAssignedCongViecs({
        nguoiGiaoId: user.NhanVienID,
        excludeStatus: "HOAN_THANH",
        limit: 500,
        page: 1,
      })
    );

    // Fetch recent completed assigned (last 30 days, max 30)
    dispatch(
      getRecentCompletedAssigned({
        nguoiGiaoId: user.NhanVienID,
        days: 30,
        limit: 30,
      })
    );

    // Fetch nhanVienDuocQuanLy for filter dropdown
    dispatch(getNhanVienCoTheGiaoViec());
  }, [user?.NhanVienID, dispatch]);

  // Client-side filtering (7 steps - see Data Flow section)
  const filteredData = useMemo(() => {
    let result = allAssignedTasks;

    // 1. Filter by status
    if (status !== "ALL") {
      result = result.filter((t) => {
        if (status === "CHUA_GIAO") return t.TrangThai === "TAO_MOI";
        if (status === "DA_GIAO") return t.TrangThai === "DA_GIAO";
        if (status === "DANG_LAM")
          return ["DANG_LAM", "DANG_THUC_HIEN"].includes(t.TrangThai);
        if (status === "CHO_TOI_DUYET") return t.TrangThai === "CHO_DUYET";
        if (status === "HOAN_THANH") return t.TrangThai === "HOAN_THANH";
        return true;
      });
    }

    // 2. Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.TenCongViec?.toLowerCase().includes(searchLower) ||
          t.MoTa?.toLowerCase().includes(searchLower)
      );
    }

    // 3. Filter by assignee (NEW)
    if (filters.NguoiChinhID) {
      result = result.filter(
        (t) => t.NguoiChinhID?._id === filters.NguoiChinhID
      );
    }

    // 4. Filter by priority
    if (filters.UuTien) {
      result = result.filter((t) => t.UuTien === filters.UuTien);
    }

    // 5. Filter by deadline (NEW)
    if (filters.TinhTrangThoiHan && filters.TinhTrangThoiHan !== "ALL") {
      result = result.filter(
        (t) => t.TinhTrangThoiHan === filters.TinhTrangThoiHan
      );
    }

    // 6. Filter by urgent (if banner clicked)
    if (showUrgentOnly) {
      result = result.filter((t) =>
        ["QUA_HAN", "SAP_QUA_HAN"].includes(t.TinhTrangThoiHan)
      );
    }

    // 7. Filter by date range
    if (filters.TuNgay) {
      result = result.filter((t) =>
        dayjs(t.NgayBatDau).isAfter(dayjs(filters.TuNgay))
      );
    }
    if (filters.DenNgay) {
      result = result.filter((t) =>
        dayjs(t.NgayHetHan).isBefore(dayjs(filters.DenNgay))
      );
    }

    return result;
  }, [allAssignedTasks, status, filters, showUrgentOnly]);

  // Client-side pagination
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  // Event handlers (same as Task 2.5)
  const handleViewDetail = (id) => {
    setSelectedCongViec(id);
    setDetailDialogOpen(true);
  };

  const handleEdit = (congViec) => {
    setSelectedCongViec(congViec);
    setFormDialogOpen(true);
  };

  const handleDelete = (id) => {
    // Show confirm dialog, then dispatch deleteCongViec
  };

  const handleTree = (congViec) => {
    setSelectedCongViec(congViec);
    setTreeDialogOpen(true);
  };

  return (
    <Container maxWidth="xl">
      {/* 1. Urgent Alert Banner */}
      {(counts.deadlineStatus.overdue > 0 ||
        counts.deadlineStatus.upcoming > 0) && (
        <UrgentAlertBanner
          overdueCount={counts.deadlineStatus.overdue}
          upcomingCount={counts.deadlineStatus.upcoming}
          onViewClick={() => setShowUrgentOnly(true)}
          onDismiss={() => {
            localStorage.setItem(
              `alert_dismissed_assigned_${user._id}`,
              Date.now()
            );
          }}
        />
      )}

      {/* 2. Page Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4">
          Việc tôi giao ({allAssignedTasks.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setFormDialogOpen(true)}
        >
          Tạo mới
        </Button>
      </Box>

      {/* 3. Status Tabs (5 tabs) */}
      <StatusTabs
        status={status}
        onStatusChange={updateStatus}
        counts={counts}
        isMobile={isMobile}
        variant="manager" // Show 5 tabs with manager labels
      />

      {/* 4. Filter Panel */}
      <CongViecFilterPanel
        filters={filters}
        onFilterChange={setFilters}
        excludeFields={["TrangThai", "NguoiGiao"]} // Exclude these, include NguoiXuLy + Deadline
        variant="manager"
        collapsible={true}
        defaultCollapsed={!isMobile}
      />

      {/* 5. Active Filter Chips */}
      {(filters.search ||
        filters.NguoiChinhID ||
        filters.UuTien ||
        filters.TinhTrangThoiHan !== "ALL") && (
        <ActiveFilterChips
          filters={filters}
          onRemoveFilter={(key) => setFilters({ ...filters, [key]: "" })}
        />
      )}

      {/* 6. Task Table/Cards */}
      {isMobile ? (
        <Box>
          {paginatedData.map((task) => (
            <CongViecCard
              key={task._id}
              data={task}
              variant="manager"
              showProgress={true} // NEW
              showParticipants={true} // NEW
              onView={handleViewDetail}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onTree={handleTree}
            />
          ))}
        </Box>
      ) : (
        <CongViecTable
          data={paginatedData}
          total={filteredData.length}
          page={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
          onView={handleViewDetail}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onTree={handleTree}
          isLoading={isLoading}
          variant="manager" // Show "Người xử lý" column instead of "Người giao"
        />
      )}

      {/* 7. Recent Completed Preview */}
      <RecentCompletedPreview
        recentTasks={recentCompleted}
        onViewAll={() => navigate("/quanlycongviec/lich-su-da-giao")}
        clientPagination={true} // NEW: Enable client pagination
        itemsPerPage={10}
      />

      {/* Dialogs */}
      <CongViecDetailDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        congViecId={selectedCongViec}
      />

      <CongViecFormDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        congViec={selectedCongViec}
        isEdit={!!selectedCongViec}
      />

      <CongViecTreeDialog
        open={treeDialogOpen}
        onClose={() => setTreeDialogOpen(false)}
        congViec={selectedCongViec}
      />
    </Container>
  );
}

export default AssignedTasksPage;
```

---

#### **Task B.2: Update StatusTabs.js (0.5h)**

**Add:** Manager variant with 5 tabs and adjusted labels

```javascript
// components/StatusTabs.js (add ~50 lines)
function StatusTabs({
  status,
  onStatusChange,
  counts,
  isMobile,
  variant = "individual", // 'individual' | 'manager'
}) {
  // Define tabs based on variant
  const statusTabs =
    variant === "manager"
      ? [
          { value: "ALL", label: "Tất cả", icon: ListIcon },
          { value: "CHUA_GIAO", label: "Chưa giao", icon: DraftsIcon },
          { value: "DA_GIAO", label: "Đã giao", icon: SendIcon },
          { value: "DANG_LAM", label: "Đang làm", icon: PlayIcon },
          { value: "CHO_TOI_DUYET", label: "Chờ tôi duyệt", icon: ClockIcon },
        ]
      : [
          { value: "ALL", label: "Tất cả", icon: ListIcon },
          { value: "DA_GIAO", label: "Đã giao", icon: SendIcon },
          { value: "DANG_LAM", label: "Đang làm", icon: PlayIcon },
          { value: "CHO_DUYET", label: "Chờ duyệt", icon: ClockIcon },
        ];

  // Map count keys based on variant
  const getStatusCount = (tabValue) => {
    if (tabValue === "ALL") return counts.all;

    if (variant === "manager") {
      const keyMap = {
        CHUA_GIAO: "chuaGiao",
        DA_GIAO: "daGiao",
        DANG_LAM: "dangLam",
        CHO_TOI_DUYET: "choToiDuyet",
      };
      return counts[keyMap[tabValue]] || 0;
    } else {
      const keyMap = {
        DA_GIAO: "daGiao",
        DANG_LAM: "dangLam",
        CHO_DUYET: "choDuyet",
      };
      return counts[keyMap[tabValue]] || 0;
    }
  };

  // Rest of component logic unchanged...
  // (Mobile chips vs Desktop tabs rendering)
}
```

---

#### **Task B.3: Update congViecSlice.js (1h)**

**Add:** `assignedCongViecs`, `recentCompletedAssigned` state + thunks

```javascript
// congViecSlice.js (add ~150 lines)
const initialState = {
  receivedCongViecs: [], // Task 2.5
  assignedCongViecs: [], // Task 2.6 - NEW
  recentCompleted: [], // Task 2.5
  recentCompletedAssigned: [], // Task 2.6 - NEW
  // ... other state
};

// NEW Thunk: Get assigned tasks (manager view)
export const getAssignedCongViecs = (params) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const { nguoiGiaoId, excludeStatus, limit, page } = params;
    const response = await apiService.get(
      `/workmanagement/congviec/assigned/${nguoiGiaoId}`,
      {
        params: { excludeStatus, limit, page },
      }
    );
    dispatch(slice.actions.getAssignedCongViecsSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

// NEW Thunk: Get recent completed assigned
export const getRecentCompletedAssigned = (params) => async (dispatch) => {
  try {
    const { nguoiGiaoId, days, limit } = params;
    const response = await apiService.get(
      `/workmanagement/congviec/recent-completed-assigned/${nguoiGiaoId}`,
      { params: { days, limit } }
    );
    dispatch(
      slice.actions.getRecentCompletedAssignedSuccess(response.data.data)
    );
  } catch (error) {
    console.error("Failed to fetch recent completed assigned:", error);
  }
};

// Reducers
const slice = createSlice({
  name: "congViec",
  initialState,
  reducers: {
    // ... existing reducers

    getAssignedCongViecsSuccess(state, action) {
      state.isLoading = false;
      state.assignedCongViecs = action.payload;
    },

    getRecentCompletedAssignedSuccess(state, action) {
      state.recentCompletedAssigned = action.payload;
    },
  },
});
```

---

### **Phase C: Integration & Testing (2.5h)**

#### **Task C.1: Route Setup (0.5h)**

```javascript
// routes/index.js
import AssignedTasksPage from "features/QuanLyCongViec/CongViec/AssignedTasksPage";

<Route path="quanlycongviec">
  {/* Task 2.5 */}
  <Route path="cong-viec-cua-toi" element={<MyTasksPage />} />

  {/* Task 2.6 - NEW */}
  <Route path="viec-toi-giao" element={<AssignedTasksPage />} />

  {/* Other routes */}
</Route>;
```

**Update navigation:**

```javascript
// src/menu-items/quanlycongviec.js
{
  id: 'viec-toi-giao',
  title: 'Việc tôi giao',
  type: 'item',
  url: '/quanlycongviec/viec-toi-giao',
  icon: icons.AssignmentTurnedInIcon,
  breadcrumbs: true,
}
```

---

#### **Task C.2: Backend API Endpoints (already exists - verify only)**

**Verify these endpoints exist:**

```javascript
// GET /api/workmanagement/congviec/assigned/:nhanVienId
// Query: excludeStatus, limit, page
// Returns: { success, data: CongViec[], total }

// GET /api/workmanagement/congviec/recent-completed-assigned/:nhanVienId
// Query: days, limit
// Returns: { success, data: CongViec[], total }
```

**If not exist, create in backend** (giaobanbv-be):

```javascript
// modules/workmanagement/controllers/congViec.controller.js
exports.getAssignedCongViecs = catchAsync(async (req, res, next) => {
  const { nhanVienId } = req.params;
  const { excludeStatus, limit = 500, page = 1 } = req.query;

  const query = { NguoiGiaoID: nhanVienId };
  if (excludeStatus) {
    query.TrangThai = { $ne: excludeStatus };
  }

  const congViecs = await CongViec.find(query)
    .populate("NguoiChinhID", "HoTen")
    .populate("NguoiGiaoID", "HoTen")
    .sort({ NgayTao: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const total = await CongViec.countDocuments(query);

  return sendResponse(
    res,
    200,
    true,
    { data: congViecs, total },
    null,
    "Success"
  );
});

exports.getRecentCompletedAssigned = catchAsync(async (req, res, next) => {
  const { nhanVienId } = req.params;
  const { days = 30, limit = 30 } = req.query;

  const sinceDate = dayjs().subtract(days, "day").toDate();

  const congViecs = await CongViec.find({
    NguoiGiaoID: nhanVienId,
    TrangThai: "HOAN_THANH",
    NgayHoanThanh: { $gte: sinceDate },
  })
    .populate("NguoiChinhID", "HoTen")
    .sort({ NgayHoanThanh: -1 })
    .limit(parseInt(limit));

  const total = await CongViec.countDocuments({
    NguoiGiaoID: nhanVienId,
    TrangThai: "HOAN_THANH",
    NgayHoanThanh: { $gte: sinceDate },
  });

  return sendResponse(
    res,
    200,
    true,
    { data: congViecs, total },
    null,
    "Success"
  );
});
```

---

#### **Task C.3: Comprehensive Testing (2h)**

**Testing Checklist:**

**Functional Tests:**

- [ ] **5 Status Tabs**

  - [ ] Click "Tất cả" → URL = `?status=ALL`
  - [ ] Click "Chưa giao" → URL = `?status=CHUA_GIAO` → Filter TAO_MOI
  - [ ] Click "Đã giao" → URL = `?status=DA_GIAO` → Filter DA_GIAO
  - [ ] Click "Đang làm" → URL = `?status=DANG_LAM` → Filter DANG_LAM/DANG_THUC_HIEN
  - [ ] Click "Chờ tôi duyệt" → URL = `?status=CHO_TOI_DUYET` → Filter CHO_DUYET
  - [ ] Badge counts match data (with deadline badges ⚠️ ⏰)

- [ ] **Filters**

  - [ ] Search by TenCongViec works
  - [ ] Người xử lý chính dropdown filters correctly
  - [ ] Tình trạng deadline filter (QUA_HAN/SAP_QUA_HAN/ON_TRACK) works
  - [ ] Priority filter works
  - [ ] Date range filter works
  - [ ] Multiple filters combine (AND logic)
  - [ ] ActiveFilterChips show applied filters
  - [ ] Click X on chip removes filter

- [ ] **Actions**

  - [ ] Cây công việc (tree view) opens dialog
  - [ ] Xem chi tiết (view detail) opens dialog
  - [ ] Chỉnh sửa (edit) opens form with data
  - [ ] Xóa (delete) shows confirmation
  - [ ] Tạo mới opens empty form

- [ ] **UrgentAlertBanner**

  - [ ] Shows when overdue/upcoming > 0
  - [ ] Click "Xem" filters to urgent tasks
  - [ ] Dismiss persists in localStorage

- [ ] **RecentCompleted**

  - [ ] Shows last 30 days completed
  - [ ] Client pagination works (3 pages × 10 items)
  - [ ] "Xem tất cả" navigates to archive
  - [ ] Empty state shows when no data

- [ ] **URL Params**
  - [ ] Deep link `/viec-toi-giao?status=CHO_TOI_DUYET` works
  - [ ] Browser back button changes tabs
  - [ ] Refresh page preserves tab

**Mobile Tests:**

- [ ] 5 status tabs render as scrollable chips
- [ ] Cards show progress bar
- [ ] Cards show participant count
- [ ] Card actions work (tree, view, edit, delete)
- [ ] Sticky columns work on mobile table view

**Performance Tests:**

- [ ] 500 tasks load in < 2s
- [ ] Client-side filtering instant (< 100ms)
- [ ] Tab switching instant (no network request)
- [ ] Pagination smooth

**Edge Cases:**

- [ ] No assigned tasks → Empty state
- [ ] All filters cleared → Reset to default
- [ ] Invalid status in URL → Fallback to ALL
- [ ] Rapid tab switching → No race conditions

---

## 📦 Deliverables Summary

| File                           | Type          | Lines | Status           |
| ------------------------------ | ------------- | ----- | ---------------- |
| `AssignedTasksPage.js`         | New Component | ~450  | ⏳ To Create     |
| `useAssignedTaskCounts.js`     | New Hook      | ~120  | ⏳ To Create     |
| `useAssignedTasksUrlParams.js` | New Hook      | ~80   | ⏳ To Create     |
| `StatusTabs.js`                | Update        | +50   | ⏳ To Update     |
| `CongViecCard.js`              | Update        | +30   | ⏳ To Update     |
| `CongViecFilterPanel.js`       | Update        | +80   | ⏳ To Update     |
| `RecentCompletedPreview.js`    | Update        | +40   | ⏳ To Update     |
| `congViecSlice.js`             | Update        | +150  | ⏳ To Update     |
| `routes/index.js`              | Update        | +5    | ⏳ To Update     |
| `menu-items/quanlycongviec.js` | Update        | +10   | ⏳ To Update     |
| **Backend (if needed):**       |               |       |                  |
| `congViec.controller.js`       | Update        | +60   | ⏸️ Verify exists |
| `congViec.routes.js`           | Update        | +5    | ⏸️ Verify exists |

**Total:** 1 new page, 2 new hooks, 6 updates (~1,015 new lines)

---

## 🚀 Implementation Order

### **Day 1: Component Setup (2h)**

1. Create `useAssignedTaskCounts.js` (0.5h)
2. Create `useAssignedTasksUrlParams.js` (0.5h)
3. Update `CongViecCard.js` (0.5h)
4. Update `CongViecFilterPanel.js` (0.5h)

### **Day 2: Page Implementation (4.5h)**

1. Create `AssignedTasksPage.js` skeleton (1h)
2. Implement data fetching (1h)
3. Implement client-side filtering (1h)
4. Update `StatusTabs.js` for 5 tabs (0.5h)
5. Update `congViecSlice.js` (1h)

### **Day 3: Integration & Testing (2.5h)**

1. Route setup & navigation (0.5h)
2. Verify backend APIs (optional) (0.5h)
3. Comprehensive testing (1.5h)

---

## ⚠️ Risk Assessment

| Risk                                      | Impact    | Probability | Mitigation                                   |
| ----------------------------------------- | --------- | ----------- | -------------------------------------------- |
| Backend API không có `/assigned` endpoint | 🔴 High   | 🟡 Medium   | Verify trước, nếu không có thì tạo (1h)      |
| 500 tasks performance issue               | 🟡 Medium | 🟢 Low      | Monitor, add indexing if needed              |
| 5 tabs confusing UX                       | 🟢 Low    | 🟡 Medium   | User testing, consider collapsing HOAN_THANH |
| Filter combinations too complex           | 🟡 Medium | 🟡 Medium   | Add "Clear all filters" button               |

---

## ✅ Success Criteria

**User Experience:**

- ✅ Manager can see all assigned tasks in one place
- ✅ 5 status tabs clear and intuitive
- ✅ Urgent tasks highly visible (banner)
- ✅ Filter by assignee works smoothly
- ✅ Mobile card view shows progress + participants
- ✅ Recent completed with pagination (30 days)

**Technical:**

- ✅ Reuse 70% code from Task 2.5
- ✅ Client-side filtering performance acceptable
- ✅ URL params work correctly
- ✅ All tests pass

**Business:**

- ✅ Managers can track team workload
- ✅ Quick access to tasks needing approval
- ✅ Clear visibility on task progress

---

## 📝 Notes

**Key Differences from Task 2.5:**

1. **5 tabs instead of 4** - Added "Chưa giao" (TAO_MOI status)
2. **Different filter** - Người xử lý instead of Người giao
3. **New deadline filter** - QUA_HAN/SAP_QUA_HAN/ON_TRACK
4. **Card enhancements** - Progress bar + Participant count
5. **Different actions** - Full CRUD + Reassign capability

**Deferred Features:**

- Archive page for full history (Task 2.7+)
- Bulk actions (reassign multiple, delete multiple)
- Export to Excel
- Advanced analytics dashboard

---

**End of Task 2.6 Plan** 🎯
