import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { Trash } from "iconsax-react";
import { useNavigate } from "react-router-dom";

import { deleteChuKyDanhGia, getChuKyDanhGias } from "../KPI/kpiSlice";

function DeleteChuKyDanhGiaButton({ itemId, ...otherProps }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDelete = async () => {
    await dispatch(deleteChuKyDanhGia(itemId));
    dispatch(getChuKyDanhGias());
    handleClose();

    // Nếu đang ở trang detail thì navigate về list
    if (window.location.pathname.includes(itemId)) {
      navigate("/quanlycongviec/kpi/chu-ky");
    }
  };

  // Nếu có variant thì render Button
  if (otherProps.variant) {
    return (
      <>
        <button {...otherProps} onClick={handleOpen}>
          {otherProps.children || "Xóa"}
        </button>

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Xác nhận xóa</DialogTitle>
          <DialogContent>
            <Typography>
              Bạn có chắc chắn muốn xóa chu kỳ đánh giá này không?
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              Lưu ý: Chỉ có thể xóa chu kỳ đã đóng.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Hủy</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Xóa
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <Tooltip title="Xóa">
        <IconButton size="small" color="error" onClick={handleOpen}>
          <Trash size={18} />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa chu kỳ đánh giá này không?
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            Lưu ý: Chỉ có thể xóa chu kỳ đã đóng.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default DeleteChuKyDanhGiaButton;
