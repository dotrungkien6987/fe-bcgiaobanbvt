import { Button } from "@mui/material";
import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import ThongTinNhanVien from "./ThongTinNhanVien";
function AddNhanVienButton() {
  const [openNhanVien, setOpenNhanVien] = useState(false);
  const handleThemMoi = () => {
    setOpenNhanVien(true)
    console.log("them moi");
  };
  const handCloseFormNhanVien = ()=>{
    setOpenNhanVien(false)
  }
  const nhanvien= {_id:0}
  return (
    <div>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleThemMoi}
      >
        Thêm mới
      </Button>

      <ThongTinNhanVien
      open ={openNhanVien}
      handleClose={handCloseFormNhanVien}
      nhanvien={nhanvien}
      />
    </div>
  );
}

export default AddNhanVienButton;
