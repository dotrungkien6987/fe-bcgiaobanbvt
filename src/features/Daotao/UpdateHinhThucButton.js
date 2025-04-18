import {  IconButton,  Tooltip } from "@mui/material";
import React, {  useState } from "react";


import { Edit } from "iconsax-react";
import HinhThucCapNhatForm from "./HinhThucCapNhatForm";

function UpdateHinhThucButton({hinhthuccapnhat}) {
  
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
      <HinhThucCapNhatForm
        open={openForm}
        handleClose={()=>setOpenForm(false)}
        hinhthuccapnhat={hinhthuccapnhat} 
      />
    </div>
  );
}

export default UpdateHinhThucButton;
