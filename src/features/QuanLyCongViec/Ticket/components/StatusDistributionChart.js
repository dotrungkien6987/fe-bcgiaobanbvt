/**
 * StatusDistributionChart - Bar Chart hiển thị phân bố theo trạng thái
 *
 * Features:
 * - Bar chart với Recharts
 * - Responsive: horizontal scroll trên mobile
 * - Colors theo TRANG_THAI_COLORS
 * - Tooltips với details
 * - Click to filter by status
 */
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  Skeleton,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { TRANG_THAI_COLORS, TRANG_THAI_LABELS } from "../yeuCau.constants";

/**
 * Custom Tooltip Component
 */
function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Card sx={{ p: 1.5, boxShadow: 3 }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          {data.label}
        </Typography>
        <Typography variant="h6" color="primary">
          {data.value} yêu cầu
        </Typography>
        {data.percentage && (
          <Typography variant="caption" color="text.secondary">
            {data.percentage}% tổng số
          </Typography>
        )}
      </Card>
    );
  }
  return null;
}

/**
 * Main Component
 */
export default function StatusDistributionChart({
  data = [],
  loading = false,
  onStatusClick,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Phân bố theo trạng thái
          </Typography>
          <Skeleton variant="rectangular" height={300} sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  // Transform data to chart format
  const chartData = data.map((item) => ({
    statusKey: item.status,
    label: TRANG_THAI_LABELS[item.status] || item.status,
    value: item.count,
    percentage: item.percentage,
    color: TRANG_THAI_COLORS[item.status] || theme.palette.grey[500],
  }));

  // Tổng số yêu cầu
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const handleBarClick = (data) => {
    if (onStatusClick && data) {
      onStatusClick(data.statusKey);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          📊 Phân bố theo trạng thái
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Tổng: {total} yêu cầu
        </Typography>

        {chartData.length === 0 ? (
          <Box
            sx={{
              height: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Chưa có dữ liệu
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              width: "100%",
              overflowX: isMobile ? "auto" : "visible",
            }}
          >
            <Box sx={{ minWidth: isMobile ? 400 : "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 10,
                    left: -10,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={theme.palette.divider}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12 }}
                    angle={isMobile ? -45 : 0}
                    textAnchor={isMobile ? "end" : "middle"}
                    height={isMobile ? 80 : 60}
                  />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: alpha(theme.palette.primary.main, 0.1) }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[8, 8, 0, 0]}
                    onClick={handleBarClick}
                    cursor="pointer"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// Helper: alpha function inline (if not imported)
function alpha(color, opacity) {
  // Simple alpha implementation
  return (
    color +
    Math.round(opacity * 255)
      .toString(16)
      .padStart(2, "0")
  );
}
