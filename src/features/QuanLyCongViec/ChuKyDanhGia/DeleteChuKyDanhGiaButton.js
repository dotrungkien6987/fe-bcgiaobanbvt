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
  Alert,
} from "@mui/material";
import { Trash } from "iconsax-react";
import { useNavigate } from "react-router-dom";

import { deleteChuKyDanhGia, getChuKyDanhGias } from "../KPI/kpiSlice";

function DeleteChuKyDanhGiaButton({ chuKy, itemId, ...otherProps }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Support legacy prop itemId or new prop chuKy
  const chuKyData = chuKy || { _id: itemId };
  const id = chuKyData._id || itemId;

  // Check if cycle is completed (isDong = true)
  const isHoanThanh = chuKyData.isDong === true;

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const getTooltipTitle = () => {
    if (isHoanThanh) {
      return "Không thể xóa chu kỳ đã hoàn thành (cần giữ lịch sử kiểm toán)";
    }
    return "Xóa chu kỳ đánh giá";
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // ✅ Xóa .unwrap() vì deleteChuKyDanhGia là thunk thủ công (không phải createAsyncThunk)
      // Toast đã được handle trong thunk rồi (toast.success/toast.error)
      await dispatch(deleteChuKyDanhGia(id));

      // Refresh danh sách sau khi xóa
      dispatch(getChuKyDanhGias());
      handleClose();

      // Nếu đang ở trang detail thì navigate về list
      if (window.location.pathname.includes(id)) {
        navigate("/quanlycongviec/kpi/chu-ky");
      }
    } catch (error) {
      // Thunk đã toast.error() rồi, chỉ log để debug
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Nếu có variant thì render Button
  if (otherProps.variant) {
    return (
      <>
        <Tooltip title={getTooltipTitle()}>
          <span>
            <button
              {...otherProps}
              onClick={handleOpen}
              disabled={isHoanThanh || isDeleting}
            >
              {otherProps.children || "Xóa"}
            </button>
          </span>
        </Tooltip>

        <Dialog open={open} onClose={handleClose} maxWidth="sm">
          <DialogTitle>Xác nhận xóa chu kỳ đánh giá</DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              Bạn có chắc chắn muốn xóa chu kỳ đánh giá này không?
            </Typography>
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Lưu ý:</strong> Nếu chu kỳ đã có bản đánh giá KPI, bạn
                cần xóa các đánh giá đó trước hoặc liên hệ quản trị viên.
              </Typography>
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={isDeleting}>
              Hủy
            </Button>
            <Button
              onClick={handleDelete}
              color="error"
              variant="contained"
              disabled={isDeleting}
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <Tooltip title={getTooltipTitle()}>
        <span>
          <IconButton
            size="small"
            color="error"
            onClick={handleOpen}
            disabled={isHoanThanh || isDeleting}
          >
            <Trash size={18} />
          </IconButton>
        </span>
      </Tooltip>

      <Dialog open={open} onClose={handleClose} maxWidth="sm">
        <DialogTitle>Xác nhận xóa chu kỳ đánh giá</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Bạn có chắc chắn muốn xóa chu kỳ đánh giá này không?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Lưu ý:</strong> Nếu chu kỳ đã có bản đánh giá KPI, bạn cần
              xóa các đánh giá đó trước hoặc liên hệ quản trị viên.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isDeleting}>
            Hủy
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? "Đang xóa..." : "Xóa"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default DeleteChuKyDanhGiaButton;
