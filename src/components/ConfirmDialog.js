import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Divider,
} from "@mui/material";
import { Warning, Info, Error, CheckCircle } from "@mui/icons-material";

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Xác nhận",
  message,
  details = null,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  confirmColor = "primary",
  severity = "warning", // warning, info, error, success
  maxWidth = "sm",
  loading = false,
}) => {
  const getIcon = () => {
    switch (severity) {
      case "warning":
        return <Warning color="warning" />;
      case "error":
        return <Error color="error" />;
      case "success":
        return <CheckCircle color="success" />;
      default:
        return <Info color="info" />;
    }
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          {getIcon()}
          <Typography variant="h6" component="span">
            {title}
          </Typography>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2, pb: 1 }}>
        <Typography variant="body1" sx={{ mb: details ? 2 : 0 }}>
          {message}
        </Typography>

        {details && (
          <Alert severity={severity} sx={{ mt: 1 }}>
            <Typography variant="body2">{details}</Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading} variant="outlined">
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          color={confirmColor}
          variant="contained"
          disabled={loading}
          autoFocus
        >
          {loading ? "Đang xử lý..." : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
