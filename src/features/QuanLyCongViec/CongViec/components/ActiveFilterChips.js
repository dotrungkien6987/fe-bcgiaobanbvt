import React from "react";
import { Stack, Chip, Typography } from "@mui/material";

/**
 * ActiveFilterChips Component - Display active filters as removable chips
 *
 * Shows visual feedback for filters currently applied (excluding status which is shown in tabs)
 * User can click X on chip to remove individual filter
 *
 * @param {Object} filters - Current filter values from Redux/state
 * @param {Function} onRemoveFilter - Callback to remove a filter (key)
 * @param {Array} excludeFields - Filter keys to exclude from display (e.g., ['TrangThai'])
 */
function ActiveFilterChips({
  filters = {},
  onRemoveFilter,
  excludeFields = [],
}) {
  // Get active filters (non-empty values, excluding specified fields)
  const activeFilters = Object.entries(filters).filter(([key, value]) => {
    // Skip if in exclude list
    if (excludeFields.includes(key)) return false;

    // Skip if empty/null/undefined
    if (!value || value === "" || value === "ALL") return false;

    // Skip arrays with no items
    if (Array.isArray(value) && value.length === 0) return false;

    return true;
  });

  // Don't render if no active filters
  if (activeFilters.length === 0) {
    return null;
  }

  // Get human-readable label for filter key
  const getFilterLabel = (key) => {
    const labelMap = {
      search: "Tìm kiếm",
      MaCongViec: "Mã công việc",
      DoUuTien: "Ưu tiên",
      TinhTrangHan: "Tình trạng hạn",
      NguoiGiao: "Người giao",
      NguoiNhan: "Người nhận",
      TuNgay: "Từ ngày",
      DenNgay: "Đến ngày",
      VaiTroCuaToi: "Vai trò",
    };
    return labelMap[key] || key;
  };

  // Format filter value for display
  const getFilterValue = (key, value) => {
    // Handle date filters
    if (key === "TuNgay" || key === "DenNgay") {
      if (value instanceof Date) {
        return value.toLocaleDateString("vi-VN");
      }
      return value;
    }

    // Handle object values (e.g., NguoiGiao with HoTen)
    if (typeof value === "object" && value !== null) {
      return value.HoTen || value.TenCongViec || JSON.stringify(value);
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return value.join(", ");
    }

    return value;
  };

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{
        mb: 2,
        p: 1.5,
        borderRadius: 1,
        backgroundColor: "action.hover",
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontWeight: 500 }}
      >
        Đang lọc:
      </Typography>

      {activeFilters.map(([key, value]) => (
        <Chip
          key={key}
          label={`${getFilterLabel(key)}: ${getFilterValue(key, value)}`}
          onDelete={() => onRemoveFilter(key)}
          size="small"
          color="primary"
          variant="outlined"
          sx={{
            fontWeight: 500,
            "& .MuiChip-deleteIcon": {
              fontSize: 18,
            },
          }}
        />
      ))}
    </Stack>
  );
}

export default ActiveFilterChips;
