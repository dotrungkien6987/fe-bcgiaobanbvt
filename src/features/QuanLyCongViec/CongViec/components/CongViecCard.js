import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  IconButton,
  Typography,
  Chip,
  Stack,
  Menu,
  MenuItem,
  Tooltip,
  Box,
  LinearProgress,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  AccountTree as AccountTreeIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import EmployeeAvatar from "components/EmployeeAvatar";
import {
  getStatusColor,
  getPriorityColor,
  getStatusText,
  getPriorityText,
} from "../../../../utils/congViecUtils";

/**
 * CongViecCard Component - Compact card layout for mobile view
 *
 * Replaces table rows on mobile screens (≤768px)
 * Shows: Status, Priority, Deadline, Assignor with avatar, Progress bar, Participants
 * Actions: View, Edit, Delete, Tree View via 3-dot menu
 *
 * @param {Object} data - CongViec object
 * @param {Function} onView - View detail callback
 * @param {Function} onEdit - Edit callback
 * @param {Function} onDelete - Delete callback
 * @param {Function} onTreeView - Tree view callback (optional)
 * @param {boolean} canEdit - Permission to edit
 * @param {boolean} canDelete - Permission to delete
 * @param {boolean} showProgress - Show progress bar (default: false)
 * @param {boolean} showParticipants - Show participants count (default: false)
 * @param {boolean} showAssignee - Show assignee instead of assignor (for manager view)
 */
function CongViecCard({
  data,
  onView,
  onEdit,
  onDelete,
  onTreeView,
  canEdit = true,
  canDelete = true,
  showProgress = false,
  showParticipants = false,
  showAssignee = false,
}) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleView = () => {
    handleMenuClose();
    if (onView) onView(data._id);
  };

  const handleEdit = () => {
    handleMenuClose();
    if (onEdit) onEdit(data);
  };

  const handleDelete = () => {
    handleMenuClose();
    if (onDelete) onDelete(data);
  };

  const handleTreeView = () => {
    handleMenuClose();
    if (onTreeView) onTreeView(data._id);
  };

  const handleViewNewPage = () => {
    handleMenuClose();
    navigate(`/quanlycongviec/congviec/responsive/${data._id}`);
  };

  // Get deadline icon based on TinhTrangThoiHan
  const getDeadlineIcon = () => {
    if (data.TinhTrangThoiHan === "QUA_HAN") {
      return <WarningIcon fontSize="small" color="error" />;
    }
    if (data.TinhTrangThoiHan === "SAP_QUA_HAN") {
      return <ScheduleIcon fontSize="small" color="warning" />;
    }
    return null;
  };

  // Format deadline date
  const deadlineText = data.NgayHetHan
    ? dayjs(data.NgayHetHan).format("DD/MM/YYYY")
    : "Chưa có";

  // Extract assignor info (backend uses NguoiGiaoProfile)
  const assignor = data.NguoiGiaoProfile || data.NguoiGiao || {};
  const assignorName = assignor.HoTen || assignor.Ten || "N/A";

  // Extract assignee info (NguoiChinhProfile for manager view)
  const assignee = data.NguoiChinhProfile || data.NguoiChinh || {};
  const assigneeName = assignee.HoTen || assignee.Ten || "N/A";

  // Determine which person to display
  const displayPerson = showAssignee ? assignee : assignor;
  const displayName = showAssignee ? assigneeName : assignorName;
  const displayLabel = showAssignee ? "Người xử lý" : "Người giao";

  // Calculate progress percentage (if available)
  const progressPercentage = data.TienDoHoanThanh || 0;

  // Get participants count (NguoiPhoiHop array)
  const participantsCount = Array.isArray(data.NguoiPhoiHop)
    ? data.NguoiPhoiHop.length
    : 0;

  return (
    <Card
      sx={{
        mb: 1.5,
        minHeight: 160,
        boxShadow: 1,
        "&:hover": {
          boxShadow: 3,
        },
      }}
    >
      {/* Header */}
      <CardHeader
        avatar={
          <EmployeeAvatar
            size="md"
            nhanVienId={displayPerson?._id}
            name={displayName}
          />
        }
        action={
          <IconButton
            aria-label="actions"
            onClick={handleMenuOpen}
            size="small"
          >
            <MoreVertIcon />
          </IconButton>
        }
        title={
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{
              wordWrap: "break-word",
              whiteSpace: "normal",
            }}
          >
            {data.TenCongViec || data.TieuDe || "Không có tiêu đề"}
          </Typography>
        }
        subheader={
          <Typography variant="caption" color="text.secondary">
            #{data.MaCongViec || data._id?.slice(-6)}
          </Typography>
        }
        sx={{ pb: 1 }}
      />

      {/* Content */}
      <CardContent sx={{ pt: 0, pb: 1 }}>
        <Stack spacing={1}>
          {/* Status & Priority */}
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              label={getStatusText(data.TrangThai)}
              size="small"
              sx={{
                bgcolor: getStatusColor(data.TrangThai),
                color: "white",
                fontWeight: 500,
              }}
            />
            <Chip
              label={getPriorityText(data.MucDoUuTien)}
              size="small"
              sx={{
                bgcolor: getPriorityColor(data.MucDoUuTien),
                color: "white",
                fontWeight: 500,
              }}
            />
          </Stack>

          {/* Deadline */}
          <Stack direction="row" alignItems="center" spacing={0.5}>
            {getDeadlineIcon()}
            <Typography variant="caption" color="text.secondary">
              Hạn: {deadlineText}
            </Typography>
          </Stack>

          {/* Person (Assignor or Assignee) */}
          <Typography variant="caption" color="text.secondary">
            {displayLabel}: {displayName}
          </Typography>

          {/* Progress Bar (if enabled) */}
          {showProgress && (
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={0.5}
              >
                <Typography variant="caption" color="text.secondary">
                  Tiến độ
                </Typography>
                <Typography variant="caption" fontWeight={600}>
                  {progressPercentage}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progressPercentage}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: "grey.200",
                  "& .MuiLinearProgress-bar": {
                    bgcolor:
                      progressPercentage >= 80
                        ? "success.main"
                        : progressPercentage >= 50
                        ? "info.main"
                        : "warning.main",
                  },
                }}
              />
            </Box>
          )}

          {/* Participants Count (if enabled) */}
          {showParticipants && participantsCount > 0 && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <PeopleIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {participantsCount} người phối hợp
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleView}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          Xem chi tiết
        </MenuItem>
        <MenuItem onClick={handleViewNewPage}>
          <OpenInNewIcon fontSize="small" sx={{ mr: 1 }} color="secondary" />
          Xem Page mới
        </MenuItem>
        {onTreeView && (
          <MenuItem onClick={handleTreeView}>
            <AccountTreeIcon fontSize="small" sx={{ mr: 1 }} />
            Xem cây công việc
          </MenuItem>
        )}
        {canEdit && (
          <MenuItem onClick={handleEdit}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Chỉnh sửa
          </MenuItem>
        )}
        {canDelete && (
          <MenuItem onClick={handleDelete}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} color="error" />
            Xóa
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
}

export default CongViecCard;
