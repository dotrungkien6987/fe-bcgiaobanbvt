import React, { useMemo } from "react";
import Chart from "react-apexcharts";
import { Card, CardContent, Typography } from "@mui/material";

export default function DualAxisBarLine({
  title = "Biểu đồ 2 trục",
  data = [], // [{ year, hoSo, thanhVien }]
  barName = "Số đoàn",
  lineName = "Số thành viên",
  barColor = "#1e88e5",
  lineColor = "#ef6c00",
  height = 360,
}) {
  const years = useMemo(() => data.map((d) => d.year), [data]);
  const series = useMemo(
    () => [
      { name: barName, type: "column", data: data.map((d) => d.hoSo ?? 0) },
      { name: lineName, type: "line", data: data.map((d) => d.thanhVien ?? 0) },
    ],
    [data, barName, lineName]
  );

  const options = useMemo(
    () => ({
      chart: { toolbar: { show: false } },
      colors: [barColor, lineColor],
      stroke: { width: [0, 3] },
      dataLabels: { enabled: false },
      xaxis: { categories: years, labels: { rotateAlways: false } },
      yaxis: [
        {
          title: { text: barName },
          labels: { formatter: (v) => `${v}` },
        },
        {
          opposite: true,
          title: { text: lineName },
          labels: { formatter: (v) => `${v}` },
        },
      ],
      legend: { position: "top", horizontalAlign: "center" },
      tooltip: { shared: true, intersect: false },
      grid: { strokeDashArray: 4 },
    }),
    [years, barColor, lineColor, barName, lineName]
  );

  return (
    <Card variant="outlined" sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          {title}
        </Typography>
        <Chart options={options} series={series} height={height} />
      </CardContent>
    </Card>
  );
}
