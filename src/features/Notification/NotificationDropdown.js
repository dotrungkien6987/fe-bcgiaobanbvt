/**
 * NotificationDropdown Component
 * Desktop popover showing recent notifications
 *
 * Features:
 * - Shows last 5 notifications
 * - Mark all as read button
 * - Link to full notifications page
 * - Loading skeleton
 */

import React, { useEffect } from "react";
import {
  Box,
  Popover,
  Typography,
  List,
  Divider,
  Button,
  Skeleton,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import NotificationItem from "./NotificationItem";
import { getNotifications, markAllAsRead } from "./notificationSlice";

/**
 * NotificationDropdown - Desktop notification popover
 * @param {HTMLElement} anchorEl - Anchor element for positioning
 * @param {boolean} open - Whether popover is open
 * @param {Function} onClose - Close handler
 */
function NotificationDropdown({ anchorEl, open, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, isLoading, unreadCount } = useSelector(
    (state) => state.notification
  );

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (open) {
      dispatch(getNotifications({ page: 1, limit: 5 }));
    }
  }, [open, dispatch]);

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
  };

  const handleViewAll = () => {
    navigate("/thong-bao");
    onClose();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      PaperProps={{
        sx: {
          width: 340,
          maxHeight: 520,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 1.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold">
          Thông báo
          {unreadCount > 0 && (
            <Typography
              component="span"
              variant="caption"
              sx={{
                ml: 1,
                px: 1,
                py: 0.25,
                bgcolor: "error.main",
                color: "white",
                borderRadius: 10,
              }}
            >
              {unreadCount}
            </Typography>
          )}
        </Typography>
        {unreadCount > 0 && (
          <Button size="small" onClick={handleMarkAllRead}>
            Đánh dấu đã đọc
          </Button>
        )}
      </Box>

      <Divider />

      {/* Notification List */}
      {isLoading ? (
        <Box sx={{ p: 2 }}>
          {[1, 2, 3].map((i) => (
            <Box key={i} sx={{ display: "flex", mb: 2 }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box sx={{ ml: 2, flex: 1 }}>
                <Skeleton width="80%" />
                <Skeleton width="60%" />
              </Box>
            </Box>
          ))}
        </Box>
      ) : notifications.length === 0 ? (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">Không có thông báo nào</Typography>
        </Box>
      ) : (
        <List disablePadding sx={{ maxHeight: 320, overflow: "auto" }}>
          {notifications
            .filter((n) => n?._id)
            .slice(0, 5)
            .map((notification) => (
              <React.Fragment key={notification._id}>
                <NotificationItem
                  notification={notification}
                  onClose={onClose}
                />
                <Divider component="li" />
              </React.Fragment>
            ))}
        </List>
      )}

      {/* Footer */}
      <Divider />
      <Box sx={{ p: 1 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="small"
          onClick={handleViewAll}
        >
          Xem tất cả thông báo
        </Button>
      </Box>
    </Popover>
  );
}

export default NotificationDropdown;
