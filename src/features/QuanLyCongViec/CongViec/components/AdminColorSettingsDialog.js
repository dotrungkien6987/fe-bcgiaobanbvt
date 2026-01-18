import React from "react";
import {
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
import BottomSheetDialog from "components/BottomSheetDialog";
import {
  STATUS_COLOR_MAP as DEFAULT_STATUS_COLOR_MAP,
  PRIORITY_COLOR_MAP as DEFAULT_PRIORITY_COLOR_MAP,
  EXT_DUE_COLOR_MAP as DEFAULT_DUE_COLOR_MAP,
  getStatusColor,
  getPriorityColor,
  getStatusText,
  getPriorityText,
  EXT_DUE_LABEL_MAP,
} from "../../../../utils/congViecUtils";

const STATUS_OPTIONS = Object.keys(DEFAULT_STATUS_COLOR_MAP);
const PRIORITY_OPTIONS = Object.keys(DEFAULT_PRIORITY_COLOR_MAP);
const DUE_STATUS_OPTIONS = Object.keys(DEFAULT_DUE_COLOR_MAP);

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
  const dueStatusColors = useSelector((s) => s.colorConfig?.dueStatusColors);

  const [draftStatus, setDraftStatus] = React.useState({});
  const [draftPriority, setDraftPriority] = React.useState({});
  const [draftDueStatus, setDraftDueStatus] = React.useState({});

  React.useEffect(() => {
    const mergedStatus = STATUS_OPTIONS.reduce((acc, code) => {
      acc[code] = statusColors?.[code] || DEFAULT_STATUS_COLOR_MAP[code];
      return acc;
    }, {});
    const mergedPriority = PRIORITY_OPTIONS.reduce((acc, code) => {
      acc[code] = priorityColors?.[code] || DEFAULT_PRIORITY_COLOR_MAP[code];
      return acc;
    }, {});
    const mergedDueStatus = DUE_STATUS_OPTIONS.reduce((acc, code) => {
      acc[code] = dueStatusColors?.[code] || DEFAULT_DUE_COLOR_MAP[code];
      return acc;
    }, {});
    setDraftStatus(mergedStatus);
    setDraftPriority(mergedPriority);
    setDraftDueStatus(mergedDueStatus);
  }, [statusColors, priorityColors, dueStatusColors]);

  const handleResetDefaults = () => {
    setDraftStatus({ ...DEFAULT_STATUS_COLOR_MAP });
    setDraftPriority({ ...DEFAULT_PRIORITY_COLOR_MAP });
    setDraftDueStatus({ ...DEFAULT_DUE_COLOR_MAP });
  };

  const handleSave = async () => {
    if (!isAdmin) return;
    const payload = {
      statusColors: draftStatus,
      priorityColors: draftPriority,
      dueStatusColors: draftDueStatus,
    };
    await dispatch(updateColorConfig(payload));
    onClose?.();
  };

  return (
    <BottomSheetDialog
      open={open}
      onClose={onClose}
      title="Thiết lập màu trạng thái và ưu tiên"
      maxWidth="md"
      actions={
        <>
          <Button onClick={onClose}>Đóng</Button>
          <Button onClick={handleSave} disabled={!isAdmin} variant="contained">
            Lưu
          </Button>
        </>
      }
    >
      <Box>
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

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            Tình trạng hạn
          </Typography>
          <Grid container spacing={2}>
            {DUE_STATUS_OPTIONS.map((code) => (
              <Grid item xs={12} sm={6} key={code}>
                <ColorInput
                  label={EXT_DUE_LABEL_MAP[code]}
                  value={draftDueStatus[code] || DEFAULT_DUE_COLOR_MAP[code]}
                  onChange={(hex) =>
                    setDraftDueStatus((s) => ({ ...s, [code]: hex }))
                  }
                  previewLabel={EXT_DUE_LABEL_MAP[code]}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </BottomSheetDialog>
  );
};

export default AdminColorSettingsDialog;
