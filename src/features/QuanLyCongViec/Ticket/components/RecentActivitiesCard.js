/**
 * RecentActivitiesCard Component
 *
 * Timeline hoạt động gần đây (Recent Activities)
 * - Compact timeline với icons
 * - Relative time (dayjs.fromNow())
 * - Click to navigate to detail
 *
 * Props:
 * - limit: number (default 5 on mobile, 10 on desktop)
 * - tuNgay, denNgay: Date - Date range filter
 * - onActivityClick: (activity) => void
 * - onViewAll: () => void
 */
import React, { useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Avatar,
  Button,
  Skeleton,
  Chip,
} from "@mui/material";
import {
  CheckCircle as CompleteIcon,
  Schedule as PendingIcon,
  PlayArrow as PlayArrowIcon,
  Cancel as RejectIcon,
  Star as RatingIcon,
  Send as SendIcon,
  PersonAdd as AssignIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import {
  fetchRecentActivities,
  selectRecentActivities,
  selectRecentActivitiesLoading,
} from "../yeuCauSlice";

// Enable relative time plugin
dayjs.extend(relativeTime);
dayjs.locale("vi");

// Action icon mapping (from LichSuYeuCau HANH_DONG enum)
const ACTION_ICONS = {
  TAO_MOI: <SendIcon fontSize="small" />,
  TIEP_NHAN: <PlayArrowIcon fontSize="small" />,
  DIEU_PHOI: <AssignIcon fontSize="small" />,
  HOAN_THANH: <CompleteIcon fontSize="small" />,
  DANH_GIA: <RatingIcon fontSize="small" />,
  DONG: <CompleteIcon fontSize="small" />,
  TU_CHOI: <RejectIcon fontSize="small" />,
  MO_LAI: <PendingIcon fontSize="small" />,
};

// Action color mapping
const ACTION_COLORS = {
  TAO_MOI: "info",
  TIEP_NHAN: "primary",
  DIEU_PHOI: "secondary",
  HOAN_THANH: "success",
  DANH_GIA: "warning",
  DONG: "default",
  TU_CHOI: "error",
  MO_LAI: "info",
};

// Action label mapping
const ACTION_LABELS = {
  TAO_MOI: "tạo yêu cầu",
  TIEP_NHAN: "tiếp nhận",
  DIEU_PHOI: "điều phối",
  HOAN_THANH: "hoàn thành",
  DANH_GIA: "đánh giá",
  DONG: "đóng",
  TU_CHOI: "từ chối",
  MO_LAI: "mở lại",
  SUA_YEU_CAU: "cập nhật",
  THEM_BINH_LUAN: "bình luận",
  THEM_FILE: "thêm file",
};

export default function RecentActivitiesCard({
  limit = 5,
  tuNgay,
  denNgay,
  onActivityClick,
  onViewAll,
}) {
  const dispatch = useDispatch();
  const activities = useSelector(selectRecentActivities);
  const loading = useSelector(selectRecentActivitiesLoading);

  // Load data
  useEffect(() => {
    dispatch(
      fetchRecentActivities({
        limit,
        tuNgay,
        denNgay,
      })
    );
  }, [dispatch, limit, tuNgay, denNgay]);

  const handleActivityClick = (activity) => {
    if (onActivityClick && activity.YeuCauID) {
      onActivityClick(activity);
    }
  };

  // Render skeleton loading
  const renderSkeleton = () => (
    <Stack spacing={2}>
      {[1, 2, 3].map((i) => (
        <Stack key={i} direction="row" spacing={2}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="60%" />
            <Skeleton width="90%" />
            <Skeleton width="30%" />
          </Box>
        </Stack>
      ))}
    </Stack>
  );

  // Render empty state
  const renderEmpty = () => (
    <Box
      sx={{
        py: 4,
        textAlign: "center",
        color: "text.secondary",
      }}
    >
      <PendingIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
      <Typography variant="body2">Chưa có hoạt động nào</Typography>
    </Box>
  );

  return (
    <Box sx={{ mb: 3 }}>
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2, px: { xs: 2, md: 0 } }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontSize: { xs: "1rem", sm: "1.125rem" },
          }}
        >
          🕐 Hoạt động gần đây
        </Typography>
      </Stack>

      {/* Activities Timeline */}
      {loading ? (
        renderSkeleton()
      ) : !activities || activities.length === 0 ? (
        renderEmpty()
      ) : (
        <Stack spacing={2}>
          {activities.map((activity, index) => {
            const actionIcon = ACTION_ICONS[activity.HanhDong] || (
              <PendingIcon fontSize="small" />
            );
            const actionColor = ACTION_COLORS[activity.HanhDong] || "default";
            const actionLabel =
              ACTION_LABELS[activity.HanhDong] ||
              activity.HanhDong.toLowerCase();

            return (
              <Stack
                key={activity._id}
                direction="row"
                spacing={1.5}
                sx={{
                  pb: index < activities.length - 1 ? 2 : 0,
                  borderBottom:
                    index < activities.length - 1 ? "1px solid" : "none",
                  borderColor: "divider",
                  cursor: onActivityClick ? "pointer" : "default",
                  "&:hover": onActivityClick
                    ? {
                        bgcolor: (theme) => theme.palette.action.hover,
                        borderRadius: 1,
                        mx: { xs: -2, md: 0 },
                        px: { xs: 2, md: 0 },
                      }
                    : {},
                  transition: "all 0.2s",
                }}
                onClick={() => handleActivityClick(activity)}
              >
                {/* Icon */}
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: `${actionColor}.main`,
                    color: "white",
                  }}
                >
                  {actionIcon}
                </Avatar>

                {/* Content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  {/* Action description */}
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      fontSize: { xs: "0.875rem", sm: "0.938rem" },
                      mb: 0.25,
                    }}
                  >
                    <strong>
                      {activity.NguoiThucHienID?.Ten || "Người dùng"}
                    </strong>{" "}
                    {actionLabel}
                  </Typography>

                  {/* YeuCau title */}
                  {activity.YeuCauID && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: "0.813rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        mb: 0.5,
                      }}
                    >
                      "{activity.YeuCauID.TieuDe}"
                    </Typography>
                  )}

                  {/* Time + Code */}
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ flexWrap: "wrap", gap: 0.5 }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: "0.75rem" }}
                    >
                      {dayjs(activity.ThoiGian).fromNow()}
                    </Typography>
                    {activity.YeuCauID?.MaYeuCau && (
                      <Chip
                        label={activity.YeuCauID.MaYeuCau}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: "0.688rem",
                          fontWeight: 600,
                        }}
                      />
                    )}
                  </Stack>
                </Box>
              </Stack>
            );
          })}
        </Stack>
      )}

      {/* View All Button */}
      {!loading && activities && activities.length > 0 && onViewAll && (
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Button
            size="small"
            onClick={onViewAll}
            sx={{ textTransform: "none" }}
          >
            Xem tất cả →
          </Button>
        </Box>
      )}
    </Box>
  );
}
