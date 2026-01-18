import React, { useState, useEffect } from "react";
import { Button, TextField, Typography, Box } from "@mui/material";
import BottomSheetDialog from "components/BottomSheetDialog";

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
function ProgressConfirmDialog({
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
    <BottomSheetDialog
      open={open}
      onClose={loading ? undefined : onCancel}
      title="Xác nhận cập nhật tiến độ"
      maxWidth="sm"
      actions={
        <>
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
        </>
      }
    >
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
        label="Ghi chú (tùy chọn)"
        placeholder="Nhập ghi chú về thay đổi tiến độ..."
        multiline
        rows={3}
        fullWidth
        value={note}
        onChange={(e) => setNote(e.target.value)}
        size="small"
      />
    </BottomSheetDialog>
  );
}

export default ProgressConfirmDialog;
