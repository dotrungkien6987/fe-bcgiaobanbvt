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
  code: Yup.string().required("Bắt buộc nhập mã quốc gia"),
  label: Yup.string().required("Bắt buộc nhập tên quốc gia"),
});
function QuocGiaForm({ open, handleClose, index = 0 }) {
  const { datafix, QuocGia } = useSelector((state) => state.nhanvien);
  const methods = useForm({
    resolver: yupResolver(yupSchema),
    defaultValues: {
      code: "",
      label: "",
      phone: "",
    },
  });
  const dispatch = useDispatch();
  const onSubmitData = (data) => {
    if (index !== 0) {
      const updatedArray = datafix.QuocGia.map((item) =>
        item.index === index ? { ...data } : item
      );

      const datafixUpdate = {
        ...datafix,
        QuocGia: updatedArray,
      };
      dispatch(updateOrInsertDatafix(datafixUpdate));
      handleClose();
      return;
    }

    // Tạo index cho item mới = max index hiện tại + 1
    const maxIndex =
      QuocGia.length > 0
        ? Math.max(...QuocGia.map((item) => item.index || 0))
        : 0;
    const newItem = {
      ...data,
      index: maxIndex + 1,
    };

    const datafixUpdate = {
      ...datafix,
      QuocGia: [newItem, ...QuocGia],
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
    if (index === 0) {
      reset({
        code: "",
        label: "",
        phone: "",
      });
    } else {
      const datafixValue = QuocGia.filter((item) => item.index === index);

      reset({ ...datafixValue[0] });
    }
  }, [index, QuocGia, reset]);
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
      <DialogTitle id="form-dialog-title">
        {index === 0 ? "Thêm mới quốc gia" : "Sửa quốc gia"}
      </DialogTitle>
      <DialogContent>
        <Card sx={{ p: 3 }}>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmitData)}>
            <FTextField name="code" label="Mã quốc gia" />
            <FTextField name="label" label="Tên quốc gia" />
            <FTextField name="phone" label="Mã điện thoại" />

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

export default QuocGiaForm;
