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
import { insertOneNhanVien, updateOneNhanVien } from "features/NhanVien/nhanvienSlice";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import dayjs from "dayjs";

const yupSchema = Yup.object().shape({
  Ten: Yup.string().required("Bắt buộc nhập UserName"),
  TinChiBanDau:Yup.number().typeError("Bạn phải nhập 1 số"),
  NgaySinh: Yup.date().nullable().required("Bắt buộc chọn ngày sinh"),
  
  KhoaID: Yup.object({
    TenKhoa: Yup.string().required("Bắt buộc chọn khoa"),
  }).required("Bắt buộc chọn khoa"),
});

function ThongTinNhanVien({ nhanvien, open, handleClose }) {
  
  const { khoas } = useSelector((state) => state.baocaongay);
  const dispatch = useDispatch();
  useEffect(() => {
    // if(khoas&& khoas.length>0) return;
    dispatch(getKhoas());
  }, []);
  const methods = useForm({
    resolver: yupResolver(yupSchema),
    defaultValues: {
      TinChiBanDau: 0,
      MaNhanVien: "",
      Ten: "",
      Loai: 0,
      NgaySinh: null,
      TrinhDoChuyenMon: "",
      SoDienThoai: "",
      Email: "",
      GioiTinh:0,
      
      KhoaID: null,
    },
  });

  
  const {
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    
    // Kiểm tra xem `nhanvien` có tồn tại và form đang ở chế độ cập nhật không
    if (nhanvien && nhanvien._id) {
      // Cập nhật giá trị mặc định cho form bằng thông tin của `nhanvien`
      reset({
        ...nhanvien,
        // Đảm bảo rằng các trường như Ngày sinh được chuyển đổi đúng định dạng nếu cần
        NgaySinh: nhanvien.NgaySinh ? dayjs(nhanvien.NgaySinh) : null,
        // Tương tự, bạn có thể điều chỉnh các trường khác để phù hợp với định dạng của form
      });
    } else {
      // Nếu không có `nhanvien` được truyền vào, reset form với giá trị mặc định
      reset({
        TinChiBanDau: 0,
        MaNhanVien: "",
        Ten: "",
        Loai: 0,
        NgaySinh: null,
        TrinhDoChuyenMon: "",
        SoDienThoai: "",
        Email: "",
        GioiTinh: 0,
        KhoaID: null,
      });
    }
  }, [nhanvien]);
  useEffect(()=>{
    console.log("nhanvien Thongtinform",nhanvien)
  })
  const onSubmitData = (data) => {
    console.log("data form",data);
    const nhanvienUpdate = {
      ...data,
      KhoaID:data.KhoaID._id,
      NgaySinh:data.NgaySinh.toISOString(),
    }
    console.log('nhanvien dispatch',nhanvienUpdate)
    if(nhanvien && nhanvien._id) dispatch(updateOneNhanVien(nhanvienUpdate))
      else
    dispatch(insertOneNhanVien(nhanvienUpdate))
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
      <DialogTitle id="form-dialog-title">Thông tin cán bộ</DialogTitle>
      <DialogContent>
        <Card>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmitData)}>
            <Stack spacing={1}>
              <FAutocomplete
                name="KhoaID"
                options={khoas}
                displayField="TenKhoa"
                label="Chọn khoa"
              />
             
              
              <Grid container spacing={1}>
              <Grid item xs={12} sm={12} md={8}>
              <FTextField name="MaNhanVien" label="Mã học viên" />
              </Grid>
              <Grid item xs={12} sm={12} md={4}>
                <FKRadioGroup
                row={true}
                name='Loai'
                label="Phân loại"
                options={[
                  {value:0, label:"Nhân viên"},
                  {value:1, label:"Sinh viên"},
                ]}
                />
              </Grid>
              </Grid>

              <Grid container spacing={1}>
              <Grid item xs={12} sm={12} md={4}>
              <FTextField name="Ten" label="Họ tên" />
              </Grid>
              <Grid item xs={12} sm={12} md={4}>
              <FDatePicker name="NgaySinh" label="Ngày sinh"/>
              </Grid>
              <Grid item xs={12} sm={12} md={4}>
                <FKRadioGroup
                row={true}
                name='GioiTinh'
                label="Giới tính"
                options={[
                  {value:0, label:"Nam"},
                  {value:1, label:"Nữ"},
                ]}
                />
              </Grid>
              </Grid>


              <Grid container spacing={1}>
                <Grid item xs={12} sm={12} md={6}>
                <FTextField name="TrinhDoChuyenMon" label="Trình độ chuyên môn" />
                </Grid>
                <Grid item xs={12} sm={12} md={6}>
                  <FTextField name="TinChiBanDau" label="Tín chỉ ban đầu" />
                </Grid>
              </Grid>

             

              <Grid container spacing={1}>
                <Grid item xs={12} sm={12} md={6}>
                  <FTextField name="SoDienThoai" label="Số điện thoại" />
                </Grid>
                <Grid item xs={12} sm={12} md={6}>
                  <FTextField name="Email" label="Email" />
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

export default ThongTinNhanVien;
