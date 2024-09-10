import {  IconButton,  Tooltip } from "@mui/material";
import React, {  useState } from "react";

import { Edit } from "iconsax-react";
import HoiDongForm from "./HoiDongForm";


function UpdateHoiDongButton({hoidong}) {
  
  const [openForm,setOpenForm] =useState(false)
  const handleUpdate = () => {
   
setOpenForm(true)
  };
  return (
    <div>
      <Tooltip title="Sửa">
        <IconButton color="primary" onClick={handleUpdate}>
          <Edit />
        </IconButton>
      </Tooltip>
      <HoiDongForm
        open={openForm}
        handleClose={()=>setOpenForm(false)}
        hoidong={hoidong}
      />
    </div>
  );
}

export default UpdateHoiDongButton;
