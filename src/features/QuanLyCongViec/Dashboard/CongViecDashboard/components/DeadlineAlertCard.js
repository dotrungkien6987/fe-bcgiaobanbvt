/**
 * DeadlineAlertCard - Show top 5 overdue tasks
 *
 * Features:
 * - Filters tasks with TinhTrangThoiHan === "QUA_HAN"
 * - Sorts by oldest deadline first
 * - Shows "Quá X ngày" badge
 * - Click task → navigate to detail page
 * - Conditional render (hide if no overdue)
 *
 * @component
 */

import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  AlertTitle,
  Typography,
  Stack,
  Box,
  Chip,
  Button,
} from "@mui/material";
import { Danger } from "iconsax-react";
import dayjs from "dayjs";

/**
 * Calculate days overdue
 */
function getDaysOverdue(deadline) {
  return dayjs().diff(dayjs(deadline), "day");
}

/**
 * Main Component
 */
export default function DeadlineAlertCard({ tasks }) {
  const navigate = useNavigate();

  // Filter and sort overdue tasks
  const overdueTasks = useMemo(() => {
    return tasks
      .filter((t) => t.TinhTrangThoiHan === "QUA_HAN")
      .sort((a, b) => new Date(a.NgayHetHan) - new Date(b.NgayHetHan)) // Oldest first
      .slice(0, 5);
  }, [tasks]);

  const totalOverdue = useMemo(() => {
    return tasks.filter((t) => t.TinhTrangThoiHan === "QUA_HAN").length;
  }, [tasks]);

  // Don't render if no overdue tasks
  if (overdueTasks.length === 0) {
    return null;
  }

  return (
    <Alert
      severity="error"
      icon={<Danger variant="Bold" size={24} />}
      sx={{ mb: 0 }}
    >
      <AlertTitle>
        <Typography variant="subtitle2" fontWeight={600}>
          ⚠️ Cảnh báo: {overdueTasks.length} công việc quá hạn
        </Typography>
      </AlertTitle>

      <Stack spacing={1.5} mt={1}>
        {overdueTasks.map((task) => (
          <Box
            key={task._id}
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: "rgba(255, 255, 255, 0.1)",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.2)",
              },
            }}
            onClick={() => navigate(`/quanlycongviec/congviec/${task._id}`)}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="body2" fontWeight={600} flex={1}>
                {task.TieuDe || "Công việc"}
              </Typography>
              <Chip
                label={`Quá ${getDaysOverdue(task.NgayHetHan)} ngày`}
                size="small"
                color="error"
                variant="filled"
              />
            </Stack>
            {task.MucDoUuTien && (
              <Typography variant="caption" sx={{ mt: 0.5, opacity: 0.8 }}>
                Ưu tiên: {task.MucDoUuTien}
              </Typography>
            )}
          </Box>
        ))}

        {overdueTasks.length === 5 && totalOverdue > 5 && (
          <Button
            size="small"
            fullWidth
            variant="text"
            onClick={() =>
              navigate("/quanlycongviec/cong-viec-cua-toi?tinhTrangHan=QUA_HAN")
            }
          >
            Xem tất cả ({totalOverdue} việc)
          </Button>
        )}
      </Stack>
    </Alert>
  );
}
