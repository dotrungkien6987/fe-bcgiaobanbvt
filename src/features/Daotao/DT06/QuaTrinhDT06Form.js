import { yupResolver } from "@hookform/resolvers/yup";

import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  Stack,
} from "@mui/material";
import { FTextField, FormProvider } from "components/form";

import FDatePicker from "components/form/FDatePicker";

import {
  
  insertOneNhanVien,
  updateOneNhanVien,
} from "features/NhanVien/nhanvienSlice";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import dayjs from "dayjs";
import MainCard from "components/MainCard";
import { insertOneQuaTrinhDT06, updateOneQuaTrinhDT06 } from "../daotaoSlice";

const yupSchema = Yup.object().shape({
  SoTinChiTichLuy: Yup.string().required("Bắt buộc nhập trường Số tín chỉ tích lũy"),

  TuNgay: Yup.date().nullable().required("Bắt buộc chọn trường Từ ngày"),
  DenNgay: Yup.date().nullable().required("Bắt buộc chọn trường Đến ngày"),
});

function QuaTrinhDT06Form({ quatrinhDT06, open, handleClose,hocvien}) {
const {lopdaotaoCurrent} = useSelector((state) => state.daotao);

  const methods = useForm({
    resolver: yupResolver(yupSchema),
    defaultValues: {
      SoTinChiTichLuy: 0,
      TuNgay: null,
      DenNgay: null,
    },
  });

  const {
    handleSubmit,
    reset,

    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    console.log("quatrinhDT06", quatrinhDT06);
    // Kiểm tra xem `quatrinhDT06` có tồn tại và form đang ở chế độ cập nhật không
    if (quatrinhDT06 && quatrinhDT06._id && quatrinhDT06._id !== 0) {
      // Cập nhật giá trị mặc định cho form bằng thông tin của `quatrinhDT06`
      reset({
        ...quatrinhDT06,
        // Đảm bảo rằng các trường như Ngày sinh được chuyển đổi đúng định dạng nếu cần
        TuNgay: quatrinhDT06.TuNgay ? dayjs(quatrinhDT06.TuNgay) : null,
        DenNgay: quatrinhDT06.DenNgay ? dayjs(quatrinhDT06.DenNgay) : null,
        // Tương tự, bạn có thể điều chỉnh các trường khác để phù hợp với định dạng của form
      });
    } else {
      // Nếu không có `quatrinhDT06` được truyền vào, reset form với giá trị mặc định
      reset({
        SoTinChiTichLuy: 0,
        GhiChu: "",
        
        TuNgay: null,
        DenNgay: null,
       
      });
    }
  }, [quatrinhDT06]);

  const dispatch = useDispatch();
  const onSubmitData = (data, e) => {
    e.preventDefault();
    if(!lopdaotaoCurrent._id){
      alert("Chưa có lớp đào tạo");
      return;
    }
    console.log("data form", data);
    const quatrinhDT06Update = {
      ...data,
      TuNgay: data.TuNgay.toISOString(),
      DenNgay: data.DenNgay.toISOString(),
      NhanVienID: hocvien._id,
      LopDaoTaoID: lopdaotaoCurrent?._id||0,
    };
    console.log("quatrinhDT06 dispatch", quatrinhDT06Update);
    if (quatrinhDT06Update && quatrinhDT06Update._id) dispatch(updateOneQuaTrinhDT06(quatrinhDT06Update));
    else dispatch(insertOneQuaTrinhDT06(quatrinhDT06Update));
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
      {/* <DialogTitle id="form-dialog-title">Thông tin lớp đào tạo</DialogTitle> */}
      <DialogContent>
        <MainCard title={"Quá trình tích lũy trong khóa"}>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmitData)}>
            <Stack spacing={1}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={4}>
                  <FDatePicker name="TuNgay" label="Từ ngày" />
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
                  <FDatePicker name="DenNgay" label="Đến ngày" />
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
                  <FTextField
                    name="SoTinChiTichLuy"
                    label="Số tín chỉ tích lũy"
                    type="number"
                  />
                </Grid>
                <Grid item xs={12} sm={12} md={12}>
                  <FTextField name="GhiChu" label="Ghi chú" />
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
        </MainCard>
      </DialogContent>
    </Dialog>
  );
}

export default QuaTrinhDT06Form;
