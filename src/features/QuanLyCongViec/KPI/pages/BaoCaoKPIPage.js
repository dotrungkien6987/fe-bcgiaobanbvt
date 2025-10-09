import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Grid,
  Stack,
  Button,
  Typography,
  Box,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  BarChart as BarChartIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
} from "@mui/icons-material";

import MainCard from "components/MainCard";
import ThongKeKPITable from "../components/ThongKeKPITable";
import KPIChartByNhanVien from "../components/KPIChartByNhanVien";
import KPIDistributionChart from "../components/KPIDistributionChart";

import {
  getThongKeKPITheoChuKy,
  getChuKyDanhGias,
  getTieuChiDanhGias,
} from "../kpiSlice";
import { getAllNhanVien } from "features/NhanVien/nhanvienSlice";

/**
 * BaoCaoKPIPage - Trang báo cáo thống kê KPI cho Admin
 *
 * Chức năng:
 * - Xem thống kê KPI theo chu kỳ
 * - Xem bảng xếp hạng nhân viên theo điểm KPI
 * - Biểu đồ phân bố điểm KPI
 * - Biểu đồ so sánh KPI giữa các nhân viên
 * - Export báo cáo
 */
function BaoCaoKPIPage() {
  const dispatch = useDispatch();

  const { thongKeKPIs, chuKyDanhGias, isLoading, error } = useSelector(
    (state) => state.kpi
  );

  const { nhanviens } = useSelector((state) => state.nhanvien);

  const [selectedChuKy, setSelectedChuKy] = useState("");

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      // Load chu kỳ đánh giá
      const chuKysResponse = await dispatch(getChuKyDanhGias());

      // Load tiêu chí đánh giá
      await dispatch(getTieuChiDanhGias());

      // Load nhân viên
      if (nhanviens.length === 0) {
        await dispatch(getAllNhanVien());
      }

      // Auto-select chu kỳ đang diễn ra hoặc mới nhất
      if (chuKysResponse?.payload?.chuKys?.length > 0) {
        const chuKys = chuKysResponse.payload.chuKys;
        const dangDienRa = chuKys.find((ck) => ck.TrangThai === "DANG_DIEN_RA");
        const chuKyMacDinh = dangDienRa || chuKys[0];

        setSelectedChuKy(chuKyMacDinh._id);
        dispatch(getThongKeKPITheoChuKy(chuKyMacDinh._id));
      }
    };

    loadInitialData();
  }, [dispatch, nhanviens.length]);

  const handleChuKyChange = (event) => {
    const chuKyId = event.target.value;
    setSelectedChuKy(chuKyId);
    if (chuKyId) {
      dispatch(getThongKeKPITheoChuKy(chuKyId));
    }
  };

  const handleRefresh = () => {
    if (selectedChuKy) {
      dispatch(getThongKeKPITheoChuKy(selectedChuKy));
    }
  };

  const handleExport = () => {
    // TODO: Implement export to Excel/PDF
    console.log("Export báo cáo KPI");
  };

  // Tính toán thống kê tổng quan
  const stats = {
    tongSoNhanVien: thongKeKPIs.length,
    daDuyet: thongKeKPIs.filter((item) => item.TrangThai === "DA_DUYET").length,
    chuaDuyet: thongKeKPIs.filter((item) => item.TrangThai === "CHUA_DUYET")
      .length,
    diemTrungBinh:
      thongKeKPIs.length > 0
        ? (
            thongKeKPIs.reduce(
              (sum, item) => sum + (item.TongDiemKPI || 0),
              0
            ) / thongKeKPIs.length
          ).toFixed(2)
        : 0,
    diemCaoNhat:
      thongKeKPIs.length > 0
        ? Math.max(...thongKeKPIs.map((item) => item.TongDiemKPI || 0)).toFixed(
            2
          )
        : 0,
    diemThapNhat:
      thongKeKPIs.length > 0
        ? Math.min(...thongKeKPIs.map((item) => item.TongDiemKPI || 0)).toFixed(
            2
          )
        : 0,
    nhanVienXuatSac: thongKeKPIs.filter((item) => item.TongDiemKPI >= 9).length,
    nhanVienTot: thongKeKPIs.filter(
      (item) => item.TongDiemKPI >= 7 && item.TongDiemKPI < 9
    ).length,
    nhanVienKha: thongKeKPIs.filter(
      (item) => item.TongDiemKPI >= 5 && item.TongDiemKPI < 7
    ).length,
    nhanVienYeu: thongKeKPIs.filter((item) => item.TongDiemKPI < 5).length,
  };

  const selectedChuKyInfo = chuKyDanhGias.find(
    (ck) => ck._id === selectedChuKy
  );

  return (
    <MainCard>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <BarChartIcon sx={{ fontSize: 32, color: "primary.main" }} />
              <Typography variant="h4">Báo cáo thống kê KPI</Typography>
            </Stack>

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                disabled={isLoading || !selectedChuKy}
              >
                Làm mới
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                disabled={isLoading || thongKeKPIs.length === 0}
              >
                Xuất báo cáo
              </Button>
            </Stack>
          </Stack>
        </Grid>

        {/* Error Alert */}
        {error && (
          <Grid item xs={12}>
            <Alert
              severity="error"
              onClose={() => dispatch({ type: "kpi/clearError" })}
            >
              <strong>Lỗi:</strong> {error}
            </Alert>
          </Grid>
        )}

        {/* Chu kỳ Selector */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={3} alignItems="center">
                <FormControl sx={{ minWidth: 400 }}>
                  <InputLabel>Chọn chu kỳ đánh giá</InputLabel>
                  <Select
                    value={selectedChuKy}
                    label="Chọn chu kỳ đánh giá"
                    onChange={handleChuKyChange}
                  >
                    {chuKyDanhGias.map((chuKy) => (
                      <MenuItem key={chuKy._id} value={chuKy._id}>
                        {chuKy.TenChuKy} ({chuKy.TrangThai})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selectedChuKyInfo && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Thời gian:{" "}
                      <strong>
                        {new Date(
                          selectedChuKyInfo.NgayBatDau
                        ).toLocaleDateString("vi-VN")}{" "}
                        -{" "}
                        {new Date(
                          selectedChuKyInfo.NgayKetThuc
                        ).toLocaleDateString("vi-VN")}
                      </strong>
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics Cards Row 1 */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PeopleIcon color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    Tổng số nhân viên
                  </Typography>
                </Stack>
                <Typography variant="h3">{stats.tongSoNhanVien}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Đã duyệt: {stats.daDuyet} | Chưa duyệt: {stats.chuaDuyet}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ bgcolor: "primary.lighter" }}>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TrendingUpIcon color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    Điểm trung bình
                  </Typography>
                </Stack>
                <Typography variant="h3">
                  {((stats.diemTrungBinh / 10) * 100).toFixed(1)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stats.diemTrungBinh}/10 điểm
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ bgcolor: "success.lighter" }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Điểm cao nhất
                </Typography>
                <Typography variant="h3" color="success.dark">
                  {((stats.diemCaoNhat / 10) * 100).toFixed(1)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stats.diemCaoNhat}/10 điểm
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ bgcolor: "warning.lighter" }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Điểm thấp nhất
                </Typography>
                <Typography variant="h3" color="warning.dark">
                  {((stats.diemThapNhat / 10) * 100).toFixed(1)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stats.diemThapNhat}/10 điểm
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Distribution */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Phân loại hiệu suất
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Stack spacing={1} alignItems="center">
                    <Typography variant="h4" color="success.main">
                      {stats.nhanVienXuatSac}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Xuất sắc (≥90%)
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Stack spacing={1} alignItems="center">
                    <Typography variant="h4" color="primary.main">
                      {stats.nhanVienTot}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tốt (70-89%)
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Stack spacing={1} alignItems="center">
                    <Typography variant="h4" color="warning.main">
                      {stats.nhanVienKha}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Khá (50-69%)
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Stack spacing={1} alignItems="center">
                    <Typography variant="h4" color="error.main">
                      {stats.nhanVienYeu}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Yếu (&lt;50%)
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Phân bố điểm KPI
              </Typography>
              <Divider sx={{ my: 2 }} />
              <KPIDistributionChart data={thongKeKPIs} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                So sánh KPI giữa các nhân viên (Top 10)
              </Typography>
              <Divider sx={{ my: 2 }} />
              <KPIChartByNhanVien
                data={thongKeKPIs.slice(0, 10)}
                nhanviens={nhanviens}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Detailed Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Bảng xếp hạng chi tiết
              </Typography>
              <Divider sx={{ my: 2 }} />
              <ThongKeKPITable
                data={thongKeKPIs}
                isLoading={isLoading}
                nhanviens={nhanviens}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </MainCard>
  );
}

export default BaoCaoKPIPage;
