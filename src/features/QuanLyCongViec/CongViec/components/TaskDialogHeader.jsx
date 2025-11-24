import React from "react";
import {
  Box,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  LinearProgress,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Flag as FlagIcon,
  Palette as PaletteIcon,
  Tune as TuneIcon,
  Create as CreateIcon,
  AccountTree as AccountTreeIcon,
} from "@mui/icons-material";
// NOTE: components folder is one level deeper than original dialog file, so need an extra ../
import {
  getStatusColor,
  getPriorityColor,
  getStatusText,
  getPriorityText,
} from "../../../../utils/congViecUtils";
import { ACTION_META } from "../congViecSlice";
import { canEditCongViec, getEditDisabledReason } from "../congViecPermissions";

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
  availableActions = [],
  actionLoading,
  onTriggerAction,
  canEditProgress = false,
  onOpenProgressEdit,
  routineTaskSelectorNode, // ✅ NEW: Compact button for routine task
  // NEW props:
  currentUserRole,
  currentUserNhanVienId,
  onOpenTree,
}) => {
  const currentProgress = congViec?.PhanTramTienDoTong ?? congViec?.TienDo ?? 0;

  // Tính toán quyền edit
  const canEdit = canEditCongViec({
    congViec,
    currentUserRole,
    currentUserNhanVienId,
  });
  const editTooltip = !canEdit
    ? getEditDisabledReason({
        congViec,
        currentUserRole,
        currentUserNhanVienId,
      })
    : "Chỉnh sửa";

  return (
    <Box sx={{ width: "100%" }}>
      {/* Row 1: Title + Action buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 1.5,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 700,
              mb: 1,
              color: "white",
              fontSize: { xs: "1.3rem", sm: "1.4rem", md: "1.5rem" },
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 1,
              textShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
            title={`${congViec?.TieuDe || "Công việc"}${
              congViec?.MaCongViec ? " (" + congViec.MaCongViec + ")" : ""
            }`}
          >
            {congViec?.MaCongViec && (
              <Chip
                label={congViec.MaCongViec}
                size="medium"
                variant="outlined"
                sx={{
                  fontWeight: 600,
                  fontSize: "1rem",
                  borderColor: "rgba(255,255,255,0.5)",
                  color: "white",
                  bgcolor: "rgba(255,255,255,0.1)",
                }}
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
                variant="body1"
                sx={{
                  fontWeight: 600,
                  fontSize: "1rem",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                Trạng thái:
              </Typography>
              <Chip
                label={getStatusText(congViec.TrangThai) || "Tạo mới"}
                size="medium"
                sx={{
                  backgroundColor: getStatusColor(
                    congViec.TrangThai,
                    statusOverrides
                  ),
                  color: "white",
                  fontWeight: 600,
                  fontSize: "1rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  fontSize: "1rem",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                Ưu tiên:
              </Typography>
              <Chip
                icon={<FlagIcon />}
                label={getPriorityText(congViec.MucDoUuTien) || "Bình thường"}
                size="medium"
                sx={{
                  backgroundColor: getPriorityColor(
                    congViec.MucDoUuTien,
                    priorityOverrides
                  ),
                  color: "white",
                  fontWeight: 600,
                  fontSize: "1rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
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
                size="medium"
                sx={{
                  fontWeight: 700,
                  fontSize: "1rem",
                  backgroundColor: c.color,
                  color: theme.palette.getContrastText(c.color),
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Right side control buttons */}
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="Ghi chú màu sắc">
            <IconButton
              onClick={onOpenColorLegend}
              size="small"
              sx={{ color: "white" }}
            >
              <PaletteIcon />
            </IconButton>
          </Tooltip>
          {user?.PhanQuyen === "admin" && (
            <Tooltip title="Thiết lập màu (Admin)">
              <IconButton
                onClick={onOpenAdminColors}
                size="small"
                sx={{ color: "white" }}
              >
                <TuneIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Cây công việc">
            <IconButton
              onClick={() => onOpenTree?.(congViec)}
              size="small"
              sx={{ color: "white" }}
            >
              <AccountTreeIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={editTooltip}>
            <span>
              <IconButton
                onClick={() => onEdit(congViec)}
                size="small"
                sx={{ color: "white" }}
                disabled={!canEdit}
              >
                <EditIcon />
              </IconButton>
            </span>
          </Tooltip>
          <IconButton onClick={onClose} size="small" sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Row 2: Action buttons + Progress Display (CÙNG DÒNG) */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          alignItems: "center",
          flexWrap: "wrap",
          pt: 1.5,
          borderTop: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        {/* Left: Action buttons */}
        {availableActions.length > 0 && (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                color: "white",
              }}
            >
              🎯 Hành động:
            </Typography>
            {availableActions.map((action) => {
              const meta = ACTION_META[action] || {};
              return (
                <LoadingButton
                  key={action}
                  size="small"
                  variant="contained"
                  color={meta.color || "primary"}
                  startIcon={meta.icon}
                  loading={actionLoading === action}
                  onClick={() => onTriggerAction(action)}
                  sx={{
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    textTransform: "none",
                    py: 0.5,
                    px: 1.5,
                  }}
                >
                  {meta.label || action}
                </LoadingButton>
              );
            })}
          </Box>
        )}

        {/* Vertical Divider (nếu có cả actions và progress) */}
        {availableActions.length > 0 && (
          <Box
            sx={{
              width: "1px",
              height: "32px",
              bgcolor: "rgba(255,255,255,0.2)",
              mx: 1,
            }}
          />
        )}

        {/* Right: Progress Display + Edit Button */}
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                fontSize: "1rem",
                whiteSpace: "nowrap",
                color: "white",
              }}
            >
              ⚡ Tiến độ:
            </Typography>
            <Box sx={{ minWidth: 150 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={currentProgress}
                  sx={{
                    width: 150,
                    height: 8,
                    borderRadius: 1,
                    bgcolor: "rgba(255,255,255,0.2)",
                    "& .MuiLinearProgress-bar": {
                      background:
                        "linear-gradient(90deg, #10b981 0%, #059669 100%)",
                      borderRadius: 1,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    },
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    color: "white",
                    minWidth: 45,
                  }}
                >
                  {currentProgress}%
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Edit button (chỉ hiện khi có quyền) */}
          {canEditProgress && (
            <Tooltip title="Cập nhật tiến độ">
              <IconButton
                size="small"
                onClick={onOpenProgressEdit}
                sx={{
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.5)",
                  bgcolor: "rgba(255,255,255,0.1)",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.2)",
                  },
                }}
              >
                <CreateIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* ✅ NEW: Vertical Divider + Routine Task Compact Button */}
        {routineTaskSelectorNode && (
          <>
            <Box
              sx={{
                width: "1px",
                height: "32px",
                bgcolor: "rgba(255,255,255,0.2)",
                mx: 1,
              }}
            />
            <Box sx={{ flexShrink: 0 }}>{routineTaskSelectorNode}</Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default TaskDialogHeader;
