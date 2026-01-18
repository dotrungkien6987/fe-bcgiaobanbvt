/**
 * YeuCauDashboardPage - Dashboard tổng quan Yêu cầu
 *
 * Native Mobile-First Design với:
 * - Date range filter (preset chips)
 * - Badge counts nâng cao (3 sections: Tôi gửi, Tôi xử lý, Điều phối)
 * - Status distribution (SegmentedControl + horizontal bars)
 * - Recent activities timeline
 * - Quick actions grid
 * - Pull-to-refresh
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, Stack, IconButton, Chip } from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Send as SendIcon,
  Inbox as InboxIcon,
  AccountTree as CoordinateIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { useYeuCauRoles } from "features/QuanLyCongViec/Ticket/hooks/useYeuCauRoles";
import {
  fetchBadgeCountsNangCao,
  selectBadgeCountsNangCao,
  selectBadgeCountsNangCaoLoading,
} from "features/QuanLyCongViec/Ticket/yeuCauSlice";
import {
  PullToRefreshWrapper,
  YeuCauFormDialog,
} from "features/QuanLyCongViec/Ticket/components";
import DateRangePresets from "features/QuanLyCongViec/Ticket/components/DateRangePresets";
import DashboardMetricSection from "features/QuanLyCongViec/Ticket/components/DashboardMetricSection";
import StatusDistributionCard from "features/QuanLyCongViec/Ticket/components/StatusDistributionCard";
import RecentActivitiesCard from "features/QuanLyCongViec/Ticket/components/RecentActivitiesCard";
import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import apiService from "app/apiService";

/**
 * Main Component
 */
