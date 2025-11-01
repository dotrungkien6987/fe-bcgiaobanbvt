# 📊 KẾ HOẠCH XÂY DỰNG HỆ THỐNG BÁO CÁO THỐNG KÊ KPI

**Ngày bắt đầu:** 30/10/2025  
**Mục tiêu:** Xây dựng hoàn chỉnh module Báo cáo & Thống kê KPI với đầy đủ chức năng phân tích, trực quan hóa và xuất báo cáo

---

## 🎯 MỤC TIÊU TỔNG QUAN

### Chức năng chính:

1. ✅ **Bộ lọc thông minh** - Filter theo chu kỳ, khoa/phòng, thời gian
2. ✅ **Thống kê tổng quan** - Cards hiển thị metrics chính
3. ✅ **Trực quan hóa** - Charts/graphs phân tích đa chiều
4. ✅ **Bảng chi tiết** - Dữ liệu raw có thể drill-down
5. ✅ **Xuất báo cáo** - Export Excel/PDF
6. ✅ **Phân quyền** - Manager xem khoa, Admin xem tất cả

---

## 📋 PHASE 1: BACKEND API DEVELOPMENT

### 1.1 Database Aggregation Pipeline

**File:** `giaobanbv-be/modules/workmanagement/controllers/kpi.controller.js`

#### Endpoint 1: `GET /api/workmanagement/kpi/bao-cao/thong-ke`

**Mô tả:** Lấy dữ liệu thống kê tổng hợp

**Query Parameters:**

```javascript
{
  chuKyId: String,          // ObjectId của chu kỳ (optional)
  khoaId: String,           // ObjectId của khoa (optional, filtered by role)
  startDate: Date,          // Ngày bắt đầu (optional)
  endDate: Date,            // Ngày kết thúc (optional)
  groupBy: String           // 'khoa' | 'chuky' | 'month' (default: 'khoa')
}
```

**Response Structure:**

```javascript
{
  success: true,
  data: {
    // Thống kê tổng quan
    tongQuan: {
      tongSoNhanVien: Number,
      tongSoDanhGia: Number,
      daDuyet: Number,
      chuaDuyet: Number,
      tyLeHoanThanh: Number,      // %
      diemTrungBinh: Number,       // 0-10
      diemCaoNhat: Number,
      diemThapNhat: Number,
      soKhoaThamGia: Number
    },

    // Phân bổ theo mức điểm
    phanBoMucDiem: [
      {
        muc: 'Xuất sắc',          // >= 9.0
        soLuong: Number,
        tyLe: Number,             // %
        khoangDiem: '9.0 - 10.0'
      },
      {
        muc: 'Tốt',               // 7.0 - 8.9
        soLuong: Number,
        tyLe: Number,
        khoangDiem: '7.0 - 8.9'
      },
      {
        muc: 'Khá',               // 5.0 - 6.9
        soLuong: Number,
        tyLe: Number,
        khoangDiem: '5.0 - 6.9'
      },
      {
        muc: 'Trung bình',        // 3.0 - 4.9
        soLuong: Number,
        tyLe: Number,
        khoangDiem: '3.0 - 4.9'
      },
      {
        muc: 'Yếu',               // < 3.0
        soLuong: Number,
        tyLe: Number,
        khoangDiem: '< 3.0'
      }
    ],

    // Thống kê theo khoa/phòng
    theoKhoa: [
      {
        _id: ObjectId,
        tenKhoa: String,
        soNhanVien: Number,
        daDuyet: Number,
        chuaDuyet: Number,
        diemTrungBinh: Number,
        diemCaoNhat: Number,
        diemThapNhat: Number,
        tyLeHoanThanh: Number
      }
    ],

    // Xu hướng theo thời gian (nếu có date range)
    xuHuongTheoThang: [
      {
        thang: String,            // 'YYYY-MM'
        soNhanVien: Number,
        diemTrungBinh: Number,
        daDuyet: Number
      }
    ],

    // Top performers
    topNhanVienXuatSac: [
      {
        nhanVienId: ObjectId,
        tenNhanVien: String,
        khoaPhong: String,
        diemKPI: Number,
        chuKy: String,
        ngayDuyet: Date
      }
    ],  // Top 10

    // Bottom performers (cần cải thiện)
    nhanVienCanCaiThien: [
      {
        nhanVienId: ObjectId,
        tenNhanVien: String,
        khoaPhong: String,
        diemKPI: Number,
        chuKy: String,
        ngayDuyet: Date
      }
    ],  // Bottom 10

    // Phân bổ trạng thái
    phanBoTrangThai: {
      daDuyet: Number,
      chuaDuyet: Number,
      tyLeDaDuyet: Number       // %
    }
  }
}
```

