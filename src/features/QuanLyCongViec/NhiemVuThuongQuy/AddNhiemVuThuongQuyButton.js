import { Button } from "@mui/material";
import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import ThongTinNhiemVuThuongQuy from "./ThongTinNhiemVuThuongQuy";

function AddNhiemVuThuongQuyButton() {
  const [openDialog, setOpenDialog] = useState(false);

  const nhiemvuThuongQuy = { _id: 0 };

  return (
    <div>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setOpenDialog(true)}
      >
        Thêm 
      </Button>

      <ThongTinNhiemVuThuongQuy
        open={openDialog}
        handleClose={() => setOpenDialog(false)}
        nhiemvuThuongQuy={nhiemvuThuongQuy}
      />
    </div>
  );
}

export default AddNhiemVuThuongQuyButton;
