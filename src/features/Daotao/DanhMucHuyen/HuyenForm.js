import { yupResolver } from "@hookform/resolvers/yup";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

import { FormProvider, FTextField } from "components/form";
import { updateOrInsertDatafix } from "features/NhanVien/nhanvienSlice";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

import * as Yup from "yup";

const yupSchema = Yup.object().shape({
  TenHuyen: Yup.string().required("Bắt buộc nhập tên "),
  MaHuyen: Yup.string().required("Bắt buộc nhập mã "),
  MaTinh: Yup.string().required("Bắt buộc nhập mã "),
  
});
function HuyenForm({  open, handleClose,index = 0 }) {
  const { datafix,Huyen } = useSelector((state) => state.nhanvien);
  const methods = useForm({
    resolver: yupResolver(yupSchema),
    defaultValues: {
      TenHuyen: "",
      MaHuyen: "",
      MaTinh:"",
      DienTich:0,
      DanSo: 0,
      KhoangCach: 0,
    },
  });
  const dispatch = useDispatch();
  const onSubmitData = (data) => {
    
    if (index !== 0) {
   
      const updatedArray = datafix.Huyen.map((item) =>
        item.index === index ? { ...data} : item
      );
     
      const datafixUpdate = {
        ...datafix,
        Huyen: updatedArray,
      };
      dispatch(updateOrInsertDatafix(datafixUpdate));
      handleClose();
      return;
    }
  
    const datafixUpdate = {
      ...datafix,
      Huyen: [
        {...data},
        ...Huyen,
      ],
    };
    dispatch(updateOrInsertDatafix(datafixUpdate));
    handleClose();  
    };
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;
  useEffect(() => {
    if(index===0) {
      reset({
        TenHuyen: "",
        MaHuyen: "",
        MaTinh: "",
        DienTich:0,
        DanSo: 0,
        KhoangCach: 0,
      })
    } else {
      const datafixValue = Huyen.filter((item) => item.index === index);
     
      reset({...datafixValue[0]})
    }
  },[index,Huyen])
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: "100%", // Sử dụng toàn bộ chiều rộng trên màn hình nhỏ
          maxWidth: "1000px", // Đảm bảo chiều rộng không vượt quá 1000px trên màn hình lớn
          maxHeight: "90vh", // Chiều cao tối đa là 90% chiều cao viewport, giúp không bị tràn màn hình
          overflowY: "auto", // Cho phép cuộn nếu nội dung vượt quá chiều cao
        },
      }}
    >
      <DialogTitle id="form-dialog-title">{index===0?"Thêm mới nhóm hình thức cập nhật":"Sửa nhóm hình thức cập nhật"}</DialogTitle>
      <DialogContent>
        <Card sx={{ p: 3 }}>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmitData)}>
            <FTextField name="TenHuyen" label="Tên huyện"/>
            <FTextField name="MaHuyen" label="Mã huyện"/>
            <FTextField name="MaTinh" label="Mã tỉnh"/>
            <FTextField name="DienTich" label="Diện tích" type ='number'/>
            <FTextField name="DanSo" label="Dân số" type ='number'/>
            <FTextField name="KhoangCach" label="Khoảng cách" type ='number'/>
             
            <Box sx={{ flexGrow: 1 }} />
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
          </FormProvider>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

export default HuyenForm;
