# 📱 KPI Scoring Page - Route-based Implementation Plan

## Mục tiêu

Chuyển đổi trang chấm điểm KPI từ **Dialog-based** sang **Route-based** với responsive Desktop/Mobile views, theo pattern đã proven của CongViecDetail.

---

## 📁 Cấu trúc File Mới

```
src/features/QuanLyCongViec/KPI/
├── pages/
│   ├── index.js                      [UPDATE - thêm exports]
│   ├── KPIEvaluationPage.js          [UPDATE - đổi navigation]
│   ├── ChamDiemKPIResponsive.js      [NEW - wrapper switch]
│   ├── ChamDiemKPIPage.js            [NEW - desktop page]
│   └── ChamDiemKPIMobile.js          [NEW - mobile page]
│
├── v2/components/
│   ├── ChamDiemKPIDialog.js          [KEEP - cho legacy/popup]
│   ├── ChamDiemKPITable.js           [REUSE]
│   ├── TieuChiGrid.js                [REUSE]
│   ├── QuickScoreDialog.js           [REUSE]
│   ├── KPIHistoryDialog.js           [REUSE]
│   ├── CongViecCompactCard.js        [REUSE]
│   ├── CrossCycleTasksCompactCard.js [REUSE]
│   └── YeuCauCompactCard.js          [REUSE]
│
└── kpiSlice.js                       [NO CHANGE]
```

---

## 🛤️ Route Configuration

**URL Pattern:**

```
/quanlycongviec/kpi/cham-diem/:nhanVienId?chuky=:chuKyId&readonly=:boolean
```

**Route trong routes/index.js:**

```jsx
<Route path="kpi">
  <Route index element={<Navigate to="xem" replace />} />
  <Route path="xem" element={<XemKPIPage />} />
  <Route path="tu-danh-gia" element={<TuDanhGiaKPIPage />} />
  <Route path="danh-gia-nhan-vien" element={<KPIEvaluationPage />} />

  {/* NEW: Responsive scoring page */}
  <Route path="cham-diem/:nhanVienId" element={<ChamDiemKPIResponsive />} />

  <Route
    path="bao-cao"
    element={
      <AdminRequire>
        <BaoCaoKPIPage />
      </AdminRequire>
    }
  />
  <Route
    path="chu-ky"
    element={
      <AdminRequire>
        <ChuKyDanhGiaList />
      </AdminRequire>
    }
  />
  <Route
    path="chu-ky/:id"
    element={
      <AdminRequire>
        <ChuKyDanhGiaView />
      </AdminRequire>
    }
  />
</Route>
```

---

## 📋 Task Details

### Task 1: ChamDiemKPIResponsive.js

**File:** `src/features/QuanLyCongViec/KPI/pages/ChamDiemKPIResponsive.js`

**Pattern Reference:** `CongViecDetailResponsive.js`

```jsx
import React from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import ChamDiemKPIPage from "./ChamDiemKPIPage";
import ChamDiemKPIMobile from "./ChamDiemKPIMobile";

/**
 * ChamDiemKPIResponsive - Responsive wrapper for KPI scoring views
 *
 * Automatically switches between desktop and mobile layouts based on screen size:
 * - Desktop (>=md breakpoint): Full-featured layout with sidebar
 * - Mobile (<md breakpoint): Tab-based compact layout with sticky elements
 *
 * @component
 * @example
 * // Usage in routes
 * <Route path="/kpi/cham-diem/:nhanVienId" element={<ChamDiemKPIResponsive />} />
 */
function ChamDiemKPIResponsive() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return isMobile ? <ChamDiemKPIMobile /> : <ChamDiemKPIPage />;
}

export default ChamDiemKPIResponsive;
```

**LOC:** ~30

---

### Task 2: ChamDiemKPIPage.js (Desktop)

**File:** `src/features/QuanLyCongViec/KPI/pages/ChamDiemKPIPage.js`

**Pattern Reference:** `CongViecDetailPageNew.js`

#### Props/Params:

```javascript
// URL Params
const { nhanVienId } = useParams();

// Query Params
const [searchParams] = useSearchParams();
const chuKyId = searchParams.get("chuky");
const readOnly = searchParams.get("readonly") === "true";
```

#### Redux State (from kpiSlice):

