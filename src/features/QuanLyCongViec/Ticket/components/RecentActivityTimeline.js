/**
 * RecentActivityTimeline - Timeline hiển thị activities gần nhất
 *
 * Features:
 * - MUI Timeline component
 * - Avatar + action text + relative time
 * - Color coded by action type
 * - Click to view detail
 * - Mobile-optimized compact mode
 */
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Stack,
  Chip,
  useTheme,
  Skeleton,
  alpha,
} from "@mui/material";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from "@mui/lab";
import { Send, Receive, TickCircle, CloseCircle, Edit2 } from "iconsax-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

/**
 * Get action icon and color
 */
function getActionStyle(actionType) {
  const styles = {
    created: {
      icon: Send,
      color: "primary",
      label: "Tạo mới",
    },
    received: {
      icon: Receive,
      color: "info",
      label: "Nhận",
    },
    completed: {
      icon: TickCircle,
      color: "success",
      label: "Hoàn thành",
    },
    rejected: {
      icon: CloseCircle,
      color: "error",
      label: "Từ chối",
    },
    updated: {
      icon: Edit2,
      color: "warning",
      label: "Cập nhật",
    },
  };

  return styles[actionType] || styles.updated;
}

/**
 * Single Timeline Item Component
 */
function ActivityItem({ activity, onClick }) {
  const theme = useTheme();
  const actionStyle = getActionStyle(activity.actionType);
  const Icon = actionStyle.icon;

  return (
    <TimelineItem>
      {/* Time (opposite content - hidden on mobile) */}
      <TimelineOppositeContent
        sx={{
          flex: 0.2,
          display: { xs: "none", sm: "block" },
          py: 1.5,
        }}
        color="text.secondary"
        variant="caption"
      >
        {dayjs(activity.createdAt).fromNow()}
      </TimelineOppositeContent>

      {/* Dot with Icon */}
      <TimelineSeparator>
        <TimelineDot
          color={actionStyle.color}
          sx={{
            boxShadow: `0 0 0 4px ${alpha(
              theme.palette[actionStyle.color].main,
              0.1
            )}`,
          }}
        >
          <Icon size={16} variant="Bold" />
        </TimelineDot>
        <TimelineConnector />
      </TimelineSeparator>

      {/* Content */}
      <TimelineContent sx={{ py: 1.5, px: 2 }}>
        <Box
          onClick={() => onClick && onClick(activity)}
          sx={{
            cursor: "pointer",
            p: 1.5,
            borderRadius: 1,
            bgcolor: "background.paper",
            border: 1,
            borderColor: "divider",
            "&:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderColor: "primary.main",
            },
            transition: "all 0.2s",
          }}
        >
          <Stack spacing={1}>
            {/* Actor + Action */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <Avatar
                src={activity.actorAvatar}
                alt={activity.actorName}
                sx={{ width: 24, height: 24 }}
              >
                {activity.actorName?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="body2" fontWeight={600}>
                {activity.actorName}
              </Typography>
              <Chip
                label={actionStyle.label}
                size="small"
                color={actionStyle.color}
                sx={{ height: 20, fontSize: "0.7rem" }}
              />
            </Stack>

            {/* Request Title */}
            <Typography
              variant="body2"
              color="text.primary"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {activity.yeuCauTitle}
            </Typography>

            {/* Time (mobile only) */}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: { xs: "block", sm: "none" } }}
            >
              {dayjs(activity.createdAt).fromNow()}
            </Typography>
          </Stack>
        </Box>
      </TimelineContent>
    </TimelineItem>
  );
}

/**
 * Loading Skeleton
 */
function TimelineSkeleton() {
  return (
    <Stack spacing={2}>
      {[1, 2, 3].map((i) => (
        <Stack key={i} direction="row" spacing={2} alignItems="center">
          <Skeleton variant="circular" width={40} height={40} />
          <Box flex={1}>
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="80%" />
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}

/**
 * Main Component
 */
export default function RecentActivityTimeline({
  activities = [],
  loading = false,
  onActivityClick,
}) {
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Hoạt động gần đây
          </Typography>
          <TimelineSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🕐 Hoạt động gần đây
          </Typography>
          <Box
            sx={{
              py: 4,
              textAlign: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Chưa có hoạt động nào
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          🕐 Hoạt động gần đây
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          {activities.length} hoạt động mới nhất
        </Typography>

        <Timeline
          position="right"
          sx={{
            p: 0,
            m: 0,
            "& .MuiTimelineItem-root": {
              minHeight: "auto",
            },
            "& .MuiTimelineItem-root:before": {
              flex: { xs: 0, sm: 0.2 },
            },
          }}
        >
          {activities.map((activity, index) => (
            <ActivityItem
              key={activity._id || index}
              activity={activity}
              onClick={onActivityClick}
            />
          ))}
        </Timeline>
      </CardContent>
    </Card>
  );
}
