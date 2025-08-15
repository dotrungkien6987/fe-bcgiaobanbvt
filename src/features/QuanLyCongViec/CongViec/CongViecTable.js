import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  LinearProgress,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Avatar,
  Stack,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Comment as CommentIcon,
  Attachment as AttachmentIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import dayjs from "dayjs";

// Status colors mapping
const getStatusColor = (status) => {
  const statusColors = {
    TAO_MOI: "default",
    DA_GIAO: "info",
    CHAP_NHAN: "primary",
    TU_CHOI: "error",
    DANG_THUC_HIEN: "warning",
    CHO_DUYET: "secondary",
    HOAN_THANH: "success",
    QUA_HAN: "error",
    HUY: "default",
  };
  return statusColors[status] || "default";
};

// Priority colors mapping
const getPriorityColor = (priority) => {
  const priorityColors = {
    THAP: "#4caf50",
    BINH_THUONG: "#2196f3",
    CAO: "#ff9800",
    KHAN_CAP: "#f44336",
  };
  return priorityColors[priority] || "#2196f3";
};

// Status labels mapping
const getStatusLabel = (status) => {
  const statusLabels = {
    TAO_MOI: "Tạo mới",
    DA_GIAO: "Đã giao",
    CHAP_NHAN: "Chấp nhận",
    TU_CHOI: "Từ chối",
    DANG_THUC_HIEN: "Đang thực hiện",
    CHO_DUYET: "Chờ duyệt",
    HOAN_THANH: "Hoàn thành",
    QUA_HAN: "Quá hạn",
    HUY: "Hủy",
  };
  return statusLabels[status] || status;
};

// Priority labels mapping
const getPriorityLabel = (priority) => {
  const priorityLabels = {
    THAP: "Thấp",
    BINH_THUONG: "Bình thường",
    CAO: "Cao",
    KHAN_CAP: "Khẩn cấp",
  };
  return priorityLabels[priority] || priority;
};

const CongViecTable = ({
  congViecs = [],
  totalItems = 0,
  currentPage = 1,
  totalPages = 0,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPage = 10,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
  activeTab,
}) => {
  const theme = useTheme();

  const handleChangePage = (event, newPage) => {
    onPageChange(newPage + 1); // MUI pagination is 0-based, our API is 1-based
  };

  const handleChangeRowsPerPage = (event) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return dayjs(date).format("DD/MM/YYYY");
  };

  const isOverdue = (ngayHetHan, trangThai) => {
    if (trangThai === "HOAN_THANH" || trangThai === "HUY") return false;
    return dayjs().isAfter(dayjs(ngayHetHan));
  };

  if (isLoading) {
    return (
      <Paper>
        <Box p={2}>
          <Typography>Đang tải...</Typography>
          <LinearProgress />
        </Box>
      </Paper>
    );
  }

  if (congViecs.length === 0) {
    return (
      <Paper>
        <Box p={4} textAlign="center">
          <Typography variant="h6" color="textSecondary">
            {activeTab === "received"
              ? "Chưa có công việc nào được giao"
              : "Chưa có công việc nào được tạo"}
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tiêu đề</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ưu tiên</TableCell>
              <TableCell>
                {activeTab === "received" ? "Người giao" : "Người xử lý chính"}
              </TableCell>
              <TableCell>Hạn chót</TableCell>
              <TableCell>Tiến độ</TableCell>
              <TableCell>Tương tác</TableCell>
              <TableCell width={120}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {congViecs.map((congViec) => (
              <TableRow
                key={congViec._id}
                hover
                sx={{
                  ...(isOverdue(congViec.NgayHetHan, congViec.TrangThai) && {
                    backgroundColor: theme.palette.error.light + "20",
                  }),
                }}
              >
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {congViec.TieuDe}
                    </Typography>
                    {congViec.MoTa && (
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        noWrap
                      >
                        {congViec.MoTa.length > 50
                          ? `${congViec.MoTa.substring(0, 50)}...`
                          : congViec.MoTa}
                      </Typography>
                    )}
                  </Box>
                </TableCell>

                <TableCell>
                  <Chip
                    label={getStatusLabel(congViec.TrangThai)}
                    color={getStatusColor(congViec.TrangThai)}
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  <Chip
                    label={getPriorityLabel(congViec.MucDoUuTien)}
                    size="small"
                    sx={{
                      backgroundColor: getPriorityColor(congViec.MucDoUuTien),
                      color: "white",
                    }}
                  />
                </TableCell>

                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar
                      sx={{ width: 32, height: 32, fontSize: "0.875rem" }}
                    >
                      {activeTab === "received"
                        ? congViec.NguoiGiaoViecID?.Ten?.charAt(0)
                        : congViec.NguoiChinhID?.Ten?.charAt(0)}
                    </Avatar>
                    <Typography variant="body2">
                      {activeTab === "received"
                        ? congViec.NguoiGiaoViecID?.Ten
                        : congViec.NguoiChinhID?.Ten}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Typography
                    variant="body2"
                    color={
                      isOverdue(congViec.NgayHetHan, congViec.TrangThai)
                        ? "error"
                        : "inherit"
                    }
                  >
                    {formatDate(congViec.NgayHetHan)}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Box width={80}>
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Typography variant="caption">
                        {congViec.PhanTramTienDoTong}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={congViec.PhanTramTienDoTong}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                </TableCell>

                <TableCell>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <CommentIcon
                        sx={{ fontSize: 16, color: "text.secondary" }}
                      />
                      <Typography variant="caption">
                        {congViec.SoLuongBinhLuan || 0}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <AttachmentIcon
                        sx={{ fontSize: 16, color: "text.secondary" }}
                      />
                      <Typography variant="caption">
                        {congViec.SoLuongNguoiThamGia || 0}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Xem chi tiết">
                      <IconButton
                        size="small"
                        onClick={() => onView?.(congViec._id)}
                        color="primary"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                      <IconButton
                        size="small"
                        onClick={() => onEdit?.(congViec)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton
                        size="small"
                        onClick={() => onDelete?.(congViec._id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalItems}
        rowsPerPage={rowsPerPage}
        page={currentPage - 1} // MUI pagination is 0-based
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Số dòng mỗi trang:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}–${to} của ${count !== -1 ? count : `hơn ${to}`}`
        }
      />
    </Paper>
  );
};

export default CongViecTable;
