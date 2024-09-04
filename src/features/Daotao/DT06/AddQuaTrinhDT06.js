import { Button } from "@mui/material";
import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import QuaTrinhDT06Form from "./QuaTrinhDT06Form";
import { useSelector } from "react-redux";


function AddQuaTrinhDT06() {
  const [openQuaTrinh, setOpenQuaTrinh] = useState(false);
  const {  hocviendt06Current } = useSelector((state) => state.daotao);
  const handleThemMoi = () => {
    if (!hocviendt06Current.NhanVienID) {
      alert("Chưa có thành viên trong lớp");
      return;
    }
    setOpenQuaTrinh(true)
    console.log("them moi");
  };
  const handCloseFormNhanVien = ()=>{
    setOpenQuaTrinh(false)
  }
  const quatrinhDT06= {_id:0}
  return (
    <div>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleThemMoi}
      >
        Thêm 
      </Button>

      <QuaTrinhDT06Form
      open ={openQuaTrinh}
      handleClose={handCloseFormNhanVien}
      quatrinhDT06={quatrinhDT06}
      hocvien={hocviendt06Current}
      />
    </div>
  );
}

export default AddQuaTrinhDT06;
