import { Button } from "@mui/material";
import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import KhoaBinhQuanBenhAnForm from "./KhoaBinhQuanBenhAnForm";

function AddKhoaBinhQuanBenhAnButton() {
  const [openDatafix, setOpenDatafix] = useState(false);
  const handleThemMoi = () => {
    setOpenDatafix(true);
  };
  const handCloseFormDataFix = () => {
    setOpenDatafix(false);
  };

  return (
    <div>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleThemMoi}
      >
        Thêm
      </Button>

      <KhoaBinhQuanBenhAnForm
        open={openDatafix}
        handleClose={handCloseFormDataFix}
      />
    </div>
  );
}

export default AddKhoaBinhQuanBenhAnButton;