```javascript
const {
  currentDanhGiaKPI, // DanhGiaKPI record
  currentNhiemVuList, // Array of DanhGiaNhiemVuThuongQuy
  isLoading,
  isSaving,
  syncWarning,
} = useSelector((state) => state.kpi);
```

#### Data Loading useEffects:

```javascript
// 1. Load KPI scoring data
useEffect(() => {
  if (nhanVienId && chuKyId) {
    dispatch(getChamDiemDetail(chuKyId, nhanVienId));
  }
  return () => {
    dispatch(clearCurrentChamDiem());
  };
}, [nhanVienId, chuKyId, dispatch]);

// 2. Load employee info
useEffect(() => {
  if (nhanVienId) {
    dispatch(getNhanVienInfo(nhanVienId));
  }
}, [nhanVienId, dispatch]);

// 3. Load compact card summaries
useEffect(() => {
  if (nhanVienId && chuKyId) {
    dispatch(fetchOtherTasksSummary({ nhanVienId, chuKyId }));
    dispatch(fetchCrossCycleTasksSummary({ nhanVienId, chuKyId }));
    dispatch(fetchCollabTasksSummary({ nhanVienId, chuKyId }));
    dispatch(fetchOtherYeuCauSummary({ nhanVienId, chuKyId }));
  }
}, [nhanVienId, chuKyId, dispatch]);
```

#### Handlers (extract từ ChamDiemKPIDialog):

```javascript
// Score update
const handleScoreChange = (nhiemVuId, tieuChiId, value) => {
  dispatch(updateTieuChiScoreLocal({ nhiemVuId, tieuChiId, value }));
};

// Quick score all
const handleQuickScoreAll = (percentage) => {
  dispatch(quickScoreAllNhiemVu(percentage));
};

// Save draft
const handleSave = async () => {
  await dispatch(saveAllNhiemVu());
};

// Approve KPI
const handleApprove = async () => {
  if (!canApprove) return;
  await dispatch(approveKPI(currentDanhGiaKPI._id));
  toast.success("Đã duyệt KPI thành công!");
  navigate(-1);
};

// Undo approval
const handleUndoApproval = async (reason) => {
  await dispatch(undoApproveKPI({ id: currentDanhGiaKPI._id, lyDo: reason }));
};

// Reset criteria (sync with cycle config)
const handleResetCriteria = () => {
  dispatch(resetCriteria());
};

// Navigate back
const handleBack = () => {
  dispatch(clearCurrentChamDiem());
  navigate(-1);
};
```

#### Computed Values (useMemo):

```javascript
// Can edit?
const isEditable = useMemo(() => {
  if (readOnly) return false;
  if (!currentDanhGiaKPI) return false;
  return currentDanhGiaKPI.TrangThai !== "DA_DUYET";
}, [readOnly, currentDanhGiaKPI]);

// Progress
const progress = useMemo(() => {
  if (!currentNhiemVuList?.length)
    return { scored: 0, total: 0, percentage: 0 };
  const total = currentNhiemVuList.length;
  const scored = currentNhiemVuList.filter((nv) => {
    // Check if all criteria have scores
    return nv.ChiTietDiem?.every((tc) => tc.DiemQL != null && tc.DiemQL !== "");
  }).length;
  return { scored, total, percentage: Math.round((scored / total) * 100) };
}, [currentNhiemVuList]);

// Total KPI score
const totalKPIScore = useMemo(() => {
  return calculateTotalScore(currentNhiemVuList);
}, [currentNhiemVuList]);

// Can approve?
const canApprove = useMemo(() => {
  return progress.percentage === 100 && currentDanhGiaKPI && isEditable;
}, [progress, currentDanhGiaKPI, isEditable]);

// Unscored tasks list
const unscoredTasks = useMemo(() => {
  return currentNhiemVuList.filter((nv) => {
    return !nv.ChiTietDiem?.every((tc) => tc.DiemQL != null);
  });
}, [currentNhiemVuList]);
```

#### Layout Structure:

