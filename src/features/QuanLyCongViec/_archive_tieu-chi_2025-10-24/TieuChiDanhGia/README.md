# 📋 TieuChiDanhGia Module

> Quản lý Tiêu chí Đánh giá KPI theo pattern CRUD đơn giản

## 🚀 Quick Start

```javascript
// Import và sử dụng
import { TieuChiDanhGiaList } from "features/QuanLyCongViec/TieuChiDanhGia";

<TieuChiDanhGiaList />;
```

## 📁 Module Structure

```
TieuChiDanhGia/
├── TieuChiDanhGiaList.js          # Main component
├── TieuChiDanhGiaView.js          # Detail view
├── ThongTinTieuChiDanhGia.js      # Form dialog
├── AddTieuChiDanhGiaButton.js     # Add button
├── UpdateTieuChiDanhGiaButton.js  # Edit button
├── DeleteTieuChiDanhGiaButton.js  # Delete button
└── index.js                        # Exports
```

## 🎯 Features

- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ CommonTable with expand row detail view
- ✅ Form validation (TenTieuChi required, GiaTriMax > Min)
- ✅ Soft delete (vô hiệu hóa thay vì xóa)
- ✅ Excel export
- ✅ Icon/Chip phân loại (Tăng điểm / Giảm điểm)

## 📊 Schema

```yaml
TenTieuChi: String (required, max 255)
MoTa: String (max 1000)
LoaiTieuChi: ["TANG_DIEM", "GIAM_DIEM"]
GiaTriMin: Number (default: 0)
GiaTriMax: Number (default: 10)
TrongSoMacDinh: Number (default: 1.0)
TrangThaiHoatDong: Boolean (default: true)
```

## 🔌 API

**Endpoint:** `/api/workmanagement/tieu-chi-danh-gia`

**Redux State:** `state.kpi.tieuChiDanhGias`

## 🎨 Usage Examples

### Standalone Page

```javascript
import { TieuChiDanhGiaList } from "features/QuanLyCongViec/TieuChiDanhGia";

function TieuChiPage() {
  return <TieuChiDanhGiaList />;
}
```

### Individual Components

```javascript
import {
  AddTieuChiDanhGiaButton,
  UpdateTieuChiDanhGiaButton,
  DeleteTieuChiDanhGiaButton,
} from "features/QuanLyCongViec/TieuChiDanhGia";

// Use in custom layouts
<AddTieuChiDanhGiaButton />;
```

## ✅ Current Status

**Production Route:** `/quanlycongviec/kpi/tieu-chi`

**Replaces:** `QuanLyTieuChiPage` (deprecated)

**Pattern:** Follows `NhiemVuThuongQuy` structure

---

**Created:** October 6, 2025  
**Pattern:** NhiemVuThuongQuy CRUD  
**Redux Slice:** kpiSlice (shared)