export default function YeuCauDashboardPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const roles = useYeuCauRoles();

  // Date range state
  const [datePreset, setDatePreset] = useState("30d");
  const [dateRange, setDateRange] = useState({
    tuNgay: dayjs().subtract(30, "day").format("YYYY-MM-DD"),
    denNgay: dayjs().format("YYYY-MM-DD"),
  });

  // ✅ NEW: State for Create Dialog
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [khoaOptions, setKhoaOptions] = useState([]);

  // Load khoa có danh mục yêu cầu
  useEffect(() => {
    const loadKhoa = async () => {
      try {
        const response = await apiService.get(
          "/workmanagement/danh-muc-yeu-cau/khoa-co-danh-muc"
        );
        setKhoaOptions(response.data.data || []);
      } catch (error) {
        console.error("Lỗi load khoa:", error);
      }
    };
    loadKhoa();
  }, []);

  // ✅ NEW: Handlers for metric clicks
  const handleMetricClick = useCallback(
    (metricKey, section) => {
      if (section === "toiGui") {
        if (metricKey === "total") {
          navigate("/quanlycongviec/yeucau/toi-gui");
        } else {
          navigate(`/quanlycongviec/yeucau/toi-gui?tab=${metricKey}`);
        }
      } else if (section === "xuLy") {
        if (metricKey === "total") {
          navigate("/quanlycongviec/yeucau/xu-ly");
        } else {
          const tabMap = {
            canTiepNhan: "cho-tiep-nhan",
            dangXuLy: "dang-xu-ly",
            choXacNhan: "cho-xac-nhan",
          };
          navigate(`/quanlycongviec/yeucau/xu-ly?tab=${tabMap[metricKey]}`);
        }
      } else if (section === "dieuPhoi") {
        navigate("/quanlycongviec/yeucau/dieu-phoi");
      }
    },
    [navigate]
  );

  // Get badge counts from Redux
  const badgeCounts = useSelector(selectBadgeCountsNangCao);
  const badgeCountsLoading = useSelector(selectBadgeCountsNangCaoLoading);

  // Load badge counts on mount and date change
  useEffect(() => {
    const { tuNgay, denNgay } = dateRange;
    dispatch(fetchBadgeCountsNangCao({ tuNgay, denNgay }));
  }, [dispatch, dateRange]);

  // Handle date preset change
  const handleDatePresetChange = useCallback((preset, dates) => {
    setDatePreset(preset);
    setDateRange(dates);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    await dispatch(fetchBadgeCountsNangCao(dateRange));
  }, [dispatch, dateRange]);

  // Handle navigation
  const handleNavigate = useCallback(
    (path) => {
      navigate(path);
    },
    [navigate]
  );

  // Handle activity click
  const handleActivityClick = useCallback(
    (activity) => {
      if (activity.YeuCauID?._id) {
        navigate(`/quanlycongviec/yeucau/${activity.YeuCauID._id}`);
      }
    },
    [navigate]
  );

  // Prepare metrics for sections
  const toiGuiMetrics = badgeCounts?.toiGui
    ? [
        {
          key: "choTiepNhan",
          label: "Chờ tiếp nhận",
          value: badgeCounts.toiGui.choTiepNhan,
          color: "warning",
          urgent: badgeCounts.toiGui.choTiepNhan > 0,
          onClick: () => handleMetricClick("choTiepNhan", "toiGui"),
        },
        {
          key: "dangXuLy",
          label: "Đang xử lý",
          value: badgeCounts.toiGui.dangXuLy,
          color: "info",
          onClick: () => handleMetricClick("dangXuLy", "toiGui"),
        },
        {
          key: "daHoanThanh",
          label: "Chờ đánh giá",
          value: badgeCounts.toiGui.daHoanThanh,
          color: "success",
          urgent: badgeCounts.toiGui.daHoanThanh > 0,
          onClick: () => handleMetricClick("daHoanThanh", "toiGui"),
        },
        {
          key: "daDong",
          label: "Đã đóng",
          value: badgeCounts.toiGui.daDong,
          color: "default",
          onClick: () => handleMetricClick("daDong", "toiGui"),
        },
        {
          key: "tuChoi",
          label: "Từ chối",
          value: badgeCounts.toiGui.tuChoi,
          color: "error",
          onClick: () => handleMetricClick("tuChoi", "toiGui"),
        },
        {
          key: "total",
          label: "Tổng cộng",
          value: badgeCounts.toiGui.total,
          color: "primary",
          onClick: () => handleMetricClick("total", "toiGui"),
        },
      ]
    : [];

  const xuLyMetrics = badgeCounts?.xuLy
    ? [
        {
          key: "canTiepNhan",
          label: "Chờ tiếp nhận",
          value: badgeCounts.xuLy.canTiepNhan,
          color: "warning",
          urgent: badgeCounts.xuLy.canTiepNhan > 0,
          onClick: () => handleMetricClick("canTiepNhan", "xuLy"),
        },
        {
          key: "dangXuLy",
          label: "Đang xử lý",
          value: badgeCounts.xuLy.dangXuLy,
          color: "info",
          onClick: () => handleMetricClick("dangXuLy", "xuLy"),
        },
        {
          key: "choXacNhan",
          label: "Chờ đánh giá",
          value: badgeCounts.xuLy.choXacNhan,
          color: "success",
          urgent: badgeCounts.xuLy.choXacNhan > 0,
          onClick: () => handleMetricClick("choXacNhan", "xuLy"),
        },
        {
          key: "total",
          label: "Tổng cộng",
          value: badgeCounts.xuLy.total,
          color: "primary",
          onClick: () => handleMetricClick("total", "xuLy"),
        },
      ]
    : [];

  const dieuPhoiMetrics =
    roles.isNguoiDieuPhoi && badgeCounts?.dieuPhoi
      ? [
          {
            key: "moiDen",
            label: "Mới đến",
            value: badgeCounts.dieuPhoi.moiDen,
            color: "error",
            urgent: badgeCounts.dieuPhoi.moiDen > 0,
          },
          {
            key: "daDieuPhoi",
            label: "Đã điều phối",
            value: badgeCounts.dieuPhoi.daDieuPhoi,
            color: "success",
          },
          {
            key: "total",
            label: "Tổng cộng",
            value: badgeCounts.dieuPhoi.total,
            color: "default",
          },
        ]
      : [];

  return (
    <>
      <PullToRefreshWrapper onRefresh={handleRefresh}>
        <Box
          sx={{
            minHeight: "100vh",
            bgcolor: "secondary.lighter",
            pb: 10, // Bottom padding for mobile nav
          }}
        >
          {/* Header - Edge to edge on mobile */}
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
                maxWidth: "lg",
                mx: "auto",
                px: { xs: 0, md: 3 },
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ py: 2, px: { xs: 2, md: 0 } }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <IconButton
                    onClick={() => navigate(-1)}
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
                    📋 Dashboard Yêu cầu
                  </Typography>
                </Stack>
                <IconButton
                  onClick={handleRefresh}
                  size="small"
                  disabled={badgeCountsLoading}
                >
                  <RefreshIcon />
                </IconButton>
              </Stack>
            </Box>
          </Box>

          {/* Content - No Container for edge-to-edge mobile */}
          <Box>
            {/* Date Range Filter - Full width section */}
            <Box
              sx={{
                bgcolor: "background.paper",
                py: 2,
                mb: 1,
                borderTop: { xs: "1px solid", md: "none" },
                borderBottom: { xs: "1px solid", md: "none" },
                borderColor: "divider",
              }}
            >
              <Box sx={{ px: { xs: 0, md: 3 }, maxWidth: "lg", mx: "auto" }}>
                <DateRangePresets
                  value={datePreset}
                  onChange={handleDatePresetChange}
                />
              </Box>
            </Box>

            {/* Quick Navigation Chips - Full width with gradient fade */}
            <Box
              sx={{
                bgcolor: "background.paper",
                py: 2,
                mb: 1,
                borderTop: { xs: "1px solid", md: "none" },
                borderBottom: { xs: "1px solid", md: "none" },
                borderColor: "divider",
              }}
            >
              <Box
                sx={{ px: { xs: 0, md: 3 }, maxWidth: "lg", mx: "auto", mb: 1 }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", px: { xs: 2, md: 0 } }}
                >
                  📍 Điều hướng nhanh
                </Typography>
              </Box>
              {/* Chips scroll with gradient fade */}
              <Box
                sx={{
                  position: "relative",
                  maxWidth: { xs: "100%", md: "lg" },
                  mx: { md: "auto" },
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    overflowX: "auto",
                    pl: { xs: 0, md: 3 },
                    pr: { xs: 0, md: 3 },
                    pb: 1,
                    "&::-webkit-scrollbar": {
                      height: "6px",
                    },
                    "&::-webkit-scrollbar-track": {
                      bgcolor: "transparent",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      bgcolor: "divider",
                      borderRadius: 3,
                    },
                  }}
                >
                  <Chip
                    label={`📤 Tôi gửi${
                      badgeCounts?.toiGui?.total
                        ? ` (${badgeCounts.toiGui.total})`
                        : ""
                    }`}
                    onClick={() =>
                      handleNavigate("/quanlycongviec/yeucau/toi-gui")
                    }
                    color="primary"
                    variant="outlined"
                    clickable
                    sx={{
                      fontWeight: 500,
                      "&:hover": {
                        bgcolor: "primary.light",
                        color: "primary.contrastText",
                      },
                    }}
                  />
                  <Chip
                    label={`📥 Tôi xử lý${
                      badgeCounts?.xuLy?.total
                        ? ` (${badgeCounts.xuLy.total})`
                        : ""
                    }`}
                    onClick={() =>
                      handleNavigate(
                        "/quanlycongviec/yeucau/xu-ly?tab=cho-tiep-nhan"
                      )
                    }
                    color="info"
                    variant="outlined"
                    clickable
                    sx={{
                      fontWeight: 500,
                      "&:hover": {
                        bgcolor: "info.light",
                        color: "info.contrastText",
                      },
                    }}
                  />
                  {roles.isNguoiDieuPhoi && (
                    <Chip
                      label={`📋 Điều phối${
                        badgeCounts?.dieuPhoi?.total
                          ? ` (${badgeCounts.dieuPhoi.total})`
                          : ""
                      }`}
                      onClick={() =>
                        handleNavigate("/quanlycongviec/yeucau/dieu-phoi")
                      }
                      color="warning"
                      variant="outlined"
                      clickable
                      sx={{
                        fontWeight: 500,
                        "&:hover": {
                          bgcolor: "warning.light",
                          color: "warning.contrastText",
                        },
                      }}
                    />
                  )}
                </Stack>
                {/* Gradient fade overlay at right edge (mobile only) */}
                <Box
                  sx={{
                    display: { xs: "block", md: "none" },
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: 40,
                    height: "calc(100% - 6px)",
                    background:
                      "linear-gradient(to right, transparent, rgba(255,255,255,0.9))",
                    pointerEvents: "none",
                  }}
                />
              </Box>
            </Box>

            {/* Metrics Sections Container */}
            <Box sx={{ maxWidth: "lg", mx: "auto" }}>
              {/* Section 1: Yêu cầu tôi gửi */}
              {toiGuiMetrics.length > 0 && (
                <Box
                  sx={{
                    bgcolor: "background.paper",
                    mb: 1,
                    py: 2,
                    borderTop: { xs: "1px solid", md: "none" },
                    borderBottom: { xs: "1px solid", md: "none" },
                    borderColor: "divider",
                  }}
                >
                  <Box
                    sx={{ px: { xs: 0, md: 3 }, maxWidth: "lg", mx: "auto" }}
                  >
                    <DashboardMetricSection
                      title="📤 Yêu cầu tôi gửi"
                      icon={<SendIcon />}
                      metrics={toiGuiMetrics}
                      onNavigate={() =>
                        handleNavigate("/quanlycongviec/yeucau/toi-gui")
                      }
                      loading={badgeCountsLoading}
                    />
                  </Box>
                </Box>
              )}

              {/* Section 2: Yêu cầu tôi xử lý */}
              {xuLyMetrics.length > 0 && (
                <Box
                  sx={{
                    bgcolor: "background.paper",
                    mb: 1,
                    py: 2,
                    borderTop: { xs: "1px solid", md: "none" },
                    borderBottom: { xs: "1px solid", md: "none" },
                    borderColor: "divider",
                  }}
                >
                  <Box
                    sx={{ px: { xs: 0, md: 3 }, maxWidth: "lg", mx: "auto" }}
                  >
                    <DashboardMetricSection
                      title="📥 Yêu cầu tôi xử lý"
                      icon={<InboxIcon />}
                      metrics={xuLyMetrics}
                      onNavigate={() =>
                        handleNavigate(
                          "/quanlycongviec/yeucau/xu-ly?tab=cho-tiep-nhan"
                        )
                      }
                      loading={badgeCountsLoading}
                    />
                  </Box>
                </Box>
              )}

              {/* Section 3: Điều phối (conditional) */}
              {roles.isNguoiDieuPhoi && dieuPhoiMetrics.length > 0 && (
                <Box
                  sx={{
                    bgcolor: "background.paper",
                    mb: 1,
                    py: 2,
                    borderTop: { xs: "1px solid", md: "none" },
                    borderBottom: { xs: "1px solid", md: "none" },
                    borderColor: "divider",
                  }}
                >
                  <Box
                    sx={{ px: { xs: 0, md: 3 }, maxWidth: "lg", mx: "auto" }}
                  >
                    <DashboardMetricSection
                      title="📋 Điều phối"
                      icon={<CoordinateIcon />}
                      metrics={dieuPhoiMetrics}
                      onNavigate={() =>
                        handleNavigate("/quanlycongviec/yeucau/dieu-phoi")
                      }
                      loading={badgeCountsLoading}
                    />
                  </Box>
                </Box>
              )}
            </Box>

            {/* Status Distribution - Full width section */}
            <Box
              sx={{
                bgcolor: "background.paper",
                py: 2,
                mb: 1,
                borderTop: { xs: "1px solid", md: "none" },
                borderBottom: { xs: "1px solid", md: "none" },
                borderColor: "divider",
              }}
            >
              <Box sx={{ px: { xs: 0, md: 3 }, maxWidth: "lg", mx: "auto" }}>
                <StatusDistributionCard
                  tuNgay={dateRange.tuNgay}
                  denNgay={dateRange.denNgay}
                  onBarClick={(status) => {
                    // Navigate to list with status filter
                    navigate(`/quanlycongviec/yeucau/xu-ly?status=${status}`);
                  }}
                />
              </Box>
            </Box>

            {/* Recent Activities - Full width section */}
            <Box
              sx={{
                bgcolor: "background.paper",
                py: 2,
                borderTop: { xs: "1px solid", md: "none" },
                borderBottom: { xs: "1px solid", md: "none" },
                borderColor: "divider",
              }}
            >
              <Box sx={{ px: { xs: 0, md: 3 }, maxWidth: "lg", mx: "auto" }}>
                <RecentActivitiesCard
                  limit={5}
                  tuNgay={dateRange.tuNgay}
                  denNgay={dateRange.denNgay}
                  onActivityClick={handleActivityClick}
                  onViewAll={() =>
                    navigate("/quanlycongviec/yeucau/xu-ly?tab=cho-tiep-nhan")
                  }
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </PullToRefreshWrapper>

      {/* ✅ NEW: Floating Action Button */}
      <Fab
        color="primary"
        aria-label="Tạo yêu cầu mới"
        onClick={() => setOpenCreateDialog(true)}
        sx={{
          position: "fixed",
          bottom: { xs: 80, sm: 24 }, // 80px on mobile to clear bottom nav
          right: { xs: 16, sm: 24 },
          zIndex: 1200, // Above bottom nav
        }}
      >
        <AddIcon />
      </Fab>

      {/* ✅ Create YeuCau Dialog */}
      <YeuCauFormDialog
        open={openCreateDialog}
        onClose={() => {
          setOpenCreateDialog(false);
          // Refresh dashboard data after creating
          handleRefresh();
        }}
        yeuCau={null}
        khoaOptions={khoaOptions}
        defaultKhoaXuLyID=""
      />
    </>
  );
}
