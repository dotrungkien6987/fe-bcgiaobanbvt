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
} from "@mui/icons-material";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { computeExtendedDueStatus as getExtendedDueStatus } from "../../../../utils/congViecUtils";

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
  emptyMessage = "Chưa có công việc con",
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
            const giao = cv.NguoiGiaoProfile || cv.NguoiGiaoViecProfile;
            const chinh = cv.NguoiChinhProfile || cv.NguoiChinhID;
            const giaoName =
              giao?.Ten || giao?.HoTen || giao?.name || giao?.FullName;
            const chinhName =
              chinh?.Ten || chinh?.HoTen || chinh?.name || chinh?.FullName;
            const soBL = cv.SoLuongBinhLuan || 0;
            const soTP = cv.SoLuongNguoiThamGia || 0;
            const prio = cv.MucDoUuTien || "";
            const prioColor = priorityOverrides?.[prio]?.color || "default";
            const status = cv.TrangThai;
            const statusColor = statusOverrides?.[status]?.color || "default";

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
                      color={prioColor}
                      variant="outlined"
                      sx={{ height: 22 }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={status}
                    color={statusColor}
                    sx={{ height: 22 }}
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
                    <Tooltip title="Xem">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onView?.(cv._id);
                        }}
                      >
                        <VisibilityIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sửa">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit?.(cv);
                        }}
                      >
                        <EditIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                    {onDelete && (
                      <Tooltip title="Xóa">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.(cv);
                          }}
                        >
                          <DeleteIcon fontSize="inherit" />
                        </IconButton>
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
