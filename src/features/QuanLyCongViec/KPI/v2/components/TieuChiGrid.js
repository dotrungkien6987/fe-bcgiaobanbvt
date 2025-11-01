import React from "react";
import {
  Box,
  Grid,
  Typography,
  Slider,
  TextField,
  Paper,
  Chip,
  Tooltip,
  Stack,
  Divider,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";

/**
 * TieuChiGrid - Grid chấm điểm các tiêu chí
 *
 * Props:
 * - chiTietDiem: Array of { TieuChiID, TenTieuChi, LoaiTieuChi, DiemDat, GiaTriMin, GiaTriMax, IsMucDoHoanThanh, DiemTuDanhGia, DiemQuanLy }
 * - onChange: (tieuChiId, newScore) => void
 * - readOnly: Boolean (default false)
 *
 * ✅ NEW Features:
 * - Differential input for IsMucDoHoanThanh criterion:
 *   * Shows DiemTuDanhGia (readonly, employee's self-assessment)
 *   * Input DiemQuanLy (manager scores this)
 *   * Preview formula: (DiemQuanLy × 2 + DiemTuDanhGia) / 3
 * - Other criteria: Input DiemDat directly as before
 *
 * Features:
 * - Slider + Number input (Option D)
 * - Color-coded by LoaiTieuChi (TANG_DIEM: green, GIAM_DIEM: red)
 * - Real-time update
 * - Validation (min/max)
 */
function TieuChiGrid({ chiTietDiem = [], onChange, readOnly = false }) {
  const handleSliderChange = (tieuChiId, newValue, fieldName = "DiemDat") => {
    if (!readOnly && onChange) {
      onChange(tieuChiId, newValue, fieldName);
    }
  };

  const handleInputChange = (tieuChiId, event, fieldName = "DiemDat") => {
    const value = event.target.value;
    if (value === "") {
      handleSliderChange(tieuChiId, 0, fieldName);
      return;
    }

    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      handleSliderChange(tieuChiId, numValue, fieldName);
    }
  };

  const handleInputBlur = (tieuChi, event, fieldName = "DiemDat") => {
    let value = parseFloat(event.target.value);
    const min = tieuChi.GiaTriMin || 0;
    const max = tieuChi.GiaTriMax || 10;

    // Validate range
    if (isNaN(value) || value < min) value = min;
    if (value > max) value = max;

    handleSliderChange(tieuChi.TieuChiID, value, fieldName);
  };

  // ✅ NEW: Calculate preview score for IsMucDoHoanThanh
  const calculatePreviewScore = (tieuChi) => {
    const diemNV = tieuChi.DiemTuDanhGia || 0;
    const diemQL = tieuChi.DiemQuanLy || 0;
    return ((diemQL * 2 + diemNV) / 3).toFixed(2);
  };

  if (!chiTietDiem || chiTietDiem.length === 0) {
    return (
      <Box p={2} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          Chưa có tiêu chí đánh giá
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={2}>
        {chiTietDiem.map((tieuChi, index) => {
          const min = tieuChi.GiaTriMin || 0;
          const max = tieuChi.GiaTriMax || 10;
          const isTangDiem = tieuChi.LoaiTieuChi === "TANG_DIEM";
          const isGiamDiem = tieuChi.LoaiTieuChi === "GIAM_DIEM";

          // ✅ NEW: Check if this is the self-assessment criterion
          const isMucDoHoanThanh = tieuChi.IsMucDoHoanThanh === true;

          // For IsMucDoHoanThanh: use DiemQuanLy for input
          // For others: use DiemDat
          const score = isMucDoHoanThanh
            ? tieuChi.DiemQuanLy || 0
            : tieuChi.DiemDat || 0;

          return (
            <Grid item xs={12} key={tieuChi.TieuChiID || index}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderLeft: 4,
                  borderColor: isTangDiem
                    ? "success.main"
                    : isGiamDiem
                    ? "error.main"
                    : "primary.main",
                  backgroundColor: readOnly
                    ? "action.hover"
                    : isMucDoHoanThanh
                    ? "info.lighter"
                    : "background.paper",
                }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  <Box flex={1}>
                    <Typography variant="subtitle2" fontWeight="medium">
                      {tieuChi.TenTieuChi}
                    </Typography>
                    <Box display="flex" gap={1} mt={0.5}>
                      {isTangDiem && (
                        <Chip
                          label="Cộng điểm"
                          size="small"
                          color="success"
                          icon={<AddCircleIcon />}
                          sx={{ height: 20 }}
                        />
                      )}
                      {isGiamDiem && (
                        <Chip
                          label="Trừ điểm"
                          size="small"
                          color="error"
                          icon={<RemoveCircleIcon />}
                          sx={{ height: 20 }}
                        />
                      )}
                      {isMucDoHoanThanh && (
                        <Tooltip title="Tiêu chí tự đánh giá - Có công thức tính điểm">
                          <Chip
                            label="Tự đánh giá"
                            size="small"
                            color="info"
                            icon={<PersonIcon />}
                            sx={{ height: 20 }}
                          />
                        </Tooltip>
                      )}
                    </Box>
                  </Box>

                  {/* Number Input */}
                  <TextField
                    type="number"
                    value={score}
                    onChange={(e) =>
                      handleInputChange(
                        tieuChi.TieuChiID,
                        e,
                        isMucDoHoanThanh ? "DiemQuanLy" : "DiemDat"
                      )
                    }
                    onBlur={(e) =>
                      handleInputBlur(
                        tieuChi,
                        e,
                        isMucDoHoanThanh ? "DiemQuanLy" : "DiemDat"
                      )
                    }
                    disabled={readOnly}
                    inputProps={{
                      min,
                      max,
                      step: 0.5,
                      style: {
                        textAlign: "center",
                        fontSize: 18,
                        fontWeight: "bold",
                      },
                    }}
                    sx={{
                      width: 80,
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: isMucDoHoanThanh
                          ? "info.lighter"
                          : isTangDiem
                          ? "success.lighter"
                          : isGiamDiem
                          ? "error.lighter"
                          : "background.paper",
                      },
                    }}
                    helperText={`/${max}`}
                  />
                </Box>

                {/* ✅ NEW: Show employee's self-assessment for IsMucDoHoanThanh */}
                {isMucDoHoanThanh && (
                  <Box
                    sx={{ mb: 1, p: 1.5, bgcolor: "grey.50", borderRadius: 1 }}
                  >
                    <Stack spacing={1}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="flex"
                          alignItems="center"
                          gap={0.5}
                        >
                          <PersonIcon fontSize="small" />
                          Điểm nhân viên tự đánh giá:
                        </Typography>
                        <Chip
                          icon={<LockIcon fontSize="small" />}
                          label={`${tieuChi.DiemTuDanhGia || 0}%`}
                          size="small"
                          color="default"
                          variant="outlined"
                        />
                      </Box>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="flex"
                          alignItems="center"
                          gap={0.5}
                        >
                          <SupervisorAccountIcon fontSize="small" />
                          Điểm quản lý đánh giá:
                        </Typography>
                        <Chip
                          label={`${tieuChi.DiemQuanLy || 0}%`}
                          size="small"
                          color="primary"
                        />
                      </Box>
                      <Divider />
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography
                          variant="caption"
                          fontWeight="bold"
                          color="primary"
                        >
                          Điểm dự kiến (sau duyệt):
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color="primary.main"
                        >
                          {calculatePreviewScore(tieuChi)}%
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontStyle="italic"
                        textAlign="center"
                      >
                        Công thức: (Điểm QL × 2 + Điểm NV) / 3
                      </Typography>
                    </Stack>
                  </Box>
                )}

                {/* Slider */}
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ minWidth: 30 }}
                  >
                    {min}
                  </Typography>

                  <Slider
                    value={score}
                    onChange={(e, newValue) =>
                      handleSliderChange(
                        tieuChi.TieuChiID,
                        newValue,
                        isMucDoHoanThanh ? "DiemQuanLy" : "DiemDat"
                      )
                    }
                    min={min}
                    max={max}
                    step={0.5}
                    marks={[
                      { value: min, label: min },
                      { value: max, label: max },
                    ]}
                    disabled={readOnly}
                    sx={{
                      flex: 1,
                      "& .MuiSlider-thumb": {
                        width: 20,
                        height: 20,
                      },
                      "& .MuiSlider-rail": {
                        height: 8,
                      },
                      "& .MuiSlider-track": {
                        height: 8,
                      },
                    }}
                    color={
                      isMucDoHoanThanh
                        ? "info"
                        : isTangDiem
                        ? "success"
                        : isGiamDiem
                        ? "error"
                        : "primary"
                    }
                  />

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ minWidth: 30 }}
                  >
                    {max}
                  </Typography>
                </Box>

                {/* Calculated Score - Only show for non-IsMucDoHoanThanh */}
                {!isMucDoHoanThanh && (
                  <Box display="flex" justifyContent="flex-end" mt={1}>
                    <Typography variant="caption" color="text.secondary">
                      Điểm tính toán:{" "}
                      <strong>{(score / 100).toFixed(4)} điểm</strong>
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Tổng điểm tiêu chí */}
      <Paper
        sx={{
          mt: 2,
          p: 2,
          backgroundColor: "primary.lighter",
          borderLeft: 4,
          borderColor: "primary.main",
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight="medium">
            Tổng điểm tiêu chí (Dự kiến)
          </Typography>
          <Typography variant="h5" fontWeight="bold" color="primary.main">
            {chiTietDiem
              .reduce((sum, tc) => {
                // For IsMucDoHoanThanh: use preview score
                // For others: use DiemDat
                let scoreValue;
                if (tc.IsMucDoHoanThanh) {
                  const diemNV = tc.DiemTuDanhGia || 0;
                  const diemQL = tc.DiemQuanLy || 0;
                  scoreValue = (diemQL * 2 + diemNV) / 3 / 100;
                } else {
                  scoreValue = (tc.DiemDat || 0) / 100;
                }

                return (
                  sum +
                  (tc.LoaiTieuChi === "GIAM_DIEM" ? -scoreValue : scoreValue)
                );
              }, 0)
              .toFixed(4)}{" "}
            điểm
          </Typography>
        </Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block", textAlign: "center" }}
        >
          * Điểm cuối cùng sẽ được tính khi duyệt KPI
        </Typography>
      </Paper>
    </Box>
  );
}

export default TieuChiGrid;
