/**
 * MobileFilterDrawer Component
 *
 * Mobile-friendly filter drawer for CongViecDashboard with:
 * - DateRangePresets integration
 * - Deadline status filter chips (Quá hạn/Sắp hết hạn/Tất cả)
 * - 3-section layout: Header (fixed) → Content (scrollable) → Footer (sticky)
 * - Responsive width: 85% mobile, 360px desktop
 *
 * Pattern based on: MyTasksPage.js#L467-L550
 *
 * @component
 */

import React, { useState } from "react";
import {
  Drawer,
  Box,
  Stack,
  Typography,
  IconButton,
  Button,
  Chip,
  Divider,
} from "@mui/material";
import { Filter, Refresh2 } from "iconsax-react";
import DateRangePresets from "../../../CongViec/components/DateRangePresets";

/**
 * Main Component
 */
export default function MobileFilterDrawer({
  open,
  onClose,
  dateRange,
  selectedPreset,
  onDatePresetChange,
  deadlineFilter,
  onDeadlineFilterChange,
  onApply,
  onReset,
}) {
  // Local state for filters (apply on button click)
  const [localDateRange, setLocalDateRange] = useState(dateRange);
  const [localSelectedPreset, setLocalSelectedPreset] =
    useState(selectedPreset);
  const [localDeadlineFilter, setLocalDeadlineFilter] =
    useState(deadlineFilter);

  // Deadline filter options
  const deadlineOptions = [
    { value: "ALL", label: "Tất cả", icon: "📋" },
    { value: "QUA_HAN", label: "Quá hạn", icon: "⚠️" },
    { value: "SAP_QUA_HAN", label: "Sắp hết hạn", icon: "⏰" },
    { value: "DUNG_HAN", label: "Đúng hạn", icon: "✅" },
  ];

  // Handle date preset change (local state)
  const handleLocalDatePresetChange = (from, to, key) => {
    setLocalDateRange({ from, to });
    setLocalSelectedPreset(key);
  };

  // Handle deadline filter change
  const handleDeadlineFilterChange = (value) => {
    setLocalDeadlineFilter(value);
  };

  // Handle apply filters
  const handleApply = () => {
    // Update parent state
    onDatePresetChange(
      localDateRange.from,
      localDateRange.to,
      localSelectedPreset
    );
    onDeadlineFilterChange(localDeadlineFilter);

    // Trigger apply callback
    if (onApply) {
      onApply();
    }

    onClose();
  };

  // Handle reset filters
  const handleReset = () => {
    // Reset to defaults
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1); // Monday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Sunday

    const defaultDateRange = {
      from: weekStart.toISOString().split("T")[0],
      to: weekEnd.toISOString().split("T")[0],
    };

    setLocalDateRange(defaultDateRange);
    setLocalSelectedPreset("week");
    setLocalDeadlineFilter("ALL");

    // Update parent state
    onDatePresetChange(defaultDateRange.from, defaultDateRange.to, "week");
    onDeadlineFilterChange("ALL");

    // Trigger reset callback
    if (onReset) {
      onReset();
    }
  };

  // Sync local state when drawer opens
  React.useEffect(() => {
    if (open) {
      setLocalDateRange(dateRange);
      setLocalSelectedPreset(selectedPreset);
      setLocalDeadlineFilter(deadlineFilter);
    }
  }, [open, dateRange, selectedPreset, deadlineFilter]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "85%", sm: 360 },
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* ===== HEADER (Fixed) ===== */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
          backgroundColor: "background.paper",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Filter size={24} variant="Bold" />
          <Typography variant="h6" fontWeight={600}>
            Bộ lọc
          </Typography>
        </Stack>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ lineHeight: 1 }}
          >
            ×
          </Typography>
        </IconButton>
      </Stack>

      {/* ===== CONTENT (Scrollable) ===== */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
        }}
      >
        {/* Date Range Section */}
        <Box mb={3}>
          <Typography
            variant="subtitle2"
            fontWeight={600}
            color="text.secondary"
            mb={1.5}
          >
            📅 Khoảng thời gian
          </Typography>
          <DateRangePresets
            onSelectPreset={handleLocalDatePresetChange}
            selectedPreset={localSelectedPreset}
            disabled={false}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Deadline Status Section */}
        <Box mb={3}>
          <Typography
            variant="subtitle2"
            fontWeight={600}
            color="text.secondary"
            mb={1.5}
          >
            ⏱️ Tình trạng hạn
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {deadlineOptions.map((option) => (
              <Chip
                key={option.value}
                label={`${option.icon} ${option.label}`}
                onClick={() => handleDeadlineFilterChange(option.value)}
                color={
                  localDeadlineFilter === option.value ? "primary" : "default"
                }
                variant={
                  localDeadlineFilter === option.value ? "filled" : "outlined"
                }
                sx={{
                  fontWeight: localDeadlineFilter === option.value ? 600 : 400,
                  cursor: "pointer",
                }}
              />
            ))}
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Info text */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1,
            bgcolor: "action.hover",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            💡 <strong>Lưu ý:</strong> Bộ lọc thời gian áp dụng để đếm số việc
            đã hoàn thành, hiển thị tất cả các việc chưa hoàn thành.
          </Typography>
        </Box>
      </Box>

      {/* ===== FOOTER (Sticky) ===== */}
      <Stack
        spacing={1.5}
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: "divider",
          backgroundColor: "background.paper",
        }}
      >
        <Button
          variant="contained"
          fullWidth
          onClick={handleApply}
          startIcon={<Filter size={18} />}
        >
          Áp dụng bộ lọc
        </Button>
        <Button
          variant="text"
          fullWidth
          onClick={handleReset}
          startIcon={<Refresh2 size={18} />}
        >
          Đặt lại mặc định
        </Button>
      </Stack>
    </Drawer>
  );
}
