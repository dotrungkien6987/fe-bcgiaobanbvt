import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import React, { useState } from "react";

import { Global } from "iconsax-react";
import { useDispatch } from "react-redux";

import { dongboThanhVienTamByLopDaoTaoID } from "../daotaoSlice";

function DongBoHocViensTamButton({ lopdaotaoID }) {
  const [openDelete, setOpenDelete] = useState(false);
  const dispatch = useDispatch();
  const handleDongBoHocViensTam = () => {
    dispatch(dongboThanhVienTamByLopDaoTaoID({ lopdaotaoID }));
    setOpenDelete(false);
    console.log("delete");
  };
  const handleCloseDeleteForm = () => {
    setOpenDelete(false);
  };
  return (
    <div>
      <Button
        fullWidth
        variant="contained"
        startIcon={<Global />}
        onClick={() => setOpenDelete(true)}
        style={{ whiteSpace: "nowrap" }}
      >
        Đồng bộ từ danh sách tạm
      </Button>

      <Dialog
        open={openDelete}
        onClose={handleCloseDeleteForm}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Cảnh báo!"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Bạn có chắc muốn đồng bộ thành viên tham gia từ danh sách tạm?
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
            onClick={handleDongBoHocViensTam}
            color="error"
            autoFocus
          >
            Đồng bộ
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default DongBoHocViensTamButton;
