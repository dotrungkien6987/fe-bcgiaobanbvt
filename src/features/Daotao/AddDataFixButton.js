import { Button } from "@mui/material";
import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import ThongTinNhanVien from "./ThongTinNhanVien";
import DataFixForm from "./DataFixForm";
function AddDataFixButton({datafixField="DonVi",datafixTitle='Đơn vị'}) {
  const [openDatafix, setOpenDatafix] = useState(false);
  const handleThemMoi = () => {
    setOpenDatafix(true)
    console.log("them moi");
  };
  const handCloseFormDataFix = ()=>{
    setOpenDatafix(false)
  }
  
  return (
    <div>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleThemMoi}
      >
        Thêm 
      </Button>

      <DataFixForm
      open ={openDatafix}
      handleClose={handCloseFormDataFix}
      datafixField={datafixField}
      datafixTitle={datafixTitle}
      />
    </div>
  );
}

export default AddDataFixButton;
