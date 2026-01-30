/**
 * PriorityTasksWidget - Widget hiển thị 5 task urgent nhất cho employee
 *
 * Uses Redux: workDashboard.urgentTasks
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Button,
  Skeleton,
  useTheme,
  alpha,
} from "@mui/material";
import { Danger, ArrowRight2 } from "iconsax-react";
import UrgentTaskCard from "./UrgentTaskCard";

function PriorityTasksWidget() {
  const theme = useTheme();
  const navigate = useNavigate();

  // Get data from Redux
  const {
    items: tasks,
    total,
    isLoading,
  } = useSelector(
    (state) =>
      state.workDashboard?.urgentTasks || {
        items: [],
        total: 0,
        isLoading: false,
      },
  );

  // Handle view all
  const handleViewAll = () => {
    navigate("/quanlycongviec/cong-viec-cua-toi");
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Skeleton variant="text" width={200} height={32} />
          <Stack spacing={1.5} mt={2}>
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={72}
                sx={{ borderRadius: 1 }}
              />
            ))}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!tasks || tasks.length === 0) {
    return (
      <Card
        sx={{
          mb: 3,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.success.main,
            0.05,
          )} 0%, ${alpha(theme.palette.success.light, 0.1)} 100%)`,
          border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
        }}
      >
        <CardContent>
          <Stack alignItems="center" spacing={2} py={2}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha(theme.palette.success.main, 0.1),
              }}
            >
              <Typography variant="h4">🎉</Typography>
            </Box>
            <Typography
              variant="body1"
              color="text.secondary"
              textAlign="center"
            >
              Không có công việc gấp trong 3 ngày tới
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  // Calculate remaining count
  const remainingCount = Math.max(0, total - tasks.length);

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(theme.palette.error.main, 0.1),
            }}
          >
            <Danger size={20} color={theme.palette.error.main} variant="Bold" />
          </Box>
          <Typography variant="h6" fontWeight={600}>
            Cần xử lý gấp
          </Typography>
          <Typography
            variant="caption"
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.error.main, 0.1),
              color: theme.palette.error.main,
              fontWeight: 600,
            }}
          >
            {total}
          </Typography>
        </Stack>

        {/* Task List */}
        <Box>
          {tasks.map((task) => (
            <UrgentTaskCard key={task._id} task={task} />
          ))}
        </Box>

        {/* View All Button */}
        {remainingCount > 0 && (
          <Button
            fullWidth
            variant="text"
            endIcon={<ArrowRight2 size={16} />}
            onClick={handleViewAll}
            sx={{
              mt: 1,
              color: theme.palette.text.secondary,
              "&:hover": {
                color: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              },
            }}
          >
            Xem tất cả {remainingCount} công việc khác
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default PriorityTasksWidget;
