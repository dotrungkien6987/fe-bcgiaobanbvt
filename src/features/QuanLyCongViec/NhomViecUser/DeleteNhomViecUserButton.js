import {
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import React, { useState } from "react";
import { Trash } from "iconsax-react";
import { useDispatch } from "react-redux";
import { deleteOneNhomViecUser } from "./nhomViecUserSlice";

function DeleteNhomViecUserButton({ nhomViecUserID }) {
  const [openDelete, setOpenDelete] = useState(false);
  const dispatch = useDispatch();

  const handleDelete = () => {
    dispatch(deleteOneNhomViecUser(nhomViecUserID));
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
        onClose={() => setOpenDelete(false)}
        aria-labelledby="alert-dialog-title"
      >
        <DialogTitle id="alert-dialog-title">Cảnh báo!</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa nhóm việc này không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Hủy</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default DeleteNhomViecUserButton;
