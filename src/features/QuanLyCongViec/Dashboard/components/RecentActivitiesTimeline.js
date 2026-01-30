/**
 * RecentActivitiesTimeline - Timeline hoạt động gần đây (CongViec + YeuCau)
 *
 * Shows: 5 recent activities with type icons, time ago, collapsible
 * Supports: Mixed CongViec and YeuCau activities from Redux state
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Skeleton,
  Chip,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Activity,
  ArrowDown2,
  ArrowUp2,
  MessageText,
  TickCircle,
  Edit,
  Timer,
  CloseCircle,
  Task,
  MessageQuestion,
} from "iconsax-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { WorkRoutes } from "utils/navigationHelper";

dayjs.extend(relativeTime);
dayjs.locale("vi");

// Activity type icon mapping
const getActivityIcon = (activity, theme) => {
  const { type, loaiHoatDong } = activity;

  // Type-based icons (CongViec vs YeuCau)
  if (type === "YEU_CAU") {
    return {
      icon: <MessageQuestion size={14} variant="Bold" />,
      color: theme.palette.info.main,
    };
  }

  // LoaiHoatDong-based icons for CongViec
  switch (loaiHoatDong) {
    case "HOAN_THANH":
    case "DUYET":
      return {
        icon: <TickCircle size={14} variant="Bold" />,
        color: theme.palette.success.main,
      };
    case "TRANG_THAI":
      return {
        icon: <Edit size={14} variant="Bold" />,
        color: theme.palette.warning.main,
      };
    case "TIEN_DO":
    case "CAP_NHAT_TIEN_DO":
      return {
        icon: <Timer size={14} variant="Bold" />,
        color: theme.palette.info.main,
      };
    case "BINH_LUAN":
      return {
        icon: <MessageText size={14} variant="Bold" />,
        color: theme.palette.primary.main,
      };
    case "TU_CHOI":
      return {
        icon: <CloseCircle size={14} variant="Bold" />,
        color: theme.palette.error.main,
      };
    default:
      return {
        icon: <Task size={14} variant="Bold" />,
        color: theme.palette.primary.main,
      };
  }
};

function ActivityItem({ activity, theme, onNavigate }) {
  const { icon, color } = getActivityIcon(activity, theme);
  const isCongViec = activity.type === "CONG_VIEC";

  // Get title from activity
  const title = isCongViec
    ? activity.congViec?.tieuDe || "Công việc"
    : activity.yeuCau?.tieuDe || "Yêu cầu";

  return (
    <ListItem
      sx={{
        px: 1,
        py: 0.75,
        borderRadius: 1,
        cursor: "pointer",
        "&:hover": {
          bgcolor: alpha(theme.palette.primary.main, 0.04),
        },
      }}
      onClick={() => onNavigate(activity)}
    >
      {/* Icon */}
      <ListItemIcon sx={{ minWidth: 36 }}>
        <Box
          sx={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha(color, 0.12),
            color: color,
          }}
        >
          {icon}
        </Box>
      </ListItemIcon>

      {/* Content */}
      <ListItemText
        primary={
          <Typography
            variant="body2"
            fontWeight={500}
            noWrap
            sx={{ maxWidth: "90%" }}
          >
            {title}
          </Typography>
        }
        secondary={
          <Stack spacing={0.3}>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{ maxWidth: "90%" }}
            >
              {activity.moTa}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Chip
                label={isCongViec ? "CV" : "YC"}
                size="small"
                sx={{
                  height: 16,
                  fontSize: "0.6rem",
                  bgcolor: alpha(
                    isCongViec
                      ? theme.palette.primary.main
                      : theme.palette.info.main,
                    0.1,
                  ),
                  color: isCongViec
                    ? theme.palette.primary.main
                    : theme.palette.info.main,
                }}
              />
              {activity.nguoiThucHien?.ten && (
                <>
                  <Avatar
                    src={activity.nguoiThucHien?.avatar}
                    sx={{ width: 14, height: 14, fontSize: 8 }}
                  >
                    {(activity.nguoiThucHien?.ten || "?").charAt(0)}
                  </Avatar>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontSize="0.65rem"
                  >
                    {activity.nguoiThucHien?.ten}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    •
                  </Typography>
                </>
              )}
              <Typography
                variant="caption"
                color="text.disabled"
                fontSize="0.65rem"
              >
                {dayjs(activity.thoiGian).fromNow()}
              </Typography>
            </Stack>
          </Stack>
        }
      />
    </ListItem>
  );
}

function RecentActivitiesTimeline() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(true);

  // Get activities from Redux store
  const { items: activities, isLoading } = useSelector(
    (state) =>
      state.workDashboard?.recentActivities || { items: [], isLoading: false },
  );

  // Handle navigate to detail
  const handleNavigate = (activity) => {
    if (activity.type === "CONG_VIEC") {
      const congViecId = activity.congViec?.id;
      if (congViecId) {
        navigate(WorkRoutes.congViecDetail(congViecId));
      }
    } else {
      const yeuCauId = activity.yeuCau?.id;
      if (yeuCauId) {
        navigate(WorkRoutes.yeuCauDetail?.(yeuCauId) || `/yeucau/${yeuCauId}`);
      }
    }
  };

  // Toggle expand/collapse
  const handleToggle = () => {
    setExpanded(!expanded);
  };

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ pb: expanded ? 2 : "16px !important" }}>
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          onClick={handleToggle}
          sx={{ cursor: "pointer" }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha(theme.palette.info.main, 0.1),
              }}
            >
              <Activity
                size={16}
                color={theme.palette.info.main}
                variant="Bold"
              />
            </Box>
            <Typography variant="subtitle1" fontWeight={600}>
              Hoạt động gần đây
            </Typography>
          </Stack>
          <IconButton size="small">
            {expanded ? <ArrowUp2 size={16} /> : <ArrowDown2 size={16} />}
          </IconButton>
        </Stack>

        {/* Activities List */}
        <Collapse in={expanded}>
          <Box mt={2}>
            {isLoading ? (
              // Loading skeleton
              <Stack spacing={1}>
                {[1, 2, 3].map((i) => (
                  <Stack
                    key={i}
                    direction="row"
                    spacing={2}
                    alignItems="center"
                  >
                    <Skeleton variant="circular" width={26} height={26} />
                    <Box flex={1}>
                      <Skeleton variant="text" width="60%" height={18} />
                      <Skeleton variant="text" width="40%" height={14} />
                    </Box>
                  </Stack>
                ))}
              </Stack>
            ) : activities.length === 0 ? (
              // Empty state
              <Box
                sx={{
                  py: 3,
                  textAlign: "center",
                  bgcolor: alpha(theme.palette.grey[500], 0.05),
                  borderRadius: 1,
                }}
              >
                <Activity
                  size={32}
                  color={theme.palette.grey[400]}
                  variant="Bulk"
                />
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Chưa có hoạt động nào
                </Typography>
              </Box>
            ) : (
              // Activity list
              <List disablePadding>
                {activities.map((activity, index) => (
                  <ActivityItem
                    key={`${activity.type}-${index}`}
                    activity={activity}
                    theme={theme}
                    onNavigate={handleNavigate}
                  />
                ))}
              </List>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}

export default RecentActivitiesTimeline;
