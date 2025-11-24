import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Slider,
  TextField,
  LinearProgress,
  Button,
  IconButton,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

export default function ProgressEditDialog({
  open,
  onClose,
  currentProgress = 0,
  onSave,
  loading = false,
}) {
  const theme = useTheme();
  const [value, setValue] = useState(currentProgress);

  // Sync với currentProgress khi dialog mở
  useEffect(() => {
    if (open) {
      setValue(currentProgress);
    }
  }, [open, currentProgress]);

  const handleSliderChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleInputChange = (event) => {
    const val = event.target.value === "" ? 0 : Number(event.target.value);
    setValue(Math.max(0, Math.min(100, val)));
  };

  const handleSave = () => {
    if (value !== currentProgress) {
      onSave(value);
    }
  };

  const hasChanged = value !== currentProgress;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.2rem" }}>
          ⚡ Cập nhật tiến độ
        </Typography>
        <IconButton size="small" onClick={onClose} disabled={loading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Progress bar preview */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography
              variant="body2"
              sx={{ fontSize: "0.95rem", fontWeight: 600 }}
            >
              Tiến độ hiện tại
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontSize: "1rem", fontWeight: 700, color: "primary.main" }}
            >
              {currentProgress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={currentProgress}
            sx={{
              height: 12,
              borderRadius: 1,
              bgcolor: "grey.200",
              "& .MuiLinearProgress-bar": {
                background: `linear-gradient(90deg, ${theme.palette.grey[400]} 0%, ${theme.palette.grey[600]} 100%)`,
                borderRadius: 1,
              },
            }}
          />
        </Box>

        {/* New progress preview (nếu khác giá trị cũ) */}
        {hasChanged && (
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography
                variant="body2"
                sx={{ fontSize: "0.95rem", fontWeight: 600 }}
              >
                Tiến độ mới
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "success.main",
                }}
              >
                {value}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={value}
              sx={{
                height: 12,
                borderRadius: 1,
                bgcolor: "grey.200",
                "& .MuiLinearProgress-bar": {
                  background: `linear-gradient(90deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`,
                  borderRadius: 1,
                },
              }}
            />
          </Box>
        )}

        {/* Slider */}
        <Box sx={{ px: 1, mb: 3 }}>
          <Slider
            value={value}
            onChange={handleSliderChange}
            min={0}
            max={100}
            step={1}
            marks={[
              { value: 0, label: "0%" },
              { value: 25, label: "25%" },
              { value: 50, label: "50%" },
              { value: 75, label: "75%" },
              { value: 100, label: "100%" },
            ]}
            valueLabelDisplay="on"
            sx={{
              "& .MuiSlider-valueLabel": {
                fontSize: "1rem",
                fontWeight: 700,
                bgcolor: "primary.main",
              },
              "& .MuiSlider-markLabel": {
                fontSize: "0.75rem",
              },
            }}
          />
        </Box>

        {/* TextField */}
        <TextField
          label="Hoặc nhập chính xác (%)"
          type="number"
          fullWidth
          value={value}
          onChange={handleInputChange}
          inputProps={{ min: 0, max: 100, step: 1 }}
          sx={{
            "& .MuiInputBase-input": {
              fontSize: "1.1rem",
              fontWeight: 600,
              textAlign: "center",
            },
          }}
        />

        {/* Helper text */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            mt: 2,
            display: "block",
            fontSize: "0.85rem",
            fontStyle: "italic",
            textAlign: "center",
          }}
        >
          💡 Kéo thanh slider hoặc nhập số chính xác
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={loading}
          sx={{ fontSize: "0.9rem", fontWeight: 600 }}
        >
          Hủy
        </Button>
        <LoadingButton
          onClick={handleSave}
          variant="contained"
          loading={loading}
          disabled={!hasChanged}
          startIcon={<CheckCircleIcon />}
          sx={{ fontSize: "0.9rem", fontWeight: 600 }}
        >
          Lưu tiến độ
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
