import React, { useEffect } from "react";
import { Box, Alert, Grid, Skeleton, Typography, Stack } from "@mui/material";
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
 * @param {boolean} isMobile - Whether to use mobile-optimized layout
 */
function CongViecDashboard({
  nhiemVuThuongQuyID,
  nhanVienID,
  chuKyDanhGiaID,
  open = false,
  onViewTask,
  isMobile = false,
}) {
  const dispatch = useDispatch();

  // Get dashboard data from Redux, keyed by nhiemVuID
  const dashboardKey = `${nhiemVuThuongQuyID}_${chuKyDanhGiaID}`;
  const dashboardState = useSelector(
    (state) => state.kpi.congViecDashboard?.[dashboardKey],
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
        }),
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
      <Box sx={{ p: isMobile ? 0.5 : 2 }}>
        <Grid container spacing={isMobile ? 1 : 2} mb={isMobile ? 1 : 2}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={6} sm={3} key={i}>
              <Skeleton variant="rectangular" height={isMobile ? 60 : 100} />
            </Grid>
          ))}
        </Grid>
        <Stack spacing={isMobile ? 1 : 2}>
          <Skeleton variant="rectangular" height={isMobile ? 150 : 280} />
          <Skeleton variant="rectangular" height={isMobile ? 150 : 280} />
        </Stack>
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
      <Box sx={{ p: isMobile ? 1 : 2 }}>
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
    <Box sx={{ p: isMobile ? { px: 0.5, py: 0 } : 2 }}>
      {/* Overview Cards */}
      <Box mb={isMobile ? 1 : 2}>
        <OverviewCards
          summary={summary}
          collaboration={collaboration}
          compact={isMobile}
        />
      </Box>

      {/* Status Chart + Task List - Stack on mobile */}
      {isMobile ? (
        <Stack spacing={1}>
          <StatusChart statusDistribution={statusDistribution} compact />
          <TaskListMini tasks={tasks} onViewTask={onViewTask} compact />
          <InsightsPanel
            timeMetrics={timeMetrics}
            collaboration={collaboration}
            priorityDistribution={priorityDistribution}
            compact
          />
        </Stack>
      ) : (
        <>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} md={5}>
              <StatusChart statusDistribution={statusDistribution} />
            </Grid>
            <Grid item xs={12} md={7}>
              <TaskListMini tasks={tasks} onViewTask={onViewTask} />
            </Grid>
          </Grid>
          <InsightsPanel
            timeMetrics={timeMetrics}
            collaboration={collaboration}
            priorityDistribution={priorityDistribution}
          />
        </>
      )}
    </Box>
  );
}

export default CongViecDashboard;
