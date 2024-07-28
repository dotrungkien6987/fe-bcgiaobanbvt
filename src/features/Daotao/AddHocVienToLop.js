import { Button } from "@mui/material";
import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import HinhThucCapNhatForm from "./HinhThucCapNhatForm";
import SelectHocVienForm from "./ChonHocVien/SelectHocVienForm";
import FullScreenDialog from "components/MyAble-Component/FullScreenDialog";

function AddHocVienToLop() {
  const [openFormAddNew, setOpenFormAddNew] = useState(false);
  const handleThemMoi = () => {
    setOpenFormAddNew(true);
    console.log("them moi");
  };
  const handCloseFormNhanVien = () => {
    setOpenFormAddNew(false);
  };
  const hinhthuccapnhat = { _id: 0 };
  return (
    <div>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleThemMoi}
      >
        Thêm
      </Button>

      <FullScreenDialog
        open={openFormAddNew}
        handleClose={handCloseFormNhanVien}
      />
    </div>
  );
}

export default AddHocVienToLop;
