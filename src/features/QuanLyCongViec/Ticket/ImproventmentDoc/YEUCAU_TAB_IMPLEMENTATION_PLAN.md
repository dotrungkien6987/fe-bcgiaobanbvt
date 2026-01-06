# IMPLEMENTATION PLAN: Tab Yêu Cầu trong KPI Evaluation

**Ngày tạo:** 2025-12-30  
**Timeline:** 5 ngày  
**Scope:** Add "Yêu cầu" tab to KPI evaluation dialog với lazy loading

---

## 🎯 CONFIRMED REQUIREMENTS

✅ **Clone pattern từ CongViec tab**  
✅ **Lazy load đơn giản** (không prefetch phức tạp)  
✅ **Trung bình 10 NVTQ** per table, không giới hạn max rows  
❌ **Skip Response Time metrics** (Card 7 để trống)  
✅ **Section "Yêu cầu khác"** với compact card

---

## 📅 DAY 1: Backend Foundation (3-4 hours)

### Task 1.1: Add Compound Index (15 mins)

**File:** `giaobanbv-be/modules/workmanagement/models/YeuCau.js`

**Location:** After line 265 (existing indexes)

```javascript
// EXISTING (line 255-265):
yeuCauSchema.index({ KhoaDichID: 1, TrangThai: 1 });
yeuCauSchema.index({ NguoiYeuCauID: 1, TrangThai: 1 });
yeuCauSchema.index({ NguoiXuLyID: 1, TrangThai: 1 });
yeuCauSchema.index({ createdAt: -1 });
yeuCauSchema.index({ TrangThai: 1, NgayHoanThanh: 1 });

// ADD:
yeuCauSchema.index({
  NhiemVuThuongQuyID: 1,
  NguoiXuLyID: 1,
  createdAt: -1,
});
```

**Test:**

```powershell
# Restart backend, check MongoDB
db.yeucaus.getIndexes()
```

---

### Task 1.2: API #1 - Counts by NhiemVu (1 hour)

**File:** `giaobanbv-be/modules/workmanagement/services/yeuCau.service.js`

**Add method:**

```javascript
/**
 * Get counts of YeuCau grouped by NhiemVuThuongQuyID
 * @param {Array<String>} nhiemVuThuongQuyIDs
 * @param {String} nhanVienID
 * @param {String} chuKyDanhGiaID
 * @returns {Object} { "nvtq_id1": 12, "nvtq_id2": 8, ... }
 */
service.getCountsByNhiemVu = async ({
  nhiemVuThuongQuyIDs,
  nhanVienID,
  chuKyDanhGiaID,
}) => {
  // 1. Get ChuKyDanhGia time range
  const chuKy = await ChuKyDanhGia.findById(chuKyDanhGiaID);
  if (!chuKy)
    throw new AppError(404, "Chu kỳ đánh giá không tồn tại", "NOT_FOUND");

  // 2. Build match filter
  const matchFilter = {
    NguoiXuLyID: new mongoose.Types.ObjectId(nhanVienID),
    createdAt: {
      $gte: chuKy.NgayBatDau,
      $lte: chuKy.NgayKetThuc,
    },
    NhiemVuThuongQuyID: {
      $in: nhiemVuThuongQuyIDs.map((id) => new mongoose.Types.ObjectId(id)),
    },
  };

  // 3. Aggregate counts
  const result = await YeuCau.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: "$NhiemVuThuongQuyID",
        count: { $sum: 1 },
      },
    },
  ]);

  // 4. Format response as { nvtqID: count }
  const countsMap = {};
  nhiemVuThuongQuyIDs.forEach((id) => {
    countsMap[id] = 0; // Initialize all to 0
  });
  result.forEach((item) => {
    countsMap[item._id.toString()] = item.count;
  });

  return countsMap;
};
```

**File:** `giaobanbv-be/modules/workmanagement/controllers/yeuCau.controller.js`

**Add controller:**

```javascript
/**
 * GET /api/workmanagement/yeucau/counts-by-nhiemvu
 * Query: nhiemVuThuongQuyIDs (comma-separated), nhanVienID, chuKyDanhGiaID
 */
controller.getCountsByNhiemVu = catchAsync(async (req, res, next) => {
  const { nhiemVuThuongQuyIDs, nhanVienID, chuKyDanhGiaID } = req.query;

  if (!nhiemVuThuongQuyIDs || !nhanVienID || !chuKyDanhGiaID) {
    throw new AppError(400, "Thiếu tham số bắt buộc", "MISSING_PARAMS");
  }

  const nhiemVuIDs = nhiemVuThuongQuyIDs.split(",").map((id) => id.trim());

  const counts = await yeuCauService.getCountsByNhiemVu({
    nhiemVuThuongQuyIDs: nhiemVuIDs,
    nhanVienID,
    chuKyDanhGiaID,
  });

  return sendResponse(
    res,
    200,
    true,
    counts,
    null,
    "Lấy số lượng yêu cầu thành công"
  );
});
```

**File:** `giaobanbv-be/modules/workmanagement/routes/yeuCau.route.js`

**Add route:**

```javascript
// After existing dashboard routes (around line 30-40)
router.get("/counts-by-nhiemvu", yeuCauController.getCountsByNhiemVu);
```

**Test:**

```
GET http://localhost:8020/api/workmanagement/yeucau/counts-by-nhiemvu
  ?nhiemVuThuongQuyIDs=id1,id2,id3
  &nhanVienID=xxx
  &chuKyDanhGiaID=yyy
```

---

