import React from "react";
import { useSelector } from "react-redux";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Box, Typography, LinearProgress } from "@mui/material";

function TrendLineChart() {
  const { xuHuongTheoThang, isLoading, filters } = useSelector(
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

  // Nếu không có khoảng thời gian, hiển thị thông báo
  if (!filters.startDate || !filters.endDate) {
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Vui lòng chọn khoảng thời gian để xem xu hướng theo tháng
        </Typography>
      </Box>
    );
  }

  if (!xuHuongTheoThang || xuHuongTheoThang.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Không có dữ liệu xu hướng trong khoảng thời gian này
        </Typography>
      </Box>
    );
  }

  // Chuẩn bị data cho chart
  const chartData = xuHuongTheoThang.map((item) => ({
    name: `Tháng ${item.thang}/${item.nam}`,
    "Điểm TB": parseFloat(item.diemTrungBinh?.toFixed(2) || 0),
    "Số lượng": item.soLuong || 0,
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
          <Typography variant="caption" display="block" color="primary">
            Điểm TB: {payload[0].value}
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary">
            Số lượng: {payload[0].payload["Số lượng"]} đánh giá
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis
          label={{
            value: "Điểm trung bình",
            angle: -90,
            position: "insideLeft",
          }}
          domain={[0, 10]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="Điểm TB"
          stroke="#8884d8"
          strokeWidth={2}
          activeDot={{ r: 8 }}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default TrendLineChart;
