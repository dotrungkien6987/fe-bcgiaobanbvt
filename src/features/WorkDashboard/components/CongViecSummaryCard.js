import React from "react";
import SummaryCard from "components/dashboard/SummaryCard";
import { AssignmentTurnedIn as TaskIcon } from "@mui/icons-material";
import { useSelector } from "react-redux";

/**
 * CongViecSummaryCard - Display work/task summary
 * Shows total tasks and urgent tasks count
 */
function CongViecSummaryCard({ variant = "compact", loading = false }) {
  const congViecSummary = useSelector(
    (state) => state.workDashboard?.congViecSummary || { total: 0, urgent: 0 }
  );

  const stats = [
    {
      label: "Tổng công việc",
      value: congViecSummary?.total || 0,
    },
    {
      label: "Cần xử lý gấp",
      value: congViecSummary?.urgent || 0,
      color: (congViecSummary?.urgent || 0) > 0 ? "#f44336" : "#4caf50",
    },
  ];

  return (
    <SummaryCard
      title="Công Việc"
      subtitle="Công việc được giao & đã giao"
      icon={<TaskIcon sx={{ fontSize: 28 }} />}
      stats={stats}
      variant={variant}
      color="#1976d2" // Blue
      navigateTo="/cong-viec-dashboard"
      loading={loading}
    />
  );
}

export default CongViecSummaryCard;
