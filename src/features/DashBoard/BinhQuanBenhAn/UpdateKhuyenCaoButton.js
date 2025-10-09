import { IconButton } from "@mui/material";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import EditIcon from "@mui/icons-material/Edit";
import KhuyenCaoKhoaBQBAForm from "./KhuyenCaoKhoaBQBAForm";

function UpdateKhuyenCaoButton({ item }) {
  const [open, setOpen] = useState(false);
  const { KhoaBinhQuanBenhAn } = useSelector((state) => state.nhanvien);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <IconButton color="primary" onClick={handleOpen}>
        <EditIcon />
      </IconButton>

      <KhuyenCaoKhoaBQBAForm
        open={open}
        handleClose={handleClose}
        item={item}
        currentYear={item?.Nam}
        khoaList={KhoaBinhQuanBenhAn}
      />
    </>
  );
}

export default UpdateKhuyenCaoButton;
