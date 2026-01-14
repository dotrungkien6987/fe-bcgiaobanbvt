/**
 * ReceivedDashboardSection - "Việc tôi nhận" section
 *
 * Features:
 * - 4 status cards (DA_GIAO, DANG_THUC_HIEN, CHO_DUYET, HOAN_THANH)
 * - Deadline summary text
 * - Click card → navigate with filter
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
import { Receive, Task, Clock, TickCircle, ArrowRight } from "iconsax-react";

// Import shared components
import StatusCardItem from "./shared/StatusCardItem";
import StatusGridSkeleton from "./shared/StatusGridSkeleton";

/**
 * Main Component
 */
export default function ReceivedDashboardSection({ counts, tasks, isLoading }) {
  const navigate = useNavigate();

  // Status cards configuration
  const statusCards = [
    {
      id: "DA_GIAO",
      label: "Chờ tôi nhận",
      count: counts.DA_GIAO || 0,
      color: "info",
      icon: Receive,
      onClick: () =>
        navigate("/quanlycongviec/cong-viec-cua-toi?status=DA_GIAO"),
    },
    {
      id: "DANG_THUC_HIEN",
      label: "Đang làm",
      count: counts.DANG_THUC_HIEN || 0,
      color: "primary",
      icon: Task,
      onClick: () =>
        navigate("/quanlycongviec/cong-viec-cua-toi?status=DANG_THUC_HIEN"),
    },
    {
      id: "CHO_DUYET",
      label: "Chờ duyệt",
      count: counts.CHO_DUYET || 0,
      color: "warning",
      icon: Clock,
      onClick: () =>
        navigate("/quanlycongviec/cong-viec-cua-toi?status=CHO_DUYET"),
    },
    {
      id: "HOAN_THANH",
      label: "Hoàn thành",
      count: counts.HOAN_THANH || 0,
      color: "success",
      icon: TickCircle,
      onClick: () => navigate("/quanlycongviec/lich-su-hoan-thanh"),
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
            📥 VIỆC TÔI NHẬN ({counts.ALL || 0})
          </Typography>
          <Button
            size="small"
            endIcon={<ArrowRight size={16} />}
            onClick={() => navigate("/quanlycongviec/cong-viec-cua-toi")}
          >
            Xem tất cả
          </Button>
        </Box>

        {/* Status Grid */}
        {isLoading ? (
          <StatusGridSkeleton columns={4} />
        ) : (
          <Grid container spacing={2}>
            {statusCards.map((card) => (
              <Grid item xs={6} sm={3} key={card.id}>
                <StatusCardItem {...card} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Deadline Summary */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 2, display: "block" }}
        >
          Deadline: 🔴 {counts.deadlineStatus?.overdue || 0} quá hạn | 🟡{" "}
          {counts.deadlineStatus?.upcoming || 0} sắp hạn
        </Typography>
      </CardContent>
    </Card>
  );
}
