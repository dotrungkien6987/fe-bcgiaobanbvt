import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  Tooltip,
  IconButton,
} from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import { useDispatch, useSelector } from "react-redux";
import { updateColorConfig } from "../colorConfigSlice";
import {
  STATUS_COLOR_MAP as DEFAULT_STATUS_COLOR_MAP,
  PRIORITY_COLOR_MAP as DEFAULT_PRIORITY_COLOR_MAP,
  getStatusColor,
  getPriorityColor,
  getStatusText,
  getPriorityText,
} from "../../../../utils/congViecUtils";

const STATUS_OPTIONS = Object.keys(DEFAULT_STATUS_COLOR_MAP);
const PRIORITY_OPTIONS = Object.keys(DEFAULT_PRIORITY_COLOR_MAP);

const ColorInput = ({ label, value, onChange, previewLabel }) => (
  <Stack direction="row" spacing={2} alignItems="center">
    <Typography variant="body2" sx={{ minWidth: 160 }}>
      {label}
    </Typography>
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: 40,
        height: 32,
        border: "none",
        background: "transparent",
        cursor: "pointer",
      }}
      aria-label={`Chọn màu cho ${label}`}
    />
    <Chip
      label={previewLabel}
      sx={{
        backgroundColor: value,
        color: "#fff",
        fontWeight: 600,
      }}
    />
  </Stack>
);

const AdminColorSettingsDialog = ({ open, onClose, isAdmin }) => {
  const dispatch = useDispatch();
  const statusColors = useSelector((s) => s.colorConfig?.statusColors);
  const priorityColors = useSelector((s) => s.colorConfig?.priorityColors);

  const [draftStatus, setDraftStatus] = React.useState({});
  const [draftPriority, setDraftPriority] = React.useState({});

  React.useEffect(() => {
    const mergedStatus = STATUS_OPTIONS.reduce((acc, code) => {
      acc[code] = statusColors?.[code] || DEFAULT_STATUS_COLOR_MAP[code];
      return acc;
    }, {});
    const mergedPriority = PRIORITY_OPTIONS.reduce((acc, code) => {
      acc[code] = priorityColors?.[code] || DEFAULT_PRIORITY_COLOR_MAP[code];
      return acc;
    }, {});
    setDraftStatus(mergedStatus);
    setDraftPriority(mergedPriority);
  }, [statusColors, priorityColors]);

  const handleResetDefaults = () => {
    setDraftStatus({ ...DEFAULT_STATUS_COLOR_MAP });
    setDraftPriority({ ...DEFAULT_PRIORITY_COLOR_MAP });
  };

  const handleSave = async () => {
    if (!isAdmin) return;
    const payload = {
      statusColors: draftStatus,
      priorityColors: draftPriority,
    };
    await dispatch(updateColorConfig(payload));
    onClose?.();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Thiết lập màu trạng thái và ưu tiên</DialogTitle>
      <DialogContent dividers>
        {!isAdmin && (
          <Typography variant="body2" color="warning.main" sx={{ mb: 2 }}>
            Bạn không có quyền thay đổi. Vui lòng liên hệ Admin.
          </Typography>
        )}
        <Box sx={{ mb: 2 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="subtitle1" fontWeight={700}>
              Trạng thái công việc
            </Typography>
            <Tooltip title="Khôi phục mặc định">
              <span>
                <IconButton
                  size="small"
                  onClick={handleResetDefaults}
                  disabled={!isAdmin}
                >
                  <RestoreIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {STATUS_OPTIONS.map((code) => (
              <Grid item xs={12} sm={6} key={code}>
                <ColorInput
                  label={getStatusText(code)}
                  value={draftStatus[code] || getStatusColor(code)}
                  onChange={(hex) =>
                    setDraftStatus((s) => ({ ...s, [code]: hex }))
                  }
                  previewLabel={getStatusText(code)}
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            Mức độ ưu tiên
          </Typography>
          <Grid container spacing={2}>
            {PRIORITY_OPTIONS.map((code) => (
              <Grid item xs={12} sm={6} key={code}>
                <ColorInput
                  label={getPriorityText(code)}
                  value={draftPriority[code] || getPriorityColor(code)}
                  onChange={(hex) =>
                    setDraftPriority((s) => ({ ...s, [code]: hex }))
                  }
                  previewLabel={getPriorityText(code)}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
        <Button onClick={handleSave} disabled={!isAdmin} variant="contained">
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminColorSettingsDialog;
