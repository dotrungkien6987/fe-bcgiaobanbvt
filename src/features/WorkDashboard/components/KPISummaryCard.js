import React from "react";
import SummaryCard from "components/dashboard/SummaryCard";
import { EmojiEvents as TrophyIcon } from "@mui/icons-material";
import { useSelector } from "react-redux";

/**
 * KPISummaryCard - Display KPI evaluation summary
 * Shows current cycle score and status
 */
function KPISummaryCard({ variant = "compact", loading = false }) {
  const kpiSummary = useSelector(
    (state) =>
      state.workDashboard?.kpiSummary || {
        score: null,
        status: "CHUA_DUYET",
        cycleName: null,
        isDone: false,
        hasEvaluation: false,
      }
  );

  const getScoreColor = (score) => {
    if (!score) return "#9e9e9e"; // Gray for no score
    if (score >= 90) return "#4caf50"; // Green for excellent
    if (score >= 70) return "#ff9800"; // Orange for good
    return "#f44336"; // Red for needs improvement
  };

  const getStatusText = (status) => {
    switch (status) {
      case "DA_DUYET":
        return "Đã duyệt";
      case "CHUA_DUYET":
        return "Chưa duyệt";
      case "NO_CYCLE":
        return "Chưa có chu kỳ";
      default:
        return status;
    }
  };

  const scoreValue = kpiSummary.score
    ? `${kpiSummary.score.toFixed(1)} điểm`
    : "N/A";

  const stats = [
    {
      label: kpiSummary.cycleName || "Chưa có chu kỳ",
      value: scoreValue,
      color: getScoreColor(kpiSummary.score),
    },
  ];

  if (variant === "detailed") {
    stats.push({
      label: "Trạng thái",
      value: getStatusText(kpiSummary.status),
      color:
        kpiSummary.status === "DA_DUYET"
          ? "#4caf50"
          : kpiSummary.status === "CHUA_DUYET"
          ? "#ff9800"
          : "#9e9e9e",
    });
  }

  return (
    <SummaryCard
      title="Đánh Giá KPI"
      subtitle={
        kpiSummary.isDone
          ? "Chu kỳ đã đóng"
          : !kpiSummary.hasEvaluation
          ? "Chưa có đánh giá"
          : "Chu kỳ đang mở"
      }
      icon={<TrophyIcon sx={{ fontSize: 28 }} />}
      stats={stats}
      variant={variant}
      color="#ff9800" // Orange/Gold
      navigateTo="/kpi-dashboard"
      loading={loading}
    />
  );
}

export default KPISummaryCard;
