import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Slide,
} from "@mui/material";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * ProgressConfirmDialog
 * Props:
 *  open: boolean
 *  oldValue: number
 *  newValue: number
 *  autoComplete: boolean (if newValue === 100 triggers status completion)
 *  loading: boolean
 *  onCancel(): void
 *  onConfirm(note: string): void
 */
export default function ProgressConfirmDialog({
  open,
  oldValue,
  newValue,
  autoComplete,
  loading,
  onCancel,
  onConfirm,
}) {
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setNote("");
      setTouched(false);
    }
  }, [open]);

  const decrease = newValue < oldValue;
  const color = decrease ? "warning.main" : "primary.main";

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      TransitionComponent={Transition}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Xác nhận cập nhật tiến độ</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Bạn sắp cập nhật tiến độ:
          </Typography>
          <Typography variant="h6" sx={{ mt: 0.5 }}>
            <Box component="span" sx={{ fontWeight: 500, color }}>
              {oldValue}% ➜ {newValue}%
            </Box>
          </Typography>
          {decrease && (
            <Typography variant="caption" color="warning.main">
              Giảm tiến độ được phép (lưu vết lịch sử).
            </Typography>
          )}
          {autoComplete && (
            <Typography
              variant="caption"
              color="success.main"
              sx={{ display: "block", mt: 0.5 }}
            >
              Đạt 100% sẽ tự động chuyển trạng thái Hoàn thành.
            </Typography>
          )}
        </Box>
        <TextField
          label="Ghi chú (tuỳ chọn)"
          placeholder="Nhập ghi chú lý do thay đổi, có thể bỏ trống"
          fullWidth
          multiline
          minRows={2}
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            if (!touched) setTouched(true);
          }}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading} variant="outlined">
          Huỷ
        </Button>
        <Button
          onClick={() => onConfirm(note.trim() || undefined)}
          disabled={loading}
          variant="contained"
          color={autoComplete ? "success" : "primary"}
        >
          {loading ? "Đang lưu..." : "Xác nhận"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
