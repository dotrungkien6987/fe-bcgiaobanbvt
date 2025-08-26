import React, { useState, useCallback } from "react";
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  Collapse,
  IconButton,
  Typography,
  Divider,
} from "@mui/material";
import {
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/vi";

// Set Vietnamese locale
dayjs.locale("vi");

// Options constants
const TRANG_THAI_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "TAO_MOI", label: "Tạo mới" },
  { value: "DA_GIAO", label: "Đã giao" },
  { value: "CHAP_NHAN", label: "Chấp nhận" },
  { value: "TU_CHOI", label: "Từ chối" },
  { value: "DANG_THUC_HIEN", label: "Đang thực hiện" },
  { value: "CHO_DUYET", label: "Chờ duyệt" },
  { value: "HOAN_THANH", label: "Hoàn thành" },
  { value: "QUA_HAN", label: "Quá hạn" },
  { value: "HUY", label: "Hủy" },
];

const MUC_DO_UU_TIEN_OPTIONS = [
  { value: "", label: "Tất cả mức độ" },
  { value: "THAP", label: "Thấp" },
  { value: "BINH_THUONG", label: "Bình thường" },
  { value: "CAO", label: "Cao" },
  { value: "KHAN_CAP", label: "Khẩn cấp" },
];

// Extended due status options (frontend computed categories)
const TINH_TRANG_HAN_OPTIONS = [
  { value: "", label: "Tất cả tình trạng hạn" },
  { value: "DUNG_HAN", label: "Đúng hạn" },
  { value: "SAP_QUA_HAN", label: "Sắp quá hạn" },
  { value: "QUA_HAN", label: "Quá hạn" },
  { value: "HOAN_THANH_DUNG_HAN", label: "Hoàn thành đúng hạn" },
  { value: "HOAN_THANH_TRE_HAN", label: "Hoàn thành trễ" },
];

const CongViecFilterPanel = ({
  filters,
  onFilterChange,
  onResetFilters,
  isLoading = false,
  managedEmployees = [],
}) => {
  const [expanded, setExpanded] = useState(false);

  // Debounced search
  const handleSearchChange = useCallback(
    (event) => {
      const value = event.target.value;
      onFilterChange("search", value);
    },
    [onFilterChange]
  );

  const handleSelectChange = (field) => (event) => {
    onFilterChange(field, event.target.value);
  };

  const handleDateChange = (field) => (date) => {
    const dateValue = date ? dayjs(date).format("YYYY-MM-DD") : null;
    onFilterChange(field, dateValue);
  };

  const handleReset = () => {
    onResetFilters();
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value && value !== ""
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <FilterListIcon color="primary" />
            <Typography variant="h6">Bộ lọc</Typography>
            {hasActiveFilters && (
              <Typography variant="body2" color="primary">
                (Đang áp dụng)
              </Typography>
            )}
          </Box>
          <Box>
            <Button
              size="small"
              onClick={handleReset}
              startIcon={<ClearIcon />}
              disabled={!hasActiveFilters || isLoading}
              sx={{ mr: 1 }}
            >
              Xóa bộ lọc
            </Button>
            <IconButton onClick={toggleExpanded} size="small">
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Always visible: Mã + Search */}
        <Grid container spacing={2} sx={{ mb: expanded ? 2 : 0 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Mã công việc"
              variant="outlined"
              size="small"
              value={filters.MaCongViec || ""}
              onChange={(e) => onFilterChange("MaCongViec", e.target.value)}
              disabled={isLoading}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Tìm kiếm trong tiêu đề, mô tả..."
              variant="outlined"
              size="small"
              value={filters.search || ""}
              onChange={handleSearchChange}
              disabled={isLoading}
            />
          </Grid>
        </Grid>

        {/* Collapsible advanced filters */}
        <Collapse in={expanded}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={filters.TrangThai || ""}
                  onChange={handleSelectChange("TrangThai")}
                  label="Trạng thái"
                  disabled={isLoading}
                >
                  {TRANG_THAI_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Mức độ ưu tiên</InputLabel>
                <Select
                  value={filters.MucDoUuTien || ""}
                  onChange={handleSelectChange("MucDoUuTien")}
                  label="Mức độ ưu tiên"
                  disabled={isLoading}
                >
                  {MUC_DO_UU_TIEN_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Ngày bắt đầu từ"
                value={filters.NgayBatDau ? dayjs(filters.NgayBatDau) : null}
                onChange={handleDateChange("NgayBatDau")}
                disabled={isLoading}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Hạn chót đến"
                value={filters.NgayHetHan ? dayjs(filters.NgayHetHan) : null}
                onChange={handleDateChange("NgayHetHan")}
                disabled={isLoading}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Người xử lý chính</InputLabel>
                <Select
                  value={filters.NguoiChinhID || ""}
                  onChange={handleSelectChange("NguoiChinhID")}
                  label="Người xử lý chính"
                  disabled={isLoading}
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>Tất cả</em>
                  </MenuItem>
                  {managedEmployees.map((nv) => (
                    <MenuItem key={nv._id} value={nv._id}>
                      {nv.Ten}{" "}
                      {nv.KhoaID?.TenKhoa ? `- ${nv.KhoaID.TenKhoa}` : ""}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Tình trạng hạn</InputLabel>
                <Select
                  value={filters.TinhTrangHan || ""}
                  onChange={handleSelectChange("TinhTrangHan")}
                  label="Tình trạng hạn"
                  disabled={isLoading}
                >
                  {TINH_TRANG_HAN_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Collapse>
      </Paper>
    </LocalizationProvider>
  );
};

export default CongViecFilterPanel;