### Task 1.3: API #2 - Dashboard by NhiemVu (1.5 hours)

**File:** `giaobanbv-be/modules/workmanagement/services/yeuCau.service.js`

**Add method (clone từ congViec pattern):**

```javascript
/**
 * Get dashboard data for YeuCau by NhiemVuThuongQuy
 */
service.getDashboardByNhiemVu = async ({
  nhiemVuThuongQuyID,
  nhanVienID,
  chuKyDanhGiaID,
}) => {
  // 1. Get time range
  const chuKy = await ChuKyDanhGia.findById(chuKyDanhGiaID);
  if (!chuKy)
    throw new AppError(404, "Chu kỳ đánh giá không tồn tại", "NOT_FOUND");

  // 2. Base filter
  const baseFilter = {
    NguoiXuLyID: new mongoose.Types.ObjectId(nhanVienID),
    NhiemVuThuongQuyID: new mongoose.Types.ObjectId(nhiemVuThuongQuyID),
    createdAt: {
      $gte: chuKy.NgayBatDau,
      $lte: chuKy.NgayKetThuc,
    },
  };

  // 3. Summary aggregation
  const summaryPipeline = [
    { $match: baseFilter },
    {
      $facet: {
        total: [{ $count: "count" }],
        completed: [
          { $match: { TrangThai: "DA_HOAN_THANH" } },
          { $count: "count" },
        ],
        late: [
          { $match: { NgayHoanThanh: { $gt: "$HanXuLy" } } },
          { $count: "count" },
        ],
        active: [{ $match: { TrangThai: "DANG_XU_LY" } }, { $count: "count" }],
        overdue: [
          {
            $match: {
              TrangThai: { $nin: ["DA_HOAN_THANH", "DA_DONG", "TU_CHOI"] },
              HanXuLy: { $lt: new Date() },
            },
          },
          { $count: "count" },
        ],
      },
    },
  ];

  const [summaryResult] = await YeuCau.aggregate(summaryPipeline);

  const total = summaryResult.total[0]?.count || 0;
  const completed = summaryResult.completed[0]?.count || 0;
  const late = summaryResult.late[0]?.count || 0;
  const active = summaryResult.active[0]?.count || 0;
  const overdue = summaryResult.overdue[0]?.count || 0;

  const summary = {
    total,
    completed,
    completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : "0.0",
    late,
    lateRate: completed > 0 ? ((late / completed) * 100).toFixed(1) : "0.0",
    active,
    overdue,
  };

  // 4. Status distribution
  const statusDistribution = await YeuCau.aggregate([
    { $match: baseFilter },
    {
      $group: {
        _id: "$TrangThai",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        status: "$_id",
        count: 1,
        percentage: {
          $multiply: [{ $divide: ["$count", total || 1] }, 100],
        },
      },
    },
  ]);

  // 5. Priority distribution
  const priorityDistribution = await YeuCau.aggregate([
    { $match: baseFilter },
    {
      $group: {
        _id: "$MucDoUuTien",
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ["$TrangThai", "DA_HOAN_THANH"] }, 1, 0] },
        },
        late: {
          $sum: {
            $cond: [{ $gt: ["$NgayHoanThanh", "$HanXuLy"] }, 1, 0],
          },
        },
      },
    },
    {
      $project: {
        priority: "$_id",
        total: 1,
        completed: 1,
        late: 1,
      },
    },
  ]);

  // 6. Rating aggregation
  const ratingPipeline = [
    {
      $match: {
        ...baseFilter,
        "DanhGia.SoSao": { $exists: true, $ne: null },
      },
    },
    {
      $facet: {
        avgScore: [{ $group: { _id: null, avg: { $avg: "$DanhGia.SoSao" } } }],
        distribution: [
          {
            $group: {
              _id: "$DanhGia.SoSao",
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: -1 } }, // 5 sao -> 1 sao
        ],
      },
    },
  ];

  const [ratingResult] = await YeuCau.aggregate(ratingPipeline);

  const avgScore = ratingResult.avgScore[0]?.avg || 0;
  const ratingDistribution = ratingResult.distribution.map((item) => ({
    stars: item._id,
    count: item.count,
  }));
  const totalRatings = ratingDistribution.reduce(
    (sum, item) => sum + item.count,
    0
  );

  // 7. YeuCau list (max 50)
  const yeuCauList = await YeuCau.find(baseFilter)
    .populate("NguoiYeuCauID", "HoTen Email")
    .populate("KhoaTaoID", "TenKhoa")
    .populate("DanhMucID", "TenDanhMuc")
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return {
    summary,
    statusDistribution,
    priorityDistribution,
    rating: {
      avgScore: avgScore.toFixed(1),
      distribution: ratingDistribution,
      totalRatings,
    },
    yeuCauList,
  };
};
```

**File:** `giaobanbv-be/modules/workmanagement/controllers/yeuCau.controller.js`

**Add controller:**

```javascript
/**
 * GET /api/workmanagement/yeucau/dashboard-by-nhiemvu
 */
controller.getDashboardByNhiemVu = catchAsync(async (req, res, next) => {
  const { nhiemVuThuongQuyID, nhanVienID, chuKyDanhGiaID } = req.query;

  if (!nhiemVuThuongQuyID || !nhanVienID || !chuKyDanhGiaID) {
    throw new AppError(400, "Thiếu tham số bắt buộc", "MISSING_PARAMS");
  }

  const dashboardData = await yeuCauService.getDashboardByNhiemVu({
    nhiemVuThuongQuyID,
    nhanVienID,
    chuKyDanhGiaID,
  });

  return sendResponse(
    res,
    200,
    true,
    dashboardData,
    null,
    "Lấy dashboard yêu cầu thành công"
  );
});
```

