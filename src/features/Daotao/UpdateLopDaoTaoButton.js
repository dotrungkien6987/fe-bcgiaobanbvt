import {  IconButton, Stack, Tooltip } from "@mui/material";
import React from "react";

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { Edit } from "iconsax-react";

import { useNavigate } from "react-router-dom";

function UpdateLopDaoTaoButton({lopdaotaoID}) {
  const navigate = useNavigate();
  
  const handleUpdate = () => {
    navigate(`/lopdaotao/${lopdaotaoID}/7`)
  };
  return (
    <div>
      <Tooltip title="Sửa">
        <IconButton color="primary" onClick={handleUpdate}>
          <Edit />
        </IconButton>
      </Tooltip>
     
    </div>
  );
}

export default UpdateLopDaoTaoButton;
