import {  IconButton, Stack, Tooltip } from "@mui/material";
import React from "react";


import { Edit } from "iconsax-react";

import { useNavigate } from "react-router-dom";

function UpdateLopDaoTaoButton({lopdaotaoID}) {
  const navigate = useNavigate();
  
  const handleUpdate = () => {
    navigate(`/lopdaotao/${lopdaotaoID}`)
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