**File:** `giaobanbv-be/modules/workmanagement/routes/yeuCau.route.js`

**Add route:**

```javascript
router.get("/dashboard-by-nhiemvu", yeuCauController.getDashboardByNhiemVu);
```

**Test:**

```
GET http://localhost:8020/api/workmanagement/yeucau/dashboard-by-nhiemvu
  ?nhiemVuThuongQuyID=xxx
  &nhanVienID=yyy
  &chuKyDanhGiaID=zzz
```

---

### Task 1.4: API #3 - Other YeuCau Summary (30 mins)

**File:** `giaobanbv-be/modules/workmanagement/services/yeuCau.service.js`

**Add method:**

```javascript
/**
 * Get dashboard for YeuCau không thuộc NhiemVuThuongQuy
 * (NhiemVuThuongQuyID = null)
 */
service.getOtherYeuCauSummary = async ({ nhanVienID, chuKyDanhGiaID }) => {
  const chuKy = await ChuKyDanhGia.findById(chuKyDanhGiaID);
  if (!chuKy)
    throw new AppError(404, "Chu kỳ đánh giá không tồn tại", "NOT_FOUND");

  const baseFilter = {
    NguoiXuLyID: new mongoose.Types.ObjectId(nhanVienID),
    NhiemVuThuongQuyID: null, // ← Key difference
    createdAt: {
      $gte: chuKy.NgayBatDau,
      $lte: chuKy.NgayKetThuc,
    },
  };

  // Reuse same aggregation logic as getDashboardByNhiemVu
  // (Copy-paste pipeline code or extract to shared helper)

  // ... (same aggregation as Task 1.3)

  return {
    summary,
    statusDistribution,
    priorityDistribution,
    rating,
    yeuCauList,
  };
};
```

**File:** `giaobanbv-be/modules/workmanagement/controllers/yeuCau.controller.js`

```javascript
controller.getOtherYeuCauSummary = catchAsync(async (req, res, next) => {
  const { nhanVienID, chuKyDanhGiaID } = req.query;

  if (!nhanVienID || !chuKyDanhGiaID) {
    throw new AppError(400, "Thiếu tham số bắt buộc", "MISSING_PARAMS");
  }

  const data = await yeuCauService.getOtherYeuCauSummary({
    nhanVienID,
    chuKyDanhGiaID,
  });

  return sendResponse(res, 200, true, data, null, "Thành công");
});
```

**File:** `giaobanbv-be/modules/workmanagement/routes/yeuCau.route.js`

```javascript
router.get("/other-summary", yeuCauController.getOtherYeuCauSummary);
```

---

### ✅ Day 1 Checklist

- [ ] Index added & verified in MongoDB
- [ ] Counts API working với 10 NVTQ IDs
- [ ] Dashboard API returns correct structure
- [ ] Other summary API working
- [ ] All 3 APIs tested with Postman/Thunder Client

---

## 📅 DAY 2: Redux Integration (2-3 hours)

### Task 2.1: Update yeuCauSlice State (30 mins)

**File:** `fe-bcgiaobanbvt/src/features/QuanLyCongViec/Ticket/yeuCauSlice.js`

**Location:** Update initialState (after line 42)

```javascript
const initialState = {
  isLoading: false,
  error: null,

  // EXISTING...
  yeuCauList: [],
  totalItems: 0,
  yeuCauDetail: null,

  // ADD NEW for KPI tab:
  yeuCauCounts: {}, // { "chuky_nhanvien": { "nvtq_id1": 12, ... } }
  yeuCauDashboard: {}, // { "nvtq_chuky": { data, isLoading, error } }
  otherYeuCauSummary: {}, // { "nhanvien_chuky": { data, isLoading, error } }

  // EXISTING...
  dashboardMetrics: null,
  // ... rest
};
```

---

### Task 2.2: Add Reducers (30 mins)

**File:** Same file, add reducers in `createSlice` section

