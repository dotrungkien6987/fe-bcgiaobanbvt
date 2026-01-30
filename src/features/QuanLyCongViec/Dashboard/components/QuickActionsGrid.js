/**
 * QuickActionsGrid - Grid 3x2 các nút thao tác nhanh
 *
 * 6 Quick Actions:
 * 1. Công việc tôi nhận
 * 2. Công việc tôi giao
 * 3. Yêu cầu tôi gửi
 * 4. Yêu cầu cần xử lý
 * 5. Tạo công việc
 * 6. Gửi yêu cầu
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  CardActionArea,
  Stack,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Task,
  TaskSquare,
  Send2,
  ReceiveSquare,
  AddCircle,
  MessageAdd,
} from "iconsax-react";
import { WorkRoutes } from "utils/navigationHelper";

const QUICK_ACTIONS = [
  {
    id: "received",
    label: "Việc tôi nhận",
    icon: Task,
    route: (nhanVienId) => WorkRoutes.congViecList(nhanVienId),
    color: "primary",
  },
  {
    id: "assigned",
    label: "Việc tôi giao",
    icon: TaskSquare,
    route: (nhanVienId) =>
      WorkRoutes.congViecAssigned?.(nhanVienId) || "/congviec/assigned",
    color: "secondary",
  },
  {
    id: "yc-sent",
    label: "YC tôi gửi",
    icon: Send2,
    route: () => WorkRoutes.yeuCauSent?.() || "/yeucau/toi-gui",
    color: "info",
  },
  {
    id: "yc-process",
    label: "YC cần xử lý",
    icon: ReceiveSquare,
    route: () => WorkRoutes.yeuCauProcess?.() || "/yeucau/xu-ly",
    color: "warning",
  },
  {
    id: "create-task",
    label: "Tạo công việc",
    icon: AddCircle,
    route: () => WorkRoutes.congViecCreate(),
    color: "success",
    isCreate: true,
  },
  {
    id: "create-yc",
    label: "Gửi yêu cầu",
    icon: MessageAdd,
    route: () => WorkRoutes.yeuCauCreate(),
    color: "success",
    isCreate: true,
  },
];

function QuickActionButton({ action, nhanVienId }) {
  const theme = useTheme();
  const navigate = useNavigate();

  const colorValue =
    theme.palette[action.color]?.main || theme.palette.primary.main;

  const handleClick = () => {
    const route =
      typeof action.route === "function"
        ? action.route(nhanVienId)
        : action.route;
    navigate(route);
  };

  return (
    <Card
      sx={{
        height: "100%",
        transition: "all 0.2s ease",
        border: `1px solid ${alpha(colorValue, 0.2)}`,
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: `0 4px 12px ${alpha(colorValue, 0.2)}`,
          borderColor: colorValue,
        },
      }}
    >
      <CardActionArea
        onClick={handleClick}
        sx={{
          height: "100%",
          p: 1.5,
        }}
      >
        <Stack
          direction="column"
          alignItems="center"
          justifyContent="center"
          spacing={1}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(colorValue, 0.1),
            }}
          >
            <action.icon size={22} color={colorValue} variant="Bold" />
          </Box>
          <Typography
            variant="caption"
            fontWeight={600}
            color="text.secondary"
            textAlign="center"
            sx={{
              lineHeight: 1.2,
              fontSize: "0.75rem",
            }}
          >
            {action.label}
          </Typography>
        </Stack>
      </CardActionArea>
    </Card>
  );
}

function QuickActionsGrid({ nhanVienId }) {
  return (
    <Box>
      <Grid container spacing={1.5}>
        {QUICK_ACTIONS.map((action) => (
          <Grid item xs={4} sm={4} md={2} key={action.id}>
            <QuickActionButton action={action} nhanVienId={nhanVienId} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default QuickActionsGrid;
