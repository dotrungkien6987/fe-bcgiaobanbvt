import React, { useState } from "react";
import { IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import NhomKhoaSoThuTuForm from "./NhomKhoaSoThuTuForm";

function UpdateNhomKhoaButton({ nhomKhoa }) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Tooltip title="Cập nhật nhóm khoa">
        <IconButton color="primary" size="small" onClick={handleOpen}>
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <NhomKhoaSoThuTuForm
        open={open}
        handleClose={handleClose}
        nhomKhoa={nhomKhoa}
      />
    </>
  );
}

export default UpdateNhomKhoaButton;