```javascript
const slice = createSlice({
  name: "yeuCau",
  initialState,
  reducers: {
    // EXISTING reducers...
    startLoading(state) { ... },
    hasError(state, action) { ... },

    // NEW: Counts
    fetchYeuCauCountsPending(state, action) {
      const { chuKyDanhGiaID, nhanVienID } = action.payload;
      const key = `${chuKyDanhGiaID}_${nhanVienID}`;
      state.yeuCauCounts[key] = { isLoading: true, error: null };
    },

    fetchYeuCauCountsSuccess(state, action) {
      const { chuKyDanhGiaID, nhanVienID, counts } = action.payload;
      const key = `${chuKyDanhGiaID}_${nhanVienID}`;
      state.yeuCauCounts[key] = {
        ...counts,
        isLoading: false,
        error: null,
        timestamp: Date.now(),
      };
    },

    fetchYeuCauCountsRejected(state, action) {
      const { chuKyDanhGiaID, nhanVienID, error } = action.payload;
      const key = `${chuKyDanhGiaID}_${nhanVienID}`;
      state.yeuCauCounts[key] = { isLoading: false, error };
    },

    // NEW: Dashboard
    fetchYeuCauDashboardPending(state, action) {
      const { nhiemVuThuongQuyID, chuKyDanhGiaID } = action.payload;
      const key = `${nhiemVuThuongQuyID}_${chuKyDanhGiaID}`;
      state.yeuCauDashboard[key] = { isLoading: true, error: null };
    },

    fetchYeuCauDashboardSuccess(state, action) {
      const { nhiemVuThuongQuyID, chuKyDanhGiaID, data } = action.payload;
      const key = `${nhiemVuThuongQuyID}_${chuKyDanhGiaID}`;
      state.yeuCauDashboard[key] = {
        data,
        isLoading: false,
        error: null,
        timestamp: Date.now(),
      };
    },

    fetchYeuCauDashboardRejected(state, action) {
      const { nhiemVuThuongQuyID, chuKyDanhGiaID, error } = action.payload;
      const key = `${nhiemVuThuongQuyID}_${chuKyDanhGiaID}`;
      state.yeuCauDashboard[key] = { isLoading: false, error };
    },

    // NEW: Other summary
    fetchOtherYeuCauSummaryPending(state, action) {
      const { nhanVienID, chuKyDanhGiaID } = action.payload;
      const key = `${nhanVienID}_${chuKyDanhGiaID}`;
      state.otherYeuCauSummary[key] = { isLoading: true, error: null };
    },

    fetchOtherYeuCauSummarySuccess(state, action) {
      const { nhanVienID, chuKyDanhGiaID, data } = action.payload;
      const key = `${nhanVienID}_${chuKyDanhGiaID}`;
      state.otherYeuCauSummary[key] = {
        data,
        isLoading: false,
        error: null,
        timestamp: Date.now(),
      };
    },

    fetchOtherYeuCauSummaryRejected(state, action) {
      const { nhanVienID, chuKyDanhGiaID, error } = action.payload;
      const key = `${nhanVienID}_${chuKyDanhGiaID}`;
      state.otherYeuCauSummary[key] = { isLoading: false, error };
    },
  },
});
```

---

### Task 2.3: Add Thunk Actions (1 hour)

**File:** Same file, add after existing thunks

```javascript
// Thunk 1: Fetch counts for multiple NVTQ
export const fetchYeuCauCounts = (params) => async (dispatch) => {
  const { nhiemVuThuongQuyIDs, nhanVienID, chuKyDanhGiaID } = params;

  dispatch(
    slice.actions.fetchYeuCauCountsPending({ chuKyDanhGiaID, nhanVienID })
  );

  try {
    const response = await apiService.get(
      "/workmanagement/yeucau/counts-by-nhiemvu",
      {
        params: {
          nhiemVuThuongQuyIDs: nhiemVuThuongQuyIDs.join(","),
          nhanVienID,
          chuKyDanhGiaID,
        },
      }
    );

    dispatch(
      slice.actions.fetchYeuCauCountsSuccess({
        chuKyDanhGiaID,
        nhanVienID,
        counts: response.data.data,
      })
    );
  } catch (error) {
    dispatch(
      slice.actions.fetchYeuCauCountsRejected({
        chuKyDanhGiaID,
        nhanVienID,
        error: error.message,
      })
    );
    console.error("Failed to fetch YeuCau counts:", error.message);
  }
};

// Thunk 2: Fetch dashboard for one NVTQ
export const fetchYeuCauDashboard = (params) => async (dispatch) => {
  const { nhiemVuThuongQuyID, nhanVienID, chuKyDanhGiaID } = params;

  dispatch(
    slice.actions.fetchYeuCauDashboardPending({
      nhiemVuThuongQuyID,
      chuKyDanhGiaID,
    })
  );

  try {
    const response = await apiService.get(
      "/workmanagement/yeucau/dashboard-by-nhiemvu",
      { params: { nhiemVuThuongQuyID, nhanVienID, chuKyDanhGiaID } }
    );

    dispatch(
      slice.actions.fetchYeuCauDashboardSuccess({
        nhiemVuThuongQuyID,
        chuKyDanhGiaID,
        data: response.data.data,
      })
    );
  } catch (error) {
    dispatch(
      slice.actions.fetchYeuCauDashboardRejected({
        nhiemVuThuongQuyID,
        chuKyDanhGiaID,
        error: error.message,
      })
    );
    console.error("Failed to fetch YeuCau dashboard:", error.message);
  }
};

// Thunk 3: Fetch other yeucau summary
export const fetchOtherYeuCauSummary = (params) => async (dispatch) => {
  const { nhanVienID, chuKyDanhGiaID } = params;

  dispatch(
    slice.actions.fetchOtherYeuCauSummaryPending({ nhanVienID, chuKyDanhGiaID })
  );

  try {
    const response = await apiService.get(
      "/workmanagement/yeucau/other-summary",
      { params: { nhanVienID, chuKyDanhGiaID } }
    );

    dispatch(
      slice.actions.fetchOtherYeuCauSummarySuccess({
        nhanVienID,
        chuKyDanhGiaID,
        data: response.data.data,
      })
    );
  } catch (error) {
    dispatch(
      slice.actions.fetchOtherYeuCauSummaryRejected({
        nhanVienID,
        chuKyDanhGiaID,
        error: error.message,
      })
    );
    console.error("Failed to fetch other YeuCau summary:", error.message);
  }
};
```

---

### ✅ Day 2 Checklist

- [ ] Redux state structure updated
- [ ] All reducers added
- [ ] 3 thunk actions created
- [ ] Actions exported
- [ ] Test dispatch from browser console

---

## 📅 DAY 3: Dashboard Component (3-4 hours)

### Task 3.1: Create YeuCauDashboard Skeleton (1 hour)

**File:** `fe-bcgiaobanbvt/src/features/QuanLyCongViec/KPI/v2/components/dashboard/YeuCauDashboard.js`

**Content:** Clone from `CongViecDashboard.js` structure

