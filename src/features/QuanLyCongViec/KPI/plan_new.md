# 📋 IMPLEMENTATION GUIDE - COMPACT DASHBOARD CHO CÔNG VIỆC KHÁC & PHỐI HỢP

**Objective**: Thêm 2 collapsible sections hiển thị công việc "Khác" (FlagNVTQKhac=true) và công việc "Phối hợp" (VaiTro=PHOI_HOP) dưới KPI Table với summary badges khi collapsed và task list chi tiết khi expanded.

**Architecture**: Option 1 - Collapsible Cards dưới KPI Table

- **Backend**: 2 lightweight summary APIs (không dùng full aggregation như dashboard chính)
- **Frontend**: Reusable `CongViecCompactCard` component + Redux integration
- **UI/UX**: Default collapsed, expand on click, 93% space saving

---

## 📐 TỔNG QUAN KIẾN TRÚC

```
ChamDiemKPIPage
├─ ChamDiemKPITable (HIỆN CÓ)
│   └─ Expanded rows: Tabs [Chấm điểm | Công việc NVTQ]
│
├─ CongViecCompactCard (MỚI - Card 1)
│   Title: "📦 Công việc khác"
│   Data: API /summary-other-tasks
│   Filter: FlagNVTQKhac=true + NguoiChinhID=nhanVienID
│
└─ CongViecCompactCard (MỚI - Card 2)
    Title: "🤝 Công việc phối hợp"
    Data: API /summary-collab-tasks
    Filter: VaiTro=PHOI_HOP in NguoiThamGia array
```

---

## STEP 1: BACKEND - TẠO 2 SUMMARY SERVICE METHODS

### File: `giaobanbv-be/modules/workmanagement/services/congViec.service.js`

**Location**: Thêm vào cuối file, sau method `getDashboardByNhiemVu`

**Context**: Tham khảo pattern từ `getDashboardByNhiemVu` (line ~2825) nhưng đơn giản hơn:

- Không cần 5 aggregations phức tạp
- Chỉ cần: total, completed, late, active counts + task list (50 tasks max)
- Không populate đầy đủ như dashboard chính

### Code Sample:

```javascript
/**
 * Get summary of "other" tasks (FlagNVTQKhac = true)
 * Used by: Compact card in KPI evaluation page
 * @param {String} nhanVienID - Employee ID
 * @param {String} chuKyDanhGiaID - Evaluation cycle ID
 * @returns {Object} {total, completed, late, active, tasks[]}
 */
service.getOtherTasksSummary = async (nhanVienID, chuKyDanhGiaID) => {
  // STEP 1.1: Validate inputs
  if (!nhanVienID || !chuKyDanhGiaID) {
    throw new AppError(400, "Thiếu nhanVienID hoặc chuKyDanhGiaID");
  }

  // STEP 1.2: Get cycle dates (same as getDashboardByNhiemVu)
  const chuKy = await ChuKyDanhGia.findById(chuKyDanhGiaID);
  if (!chuKy) {
    throw new AppError(404, "Không tìm thấy chu kỳ đánh giá");
  }

  const tuNgay = new Date(chuKy.NgayBatDau);
  const denNgay = new Date(chuKy.NgayKetThuc);

  if (
    !tuNgay ||
    isNaN(tuNgay.getTime()) ||
    !denNgay ||
    isNaN(denNgay.getTime())
  ) {
    throw new AppError(400, "Chu kỳ đánh giá có ngày không hợp lệ");
  }

  // STEP 1.3: Build filter - VAI TRÒ CHÍNH + FLAG "KHÁC"
  const baseFilter = {
    NguoiChinhID: toObjectId(nhanVienID), // Người chính
    FlagNVTQKhac: true, // Flag "Khác" = true
    NhiemVuThuongQuyID: null, // Không gắn NVTQ cụ thể
    isDeleted: { $ne: true },
    createdAt: { $gte: tuNgay, $lte: denNgay },
  };

  const now = new Date();

  // STEP 1.4: Aggregation for counts (lightweight)
  const [summary] = await CongViec.aggregate([
    { $match: baseFilter },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ["$TrangThai", "HOAN_THANH"] }, 1, 0] },
        },
        late: {
          $sum: { $cond: ["$HoanThanhTreHan", 1, 0] },
        },
        active: {
          $sum: { $cond: [{ $eq: ["$TrangThai", "DANG_THUC_HIEN"] }, 1, 0] },
        },
      },
    },
  ]);

  // STEP 1.5: Get task list (limit 50 for performance)
  const tasks = await CongViec.find(baseFilter)
    .select(
      "MaCongViec TieuDe TrangThai NgayHetHan SoGioTre HoanThanhTreHan createdAt"
    )
    .sort({ SoGioTre: -1, NgayHetHan: 1 }) // Late tasks first
    .limit(50)
    .lean();

  // STEP 1.6: Return summary + task list
  return {
    total: summary?.total || 0,
    completed: summary?.completed || 0,
    late: summary?.late || 0,
    active: summary?.active || 0,
    tasks: tasks || [],
  };
};

/**
 * Get summary of collaboration tasks (VaiTro = PHOI_HOP)
 * Used by: Compact card in KPI evaluation page
 * @param {String} nhanVienID - Employee ID
 * @param {String} chuKyDanhGiaID - Evaluation cycle ID
 * @returns {Object} {total, completed, late, active, tasks[]}
 */
service.getCollabTasksSummary = async (nhanVienID, chuKyDanhGiaID) => {
  // STEP 2.1: Validate inputs (same as above)
  if (!nhanVienID || !chuKyDanhGiaID) {
    throw new AppError(400, "Thiếu nhanVienID hoặc chuKyDanhGiaID");
  }

  // STEP 2.2: Get cycle dates (same pattern)
  const chuKy = await ChuKyDanhGia.findById(chuKyDanhGiaID);
  if (!chuKy) {
    throw new AppError(404, "Không tìm thấy chu kỳ đánh giá");
  }

  const tuNgay = new Date(chuKy.NgayBatDau);
  const denNgay = new Date(chuKy.NgayKetThuc);

  if (
    !tuNgay ||
    isNaN(tuNgay.getTime()) ||
    !denNgay ||
    isNaN(denNgay.getTime())
  ) {
    throw new AppError(400, "Chu kỳ đánh giá có ngày không hợp lệ");
  }

  // STEP 2.3: Build filter - VAI TRÒ PHỐI HỢP
  const baseFilter = {
    NguoiThamGia: {
      $elemMatch: {
        NhanVienID: toObjectId(nhanVienID),
        VaiTro: "PHOI_HOP", // ✅ Vai trò phối hợp
      },
    },
    isDeleted: { $ne: true },
    createdAt: { $gte: tuNgay, $lte: denNgay },
  };

  // STEP 2.4: Aggregation for counts (same as other tasks)
  const [summary] = await CongViec.aggregate([
    { $match: baseFilter },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ["$TrangThai", "HOAN_THANH"] }, 1, 0] },
        },
        late: {
          $sum: { $cond: ["$HoanThanhTreHan", 1, 0] },
        },
        active: {
          $sum: { $cond: [{ $eq: ["$TrangThai", "DANG_THUC_HIEN"] }, 1, 0] },
        },
      },
    },
  ]);

  // STEP 2.5: Get task list with NguoiChinh info (for "Người chính" column)
  const tasks = await CongViec.find(baseFilter)
    .select(
      "MaCongViec TieuDe TrangThai NgayHetHan SoGioTre HoanThanhTreHan NguoiChinhID createdAt"
    )
    .populate({
      path: "NguoiChinh",
      select: "Ten Email", // Lightweight populate for display
    })
    .sort({ SoGioTre: -1, NgayHetHan: 1 })
    .limit(50)
    .lean();

  // STEP 2.6: Map NguoiChinhProfile for frontend
  const tasksWithProfile = tasks.map((task) => ({
    ...task,
    NguoiChinhProfile: task.NguoiChinh
      ? {
          Ten: task.NguoiChinh.Ten,
          Email: task.NguoiChinh.Email,
        }
      : null,
  }));

  return {
    total: summary?.total || 0,
    completed: summary?.completed || 0,
    late: summary?.late || 0,
    active: summary?.active || 0,
    tasks: tasksWithProfile,
  };
};

// ✅ Export methods (add to module.exports at bottom of file)
```

