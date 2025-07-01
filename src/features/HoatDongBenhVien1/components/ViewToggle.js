import React from "react";
import {
  ToggleButton,
  ToggleButtonGroup,
  Box,
  Typography,
} from "@mui/material";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import TableRowsIcon from "@mui/icons-material/TableRows";

const ViewToggle = ({ viewMode, onViewModeChange }) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
      <Typography variant="body2" color="text.secondary">
        Chế độ xem:
      </Typography>
      <ToggleButtonGroup
        value={viewMode}
        exclusive
        onChange={(event, newMode) => {
          if (newMode !== null) {
            onViewModeChange(newMode);
          }
        }}
        size="small"
        sx={{
          "& .MuiToggleButton-root": {
            px: 2,
            py: 0.5,
            border: "1px solid rgba(25, 118, 210, 0.3)",
            "&.Mui-selected": {
              backgroundColor: "rgba(25, 118, 210, 0.1)",
              color: "#1976d2",
              "&:hover": {
                backgroundColor: "rgba(25, 118, 210, 0.2)",
              },
            },
            "&:hover": {
              backgroundColor: "rgba(25, 118, 210, 0.05)",
            },
          },
        }}
      >
        <ToggleButton value="card" aria-label="card view">
          <ViewModuleIcon fontSize="small" sx={{ mr: 0.5 }} />
          Card
        </ToggleButton>
        <ToggleButton value="table" aria-label="table view">
          <TableRowsIcon fontSize="small" sx={{ mr: 0.5 }} />
          Bảng
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default ViewToggle;
