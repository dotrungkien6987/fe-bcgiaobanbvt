import { Button } from "@mui/material";
import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import HoiDongForm from "./HoiDongForm";
import { useDispatch } from "react-redux";



function AddHoiDongButton() {
  const [openFormAddNew, setOpenFormAddNew] = useState(false);
  const dispatch = useDispatch();
  const handleThemMoi = async () => {
      
    setOpenFormAddNew(true)
    console.log("them moi");
  };
  const handCloseForm = ()=>{
    setOpenFormAddNew(false)
  }
  const hoidong= {_id:0}
  return (
    <div>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleThemMoi}
      >
        Thêm 
      </Button>

      <HoiDongForm
      open ={openFormAddNew}
      handleClose={handCloseForm}
      hoidong={hoidong}
      />
    </div>
  );
}

export default AddHoiDongButton;