**Testing**: Sau khi thêm code, test với:

```javascript
// MongoDB shell hoặc API test
const result = await service.getOtherTasksSummary(
  "66b1dba74f79822a4752d90d",
  "6900b277f718d71076b9fe31"
);
console.log(result); // Should return {total, completed, late, active, tasks[]}
```

---

## STEP 2: BACKEND - TẠO CONTROLLER & ROUTES

### File: `giaobanbv-be/modules/workmanagement/controllers/congViec.controller.js`

**Location**: Thêm vào cuối file

**Context**: Tham khảo pattern từ `ctrl.getDashboardByNhiemVu` (line ~500+)

### Code Sample:

```javascript
/**
 * @route GET /api/workmanagement/congviec/summary-other-tasks
 * @desc Get summary of "other" tasks (FlagNVTQKhac=true)
 * @query {String} nhanVienID - Employee ID (required)
 * @query {String} chuKyDanhGiaID - Evaluation cycle ID (required)
 * @access Private
 */
ctrl.getOtherTasksSummary = catchAsync(async (req, res) => {
  const { nhanVienID, chuKyDanhGiaID } = req.query;

  // Validate query params
  if (!nhanVienID || !chuKyDanhGiaID) {
    throw new AppError(400, "Thiếu nhanVienID hoặc chuKyDanhGiaID trong query");
  }

  // Call service method
  const data = await service.getOtherTasksSummary(nhanVienID, chuKyDanhGiaID);

  // Send response
  return sendResponse(
    res,
    200,
    true,
    data,
    null,
    "Lấy tóm tắt công việc khác thành công"
  );
});

/**
 * @route GET /api/workmanagement/congviec/summary-collab-tasks
 * @desc Get summary of collaboration tasks (VaiTro=PHOI_HOP)
 * @query {String} nhanVienID - Employee ID (required)
 * @query {String} chuKyDanhGiaID - Evaluation cycle ID (required)
 * @access Private
 */
ctrl.getCollabTasksSummary = catchAsync(async (req, res) => {
  const { nhanVienID, chuKyDanhGiaID } = req.query;

  // Validate query params
  if (!nhanVienID || !chuKyDanhGiaID) {
    throw new AppError(400, "Thiếu nhanVienID hoặc chuKyDanhGiaID trong query");
  }

  // Call service method
  const data = await service.getCollabTasksSummary(nhanVienID, chuKyDanhGiaID);

  // Send response
  return sendResponse(
    res,
    200,
    true,
    data,
    null,
    "Lấy tóm tắt công việc phối hợp thành công"
  );
});
```

### File: `giaobanbv-be/modules/workmanagement/routes/congViec.api.js`

**Location**: Tìm section có route `/dashboard-by-nhiemvu` (line ~30+), thêm ngay sau đó

**Context**: Giữ consistency với existing routes

### Code Sample:

```javascript
// ✅ Existing route (for reference)
router.get("/dashboard-by-nhiemvu", ctrl.getDashboardByNhiemVu);

// ✅ NEW ROUTES - Add these 2 lines
router.get("/summary-other-tasks", ctrl.getOtherTasksSummary);
router.get("/summary-collab-tasks", ctrl.getCollabTasksSummary);
```

