import React, { useState } from "react";
import { Button } from "@mui/material";
import { useDispatch } from "react-redux";
import { getDoanRas } from "./doanraSlice";
import { Add } from "iconsax-react";
import DoanRaForm from "./DoanRaForm";

function AddDoanRa() {
  const dispatch = useDispatch();
  const [openForm, setOpenForm] = useState(false);

  const handleOpenForm = () => {
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
  };

  const handleSuccess = () => {
    // Refresh danh sách sau khi thêm thành công
    dispatch(getDoanRas());
  };

  return (
    <>
      <Button
        color="success"
        variant="contained"
        size="small"
        onClick={handleOpenForm}
        startIcon={<Add size={18} />}
      >
        Thêm Đoàn Ra
      </Button>

      <DoanRaForm
        open={openForm}
        onClose={handleCloseForm}
        onSuccess={handleSuccess}
      />
    </>
  );
}

export default AddDoanRa;
