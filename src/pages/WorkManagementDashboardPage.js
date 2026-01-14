import React, { useEffect } from "react";
import { Container, Grid, Box, Typography, Paper, Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllDashboardSummaries } from "features/WorkDashboard/workDashboardSlice";
import {
  CongViecSummaryCard,
  YeuCauSummaryCard,
  KPISummaryCard,
} from "features/WorkDashboard/components";
import { Refresh as RefreshIcon } from "@mui/icons-material";

/**
 * WorkManagementDashboardPage - Unified dashboard for work management
 * Displays summary cards for Công Việc, Yêu Cầu, and KPI
 */
function WorkManagementDashboardPage() {
  const dispatch = useDispatch();

  // Get user data
  const { user } = useSelector((state) => state.user);
  const nhanVienId = user?.NhanVienID;

  // Get dashboard data
  const {
    congViecSummary,
    yeuCauSummary,
    kpiSummary,
    loadingCongViec,
    loadingYeuCau,
    loadingKPI,
    lastFetchTime,
  } = useSelector((state) => state.workDashboard);

  // Fetch data on mount
  useEffect(() => {
    if (nhanVienId) {
      dispatch(fetchAllDashboardSummaries(nhanVienId));
    }
  }, [dispatch, nhanVienId]);

  const handleRefresh = () => {
    if (nhanVienId) {
      dispatch(fetchAllDashboardSummaries(nhanVienId));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Dashboard Quản Lý Công Việc
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tổng quan về công việc, yêu cầu và KPI của bạn
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loadingCongViec || loadingYeuCau || loadingKPI}
        >
          Làm mới
        </Button>
      </Box>

      {/* Debug Info */}
      {process.env.NODE_ENV === "development" && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: "grey.100" }}>
          <Typography variant="caption" display="block">
            <strong>Debug Info:</strong>
          </Typography>
          <Typography variant="caption" display="block">
            NhanVienID: {nhanVienId || "N/A"}
          </Typography>
          <Typography variant="caption" display="block">
            Last Fetch:{" "}
            {lastFetchTime
              ? new Date(lastFetchTime).toLocaleTimeString("vi-VN")
              : "N/A"}
          </Typography>
          <Typography variant="caption" display="block">
            Loading: CongViec={loadingCongViec}, YeuCau={loadingYeuCau}, KPI=
            {loadingKPI}
          </Typography>
        </Paper>
      )}

      {/* Summary Cards - Compact Mode */}
      <Box mb={4}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Tóm tắt (Compact Mode)
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <CongViecSummaryCard variant="compact" loading={loadingCongViec} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <YeuCauSummaryCard variant="compact" loading={loadingYeuCau} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <KPISummaryCard variant="compact" loading={loadingKPI} />
          </Grid>
        </Grid>
      </Box>

      {/* Summary Cards - Detailed Mode */}
      <Box>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Chi tiết (Detailed Mode)
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <CongViecSummaryCard variant="detailed" loading={loadingCongViec} />
          </Grid>
          <Grid item xs={12} md={4}>
            <YeuCauSummaryCard variant="detailed" loading={loadingYeuCau} />
          </Grid>
          <Grid item xs={12} md={4}>
            <KPISummaryCard variant="detailed" loading={loadingKPI} />
          </Grid>
        </Grid>
      </Box>

      {/* Raw Data (Development Only) */}
      {process.env.NODE_ENV === "development" && (
        <Paper sx={{ p: 2, mt: 3, bgcolor: "grey.100" }}>
          <Typography variant="subtitle2" fontWeight={600} mb={1}>
            Raw Data:
          </Typography>
          <pre style={{ fontSize: 11, overflow: "auto" }}>
            {JSON.stringify(
              { congViecSummary, yeuCauSummary, kpiSummary },
              null,
              2
            )}
          </pre>
        </Paper>
      )}
    </Container>
  );
}

export default WorkManagementDashboardPage;
