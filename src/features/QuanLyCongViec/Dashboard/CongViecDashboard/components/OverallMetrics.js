/**
 * OverallMetrics - Top-level 4 metric cards
 *
 * Displays:
 * - Tổng công việc (total active)
 * - Quá hạn (overdue) - clickable
 * - Sắp hạn (due soon) - clickable
 * - Hoàn thành (completed)
 *
 * @component
 */

import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  useTheme,
  Box,
} from "@mui/material";
import { Task, Danger, Clock, TickCircle } from "iconsax-react";

/**
 * MetricCard Component - Inner metric card without outer Card wrapper
 */
function MetricCard({
  label,
  value,
  subtext,
  icon: Icon,
  color = "primary",
  onClick,
  clickable = false,
}) {
  const theme = useTheme();
  const colorValue = theme.palette[color]?.main || theme.palette.primary.main;

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 1,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        cursor: clickable ? "pointer" : "default",
        transition: "all 0.2s",
        "&:hover": clickable
          ? {
              transform: "translateY(-2px)",
              boxShadow: 2,
              borderColor: colorValue,
            }
          : {},
      }}
      onClick={onClick}
    >
      <Stack spacing={1} alignItems="center">
        <Icon size={32} color={colorValue} variant="Bold" />
        <Typography variant="h4" fontWeight={600}>
          {value ?? 0}
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {label}
        </Typography>
        {subtext && (
          <Typography variant="caption" color="text.secondary">
            {subtext}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

/**
 * Main Component
 */
export default function OverallMetrics({
  receivedCounts,
  assignedCounts,
  receivedTasks,
  assignedTasks,
  dateRange,
}) {
  const navigate = useNavigate();

  // Calculate total active (excluding completed)
  const totalActive = useMemo(() => {
    const receivedActive =
      (receivedCounts.ALL || 0) - (receivedCounts.HOAN_THANH || 0);
    const assignedActive =
      (assignedCounts.ALL || 0) - (assignedCounts.HOAN_THANH || 0);
    return receivedActive + assignedActive;
  }, [receivedCounts, assignedCounts]);

  // Calculate total overdue
  const totalOverdue = useMemo(() => {
    return (
      (receivedCounts.deadlineStatus?.overdue || 0) +
      (assignedCounts.deadlineStatus?.overdue || 0)
    );
  }, [receivedCounts, assignedCounts]);

  // Calculate total due soon
  const totalDueSoon = useMemo(() => {
    return (
      (receivedCounts.deadlineStatus?.upcoming || 0) +
      (assignedCounts.deadlineStatus?.upcoming || 0)
    );
  }, [receivedCounts, assignedCounts]);

  // Calculate total completed (filtered by dateRange with Vietnam timezone)
  const totalCompleted = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) {
      return (
        (receivedCounts.HOAN_THANH || 0) + (assignedCounts.HOAN_THANH || 0)
      );
    }

    // Convert dateRange to Vietnam timezone (UTC+7) start/end of day
    const startOfDay = new Date(`${dateRange.from}T00:00:00+07:00`);
    const endOfDay = new Date(`${dateRange.to}T23:59:59+07:00`);

    const receivedCompleted = (receivedTasks || []).filter((t) => {
      if (t.TrangThai !== "HOAN_THANH" || !t.NgayHoanThanh) return false;
      const completedDate = new Date(t.NgayHoanThanh);
      return completedDate >= startOfDay && completedDate <= endOfDay;
    }).length;

    const assignedCompleted = (assignedTasks || []).filter((t) => {
      if (t.TrangThai !== "HOAN_THANH" || !t.NgayHoanThanh) return false;
      const completedDate = new Date(t.NgayHoanThanh);
      return completedDate >= startOfDay && completedDate <= endOfDay;
    }).length;

    return receivedCompleted + assignedCompleted;
  }, [receivedCounts, assignedCounts, receivedTasks, assignedTasks, dateRange]);

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box mb={2}>
          <Typography variant="h6">📊 TỔNG QUAN</Typography>
        </Box>

        {/* Metrics Grid */}
        <Grid container spacing={2}>
          {/* Total Active */}
          <Grid item xs={6} sm={3}>
            <MetricCard
              label="Tổng công việc"
              value={totalActive}
              icon={Task}
              color="primary"
            />
          </Grid>

          {/* Overdue */}
          <Grid item xs={6} sm={3}>
            <MetricCard
              label="Quá hạn"
              value={totalOverdue}
              icon={Danger}
              color="error"
              onClick={() =>
                navigate(
                  "/quanlycongviec/cong-viec-cua-toi?tinhTrangHan=QUA_HAN"
                )
              }
              clickable
            />
          </Grid>

          {/* Due Soon */}
          <Grid item xs={6} sm={3}>
            <MetricCard
              label="Sắp hạn"
              value={totalDueSoon}
              icon={Clock}
              color="warning"
              onClick={() =>
                navigate(
                  "/quanlycongviec/cong-viec-cua-toi?tinhTrangHan=SAP_QUA_HAN"
                )
              }
              clickable
            />
          </Grid>

          {/* Completed */}
          <Grid item xs={6} sm={3}>
            <MetricCard
              label="Hoàn thành"
              value={totalCompleted}
              icon={TickCircle}
              color="success"
            />
          </Grid>
        </Grid>

        {/* Breakdown Summary */}
        <Box mt={2} textAlign="center">
          <Typography variant="caption" color="text.secondary">
            📥 {receivedCounts.ALL || 0} nhận | 📤 {assignedCounts.ALL || 0}{" "}
            giao
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
