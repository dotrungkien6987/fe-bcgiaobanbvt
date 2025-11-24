import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

/**
 * StatusChart - Horizontal bar chart for status distribution
 * @param {Array} statusDistribution - Status data from API
 */
function StatusChart({ statusDistribution = [] }) {
  const statusLabels = {
    TAO_MOI: "Tạo mới",
    DA_GIAO: "Đã giao",
    DANG_THUC_HIEN: "Đang làm",
    CHO_DUYET: "Chờ duyệt",
    HOAN_THANH: "Hoàn thành",
  };

  const statusColors = {
    TAO_MOI: "#94a3b8",
    DA_GIAO: "#64748b",
    DANG_THUC_HIEN: "#f59e0b",
    CHO_DUYET: "#3b82f6",
    HOAN_THANH: "#10b981",
  };

  const chartData = statusDistribution.map((item) => ({
    name: statusLabels[item.status] || item.status,
    value: item.count,
    percentage: item.percentage,
    status: item.status,
  }));

  return (
    <Paper sx={{ p: 2, height: "100%" }}>
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        📊 Phân bố trạng thái
      </Typography>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
        >
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" />
          <Tooltip
            content={({ payload }) => {
              if (!payload || !payload[0]) return null;
              const data = payload[0].payload;
              return (
                <Box
                  sx={{
                    bgcolor: "white",
                    p: 1.5,
                    border: "1px solid #e5e7eb",
                    borderRadius: 1,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    {data.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Số lượng: {data.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tỷ lệ: {data.percentage}%
                  </Typography>
                </Box>
              );
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={statusColors[entry.status]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}

export default StatusChart;
