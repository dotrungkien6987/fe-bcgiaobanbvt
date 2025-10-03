import React from "react";
import { Box } from "@mui/material";

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`department-tabpanel-${index}`}
      aria-labelledby={`department-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: { xs: 1.5, sm: 3 } }}>{children}</Box>}
    </div>
  );
}

export default TabPanel;
