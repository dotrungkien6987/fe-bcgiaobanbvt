/**
 * NotificationBell Component
 * Header notification icon with badge and dropdown/drawer
 *
 * Features:
 * - Unread count badge
 * - Socket.IO real-time updates
 * - Toast notifications for new messages
 * - Responsive (dropdown on desktop, drawer on mobile)
 */

import React, { useState, useEffect } from "react";
import { IconButton, Badge, Tooltip, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Notifications as NotificationIcon } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useSocket } from "../../contexts/SocketContext";
import NotificationDropdown from "./NotificationDropdown";
import NotificationDrawer from "./NotificationDrawer";
import {
  getUnreadCount,
  addNotification,
  setUnreadCount,
} from "./notificationSlice";

/**
 * NotificationBell - Bell icon with badge and popover/drawer
 * Place in header/navbar
 */
function NotificationBell() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { on, isConnected } = useSocket();
  const { unreadCount } = useSelector((state) => state.notification);

  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch initial unread count on mount
  useEffect(() => {
    dispatch(getUnreadCount());
  }, [dispatch]);

  // Listen to socket events for real-time updates
  useEffect(() => {
    if (!isConnected) return;

    // New notification received
    const unsubNew = on("notification:new", (data) => {
      dispatch(addNotification(data.notification));

      // Show toast for new notifications
      if (data.notification.priority === "urgent") {
        toast.warning(data.notification.title, {
          onClick: () => {
            if (data.notification.actionUrl) {
              window.location.href = data.notification.actionUrl;
            }
          },
        });
      } else {
        toast.info(data.notification.title);
      }
    });

    // Unread count update from server
    const unsubCount = on("notification:count", (data) => {
      dispatch(setUnreadCount(data.count));
    });

    // Cleanup subscriptions
    return () => {
      unsubNew();
      unsubCount();
    };
  }, [isConnected, on, dispatch]);

  /**
   * Handle bell icon click
   * - Desktop: show dropdown
   * - Mobile: show drawer
   */
  const handleOpen = (event) => {
    if (isMobile) {
      setDrawerOpen(true);
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleCloseDropdown = () => {
    setAnchorEl(null);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  return (
    <>
      <Tooltip title="Thông báo">
        <IconButton
          onClick={handleOpen}
          sx={{
            ml: 1,
            color: "text.primary",
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <NotificationIcon sx={{ color: "text.primary" }} />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* Desktop Dropdown */}
      <NotificationDropdown
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseDropdown}
      />

      {/* Mobile Drawer */}
      <NotificationDrawer open={drawerOpen} onClose={handleCloseDrawer} />
    </>
  );
}

export default NotificationBell;
