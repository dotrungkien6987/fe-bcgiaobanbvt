# Backend API Extensions - Role-Based Views

**Ngày tạo**: 08/12/2025

---

## New API Endpoints

### 1. Get My Permissions

```
GET /api/workmanagement/yeucau/my-permissions
```

**Purpose**: Kiểm tra quyền của user hiện tại trong hệ thống yêu cầu

**Headers**:

```
Authorization: Bearer <token>
```

**Response**:

```json
{
  "success": true,
  "data": {
    "isDieuPhoi": true,
    "isQuanLyKhoa": false,
    "khoaDieuPhoiIds": ["64f3cb6035c717ab00d75b8b"],
    "khoaQuanLyIds": [],
    "khoaId": "64f3cb6035c717ab00d75b8b",
    "tenKhoa": "Khoa Công Nghệ Thông Tin"
  }
}
```

**Implementation**:

```javascript
// yeuCau.controller.js
controller.layQuyenCuaToi = catchAsync(async (req, res, next) => {
  const { nhanVienId } = await getNhanVienId(req);

  const NhanVien = require("../../../models/NhanVien");
  const nhanVien = await NhanVien.findById(nhanVienId).populate("KhoaID");

  if (!nhanVien || !nhanVien.KhoaID) {
    throw new AppError(400, "Nhân viên chưa được gán khoa", "NO_KHOA");
  }

  // Tìm tất cả khoa mà user là điều phối hoặc quản lý
  const cauHinhList = await CauHinhThongBaoKhoa.find({});

  const khoaDieuPhoiIds = [];
  const khoaQuanLyIds = [];

  for (const cauHinh of cauHinhList) {
    if (cauHinh.laNguoiDieuPhoi(nhanVienId)) {
      khoaDieuPhoiIds.push(cauHinh.KhoaID);
    }
    if (cauHinh.laQuanLyKhoa(nhanVienId)) {
      khoaQuanLyIds.push(cauHinh.KhoaID);
    }
  }

  const result = {
    isDieuPhoi: khoaDieuPhoiIds.length > 0,
    isQuanLyKhoa: khoaQuanLyIds.length > 0,
    khoaDieuPhoiIds,
    khoaQuanLyIds,
    khoaId: nhanVien.KhoaID._id,
    tenKhoa: nhanVien.KhoaID.TenKhoa,
  };

  return sendResponse(res, 200, true, result, null, "Lấy quyền thành công");
});
```

---

### 2. Get Badge Counts

```
GET /api/workmanagement/yeucau/badge-counts
```

**Purpose**: Lấy số lượng yêu cầu cần chú ý cho menu badges

**Response**:

```json
{
  "success": true,
  "data": {
    "toiGui": {
      "choPhanHoi": 3,
      "choDanhGia": 2,
      "total": 5
    },
    "xuLy": {
      "choTiepNhan": 4,
      "dangXuLy": 6,
      "total": 10
    },
    "dieuPhoi": {
      "moiDen": 7,
      "choTiepNhan": 3,
      "total": 10
    }
  }
}
```

**Implementation**:

```javascript
controller.layBadgeCounts = catchAsync(async (req, res, next) => {
  const { nhanVienId } = await getNhanVienId(req);
  const NhanVien = require("../../../models/NhanVien");
  const nhanVien = await NhanVien.findById(nhanVienId);

  const khoaId = nhanVien?.KhoaID;

  // Tôi gửi
  const toiGui = {
    choPhanHoi: await YeuCau.countDocuments({
      NguoiYeuCauID: nhanVienId,
      TrangThai: "MOI",
      isDeleted: false,
    }),
    choDanhGia: await YeuCau.countDocuments({
      NguoiYeuCauID: nhanVienId,
      TrangThai: "DA_HOAN_THANH",
      isDeleted: false,
    }),
  };
  toiGui.total = toiGui.choPhanHoi + toiGui.choDanhGia;

  // Tôi xử lý
  const xuLy = {
    choTiepNhan: await YeuCau.countDocuments({
      NguoiDuocDieuPhoiID: nhanVienId,
      TrangThai: "MOI",
      isDeleted: false,
    }),
    dangXuLy: await YeuCau.countDocuments({
      NguoiXuLyID: nhanVienId,
      TrangThai: "DANG_XU_LY",
      isDeleted: false,
    }),
  };
  xuLy.total = xuLy.choTiepNhan + xuLy.dangXuLy;

  // Điều phối (nếu có quyền)
  const dieuPhoi = { moiDen: 0, choTiepNhan: 0, total: 0 };
  const cauHinh = await CauHinhThongBaoKhoa.findOne({ KhoaID: khoaId });
  if (cauHinh?.laNguoiDieuPhoi(nhanVienId)) {
    dieuPhoi.moiDen = await YeuCau.countDocuments({
      KhoaDichID: khoaId,
      TrangThai: "MOI",
      LoaiNguoiNhan: "KHOA",
      NguoiDuocDieuPhoiID: null,
      isDeleted: false,
    });
    dieuPhoi.choTiepNhan = await YeuCau.countDocuments({
      KhoaDichID: khoaId,
      TrangThai: "MOI",
      NguoiDuocDieuPhoiID: { $ne: null },
      isDeleted: false,
    });
    dieuPhoi.total = dieuPhoi.moiDen + dieuPhoi.choTiepNhan;
  }

  return sendResponse(
    res,
    200,
    true,
    { toiGui, xuLy, dieuPhoi },
    null,
    "Success"
  );
});
```

