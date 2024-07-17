import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Stack, Tooltip } from "@mui/material";
import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import ThongTinNhanVien from "./ThongTinNhanVien";

import { Delete } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { deleteOneNhanVien, updateOrInsertDatafix } from "features/NhanVien/nhanvienSlice";
function DeleteDataFixButton({datafixField="DonVi",datafixTitle='Đơn vị',index}) {
  const {datafix} =useSelector((state)=>state.nhanvien)
  const [openDelete, setOpenDelete] = useState(false);
const dispatch =useDispatch()
  const handleDeleteDataFixOnDB = () => {
    const updatedArray = datafix[datafixField].filter((item, idx) => item.index !== index);

    const datafixUpdate = {
      ...datafix,
      [datafixField]: updatedArray,
    };

    dispatch(updateOrInsertDatafix(datafixUpdate));
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
           {`Bạn có chắc muốn xóa ${datafixTitle} này?`}
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
            onClick={handleDeleteDataFixOnDB}
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

export default DeleteDataFixButton;
