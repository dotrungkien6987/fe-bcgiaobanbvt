/**
 * KPICycleSelector - Cycle dropdown selector
 *
 * Features:
 * - Sticky on mobile (below AppBar)
 * - Shows cycle name + date range
 * - Card wrapper for visual separation
 */
import React from "react";
import {
  Box,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";

function KPICycleSelector({
  cycles = [],
  selectedCycleId,
  onChange,
  isLoading,
  isMobile = false,
}) {
  const formatDateRange = (cycle) => {
    if (!cycle?.NgayBatDau || !cycle?.NgayKetThuc) return "";
    const start = dayjs(cycle.NgayBatDau).format("DD/MM/YYYY");
    const end = dayjs(cycle.NgayKetThuc).format("DD/MM/YYYY");
    return `(${start} - ${end})`;
  };

  return (
    <Box
      sx={{
        position: { xs: "sticky", md: "static" },
        top: { xs: 56, md: 0 },
        zIndex: { xs: 100, md: 0 },
        bgcolor: { xs: "background.default", md: "transparent" },
        py: { xs: 1, md: 0 },
      }}
    >
      <Card
        elevation={1}
        sx={{
          border: 1,
          borderColor: "primary.light",
          bgcolor: "primary.lighter",
        }}
      >
        <CardContent
          sx={{
            py: { xs: 1.5, md: 2 },
            "&:last-child": { pb: { xs: 1.5, md: 2 } },
          }}
        >
          <FormControl fullWidth size="small">
            <InputLabel id="cycle-selector-label">Chu kỳ đánh giá</InputLabel>
            <Select
              labelId="cycle-selector-label"
              id="cycle-selector"
              value={selectedCycleId || ""}
              label="Chu kỳ đánh giá"
              onChange={(e) => onChange(e.target.value)}
              disabled={isLoading}
              sx={{
                bgcolor: "background.paper",
                "& .MuiSelect-select": {
                  py: 1.25,
                },
              }}
            >
              <MenuItem value="" disabled>
                <em>Chọn chu kỳ đánh giá</em>
              </MenuItem>
              {cycles.map((cycle) => (
                <MenuItem key={cycle._id} value={cycle._id}>
                  <Box>
                    <Typography
                      variant="body1"
                      component="span"
                      fontWeight={500}
                    >
                      {cycle.TenChuKy}
                    </Typography>
                    <Typography
                      variant="caption"
                      component="span"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      {formatDateRange(cycle)}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>
    </Box>
  );
}

export default KPICycleSelector;
