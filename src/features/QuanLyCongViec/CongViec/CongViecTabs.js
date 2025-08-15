import React from "react";
import { Tabs, Tab, Box } from "@mui/material";

const CongViecTabs = ({
  activeTab,
  onTabChange,
  receivedCount = 0,
  assignedCount = 0,
}) => {
  const handleChange = (event, newValue) => {
    onTabChange(newValue);
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
      <Tabs
        value={activeTab}
        onChange={handleChange}
        aria-label="Công việc tabs"
        variant="fullWidth"
        sx={{
          "& .MuiTabs-flexContainer": {
            justifyContent: "flex-start",
          },
        }}
      >
        <Tab
          label={`Việc tôi nhận (${receivedCount})`}
          value="received"
          id="congviec-tab-received"
          aria-controls="congviec-tabpanel-received"
        />
        <Tab
          label={`Việc tôi giao (${assignedCount})`}
          value="assigned"
          id="congviec-tab-assigned"
          aria-controls="congviec-tabpanel-assigned"
        />
      </Tabs>
    </Box>
  );
};

// TabPanel component
export const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`congviec-tabpanel-${index}`}
      aria-labelledby={`congviec-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
};

export default CongViecTabs;