**Testing Backend**:

```bash
# Test with Postman or curl
GET http://localhost:8020/api/workmanagement/congviec/summary-other-tasks?nhanVienID=66b1dba74f79822a4752d90d&chuKyDanhGiaID=6900b277f718d71076b9fe31

# Expected response:
{
  "success": true,
  "data": {
    "total": 4,
    "completed": 2,
    "late": 1,
    "active": 1,
    "tasks": [...]
  },
  "message": "Lấy tóm tắt công việc khác thành công"
}
```

---

## STEP 3: FRONTEND - REDUX SLICE & THUNKS

### Option A: Thêm vào existing `congViecSlice.js` (Recommended)

**File**: `src/features/QuanLyCongViec/CongViec/congViecSlice.js`

**Location**: Thêm vào section state và reducers

**Context**: Tham khảo pattern từ `congViecDashboard` trong `kpiSlice.js`

### Code Sample:

```javascript
// ====================================
// STEP 3.1: ADD TO initialState
// ====================================
const initialState = {
  // ... existing state ...

  // ✅ NEW: Summary data for compact cards
  otherTasksSummary: {}, // Keyed by `${nhanVienId}_${chuKyId}`
  collabTasksSummary: {}, // Keyed by `${nhanVienId}_${chuKyId}`
  summaryLoading: false,
  summaryError: null,
};

// ====================================
// STEP 3.2: ADD REDUCERS
// ====================================
const slice = createSlice({
  name: "congViec",
  initialState,
  reducers: {
    // ... existing reducers ...

    // ✅ NEW: Other tasks summary
    fetchOtherTasksSummaryStart(state) {
      state.summaryLoading = true;
      state.summaryError = null;
    },
    fetchOtherTasksSummarySuccess(state, action) {
      const { key, data } = action.payload;
      state.otherTasksSummary[key] = {
        data,
        timestamp: Date.now(),
      };
      state.summaryLoading = false;
    },
    fetchOtherTasksSummaryFailure(state, action) {
      state.summaryError = action.payload;
      state.summaryLoading = false;
    },

    // ✅ NEW: Collab tasks summary
    fetchCollabTasksSummaryStart(state) {
      state.summaryLoading = true;
      state.summaryError = null;
    },
    fetchCollabTasksSummarySuccess(state, action) {
      const { key, data } = action.payload;
      state.collabTasksSummary[key] = {
        data,
        timestamp: Date.now(),
      };
      state.summaryLoading = false;
    },
    fetchCollabTasksSummaryFailure(state, action) {
      state.summaryError = action.payload;
      state.summaryLoading = false;
    },
  },
});

// ====================================
// STEP 3.3: EXPORT THUNKS
// ====================================

/**
 * Fetch summary of "other" tasks (FlagNVTQKhac=true)
 * @param {Object} params - {nhanVienId, chuKyId}
 */
export const fetchOtherTasksSummary =
  ({ nhanVienId, chuKyId }) =>
  async (dispatch, getState) => {
    // STEP 3.3.1: Check cache (optional - skip if want fresh data every time)
    const key = `${nhanVienId}_${chuKyId}`;
    const cached = getState().congViec.otherTasksSummary[key];
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log("[fetchOtherTasksSummary] Using cached data");
      return cached.data;
    }

    // STEP 3.3.2: Dispatch start action
    dispatch(slice.actions.fetchOtherTasksSummaryStart());

    try {
      // STEP 3.3.3: API call
      const response = await apiService.get(
        "/workmanagement/congviec/summary-other-tasks",
        {
          params: { nhanVienID: nhanVienId, chuKyDanhGiaID: chuKyId },
        }
      );

      const data = response.data.data;

      // STEP 3.3.4: Dispatch success
      dispatch(slice.actions.fetchOtherTasksSummarySuccess({ key, data }));

      return data;
    } catch (error) {
      // STEP 3.3.5: Dispatch failure (NO toast, silent error for compact card)
      const message = error.message || "Không thể tải dữ liệu công việc khác";
      dispatch(slice.actions.fetchOtherTasksSummaryFailure(message));
      throw error;
    }
  };

/**
 * Fetch summary of collaboration tasks (VaiTro=PHOI_HOP)
 * @param {Object} params - {nhanVienId, chuKyId}
 */
export const fetchCollabTasksSummary =
  ({ nhanVienId, chuKyId }) =>
  async (dispatch, getState) => {
    // Same pattern as fetchOtherTasksSummary
    const key = `${nhanVienId}_${chuKyId}`;
    const cached = getState().congViec.collabTasksSummary[key];
    const CACHE_TTL = 5 * 60 * 1000;

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log("[fetchCollabTasksSummary] Using cached data");
      return cached.data;
    }

    dispatch(slice.actions.fetchCollabTasksSummaryStart());

    try {
      const response = await apiService.get(
        "/workmanagement/congviec/summary-collab-tasks",
        {
          params: { nhanVienID: nhanVienId, chuKyDanhGiaID: chuKyId },
        }
      );

      const data = response.data.data;
      dispatch(slice.actions.fetchCollabTasksSummarySuccess({ key, data }));

      return data;
    } catch (error) {
      const message =
        error.message || "Không thể tải dữ liệu công việc phối hợp";
      dispatch(slice.actions.fetchCollabTasksSummaryFailure(message));
      throw error;
    }
  };

// ✅ Export actions
export const congViecActions = slice.actions;
```

**Alternative: Option B - Create separate slice** (if congViecSlice.js too large):

Create new file: `src/features/QuanLyCongViec/CongViec/congViecSummarySlice.js` with same pattern above.

