# 📊 Phân Tích API Trang Chủ (UnifiedDashboardPage)

## 🎯 Tổng Quan

Trang chủ (UnifiedDashboardPage) sử dụng **7 API endpoints** chính để hiển thị dashboard với các widget theo vai trò (Manager/Employee).

---

## 📡 Danh Sách API Được Sử Dụng

### 1. **GET /api/workmanagement/congviec/summary/:nhanVienId**

**Mục đích**: Lấy tóm tắt công việc cho Summary Card  
**Redux Thunk**: `fetchCongViecSummary(nhanVienId)`  
**Sử dụng tại**: UnifiedDashboardPage (Summary Cards)

#### Response Structure:

```javascript
{
  success: true,
  data: {
    total: 25,          // Tổng số công việc đang hoạt động
    urgent: 8,          // Số công việc gấp (deadline ≤ 3 ngày)
    completionRate: 0   // Tỷ lệ hoàn thành (nếu cần)
  }
}
```

#### Logic Backend (congViec.controller.js, dòng 825-883):

```javascript
// Count total active tasks (received OR assigned)
const total = await CongViec.countDocuments({
  $or: [
    { NguoiNhanID: objectId(nhanVienId) },
    { NguoiGiaoID: objectId(nhanVienId) },
  ],
  TrangThai: { $nin: ["HOAN_THANH", "DA_HUY"] },
  isDeleted: { $ne: true },
});

// Count urgent tasks (deadline within 3 days)
const urgent = await CongViec.countDocuments({
  $or: [
    { NguoiNhanID: objectId(nhanVienId) },
    { NguoiGiaoID: objectId(nhanVienId) },
  ],
  TrangThai: { $nin: ["HOAN_THANH", "DA_HUY"] },
  NgayHetHan: {
    $exists: true,
    $lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  },
  isDeleted: { $ne: true },
});
```

#### Sử dụng ở nơi khác:

- ❌ **Chưa được sử dụng ở trang khác** (API mới tạo cho Dashboard)

---

### 2. **GET /api/workmanagement/yeucau/summary/:nhanVienId**

**Mục đích**: Lấy tóm tắt yêu cầu cho Summary Card  
**Redux Thunk**: `fetchYeuCauSummary(nhanVienId)`  
**Sử dụng tại**: UnifiedDashboardPage (Summary Cards)

#### Response Structure:

```javascript
{
  success: true,
  data: {
    sent: 12,           // Yêu cầu tôi gửi
    needAction: 5,      // Cần xử lý (khoa tôi nhận, chưa xử lý)
    inProgress: 3,      // Đang xử lý
    completed: 20       // Hoàn thành
  }
}
```

#### Logic Backend (yeuCau.controller.js, dòng 305-370):

```javascript
// Get user's KhoaID first
const user = await User.findOne({ NhanVienID: nhanVienId }).lean();

// Parallel queries
const [sent, needAction, inProgress, completed] = await Promise.all([
  // Yêu cầu tôi gửi
  YeuCau.countDocuments({
    NguoiGuiID: objectId(nhanVienId),
    isDeleted: { $ne: true },
  }),

  // Cần xử lý (khoa tôi nhận)
  YeuCau.countDocuments({
    KhoaNhanID: user.KhoaID,
    TrangThai: "CHO_XU_LY",
    isDeleted: { $ne: true },
  }),

  // Đang xử lý
  YeuCau.countDocuments({
    KhoaNhanID: user.KhoaID,
    TrangThai: "DANG_XU_LY",
    isDeleted: { $ne: true },
  }),

  // Hoàn thành
  YeuCau.countDocuments({
    KhoaNhanID: user.KhoaID,
    TrangThai: "HOAN_THANH",
    isDeleted: { $ne: true },
  }),
]);
```

#### Sử dụng ở nơi khác:

- ❌ **Chưa được sử dụng ở trang khác** (API mới tạo cho Dashboard)

---

### 3. **GET /api/workmanagement/kpi/summary/:nhanVienId**

**Mục đích**: Lấy điểm KPI chu kỳ gần nhất cho Summary Card  
**Redux Thunk**: `fetchKPISummary(nhanVienId)`  
**Sử dụng tại**: UnifiedDashboardPage (Summary Cards)

#### Response Structure:

