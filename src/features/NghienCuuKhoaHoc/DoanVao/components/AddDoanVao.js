import React from "react";
import { Button } from "@mui/material";
import { Add } from "iconsax-react";
import DoanVaoForm from "../DoanVaoForm";

function AddDoanVao() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button
        color="success"
        variant="contained"
        size="small"
        onClick={() => setOpen(true)}
        startIcon={<Add size={18} />}
      >
        Thêm Đoàn Vào
      </Button>
      <DoanVaoForm open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export default AddDoanVao;
