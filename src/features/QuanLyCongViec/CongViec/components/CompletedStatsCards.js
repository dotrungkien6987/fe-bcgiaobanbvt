import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
} from "@mui/material";
import {
  Assignment as AssignmentIcon,
  CalendarToday as CalendarTodayIcon,
  EventNote as EventNoteIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

/**
 * CompletedStatsCards - Display 4 summary metrics for completed tasks archive
 *
 * Features:
 * - Total completed tasks
 * - Completed this week
 * - Completed this month
 * - On-time completion rate (percentage)
 * - Loading skeleton states
 * - Responsive grid layout (4 cols desktop, 2 cols tablet, 1 col mobile)
 *
 * Props:
 * @param {Object} stats - Statistics object from Redux state
 * @param {number} stats.total - Total completed tasks
 * @param {number} stats.thisWeek - Completed this week
 * @param {number} stats.thisMonth - Completed this month
 * @param {number} stats.onTimeRate - On-time completion rate (0-100)
 * @param {boolean} isLoading - Show skeleton loader
 */
const CompletedStatsCards = ({ stats, isLoading = false }) => {
  // Handle null/undefined stats gracefully
  const safeStats = stats || {};
  const { total = 0, thisWeek = 0, thisMonth = 0, onTimeRate = 0 } = safeStats;

  const cards = [
    {
      id: "total",
      title: "Tổng số hoàn thành",
      value: total,
      icon: AssignmentIcon,
      color: "#1976d2", // Blue
      bgColor: "#e3f2fd",
    },
    {
      id: "week",
      title: "Tuần này",
      value: thisWeek,
      icon: CalendarTodayIcon,
      color: "#2e7d32", // Green
      bgColor: "#e8f5e9",
    },
    {
      id: "month",
      title: "Tháng này",
      value: thisMonth,
      icon: EventNoteIcon,
      color: "#ed6c02", // Orange
      bgColor: "#fff3e0",
    },
    {
      id: "ontime",
      title: "Tỷ lệ đúng hạn",
      value: `${onTimeRate.toFixed(1)}%`,
      icon: CheckCircleIcon,
      color: "#2e7d32", // Success green
      bgColor: "#e8f5e9",
      isPercentage: true,
    },
  ];

  if (isLoading) {
    return (
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {cards.map((card) => (
          <Grid item xs={6} sm={6} md={3} key={card.id}>
            <Card>
              <CardContent>
                <Skeleton
                  variant="circular"
                  width={48}
                  height={48}
                  sx={{ mb: 1 }}
                />
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={40} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={1.5} sx={{ mb: 3 }}>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Grid item xs={6} sm={6} md={3} key={card.id}>
            <Card
              sx={{
                height: "100%",
                transition: "box-shadow 0.2s",
                "&:hover": {
                  transform: { xs: "none", sm: "translateY(-4px)" },
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 36, sm: 40 },
                      height: { xs: 36, sm: 40 },
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: card.bgColor,
                    }}
                  >
                    <Icon
                      sx={{ color: card.color, fontSize: { xs: 22, sm: 24 } }}
                    />
                  </Box>
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5, fontSize: { xs: "0.75rem", sm: "0.8rem" } }}
                >
                  {card.title}
                </Typography>

                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 600,
                    color: card.color,
                    fontSize: { xs: "1.5rem", sm: "1.75rem" },
                  }}
                >
                  {card.value}
                </Typography>

                {/* Optional: Show percentage badge for non-percentage cards */}
                {!card.isPercentage && total > 0 && (
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 0.5,
                      display: "block",
                      color: "text.secondary",
                    }}
                  >
                    {card.id === "week" &&
                      `${((thisWeek / total) * 100).toFixed(0)}% tổng số`}
                    {card.id === "month" &&
                      `${((thisMonth / total) * 100).toFixed(0)}% tổng số`}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default React.memo(CompletedStatsCards);
