import React, { useMemo } from "react";
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
import { Box, Typography, useTheme } from "@mui/material";

/**
 * KPIChartByNhanVien - Biểu đồ cột so sánh KPI giữa các nhân viên
 *
 * Props:
 * - data: Array of ThongKe objects (should be top performers)
 * - nhanviens: Array of employees
 */
const KPIChartByNhanVien = ({ data = [], nhanviens = [] }) => {
  const theme = useTheme();

  const chartData = useMemo(() => {
    return data.map((item) => {
      const nv = nhanviens.find((emp) => emp._id === item.NhanVienID);
      const diem = item.TongDiemKPI || 0;
      const percent = ((diem / 10) * 100).toFixed(1);

      return {
        name: nv?.Ten || "N/A",
        maNV: nv?.MaNhanVien || "",
        diem: parseFloat(diem.toFixed(2)),
        percent: parseFloat(percent),
        fullName: nv ? `${nv.Ten} (${nv.MaNhanVien})` : "N/A",
      };
    });
  }, [data, nhanviens]);

  const getBarColor = (percent) => {
    if (percent >= 90) return theme.palette.success.main;
    if (percent >= 70) return theme.palette.primary.main;
    if (percent >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  if (chartData.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="body2" color="text.secondary">
          Không có dữ liệu để hiển thị
        </Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 80,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={100}
          interval={0}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          label={{
            value: "Điểm KPI (%)",
            angle: -90,
            position: "insideLeft",
          }}
          domain={[0, 100]}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <Box
                  sx={{
                    bgcolor: "background.paper",
                    border: 1,
                    borderColor: "divider",
                    p: 2,
                    borderRadius: 1,
                    boxShadow: 2,
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    {data.fullName}
                  </Typography>
                  <Typography variant="body2" color="primary.main">
                    KPI: <strong>{data.percent}%</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({data.diem}/10 điểm)
                  </Typography>
                </Box>
              );
            }
            return null;
          }}
        />
        <Legend
          wrapperStyle={{ paddingTop: "20px" }}
          content={() => (
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Điểm KPI (%)
              </Typography>
            </Box>
          )}
        />
        <Bar dataKey="percent" radius={[8, 8, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry.percent)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default KPIChartByNhanVien;
