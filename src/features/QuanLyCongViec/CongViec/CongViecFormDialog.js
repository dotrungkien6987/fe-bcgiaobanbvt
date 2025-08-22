import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Grid,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  Slider,
  Tooltip,
} from "@mui/material";
import {
  Close as CloseIcon,
  Add as AddIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  createCongViec,
  updateCongViec,
  getCongViecDetail,
} from "./congViecSlice";
import { getMyNhomViecs } from "../NhomViecUser/nhomViecUserSlice";

const priorityMapFE2BE = {
  Thấp: "THAP",
  "Bình thường": "BINH_THUONG",
  Cao: "CAO",
  "Rất cao": "KHAN_CAP",
};
const priorityMapBE2FE = {
  THAP: "Thấp",
  BINH_THUONG: "Bình thường",
  CAO: "Cao",
  KHAN_CAP: "Rất cao",
};
const statusMapFE2BE = {
  "Tạo mới": "TAO_MOI",
  "Đã giao": "DA_GIAO",
  "Đang thực hiện": "DANG_THUC_HIEN",
  "Chờ duyệt": "CHO_DUYET",
  "Hoàn thành": "HOAN_THANH",
};
const statusMapBE2FE = {
  TAO_MOI: "Tạo mới",
  DA_GIAO: "Đã giao",
  DANG_THUC_HIEN: "Đang thực hiện",
  CHO_DUYET: "Chờ duyệt",
  HOAN_THANH: "Hoàn thành",
};
const priorityOptions = ["Thấp", "Bình thường", "Cao", "Rất cao"];
const statusOptions = [
  "Tạo mới",
  "Đã giao",
  "Đang thực hiện",
  "Chờ duyệt",
  "Hoàn thành",
];

