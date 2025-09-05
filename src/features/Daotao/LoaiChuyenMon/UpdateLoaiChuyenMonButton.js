import { IconButton, Tooltip } from "@mui/material";
import { Edit } from "iconsax-react";
import React, { useState } from "react";
import LoaiChuyenMonForm from "./LoaiChuyenMonForm";

export default function UpdateLoaiChuyenMonButton({ row }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Tooltip title="Sửa">
        <IconButton color="primary" onClick={() => setOpen(true)}>
          <Edit />
        </IconButton>
      </Tooltip>
      <LoaiChuyenMonForm
        open={open}
        onClose={() => setOpen(false)}
        editing={row}
      />
    </>
  );
}