**MongoDB Aggregation Pipeline:**

```javascript
// 1. Thống kê tổng quan
const tongQuan = await DanhGiaKPI.aggregate([
  { $match: filter },
  {
    $group: {
      _id: null,
      tongSoDanhGia: { $sum: 1 },
      daDuyet: {
        $sum: { $cond: [{ $eq: ["$TrangThai", "DA_DUYET"] }, 1, 0] },
      },
      chuaDuyet: {
        $sum: { $cond: [{ $eq: ["$TrangThai", "CHUA_DUYET"] }, 1, 0] },
      },
      diemTrungBinh: { $avg: "$TongDiemKPI" },
      diemCaoNhat: { $max: "$TongDiemKPI" },
      diemThapNhat: { $min: "$TongDiemKPI" },
    },
  },
]);

// 2. Phân bổ theo mức điểm
const phanBoMucDiem = await DanhGiaKPI.aggregate([
  { $match: filter },
  {
    $bucket: {
      groupBy: "$TongDiemKPI",
      boundaries: [0, 3, 5, 7, 9, 10],
      default: "other",
      output: {
        soLuong: { $sum: 1 },
        diemTB: { $avg: "$TongDiemKPI" },
      },
    },
  },
]);

// 3. Thống kê theo khoa
const theoKhoa = await DanhGiaKPI.aggregate([
  { $match: filter },
  {
    $lookup: {
      from: "nhanviens",
      localField: "NhanVienID",
      foreignField: "_id",
      as: "nhanVien",
    },
  },
  { $unwind: "$nhanVien" },
  {
    $lookup: {
      from: "khoas",
      localField: "nhanVien.KhoaID",
      foreignField: "_id",
      as: "khoa",
    },
  },
  { $unwind: "$khoa" },
  {
    $group: {
      _id: "$khoa._id",
      tenKhoa: { $first: "$khoa.TenKhoa" },
      soNhanVien: { $sum: 1 },
      daDuyet: {
        $sum: { $cond: [{ $eq: ["$TrangThai", "DA_DUYET"] }, 1, 0] },
      },
      diemTrungBinh: { $avg: "$TongDiemKPI" },
      diemCaoNhat: { $max: "$TongDiemKPI" },
      diemThapNhat: { $min: "$TongDiemKPI" },
    },
  },
  { $sort: { diemTrungBinh: -1 } },
]);

// 4. Top performers
const topPerformers = await DanhGiaKPI.aggregate([
  { $match: { ...filter, TrangThai: "DA_DUYET" } },
  { $sort: { TongDiemKPI: -1 } },
  { $limit: 10 },
  {
    $lookup: {
      from: "nhanviens",
      localField: "NhanVienID",
      foreignField: "_id",
      as: "nhanVien",
    },
  },
  // ... project fields
]);
```

#### Endpoint 2: `GET /api/workmanagement/kpi/bao-cao/chi-tiet`

**Mô tả:** Lấy dữ liệu chi tiết từng nhân viên để hiển thị table

**Response:**

```javascript
{
  success: true,
  data: {
    danhSach: [
      {
        nhanVienId: ObjectId,
        tenNhanVien: String,
        maNhanVien: String,
        khoaPhong: String,
        email: String,
        chuKyDanhGia: String,
        trangThai: String,
        diemKPI: Number,
        ngayDuyet: Date,
        nguoiDuyet: String
      }
    ],
    pagination: {
      total: Number,
      page: Number,
      limit: Number
    }
  }
}
```

