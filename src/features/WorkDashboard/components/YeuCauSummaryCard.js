import React from "react";
import SummaryCard from "components/dashboard/SummaryCard";
import { RequestPage as RequestIcon } from "@mui/icons-material";
import { useSelector } from "react-redux";

/**
 * YeuCauSummaryCard - Display request/ticket summary
 * Shows sent, need action, in progress, and completed counts
 */
function YeuCauSummaryCard({ variant = "compact", loading = false }) {
  const yeuCauSummary = useSelector(
    (state) =>
      state.workDashboard?.yeuCauSummary || {
        sent: 0,
        needAction: 0,
        inProgress: 0,
        completed: 0,
      }
  );

  const stats =
    variant === "compact"
      ? [
          {
            label: "Cần xử lý",
            value: yeuCauSummary.needAction || 0,
          },
          {
            label: "Đang xử lý",
            value: yeuCauSummary.inProgress || 0,
            color: "#ff9800",
          },
        ]
      : [
          {
            label: "Yêu cầu đã gửi",
            value: yeuCauSummary.sent || 0,
          },
          {
            label: "Cần xử lý",
            value: yeuCauSummary.needAction || 0,
            color: "#f44336",
          },
          {
            label: "Đang xử lý",
            value: yeuCauSummary.inProgress || 0,
            color: "#ff9800",
          },
          {
            label: "Đã hoàn thành",
            value: yeuCauSummary.completed || 0,
            color: "#4caf50",
          },
        ];

  return (
    <SummaryCard
      title="Yêu Cầu"
      subtitle="Yêu cầu giữa các khoa"
      icon={<RequestIcon sx={{ fontSize: 28 }} />}
      stats={stats}
      variant={variant}
      color="#9c27b0" // Purple
      navigateTo="/yeu-cau-dashboard"
      loading={loading}
    />
  );
}

export default YeuCauSummaryCard;
