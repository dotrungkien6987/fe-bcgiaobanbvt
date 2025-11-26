# Kiến trúc Hệ thống KPI - Chi tiết Kỹ thuật

**Version:** 2.1  
**Last Updated:** 26/11/2025

---

## 📋 Mục lục

1. [Tổng quan kiến trúc](#tổng-quan-kiến-trúc)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Data Models](#data-models)
5. [Data Flow](#data-flow)
6. [State Management](#state-management)
7. [API Integration](#api-integration)

---

## 🏛️ Tổng quan kiến trúc

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Nhân viên   │  │   Manager    │  │    Admin     │         │
│  │ Tự đánh giá │  │  Chấm điểm   │  │  Báo cáo     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
           │                    │                    │
           └────────────────────┼────────────────────┘
                                │
                    HTTP/REST API (Axios)
                                │
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React 18)                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Pages Layer                                             │   │
│  │  - TuDanhGiaKPIPage (Self-assessment)                   │   │
│  │  - DanhGiaKPIPage (Manager scoring - Legacy)            │   │
│  │  - DanhGiaKPIDashboard (Manager dashboard - V2)         │   │
│  │  - BaoCaoKPIPage (Reports)                              │   │
│  │  - XemKPIPage (View KPI details)                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Redux Store (State Management)                         │   │
│  │  - kpiSlice.js (Legacy + V2 hybrid, 1704 lines)        │   │
│  │  - kpiEvaluationSlice.js (V2 cycle workflow, 283 lines)│   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Business Logic Utils                                    │   │
│  │  - kpiCalculation.js (Real-time preview formula)        │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  UI Components (Material-UI v5)                         │   │
│  │  - DanhGiaKPITable, DanhGiaKPIFormDialog                │   │
│  │  - ChamDiemKPIDialog, ChamDiemKPITable (V2)             │   │
│  │  - KPIChartByNhanVien, SelectNhanVien                   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                │
                    HTTP/REST API (29 endpoints)
                                │
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  API Routes Layer                                        │   │
│  │  /api/workmanagement/kpi/*                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Controllers Layer (Business Logic)                     │   │
│  │  kpi.controller.js (3040 lines, 29 methods)            │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Models Layer (Mongoose ODM)                            │   │
│  │  - DanhGiaKPI.js (344 lines)                           │   │
│  │  - DanhGiaNhiemVuThuongQuy.js (310 lines)              │   │
│  │  - NhanVienNhiemVu.js (201 lines)                      │   │
│  │  - ChuKyDanhGia.js (Referenced)                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Helpers & Utils                                         │   │
│  │  - criteriaSync.helper.js (Detect changes)              │   │
│  │  - utils.js (catchAsync, sendResponse, AppError)        │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                │
                         MongoDB Database
                                │
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (MongoDB)                           │
│  Collections:                                                   │
│  - danhgiakpi (KPI evaluations wrapper)                        │
│  - danhgianhiemvuthuongquy (Task evaluations detail)           │
│  - nhanviennhiemvu (Employee assignments + self-assessment)    │
│  - chukydanhgia (Evaluation cycles)                            │
│  - nhiemvuthuongquy (Routine duties master)                    │
│  - nhanvien (Employees)                                        │
│  - quanlynhanvien (Manager-Employee relationships)             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Frontend Architecture

### Folder Structure

```
KPI/
├── docs/                           # 📚 Tài liệu (file này)
│   ├── README.md
│   ├── ARCHITECTURE.md
│   ├── FORMULA_CALCULATION.md
│   ├── WORKFLOW.md
│   ├── API_REFERENCE.md
│   ├── UI_COMPONENTS.md
│   └── MIGRATION_V2.md
│
├── pages/                          # 📄 Page components
│   ├── TuDanhGiaKPIPage.js        # Nhân viên tự đánh giá
│   ├── DanhGiaKPIPage.js          # Manager chấm điểm (Legacy - không route)
│   ├── XemKPIPage.js              # Xem chi tiết KPI
│   ├── KPIEvaluationPage.js       # ✅ ACTIVE - Main page cho Manager đánh giá
│   ├── TuDanhGiaKPIPage_old.js    # Backup file
│   └── BaoCaoKPIPage.js           # Re-export báo cáo
│
├── v2/                             # 🆕 V2 Architecture (Cycle-based)
│   ├── pages/
│   │   └── DanhGiaKPIDashboard.js # Dashboard quản lý V2
│   └── components/
│       ├── index.js               # Export barrel
│       ├── ChamDiemKPIDialog.js   # Dialog chấm điểm V2 (1508 lines)
│       ├── ChamDiemKPITable.js    # Table hiển thị nhiệm vụ
│       ├── QuickScoreDialog.js    # Dialog chấm điểm nhanh
│       ├── NhiemVuAccordion.js    # Accordion hiển thị nhiệm vụ
│       ├── TieuChiGrid.js         # Grid tiêu chí đánh giá
│       ├── StatCard.js            # Card thống kê dashboard
│       ├── KPIHistoryDialog.js    # Dialog lịch sử KPI
│       ├── CongViecCompactCard.js # Card công việc dạng compact
│       └── dashboard/
│           └── CongViecDashboard.js
│
├── components/                     # 🧩 Reusable components
│   ├── DanhGiaKPITable.js         # Table Legacy
│   ├── DanhGiaKPIFormDialog.js    # Form dialog Legacy
│   ├── DanhGiaKPIDetailDialog.js  # Detail dialog
│   ├── KPIChartByNhanVien.js      # Chart component
│   └── SelectNhanVien/            # Employee selector
│       └── SelectNhanVienButton.js
│
├── kpiSlice.js                     # Redux slice (Legacy + V2)
├── kpiEvaluationSlice.js           # Redux slice V2 (Cycle workflow)
├── kpiCoreSlice.js                 # ⚠️ EMPTY FILE - Deprecated
│
└── _archive_*/                     # 🗄️ Archived files
    └── ...
```

### Redux State Architecture

#### kpiSlice.js (1704 lines - Hybrid Legacy + V2)

**Purpose:** Main Redux slice cho toàn bộ KPI features

**State Structure:**

```javascript
{
  // Data states
  danhGiaKPIs: [],              // Danh sách đánh giá KPI
  danhGiaKPICurrent: null,      // Đánh giá KPI đang xem/chỉnh sửa
  nhiemVuThuongQuys: [],        // Danh sách nhiệm vụ của KPI hiện tại
  danhSachDanhGiaKPI: [],       // V2: List used by reducers
  thongKeKPIs: [],              // Thống kê KPI
  chuKyDanhGias: [],            // Danh sách chu kỳ
  selectedChuKyDanhGia: null,   // Chu kỳ đang xem
  nhanVienDuocQuanLy: [],       // Nhân viên được quản lý

  // V2 Features
  autoSelectedChuKy: null,      // Auto-select chu kỳ (3-tier priority)
  dashboardData: {              // Dashboard data
    nhanVienList: [],           // { nhanVien, danhGiaKPI, progress }
    summary: { /* stats */ }
  },

  // Chấm điểm detail (khi mở dialog)
  currentDanhGiaKPI: null,      // Unified: replace danhGiaKPICurrent
  currentNhiemVuList: [],       // Unified: replace nhiemVuThuongQuys
  syncWarning: null,            // Criteria change detection

  // Self-assessment
  assignments: [],              // NhanVienNhiemVu cho tự đánh giá
  currentNhanVien: null,        // Thông tin NhanVien hiện tại

  // UI states
  isLoading: false,
  isSaving: false,
  error: null,
  isOpenFormDialog: false,
  isOpenDetailDialog: false,
  formMode: "create" | "edit",

  // Filters
  filterChuKyID: null,
  filterNhanVienID: null,
  filterTrangThai: null,
  searchTerm: "",

  // Dashboard for tasks
  congViecDashboard: {}         // { "nvId_chuKyId": { data, isLoading } }
}
```

**Key Actions:**

```javascript
// CRUD Actions
-getDanhGiaKPIsSuccess(state, action) -
  getDanhGiaKPIDetailSuccess(state, action) -
  createDanhGiaKPISuccess(state, action) -
  updateDanhGiaKPISuccess(state, action) -
  deleteDanhGiaKPISuccess(state, action) -
  // Scoring Actions
  chamDiemNhiemVuSuccess(state, action) -
  updateTieuChiScore(state, action) - // Real-time preview
  // Approval Actions
  duyetDanhGiaKPISuccess(state, action) -
  huyDuyetDanhGiaKPISuccess(state, action) -
  // V2 Dashboard Actions
  getDashboardSuccess(state, action) -
  autoSelectChuKySuccess(state, action) -
  // Self-assessment Actions
  layDanhSachNhiemVuSuccess(state, action) -
  nhanVienTuChamDiemSuccess(state, action);
```

**Key Thunks:**

```javascript
// CRUD Thunks
export const getDanhGiaKPIs = (filters) => async(dispatch);
export const getDanhGiaKPIDetail = (id) => async(dispatch);
export const createDanhGiaKPI = (data) => async(dispatch);
export const duyetDanhGiaKPI = (id, nhanXet) => async(dispatch);

// V2 Dashboard
export const getDashboard = (chuKyId) => async(dispatch);
export const autoSelectChuKy = () => async(dispatch);

// Self-assessment
export const layDanhSachNhiemVu = (nhanVienId, chuKyId) => async(dispatch);
export const nhanVienTuChamDiemBatch = (data) => async(dispatch);
```

---

#### kpiEvaluationSlice.js (283 lines - V2 Cycle Workflow)

**Purpose:** Simplified workflow cho đánh giá theo chu kỳ (V2 architecture)

**State Structure:**

```javascript
{
  cycles: [],                   // Danh sách chu kỳ
  selectedCycleId: null,        // Chu kỳ đang chọn
  employees: [],                // Danh sách nhân viên
  tasksForEvaluation: [],       // Nhiệm vụ cần đánh giá
  currentEmployee: null,        // Nhân viên đang đánh giá
  kpiScores: {},                // { employeeId: { DiemKPI, XepLoai, ... } }

  isLoading: false,
  isSaving: false,
  error: null
}
```

**Key Actions:**

```javascript
export const getCycles = () => async(dispatch);
export const setSelectedCycle = (cycleId) => dispatch;
export const getEmployeesForEvaluation = (cycleId) => async(dispatch);
export const fetchTasksForEvaluation = (employeeId, cycleId) => async(dispatch);
export const saveEvaluation = (employeeId, cycleId, evaluations) =>
  async(dispatch);
export const calculateKPI = (employeeId, cycleId) => async(dispatch);
```

**Usage:**

```javascript
// V2 Dashboard workflow
dispatch(getCycles());
dispatch(setSelectedCycle(chuKyId));
dispatch(getEmployeesForEvaluation(chuKyId));

// Chấm điểm cho 1 nhân viên
dispatch(fetchTasksForEvaluation(nhanVienId, chuKyId));
dispatch(saveEvaluation(nhanVienId, chuKyId, evaluations));
dispatch(calculateKPI(nhanVienId, chuKyId));
```

---

### Calculation Utilities

#### utils/kpiCalculation.js (194 lines)

**Purpose:** Real-time preview công thức tính điểm KPI (trước khi duyệt)

**Key Functions:**

```javascript
/**
 * Tính tổng điểm KPI - Preview
 */
export const calculateTotalScore = (nhiemVuList, diemTuDanhGiaMap) => {
  let tongDiemKPI = 0;
  const chiTiet = [];

  nhiemVuList.forEach((nv) => {
    const nvId = nv.NhiemVuThuongQuyID?._id || nv.NhiemVuThuongQuyID;
    const diemTuDanhGia = diemTuDanhGiaMap[nvId?.toString()] || 0;

    let diemTang = 0;
    let diemGiam = 0;

    // Tính điểm từng tiêu chí
    nv.ChiTietDiem.forEach((tc) => {
      let diemCuoiCung = 0;

      // ✅ CÔNG THỨC DUY NHẤT
      if (tc.IsMucDoHoanThanh) {
        const diemQuanLy = tc.DiemDat || 0;
        diemCuoiCung = (diemQuanLy * 2 + diemTuDanhGia) / 3;
      } else {
        diemCuoiCung = tc.DiemDat || 0;
      }

      const diemScaled = diemCuoiCung / 100;

      if (tc.LoaiTieuChi === "TANG_DIEM") {
        diemTang += diemScaled;
      } else {
        diemGiam += diemScaled;
      }
    });

    const tongDiemTieuChi = diemTang - diemGiam;
    const diemNhiemVu = (nv.MucDoKho || 5) * tongDiemTieuChi;

    tongDiemKPI += diemNhiemVu;
    chiTiet.push({
      /* ... */
    });
  });

  return { tongDiem: tongDiemKPI, chiTiet };
};

/**
 * Tính điểm nhiệm vụ đơn lẻ
 */
export const calculateNhiemVuScore = (nhiemVu, diemTuDanhGia = 0) => {
  // Same logic as above for single task
  return { diemTang, diemGiam, tongDiemTieuChi, diemNhiemVu };
};
```

**⚠️ CRITICAL:** Code này phải **GIỐNG HỆT** với backend method `duyet()` để preview chính xác!

---

## 🔧 Backend Architecture

### Folder Structure

```
giaobanbv-be/modules/workmanagement/
├── controllers/
│   └── kpi.controller.js           # 3040 lines, 29 methods
│
├── models/
│   ├── DanhGiaKPI.js               # 344 lines
│   ├── DanhGiaNhiemVuThuongQuy.js  # 310 lines
│   ├── NhanVienNhiemVu.js          # 201 lines
│   ├── ChuKyDanhGia.js             # (Referenced)
│   ├── NhiemVuThuongQuy.js         # (Referenced)
│   ├── QuanLyNhanVien.js           # (Referenced)
│   └── index.js                    # Model exports
│
├── routes/
│   └── kpi.api.js                  # API routes definitions
│
├── helpers/
│   └── criteriaSync.helper.js      # Detect criteria changes
│
└── docs/                           # Backend docs (nếu có)
```

### Controller Architecture

#### kpi.controller.js (3040 lines, 29 methods)

**Categories:**

1. **CRUD Operations (7 endpoints)**

   - `taoDanhGiaKPI` - POST /kpi
   - `layDanhSachDanhGiaKPI` - GET /kpi
   - `layChiTietDanhGiaKPI` - GET /kpi/:id
   - `layDanhSachKPITheoChuKy` - GET /kpi/chu-ky/:chuKyId
   - `layLichSuKPINhanVien` - GET /kpi/nhan-vien/:nhanVienId
   - `phanHoiDanhGiaKPI` - PUT /kpi/:id/phan-hoi
   - `xoaDanhGiaKPI` - DELETE /kpi/:id

2. **Scoring Operations (5 endpoints)**

   - `chamDiemNhiemVu` - PUT /kpi/nhiem-vu/:nhiemVuId
   - `getTasksForEvaluation` - GET /kpi/nhan-vien/:id/nhiem-vu
   - `saveEvaluation` - POST /kpi/nhan-vien/:id/danh-gia
   - `nhanVienChamDiem` - PUT /kpi/danh-gia-nhiem-vu/:id/nhan-vien-cham-diem
   - `quanLyChamDiem` - PUT /kpi/danh-gia-nhiem-vu/:id/quan-ly-cham-diem

3. **Approval Operations (4 endpoints)**

   - `duyetDanhGiaKPI` - PUT /kpi/:id/duyet (Legacy)
   - `duyetKPITieuChi` - POST /kpi/duyet-kpi-tieu-chi/:id (V2)
   - `huyDuyetDanhGiaKPI` - PUT /kpi/:id/huy-duyet (Legacy)
   - `huyDuyetKPI` - POST /kpi/huy-duyet-kpi/:id (V2)

4. **Dashboard & Statistics (3 endpoints)**

   - `getDashboard` - GET /kpi/dashboard/:chuKyId
   - `thongKeKPITheoChuKy` - GET /kpi/thong-ke/chu-ky/:chuKyId
   - `calculateKPIForEmployee` - GET /kpi/nhan-vien/:id/diem-kpi

5. **Reports (3 endpoints)**

   - `getBaoCaoThongKe` - GET /kpi/bao-cao/thong-ke
   - `getBaoCaoChiTiet` - GET /kpi/bao-cao/chi-tiet
   - `exportBaoCaoExcel` - GET /kpi/bao-cao/export-excel

6. **Utilities (7 endpoints)**
   - `resetCriteria` - POST /kpi/reset-criteria
   - `getChamDiemTieuChi` - GET /kpi/cham-diem-tieu-chi
   - `luuTatCaNhiemVu` - POST /kpi/luu-tat-ca/:id
   - `layDanhSachDanhGiaNhiemVu` - GET /kpi/danh-gia-nhiem-vu
   - `hasManagerScoreForTask` - GET /kpi/danh-gia-nhiem-vu/has-score
   - `getChamDiemDetail` - GET /kpi/cham-diem (Deprecated)

**Error Handling Pattern:**

```javascript
const { catchAsync, sendResponse, AppError } = require("helpers/utils");

kpiController.someMethod = catchAsync(async (req, res, next) => {
  // Validation
  if (!someCondition) {
    throw new AppError(400, "Error message", "ErrorType");
  }

  // Business logic
  const result = await SomeModel.find({
    /* ... */
  });

  // Response
  return sendResponse(res, 200, true, { data: result }, null, "Success");
});
```

---

## 📦 Data Models

### 1. DanhGiaKPI (Wrapper - 1 nhân viên trong 1 chu kỳ)

**File:** `models/DanhGiaKPI.js` (344 lines)

**Schema:**

```javascript
{
  ChuKyDanhGiaID: ObjectId,      // ref: ChuKyDanhGia
  NhanVienID: ObjectId,          // ref: NhanVien
  NguoiDanhGiaID: ObjectId,      // ref: NhanVien (Manager)

  // ✅ Snapshot khi duyệt
  TongDiemKPI: Number,           // 0 khi CHUA_DUYET, calculated khi DA_DUYET
  TrangThai: String,             // "CHUA_DUYET" | "DA_DUYET"

  NhanXetNguoiDanhGia: String,
  PhanHoiNhanVien: String,
  NgayDuyet: Date,
  NguoiDuyet: ObjectId,

  // ✅ Audit trail
  LichSuDuyet: [{
    NguoiDuyet: ObjectId,
    NgayDuyet: Date,
    TongDiemLucDuyet: Number,    // Snapshot
    GhiChu: String
  }],

  LichSuHuyDuyet: [{
    NguoiHuyDuyet: ObjectId,
    NgayHuyDuyet: Date,
    LyDoHuyDuyet: String,
    DiemTruocKhiHuy: Number,     // Snapshot
    NgayDuyetTruocDo: Date
  }],

  isDeleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**

```javascript
{ ChuKyDanhGiaID: 1, NhanVienID: 1 } unique
{ ChuKyDanhGiaID: 1 }
{ NhanVienID: 1 }
{ NguoiDanhGiaID: 1 }
{ TrangThai: 1 }
{ TongDiemKPI: -1 }
```

**Methods:**

```javascript
/**
 * ✅ V2: Duyệt KPI - Tự động tính TongDiemKPI
 */
danhGiaKPISchema.methods.duyet = async function (nhanXet, nguoiDuyetId) {
  // 1. Load DiemTuDanhGia từ NhanVienNhiemVu
  const assignments = await NhanVienNhiemVu.find({
    /* ... */
  });
  const diemTuDanhGiaMap = {};
  assignments.forEach((a) => {
    diemTuDanhGiaMap[a.NhiemVuThuongQuyID.toString()] = a.DiemTuDanhGia || 0;
  });

  // 2. Load evaluations
  const evaluations = await DanhGiaNhiemVuThuongQuy.find({
    /* ... */
  });

  // 3. Tính TongDiemKPI theo công thức V2
  let tongDiemKPI = 0;
  evaluations.forEach((nv) => {
    const diemTuDanhGia =
      diemTuDanhGiaMap[nv.NhiemVuThuongQuyID.toString()] || 0;

    let diemTang = 0,
      diemGiam = 0;
    nv.ChiTietDiem.forEach((tc) => {
      let diemCuoiCung = 0;

      if (tc.IsMucDoHoanThanh) {
        const diemQL = tc.DiemDat || 0;
        diemCuoiCung = (diemQL * 2 + diemTuDanhGia) / 3;
      } else {
        diemCuoiCung = tc.DiemDat || 0;
      }

      const diemScaled = diemCuoiCung / 100;
      if (tc.LoaiTieuChi === "TANG_DIEM") {
        diemTang += diemScaled;
      } else {
        diemGiam += diemScaled;
      }
    });

    const tongDiemTieuChi = diemTang - diemGiam;
    const diemNhiemVu = nv.MucDoKho * tongDiemTieuChi;
    tongDiemKPI += diemNhiemVu;
  });

  // 4. Snapshot
  this.TongDiemKPI = tongDiemKPI;
  this.TrangThai = "DA_DUYET";
  this.NgayDuyet = new Date();
  this.NguoiDuyet = nguoiDuyetId;

  // 5. Ghi lịch sử
  this.LichSuDuyet.push({
    NguoiDuyet: nguoiDuyetId,
    NgayDuyet: this.NgayDuyet,
    TongDiemLucDuyet: this.TongDiemKPI,
    GhiChu: nhanXet,
  });

  await this.save();
  return this;
};

/**
 * ✅ V2: Hủy duyệt KPI
 */
danhGiaKPISchema.methods.huyDuyet = async function (nguoiHuyId, lyDo) {
  if (this.TrangThai !== "DA_DUYET") {
    throw new Error("KPI chưa được duyệt");
  }

  // Lưu snapshot trước khi hủy
  this.LichSuHuyDuyet.push({
    NguoiHuyDuyet: nguoiHuyId,
    NgayHuyDuyet: new Date(),
    LyDoHuyDuyet: lyDo,
    DiemTruocKhiHuy: this.TongDiemKPI,
    NgayDuyetTruocDo: this.NgayDuyet,
  });

  // Reset về CHUA_DUYET
  this.TrangThai = "CHUA_DUYET";
  this.TongDiemKPI = 0;
  this.NgayDuyet = null;
  this.NguoiDuyet = null;

  await this.save();
  return this;
};
```

---

### 2. DanhGiaNhiemVuThuongQuy (Chi tiết từng nhiệm vụ)

**File:** `models/DanhGiaNhiemVuThuongQuy.js` (310 lines)

**Schema:**

```javascript
{
  DanhGiaKPIID: ObjectId,          // ref: DanhGiaKPI (parent)
  NhiemVuThuongQuyID: ObjectId,    // ref: NhiemVuThuongQuy
  NhanVienID: ObjectId,            // ref: NhanVien
  ChuKyDanhGiaID: ObjectId,        // ref: ChuKyDanhGia (for filtering)

  MucDoKho: Number,                // 1-10 (from assignment)

  // ✅ Embedded array - Copy từ ChuKy.TieuChiCauHinh
  ChiTietDiem: [{
    TenTieuChi: String,            // "Mức độ hoàn thành"
    LoaiTieuChi: String,           // "TANG_DIEM" | "GIAM_DIEM"

    DiemDat: Number,               // Manager nhập (0-100)

    IsMucDoHoanThanh: Boolean,     // ✅ true = Kết hợp DiemTuDanhGia
    GiaTriMin: Number,
    GiaTriMax: Number,
    DonVi: String,
    MoTa: String,
    ThuTu: Number,
    GhiChu: String
  }],

  SoCongViecLienQuan: Number,      // Reference only
  GhiChu: String,
  TrangThai: String,               // "CHUA_DUYET" | "DA_DUYET"
  NgayDuyet: Date,
  NguoiDuyetID: ObjectId,

  isDeleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**⚠️ V2 Changes:**

```javascript
// ❌ REMOVED: TongDiemTieuChi (calculated field)
// ❌ REMOVED: DiemNhiemVu (calculated field)
// ❌ REMOVED: Pre-save hook (auto-calculate)
// ❌ REMOVED: Post-save hook (update parent)

// ✅ V2: Không lưu calculated fields
// → Tính real-time ở frontend (preview)
// → Tính 1 lần khi duyệt (snapshot trong parent)
```

**Indexes:**

```javascript
{
  DanhGiaKPIID: 1;
}
{
  NhiemVuThuongQuyID: 1;
}
{
  NhanVienID: 1;
}
{
  ChuKyDanhGiaID: 1;
}
{
  TrangThai: 1;
}
```

---

### 3. NhanVienNhiemVu (Assignment + Self-assessment)

**File:** `models/NhanVienNhiemVu.js` (201 lines)

**Schema:**

```javascript
{
  NhanVienID: ObjectId,            // ref: NhanVien
  NhiemVuThuongQuyID: ObjectId,    // ref: NhiemVuThuongQuy

  // ✅ NEW: Gán theo chu kỳ (null = vĩnh viễn)
  ChuKyDanhGiaID: ObjectId,        // ref: ChuKyDanhGia (null = permanent)

  // ✅ NEW: Độ khó thực tế (user nhập khi gán)
  MucDoKho: Number,                // 1.0-10.0 (1 decimal allowed)

  // ✅ NEW: Điểm tự đánh giá
  DiemTuDanhGia: Number,           // 0-100%, null = chưa tự chấm
  NgayTuCham: Date,                // Thời gian tự chấm

  TrangThaiHoatDong: Boolean,
  NgayGan: Date,
  NguoiGanID: ObjectId,
  isDeleted: Boolean,

  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**

```javascript
{ NhanVienID: 1, NhiemVuThuongQuyID: 1 } // Non-unique
{ NhanVienID: 1, NhiemVuThuongQuyID: 1, ChuKyDanhGiaID: 1 } unique
{ ChuKyDanhGiaID: 1 }
{ NhanVienID: 1 }
```

**⚠️ Migration Note:**

```javascript
// Old: 1 assignment per employee (unique: NhanVienID + NhiemVuThuongQuyID)
// New: Multiple assignments per cycle (unique: NhanVienID + NhiemVuThuongQuyID + ChuKyDanhGiaID)

// Migration: Thêm ChuKyDanhGiaID = null cho records cũ
```

---

## 🔄 Data Flow

### Flow 1: Tạo chu kỳ & gán nhiệm vụ

```
[1] Admin tạo ChuKyDanhGia
    → TieuChiCauHinh: [
        { TenTieuChi: "Mức độ hoàn thành", IsMucDoHoanThanh: true, ... },
        { TenTieuChi: "Điểm tích cực", IsMucDoHoanThanh: false, ... }
      ]

[2] Manager gán nhiệm vụ
    → POST /api/workmanagement/giao-nhiem-vu
    → Tạo NhanVienNhiemVu:
       { NhanVienID, NhiemVuThuongQuyID, ChuKyDanhGiaID, MucDoKho: 7 }
```

---

### Flow 2: Nhân viên tự đánh giá

```
[1] Frontend: TuDanhGiaKPIPage.js
    → useEffect: dispatch(layDanhSachNhiemVu(nhanVienId, chuKyId))

[2] Redux thunk: layDanhSachNhiemVu
    → GET /api/workmanagement/kpi/nhan-vien/:id/nhiem-vu?chuKyId=xxx

[3] Backend: kpiController.getTasksForEvaluation
    → Find NhanVienNhiemVu where { NhanVienID, ChuKyDanhGiaID }
    → Populate NhiemVuThuongQuyID
    → Return: { nhiemVuList: [...] }

[4] Frontend: Render danh sách nhiệm vụ + slider
    → User kéo slider → setScores({ assignmentId: 85 })
    → User nhấn "Lưu tất cả"

[5] Redux thunk: nhanVienTuChamDiemBatch
    → POST /api/workmanagement/kpi/nhan-vien/:id/danh-gia
    → Body: { chuKyId, evaluations: [{ assignmentId, DiemTuDanhGia: 85 }] }

[6] Backend: kpiController.saveEvaluation
    → Loop evaluations:
       NhanVienNhiemVu.findByIdAndUpdate(assignmentId, {
         DiemTuDanhGia: 85,
         NgayTuCham: new Date()
       })
    → Return: { success: true }

[7] Frontend: toast.success("Lưu thành công")
```

---

### Flow 3: Manager chấm điểm (V2 Dashboard)

```
[1] Frontend: DanhGiaKPIDashboard.js
    → useEffect: dispatch(getDashboard(chuKyId))

[2] Redux thunk: getDashboard
    → GET /api/workmanagement/kpi/dashboard/:chuKyId

[3] Backend: kpiController.getDashboard
    → Find QuanLyNhanVien where { NhanVienQuanLy: currentUser.NhanVienID }
    → For each employee:
       - Find NhanVienNhiemVu (assignments in cycle)
       - Find DanhGiaKPI (existing evaluation)
       - Calculate progress: { scored, total, percentage }
    → Return: { nhanVienList: [...], summary: {...} }

[4] Frontend: Render dashboard table
    → User click vào nhân viên → Open ChamDiemKPIDialog

[5] Dialog: Load chi tiết
    → dispatch(getChamDiemTieuChi(danhGiaKPIId))
    → GET /api/workmanagement/kpi/cham-diem-tieu-chi?danhGiaKPIId=xxx

[6] Backend: kpiController.getChamDiemTieuChi
    → If DanhGiaKPI not exist:
       - Create DanhGiaKPI + DanhGiaNhiemVuThuongQuy[]
       - Copy TieuChiCauHinh from ChuKy → ChiTietDiem[]
    → Populate everything
    → Return: { danhGiaKPI, nhiemVuList: [...] }

[7] Frontend: Render table with criteria
    → User nhập DiemDat cho từng tiêu chí
    → onChange: dispatch(updateTieuChiScore(nhiemVuId, tieuChiId, diemDat))

[8] Redux reducer: updateTieuChiScore
    → Update state.currentNhiemVuList[i].ChiTietDiem[j].DiemDat = diemDat
    → Recalculate preview:
       const preview = calculateTotalScore(currentNhiemVuList, diemTuDanhGiaMap)
       state.currentDanhGiaKPI.TongDiemKPI_Preview = preview.tongDiem

[9] User nhấn "Lưu tất cả"
    → dispatch(luuTatCaNhiemVu(danhGiaKPIId, nhiemVuList))
    → POST /api/workmanagement/kpi/luu-tat-ca/:danhGiaKPIId
    → Backend: Batch upsert DanhGiaNhiemVuThuongQuy[]

[10] User nhấn "Duyệt KPI"
     → dispatch(duyetKPITieuChi(danhGiaKPIId, nhiemVuList, nhanXet))
     → POST /api/workmanagement/kpi/duyet-kpi-tieu-chi/:danhGiaKPIId

[11] Backend: kpiController.duyetKPITieuChi
     → Batch upsert DanhGiaNhiemVuThuongQuy[]
     → Call danhGiaKPI.duyet(nhanXet, nguoiDuyetId)
     → Method duyet() tính TongDiemKPI chính thức
     → Return: { danhGiaKPI (updated), nhiemVuList }

[12] Frontend: toast.success("Duyệt KPI thành công")
     → Close dialog
     → Refresh dashboard
```

---

### Flow 4: Hủy duyệt KPI

```
[1] Admin/Manager click "Hủy duyệt"
    → Mở dialog nhập lý do

[2] User nhập lý do → Submit
    → dispatch(huyDuyetKPI(danhGiaKPIId, lyDo))
    → POST /api/workmanagement/kpi/huy-duyet-kpi/:danhGiaKPIId
    → Body: { lyDo: "Cần điều chỉnh..." }

[3] Backend: kpiController.huyDuyetKPI
    → Permission check (Admin only)
    → Find DanhGiaKPI
    → Call danhGiaKPI.huyDuyet(nguoiHuyId, lyDo)

[4] Method huyDuyet():
    → Validate: TrangThai === "DA_DUYET"
    → Snapshot:
       LichSuHuyDuyet.push({
         NguoiHuyDuyet,
         NgayHuyDuyet,
         LyDoHuyDuyet,
         DiemTruocKhiHuy: this.TongDiemKPI,
         NgayDuyetTruocDo: this.NgayDuyet
       })
    → Reset:
       TrangThai = "CHUA_DUYET"
       TongDiemKPI = 0
       NgayDuyet = null
       NguoiDuyet = null
    → Save

[5] Frontend: toast.success("Đã hủy duyệt KPI")
    → Refresh data
```

---

## 🔐 Authentication & Authorization

### Permission Checks

```javascript
// 1. Quản lý chỉ chấm KPI cho nhân viên được quản lý
const quanLy = await QuanLyNhanVien.findOne({
  NhanVienQuanLy: currentUser.NhanVienID,
  NhanVienDuocQuanLy: targetNhanVienID,
  LoaiQuanLy: "KPI",
  isDeleted: false,
});

if (!quanLy) {
  throw new AppError(403, "Không có quyền chấm KPI", "Forbidden");
}

// 2. Nhân viên chỉ xem KPI của mình
const isOwner = danhGiaKPI.NhanVienID.toString() === currentUser.NhanVienID;
const isManager =
  danhGiaKPI.NguoiDanhGiaID.toString() === currentUser.NhanVienID;
const isAdmin = currentUser.PhanQuyen === "admin";

if (!isOwner && !isManager && !isAdmin) {
  throw new AppError(403, "Không có quyền xem", "Forbidden");
}

// 3. Chỉ Admin mới hủy duyệt KPI
if (currentUser.PhanQuyen !== "admin") {
  throw new AppError(403, "Chỉ Admin mới được hủy duyệt KPI", "Forbidden");
}
```

### Middleware Chain

```javascript
// Route definition
router.post(
  "/kpi/duyet-kpi-tieu-chi/:danhGiaKPIId",
  authentication.loginRequired, // Xác thực JWT
  validateQuanLy, // Gắn req.currentNhanVienID
  kpiController.duyetKPITieuChi
);
```

---

## 🚀 Performance Optimizations

### 1. Indexes

```javascript
// DanhGiaKPI
{ ChuKyDanhGiaID: 1, NhanVienID: 1 } unique  // Fast lookup per cycle+employee
{ TongDiemKPI: -1 }                          // Fast sorting for reports

// DanhGiaNhiemVuThuongQuy
{ DanhGiaKPIID: 1 }                          // Fast child lookup
{ ChuKyDanhGiaID: 1 }                        // Fast filtering by cycle

// NhanVienNhiemVu
{ NhanVienID: 1, ChuKyDanhGiaID: 1 }         // Fast assignment lookup
```

### 2. Populate Strategy

```javascript
// ❌ BAD: Over-populate
await DanhGiaKPI.find()
  .populate("NhanVienID")
  .populate("NguoiDanhGiaID")
  .populate("ChuKyDanhGiaID")
  .populate("DanhSachDanhGiaNhiemVu"); // N+1 queries

// ✅ GOOD: Select only needed fields
await DanhGiaKPI.find()
  .populate("NhanVienID", "HoTen MaNhanVien")
  .populate("ChuKyDanhGiaID", "TenChuKy NgayBatDau NgayKetThuc")
  .lean(); // Convert to plain object (faster)
```

### 3. Batch Operations

```javascript
// ✅ Batch upsert instead of loop updates
const bulkOps = evaluations.map((ev) => ({
  updateOne: {
    filter: { _id: ev._id },
    update: { $set: { ChiTietDiem: ev.ChiTietDiem } },
    upsert: false,
  },
}));

await DanhGiaNhiemVuThuongQuy.bulkWrite(bulkOps);
```

---

## 📝 Naming Conventions

### Backend (Vietnamese without accents)

```javascript
// Models
DanhGiaKPI;
DanhGiaNhiemVuThuongQuy;
NhanVienNhiemVu;

// Fields
TongDiemKPI;
NguoiDanhGiaID;
ChiTietDiem;

// Controller methods
layDanhSachDanhGiaKPI;
chamDiemNhiemVu;
duyetDanhGiaKPI;
```

### Frontend (Mixed camelCase)

```javascript
// Components
DanhGiaKPIPage
TuDanhGiaKPIPage
ChamDiemKPIDialog

// Redux actions
getDanhGiaKPIs
chamDiemNhiemVuSuccess
duyetDanhGiaKPISuccess

// State fields
danhGiaKPIs (array)
danhGiaKPICurrent (single object)
isLoading
```

---

## 🔄 Version History

### V2 (Current - 25/11/2025)

- ✅ Cycle-based workflow (kpiEvaluationSlice)
- ✅ Self-assessment integration (DiemTuDanhGia)
- ✅ Simplified models (no calculated fields)
- ✅ Audit trail (LichSuDuyet, LichSuHuyDuyet)
- ✅ Real-time preview (kpiCalculation.js)
- ✅ Dashboard V2 (DanhGiaKPIDashboard)

### V1 (Legacy)

- Tài liệu lưu tại `_archive_docs_2025-11-25/`
- Một số UI components vẫn dùng (DanhGiaKPIPage)

---

**🎯 Next:** Xem [FORMULA_CALCULATION.md](./FORMULA_CALCULATION.md) để hiểu chi tiết công thức tính điểm.
