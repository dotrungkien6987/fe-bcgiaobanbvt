import React from "react";
import { useSelector } from "react-redux";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Box, Typography, LinearProgress } from "@mui/material";

const COLORS = {
  "Đã duyệt": "#4caf50",
  "Chưa duyệt": "#ff9800",
};

function PieChartStatus() {
  const { phanBoTrangThai, isLoading } = useSelector(
    (state) => state.baoCaoKPI
  );

  if (isLoading) {
    return (
      <Box sx={{ width: "100%", py: 4 }}>
        <LinearProgress />
        <Typography
          variant="body2"
          textAlign="center"
          mt={2}
          color="text.secondary"
        >
          Đang tải dữ liệu...
        </Typography>
      </Box>
    );
  }

  if (!phanBoTrangThai || phanBoTrangThai.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Không có dữ liệu để hiển thị
        </Typography>
      </Box>
    );
  }

  // Chuẩn bị data cho chart
  const chartData = phanBoTrangThai.map((item) => ({
    name: item.trangThai === "approved" ? "Đã duyệt" : "Chưa duyệt",
    value: item.soLuong || 0,
    percentage: item.tyLe || 0,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            border: "1px solid #ccc",
            borderRadius: 1,
            p: 1.5,
            boxShadow: 2,
          }}
        >
          <Typography variant="body2" fontWeight={600} mb={0.5}>
            {payload[0].name}
          </Typography>
          <Typography variant="caption" display="block">
            Số lượng: {payload[0].value}
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary">
            Tỷ lệ: {payload[0].payload.percentage.toFixed(1)}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={14}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomLabel}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default PieChartStatus;