```javascript
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Grid, Typography, CircularProgress, Alert } from "@mui/material";
import { fetchYeuCauDashboard } from "../../../Ticket/yeuCauSlice";

function YeuCauDashboard({
  nhiemVuThuongQuyID,
  nhanVienID,
  chuKyDanhGiaID,
  open = false,
  onViewYeuCau,
}) {
  const dispatch = useDispatch();
  const dashboardKey = `${nhiemVuThuongQuyID}_${chuKyDanhGiaID}`;

  const dashboardState = useSelector(
    (state) => state.yeuCau.yeuCauDashboard?.[dashboardKey]
  );

  const data = dashboardState?.data;
  const isLoading = dashboardState?.isLoading;
  const error = dashboardState?.error;

  // Lazy load when tab opens
  useEffect(() => {
    if (open && !data && !isLoading && !error) {
      dispatch(
        fetchYeuCauDashboard({
          nhiemVuThuongQuyID,
          nhanVienID,
          chuKyDanhGiaID,
        })
      );
    }
  }, [
    open,
    data,
    isLoading,
    error,
    dispatch,
    nhiemVuThuongQuyID,
    nhanVienID,
    chuKyDanhGiaID,
  ]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        📊 Dashboard Yêu Cầu
      </Typography>

      {/* Overview Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Card 1-8 sẽ thêm ở Task 3.2 */}
      </Grid>

      {/* Charts & List */}
      {/* Sẽ thêm ở Task 3.3 và 3.4 */}
    </Box>
  );
}

export default YeuCauDashboard;
```

---

### Task 3.2: Add 8 Overview Cards (1 hour)

**File:** Same file, add inside Grid container

```javascript
// Card 1: Total
<Grid item xs={12} sm={6} md={3}>
  <Card sx={{ bgcolor: "primary.lighter" }}>
    <CardContent>
      <Typography color="text.secondary" variant="body2">
        Tổng số yêu cầu
      </Typography>
      <Typography variant="h4">
        {data.summary.total}
      </Typography>
    </CardContent>
  </Card>
</Grid>

// Card 2: Completion Rate
<Grid item xs={12} sm={6} md={3}>
  <Card sx={{ bgcolor: "success.lighter" }}>
    <CardContent>
      <Typography color="text.secondary" variant="body2">
        Tỷ lệ hoàn thành
      </Typography>
      <Typography variant="h4">
        {data.summary.completionRate}%
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {data.summary.completed} / {data.summary.total}
      </Typography>
    </CardContent>
  </Card>
</Grid>

// Card 3: Late
<Grid item xs={12} sm={6} md={3}>
  <Card sx={{ bgcolor: "warning.lighter" }}>
    <CardContent>
      <Typography color="text.secondary" variant="body2">
        Trễ hạn
      </Typography>
      <Typography variant="h4">
        {data.summary.late}
      </Typography>
    </CardContent>
  </Card>
</Grid>

// Card 4: Late Rate
<Grid item xs={12} sm={6} md={3}>
  <Card sx={{ bgcolor: "warning.lighter" }}>
    <CardContent>
      <Typography color="text.secondary" variant="body2">
        Tỷ lệ trễ
      </Typography>
      <Typography variant="h4">
        {data.summary.lateRate}%
      </Typography>
    </CardContent>
  </Card>
</Grid>

// Card 5: Active
<Grid item xs={12} sm={6} md={3}>
  <Card sx={{ bgcolor: "info.lighter" }}>
    <CardContent>
      <Typography color="text.secondary" variant="body2">
        Đang xử lý
      </Typography>
      <Typography variant="h4">
        {data.summary.active}
      </Typography>
    </CardContent>
  </Card>
</Grid>

// Card 6: Overdue
<Grid item xs={12} sm={6} md={3}>
  <Card sx={{ bgcolor: "error.lighter" }}>
    <CardContent>
      <Typography color="text.secondary" variant="body2">
        Quá hạn
      </Typography>
      <Typography variant="h4">
        {data.summary.overdue}
      </Typography>
    </CardContent>
  </Card>
</Grid>

// Card 7: Reserved (empty)
<Grid item xs={12} sm={6} md={3}>
  <Card sx={{ bgcolor: "grey.200" }}>
    <CardContent>
      <Typography color="text.secondary" variant="body2">
        [Dự kiến]
      </Typography>
      <Typography variant="caption" color="text.disabled">
        Sẽ cập nhật sau
      </Typography>
    </CardContent>
  </Card>
</Grid>

// Card 8: Avg Rating
<Grid item xs={12} sm={6} md={3}>
  <Card sx={{ bgcolor: "secondary.lighter" }}>
    <CardContent>
      <Typography color="text.secondary" variant="body2">
        Đánh giá trung bình
      </Typography>
      <Typography variant="h4">
        ⭐ {data.rating.avgScore} / 5.0
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {data.rating.totalRatings} đánh giá
      </Typography>
    </CardContent>
  </Card>
</Grid>
```

---

### Task 3.3: Add Status Pie Chart (1 hour)

**File:** Same file, add after cards

**Install dependency (if not already):**

```powershell
cd d:\project\webBV\fe-bcgiaobanbvt
npm install recharts
```

**Component:**

