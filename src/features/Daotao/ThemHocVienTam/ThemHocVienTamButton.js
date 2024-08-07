import { Button, IconButton, Stack, Tooltip } from "@mui/material";
import React from "react";


import { ElementPlus } from "iconsax-react";

import { useNavigate } from "react-router-dom";

function ThemHocVienTamButton({ lopdaotaoID}) {
  const navigate = useNavigate();

  const handleUpdate = () => {
    navigate(`/lopdaotaotam/${lopdaotaoID}`);
  };
  return (
    <div>
      
    
        <Tooltip title="Tạo thành viên tạm">
          <IconButton color="primary" onClick={handleUpdate}>
            <ElementPlus />
          </IconButton>
        </Tooltip>
      
    </div>
  );
}

export default ThemHocVienTamButton;
