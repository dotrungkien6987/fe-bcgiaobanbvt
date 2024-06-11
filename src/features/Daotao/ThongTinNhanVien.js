import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { FormProvider } from "components/form";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";

function ThongTinNhanVien({ nhanvien, open, handleClose }) {
  const khoa = useSelector((state) => state.baocaongay.khoas);
  const methods = useForm({
defaultValues:{
  TinChiBanDau:0,
  MaNhanVien:"",
  Ten:"",
  Loai: 0,
  TrinhDoChuyenMon:"",

}
  })

  const {handleSubmit,reset,setValue,formState:{isSubmitting}} = methods;

  const onSubmitData = (data) =>{
    console.log("data form",data)
  }
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      sx={{
        "& .MuiDialog-paper": {
          width: "1000px", // Or any other width you want
          height: "600px", // Or any other height you want
        },
      }}
    >
      <DialogTitle id="form-dialog-title">Thông tin cán bộ</DialogTitle>
      <DialogContent>
        <Card>
<FormProvider methods={methods} onSubmit={handleSubmit(onSubmitData)}>

</FormProvider>
        </Card>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" onClick={handleClose} color="error">
          Hủy
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ThongTinNhanVien;
