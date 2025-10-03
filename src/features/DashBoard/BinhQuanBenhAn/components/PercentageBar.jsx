import React from "react";
import { Box, Stack, Typography, LinearProgress } from "@mui/material";
import { PCT } from "../constants";

function PercentageBar({ value = 0, color = "#1939B7" }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box sx={{ flexGrow: 1 }}>
        <LinearProgress
          variant="determinate"
          value={Math.max(0, Math.min(100, (value || 0) * 100))}
          sx={{
            height: { xs: 6, sm: 8 },
            borderRadius: 5,
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "#2a2a2a" : "#E5EAF2",
            "& .MuiLinearProgress-bar": { bgcolor: color },
          }}
        />
      </Box>
      <Typography
        variant="caption"
        sx={{
          color: "#1939B7",
          fontSize: { xs: "0.6rem", sm: "0.75rem" },
        }}
      >
        {PCT.format(value || 0)}
      </Typography>
    </Stack>
  );
}

export default PercentageBar;
