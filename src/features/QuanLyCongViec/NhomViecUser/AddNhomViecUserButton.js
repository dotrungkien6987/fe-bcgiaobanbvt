import { Button } from "@mui/material";
import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import ThongTinNhomViecUser from "./ThongTinNhomViecUser";

function AddNhomViecUserButton() {
  const [openDialog, setOpenDialog] = useState(false);

  const handleAdd = () => {
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
  };

  const nhomViecUser = { _id: 0 }; // Object mặc định cho tạo mới

  return (
    <div>
      <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
        Thêm
      </Button>

      <ThongTinNhomViecUser
        open={openDialog}
        handleClose={handleClose}
        nhomViecUser={nhomViecUser}
      />
    </div>
  );
}

export default AddNhomViecUserButton;
