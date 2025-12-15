/**
 * YeuCauFilterPanel - Panel lọc danh sách yêu cầu
 */
import React from "react";
import {
  Box,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Collapse,
  IconButton,
  Chip,
  OutlinedInput,
  InputAdornment,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

import { TRANG_THAI_OPTIONS } from "../yeuCau.constants";

function YeuCauFilterPanel({
  filters,
  onFilterChange,
  onReset,
  khoaOptions = [],
  danhMucOptions = [],
  nhanVienOptions = [],
  showAdvanced = false,
}) {
  const [expanded, setExpanded] = React.useState(false);

  const handleChange = (field) => (event) => {
    const value = event.target?.value ?? event;
    onFilterChange({ [field]: value });
  };

  const handleMultiSelectChange = (field) => (event) => {
    const value = event.target.value;
    // MUI Select với multiple trả về array
    onFilterChange({
      [field]: typeof value === "string" ? value.split(",") : value,
    });
  };

  const handleDateChange = (field) => (date) => {
    onFilterChange({ [field]: date ? date.toISOString() : null });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.KhoaTaoID) count++;
    if (filters.KhoaXuLyID) count++;
    if (filters.DanhMucYeuCauID) count++;
    if (filters.TrangThai?.length > 0) count++;
    if (filters.TuNgay) count++;
    if (filters.DenNgay) count++;
    if (filters.NhanVienTaoID) count++;
    if (filters.NhanVienXuLyID) count++;
    return count;
  };

  const activeCount = getActiveFilterCount();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <Box sx={{ mb: 2 }}>
        {/* Search bar + Toggle */}
        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
          <TextField
            fullWidth
            size="small"
            placeholder="Tìm theo mã, tiêu đề, mô tả..."
            value={filters.search || ""}
            onChange={handleChange("search")}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: filters.search && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => onFilterChange({ search: "" })}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant={expanded ? "contained" : "outlined"}
            startIcon={<FilterIcon />}
            endIcon={expanded ? <CollapseIcon /> : <ExpandIcon />}
            onClick={() => setExpanded(!expanded)}
            sx={{ minWidth: 120 }}
          >
            Lọc
            {activeCount > 0 && (
              <Chip
                size="small"
                label={activeCount}
                color="primary"
                sx={{ ml: 0.5, height: 18, fontSize: 11 }}
              />
            )}
          </Button>
          {activeCount > 0 && (
            <Button variant="text" color="inherit" onClick={onReset}>
              Xóa lọc
            </Button>
          )}
        </Stack>

        {/* Expandable filters */}
        <Collapse in={expanded}>
          <Box
            sx={{
              p: 2,
              bgcolor: "background.paper",
              borderRadius: 1,
              border: 1,
              borderColor: "divider",
            }}
          >
            <Stack spacing={2}>
              {/* Row 1: Trạng thái */}
              <FormControl fullWidth size="small">
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  multiple
                  value={filters.TrangThai || []}
                  onChange={handleMultiSelectChange("TrangThai")}
                  input={<OutlinedInput label="Trạng thái" />}
                  renderValue={(selected) =>
                    selected
                      .map(
                        (val) =>
                          TRANG_THAI_OPTIONS.find((o) => o.value === val)?.label
                      )
                      .join(", ")
                  }
                >
                  {TRANG_THAI_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Row 2: Khoa tạo + Khoa xử lý */}
              {khoaOptions.length > 0 && (
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Khoa tạo</InputLabel>
                    <Select
                      value={filters.KhoaTaoID || ""}
                      onChange={handleChange("KhoaTaoID")}
                      label="Khoa tạo"
                    >
                      <MenuItem value="">Tất cả</MenuItem>
                      {khoaOptions.map((khoa) => (
                        <MenuItem key={khoa._id} value={khoa._id}>
                          {khoa.TenKhoa}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel>Khoa xử lý</InputLabel>
                    <Select
                      value={filters.KhoaXuLyID || ""}
                      onChange={handleChange("KhoaXuLyID")}
                      label="Khoa xử lý"
                    >
                      <MenuItem value="">Tất cả</MenuItem>
                      {khoaOptions.map((khoa) => (
                        <MenuItem key={khoa._id} value={khoa._id}>
                          {khoa.TenKhoa}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              )}

              {/* Row 3: Danh mục */}
              {danhMucOptions.length > 0 && (
                <FormControl fullWidth size="small">
                  <InputLabel>Loại yêu cầu</InputLabel>
                  <Select
                    value={filters.DanhMucYeuCauID || ""}
                    onChange={handleChange("DanhMucYeuCauID")}
                    label="Loại yêu cầu"
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    {danhMucOptions.map((dm) => (
                      <MenuItem key={dm._id} value={dm._id}>
                        {dm.TenLoaiYeuCau}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Row 4: Date range */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <DatePicker
                  label="Từ ngày"
                  value={filters.TuNgay ? dayjs(filters.TuNgay) : null}
                  onChange={handleDateChange("TuNgay")}
                  slotProps={{
                    textField: { size: "small", fullWidth: true },
                  }}
                  format="DD/MM/YYYY"
                />
                <DatePicker
                  label="Đến ngày"
                  value={filters.DenNgay ? dayjs(filters.DenNgay) : null}
                  onChange={handleDateChange("DenNgay")}
                  slotProps={{
                    textField: { size: "small", fullWidth: true },
                  }}
                  format="DD/MM/YYYY"
                />
              </Stack>

              {/* Advanced: Nhân viên filters */}
              {showAdvanced && nhanVienOptions.length > 0 && (
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Người tạo</InputLabel>
                    <Select
                      value={filters.NhanVienTaoID || ""}
                      onChange={handleChange("NhanVienTaoID")}
                      label="Người tạo"
                    >
                      <MenuItem value="">Tất cả</MenuItem>
                      {nhanVienOptions.map((nv) => (
                        <MenuItem key={nv._id} value={nv._id}>
                          {nv.HoTen}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel>Người xử lý</InputLabel>
                    <Select
                      value={filters.NhanVienXuLyID || ""}
                      onChange={handleChange("NhanVienXuLyID")}
                      label="Người xử lý"
                    >
                      <MenuItem value="">Tất cả</MenuItem>
                      {nhanVienOptions.map((nv) => (
                        <MenuItem key={nv._id} value={nv._id}>
                          {nv.HoTen}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              )}
            </Stack>
          </Box>
        </Collapse>
      </Box>
    </LocalizationProvider>
  );
}

export default YeuCauFilterPanel;
