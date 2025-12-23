/**
 * NotificationTypeForm Component (Admin)
 * Create/Edit notification type dialog
 */

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Typography,
  Checkbox,
  FormControlLabel,
  Divider,
  Box,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { FormProvider, FTextField } from "../../../components/form";
import { createType, updateType } from "./notificationTypeSlice";

const VARIABLE_TYPES = [
  "String",
  "Number",
  "Boolean",
  "Date",
  "ObjectId",
  "Array",
  "Object",
];

const NHOM_OPTIONS = [
  { value: "Công việc", label: "Công việc" },
  { value: "Yêu cầu", label: "Yêu cầu" },
  { value: "KPI", label: "KPI" },
  { value: "Hệ thống", label: "Hệ thống" },
];

const schema = Yup.object().shape({
  code: Yup.string()
    .required("Code là bắt buộc")
    .matches(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Code nên dạng kebab-case, vd: yeucau-tao-moi"
    ),
  name: Yup.string().required("Tên là bắt buộc"),
  Nhom: Yup.string()
    .oneOf(["Công việc", "Yêu cầu", "KPI", "Hệ thống"])
    .required("Nhóm là bắt buộc"),
  variables: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required("Tên biến là bắt buộc"),
      type: Yup.string().oneOf(VARIABLE_TYPES).required("Kiểu là bắt buộc"),
      itemType: Yup.string().nullable(),
      ref: Yup.string().nullable(),
      description: Yup.string().nullable(),
      isRecipientCandidate: Yup.boolean(),
    })
  ),
  isActive: Yup.boolean(),
});

const defaultValues = {
  code: "",
  name: "",
  description: "",
  Nhom: "Công việc",
  isActive: true,
  variables: [],
};

function NotificationTypeForm({ open, onClose, type = null }) {
  const dispatch = useDispatch();
  const isEdit = Boolean(type?._id);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    control,
    watch,
    formState: { isSubmitting },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variables",
  });

  const variables = watch("variables");

  useEffect(() => {
    if (type) {
      reset({
        ...defaultValues,
        ...type,
        variables: type.variables || [],
      });
    } else {
      reset(defaultValues);
    }
  }, [type, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        const payload = {
          name: data.name,
          description: data.description,
          Nhom: data.Nhom,
          isActive: data.isActive,
          variables: data.variables || [],
        };
        await dispatch(updateType(type._id, payload));
      } else {
        await dispatch(createType(data));
      }
      onClose();
    } catch (e) {
      // handled in slice
    }
  };

  const handleAddVariable = () => {
    append({
      name: "",
      type: "String",
      itemType: "",
      ref: "",
      description: "",
      isRecipientCandidate: false,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? "Chỉnh sửa Notification Type" : "Tạo Notification Type mới"}
      </DialogTitle>

      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FTextField
                name="code"
                label="Code *"
                placeholder="vd: yeucau-tao-moi"
                disabled={isEdit}
                helperText="Nên dùng kebab-case, chữ thường"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FTextField name="name" label="Tên hiển thị *" />
            </Grid>
            <Grid item xs={12} md={4}>
              <FTextField name="Nhom" label="Nhóm *" select>
                {NHOM_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </FTextField>
            </Grid>

            <Grid item xs={12}>
              <FTextField name="description" label="Mô tả" multiline rows={2} />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox checked={!!field.value} {...field} />}
                    label="Đang hoạt động"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="subtitle2">Variables</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddVariable}
                >
                  Thêm biến
                </Button>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Dùng để validate dữ liệu và chọn recipient candidates.
              </Typography>
            </Grid>

            {fields.length === 0 && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Chưa có biến nào.
                  </Typography>
                </Box>
              </Grid>
            )}

            {fields.map((f, index) => {
              const current = variables?.[index] || {};
              const isArray = current.type === "Array";

              return (
                <Grid item xs={12} key={f.id}>
                  <Box
                    sx={{
                      p: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                    >
                      <Typography variant="subtitle2">
                        Biến #{index + 1}
                      </Typography>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => remove(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Controller
                          name={`variables.${index}.name`}
                          control={control}
                          render={({ field, fieldState }) => (
                            <FTextField
                              {...field}
                              label="Tên biến *"
                              placeholder="vd: NguoiYeuCauID"
                              error={!!fieldState.error}
                              helperText={fieldState.error?.message}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item xs={12} md={3}>
                        <Controller
                          name={`variables.${index}.type`}
                          control={control}
                          render={({ field, fieldState }) => (
                            <FTextField
                              {...field}
                              select
                              label="Kiểu *"
                              error={!!fieldState.error}
                              helperText={fieldState.error?.message}
                            >
                              {VARIABLE_TYPES.map((t) => (
                                <MenuItem key={t} value={t}>
                                  {t}
                                </MenuItem>
                              ))}
                            </FTextField>
                          )}
                        />
                      </Grid>

                      <Grid item xs={12} md={3}>
                        <Controller
                          name={`variables.${index}.itemType`}
                          control={control}
                          render={({ field }) => (
                            <FTextField
                              {...field}
                              label="Item type"
                              placeholder={isArray ? "vd: ObjectId" : ""}
                              disabled={!isArray}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item xs={12} md={2}>
                        <Controller
                          name={`variables.${index}.ref`}
                          control={control}
                          render={({ field }) => (
                            <FTextField
                              {...field}
                              label="Ref"
                              placeholder="vd: NhanVien"
                            />
                          )}
                        />
                      </Grid>

                      <Grid item xs={12} md={8}>
                        <Controller
                          name={`variables.${index}.description`}
                          control={control}
                          render={({ field }) => (
                            <FTextField {...field} label="Mô tả" />
                          )}
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Controller
                          name={`variables.${index}.isRecipientCandidate`}
                          control={control}
                          render={({ field }) => (
                            <FormControlLabel
                              control={
                                <Checkbox checked={!!field.value} {...field} />
                              }
                              label="Recipient candidate"
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Hủy</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isEdit ? "Cập nhật" : "Tạo"}
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

export default NotificationTypeForm;
