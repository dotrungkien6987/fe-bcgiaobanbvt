/**
 * MetricCardsGrid - Dashboard Metric Cards
 *
 * Hiển thị 4 metric cards chính:
 * - Đã gửi (sent)
 * - Nhận được (received)
 * - Quá hạn (overdue)
 * - Rating trung bình (avgRating)
 *
 * Features:
 * - Responsive: 2 columns mobile, 4 columns desktop
 * - Trend indicators (↑ ↓)
 * - Click to navigate/filter
 * - Loading skeleton
 */
import React from "react";
import {
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  Stack,
  Skeleton,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Send,
  Receive,
  ClockFastForward,
  Star1,
  TrendUp,
  TrendDown,
} from "iconsax-react";

/**
 * Single Metric Card Component
 */
function MetricCard({ metric, onClick, loading = false }) {
  const theme = useTheme();

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Stack spacing={1.5}>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" height={32} />
          </Stack>
        </CardContent>
      </Card>
    );
  }

  const { label, value, icon: Icon, color, trend, trendValue } = metric;
  const colorValue = theme.palette[color]?.main || theme.palette.primary.main;

  return (
    <Card sx={{ height: "100%" }}>
      <CardActionArea onClick={onClick} sx={{ height: "100%" }}>
        <CardContent>
          <Stack spacing={1.5}>
            {/* Icon + Trend */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: alpha(colorValue, 0.1),
                }}
              >
                <Icon size={22} color={colorValue} variant="Bold" />
              </Box>
              {trend && trendValue !== undefined && (
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  {trend === "up" ? (
                    <TrendUp size={16} color={theme.palette.success.main} />
                  ) : (
                    <TrendDown size={16} color={theme.palette.error.main} />
                  )}
                  <Typography
                    variant="caption"
                    color={trend === "up" ? "success.main" : "error.main"}
                    fontWeight={600}
                  >
                    {trendValue}%
                  </Typography>
                </Stack>
              )}
            </Stack>

            {/* Label */}
            <Typography variant="body2" color="text.secondary" noWrap>
              {label}
            </Typography>

            {/* Value */}
            <Typography variant="h4" fontWeight={700} color={color + ".main"}>
              {value ?? 0}
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

/**
 * Main MetricCardsGrid Component
 */
export default function MetricCardsGrid({
  data = {},
  loading = false,
  onNavigate,
}) {
  const metrics = [
    {
      key: "sent",
      label: "Đã gửi",
      value: data.sent,
      icon: Send,
      color: "primary",
      trend: data.sentTrend,
      trendValue: data.sentTrendValue,
      navigateTo: "/quanlycongviec/yeucau/toi-gui",
    },
    {
      key: "received",
      label: "Nhận được",
      value: data.received,
      icon: Receive,
      color: "info",
      trend: data.receivedTrend,
      trendValue: data.receivedTrendValue,
      navigateTo: "/quanlycongviec/yeucau/toi-xu-ly",
    },
    {
      key: "overdue",
      label: "Quá hạn",
      value: data.overdue,
      icon: ClockFastForward,
      color: "error",
      trend: data.overdueTrend,
      trendValue: data.overdueTrendValue,
      navigateTo: "/quanlycongviec/yeucau/toi-xu-ly?tab=qua-han",
    },
    {
      key: "avgRating",
      label: "Rating TB",
      value: data.avgRating?.toFixed(1) || "0.0",
      icon: Star1,
      color: "warning",
      trend: data.ratingTrend,
      trendValue: data.ratingTrendValue,
      navigateTo: null, // No navigation for rating
    },
  ];

  return (
    <Grid container spacing={2}>
      {metrics.map((metric) => (
        <Grid item xs={6} md={3} key={metric.key}>
          <MetricCard
            metric={metric}
            loading={loading}
            onClick={() => {
              if (metric.navigateTo && onNavigate) {
                onNavigate(metric.navigateTo);
              }
            }}
          />
        </Grid>
      ))}
    </Grid>
  );
}
