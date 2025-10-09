# Hướng dẫn Phát triển Components KPI

**Phiên bản:** 2.0  
**Ngày cập nhật:** October 6, 2025

---

## 📋 Mục lục

1. [Component Architecture](#1-component-architecture)
2. [Redux Integration](#2-redux-integration)
3. [Form Components](#3-form-components)
4. [Display Components](#4-display-components)
5. [Custom Hooks](#5-custom-hooks)
6. [Styling Guide](#6-styling-guide)
7. [Testing](#7-testing)

---

## 1. Component Architecture

### 1.1 Folder Structure

```
KPI/
├── kpiSlice.js                     # Redux state management
│
├── pages/                          # Route-level pages
│   ├── DanhGiaKPIPage.js          # Trang chấm KPI (Manager)
│   ├── XemKPIPage.js              # Trang xem KPI (Employee)
│   └── BaoCaoKPIPage.js           # Trang báo cáo (Admin)
│
├── components/
│   ├── SelectChuKy/
│   │   ├── SelectChuKyButton.js
│   │   └── SelectChuKyDialog.js
│   │
│   ├── SelectNhanVien/
│   │   ├── SelectNhanVienButton.js
│   │   ├── SelectNhanVienDialog.js
│   │   └── NhanVienCard.js
│   │
│   ├── FormChamDiem/
│   │   ├── DanhGiaKPIForm.js      # Form chính
│   │   ├── NhiemVuCard.js         # Card 1 NVTQ
│   │   ├── TieuChiInput.js        # Input điểm tiêu chí
│   │   └── TongKPIDisplay.js      # Hiển thị tổng real-time
│   │
│   ├── ChiTietKPI/
│   │   ├── KPISummary.js          # Tổng quan KPI
│   │   ├── NhiemVuDetail.js       # Chi tiết 1 NVTQ
│   │   ├── TieuChiChart.js        # Biểu đồ tiêu chí
│   │   └── NhanXetSection.js      # Nhận xét + phản hồi
│   │
│   ├── ThongKe/
│   │   ├── KPILineChart.js        # Trend theo thời gian
│   │   ├── KPIPieChart.js         # Phân bố xếp loại
│   │   └── TopNhanVien.js         # Bảng top xuất sắc
│   │
│   └── Common/
│       ├── LoadingKPI.js          # Loading state
│       ├── EmptyKPI.js            # Empty state
│       └── ErrorKPI.js            # Error state
│
└── hooks/
    ├── useKPICalculator.js        # Tính toán KPI
    ├── useKPIPermission.js        # Check quyền
    └── useKPINotification.js      # Thông báo
```

---

### 1.2 Component Hierarchy

```
DanhGiaKPIPage (Manager)
├── SelectChuKyButton
│   └── SelectChuKyDialog
├── SelectNhanVienButton
│   └── SelectNhanVienDialog
│       └── NhanVienCard[]
└── DanhGiaKPIForm
    ├── TongKPIDisplay
    ├── NhiemVuCard[]
    │   └── TieuChiInput[]
    └── ActionButtons
        ├── SaveButton
        └── ApproveButton

XemKPIPage (Employee)
├── ChuKyFilter
├── KPISummary
└── NhiemVuDetail[]
    ├── TieuChiChart
    └── NhanXetSection

BaoCaoKPIPage (Admin)
├── ChuKySelect
├── KPILineChart
├── KPIPieChart
└── TopNhanVien
```

---

## 2. Redux Integration

### 2.1 Slice Structure

```javascript
// kpiSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import apiService from "../../app/apiService";

const initialState = {
  // Danh sách
  danhSachKPI: [],
  danhGiaNhiemVu: [],

  // Chi tiết
  currentKPI: null,

  // UI state
  isLoading: false,
  error: null,

  // Filters
  selectedChuKy: null,
  selectedNhanVien: null,
};

const slice = createSlice({
  name: "kpi",
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

    // Chu kỳ
    setSelectedChuKy(state, action) {
      state.selectedChuKy = action.payload;
    },

    // Nhân viên
    setSelectedNhanVien(state, action) {
      state.selectedNhanVien = action.payload;
    },

    // Danh sách KPI
    layDanhSachKPISuccess(state, action) {
      state.isLoading = false;
      state.danhSachKPI = action.payload;
    },

    // Chi tiết KPI
    layChiTietKPISuccess(state, action) {
      state.isLoading = false;
      state.currentKPI = action.payload.danhGiaKPI;
      state.danhGiaNhiemVu = action.payload.danhGiaNhiemVu;
    },

    // Tạo mới
    taoDanhGiaKPISuccess(state, action) {
      state.isLoading = false;
      state.currentKPI = action.payload.danhGiaKPI;
      state.danhGiaNhiemVu = action.payload.danhGiaNhiemVu;
      state.danhSachKPI.unshift(action.payload.danhGiaKPI);
    },

    // Chấm điểm
    chamDiemNhiemVuSuccess(state, action) {
      state.isLoading = false;

      // Update nhiệm vụ trong list
      const index = state.danhGiaNhiemVu.findIndex(
        (nv) => nv._id === action.payload.danhGiaNhiemVu._id
      );
      if (index !== -1) {
        state.danhGiaNhiemVu[index] = action.payload.danhGiaNhiemVu;
      }

      // Update tổng KPI
      if (state.currentKPI) {
        state.currentKPI.TongDiemKPI = action.payload.tongDiemKPI;
      }
    },

    // Duyệt
    duyetKPISuccess(state, action) {
      state.isLoading = false;
      state.currentKPI = action.payload;

      // Update trong list
      const index = state.danhSachKPI.findIndex(
        (kpi) => kpi._id === action.payload._id
      );
      if (index !== -1) {
        state.danhSachKPI[index] = action.payload;
      }
    },
  },
});

export default slice.reducer;

// Actions
export const { setSelectedChuKy, setSelectedNhanVien } = slice.actions;

// Thunks
export const taoDanhGiaKPI = (data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.post("/workmanagement/kpi", data);
    dispatch(slice.actions.taoDanhGiaKPISuccess(response.data.data));
    toast.success("Tạo đánh giá KPI thành công");
    return response.data.data;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
    throw error;
  }
};

export const layChiTietKPI = (danhGiaKPIId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.get(
      `/workmanagement/kpi/${danhGiaKPIId}`
    );
    dispatch(slice.actions.layChiTietKPISuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const chamDiemNhiemVu = (danhGiaNhiemVuId, data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.put(
      `/workmanagement/kpi/nhiem-vu/${danhGiaNhiemVuId}`,
      data
    );
    dispatch(slice.actions.chamDiemNhiemVuSuccess(response.data.data));
    toast.success("Chấm điểm thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const duyetKPI = (danhGiaKPIId, nhanXet) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.put(
      `/workmanagement/kpi/${danhGiaKPIId}/duyet`,
      { NhanXetNguoiDanhGia: nhanXet }
    );
    dispatch(slice.actions.duyetKPISuccess(response.data.data.danhGiaKPI));
    toast.success("Duyệt đánh giá KPI thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
```

---

### 2.2 Selector Pattern

```javascript
// kpiSlice.js - Thêm selectors
export const selectKPIState = (state) => state.kpi;

export const selectCurrentKPI = (state) => state.kpi.currentKPI;

export const selectDanhGiaNhiemVu = (state) => state.kpi.danhGiaNhiemVu;

export const selectTongDiemKPI = (state) =>
  state.kpi.currentKPI?.TongDiemKPI || 0;

export const selectKPIPercent = (state) => {
  const tong = state.kpi.currentKPI?.TongDiemKPI || 0;
  return (tong / 10) * 100;
};

// Sử dụng trong component:
import { useSelector } from "react-redux";
import { selectCurrentKPI, selectKPIPercent } from "./kpiSlice";

function KPISummary() {
  const currentKPI = useSelector(selectCurrentKPI);
  const kpiPercent = useSelector(selectKPIPercent);

  return (
    <Card>
      <Typography variant="h6">KPI: {kpiPercent.toFixed(1)}%</Typography>
    </Card>
  );
}
```

---

## 3. Form Components

### 3.1 DanhGiaKPIForm (Main Form)

```javascript
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { selectCurrentKPI, selectDanhGiaNhiemVu, duyetKPI } from "../kpiSlice";
import NhiemVuCard from "./NhiemVuCard";
import TongKPIDisplay from "./TongKPIDisplay";
import { useKPICalculator } from "../hooks/useKPICalculator";

function DanhGiaKPIForm() {
  const dispatch = useDispatch();
  const currentKPI = useSelector(selectCurrentKPI);
  const danhGiaNhiemVu = useSelector(selectDanhGiaNhiemVu);

  const { tongKPI, kpiPercent } = useKPICalculator(danhGiaNhiemVu);

  const [openDuyet, setOpenDuyet] = useState(false);
  const [nhanXet, setNhanXet] = useState("");

  const handleDuyet = () => {
    dispatch(duyetKPI(currentKPI._id, nhanXet));
    setOpenDuyet(false);
  };

  const coTheDuyet = danhGiaNhiemVu.every(
    (nv) => nv.ChiTietDiem && nv.ChiTietDiem.length > 0
  );

  if (!currentKPI) return null;

  return (
    <Box>
      {/* Header với tổng KPI */}
      <TongKPIDisplay
        tongKPI={tongKPI}
        kpiPercent={kpiPercent}
        trangThai={currentKPI.TrangThai}
      />

      {/* Danh sách nhiệm vụ */}
      <Stack spacing={2} sx={{ mt: 3 }}>
        {danhGiaNhiemVu.map((nhiemVu) => (
          <NhiemVuCard key={nhiemVu._id} nhiemVu={nhiemVu} />
        ))}
      </Stack>

      {/* Action buttons */}
      {currentKPI.TrangThai === "CHUA_DUYET" && (
        <Box
          sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}
        >
          <Button variant="outlined" size="large">
            Lưu nháp
          </Button>
          <Button
            variant="contained"
            size="large"
            disabled={!coTheDuyet}
            onClick={() => setOpenDuyet(true)}
          >
            Duyệt KPI
          </Button>
        </Box>
      )}

      {/* Dialog duyệt */}
      <Dialog
        open={openDuyet}
        onClose={() => setOpenDuyet(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Duyệt đánh giá KPI</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Tổng KPI: <strong>{kpiPercent.toFixed(1)}%</strong>
          </Typography>
          <TextField
            label="Nhận xét"
            multiline
            rows={4}
            fullWidth
            value={nhanXet}
            onChange={(e) => setNhanXet(e.target.value)}
            placeholder="Nhập nhận xét chung về hiệu suất làm việc của nhân viên..."
          />
          <Typography
            variant="caption"
            color="error"
            sx={{ mt: 1, display: "block" }}
          >
            ⚠️ Sau khi duyệt, bạn không thể sửa điểm nữa.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDuyet(false)}>Hủy</Button>
          <Button onClick={handleDuyet} variant="contained">
            Xác nhận duyệt
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DanhGiaKPIForm;
```

---

### 3.2 NhiemVuCard (Card cho 1 NVTQ)

```javascript
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  IconButton,
  Collapse,
  Box,
  TextField,
  Button,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import TieuChiInput from "./TieuChiInput";
import { chamDiemNhiemVu } from "../kpiSlice";
import { useKPICalculator } from "../hooks/useKPICalculator";

function NhiemVuCard({ nhiemVu }) {
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(
    !nhiemVu.ChiTietDiem || nhiemVu.ChiTietDiem.length === 0
  );

  const [chiTietDiem, setChiTietDiem] = useState(nhiemVu.ChiTietDiem || []);
  const [mucDoKho, setMucDoKho] = useState(nhiemVu.MucDoKho);
  const [ghiChu, setGhiChu] = useState(nhiemVu.GhiChu || "");

  const { tinhDiemNhiemVu } = useKPICalculator([]);
  const diemNhiemVu = tinhDiemNhiemVu(chiTietDiem, mucDoKho);

  const handleSave = async () => {
    await dispatch(
      chamDiemNhiemVu(nhiemVu._id, {
        ChiTietDiem: chiTietDiem,
        MucDoKho: mucDoKho,
        GhiChu: ghiChu,
      })
    );
    setEditing(false);
  };

  const handleUpdateTieuChi = (index, field, value) => {
    const newChiTietDiem = [...chiTietDiem];
    newChiTietDiem[index] = {
      ...newChiTietDiem[index],
      [field]: value,
    };
    setChiTietDiem(newChiTietDiem);
  };

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">
              {nhiemVu.NhiemVuThuongQuyID?.TenNhiemVu || "Nhiệm vụ"}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip
                label={`Độ khó: ${mucDoKho}`}
                size="small"
                color="primary"
              />
              <Chip
                label={`${nhiemVu.SoCongViecLienQuan || 0} công việc`}
                size="small"
                variant="outlined"
              />
              <Chip
                label={`Điểm: ${diemNhiemVu.toFixed(2)}`}
                size="small"
                color={diemNhiemVu >= mucDoKho * 0.8 ? "success" : "warning"}
              />
            </Stack>
          </Box>

          <Stack direction="row" spacing={1}>
            {!editing && (
              <IconButton onClick={() => setEditing(true)} size="small">
                <EditIcon />
              </IconButton>
            )}
            <IconButton
              onClick={() => setExpanded(!expanded)}
              sx={{
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "0.3s",
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Stack>
        </Stack>

        {/* Body */}
        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            {/* Điều chỉnh độ khó */}
            {editing && (
              <TextField
                label="Mức độ khó"
                type="number"
                size="small"
                value={mucDoKho}
                onChange={(e) => setMucDoKho(Number(e.target.value))}
                inputProps={{ min: 1, max: 10, step: 0.5 }}
                sx={{ mb: 2, width: 150 }}
              />
            )}

            {/* Danh sách tiêu chí */}
            <Stack spacing={1.5}>
              {chiTietDiem.map((tc, index) => (
                <TieuChiInput
                  key={index}
                  tieuChi={tc}
                  editing={editing}
                  onChange={(field, value) =>
                    handleUpdateTieuChi(index, field, value)
                  }
                />
              ))}
            </Stack>

            {/* Ghi chú */}
            {editing && (
              <TextField
                label="Ghi chú"
                multiline
                rows={2}
                fullWidth
                value={ghiChu}
                onChange={(e) => setGhiChu(e.target.value)}
                sx={{ mt: 2 }}
                placeholder="Nhập ghi chú về đánh giá nhiệm vụ này..."
              />
            )}

            {/* Save button */}
            {editing && (
              <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                >
                  Lưu điểm
                </Button>
              </Box>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}

export default NhiemVuCard;
```

---

### 3.3 TieuChiInput (Input điểm tiêu chí)

```javascript
import React from "react";
import { Box, Typography, Slider, TextField, Stack, Chip } from "@mui/material";
import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";

function TieuChiInput({ tieuChi, editing, onChange }) {
  const {
    TenTieuChi,
    LoaiTieuChi,
    DiemDat,
    TrongSo,
    GiaTriMin = 0,
    GiaTriMax = 100,
  } = tieuChi;

  const handleSliderChange = (event, newValue) => {
    onChange("DiemDat", newValue);
  };

  const handleInputChange = (event) => {
    const value = Number(event.target.value);
    if (value >= GiaTriMin && value <= GiaTriMax) {
      onChange("DiemDat", value);
    }
  };

  const color = LoaiTieuChi === "TANG_DIEM" ? "success" : "error";
  const icon = LoaiTieuChi === "TANG_DIEM" ? <AddIcon /> : <RemoveIcon />;

  return (
    <Box
      sx={{
        p: 2,
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: editing ? "background.default" : "transparent",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 1 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            icon={icon}
            label={LoaiTieuChi === "TANG_DIEM" ? "Tăng" : "Giảm"}
            size="small"
            color={color}
          />
          <Typography variant="body2" fontWeight={500}>
            {TenTieuChi}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            (Trọng số: {TrongSo})
          </Typography>
        </Box>

        {!editing && (
          <Chip
            label={`${DiemDat}${GiaTriMax === 100 ? "%" : ""}`}
            color={color}
            size="small"
          />
        )}
      </Stack>

      {editing && (
        <Stack direction="row" spacing={2} alignItems="center">
          <Slider
            value={DiemDat}
            onChange={handleSliderChange}
            min={GiaTriMin}
            max={GiaTriMax}
            step={GiaTriMax === 100 ? 5 : 1}
            valueLabelDisplay="auto"
            sx={{ flex: 1 }}
            color={color}
          />
          <TextField
            value={DiemDat}
            onChange={handleInputChange}
            type="number"
            size="small"
            inputProps={{ min: GiaTriMin, max: GiaTriMax }}
            sx={{ width: 80 }}
          />
          <Typography variant="caption" color="text.secondary">
            / {GiaTriMax}
          </Typography>
        </Stack>
      )}
    </Box>
  );
}

export default TieuChiInput;
```

---

## 4. Display Components

### 4.1 TongKPIDisplay (Hiển thị tổng KPI)

```javascript
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Stack,
  Chip,
  Box,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from "@mui/icons-material";

function TongKPIDisplay({ tongKPI, kpiPercent, trangThai }) {
  const getColor = (percent) => {
    if (percent >= 90) return "success";
    if (percent >= 80) return "primary";
    if (percent >= 70) return "warning";
    return "error";
  };

  const getXepLoai = (percent) => {
    if (percent >= 90) return { label: "Xuất sắc", icon: <TrendingUpIcon /> };
    if (percent >= 80) return { label: "Tốt", icon: <TrendingUpIcon /> };
    if (percent >= 70) return { label: "Khá", icon: null };
    if (percent >= 60)
      return { label: "Trung bình", icon: <TrendingDownIcon /> };
    return { label: "Yếu", icon: <TrendingDownIcon /> };
  };

  const color = getColor(kpiPercent);
  const xepLoai = getXepLoai(kpiPercent);

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${
          color === "success"
            ? "#e8f5e9 0%, #c8e6c9 100%"
            : color === "primary"
            ? "#e3f2fd 0%, #bbdefb 100%"
            : color === "warning"
            ? "#fff3e0 0%, #ffe0b2 100%"
            : "#ffebee 0%, #ffcdd2 100%"
        })`,
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography variant="h3" fontWeight="bold" color={`${color}.dark`}>
              {kpiPercent.toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tổng điểm: {tongKPI.toFixed(2)} / 10
            </Typography>
          </Box>

          <Stack spacing={1} alignItems="flex-end">
            <Chip
              label={xepLoai.label}
              color={color}
              icon={xepLoai.icon}
              sx={{ fontSize: "1rem", py: 2 }}
            />
            <Chip
              label={trangThai === "DA_DUYET" ? "Đã duyệt" : "Chưa duyệt"}
              size="small"
              variant="outlined"
            />
          </Stack>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={Math.min(100, kpiPercent)}
          color={color}
          sx={{ mt: 2, height: 8, borderRadius: 1 }}
        />
      </CardContent>
    </Card>
  );
}

export default TongKPIDisplay;
```

---

### 4.2 KPISummary (Tổng quan cho Employee)

```javascript
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  Stack,
} from "@mui/material";
import {
  Assignment as AssignmentIcon,
  Stars as StarsIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";

function KPISummary({ danhGiaKPI }) {
  const {
    TongDiemKPI,
    ChuKyID,
    NguoiDanhGiaID,
    NgayDuyet,
    NhanXetNguoiDanhGia,
  } = danhGiaKPI;

  const kpiPercent = (TongDiemKPI / 10) * 100;

  return (
    <Card>
      <CardContent>
        <Grid container spacing={3}>
          {/* Điểm KPI */}
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: "center" }}>
              <StarsIcon sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
              <Typography variant="h3" fontWeight="bold" color="primary">
                {kpiPercent.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                KPI {ChuKyID?.TenChuKy}
              </Typography>
            </Box>
          </Grid>

          {/* Thông tin */}
          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Người đánh giá
                </Typography>
                <Typography variant="body1">{NguoiDanhGiaID?.HoTen}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Ngày duyệt
                </Typography>
                <Typography variant="body1">
                  {new Date(NgayDuyet).toLocaleDateString("vi-VN")}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Nhận xét
                </Typography>
                <Typography variant="body2">
                  {NhanXetNguoiDanhGia || "Chưa có nhận xét"}
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default KPISummary;
```

---

## 5. Custom Hooks

### 5.1 useKPICalculator

```javascript
// hooks/useKPICalculator.js
import { useMemo } from "react";

export function useKPICalculator(danhGiaNhiemVu) {
  // Tính tổng KPI
  const tongKPI = useMemo(() => {
    return danhGiaNhiemVu.reduce((tong, nv) => {
      return tong + (nv.DiemNhiemVu || 0);
    }, 0);
  }, [danhGiaNhiemVu]);

  // Tính % KPI
  const kpiPercent = useMemo(() => {
    return (tongKPI / 10) * 100;
  }, [tongKPI]);

  // Tính điểm 1 nhiệm vụ
  const tinhDiemNhiemVu = (chiTietDiem, mucDoKho) => {
    if (!chiTietDiem || chiTietDiem.length === 0) return 0;

    let tongTang = 0;
    let tongGiam = 0;

    chiTietDiem.forEach((tc) => {
      const diemCoTrongSo = tc.DiemDat * tc.TrongSo;

      if (tc.LoaiTieuChi === "TANG_DIEM") {
        tongTang += diemCoTrongSo;
      } else if (tc.LoaiTieuChi === "GIAM_DIEM") {
        tongGiam += diemCoTrongSo;
      }
    });

    const tongDiemTieuChi = tongTang - tongGiam;
    return mucDoKho * (tongDiemTieuChi / 100);
  };

  // Tính tổng điểm tiêu chí
  const tinhTongDiemTieuChi = (chiTietDiem) => {
    if (!chiTietDiem || chiTietDiem.length === 0) return 0;

    let tongTang = 0;
    let tongGiam = 0;

    chiTietDiem.forEach((tc) => {
      const diemCoTrongSo = tc.DiemDat * tc.TrongSo;

      if (tc.LoaiTieuChi === "TANG_DIEM") {
        tongTang += diemCoTrongSo;
      } else if (tc.LoaiTieuChi === "GIAM_DIEM") {
        tongGiam += diemCoTrongSo;
      }
    });

    return tongTang - tongGiam;
  };

  return {
    tongKPI,
    kpiPercent,
    tinhDiemNhiemVu,
    tinhTongDiemTieuChi,
  };
}
```

---

### 5.2 useKPIPermission

```javascript
// hooks/useKPIPermission.js
import { useMemo } from "react";
import { useSelector } from "react-redux";

export function useKPIPermission(danhGiaKPI) {
  const currentUser = useSelector((state) => state.user.currentUser);

  const permissions = useMemo(() => {
    if (!danhGiaKPI || !currentUser) {
      return {
        canEdit: false,
        canApprove: false,
        canDelete: false,
        canView: false,
      };
    }

    const isOwner = danhGiaKPI.NguoiDanhGiaID?._id === currentUser._id;
    const isEmployee = danhGiaKPI.NhanVienID?._id === currentUser.NhanVienID;
    const isAdmin = currentUser.PhanQuyen === "admin";
    const isChuaDuyet = danhGiaKPI.TrangThai === "CHUA_DUYET";

    return {
      canView: isOwner || isEmployee || isAdmin,
      canEdit: (isOwner || isAdmin) && isChuaDuyet,
      canApprove: isOwner && isChuaDuyet,
      canDelete: (isOwner || isAdmin) && isChuaDuyet,
      canUnapprove: isAdmin,
    };
  }, [danhGiaKPI, currentUser]);

  return permissions;
}
```

---

## 6. Styling Guide

### 6.1 Theme Extension

```javascript
// theme/index.js - Thêm colors cho KPI
const theme = createTheme({
  palette: {
    // ... existing
    kpi: {
      xuatSac: "#4caf50",
      tot: "#2196f3",
      kha: "#ff9800",
      trungBinh: "#ffc107",
      yeu: "#f44336",
    },
  },
});
```

### 6.2 Common Styles

```javascript
// styles/kpi.styles.js
export const kpiStyles = {
  card: {
    borderRadius: 2,
    boxShadow: 3,
    transition: "transform 0.2s, box-shadow 0.2s",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: 6,
    },
  },

  progressBar: {
    height: 8,
    borderRadius: 1,
    bgcolor: "grey.200",
  },

  chipXuatSac: {
    bgcolor: "kpi.xuatSac",
    color: "white",
    fontWeight: "bold",
  },

  stickyHeader: {
    position: "sticky",
    top: 64,
    zIndex: 100,
    bgcolor: "background.paper",
    borderBottom: 1,
    borderColor: "divider",
  },
};
```

---

## 7. Testing

### 7.1 Unit Test Example

```javascript
// hooks/__tests__/useKPICalculator.test.js
import { renderHook } from "@testing-library/react-hooks";
import { useKPICalculator } from "../useKPICalculator";

describe("useKPICalculator", () => {
  it("should calculate tongKPI correctly", () => {
    const danhGiaNhiemVu = [
      { DiemNhiemVu: 4.3 },
      { DiemNhiemVu: 2.85 },
      { DiemNhiemVu: 1.76 },
    ];

    const { result } = renderHook(() => useKPICalculator(danhGiaNhiemVu));

    expect(result.current.tongKPI).toBeCloseTo(8.91, 2);
  });

  it("should calculate kpiPercent correctly", () => {
    const danhGiaNhiemVu = [{ DiemNhiemVu: 9.0 }];

    const { result } = renderHook(() => useKPICalculator(danhGiaNhiemVu));

    expect(result.current.kpiPercent).toBe(90);
  });

  it("should calculate tinhDiemNhiemVu correctly", () => {
    const chiTietDiem = [
      { DiemDat: 85, TrongSo: 1.0, LoaiTieuChi: "TANG_DIEM" },
      { DiemDat: 3, TrongSo: 1.0, LoaiTieuChi: "TANG_DIEM" },
      { DiemDat: 2, TrongSo: 1.0, LoaiTieuChi: "GIAM_DIEM" },
    ];

    const { result } = renderHook(() => useKPICalculator([]));
    const diemNhiemVu = result.current.tinhDiemNhiemVu(chiTietDiem, 5);

    expect(diemNhiemVu).toBeCloseTo(4.3, 1);
  });
});
```

---

### 7.2 Integration Test Example

```javascript
// components/__tests__/NhiemVuCard.test.js
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import NhiemVuCard from "../NhiemVuCard";

const mockStore = configureStore([]);

describe("NhiemVuCard", () => {
  const nhiemVu = {
    _id: "123",
    NhiemVuThuongQuyID: {
      TenNhiemVu: "Test NVTQ",
    },
    MucDoKho: 5,
    ChiTietDiem: [],
    SoCongViecLienQuan: 10,
  };

  let store;

  beforeEach(() => {
    store = mockStore({
      kpi: {
        isLoading: false,
        error: null,
      },
    });
  });

  it("should render nhiemVu title", () => {
    render(
      <Provider store={store}>
        <NhiemVuCard nhiemVu={nhiemVu} />
      </Provider>
    );

    expect(screen.getByText("Test NVTQ")).toBeInTheDocument();
  });

  it("should show editing mode when ChiTietDiem is empty", () => {
    render(
      <Provider store={store}>
        <NhiemVuCard nhiemVu={nhiemVu} />
      </Provider>
    );

    expect(
      screen.getByRole("button", { name: /lưu điểm/i })
    ).toBeInTheDocument();
  });

  it("should toggle expanded state", () => {
    render(
      <Provider store={store}>
        <NhiemVuCard nhiemVu={nhiemVu} />
      </Provider>
    );

    const expandButton = screen.getByLabelText(/expand/i);
    fireEvent.click(expandButton);

    // Check if content is hidden
    expect(
      screen.queryByRole("button", { name: /lưu điểm/i })
    ).not.toBeVisible();
  });
});
```

---

**Tài liệu liên quan:**

- [`README.md`](./README.md) - Tổng quan module
- [`KPI_BUSINESS_LOGIC.md`](./KPI_BUSINESS_LOGIC.md) - Business logic
- [`KPI_FORMULA.md`](./KPI_FORMULA.md) - Công thức tính

**Last Updated:** October 6, 2025
