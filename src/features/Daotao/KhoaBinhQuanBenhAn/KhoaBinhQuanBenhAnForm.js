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
  MenuItem,
} from "@mui/material";

import { FormProvider, FTextField } from "components/form";
import { updateOrInsertDatafix } from "features/NhanVien/nhanvienSlice";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

import * as Yup from "yup";

const yupSchema = Yup.object().shape({
  TenKhoa: Yup.string().required("Bắt buộc nhập tên khoa"),
  KhoaID: Yup.number()
    .required("Bắt buộc nhập mã khoa")
    .typeError("Mã khoa phải là số"),
  LoaiKhoa: Yup.string()
    .required("Bắt buộc chọn loại khoa")
    .oneOf(["noitru", "ngoaitru"], "Loại khoa không hợp lệ"),
});

function KhoaBinhQuanBenhAnForm({ open, handleClose, index = 0 }) {
  const { datafix, KhoaBinhQuanBenhAn } = useSelector(
    (state) => state.nhanvien
  );
  const methods = useForm({
    resolver: yupResolver(yupSchema),
    defaultValues: {
      TenKhoa: "",
      KhoaID: 0,
      LoaiKhoa: "noitru",
    },
  });
  const dispatch = useDispatch();

  const onSubmitData = (data) => {
    if (index !== 0) {
      // Cập nhật khoa hiện có
      const updatedArray = datafix.KhoaBinhQuanBenhAn.map((item) =>
        item.index === index ? { ...data } : item
      );

      const datafixUpdate = {
        ...datafix,
        KhoaBinhQuanBenhAn: updatedArray,
      };
      dispatch(updateOrInsertDatafix(datafixUpdate));
      handleClose();
      return;
    }

    // Thêm mới khoa
    const datafixUpdate = {
      ...datafix,
      KhoaBinhQuanBenhAn: [{ ...data }, ...KhoaBinhQuanBenhAn],
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
        TenKhoa: "",
        KhoaID: 0,
        LoaiKhoa: "noitru",
      });
    } else {
      const datafixValue = KhoaBinhQuanBenhAn.filter(
        (item) => item.index === index
      );
      reset({ ...datafixValue[0] });
    }
  }, [index, KhoaBinhQuanBenhAn, reset]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: "600px",
          maxHeight: "90vh",
          overflowY: "auto",
        },
      }}
    >
      <DialogTitle id="form-dialog-title">
        {index === 0
          ? "Thêm mới khoa bình quân bệnh án"
          : "Sửa khoa bình quân bệnh án"}
      </DialogTitle>
      <DialogContent>
        <Card sx={{ p: 3 }}>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmitData)}>
            <FTextField name="TenKhoa" label="Tên khoa" />
            <FTextField name="KhoaID" label="Mã khoa (KhoaID)" type="number" />
            <FTextField name="LoaiKhoa" label="Loại khoa" select>
              <MenuItem value="noitru">Nội trú</MenuItem>
              <MenuItem value="ngoaitru">Ngoại trú</MenuItem>
            </FTextField>

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

export default KhoaBinhQuanBenhAnForm;
