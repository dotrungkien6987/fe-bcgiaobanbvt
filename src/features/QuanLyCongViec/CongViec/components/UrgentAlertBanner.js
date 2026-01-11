import React, { useState, useEffect } from "react";
import { Alert, Button, IconButton, Stack, Typography } from "@mui/material";
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";

/**
 * UrgentAlertBanner Component - Global deadline warning banner
 *
 * Features:
 * - Red alert: Has overdue tasks (⚠️)
 * - Yellow alert: Only upcoming deadline tasks (⏰)
 * - Dismissible with localStorage (show again after 24h or when new urgent task)
 * - "Xem ngay" button to filter urgent tasks
 * - Auto-hide when no urgent tasks
 *
 * @param {number} overdueCount - Number of overdue tasks (QUA_HAN)
 * @param {number} upcomingCount - Number of upcoming deadline tasks (SAP_QUA_HAN)
 * @param {Function} onViewClick - Callback when "Xem ngay" clicked
 * @param {Function} onDismiss - Callback when banner dismissed
 * @param {string} userId - Current user ID for localStorage key
 */
const UrgentAlertBanner = ({
  overdueCount = 0,
  upcomingCount = 0,
  onViewClick,
  onDismiss,
  userId,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if banner was dismissed recently (within 24h)
  useEffect(() => {
    if (!userId) return;

    const dismissKey = `urgent_alert_dismissed_${userId}`;
    const dismissedAt = localStorage.getItem(dismissKey);

    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const now = Date.now();
      const hoursSinceDismissed = (now - dismissedTime) / (1000 * 60 * 60);

      // Show again after 24h
      if (hoursSinceDismissed < 24) {
        setIsDismissed(true);
      } else {
        // Clear old dismissed state
        localStorage.removeItem(dismissKey);
      }
    }
  }, [userId]);

  // Handle dismiss
  const handleDismiss = () => {
    if (userId) {
      const dismissKey = `urgent_alert_dismissed_${userId}`;
      localStorage.setItem(dismissKey, Date.now().toString());
    }
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  // Don't show if no urgent tasks or dismissed
  if (isDismissed || (overdueCount === 0 && upcomingCount === 0)) {
    return null;
  }

  // Determine severity (error = red for overdue, warning = yellow for upcoming only)
  const severity = overdueCount > 0 ? "error" : "warning";

  // Build message
  let message = "";
  if (overdueCount > 0 && upcomingCount > 0) {
    message = `${overdueCount} việc quá hạn, ${upcomingCount} việc trong vùng cảnh báo`;
  } else if (overdueCount > 0) {
    message = `${overdueCount} việc quá hạn`;
  } else {
    message = `${upcomingCount} việc sắp hết hạn`;
  }

  return (
    <Alert
      severity={severity}
      icon={overdueCount > 0 ? <WarningIcon /> : <ScheduleIcon />}
      sx={{
        mb: 2,
        alignItems: "center",
        "& .MuiAlert-message": {
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        },
      }}
      action={
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            color="inherit"
            size="small"
            onClick={onViewClick}
            sx={{
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            Xem ngay
          </Button>
          <IconButton
            color="inherit"
            size="small"
            onClick={handleDismiss}
            aria-label="Đóng thông báo"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      }
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="body2" fontWeight={500}>
          {message}
        </Typography>
      </Stack>
    </Alert>
  );
};

export default UrgentAlertBanner;
