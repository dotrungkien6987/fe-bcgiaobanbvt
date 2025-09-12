import React from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
  Divider,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import CodeMultiSelect from "./CodeMultiSelect";

export default function FilterSection({
  fromYear,
  setFromYear,
  toYear,
  setToYear,
  onlyCompleted,
  setOnlyCompleted,
  selectedCodes,
  setSelectedCodes,
  filterOptions,
  loading,
  onRefresh,
}) {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 0,
        mb: 4,
        borderRadius: 3,
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        border: "1px solid #e0e7ff",
      }}
    >
      <Box
        sx={{
          p: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "12px 12px 0 0",
          color: "white",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <FilterIcon sx={{ fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            🎛️ Bộ lọc dữ liệu
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Chip
            label={`${filterOptions.length} mã có số liệu`}
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              color: "white",
              fontWeight: 600,
            }}
          />
        </Stack>
      </Box>

      <Box sx={{ p: 3 }}>
        <Grid container spacing={3} alignItems="end">
          {/* Khoảng năm */}
          <Grid item xs={12} sm={6} md={2}>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1, fontWeight: 600, color: "text.secondary" }}
              >
                📅 Khoảng thời gian
              </Typography>
              <TextField
                label="Từ năm"
                type="number"
                size="small"
                fullWidth
                value={fromYear}
                onChange={(e) => setFromYear(Number(e.target.value))}
                inputProps={{ min: 2020, max: 2030 }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: "white",
                  },
                }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              label="Đến năm"
              type="number"
              size="small"
              fullWidth
              value={toYear}
              onChange={(e) => setToYear(Number(e.target.value))}
              inputProps={{ min: 2020, max: 2030 }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "white",
                },
              }}
            />
          </Grid>

          {/* Trạng thái */}
          <Grid item xs={12} sm={6} md={2}>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1, fontWeight: 600, color: "text.secondary" }}
              >
                ✅ Trạng thái
              </Typography>
              <Paper
                elevation={1}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: onlyCompleted ? "#e8f5e8" : "white",
                  border: onlyCompleted
                    ? "2px solid #4caf50"
                    : "1px solid #e0e0e0",
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={onlyCompleted}
                      onChange={(e) => setOnlyCompleted(e.target.checked)}
                      color="success"
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Chỉ lớp hoàn thành
                    </Typography>
                  }
                />
              </Paper>
            </Box>
          </Grid>

          {/* Chọn mã */}
          <Grid item xs={12} md={4}>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1, fontWeight: 600, color: "text.secondary" }}
              >
                🏷️ Lọc theo mã
              </Typography>
              <Paper
                elevation={1}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: "white",
                  border:
                    selectedCodes.length > 0
                      ? "2px solid #1976d2"
                      : "1px solid #e0e0e0",
                }}
              >
                <CodeMultiSelect
                  options={filterOptions}
                  value={selectedCodes}
                  onChange={setSelectedCodes}
                  placeholder="Chọn mã (để trống = tất cả)"
                />
              </Paper>
            </Box>
          </Grid>

          {/* Nút làm mới */}
          <Grid item xs={12} md={2}>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1, fontWeight: 600, color: "text.secondary" }}
              >
                🔄 Hành động
              </Typography>
              <Button
                variant="contained"
                onClick={onRefresh}
                disabled={loading}
                fullWidth
                startIcon={<RefreshIcon />}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  py: 1.5,
                  fontWeight: 600,
                  background: loading
                    ? "linear-gradient(45deg, #bdbdbd 30%, #9e9e9e 90%)"
                    : "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                  boxShadow: loading ? 1 : 3,
                  "&:hover": {
                    background: loading
                      ? "linear-gradient(45deg, #bdbdbd 30%, #9e9e9e 90%)"
                      : "linear-gradient(45deg, #1976d2 30%, #1565c0 90%)",
                    boxShadow: 6,
                  },
                }}
              >
                {loading ? "Đang tải..." : "Làm mới"}
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Thông tin tóm tắt */}
        <Divider sx={{ my: 2 }} />
        <Box sx={{ mt: 2 }}>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Chip
              icon={<Box sx={{ fontSize: 14 }}>📊</Box>}
              label={`Từ năm ${fromYear} đến ${toYear}`}
              variant="outlined"
              size="small"
              sx={{ fontWeight: 500 }}
            />
            {selectedCodes.length > 0 && (
              <Chip
                icon={<Box sx={{ fontSize: 14 }}>🎯</Box>}
                label={`${selectedCodes.length} mã được chọn`}
                variant="outlined"
                size="small"
                color="primary"
                sx={{ fontWeight: 500 }}
              />
            )}
            {onlyCompleted && (
              <Chip
                icon={<Box sx={{ fontSize: 14 }}>✅</Box>}
                label="Chỉ lớp hoàn thành"
                variant="outlined"
                size="small"
                color="success"
                sx={{ fontWeight: 500 }}
              />
            )}
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
}