#### Endpoint 3: `GET /api/workmanagement/kpi/bao-cao/export-excel`

**Mô tả:** Xuất báo cáo Excel

**Response:** File buffer (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)

**Excel Structure:**

- **Sheet 1 - Tổng quan:** Thống kê summary
- **Sheet 2 - Theo khoa:** Chi tiết từng khoa
- **Sheet 3 - Chi tiết nhân viên:** Danh sách đầy đủ
- **Sheet 4 - Top performers:** Top 20 xuất sắc/cần cải thiện

**Libraries:** `exceljs`

#### Endpoint 4: `GET /api/workmanagement/kpi/bao-cao/export-pdf`

**Mô tả:** Xuất báo cáo PDF với charts

**Libraries:** `pdfkit` hoặc `puppeteer`

---

## 📱 PHASE 2: FRONTEND REDUX INTEGRATION

### 2.1 Redux Slice Extension

**File:** `src/features/QuanLyCongViec/BaoCaoThongKeKPI/baoCaoKPISlice.js`

```javascript
import { createSlice } from "@reduxjs/toolkit";
import apiService from "app/apiService";
import { toast } from "react-toastify";

const initialState = {
  isLoading: false,
  error: null,

  // Thống kê data
  tongQuan: null,
  phanBoMucDiem: [],
  theoKhoa: [],
  xuHuongTheoThang: [],
  topNhanVienXuatSac: [],
  nhanVienCanCaiThien: [],
  phanBoTrangThai: null,

  // Chi tiết data
  danhSachChiTiet: [],
  pagination: {
    total: 0,
    page: 0,
    limit: 10,
  },

  // Filters state
  filters: {
    chuKyId: "",
    khoaId: "",
    startDate: null,
    endDate: null,
    groupBy: "khoa",
  },
};

const slice = createSlice({
  name: "baoCaoKPI",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
      state.error = null;
    },

    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    getThongKeSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const data = action.payload;
      state.tongQuan = data.tongQuan;
      state.phanBoMucDiem = data.phanBoMucDiem;
      state.theoKhoa = data.theoKhoa;
      state.xuHuongTheoThang = data.xuHuongTheoThang;
      state.topNhanVienXuatSac = data.topNhanVienXuatSac;
      state.nhanVienCanCaiThien = data.nhanVienCanCaiThien;
      state.phanBoTrangThai = data.phanBoTrangThai;
    },

    getChiTietSuccess(state, action) {
      state.isLoading = false;
      state.danhSachChiTiet = action.payload.danhSach;
      state.pagination = action.payload.pagination;
    },

    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },

    resetFilters(state) {
      state.filters = initialState.filters;
    },
  },
});

export default slice.reducer;

// Actions
export const getThongKeKPI = (filters) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.get(
      "/workmanagement/kpi/bao-cao/thong-ke",
      {
        params: filters,
      }
    );
    dispatch(slice.actions.getThongKeSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const getChiTietKPI =
  (filters, page = 0, limit = 10) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await apiService.get(
        "/workmanagement/kpi/bao-cao/chi-tiet",
        {
          params: { ...filters, page, limit },
        }
      );
      dispatch(slice.actions.getChiTietSuccess(response.data.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const exportExcelKPI = (filters) => async (dispatch) => {
  try {
    const response = await apiService.get(
      "/workmanagement/kpi/bao-cao/export-excel",
      {
        params: filters,
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `BaoCaoKPI_${Date.now()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    toast.success("Xuất báo cáo Excel thành công");
  } catch (error) {
    toast.error(error.message);
  }
};

