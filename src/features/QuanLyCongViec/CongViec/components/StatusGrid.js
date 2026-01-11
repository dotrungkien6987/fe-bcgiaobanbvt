import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Box,
} from "@mui/material";
import {
  CheckBox as CheckBoxIcon,
  Inbox as InboxIcon,
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";

/**
 * StatusGrid Component - Grid layout for status overview
 *
 * Features:
 * - Employee view (4 cards): Tất cả / Đã giao / Đang làm / Chờ duyệt
 * - Manager view (5 cards): Tất cả / Chưa giao / Đã giao / Đang làm / Chờ tôi duyệt
 * - Large count numbers for quick scanning
 * - Full text labels (no abbreviations)
 * - Icon + deadline badges
 * - Active state with border highlight
 * - Responsive: 2 columns mobile, 4/5 columns desktop
 *
 * @param {string} status - Current active status
 * @param {Function} onStatusChange - Callback when status changes
 * @param {Object} counts - Task counts from useTaskCounts or useAssignedTaskCounts hook
 * @param {string} variant - 'employee' (default, 4 cards) or 'manager' (5 cards)
 */
const StatusGrid = ({
  status,
  onStatusChange,
  counts,
  variant = "employee",
}) => {
  // ✅ Employee view: 4 status cards (default)
  const employeeStatusConfig = [
    {
      key: "ALL",
      label: "Tất cả",
      icon: CheckBoxIcon,
      color: "primary",
    },
    {
      key: "DA_GIAO",
      label: "Chờ tiếp nhận",
      icon: InboxIcon,
      color: "info",
    },
    {
      key: "DANG_THUC_HIEN",
      label: "Đang thực hiện",
      icon: PlayArrowIcon,
      color: "warning",
    },
    {
      key: "CHO_DUYET",
      label: "Chờ duyệt",
      icon: CheckCircleIcon,
      color: "success",
    },
  ];

  // ✅ Manager view: 5 status cards (added TAO_MOI)
  const managerStatusConfig = [
    {
      key: "ALL",
      label: "Tất cả",
      icon: CheckBoxIcon,
      color: "primary",
    },
    {
      key: "TAO_MOI",
      label: "Chưa giao",
      icon: InboxIcon,
      color: "default",
    },
    {
      key: "DA_GIAO",
      label: "Đã giao",
      icon: InboxIcon,
      color: "info",
    },
    {
      key: "DANG_THUC_HIEN",
      label: "Đang làm",
      icon: PlayArrowIcon,
      color: "warning",
    },
    {
      key: "CHO_DUYET",
      label: "Chờ tôi duyệt",
      icon: CheckCircleIcon,
      color: "success",
    },
  ];

  // Select config based on variant
  const statusConfig =
    variant === "manager" ? managerStatusConfig : employeeStatusConfig;

  // Get deadline badges for a specific status
  const getDeadlineBadges = (statusKey) => {
    if (!counts || !counts.deadlineByStatus) return null;

    // Get deadline counts for this specific status
    const statusDeadlines = counts.deadlineByStatus[statusKey];
    if (!statusDeadlines) return null;

    const { overdue, upcoming } = statusDeadlines;

    // Show badges if there are any overdue or upcoming tasks for this status
    if (overdue > 0 || upcoming > 0) {
      return (
        <Stack direction="row" spacing={0.5}>
          {overdue > 0 && (
            <Chip
              icon={<WarningIcon sx={{ fontSize: 14 }} />}
              label={overdue}
              size="small"
              color="error"
              sx={{
                height: 20,
                fontSize: "0.75rem",
                "& .MuiChip-label": { px: 0.5 },
                "& .MuiChip-icon": { ml: 0.5, mr: -0.25 },
              }}
            />
          )}
          {upcoming > 0 && (
            <Chip
              icon={<ScheduleIcon sx={{ fontSize: 14 }} />}
              label={upcoming}
              size="small"
              color="warning"
              sx={{
                height: 20,
                fontSize: "0.75rem",
                "& .MuiChip-label": { px: 0.5 },
                "& .MuiChip-icon": { ml: 0.5, mr: -0.25 },
              }}
            />
          )}
        </Stack>
      );
    }

    return null;
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Grid container spacing={1.5}>
        {statusConfig.map((config) => {
          const isActive = status === config.key;
          const count = counts?.[config.key] || 0;
          const IconComponent = config.icon;

          return (
            <Grid
              item
              xs={6}
              sm={6}
              md={variant === "manager" ? 2.4 : 3}
              key={config.key}
            >
              <Card
                onClick={() => onStatusChange(config.key)}
                sx={{
                  cursor: "pointer",
                  height: "100%",
                  border: 2,
                  borderColor: isActive ? `${config.color}.main` : "divider",
                  backgroundColor: isActive
                    ? `${config.color}.50`
                    : "background.paper",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: `${config.color}.main`,
                    boxShadow: 2,
                  },
                }}
              >
                <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Stack spacing={0.5}>
                    {/* Icon + Label */}
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <IconComponent
                        sx={{
                          fontSize: 22,
                          color: isActive
                            ? `${config.color}.main`
                            : "text.secondary",
                        }}
                      />
                      <Typography
                        variant="body2"
                        fontWeight={isActive ? 600 : 500}
                        color={
                          isActive ? `${config.color}.main` : "text.primary"
                        }
                        sx={{ lineHeight: 1.2, fontSize: "0.875rem" }}
                      >
                        {config.label}
                      </Typography>
                    </Stack>

                    {/* Count + Deadline Badges inline */}
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography
                        variant="h3"
                        fontWeight={700}
                        color={
                          isActive ? `${config.color}.main` : "text.primary"
                        }
                        sx={{ fontSize: "2rem", lineHeight: 1 }}
                      >
                        {count}
                      </Typography>
                      {getDeadlineBadges(config.key)}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default StatusGrid;