```javascript
{
  success: true,
  data: {
    score: 85.5,              // Điểm KPI (null nếu chưa có)
    status: "DA_DUYET",       // CHUA_DUYET | DA_DUYET | NO_CYCLE
    cycleName: "Tháng 1/2026", // Tên chu kỳ
    isDone: false,            // Chu kỳ đã đóng chưa
    hasEvaluation: true       // Có đánh giá KPI chưa
  }
}
```

#### Logic Backend (kpi.controller.js, dòng 1245-1320):

```javascript
// 1. Find latest cycle
const latestChuKy = await ChuKyDanhGia.findOne({
  isDeleted: { $ne: true },
})
  .sort({ NgayBatDau: -1 })
  .select("_id TenChuKy NgayBatDau NgayKetThuc isDong")
  .lean();

// 2. Get DanhGiaKPI for this employee + latest cycle
const danhGiaKPI = await DanhGiaKPI.findOne({
  NhanVienID: nhanVienId,
  ChuKyDanhGiaID: latestChuKy._id,
  isDeleted: { $ne: true },
})
  .select("TongDiemKPI TrangThai")
  .lean();

// 3. Return summary
return {
  score: danhGiaKPI?.TongDiemKPI || null,
  status: danhGiaKPI?.TrangThai || "CHUA_DUYET",
  cycleName: latestChuKy.TenChuKy,
  isDone: latestChuKy.isDong,
  hasEvaluation: !!danhGiaKPI,
};
```

#### Sử dụng ở nơi khác:

- ❌ **Chưa được sử dụng ở trang khác** (API mới tạo cho Dashboard)

---

### 4. **GET /api/workmanagement/congviec/urgent/:nhanVienId?limit=5&daysAhead=3**

**Mục đích**: Lấy danh sách công việc gấp cho PriorityTasksWidget (Employee)  
**Redux Thunk**: `fetchUrgentTasks(nhanVienId, limit)`  
**Sử dụng tại**: PriorityTasksWidget component

#### Response Structure:

```javascript
{
  success: true,
  data: {
    tasks: [
      {
        _id: "...",
        TieuDe: "Hoàn thiện báo cáo",
        TrangThai: "DANG_THUC_HIEN",
        NgayHetHan: "2026-01-30T10:00:00Z",
        MucDoUuTien: 3,
        TienDo: 60,
        NguoiGiaoViecID: { HoTen: "...", Images: [...] },
        NguoiChinhID: { HoTen: "...", Images: [...] },
        DaysRemaining: 1,    // Tính toán từ backend
        HoursRemaining: 18   // Tính toán từ backend
      },
      // ... 4 tasks khác
    ],
    total: 8  // Tổng số tasks urgent (cho "xem tất cả")
  }
}
```

#### Logic Backend (congViec.controller.js, dòng 1048-1112):

```javascript
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
  .sort({ NgayHetHan: 1, MucDoUuTien: -1 }) // Ưu tiên deadline gần + priority cao
  .limit(Math.min(parseInt(limit) || 5, 20))
  .populate("NguoiGiaoViecID", "HoTen Images MaNhanVien")
  .populate("NguoiChinhID", "HoTen Images")
  .lean();

// Calculate remaining time
const tasksWithCountdown = tasks.map((task) => ({
  ...task,
  DaysRemaining: Math.ceil(
    (new Date(task.NgayHetHan) - now) / (1000 * 60 * 60 * 24),
  ),
  HoursRemaining: Math.ceil(
    (new Date(task.NgayHetHan) - now) / (1000 * 60 * 60),
  ),
}));
```

#### Sử dụng ở nơi khác:

- ❌ **Chưa được sử dụng ở trang khác** (API mới tạo cho Dashboard)

---

### 5. **GET /api/workmanagement/congviec/hoat-dong-gan-day?limit=10**

**Mục đích**: Lấy hoạt động gần đây cho RecentActivitiesTimeline  
**Sử dụng tại**: RecentActivitiesTimeline component (direct API call, không qua Redux)

#### Response Structure:

```javascript
{
  success: true,
  data: {
    activities: [
      {
        LoaiHoatDong: "TRANG_THAI",  // TRANG_THAI | TIEN_DO | BINH_LUAN
        HanhDong: "GIAO_VIEC",
        NguoiThucHienID: {
          _id: "...",
          Ten: "Nguyễn Văn A",
          MaNhanVien: "NV001",
          Images: ["url1", "url2"]
        },
        ThoiGian: "2026-01-29T08:30:00Z",
        GhiChu: "Đã giao việc cho nhân viên",
        CongViecID: {
          _id: "...",
          MaCongViec: "CV2026001",
          TieuDe: "Hoàn thiện báo cáo",
          TrangThai: "DANG_THUC_HIEN",
          NguoiChinhID: { Ten: "...", Images: [...] }
        },
        // For TRANG_THAI type:
        TuTrangThai: "MOI_TAO",
        DenTrangThai: "DANG_THUC_HIEN",
        // For TIEN_DO type:
        TuTienDo: 50,
        DenTienDo: 75
      },
      // ... 9 activities khác
    ]
  }
}
```

