import { Button } from "@mui/material";
import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";

import UserInsertForm from "../UserInsertForm";
import { useDispatch } from "react-redux";
import { setUserCurent } from "../userSlice";

function AddUserButton() {
  const [openFormAddNew, setOpenFormAddNew] = useState(false);
  const dispatch = useDispatch();
  const handleThemMoi = () => {
    setOpenFormAddNew(true)
    dispatch(setUserCurent({_id:0}))
  };
  const handCloseForm = ()=>{
    setOpenFormAddNew(false)
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

      <UserInsertForm
      open ={openFormAddNew}
      handleClose={handCloseForm}
     
      />
    </div>
  );
}

export default AddUserButton;
