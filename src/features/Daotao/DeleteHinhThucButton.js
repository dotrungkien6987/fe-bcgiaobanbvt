import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Stack, Tooltip } from "@mui/material";
import React, { useState } from "react";

import { Delete } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { deleteOneHinhThucCapNhat } from "features/NhanVien/hinhthuccapnhatSlice";

function DeleteHinhThucButton({hinhthuccapnhatID}) {
  const [openDelete, setOpenDelete] = useState(false);
const dispatch =useDispatch()
  const handleDeleteSuCoOnDB = () => {
   
dispatch(deleteOneHinhThucCapNhat(hinhthuccapnhatID))
setOpenDelete(false)
    console.log("delete");
  };
  const handleCloseDeleteForm = () => {
    setOpenDelete(false);
  };
  return (
    <div>
      <Tooltip title="Xóa">
        <IconButton color="primary" onClick={()=>setOpenDelete(true)}>
          <Delete />
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
            Bạn có chắc muốn xóa hình thức cập nhật này?
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

export default DeleteHinhThucButton;
