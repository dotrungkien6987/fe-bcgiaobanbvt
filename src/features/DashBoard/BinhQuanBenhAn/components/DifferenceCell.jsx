import React from "react";
import { Box, Typography } from "@mui/material";
import { VND } from "../constants";

/**
 * Component hiển thị giá trị + chênh lệch theo pattern TaiChinh
 * @param {number} current - Giá trị hiện tại
 * @param {number} difference - Chênh lệch so với ngày trước
 * @param {string} type - 'money' | 'number' | 'percent'
 * @param {boolean} invertColor - Đảo màu (dùng cho BQ/ca: giảm = tốt)
 * @param {string} align - 'left' | 'center' | 'right'
 */
const DifferenceCell = ({
  current,
  difference,
  type = "number",
  invertColor = false,
  align = "right",
}) => {
  // Xác định màu dựa trên chênh lệch
  const isPositive = difference > 0;
  const isNegative = difference < 0;

  // Màu cơ bản: + = xanh lá, - = đỏ
  let diffColor = "#666";
  if (isPositive) diffColor = invertColor ? "#bb1515" : "#00C49F";
  if (isNegative) diffColor = invertColor ? "#00C49F" : "#bb1515";

  // Format giá trị
  const formatValue = (val) => {
    if (type === "money") return VND.format(val);
    if (type === "percent") return `${(val * 100).toFixed(1)}%`;
    return val.toLocaleString("vi-VN");
  };

  const formatDiff = (val) => {
    const prefix = val > 0 ? "+ " : val < 0 ? "- " : "";
    const absVal = Math.abs(val);
    return prefix + formatValue(absVal);
  };

  return (
    <Box sx={{ textAlign: align }}>
      <Typography
        sx={{
          fontSize: { xs: "0.7rem", sm: "0.85rem" },
          color: "#1939B7",
          fontWeight: 600,
          lineHeight: 1.2,
        }}
      >
        {formatValue(current)}
      </Typography>

      {difference !== 0 && (
        <Typography
          sx={{
            fontSize: { xs: "0.65rem", sm: "0.75rem" },
            color: diffColor,
            fontWeight: 500,
            lineHeight: 1.2,
            mt: 0.25,
          }}
        >
          {formatDiff(difference)}
        </Typography>
      )}
    </Box>
  );
};

export default DifferenceCell;
