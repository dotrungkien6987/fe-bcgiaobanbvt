/**
 * YeuCauTimeline - Hiển thị lịch sử hành động của yêu cầu
 */
import React from "react";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  timelineOppositeContentClasses,
} from "@mui/lab";
import { Typography, Paper, Box, Avatar, Stack, Skeleton } from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  SwapHoriz as SwapIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Warning as WarningIcon,
  Comment as CommentIcon,
  Lock as LockIcon,
} from "@mui/icons-material";

import {
  formatDateTime,
  getTenNguoi,
  getEnhancedDescription,
} from "../yeuCau.utils";
import { HANH_DONG } from "../yeuCau.constants";

// Map action to icon and color
const getActionStyle = (action) => {
  const styles = {
    // Frontend enums
    [HANH_DONG.TAO]: { icon: <AddIcon />, color: "primary" },
    [HANH_DONG.SUA]: { icon: <EditIcon />, color: "info" },
    [HANH_DONG.XOA]: { icon: <DeleteIcon />, color: "error" },

    // Backend enums (from LichSuYeuCau)
    TAO_MOI: { icon: <AddIcon />, color: "primary" },
    SUA_YEU_CAU: { icon: <EditIcon />, color: "info" },
    THEM_BINH_LUAN: { icon: <CommentIcon />, color: "grey" },
    THEM_FILE: { icon: <SendIcon />, color: "info" },

    // Common actions
    [HANH_DONG.TIEP_NHAN]: { icon: <CheckIcon />, color: "success" },
    [HANH_DONG.TU_CHOI]: { icon: <CloseIcon />, color: "error" },
    [HANH_DONG.DIEU_PHOI]: { icon: <PersonIcon />, color: "info" },
    [HANH_DONG.GUI_VE_KHOA]: { icon: <SwapIcon />, color: "warning" },
    [HANH_DONG.HOAN_THANH]: { icon: <CheckIcon />, color: "success" },
    [HANH_DONG.DONG]: { icon: <LockIcon />, color: "grey" },
    [HANH_DONG.MO_LAI]: { icon: <RefreshIcon />, color: "warning" },
    [HANH_DONG.YEU_CAU_XU_LY_TIEP]: { icon: <RefreshIcon />, color: "warning" },
    [HANH_DONG.HUY_TIEP_NHAN]: { icon: <CloseIcon />, color: "warning" },
    [HANH_DONG.DOI_THOI_GIAN_HEN]: { icon: <ScheduleIcon />, color: "info" },
    [HANH_DONG.DANH_GIA]: { icon: <StarIcon />, color: "warning" },
    [HANH_DONG.NHAC_LAI]: { icon: <WarningIcon />, color: "warning" },
    [HANH_DONG.BAO_QUAN_LY]: { icon: <WarningIcon />, color: "error" },
    [HANH_DONG.APPEAL]: { icon: <WarningIcon />, color: "error" },
    [HANH_DONG.BINH_LUAN]: { icon: <CommentIcon />, color: "grey" },
    [HANH_DONG.TU_DONG_DONG]: { icon: <LockIcon />, color: "grey" },
  };

  return styles[action] || { icon: <SendIcon />, color: "grey" };
};

function YeuCauTimelineItem({ item }) {
  const { icon, color } = getActionStyle(item.HanhDong);

  return (
    <TimelineItem>
      <TimelineOppositeContent color="text.secondary">
        <Typography variant="caption" display="block">
          {formatDateTime(item.ThoiGian)}
        </Typography>
      </TimelineOppositeContent>

      <TimelineSeparator>
        <TimelineDot color={color} variant="outlined">
          {icon}
        </TimelineDot>
        <TimelineConnector />
      </TimelineSeparator>

      <TimelineContent>
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            bgcolor: "background.default",
            borderRadius: 1,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
            <Avatar
              sx={{ width: 24, height: 24, fontSize: 12 }}
              src={item.NguoiThucHienID?.Avatar}
            >
              {getTenNguoi(item.NguoiThucHienID)?.[0]}
            </Avatar>
            <Typography variant="subtitle2" fontWeight="medium">
              {getTenNguoi(item.NguoiThucHienID)}
            </Typography>
          </Stack>

          <Typography variant="body2" fontWeight="medium">
            {getEnhancedDescription(item)}
          </Typography>

          {item.GhiChu && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {item.GhiChu}
            </Typography>
          )}
        </Paper>
      </TimelineContent>
    </TimelineItem>
  );
}

function YeuCauTimeline({ lichSu = [], loading = false }) {
  if (loading) {
    return (
      <Stack spacing={2}>
        {[1, 2, 3].map((i) => (
          <Stack key={i} direction="row" spacing={2} alignItems="center">
            <Skeleton variant="circular" width={40} height={40} />
            <Box flex={1}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </Box>
          </Stack>
        ))}
      </Stack>
    );
  }

  if (lichSu.length === 0) {
    return (
      <Typography color="text.secondary" textAlign="center" py={2}>
        Chưa có lịch sử
      </Typography>
    );
  }

  return (
    <Timeline
      sx={{
        [`& .${timelineOppositeContentClasses.root}`]: {
          flex: 0.3,
        },
        p: 0,
        m: 0,
      }}
    >
      {lichSu.map((item, index) => (
        <YeuCauTimelineItem key={item._id || index} item={item} />
      ))}
    </Timeline>
  );
}

export default YeuCauTimeline;
