import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  AlertTitle,
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
} from "@mui/material";
import { Warning as WarningIcon } from "@mui/icons-material";
import { useEnvironment } from "../hooks/useEnvironment";

/**
 * Dialog xác nhận nghiêm ngặt cho các thao tác nguy hiểm trên Production
 *
 * @param {Object} props
 * @param {boolean} props.open - Trạng thái mở dialog
 * @param {Function} props.onClose - Hàm đóng dialog
 * @param {Function} props.onConfirm - Hàm xác nhận thao tác
 * @param {string} props.title - Tiêu đề dialog
 * @param {string} props.actionDescription - Mô tả hành động sắp thực hiện
 * @param {string} props.confirmText - Text cần nhập để xác nhận (default: "XAC NHAN")
 * @param {boolean} props.loading - Trạng thái loading
 */
function ProductionConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Xác nhận thao tác",
  actionDescription = "Thực hiện hành động này",
  confirmText = "XAC NHAN",
  loading = false,
}) {
  const { env, isProduction, baseUrl } = useEnvironment();
  const [understood, setUnderstood] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const isValid = understood && inputValue === confirmText;

  const handleClose = useCallback(() => {
    setUnderstood(false);
    setInputValue("");
    onClose();
  }, [onClose]);

  const handleConfirm = useCallback(() => {
    if (isValid) {
      onConfirm();
      handleClose();
    }
  }, [isValid, onConfirm, handleClose]);

  // Nếu không phải production, confirm trực tiếp không cần dialog phức tạp
  if (!isProduction) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Typography>{actionDescription}</Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            Environment: {env} (không phải production)
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Hủy</Button>
          <Button
            variant="contained"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            disabled={loading}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Production: Confirm nghiêm ngặt
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: "error.lighter", color: "error.dark" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WarningIcon color="error" />
          {title}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Action description */}
        <Typography variant="body1" sx={{ mb: 2 }}>
          <strong>Bạn sắp thực hiện:</strong> {actionDescription}
        </Typography>

        <Typography variant="body2" sx={{ mb: 2, fontFamily: "monospace" }}>
          <strong>Server:</strong> {baseUrl}
        </Typography>

        {/* Warning box */}
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>⚠️ CẢNH BÁO</AlertTitle>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>
              Thao tác này <strong>KHÔNG THỂ</strong> hoàn tác
            </li>
            <li>
              Dữ liệu sẽ bị <strong>XÓA VĨNH VIỄN</strong>
            </li>
            <li>
              Ảnh hưởng đến hệ thống <strong>ĐANG VẬN HÀNH</strong>
            </li>
          </ul>
        </Alert>

        {/* Checkbox confirm */}
        <FormControlLabel
          control={
            <Checkbox
              checked={understood}
              onChange={(e) => setUnderstood(e.target.checked)}
              color="error"
            />
          }
          label={
            <Typography variant="body2">
              Tôi hiểu rủi ro và chấp nhận trách nhiệm
            </Typography>
          }
          sx={{ mb: 2 }}
        />

        {/* Text input confirm */}
        <Box>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Nhập "<strong>{confirmText}</strong>" để tiếp tục:
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.toUpperCase())}
            placeholder={confirmText}
            error={inputValue.length > 0 && inputValue !== confirmText}
            helperText={
              inputValue.length > 0 && inputValue !== confirmText
                ? "Không khớp"
                : ""
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                fontFamily: "monospace",
                fontWeight: 600,
              },
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleConfirm}
          disabled={!isValid || loading}
        >
          {loading ? "Đang xử lý..." : "Xác nhận thực hiện"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ProductionConfirmDialog;

/**
 * Custom hook để sử dụng ProductionConfirmDialog dễ dàng hơn
 */
export const useProductionConfirm = () => {
  const [dialogState, setDialogState] = useState({
    open: false,
    title: "",
    actionDescription: "",
    onConfirm: () => {},
  });

  const showConfirm = useCallback(({ title, actionDescription, onConfirm }) => {
    setDialogState({
      open: true,
      title,
      actionDescription,
      onConfirm,
    });
  }, []);

  const hideConfirm = useCallback(() => {
    setDialogState((prev) => ({ ...prev, open: false }));
  }, []);

  const ConfirmDialog = (
    <ProductionConfirmDialog
      open={dialogState.open}
      onClose={hideConfirm}
      onConfirm={dialogState.onConfirm}
      title={dialogState.title}
      actionDescription={dialogState.actionDescription}
    />
  );

  return { showConfirm, hideConfirm, ConfirmDialog };
};