---

## STEP 4: FRONTEND - COMPACT CARD COMPONENT

### File: `src/features/QuanLyCongViec/KPI/v2/components/CongViecCompactCard.js` (NEW)

**Context**:

- Reference: `CongViecDashboard.js` for loading/error patterns
- Reference: `TaskListMini.js` for compact table structure
- Reference: `OverviewCards.js` for stat display

### Full Component Code:

```javascript
import React, { useState, useEffect } from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  Collapse,
  Divider,
  Stack,
  Avatar,
  Typography,
  Chip,
  IconButton,
  Grid,
  Box,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Visibility as VisibilityIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  PlayArrow as PlayArrowIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import dayjs from "dayjs";
import { getStatusText as getStatusLabel } from "../../../../utils/congViecUtils";

/**
 * Compact collapsible card for displaying task summary
 * @param {String} title - Card title (e.g., "Công việc khác")
 * @param {String} icon - Emoji icon (e.g., "📦")
 * @param {String} color - Theme color key (e.g., "warning.main")
 * @param {Number} total - Total task count
 * @param {Number} completed - Completed task count
 * @param {Number} late - Late task count
 * @param {Number} active - Active task count
 * @param {Array} tasks - Task list array
 * @param {Function} onViewTask - Callback when clicking view button
 * @param {Boolean} isLoading - Loading state
 * @param {String} error - Error message
 * @param {Boolean} showNguoiChinh - Show "Người chính" column (for collab tasks)
 */
const CongViecCompactCard = ({
  title,
  icon,
  color = "primary.main",
  total = 0,
  completed = 0,
  late = 0,
  active = 0,
  tasks = [],
  onViewTask,
  isLoading = false,
  error = null,
  showNguoiChinh = false, // For collaboration tasks
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const formatDate = (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "—");

  // Auto-collapse when no data
  useEffect(() => {
    if (total === 0) {
      setExpanded(false);
    }
  }, [total]);

  return (
    <Card
      sx={{
        mb: 2,
        border: expanded ? 2 : 1,
        borderColor: expanded ? color : "divider",
        transition: "all 0.3s ease",
      }}
    >
      {/* ========== COLLAPSED HEADER ========== */}
      <CardActionArea
        onClick={() => !isLoading && setExpanded(!expanded)}
        sx={{
          p: 2,
          "&:hover": {
            bgcolor: "action.hover",
          },
        }}
        disabled={isLoading}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          {/* Icon Avatar */}
          <Avatar
            sx={{
              bgcolor: color,
              width: 40,
              height: 40,
            }}
          >
            {icon}
          </Avatar>

          {/* Title */}
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontWeight: 600,
            }}
          >
            {title}
          </Typography>

          {/* Summary Badges */}
          {!isLoading && (
            <>
              <Chip
                label={total}
                size="small"
                variant="outlined"
                icon={<WorkIcon fontSize="small" />}
                sx={{ fontWeight: 600 }}
              />
              {completed > 0 && (
                <Chip
                  label={completed}
                  size="small"
                  color="success"
                  icon={<CheckCircleIcon fontSize="small" />}
                />
              )}
              {late > 0 && (
                <Chip
                  label={late}
                  size="small"
                  color="error"
                  icon={<WarningIcon fontSize="small" />}
                />
              )}
              {active > 0 && (
                <Chip
                  label={active}
                  size="small"
                  color="info"
                  icon={<PlayArrowIcon fontSize="small" />}
                />
              )}
            </>
          )}

          {/* Loading indicator */}
          {isLoading && <CircularProgress size={24} />}

          {/* Expand Icon */}
          <IconButton size="small" sx={{ pointerEvents: "none" }}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Stack>
      </CardActionArea>

      {/* ========== EXPANDED CONTENT ========== */}
      <Collapse in={expanded} timeout={300}>
        <Divider />
        <CardContent>
          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Empty State */}
          {!isLoading && !error && total === 0 && (
            <Box textAlign="center" py={3}>
              <Typography variant="body2" color="text.secondary">
                Không có công việc nào
              </Typography>
            </Box>
          )}

          {/* Has Data */}
          {!isLoading && !error && total > 0 && (
            <>
              {/* Mini Metrics Grid */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {total}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tổng
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box textAlign="center">
                    <Typography
                      variant="h4"
                      color="success.main"
                      sx={{ fontWeight: 700 }}
                    >
                      {completed}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Hoàn thành
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box textAlign="center">
                    <Typography
                      variant="h4"
                      color="error.main"
                      sx={{ fontWeight: 700 }}
                    >
                      {late}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Trễ hạn
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box textAlign="center">
                    <Typography
                      variant="h4"
                      color="info.main"
                      sx={{ fontWeight: 700 }}
                    >
                      {active}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Đang làm
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Compact Task Table */}
              <TableContainer sx={{ maxHeight: 300 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell width={100}>Mã</TableCell>
                      <TableCell>Tiêu đề</TableCell>
                      {showNguoiChinh && (
                        <TableCell width={150}>Người chính</TableCell>
                      )}
                      <TableCell width={120}>Trạng thái</TableCell>
                      <TableCell width={100}>Hạn chót</TableCell>
                      <TableCell width={80} align="center">
                        Giờ trễ
                      </TableCell>
                      <TableCell width={60} align="center">
                        Chi tiết
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tasks.slice(0, 50).map((task) => (
                      <TableRow key={task._id} hover>
                        <TableCell>
                          <Typography variant="caption" fontWeight={600}>
                            {task.MaCongViec || "—"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{ maxWidth: 300 }}
                          >
                            {task.TieuDe}
                          </Typography>
                        </TableCell>
                        {showNguoiChinh && (
                          <TableCell>
                            <Typography variant="caption" noWrap>
                              {task.NguoiChinhProfile?.Ten || "—"}
                            </Typography>
                          </TableCell>
                        )}
                        <TableCell>
                          <Chip
                            label={getStatusLabel(task.TrangThai)}
                            size="small"
                            sx={{ minWidth: 90 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {formatDate(task.NgayHetHan)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {task.SoGioTre > 0 ? (
                            <Typography
                              variant="caption"
                              color="error.main"
                              fontWeight={600}
                            >
                              {task.SoGioTre}h
                            </Typography>
                          ) : (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              —
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewTask?.(task._id);
                            }}
                            color="primary"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Show more indicator */}
              {tasks.length > 50 && (
                <Box mt={1} textAlign="center">
                  <Typography variant="caption" color="text.secondary">
                    ... và {tasks.length - 50} công việc khác
                  </Typography>
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default CongViecCompactCard;
```

