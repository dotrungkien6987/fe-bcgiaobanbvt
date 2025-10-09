import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Grid,
} from "@mui/material";
import {
  FormProvider,
  FTextField,
  FDatePicker,
} from "../../../components/form";
import dayjs from "dayjs";

const yupSchema = Yup.object().shape({
  TenChuKy: Yup.string().max(255, "Tên chu kỳ không được quá 255 ký tự"),
  Thang: Yup.number()
    .required("Vui lòng chọn tháng")
    .min(1, "Tháng phải từ 1-12")
    .max(12, "Tháng phải từ 1-12"),
  Nam: Yup.number()
    .required("Vui lòng nhập năm")
    .min(2020, "Năm phải từ 2020 trở đi"),
  NgayBatDau: Yup.date()
    .required("Vui lòng chọn ngày bắt đầu")
    .typeError("Ngày bắt đầu không hợp lệ"),
  NgayKetThuc: Yup.date()
    .required("Vui lòng chọn ngày kết thúc")
    .typeError("Ngày kết thúc không hợp lệ")
    .min(Yup.ref("NgayBatDau"), "Ngày kết thúc phải sau ngày bắt đầu"),
  MoTa: Yup.string().max(1000, "Mô tả không được quá 1000 ký tự"),
});

function ThongTinChuKyDanhGia({ open, handleClose, item = null, onSubmit }) {
  const isEdit = Boolean(item?._id);

  const defaultValues = {
    TenChuKy: item?.TenChuKy || "",
    Thang: item?.Thang || new Date().getMonth() + 1,
    Nam: item?.Nam || new Date().getFullYear(),
    NgayBatDau: item?.NgayBatDau ? dayjs(item.NgayBatDau) : null,
    NgayKetThuc: item?.NgayKetThuc ? dayjs(item.NgayKetThuc) : null,
    MoTa: item?.MoTa || "",
  };

  const methods = useForm({
    resolver: yupResolver(yupSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = methods;

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
      reset();
      handleClose();
    } catch (error) {
      // Error đã được handle trong Redux action với toast.error
      // Giữ form mở để user có thể sửa
      console.error("Form submit error:", error);
    }
  };

  const handleCancel = () => {
    reset();
    handleClose();
  };

  // Array tháng
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `Tháng ${i + 1}`,
  }));

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? "Chỉnh sửa chu kỳ đánh giá" : "Thêm chu kỳ đánh giá mới"}
      </DialogTitle>
      <FormProvider methods={methods} onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FTextField
              name="TenChuKy"
              label="Tên chu kỳ"
              placeholder="VD: Tháng 1/2024"
              helperText="Để trống để tự động tạo từ Tháng/Năm"
            />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FTextField
                  name="Thang"
                  label="Tháng"
                  type="number"
                  select
                  SelectProps={{
                    native: true,
                  }}
                >
                  {monthOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </FTextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <FTextField
                  name="Nam"
                  label="Năm"
                  type="number"
                  placeholder="VD: 2024"
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FDatePicker
                  name="NgayBatDau"
                  label="Ngày bắt đầu"
                  format="DD/MM/YYYY"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FDatePicker
                  name="NgayKetThuc"
                  label="Ngày kết thúc"
                  format="DD/MM/YYYY"
                />
              </Grid>
            </Grid>

            <FTextField
              name="MoTa"
              label="Mô tả"
              multiline
              rows={3}
              placeholder="Nhập mô tả cho chu kỳ đánh giá"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{ minWidth: 100 }}
          >
            {isEdit ? "Cập nhật" : "Thêm mới"}
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

export default ThongTinChuKyDanhGia;
