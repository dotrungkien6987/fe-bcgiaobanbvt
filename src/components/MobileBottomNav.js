/**
 * MobileBottomNav Component
 *
 * Mobile-optimized bottom navigation bar for quick access to main sections
 *
 * Features:
 * - Fixed position at bottom of screen
 * - 5 main navigation items
 * - Badge support for notifications
 * - Active state highlighting
 * - Material Design 3 styling
 * - Smooth transitions
 *
 * Usage:
 * ```javascript
 * import MobileBottomNav from 'components/MobileBottomNav';
 *
 * <MobileBottomNav />
 * ```
 */

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Badge,
  useTheme,
} from "@mui/material";
import { Home, Task, Notification, Category, Settings } from "iconsax-react";
import { useSelector } from "react-redux";

/**
 * Navigation items configuration
 */
const NAV_ITEMS = [
  {
    label: "Trang chủ",
    path: "/quanlycongviec",
    icon: Home,
    exactMatch: true, // Only highlight on exact path match
  },
  {
    label: "Công việc",
    path: "/quanlycongviec/cong-viec-cua-toi",
    icon: Task,
    matcher: (pathname) =>
      pathname.startsWith("/quanlycongviec/cong-viec-cua-toi") ||
      pathname.startsWith("/quanlycongviec/congviec"), // Legacy support
  },
  {
    label: "Yêu cầu",
    path: "/quanlycongviec/yeucau",
    icon: Category,
    matcher: (pathname) => pathname.startsWith("/quanlycongviec/yeucau"),
    badge: "yeuCauCount", // Redux state path for badge count
  },
  {
    label: "Thông báo",
    path: "/quanlycongviec/thong-bao",
    icon: Notification,
    matcher: (pathname) => pathname.startsWith("/quanlycongviec/thong-bao"),
    badge: "notificationCount",
  },
  {
    label: "Cài đặt",
    path: "/quanlycongviec/cai-dat",
    icon: Settings,
    matcher: (pathname) => pathname.startsWith("/quanlycongviec/cai-dat"),
  },
];

/**
 * MobileBottomNav Component
 */
function MobileBottomNav() {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Badge counts from Redux
  const yeuCauBadges = useSelector((state) => state.ticket?.badgeCounts);
  const notificationCount = useSelector(
    (state) => state.notification?.unreadCount || 0
  );

  // Calculate badge values
  const getBadgeCount = (badgeKey) => {
    if (badgeKey === "yeuCauCount") {
      // Sum all YeuCau badges
      return yeuCauBadges
        ? Object.values(yeuCauBadges).reduce((sum, val) => sum + (val || 0), 0)
        : 0;
    }
    if (badgeKey === "notificationCount") {
      return notificationCount;
    }
    return 0;
  };

  // Determine active navigation index
  const getActiveIndex = () => {
    const currentPath = location.pathname;

    const activeIndex = NAV_ITEMS.findIndex((item) => {
      if (item.exactMatch) {
        return currentPath === item.path;
      }
      if (item.matcher) {
        return item.matcher(currentPath);
      }
      return currentPath.startsWith(item.path);
    });

    return activeIndex >= 0 ? activeIndex : false;
  };

  const activeIndex = getActiveIndex();

  // Handle navigation change
  const handleChange = (event, newValue) => {
    const targetItem = NAV_ITEMS[newValue];
    if (targetItem) {
      navigate(targetItem.path);
    }
  };

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: theme.zIndex.appBar,
        borderTop: `1px solid ${theme.palette.divider}`,
        // Safe area inset for iOS notch
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      elevation={8}
    >
      <BottomNavigation
        value={activeIndex}
        onChange={handleChange}
        showLabels
        sx={{
          height: "auto",
          minHeight: 56,
          "& .MuiBottomNavigationAction-root": {
            minWidth: "auto",
            padding: "6px 12px 8px",
            transition: "all 0.2s ease",
            color: theme.palette.text.secondary,
            "&.Mui-selected": {
              color: theme.palette.primary.main,
              paddingTop: "4px",
            },
            "& .MuiBottomNavigationAction-label": {
              fontSize: "0.75rem",
              marginTop: "4px",
              opacity: 0.7,
              transition: "all 0.2s ease",
              "&.Mui-selected": {
                fontSize: "0.75rem",
                opacity: 1,
                fontWeight: 600,
              },
            },
          },
        }}
      >
        {NAV_ITEMS.map((item, index) => {
          const IconComponent = item.icon;
          const badgeCount = item.badge ? getBadgeCount(item.badge) : 0;

          return (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              icon={
                badgeCount > 0 ? (
                  <Badge
                    badgeContent={badgeCount > 99 ? "99+" : badgeCount}
                    color="error"
                    max={99}
                    sx={{
                      "& .MuiBadge-badge": {
                        fontSize: "0.65rem",
                        height: 16,
                        minWidth: 16,
                        padding: "0 4px",
                      },
                    }}
                  >
                    <IconComponent
                      size={24}
                      variant={activeIndex === index ? "Bold" : "Linear"}
                    />
                  </Badge>
                ) : (
                  <IconComponent
                    size={24}
                    variant={activeIndex === index ? "Bold" : "Linear"}
                  />
                )
              }
            />
          );
        })}
      </BottomNavigation>
    </Paper>
  );
}

export default MobileBottomNav;