```
┌─────────────────────────────────────────────────────────────┐
│ AppBar (position="sticky", color="default")                 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ← IconButton(ArrowBackIcon)                             │ │
│ │ Typography: "Chấm điểm KPI - {nhanVien.Ten}"            │ │
│ │ Chip: {chuKy.TenChuKy}                                  │ │
│ │ [Actions menu]                                           │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Container (maxWidth="xl", sx={{ py: 3 }})                   │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Progress Section                                         │ │
│ │ LinearProgress + Typography: "80% (8/10 nhiệm vụ)"      │ │
│ │ Alert (if unscored tasks exist)                         │ │
│ │ Alert (if syncWarning exists)                           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ChamDiemKPITable                                         │ │
│ │ (Reuse component, pass handlers as props)               │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Compact Cards Section (Grid container spacing={2})      │ │
│ │ ┌───────────┐ ┌───────────┐ ┌───────────┐              │ │
│ │ │CongViec   │ │CrossCycle │ │ YeuCau    │              │ │
│ │ │CompactCard│ │TasksCard  │ │CompactCard│              │ │
│ │ └───────────┘ └───────────┘ └───────────┘              │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ Footer (position="sticky", bottom=0, bgcolor="background")  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Stack direction="row" spacing={2} justifyContent="end"  │ │
│ │                                                         │ │
│ │ [Lịch sử] [Hủy duyệt?] [Lưu nháp] [Duyệt KPI]          │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**LOC:** ~400-500

---

### Task 3: ChamDiemKPIMobile.js (Mobile)

**File:** `src/features/QuanLyCongViec/KPI/pages/ChamDiemKPIMobile.js`

**Pattern Reference:** `CongViecDetailMobile.js`

#### Dependencies:

```javascript
import MobileDetailLayout from "components/MobileDetailLayout";
import SwipeableViews from "react-swipeable-views";
```

#### Tabs Configuration:

```javascript
const TABS = [
  { label: "Chấm điểm", icon: <GradingIcon /> },
  { label: "Công việc", icon: <TaskIcon /> },
  { label: "Yêu cầu", icon: <RequestIcon /> },
];
```

#### Layout Structure:

```
┌──────────────────────────────────────────┐
│ MobileDetailLayout                        │
│ ┌──────────────────────────────────────┐ │
│ │ Header                                │ │
│ │ ← Chấm điểm KPI   ████ 80%    [⋮]   │ │
│ └──────────────────────────────────────┘ │
├──────────────────────────────────────────┤
│ Tabs (variant="fullWidth")               │
│ [Chấm điểm] [Công việc] [Yêu cầu]       │
├──────────────────────────────────────────┤
│                                          │
│ SwipeableViews (index={activeTab})       │
│                                          │
│ ┌────────────────────────────────────┐   │
│ │ Tab 0: Scoring Cards               │   │
│ │                                    │   │
│ │ ┌────────────────────────────┐     │   │
│ │ │ KPIScoringCardMobile       │     │   │
│ │ │ ┌──────────────────────┐   │     │   │
│ │ │ │ 📋 Báo cáo tuần      │   │     │   │
│ │ │ │ Điểm QL: [  75  ]    │   │     │   │
│ │ │ │ Tự ĐG: 80%           │   │     │   │
│ │ │ │ CV: 3/3 ✓  YC: 0     │   │     │   │
│ │ │ │ ████████░░ 75%       │   │     │   │
│ │ │ │ [Mở rộng ▼]          │   │     │   │
│ │ │ └──────────────────────┘   │     │   │
│ │ └────────────────────────────┘     │   │
│ │                                    │   │
│ │ ┌────────────────────────────┐     │   │
│ │ │ KPIScoringCardMobile       │     │   │
│ │ │ ... (next nhiệm vụ)        │     │   │
│ │ └────────────────────────────┘     │   │
│ └────────────────────────────────────┘   │
│                                          │
│ ┌────────────────────────────────────┐   │
│ │ Tab 1: CongViecCompactCard         │   │
│ │ + CrossCycleTasksCompactCard       │   │
│ │ + CollabTasksCard                  │   │
│ └────────────────────────────────────┘   │
│                                          │
│ ┌────────────────────────────────────┐   │
│ │ Tab 2: YeuCauCompactCard           │   │
│ └────────────────────────────────────┘   │
│                                          │
├──────────────────────────────────────────┤
│ Footer (sticky, safe-area-inset-bottom)  │
│ ┌──────────────────────────────────────┐ │
│ │ [Lưu nháp]         [Duyệt KPI ✓]     │ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

#### Mobile Scoring Card Component (inline or separate):