export const exportPDFKPI = (filters) => async (dispatch) => {
  try {
    const response = await apiService.get(
      "/workmanagement/kpi/bao-cao/export-pdf",
      {
        params: filters,
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `BaoCaoKPI_${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    toast.success("Xuất báo cáo PDF thành công");
  } catch (error) {
    toast.error(error.message);
  }
};

export const { setFilters, resetFilters } = slice.actions;
```

### 2.2 Root Reducer Integration

**File:** `src/app/store.js`

```javascript
import baoCaoKPIReducer from "features/QuanLyCongViec/BaoCaoThongKeKPI/baoCaoKPISlice";

export const store = configureStore({
  reducer: {
    // ... existing reducers
    baoCaoKPI: baoCaoKPIReducer,
  },
});
```

---

## 🎨 PHASE 3: UI COMPONENTS DEVELOPMENT

### 3.1 Component Structure

```
BaoCaoThongKeKPI/
├── baoCaoKPISlice.js          # Redux slice
├── BaoCaoKPIPage.js            # Main page container
├── components/
│   ├── FilterPanel.js          # Bộ lọc (chu kỳ, khoa, date range)
│   ├── SummaryCards.js         # 4 stat cards (Total, Completed, Avg, Distribution)
│   ├── ChartsSection.js        # Container for all charts
│   │   ├── BarChartByDepartment.js     # Điểm TB theo khoa
│   │   ├── PieChartStatus.js           # Phân bổ trạng thái
│   │   ├── DistributionChart.js        # Phân bổ mức điểm
│   │   └── TrendLineChart.js           # Xu hướng theo thời gian
│   ├── TopPerformersTable.js   # Top 10 xuất sắc
│   ├── DetailedDataTable.js    # Bảng chi tiết đầy đủ
│   └── ExportButtons.js        # Nút export Excel/PDF
└── IMPLEMENTATION_PLAN.md      # This file
```

### 3.2 Component Details

#### **BaoCaoKPIPage.js** - Main Container

```javascript
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Grid, Stack, Typography, Button, Box } from "@mui/material";
import {
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material";

import MainCard from "components/MainCard";
import FilterPanel from "./components/FilterPanel";
import SummaryCards from "./components/SummaryCards";
import ChartsSection from "./components/ChartsSection";
import TopPerformersTable from "./components/TopPerformersTable";
import DetailedDataTable from "./components/DetailedDataTable";
import ExportButtons from "./components/ExportButtons";

import { getThongKeKPI, getChiTietKPI } from "./baoCaoKPISlice";
import useAuth from "hooks/useAuth";

function BaoCaoKPIPage() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { filters, isLoading, error } = useSelector((state) => state.baoCaoKPI);

  useEffect(() => {
    handleLoadData();
  }, [filters]);

  const handleLoadData = () => {
    dispatch(getThongKeKPI(filters));
    dispatch(getChiTietKPI(filters));
  };

  return (
    <MainCard>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <AssessmentIcon sx={{ fontSize: 32, color: "primary.main" }} />
              <Typography variant="h4">Báo cáo & Thống kê KPI</Typography>
            </Stack>

            <Stack direction="row" spacing={2}>
              <ExportButtons filters={filters} />
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleLoadData}
                disabled={isLoading}
              >
                Làm mới
              </Button>
            </Stack>
          </Stack>
        </Grid>

        {/* Filters */}
        <Grid item xs={12}>
          <FilterPanel />
        </Grid>

        {/* Summary Stats */}
        <Grid item xs={12}>
          <SummaryCards />
        </Grid>

        {/* Charts */}
        <Grid item xs={12}>
          <ChartsSection />
        </Grid>

        {/* Top Performers */}
        <Grid item xs={12}>
          <TopPerformersTable />
        </Grid>

        {/* Detailed Table */}
        <Grid item xs={12}>
          <DetailedDataTable />
        </Grid>
      </Grid>
    </MainCard>
  );
}

export default BaoCaoKPIPage;
```

#### **FilterPanel.js** - Bộ lọc thông minh

```javascript
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Button,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { setFilters, resetFilters } from "../baoCaoKPISlice";

// Features:
// - Chu kỳ đánh giá dropdown
// - Khoa/Phòng dropdown (filtered by user role)
// - Date range picker
// - Group by option
// - Clear filters button
```

#### **SummaryCards.js** - 4 Stats Cards

```javascript
import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  LinearProgress,
} from "@mui/material";
import { useSelector } from "react-redux";
import {
  People as PeopleIcon,
  CheckCircle as CheckIcon,
  TrendingUp as TrendIcon,
  PieChart as PieIcon,
} from "@mui/icons-material";

// 4 Cards:
// 1. Tổng số nhân viên - Blue
// 2. Tỷ lệ hoàn thành - Green
// 3. Điểm trung bình - Orange
// 4. Phân bổ mức điểm - Purple
```

#### **ChartsSection.js** - Charts Container

```javascript
import React from "react";
import { Grid, Paper, Typography } from "@mui/material";
import BarChartByDepartment from "./BarChartByDepartment";
import PieChartStatus from "./PieChartStatus";
import DistributionChart from "./DistributionChart";
import TrendLineChart from "./TrendLineChart";

// Layout:
// Row 1: Bar Chart (8 cols) | Pie Chart (4 cols)
// Row 2: Distribution Chart (6 cols) | Trend Chart (6 cols)
```

#### **Charts Components** - Using Recharts

```javascript
// Install: npm install recharts

// BarChartByDepartment.js - Điểm TB theo khoa
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// PieChartStatus.js - Đã duyệt vs Chưa duyệt
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// DistributionChart.js - Phân bổ: Xuất sắc/Tốt/Khá/TB/Yếu
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// TrendLineChart.js - Xu hướng theo tháng
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
```

#### **TopPerformersTable.js** - Top 10 Table

```javascript
import React from "react";
import {
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Chip,
  Avatar,
} from "@mui/material";
import { Star as StarIcon } from "@mui/icons-material";

// Features:
// - Top 10 xuất sắc (left side)
// - Bottom 10 cần cải thiện (right side)
// - Avatar + Name + Department
// - Score with color coding
// - Rank badges
```

#### **DetailedDataTable.js** - Full Data Table

```javascript
import React, { useState } from "react";
import {
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  TableSortLabel,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";

// Features:
// - Pagination (custom, not CommonTable)
// - Sorting multi-column
// - Search by name
// - Export to clipboard/CSV
// - Click to view detail dialog
```

#### **ExportButtons.js** - Export Controls

```javascript
import React from "react";
import { Stack, Button, Menu, MenuItem } from "@mui/material";
import {
  Download as DownloadIcon,
  FileDownload,
  PictureAsPdf,
} from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { exportExcelKPI, exportPDFKPI } from "../baoCaoKPISlice";

// Features:
// - Excel export button
// - PDF export button
// - Export với filters hiện tại
```

---

## 🎨 PHASE 4: STYLING & THEMING

### 4.1 Color Scheme

```javascript
const COLORS = {
  xuatSac: "#4caf50", // Green - >= 9.0
  tot: "#2196f3", // Blue - 7.0-8.9
  kha: "#ff9800", // Orange - 5.0-6.9
  trungBinh: "#ff5722", // Deep Orange - 3.0-4.9
  yeu: "#f44336", // Red - < 3.0

  daDuyet: "#4caf50",
  chuaDuyet: "#ff9800",

  primary: "#667eea",
  secondary: "#764ba2",
};
```

### 4.2 Gradient Backgrounds

```javascript
const gradients = {
  header: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  card1: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  card2: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  card3: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  card4: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
};
```

---

## 📦 PHASE 5: DEPENDENCIES

### NPM Packages cần cài đặt:

```bash
# Frontend
npm install recharts                    # Charts library
npm install @mui/x-date-pickers        # Date range picker
npm install dayjs                       # Date formatting
npm install file-saver                  # File download helper

# Backend
npm install exceljs                     # Excel generation
npm install pdfkit                      # PDF generation (alternative: puppeteer)
```

---

## ✅ CHECKLIST TRIỂN KHAI

### Backend (giaobanbv-be)

- [ ] **Step 1.1:** Tạo controller methods cho 4 endpoints
- [ ] **Step 1.2:** Viết MongoDB aggregation pipelines
- [ ] **Step 1.3:** Implement permission check (Manager vs Admin)
- [ ] **Step 1.4:** Viết logic xuất Excel với exceljs
- [ ] **Step 1.5:** Viết logic xuất PDF (optional)
- [ ] **Step 1.6:** Thêm routes vào `/routes/kpi.api.js`
- [ ] **Step 1.7:** Test endpoints với Postman/Thunder Client

### Frontend Redux

- [ ] **Step 2.1:** Tạo `baoCaoKPISlice.js`
- [ ] **Step 2.2:** Implement actions (getThongKe, getChiTiet, export)
- [ ] **Step 2.3:** Thêm reducer vào store
- [ ] **Step 2.4:** Test Redux actions trong DevTools

### Frontend Components

- [ ] **Step 3.1:** Tạo `BaoCaoKPIPage.js` - Main container
- [ ] **Step 3.2:** Tạo `FilterPanel.js` - Bộ lọc
- [ ] **Step 3.3:** Tạo `SummaryCards.js` - Stats cards
- [ ] **Step 3.4:** Tạo `ChartsSection.js` - Charts container
- [ ] **Step 3.5:** Tạo `BarChartByDepartment.js` - Bar chart
- [ ] **Step 3.6:** Tạo `PieChartStatus.js` - Pie chart
- [ ] **Step 3.7:** Tạo `DistributionChart.js` - Distribution
- [ ] **Step 3.8:** Tạo `TrendLineChart.js` - Line chart
- [ ] **Step 3.9:** Tạo `TopPerformersTable.js` - Top 10 table
- [ ] **Step 3.10:** Tạo `DetailedDataTable.js` - Full data table
- [ ] **Step 3.11:** Tạo `ExportButtons.js` - Export controls

### Testing & Polish

- [ ] **Step 4.1:** Test với user role Manager (chỉ xem khoa)
- [ ] **Step 4.2:** Test với user role Admin (xem tất cả)
- [ ] **Step 4.3:** Test filters (chu kỳ, khoa, date range)
- [ ] **Step 4.4:** Test export Excel
- [ ] **Step 4.5:** Test export PDF (if implemented)
- [ ] **Step 4.6:** Test responsive trên mobile
- [ ] **Step 4.7:** Test performance với large dataset
- [ ] **Step 4.8:** Add loading states everywhere
- [ ] **Step 4.9:** Add error handling
- [ ] **Step 4.10:** Polish UI/UX

---

## 📊 METRICS & KPIs (for this feature)

### Success Criteria:

- ✅ Load time < 3s cho thống kê
- ✅ Export Excel < 5s
- ✅ Charts render smoothly (60fps)
- ✅ Mobile responsive 100%
- ✅ Zero console errors
- ✅ Proper permission handling

---

## 🔄 WORKFLOW THỰC HIỆN

### Tuần 1: Backend Foundation

- **Day 1-2:** Database aggregation pipelines + endpoints
- **Day 3:** Excel export functionality
- **Day 4:** PDF export (optional)
- **Day 5:** Testing & bug fixes

### Tuần 2: Frontend Development

- **Day 1:** Redux slice + API integration
- **Day 2:** Main page + FilterPanel + SummaryCards
- **Day 3:** All charts components
- **Day 4:** Tables (Top performers + Detailed)
- **Day 5:** Export buttons + final integration

### Tuần 3: Polish & Testing

- **Day 1-2:** UI/UX improvements + responsive
- **Day 3:** Testing with real data
- **Day 4:** Bug fixes
- **Day 5:** Documentation + deployment

---

## 📚 REFERENCES

### MongoDB Aggregation:

- https://docs.mongodb.com/manual/aggregation/
- https://docs.mongodb.com/manual/reference/operator/aggregation/bucket/
- https://docs.mongodb.com/manual/reference/operator/aggregation/lookup/

### Recharts Documentation:

- https://recharts.org/en-US/
- https://recharts.org/en-US/examples

### ExcelJS:

- https://github.com/exceljs/exceljs

### Material-UI Charts:

- https://mui.com/x/react-charts/

---

## 🎯 NEXT STEPS

1. ✅ **Tạo file kế hoạch này** - DONE
2. ⏳ **Chờ approval từ team**
3. ⏳ **Bắt đầu Phase 1: Backend API**
4. ⏳ **Tiếp tục Phase 2, 3, 4, 5 theo checklist**

---

**Người tạo:** AI Assistant  
**Ngày tạo:** 30/10/2025  
**Status:** 📋 Planning Phase  
**Estimated Time:** 3 weeks  
**Priority:** High 🔥
