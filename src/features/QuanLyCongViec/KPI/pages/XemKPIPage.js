import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Stack,
  Button,
  Typography,
  Box,
  Alert,
  AlertTitle,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  CircularProgress,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  IconButton,
  Tooltip,
  Fab,
  Drawer,
  Badge,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  AssignmentLate as AssignmentLateIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  FilterAlt as FilterAltIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import dayjs from "dayjs";

import KPIHistoryCard from "../components/KPIHistoryCard";
import useAuth from "hooks/useAuth";

import { getDanhGiaKPIs, getChuKyDanhGias } from "../kpiSlice";
import { getNhanVienById } from "features/NhanVien/nhanvienSlice";

/**
 * Custom KPI History Table with integrated filters
 */
function KPIHistoryTableEnhanced({
  data,
  isLoading,
  chuKyDanhGias,
  onRowClick,
}) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState("NgayDuyet");
  const [order, setOrder] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterChuKy, setFilterChuKy] = useState("");
  const [filterTrangThai, setFilterTrangThai] = useState("");

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
    [chuKyDanhGias],
  );

  const filteredData = useMemo(() => {
    let filtered = [...data];

    if (searchTerm) {
      filtered = filtered.filter((item) => {
        const chuKy = getChuKyData(item.ChuKyDanhGiaID);
        const tenChuKy = chuKy?.TenChuKy || "";
        return tenChuKy.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    if (filterChuKy) {
      filtered = filtered.filter((item) => {
        const chuKyRef = item.ChuKyDanhGiaID;
        const chuKyId =
          typeof chuKyRef === "object" && chuKyRef !== null
            ? chuKyRef._id
            : chuKyRef;
        return chuKyId === filterChuKy;
      });
    }

    if (filterTrangThai) {
      filtered = filtered.filter((item) => item.TrangThai === filterTrangThai);
    }

    filtered.sort((a, b) => {
      let aValue, bValue;

      if (orderBy === "NgayDuyet") {
        aValue = a.NgayDuyet ? new Date(a.NgayDuyet).getTime() : 0;
        bValue = b.NgayDuyet ? new Date(b.NgayDuyet).getTime() : 0;
      } else if (orderBy === "TongDiemKPI") {
        aValue = a.TongDiemKPI || 0;
        bValue = b.TongDiemKPI || 0;
      } else if (orderBy === "ChuKy") {
        const aChuKy = getChuKyData(a.ChuKyDanhGiaID);
        const bChuKy = getChuKyData(b.ChuKyDanhGiaID);
        aValue = aChuKy?.TenChuKy || "";
        bValue = bChuKy?.TenChuKy || "";
      } else {
        aValue = a[orderBy];
        bValue = b[orderBy];
      }

      if (order === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [
    data,
    searchTerm,
    filterChuKy,
    filterTrangThai,
    orderBy,
    order,
    getChuKyData,
  ]);

  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const getScoreColor = (score) => {
    if (score >= 8) return "success.main";
    if (score >= 6) return "warning.main";
    return "error.main";
  };

  return (
    <Box>
      {/* Filters Bar */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Tìm kiếm theo chu kỳ..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  background:
                    "linear-gradient(135deg, #667eea15 0%, #764ba215 100%)",
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Chu kỳ đánh giá</InputLabel>
              <Select
                value={filterChuKy}
                label="Chu kỳ đánh giá"
                onChange={(e) => {
                  setFilterChuKy(e.target.value);
                  setPage(0);
                }}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterListIcon fontSize="small" color="primary" />
                  </InputAdornment>
                }
              >
                <MenuItem value="">
                  <em>Tất cả chu kỳ</em>
                </MenuItem>
                {chuKyDanhGias.map((chuKy) => (
                  <MenuItem key={chuKy._id} value={chuKy._id}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span>{chuKy.TenChuKy}</span>
                      <Chip
                        label={chuKy.TrangThai}
                        size="small"
                        color={
                          chuKy.TrangThai === "DANG_DIEN_RA"
                            ? "success"
                            : chuKy.TrangThai === "CHO_BAT_DAU"
                              ? "warning"
                              : "default"
                        }
                        sx={{ height: 20 }}
                      />
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={filterTrangThai}
                label="Trạng thái"
                onChange={(e) => {
                  setFilterTrangThai(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">
                  <em>Tất cả trạng thái</em>
                </MenuItem>
                <MenuItem value="DA_DUYET">
                  <Chip label="Đã duyệt" color="success" size="small" />
                </MenuItem>
                <MenuItem value="CHUA_DUYET">
                  <Chip label="Chưa duyệt" color="warning" size="small" />
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {(searchTerm || filterChuKy || filterTrangThai) && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            Hiển thị {filteredData.length} / {data.length} kết quả
          </Typography>
        )}
      </Paper>

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{
          boxShadow: 2,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHead
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>
                <TableSortLabel
                  active={orderBy === "ChuKy"}
                  direction={orderBy === "ChuKy" ? order : "asc"}
                  onClick={() => handleSort("ChuKy")}
                  sx={{
                    color: "white !important",
                    "&.MuiTableSortLabel-root": { color: "white" },
                    "&.Mui-active": { color: "white" },
                    "& .MuiTableSortLabel-icon": { color: "white !important" },
                  }}
                >
                  Chu kỳ đánh giá
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>
                Trạng thái
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>
                <TableSortLabel
                  active={orderBy === "TongDiemKPI"}
                  direction={orderBy === "TongDiemKPI" ? order : "asc"}
                  onClick={() => handleSort("TongDiemKPI")}
                  sx={{
                    color: "white !important",
                    "&.MuiTableSortLabel-root": { color: "white" },
                    "&.Mui-active": { color: "white" },
                    "& .MuiTableSortLabel-icon": { color: "white !important" },
                  }}
                >
                  Điểm KPI
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  color: "white",
                  fontWeight: 600,
                  display: { xs: "none", md: "table-cell" },
                }}
              >
                <TableSortLabel
                  active={orderBy === "NgayDuyet"}
                  direction={orderBy === "NgayDuyet" ? order : "asc"}
                  onClick={() => handleSort("NgayDuyet")}
                  sx={{
                    color: "white !important",
                    "&.MuiTableSortLabel-root": { color: "white" },
                    "&.Mui-active": { color: "white" },
                    "& .MuiTableSortLabel-icon": { color: "white !important" },
                  }}
                >
                  Ngày duyệt
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{ color: "white", fontWeight: 600 }}
                align="center"
              >
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <CircularProgress size={40} />
                  <Typography sx={{ mt: 2 }} color="text.secondary">
                    Đang tải dữ liệu...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <AssignmentLateIcon
                    sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
                  />
                  <Typography variant="h6" gutterBottom>
                    Không tìm thấy dữ liệu
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm || filterChuKy || filterTrangThai
                      ? "Thử thay đổi bộ lọc để xem kết quả khác"
                      : "Chưa có đánh giá KPI nào"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row) => {
                const chuKy = getChuKyData(row.ChuKyDanhGiaID);

                return (
                  <TableRow
                    key={row._id}
                    hover
                    sx={{
                      cursor: "pointer",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                    onClick={() => onRowClick(row)}
                  >
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" fontWeight={600}>
                          {chuKy?.TenChuKy || "N/A"}
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
                    <TableCell>
                      <Chip
                        label={
                          row.TrangThai === "DA_DUYET"
                            ? "Đã duyệt"
                            : "Chưa duyệt"
                        }
                        color={
                          row.TrangThai === "DA_DUYET" ? "success" : "warning"
                        }
                        size="small"
                        icon={
                          row.TrangThai === "DA_DUYET" ? (
                            <CheckCircleIcon />
                          ) : (
                            <PendingIcon />
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography
                          variant="h6"
                          sx={{ color: getScoreColor(row.TongDiemKPI) }}
                        >
                          {((row.TongDiemKPI / 10) * 100).toFixed(1)}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min((row.TongDiemKPI / 10) * 100, 100)}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: "action.hover",
                          }}
                          color={
                            row.TongDiemKPI >= 8
                              ? "success"
                              : row.TongDiemKPI >= 6
                                ? "warning"
                                : "error"
                          }
                        />
                      </Stack>
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: "none", md: "table-cell" } }}
                    >
                      <Typography variant="body2">
                        {row.NgayDuyet
                          ? dayjs(row.NgayDuyet).format("DD/MM/YYYY HH:mm")
                          : "Chưa duyệt"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Xem chi tiết">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRowClick(row);
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

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
              `${from}–${to} trong ${count !== -1 ? count : `hơn ${to}`}`
            }
          />
        )}
      </TableContainer>
    </Box>
  );
}

/**
 * XemKPIPage - Trang nhân viên xem KPI của mình
 */
function XemKPIPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { danhGiaKPIs, chuKyDanhGias, isLoading, error } = useSelector(
    (state) => state.kpi,
  );

  const { nhanviens } = useSelector((state) => state.nhanvien);

  // ✅ CORRECT: Use useAuth() hook as per best practice
  const { user: currentUser } = useAuth();

  const [nhanVienIdWarning, setNhanVienIdWarning] = useState(false);

  // ✅ Validate NhanVienID on mount
  useEffect(() => {
    if (currentUser && !currentUser.NhanVienID) {
      setNhanVienIdWarning(true);
      toast.warning(
        "Tài khoản chưa liên kết với hồ sơ nhân viên. Vui lòng liên hệ quản trị viên.",
      );
    }
  }, [currentUser]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      await dispatch(getChuKyDanhGias());
      if (currentUser?.NhanVienID) {
        await dispatch(getNhanVienById(currentUser.NhanVienID));
      }
    };
    loadInitialData();
  }, [dispatch, currentUser?.NhanVienID]);

  // Load danh sách KPI của user hiện tại - ✅ Load ALL without filtering by cycle
  useEffect(() => {
    const nhanVienId = currentUser?.NhanVienID;
    if (nhanVienId) {
      dispatch(getDanhGiaKPIs({ NhanVienID: nhanVienId }));
    }
  }, [dispatch, currentUser]);

  const handleRefresh = () => {
    const nhanVienId = currentUser?.NhanVienID;
    if (nhanVienId) {
      dispatch(getDanhGiaKPIs({ NhanVienID: nhanVienId }));
    }
  };

  // ✅ Navigate to ChamDiemKPIPage with readonly mode
  const handleOpenChamDiemDialog = (danhGiaKPI) => {
    const chuKyId =
      typeof danhGiaKPI.ChuKyDanhGiaID === "object"
        ? danhGiaKPI.ChuKyDanhGiaID._id
        : danhGiaKPI.ChuKyDanhGiaID;

    if (currentUser?.NhanVienID && chuKyId) {
      navigate(
        `/quanlycongviec/kpi/cham-diem/${currentUser.NhanVienID}?chuky=${chuKyId}&readonly=true`,
      );
    }
  };

  // Tính toán thống kê
  const stats = {
    tongSoDanhGia: danhGiaKPIs.length,
    daDuyet: danhGiaKPIs.filter((item) => item.TrangThai === "DA_DUYET").length,
    chuaDuyet: danhGiaKPIs.filter((item) => item.TrangThai === "CHUA_DUYET")
      .length,
    diemTrungBinh:
      danhGiaKPIs.length > 0
        ? (
            danhGiaKPIs.reduce(
              (sum, item) => sum + (item.TongDiemKPI || 0),
              0,
            ) / danhGiaKPIs.length
          ).toFixed(2)
        : 0,
    diemCaoNhat:
      danhGiaKPIs.length > 0
        ? Math.max(...danhGiaKPIs.map((item) => item.TongDiemKPI || 0)).toFixed(
            2,
          )
        : 0,
  };

  // Đánh giá gần nhất
  const danhGiaGanNhat = danhGiaKPIs.length > 0 ? danhGiaKPIs[0] : null;

  // ✅ CORRECT: Lấy thông tin từ NhanVien model
  // currentUser.NhanVienID là STRING → tìm trong danh sách nhanviens
  const nhanVienData = nhanviens.find(
    (nv) => nv._id === currentUser?.NhanVienID,
  );

  // ✅ Format for display in cards
  const nhanVienInfo = {
    ten: nhanVienData?.Ten || currentUser?.HoTen || "N/A",
    maNhanVien: nhanVienData?.MaNhanVien || "N/A",
    email: nhanVienData?.Email || currentUser?.Email || "N/A",
    khoaPhong:
      nhanVienData?.KhoaID?.TenKhoa || currentUser?.KhoaID?.TenKhoa || "N/A",
  };

  // ✅ Mobile detection
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // ✅ Mobile filter drawer state
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [mobileFilters, setMobileFilters] = useState({
    searchTerm: "",
    filterChuKy: "",
    filterTrangThai: "",
  });

  // ✅ Get chuKy data helper
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
    [chuKyDanhGias],
  );

  // ✅ Filtered data for mobile
  const mobileFilteredData = useMemo(() => {
    let filtered = [...danhGiaKPIs];

    if (mobileFilters.searchTerm) {
      filtered = filtered.filter((item) => {
        const chuKy = getChuKyData(item.ChuKyDanhGiaID);
        const tenChuKy = chuKy?.TenChuKy || "";
        return tenChuKy
          .toLowerCase()
          .includes(mobileFilters.searchTerm.toLowerCase());
      });
    }

    if (mobileFilters.filterChuKy) {
      filtered = filtered.filter((item) => {
        const chuKyRef = item.ChuKyDanhGiaID;
        const chuKyId =
          typeof chuKyRef === "object" && chuKyRef !== null
            ? chuKyRef._id
            : chuKyRef;
        return chuKyId === mobileFilters.filterChuKy;
      });
    }

    if (mobileFilters.filterTrangThai) {
      filtered = filtered.filter(
        (item) => item.TrangThai === mobileFilters.filterTrangThai,
      );
    }

    // Sort by NgayDuyet desc
    filtered.sort((a, b) => {
      const aValue = a.NgayDuyet ? new Date(a.NgayDuyet).getTime() : 0;
      const bValue = b.NgayDuyet ? new Date(b.NgayDuyet).getTime() : 0;
      return bValue - aValue;
    });

    return filtered;
  }, [danhGiaKPIs, mobileFilters, getChuKyData]);

  // ✅ Active filter count for badge
  const activeFilterCount = [
    mobileFilters.searchTerm,
    mobileFilters.filterChuKy,
    mobileFilters.filterTrangThai,
  ].filter(Boolean).length;

  // ✅ Edge-to-edge layout for both mobile and desktop
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "secondary.lighter",
        pb: 10,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Box
          sx={{
            maxWidth: { xs: "100%", md: "lg" },
            mx: { xs: 0, md: "auto" },
            px: { xs: 2, md: 0 },
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ py: 2 }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton
                onClick={() => window.history.back()}
                size="small"
                sx={{ mr: 0.5 }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "1.125rem", sm: "1.25rem" },
                }}
              >
                📊 KPI của tôi
              </Typography>
            </Stack>
            <IconButton
              onClick={handleRefresh}
              size="small"
              disabled={isLoading}
            >
              <RefreshIcon />
            </IconButton>
          </Stack>
        </Box>
      </Box>

      {/* Loading State */}
      {isLoading && danhGiaKPIs.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Đang tải dữ liệu...
          </Typography>
        </Box>
      )}

      {/* Content */}
      {(!isLoading || danhGiaKPIs.length > 0) && (
        <Box>
          {/* Employee Info Card */}
          <Box
            sx={{
              bgcolor: "background.paper",
              py: 2,
              mb: 1,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box
              sx={{
                px: 2,
                maxWidth: { xs: "100%", md: "lg" },
                mx: { xs: 0, md: "auto" },
              }}
            >
              <Card
                elevation={0}
                sx={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                  {/* Name + Badge */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1.5}
                    mb={1.5}
                  >
                    <PersonIcon sx={{ fontSize: 28 }} />
                    <Typography variant="h6" fontWeight={600}>
                      {nhanVienInfo.ten}
                    </Typography>
                    <Chip
                      label={nhanVienInfo.maNhanVien}
                      size="small"
                      sx={{
                        bgcolor: "rgba(255,255,255,0.2)",
                        color: "white",
                        fontWeight: 600,
                      }}
                    />
                  </Stack>

                  {/* Info Row */}
                  <Stack
                    direction="row"
                    spacing={2}
                    flexWrap="wrap"
                    sx={{ opacity: 0.9, mb: 2 }}
                  >
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <BusinessIcon sx={{ fontSize: 16 }} />
                      <Typography variant="body2">
                        {nhanVienInfo.khoaPhong}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <EmailIcon sx={{ fontSize: 16 }} />
                      <Typography variant="body2">
                        {nhanVienInfo.email}
                      </Typography>
                    </Stack>
                  </Stack>

                  {/* Stats Grid */}
                  <Grid container spacing={1.5}>
                    <Grid item xs={6} sm={3}>
                      <Paper
                        elevation={0}
                        sx={{
                          bgcolor: "rgba(255,255,255,0.15)",
                          p: 1.5,
                          borderRadius: 1.5,
                          textAlign: "center",
                        }}
                      >
                        <Typography variant="h5" fontWeight={700}>
                          {stats.tongSoDanhGia}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                          Tổng đánh giá
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Paper
                        elevation={0}
                        sx={{
                          bgcolor: "rgba(255,255,255,0.15)",
                          p: 1.5,
                          borderRadius: 1.5,
                          textAlign: "center",
                        }}
                      >
                        <Typography variant="h5" fontWeight={700}>
                          {stats.daDuyet}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                          Đã duyệt
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Paper
                        elevation={0}
                        sx={{
                          bgcolor: "rgba(255,255,255,0.15)",
                          p: 1.5,
                          borderRadius: 1.5,
                          textAlign: "center",
                        }}
                      >
                        <Typography variant="h5" fontWeight={700}>
                          {((stats.diemTrungBinh / 10) * 100).toFixed(0)}%
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                          Điểm TB
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Paper
                        elevation={0}
                        sx={{
                          bgcolor: "rgba(255,255,255,0.15)",
                          p: 1.5,
                          borderRadius: 1.5,
                          textAlign: "center",
                        }}
                      >
                        <Typography variant="h5" fontWeight={700}>
                          {danhGiaGanNhat
                            ? ((danhGiaGanNhat.TongDiemKPI / 10) * 100).toFixed(
                                0,
                              ) + "%"
                            : "—"}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                          KPI gần nhất
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Error Alert */}
          {error && (
            <Box sx={{ px: 2, mb: 2 }}>
              <Alert severity="error">
                <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
                {error}
              </Alert>
            </Box>
          )}

          {/* NhanVienID Warning */}
          {nhanVienIdWarning && (
            <Box sx={{ px: 2, mb: 2 }}>
              <Alert severity="warning" icon={<WarningIcon />}>
                <AlertTitle>Cảnh báo</AlertTitle>
                Tài khoản của bạn chưa được liên kết với hồ sơ nhân viên.
              </Alert>
            </Box>
          )}

          {/* Active Filters Chips (Mobile) */}
          {isMobile && activeFilterCount > 0 && (
            <Box sx={{ px: 2, mb: 2 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {mobileFilters.searchTerm && (
                  <Chip
                    label={`Tìm: ${mobileFilters.searchTerm}`}
                    size="small"
                    onDelete={() =>
                      setMobileFilters((prev) => ({
                        ...prev,
                        searchTerm: "",
                      }))
                    }
                  />
                )}
                {mobileFilters.filterChuKy && (
                  <Chip
                    label={`Chu kỳ: ${
                      getChuKyData(mobileFilters.filterChuKy)?.TenChuKy || "N/A"
                    }`}
                    size="small"
                    onDelete={() =>
                      setMobileFilters((prev) => ({
                        ...prev,
                        filterChuKy: "",
                      }))
                    }
                  />
                )}
                {mobileFilters.filterTrangThai && (
                  <Chip
                    label={
                      mobileFilters.filterTrangThai === "DA_DUYET"
                        ? "Đã duyệt"
                        : "Chưa duyệt"
                    }
                    size="small"
                    color={
                      mobileFilters.filterTrangThai === "DA_DUYET"
                        ? "success"
                        : "warning"
                    }
                    onDelete={() =>
                      setMobileFilters((prev) => ({
                        ...prev,
                        filterTrangThai: "",
                      }))
                    }
                  />
                )}
              </Stack>
            </Box>
          )}

          {/* Content Section Title */}
          <Box
            sx={{
              bgcolor: "background.paper",
              py: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box
              sx={{
                px: 2,
                maxWidth: { xs: "100%", md: "lg" },
                mx: { xs: 0, md: "auto" },
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6" fontWeight={600}>
                  Lịch sử đánh giá
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isMobile ? mobileFilteredData.length : danhGiaKPIs.length}{" "}
                  kết quả
                </Typography>
              </Stack>
            </Box>
          </Box>

          {/* Mobile: Card List */}
          {isMobile && (
            <Box sx={{ px: 2, py: 2 }}>
              {mobileFilteredData.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <AssignmentLateIcon
                    sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
                  />
                  <Typography variant="h6" gutterBottom>
                    Không tìm thấy dữ liệu
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activeFilterCount > 0
                      ? "Thử thay đổi bộ lọc để xem kết quả khác"
                      : "Chưa có đánh giá KPI nào"}
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {mobileFilteredData.map((danhGiaKPI, index) => (
                    <KPIHistoryCard
                      key={danhGiaKPI._id}
                      danhGiaKPI={danhGiaKPI}
                      chuKy={getChuKyData(danhGiaKPI.ChuKyDanhGiaID)}
                      onClick={handleOpenChamDiemDialog}
                      index={index}
                    />
                  ))}
                </Stack>
              )}
            </Box>
          )}

          {/* Desktop: Table */}
          {!isMobile && (
            <Box
              sx={{
                px: 2,
                py: 2,
                maxWidth: { xs: "100%", md: "lg" },
                mx: { xs: 0, md: "auto" },
              }}
            >
              <KPIHistoryTableEnhanced
                data={danhGiaKPIs}
                isLoading={isLoading}
                chuKyDanhGias={chuKyDanhGias}
                onRowClick={handleOpenChamDiemDialog}
              />
            </Box>
          )}
        </Box>
      )}

      {/* Mobile FAB for Filter */}
      {isMobile && (
        <Fab
          color="primary"
          onClick={() => setFilterDrawerOpen(true)}
          sx={{
            position: "fixed",
            bottom: 80,
            right: 16,
            zIndex: 1000,
          }}
        >
          <Badge
            badgeContent={activeFilterCount}
            color="error"
            invisible={activeFilterCount === 0}
          >
            <FilterAltIcon />
          </Badge>
        </Fab>
      )}

      {/* Mobile Filter Drawer */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        PaperProps={{
          sx: { width: { xs: "100%", sm: 400 } },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h6" fontWeight={600}>
              Bộ lọc
            </Typography>
            <IconButton onClick={() => setFilterDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Stack spacing={3}>
            <TextField
              fullWidth
              size="small"
              label="Tìm kiếm theo chu kỳ"
              value={mobileFilters.searchTerm}
              onChange={(e) =>
                setMobileFilters((prev) => ({
                  ...prev,
                  searchTerm: e.target.value,
                }))
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl fullWidth size="small">
              <InputLabel>Chu kỳ đánh giá</InputLabel>
              <Select
                value={mobileFilters.filterChuKy}
                label="Chu kỳ đánh giá"
                onChange={(e) =>
                  setMobileFilters((prev) => ({
                    ...prev,
                    filterChuKy: e.target.value,
                  }))
                }
              >
                <MenuItem value="">
                  <em>Tất cả chu kỳ</em>
                </MenuItem>
                {chuKyDanhGias.map((chuKy) => (
                  <MenuItem key={chuKy._id} value={chuKy._id}>
                    {chuKy.TenChuKy}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={mobileFilters.filterTrangThai}
                label="Trạng thái"
                onChange={(e) =>
                  setMobileFilters((prev) => ({
                    ...prev,
                    filterTrangThai: e.target.value,
                  }))
                }
              >
                <MenuItem value="">
                  <em>Tất cả trạng thái</em>
                </MenuItem>
                <MenuItem value="DA_DUYET">Đã duyệt</MenuItem>
                <MenuItem value="CHUA_DUYET">Chưa duyệt</MenuItem>
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() =>
                  setMobileFilters({
                    searchTerm: "",
                    filterChuKy: "",
                    filterTrangThai: "",
                  })
                }
              >
                Xóa bộ lọc
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={() => setFilterDrawerOpen(false)}
              >
                Áp dụng
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
}

export default XemKPIPage;
