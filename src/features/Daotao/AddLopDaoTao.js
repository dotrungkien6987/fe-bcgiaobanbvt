import { Button } from "@mui/material";
import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import NhomHinhThucForm from "./NhomHinhThucForm";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { resetLopDaoTaoCurrent } from "./daotaoSlice";

function AddLopDaoTao({mahinhthuccapnhat}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleThemMoi = async () => {
    await dispatch(resetLopDaoTaoCurrent());
    navigate(`/lopdaotao/${mahinhthuccapnhat}`);
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
