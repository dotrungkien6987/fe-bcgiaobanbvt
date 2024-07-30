import {  IconButton, Stack, Tooltip } from "@mui/material";
import React from "react";

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { Edit } from "iconsax-react";

import { useNavigate } from "react-router-dom";

function DiemDanhLopDaoTaoButton({lopdaotaoID}) {
  const navigate = useNavigate();
  
  const handleUpdate = () => {
    navigate(`/diemdanh/${lopdaotaoID}`)
  };
  return (
    <div>
      <Tooltip title="Điểm danh">
        <IconButton color="primary" onClick={handleUpdate}>
          <CalendarMonthIcon />
        </IconButton>
      </Tooltip>
     
    </div>
  );
}

export default DiemDanhLopDaoTaoButton;