**Testing Component** (Storybook hoặc standalone test):

```javascript
<CongViecCompactCard
  title="Công việc khác"
  icon="📦"
  color="warning.main"
  total={4}
  completed={2}
  late={1}
  active={1}
  tasks={mockTasks}
  onViewTask={(id) => console.log("View task:", id)}
  isLoading={false}
  error={null}
  showNguoiChinh={false}
/>
```

---

## STEP 5: FRONTEND - INTEGRATE INTO KPI PAGE

### File: `src/features/QuanLyCongViec/KPI/v2/ChamDiemKPIPage.js` (or equivalent)

**Location**: Tìm nơi render `<ChamDiemKPITable>`, thêm 2 cards ngay sau đó

**Context**:

- Reference: How `ChamDiemKPITable` is used (props: nhanVienId, chuKyId, etc.)
- Import pattern từ existing components
- Use same hooks: `useDispatch`, `useSelector`, `useEffect`

### Code Sample:

```javascript
// ====================================
// STEP 5.1: ADD IMPORTS
// ====================================
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOtherTasksSummary,
  fetchCollabTasksSummary,
} from "../CongViec/congViecSlice"; // Adjust path if needed
import CongViecCompactCard from "./components/CongViecCompactCard";
import { useState } from "react";

// Inside component function:
function ChamDiemKPIPage() {
  const dispatch = useDispatch();

  // ====================================
  // STEP 5.2: GET STATE FROM REDUX
  // ====================================
  const {
    otherTasksSummary,
    collabTasksSummary,
    summaryLoading,
    summaryError,
  } = useSelector((state) => state.congViec);

  // Get current employee and cycle IDs (adjust based on your state structure)
  const currentNhanVienId = useSelector(
    (state) => state.kpi.selectedEmployee?._id || state.auth.user?.NhanVienID
  );
  const currentChuKyId = useSelector((state) => state.kpi.selectedCycle?._id);

  // ====================================
  // STEP 5.3: FETCH DATA ON MOUNT
  // ====================================
  useEffect(() => {
    if (currentNhanVienId && currentChuKyId) {
      // Fetch both summaries in parallel
      dispatch(
        fetchOtherTasksSummary({
          nhanVienId: currentNhanVienId,
          chuKyId: currentChuKyId,
        })
      );

      dispatch(
        fetchCollabTasksSummary({
          nhanVienId: currentNhanVienId,
          chuKyId: currentChuKyId,
        })
      );
    }
  }, [currentNhanVienId, currentChuKyId, dispatch]);

  // ====================================
  // STEP 5.4: GET DATA FOR CARDS
  // ====================================
  const otherTasksKey = `${currentNhanVienId}_${currentChuKyId}`;
  const collabTasksKey = `${currentNhanVienId}_${currentChuKyId}`;

  const otherTasksData = otherTasksSummary[otherTasksKey]?.data || {
    total: 0,
    completed: 0,
    late: 0,
    active: 0,
    tasks: [],
  };

  const collabTasksData = collabTasksSummary[collabTasksKey]?.data || {
    total: 0,
    completed: 0,
    late: 0,
    active: 0,
    tasks: [],
  };

  // ====================================
  // STEP 5.5: HANDLER FOR VIEW TASK
  // ====================================
  const handleViewTask = (taskId) => {
    // TODO: Open CongViecDetailDialog
    // Option 1: Dispatch action to open dialog
    // Option 2: Navigate to detail page
    console.log("View task:", taskId);

    // Example: Use existing detail dialog
    // dispatch(openCongViecDetail(taskId));
  };

  // ====================================
  // STEP 5.6: RENDER CARDS IN JSX
  // ====================================
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Page header */}
      <Typography variant="h4" gutterBottom>
        Đánh giá KPI
      </Typography>

      {/* ✅ EXISTING: KPI Table */}
      <Paper sx={{ mb: 3 }}>
        <ChamDiemKPITable
          nhanVienId={currentNhanVienId}
          chuKyId={currentChuKyId}
          // ... other props
        />
      </Paper>

      {/* ✅ NEW: Compact Card 1 - Công việc khác */}
      <CongViecCompactCard
        title="Công việc khác"
        icon="📦"
        color="warning.main"
        total={otherTasksData.total}
        completed={otherTasksData.completed}
        late={otherTasksData.late}
        active={otherTasksData.active}
        tasks={otherTasksData.tasks}
        onViewTask={handleViewTask}
        isLoading={summaryLoading}
        error={summaryError}
        showNguoiChinh={false}
      />

      {/* ✅ NEW: Compact Card 2 - Công việc phối hợp */}
      <CongViecCompactCard
        title="Công việc phối hợp"
        icon="🤝"
        color="info.main"
        total={collabTasksData.total}
        completed={collabTasksData.completed}
        late={collabTasksData.late}
        active={collabTasksData.active}
        tasks={collabTasksData.tasks}
        onViewTask={handleViewTask}
        isLoading={summaryLoading}
        error={summaryError}
        showNguoiChinh={true} // ✅ Show "Người chính" column
      />

      {/* Action buttons */}
      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button variant="contained">Lưu đánh giá</Button>
        <Button variant="outlined">Gửi duyệt</Button>
      </Stack>
    </Container>
  );
}
```

