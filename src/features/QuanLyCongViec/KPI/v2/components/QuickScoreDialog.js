import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Slider,
  TextField,
  Box,
  Typography,
  Alert,
  Stack,
  Divider,
} from "@mui/material";
import FlashOnIcon from "@mui/icons-material/FlashOn";

/**
 * QuickScoreDialog - Component cho chức năng chấm điểm nhanh hàng loạt
 *
 * @param {boolean} open - Trạng thái mở/đóng dialog
 * @param {function} onClose - Callback khi đóng dialog
 * @param {function} onConfirm - Callback khi xác nhận chấm điểm (nhận percentage)
 * @param {Array} nhiemVuList - Danh sách nhiệm vụ để tính thống kê
 */
function QuickScoreDialog({ open, onClose, onConfirm, nhiemVuList = [] }) {
  const [percentage, setPercentage] = useState(100);

  // Tính thống kê các nhiệm vụ sẽ bị ảnh hưởng
  const statistics = useMemo(() => {
    let total = 0;
    let alreadyScored = 0;
    let notScored = 0;

    nhiemVuList.forEach((nhiemVu) => {
      nhiemVu.ChiTietDiem?.forEach((tieuChi) => {
        if (tieuChi.IsMucDoHoanThanh) {
          total++;
          if (tieuChi.DiemDat !== null && tieuChi.DiemDat !== undefined) {
            alreadyScored++;
          } else {
            notScored++;
          }
        }
      });
    });

    return { total, alreadyScored, notScored };
  }, [nhiemVuList]);

  const handleSliderChange = (event, newValue) => {
    setPercentage(newValue);
  };

  const handleTextFieldChange = (event) => {
    const value = event.target.value;
    if (value === "") {
      setPercentage(0);
      return;
    }
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 100) {
      setPercentage(numValue);
    }
  };

  const handleConfirm = () => {
    onConfirm(percentage);
    onClose();
  };

  const handleCancel = () => {
    setPercentage(100); // Reset về giá trị mặc định
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <FlashOnIcon color="primary" />
          <Typography variant="h6">Chấm Điểm Nhanh</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {/* Mức độ hoàn thành */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Mức độ hoàn thành
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Slider
                value={percentage}
                onChange={handleSliderChange}
                min={1}
                max={100}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}%`}
                sx={{ flex: 1 }}
              />
              <TextField
                type="number"
                value={percentage}
                onChange={handleTextFieldChange}
                inputProps={{ min: 1, max: 100 }}
                sx={{ width: 80 }}
                size="small"
                InputProps={{
                  endAdornment: <Typography variant="body2">%</Typography>,
                }}
              />
            </Box>
          </Box>

          <Divider />

          {/* Thống kê ảnh hưởng */}
          <Alert severity="info">
            <Typography variant="subtitle2" gutterBottom>
              Thống kê nhiệm vụ bị ảnh hưởng
            </Typography>
            <Stack spacing={0.5}>
              <Typography variant="body2">
                • Tổng số tiêu chí: <strong>{statistics.total}</strong>
              </Typography>
              <Typography variant="body2">
                • Đã chấm điểm (sẽ ghi đè):{" "}
                <strong>{statistics.alreadyScored}</strong>
              </Typography>
              <Typography variant="body2">
                • Chưa chấm điểm (sẽ thêm mới):{" "}
                <strong>{statistics.notScored}</strong>
              </Typography>
            </Stack>
          </Alert>

          {/* Cảnh báo nếu có dữ liệu bị ghi đè */}
          {statistics.alreadyScored > 0 && (
            <Alert severity="warning">
              <Typography variant="body2">
                <strong>Lưu ý:</strong> Có {statistics.alreadyScored} tiêu chí
                đã được chấm điểm sẽ bị ghi đè bởi điểm mới!
              </Typography>
            </Alert>
          )}

          {/* Thông tin bổ sung */}
          <Alert severity="success">
            <Typography variant="body2">
              Chức năng này chỉ áp dụng cho tiêu chí {" "}
              <strong>"Mức độ hoàn thành"</strong>.
            </Typography>
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleCancel} color="inherit">
          Hủy
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          startIcon={<FlashOnIcon />}
          disabled={statistics.total === 0}
        >
          Áp Dụng
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default QuickScoreDialog;
