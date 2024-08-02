import {  IconButton, Stack, Tooltip } from "@mui/material";
import React from "react";


import { ExportSquare } from "iconsax-react";

import { useNavigate } from "react-router-dom";

function QuaTrinhDaoTaoNhanVienButon({nhanvienID}) {
  const navigate = useNavigate();
  
  const handleUpdate = () => {
    navigate(`/quatrinhdaotao/${nhanvienID}`)
  };
  return (
    <div>
      <Tooltip title="Quá trình đào tạo">
        <IconButton color="primary" onClick={handleUpdate}>
          <ExportSquare />
        </IconButton>
      </Tooltip>
     
    </div>
  );
}

export default QuaTrinhDaoTaoNhanVienButon;