const CongViecFormDialog = ({
  open,
  onClose,
  congViec = null,
  isEdit = false,
  nhanVienId = null,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.congViec);
  const { managedEmployees } = useSelector((s) => s.nhanvienManagement);
  const { myNhomViecs } = useSelector((s) => s.nhomViecUser);
  const availableNhanViens = useMemo(
    () => managedEmployees || [],
    [managedEmployees]
  );
  const availableNhomViecs = useMemo(() => myNhomViecs || [], [myNhomViecs]);
  const [nguoiThamGia, setNguoiThamGia] = useState([]);
  const [selectedNguoiThamGia, setSelectedNguoiThamGia] = useState("");
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  const validationSchema = Yup.object({
    TieuDe: Yup.string().required("Bắt buộc").max(200, "Tối đa 200 ký tự"),
    MoTa: Yup.string().max(2000, "Tối đa 2000 ký tự"),
    NgayBatDau: Yup.mixed().required("Bắt buộc"),
    NgayHetHan: Yup.mixed()
      .required("Bắt buộc")
      .test(
        "is-after-start",
        "Ngày kết thúc phải sau ngày bắt đầu",
        function (value) {
          const { NgayBatDau } = this.parent;
          if (!NgayBatDau || !value) return true;
          return dayjs(value).isAfter(dayjs(NgayBatDau));
        }
      ),
    NgayCanhBao: Yup.mixed().when(["CanhBaoMode", "NgayBatDau", "NgayHetHan"], {
      is: (mode, start, end) => mode === "FIXED" && start && end,
      then: () =>
        Yup.mixed()
          .required("Bắt buộc khi chọn thời gian cố định")
          .test(
            "is-in-range",
            "Ngày cảnh báo phải trong khoảng từ ngày bắt đầu đến ngày kết thúc",
            function (value) {
              const { NgayBatDau, NgayHetHan } = this.parent;
              if (!value || !NgayBatDau || !NgayHetHan) return true;
              const warning = dayjs(value);
              return (
                warning.isAfter(dayjs(NgayBatDau).subtract(1, "day")) &&
                warning.isBefore(dayjs(NgayHetHan).add(1, "day"))
              );
            }
          ),
      otherwise: () => Yup.mixed().nullable(),
    }),
    CanhBaoSapHetHanPercent: Yup.number()
      .min(0.5, "Tối thiểu 50%")
      .max(1.0, "Tối đa 100%"),
    CanhBaoMode: Yup.string()
      .oneOf(["PERCENT", "FIXED"], "Chế độ cảnh báo không hợp lệ")
      .required("Bắt buộc"),
    MucDoUuTien: Yup.string().required("Bắt buộc"),
    NguoiChinh: Yup.string().required("Bắt buộc"),
    TienDo: Yup.number().min(0).max(100),
  });

  const formik = useFormik({
    initialValues: {
      TieuDe: "",
      MoTa: "",
      NgayBatDau: dayjs(),
      NgayHetHan: dayjs().add(7, "day"),
      MucDoUuTien: "Bình thường",
      TrangThai: "Tạo mới",
      NguoiChinh: nhanVienId || "",
      TienDo: 0,
      NhomViecUserID: "",
      CanhBaoMode: "PERCENT",
      CanhBaoSapHetHanPercent: 0.8,
      NgayCanhBao: null,
    },
    validationSchema,
    validateOnMount: true,
    onSubmit: async (values) => {
      try {
        console.log(
          "[CongViecFormDialog] Submitting create/update with values:",
          values
        );
        const data = {
          TieuDe: values.TieuDe,
          MoTa: values.MoTa,
          NgayBatDau: dayjs(values.NgayBatDau).toDate().toISOString(),
          NgayHetHan: dayjs(values.NgayHetHan).toDate().toISOString(),
          MucDoUuTien:
            priorityMapFE2BE[values.MucDoUuTien] || values.MucDoUuTien,
          TrangThai: statusMapFE2BE[values.TrangThai] || values.TrangThai,
          NguoiChinh: values.NguoiChinh,
          NhomViecUserID: values.NhomViecUserID || null,
          TienDo: values.TienDo,
          NguoiThamGia: nguoiThamGia.map((nv) => ({
            NhanVienID: nv._id,
            VaiTro: nv._id === values.NguoiChinh ? "CHINH" : "PHOI_HOP",
          })),
          // Cấu hình cảnh báo - đảm bảo luôn có giá trị hợp lệ
          CanhBaoMode: values.CanhBaoMode || "PERCENT",
          CanhBaoSapHetHanPercent: values.CanhBaoSapHetHanPercent || 0.8,
        };

        // Thêm NgayCanhBao nếu là mode FIXED
        if (
          (values.CanhBaoMode || "PERCENT") === "FIXED" &&
          values.NgayCanhBao
        ) {
          data.NgayCanhBao = dayjs(values.NgayCanhBao).toDate().toISOString();
        }
        // Đối với PERCENT mode, không gửi NgayCanhBao - backend sẽ tính tự động
        if (isEdit && congViec)
          await dispatch(updateCongViec({ id: congViec._id, data }));
        else await dispatch(createCongViec(data));
        handleClose();
      } catch (e) {
        console.error("Submit error", e);
      }
    },
  });

  useEffect(() => {
    if (open) dispatch(getMyNhomViecs());
  }, [open, dispatch]);
  useEffect(() => {
    if (!open || !isEdit || !congViec) return;
    formik.setValues((v) => ({
      ...v,
      TieuDe: congViec.TieuDe || "",
      MoTa: congViec.MoTa || "",
      NgayBatDau: congViec.NgayBatDau ? dayjs(congViec.NgayBatDau) : dayjs(),
      NgayHetHan: congViec.NgayHetHan
        ? dayjs(congViec.NgayHetHan)
        : dayjs().add(7, "day"),
      MucDoUuTien:
        priorityMapBE2FE[congViec.MucDoUuTien] ||
        congViec.MucDoUuTien ||
        "Bình thường",
      TrangThai:
        statusMapBE2FE[congViec.TrangThai] || congViec.TrangThai || "Tạo mới",
      NguoiChinh: congViec.NguoiChinhID || "",
      TienDo: congViec.TienDo || congViec.PhanTramTienDoTong || 0,
      NhomViecUserID:
        congViec.NhomViecUserID?._id || congViec.NhomViecUserID || "",
      CanhBaoMode: congViec.CanhBaoMode || "PERCENT",
      CanhBaoSapHetHanPercent: congViec.CanhBaoSapHetHanPercent || 0.8,
      NgayCanhBao: congViec.NgayCanhBao ? dayjs(congViec.NgayCanhBao) : null,
    }));
    const normalize = (arr) =>
      Array.isArray(arr)
        ? arr
            .map((nt) => {
              if (nt?.NhanVienID && typeof nt.NhanVienID === "object")
                return {
                  _id: nt.NhanVienID._id,
                  Ten: nt.NhanVienID.Ten,
                  KhoaID: nt.NhanVienID.KhoaID,
                };
              if (nt?.NhanVienID) {
                const f = availableNhanViens.find(
                  (x) => x._id === nt.NhanVienID
                );
                if (f) return f;
              }
              return null;
            })
            .filter(Boolean)
        : [];
    if (congViec.NguoiThamGia?.length)
      setNguoiThamGia(normalize(congViec.NguoiThamGia));
    else if (congViec._id) {
      (async () => {
        setLoadingParticipants(true);
        try {
          const detail = await dispatch(getCongViecDetail(congViec._id));
          if (detail?.NguoiThamGia)
            setNguoiThamGia(normalize(detail.NguoiThamGia));
          else setNguoiThamGia([]);
        } finally {
          setLoadingParticipants(false);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEdit, congViec, availableNhanViens, dispatch]);

  const handleAddNguoiThamGia = () => {
    if (!selectedNguoiThamGia) return;
    if (nguoiThamGia.find((p) => p._id === selectedNguoiThamGia)) return;
    const f = availableNhanViens.find((nv) => nv._id === selectedNguoiThamGia);
    if (f) setNguoiThamGia((prev) => [...prev, f]);
    setSelectedNguoiThamGia("");
  };
  const handleRemoveNguoiThamGia = (id) =>
    setNguoiThamGia((prev) => prev.filter((p) => p._id !== id));
  const handleClose = () => {
    onClose();
    formik.resetForm();
    setNguoiThamGia([]);
    setSelectedNguoiThamGia("");
    setLoadingParticipants(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        fullScreen={fullScreen}
        PaperProps={{ sx: { minHeight: "80vh" } }}
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {isEdit ? "Chỉnh sửa công việc" : "Tạo công việc mới"}
            </Typography>
            <IconButton size="small" onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Grid container spacing={2}>
              {isEdit ? (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Mã công việc"
                    value={congViec?.MaCongViec || "—"}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
              ) : (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Mã công việc sẽ được tạo tự động khi lưu.
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tiêu đề"
                  name="TieuDe"
                  value={formik.values.TieuDe}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.TieuDe && Boolean(formik.errors.TieuDe)}
                  helperText={formik.touched.TieuDe && formik.errors.TieuDe}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Mô tả"
                  name="MoTa"
                  value={formik.values.MoTa}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.MoTa && Boolean(formik.errors.MoTa)}
                  helperText={formik.touched.MoTa && formik.errors.MoTa}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Người thực hiện chính *</InputLabel>
                  <Select
                    name="NguoiChinh"
                    label="Người thực hiện chính *"
                    value={formik.values.NguoiChinh}
                    onChange={(e) => {
                      formik.setFieldValue("NguoiChinh", e.target.value);
                    }}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.NguoiChinh &&
                      Boolean(formik.errors.NguoiChinh)
                    }
                  >
                    {availableNhanViens.map((nv) => (
                      <MenuItem key={nv._id} value={nv._id}>
                        {nv.Ten} - {nv.KhoaID?.TenKhoa || "Chưa có khoa"}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {formik.touched.NguoiChinh && formik.errors.NguoiChinh && (
                  <Typography variant="caption" color="error">
                    {formik.errors.NguoiChinh}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Mức độ ưu tiên *</InputLabel>
                  <Select
                    name="MucDoUuTien"
                    label="Mức độ ưu tiên *"
                    value={formik.values.MucDoUuTien}
                    onChange={formik.handleChange}
                  >
                    {priorityOptions.map((o) => (
                      <MenuItem key={o} value={o}>
                        {o}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Nhóm việc</InputLabel>
                  <Select
                    name="NhomViecUserID"
                    label="Nhóm việc"
                    value={formik.values.NhomViecUserID}
                    onChange={formik.handleChange}
                    displayEmpty
                  >
                    <MenuItem value="">
                      <em>Không</em>
                    </MenuItem>
                    {availableNhomViecs.map((n) => (
                      <MenuItem key={n._id} value={n._id}>
                        {n.TenNhom}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="Ngày bắt đầu *"
                  value={formik.values.NgayBatDau}
                  onChange={(v) => formik.setFieldValue("NgayBatDau", v)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error:
                        formik.touched.NgayBatDau &&
                        Boolean(formik.errors.NgayBatDau),
                      helperText:
                        formik.touched.NgayBatDau && formik.errors.NgayBatDau,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="Ngày hết hạn *"
                  value={formik.values.NgayHetHan}
                  onChange={(v) => formik.setFieldValue("NgayHetHan", v)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error:
                        formik.touched.NgayHetHan &&
                        Boolean(formik.errors.NgayHetHan),
                      helperText:
                        formik.touched.NgayHetHan && formik.errors.NgayHetHan,
                    },
                  }}
                />
              </Grid>

              {/* Cấu hình cảnh báo */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Cấu hình cảnh báo
                  <Tooltip title="Thiết lập thời điểm nhận cảnh báo trước khi hết hạn">
                    <InfoIcon
                      sx={{ ml: 1, fontSize: 16, color: "text.secondary" }}
                    />
                  </Tooltip>
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                  <RadioGroup
                    name="CanhBaoMode"
                    value={formik.values.CanhBaoMode}
                    onChange={formik.handleChange}
                    row
                  >
                    <FormControlLabel
                      value="PERCENT"
                      control={<Radio />}
                      label="Theo phần trăm thời gian"
                    />
                    <FormControlLabel
                      value="FIXED"
                      control={<Radio />}
                      label="Thời gian cố định"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>

              {formik.values.CanhBaoMode === "PERCENT" ? (
                <Grid item xs={12} md={6}>
                  <Typography gutterBottom>
                    Cảnh báo khi còn{" "}
                    {Math.round(
                      (1 - formik.values.CanhBaoSapHetHanPercent) * 100
                    )}
                    % thời gian
                  </Typography>
                  <Slider
                    value={formik.values.CanhBaoSapHetHanPercent}
                    onChange={(e, value) =>
                      formik.setFieldValue("CanhBaoSapHetHanPercent", value)
                    }
                    min={0.5}
                    max={1.0}
                    step={0.05}
                    marks={[
                      { value: 0.5, label: "50%" },
                      { value: 0.8, label: "80%" },
                      { value: 1.0, label: "100%" },
                    ]}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                  />
                  {formik.values.NgayBatDau && formik.values.NgayHetHan && (
                    <Typography variant="caption" color="text.secondary">
                      Cảnh báo vào:{" "}
                      {dayjs(formik.values.NgayBatDau)
                        .add(
                          dayjs(formik.values.NgayHetHan).diff(
                            formik.values.NgayBatDau
                          ) * formik.values.CanhBaoSapHetHanPercent,
                          "millisecond"
                        )
                        .format("DD/MM/YYYY HH:mm")}
                    </Typography>
                  )}
                </Grid>
              ) : (
                <Grid item xs={12} md={6}>
                  <DateTimePicker
                    label="Thời gian cảnh báo"
                    value={formik.values.NgayCanhBao}
                    onChange={(v) => formik.setFieldValue("NgayCanhBao", v)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error:
                          formik.touched.NgayCanhBao &&
                          Boolean(formik.errors.NgayCanhBao),
                        helperText:
                          formik.touched.NgayCanhBao &&
                          formik.errors.NgayCanhBao,
                      },
                    }}
                  />
                </Grid>
              )}

              {isEdit && (
                <>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Trạng thái</InputLabel>
                      <Select
                        name="TrangThai"
                        label="Trạng thái"
                        value={formik.values.TrangThai}
                        onChange={formik.handleChange}
                      >
                        {statusOptions.map((s) => (
                          <MenuItem key={s} value={s}>
                            {s}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Tiến độ (%)"
                      name="TienDo"
                      value={formik.values.TienDo}
                      onChange={formik.handleChange}
                      inputProps={{ min: 0, max: 100 }}
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Người tham gia
                </Typography>
                <Box sx={{ mb: 1, display: "flex", gap: 1 }}>
                  <FormControl sx={{ minWidth: 250 }}>
                    <Select
                      size="small"
                      value={selectedNguoiThamGia}
                      onChange={(e) => setSelectedNguoiThamGia(e.target.value)}
                      displayEmpty
                      disabled={availableNhanViens.length === 0}
                    >
                      <MenuItem value="">
                        <em>Chọn nhân viên</em>
                      </MenuItem>
                      {availableNhanViens
                        .filter(
                          (nv) => !nguoiThamGia.find((p) => p._id === nv._id)
                        )
                        .map((nv) => (
                          <MenuItem key={nv._id} value={nv._id}>
                            {nv.Ten} - {nv.KhoaID?.TenKhoa || "Chưa có khoa"}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                  <IconButton
                    size="small"
                    onClick={handleAddNguoiThamGia}
                    disabled={!selectedNguoiThamGia}
                    color="primary"
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {loadingParticipants && (
                    <Typography variant="body2" color="text.secondary">
                      Đang tải người tham gia...
                    </Typography>
                  )}
                  {!loadingParticipants &&
                    nguoiThamGia.map((nv) => (
                      <Chip
                        key={nv._id}
                        label={`${nv.Ten} - ${
                          nv.KhoaID?.TenKhoa || "Chưa có khoa"
                        }`}
                        onDelete={() => handleRemoveNguoiThamGia(nv._id)}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  {!loadingParticipants && nguoiThamGia.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Chưa có người tham gia
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleClose}>Hủy</Button>
            <Button
              type="button"
              variant="contained"
              disabled={(function () {
                const hasBlockingErrors =
                  Boolean(formik.errors.TieuDe) ||
                  Boolean(formik.errors.NgayBatDau) ||
                  Boolean(formik.errors.NgayHetHan) ||
                  (formik.values.CanhBaoMode === "FIXED" &&
                    Boolean(formik.errors.NgayCanhBao));
                const missingRequired =
                  !formik.values.TieuDe ||
                  !formik.values.NguoiChinh ||
                  !formik.values.NgayBatDau ||
                  !formik.values.NgayHetHan ||
                  !formik.values.CanhBaoMode ||
                  (formik.values.CanhBaoMode === "FIXED" &&
                    !formik.values.NgayCanhBao);
                return (
                  loading ||
                  formik.isSubmitting ||
                  hasBlockingErrors ||
                  missingRequired
                );
              })()}
              onClick={async () => {
                // Explicitly validate and surface errors, then submit if valid
                const errors = await formik.validateForm();
                if (errors && Object.keys(errors).length > 0) {
                  const touched = Object.keys(errors).reduce((acc, key) => {
                    acc[key] = true;
                    return acc;
                  }, {});
                  formik.setTouched(touched, false);
                  console.warn("[CongViecFormDialog] Form invalid:", errors);
                  return;
                }
                console.log(
                  "[CongViecFormDialog] Submit button clicked: submitting form"
                );
                formik.submitForm();
              }}
            >
              {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
};

export default CongViecFormDialog;