**Alternative Integration** (if page structure different):

- If using tabs: Add cards in tab content
- If using separate route: Create new route `/kpi/cham-diem/:id/cong-viec-khac`
- If using modal: Open cards in modal on button click

---

## STEP 6: TESTING & POLISH

### 6.1 Create Test Data in MongoDB

**MongoDB Script**:

```javascript
// Connect to MongoDB
use giaoban_bvt

// Insert "Other" tasks (FlagNVTQKhac=true)
db.congviec.insertMany([
  {
    MaCongViec: "CVTEST001",
    TieuDe: "Hỗ trợ khẩn cấp phòng IT",
    NguoiChinhID: ObjectId("66b1dba74f79822a4752d90d"),
    NguoiThamGia: [
      { NhanVienID: ObjectId("66b1dba74f79822a4752d90d"), VaiTro: "CHINH" }
    ],
    FlagNVTQKhac: true,  // ✅ Flag "Khác"
    NhiemVuThuongQuyID: null,
    TrangThai: "DANG_THUC_HIEN",
    NgayBatDau: new Date("2025-11-01"),
    NgayHetHan: new Date("2025-11-20"),
    SoGioTre: 0,
    HoanThanhTreHan: false,
    createdAt: new Date("2025-11-05"),
    isDeleted: false,
  },
  {
    MaCongViec: "CVTEST002",
    TieuDe: "Meeting đột xuất với giám đốc",
    NguoiChinhID: ObjectId("66b1dba74f79822a4752d90d"),
    NguoiThamGia: [
      { NhanVienID: ObjectId("66b1dba74f79822a4752d90d"), VaiTro: "CHINH" }
    ],
    FlagNVTQKhac: true,
    NhiemVuThuongQuyID: null,
    TrangThai: "HOAN_THANH",
    NgayBatDau: new Date("2025-11-03"),
    NgayHetHan: new Date("2025-11-18"),
    NgayHoanThanh: new Date("2025-11-17"),
    SoGioTre: 0,
    HoanThanhTreHan: false,
    createdAt: new Date("2025-11-03"),
    isDeleted: false,
  },
  {
    MaCongViec: "CVTEST003",
    TieuDe: "Xử lý sự cố hệ thống",
    NguoiChinhID: ObjectId("66b1dba74f79822a4752d90d"),
    NguoiThamGia: [
      { NhanVienID: ObjectId("66b1dba74f79822a4752d90d"), VaiTro: "CHINH" }
    ],
    FlagNVTQKhac: true,
    NhiemVuThuongQuyID: null,
    TrangThai: "HOAN_THANH",
    NgayBatDau: new Date("2025-11-10"),
    NgayHetHan: new Date("2025-11-15"),
    NgayHoanThanh: new Date("2025-11-17"),  // Late!
    SoGioTre: 12,  // 12 hours late
    HoanThanhTreHan: true,
    createdAt: new Date("2025-11-10"),
    isDeleted: false,
  }
]);

// Insert "Collaboration" tasks (VaiTro=PHOI_HOP)
db.congviec.insertMany([
  {
    MaCongViec: "CVTEST101",
    TieuDe: "Họp stakeholder dự án X",
    NguoiChinhID: ObjectId("OTHER_EMPLOYEE_ID"),  // Someone else is primary
    NguoiThamGia: [
      { NhanVienID: ObjectId("OTHER_EMPLOYEE_ID"), VaiTro: "CHINH" },
      { NhanVienID: ObjectId("66b1dba74f79822a4752d90d"), VaiTro: "PHOI_HOP" }  // ✅ Our employee collaborates
    ],
    NhiemVuThuongQuyID: ObjectId("SOME_NVTQ_ID"),
    FlagNVTQKhac: false,
    TrangThai: "DANG_THUC_HIEN",
    NgayBatDau: new Date("2025-11-08"),
    NgayHetHan: new Date("2025-11-22"),
    SoGioTre: 0,
    HoanThanhTreHan: false,
    createdAt: new Date("2025-11-08"),
    isDeleted: false,
  },
  {
    MaCongViec: "CVTEST102",
    TieuDe: "Review tài liệu kỹ thuật",
    NguoiChinhID: ObjectId("OTHER_EMPLOYEE_ID2"),
    NguoiThamGia: [
      { NhanVienID: ObjectId("OTHER_EMPLOYEE_ID2"), VaiTro: "CHINH" },
      { NhanVienID: ObjectId("66b1dba74f79822a4752d90d"), VaiTro: "PHOI_HOP" }
    ],
    NhiemVuThuongQuyID: ObjectId("ANOTHER_NVTQ_ID"),
    FlagNVTQKhac: false,
    TrangThai: "HOAN_THANH",
    NgayBatDau: new Date("2025-11-12"),
    NgayHetHan: new Date("2025-11-17"),
    NgayHoanThanh: new Date("2025-11-16"),
    SoGioTre: 0,
    HoanThanhTreHan: false,
    createdAt: new Date("2025-11-12"),
    isDeleted: false,
  }
]);

// Verify data
db.congviec.find({ FlagNVTQKhac: true }).count()  // Should be 3
db.congviec.find({ "NguoiThamGia.VaiTro": "PHOI_HOP" }).count()  // Should be 2+
```

