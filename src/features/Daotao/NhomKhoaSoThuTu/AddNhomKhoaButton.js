import React, { useState } from "react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import NhomKhoaSoThuTuForm from "./NhomKhoaSoThuTuForm";

function AddNhomKhoaButton() {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleOpen}
        sx={{ mb: 2 }}
      >
        Thêm nhóm khoa
      </Button>
      <NhomKhoaSoThuTuForm
        open={open}
        handleClose={handleClose}
        nhomKhoa={null}
      />
    </>
  );
}

export default AddNhomKhoaButton;