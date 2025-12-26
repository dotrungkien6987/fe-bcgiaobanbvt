/**
 * NotificationDrawer Component
 * Mobile-friendly full-height drawer for notifications
 *
 * Features:
 * - Full page mobile experience
 * - Infinite scroll pagination
 * - Mark all as read
 * - Loading states
 */

import React, { useEffect, useCallback, useRef } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  Divider,
  Button,
  CircularProgress,
  AppBar,
  Toolbar,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import NotificationItem from "./NotificationItem";
import {
  getNotifications,
  loadMoreNotifications,
  markAllAsRead,
} from "./notificationSlice";

/**
 * NotificationDrawer - Full-height drawer for mobile
 * @param {boolean} open - Whether drawer is open
 * @param {Function} onClose - Close handler
 */
function NotificationDrawer({ open, onClose }) {
  const dispatch = useDispatch();
  const listRef = useRef(null);

  const { notifications, isLoading, unreadCount, pagination } = useSelector(
    (state) => state.notification
  );

  // Fetch notifications on open
  useEffect(() => {
    if (open) {
      dispatch(getNotifications({ page: 1, limit: 20 }));
    }
  }, [open, dispatch]);

  /**
   * Infinite scroll handler
   */
  const handleScroll = useCallback(() => {
    if (!listRef.current || isLoading) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

    if (isNearBottom && pagination.page < pagination.totalPages) {
      dispatch(loadMoreNotifications({ page: pagination.page + 1 }));
    }
  }, [dispatch, isLoading, pagination]);

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: "100%", sm: 400 } },
      }}
    >
      {/* Header */}
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar>
          <IconButton edge="start" onClick={onClose}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
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
        </Toolbar>
      </AppBar>

      <Divider />

      {/* Notification List */}
      <Box
        ref={listRef}
        onScroll={handleScroll}
        sx={{
          flexGrow: 1,
          overflow: "auto",
        }}
      >
        {notifications.length === 0 && !isLoading ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">
              Không có thông báo nào
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {notifications
              .filter((n) => n?._id)
              .map((notification, index) => (
                <React.Fragment key={notification._id}>
                  <NotificationItem
                    notification={notification}
                    onClose={onClose}
                  />
                  {index < notifications.length - 1 && (
                    <Divider component="li" />
                  )}
                </React.Fragment>
              ))}
          </List>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {/* End of list message */}
        {!isLoading &&
          notifications.length > 0 &&
          pagination.page >= pagination.totalPages && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", textAlign: "center", p: 2 }}
            >
              Đã hiển thị tất cả thông báo
            </Typography>
          )}
      </Box>
    </Drawer>
  );
}

export default NotificationDrawer;
