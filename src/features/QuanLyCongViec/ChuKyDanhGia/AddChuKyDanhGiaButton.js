import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@mui/material";
import { Add } from "iconsax-react";

import ThongTinChuKyDanhGia from "./ThongTinChuKyDanhGia";
import { createChuKyDanhGia, getChuKyDanhGias } from "../KPI/kpiSlice";

function AddChuKyDanhGiaButton() {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = async (data) => {
    await dispatch(createChuKyDanhGia(data));
    dispatch(getChuKyDanhGias());
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<Add size={20} />}
        onClick={handleOpen}
      >
        Thêm chu kỳ
      </Button>

      <ThongTinChuKyDanhGia
        open={open}
        handleClose={handleClose}
        onSubmit={handleSubmit}
      />
    </>
  );
}

export default AddChuKyDanhGiaButton;