```javascript
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

// Inside YeuCauDashboard return:
<Box sx={{ mt: 3, mb: 3 }}>
  <Typography variant="h6" gutterBottom>
    📊 Phân bố trạng thái
  </Typography>
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={data.statusDistribution.map((item) => ({
          name: getStatusLabel(item.status),
          value: item.count,
        }))}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={80}
        label
      >
        {data.statusDistribution.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
</Box>;

// Helper functions
const getStatusLabel = (status) => {
  const labels = {
    MOI: "Mới",
    DANG_XU_LY: "Đang xử lý",
    DA_HOAN_THANH: "Đã hoàn thành",
    DA_DONG: "Đã đóng",
    TU_CHOI: "Từ chối",
  };
  return labels[status] || status;
};

const getStatusColor = (status) => {
  const colors = {
    MOI: "#2196f3",
    DANG_XU_LY: "#ff9800",
    DA_HOAN_THANH: "#4caf50",
    DA_DONG: "#9e9e9e",
    TU_CHOI: "#f44336",
  };
  return colors[status] || "#666";
};
```

---

### Task 3.4: Add YeuCau List Table (1 hour)

**File:** Same file, add after chart

```javascript
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
} from "@mui/material";

// Inside YeuCauDashboard:
<Box sx={{ mt: 3 }}>
  <Typography variant="h6" gutterBottom>
    📋 Danh sách yêu cầu (tối đa 50)
  </Typography>
  <TableContainer component={Paper}>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Mã YC</TableCell>
          <TableCell>Tiêu đề</TableCell>
          <TableCell>Người yêu cầu</TableCell>
          <TableCell>Trạng thái</TableCell>
          <TableCell>Ưu tiên</TableCell>
          <TableCell>Đánh giá</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.yeuCauList.map((yc) => (
          <TableRow
            key={yc._id}
            hover
            sx={{ cursor: "pointer" }}
            onClick={() => onViewYeuCau && onViewYeuCau(yc._id)}
          >
            <TableCell>{yc.MaYeuCau}</TableCell>
            <TableCell>{yc.TieuDe}</TableCell>
            <TableCell>{yc.NguoiYeuCauID?.HoTen}</TableCell>
            <TableCell>
              <Chip
                label={getStatusLabel(yc.TrangThai)}
                color={getStatusChipColor(yc.TrangThai)}
                size="small"
              />
            </TableCell>
            <TableCell>
              <Chip
                label={yc.MucDoUuTien}
                color={getPriorityColor(yc.MucDoUuTien)}
                size="small"
              />
            </TableCell>
            <TableCell>
              {yc.DanhGia?.SoSao ? (
                <Box display="flex" alignItems="center">
                  ⭐ {yc.DanhGia.SoSao}
                </Box>
              ) : (
                <Typography variant="caption" color="text.disabled">
                  Chưa đánh giá
                </Typography>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
</Box>;

// Helper functions
const getStatusChipColor = (status) => {
  const colors = {
    MOI: "info",
    DANG_XU_LY: "warning",
    DA_HOAN_THANH: "success",
    DA_DONG: "default",
    TU_CHOI: "error",
  };
  return colors[status] || "default";
};

const getPriorityColor = (priority) => {
  const colors = {
    CAO: "error",
    TRUNG_BINH: "warning",
    THAP: "info",
  };
  return colors[priority] || "default";
};
```

---

### ✅ Day 3 Checklist

- [ ] YeuCauDashboard skeleton created
- [ ] 8 overview cards rendering
- [ ] Pie chart displaying status distribution
- [ ] Table showing top 50 yeucau
- [ ] Click handler for viewing detail (console.log)
- [ ] Test with real data

---

## 📅 DAY 4: Tab Integration (2-3 hours)

### Task 4.1: Add Tab 3 to ChamDiemKPITable (1.5 hours)

**File:** `fe-bcgiaobanbvt/src/features/QuanLyCongViec/KPI/v2/components/ChamDiemKPITable.js`

**Step 1:** Import YeuCauDashboard

```javascript
// Add import at top (around line 10-30)
import YeuCauDashboard from "./dashboard/YeuCauDashboard";
import { fetchYeuCauCounts } from "../../Ticket/yeuCauSlice";
```

**Step 2:** Add state for YeuCau counts

```javascript
// Around line 50-60, after existing state declarations
const [yeuCauCountMap, setYeuCauCountMap] = useState({});

// Get counts from Redux
const yeuCauCountsKey = `${chuKyDanhGiaID}_${nhanVienID}`;
const yeuCauCountsState = useSelector(
  (state) => state.yeuCau.yeuCauCounts?.[yeuCauCountsKey]
);
```

**Step 3:** Fetch YeuCau counts on mount

```javascript
// Add useEffect after existing useEffects (around line 100-150)
useEffect(() => {
  if (data && data.length > 0 && chuKyDanhGiaID && nhanVienID) {
    // Extract all NVTQ IDs
    const nhiemVuIDs = data
      .map((item) => item.NhiemVuThuongQuyID?._id)
      .filter(Boolean);

    if (nhiemVuIDs.length > 0) {
      dispatch(
        fetchYeuCauCounts({
          nhiemVuThuongQuyIDs: nhiemVuIDs,
          nhanVienID,
          chuKyDanhGiaID,
        })
      );
    }
  }
}, [data, chuKyDanhGiaID, nhanVienID, dispatch]);

// Update yeuCauCountMap when counts arrive
useEffect(() => {
  if (yeuCauCountsState && !yeuCauCountsState.isLoading) {
    const counts = { ...yeuCauCountsState };
    delete counts.isLoading;
    delete counts.error;
    delete counts.timestamp;
    setYeuCauCountMap(counts);
  }
}, [yeuCauCountsState]);
```

**Step 4:** Add Tab 3 to Tabs component

**Location:** Around line 972-1010 (inside expand row render)

