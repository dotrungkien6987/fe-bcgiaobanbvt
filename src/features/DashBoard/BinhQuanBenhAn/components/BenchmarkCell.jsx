import React from "react";
import { Box, Typography } from "@mui/material";
import DifferenceCell from "./DifferenceCell";

/**
 * Component hiển thị giá trị thực tế và khuyến cáo
 * Highlight màu đỏ nếu vượt khuyến cáo, xanh lá nếu dưới khuyến cáo
 * Có thể đảo ngược logic màu với invertBenchmarkColor
 */
function BenchmarkCell({
  current,
  difference,
  benchmark,
  type = "money",
  align = "right",
  invertColor = false,
  invertBenchmarkColor = false, // ✅ Đảo ngược logic màu benchmark
  benchmarkFormat = "default", // "default" | "full" | "integer"
}) {
  // Nếu không có benchmark, chỉ hiển thị giá trị bình thường
  if (benchmark === null || benchmark === undefined) {
    return (
      <DifferenceCell
        current={current}
        difference={difference}
        type={type}
        align={align}
        invertColor={invertColor}
      />
    );
  }

  // Kiểm tra vượt khuyến cáo
  const isOverBenchmark = current > benchmark;

  // Xác định màu sắc dựa trên logic
  // Logic thường: vượt KC = đỏ (xấu), dưới KC = xanh (tốt)
  // Logic đảo ngược: vượt KC = xanh (tốt), dưới KC = đỏ (xấu)
  const isGood = invertBenchmarkColor ? isOverBenchmark : !isOverBenchmark;
  const benchmarkColor = isGood ? "#00C49F" : "#bb1515";
  const benchmarkBgColor = isGood
    ? "rgba(0, 196, 159, 0.1)"
    : "rgba(187, 21, 21, 0.1)";

  // Format giá trị cho benchmark
  const formatBenchmark = (value) => {
    if (benchmarkFormat === "full") {
      // Format đầy đủ với dấu phẩy (VD: "KC: 7,500,000")
      return value.toLocaleString("vi-VN");
    } else if (benchmarkFormat === "integer") {
      // Làm tròn phần nguyên (VD: "KC: 15%")
      if (type === "percent") {
        return `${Math.round(value)}%`;
      }
      return Math.round(value).toLocaleString("vi-VN");
    } else {
      // Default: format như cũ (triệu đồng, 2 số thập phân)
      if (type === "money") {
        return `${(value / 1000000).toFixed(2)}`;
      } else if (type === "percent") {
        return `${value.toFixed(2)}%`;
      }
      return value.toLocaleString("vi-VN");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems:
          align === "center"
            ? "center"
            : align === "right"
            ? "flex-end"
            : "flex-start",
        gap: 0.5,
      }}
    >
      {/* Giá trị thực tế với chênh lệch */}
      <DifferenceCell
        current={current}
        difference={difference}
        type={type}
        align={align}
        invertColor={invertColor}
      />

      {/* Khuyến cáo */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          padding: "2px 6px",
          borderRadius: 1,
          backgroundColor: benchmarkBgColor,
          border: `1px solid ${benchmarkColor}`,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontSize: { xs: "0.65rem", sm: "0.75rem" },
            fontWeight: 600,
            color: benchmarkColor,
          }}
        >
          KC: {formatBenchmark(benchmark)}
        </Typography>
      </Box>
    </Box>
  );
}

export default BenchmarkCell;