```jsx
function KPIScoringCardMobile({ nhiemVu, onScoreChange, isEditable }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        {/* Header: Tên nhiệm vụ + Score indicator */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight={600}>
            {nhiemVu.NhiemVuThuongQuyID?.TenNhiemVu}
          </Typography>
          <Chip
            label={`${nhiemVu.DiemNhiemVu || "--"}`}
            color={nhiemVu.DiemNhiemVu ? "primary" : "default"}
          />
        </Box>

        {/* Stats row */}
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Chip
            size="small"
            label={`Tự ĐG: ${nhiemVu.DiemTuDanhGia || "--"}%`}
          />
          <Chip size="small" label={`CV: ${nhiemVu.congViecCount}`} />
          <Chip size="small" label={`YC: ${nhiemVu.yeuCauCount}`} />
        </Stack>

        {/* Progress bar */}
        <LinearProgress
          variant="determinate"
          value={calculateProgress(nhiemVu)}
          sx={{ mt: 1, height: 8, borderRadius: 4 }}
        />

        {/* Expand button */}
        <Button
          fullWidth
          onClick={() => setExpanded(!expanded)}
          endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        >
          {expanded ? "Thu gọn" : "Chấm điểm chi tiết"}
        </Button>

        {/* Expanded: Criteria scoring */}
        <Collapse in={expanded}>
          <Divider sx={{ my: 1 }} />
          {nhiemVu.ChiTietDiem?.map((tieuChi) => (
            <Box key={tieuChi.TieuChiID} sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {tieuChi.TenTieuChi}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Slider
                  value={tieuChi.DiemQL || 0}
                  onChange={(e, val) =>
                    onScoreChange(nhiemVu._id, tieuChi.TieuChiID, val)
                  }
                  min={tieuChi.GiaTriMin || 0}
                  max={tieuChi.GiaTriMax || 100}
                  disabled={!isEditable}
                  sx={{ flex: 1 }}
                />
                <TextField
                  type="number"
                  value={tieuChi.DiemQL || ""}
                  onChange={(e) =>
                    onScoreChange(
                      nhiemVu._id,
                      tieuChi.TieuChiID,
                      e.target.value,
                    )
                  }
                  disabled={!isEditable}
                  sx={{ width: 80 }}
                  inputProps={{
                    min: tieuChi.GiaTriMin,
                    max: tieuChi.GiaTriMax,
                    style: { textAlign: "center", fontSize: 16 },
                  }}
                />
              </Stack>
            </Box>
          ))}
        </Collapse>
      </CardContent>
    </Card>
  );
}
```

**LOC:** ~500-600

---

### Task 4: Update routes/index.js

**Location:** After line 364 (tu-danh-gia route)

**Add import:**

```javascript
import ChamDiemKPIResponsive from "features/QuanLyCongViec/KPI/pages/ChamDiemKPIResponsive";
```

**Add route:**

```jsx
<Route path="cham-diem/:nhanVienId" element={<ChamDiemKPIResponsive />} />
```

---

### Task 5: Update KPIEvaluationPage.js

**Change handleEvaluate function:**

```javascript
// BEFORE
const handleEvaluate = (employee) => {
  dispatch(getChamDiemDetailV2(selectedCycleId, employee._id));
  setEvaluationDialog({ open: true, employee, readOnly: false });
};

// AFTER
const handleEvaluate = (employee) => {
  navigate(
    `/quanlycongviec/kpi/cham-diem/${employee._id}?chuky=${selectedCycleId}`,
  );
};
```

**Change handleViewKPI function:**

```javascript
// BEFORE
const handleViewKPI = (employee) => {
  dispatch(getChamDiemDetailV2(selectedCycleId, employee._id));
  setEvaluationDialog({ open: true, employee, readOnly: true });
};

// AFTER
const handleViewKPI = (employee) => {
  navigate(
    `/quanlycongviec/kpi/cham-diem/${employee._id}?chuky=${selectedCycleId}&readonly=true`,
  );
};
```

**Optional cleanup:**

- Remove `evaluationDialog` state
- Remove `ChamDiemKPIDialog` import and JSX
- Remove `handleCloseDialog` function

---

### Task 6: Update pages/index.js

**File:** `src/features/QuanLyCongViec/KPI/pages/index.js`

**Add exports:**

```javascript
export { default as ChamDiemKPIResponsive } from "./ChamDiemKPIResponsive";
export { default as ChamDiemKPIPage } from "./ChamDiemKPIPage";
export { default as ChamDiemKPIMobile } from "./ChamDiemKPIMobile";
```

