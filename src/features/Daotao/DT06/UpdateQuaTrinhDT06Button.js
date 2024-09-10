import {  IconButton,  Tooltip } from "@mui/material";
import React, {  useState } from "react";


import { Edit } from "iconsax-react";

import QuaTrinhDT06Form from "./QuaTrinhDT06Form";
import { useSelector } from "react-redux";
function UpdateQuaTrinhDT06Button({quatrinhDT06}) {
  const {  hocviendt06Current } = useSelector((state) => state.daotao);
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
      <QuaTrinhDT06Form
        open={openForm}
        handleClose={()=>setOpenForm(false)}
        quatrinhDT06={quatrinhDT06}
        hocvien={hocviendt06Current}
      />
    </div>
  );
}

export default UpdateQuaTrinhDT06Button;
