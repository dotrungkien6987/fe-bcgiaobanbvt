import { Button } from "@mui/material";
import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import ThongTinTieuChiDanhGia from "./ThongTinTieuChiDanhGia";

function AddTieuChiDanhGiaButton() {
  const [openDialog, setOpenDialog] = useState(false);

  const tieuChi = { _id: 0 };

  return (
    <div>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setOpenDialog(true)}
      >
        Thêm tiêu chí
      </Button>

      <ThongTinTieuChiDanhGia
        open={openDialog}
        handleClose={() => setOpenDialog(false)}
        tieuChi={tieuChi}
      />
    </div>
  );
}

export default AddTieuChiDanhGiaButton;
