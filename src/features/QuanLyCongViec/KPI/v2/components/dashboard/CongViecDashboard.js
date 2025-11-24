import React, { useEffect } from "react";
import { Box, Alert, Grid, Skeleton, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import OverviewCards from "./OverviewCards";
import StatusChart from "./StatusChart";
import TaskListMini from "./TaskListMini";
import InsightsPanel from "./InsightsPanel";
import { fetchCongViecDashboard } from "../../../kpiSlice";

/**
 * CongViecDashboard - Main dashboard container with data fetching
 * @param {string} nhiemVuThuongQuyID - Routine duty ID
 * @param {string} nhanVienID - Employee ID
 * @param {string} chuKyDanhGiaID - Evaluation cycle ID
 * @param {boolean} open - Whether dashboard is visible (for lazy loading)
 * @param {Function} onViewTask - Callback when viewing task detail
 */
function CongViecDashboard({
  nhiemVuThuongQuyID,
  nhanVienID,
  chuKyDanhGiaID,
  open = false,
  onViewTask,
}) {
  const dispatch = useDispatch();

  // Get dashboard data from Redux, keyed by nhiemVuID
  const dashboardKey = `${nhiemVuThuongQuyID}_${chuKyDanhGiaID}`;
  const dashboardState = useSelector(
    (state) => state.kpi.congViecDashboard?.[dashboardKey]
  );

  const { data, isLoading, error } = dashboardState || {
    data: null,
    isLoading: false,
    error: null,
  };

  // Lazy loading: only fetch when dashboard is opened
  // ✅ FIX: Add error check to prevent infinite loop
  useEffect(() => {
    if (open && !data && !isLoading && !error) {
      dispatch(
        fetchCongViecDashboard({
          nhiemVuThuongQuyID,
          nhanVienID,
          chuKyDanhGiaID,
        })
      );
    }
  }, [
    open,
    data,
    isLoading,
    error,
    dispatch,
    nhiemVuThuongQuyID,
    nhanVienID,
    chuKyDanhGiaID,
  ]);

  // Loading state with skeleton loaders
  // ✅ FIX: Only show skeleton when loading, not when no data (could be error state)
  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2} mb={2}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Grid item xs={6} sm={3} key={i}>
              <Skeleton variant="rectangular" height={100} />
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <Skeleton variant="rectangular" height={280} />
          </Grid>
          <Grid item xs={12} md={7}>
            <Skeleton variant="rectangular" height={280} />
          </Grid>
        </Grid>
        <Box mt={2}>
          <Skeleton variant="rectangular" height={60} />
        </Box>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          <strong>Lỗi tải dữ liệu:</strong> {error}
        </Alert>
      </Box>
    );
  }

  // ✅ FIX: Check if data exists before destructuring
  if (!data) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Không có dữ liệu
        </Typography>
      </Box>
    );
  }

  const {
    summary = {},
    timeMetrics = {},
    statusDistribution = [],
    priorityDistribution = [],
    collaboration = {},
    tasks = [],
  } = data;

  return (
    <Box sx={{ p: 2 }}>
      {/* Overview Cards */}
      <Box mb={2}>
        <OverviewCards summary={summary} collaboration={collaboration} />
      </Box>

      {/* Status Chart + Task List */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={5}>
          <StatusChart statusDistribution={statusDistribution} />
        </Grid>
        <Grid item xs={12} md={7}>
          <TaskListMini tasks={tasks} onViewTask={onViewTask} />
        </Grid>
      </Grid>

      {/* Insights Panel */}
      <InsightsPanel
        timeMetrics={timeMetrics}
        collaboration={collaboration}
        priorityDistribution={priorityDistribution}
      />
    </Box>
  );
}

export default CongViecDashboard;