---

## 📅 Timeline

| Phase          | Tasks                       | Effort   | Priority |
| -------------- | --------------------------- | -------- | -------- |
| **Phase 1**    | Task 2 (Desktop Page)       | 4h       | P0       |
| **Phase 1**    | Task 4 (Routes)             | 30min    | P0       |
| **Phase 1**    | Task 5 (Navigation)         | 1h       | P0       |
| **Phase 1**    | Task 6 (Exports)            | 15min    | P0       |
| _Test Desktop_ | Verify desktop flow works   | 1h       | P0       |
| **Phase 2**    | Task 3 (Mobile Page)        | 6h       | P1       |
| **Phase 2**    | Task 1 (Responsive Wrapper) | 30min    | P1       |
| _Test Mobile_  | Task 7 (Full testing)       | 2h       | P1       |
| **TOTAL**      |                             | **~15h** |          |

---

## 🧪 Testing Checklist

### Desktop

- [ ] Navigate từ KPIEvaluationPage → ChamDiemKPIPage
- [ ] URL params đúng: `/kpi/cham-diem/:nhanVienId?chuky=:chuKyId`
- [ ] Data loading: KPI data, employee info, compact card summaries
- [ ] Back button works (navigate(-1))
- [ ] Score input works (update local state)
- [ ] Save draft functionality
- [ ] Approve KPI functionality
- [ ] Undo approval (if already approved)
- [ ] Read-only mode (`?readonly=true`)
- [ ] Sync warning alert displays
- [ ] History dialog opens

### Mobile

- [ ] Responsive switch at 900px breakpoint
- [ ] MobileDetailLayout renders correctly
- [ ] Tab navigation works (tap + swipe)
- [ ] Scoring cards display all nhiệm vụ
- [ ] Card expand/collapse works
- [ ] Score input touch-friendly (44px+ targets)
- [ ] Footer sticky above bottom nav
- [ ] Save/Approve buttons work
- [ ] Pull-to-refresh (if implemented)

### Deep Linking

- [ ] Direct URL access: `/kpi/cham-diem/xxx?chuky=yyy`
- [ ] From notification (future)
- [ ] Shareable URL works for team

---

## 🔗 Dependencies

### Shared Components (Reuse)

- `ChamDiemKPITable` - Main scoring table
- `TieuChiGrid` - Criteria grid with sliders
- `QuickScoreDialog` - Batch scoring dialog
- `KPIHistoryDialog` - Approval history
- `CongViecCompactCard` - Task summary
- `CrossCycleTasksCompactCard` - Cross-cycle tasks
- `YeuCauCompactCard` - Request summary
- `CongViecDetailDialog` - Task detail (popup)

### Redux Actions (from kpiSlice)

- `getChamDiemDetail(chuKyId, nhanVienId)`
- `updateTieuChiScoreLocal({ nhiemVuId, tieuChiId, value })`
- `quickScoreAllNhiemVu(percentage)`
- `saveAllNhiemVu()`
- `approveKPI(danhGiaKPIId)`
- `undoApproveKPI({ id, lyDo })`
- `clearCurrentChamDiem()`
- `resetCriteria()`
- `clearSyncWarning()`

### Redux Actions (from congViecSlice)

- `fetchOtherTasksSummary({ nhanVienId, chuKyId })`
- `fetchCrossCycleTasksSummary({ nhanVienId, chuKyId })`
- `fetchCollabTasksSummary({ nhanVienId, chuKyId })`

### Redux Actions (from yeuCauSlice)

- `fetchOtherYeuCauSummary({ nhanVienId, chuKyId })`

### External Components

- `MobileDetailLayout` - Mobile page wrapper
- `SwipeableViews` - Tab swipe navigation

---

## 📝 Notes

1. **Keep ChamDiemKPIDialog.js**: Giữ nguyên cho trường hợp cần popup (legacy hoặc quick view từ other pages)

2. **Employee Info Loading**: Cần thêm action `getNhanVienInfo(nhanVienId)` hoặc lấy từ `currentDanhGiaKPI.NhanVienID` (populated)

3. **Auto-refresh**: Khi approve xong, có thể navigate về list hoặc stay và show success state

4. **Error Handling**: Handle trường hợp invalid nhanVienId hoặc chuKyId

5. **Authorization**: Check quyền trong component, không cần wrapper ở route level