### 6.2 Manual Testing Checklist

**Backend Tests**:

```bash
# Test 1: Other tasks API
curl "http://localhost:8020/api/workmanagement/congviec/summary-other-tasks?nhanVienID=66b1dba74f79822a4752d90d&chuKyDanhGiaID=6900b277f718d71076b9fe31"

# Expected:
# {
#   "success": true,
#   "data": {
#     "total": 3,
#     "completed": 2,
#     "late": 1,
#     "active": 1,
#     "tasks": [...]
#   }
# }

# Test 2: Collab tasks API
curl "http://localhost:8020/api/workmanagement/congviec/summary-collab-tasks?nhanVienID=66b1dba74f79822a4752d90d&chuKyDanhGiaID=6900b277f718d71076b9fe31"

# Expected:
# {
#   "success": true,
#   "data": {
#     "total": 2,
#     "completed": 1,
#     "late": 0,
#     "active": 1,
#     "tasks": [...]
#   }
# }
```

**Frontend Tests**:

1. **Collapsed State** (Default):

   - [ ] Card hiển thị 1 dòng với icon + title + 4 badges
   - [ ] Badges show correct counts: Total, Completed (green), Late (red), Active (blue)
   - [ ] Hover effect works (background highlight)
   - [ ] Click anywhere on card → expands

2. **Expanded State**:

   - [ ] Smooth 300ms transition animation
   - [ ] Border color changes to match theme color
   - [ ] 4-column metrics grid displays correctly
   - [ ] Table shows up to 50 tasks
   - [ ] Table columns: Mã, Tiêu đề, [Người chính], Trạng thái, Hạn, Giờ trễ, Chi tiết
   - [ ] "Người chính" column only visible for collaboration card
   - [ ] Click 👁️ icon → calls `onViewTask(taskId)`
   - [ ] Scroll works if >10 tasks

3. **Loading State**:

   - [ ] Spinner shows in header when `isLoading=true`
   - [ ] Card is not clickable during loading

4. **Error State**:

   - [ ] Red Alert shows error message when expanded
   - [ ] Card remains functional (can collapse)

5. **Empty State**:

   - [ ] Shows "Không có công việc nào" when total=0
   - [ ] Card auto-collapses when data becomes empty

6. **Responsive**:
   - [ ] Mobile: Cards stack vertically, table scrolls horizontally
   - [ ] Tablet: Metrics grid 2x2 instead of 4 columns
   - [ ] Desktop: Full width, optimal spacing

### 6.3 Performance Testing

```javascript
// Check Redux DevTools for:
// 1. Action sequence (should be: Start → Success/Failure)
// 2. State updates (otherTasksSummary, collabTasksSummary)
// 3. No infinite loops
// 4. Cache working (TTL 5 minutes)

// Network tab:
// - API calls only on mount (not on every render)
// - Response time < 500ms for summary APIs
// - No duplicate requests

// React DevTools Profiler:
// - Collapse/expand transition < 300ms
// - No unnecessary re-renders of parent components
```

### 6.4 Edge Cases

- [ ] **No data in cycle**: Both cards show 0 counts, empty state
- [ ] **API error**: Error alert displayed, can retry by refreshing
- [ ] **Very long task title**: Text truncates with ellipsis (noWrap)
- [ ] **50+ tasks**: "... và X công việc khác" indicator shows
- [ ] **Invalid employee/cycle ID**: Backend returns 400, frontend shows error
- [ ] **Concurrent API calls**: Both cards load independently, no race condition
- [ ] **Cache invalidation**: New data after 5 minutes OR manual refresh

### 6.5 Accessibility (A11y)

- [ ] Keyboard navigation: Tab through cards, Enter/Space to expand
- [ ] Screen reader: Announces "expanded" / "collapsed" state
- [ ] ARIA labels: `aria-expanded` on CardActionArea
- [ ] Focus visible: Outline shows on keyboard focus
- [ ] Color contrast: All text passes WCAG AA (4.5:1 ratio)

---

## 🔧 TROUBLESHOOTING

### Issue 1: "Cannot read property 'otherTasksSummary' of undefined"

**Cause**: Redux state not initialized or slice not added to store

**Fix**:

```javascript
// Check store.js
import congViecReducer from "./features/QuanLyCongViec/CongViec/congViecSlice";

const store = configureStore({
  reducer: {
    congViec: congViecReducer, // ✅ Make sure this exists
    // ... other reducers
  },
});
```

### Issue 2: API returns 404 "Route not found"

**Cause**: Route not registered or typo in URL

**Fix**:

```javascript
// Check routes registration order in congViec.api.js
// Specific routes MUST come before parameterized routes

// ✅ CORRECT ORDER:
router.get("/summary-other-tasks", ctrl.getOtherTasksSummary);
router.get("/summary-collab-tasks", ctrl.getCollabTasksSummary);
router.get("/:id", ctrl.getCongViecById); // Parameterized last

// ❌ WRONG ORDER (will match /:id first):
router.get("/:id", ctrl.getCongViecById);
router.get("/summary-other-tasks", ctrl.getOtherTasksSummary); // Never reached!
```

### Issue 3: Cards show stale data after task update

**Cause**: No cache invalidation on task mutations

**Fix Option 1** (Simple): Clear cache after mutations

```javascript
// In task update/create success callback:
dispatch(congViecActions.clearSummaryCache());

// Add to slice reducers:
clearSummaryCache(state) {
  state.otherTasksSummary = {};
  state.collabTasksSummary = {};
}
```

**Fix Option 2** (Better): Add refresh button

```javascript
<IconButton
  size="small"
  onClick={() => dispatch(fetchOtherTasksSummary({...}, {force: true}))}
>
  <RefreshIcon />
</IconButton>
```

