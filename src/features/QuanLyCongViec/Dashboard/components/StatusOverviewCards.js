/**
 * StatusOverviewCards - 2 cards hiển thị tổng quan Công việc và Yêu cầu
 *
 * Card 1: Công việc (Đang làm, Tôi giao, Gấp, Quá hạn)
 * Card 2: Yêu cầu (Tôi gửi, Cần xử lý, Quá hạn)
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Stack,
  Typography,
  Skeleton,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Task,
  MessageQuestion,
  Timer1,
  Danger,
  Send2,
  ReceiveSquare,
  TaskSquare,
} from "iconsax-react";
import { WorkRoutes } from "utils/navigationHelper";

/**
 * StatItem - Một dòng số liệu trong card
 */
function StatItem({ icon: Icon, label, value, color, isAlert = false }) {
  const theme = useTheme();
  const colorValue = color || theme.palette.primary.main;

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        py: 0.75,
        px: 1,
        borderRadius: 1,
        bgcolor: isAlert ? alpha(colorValue, 0.08) : "transparent",
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Icon
          size={16}
          color={colorValue}
          variant={isAlert ? "Bold" : "Linear"}
        />
        <Typography
          variant="body2"
          color={isAlert ? colorValue : "text.secondary"}
          fontWeight={isAlert ? 600 : 400}
        >
          {label}
        </Typography>
      </Stack>
      <Typography
        variant="h6"
        fontWeight={700}
        color={isAlert && value > 0 ? colorValue : "text.primary"}
      >
        {value}
      </Typography>
    </Stack>
  );
}

/**
 * CongViecCard - Card tổng quan Công việc
 */
function CongViecCard({ data, isLoading, nhanVienId }) {
  const theme = useTheme();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width={100} height={30} />
          <Skeleton variant="rectangular" height={120} sx={{ mt: 1 }} />
        </CardContent>
      </Card>
    );
  }

  const { dangLam = 0, toiGiao = 0, gap = 0, quaHan = 0 } = data || {};

  return (
    <Card
      sx={{
        height: "100%",
        transition: "all 0.2s",
        "&:hover": {
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardActionArea
        onClick={() => navigate(WorkRoutes.congViecList(nhanVienId))}
        sx={{ height: "100%" }}
      >
        <CardContent>
          {/* Header */}
          <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              }}
            >
              <Task
                size={18}
                color={theme.palette.primary.main}
                variant="Bold"
              />
            </Box>
            <Typography variant="subtitle1" fontWeight={600}>
              Công việc
            </Typography>
          </Stack>

          {/* Stats */}
          <Stack spacing={0.5}>
            <StatItem
              icon={Task}
              label="Đang làm"
              value={dangLam}
              color={theme.palette.primary.main}
            />
            <StatItem
              icon={TaskSquare}
              label="Tôi giao"
              value={toiGiao}
              color={theme.palette.secondary.main}
            />
            <StatItem
              icon={Timer1}
              label="Gấp (24h)"
              value={gap}
              color={theme.palette.warning.main}
              isAlert={gap > 0}
            />
            <StatItem
              icon={Danger}
              label="Quá hạn"
              value={quaHan}
              color={theme.palette.error.main}
              isAlert={quaHan > 0}
            />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

/**
 * YeuCauCard - Card tổng quan Yêu cầu
 */
function YeuCauCard({ data, isLoading }) {
  const theme = useTheme();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width={100} height={30} />
          <Skeleton variant="rectangular" height={120} sx={{ mt: 1 }} />
        </CardContent>
      </Card>
    );
  }

  const { toiGui = 0, canXuLy = 0, quaHan = 0 } = data || {};

  return (
    <Card
      sx={{
        height: "100%",
        transition: "all 0.2s",
        "&:hover": {
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardActionArea
        onClick={() => navigate(WorkRoutes.yeuCauList())}
        sx={{ height: "100%" }}
      >
        <CardContent>
          {/* Header */}
          <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha(theme.palette.info.main, 0.1),
              }}
            >
              <MessageQuestion
                size={18}
                color={theme.palette.info.main}
                variant="Bold"
              />
            </Box>
            <Typography variant="subtitle1" fontWeight={600}>
              Yêu cầu
            </Typography>
          </Stack>

          {/* Stats */}
          <Stack spacing={0.5}>
            <StatItem
              icon={Send2}
              label="Tôi gửi"
              value={toiGui}
              color={theme.palette.info.main}
            />
            <StatItem
              icon={ReceiveSquare}
              label="Cần xử lý"
              value={canXuLy}
              color={theme.palette.warning.main}
              isAlert={canXuLy > 0}
            />
            <StatItem
              icon={Danger}
              label="Quá hạn"
              value={quaHan}
              color={theme.palette.error.main}
              isAlert={quaHan > 0}
            />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

/**
 * StatusOverviewCards - Container cho 2 cards
 */
function StatusOverviewCards({ congViec, yeuCau, isLoading, nhanVienId }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <CongViecCard
          data={congViec}
          isLoading={isLoading}
          nhanVienId={nhanVienId}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <YeuCauCard data={yeuCau} isLoading={isLoading} />
      </Grid>
    </Grid>
  );
}

export default StatusOverviewCards;
