import { Button, IconButton, Tooltip } from "@mui/material";
import React, { useState } from "react";
import {DocumentUpload} from "iconsax-react"

import UpLoadHocVienLopDaoTaoForm from "./UpLoadHocVienLopDaoTaoForm";
import { useDispatch } from "react-redux";
import { getOneLopDaoTaoNhanVienByID, setOpenUploadLopDaoTaoNhanVien } from "../daotaoSlice";

function UploadLopDaoTaoNhanVienButton({lopdaotaonhanvienID}) {
  // const [openNhanVien, setOpenNhanVien] = useState(false);
  const dispatch = useDispatch()
  const handleThemMoi =  () => {
    // setOpenNhanVien(true)
     dispatch(getOneLopDaoTaoNhanVienByID(lopdaotaonhanvienID))
     dispatch(setOpenUploadLopDaoTaoNhanVien(true))
    
  };
  // const handCloseFormNhanVien = ()=>{
  //   setOpenNhanVien(false)
  // }
  
  return (
    <div>
      
      <Tooltip title="Upload ảnh">
        <IconButton color="primary" onClick={handleThemMoi}>
          <DocumentUpload />
        </IconButton>
      </Tooltip>
     
    </div>
  );
}

export default UploadLopDaoTaoNhanVienButton;
