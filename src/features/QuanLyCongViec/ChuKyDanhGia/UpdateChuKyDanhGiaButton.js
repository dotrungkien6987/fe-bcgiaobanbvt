import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { IconButton, Tooltip } from "@mui/material";
import { Edit } from "iconsax-react";

import ThongTinChuKyDanhGia from "./ThongTinChuKyDanhGia";
import { updateChuKyDanhGia, getChuKyDanhGias } from "../KPI/kpiSlice";

function UpdateChuKyDanhGiaButton({ item, ...otherProps }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = async (data) => {
    await dispatch(updateChuKyDanhGia({ id: item._id, data }));
    dispatch(getChuKyDanhGias());
  };

  // Nếu có variant/startIcon thì render Button, không thì IconButton
  if (otherProps.variant) {
    return (
      <>
        <button
          {...otherProps}
          onClick={handleOpen}
          style={{ cursor: "pointer" }}
        >
          {otherProps.children || "Chỉnh sửa"}
        </button>

        <ThongTinChuKyDanhGia
          open={open}
          handleClose={handleClose}
          item={item}
          onSubmit={handleSubmit}
        />
      </>
    );
  }

  return (
    <>
      <Tooltip title="Chỉnh sửa">
        <IconButton size="small" color="primary" onClick={handleOpen}>
          <Edit size={18} />
        </IconButton>
      </Tooltip>

      <ThongTinChuKyDanhGia
        open={open}
        handleClose={handleClose}
        item={item}
        onSubmit={handleSubmit}
      />
    </>
  );
}

export default UpdateChuKyDanhGiaButton;
