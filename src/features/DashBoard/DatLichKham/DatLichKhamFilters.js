import React from "react";
import { Stack, Button, Box, Chip } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";

function DatLichKhamFilters({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onSearch,
}) {
  const presets = [
    {
      label: "Tháng này",
      from: dayjs().startOf("month"),
      to: dayjs().endOf("month"),
    },
    {
      label: "Tháng trước",
      from: dayjs().subtract(1, "month").startOf("month"),
      to: dayjs().subtract(1, "month").endOf("month"),
    },
    {
      label: "Quý này",
      from: dayjs().startOf("quarter"),
      to: dayjs().endOf("quarter"),
    },
    {
      label: "6 tháng",
      from: dayjs().subtract(6, "month").startOf("month"),
      to: dayjs().endOf("month"),
    },
  ];

  const handlePreset = (preset) => {
    onFromDateChange(preset.from);
    onToDateChange(preset.to);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
        >
          <DatePicker
            label="Từ ngày"
            value={fromDate}
            onChange={onFromDateChange}
            format="DD/MM/YYYY"
            slotProps={{ textField: { size: "small", sx: { width: 160 } } }}
          />
          <DatePicker
            label="Đến ngày"
            value={toDate}
            onChange={onToDateChange}
            format="DD/MM/YYYY"
            slotProps={{ textField: { size: "small", sx: { width: 160 } } }}
          />

          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={onSearch}
            size="medium"
          >
            Tìm kiếm
          </Button>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              onFromDateChange(dayjs().startOf("month"));
              onToDateChange(dayjs().endOf("month"));
            }}
            size="medium"
          >
            Làm mới
          </Button>
        </Stack>
      </LocalizationProvider>

      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        {presets.map((p) => (
          <Chip
            key={p.label}
            label={p.label}
            onClick={() => handlePreset(p)}
            variant="outlined"
            size="small"
            color="primary"
            clickable
          />
        ))}
      </Stack>
    </Box>
  );
}

export default DatLichKhamFilters;
