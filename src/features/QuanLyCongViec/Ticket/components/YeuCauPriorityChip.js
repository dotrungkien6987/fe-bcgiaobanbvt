/**
 * YeuCauPriorityChip - Hiển thị mức độ ưu tiên dạng Chip
 */
import React from "react";
import { Chip } from "@mui/material";
import {
  PriorityHigh as UrgentIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { getMucDoUuTienLabel, getMucDoUuTienColor } from "../yeuCau.utils";
import { MUC_DO_UU_TIEN } from "../yeuCau.constants";

function YeuCauPriorityChip({
  priority,
  size = "small",
  showIcon = true,
  ...props
}) {
  const getIcon = () => {
    if (!showIcon) return undefined;
    switch (priority) {
      case MUC_DO_UU_TIEN.RAT_KHAN_CAP:
        return <UrgentIcon fontSize="small" />;
      case MUC_DO_UU_TIEN.KHAN_CAP:
        return <WarningIcon fontSize="small" />;
      default:
        return undefined;
    }
  };

  return (
    <Chip
      icon={getIcon()}
      label={getMucDoUuTienLabel(priority)}
      color={getMucDoUuTienColor(priority)}
      size={size}
      variant="outlined"
      {...props}
    />
  );
}

export default YeuCauPriorityChip;
