import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton,  Tooltip } from "@mui/material";
import React, { useState } from "react";

import {Trash} from "iconsax-react"
import { useDispatch } from "react-redux";
import { deleteOneHoiDong } from "features/NhanVien/hinhthuccapnhatSlice";


function DeleteHoiDongButton({hoidongID}) {
  const [openDelete, setOpenDelete] = useState(false);
const dispatch =useDispatch()
  const handleDeleteSuCoOnDB = () => {
   
dispatch(deleteOneHoiDong(hoidongID))
setOpenDelete(false)
    console.log("delete");
  };
  const handleCloseDeleteForm = () => {
    setOpenDelete(false);
  };
  return (
    <div>
      <Tooltip title="Xóa">
        <IconButton color="error" onClick={()=>setOpenDelete(true)}>
          <Trash />
        </IconButton>
      </Tooltip>
      <Dialog
        open={openDelete}
        onClose={handleCloseDeleteForm}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Cảnh báo!"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Bạn có chắc muốn xóa hội đồng này?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={handleCloseDeleteForm}
            color="primary"
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleDeleteSuCoOnDB}
            color="error"
            autoFocus
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default DeleteHoiDongButton;
