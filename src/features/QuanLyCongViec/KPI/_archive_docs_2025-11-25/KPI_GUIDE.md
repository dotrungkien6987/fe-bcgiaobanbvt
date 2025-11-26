# KPI Management System - Complete Guide

**Version:** 3.1 (UI Upgrade)  
**Last Updated:** October 15, 2025  
**Status:** Production Ready ✅

---

## 🎨 UI Upgrade v2.1.0 - NEW!

### Recent Enhancements (15/10/2025)

Giao diện đã được **nâng cấp toàn diện** với thiết kế hiện đại và professional:

#### ✨ Key Improvements

- **📝 Font chữ nhiệm vụ tăng 20%** (14px → 17px) - Dễ đọc hơn!
- **🎨 Gradient header** sang trọng (Purple → Blue)
- **📊 Glassmorphism effects** cho progress section
- **🌈 Color-coded table** (Green ↑ / Red ↓ / Orange 🎯)
- **✨ Smooth animations** & hover effects
- **💡 Enhanced visual feedback** throughout

#### 📚 UI Documentation

- **[UI_UPGRADE_SUMMARY.md](./UI_UPGRADE_SUMMARY.md)** - Chi tiết thay đổi
- **[VISUAL_COMPARISON.md](./VISUAL_COMPARISON.md)** - So sánh trước/sau
- **[CUSTOMIZATION_GUIDE.md](./CUSTOMIZATION_GUIDE.md)** - Hướng dẫn tùy chỉnh
- **[IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md)** - Tracking

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Business Logic](#business-logic)
5. [User Workflow](#user-workflow)
6. [Components Guide](#components-guide)
7. [Redux State Management](#redux-state-management)
8. [API Reference](#api-reference)
9. [Testing](#testing)

---

## Overview

### What is KPI System?

Hệ thống đánh giá KPI cho phép quản lý đánh giá hiệu suất nhân viên dựa trên:

- **Nhiệm vụ thường quy** (NhiemVuThuongQuy) được giao
- **Tiêu chí đánh giá động** (TieuChiDanhGia) với loại TANG_DIEM/GIAM_DIEM
- **Chu kỳ đánh giá** (ChuKyDanhGia) theo tháng/quý/năm
- **Công thức tính toán tự động** điểm KPI

### Key Features

✅ **Auto-select Chu Kỳ** - 3-tier priority: Active → Upcoming (5 days) → Latest  
✅ **Dashboard View** - Tổng quan nhân viên với progress bars  
✅ **Real-time Calculation** - Tính điểm ngay khi nhập, không chờ API  
✅ **Batch Save** - Lưu tất cả nhiệm vụ với 1 click  
✅ **Smart Validation** - Kiểm tra đủ điều kiện trước khi duyệt  
✅ **Responsive UI** - Material-UI v5, mobile-friendly  
✅ **Role-based Access** - Chỉ thấy nhân viên mình quản lý

---

## Quick Start

### Access

```
Primary URL: /quanlycongviec/kpi/danh-gia
Menu: Quản lý công việc → Đánh giá KPI
```

### User Roles

| Role                  | Permissions                                                     |
| --------------------- | --------------------------------------------------------------- |
| **Quản lý (Manager)** | Chấm điểm KPI cho nhân viên được quản lý, duyệt KPI             |
| **Admin**             | Quản lý master data (TieuChiDanhGia, ChuKyDanhGia), xem báo cáo |
| **Nhân viên**         | Xem KPI của bản thân (read-only)                                |

---

## Architecture

### Folder Structure

```
KPI/
├── README.md                           # This file
├── FORMULA.md                          # Scoring formula details
├── WORKFLOW.md                         # User workflow guide
│
├── kpiSlice.js                         # Redux state (unified)
│
├── components/
│   ├── SelectNhanVien/                # Shared: Employee selector
│   ├── KPIChartByNhanVien.js          # Analytics charts
│   └── ThongKeKPITable.js             # Statistics table
│
├── pages/
│   ├── XemKPIPage.js                  # Employee view (read-only)
│   └── BaoCaoKPIPage.js               # Admin reports
│
└── v2/                                 # PRIMARY UI
    ├── components/
    │   ├── ChamDiemKPIDialog.js       # ⭐ Main scoring dialog
    │   ├── ChamDiemKPITable.js        # ⭐ Table layout (recommended)
    │   └── StatCard.js                # Dashboard stats
    │
    └── pages/
        └── DanhGiaKPIDashboard.js     # ⭐ PRIMARY PAGE
```

### Tech Stack

- **React 18** + Redux Toolkit
- **Material-UI v5**
- **React Hook Form** + Yup validation
- **Backend:** Node.js + MongoDB

---

## Business Logic

### KPI Calculation Formula

📖 **Detailed explanation:** See [`FORMULA.md`](./FORMULA.md)

**Core Formula:**

```javascript
// Step 1: Calculate criterion score
DiemTieuChi = (GiaTriThucTe / 100) × (LoaiTieuChi === "GIAM_DIEM" ? -1 : 1)

// Step 2: Sum all criteria
TongDiemTieuChi = Σ(DiemTieuChi)  // With +/- signs

// Step 3: Multiply by difficulty
DiemNhiemVu = MucDoKho × TongDiemTieuChi

// Step 4: Total KPI score
TongDiemKPI = Σ(DiemNhiemVu)
```

**Quick Example:**

```javascript
// Nhiệm vụ: "Khám bệnh" (MucDoKho = 7.5)
// - Tốc độ (TANG_DIEM): 80%
// - Chất lượng (TANG_DIEM): 90%
// - Vi phạm (GIAM_DIEM): 5%

TongDiemTieuChi = (0.8) + (0.9) - (0.05) = 1.65
DiemNhiemVu = 7.5 × 1.65 = 12.375 điểm
```

### Business Rules

1. **Auto-create KPI:** Tự động tạo DanhGiaKPI khi gọi `/cham-diem` nếu chưa có
2. **Validation:** Tất cả nhiệm vụ phải có điểm trước khi duyệt
3. **Role-based:** Manager chỉ thấy nhân viên mình quản lý (QuanLyNhanVien.LoaiQuanLy = "KPI")
4. **Chu kỳ Lifecycle:** Mở/Đóng (`isDong`)

---

## User Workflow

📖 **Detailed guide:** See [`WORKFLOW.md`](./WORKFLOW.md)

### Manager Flow (3 bước)

1. **Vào Dashboard** → Auto-select chu kỳ
2. **Click nhân viên** → Dialog mở → Nhập điểm
3. **Lưu tất cả** → Duyệt KPI

### Admin Flow

1. **Quản lý Tiêu chí:** `/quanlycongviec/kpi/tieu-chi`
2. **Quản lý Chu kỳ:** `/quanlycongviec/kpi/chu-ky`

---

## Components Guide

### 1. DanhGiaKPIDashboard (Primary Page)

**Path:** `v2/pages/DanhGiaKPIDashboard.js`

**Features:**

- Auto-select chu kỳ
- 4 stat cards (Tổng, Hoàn thành, Đang chấm, Chưa bắt đầu)
- Table nhân viên với progress
- Search filter

**State:**

```javascript
const { autoSelectedChuKy, dashboardData, filterChuKyID, searchTerm } =
  useSelector((state) => state.kpi);
```

### 2. ChamDiemKPIDialog (Scoring Dialog)

**Path:** `v2/components/ChamDiemKPIDialog.js`

**Features:**

- Full-screen dialog
- Progress indicator
- Real-time total score
- Batch save + Approve

**Props:**

```javascript
{
  open, onClose, nhanVien;
}
```

### 3. ChamDiemKPITable (Recommended Layout)

**Path:** `v2/components/ChamDiemKPITable.js`

**Features:**

- Compact table (1 row = 1 nhiệm vụ)
- TextField inputs với validation
- Dynamic columns (tiêu chí)
- Real-time calculation
- Color-coded GIAM_DIEM cells

**Usage:**

```jsx
<ChamDiemKPITable
  nhiemVuList={currentNhiemVuList}
  onScoreChange={(nhiemVuId, tieuChiId, value) => {
    dispatch(updateTieuChiScoreLocal(nhiemVuId, tieuChiId, value));
  }}
/>
```

---

## Redux State Management

### State Structure

```javascript
state.kpi = {
  // Master data
  tieuChiDanhGias: [],
  chuKyDanhGias: [],
  nhanVienDuocQuanLy: [],

  // Auto-select
  autoSelectedChuKy: null,

  // Dashboard
  dashboardData: {
    nhanVienList: [],
    summary: { totalNhanVien, completed, inProgress, notStarted },
  },

  // Current session
  currentDanhGiaKPI: null,
  currentNhiemVuList: [],

  // UI
  isLoading,
  isSaving,
  searchTerm,
  filterChuKyID,
};
```

### Key Actions

```javascript
// Dashboard
dispatch(autoSelectChuKy());
dispatch(getDashboardData(chuKyId));

// Scoring
dispatch(getChamDiemDetail(chuKyId, nhanVienId));
dispatch(updateTieuChiScoreLocal(nhiemVuId, tieuChiId, diemDat));
dispatch(saveAllNhiemVu());
dispatch(approveKPI(danhGiaKPIId));

// Master data
dispatch(getTieuChiDanhGias());
dispatch(getChuKyDanhGias());
```

---

## API Reference

### 1. Auto-select Chu kỳ

```http
GET /workmanagement/chu-ky-danh-gia/auto-select

Response:
{
  "success": true,
  "data": {
    "chuKy": { "_id", "TenChuKy", "TuNgay", "DenNgay", "isDong" },
    "info": {
      "selectionReason": "ACTIVE_CYCLE",
      "message": "Chu kỳ đang hoạt động"
    }
  }
}
```

### 2. Get Dashboard Data

```http
GET /workmanagement/kpi/dashboard/:chuKyId

Response:
{
  "data": {
    "nhanVienList": [
      {
        "nhanVien": { "_id", "Ten", "MaNhanVien" },
        "danhGiaKPI": { "_id", "TongDiemKPI", "TrangThai" },
        "progress": { "scored": 5, "total": 10, "percentage": 50 }
      }
    ],
    "summary": { ... }
  }
}
```

### 3. Get Scoring Detail (Auto-create)

```http
GET /workmanagement/kpi/cham-diem?chuKyId=xxx&nhanVienId=yyy

Response:
{
  "data": {
    "danhGiaKPI": { ... },
    "nhiemVuList": [
      {
        "_id": "...",
        "NhiemVuThuongQuyID": { "TenNhiemVu" },
        "MucDoKho": 7.5,
        "ChiTietDiem": [
          {
            "TieuChiID": "...",
            "TenTieuChi": "Tốc độ",
            "LoaiTieuChi": "TANG_DIEM",
            "GiaTriMin": 0,
            "GiaTriMax": 100,
            "DonVi": "%",
            "DiemDat": 0
          }
        ]
      }
    ]
  }
}
```

### 4. Save Task Score

```http
PUT /workmanagement/kpi/nhiem-vu/:nhiemVuId/cham-diem

Request Body:
{
  "ChiTietDiem": [
    { "TieuChiID": "...", "DiemDat": 80, "GhiChu": "" }
  ]
}

Response:
{
  "data": {
    "nhiemVuUpdated": { ... },
    "danhGiaKPIUpdated": { "TongDiemKPI": 150.5 }
  }
}
```

### 5. Approve KPI

```http
PUT /workmanagement/kpi/:danhGiaKPIId/duyet

Response:
{
  "data": {
    "danhGiaKPI": {
      "_id": "...",
      "TrangThai": "DA_DUYET",
      "NgayDuyet": "2025-10-14T..."
    }
  }
}
```

---

## Testing

### Dashboard Tests

- [ ] Auto-select chu kỳ (check console log)
- [ ] Display nhân viên list
- [ ] Progress bars accurate
- [ ] Search filter works

### Scoring Tests

- [ ] Click employee → dialog opens
- [ ] Input score → real-time update
- [ ] "Lưu tất cả" → batch save
- [ ] "Duyệt" validates all scored

### Edge Cases

- [ ] No chu kỳ → warning message
- [ ] No tasks → empty state
- [ ] Network error → error toast
- [ ] Approve unscored → validation error

### Master Data

- [ ] CRUD TieuChiDanhGia works
- [ ] CRUD ChuKyDanhGia works
- [ ] Đóng/Mở chu kỳ works

---

## Troubleshooting

| Issue                          | Solution                                  |
| ------------------------------ | ----------------------------------------- |
| Dashboard không load nhân viên | Check QuanLyNhanVien (LoaiQuanLy = "KPI") |
| Không auto-select chu kỳ       | Check có chu kỳ `isDong = false`          |
| Lưu điểm không thành công      | Verify ChiTietDiem structure              |
| Không duyệt được               | Check tất cả nhiệm vụ đã chấm             |

---

**Version:** 3.0 (Unified)  
**Last Updated:** October 14, 2025

📖 **Related Docs:**

- [Scoring Formula](./FORMULA.md)
- [User Workflow](./WORKFLOW.md)
