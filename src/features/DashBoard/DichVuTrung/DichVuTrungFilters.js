/**
 * @fileoverview Bộ lọc cho Dịch Vụ Trùng
 * @module features/DashBoard/DichVuTrung/DichVuTrungFilters
 */

import React from "react";
import {
  Box,
  Paper,
  Stack,
  Button,
  Typography,
  Chip,
  Alert,
  FormControlLabel,
  Checkbox,
  FormGroup,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";

/**
 * Component bộ lọc với date picker + toggle buttons cho loại dịch vụ
 */
function DichVuTrungFilters({
  fromDate,
  toDate,
  serviceTypes,
  onFromDateChange,
  onToDateChange,
  onServiceTypesChange,
  onSearch,
  onReset,
  loading,
}) {
  // Date preset buttons
  const handlePresetClick = (preset) => {
    const today = dayjs();
    switch (preset) {
      case "today":
        onFromDateChange(today);
        onToDateChange(today);
        break;
      case "7days":
        onFromDateChange(today.subtract(6, "day"));
        onToDateChange(today);
        break;
      case "30days":
        onFromDateChange(today.subtract(29, "day"));
        onToDateChange(today);
        break;
      default:
        break;
    }
  };

  // Validate date range (warning if > 60 days)
  const daysDiff = toDate && fromDate ? toDate.diff(fromDate, "day") : 0;
  const showWarning = daysDiff > 60;

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Stack spacing={2}>
        {/* Row 1: Date pickers */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems="center"
          >
            <DatePicker
              label="Từ ngày"
              value={fromDate}
              onChange={onFromDateChange}
              format="DD/MM/YYYY"
              disabled={loading}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                },
              }}
            />
            <DatePicker
              label="Đến ngày"
              value={toDate}
              onChange={onToDateChange}
              format="DD/MM/YYYY"
              minDate={fromDate}
              disabled={loading}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                },
              }}
            />
          </Stack>
        </LocalizationProvider>

        {/* Row 2: Service type checkboxes */}
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ mb: 1, color: "text.secondary" }}
          >
            Loại Dịch Vụ:
          </Typography>
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={serviceTypes.includes("04CDHA")}
                  onChange={(e) => {
                    const newTypes = e.target.checked
                      ? [...serviceTypes, "04CDHA"]
                      : serviceTypes.filter((t) => t !== "04CDHA");
                    if (newTypes.length > 0) onServiceTypesChange(newTypes);
                  }}
                  disabled={loading}
                  sx={{
                    color: "#1976d2",
                    "&.Mui-checked": { color: "#1976d2" },
                  }}
                />
              }
              label={
                <Chip
                  label="CĐHA"
                  size="small"
                  sx={{
                    bgcolor: serviceTypes.includes("04CDHA")
                      ? "#1976d2"
                      : "grey.300",
                    color: serviceTypes.includes("04CDHA")
                      ? "white"
                      : "text.primary",
                    fontWeight: 600,
                  }}
                />
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={serviceTypes.includes("03XN")}
                  onChange={(e) => {
                    const newTypes = e.target.checked
                      ? [...serviceTypes, "03XN"]
                      : serviceTypes.filter((t) => t !== "03XN");
                    if (newTypes.length > 0) onServiceTypesChange(newTypes);
                  }}
                  disabled={loading}
                  sx={{
                    color: "#d32f2f",
                    "&.Mui-checked": { color: "#d32f2f" },
                  }}
                />
              }
              label={
                <Chip
                  label="XÉT NGHIỆM"
                  size="small"
                  sx={{
                    bgcolor: serviceTypes.includes("03XN")
                      ? "#d32f2f"
                      : "grey.300",
                    color: serviceTypes.includes("03XN")
                      ? "white"
                      : "text.primary",
                    fontWeight: 600,
                  }}
                />
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={serviceTypes.includes("05TDCN")}
                  onChange={(e) => {
                    const newTypes = e.target.checked
                      ? [...serviceTypes, "05TDCN"]
                      : serviceTypes.filter((t) => t !== "05TDCN");
                    if (newTypes.length > 0) onServiceTypesChange(newTypes);
                  }}
                  disabled={loading}
                  sx={{
                    color: "#ed6c02",
                    "&.Mui-checked": { color: "#ed6c02" },
                  }}
                />
              }
              label={
                <Chip
                  label="THĂM DÒ CN"
                  size="small"
                  sx={{
                    bgcolor: serviceTypes.includes("05TDCN")
                      ? "#ed6c02"
                      : "grey.300",
                    color: serviceTypes.includes("05TDCN")
                      ? "white"
                      : "text.primary",
                    fontWeight: 600,
                  }}
                />
              }
            />
          </FormGroup>
        </Box>

        {/* Row 3: Preset buttons + Search button */}
        <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
          <Button
            variant="outlined"
            size="small"
            onClick={() => handlePresetClick("today")}
            disabled={loading}
            sx={{
              fontWeight: 600,
              borderColor: "#1976d2",
              color: "#1976d2",
              "&:hover": {
                borderColor: "#1565c0",
                bgcolor: "rgba(25, 118, 210, 0.04)",
              },
            }}
          >
            Hôm nay
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handlePresetClick("7days")}
            disabled={loading}
            sx={{
              fontWeight: 600,
              borderColor: "#1976d2",
              color: "#1976d2",
              "&:hover": {
                borderColor: "#1565c0",
                bgcolor: "rgba(25, 118, 210, 0.04)",
              },
            }}
          >
            7 ngày
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handlePresetClick("30days")}
            disabled={loading}
            sx={{
              fontWeight: 600,
              borderColor: "#1976d2",
              color: "#1976d2",
              "&:hover": {
                borderColor: "#1565c0",
                bgcolor: "rgba(25, 118, 210, 0.04)",
              },
            }}
          >
            30 ngày
          </Button>

          <Box sx={{ flexGrow: 1 }} />

          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={onSearch}
            disabled={loading || !fromDate || !toDate}
            sx={{ minWidth: 150 }}
          >
            {loading ? "Đang tìm..." : "Xem Dữ Liệu"}
          </Button>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onReset}
            disabled={loading}
            sx={{
              fontWeight: 600,
              borderColor: "#1976d2",
              color: "#1976d2",
              "&:hover": {
                borderColor: "#1565c0",
                bgcolor: "rgba(25, 118, 210, 0.04)",
              },
            }}
          >
            Làm mới
          </Button>
        </Stack>

        {/* Warning if date range > 60 days */}
        {showWarning && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            ⚠️ Khoảng thời gian tìm kiếm vượt quá 60 ngày ({daysDiff} ngày). Kết
            quả có thể bị giới hạn.
          </Alert>
        )}
      </Stack>
    </Paper>
  );
}

export default DichVuTrungFilters;
