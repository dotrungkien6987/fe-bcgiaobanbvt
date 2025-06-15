import React from "react";
import { Button, Tooltip } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useHoatDongBenhVien } from "../HoatDongBenhVienProvider";

const RefreshStatsButton = ({ departmentId }) => {
  const { fetchStatsData, loading } = useHoatDongBenhVien();

  const handleRefresh = () => {
    fetchStatsData();
  };

  return (
    <Tooltip title="C?p nh?t d? li?u th?ng kê">
      <Button
        size="small"
        color="primary"
        onClick={handleRefresh}
        disabled={loading}
        sx={{ minWidth: "auto", p: 0.5 }}
      >
        <RefreshIcon fontSize="small" />
      </Button>
    </Tooltip>
  );
};

export default RefreshStatsButton;