```javascript
// EXISTING:
<Tabs
  value={activeTabByRow[rowId] || 0}
  onChange={(e, val) => handleTabChange(rowId, val)}
>
  <Tab label="✏️ Chấm điểm" />
  <Tab
    label={
      <Stack direction="row" spacing={1} alignItems="center">
        <span>📋 Công việc</span>
        {taskCountMap[rowId] !== undefined && (
          <Chip label={taskCountMap[rowId]} size="small" color="primary" />
        )}
      </Stack>
    }
  />

  {/* ADD NEW TAB */}
  <Tab
    label={
      <Stack direction="row" spacing={1} alignItems="center">
        <span>🎫 Yêu cầu</span>
        {yeuCauCountMap[nhiemVu.NhiemVuThuongQuyID?._id] !== undefined && (
          <Chip
            label={yeuCauCountMap[nhiemVu.NhiemVuThuongQuyID?._id] || 0}
            size="small"
            color="secondary"
          />
        )}
      </Stack>
    }
  />
</Tabs>
```

**Step 5:** Add TabPanel 3

**Location:** After TabPanel 1 (around line 1448)

```javascript
{
  /* Tab Panel 2: YeuCau Dashboard */
}
{
  activeTabByRow[rowId] === 2 && (
    <CardContent sx={{ p: 2 }}>
      <YeuCauDashboard
        nhiemVuThuongQuyID={nhiemVu.NhiemVuThuongQuyID?._id}
        nhanVienID={nhanVienID}
        chuKyDanhGiaID={chuKyDanhGiaID}
        open={activeTabByRow[rowId] === 2}
        onViewYeuCau={(yeuCauId) => {
          console.log("View YeuCau:", yeuCauId);
          // TODO: Open YeuCau detail dialog
        }}
      />
    </CardContent>
  );
}
```

---

### Task 4.2: Add "Yêu cầu khác" Section (1 hour)

**Create Component:** `fe-bcgiaobanbvt/src/features/QuanLyCongViec/KPI/v2/components/dashboard/YeuCauCompactCard.js`

```javascript
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Button,
  CircularProgress,
} from "@mui/material";
import { fetchOtherYeuCauSummary } from "../../../Ticket/yeuCauSlice";

function YeuCauCompactCard({ nhanVienID, chuKyDanhGiaID }) {
  const dispatch = useDispatch();
  const summaryKey = `${nhanVienID}_${chuKyDanhGiaID}`;

  const summaryState = useSelector(
    (state) => state.yeuCau.otherYeuCauSummary?.[summaryKey]
  );

  const data = summaryState?.data;
  const isLoading = summaryState?.isLoading;

  useEffect(() => {
    if (!data && !isLoading) {
      dispatch(fetchOtherYeuCauSummary({ nhanVienID, chuKyDanhGiaID }));
    }
  }, [data, isLoading, dispatch, nhanVienID, chuKyDanhGiaID]);

  if (isLoading) {
    return <CircularProgress size={24} />;
  }

  if (!data || data.summary.total === 0) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">
            Không có yêu cầu khác trong chu kỳ này
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Typography variant="body2" color="text.secondary">
              Tổng số
            </Typography>
            <Typography variant="h5">{data.summary.total}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2" color="text.secondary">
              Hoàn thành
            </Typography>
            <Typography variant="h5" color="success.main">
              {data.summary.completed}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2" color="text.secondary">
              Đang xử lý
            </Typography>
            <Typography variant="h5" color="warning.main">
              {data.summary.active}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2" color="text.secondary">
              Đánh giá TB
            </Typography>
            <Typography variant="h5">⭐ {data.rating.avgScore}</Typography>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, textAlign: "right" }}>
          <Button
            size="small"
            onClick={() => {
              console.log("View all other yeucau");
              // TODO: Open full dashboard dialog
            }}
          >
            Xem chi tiết →
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default YeuCauCompactCard;
```

**Update ChamDiemKPIDialog:**

**File:** `fe-bcgiaobanbvt/src/features/QuanLyCongViec/KPI/v2/components/ChamDiemKPIDialog.js`

**Add import:**

```javascript
import YeuCauCompactCard from "./dashboard/YeuCauCompactCard";
```

**Add section after table** (around line 200-250):

```javascript
{
  /* Yêu cầu khác section */
}
<Box sx={{ mt: 4 }}>
  <Typography variant="h6" gutterBottom>
    🎫 Yêu cầu khác (không thuộc nhiệm vụ thường quy)
  </Typography>
  <YeuCauCompactCard nhanVienID={nhanVienID} chuKyDanhGiaID={chuKyDanhGiaID} />
</Box>;
```

---

### ✅ Day 4 Checklist

- [ ] Tab 3 added to ChamDiemKPITable
- [ ] Badge count displaying correctly
- [ ] YeuCauDashboard loads when tab opened
- [ ] YeuCauCompactCard created
- [ ] "Yêu cầu khác" section added to dialog
- [ ] Test full flow: Open dialog → See counts → Switch tabs

---

## 📅 DAY 5: Testing & Polish (2-3 hours)

### Task 5.1: Integration Testing (1 hour)

**Test Scenarios:**

1. **Badge Count Test**

   - [ ] Open KPI evaluation dialog
   - [ ] Verify badges show correct counts for all 10 NVTQ rows
   - [ ] Verify counts match backend data
   - [ ] Test with 0 yeucau (badge should show 0)

2. **Lazy Load Test**

   - [ ] Expand row #1, switch to Tab 3 → Dashboard loads
   - [ ] Switch back to Tab 1, then Tab 3 → No reload (cached)
   - [ ] Collapse row, expand again → Still cached
   - [ ] Refresh page → Cache cleared

