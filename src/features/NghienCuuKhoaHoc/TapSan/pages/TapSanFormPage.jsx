import React from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  MenuItem,
  Card,
  CardContent,
  Alert,
  Divider,
  Chip,
  Paper,
  Grid,
  Fade,
  CircularProgress,
} from "@mui/material";
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Check as CheckIcon,
  MenuBook as BookIcon,
  CalendarToday as CalendarIcon,
  Numbers as NumberIcon,
} from "@mui/icons-material";
import { useDispatch } from "react-redux";
import {
  createTapSan as createTapSanThunk,
  fetchTapSanById,
  updateTapSan as updateTapSanThunk,
} from "../slices/tapSanSlice";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import FormProvider from "components/form/FormProvider";
import FTextField from "components/form/FTextField";
import useLocalSnackbar from "../hooks/useLocalSnackbar";

export default function TapSanFormPage() {
  const nav = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id) && id !== "new";
  const dispatch = useDispatch();
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const schema = Yup.object().shape({
    Loai: Yup.string().oneOf(["YHTH", "TTT"]).required("Vui lòng chọn loại"),
    NamXuatBan: Yup.string()
      .matches(/^\d{4}$/g, "Năm xuất bản phải là 4 chữ số")
      .required("Năm xuất bản là bắt buộc"),
    SoXuatBan: Yup.number()
      .typeError("Số xuất bản phải là số")
      .min(1, "Tối thiểu 1")
      .max(12, "Tối đa 12")
      .required("Số xuất bản là bắt buộc"),
    GhiChu: Yup.string().nullable(),
    TrangThai: Yup.string()
      .oneOf(["chua-hoan-thanh", "da-hoan-thanh"])
      .required("Trạng thái là bắt buộc"),
  });

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      Loai: "YHTH",
      NamXuatBan: "2025",
      SoXuatBan: 1,
      GhiChu: "",
      TrangThai: "chua-hoan-thanh",
    },
  });
  const { handleSubmit, reset, watch } = methods;
  const values = watch();

  React.useEffect(() => {
    if (isEdit) {
      setLoading(true);
      dispatch(fetchTapSanById(id))
        .unwrap()
        .then((d) =>
          reset({
            Loai: d.Loai || "YHTH",
            NamXuatBan: d.NamXuatBan || "2025",
            SoXuatBan: d.SoXuatBan || 1,
            GhiChu: d.GhiChu || "",
            TrangThai: d.TrangThai || "chua-hoan-thanh",
          })
        )
        .catch((error) => {
          console.error("Error loading data:", error);
          setGeneralError("Không thể tải dữ liệu tập san");
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, dispatch, reset]);

  const [generalError, setGeneralError] = React.useState(null);
  const { showSuccess, showError, SnackbarElement } = useLocalSnackbar();

  const applyBusinessErrors = (errObj) => {
    if (!errObj) return;
    const msg = typeof errObj === "string" ? errObj : errObj.message;
    const fieldErrors = errObj.fieldErrors || {};
    if (fieldErrors.NamXuatBan) {
      methods.setError("NamXuatBan", {
        type: "manual",
        message: fieldErrors.NamXuatBan,
      });
    }
    if (fieldErrors.SoXuatBan) {
      methods.setError("SoXuatBan", {
        type: "manual",
        message: fieldErrors.SoXuatBan,
      });
    }
    if (!fieldErrors.NamXuatBan && !fieldErrors.SoXuatBan) {
      setGeneralError(msg);
    }
    showError(msg);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (isEdit) {
        await dispatch(updateTapSanThunk({ id, payload: data })).unwrap();
        showSuccess("Đã cập nhật Tập san");
        nav(`/tapsan/${id}`);
      } else {
        const d = await dispatch(createTapSanThunk(data)).unwrap();
        showSuccess("Đã tạo Tập san");
        nav(`/tapsan/${d?._id}`);
      }
    } catch (error) {
      console.error("Error saving:", error);
      applyBusinessErrors(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "grey.50", minHeight: "100vh" }}>
        <Box sx={{ maxWidth: 1400, mx: "auto" }}>
          <Card elevation={0} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ textAlign: "center", py: 8 }}>
              <CircularProgress size={48} />
              <Typography variant="h6" mt={2} color="text.secondary">
                Đang tải dữ liệu...
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "grey.50", minHeight: "100vh" }}>
      <Box sx={{ maxWidth: 1400, mx: "auto" }}>
        <Card elevation={0} sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={2} mb={4}>
              <BookIcon sx={{ fontSize: 32, color: "primary.main" }} />
              <Box>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {isEdit ? "Chỉnh sửa Tập san" : "Tạo Tập san mới"}
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  {isEdit
                    ? "Cập nhật thông tin tập san hiện có"
                    : "Nhập thông tin để tạo tập san mới"}
                </Typography>
              </Box>
            </Stack>

            {generalError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {generalError}
              </Alert>
            )}

            {/* Form */}
            <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                {/* Row 1: Loại tập san và Trạng thái */}
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      bgcolor: "background.default",
                      height: "100%",
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={2}
                      mb={2}
                    >
                      <BookIcon color="primary" />
                      <Typography variant="h6" fontWeight="600">
                        Loại tập san
                      </Typography>
                    </Stack>
                    <FTextField
                      select
                      name="Loai"
                      label="Loại tập san"
                      fullWidth
                      sx={{ mt: 1 }}
                    >
                      <MenuItem value="YHTH">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Chip label="YHTH" color="primary" size="small" />
                          <Typography>Y học thực hành</Typography>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="TTT">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Chip label="TTT" color="secondary" size="small" />
                          <Typography>Thông tin thuốc</Typography>
                        </Stack>
                      </MenuItem>
                    </FTextField>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      bgcolor: "background.default",
                      height: "100%",
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={2}
                      mb={2}
                    >
                      <CheckIcon color="primary" />
                      <Typography variant="h6" fontWeight="600">
                        Trạng thái
                      </Typography>
                    </Stack>
                    <FTextField
                      select
                      name="TrangThai"
                      label="Trạng thái"
                      fullWidth
                      sx={{ mt: 1 }}
                    >
                      <MenuItem value="chua-hoan-thanh">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Chip
                            label="Chưa hoàn thành"
                            color="warning"
                            size="small"
                          />
                        </Stack>
                      </MenuItem>
                      <MenuItem value="da-hoan-thanh">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Chip
                            label="Đã hoàn thành"
                            color="success"
                            size="small"
                          />
                        </Stack>
                      </MenuItem>
                    </FTextField>
                  </Paper>
                </Grid>

                {/* Row 2: Năm và Số xuất bản */}
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      bgcolor: "background.default",
                      height: "100%",
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={2}
                      mb={2}
                    >
                      <CalendarIcon color="primary" />
                      <Typography variant="h6" fontWeight="600">
                        Năm xuất bản
                      </Typography>
                    </Stack>
                    <FTextField
                      name="NamXuatBan"
                      label="Năm xuất bản"
                      placeholder="Ví dụ: 2025"
                      inputProps={{ maxLength: 4 }}
                      fullWidth
                      sx={{ mt: 1 }}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      bgcolor: "background.default",
                      height: "100%",
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={2}
                      mb={2}
                    >
                      <NumberIcon color="primary" />
                      <Typography variant="h6" fontWeight="600">
                        Số xuất bản
                      </Typography>
                    </Stack>
                    <FTextField
                      name="SoXuatBan"
                      label="Số xuất bản"
                      type="number"
                      placeholder="Ví dụ: 1"
                      inputProps={{ min: 1, max: 12 }}
                      fullWidth
                      sx={{ mt: 1 }}
                    />
                  </Paper>
                </Grid>

                {/* Row 3: Ghi chú và Preview */}
                <Grid item xs={12} md={8}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      bgcolor: "background.default",
                      height: "100%",
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={2}
                      mb={2}
                    >
                      <Typography variant="h6" fontWeight="600">
                        📝 Ghi chú
                      </Typography>
                    </Stack>
                    <FTextField
                      name="GhiChu"
                      label="Ghi chú"
                      multiline
                      rows={4}
                      placeholder="Nhập ghi chú cho tập san..."
                      fullWidth
                      sx={{ mt: 1 }}
                    />
                  </Paper>
                </Grid>

                {/* Preview card */}
                <Grid item xs={12} md={4}>
                  {/* Preview based on current form values */}
                  {(values?.Loai ||
                    values?.NamXuatBan ||
                    values?.SoXuatBan ||
                    values?.TrangThai) && (
                    <Fade in={true}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          bgcolor: "primary.50",
                          border: "1px solid",
                          borderColor: "primary.200",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={2}
                          mb={2}
                        >
                          <CheckIcon color="primary" />
                          <Typography
                            variant="h6"
                            fontWeight="600"
                            color="primary.main"
                          >
                            Xem trước
                          </Typography>
                        </Stack>
                        <Box
                          sx={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="body1">
                            <strong>Tên tập san:</strong>{" "}
                            {values?.Loai === "YHTH"
                              ? "Y học thực hành"
                              : "Thông tin thuốc"}{" "}
                            - Năm {values?.NamXuatBan} - Số {values?.SoXuatBan}
                          </Typography>
                        </Box>
                        {values?.TrangThai && (
                          <Box sx={{ mt: 2 }}>
                            <Chip
                              label={
                                values?.TrangThai === "da-hoan-thanh"
                                  ? "Đã hoàn thành"
                                  : "Chưa hoàn thành"
                              }
                              color={
                                values?.TrangThai === "da-hoan-thanh"
                                  ? "success"
                                  : "warning"
                              }
                              size="small"
                            />
                          </Box>
                        )}
                      </Paper>
                    </Fade>
                  )}
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              {/* Actions */}
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "flex-end",
                  mt: 3,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => nav(-1)}
                  startIcon={<CancelIcon />}
                  disabled={saving}
                >
                  Hủy
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  startIcon={<SaveIcon />}
                  disabled={saving}
                >
                  {isEdit ? "Cập nhật" : "Tạo mới"}
                </Button>
              </Box>
            </FormProvider>
            {SnackbarElement}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
