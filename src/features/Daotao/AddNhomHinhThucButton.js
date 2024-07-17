import { Button } from "@mui/material";
import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import NhomHinhThucForm from "./NhomHinhThucForm";


function AddNhomHinhThucButton() {
  const [openDatafix, setOpenDatafix] = useState(false);
  const handleThemMoi = () => {
    setOpenDatafix(true)
    console.log("them moi");
  };
  const handCloseFormDataFix = ()=>{
    setOpenDatafix(false)
  }
  
  return (
    <div>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleThemMoi}
      >
        Thêm 
      </Button>

      <NhomHinhThucForm
      open ={openDatafix}
      handleClose={handCloseFormDataFix}
      
      />
    </div>
  );
}

export default AddNhomHinhThucButton;
