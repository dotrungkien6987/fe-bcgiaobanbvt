import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Tooltip } from "@mui/material";
import React, { useState } from "react";
import { Trash } from "iconsax-react";
import { useDispatch } from "react-redux";
import { deleteOneKhoa } from "./khoaSlice";

function DeleteKhoaButton({ khoaID }) {
  const [openDelete, setOpenDelete] = useState(false);
  const dispatch = useDispatch();

  const handleDeleteKhoa = () => {
    dispatch(deleteOneKhoa(khoaID));
    setOpenDelete(false);
  };
  
  const handleCloseDeleteForm = () => {
    setOpenDelete(false);
  };
  
  return (
    <div>
      <Tooltip title="Xóa">
        <IconButton color="error" onClick={() => setOpenDelete(true)}>
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
            Bạn có chắc muốn xóa khoa này?
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
            onClick={handleDeleteKhoa}
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

export default DeleteKhoaButton;