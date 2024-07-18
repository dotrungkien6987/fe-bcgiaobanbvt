import { yupResolver } from "@hookform/resolvers/yup";
import { DataArrayRounded } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  AppBar,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  Toolbar,
} from "@mui/material";
import { FTextField, FormProvider } from "components/form";
import FAutocomplete from "components/form/FAutocomplete";
import FDatePicker from "components/form/FDatePicker";
import FKRadioGroup from "components/form/FKRadioGroup";
import { getKhoas } from "features/BaoCaoNgay/baocaongaySlice";
import { insertOneHinhThucCapNhat, updateOneHinhThucCapNhat } from "features/NhanVien/hinhthuccapnhatSlice";
import { getDataFix } from "features/NhanVien/nhanvienSlice";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";


const yupSchema = Yup.object().shape({
  MaNhomHinhThucCapNhat:  Yup.object({
    Ma: Yup.string().required("Bắt buộc chọn mã nhóm"),
  }).required("Bắt buộc chọn mã nhóm"),
  // TenNhomHinhThucCapNhat: Yup.object({
  //   Ten: Yup.string().required("Bắt buộc chọn tên nhóm"),
  // }).required("Bắt buộc chọn tên nhóm"),
  Ma: Yup.string().required("Bắt buộc nhập Mã hình thức cập nhật"),
  Ten: Yup.string().required("Bắt buộc nhập Tên hình thức cập nhật"),
});

function HinhThucCapNhatForm({ hinhthuccapnhat, open, handleClose }) {
  const dispatch = useDispatch();
const {NhomHinhThucCapNhat} =useSelector((state)=>state.nhanvien);
useEffect(() => {
  if (NhomHinhThucCapNhat && NhomHinhThucCapNhat.length >0) return;
  dispatch(getDataFix());
}, [dispatch]);


  const methods = useForm({
    resolver: yupResolver(yupSchema),
    defaultValues: {
      MaNhomHinhThucCapNhat: null,
      TenNhomHinhThucCapNhat: null,
      Ma: "",
      Ten: "",
    },
  });

  const {
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
   
    // Kiểm tra xem `hinhthuccapnhat` có tồn tại và form đang ở chế độ cập nhật không
    if (hinhthuccapnhat && hinhthuccapnhat._id && hinhthuccapnhat._id !== 0) {
      // Cập nhật giá trị mặc định cho form bằng thông tin của `hinhthuccapnhat`
      const nhomhinhthuc = NhomHinhThucCapNhat.find(item =>item.Ma === hinhthuccapnhat.MaNhomHinhThucCapNhat)
      reset({
        ...hinhthuccapnhat,
        MaNhomHinhThucCapNhat:nhomhinhthuc
      });
    } else {
      // Nếu không có `hinhthuccapnhat` được truyền vào, reset form với giá trị mặc định
      reset({
        MaNhomHinhThucCapNhat: null,
        TenNhomHinhThucCapNhat: null,
        Ma: '',
        Ten: "",
      });
    }
  }, [hinhthuccapnhat]);

  const onSubmitData = (data) => {
    console.log("data form", data);
    const hinhthuccapnhatUpdate = {
      ...data,
 MaNhomHinhThucCapNhat:data.MaNhomHinhThucCapNhat.Ma,
    };
    console.log("hinhthuccapnhat dispatch", hinhthuccapnhatUpdate);
    if (hinhthuccapnhat && hinhthuccapnhat._id) dispatch(updateOneHinhThucCapNhat(hinhthuccapnhatUpdate));
    else dispatch(insertOneHinhThucCapNhat(hinhthuccapnhatUpdate));
    handleClose()
  };
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      // sx={{
      //   "& .MuiDialog-paper": {
      //     width: "1000px", // Or any other width you want
      //     height: "800px", // Or any other height you want
      //   },
      // }}
      PaperProps={{
        sx: {
          width: "100%", // Sử dụng toàn bộ chiều rộng trên màn hình nhỏ
          maxWidth: "1000px", // Đảm bảo chiều rộng không vượt quá 1000px trên màn hình lớn
          maxHeight: "90vh", // Chiều cao tối đa là 90% chiều cao viewport, giúp không bị tràn màn hình
          overflowY: "auto", // Cho phép cuộn nếu nội dung vượt quá chiều cao
        },
      }}
    >
      <DialogTitle id="form-dialog-title">Thông tin hình thức cập nhật kiến thức y khoa liên tục</DialogTitle>
      <DialogContent>
        <Card sx={{ p: 3 }}>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmitData)}>
            <Stack spacing={1}>
              
            <FAutocomplete
                name="MaNhomHinhThucCapNhat"
                options={NhomHinhThucCapNhat}
                displayField="Ma"
                label="Chọn mã nhóm"
              />

              <FAutocomplete
                name="MaNhomHinhThucCapNhat"
                options={NhomHinhThucCapNhat}
                displayField="Ten"
                label="Chọn tên nhóm"
              />
              

              <Grid container spacing={1}>
                <Grid item xs={12} sm={12} md={12}>
                  <FTextField name="Ma" label="Mã hình thức cập nhật" />
                </Grid>
                <Grid item xs={12} sm={12} md={12}>
                  <FTextField name="Ten" label="Tên hình thức cập nhật" />
                </Grid>
              </Grid>
            </Stack>
            <Box sx={{ flexGrow: 1 }} />
            <Card>
              <DialogActions>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  size="small"
                  loading={isSubmitting}
                >
                  Lưu
                </LoadingButton>
                <Button variant="contained" onClick={handleClose} color="error">
                  Hủy
                </Button>
              </DialogActions>
            </Card>
          </FormProvider>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

export default HinhThucCapNhatForm;
