import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import React, { useState } from "react";
import LoaiChuyenMonForm from "./LoaiChuyenMonForm";

export default function AddLoaiChuyenMonButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        startIcon={<AddIcon />}
        variant="contained"
        onClick={() => setOpen(true)}
      >
        Thêm
      </Button>
      <LoaiChuyenMonForm open={open} onClose={() => setOpen(false)} />
    </>
  );
}
