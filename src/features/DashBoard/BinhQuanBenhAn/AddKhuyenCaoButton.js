import { Button } from "@mui/material";
import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import KhuyenCaoKhoaBQBAForm from "./KhuyenCaoKhoaBQBAForm";

function AddKhuyenCaoButton({ currentYear, khoaList }) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
        Thêm khuyến cáo
      </Button>

      <KhuyenCaoKhoaBQBAForm
        open={open}
        handleClose={handleClose}
        currentYear={currentYear}
        khoaList={khoaList}
      />
    </div>
  );
}

export default AddKhuyenCaoButton;