3. **Dashboard Content Test**

   - [ ] All 8 cards display correct values
   - [ ] Pie chart renders with colors
   - [ ] Table shows max 50 yeucau
   - [ ] Click on yeucau row → console.log ID
   - [ ] Test with different NVTQ → Different data

4. **"Yêu cầu khác" Section Test**

   - [ ] Shows correct summary
   - [ ] Shows "Không có yêu cầu" when total = 0
   - [ ] "Xem chi tiết" button clickable

5. **Approved KPI Test**

   - [ ] Open approved KPI evaluation
   - [ ] Tab 3 still accessible (read-only)
   - [ ] Dashboard displays correctly

6. **Error Handling Test**
   - [ ] Disconnect backend → Error message shows
   - [ ] Invalid NVTQ ID → Graceful error
   - [ ] Empty chu ky → Handles correctly

---

### Task 5.2: Performance Testing (30 mins)

**Test with 10 NVTQ:**

1. **Initial Load**

   - [ ] Count API: <100ms
   - [ ] Badge display: <50ms
   - [ ] Memory usage: <100MB increase

2. **Dashboard Load**

   - [ ] First load: <300ms
   - [ ] Cached load: <50ms
   - [ ] Multiple tabs switching: smooth

3. **Browser Console**
   ```javascript
   // Check Redux state size
   console.log(JSON.stringify(store.getState().yeuCau.yeuCauDashboard).length);
   // Should be <500KB for 10 NVTQ
   ```

---

### Task 5.3: UI/UX Polish (1 hour)

**Improvements:**

1. **Loading States**

   - [ ] Badge shows skeleton while loading
   - [ ] Dashboard shows spinner
   - [ ] Smooth transitions

2. **Empty States**

   - [ ] "Chưa có yêu cầu" message when total = 0
   - [ ] Friendly illustration/icon

3. **Tooltips**

   - [ ] Add tooltip to Card 7: "Tính năng đang phát triển"
   - [ ] Add tooltip to badges explaining counts

4. **Responsive Design**

   - [ ] Test on mobile (MUI sm breakpoint)
   - [ ] Cards stack vertically
   - [ ] Table scrollable horizontally

5. **Colors & Typography**
   - [ ] Consistent with existing theme
   - [ ] Accessible contrast ratios
   - [ ] Proper spacing

---

### Task 5.4: Code Cleanup (30 mins)

- [ ] Remove console.logs
- [ ] Add JSDoc comments
- [ ] Format code with Prettier
- [ ] Check for unused imports
- [ ] Verify prop types
- [ ] Update .gitignore if needed

---

### Task 5.5: Documentation (30 mins)

**Update this plan with:**

- [ ] Actual API response samples
- [ ] Screenshot of final UI
- [ ] Known limitations
- [ ] Future enhancements

---

## 🎯 ACCEPTANCE CRITERIA

### Must Have (P0):

- ✅ Tab 3 "Yêu cầu" visible in all NVTQ rows
- ✅ Badge count accurate and fast (<100ms)
- ✅ Dashboard shows 8 cards (Card 7 empty)
- ✅ Pie chart displays status distribution
- ✅ Table shows top 50 yeucau
- ✅ "Yêu cầu khác" section renders
- ✅ Lazy loading works correctly
- ✅ No crashes or console errors

### Should Have (P1):

- ✅ Click yeucau to view detail (implementation deferred)
- ✅ Rating distribution visualization
- ✅ Responsive on mobile
- ✅ Error handling with user-friendly messages

### Nice to Have (P2):

- ⭕ Prefetch next row (skipped for V1)
- ⭕ Response time metrics (Card 7) - Phase 2
- ⭕ Export to Excel
- ⭕ Filter yeucau by priority/status in dashboard

---

## 📝 NOTES & DECISIONS

### Why Skip Prefetch?

- CongViec tab doesn't use prefetch
- 200-300ms load time acceptable
- Simpler architecture = fewer bugs
- Can add later if users complain

### Why Skip Response Time?

- Requires complex LichSuYeuCau analysis
- Not critical for V1
- Card 7 placeholder reserves space

### Why Simple In-Memory Cache?

- Redux state already acts as cache
- No need for backend Redis
- 10 NVTQ × 50 yeucau = <500KB data
- TTL handled by page refresh

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-deployment:

- [ ] All tests passing
- [ ] No console errors
- [ ] Backend APIs tested with Postman
- [ ] Index added to MongoDB
- [ ] Code reviewed

### Deployment:

- [ ] Deploy backend first
- [ ] Verify API endpoints live
- [ ] Deploy frontend
- [ ] Clear browser cache
- [ ] Test in production

### Post-deployment:

- [ ] Monitor error logs
- [ ] Check MongoDB query performance
- [ ] Gather user feedback
- [ ] Plan Phase 2 enhancements

---

## 📞 SUPPORT & TROUBLESHOOTING

### Common Issues:

**Badge not showing:**

- Check Redux state: `store.getState().yeuCau.yeuCauCounts`
- Verify API response format
- Check NVTQ IDs are valid

**Dashboard empty:**

- Check ChuKyDanhGia time range
- Verify NhiemVuThuongQuyID not null
- Check MongoDB data exists

**Slow performance:**

- Check MongoDB indexes with `.explain()`
- Verify <50ms API for counts
- Check browser memory usage

---

**End of Implementation Plan**

🎯 Ready to start Day 1? Run backend server and begin with Task 1.1!
