import React from "react";
import {
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Box,
  Typography,
  LinearProgress,
  IconButton,
  Tooltip,
  Stack,
  Avatar,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Comment as CommentIcon,
  Attachment as AttachmentIcon,
  AccountTree as AccountTreeIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import OpenTaskInNewTabButton from "../../../../components/OpenTaskInNewTabButton";
import {
  canEditCongViec,
  canDeleteCongViec,
  getEditDisabledReason,
  getDeleteDisabledReason,
} from "../congViecPermissions";
import {
  computeExtendedDueStatus as getExtendedDueStatus,
  getStatusColor,
  getPriorityColor,
  getStatusText as getStatusLabel,
  getPriorityText as getPriorityLabel,
} from "../../../../utils/congViecUtils";

// Map backend priority codes to Vietnamese labels - keeping for fallback
const PRIORITY_LABEL_MAP = {
  THAP: "Thấp",
  BINH_THUONG: "Bình thường",
  CAO: "Cao",
  KHAN_CAP: "Rất cao",
};

// Map backend status codes to Vietnamese labels - keeping for fallback
const STATUS_LABEL_MAP = {
  TAO_MOI: "Tạo mới",
  DA_GIAO: "Đã giao",
  DANG_THUC_HIEN: "Đang thực hiện",
  CHO_DUYET: "Chờ duyệt",
  HOAN_THANH: "Hoàn thành",
};

const EXT_LABEL = {
  DUNG_HAN: "Đúng hạn",
  SAP_QUA_HAN: "Sắp quá hạn",
  QUA_HAN: "Quá hạn",
  HOAN_THANH_DUNG_HAN: "HT đúng hạn",
  HOAN_THANH_TRE_HAN: "HT trễ",
};
const EXT_COLOR = {
  DUNG_HAN: "success",
  SAP_QUA_HAN: "warning",
  QUA_HAN: "error",
  HOAN_THANH_DUNG_HAN: "success",
  HOAN_THANH_TRE_HAN: "error",
};

function formatDate(d) {
  return d ? dayjs(d).format("DD/MM/YYYY") : "—";
}

const SubtasksTable = ({
  subtasks = [],
  loading = false,
  onView,
  onEdit,
  onDelete,
  updatingId,
  deletingId,
  emptyMessage = "Chưa có công việc con",
  currentUserRole,
  currentUserNhanVienId,
  onTree,
}) => {
  const statusOverrides = useSelector((s) => s.colorConfig?.statusColors);
  const priorityOverrides = useSelector((s) => s.colorConfig?.priorityColors);

  if (loading) {
    return (
      <Paper variant="outlined">
        <Box p={2}>
          <Typography variant="body2">Đang tải công việc con...</Typography>
          <LinearProgress sx={{ mt: 1 }} />
        </Box>
      </Paper>
    );
  }
  if (!subtasks.length) {
    return (
      <Paper variant="outlined">
        <Box p={3} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            {emptyMessage}
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ mt: 1 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Tiêu đề</TableCell>
            <TableCell>Ưu tiên</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell>Hạn</TableCell>
            <TableCell width={110}>Tiến độ</TableCell>
            <TableCell>Người giao</TableCell>
            <TableCell>Người chính</TableCell>
            <TableCell>Tương tác</TableCell>
            <TableCell width={110}>Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {subtasks.map((cv) => {
            const ext = getExtendedDueStatus(cv);
            const progress =
              cv.PhanTramTienDoTong ??
              cv.TienDo ??
              (typeof cv.TienDo === "number" ? cv.TienDo : 0);
            // Fallback chain for người giao với populated object
            const giao =
              cv.NguoiGiaoProfile ||
              cv.NguoiGiaoViecProfile ||
              cv.NguoiGiaoViecID || // populated object from BE
              (typeof cv.NguoiGiaoID === "object" ? cv.NguoiGiaoID : null);
            const chinh = cv.NguoiChinhProfile || cv.NguoiChinhID;
            const giaoName =
              giao?.Ten || giao?.HoTen || giao?.name || giao?.FullName;
            const chinhName =
              chinh?.Ten || chinh?.HoTen || chinh?.name || chinh?.FullName;
            const soBL = cv.SoLuongBinhLuan || 0;
            const soTP = cv.SoLuongNguoiThamGia || 0;
            const rawPrio = cv.MucDoUuTien || "";
            const prio =
              getPriorityLabel(rawPrio) ||
              PRIORITY_LABEL_MAP[rawPrio] ||
              rawPrio;
            const rawStatus = cv.TrangThai;
            const status =
              getStatusLabel(rawStatus) ||
              STATUS_LABEL_MAP[rawStatus] ||
              rawStatus;

            // Permission checks
            const editDisabled = !canEditCongViec({
              congViec: cv,
              userRole: currentUserRole,
              userNhanVienId: currentUserNhanVienId,
            });
            const deleteDisabled = !canDeleteCongViec({
              congViec: cv,
              userRole: currentUserRole,
              userNhanVienId: currentUserNhanVienId,
            });
            const editTooltip = editDisabled
              ? getEditDisabledReason({
                  congViec: cv,
                  userRole: currentUserRole,
                  userNhanVienId: currentUserNhanVienId,
                })
              : "Chỉnh sửa";
            const deleteTooltip = deleteDisabled
              ? getDeleteDisabledReason({
                  congViec: cv,
                  userRole: currentUserRole,
                  userNhanVienId: currentUserNhanVienId,
                })
              : "Xóa";

            return (
              <TableRow key={cv._id} hover>
                <TableCell sx={{ maxWidth: 240 }}>
                  <Tooltip title={cv.TieuDe || ""}>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      noWrap
                      sx={{ maxWidth: 240 }}
                    >
                      {cv.TieuDe}
                    </Typography>
                  </Tooltip>
                  {ext && (
                    <Chip
                      size="small"
                      label={EXT_LABEL[ext] || ext}
                      color={EXT_COLOR[ext] || "default"}
                      sx={{ mt: 0.5, height: 20, fontSize: "0.65rem" }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  {prio && (
                    <Chip
                      size="small"
                      label={prio}
                      sx={{
                        backgroundColor: getPriorityColor(
                          rawPrio,
                          priorityOverrides
                        ),
                        color: "white",
                        height: 22,
                      }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={status}
                    sx={{
                      backgroundColor: getStatusColor(
                        rawStatus,
                        statusOverrides
                      ),
                      color: "white",
                      height: 22,
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography
                    variant="caption"
                    color={
                      ext === "QUA_HAN" || ext === "TRE_HAN"
                        ? "error.main"
                        : "text.secondary"
                    }
                  >
                    {formatDate(cv.NgayHetHan)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ pr: 2 }}>
                  <Box>
                    <Typography
                      variant="caption"
                      display="block"
                      textAlign="right"
                    >
                      {progress || 0}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={progress || 0}
                      sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={0.75}>
                    <Avatar sx={{ width: 26, height: 26, fontSize: "0.7rem" }}>
                      {(giaoName && giaoName[0]) || "?"}
                    </Avatar>
                    <Typography
                      variant="caption"
                      fontWeight={500}
                      sx={{ maxWidth: 110 }}
                      noWrap
                    >
                      {giaoName || "—"}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={0.75}>
                    <Avatar sx={{ width: 26, height: 26, fontSize: "0.7rem" }}>
                      {(chinhName && chinhName[0]) || "?"}
                    </Avatar>
                    <Typography
                      variant="caption"
                      fontWeight={500}
                      sx={{ maxWidth: 110 }}
                      noWrap
                    >
                      {chinhName || "—"}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box display="flex" alignItems="center" gap={0.25}>
                      <CommentIcon
                        sx={{ fontSize: 15, color: "text.secondary" }}
                      />
                      <Typography variant="caption">{soBL}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.25}>
                      <AttachmentIcon
                        sx={{ fontSize: 15, color: "text.secondary" }}
                      />
                      <Typography variant="caption">{soTP}</Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Xem chi tiết">
                      <IconButton
                        size="small"
                        onClick={() => onView?.(cv._id)}
                        disabled={updatingId === cv._id}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <OpenTaskInNewTabButton taskId={cv._id} size="small" />
                    {onTree && (
                      <Tooltip title="Cây công việc">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTree(cv);
                          }}
                          disabled={
                            updatingId === cv._id || deletingId === cv._id
                          }
                          color="info"
                        >
                          <AccountTreeIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Xem">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onView?.(cv._id);
                        }}
                        disabled={
                          updatingId === cv._id || deletingId === cv._id
                        }
                      >
                        <VisibilityIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={editTooltip}>
                      <span>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.(cv);
                          }}
                          disabled={
                            editDisabled ||
                            updatingId === cv._id ||
                            deletingId === cv._id
                          }
                        >
                          <EditIcon fontSize="inherit" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    {onDelete && (
                      <Tooltip title={deleteTooltip}>
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete?.(cv);
                            }}
                            disabled={
                              deleteDisabled ||
                              deletingId === cv._id ||
                              updatingId === cv._id
                            }
                          >
                            <DeleteIcon fontSize="inherit" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default SubtasksTable;
