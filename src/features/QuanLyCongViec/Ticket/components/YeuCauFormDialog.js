/**
 * YeuCauFormDialog - Dialog tạo/sửa yêu cầu
 */
import React, { useEffect, useMemo } from "react";
import {
  Button,
  Stack,
  Alert,
  Typography,
  Box,
  Autocomplete,
  TextField,
} from "@mui/material";
import { AccessTime as TimeIcon } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch, useSelector } from "react-redux";
import { LoadingButton } from "@mui/lab";

import { FormProvider, FTextField } from "components/form";
import BottomSheetDialog from "components/BottomSheetDialog";
import {
  createYeuCau,
  updateYeuCau,
  getDanhMucByKhoa,
  selectDanhMucList,
} from "../yeuCauSlice";
import { yeuCauValidationSchema } from "../yeuCau.validation";

function YeuCauFormDialog({
  open,
  onClose,
  yeuCau = null, // null = tạo mới, object = sửa
  khoaOptions = [],
  defaultKhoaXuLyID = "",
}) {
  const dispatch = useDispatch();
  const danhMucList = useSelector(selectDanhMucList);
  const { isLoading } = useSelector((state) => state.yeuCau);

  const isEdit = Boolean(yeuCau?._id);

  const defaultValues = useMemo(
    () => ({
      TieuDe: yeuCau?.TieuDe || "",
      MoTa: yeuCau?.MoTa || "",
      KhoaDichID:
        yeuCau?.KhoaDichID?._id ||
        yeuCau?.KhoaDichID ||
        defaultKhoaXuLyID ||
        "",
      DanhMucYeuCauID:
        yeuCau?.DanhMucYeuCauID?._id || yeuCau?.DanhMucYeuCauID || "",
    }),
    [yeuCau, defaultKhoaXuLyID]
  );

  const methods = useForm({
    resolver: yupResolver(yeuCauValidationSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = methods;

  const watchKhoaDichID = watch("KhoaDichID");
  const watchDanhMucID = watch("DanhMucYeuCauID");

  // Reset form khi mở dialog hoặc yeuCau thay đổi
  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, defaultValues, reset]);

  // Load danh mục khi chọn khoa
  useEffect(() => {
    if (watchKhoaDichID) {
      dispatch(getDanhMucByKhoa(watchKhoaDichID));
    }
  }, [dispatch, watchKhoaDichID]);

  const onSubmit = async (data) => {
    const callback = () => {
      onClose();
      reset();
    };

    // Thêm LoaiNguoiNhan mặc định
    const payload = {
      ...data,
      LoaiNguoiNhan: "KHOA", // Default: gửi đến khoa
    };

    if (isEdit) {
      dispatch(updateYeuCau(yeuCau._id, payload, callback));
    } else {
      dispatch(createYeuCau(payload, callback));
    }
  };

  // Format đơn vị thời gian
  const formatDonViThoiGian = (donVi) => {
    const map = { PHUT: "phút", GIO: "giờ", NGAY: "ngày" };
    return map[donVi] || donVi;
  };

  // Format options for FSelect khoa
  const khoaSelectOptions = khoaOptions.map((k) => ({
    value: k._id,
    label: k.TenKhoa,
  }));

  // Format options cho danh mục - hiển thị đầy đủ thông tin
  const danhMucSelectOptions = danhMucList.map((dm) => ({
    value: dm._id,
    label: dm.TenLoaiYeuCau,
    moTa: dm.MoTa,
    thoiGian: dm.ThoiGianDuKien
      ? `${dm.ThoiGianDuKien} ${formatDonViThoiGian(dm.DonViThoiGian)}`
      : null,
  }));

  // Tìm danh mục đang được chọn
  const selectedDanhMuc = danhMucSelectOptions.find(
    (opt) => opt.value === watchDanhMucID
  );

  return (
    <BottomSheetDialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Sửa yêu cầu" : "Tạo yêu cầu mới"}
      maxWidth="sm"
      actions={
        <>
          <Button onClick={onClose} color="inherit">
            Hủy
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isLoading || isSubmitting}
          >
            {isEdit ? "Cập nhật" : "Tạo yêu cầu"}
          </LoadingButton>
        </>
      }
    >
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2.5}>
          {/* Alert cho edit mode */}
          {isEdit && (
            <Alert severity="info">
              Chỉ có thể sửa yêu cầu khi ở trạng thái "Mới"
            </Alert>
          )}

          {/* Tiêu đề */}
          <FTextField
            name="TieuDe"
            label="Tiêu đề *"
            placeholder="Nhập tiêu đề yêu cầu..."
          />

          {/* Khoa xử lý - dùng Autocomplete để tránh lỗi label đè */}
          <Autocomplete
            options={khoaSelectOptions}
            disabled={khoaOptions.length === 0}
            getOptionLabel={(opt) => opt.label || ""}
            value={
              khoaSelectOptions.find((opt) => opt.value === watchKhoaDichID) ||
              null
            }
            onChange={(e, newValue) => {
              methods.setValue("KhoaDichID", newValue?.value || "", {
                shouldValidate: true,
              });
              // Reset danh mục khi đổi khoa
              methods.setValue("DanhMucYeuCauID", "");
            }}
            isOptionEqualToValue={(option, value) =>
              option?.value === value?.value
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Khoa xử lý *"
                placeholder="Chọn khoa xử lý..."
                error={!!errors.KhoaDichID}
                helperText={errors.KhoaDichID?.message}
              />
            )}
            noOptionsText="Không có khoa nào được cấu hình"
          />

          {/* Loại yêu cầu - với Autocomplete hiển thị dạng bảng */}
          <Autocomplete
            options={danhMucSelectOptions}
            disabled={!watchKhoaDichID || danhMucList.length === 0}
            getOptionLabel={(opt) => opt.label || ""}
            value={selectedDanhMuc || null}
            onChange={(e, newValue) => {
              methods.setValue("DanhMucYeuCauID", newValue?.value || "", {
                shouldValidate: true,
              });
            }}
            isOptionEqualToValue={(option, value) =>
              option?.value === value?.value
            }
            ListboxProps={{
              sx: { maxHeight: 350 },
            }}
            renderOption={(props, option) => (
              <Box
                component="li"
                {...props}
                key={option.value}
                sx={{
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:last-child": { borderBottom: "none" },
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 2,
                    width: "100%",
                    py: 0.5,
                  }}
                >
                  {/* Cột trái: Tên + Mô tả */}
                  <Box>
                    <Typography variant="body2" fontWeight="600">
                      {option.label}
                    </Typography>
                    {option.moTa && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          mt: 0.25,
                        }}
                      >
                        {option.moTa}
                      </Typography>
                    )}
                  </Box>
                  {/* Cột phải: Thời gian */}
                  {option.thoiGian && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        px: 1,
                        py: 0.5,
                        bgcolor: "primary.lighter",
                        borderRadius: 1,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <TimeIcon sx={{ fontSize: 16, color: "primary.main" }} />
                      <Typography
                        variant="caption"
                        color="primary.main"
                        fontWeight="medium"
                      >
                        {option.thoiGian}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Loại yêu cầu *"
                placeholder={
                  !watchKhoaDichID
                    ? "Chọn khoa trước"
                    : danhMucList.length === 0
                    ? "Không có loại yêu cầu"
                    : "Chọn loại yêu cầu..."
                }
                error={!!errors.DanhMucYeuCauID}
                helperText={errors.DanhMucYeuCauID?.message}
              />
            )}
            noOptionsText="Không có loại yêu cầu"
          />

          {/* Mô tả */}
          <FTextField
            name="MoTa"
            label="Mô tả chi tiết"
            placeholder="Mô tả chi tiết yêu cầu của bạn (không bắt buộc)..."
            multiline
            rows={5}
          />

          {/* Error summary */}
          {Object.keys(errors).length > 0 && (
            <Alert severity="error">
              Vui lòng kiểm tra lại các trường đánh dấu *
            </Alert>
          )}
        </Stack>
      </FormProvider>
    </BottomSheetDialog>
  );
}

export default YeuCauFormDialog;
