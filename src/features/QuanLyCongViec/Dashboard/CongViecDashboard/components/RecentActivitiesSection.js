/**
 * RecentActivitiesSection - Activities timeline for CongViec Dashboard
 * Displays recent status changes, progress updates, and comments
 */
import React, { useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Avatar,
  Skeleton,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { fetchRecentActivities } from "../../../CongViec/congViecSlice";
import { getActionConfig } from "../constants/activityActions";

// Enable relative time plugin
dayjs.extend(relativeTime);
dayjs.locale("vi");

export default function RecentActivitiesSection({
  limit = 10,
  tuNgay,
  denNgay,
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get data from Redux
  const activities = useSelector((state) => state.congViec.recentActivities);
  const loading = useSelector(
    (state) => state.congViec.recentActivitiesLoading
  );

  // Fetch activities on mount and when date range changes
  useEffect(() => {
    dispatch(fetchRecentActivities({ limit, tuNgay, denNgay }));
  }, [dispatch, limit, tuNgay, denNgay]);

  // Handle activity click - navigate to task detail
  const handleActivityClick = (activity) => {
    if (activity.CongViecID?._id) {
      navigate(`/quanlycongviec/congviec/${activity.CongViecID._id}`);
    }
  };

  // Render skeleton loading
  const renderSkeleton = () => (
    <Stack spacing={2}>
      {[...Array(3)].map((_, i) => (
        <Stack key={i} direction="row" spacing={1.5}>
          <Skeleton variant="circular" width={40} height={40} />
          <Stack flex={1}>
            <Skeleton width="60%" height={20} />
            <Skeleton width="40%" height={16} />
          </Stack>
        </Stack>
      ))}
    </Stack>
  );

  // Render empty state
  const renderEmpty = () => (
    <Box sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
      <Typography variant="body2">Chưa có hoạt động nào</Typography>
    </Box>
  );

  // Render activity description based on type
  const getActivityDescription = (activity) => {
    const {
      LoaiHoatDong,
      HanhDong,
      TuTienDo,
      DenTienDo,
      TuTrangThai,
      DenTrangThai,
    } = activity;
    const config = getActionConfig(HanhDong);
    const nguoiThucHien = activity.NguoiThucHienID?.Ten || "Người dùng";

    if (LoaiHoatDong === "TIEN_DO") {
      return `${nguoiThucHien} ${config.label} từ ${TuTienDo}% → ${DenTienDo}%`;
    }

    if (LoaiHoatDong === "BINH_LUAN") {
      const commentPreview = activity.GhiChu?.substring(0, 50) || "";
      return `${nguoiThucHien} ${config.label}: "${commentPreview}${
        commentPreview.length >= 50 ? "..." : ""
      }"`;
    }

    // TRANG_THAI
    if (DenTrangThai) {
      return `${nguoiThucHien} ${config.label} (${
        TuTrangThai || "..."
      } → ${DenTrangThai})`;
    }

    return `${nguoiThucHien} ${config.label}`;
  };

  return (
    <Card sx={{ bgcolor: "background.paper" }}>
      <CardContent>
        {/* Header */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontSize: { xs: "1rem", sm: "1.125rem" },
            mb: 2,
          }}
        >
          🕐 Hoạt động gần đây
        </Typography>

        {/* Activities Timeline */}
        {loading ? (
          renderSkeleton()
        ) : !activities || activities.length === 0 ? (
          renderEmpty()
        ) : (
          <Stack spacing={2}>
            {activities.map((activity, index) => {
              const config = getActionConfig(activity.HanhDong);
              const ActionIcon = config.icon;
              const congViec = activity.CongViecID;

              return (
                <Stack
                  key={`${activity.CongViecID?._id}-${activity.ThoiGian}-${index}`}
                  direction="row"
                  spacing={1.5}
                  onClick={() => handleActivityClick(activity)}
                  sx={{
                    pb: index < activities.length - 1 ? 2 : 0,
                    borderBottom:
                      index < activities.length - 1 ? "1px solid" : "none",
                    borderColor: "divider",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    borderRadius: 1,
                    px: 1,
                    mx: -1,
                    "&:hover": {
                      bgcolor: (theme) => theme.palette.action.hover,
                    },
                  }}
                >
                  {/* Avatar */}
                  <Avatar
                    src={activity.NguoiThucHienID?.Images?.[0]?.url}
                    alt={activity.NguoiThucHienID?.Ten}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: `${config.color}.light`,
                    }}
                  >
                    <ActionIcon size={20} />
                  </Avatar>

                  {/* Content */}
                  <Stack flex={1} spacing={0.5}>
                    {/* Action description */}
                    <Typography variant="body2" color="text.primary">
                      {getActivityDescription(activity)}
                    </Typography>

                    {/* Task info */}
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      flexWrap="wrap"
                    >
                      <Chip
                        label={congViec?.MaCongViec || "CV-???"}
                        size="small"
                        variant="outlined"
                        sx={{ height: 20, fontSize: "0.75rem" }}
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                      >
                        {congViec?.TieuDe?.substring(0, 40)}
                        {(congViec?.TieuDe?.length || 0) > 40 ? "..." : ""}
                      </Typography>
                    </Stack>

                    {/* Time */}
                    <Typography variant="caption" color="text.secondary">
                      {dayjs(activity.ThoiGian).fromNow()}
                    </Typography>
                  </Stack>
                </Stack>
              );
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
