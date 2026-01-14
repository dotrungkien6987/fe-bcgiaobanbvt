/**
 * CollapsibleAlertCard Component
 *
 * Enhanced deadline alert card with:
 * - Collapsible/expandable state (default collapsed on mobile)
 * - Dismissible with localStorage (24h cooldown)
 * - Support for overdue and upcoming deadline alerts
 * - Differentiate between received vs assigned tasks
 *
 * @component
 */

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  AlertTitle,
  Box,
  Stack,
  Typography,
  IconButton,
  Chip,
  Collapse,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Danger,
  Warning2,
  ArrowDown2,
  ArrowUp2,
  CloseCircle,
} from "iconsax-react";
import {
  filterOverdueTasks,
  filterUpcomingTasks,
  formatDeadlineText,
  formatDeadlineDate,
  getPriorityColor,
  getStatusLabel,
} from "../utils/taskAlertHelpers";

/**
 * Main Component
 */
export default function CollapsibleAlertCard({
  tasks = [],
  type = "overdue", // "overdue" | "upcoming"
  taskSource = "received", // "received" | "assigned"
  userId,
  defaultCollapsed = null, // null = auto (mobile), true/false = forced
  dismissible = true,
}) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Determine default collapsed state
  const initialCollapsed =
    defaultCollapsed !== null ? defaultCollapsed : isMobile;

  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [dismissed, setDismissed] = useState(false);

  // Filter all tasks based on type (for counting)
  const allFilteredTasks = useMemo(() => {
    return type === "overdue"
      ? filterOverdueTasks(tasks)
      : filterUpcomingTasks(tasks);
  }, [tasks, type]);

  // Get limited tasks for display
  const displayTasks = useMemo(() => {
    const limit = isMobile ? 3 : 5;
    return allFilteredTasks.slice(0, limit);
  }, [allFilteredTasks, isMobile]);

  // LocalStorage key for dismiss state
  const dismissKey = `alert-${type}-${taskSource}-${userId}-dismissed`;
  const dismissTimeKey = `${dismissKey}-time`;

  // Check dismiss state on mount
  useEffect(() => {
    if (!dismissible || !userId) return;

    const dismissedState = localStorage.getItem(dismissKey);
    const dismissedTime = localStorage.getItem(dismissTimeKey);

    if (dismissedState === "true" && dismissedTime) {
      const dismissedAt = parseInt(dismissedTime, 10);
      const now = Date.now();
      const cooldownMs = 24 * 60 * 60 * 1000; // 24 hours

      if (now - dismissedAt < cooldownMs) {
        setDismissed(true);
      } else {
        // Cooldown expired, reset
        localStorage.removeItem(dismissKey);
        localStorage.removeItem(dismissTimeKey);
      }
    }
  }, [dismissKey, dismissTimeKey, dismissible, userId]);

  // Handle dismiss
  const handleDismiss = () => {
    if (!userId) return;

    localStorage.setItem(dismissKey, "true");
    localStorage.setItem(dismissTimeKey, Date.now().toString());
    setDismissed(true);
  };

  // Handle task click
  const handleTaskClick = (taskId) => {
    navigate(`/quanlycongviec/congviec/${taskId}`);
  };

  // Don't render if dismissed or no tasks
  if (dismissed || allFilteredTasks.length === 0) {
    return null;
  }

  // Alert config based on type
  const alertConfig = {
    overdue: {
      severity: "error",
      icon: <Danger variant="Bold" size={24} />,
      title: `⚠️ Cảnh báo: ${allFilteredTasks.length} công việc ${
        taskSource === "received" ? "nhận" : "giao"
      } quá hạn`,
      color: theme.palette.error.main,
    },
    upcoming: {
      severity: "warning",
      icon: <Warning2 variant="Bold" size={24} />,
      title: `⏰ Lưu ý: ${allFilteredTasks.length} công việc ${
        taskSource === "received" ? "nhận" : "giao"
      } sắp hết hạn`,
      color: theme.palette.warning.main,
    },
  };

  const config = alertConfig[type];

  return (
    <Alert
      severity={config.severity}
      icon={config.icon}
      sx={{
        "& .MuiAlert-message": {
          width: "100%",
        },
      }}
      action={
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            onClick={() => setCollapsed(!collapsed)}
            sx={{ color: "inherit" }}
          >
            {collapsed ? <ArrowDown2 size={20} /> : <ArrowUp2 size={20} />}
          </IconButton>
          {dismissible && (
            <IconButton
              size="small"
              onClick={handleDismiss}
              sx={{ color: "inherit" }}
            >
              <CloseCircle size={20} />
            </IconButton>
          )}
        </Stack>
      }
    >
      <AlertTitle sx={{ fontWeight: 600, mb: collapsed ? 0 : 1 }}>
        {config.title}
      </AlertTitle>

      <Collapse in={!collapsed}>
        <Stack spacing={1.5} mt={1}>
          {displayTasks.map((task) => (
            <Box
              key={task._id}
              sx={{
                p: 1.5,
                borderRadius: 1,
                bgcolor: "rgba(255, 255, 255, 0.1)",
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  transform: "translateX(4px)",
                },
              }}
              onClick={() => handleTaskClick(task._id)}
            >
              <Stack spacing={1}>
                {/* Task title */}
                <Typography variant="body2" fontWeight={500}>
                  {task.TieuDe}
                </Typography>

                {/* Metadata row */}
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  useFlexGap
                  alignItems="center"
                >
                  {/* Deadline badge */}
                  <Chip
                    label={formatDeadlineText(task.NgayHetHan, type)}
                    size="small"
                    sx={{
                      bgcolor: "rgba(255, 255, 255, 0.3)",
                      color: "inherit",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                    }}
                  />

                  {/* Deadline date */}
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Hạn: {formatDeadlineDate(task.NgayHetHan)}
                  </Typography>

                  {/* Status */}
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    • {getStatusLabel(task.TrangThai)}
                  </Typography>

                  {/* Priority */}
                  {task.MucDoUuTien && task.MucDoUuTien !== "BINH_THUONG" && (
                    <Chip
                      label={
                        task.MucDoUuTien === "KHAN_CAP"
                          ? "Khẩn cấp"
                          : task.MucDoUuTien === "CAO"
                          ? "Cao"
                          : "Thấp"
                      }
                      size="small"
                      color={getPriorityColor(task.MucDoUuTien)}
                      sx={{
                        height: 20,
                        fontSize: "0.7rem",
                        "& .MuiChip-label": { px: 1 },
                      }}
                    />
                  )}
                </Stack>
              </Stack>
            </Box>
          ))}

          {/* Show more hint */}
          {allFilteredTasks.length > displayTasks.length && (
            <Typography
              variant="caption"
              sx={{ opacity: 0.8, fontStyle: "italic", mt: 0.5 }}
            >
              + {allFilteredTasks.length - displayTasks.length} công việc
              khác...
            </Typography>
          )}
        </Stack>
      </Collapse>
    </Alert>
  );
}