#### Logic Backend (congViec.controller.js + congViec.service.js, dòng 4121-4253):

```javascript
// 1. Find tasks where user is involved
const taskFilter = {
  isDeleted: { $ne: true },
  $or: [
    { NguoiGiaoViecID: nhanVienObjId },
    { NguoiChinhID: nhanVienObjId },
    { "NguoiThamGia.NhanVienID": nhanVienObjId }
  ]
};

// 2. Aggregate from LichSuTrangThai (status changes)
const statusActivities = await CongViec.aggregate([
  { $match: taskFilter },
  { $unwind: "$LichSuTrangThai" },
  { $project: {
    LoaiHoatDong: "TRANG_THAI",
    HanhDong: "$LichSuTrangThai.HanhDong",
    NguoiThucHienID: "$LichSuTrangThai.NguoiThucHienID",
    ThoiGian: "$LichSuTrangThai.ThoiGian",
    // ...
  }}
]);

// 3. Aggregate from LichSuTienDo (progress updates)
const progressActivities = await CongViec.aggregate([...]);

// 4. Query BinhLuan collection (comments)
const commentActivities = await BinhLuan.find({...});

// 5. Merge all activities
const allActivities = [
  ...statusActivities,
  ...progressActivities,
  ...mappedComments
];

// 6. Sort by time descending & limit
allActivities.sort((a, b) => new Date(b.ThoiGian) - new Date(a.ThoiGian));
const limitedActivities = allActivities.slice(0, Math.min(limit, 100));

// 7. Populate references (NguoiThucHienID, CongViecID)
await NhanVien.populate(limitedActivities, {
  path: "NguoiThucHienID",
  select: "Ten MaNhanVien Images"
});
```

#### Sử dụng ở nơi khác:

- ✅ **CÓ** - Có thể được sử dụng trong các dashboard khác (API general purpose)

---

### 6. **GET /api/workmanagement/chu-ky-danh-gia**

**Mục đích**: Lấy danh sách chu kỳ đánh giá cho TeamOverviewWidget (Manager)  
**Sử dụng tại**: TeamOverviewWidget component (direct API call)

#### Response Structure:

```javascript
{
  success: true,
  data: [
    {
      _id: "...",
      TenChuKy: "Tháng 1/2026",
      NgayBatDau: "2026-01-01",
      NgayKetThuc: "2026-01-31",
      isDong: false,
      MoTa: "..."
    },
    // ... các chu kỳ khác
  ]
}
```

#### Logic Backend:

Lấy tất cả chu kỳ đánh giá chưa bị xóa, sort theo NgayBatDau desc.

#### Sử dụng ở nơi khác:

- ✅ **CÓ** - Được sử dụng rộng rãi trong:
  - KPI Evaluation pages
  - KPI Self-assessment pages
  - KPI Reports
  - Chu kỳ management pages

---

### 7. **GET /api/workmanagement/kpi/dashboard/:chuKyId**

**Mục đích**: Lấy tổng quan KPI của team cho TeamOverviewWidget (Manager)  
**Sử dụng tại**: TeamOverviewWidget component (direct API call)

#### Response Structure:

```javascript
{
  success: true,
  data: {
    nhanVienList: [
      {
        nhanVien: {
          _id: "...",
          Ten: "Nguyễn Văn A",
          MaNhanVien: "NV001",
          Images: ["url"],
          KhoaID: { TenKhoa: "..." }
        },
        danhGiaKPI: {
          TongDiemKPI: 85.5,
          TrangThai: "DA_DUYET"
        },
        progress: {
          scored: 8,      // Số nhiệm vụ đã chấm
          total: 10,      // Tổng số nhiệm vụ
          percentage: 80  // %
        }
      },
      // ... nhân viên khác
    ],
    summary: {
      totalNhanVien: 15,
      completed: 10,     // Đã duyệt
      inProgress: 3,     // Chưa duyệt
      notStarted: 2      // Chưa có đánh giá
    }
  }
}
```

