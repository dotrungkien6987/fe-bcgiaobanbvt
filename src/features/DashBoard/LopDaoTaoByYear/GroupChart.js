import React from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { Box, Typography } from "@mui/material";
import { createOverviewColorPalette } from "./constants";

export default function GroupChart({
  rows,
  mas,
  labels,
  group,
  title = "📈 Biểu đồ cột",
}) {
  if (!rows.length || !mas.length) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 320,
          color: "text.secondary",
        }}
      >
        <Typography variant="body1">
          Không có dữ liệu trong khoảng năm đã chọn
        </Typography>
      </Box>
    );
  }

  // Lấy bảng màu tổng quan nếu không có group cụ thể
  const overviewColorPalette = group ? null : createOverviewColorPalette();

  return (
    <>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
        {title}
      </Typography>
      <BarChart
        dataset={rows}
        xAxis={[{ scaleType: "band", dataKey: "year" }]}
        series={mas.map((m, idx) => {
          // Lấy màu từ colorPalette của nhóm hoặc overviewColorPalette
          let color;
          if (group) {
            color = group.colorPalette[idx] || group.color;
          } else {
            color = overviewColorPalette[m] || "#9e9e9e";
          }
          return {
            dataKey: m,
            label: labels[m] || m,
            stack: "a",
            color: color,
          };
        })}
        height={320}
        slotProps={{
          legend: {
            direction: "row",
            position: { vertical: "top", horizontal: "middle" },
            padding: 0,
            itemMarkWidth: group ? 14 : 12,
            itemMarkHeight: group ? 14 : 12,
            markGap: group ? 6 : 8,
            itemGap: group ? 12 : 16,
          },
        }}
      />
    </>
  );
}
