import { Button, IconButton, Stack, Tooltip } from "@mui/material";
import React, { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import ThongTinNhanVien from "./ThongTinNhanVien";
import { Edit } from "iconsax-react";
import { Delete } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { setIsOpenUpdateNhanVien, setNhanVienCurent } from "features/NhanVien/nhanvienSlice";
function UpdateNhanVienButton({nhanvien}) {
  const {nhanvienCurrent,nhanvienCurent,isOpenUpdateNhanVien} =useSelector((state)=>state.nhanvien)
  const dispatch = useDispatch()
  const [openForm,setOpenForm] =useState(false)
  const handleUpdate = () => {
    // dispatch(setNhanVienCurent(nhanvien))
    // dispatch(setIsOpenUpdateNhanVien(true))
    
    // console.log('nhanvien update buttton',nhanvien)
    // console.log('nhanvien update curent buttton',nhanvienCurrent)
setOpenForm(true)
  };
  return (
    <div>
      <Tooltip title="Sửa">
        <IconButton color="primary" onClick={handleUpdate}>
          <Edit />
        </IconButton>
      </Tooltip>
      <ThongTinNhanVien
        open={openForm}
        handleClose={()=>setOpenForm(false)}
        nhanvien={nhanvien}
      />
    </div>
  );
}

export default UpdateNhanVienButton;
