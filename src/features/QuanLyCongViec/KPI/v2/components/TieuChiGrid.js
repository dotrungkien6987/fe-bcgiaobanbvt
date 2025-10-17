import React from "react";
import {
  Box,
  Grid,
  Typography,
  Slider,
  TextField,
  Paper,
  Chip,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";

/**
 * TieuChiGrid - Grid chấm điểm các tiêu chí
 *
 * Props:
 * - chiTietDiem: Array of { TieuChiID, TenTieuChi, LoaiTieuChi, DiemDat, GiaTriMin, GiaTriMax }
 * - onChange: (tieuChiId, newScore) => void
 * - readOnly: Boolean (default false)
 *
 * Features:
 * - Slider + Number input (Option D)
 * - Color-coded by LoaiTieuChi (TANG_DIEM: green, GIAM_DIEM: red)
 * - Real-time update
 * - Validation (min/max)
 */
function TieuChiGrid({ chiTietDiem = [], onChange, readOnly = false }) {
  const handleSliderChange = (tieuChiId, newValue) => {
    if (!readOnly && onChange) {
      onChange(tieuChiId, newValue);
    }
  };

  const handleInputChange = (tieuChiId, event) => {
    const value = event.target.value;
    if (value === "") {
      handleSliderChange(tieuChiId, 0);
      return;
    }

    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      handleSliderChange(tieuChiId, numValue);
    }
  };

  const handleInputBlur = (tieuChi, event) => {
    let value = parseFloat(event.target.value);
    const min = tieuChi.GiaTriMin || 0;
    const max = tieuChi.GiaTriMax || 10;

    // Validate range
    if (isNaN(value) || value < min) value = min;
    if (value > max) value = max;

    handleSliderChange(tieuChi.TieuChiID, value);
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
          const score = tieuChi.DiemDat || 0;
          const isTangDiem = tieuChi.LoaiTieuChi === "TANG_DIEM";
          const isGiamDiem = tieuChi.LoaiTieuChi === "GIAM_DIEM";

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
                    </Box>
                  </Box>

                  {/* Number Input */}
                  <TextField
                    type="number"
                    value={score}
                    onChange={(e) => handleInputChange(tieuChi.TieuChiID, e)}
                    onBlur={(e) => handleInputBlur(tieuChi, e)}
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
                        backgroundColor: isTangDiem
                          ? "success.lighter"
                          : isGiamDiem
                          ? "error.lighter"
                          : "background.paper",
                      },
                    }}
                    helperText={`/${max}`}
                  />
                </Box>

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
                      handleSliderChange(tieuChi.TieuChiID, newValue)
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
                      isTangDiem ? "success" : isGiamDiem ? "error" : "primary"
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

                {/* Calculated Score */}
                <Box display="flex" justifyContent="flex-end" mt={1}>
                  <Typography variant="caption" color="text.secondary">
                    Điểm tính toán:{" "}
                    <strong>{(score / 100).toFixed(4)} điểm</strong>
                  </Typography>
                </Box>
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
            Tổng điểm tiêu chí
          </Typography>
          <Typography variant="h5" fontWeight="bold" color="primary.main">
            {chiTietDiem
              .reduce((sum, tc) => {
                const score = (tc.DiemDat || 0) / 100;
                return sum + (tc.LoaiTieuChi === "GIAM_DIEM" ? -score : score);
              }, 0)
              .toFixed(4)}{" "}
            điểm
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default TieuChiGrid;
