import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import WarningIcon from "@mui/icons-material/Warning";

import StatCard from "../components/StatCard";
import {
  autoSelectChuKy,
  getDashboardData,
  getChamDiemDetail,
  setSearchTerm,
} from "../../kpiSlice";
import ChamDiemKPIDialog from "../components/ChamDiemKPIDialog";

/**
 * DanhGiaKPIDashboard - Trang tổng quan chấm KPI
 *
 * Features:
 * - Auto-select chu kỳ khi load
 * - Hiển thị 4 stat cards: Tổng NV, Hoàn thành, Đang chấm, Chưa bắt đầu
 * - Table nhân viên với progress bar
 * - Search nhân viên
 * - Click row → Mở dialog chấm điểm
 */
function DanhGiaKPIDashboard() {
  const dispatch = useDispatch();
  const {
    autoSelectedChuKy,
    dashboardData,
    isLoading,
    searchTerm,
    filterChuKyID,
    error,
  } = useSelector((state) => state.kpi);

  const [openChamDiem, setOpenChamDiem] = useState(false);
  const [selectedNhanVien, setSelectedNhanVien] = useState(null);

  // Auto-select chu kỳ khi mount
  useEffect(() => {
    dispatch(autoSelectChuKy());
  }, [dispatch]);

  // Load dashboard data khi đã có chu kỳ
  useEffect(() => {
    if (filterChuKyID) {
      dispatch(getDashboardData(filterChuKyID));
    }
  }, [filterChuKyID, dispatch]);

  const handleOpenChamDiem = (nhanVien) => {
    setSelectedNhanVien(nhanVien);
    dispatch(getChamDiemDetail(filterChuKyID, nhanVien.nhanVien._id));
    setOpenChamDiem(true);
  };

  const handleCloseChamDiem = () => {
    setOpenChamDiem(false);
    setSelectedNhanVien(null);
    // Refresh dashboard data
    dispatch(getDashboardData(filterChuKyID));
  };

  // Filter nhân viên theo search term
  const filteredNhanVien = dashboardData.nhanVienList.filter((item) => {
    if (!searchTerm) return true;
    const lower = searchTerm.toLowerCase();
    return (
      item.nhanVien.Ten?.toLowerCase().includes(lower) ||
      item.nhanVien.MaNhanVien?.toLowerCase().includes(lower) ||
      item.nhanVien.Email?.toLowerCase().includes(lower)
    );
  });

  if (isLoading && !autoSelectedChuKy) {
    return (
      <Container sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Đang tải dữ liệu...
        </Typography>
      </Container>
    );
  }

  if (!autoSelectedChuKy) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Không tìm thấy chu kỳ đánh giá
          </Typography>
          <Typography variant="body2">
            {error ||
              "Không tìm thấy chu kỳ đánh giá phù hợp. Vui lòng tạo chu kỳ mới."}
          </Typography>
        </Alert>

        <Box sx={{ mt: 3, p: 3, bgcolor: "background.paper", borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            💡 Hướng dẫn:
          </Typography>
          <Typography variant="body2" component="div">
            <ol>
              <li>
                Vào menu: <strong>Quản lý công việc → Chu kỳ đánh giá</strong>
              </li>
              <li>Tạo chu kỳ mới với khoảng thời gian phù hợp</li>
              <li>Quay lại trang này để bắt đầu đánh giá</li>
            </ol>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            <strong>Lưu ý:</strong> Hệ thống sẽ tự động chọn chu kỳ theo thứ tự
            ưu tiên:
            <br />
            1️⃣ Chu kỳ đang active (hôm nay trong khoảng thời gian)
            <br />
            2️⃣ Chu kỳ gần nhất (vừa kết thúc hoặc sắp bắt đầu trong 5 ngày)
            <br />
            3️⃣ Chu kỳ mới nhất (nếu không có chu kỳ gần)
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Đánh Giá KPI Nhân Viên 1
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Chu kỳ: <strong>{autoSelectedChuKy.TenChuKy}</strong> (
          {dayjs(autoSelectedChuKy.TuNgay).format("DD/MM/YYYY")} -{" "}
          {dayjs(autoSelectedChuKy.DenNgay).format("DD/MM/YYYY")})
        </Typography>
      </Box>

      {/* Summary Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng nhân viên"
            value={dashboardData.summary.totalNhanVien}
            color="primary"
            icon={PeopleIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Hoàn thành"
            value={dashboardData.summary.completed}
            color="success"
            icon={CheckCircleIcon}
            subtitle={`${Math.round(
              (dashboardData.summary.completed /
                dashboardData.summary.totalNhanVien) *
                100 || 0
            )}% tổng số`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Đang chấm"
            value={dashboardData.summary.inProgress}
            color="warning"
            icon={HourglassEmptyIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Chưa bắt đầu"
            value={dashboardData.summary.notStarted}
            color="error"
            icon={WarningIcon}
          />
        </Grid>
      </Grid>

      {/* Nhân viên table */}
      <Card>
        <CardContent>
          {/* Search */}
          <Box mb={2}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm nhân viên (tên, mã, email)..."
              value={searchTerm}
              onChange={(e) => dispatch(setSearchTerm(e.target.value))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nhân viên</TableCell>
                  <TableCell>Khoa</TableCell>
                  <TableCell align="center">Tiến độ</TableCell>
                  <TableCell align="center">Điểm KPI</TableCell>
                  <TableCell align="center">Trạng thái</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredNhanVien.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        Không tìm thấy nhân viên
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNhanVien.map((item) => (
                    <TableRow
                      key={item.nhanVien._id}
                      hover
                      sx={{
                        cursor: "pointer",
                        "&:hover": { backgroundColor: "action.hover" },
                      }}
                      onClick={() => handleOpenChamDiem(item)}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {item.nhanVien.Ten}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.nhanVien.MaNhanVien}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {item.nhanVien.KhoaID?.TenKhoa || "—"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ minWidth: 150 }}>
                          <Box display="flex" alignItems="center" mb={0.5}>
                            <Typography variant="caption" sx={{ mr: 1 }}>
                              {item.progress.scored}/{item.progress.total}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={item.progress.percentage}
                              sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                              color={
                                item.progress.percentage === 100
                                  ? "success"
                                  : item.progress.percentage > 0
                                  ? "warning"
                                  : "error"
                              }
                            />
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell align="center">
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color={
                            item.danhGiaKPI?.TongDiemKPI >= 80
                              ? "success.main"
                              : item.danhGiaKPI?.TongDiemKPI >= 60
                              ? "warning.main"
                              : "text.secondary"
                          }
                        >
                          {item.danhGiaKPI?.TongDiemKPI?.toFixed(1) || "—"}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        {item.danhGiaKPI?.TrangThai === "DA_DUYET" ? (
                          <Chip label="Đã duyệt" color="success" size="small" />
                        ) : item.progress.scored > 0 ? (
                          <Chip
                            label="Đang chấm"
                            color="warning"
                            size="small"
                          />
                        ) : (
                          <Chip label="Chưa chấm" color="error" size="small" />
                        )}
                      </TableCell>

                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenChamDiem(item);
                          }}
                        >
                          {item.danhGiaKPI ? <EditIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog chấm điểm */}
      {openChamDiem && selectedNhanVien && (
        <ChamDiemKPIDialog
          open={openChamDiem}
          onClose={handleCloseChamDiem}
          nhanVien={selectedNhanVien.nhanVien}
        />
      )}
    </Container>
  );
}

export default DanhGiaKPIDashboard;
