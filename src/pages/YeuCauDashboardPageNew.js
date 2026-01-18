/**
 * YeuCauDashboardPage - Dashboard tổng quan Yêu cầu
 *
 * Features:
 * - MetricCardsGrid: 4 metric cards với trend
 * - QuickActionsGrid: 4 quick actions với badge counts
 * - StatusDistributionChart: Bar chart phân bố theo status
 * - RecentActivityTimeline: Timeline 10 activities gần nhất
 * - Native mobile-first design
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  IconButton,
  Breadcrumbs,
  Link,
} from "@mui/material";
import { Home as HomeIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { useYeuCauRoles } from "features/QuanLyCongViec/Ticket/hooks/useYeuCauRoles";
import MetricCardsGrid from "features/QuanLyCongViec/Ticket/components/MetricCardsGrid";
import QuickActionsGrid from "features/QuanLyCongViec/Ticket/components/QuickActionsGrid";
import StatusDistributionChart from "features/QuanLyCongViec/Ticket/components/StatusDistributionChart";
import RecentActivityTimeline from "features/QuanLyCongViec/Ticket/components/RecentActivityTimeline";

/**
 * Main Component
 */
export default function YeuCauDashboardPage() {
  const navigate = useNavigate();
  const roles = useYeuCauRoles();

  // Mock data - TODO: Replace with real API calls
  const dashboardData = {
    metrics: {
      sent: 12,
      sentTrend: "up",
      sentTrendValue: 15,
      received: 8,
      receivedTrend: "down",
      receivedTrendValue: 5,
      overdue: 3,
      overdueTrend: "up",
      overdueTrendValue: 50,
      avgRating: 4.5,
      ratingTrend: "up",
      ratingTrendValue: 10,
    },
    counts: {
      needAction: 5,
      needCoordinate: 2,
    },
    statusDistribution: [
      { status: "MOI_TAO", count: 5, percentage: 20 },
      { status: "DANG_XU_LY", count: 8, percentage: 32 },
      { status: "CHO_DUYET", count: 3, percentage: 12 },
      { status: "HOAN_THANH", count: 7, percentage: 28 },
      { status: "DA_DONG", count: 2, percentage: 8 },
    ],
    recentActivities: [
      {
        _id: "1",
        actionType: "created",
        actorName: "Đỗ Trung Kiên",
        yeuCauTitle: "Yêu cầu sửa chữa thiết bị phòng mổ",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
      },
      {
        _id: "2",
        actionType: "completed",
        actorName: "Nguyễn Văn A",
        yeuCauTitle: "Yêu cầu bổ sung vật tư y tế",
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5h ago
      },
      {
        _id: "3",
        actionType: "received",
        actorName: "Trần Thị B",
        yeuCauTitle: "Yêu cầu kiểm tra hệ thống điện",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
    ],
  };

  const handleRefresh = () => {
    // TODO: Reload data from APIs
    console.log("Refresh dashboard data");
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleStatusClick = (status) => {
    // Navigate to list filtered by status
    navigate(`/quanlycongviec/yeucau/toi-xu-ly?status=${status}`);
  };

  const handleActivityClick = (activity) => {
    // Navigate to detail page
    if (activity.yeuCauId) {
      navigate(`/quanlycongviec/yeucau/${activity.yeuCauId}`);
    }
  };

  return (
    <Box sx={{ py: 3, px: { xs: 1, sm: 2, md: 3 }, pb: 10 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          underline="hover"
          color="inherit"
          href="/"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Trang chủ
        </Link>
        <Link underline="hover" color="inherit" href="/quan-ly-cong-viec">
          Quản lý công việc
        </Link>
        <Typography color="text.primary">Dashboard Yêu cầu</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            📋 Dashboard Yêu cầu
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tổng quan yêu cầu của bạn
          </Typography>
        </Box>
        <IconButton onClick={handleRefresh} size="large">
          <RefreshIcon />
        </IconButton>
      </Stack>

      {/* Metric Cards */}
      <Box mb={3}>
        <MetricCardsGrid
          data={dashboardData.metrics}
          loading={false}
          onNavigate={handleNavigate}
        />
      </Box>

      {/* Quick Actions */}
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          ⚡ Thao tác nhanh
        </Typography>
        <QuickActionsGrid
          counts={dashboardData.counts}
          roles={roles}
          onNavigate={handleNavigate}
        />
      </Box>

      {/* Status Distribution Chart */}
      <Box mb={3}>
        <StatusDistributionChart
          data={dashboardData.statusDistribution}
          loading={false}
          onStatusClick={handleStatusClick}
        />
      </Box>

      {/* Recent Activities */}
      <Box>
        <RecentActivityTimeline
          activities={dashboardData.recentActivities}
          loading={false}
          onActivityClick={handleActivityClick}
        />
      </Box>
    </Box>
  );
}
