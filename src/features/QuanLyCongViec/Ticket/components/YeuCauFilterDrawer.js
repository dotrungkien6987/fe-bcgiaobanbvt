/**
 * YeuCauFilterDrawer - Right drawer for advanced filtering
 *
 * Responsive drawer cho bộ lọc nâng cao
 * Mobile: 85% width, Desktop: 400px width
 */
import React, { useState, useEffect } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Stack,
  TextField,
  Autocomplete,
  Divider,
} from "@mui/material";
import {
  Close as CloseIcon,
  FilterList as FilterIcon,
  RestartAlt as ResetIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

function YeuCauFilterDrawer({
  open,
  onClose,
  filters,
  onApply,
  khoaOptions = [],
  danhMucOptions = [],
  nhanVienOptions = [],
  trangThaiOptions = [],
}) {
  const [localFilters, setLocalFilters] = useState(filters);

  // Sync with external filters when drawer opens
  useEffect(() => {
    if (open) {
      setLocalFilters(filters);
    }
  }, [open, filters]);

  const handleChange = (field, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    const emptyFilters = {
      search: "",
      KhoaTaoID: "",
      KhoaXuLyID: "",
      DanhMucYeuCauID: "",
      TrangThai: [],
      TuNgay: null,
      DenNgay: null,
      NhanVienTaoID: "",
      NhanVienXuLyID: "",
    };
    setLocalFilters(emptyFilters);
    onApply(emptyFilters);
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: { xs: "85%", sm: 400 },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <FilterIcon color="primary" />
          <Typography variant="h6">Bộ lọc</Typography>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Scrollable Content */}
      <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
        <Stack spacing={2.5}>
          {/* Search */}
          <TextField
            fullWidth
            label="Tìm kiếm"
            placeholder="Tiêu đề, mô tả, mã yêu cầu..."
            value={localFilters.search || ""}
            onChange={(e) => handleChange("search", e.target.value)}
            size="small"
          />

          <Divider />

          {/* Khoa tạo */}
          {khoaOptions.length > 0 && (
            <Autocomplete
              size="small"
              options={khoaOptions}
              getOptionLabel={(option) => option.TenKhoa || ""}
              value={
                khoaOptions.find((k) => k._id === localFilters.KhoaTaoID) ||
                null
              }
              onChange={(e, newValue) =>
                handleChange("KhoaTaoID", newValue?._id || "")
              }
              renderInput={(params) => (
                <TextField {...params} label="Khoa tạo yêu cầu" />
              )}
            />
          )}

          {/* Khoa xử lý */}
          {khoaOptions.length > 0 && (
            <Autocomplete
              size="small"
              options={khoaOptions}
              getOptionLabel={(option) => option.TenKhoa || ""}
              value={
                khoaOptions.find((k) => k._id === localFilters.KhoaXuLyID) ||
                null
              }
              onChange={(e, newValue) =>
                handleChange("KhoaXuLyID", newValue?._id || "")
              }
              renderInput={(params) => (
                <TextField {...params} label="Khoa xử lý" />
              )}
            />
          )}

          {/* Danh mục */}
          {danhMucOptions.length > 0 && (
            <Autocomplete
              size="small"
              options={danhMucOptions}
              getOptionLabel={(option) => option.TenDanhMuc || ""}
              value={
                danhMucOptions.find(
                  (d) => d._id === localFilters.DanhMucYeuCauID
                ) || null
              }
              onChange={(e, newValue) =>
                handleChange("DanhMucYeuCauID", newValue?._id || "")
              }
              renderInput={(params) => (
                <TextField {...params} label="Danh mục yêu cầu" />
              )}
            />
          )}

          {/* Trạng thái */}
          {trangThaiOptions.length > 0 && (
            <Autocomplete
              multiple
              size="small"
              options={trangThaiOptions}
              getOptionLabel={(option) => option.label || ""}
              value={trangThaiOptions.filter((t) =>
                (localFilters.TrangThai || []).includes(t.value)
              )}
              onChange={(e, newValue) =>
                handleChange(
                  "TrangThai",
                  newValue.map((v) => v.value)
                )
              }
              renderInput={(params) => (
                <TextField {...params} label="Trạng thái" />
              )}
            />
          )}

          <Divider />

          {/* Date Range */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Từ ngày"
              value={localFilters.TuNgay ? dayjs(localFilters.TuNgay) : null}
              onChange={(newValue) =>
                handleChange("TuNgay", newValue ? newValue.toISOString() : null)
              }
              slotProps={{
                textField: { size: "small", fullWidth: true },
              }}
            />

            <DatePicker
              label="Đến ngày"
              value={localFilters.DenNgay ? dayjs(localFilters.DenNgay) : null}
              onChange={(newValue) =>
                handleChange(
                  "DenNgay",
                  newValue ? newValue.toISOString() : null
                )
              }
              slotProps={{
                textField: { size: "small", fullWidth: true },
              }}
            />
          </LocalizationProvider>

          <Divider />

          {/* Nhân viên tạo */}
          {nhanVienOptions.length > 0 && (
            <Autocomplete
              size="small"
              options={nhanVienOptions}
              getOptionLabel={(option) => option.HoTen || ""}
              value={
                nhanVienOptions.find(
                  (n) => n._id === localFilters.NhanVienTaoID
                ) || null
              }
              onChange={(e, newValue) =>
                handleChange("NhanVienTaoID", newValue?._id || "")
              }
              renderInput={(params) => (
                <TextField {...params} label="Người tạo" />
              )}
            />
          )}

          {/* Nhân viên xử lý */}
          {nhanVienOptions.length > 0 && (
            <Autocomplete
              size="small"
              options={nhanVienOptions}
              getOptionLabel={(option) => option.HoTen || ""}
              value={
                nhanVienOptions.find(
                  (n) => n._id === localFilters.NhanVienXuLyID
                ) || null
              }
              onChange={(e, newValue) =>
                handleChange("NhanVienXuLyID", newValue?._id || "")
              }
              renderInput={(params) => (
                <TextField {...params} label="Người xử lý" />
              )}
            />
          )}
        </Stack>
      </Box>

      {/* Sticky Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Stack spacing={1}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<FilterIcon />}
            onClick={handleApply}
          >
            Áp dụng
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<ResetIcon />}
            onClick={handleReset}
          >
            Xóa bộ lọc
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}

export default YeuCauFilterDrawer;
