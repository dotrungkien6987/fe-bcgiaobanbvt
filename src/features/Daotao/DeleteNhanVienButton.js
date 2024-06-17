import { Button, IconButton, Stack, Tooltip } from "@mui/material";
import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import ThongTinNhanVien from "./ThongTinNhanVien";

import { Delete } from "@mui/icons-material";
function DeleteNhanVienButton() {
  const [openNhanVien, setOpenNhanVien] = useState(false);
  const handleUpdate = () => {
    setOpenNhanVien(true);
    console.log("them moi");
  };
  const handCloseFormNhanVien = () => {
    setOpenNhanVien(false);
  };
  return (
    <div>
      <Tooltip title="Xóa">
        <IconButton color="primary" onClick={handleUpdate}>
          <Delete />
        </IconButton>
      </Tooltip>
      <ThongTinNhanVien
        open={openNhanVien}
        handleClose={handCloseFormNhanVien}
      />
    </div>
  );
}

export default DeleteNhanVienButton;
