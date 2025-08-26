import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  IconButton,
  useTheme,
} from "@mui/material";
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Flag as FlagIcon,
  Palette as PaletteIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import {
  getStatusColor,
  getPriorityColor,
  getStatusText,
  getPriorityText,
  EXT_DUE_LABEL_MAP,
  EXT_DUE_COLOR_MAP,
} from "../../../../utils/congViecUtils";

const ColorLegendDialog = ({ open, onClose }) => {
  const theme = useTheme();
  const statusOverrides = useSelector((s) => s.colorConfig?.statusColors);
  const priorityOverrides = useSelector((s) => s.colorConfig?.priorityColors);

  const statusData = [
    {
      code: "TAO_MOI",
      label: getStatusText("TAO_MOI"),
      color: getStatusColor("TAO_MOI", statusOverrides),
    },
    {
      code: "DA_GIAO",
      label: getStatusText("DA_GIAO"),
      color: getStatusColor("DA_GIAO", statusOverrides),
    },
    {
      code: "CHAP_NHAN",
      label: getStatusText("CHAP_NHAN"),
      color: getStatusColor("CHAP_NHAN", statusOverrides),
    },
    {
      code: "TU_CHOI",
      label: getStatusText("TU_CHOI"),
      color: getStatusColor("TU_CHOI", statusOverrides),
    },
    {
      code: "DANG_THUC_HIEN",
      label: getStatusText("DANG_THUC_HIEN"),
      color: getStatusColor("DANG_THUC_HIEN", statusOverrides),
    },
    {
      code: "CHO_DUYET",
      label: getStatusText("CHO_DUYET"),
      color: getStatusColor("CHO_DUYET", statusOverrides),
    },
    {
      code: "HOAN_THANH",
      label: getStatusText("HOAN_THANH"),
      color: getStatusColor("HOAN_THANH", statusOverrides),
    },
    {
      code: "QUA_HAN",
      label: getStatusText("QUA_HAN"),
      color: getStatusColor("QUA_HAN", statusOverrides),
    },
    {
      code: "HUY",
      label: getStatusText("HUY"),
      color: getStatusColor("HUY", statusOverrides),
    },
  ];

  const priorityData = [
    {
      code: "THAP",
      label: getPriorityText("THAP"),
      color: getPriorityColor("THAP", priorityOverrides),
    },
    {
      code: "BINH_THUONG",
      label: getPriorityText("BINH_THUONG"),
      color: getPriorityColor("BINH_THUONG", priorityOverrides),
    },
    {
      code: "CAO",
      label: getPriorityText("CAO"),
      color: getPriorityColor("CAO", priorityOverrides),
    },
    {
      code: "KHAN_CAP",
      label: getPriorityText("KHAN_CAP"),
      color: getPriorityColor("KHAN_CAP", priorityOverrides),
    },
  ];

  const dueData = [
    "DUNG_HAN",
    "SAP_QUA_HAN",
    "QUA_HAN",
    "HOAN_THANH_DUNG_HAN",
    "HOAN_THANH_TRE_HAN",
  ].map((code) => ({
    code,
    label: EXT_DUE_LABEL_MAP[code],
    color: EXT_DUE_COLOR_MAP[code],
  }));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <PaletteIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Ghi chú màu sắc
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Trạng thái */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle1"
            sx={{
              mb: 2,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
            }}
          >
            <CheckCircleIcon sx={{ mr: 1, fontSize: 20 }} />
            Trạng thái công việc
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            {statusData.map((status) => (
              <Chip
                key={status.code}
                label={status.label}
                sx={{
                  minWidth: 120,
                  fontWeight: 500,
                  backgroundColor: status.color,
                  color: "white",
                  border: `1px solid ${status.color}`,
                  "&:hover": {
                    transform: "scale(1.05)",
                    transition: "transform 0.2s ease",
                    filter: "brightness(1.1)",
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Tình trạng hạn mở rộng */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle1"
            sx={{
              mb: 2,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
            }}
          >
            <CheckCircleIcon sx={{ mr: 1, fontSize: 20 }} />
            Tình trạng hạn
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            {dueData.map((d) => (
              <Chip
                key={d.code}
                label={d.label}
                sx={{
                  minWidth: 150,
                  fontWeight: 500,
                  backgroundColor: d.color,
                  color: "white",
                  border: `1px solid ${d.color}`,
                  "&:hover": {
                    transform: "scale(1.05)",
                    transition: "transform 0.2s ease",
                    filter: "brightness(1.1)",
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Mức độ ưu tiên */}
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              mb: 2,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
            }}
          >
            <FlagIcon sx={{ mr: 1, fontSize: 20 }} />
            Mức độ ưu tiên
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            {priorityData.map((priority) => (
              <Chip
                key={priority.code}
                icon={<FlagIcon />}
                label={priority.label}
                sx={{
                  minWidth: 120,
                  fontWeight: 500,
                  backgroundColor: priority.color,
                  color: "white",
                  border: `1px solid ${priority.color}`,
                  "& .MuiChip-icon": {
                    color: "white",
                  },
                  "&:hover": {
                    transform: "scale(1.05)",
                    transition: "transform 0.2s ease",
                    filter: "brightness(1.1)",
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Ghi chú bổ sung */}
        <Box
          sx={{
            mt: 3,
            p: 2,
            backgroundColor: theme.palette.grey[50],
            borderRadius: 2,
            border: `1px solid ${theme.palette.grey[200]}`,
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: "italic" }}
          >
            💡 <strong>Ghi chú:</strong> Màu sắc giúp bạn dễ dàng phân biệt
            trạng thái và mức độ ưu tiên của các công việc trong hệ thống.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ColorLegendDialog;
