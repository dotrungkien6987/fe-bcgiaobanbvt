/**
 * KPIHubPage - KPI Dashboard Landing Page
 *
 * Central hub for all KPI-related actions:
 * - View own KPI history
 * - Self-evaluate KPI
 * - Evaluate team members (Manager only)
 *
 * Mobile-first design with YeuCauDashboard pattern
 */

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Stack,
  Chip,
  LinearProgress,
  Paper,
  IconButton,
  CircularProgress,
  Autocomplete,
  TextField,
} from "@mui/material";
import {
  ArrowBack,
  Refresh,
  Visibility,
  Edit,
  People,
  CheckCircle,
  HourglassEmpty,
} from "@mui/icons-material";
import dayjs from "dayjs";
import useAuth from "hooks/useAuth";
import {
  getDanhGiaKPIs,
  getChuKyDanhGias,
  layDanhSachNhiemVu,
} from "../kpiSlice";

function KPIHubPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();

  // Check if user is manager
  const isManager = useMemo(() => {
    return (
      user?.PhanQuyen === "manager" ||
      user?.PhanQuyen === "quanly" ||
      user?.PhanQuyen === "admin" ||
      user?.PhanQuyen === "superadmin"
    );
  }, [user]);

  // Get KPI data from Redux
  const {
    danhGiaKPIs = [],
    chuKyDanhGias = [],
    assignments = [],
    isLoading,
  } = useSelector((state) => state.kpi);

  // State: Chu kỳ được chọn
  const [selectedChuKy, setSelectedChuKy] = useState(null);

  // Load data
  useEffect(() => {
    dispatch(getChuKyDanhGias());
    if (user?.NhanVienID) {
      dispatch(getDanhGiaKPIs({ NhanVienID: user.NhanVienID }));
    }
  }, [dispatch, user]);

  // Auto-select chu kỳ mở (chỉ lần đầu khi chuKyDanhGias có data)
  useEffect(() => {
    if (chuKyDanhGias.length > 0 && !selectedChuKy) {
      const openCycle = chuKyDanhGias.find((ck) => !ck.isDong);
      setSelectedChuKy(openCycle || chuKyDanhGias[0]);
    }
  }, [chuKyDanhGias, selectedChuKy]);

  // Load assignments and KPI for selected cycle
  useEffect(() => {
    if (user?.NhanVienID && selectedChuKy?._id) {
      dispatch(layDanhSachNhiemVu(user.NhanVienID, selectedChuKy._id));
      // Reload KPI data for selected cycle to get correct TongDiemKPI
      dispatch(
        getDanhGiaKPIs({
          NhanVienID: user.NhanVienID,
          ChuKyDanhGiaID: selectedChuKy._id,
        }),
      );
    }
  }, [dispatch, user, selectedChuKy]);

  // Get current KPI for selected cycle
  const currentKPI = useMemo(() => {
    if (!selectedChuKy) return null;
    return danhGiaKPIs.find(
      (kpi) => kpi.ChuKyDanhGiaID?._id === selectedChuKy._id,
    );
  }, [danhGiaKPIs, selectedChuKy]);

  // Calculate self-evaluation progress
  const selfEvalProgress = useMemo(() => {
    const assignmentList = Array.isArray(assignments) ? assignments : [];
    const total = assignmentList.length;
    const scored = assignmentList.filter((a) => a.DiemTuDanhGia > 0).length;
    const percentage = total > 0 ? Math.round((scored / total) * 100) : 0;
    return { total, scored, percentage };
  }, [assignments]);

  const handleRefresh = () => {
    dispatch(getChuKyDanhGias());
    if (user?.NhanVienID) {
      const filters = { NhanVienID: user.NhanVienID };
      if (selectedChuKy?._id) {
        filters.ChuKyDanhGiaID = selectedChuKy._id;
        dispatch(layDanhSachNhiemVu(user.NhanVienID, selectedChuKy._id));
      }
      dispatch(getDanhGiaKPIs(filters));
    }
  };

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
          sx={{ maxWidth: { xs: "100%", md: "lg" }, mx: { xs: 0, md: "auto" } }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ py: 2, px: { xs: 2, md: 0 } }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton
                onClick={() => navigate("/quanlycongviec")}
                size="small"
                sx={{ mr: 0.5 }}
              >
                <ArrowBack />
              </IconButton>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "1.125rem", sm: "1.25rem" },
                }}
              >
                📊 KPI Dashboard
              </Typography>
            </Stack>
            <IconButton
              onClick={handleRefresh}
              size="small"
              disabled={isLoading}
            >
              <Refresh />
            </IconButton>
          </Stack>
        </Box>
      </Box>

      {/* Loading State */}
      {isLoading && !selectedChuKy && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Đang tải dữ liệu...
          </Typography>
        </Box>
      )}

      {/* Content */}
      {!isLoading || selectedChuKy ? (
        <Box>
          {/* Cycle Selector Section */}
          <Box
            sx={{
              bgcolor: "background.paper",
              py: 2,
              mb: 1,
              borderTop: "1px solid",
              borderBottom: "1px solid",
              borderColor: "divider",
              position: "sticky",
              top: 56,
              zIndex: 9,
            }}
          >
            <Box
              sx={{
                px: 2,
                maxWidth: { xs: "100%", md: "lg" },
                mx: { xs: 0, md: "auto" },
              }}
            >
              <Autocomplete
                options={chuKyDanhGias}
                value={selectedChuKy}
                onChange={(event, newValue) => setSelectedChuKy(newValue)}
                getOptionLabel={(option) => option.TenChuKy || ""}
                isOptionEqualToValue={(option, value) =>
                  option._id === value?._id
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Chọn chu kỳ đánh giá"
                    size="small"
                    variant="outlined"
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      width="100%"
                    >
                      <Typography variant="body2" flex={1}>
                        {option.TenChuKy}
                      </Typography>
                      <Chip
                        label={option.isDong ? "Đã đóng" : "Đang mở"}
                        size="small"
                        color={option.isDong ? "default" : "success"}
                      />
                    </Stack>
                  </li>
                )}
                disabled={isLoading}
                noOptionsText="Không có chu kỳ nào"
                sx={{ mb: 0 }}
              />
            </Box>
          </Box>

          {/* KPI Summary Section */}
          <Box
            sx={{
              bgcolor: "background.paper",
              py: 2,
              mb: 1,
              borderTop: "1px solid",
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
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                🎯 KPI của tôi - Chu kỳ {selectedChuKy?.TenChuKy || "N/A"}
              </Typography>

              <Paper
                elevation={0}
                sx={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  p: 3,
                  borderRadius: 2,
                  textAlign: "center",
                }}
              >
                <Typography variant="h2" fontWeight="bold">
                  {currentKPI?.TongDiemKPI?.toFixed(1) || "—"}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Điểm KPI
                </Typography>

                {currentKPI?.TrangThai === "DA_DUYET" ? (
                  <Chip
                    label="✅ Đã duyệt"
                    sx={{
                      mt: 1,
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "white",
                      fontWeight: 600,
                    }}
                    size="small"
                    icon={<CheckCircle sx={{ color: "white !important" }} />}
                  />
                ) : (
                  <Chip
                    label="⏳ Chưa duyệt"
                    sx={{
                      mt: 1,
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "white",
                      fontWeight: 600,
                    }}
                    size="small"
                    icon={<HourglassEmpty sx={{ color: "white !important" }} />}
                  />
                )}
              </Paper>

              {/* Self-evaluation Progress */}
              <Box sx={{ mt: 2 }}>
                <Stack direction="row" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Tiến độ tự đánh giá
                  </Typography>
                  <Typography variant="caption" fontWeight={600}>
                    {selfEvalProgress.percentage}% ({selfEvalProgress.scored}/
                    {selfEvalProgress.total})
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={selfEvalProgress.percentage}
                  sx={{
                    height: 8,
                    borderRadius: 1,
                    bgcolor: "divider",
                    "& .MuiLinearProgress-bar": {
                      bgcolor:
                        selfEvalProgress.percentage === 100
                          ? "success.main"
                          : "warning.main",
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* Quick Actions */}
          <Box
            sx={{
              bgcolor: "background.paper",
              py: 3,
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
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                ⚡ Thao tác nhanh
              </Typography>

              <Grid container spacing={2}>
                {/* Xem KPI */}
                <Grid item xs={6}>
                  <Card
                    sx={{
                      height: "100%",
                      border: 2,
                      borderColor: "primary.main",
                      bgcolor: "primary.lighter",
                      transition: "all 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 4,
                      },
                    }}
                  >
                    <CardActionArea
                      onClick={() => navigate("/quanlycongviec/kpi/xem")}
                      sx={{ height: "100%", p: 2 }}
                    >
                      <CardContent sx={{ textAlign: "center", p: 0 }}>
                        <Visibility
                          sx={{ fontSize: 48, color: "primary.main", mb: 1 }}
                        />
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{ fontSize: "1rem" }}
                        >
                          📊 Xem KPI
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Lịch sử chi tiết
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>

                {/* Tự đánh giá */}
                <Grid item xs={6}>
                  <Card
                    sx={{
                      height: "100%",
                      border: 2,
                      borderColor: "success.main",
                      bgcolor: "success.lighter",
                      transition: "all 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 4,
                      },
                    }}
                  >
                    <CardActionArea
                      onClick={() =>
                        navigate("/quanlycongviec/kpi/tu-danh-gia")
                      }
                      sx={{ height: "100%", p: 2 }}
                    >
                      <CardContent sx={{ textAlign: "center", p: 0 }}>
                        <Edit
                          sx={{ fontSize: 48, color: "success.main", mb: 1 }}
                        />
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{ fontSize: "1rem" }}
                        >
                          ✍️ Tự đánh giá
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          {selfEvalProgress.scored}/{selfEvalProgress.total}{" "}
                          nhiệm vụ
                        </Typography>
                        {selfEvalProgress.total > 0 && (
                          <Chip
                            label={`${selfEvalProgress.percentage}%`}
                            size="small"
                            color={
                              selfEvalProgress.percentage === 100
                                ? "success"
                                : "warning"
                            }
                            sx={{ mt: 1, fontWeight: 600 }}
                          />
                        )}
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>

                {/* Đánh giá nhân viên (Manager only) */}
                {isManager && (
                  <Grid item xs={12}>
                    <Card
                      sx={{
                        border: 2,
                        borderColor: "warning.main",
                        bgcolor: "warning.lighter",
                        transition: "all 0.2s",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: 4,
                        },
                      }}
                    >
                      <CardActionArea
                        onClick={() =>
                          navigate("/quanlycongviec/kpi/danh-gia-nhan-vien")
                        }
                        sx={{ p: 2 }}
                      >
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <People
                            sx={{ fontSize: 48, color: "warning.main" }}
                          />
                          <Box flex={1}>
                            <Typography
                              variant="h6"
                              gutterBottom
                              sx={{ mb: 0.5 }}
                            >
                              👥 Đánh giá nhân viên
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                              sx={{ mb: 1 }}
                            >
                              Chấm điểm KPI cho nhân viên dưới quyền
                            </Typography>
                            <Stack direction="row" spacing={1}>
                              <Chip
                                label="Xem danh sách →"
                                size="small"
                                sx={{
                                  bgcolor: "warning.main",
                                  color: "white",
                                  fontWeight: 600,
                                }}
                              />
                            </Stack>
                          </Box>
                        </Stack>
                      </CardActionArea>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Box>

          {/* Info Section */}
          <Box
            sx={{
              bgcolor: "background.paper",
              py: 2,
            }}
          >
            <Box
              sx={{
                px: 2,
                maxWidth: { xs: "100%", md: "lg" },
                mx: { xs: 0, md: "auto" },
              }}
            >
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                📋 Thông tin chu kỳ
              </Typography>
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Chu kỳ hiện tại
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {selectedChuKy?.TenChuKy || "Chưa có chu kỳ"}
                  </Typography>
                </Stack>
                {selectedChuKy && (
                  <>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Thời gian
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {dayjs(selectedChuKy.TuNgay).format("DD/MM/YYYY")} -{" "}
                        {dayjs(selectedChuKy.DenNgay).format("DD/MM/YYYY")}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Trạng thái
                      </Typography>
                      {currentKPI?.TrangThai === "DA_DUYET" ? (
                        <Chip label="Đã duyệt" size="small" color="success" />
                      ) : (
                        <Chip label="Chưa duyệt" size="small" color="warning" />
                      )}
                    </Stack>
                  </>
                )}
              </Stack>
            </Box>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}

export default KPIHubPage;
