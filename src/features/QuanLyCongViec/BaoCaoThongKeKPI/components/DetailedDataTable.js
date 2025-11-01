import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Chip,
  Typography,
  LinearProgress,
  Box,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  CheckCircle as ApprovedIcon,
  PendingActions as PendingIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { getChiTietKPI } from "../baoCaoKPISlice";
import { fDate } from "utils/formatTime";

function DetailedDataTable() {
  const dispatch = useDispatch();
  const { danhSachChiTiet, pagination, isLoading, filters } = useSelector(
    (state) => state.baoCaoKPI
  );

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Load data khi thay đổi pagination
  React.useEffect(() => {
    dispatch(getChiTietKPI(filters, page + 1, rowsPerPage, search));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, filters, page, rowsPerPage]);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearch(value);
    setPage(0); // Reset về trang đầu khi search
  };

  const handleSearchSubmit = () => {
    dispatch(getChiTietKPI(filters, 1, rowsPerPage, search));
  };

  const handleRefresh = () => {
    setSearch("");
    setPage(0);
    dispatch(getChiTietKPI(filters, 1, rowsPerPage, ""));
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getScoreColor = (score) => {
    if (score >= 9) return "success";
    if (score >= 7) return "info";
    if (score >= 5) return "warning";
    return "error";
  };

  const getScoreLabel = (score) => {
    if (score >= 9) return "Xuất sắc";
    if (score >= 7) return "Tốt";
    if (score >= 5) return "Khá";
    if (score >= 3) return "Trung bình";
    return "Yếu";
  };

  return (
    <Card>
      <CardHeader
        title="Danh sách chi tiết đánh giá KPI"
        titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              placeholder="Tìm theo tên nhân viên..."
              value={search}
              onChange={handleSearchChange}
              onKeyPress={(e) => e.key === "Enter" && handleSearchSubmit()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />
            <Tooltip title="Làm mới">
              <IconButton onClick={handleRefresh} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        }
      />
      <CardContent sx={{ p: 0 }}>
        {isLoading && <LinearProgress />}

        {isLoading ? null : !danhSachChiTiet || danhSachChiTiet.length === 0 ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Không có dữ liệu để hiển thị
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "grey.100" }}>
                    <TableCell sx={{ fontWeight: 600 }}>STT</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Nhân viên</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Khoa/Phòng</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Chu kỳ</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      Điểm
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      Xếp loại
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      Trạng thái
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      Ngày đánh giá
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(danhSachChiTiet || []).map((row, index) => (
                    <TableRow
                      key={row._id || index}
                      sx={{ "&:hover": { backgroundColor: "action.hover" } }}
                    >
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography variant="body2" fontWeight={600}>
                            {row.tenNhanVien || "N/A"}
                          </Typography>
                          {row.email && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {row.email}
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap maxWidth={150}>
                          {row.tenKhoa || "Chưa xác định"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap maxWidth={120}>
                          {row.tenChuKy || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          color="primary"
                        >
                          {row.tongDiem?.toFixed(2) || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={getScoreLabel(row.tongDiem)}
                          color={getScoreColor(row.tongDiem)}
                          size="small"
                          sx={{ minWidth: 80 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {row.trangThai === "approved" ? (
                          <Chip
                            icon={<ApprovedIcon fontSize="small" />}
                            label="Đã duyệt"
                            color="success"
                            size="small"
                            variant="outlined"
                          />
                        ) : (
                          <Chip
                            icon={<PendingIcon fontSize="small" />}
                            label="Chưa duyệt"
                            color="warning"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {row.ngayTao ? fDate(row.ngayTao) : "N/A"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={pagination?.total || 0}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Số dòng mỗi trang:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} trong tổng số ${
                  count !== -1 ? count : `hơn ${to}`
                }`
              }
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default DetailedDataTable;
