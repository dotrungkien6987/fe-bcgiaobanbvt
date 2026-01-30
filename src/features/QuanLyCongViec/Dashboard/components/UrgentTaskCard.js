/**
 * UrgentTaskCard - Card hiển thị task gấp với countdown, priority, avatar
 *
 * @param {Object} task - Task object với DaysRemaining, HoursRemaining, MucDoUuTien
 * @param {Function} onClick - Callback khi click card
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardActionArea,
  Stack,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  useTheme,
  alpha,
} from "@mui/material";
import { Timer1, ArrowRight } from "iconsax-react";

// Priority config
const PRIORITY_CONFIG = {
  CAO: { label: "Cao", color: "error" },
  TRUNG_BINH: { label: "TB", color: "warning" },
  THAP: { label: "Thấp", color: "success" },
};

// Get deadline color based on remaining time
const getDeadlineColor = (daysRemaining, hoursRemaining, theme) => {
  if (hoursRemaining <= 0) return theme.palette.error.dark; // Overdue
  if (hoursRemaining <= 24) return theme.palette.error.main; // < 1 day
  if (daysRemaining <= 2) return theme.palette.warning.main; // 1-2 days
  return theme.palette.info.main; // 3+ days
};

// Format countdown text
const formatCountdown = (daysRemaining, hoursRemaining) => {
  if (hoursRemaining <= 0) return "Quá hạn";
  if (hoursRemaining < 24) return `${hoursRemaining}h`;
  return `${daysRemaining}d`;
};

function UrgentTaskCard({ task, onClick }) {
  const theme = useTheme();
  const navigate = useNavigate();

  const {
    _id,
    MaCongViec,
    TieuDe,
    DaysRemaining = 0,
    HoursRemaining = 0,
    MucDoUuTien = "TRUNG_BINH",
    NguoiGiaoViecID,
    PhanTramTienDoTong = 0,
  } = task;

  const deadlineColor = getDeadlineColor(DaysRemaining, HoursRemaining, theme);
  const countdownText = formatCountdown(DaysRemaining, HoursRemaining);
  const priorityConfig =
    PRIORITY_CONFIG[MucDoUuTien] || PRIORITY_CONFIG.TRUNG_BINH;

  // Handle click
  const handleClick = () => {
    if (onClick) {
      onClick(task);
    } else {
      navigate(`/quanlycongviec/congviec/responsive/${_id}`);
    }
  };

  // Get assignor info
  const assignorName = NguoiGiaoViecID?.HoTen || "N/A";
  const assignorAvatar = NguoiGiaoViecID?.Images?.[0]?.url || null;

  return (
    <Card
      sx={{
        mb: 1.5,
        borderLeft: `4px solid ${deadlineColor}`,
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "translateX(4px)",
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardActionArea onClick={handleClick} sx={{ p: 1.5 }}>
        <Stack spacing={1}>
          {/* Row 1: Task code + Title */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {MaCongViec}
            </Typography>
            <Typography
              variant="body2"
              fontWeight={500}
              sx={{
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {TieuDe}
            </Typography>
            <ArrowRight size={16} color={theme.palette.text.secondary} />
          </Stack>

          {/* Row 2: Deadline + Priority + Avatar + Progress */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              {/* Deadline Countdown */}
              <Chip
                icon={<Timer1 size={14} />}
                label={countdownText}
                size="small"
                sx={{
                  bgcolor: alpha(deadlineColor, 0.1),
                  color: deadlineColor,
                  fontWeight: 600,
                  height: 24,
                  "& .MuiChip-icon": {
                    color: deadlineColor,
                  },
                }}
              />

              {/* Priority Badge */}
              <Chip
                label={priorityConfig.label}
                size="small"
                color={priorityConfig.color}
                sx={{ height: 24, fontWeight: 500 }}
              />

              {/* Assignor Avatar */}
              <Avatar
                src={assignorAvatar}
                alt={assignorName}
                sx={{ width: 24, height: 24 }}
              >
                {assignorName.charAt(0)}
              </Avatar>
            </Stack>

            {/* Progress */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{ minWidth: 60 }}
            >
              <Box sx={{ flex: 1, minWidth: 40 }}>
                <LinearProgress
                  variant="determinate"
                  value={PhanTramTienDoTong}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  }}
                />
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={500}
              >
                {PhanTramTienDoTong}%
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </CardActionArea>
    </Card>
  );
}

export default UrgentTaskCard;
