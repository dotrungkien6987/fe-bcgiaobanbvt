import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Box, Typography, useTheme } from "@mui/material";

/**
 * KPIDistributionChart - Biểu đồ phân bố điểm KPI
 *
 * Props:
 * - data: Array of ThongKe objects
 */
const KPIDistributionChart = ({ data = [] }) => {
  const theme = useTheme();

  const distributionData = useMemo(() => {
    const xuatSac = data.filter((item) => (item.TongDiemKPI || 0) >= 9).length;
    const tot = data.filter(
      (item) => (item.TongDiemKPI || 0) >= 7 && (item.TongDiemKPI || 0) < 9
    ).length;
    const kha = data.filter(
      (item) => (item.TongDiemKPI || 0) >= 5 && (item.TongDiemKPI || 0) < 7
    ).length;
    const yeu = data.filter((item) => (item.TongDiemKPI || 0) < 5).length;

    return [
      {
        name: "Xuất sắc (≥90%)",
        value: xuatSac,
        color: theme.palette.success.main,
        percent:
          data.length > 0 ? ((xuatSac / data.length) * 100).toFixed(1) : 0,
      },
      {
        name: "Tốt (70-89%)",
        value: tot,
        color: theme.palette.primary.main,
        percent: data.length > 0 ? ((tot / data.length) * 100).toFixed(1) : 0,
      },
      {
        name: "Khá (50-69%)",
        value: kha,
        color: theme.palette.warning.main,
        percent: data.length > 0 ? ((kha / data.length) * 100).toFixed(1) : 0,
      },
      {
        name: "Yếu (<50%)",
        value: yeu,
        color: theme.palette.error.main,
        percent: data.length > 0 ? ((yeu / data.length) * 100).toFixed(1) : 0,
      },
    ].filter((item) => item.value > 0); // Only show categories with data
  }, [data, theme]);

  if (distributionData.length === 0 || data.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="body2" color="text.secondary">
          Không có dữ liệu để hiển thị
        </Typography>
      </Box>
    );
  }

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

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
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Box>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={distributionData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {distributionData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
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
                      {data.name}
                    </Typography>
                    <Typography variant="body2">
                      Số lượng: <strong>{data.value}</strong> nhân viên
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Chiếm {data.percent}%
                    </Typography>
                  </Box>
                );
              }
              return null;
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            content={({ payload }) => (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: 2,
                  mt: 2,
                }}
              >
                {payload.map((entry, index) => (
                  <Box
                    key={`legend-${index}`}
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: 1,
                        bgcolor: entry.color,
                      }}
                    />
                    <Typography variant="caption">
                      {entry.value}: <strong>{entry.payload.value}</strong>
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default KPIDistributionChart;
