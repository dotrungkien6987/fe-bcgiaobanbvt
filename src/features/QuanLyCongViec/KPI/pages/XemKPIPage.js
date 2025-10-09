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
  Chip,
  LinearProgress,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
} from "@mui/icons-material";

import MainCard from "components/MainCard";
import KPIHistoryTable from "../components/KPIHistoryTable";
import DanhGiaKPIDetailDialog from "../components/DanhGiaKPIDetailDialog";

import {
  getDanhGiaKPIs,
  getChuKyDanhGias,
  getTieuChiDanhGias,
  setFilterChuKyID,
  closeDetailDialog,
} from "../kpiSlice";

/**
 * XemKPIPage - Trang nhân viên xem KPI của mình
 *
 * Chức năng:
 * - Xem lịch sử đánh giá KPI của bản thân
 * - Xem chi tiết điểm từng nhiệm vụ
 * - Xem chi tiết tiêu chí được/mất điểm
 * - Lọc theo chu kỳ
 * - Hiển thị thống kê tổng quan
 */
function XemKPIPage() {
  const dispatch = useDispatch();

  const {
    danhGiaKPIs,
    chuKyDanhGias,
    tieuChiDanhGias,
    isLoading,
    error,
    isOpenDetailDialog,
    filterChuKyID,
  } = useSelector((state) => state.kpi);

  const currentUser = useSelector((state) => state.user.user);

  const [selectedChuKy, setSelectedChuKy] = useState("");

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      // Load chu kỳ đánh giá
      await dispatch(getChuKyDanhGias());

      // Load tiêu chí đánh giá
      await dispatch(getTieuChiDanhGias());
    };

    loadInitialData();
  }, [dispatch]);

  // Load danh sách KPI của user hiện tại
  useEffect(() => {
    if (currentUser?._id) {
      const filters = {
        NhanVienID: currentUser._id,
      };
      if (filterChuKyID) filters.ChuKyDanhGiaID = filterChuKyID;

      dispatch(getDanhGiaKPIs(filters));
    }
  }, [dispatch, currentUser, filterChuKyID]);

  const handleChuKyChange = (event) => {
    const chuKyId = event.target.value;
    setSelectedChuKy(chuKyId);
    dispatch(setFilterChuKyID(chuKyId || null));
  };

  const handleRefresh = () => {
    if (currentUser?._id) {
      const filters = {
        NhanVienID: currentUser._id,
      };
      if (filterChuKyID) filters.ChuKyDanhGiaID = filterChuKyID;
      dispatch(getDanhGiaKPIs(filters));
    }
  };

  const handleCloseDetailDialog = () => {
    dispatch(closeDetailDialog());
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
              0
            ) / danhGiaKPIs.length
          ).toFixed(2)
        : 0,
    diemCaoNhat:
      danhGiaKPIs.length > 0
        ? Math.max(...danhGiaKPIs.map((item) => item.TongDiemKPI || 0)).toFixed(
            2
          )
        : 0,
  };

  // Đánh giá gần nhất
  const danhGiaGanNhat = danhGiaKPIs.length > 0 ? danhGiaKPIs[0] : null;

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
              <VisibilityIcon sx={{ fontSize: 32, color: "primary.main" }} />
              <Typography variant="h4">KPI của tôi</Typography>
            </Stack>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={isLoading}
            >
              Làm mới
            </Button>
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

        {/* Statistics Cards */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Tổng số đánh giá
                </Typography>
                <Typography variant="h3">{stats.tongSoDanhGia}</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ bgcolor: "success.lighter" }}>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CheckCircleIcon color="success" />
                  <Typography variant="body2" color="text.secondary">
                    Đã duyệt
                  </Typography>
                </Stack>
                <Typography variant="h3">{stats.daDuyet}</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ bgcolor: "warning.lighter" }}>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PendingIcon color="warning" />
                  <Typography variant="body2" color="text.secondary">
                    Chưa duyệt
                  </Typography>
                </Stack>
                <Typography variant="h3">{stats.chuaDuyet}</Typography>
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

        {/* Latest KPI Info */}
        {danhGiaGanNhat && (
          <Grid item xs={12}>
            <Card
              sx={{
                bgcolor: "background.paper",
                border: 1,
                borderColor: "primary.main",
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Đánh giá KPI gần nhất
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <Typography variant="body2" color="text.secondary">
                        Chu kỳ:
                      </Typography>
                      <Typography variant="body1">
                        {chuKyDanhGias.find(
                          (ck) => ck._id === danhGiaGanNhat.ChuKyDanhGiaID
                        )?.TenChuKy || "N/A"}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <Typography variant="body2" color="text.secondary">
                        Trạng thái:
                      </Typography>
                      <Chip
                        label={
                          danhGiaGanNhat.TrangThai === "DA_DUYET"
                            ? "Đã duyệt"
                            : "Chưa duyệt"
                        }
                        color={
                          danhGiaGanNhat.TrangThai === "DA_DUYET"
                            ? "success"
                            : "warning"
                        }
                        size="small"
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <Typography variant="body2" color="text.secondary">
                        Điểm KPI:
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="h4" color="primary">
                          {((danhGiaGanNhat.TongDiemKPI / 10) * 100).toFixed(1)}
                          %
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ({danhGiaGanNhat.TongDiemKPI.toFixed(2)}/10 điểm)
                        </Typography>
                      </Stack>
                      <Box sx={{ width: "100%", mt: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(
                            (danhGiaGanNhat.TongDiemKPI / 10) * 100,
                            100
                          )}
                          sx={{ height: 10, borderRadius: 5 }}
                          color={
                            danhGiaGanNhat.TongDiemKPI >= 8
                              ? "success"
                              : danhGiaGanNhat.TongDiemKPI >= 6
                              ? "primary"
                              : "warning"
                          }
                        />
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Filter */}
        <Grid item xs={12}>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl sx={{ minWidth: 300 }}>
              <InputLabel>Chu kỳ đánh giá</InputLabel>
              <Select
                value={selectedChuKy}
                label="Chu kỳ đánh giá"
                onChange={handleChuKyChange}
              >
                <MenuItem value="">
                  <em>Tất cả</em>
                </MenuItem>
                {chuKyDanhGias.map((chuKy) => (
                  <MenuItem key={chuKy._id} value={chuKy._id}>
                    {chuKy.TenChuKy}{" "}
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
                      sx={{ ml: 1 }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Grid>

        {/* History Table */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Lịch sử đánh giá
          </Typography>
          <KPIHistoryTable
            data={danhGiaKPIs}
            isLoading={isLoading}
            chuKyDanhGias={chuKyDanhGias}
          />
        </Grid>
      </Grid>

      {/* Detail Dialog */}
      <DanhGiaKPIDetailDialog
        open={isOpenDetailDialog}
        handleClose={handleCloseDetailDialog}
        tieuChiDanhGias={tieuChiDanhGias}
      />
    </MainCard>
  );
}

export default XemKPIPage;
