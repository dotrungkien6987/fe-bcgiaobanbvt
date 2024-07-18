import { Button } from "@mui/material";
import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import HinhThucCapNhatForm from "./HinhThucCapNhatForm";

function AddHinhThucButton() {
  const [openFormAddNew, setOpenFormAddNew] = useState(false);
  const handleThemMoi = () => {
    setOpenFormAddNew(true)
    console.log("them moi");
  };
  const handCloseFormNhanVien = ()=>{
    setOpenFormAddNew(false)
  }
  const hinhthuccapnhat= {_id:0}
  return (
    <div>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleThemMoi}
      >
        Thêm 
      </Button>

      <HinhThucCapNhatForm
      open ={openFormAddNew}
      handleClose={handCloseFormNhanVien}
      hinhthuccapnhat={hinhthuccapnhat}
      />
    </div>
  );
}

export default AddHinhThucButton;
