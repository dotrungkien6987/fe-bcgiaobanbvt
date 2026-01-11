import React from "react";
import {
  Tabs,
  Tab,
  Paper,
  Chip,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";

/**
 * StatusTabs Component - Native scrollable status tabs for Task Views
 *
 * Features:
 * - Employee view (4 tabs): Tất cả / Đã giao / Đang làm / Chờ duyệt
 * - Manager view (5 tabs): Tất cả / Chưa giao / Đã giao / Đang làm / Chờ tôi duyệt
 * - Badge counts for each status
 * - Deadline warning indicators (⚠️ overdue, ⏰ upcoming)
 * - Native Material-UI scrollable tabs with arrows
 * - Responsive: Compact labels on mobile, full labels on desktop
 *
 * @param {string} status - Current active status
 * @param {Function} onStatusChange - Callback when status changes
 * @param {Object} counts - Task counts from useTaskCounts or useAssignedTaskCounts hook
 * @param {boolean} isMobile - Mobile layout flag
 * @param {string} variant - 'employee' (default, 4 tabs) or 'manager' (5 tabs)
 */
const StatusTabs = ({
  status,
  onStatusChange,
  counts,
  isMobile = false,
  variant = "employee",
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // ✅ Employee view: 4 status tabs (default)
  const employeeStatusConfig = [
    { key: "ALL", label: "Tất cả", shortLabel: "Tất cả", color: "default" },
    {
      key: "DA_GIAO",
      label: "Chờ tiếp nhận",
      shortLabel: "Chờ",
      color: "info",
    },
    {
      key: "DANG_THUC_HIEN",
      label: "Đang làm",
      shortLabel: "Đang",
      color: "warning",
    },
    {
      key: "CHO_DUYET",
      label: "Chờ duyệt",
      shortLabel: "Duyệt",
      color: "primary",
    },
  ];

  // ✅ Manager view: 5 status tabs (added TAO_MOI)
  const managerStatusConfig = [
    { key: "ALL", label: "Tất cả", shortLabel: "Tất cả", color: "default" },
    {
      key: "TAO_MOI",
      label: "Chưa giao",
      shortLabel: "Chưa",
      color: "default",
    },
    {
      key: "DA_GIAO",
      label: "Đã giao",
      shortLabel: "Đã",
      color: "info",
    },
    {
      key: "DANG_THUC_HIEN",
      label: "Đang làm",
      shortLabel: "Đang",
      color: "warning",
    },
    {
      key: "CHO_DUYET",
      label: "Chờ tôi duyệt",
      shortLabel: "Duyệt",
      color: "primary",
    },
  ];

  // Select config based on variant
  const statusConfig =
    variant === "manager" ? managerStatusConfig : employeeStatusConfig;

  // Get deadline badges for a specific status
  const getDeadlineBadges = (statusKey) => {
    if (!counts || !counts.deadlineStatus) return null;

    // Only show deadline badges on "ALL" tab and status-specific tabs
    const { overdue, upcoming } = counts.deadlineStatus;

    // For ALL tab, show total overdue/upcoming
    if (statusKey === "ALL" && (overdue > 0 || upcoming > 0)) {
      return (
        <Stack direction="row" spacing={0.5} sx={{ ml: 0.5 }}>
          {overdue > 0 && (
            <Chip
              icon={<WarningIcon sx={{ fontSize: 14 }} />}
              label={overdue}
              size="small"
              color="error"
              sx={{
                height: 18,
                fontSize: "0.7rem",
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
                height: 18,
                fontSize: "0.7rem",
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

  // Native scrollable tabs for all screen sizes
  return (
    <Paper sx={{ mb: 2 }}>
      <Tabs
        value={status}
        onChange={(e, newValue) => onStatusChange(newValue)}
        aria-label="Status tabs"
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          minHeight: 48,
          "& .MuiTab-root": {
            minHeight: 48,
            textTransform: "none",
            fontWeight: 500,
            minWidth: isSmallScreen ? 100 : 120,
            px: isSmallScreen ? 1.5 : 2,
          },
          "& .MuiTabs-scrollButtons": {
            color: "primary.main",
            "&.Mui-disabled": {
              opacity: 0.3,
            },
          },
          "& .MuiTabs-indicator": {
            height: 3,
          },
        }}
      >
        {statusConfig.map((config) => (
          <Tab
            key={config.key}
            value={config.key}
            label={
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <span>
                  {isSmallScreen ? config.shortLabel : config.label} (
                  {counts?.[config.key] || 0})
                </span>
                {getDeadlineBadges(config.key)}
              </Stack>
            }
            id={`status-tab-${config.key}`}
            aria-controls={`status-tabpanel-${config.key}`}
          />
        ))}
      </Tabs>
    </Paper>
  );
};

export default StatusTabs;
