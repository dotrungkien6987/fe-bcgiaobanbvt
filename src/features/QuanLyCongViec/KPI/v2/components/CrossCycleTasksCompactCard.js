import React from "react";
import { Box, Alert, Typography } from "@mui/material";
import CongViecCompactCard from "./CongViecCompactCard";

/**
 * Compact card for displaying tasks assigned to NVTQ from previous cycles
 * Wrapper around CongViecCompactCard with specific styling and info message
 */
const CrossCycleTasksCompactCard = ({
  total = 0,
  completed = 0,
  late = 0,
  active = 0,
  tasks = [],
  onViewTask,
  onOpenNewTab,
  isLoading = false,
  error = null,
}) => {
  return (
    <>
      {/* Info Alert - Only show when expanded and has data */}
      {!isLoading && !error && total > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            ℹ️ <strong>Lưu ý:</strong> Các công việc này đã gán NVTQ từ chu kỳ
            trước nhưng có ngày thực hiện nằm trong chu kỳ đánh giá. Chỉ hiển
            thị tham khảo, <strong>KHÔNG tính điểm KPI</strong> trong chu kỳ
            này.
          </Typography>
        </Alert>
      )}

      {/* Main Card */}
      <CongViecCompactCard
        title="Công việc gán NVTQ chu kỳ cũ"
        icon="⏮️"
        color="warning.dark"
        total={total}
        completed={completed}
        late={late}
        active={active}
        tasks={tasks}
        onViewTask={onViewTask}
        onOpenNewTab={onOpenNewTab}
        isLoading={isLoading}
        error={error}
        showNguoiChinh={false}
      />
    </>
  );
};

export default CrossCycleTasksCompactCard;
