/**
 * QuickActionsGrid - Quick Action Buttons
 *
 * Hiển thị 4 action buttons chính:
 * - Tạo mới yêu cầu
 * - Xử lý yêu cầu (với badge count)
 * - Điều phối (nếu có quyền, với badge)
 * - Báo cáo/Quản lý (nếu có quyền)
 *
 * Features:
 * - 2x2 grid layout (mobile & desktop)
 * - Badge counts từ API
 * - Icon lớn + label (MUI icons)
 * - Click to navigate
 * - Conditional rendering based on roles
 */
import React from "react";
import {
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Box,
  Stack,
  Badge,
  alpha,
  useTheme,
} from "@mui/material";
import {
  AddCircleOutline as AddIcon,
  AssignmentTurnedIn as HandleIcon,
  AccountTree as CoordinateIcon,
  Assessment as ReportIcon,
} from "@mui/icons-material";

/**
 * Single Action Card Component
 */
function ActionCard({ action, onClick }) {
  const theme = useTheme();
  const { label, icon: IconComponent, color, count } = action;
  const colorValue = theme.palette[color]?.main || theme.palette.primary.main;

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 2,
        boxShadow: 1,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CardActionArea
        onClick={onClick}
        sx={{
          height: "100%",
          "&:hover": {
            bgcolor: (theme) => alpha(colorValue, 0.08),
          },
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack spacing={1.5} alignItems="center" py={{ xs: 1.5, sm: 2 }}>
            {/* Icon with Badge */}
            <Badge
              badgeContent={count > 0 ? count : null}
              color="error"
              max={99}
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  minWidth: 20,
                  height: 20,
                },
              }}
            >
              <Box
                sx={{
                  width: { xs: 56, sm: 64 },
                  height: { xs: 56, sm: 64 },
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: alpha(colorValue, 0.12),
                  color: colorValue,
                }}
              >
                <IconComponent sx={{ fontSize: { xs: 32, sm: 36 } }} />
              </Box>
            </Badge>

            {/* Label */}
            <Typography
              variant="subtitle2"
              fontWeight={600}
              textAlign="center"
              color="text.primary"
              sx={{ fontSize: { xs: "0.875rem", sm: "0.938rem" } }}
            >
              {label}
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

/**
 * Main QuickActionsGrid Component
 */
export default function QuickActionsGrid({
  counts = {},
  roles = {},
  onNavigate,
}) {
  const actions = [
    {
      key: "create",
      label: "Tạo yêu cầu",
      icon: AddIcon,
      color: "primary",
      count: 0, // No count for create action
      navigateTo: "/quanlycongviec/yeucau/toi-gui",
      show: true, // Always show
    },
    {
      key: "handle",
      label: "Tôi xử lý",
      icon: HandleIcon,
      color: "success",
      count: counts.needAction || 0,
      navigateTo: "/quanlycongviec/yeucau/xu-ly?tab=cho-tiep-nhan",
      show: true, // Always show
    },
    {
      key: "coordinate",
      label: "Điều phối",
      icon: CoordinateIcon,
      color: "info",
      count: counts.needCoordinate || 0,
      navigateTo: "/quanlycongviec/yeucau/dieu-phoi",
      show: roles.isNguoiDieuPhoi || roles.isQuanLyKhoa,
    },
    {
      key: "report",
      label: "Quản lý",
      icon: ReportIcon,
      color: "warning",
      count: 0, // No count for report
      navigateTo: "/quanlycongviec/yeucau/quan-ly-khoa",
      show: roles.isQuanLyKhoa,
    },
  ];

  const visibleActions = actions.filter((action) => action.show);

  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          fontSize: { xs: "1rem", sm: "1.125rem" },
          mb: 1.5,
          px: { xs: 2, md: 0 },
        }}
      >
        ⚡ Thao tác nhanh
      </Typography>
      <Grid container spacing={1.5}>
        {visibleActions.map((action) => (
          <Grid item xs={6} key={action.key}>
            <ActionCard
              action={action}
              onClick={() => {
                if (action.navigateTo && onNavigate) {
                  onNavigate(action.navigateTo);
                }
              }}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
