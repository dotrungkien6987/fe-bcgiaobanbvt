import { yupResolver } from "@hookform/resolvers/yup";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import * as Yup from "yup";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormProvider, FSelect, FTextField } from "components/form";
import { useDispatch } from "react-redux";
import { createLoaiChuyenMon, updateLoaiChuyenMon } from "./loaiChuyenMonSlice";

const schema = Yup.object().shape({
  LoaiChuyenMon: Yup.string().required("Bắt buộc"),
  TrinhDo: Yup.string().nullable(),
});

const ENUM_OPTIONS = [
  { value: "BAC_SI", label: "Bác sĩ" },
  { value: "DUOC_SI", label: "Dược sĩ" },
  { value: "DIEU_DUONG", label: "Điều dưỡng" },
  { value: "KTV", label: "KTV" },
  { value: "KHAC", label: "Khác" },
];

export default function LoaiChuyenMonForm({ open, onClose, editing }) {
  const dispatch = useDispatch();
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: { LoaiChuyenMon: "", TrinhDo: "" },
  });
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (editing)
      reset({
        LoaiChuyenMon: editing.LoaiChuyenMon,
        TrinhDo: editing.TrinhDo || "",
      });
    else reset({ LoaiChuyenMon: "", TrinhDo: "" });
  }, [editing, reset]);

  const onSubmit = async (data) => {
    if (editing) await dispatch(updateLoaiChuyenMon(editing._id, data));
    else await dispatch(createLoaiChuyenMon(data));
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        {editing ? "Cập nhật" : "Thêm mới"} Loại chuyên môn
      </DialogTitle>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <FSelect name="LoaiChuyenMon" label="Loại" options={ENUM_OPTIONS} />
          <FTextField name="TrinhDo" label="Trình độ" sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Hủy</Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            Lưu
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