### Issue 4: "NguoiThamGia.NhanVienID" query not working

**Cause**: Index missing or wrong syntax

**Fix**:

```javascript
// Check MongoDB index exists:
db.congviec.getIndexes()  // Should have {"NguoiThamGia.NhanVienID": 1}

// If missing, create it:
db.congviec.createIndex({"NguoiThamGia.NhanVienID": 1})

// ✅ CORRECT query syntax:
"NguoiThamGia.NhanVienID": toObjectId(nhanVienID)  // Dot notation for array field

// ❌ WRONG:
"NguoiThamGia": { NhanVienID: toObjectId(nhanVienID) }  // Missing $elemMatch
```

### Issue 5: Compact card not collapsing on empty data

**Cause**: `useEffect` dependency missing

**Fix**:

```javascript
// Add to CongViecCompactCard component:
useEffect(() => {
  if (total === 0 && expanded) {
    setExpanded(false);
  }
}, [total, expanded]); // ✅ Include 'expanded' in deps
```

---

## 📚 REFERENCE PATTERNS

### Similar Implementations in Codebase

1. **Dashboard Loading Pattern**: `CongViecDashboard.js` (line ~45-65)

   - Skeleton loaders
   - Error alerts
   - Empty state messages

2. **Compact Table Pattern**: `TaskListMini.js` (line ~80-150)

   - `size="small"` table
   - Sticky header with `maxHeight`
   - Icon-only action buttons

3. **Redux Thunk Pattern**: `kpiSlice.js` `fetchCongViecDashboard` (line ~1635)

   - Dispatch pending/success/failure
   - Error handling without toast
   - Cache with timestamp

4. **Card Expand Pattern**: MUI `Accordion` in various components

   - `CardActionArea` for clickable header
   - `Collapse` for smooth animation
   - Conditional border highlight

5. **Badge Display Pattern**: `OverviewCards.js` `StatCard` (line ~20-50)
   - Color-coded chips
   - Icon + number format
   - Responsive grid layout

---

## ✅ COMPLETION CHECKLIST

### Backend

- [ ] `getOtherTasksSummary` method added to service
- [ ] `getCollabTasksSummary` method added to service
- [ ] Controller methods created
- [ ] Routes registered in correct order
- [ ] Both APIs tested with Postman/curl
- [ ] Error handling works (400/404 responses)

### Frontend Redux

- [ ] State added to slice: `otherTasksSummary`, `collabTasksSummary`
- [ ] Reducers created: Start/Success/Failure for both
- [ ] Thunks exported: `fetchOtherTasksSummary`, `fetchCollabTasksSummary`
- [ ] Slice added to Redux store
- [ ] Cache mechanism working (5min TTL)

### Frontend Components

- [ ] `CongViecCompactCard.js` component created
- [ ] Component accepts all required props
- [ ] Collapsed state displays correctly
- [ ] Expanded state shows metrics + table
- [ ] Loading/Error/Empty states handled
- [ ] `showNguoiChinh` prop works for collab card

### Integration

- [ ] Cards imported into KPI page
- [ ] Both cards rendered after KPI table
- [ ] `useEffect` fetches data on mount
- [ ] Redux selectors get data correctly
- [ ] `onViewTask` callback implemented
- [ ] No console errors on page load

### Testing

- [ ] Test data created in MongoDB
- [ ] Backend APIs return correct data
- [ ] Frontend displays correct counts
- [ ] Click expand/collapse works
- [ ] View task button works
- [ ] Responsive on mobile/tablet/desktop

### Polish

- [ ] Animations smooth (300ms transition)
- [ ] Colors match theme (warning.main, info.main)
- [ ] Accessibility: Keyboard navigation works
- [ ] Accessibility: ARIA labels present
- [ ] Performance: No unnecessary re-renders
- [ ] Performance: API calls only on mount

---

## 🚀 NEXT STEPS (Future Enhancements)

### Phase 2 (Optional):

1. **Floating Summary Widget** (Right sidebar)

   - Sticky position, always visible on scroll
   - Quick counts without expanding cards
   - Estimate: +2 hours

2. **Full Dashboard View** (Modal or separate page)

   - Same 5 aggregations as main dashboard
   - Charts and detailed metrics
   - Estimate: +4 hours

3. **Export to Excel** (for "Khác" and "Phối hợp")

   - Generate Excel with task list
   - Filter/sort options
   - Estimate: +2 hours

4. **Real-time Updates** (WebSocket)

   - Auto-refresh when tasks updated
   - Badge animation on new data
   - Estimate: +6 hours

5. **Advanced Filters** (In expanded card)
   - Filter by status, priority, date range
   - Search by title
   - Estimate: +3 hours

---

## 📞 SUPPORT & RESOURCES

### Documentation References

- MUI Collapse: https://mui.com/material-ui/react-collapse/
- MUI Card: https://mui.com/material-ui/react-card/
- Redux Toolkit: https://redux-toolkit.js.org/tutorials/quick-start
- MongoDB Aggregation: https://www.mongodb.com/docs/manual/aggregation/

### Code Review Checklist

- [ ] Code follows project conventions (naming, structure)
- [ ] No hardcoded values (use constants/config)
- [ ] Error messages in Vietnamese
- [ ] Comments for complex logic
- [ ] No console.logs in production code
- [ ] PropTypes or TypeScript types defined

### Deployment Notes

- Restart backend after service/controller/route changes
- Clear browser cache after frontend changes
- Run migrations if schema changed
- Update API documentation (Swagger/Postman)
- Monitor API response times in production

---

**END OF IMPLEMENTATION GUIDE**

For questions or issues during implementation, reference specific section numbers in this document.
