import { Button, IconButton, Stack, Tooltip } from "@mui/material";
import React from "react";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { Edit } from "iconsax-react";

import { useNavigate } from "react-router-dom";

function DiemDanhLopDaoTaoButton({ lopdaotaoID, isButton = false }) {
  const navigate = useNavigate();

  const handleUpdate = () => {
    navigate(`/diemdanh/${lopdaotaoID}`);
  };
  return (
    <div>
      {isButton ? (
        <Button
        variant="contained"
        startIcon={<CalendarMonthIcon />}
        onClick={handleUpdate}
      >
        Điểm danh 
      </Button>
      
      ) : (
        <Tooltip title="Điểm danh">
          <IconButton color="primary" onClick={handleUpdate}>
            <CalendarMonthIcon />
          </IconButton>
        </Tooltip>
      )}
    </div>
  );
}

export default DiemDanhLopDaoTaoButton;