---

### 3. Dashboard: Người Xử Lý KPI

```
GET /api/workmanagement/yeucau/dashboard/xu-ly
```

**Purpose**: Metrics cho người xử lý (hiển thị trên YeuCauXuLyPage)

**Response**:

```json
{
  "success": true,
  "data": {
    "tongXuLy": 45,
    "trungBinhSao": 4.6,
    "tyLeDungHan": 87,
    "breakdown": {
      "trongThang": 12,
      "moiQuaHan": 2
    }
  }
}
```

**Implementation**:

```javascript
controller.layDashboardXuLy = catchAsync(async (req, res, next) => {
  const { nhanVienId } = await getNhanVienId(req);

  // Tổng đã xử lý (DA_DONG)
  const tongXuLy = await YeuCau.countDocuments({
    NguoiXuLyID: nhanVienId,
    TrangThai: "DA_DONG",
    isDeleted: false,
  });

  // Trung bình sao
  const avgResult = await YeuCau.aggregate([
    {
      $match: {
        NguoiXuLyID: mongoose.Types.ObjectId(nhanVienId),
        TrangThai: "DA_DONG",
        "DanhGia.SoSao": { $exists: true },
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: null,
        avgSao: { $avg: "$DanhGia.SoSao" },
      },
    },
  ]);
  const trungBinhSao = avgResult[0]?.avgSao || 0;

  // Tỷ lệ đúng hạn
  const daXuLy = await YeuCau.find({
    NguoiXuLyID: nhanVienId,
    TrangThai: { $in: ["DA_HOAN_THANH", "DA_DONG"] },
    isDeleted: false,
  }).select("NgayHoanThanh ThoiGianHen");

  const dungHan = daXuLy.filter(
    (yc) =>
      yc.NgayHoanThanh && yc.ThoiGianHen && yc.NgayHoanThanh <= yc.ThoiGianHen
  ).length;

  const tyLeDungHan =
    daXuLy.length > 0 ? Math.round((dungHan / daXuLy.length) * 100) : 0;

  // Trong tháng này
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const trongThang = await YeuCau.countDocuments({
    NguoiXuLyID: nhanVienId,
    TrangThai: "DA_DONG",
    NgayDong: { $gte: startOfMonth },
    isDeleted: false,
  });

  // Mới quá hạn
  const now = new Date();
  const moiQuaHan = await YeuCau.countDocuments({
    NguoiXuLyID: nhanVienId,
    TrangThai: "DANG_XU_LY",
    ThoiGianHen: { $lt: now },
    isDeleted: false,
  });

  const result = {
    tongXuLy,
    trungBinhSao: Math.round(trungBinhSao * 10) / 10,
    tyLeDungHan,
    breakdown: {
      trongThang,
      moiQuaHan,
    },
  };

  return sendResponse(res, 200, true, result, null, "Success");
});
```

---

### 4. Dashboard: Điều Phối Stats

```
GET /api/workmanagement/yeucau/dashboard/dieu-phoi
```

**Purpose**: Metrics cho người điều phối (hiển thị trên YeuCauDieuPhoiPage)

**Response**:

```json
{
  "success": true,
  "data": {
    "moiHomNay": 8,
    "dangChoXuLy": 15,
    "quaHan": 3,
    "breakdown": {
      "chuaDieuPhoi": 5,
      "daDieuPhoi": 10
    }
  }
}
```

**Implementation**:

```javascript
controller.layDashboardDieuPhoi = catchAsync(async (req, res, next) => {
  const { nhanVienId } = await getNhanVienId(req);
  const NhanVien = require("../../../models/NhanVien");
  const nhanVien = await NhanVien.findById(nhanVienId);
  const khoaId = nhanVien?.KhoaID;

  // Kiểm tra quyền
  const cauHinh = await CauHinhThongBaoKhoa.findOne({ KhoaID: khoaId });
  if (!cauHinh?.laNguoiDieuPhoi(nhanVienId)) {
    throw new AppError(403, "Không có quyền điều phối", "PERMISSION_DENIED");
  }

  const baseFilter = {
    KhoaDichID: khoaId,
    isDeleted: false,
  };

  // Mới hôm nay
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const moiHomNay = await YeuCau.countDocuments({
    ...baseFilter,
    createdAt: { $gte: startOfDay },
  });

  // Đang chờ xử lý
  const dangChoXuLy = await YeuCau.countDocuments({
    ...baseFilter,
    TrangThai: { $in: ["MOI", "DANG_XU_LY"] },
  });

  // Quá hạn
  const now = new Date();
  const quaHan = await YeuCau.countDocuments({
    ...baseFilter,
    TrangThai: "DANG_XU_LY",
    ThoiGianHen: { $lt: now },
  });

  // Breakdown
  const chuaDieuPhoi = await YeuCau.countDocuments({
    ...baseFilter,
    TrangThai: "MOI",
    LoaiNguoiNhan: "KHOA",
    NguoiDuocDieuPhoiID: null,
  });

  const daDieuPhoi = await YeuCau.countDocuments({
    ...baseFilter,
    TrangThai: "MOI",
    NguoiDuocDieuPhoiID: { $ne: null },
  });

  const result = {
    moiHomNay,
    dangChoXuLy,
    quaHan,
    breakdown: {
      chuaDieuPhoi,
      daDieuPhoi,
    },
  };

  return sendResponse(res, 200, true, result, null, "Success");
});
```

