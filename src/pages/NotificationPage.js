/**
 * NotificationPage Component
 * Full page for viewing and managing all notifications
 *
 * Features:
 * - Tab filtering (All, Unread, Read)
 * - Infinite scroll pagination
 * - Mark all as read
 * - Empty state handling
 */

import React, { useEffect, useCallback, useRef } from "react";
import {
  Container,
  Box,
  Typography,
  List,
  Divider,
  Button,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { NotificationItem } from "../features/Notification";
import {
  getNotifications,
  loadMoreNotifications,
  markAllAsRead,
} from "../features/Notification/notificationSlice";

/**
 * NotificationPage - Full notifications list
 * Route: /thong-bao
 */
function NotificationPage() {
  const dispatch = useDispatch();
  const listRef = useRef(null);
  const [tabValue, setTabValue] = React.useState(0);

  const { notifications, isLoading, unreadCount, pagination } = useSelector(
    (state) => state.notification
  );

  // Filter based on tab: 0=All, 1=Unread, 2=Read
  const filter = tabValue === 0 ? undefined : tabValue === 1 ? false : true;

  // Fetch notifications when tab changes
  useEffect(() => {
    dispatch(
      getNotifications({
        page: 1,
        limit: 20,
        isRead: filter,
      })
    );
  }, [dispatch, filter]);

  /**
   * Infinite scroll handler
   */
  const handleScroll = useCallback(() => {
    if (!listRef.current || isLoading) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

    if (isNearBottom && pagination.page < pagination.totalPages) {
      dispatch(
        loadMoreNotifications({
          page: pagination.page + 1,
          isRead: filter,
        })
      );
    }
  }, [dispatch, isLoading, pagination, filter]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Thông báo</Typography>
        {unreadCount > 0 && (
          <Button variant="outlined" onClick={handleMarkAllRead}>
            Đánh dấu tất cả đã đọc ({unreadCount})
          </Button>
        )}
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Tất cả" />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                Chưa đọc
                {unreadCount > 0 && (
                  <Typography
                    component="span"
                    variant="caption"
                    sx={{
                      px: 0.75,
                      py: 0.25,
                      bgcolor: "error.main",
                      color: "white",
                      borderRadius: 10,
                      minWidth: 20,
                      textAlign: "center",
                    }}
                  >
                    {unreadCount}
                  </Typography>
                )}
              </Box>
            }
          />
          <Tab label="Đã đọc" />
        </Tabs>
      </Paper>

      {/* Notification List */}
      <Paper
        ref={listRef}
        onScroll={handleScroll}
        sx={{
          maxHeight: "calc(100vh - 250px)",
          overflow: "auto",
        }}
      >
        {notifications.length === 0 && !isLoading ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">
              {tabValue === 1
                ? "Không có thông báo chưa đọc"
                : tabValue === 2
                ? "Không có thông báo đã đọc"
                : "Không có thông báo nào"}
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {notifications
              .filter((n) => n?._id)
              .map((notification, index) => (
                <React.Fragment key={notification._id}>
                  <NotificationItem notification={notification} />
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
      </Paper>
    </Container>
  );
}

export default NotificationPage;
