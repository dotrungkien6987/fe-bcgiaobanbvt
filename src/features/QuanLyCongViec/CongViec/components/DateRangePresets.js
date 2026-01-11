import React from "react";
import { Box, Chip, Stack } from "@mui/material";
import dayjs from "dayjs";

/**
 * DateRangePresets - Quick date range selection chips
 *
 * Provides common date range presets for filtering completed tasks:
 * - Hôm nay (Today)
 * - Tuần này (This Week)
 * - Tháng này (This Month)
 * - Quý này (This Quarter)
 * - Năm nay (This Year)
 *
 * Props:
 * @param {Function} onSelectPreset - Callback(from, to) when preset selected
 * @param {string} selectedPreset - Currently active preset key
 * @param {boolean} disabled - Disable all presets
 */
const DateRangePresets = ({
  onSelectPreset,
  selectedPreset,
  disabled = false,
}) => {
  const presets = [
    {
      key: "today",
      label: "Hôm nay",
      getRange: () => ({
        from: dayjs().startOf("day").format("YYYY-MM-DD"),
        to: dayjs().endOf("day").format("YYYY-MM-DD"),
      }),
    },
    {
      key: "last7days",
      label: "7 ngày trước",
      getRange: () => ({
        from: dayjs().subtract(7, "day").startOf("day").format("YYYY-MM-DD"),
        to: dayjs().endOf("day").format("YYYY-MM-DD"),
      }),
    },
    {
      key: "last30days",
      label: "30 ngày trước",
      getRange: () => ({
        from: dayjs().subtract(30, "day").startOf("day").format("YYYY-MM-DD"),
        to: dayjs().endOf("day").format("YYYY-MM-DD"),
      }),
    },
    {
      key: "week",
      label: "Tuần này",
      getRange: () => ({
        from: dayjs().startOf("week").format("YYYY-MM-DD"),
        to: dayjs().endOf("week").format("YYYY-MM-DD"),
      }),
    },
    {
      key: "lastWeek",
      label: "Tuần trước",
      getRange: () => ({
        from: dayjs().subtract(1, "week").startOf("week").format("YYYY-MM-DD"),
        to: dayjs().subtract(1, "week").endOf("week").format("YYYY-MM-DD"),
      }),
    },
    {
      key: "month",
      label: "Tháng này",
      getRange: () => ({
        from: dayjs().startOf("month").format("YYYY-MM-DD"),
        to: dayjs().endOf("month").format("YYYY-MM-DD"),
      }),
    },
    {
      key: "lastMonth",
      label: "Tháng trước",
      getRange: () => ({
        from: dayjs()
          .subtract(1, "month")
          .startOf("month")
          .format("YYYY-MM-DD"),
        to: dayjs().subtract(1, "month").endOf("month").format("YYYY-MM-DD"),
      }),
    },
    {
      key: "quarter",
      label: "Quý này",
      getRange: () => ({
        from: dayjs().startOf("quarter").format("YYYY-MM-DD"),
        to: dayjs().endOf("quarter").format("YYYY-MM-DD"),
      }),
    },
    {
      key: "lastQuarter",
      label: "Quý trước",
      getRange: () => ({
        from: dayjs()
          .subtract(1, "quarter")
          .startOf("quarter")
          .format("YYYY-MM-DD"),
        to: dayjs()
          .subtract(1, "quarter")
          .endOf("quarter")
          .format("YYYY-MM-DD"),
      }),
    },
    {
      key: "year",
      label: "Năm nay",
      getRange: () => ({
        from: dayjs().startOf("year").format("YYYY-MM-DD"),
        to: dayjs().endOf("year").format("YYYY-MM-DD"),
      }),
    },
  ];

  const handlePresetClick = (preset) => {
    if (disabled) return;
    const range = preset.getRange();
    onSelectPreset(range.from, range.to, preset.key);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {presets.map((preset) => (
          <Chip
            key={preset.key}
            label={preset.label}
            onClick={() => handlePresetClick(preset)}
            color={selectedPreset === preset.key ? "primary" : "default"}
            variant={selectedPreset === preset.key ? "filled" : "outlined"}
            disabled={disabled}
            sx={{
              cursor: disabled ? "default" : "pointer",
              "&:hover": {
                backgroundColor:
                  selectedPreset === preset.key ? undefined : "action.hover",
              },
            }}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default React.memo(DateRangePresets);
