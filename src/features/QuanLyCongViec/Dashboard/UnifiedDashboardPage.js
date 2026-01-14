/**
 * UnifiedDashboardPage - Trang tổng quan Quản lý công việc
 *
 * Phase 2 Task 2.1 - Dashboard Overview
 *
 * Features:
 * - 3 Summary cards: Công việc, KPI, Yêu cầu
 * - Quick actions
 * - Mobile-optimized layout
 * - Click card to drill down to detail pages
 */

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Stack,
  Chip,
  Divider,
  Skeleton,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Task,
  MedalStar,
  MessageQuestion,
  ArrowRight,
  TickCircle,
  CloseCircle,
  Timer1,
  Edit,
  Refresh,
} from "iconsax-react";
import useMobileLayout from "hooks/useMobileLayout";
import { WorkRoutes } from "utils/navigationHelper";
import useAuth from "hooks/useAuth";
import { fetchAllDashboardSummaries } from "features/WorkDashboard/workDashboardSlice";
import { FABMenuButton } from "features/WorkDashboard/components";

/**
 * Dashboard Summary Card Component
 */
function SummaryCard({
  title,
  icon: Icon,
  stats,
  color = "primary",
  onClick,
  isLoading = false,
}) {
  const theme = useTheme();
  // const { isMobile } = useMobileLayout(); // TODO: Use for responsive adjustments

  const colorValue = theme.palette[color]?.main || theme.palette.primary.main;

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="rectangular" height={150} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: "100%",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <CardActionArea onClick={onClick} sx={{ height: "100%" }}>
        <CardContent>
          {/* Header */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: alpha(colorValue, 0.1),
                }}
              >
                <Icon size={24} color={colorValue} variant="Bold" />
              </Box>
              <Typography variant="h6" fontWeight={600}>
                {title}
              </Typography>
            </Stack>
            <ArrowRight size={20} color={theme.palette.text.secondary} />
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {/* Stats Grid */}
          <Grid container spacing={1.5}>
            {stats.map((stat, index) => (
              <Grid item xs={6} key={index}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: alpha(stat.color || colorValue, 0.08),
                    border: `1px solid ${alpha(stat.color || colorValue, 0.2)}`,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    mb={0.5}
                  >
                    {stat.icon && (
                      <stat.icon size={16} color={stat.color || colorValue} />
                    )}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={500}
                    >
                      {stat.label}
                    </Typography>
                  </Stack>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color={stat.color || colorValue}
                  >
                    {stat.value}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Badge/Status (optional) */}
          {stats.some((s) => s.badge) && (
            <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
              {stats
                .filter((s) => s.badge)
                .map((stat, idx) => (
                  <Chip
                    key={idx}
                    label={stat.badge}
                    size="small"
                    color={stat.badgeColor || "default"}
                    sx={{ fontWeight: 500 }}
                  />
                ))}
            </Stack>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

/**
 * Main Dashboard Component
 */
function UnifiedDashboardPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { isMobile } = useMobileLayout();

  // Redux state - use new workDashboard slice
  const {
    congViecSummary,
    yeuCauSummary,
    kpiSummary,
    isLoading,
    lastFetchTime,
  } = useSelector(
    (state) =>
      state.workDashboard || {
        congViecSummary: { total: 0, urgent: 0 },
        yeuCauSummary: { sent: 0, needAction: 0, inProgress: 0, completed: 0 },
        kpiSummary: {
          score: null,
          status: "CHUA_DUYET",
          cycleName: null,
          isDone: false,
          hasEvaluation: false,
        },
        isLoading: false,
        lastFetchTime: null,
      }
  );

  // Fetch dashboard data
  useEffect(() => {
    if (user?.NhanVienID) {
      dispatch(fetchAllDashboardSummaries(user.NhanVienID));
    }
  }, [dispatch, user?.NhanVienID]);

  // Handle refresh
  const handleRefresh = () => {
    if (user?.NhanVienID) {
      dispatch(fetchAllDashboardSummaries(user.NhanVienID));
    }
  };

  // Build stats from Redux data
  const congViecStats = [
    {
      label: "Tổng công việc",
      value: congViecSummary?.total || 0,
      icon: Task,
      color: theme.palette.primary.main,
    },
    {
      label: "Cần xử lý gấp",
      value: congViecSummary?.urgent || 0,
      icon: Timer1,
      color: theme.palette.error.main,
    },
  ];

  const kpiStats = [
    {
      label: kpiSummary?.cycleName || "Chưa có chu kỳ",
      value: kpiSummary?.score ? `${kpiSummary.score.toFixed(1)} điểm` : "N/A",
      icon: MedalStar,
      color:
        kpiSummary?.score >= 90
          ? theme.palette.success.main
          : kpiSummary?.score >= 70
          ? theme.palette.warning.main
          : theme.palette.error.main,
    },
    {
      label: "Trạng thái",
      value:
        kpiSummary?.status === "DA_DUYET"
          ? "Đã duyệt"
          : kpiSummary?.status === "CHUA_DUYET"
          ? "Chưa duyệt"
          : "N/A",
      icon: kpiSummary?.status === "DA_DUYET" ? TickCircle : Timer1,
      color:
        kpiSummary?.status === "DA_DUYET"
          ? theme.palette.success.main
          : theme.palette.warning.main,
    },
  ];

  const yeuCauStats = [
    {
      label: "Tôi gửi",
      value: yeuCauSummary?.sent || 0,
      icon: MessageQuestion,
      color: theme.palette.primary.main,
    },
    {
      label: "Cần xử lý",
      value: yeuCauSummary?.needAction || 0,
      icon: Timer1,
      color: theme.palette.error.main,
    },
    {
      label: "Đang xử lý",
      value: yeuCauSummary?.inProgress || 0,
      icon: Edit,
      color: theme.palette.warning.main,
    },
    {
      label: "Hoàn thành",
      value: yeuCauSummary?.completed || 0,
      icon: TickCircle,
      color: theme.palette.success.main,
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Tổng quan
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Xin chào {user?.HoTen || "User"}, đây là tổng quan công việc của bạn
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3}>
        {/* Công việc Card */}
        <Grid item xs={12} md={4}>
          <SummaryCard
            title="Công việc"
            icon={Task}
            color="primary"
            stats={congViecStats}
            isLoading={isLoading}
            onClick={() =>
              navigate(WorkRoutes.congViecList(user?.NhanVienID || "me"))
            }
          />
        </Grid>

        {/* KPI Card */}
        <Grid item xs={12} md={4}>
          <SummaryCard
            title="KPI"
            icon={MedalStar}
            color="success"
            stats={kpiStats}
            isLoading={isLoading}
            onClick={() => navigate(WorkRoutes.kpiList())}
          />
        </Grid>

        {/* Yêu cầu Card */}
        <Grid item xs={12} md={4}>
          <SummaryCard
            title="Yêu cầu"
            icon={MessageQuestion}
            color="info"
            stats={yeuCauStats}
            isLoading={isLoading}
            onClick={() => navigate(WorkRoutes.yeuCauList())}
          />
        </Grid>
      </Grid>

      {/* Quick Actions - Future enhancement */}
      {!isMobile && (
        <Box mt={4}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Thao tác nhanh
          </Typography>
          <Stack direction="row" spacing={2}>
            {/* TODO: Add quick action buttons */}
          </Stack>
        </Box>
      )}

      {/* FAB Menu Button - Quick Access to All Features */}
      <FABMenuButton />
    </Container>
  );
}

export default UnifiedDashboardPage;
