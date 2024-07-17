import { Button, IconButton, Stack, Tooltip } from "@mui/material";
import React, { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import ThongTinNhanVien from "./ThongTinNhanVien";
import { Edit } from "iconsax-react";
import { Delete } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { setIsOpenUpdateNhanVien, setNhanVienCurent } from "features/NhanVien/nhanvienSlice";
import DataFixForm from "./DataFixForm";
function UpdateDataFixButton({datafixField="DonVi",datafixTitle='Đơn vị',index}) {
  
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
      <DataFixForm
      open ={openForm}
      handleClose={()=>setOpenForm(false)}
      datafixField={datafixField}
      datafixTitle={datafixTitle}
      index={index}
      />
    </div>
  );
}

export default UpdateDataFixButton;
