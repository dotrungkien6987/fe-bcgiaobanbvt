import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  ButtonGroup,
  Divider,
  Chip,
  Paper,
  CircularProgress,
} from "@mui/material";
import {
  CheckCircle as CheckIcon,
  ArrowForward as ArrowIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

/**
 * RecentCompletedPreview Component - Shows recently completed tasks
 *
 * Features:
 * - Display last N completed tasks (from getRecentCompleted thunk)
 * - Date filter: 7/30/90 days selector
 * - Timeline display with relative time (e.g., "3 ngày trước")
 * - "Xem tất cả" link to full archive page
 * - Empty state when no recent completed
 *
 * @param {Array} recentTasks - Recent completed tasks from Redux
 * @param {Function} onViewAll - Callback to navigate to archive page
 * @param {boolean} loading - Loading state
 * @param {string} error - Error message
 */
const RecentCompletedPreview = ({
  recentTasks = [],
  onViewAll,
  onViewTask, // NEW: Callback to view individual task
  loading = false,
  error = null,
}) => {
  const [daysFilter, setDaysFilter] = useState(7); // Default 7 days

  // Filter tasks by selected days (client-side additional filter)
  const filteredTasks = useMemo(() => {
    if (!Array.isArray(recentTasks) || recentTasks.length === 0) {
      return [];
    }

    const cutoffDate = dayjs().subtract(daysFilter, "day");
    return recentTasks.filter((task) => {
      const completedDate = dayjs(task.NgayHoanThanh || task.updatedAt);
      return completedDate.isAfter(cutoffDate);
    });
  }, [recentTasks, daysFilter]);

  // Don't render if no data and not loading
  if (!loading && filteredTasks.length === 0 && !error) {
    return null;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 4,
        p: 3,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        backgroundColor: "grey.50",
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <CheckIcon color="success" />
          <Typography variant="h6" fontWeight={600}>
            Đã hoàn thành gần đây
          </Typography>
          {filteredTasks.length > 0 && (
            <Chip
              label={filteredTasks.length}
              size="small"
              color="success"
              sx={{ ml: 1 }}
            />
          )}
        </Stack>

        {/* Date filter buttons */}
        <ButtonGroup size="small" variant="outlined">
          <Button
            variant={daysFilter === 7 ? "contained" : "outlined"}
            onClick={() => setDaysFilter(7)}
          >
            7 ngày
          </Button>
          <Button
            variant={daysFilter === 30 ? "contained" : "outlined"}
            onClick={() => setDaysFilter(30)}
          >
            30 ngày
          </Button>
          <Button
            variant={daysFilter === 90 ? "contained" : "outlined"}
            onClick={() => setDaysFilter(90)}
          >
            3 tháng
          </Button>
        </ButtonGroup>
      </Stack>

      <Divider sx={{ mb: 2 }} />

      {/* Loading state */}
      {loading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={32} />
        </Box>
      )}

      {/* Error state */}
      {error && !loading && (
        <Typography color="error" align="center" py={2}>
          {error}
        </Typography>
      )}

      {/* Timeline display */}
      {!loading && !error && filteredTasks.length > 0 && (
        <Stack spacing={1.5} mb={2}>
          {filteredTasks.map((task) => {
            const completedDate = dayjs(task.NgayHoanThanh || task.updatedAt);
            const relativeTime = completedDate.fromNow(); // "3 ngày trước"
            const formattedDate = completedDate.format("DD/MM/YYYY");

            return (
              <Stack
                spacing={1}
                sx={{
                  py: 1.5,
                  px: 1.5,
                  borderRadius: 1,
                  backgroundColor: "background.paper",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                {/* Dòng 1: Tiêu đề full width */}
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    wordWrap: "break-word",
                    whiteSpace: "normal",
                  }}
                >
                  {task.TieuDe || "Không có tên"}
                </Typography>

                {/* Dòng 2: Info + Actions */}
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ flexWrap: "wrap" }}
                >
                  <CheckIcon fontSize="small" color="success" />
                  <Chip
                    label={formattedDate}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: "0.75rem" }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {relativeTime}
                  </Typography>
                  <Box sx={{ ml: "auto !important" }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={() => onViewTask?.(task._id)}
                      sx={{ minWidth: 80, textTransform: "none" }}
                    >
                      Xem
                    </Button>
                  </Box>
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      )}

      {/* Empty state */}
      {!loading && !error && filteredTasks.length === 0 && (
        <Typography color="text.secondary" align="center" py={3}>
          Không có công việc hoàn thành trong {daysFilter} ngày qua
        </Typography>
      )}

      {/* View all link */}
      {!loading && filteredTasks.length > 0 && (
        <Button
          fullWidth
          variant="text"
          endIcon={<ArrowIcon />}
          onClick={onViewAll}
          sx={{ mt: 1, textTransform: "none", fontWeight: 600 }}
        >
          Xem tất cả lịch sử
        </Button>
      )}
    </Paper>
  );
};

export default RecentCompletedPreview;
