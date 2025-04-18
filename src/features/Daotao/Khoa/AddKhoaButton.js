import { Button } from "@mui/material";
import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import KhoaForm from "./KhoaForm";

function AddKhoaButton() {
  const [openFormAddNew, setOpenFormAddNew] = useState(false);
  
  const handleThemMoi = () => {
    setOpenFormAddNew(true);
  };
  
  const handleCloseForm = () => {
    setOpenFormAddNew(false);
  }
  
  const khoa = { _id: 0 };
  
  return (
    <div>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleThemMoi}
      >
        Thêm khoa
      </Button>

      <KhoaForm
        open={openFormAddNew}
        handleClose={handleCloseForm}
        khoa={khoa}
      />
    </div>
  );
}

export default AddKhoaButton;