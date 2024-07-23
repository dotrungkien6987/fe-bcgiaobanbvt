import { Button } from "@mui/material";
import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import NhomHinhThucForm from "./NhomHinhThucForm";
import { useNavigate } from "react-router-dom";


function AddLopDaoTao() {
  const navigate = useNavigate();
  const handleThemMoi = () => {
    navigate("/addlopdaotao")
  };
  
  return (
    <div>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleThemMoi}
      >
        Thêm 
      </Button>

    </div>
  );
}

export default AddLopDaoTao;
