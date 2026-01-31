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

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Badge,
  useTheme,
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Slide,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import {
  Home,
  Task,
  Medal,
  Category,
  Menu as MenuIcon,
  Magicpen,
} from "iconsax-react";
import {
  Close as CloseIcon,
  AutoAwesome as NewIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { MenuGridPage } from "features/WorkDashboard/components";
import MenuGridPageV3 from "features/WorkDashboard/components/MenuGridPageV3";

// Slide transition for menu dialog
const SlideTransition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

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
    path: "/quanlycongviec/cong-viec-dashboard",
    icon: Task,
    matcher: (pathname) =>
      pathname.startsWith("/quanlycongviec/cong-viec-dashboard") ||
      pathname.startsWith("/quanlycongviec/cong-viec-cua-toi") ||
      pathname.startsWith("/quanlycongviec/congviec"), // Legacy support
  },
  {
    label: "Yêu cầu",
    path: "/quanlycongviec/yeu-cau-dashboard",
    icon: Category,
    matcher: (pathname) =>
      pathname.startsWith("/quanlycongviec/yeu-cau-dashboard") ||
      pathname.startsWith("/quanlycongviec/yeucau"),
    badge: "yeuCauCount", // Redux state path for badge count
  },
  {
    label: "KPI",
    path: "/quanlycongviec/kpi",
    icon: Medal,
    matcher: (pathname) => pathname.startsWith("/quanlycongviec/kpi"),
    // badge: "kpiPendingCount", // TODO: Add KPI badge counter
  },
  {
    label: "Menu",
    icon: MenuIcon,
    isDialog: true,
    dialogType: "menuV1",
  },
  {
    label: "Menu V2",
    icon: Magicpen,
    isDialog: true,
    dialogType: "menuV2",
    badge: "beta", // Special badge type
  },
];

/**
 * MobileBottomNav Component
 */
function MobileBottomNav() {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuDialogOpen, setMenuDialogOpen] = useState(false);
  const [menuV2DialogOpen, setMenuV2DialogOpen] = useState(false);

  // Badge counts from Redux
  const yeuCauBadges = useSelector((state) => state.ticket?.badgeCounts);
  const notificationCount = useSelector(
    (state) => state.notification?.unreadCount || 0,
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
      if (targetItem.isDialog) {
        if (targetItem.dialogType === "menuV2") {
          setMenuV2DialogOpen(true);
        } else {
          setMenuDialogOpen(true);
        }
      } else {
        navigate(targetItem.path);
      }
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
          const badgeCount =
            item.badge && item.badge !== "beta" ? getBadgeCount(item.badge) : 0;
          const isBeta = item.badge === "beta";

          // Render icon with optional badge
          const renderIconWithBadge = () => {
            const iconElement = (
              <IconComponent
                size={24}
                variant={activeIndex === index ? "Bold" : "Linear"}
              />
            );

            if (isBeta) {
              return (
                <Badge
                  badgeContent="✨"
                  color="secondary"
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: "0.5rem",
                      height: 14,
                      minWidth: 14,
                      padding: 0,
                      top: -2,
                      right: -2,
                    },
                  }}
                >
                  {iconElement}
                </Badge>
              );
            }

            if (badgeCount > 0) {
              return (
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
                  {iconElement}
                </Badge>
              );
            }

            return iconElement;
          };

          return (
            <BottomNavigationAction
              key={item.path || item.label}
              label={item.label}
              icon={renderIconWithBadge()}
            />
          );
        })}
      </BottomNavigation>

      {/* Menu Dialog (V1) */}
      <Dialog
        open={menuDialogOpen}
        onClose={() => setMenuDialogOpen(false)}
        fullScreen
        TransitionComponent={SlideTransition}
        PaperProps={{
          sx: {
            borderRadius: "16px 16px 0 0",
            maxHeight: "90vh",
          },
        }}
      >
        <Box
          sx={{
            position: "sticky",
            top: 0,
            display: "flex",
            justifyContent: "flex-end",
            p: 1,
            bgcolor: "background.paper",
            borderBottom: 1,
            borderColor: "divider",
            zIndex: 1,
          }}
        >
          <IconButton onClick={() => setMenuDialogOpen(false)} size="large">
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 0 }}>
          <MenuGridPage />
        </DialogContent>
      </Dialog>

      {/* Menu Dialog V2 (Beta - Single Source of Truth) */}
      <Dialog
        open={menuV2DialogOpen}
        onClose={() => setMenuV2DialogOpen(false)}
        fullScreen
        TransitionComponent={SlideTransition}
        PaperProps={{
          sx: {
            borderRadius: "16px 16px 0 0",
            maxHeight: "95vh",
            background:
              theme.palette.mode === "dark"
                ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
                : "linear-gradient(135deg, #f5f7fa 0%, #e4e8ed 100%)",
          },
        }}
      >
        <Box
          sx={{
            position: "sticky",
            top: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 1.5,
            px: 2,
            bgcolor:
              theme.palette.mode === "dark"
                ? "rgba(26, 26, 46, 0.95)"
                : "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            borderBottom: 1,
            borderColor: "divider",
            zIndex: 1,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <NewIcon sx={{ color: "primary.main" }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Menu V2
            </Typography>
            <Chip
              label="Beta"
              color="secondary"
              size="small"
              sx={{
                height: 20,
                fontSize: "0.65rem",
                fontWeight: 700,
              }}
            />
          </Stack>
          <IconButton onClick={() => setMenuV2DialogOpen(false)} size="large">
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 0 }}>
          <MenuGridPageV3 onNavigate={() => setMenuV2DialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </Paper>
  );
}

export default MobileBottomNav;
