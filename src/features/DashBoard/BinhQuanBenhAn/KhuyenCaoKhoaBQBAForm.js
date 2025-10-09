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

import { FormProvider, FTextField, FAutocomplete } from "components/form";
import { createKhuyenCao, updateKhuyenCao } from "./khuyenCaoKhoaBQBASlice";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch } from "react-redux";
import { TextField } from "@mui/material";

import * as Yup from "yup";

const yupSchema = Yup.object().shape({
  KhoaID: Yup.object()
    .nullable()
    .required("Bắt buộc chọn khoa")
    .test("is-valid-khoa", "Bắt buộc chọn khoa", (value) => {
      return value && value.KhoaID;
    }),
  TenKhoa: Yup.string().required("Bắt buộc nhập tên khoa"),
  LoaiKhoa: Yup.string()
    .required("Bắt buộc chọn loại khoa")
    .oneOf(["noitru", "ngoaitru"], "Loại khoa không hợp lệ"),
  Nam: Yup.number()
    .required("Bắt buộc nhập năm")
    .typeError("Năm phải là số")
    .min(2020, "Năm phải >= 2020")
    .max(2050, "Năm phải <= 2050"),
  KhuyenCaoBinhQuanHSBA: Yup.number()
    .required("Bắt buộc nhập khuyến cáo bình quân")
    .typeError("Phải là số")
    .min(0, "Giá trị phải >= 0"),
  KhuyenCaoTyLeThuocVatTu: Yup.number()
    .required("Bắt buộc nhập khuyến cáo tỷ lệ")
    .typeError("Phải là số")
    .min(0, "Giá trị phải >= 0")
    .max(100, "Giá trị phải <= 100"),
  GhiChu: Yup.string(),
});

