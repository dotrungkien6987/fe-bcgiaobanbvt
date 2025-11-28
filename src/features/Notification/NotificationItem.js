/**
 * NotificationItem Component
 * Displays a single notification with icon, title, body, and actions
 *
 * Features:
 * - Icon mapping by notification type
 * - Time ago formatting (Vietnamese)
 * - Click to navigate and mark as read
 * - Delete action
 * - Visual indicators for unread/urgent
 */

import React from "react";
import {
  Box,
  Typography,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  Assignment as TaskIcon,
  Comment as CommentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Schedule as ClockIcon,
  Assessment as KpiIcon,
  Support as TicketIcon,
  Notifications as SystemIcon,
  Delete as DeleteIcon,
  Circle as UnreadIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { markAsRead, deleteNotification } from "./notificationSlice";

// Icon mapping based on notification type
const iconMap = {
  task: TaskIcon,
  comment: CommentIcon,
  warning: WarningIcon,
  check: CheckIcon,
  clock: ClockIcon,
  kpi: KpiIcon,
  ticket: TicketIcon,
  system: SystemIcon,
  notification: SystemIcon,
};

// Color mapping for avatar backgrounds
const colorMap = {
  task: "primary",
  comment: "info",
  warning: "error",
  check: "success",
  clock: "warning",
  kpi: "secondary",
  ticket: "primary",
  system: "default",
};

/**
 * NotificationItem - Single notification row
 * @param {Object} notification - Notification data
 * @param {Function} onClose - Callback to close parent dropdown/drawer
 */
function NotificationItem({ notification, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    _id,
    title,
    body,
    icon = "notification",
    priority,
    isRead,
    actionUrl,
    createdAt,
  } = notification;

  const IconComponent = iconMap[icon] || SystemIcon;
  const color = colorMap[icon] || "default";
  const isUrgent = priority === "urgent";

  /**
   * Handle click on notification item
   * - Mark as read if unread
   * - Navigate to actionUrl if present
   */
  const handleClick = () => {
    // Mark as read
    if (!isRead) {
      dispatch(markAsRead(_id));
    }

    // Navigate if has action URL
    if (actionUrl) {
      navigate(actionUrl);
      if (onClose) onClose();
    }
  };

  /**
   * Handle delete button click
   */
  const handleDelete = (e) => {
    e.stopPropagation();
    dispatch(deleteNotification(_id));
  };

  // Format time ago in Vietnamese
  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: vi,
  });

  return (
    <ListItem
      onClick={handleClick}
      sx={{
        cursor: actionUrl ? "pointer" : "default",
        backgroundColor: isRead ? "transparent" : "action.hover",
        borderLeft: isUrgent ? "3px solid" : "none",
        borderColor: "error.main",
        "&:hover": {
          backgroundColor: "action.selected",
        },
        pr: 7,
        py: 1,
      }}
      secondaryAction={
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {!isRead && (
            <UnreadIcon sx={{ fontSize: 10, color: "primary.main" }} />
          )}
          <Tooltip title="Xóa">
            <IconButton size="small" onClick={handleDelete}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      }
    >
      <ListItemAvatar>
        <Avatar
          sx={{
            bgcolor: `${color}.light`,
            color: `${color}.main`,
          }}
        >
          <IconComponent />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography
            variant="body2"
            sx={{
              fontWeight: isRead ? "normal" : "bold",
              color: isUrgent ? "error.main" : "text.primary",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "100%",
              fontSize: "0.85rem",
            }}
          >
            {title}
          </Typography>
        }
        secondary={
          <Box component="span">
            <Typography
              variant="caption"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                fontSize: "0.75rem",
                color: "text.secondary",
              }}
            >
              {body}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.7rem",
                color: "text.secondary",
                fontWeight: 500,
                display: "block",
                mt: 0.5,
              }}
            >
              {timeAgo}
            </Typography>
          </Box>
        }
      />
    </ListItem>
  );
}

export default NotificationItem;