---

### 5. Enhanced List API với Filter Shortcuts

**Update existing**: `GET /api/workmanagement/yeucau`

**New Query Params**:

```
?role=xu-ly              # Shortcut cho người xử lý
?role=dieu-phoi          # Shortcut cho điều phối
?tab=moi-den             # Combine với role
?ChuaDieuPhoi=true       # NguoiDuocDieuPhoiID = null
?DaDieuPhoi=true         # NguoiDuocDieuPhoiID != null
?QuaHan=true             # ThoiGianHen < now
```

**Implementation**:

```javascript
// yeuCau.service.js - layDanhSach()
function buildFilterQuery(filters, nhanVienId, khoaId) {
  const query = { isDeleted: false };

  // Role shortcuts
  if (filters.role === "xu-ly") {
    query.$or = [
      { NguoiDuocDieuPhoiID: nhanVienId, TrangThai: "MOI" },
      { NguoiXuLyID: nhanVienId },
    ];
    return query;
  }

  if (filters.role === "dieu-phoi") {
    query.KhoaDichID = khoaId;
    if (filters.tab === "moi-den") {
      query.TrangThai = "MOI";
      query.LoaiNguoiNhan = "KHOA";
      query.NguoiDuocDieuPhoiID = null;
    }
    // ... other tabs
    return query;
  }

  // Standard filters
  if (filters.KhoaDichID) query.KhoaDichID = filters.KhoaDichID;
  if (filters.KhoaNguonID) query.KhoaNguonID = filters.KhoaNguonID;
  if (filters.TrangThai?.length > 0)
    query.TrangThai = { $in: filters.TrangThai };
  if (filters.NhanVienTaoID) query.NguoiYeuCauID = filters.NhanVienTaoID;
  if (filters.NhanVienXuLyID) query.NguoiXuLyID = filters.NhanVienXuLyID;

  // Special filters
  if (filters.ChuaDieuPhoi === "true") {
    query.NguoiDuocDieuPhoiID = null;
  }
  if (filters.DaDieuPhoi === "true") {
    query.NguoiDuocDieuPhoiID = { $ne: null };
  }
  if (filters.QuaHan === "true") {
    query.ThoiGianHen = { $lt: new Date() };
    query.TrangThai = { $in: ["MOI", "DANG_XU_LY"] };
  }

  return query;
}
```

---

## Routes Registration

```javascript
// routes/yeucau.api.js

// Dashboard routes (phải đặt TRƯỚC /:id)
router.get("/dashboard/metrics", yeuCauController.layDashboardMetrics);
router.get("/dashboard/xu-ly", yeuCauController.layDashboardXuLy);
router.get("/dashboard/dieu-phoi", yeuCauController.layDashboardDieuPhoi);

// Permission & badge routes
router.get("/my-permissions", yeuCauController.layQuyenCuaToi);
router.get("/badge-counts", yeuCauController.layBadgeCounts);

// ... existing routes
```

---

## Database Indexes

**Thêm indexes mới cho performance:**

```javascript
// models/YeuCau.js

// Existing indexes
yeuCauSchema.index({ KhoaDichID: 1, TrangThai: 1 });
yeuCauSchema.index({ NguoiYeuCauID: 1, TrangThai: 1 });

// New composite indexes cho role-based queries
yeuCauSchema.index({
  NguoiDuocDieuPhoiID: 1,
  TrangThai: 1,
  isDeleted: 1,
});

yeuCauSchema.index({
  NguoiXuLyID: 1,
  TrangThai: 1,
  isDeleted: 1,
});

yeuCauSchema.index({
  KhoaDichID: 1,
  LoaiNguoiNhan: 1,
  NguoiDuocDieuPhoiID: 1,
  TrangThai: 1,
  isDeleted: 1,
});

yeuCauSchema.index({
  TrangThai: 1,
  ThoiGianHen: 1,
  isDeleted: 1,
});

yeuCauSchema.index({
  createdAt: -1,
  KhoaDichID: 1,
});
```

---

## Testing Checklist

- [ ] Test `/my-permissions` với user có nhiều vai trò
- [ ] Test `/badge-counts` performance với >1000 yêu cầu
- [ ] Test dashboard APIs với empty data
- [ ] Test filter shortcuts combine với pagination
- [ ] Load test với 100 concurrent requests
- [ ] Test indexes với explain() để verify query plan

---

**Maintained by**: Development Team  
**Last Updated**: 08/12/2025
