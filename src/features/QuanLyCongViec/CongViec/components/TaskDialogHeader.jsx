import React from "react";
import { Box, Typography, Chip, Tooltip, IconButton } from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Flag as FlagIcon,
  Palette as PaletteIcon,
  Tune as TuneIcon,
} from "@mui/icons-material";
// NOTE: components folder is one level deeper than original dialog file, so need an extra ../
import {
  getStatusColor,
  getPriorityColor,
  getStatusText,
  getPriorityText,
} from "../../../../utils/congViecUtils";

const TaskDialogHeader = ({
  congViec,
  user,
  statusOverrides,
  priorityOverrides,
  dueChips,
  onOpenColorLegend,
  onOpenAdminColors,
  onEdit,
  onClose,
  theme,
}) => {
  return (
    <>
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="h5"
          component="div"
          sx={{
            fontWeight: 700,
            mb: 1,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 1,
          }}
          title={`${congViec?.TieuDe || "Công việc"}${
            congViec?.MaCongViec ? " (" + congViec.MaCongViec + ")" : ""
          }`}
        >
          {congViec?.MaCongViec && (
            <Chip
              label={congViec.MaCongViec}
              size="small"
              color="default"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          )}
          <Box
            component="span"
            sx={{
              maxWidth: { xs: "100%", md: "60vw" },
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {congViec?.TieuDe || "Công việc"}
          </Box>
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              Trạng thái:
            </Typography>
            <Chip
              label={getStatusText(congViec.TrangThai) || "Tạo mới"}
              size="small"
              sx={{
                backgroundColor: getStatusColor(
                  congViec.TrangThai,
                  statusOverrides
                ),
                color: "white",
                fontWeight: 600,
              }}
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              Ưu tiên:
            </Typography>
            <Chip
              icon={<FlagIcon />}
              label={getPriorityText(congViec.MucDoUuTien) || "Bình thường"}
              size="small"
              sx={{
                backgroundColor: getPriorityColor(
                  congViec.MucDoUuTien,
                  priorityOverrides
                ),
                color: "white",
                fontWeight: 600,
                "& .MuiChip-icon": {
                  color: "white",
                },
              }}
            />
          </Box>
          {dueChips.map((c) => (
            <Chip
              key={c.key}
              label={c.label}
              size="small"
              sx={{
                fontWeight: 700,
                backgroundColor: c.color,
                color: theme.palette.getContrastText(c.color),
              }}
            />
          ))}
        </Box>
      </Box>
      <Box>
        <Tooltip title="Ghi chú màu sắc">
          <IconButton onClick={onOpenColorLegend} size="small" sx={{ mr: 1 }}>
            <PaletteIcon />
          </IconButton>
        </Tooltip>
        {user?.PhanQuyen === "admin" && (
          <Tooltip title="Thiết lập màu (Admin)">
            <IconButton onClick={onOpenAdminColors} size="small" sx={{ mr: 1 }}>
              <TuneIcon />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Chỉnh sửa">
          <IconButton
            onClick={() => onEdit(congViec)}
            size="small"
            sx={{ mr: 1 }}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
    </>
  );
};

export default TaskDialogHeader;
