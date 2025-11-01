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
} from "recharts";
import { Box, Typography, LinearProgress } from "@mui/material";

function BarChartByDepartment() {
  const { theoKhoa, isLoading } = useSelector((state) => state.baoCaoKPI);

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

  if (!theoKhoa || theoKhoa.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Không có dữ liệu để hiển thị
        </Typography>
      </Box>
    );
  }

  // Chuẩn bị data cho chart
  const chartData = theoKhoa.map((item) => ({
    name: item.tenKhoa || "Chưa xác định",
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
            Số lượng: {payload[0].payload["Số lượng"]} nhân viên
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={100}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          label={{
            value: "Điểm trung bình",
            angle: -90,
            position: "insideLeft",
          }}
          domain={[0, 10]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: "20px" }} />
        <Bar dataKey="Điểm TB" fill="#8884d8" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default BarChartByDepartment;
