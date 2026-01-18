/**
 * DateRangePresets Component
 *
 * Horizontal scrollable date preset chips for dashboard filtering
 * Mobile-first design với smooth scrolling
 *
 * Props:
 * - value: "7d" | "30d" | "month" | "quarter"
 * - onChange: (preset, { tuNgay, denNgay }) => void
 */
import React from "react";
import { Box, ToggleButtonGroup, ToggleButton } from "@mui/material";
import dayjs from "dayjs";

const PRESETS = [
  {
    key: "7d",
    label: "7 ngày",
    getDates: () => ({
      tuNgay: dayjs().subtract(7, "day").format("YYYY-MM-DD"),
      denNgay: dayjs().format("YYYY-MM-DD"),
    }),
  },
  {
    key: "30d",
    label: "30 ngày",
    getDates: () => ({
      tuNgay: dayjs().subtract(30, "day").format("YYYY-MM-DD"),
      denNgay: dayjs().format("YYYY-MM-DD"),
    }),
  },
  {
    key: "month",
    label: "Tháng này",
    getDates: () => ({
      tuNgay: dayjs().startOf("month").format("YYYY-MM-DD"),
      denNgay: dayjs().endOf("month").format("YYYY-MM-DD"),
    }),
  },
  {
    key: "quarter",
    label: "Quý này",
    getDates: () => ({
      tuNgay: dayjs().startOf("quarter").format("YYYY-MM-DD"),
      denNgay: dayjs().endOf("quarter").format("YYYY-MM-DD"),
    }),
  },
];

export default function DateRangePresets({ value = "30d", onChange }) {
  const handleChange = (event, newValue) => {
    if (!newValue) return; // Prevent deselect

    const preset = PRESETS.find((p) => p.key === newValue);
    if (preset && onChange) {
      onChange(newValue, preset.getDates());
    }
  };

  return (
    <Box
      sx={{
        mb: 2,
        overflowX: "auto",
        WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
        "&::-webkit-scrollbar": {
          display: "none", // Hide scrollbar
        },
        scrollbarWidth: "none", // Hide scrollbar Firefox
      }}
    >
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={handleChange}
        size="small"
        sx={{
          display: "inline-flex",
          gap: 1,
          px: { xs: 1, sm: 0 },
          // Prevent wrap
          flexWrap: "nowrap",
          "& .MuiToggleButton-root": {
            px: { xs: 2, sm: 3 },
            py: 1,
            borderRadius: "20px",
            textTransform: "none",
            fontWeight: 500,
            fontSize: { xs: "0.875rem", sm: "0.938rem" },
            border: "1px solid",
            borderColor: "divider",
            whiteSpace: "nowrap",
            "&.Mui-selected": {
              bgcolor: "primary.main",
              color: "white",
              "&:hover": {
                bgcolor: "primary.dark",
              },
            },
          },
        }}
      >
        {PRESETS.map((preset) => (
          <ToggleButton key={preset.key} value={preset.key}>
            {preset.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}