#### Logic Backend (kpi.controller.js, dòng 955-1070):

```javascript
// 1. Lấy nhân viên được quản lý (LoaiQuanLy = "KPI")
const quanHeQuanLy = await QuanLyNhanVien.find({
  NhanVienQuanLy: currentNhanVienID,
  LoaiQuanLy: "KPI",
  isDeleted: { $ne: true }
}).populate("NhanVienDuocQuanLy");

// 2. Lấy đánh giá KPI của các nhân viên trong chu kỳ
const danhGiaKPIs = await DanhGiaKPI.find({
  ChuKyDanhGiaID: chuKyId,
  NhanVienID: { $in: nhanVienIds },
  isDeleted: { $ne: true }
});

// 3. Tính progress cho từng nhân viên
for (const dg of danhGiaKPIs) {
  // Số nhiệm vụ đã chấm
  const scoredTasks = await DanhGiaNhiemVuThuongQuy.distinct(
    "NhiemVuThuongQuyID",
    {
      NhanVienID: dg.NhanVienID,
      ChuKyDanhGiaID: chuKyId,
      $or: [
        { ChiTietDiem: { $exists: true, $ne: [] } },
        { DiemQuanLyDanhGia: { $gt: 0 } }
      ]
    }
  );

  // Tổng số nhiệm vụ được phân công
  const assignedTotal = await NhanVienNhiemVu.countDocuments({
    NhanVienID: dg.NhanVienID,
    ChuKyDanhGiaID: chuKyId,
    TrangThaiHoatDong: true
  });

  progress = {
    scored: scoredTasks.length,
    total: assignedTotal,
    percentage: Math.round((scoredTasks.length / assignedTotal) * 100)
  };
}

// 4. Tính summary statistics
summary = {
  totalNhanVien: nhanVienList.length,
  completed: count(TrangThai === "DA_DUYET"),
  inProgress: count(TrangThai === "CHUA_DUYET"),
  notStarted: count(no danhGiaKPI)
};
```

#### Sử dụng ở nơi khác:

- ✅ **CÓ** - Được sử dụng trong:
  - KPI Evaluation Page (trang chấm điểm nhân viên)
  - KPI Dashboard (full version)

---

### 8. **GET /api/workmanagement/quanlynhanvien/:id/managed**

**Mục đích**: Lấy danh sách nhân viên được quản lý (để xác định Manager)  
**Redux Thunk**: `getManagedEmployees(nhanVienId)`  
**Sử dụng tại**: UnifiedDashboardPage (để xác định `isManager`)

#### Response Structure:

```javascript
{
  success: true,
  data: [
    {
      _id: "...",
      Ten: "Nguyễn Văn A",
      MaNhanVien: "NV001",
      // ... thông tin nhân viên
    },
    // ... nhân viên khác được quản lý
  ]
}
```

#### Logic Backend:

```javascript
const quanHeQuanLy = await QuanLyNhanVien.find({
  NhanVienQuanLy: nhanVienId,
  isDeleted: { $ne: true },
}).populate("NhanVienDuocQuanLy");

return quanHeQuanLy.map((qh) => qh.NhanVienDuocQuanLy);
```

#### Sử dụng ở nơi khác:

- ✅ **CÓ** - Được sử dụng rộng rãi trong:
  - Employee Management pages
  - KPI Evaluation pages
  - Task Assignment pages

---

## 🔄 Redux Data Flow

```
UnifiedDashboardPage (Component)
    ↓
useEffect → dispatch actions
    ↓
┌─────────────────────────────────────────────────────────────┐
│ workDashboardSlice (Redux State Management)                 │
│                                                              │
│  fetchAllDashboardSummaries(nhanVienId)                     │
│    ├── fetchCongViecSummary()  → API 1                      │
│    ├── fetchYeuCauSummary()    → API 2                      │
│    └── fetchKPISummary()       → API 3                      │
│                                                              │
│  fetchUrgentTasks(nhanVienId)  → API 4                      │
└─────────────────────────────────────────────────────────────┘
    ↓
nhanvienManagementSlice
    ↓
getManagedEmployees(nhanVienId) → API 8
    ↓
Child Components (Direct API calls, không qua Redux)
    ↓
├── RecentActivitiesTimeline → API 5
└── TeamOverviewWidget → API 6, API 7
```

---

## 📊 Database Collections Affected

