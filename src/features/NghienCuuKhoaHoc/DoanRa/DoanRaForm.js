import { yupResolver } from "@hookform/resolvers/yup";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Card,
  Grid,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { FTextField, FormProvider } from "components/form";
import FDatePicker from "components/form/FDatePicker";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import dayjs from "dayjs";
import { createDoanRa, updateDoanRa, getDoanRaById } from "./doanraSlice";
import Autocomplete from "@mui/material/Autocomplete";
import countries from "../../../data/countries";
import CloseIcon from "@mui/icons-material/Close";

const yupSchema = Yup.object().shape({
  NgayKyVanBan: Yup.date().nullable().required("Bắt buộc chọn ngày ký văn bản"),
  SoVanBanChoPhep: Yup.string().required("Bắt buộc nhập số văn bản cho phép"),
  MucDichXuatCanh: Yup.string().required("Bắt buộc nhập mục đích xuất cảnh"),
  QuocGiaDen: Yup.string().required("Bắt buộc nhập quốc gia đến"),
  ThoiGianXuatCanh: Yup.date()
    .nullable()
    .required("Bắt buộc chọn thời gian xuất cảnh"),
});

function DoanRaForm({ open, onClose, doanRaId = null, onSuccess }) {
  const dispatch = useDispatch();
  const { currentDoanRa, isLoading } = useSelector((state) => state.doanra);
  const [isEditMode, setIsEditMode] = useState(false);

  const methods = useForm({
    resolver: yupResolver(yupSchema),
    defaultValues: {
      NgayKyVanBan: null,
      SoVanBanChoPhep: "",
      MucDichXuatCanh: "",
      ThoiGianXuatCanh: null,
      NguonKinhPhi: "",
      QuocGiaDen: "",
      BaoCao: "",
      GhiChu: "",
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  // Load data khi edit
  useEffect(() => {
    if (doanRaId && open) {
      setIsEditMode(true);
      dispatch(getDoanRaById(doanRaId));
    } else {
      setIsEditMode(false);
      reset({
        NgayKyVanBan: null,
        SoVanBanChoPhep: "",
        MucDichXuatCanh: "",
        ThoiGianXuatCanh: null,
        NguonKinhPhi: "",
        QuocGiaDen: "",
        BaoCao: "",
        GhiChu: "",
      });
    }
  }, [doanRaId, open, dispatch, reset]);

  // Update form khi có data từ Redux
  useEffect(() => {
    if (currentDoanRa && currentDoanRa._id && isEditMode) {
      reset({
        ...currentDoanRa,
        NgayKyVanBan: currentDoanRa.NgayKyVanBan
          ? dayjs(currentDoanRa.NgayKyVanBan)
          : null,
        ThoiGianXuatCanh: currentDoanRa.ThoiGianXuatCanh
          ? dayjs(currentDoanRa.ThoiGianXuatCanh)
          : null,
      });
    }
  }, [currentDoanRa, reset, isEditMode]);

  const onSubmitData = async (data) => {
    try {
      const doanRaData = {
        ...data,
        NgayKyVanBan: data.NgayKyVanBan
          ? data.NgayKyVanBan.toISOString()
          : null,
        ThoiGianXuatCanh: data.ThoiGianXuatCanh
          ? data.ThoiGianXuatCanh.toISOString()
          : null,
        ThanhVien: currentDoanRa?.ThanhVien || [], // Giữ nguyên thành viên cũ nếu có
        TaiLieuKemTheo: currentDoanRa?.TaiLieuKemTheo || [], // Giữ nguyên tài liệu cũ nếu có
      };

      if (isEditMode && currentDoanRa?._id) {
        await dispatch(updateDoanRa(currentDoanRa._id, doanRaData));
      } else {
        await dispatch(createDoanRa(doanRaData));
      }

      onSuccess && onSuccess();
      handleClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: "70vh" },
      }}
    >
      <DialogTitle>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h4">
            {isEditMode ? "Cập nhật thông tin Đoàn Ra" : "Thêm mới Đoàn Ra"}
          </Typography>
          <Button
            onClick={handleClose}
            color="error"
            size="small"
            startIcon={<CloseIcon fontSize="small" />}
          >
            Đóng
          </Button>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Card variant="outlined" sx={{ p: 2, mt: 1 }}>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmitData)}>
            <Stack spacing={3}>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                Thông tin chung
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FDatePicker
                    name="NgayKyVanBan"
                    label="Ngày ký văn bản"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FTextField
                    name="SoVanBanChoPhep"
                    label="Số văn bản cho phép"
                    fullWidth
                  />
                </Grid>
              </Grid>

              <FTextField
                name="MucDichXuatCanh"
                label="Mục đích xuất cảnh"
                multiline
                rows={2}
                fullWidth
              />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FDatePicker
                    name="ThoiGianXuatCanh"
                    label="Thời gian xuất cảnh"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={countries}
                    getOptionLabel={(option) =>
                      option && option.label
                        ? `${option.label} (${option.code}, ${option.phone})`
                        : ""
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.label === value.label
                    }
                    renderOption={(props, option) => (
                      <li {...props}>
                        {option.label}{" "}
                        <span style={{ color: "#888" }}>
                          ({option.code}, {option.phone})
                        </span>
                      </li>
                    )}
                    renderInput={(params) => (
                      <FTextField
                        {...params}
                        name="QuocGiaDen"
                        label="Quốc gia đến"
                        fullWidth
                      />
                    )}
                    value={
                      countries.find(
                        (c) => c.label === methods.getValues("QuocGiaDen")
                      ) || null
                    }
                    onChange={(_, value) => {
                      methods.setValue("QuocGiaDen", value ? value.label : "");
                    }}
                  />
                </Grid>
              </Grid>

              <FTextField
                name="NguonKinhPhi"
                label="Nguồn kinh phí"
                fullWidth
              />

              <FTextField
                name="BaoCao"
                label="Báo cáo"
                multiline
                rows={3}
                fullWidth
              />

              <FTextField
                name="GhiChu"
                label="Ghi chú"
                multiline
                rows={2}
                fullWidth
              />
            </Stack>
          </FormProvider>
        </Card>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          onClick={handleClose}
          variant="outlined"
          color="inherit"
          disabled={isSubmitting}
        >
          Hủy
        </Button>
        <LoadingButton
          onClick={handleSubmit(onSubmitData)}
          variant="contained"
          startIcon={<SaveIcon />}
          loading={isSubmitting || isLoading}
          loadingPosition="start"
        >
          {isEditMode ? "Cập nhật" : "Thêm mới"}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

export default DoanRaForm;
