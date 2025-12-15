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
  Stack,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Comment as CommentIcon,
  Groups as GroupsIcon,
  AccountTree as AccountTreeIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import dayjs from "dayjs";
import EmployeeAvatar from "components/EmployeeAvatar";
import {
  getStatusColor,
  getPriorityColor,
  getDueStatusColor,
  getStatusText as getStatusLabel,
  getPriorityText as getPriorityLabel,
  getExtendedDueStatus,
  EXT_DUE_LABEL_MAP,
  computeSoGioTre,
} from "../../../utils/congViecUtils";
import { useSelector } from "react-redux";
import {
  canDeleteCongViec,
  canEditCongViec,
  getEditDisabledReason,
  getDeleteDisabledReason,
} from "./congViecPermissions";

const CongViecTable = ({
  congViecs = [],
  totalItems = 0,
  currentPage = 1,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPage = 10,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
  activeTab,
  currentUserRole,
  currentUserNhanVienId,
  onTree, // callback mở cây phân cấp
}) => {
  const theme = useTheme();
  const statusOverrides = useSelector((s) => s.colorConfig?.statusColors);
  const priorityOverrides = useSelector((s) => s.colorConfig?.priorityColors);
  const dueStatusOverrides = useSelector((s) => s.colorConfig?.dueStatusColors);

  const handleChangePage = (event, newPage) => onPageChange(newPage + 1);
  const handleChangeRowsPerPage = (event) =>
    onRowsPerPageChange(parseInt(event.target.value, 10));

  const DASH = "—"; // unified dash
  const formatDate = (date) => (date ? dayjs(date).format("DD/MM/YYYY") : DASH);
  const isOverdue = (ngayHetHan, trangThai) => {
    if (trangThai === "HOAN_THANH" || trangThai === "HUY") return false;
    return dayjs().isAfter(dayjs(ngayHetHan));
  };

  const enhancedRows = React.useMemo(() => {
    return (congViecs || []).map((cv) => {
      const ext = getExtendedDueStatus(cv);
      const soGioTre = cv.SoGioTre != null ? cv.SoGioTre : computeSoGioTre(cv);
      return { ...cv, _extDue: ext, _soGioTre: soGioTre };
    });
  }, [congViecs]);

  // Use centralized permission helpers
  const canEdit = (cv) =>
    canEditCongViec({
      congViec: cv,
      currentUserRole,
      currentUserNhanVienId,
    });

  const canDelete = (cv) =>
    canDeleteCongViec({
      congViec: cv,
      currentUserRole,
      currentUserNhanVienId,
    });

  const showEmpty = !isLoading && enhancedRows.length === 0;

  return (
    <Paper sx={{ position: "relative", minHeight: 200 }}>
      {isLoading && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "background.paper",
            opacity: 0.85,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
          }}
        >
          <Box width="60%" mb={2}>
            <LinearProgress />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Đang tải dữ liệu...
          </Typography>
        </Box>
      )}
      {showEmpty && (
        <Box p={4} textAlign="center">
          <Typography variant="h6" color="text.secondary">
            {activeTab === "received"
              ? "Chưa có công việc nào được giao"
              : "Chưa có công việc nào được tạo"}
          </Typography>
        </Box>
      )}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã</TableCell>
              <TableCell>Tiêu đề</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Tình trạng hạn</TableCell>
              <TableCell align="right">Giờ trễ</TableCell>
              <TableCell>Ưu tiên</TableCell>
              <TableCell sx={{ minWidth: 180 }}>Người giao</TableCell>
              <TableCell sx={{ minWidth: 180 }}>Người xử lý chính</TableCell>
              <TableCell>Hạn chót</TableCell>
              <TableCell>Tiến độ</TableCell>
              <TableCell>Tương tác</TableCell>
              <TableCell width={120}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {enhancedRows.map((congViec) => {
              const editDisabled = !canEdit(congViec);
              const deleteDisabled = !canDelete(congViec);
              const editTooltip = editDisabled
                ? getEditDisabledReason({
                    congViec,
                    currentUserRole,
                    currentUserNhanVienId,
                  })
                : "Chỉnh sửa";
              const deleteTooltip = deleteDisabled
                ? getDeleteDisabledReason({
                    congViec,
                    currentUserRole,
                    currentUserNhanVienId,
                  })
                : "Xóa";
              const extDue = congViec._extDue;
              return (
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
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="text.secondary"
                    >
                      {congViec.MaCongViec || DASH}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 360 }}>
                    <Tooltip
                      title={congViec.TieuDe || ""}
                      placement="top-start"
                    >
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        noWrap
                        sx={{ maxWidth: 360 }}
                      >
                        {congViec.TieuDe}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Chip
                        label={getStatusLabel(congViec.TrangThai)}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(
                            congViec.TrangThai,
                            statusOverrides
                          ),
                          color: "white",
                        }}
                      />
                      {congViec.CoDuyetHoanThanh && (
                        <Chip
                          label="Y/c duyệt"
                          size="small"
                          sx={{
                            backgroundColor: theme.palette.warning.main,
                            color: theme.palette.getContrastText(
                              theme.palette.warning.main
                            ),
                          }}
                        />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {extDue && (
                      <Tooltip
                        arrow
                        placement="top"
                        title={`Tình trạng hạn: ${EXT_DUE_LABEL_MAP[extDue]}`}
                      >
                        <Chip
                          label={EXT_DUE_LABEL_MAP[extDue]}
                          size="small"
                          sx={{
                            backgroundColor: getDueStatusColor(
                              extDue,
                              dueStatusOverrides
                            ),
                            color: "white",
                            fontWeight: 500,
                          }}
                        />
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {typeof congViec._soGioTre === "number" &&
                    congViec._soGioTre > 0 ? (
                      <Typography
                        variant="caption"
                        color="error.main"
                        fontWeight={600}
                      >
                        {congViec._soGioTre.toLocaleString("vi-VN")}
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        {DASH}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getPriorityLabel(congViec.MucDoUuTien)}
                      size="small"
                      sx={{
                        backgroundColor: getPriorityColor(
                          congViec.MucDoUuTien,
                          priorityOverrides
                        ),
                        color: "white",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const person = congViec.NguoiGiaoProfile;
                      const subText = person?.Email || person?.Khoa?.TenKhoa;
                      return (
                        <Box display="flex" alignItems="center" gap={1}>
                          <EmployeeAvatar
                            size="sm"
                            nhanVienId={person?._id}
                            name={person?.HoTen || person?.Ten}
                          />
                          <Box>
                            <Typography variant="body2" fontWeight={500} noWrap>
                              {person?.Ten || "Chưa xác định"}
                            </Typography>
                            {subText ? (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                noWrap
                              >
                                {subText}
                              </Typography>
                            ) : null}
                          </Box>
                        </Box>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const person = congViec.NguoiChinhProfile;
                      const subText = person?.Email || person?.Khoa?.TenKhoa;
                      return (
                        <Box display="flex" alignItems="center" gap={1}>
                          <EmployeeAvatar
                            size="sm"
                            nhanVienId={person?._id}
                            name={person?.HoTen || person?.Ten}
                          />
                          <Box>
                            <Typography variant="body2" fontWeight={500} noWrap>
                              {person?.Ten || "Chưa xác định"}
                            </Typography>
                            {subText ? (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                noWrap
                              >
                                {subText}
                              </Typography>
                            ) : null}
                          </Box>
                        </Box>
                      );
                    })()}
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
                        <GroupsIcon
                          sx={{ fontSize: 16, color: "text.secondary" }}
                        />
                        <Tooltip title="Số người tham gia">
                          <Typography variant="caption">
                            {congViec.SoLuongNguoiThamGia || 0}
                          </Typography>
                        </Tooltip>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Cây công việc">
                        <IconButton
                          size="small"
                          onClick={() => onTree?.(congViec)}
                          color="primary"
                        >
                          <AccountTreeIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xem chi tiết">
                        <IconButton
                          size="small"
                          onClick={() => onView?.(congViec._id)}
                          color="primary"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={editTooltip}>
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => onEdit?.(congViec)}
                            color="primary"
                            disabled={editDisabled}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title={deleteTooltip}>
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => onDelete?.(congViec)}
                            color="error"
                            disabled={deleteDisabled}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalItems}
        rowsPerPage={rowsPerPage}
        page={currentPage - 1}
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
