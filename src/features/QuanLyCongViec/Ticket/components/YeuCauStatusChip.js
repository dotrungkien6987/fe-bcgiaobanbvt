/**
 * YeuCauStatusChip - Hiển thị trạng thái yêu cầu dạng Chip
 */
import React from "react";
import { Chip } from "@mui/material";
import { getTrangThaiLabel, getTrangThaiColor } from "../yeuCau.utils";

function YeuCauStatusChip({ trangThai, size = "small", ...props }) {
  return (
    <Chip
      label={getTrangThaiLabel(trangThai)}
      color={getTrangThaiColor(trangThai)}
      size={size}
      {...props}
    />
  );
}

export default YeuCauStatusChip;