function KhuyenCaoKhoaBQBAForm({
  open,
  handleClose,
  item,
  currentYear,
  khoaList = [],
}) {
  const dispatch = useDispatch();

  const defaultValues = {
    KhoaID: null, // Changed to null for autocomplete
    TenKhoa: "",
    LoaiKhoa: "noitru",
    Nam: currentYear || new Date().getFullYear(),
    KhuyenCaoBinhQuanHSBA: 0,
    KhuyenCaoTyLeThuocVatTu: 0,
    GhiChu: "",
  };

  const methods = useForm({
    resolver: yupResolver(yupSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { isSubmitting },
  } = methods;

  const selectedKhoa = watch("KhoaID"); // Changed from selectedKhoaID

  // Auto-fill TenKhoa and LoaiKhoa when KhoaID changes
  useEffect(() => {
    if (selectedKhoa && typeof selectedKhoa === "object") {
      setValue("TenKhoa", selectedKhoa.TenKhoa || "");
      // Also update LoaiKhoa if available in the khoa object
      if (selectedKhoa.LoaiKhoa) {
        setValue("LoaiKhoa", selectedKhoa.LoaiKhoa);
      }
    } else if (!selectedKhoa) {
      setValue("TenKhoa", "");
    }
  }, [selectedKhoa, item, setValue]);

  const onSubmitData = async (data) => {
    try {
      if (item?._id) {
        // Update mode - chỉ gửi các field được phép update
        const updateData = {
          KhuyenCaoBinhQuanHSBA: data.KhuyenCaoBinhQuanHSBA,
          KhuyenCaoTyLeThuocVatTu: data.KhuyenCaoTyLeThuocVatTu,
          GhiChu: data.GhiChu,
        };
        await dispatch(updateKhuyenCao(item._id, updateData));
      } else {
        // Create mode - gửi tất cả fields
        const submitData = {
          ...data,
          KhoaID:
            typeof data.KhoaID === "object" ? data.KhoaID.KhoaID : data.KhoaID,
        };
        await dispatch(createKhuyenCao(submitData));
      }
      handleClose();
    } catch (error) {
      // Error already handled in redux action
    }
  };

  useEffect(() => {
    // Reset form khi dialog mở/đóng hoặc item thay đổi
    if (!open) return; // Không reset khi dialog đóng

    if (item) {
      // Edit mode - find khoa object from khoaList
      const khoaObj = khoaList.find(
        (k) => k.KhoaID === item.KhoaID && k.LoaiKhoa === item.LoaiKhoa
      );

      console.log("Edit mode - Finding khoa:", {
        itemKhoaID: item.KhoaID,
        itemLoaiKhoa: item.LoaiKhoa,
        khoaListLength: khoaList.length,
        khoaObj,
      });

      reset({
        KhoaID: khoaObj || null,
        TenKhoa: item.TenKhoa,
        LoaiKhoa: item.LoaiKhoa,
        Nam: item.Nam,
        KhuyenCaoBinhQuanHSBA: item.KhuyenCaoBinhQuanHSBA,
        KhuyenCaoTyLeThuocVatTu: item.KhuyenCaoTyLeThuocVatTu,
        GhiChu: item.GhiChu || "",
      });
    } else {
      // Create mode - reset về giá trị mặc định
      reset({
        KhoaID: null,
        TenKhoa: "",
        LoaiKhoa: "noitru",
        Nam: currentYear || new Date().getFullYear(),
        KhuyenCaoBinhQuanHSBA: 0,
        KhuyenCaoTyLeThuocVatTu: 0,
        GhiChu: "",
      });
    }
  }, [open, item, currentYear, khoaList, reset]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: "700px",
          maxHeight: "90vh",
          overflowY: "auto",
        },
      }}
    >
      <DialogTitle id="form-dialog-title">
        {item ? "Cập nhật khuyến cáo" : "Thêm mới khuyến cáo"}
      </DialogTitle>
      <DialogContent>
        <Card sx={{ p: 3 }}>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmitData)}>
            <FAutocomplete
              name="KhoaID"
              label="Chọn khoa"
              options={khoaList}
              displayField="TenKhoa"
              disabled={!!item} // ✅ Disable khi edit mode
              getOptionLabel={(option) =>
                option && option.TenKhoa
                  ? `${option.TenKhoa} (ID: ${option.KhoaID} - ${
                      option.LoaiKhoa === "noitru" ? "Nội trú" : "Ngoại trú"
                    })`
                  : ""
              }
              isOptionEqualToValue={(option, value) =>
                option?.KhoaID === value?.KhoaID &&
                option?.LoaiKhoa === value?.LoaiKhoa
              }
            />

            <FTextField
              name="TenKhoa"
              label="Tên khoa"
              disabled
              helperText="Tự động điền khi chọn khoa"
            />

            <Controller
              name="LoaiKhoa"
              control={control}
              render={({ field: { value } }) => (
                <TextField
                  label="Loại khoa"
                  value={
                    value === "noitru"
                      ? "Nội trú"
                      : value === "ngoaitru"
                      ? "Ngoại trú"
                      : value || ""
                  }
                  disabled
                  variant="standard"
                  fullWidth
                  margin="normal"
                  helperText="Tự động điền khi chọn khoa"
                  InputProps={{
                    readOnly: true,
                  }}
                />
              )}
            />

            <FTextField
              name="Nam"
              label="Năm"
              type="number"
              disabled={!!item}
            />

            <FTextField
              name="KhuyenCaoBinhQuanHSBA"
              label="Khuyến cáo bình quân HSBA (đồng)"
              type="number"
              helperText="Đơn vị: đồng. Ví dụ: 7500000 = 7 triệu 500 nghìn"
            />

            <FTextField
              name="KhuyenCaoTyLeThuocVatTu"
              label="Khuyến cáo tỷ lệ (Thuốc + VT) (%)"
              type="number"
              helperText="Đơn vị: phần trăm. Ví dụ: 65.5 = 65.5%"
            />

            <FTextField name="GhiChu" label="Ghi chú" multiline rows={3} />

            <Box sx={{ flexGrow: 1 }} />
            <DialogActions>
              <LoadingButton
                type="submit"
                variant="contained"
                size="small"
                loading={isSubmitting}
              >
                {item ? "Cập nhật" : "Tạo mới"}
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

export default KhuyenCaoKhoaBQBAForm;