| API   | Collections                                                                  | Operations                                             |
| ----- | ---------------------------------------------------------------------------- | ------------------------------------------------------ |
| API 1 | `CongViec`                                                                   | `countDocuments()` (2 queries với $or filter)          |
| API 2 | `User`, `YeuCau`                                                             | `findOne()`, `countDocuments()` (4 parallel queries)   |
| API 3 | `ChuKyDanhGia`, `DanhGiaKPI`                                                 | `findOne().sort()`, `findOne()`                        |
| API 4 | `CongViec`                                                                   | `find().sort().limit().populate()`, `countDocuments()` |
| API 5 | `CongViec`, `BinhLuan`, `NhanVien`                                           | `aggregate()` (2 pipelines), `find()`, `populate()`    |
| API 6 | `ChuKyDanhGia`                                                               | `find().sort()`                                        |
| API 7 | `QuanLyNhanVien`, `DanhGiaKPI`, `NhanVienNhiemVu`, `DanhGiaNhiemVuThuongQuy` | Complex multi-collection queries                       |
| API 8 | `QuanLyNhanVien`                                                             | `find().populate()`                                    |

---

## ⚡ Performance Optimization

### Parallel Fetching

```javascript
// UnifiedDashboardPage fetches 3 summary APIs in parallel
await Promise.all([
  dispatch(fetchCongViecSummary(nhanVienId)),
  dispatch(fetchYeuCauSummary(nhanVienId)),
  dispatch(fetchKPISummary(nhanVienId)),
]);
```

### Individual Loading States

```javascript
// Each summary card has its own loading state
loadingCongViec: false,
loadingYeuCau: false,
loadingKPI: false,
```

### Data Caching

- Redux state caches data với `lastFetchTime`
- EmployeeAvatar component có blob URL cache

---

## 🔐 Security & Authorization

### API Protection

- Tất cả APIs yêu cầu `authentication.loginRequired` middleware
- Manager-only APIs (API 7) yêu cầu `validateQuanLy` middleware

### Data Filtering

- APIs filter theo `NhanVienID` từ authenticated user
- Không thể truy cập dữ liệu của người khác
- Manager chỉ thấy nhân viên mình quản lý

---

## 🐛 Known Issues & Considerations

### API 1-3: Dashboard Summaries

- ✅ **Mới tạo**, chưa được test kỹ ở production
- ⚠️ Cần monitor performance khi user có nhiều công việc/yêu cầu

### API 4: Urgent Tasks

- ✅ **Mới tạo**, có tính toán DaysRemaining/HoursRemaining ở backend
- ⚠️ Threshold mặc định 3 ngày có thể cần điều chỉnh theo nhu cầu

### API 5: Recent Activities

- ✅ **Đã có**, được reuse từ feature cũ
- ⚠️ Query phức tạp với aggregate + populate, cần index tốt
- ⚠️ Limit 100 để tránh quá tải

### API 7: KPI Dashboard

- ✅ **Đã có**, được reuse
- ⚠️ Query rất phức tạp với nhiều collections
- ⚠️ Có thể chậm nếu team lớn (>20 người)

---

## 📝 Recommendations

### Short-term:

1. ✅ Add indexes cho CongViec:
   - `{ NguoiNhanID: 1, TrangThai: 1, NgayHetHan: 1 }`
   - `{ NguoiGiaoID: 1, TrangThai: 1, NgayHetHan: 1 }`

2. ✅ Add indexes cho YeuCau:
   - `{ KhoaNhanID: 1, TrangThai: 1 }`
   - `{ NguoiGuiID: 1 }`

3. ✅ Monitor API response times:
   - Target: < 200ms cho summary APIs
   - Target: < 500ms cho complex queries (API 5, 7)

### Long-term:

1. ⚡ Consider caching cho API 6, 7 (ít thay đổi)
2. 📊 Add pagination cho API 5 (activities)
3. 🔄 Consider WebSocket cho real-time updates
4. 📈 Add analytics tracking cho dashboard usage

---

## 🎯 Conclusion

Trang chủ đã được tối ưu với:

- ✅ 3 APIs mới tạo riêng cho dashboard (lightweight)
- ✅ 5 APIs reuse từ features có sẵn
- ✅ Parallel fetching để giảm loading time
- ✅ Role-based rendering (Manager vs Employee)
- ✅ Separate loading states cho better UX

**Next Steps:**

1. Testing kỹ với data thực tế
2. Monitor performance metrics
3. Optimize indexes dựa trên slow query logs
4. Consider adding error boundaries cho từng widget
