/**
 * AssignedDashboardSection - "Việc tôi giao" section
 *
 * Features:
 * - 5 status cards (TAO_MOI, DA_GIAO, DANG_THUC_HIEN, CHO_DUYET, HOAN_THANH)
 * - avgProgress metric (average progress of active tasks)
 * - onTimeRate metric (% completed on time)
 * - Deadline summary
 * - Loading skeleton
 *
 * @component
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Button,
} from "@mui/material";
import {
  DocumentText,
  Send,
  Task,
  Eye,
  TickCircle,
  ArrowRight,
} from "iconsax-react";

// Import shared components
import StatusCardItem from "./shared/StatusCardItem";
import StatusGridSkeleton from "./shared/StatusGridSkeleton";

/**
 * Main Component
 */
export default function AssignedDashboardSection({
  counts,
  tasks,
  dateRange,
  isLoading,
}) {
  const navigate = useNavigate();

  // Status cards configuration
  const statusCards = [
    {
      id: "TAO_MOI",
      label: "Tạo mới",
      count: counts.TAO_MOI || 0,
      color: "default",
      icon: DocumentText,
      onClick: () => navigate("/quanlycongviec/viec-toi-giao?status=TAO_MOI"),
    },
    {
      id: "DA_GIAO",
      label: "Đã giao",
      count: counts.DA_GIAO || 0,
      color: "info",
      icon: Send,
      onClick: () => navigate("/quanlycongviec/viec-toi-giao?status=DA_GIAO"),
    },
    {
      id: "DANG_THUC_HIEN",
      label: "Đang thực hiện",
      count: counts.DANG_THUC_HIEN || 0,
      color: "primary",
      icon: Task,
      onClick: () =>
        navigate("/quanlycongviec/viec-toi-giao?status=DANG_THUC_HIEN"),
    },
    {
      id: "CHO_DUYET",
      label: "Chờ tôi duyệt",
      count: counts.CHO_DUYET || 0,
      color: "warning",
      icon: Eye,
      onClick: () => navigate("/quanlycongviec/viec-toi-giao?status=CHO_DUYET"),
    },
    {
      id: "HOAN_THANH",
      label: "Hoàn thành",
      count: counts.HOAN_THANH || 0,
      color: "success",
      icon: TickCircle,
      onClick: () =>
        navigate("/quanlycongviec/viec-toi-giao?status=HOAN_THANH"),
    },
  ];

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">
            📤 VIỆC TÔI GIAO ({counts.ALL || 0})
          </Typography>
          <Button
            size="small"
            endIcon={<ArrowRight size={16} />}
            onClick={() => navigate("/quanlycongviec/viec-toi-giao")}
          >
            Xem tất cả
          </Button>
        </Box>

        {/* Status Grid (5 cards) */}
        {isLoading ? (
          <StatusGridSkeleton columns={5} />
        ) : (
          <Grid container spacing={2}>
            {statusCards.map((card) => (
              <Grid item xs={6} sm={2.4} key={card.id}>
                <StatusCardItem {...card} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Deadline Summary */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Deadline: 🔴 {counts.deadlineStatus?.overdue || 0} quá hạn | 🟡{" "}
            {counts.deadlineStatus?.upcoming || 0} sắp hạn
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
