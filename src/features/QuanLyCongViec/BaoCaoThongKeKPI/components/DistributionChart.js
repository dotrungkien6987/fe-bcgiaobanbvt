import React from "react";
import { useSelector } from "react-redux";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Box, Typography, LinearProgress } from "@mui/material";

const COLORS = {
  "Xuất sắc (9-10)": "#4caf50",
  "Tốt (7-9)": "#2196f3",
  "Khá (5-7)": "#ff9800",
  "Trung bình (3-5)": "#ff5722",
  "Yếu (0-3)": "#f44336",
};

function DistributionChart() {
  const { phanBoMucDiem, isLoading } = useSelector((state) => state.baoCaoKPI);

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

  if (!phanBoMucDiem || phanBoMucDiem.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Không có dữ liệu để hiển thị
        </Typography>
      </Box>
    );
  }

  // Map mức điểm sang tên hiển thị
  const levelNames = {
    0: "Yếu (0-3)",
    3: "Trung bình (3-5)",
    5: "Khá (5-7)",
    7: "Tốt (7-9)",
    9: "Xuất sắc (9-10)",
  };

  // Chuẩn bị data cho chart
  const chartData = phanBoMucDiem.map((item) => ({
    name: levelNames[item._id] || `Mức ${item._id}`,
    "Số lượng": item.soLuong || 0,
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
            {payload[0].payload.name}
          </Typography>
          <Typography variant="caption" display="block">
            Số lượng: {payload[0].value} nhân viên
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary">
            Tỷ lệ: {payload[0].payload.percentage.toFixed(1)}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          angle={-15}
          textAnchor="end"
          height={80}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          label={{ value: "Số lượng", angle: -90, position: "insideLeft" }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: "10px" }} />
        <Bar dataKey="Số lượng" radius={[8, 8, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default DistributionChart;
