import React, { useState } from "react";
import IconButton from "components/@extended/IconButton";
import { Trash } from "iconsax-react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Tooltip,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { deleteTieuChiDanhGia } from "../KPI/kpiSlice";

function DeleteTieuChiDanhGiaButton({ tieuChiId }) {
  const [openDialog, setOpenDialog] = useState(false);
  const dispatch = useDispatch();

  const handleDelete = () => {
    dispatch(deleteTieuChiDanhGia(tieuChiId));
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

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Bạn có chắc chắn muốn xóa tiêu chí đánh giá này không? Tiêu chí sẽ
            bị vô hiệu hóa và không thể sử dụng trong các đánh giá mới.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default DeleteTieuChiDanhGiaButton;
