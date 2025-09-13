import React from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  TextField,
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
import {
  createTapSan,
  getTapSanById,
  updateTapSan,
} from "../services/tapsan.api";
import { useNavigate, useParams } from "react-router-dom";

export default function TapSanFormPage() {
  const nav = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id) && id !== "new";
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [form, setForm] = React.useState({
    Loai: "YHTH",
    NamXuatBan: "2025",
    SoXuatBan: 1,
    GhiChu: "",
    TrangThai: "chua-hoan-thanh",
  });

  React.useEffect(() => {
    if (isEdit) {
      setLoading(true);
      getTapSanById(id)
        .then((d) =>
          setForm({
            Loai: d.Loai || "YHTH",
            NamXuatBan: d.NamXuatBan || "2025",
            SoXuatBan: d.SoXuatBan || 1,
            GhiChu: d.GhiChu || "",
            TrangThai: d.TrangThai || "chua-hoan-thanh",
          })
        )
        .catch((error) => {
          console.error("Error loading data:", error);
          setErrors({ general: "Không thể tải dữ liệu tập san" });
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const validateForm = () => {
    const newErrors = {};

    if (!form.Loai) {
      newErrors.Loai = "Vui lòng chọn loại tập san";
    }

    if (
      !form.NamXuatBan ||
      form.NamXuatBan.length !== 4 ||
      isNaN(form.NamXuatBan)
    ) {
      newErrors.NamXuatBan = "Năm xuất bản phải là 4 chữ số";
    }

    if (!form.SoXuatBan || form.SoXuatBan < 1 || form.SoXuatBan > 12) {
      newErrors.SoXuatBan = "Số xuất bản phải từ 1 đến 12";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (isEdit) {
        await updateTapSan(id, form);
        nav(`/tapsan/${id}`);
      } else {
        const d = await createTapSan(form);
        nav(`/tapsan/${d._id}`);
      }
    } catch (error) {
      console.error("Error saving:", error);
      setErrors({ general: "Có lỗi xảy ra khi lưu dữ liệu" });
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setForm((s) => ({ ...s, [field]: value }));
    if (errors[field]) {
      setErrors((e) => ({ ...e, [field]: null }));
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

            {errors.general && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {errors.general}
              </Alert>
            )}

            {/* Form */}
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
                  <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                    <BookIcon color="primary" />
                    <Typography variant="h6" fontWeight="600">
                      Loại tập san
                    </Typography>
                  </Stack>
                  <TextField
                    select
                    fullWidth
                    value={form.Loai}
                    onChange={(e) => handleFieldChange("Loai", e.target.value)}
                    error={!!errors.Loai}
                    helperText={errors.Loai}
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
                  </TextField>
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
                  <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                    <CheckIcon color="primary" />
                    <Typography variant="h6" fontWeight="600">
                      Trạng thái
                    </Typography>
                  </Stack>
                  <TextField
                    select
                    fullWidth
                    value={form.TrangThai}
                    onChange={(e) =>
                      handleFieldChange("TrangThai", e.target.value)
                    }
                    error={!!errors.TrangThai}
                    helperText={
                      errors.TrangThai || "Chọn trạng thái hoàn thành"
                    }
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
                  </TextField>
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
                  <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                    <CalendarIcon color="primary" />
                    <Typography variant="h6" fontWeight="600">
                      Năm xuất bản
                    </Typography>
                  </Stack>
                  <TextField
                    fullWidth
                    placeholder="Ví dụ: 2025"
                    value={form.NamXuatBan}
                    onChange={(e) =>
                      handleFieldChange("NamXuatBan", e.target.value)
                    }
                    error={!!errors.NamXuatBan}
                    helperText={
                      errors.NamXuatBan || "Nhập năm xuất bản (4 chữ số)"
                    }
                    inputProps={{ maxLength: 4 }}
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
                  <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                    <NumberIcon color="primary" />
                    <Typography variant="h6" fontWeight="600">
                      Số xuất bản
                    </Typography>
                  </Stack>
                  <TextField
                    fullWidth
                    type="number"
                    placeholder="Ví dụ: 1"
                    value={form.SoXuatBan}
                    onChange={(e) =>
                      handleFieldChange("SoXuatBan", Number(e.target.value))
                    }
                    error={!!errors.SoXuatBan}
                    helperText={errors.SoXuatBan || "Nhập số xuất bản (1-12)"}
                    inputProps={{ min: 1, max: 12 }}
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
                  <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                    <Typography variant="h6" fontWeight="600">
                      📝 Ghi chú
                    </Typography>
                  </Stack>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Nhập ghi chú cho tập san..."
                    value={form.GhiChu}
                    onChange={(e) =>
                      handleFieldChange("GhiChu", e.target.value)
                    }
                    error={!!errors.GhiChu}
                    helperText={errors.GhiChu || "Thông tin bổ sung về tập san"}
                    sx={{ mt: 1 }}
                  />
                </Paper>
              </Grid>

              {/* Preview card */}
              <Grid item xs={12} md={4}>
                {(form.Loai || form.NamXuatBan || form.SoXuatBan) && (
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
                        sx={{ flex: 1, display: "flex", alignItems: "center" }}
                      >
                        <Typography variant="body1">
                          <strong>Tên tập san:</strong>{" "}
                          {form.Loai === "YHTH"
                            ? "Y học thực hành"
                            : "Thông tin thuốc"}{" "}
                          - Năm {form.NamXuatBan} - Số {form.SoXuatBan}
                        </Typography>
                      </Box>
                      {form.TrangThai && (
                        <Box sx={{ mt: 2 }}>
                          <Chip
                            label={
                              form.TrangThai === "da-hoan-thanh"
                                ? "Đã hoàn thành"
                                : "Chưa hoàn thành"
                            }
                            color={
                              form.TrangThai === "da-hoan-thanh"
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
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => nav(-1)}
                size="large"
                sx={{ borderRadius: 2, px: 3 }}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                startIcon={
                  saving ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <SaveIcon />
                  )
                }
                onClick={onSubmit}
                disabled={saving}
                size="large"
                sx={{
                  borderRadius: 2,
                  px: 4,
                  boxShadow: 2,
                  "&:hover": { boxShadow: 4 },
                }}
              >
                {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
