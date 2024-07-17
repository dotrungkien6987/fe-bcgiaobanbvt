import { Button, IconButton, Stack, Tooltip } from "@mui/material";
import React, { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import ThongTinNhanVien from "./ThongTinNhanVien";
import { Edit } from "iconsax-react";
import NhomHinhThucForm from "./NhomHinhThucForm";

function UpdateNhomHinhThucButton({index}) {
  
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
      <NhomHinhThucForm
      open ={openForm}
      handleClose={()=>setOpenForm(false)}
     
      index={index}
      />
    </div>
  );
}

export default UpdateNhomHinhThucButton;
