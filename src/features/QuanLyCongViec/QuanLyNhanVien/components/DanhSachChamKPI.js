import React, { useMemo, useEffect, useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Grid,
  Stack,
  Button,
  Typography,
  IconButton,
  Tooltip,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  TextField,
  InputAdornment,
  LinearProgress,
  Avatar,
  Chip,
  alpha,
} from "@mui/material";
import {
  Add,
  Save,
  Delete,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import MainCard from "components/MainCard";
import ConfirmDialog from "components/ConfirmDialog";
import { getAllNhanVien } from "features/NhanVien/nhanvienSlice";
import {
  removeNhanVienFromList,
  syncQuanLyNhanVienList,
} from "../quanLyNhanVienSlice";

function DanhSachChamKPI({ onOpenDialog }) {
  const dispatch = useDispatch();
  const { chamKPIs, currentNhanVienQuanLy, hasUnsavedChanges, isLoading } =
    useSelector((state) => state.quanLyNhanVien);
  const { nhanviens } = useSelector((state) => state.nhanvien);

  // Dialog states
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: "", // 'remove', 'update'
    data: null,
    title: "",
    message: "",
    details: "",
  });

  // Dialog handlers
  const handleDialogConfirm = useCallback(
    async (data) => {
      try {
        if (confirmDialog.type === "remove") {
          // Handle remove confirmation
          dispatch(
            removeNhanVienFromList({
              relationId: data.relationId,
            })
          );
        } else if (confirmDialog.type === "update") {
          // Handle update confirmation
          const nhanVienIds = chamKPIs
            .filter((ck) => ck.LoaiQuanLy === "KPI")
            .map((ck) => ck?.NhanVienDuocQuanLy?._id)
            .filter(Boolean);

          dispatch(
            syncQuanLyNhanVienList({
              NhanVienQuanLy: currentNhanVienQuanLy?._id,
              NhanVienDuocQuanLyIds: nhanVienIds,
              LoaiQuanLy: "KPI",
            })
          );
        }
      } catch (error) {
        console.error("Dialog action error:", error);
      } finally {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      }
    },
    [confirmDialog.type, dispatch, currentNhanVienQuanLy, chamKPIs]
  );

  const handleDialogClose = useCallback(() => {
    setConfirmDialog((prev) => ({ ...prev, open: false }));
  }, []);

  useEffect(() => {
    // Load nhân viên data nếu cần thiết
    if (nhanviens.length === 0) {
      dispatch(getAllNhanVien());
    }
  }, [dispatch, nhanviens.length]);

  // Handle remove nhân viên from list
  const handleRemoveNhanVien = useCallback((relationId) => {
    setConfirmDialog({
      open: true,
      type: "remove",
      data: { relationId },
      title: "Xác nhận xóa",
      message: "Bạn có chắc muốn xóa nhân viên này khỏi danh sách chấm KPI?",
      details:
        "Hành động này sẽ loại bỏ nhân viên khỏi danh sách chấm KPI hiện tại.",
    });
  }, []);

  // State for table pagination and filtering
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [orderBy, setOrderBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");

  // Filter data based on search
  const filteredData = useMemo(() => {
    const kpiData = chamKPIs.filter((ck) => ck.LoaiQuanLy === "KPI");

    if (!searchText) return kpiData;

    return kpiData.filter((item) => {
      const nv = item.NhanVienDuocQuanLy || {};
      const searchLower = searchText.toLowerCase();

      // Get Khoa name with fallback
      const tenKhoa = nv.KhoaID?.TenKhoa || nv.TenKhoa || "";

      return (
        nv.Ten?.toLowerCase().includes(searchLower) ||
        nv.MaNhanVien?.toLowerCase().includes(searchLower) ||
        tenKhoa.toLowerCase().includes(searchLower) ||
        nv.ChucDanh?.toLowerCase().includes(searchLower) ||
        nv.PhamViHanhNghe?.toLowerCase().includes(searchLower)
      );
    });
  }, [chamKPIs, searchText]);

  // Sort data
  const sortedData = useMemo(() => {
    const comparator = (a, b) => {
      let aValue, bValue;

      if (orderBy === "createdAt") {
        aValue = new Date(a.createdAt || 0);
        bValue = new Date(b.createdAt || 0);
      } else if (orderBy === "Ten") {
        aValue = a.NhanVienDuocQuanLy?.Ten || "";
        bValue = b.NhanVienDuocQuanLy?.Ten || "";
      } else if (orderBy === "MaNhanVien") {
        aValue = a.NhanVienDuocQuanLy?.MaNhanVien || "";
        bValue = b.NhanVienDuocQuanLy?.MaNhanVien || "";
      } else if (orderBy === "NgaySinh") {
        aValue = new Date(a.NhanVienDuocQuanLy?.NgaySinh || 0);
        bValue = new Date(b.NhanVienDuocQuanLy?.NgaySinh || 0);
      } else {
        aValue = a[orderBy];
        bValue = b[orderBy];
      }

      if (bValue < aValue) return order === "asc" ? 1 : -1;
      if (bValue > aValue) return order === "asc" ? -1 : 1;
      return 0;
    };

    return [...filteredData].sort(comparator);
  }, [filteredData, order, orderBy]);

  // Paginate data
  const paginatedData = useMemo(() => {
    return sortedData.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [sortedData, page, rowsPerPage]);

  // Handlers
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
    setPage(0);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "-";
    try {
      return format(new Date(date), "dd/MM/yyyy", { locale: vi });
    } catch {
      return "-";
    }
  };

  // Merge real data with temporary data for display
  const data = useMemo(() => {
    return chamKPIs.filter((ck) => ck.LoaiQuanLy === "KPI");
  }, [chamKPIs]);

  // Calculate changes for confirmation (compare with original data from DB)
  const calculateChanges = () => {
    if (!hasUnsavedChanges) return { added: 0, deleted: 0 };

    // For now, just return placeholder - will implement when we add save logic
    return { added: 0, deleted: 0 };
  };

  const handleConfirmUpdate = () => {
    const changes = calculateChanges();

    setConfirmDialog({
      open: true,
      type: "update",
      data: { changes },
      title: "Xác nhận cập nhật",
      message: `Sẽ thêm ${changes.added} nhân viên, xóa ${changes.deleted} quan hệ chấm KPI. Bạn có chắc muốn tiếp tục?`,
      details:
        "Thao tác này sẽ lưu tất cả thay đổi vào cơ sở dữ liệu và không thể hoàn tác.",
    });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <MainCard
          title={
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h5">
                Danh sách nhân viên được chấm KPI
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => onOpenDialog("KPI")}
                >
                  Chọn nhân viên
                </Button>
                {hasUnsavedChanges && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<Save />}
                    onClick={handleConfirmUpdate}
                  >
                    Cập nhật
                  </Button>
                )}
              </Stack>
            </Stack>
          }
        >
          {currentNhanVienQuanLy && (
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Nhân viên quản lý: <strong>{currentNhanVienQuanLy.Ten}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Mã NV: <strong>{currentNhanVienQuanLy.MaNhanVien}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng số nhân viên được chấm KPI: <strong>{data.length}</strong>
              </Typography>
            </Stack>
          )}

          {/* Enhanced Table */}
          <Paper
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            {/* Filters Bar */}
            <Box
              sx={{
                p: 2,
                background: (theme) =>
                  `linear-gradient(135deg, ${alpha(
                    theme.palette.primary.main,
                    0.05
                  )} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack spacing={2}>
                <Typography
                  variant="h6"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    fontWeight: 600,
                  }}
                >
                  <FilterIcon color="primary" />
                  Tìm kiếm
                </Typography>

                <TextField
                  size="small"
                  placeholder="Tìm theo tên, mã NV, khoa, chức danh, phạm vi hành nghề..."
                  value={searchText}
                  onChange={handleSearchChange}
                  sx={{ flex: 1 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <Typography variant="body2" color="text.secondary">
                  Hiển thị {paginatedData.length} trong tổng số{" "}
                  {filteredData.length} kết quả
                </Typography>
              </Stack>
            </Box>

            {/* Loading Indicator */}
            {isLoading && <LinearProgress />}

            {/* Table */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      background: (theme) =>
                        `linear-gradient(135deg, ${alpha(
                          theme.palette.primary.main,
                          0.1
                        )} 0%, ${alpha(theme.palette.primary.main, 0.2)} 100%)`,
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>STT</TableCell>

                    <TableCell sx={{ fontWeight: 600 }}>
                      <TableSortLabel
                        active={orderBy === "MaNhanVien"}
                        direction={orderBy === "MaNhanVien" ? order : "asc"}
                        onClick={() => handleRequestSort("MaNhanVien")}
                      >
                        Mã NV
                      </TableSortLabel>
                    </TableCell>

                    <TableCell sx={{ fontWeight: 600 }}>
                      <TableSortLabel
                        active={orderBy === "Ten"}
                        direction={orderBy === "Ten" ? order : "asc"}
                        onClick={() => handleRequestSort("Ten")}
                      >
                        Họ và Tên
                      </TableSortLabel>
                    </TableCell>

                    <TableCell sx={{ fontWeight: 600 }}>
                      <TableSortLabel
                        active={orderBy === "NgaySinh"}
                        direction={orderBy === "NgaySinh" ? order : "asc"}
                        onClick={() => handleRequestSort("NgaySinh")}
                      >
                        Ngày sinh
                      </TableSortLabel>
                    </TableCell>

                    <TableCell sx={{ fontWeight: 600 }}>Khoa</TableCell>

                    <TableCell sx={{ fontWeight: 600 }}>Chức danh</TableCell>

                    <TableCell sx={{ fontWeight: 600 }}>
                      <TableSortLabel
                        active={orderBy === "createdAt"}
                        direction={orderBy === "createdAt" ? order : "asc"}
                        onClick={() => handleRequestSort("createdAt")}
                      >
                        Ngày tạo
                      </TableSortLabel>
                    </TableCell>

                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      Thao tác
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                        <Stack spacing={2} alignItems="center">
                          <PersonIcon
                            sx={{ fontSize: 64, color: "text.disabled" }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {isLoading
                              ? "Đang tải dữ liệu..."
                              : searchText
                              ? "Không tìm thấy nhân viên phù hợp"
                              : "Chưa có nhân viên nào được chấm KPI"}
                          </Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((row, index) => {
                      const nv = row.NhanVienDuocQuanLy || {};
                      return (
                        <TableRow
                          key={row._id}
                          hover
                          sx={{
                            "&:hover": {
                              backgroundColor: (theme) =>
                                alpha(theme.palette.primary.main, 0.04),
                            },
                          }}
                        >
                          <TableCell>
                            {page * rowsPerPage + index + 1}
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={nv.MaNhanVien || "-"}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>

                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  bgcolor: "primary.main",
                                  fontSize: 14,
                                }}
                              >
                                {nv.Ten?.charAt(0) || "?"}
                              </Avatar>
                              <Typography variant="body2" fontWeight={500}>
                                {nv.Ten || "-"}
                              </Typography>
                            </Stack>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(nv.NgaySinh)}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={nv.KhoaID?.TenKhoa || nv.TenKhoa || "-"}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2">
                              {nv.ChucDanh || "-"}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatDate(row.createdAt)}
                            </Typography>
                          </TableCell>

                          <TableCell align="center">
                            <Tooltip title="Xóa khỏi danh sách">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveNhanVien(row._id)}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
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
                `${from}-${to} trong tổng số ${count}`
              }
            />
          </Paper>
        </MainCard>
      </Grid>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        details={confirmDialog.details}
        severity={confirmDialog.type === "remove" ? "warning" : "info"}
        onConfirm={() => handleDialogConfirm(confirmDialog.data)}
        onClose={handleDialogClose}
        confirmText={confirmDialog.type === "remove" ? "Xóa" : "Cập nhật"}
        confirmColor={confirmDialog.type === "remove" ? "error" : "primary"}
        loading={isLoading}
      />
    </Grid>
  );
}

export default DanhSachChamKPI;
