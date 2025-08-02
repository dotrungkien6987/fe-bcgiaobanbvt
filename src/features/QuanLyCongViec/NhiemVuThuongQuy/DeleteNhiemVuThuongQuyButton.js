import React, { useState } from "react";
import {
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import IconButton from "components/@extended/IconButton";
import { Trash } from "iconsax-react";
import { useDispatch } from "react-redux";
import { deleteOneNhiemVuThuongQuy } from "./nhiemvuThuongQuySlice";

function DeleteNhiemVuThuongQuyButton({ nhiemvuThuongQuyID }) {
  const [openDialog, setOpenDialog] = useState(false);
  const dispatch = useDispatch();

  const handleDelete = () => {
    dispatch(deleteOneNhiemVuThuongQuy(nhiemvuThuongQuyID));
    setOpenDialog(false);
  };

  return (
    <>
      <Tooltip title="Xóa">
        <IconButton
          color="error"
          onClick={(e) => {
            e.stopPropagation();
            setOpenDialog(true);
          }}
        >
          <Trash />
        </IconButton>
      </Tooltip>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa nhiệm vụ thường quy này không? Hành động
            này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default DeleteNhiemVuThuongQuyButton;
