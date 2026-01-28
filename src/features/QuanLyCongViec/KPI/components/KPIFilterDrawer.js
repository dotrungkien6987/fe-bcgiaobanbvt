/**
 * KPIFilterDrawer - Mobile filter drawer for KPI Evaluation
 *
 * Features:
 * - Slides in from right
 * - Search by name
 * - Filter by Khoa (department)
 * - Filter by status (approved/pending)
 * - Apply/Reset buttons
 */
import React, { useState, useEffect } from "react";
import {
  Drawer,
  Box,
  Typography,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Divider,
} from "@mui/material";
import { Close as CloseIcon, Search as SearchIcon } from "@mui/icons-material";

function KPIFilterDrawer({
  open,
  onClose,
  filters = {},
  onApply,
  onReset,
  khoaList = [],
}) {
  const [localFilters, setLocalFilters] = useState({
    searchTerm: "",
    filterKhoa: "",
    filterStatus: "",
  });

  // Sync local state with props when drawer opens
  useEffect(() => {
    if (open) {
      setLocalFilters({
        searchTerm: filters.searchTerm || "",
        filterKhoa: filters.filterKhoa || "",
        filterStatus: filters.filterStatus || "",
      });
    }
  }, [open, filters]);

  const handleChange = (field) => (e) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    const emptyFilters = {
      searchTerm: "",
      filterKhoa: "",
      filterStatus: "",
    };
    setLocalFilters(emptyFilters);
    onReset();
    onClose();
  };

  const hasActiveFilters =
    localFilters.searchTerm ||
    localFilters.filterKhoa ||
    localFilters.filterStatus;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100vw", sm: 400 },
          maxWidth: "100vw",
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "primary.lighter",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight={600}>
              🔍 Bộ lọc
            </Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </Box>

        {/* Filter Fields */}
        <Box sx={{ flex: 1, p: 2, overflow: "auto" }}>
          <Stack spacing={2.5}>
            {/* Search */}
            <TextField
              label="Tìm tên nhân viên"
              placeholder="Nhập tên hoặc mã nhân viên..."
              value={localFilters.searchTerm}
              onChange={handleChange("searchTerm")}
              fullWidth
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              }}
            />

            <Divider />

            {/* Khoa Filter */}
            <FormControl fullWidth>
              <InputLabel>Khoa / Phòng ban</InputLabel>
              <Select
                value={localFilters.filterKhoa}
                label="Khoa / Phòng ban"
                onChange={handleChange("filterKhoa")}
              >
                <MenuItem value="">
                  <em>Tất cả</em>
                </MenuItem>
                {khoaList.map((khoa) => (
                  <MenuItem key={khoa} value={khoa}>
                    {khoa}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Status Filter */}
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={localFilters.filterStatus}
                label="Trạng thái"
                onChange={handleChange("filterStatus")}
              >
                <MenuItem value="">
                  <em>Tất cả</em>
                </MenuItem>
                <MenuItem value="CHUA_DUYET">⏳ Chưa duyệt</MenuItem>
                <MenuItem value="DA_DUYET">✅ Đã duyệt</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>

        {/* Actions */}
        <Box
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: "divider",
            bgcolor: "grey.50",
          }}
        >
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={handleReset}
              fullWidth
              disabled={!hasActiveFilters}
            >
              Đặt lại
            </Button>
            <Button variant="contained" onClick={handleApply} fullWidth>
              Áp dụng
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
}

export default KPIFilterDrawer;
