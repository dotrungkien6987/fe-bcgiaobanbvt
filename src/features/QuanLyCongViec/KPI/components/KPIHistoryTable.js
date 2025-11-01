import React, { useMemo, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  TextField,
  InputAdornment,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  CircularProgress,
  alpha,
} from "@mui/material";
import {
  Visibility,
  Search,
  KeyboardArrowUp,
  KeyboardArrowDown,
  FilterList,
  AssignmentLate,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { openDetailDialog } from "../kpiSlice";

/**
 * KPIHistoryTable - Bảng lịch sử KPI của nhân viên với Custom Table
 *
 * Props:
 * - data: Array of DanhGiaKPI objects
 * - isLoading: Boolean
 * - chuKyDanhGias: Array of evaluation cycles
 * - onRowClick: Function (optional) - Custom handler for row click
 */
const KPIHistoryTable = ({
  data = [],
  isLoading,
  chuKyDanhGias = [],
  onRowClick,
}) => {
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState("NgayDuyet");
  const [order, setOrder] = useState("desc");

  const getChuKyName = useMemo(
    () => (chuKyRef) => {
      const chuKyId =
        typeof chuKyRef === "object" && chuKyRef !== null
          ? chuKyRef._id
          : chuKyRef;
      const ck = chuKyDanhGias.find((item) => item._id === chuKyId);
      return (
        ck?.TenChuKy ||
        (typeof chuKyRef === "object" ? chuKyRef?.TenChuKy : "N/A")
      );
    },
    [chuKyDanhGias]
  );

  const getChuKyData = useCallback(
    (chuKyRef) => {
      const chuKyId =
        typeof chuKyRef === "object" && chuKyRef !== null
          ? chuKyRef._id
          : chuKyRef;
      return (
        chuKyDanhGias.find((ck) => ck._id === chuKyId) ||
        (typeof chuKyRef === "object" ? chuKyRef : null)
      );
    },
    [chuKyDanhGias]
  );

  // Filter data based on search
  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) => {
      const chuKyName = getChuKyName(row.ChuKyDanhGiaID).toLowerCase();
      return chuKyName.includes(q);
    });
  }, [data, search, getChuKyName]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!orderBy) return filteredData;

    return [...filteredData].sort((a, b) => {
      let aValue, bValue;

      switch (orderBy) {
        case "ChuKyDanhGiaID":
          aValue = getChuKyName(a.ChuKyDanhGiaID);
          bValue = getChuKyName(b.ChuKyDanhGiaID);
          break;
        case "TongDiemKPI":
          aValue = a.TongDiemKPI || 0;
          bValue = b.TongDiemKPI || 0;
          break;
        case "TrangThai":
          aValue = a.TrangThai || "";
          bValue = b.TrangThai || "";
          break;
        case "NgayDuyet":
          aValue = a.NgayDuyet ? new Date(a.NgayDuyet).getTime() : 0;
          bValue = b.NgayDuyet ? new Date(b.NgayDuyet).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return order === "asc" ? -1 : 1;
      if (aValue > bValue) return order === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, orderBy, order, getChuKyName]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, page, rowsPerPage]);

  const handleSort = (column) => {
    const isAsc = orderBy === column && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(column);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetail = useCallback(
    (row) => {
      if (onRowClick) {
        onRowClick(row);
      } else {
        dispatch(openDetailDialog(row._id));
      }
    },
    [dispatch, onRowClick]
  );

  // Column definitions
  const columns = [
    {
      id: "ChuKyDanhGiaID",
      label: "Chu kỳ đánh giá",
      sortable: true,
      minWidth: 250,
    },
    { id: "TongDiemKPI", label: "Điểm KPI", sortable: true, minWidth: 200 },
    { id: "TrangThai", label: "Trạng thái", sortable: true, minWidth: 130 },
    {
      id: "NgayDuyet",
      label: "Ngày duyệt",
      sortable: true,
      minWidth: 150,
      hideOnMobile: true,
    },
    { id: "actions", label: "Thao tác", sortable: false, minWidth: 100 },
  ];

  return (
    <Box>
      {/* Search Bar */}
      <Stack
        direction="row"
        spacing={2}
        sx={{
          mb: 2,
          p: 2,
          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.05),
          borderRadius: 2,
        }}
      >
        <TextField
          placeholder="Tìm kiếm chu kỳ đánh giá..."
          size="small"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0); // Reset to first page on search
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: { xs: "100%", sm: 300 },
            "& .MuiOutlinedInput-root": {
              backgroundColor: "white",
            },
          }}
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FilterList color="action" />
          <Typography variant="body2" color="text.secondary">
            {filteredData.length} kết quả
          </Typography>
        </Box>
      </Stack>

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{
          boxShadow: (theme) => theme.shadows[2],
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          {/* Table Header */}
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: (theme) =>
                  alpha(theme.palette.primary.main, 0.1),
              }}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  sx={{
                    minWidth: column.minWidth,
                    fontWeight: 600,
                    color: "primary.main",
                    ...(column.hideOnMobile && {
                      display: { xs: "none", md: "table-cell" },
                    }),
                  }}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : "asc"}
                      onClick={() => handleSort(column.id)}
                      sx={{
                        "& .MuiTableSortLabel-icon": {
                          color: "primary.main !important",
                        },
                      }}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* Table Body */}
          <TableBody>
            {/* Loading State */}
            {isLoading && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  sx={{ textAlign: "center", py: 8 }}
                >
                  <Stack spacing={2} alignItems="center">
                    <CircularProgress size={40} />
                    <Typography variant="body2" color="text.secondary">
                      Đang tải dữ liệu...
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            )}

            {/* Empty State */}
            {!isLoading && paginatedData.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  sx={{ textAlign: "center", py: 8 }}
                >
                  <Stack spacing={2} alignItems="center">
                    <AssignmentLate
                      sx={{ fontSize: 60, color: "text.disabled" }}
                    />
                    <Typography variant="h6" color="text.secondary">
                      {search
                        ? "Không tìm thấy kết quả"
                        : "Chưa có dữ liệu đánh giá"}
                    </Typography>
                    {search && (
                      <Typography variant="body2" color="text.secondary">
                        Thử tìm kiếm với từ khóa khác
                      </Typography>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            )}

            {/* Data Rows */}
            {!isLoading &&
              paginatedData.map((row) => {
                const chuKy = getChuKyData(row.ChuKyDanhGiaID);
                const diem = row.TongDiemKPI || 0;
                const percent = ((diem / 10) * 100).toFixed(1);
                const scoreColor =
                  diem >= 9
                    ? "success"
                    : diem >= 7
                    ? "primary"
                    : diem >= 5
                    ? "warning"
                    : "error";

                return (
                  <TableRow
                    key={row._id}
                    hover
                    sx={{
                      "&:hover": {
                        backgroundColor: (theme) =>
                          alpha(theme.palette.primary.main, 0.05),
                        cursor: "pointer",
                      },
                      transition: "background-color 0.2s",
                    }}
                    onClick={() => handleViewDetail(row)}
                  >
                    {/* Chu kỳ đánh giá */}
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" fontWeight={600}>
                          {getChuKyName(row.ChuKyDanhGiaID)}
                        </Typography>
                        {chuKy && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: { xs: "none", sm: "block" } }}
                          >
                            {dayjs(chuKy.NgayBatDau).format("DD/MM/YYYY")} -{" "}
                            {dayjs(chuKy.NgayKetThuc).format("DD/MM/YYYY")}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>

                    {/* Điểm KPI */}
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography
                            variant="h6"
                            color={`${scoreColor}.main`}
                            fontWeight={700}
                          >
                            {percent}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ({diem.toFixed(2)}/10)
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(parseFloat(percent), 100)}
                          color={scoreColor}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: (theme) =>
                              alpha(theme.palette[scoreColor].main, 0.1),
                          }}
                        />
                      </Stack>
                    </TableCell>

                    {/* Trạng thái */}
                    <TableCell>
                      <Chip
                        label={
                          row.TrangThai === "DA_DUYET"
                            ? "Đã duyệt"
                            : "Đang chấm điểm"
                        }
                        color={
                          row.TrangThai === "DA_DUYET" ? "success" : "warning"
                        }
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>

                    {/* Ngày duyệt */}
                    <TableCell
                      sx={{ display: { xs: "none", md: "table-cell" } }}
                    >
                      {row.NgayDuyet ? (
                        <Typography variant="body2">
                          {dayjs(row.NgayDuyet).format("DD/MM/YYYY HH:mm")}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="Xem chi tiết">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewDetail(row)}
                          sx={{
                            "&:hover": {
                              backgroundColor: (theme) =>
                                alpha(theme.palette.primary.main, 0.1),
                            },
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>

        {/* Pagination */}
        {!isLoading && filteredData.length > 0 && (
          <TablePagination
            component="div"
            count={filteredData.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Số dòng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}–${to} trong tổng số ${
                count !== -1 ? count : `hơn ${to}`
              }`
            }
            sx={{
              borderTop: (theme) => `1px solid ${theme.palette.divider}`,
              "& .MuiTablePagination-toolbar": {
                minHeight: 52,
              },
            }}
          />
        )}
      </TableContainer>
    </Box>
  );
};

export default KPIHistoryTable;
