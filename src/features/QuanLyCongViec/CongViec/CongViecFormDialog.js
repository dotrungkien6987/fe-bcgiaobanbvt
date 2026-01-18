import React, { useState, useEffect, useMemo } from "react";
import {
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
  useTheme,
  useMediaQuery,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  Slider,
  Tooltip,
  Checkbox,
  LinearProgress,
  Stack,
  CircularProgress,
} from "@mui/material";
import { Autocomplete } from "@mui/material";
import { Info as InfoIcon, Check as CheckIcon } from "@mui/icons-material";
import BottomSheetDialog from "components/BottomSheetDialog";
import { computeExtendedDueStatus as computeDueStatus } from "../../../utils/congViecUtils";
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
  createSubtask,
  updateSubtask,
} from "./congViecSlice";
import apiService from "app/apiService"; // dùng cho fetch nhẹ khi tránh ghi đè global
import { getMyNhomViecs } from "../NhomViecUser/nhomViecUserSlice";
import { getNhanVienCoTheGiaoViec } from "../KPI/kpiSlice";
import { useAuth } from "contexts/AuthContext";

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
// Status maps kept only for display (form no longer edits TrangThai)
const statusMapBE2FE = {
  TAO_MOI: "Tạo mới",
  DA_GIAO: "Đã giao",
  DANG_THUC_HIEN: "Đang thực hiện",
  CHO_DUYET: "Chờ duyệt",
  HOAN_THANH: "Hoàn thành",
};
const priorityOptions = ["Thấp", "Bình thường", "Cao", "Rất cao"];

const priorityColorMap = {
  Thấp: "default",
  "Bình thường": "primary",
  Cao: "warning",
  "Rất cao": "error",
};

const statusColorMap = {
  TAO_MOI: "default",
  DA_GIAO: "info",
  DANG_THUC_HIEN: "primary",
  CHO_DUYET: "warning",
  HOAN_THANH: "success",
};

const CongViecFormDialog = ({
  open,
  onClose,
  congViec = null,
  isEdit = false,
  nhanVienId = null,
  parentId = null,
  skipGlobalDetailFetch = false, // tránh ghi đè congViecDetail cha khi edit subtask
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useDispatch();
  const { user } = useAuth(); // Lấy user hiện tại từ AuthContext
  const { loading, error } = useSelector((s) => s.congViec);
  const {
    nhanVienDuocQuanLy,
    isLoading: loadingNhanVien,
    error: errorNhanVien,
  } = useSelector((s) => s.kpi);
  const { myNhomViecs } = useSelector((s) => s.nhomViecUser);

  // Extract NhanVienID từ user hiện tại
  const currentNhanVienId = useMemo(() => {
    if (!user) return null;
    // User.NhanVienID là reference đến NhanVien._id
    return user.NhanVienID;
  }, [user]);

  // Tìm currentManager từ danh sách nhanVienDuocQuanLy
  const currentManager = useMemo(() => {
    if (!currentNhanVienId || !nhanVienDuocQuanLy) return null;
    return nhanVienDuocQuanLy.find(
      (nv) => String(nv._id) === String(currentNhanVienId)
    );
  }, [currentNhanVienId, nhanVienDuocQuanLy]);

  const availableNhanViens = useMemo(
    () => nhanVienDuocQuanLy || [],
    [nhanVienDuocQuanLy]
  );
  // Danh sách lựa chọn Người chính: inject currentManager nếu chưa có trong managedEmployees
  const mainOptions = useMemo(() => {
    const base = availableNhanViens || [];
    if (currentManager?._id) {
      const exists = base.some(
        (nv) => String(nv._id) === String(currentManager._id)
      );
      return exists ? base : [...base, currentManager];
    }
    return base;
  }, [availableNhanViens, currentManager]);
  const availableNhomViecs = useMemo(() => myNhomViecs || [], [myNhomViecs]);
  // Danh sách người phối hợp (không bao gồm người chính)
  const [nguoiThamGia, setNguoiThamGia] = useState([]);
  // Deprecated state (legacy select); no longer needed after Autocomplete multiple refactor
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [assigning] = useState(false); // local state for Lưu & giao việc flow

  // Map trạng thái hạn cho preview & helper tính
  const previewStatusChip = {
    DUNG_HAN: { label: "Đúng hạn", color: "success" },
    SAP_QUA_HAN: { label: "Sắp quá hạn", color: "warning" },
    QUA_HAN: { label: "Quá hạn", color: "error" },
    HOAN_THANH_DUNG_HAN: { label: "Hoàn thành đúng hạn", color: "success" },
    HOAN_THANH_TRE_HAN: { label: "Hoàn thành trễ", color: "error" },
  };
  const deriveDuePreview = (start, end, mode, percent, fixedWarn) => {
    if (!start || !end) return null;
    const s = dayjs(start);
    const e = dayjs(end);
    if (!e.isAfter(s)) return { invalidRange: true };
    let warnAt = null;
    if (mode === "PERCENT") {
      const totalMs = e.diff(s);
      warnAt = s.add(totalMs * (percent || 0.8), "millisecond");
    } else if (mode === "FIXED" && fixedWarn) warnAt = dayjs(fixedWarn);
    const fake = {
      TrangThai: "TAO_MOI",
      NgayBatDau: s.toISOString(),
      NgayHetHan: e.toISOString(),
      NgayCanhBao: warnAt ? warnAt.toISOString() : null,
    };
    const now = dayjs();
    return {
      status: computeDueStatus(fake),
      warnAt,
      hoursLeft: e.diff(now, "hour", true),
      invalidRange: false,
    };
  };

  // Helper to assemble payload from form values & local participants
  const buildPayload = (values) => {
    const mainId = values.NguoiChinh;
    // Lọc bỏ nếu người phối hợp trùng người chính và loại duplicate
    const seen = new Set();
    const collaborators = nguoiThamGia.filter((nv) => {
      if (!nv?._id || nv._id === mainId) return false;
      if (seen.has(nv._id)) return false;
      seen.add(nv._id);
      return true;
    });
    const participantsPayload = [
      ...(mainId
        ? [
            {
              NhanVienID: mainId,
              VaiTro: "CHINH",
            },
          ]
        : []),
      ...collaborators.map((nv) => ({
        NhanVienID: nv._id,
        VaiTro: "PHOI_HOP",
      })),
    ];
    const data = {
      TieuDe: values.TieuDe,
      MoTa: values.MoTa,
      NgayBatDau: dayjs(values.NgayBatDau).toISOString(),
      NgayHetHan: dayjs(values.NgayHetHan).toISOString(),
      MucDoUuTien: priorityMapFE2BE[values.MucDoUuTien] || values.MucDoUuTien,
      NguoiChinh: mainId,
      NhomViecUserID: values.NhomViecUserID || null,
      NguoiThamGia: participantsPayload,
      CanhBaoMode: values.CanhBaoMode || "PERCENT",
      CanhBaoSapHetHanPercent: values.CanhBaoSapHetHanPercent || 0.8,
      CoDuyetHoanThanh: values.CoDuyetHoanThanh || false,
    };
    if ((values.CanhBaoMode || "PERCENT") === "FIXED" && values.NgayCanhBao) {
      data.NgayCanhBao = dayjs(values.NgayCanhBao).toISOString();
    }
    return data;
  };

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
      .max(0.99, "Tối đa 99%"),
    CanhBaoMode: Yup.string()
      .oneOf(["PERCENT", "FIXED"], "Chế độ cảnh báo không hợp lệ")
      .required("Bắt buộc"),
    MucDoUuTien: Yup.string().required("Bắt buộc"),
    NguoiChinh: Yup.string().required("Bắt buộc"),
    TienDo: Yup.number().min(0).max(100),
    CoDuyetHoanThanh: Yup.boolean().optional(),
  });

  const formik = useFormik({
    initialValues: {
      TieuDe: "",
      MoTa: "",
      NgayBatDau: dayjs(),
      NgayHetHan: dayjs().add(7, "day"),
      MucDoUuTien: "Bình thường",
      TrangThai: "Tạo mới", // read-only when editing
      NguoiChinh: nhanVienId || currentNhanVienId || "",
      TienDo: 0,
      NhomViecUserID: "",
      CanhBaoMode: "PERCENT",
      CanhBaoSapHetHanPercent: 0.8,
      NgayCanhBao: null,
      CoDuyetHoanThanh: false,
    },
    validationSchema,
    validateOnMount: true,
    onSubmit: async (values) => {
      try {
        console.log(
          "[CongViecFormDialog] Submitting create/update with values:",
          values
        );
        const data = buildPayload(values);
        if (isEdit && congViec) {
          // Nếu là subtask editing (skipGlobalDetailFetch=true) dùng updateSubtask để tránh đụng global isLoading
          if (skipGlobalDetailFetch) {
            await dispatch(updateSubtask(congViec._id, data));
          } else {
            await dispatch(updateCongViec({ id: congViec._id, data }));
          }
        } else if (parentId) {
          await dispatch(createSubtask(parentId, data));
        } else {
          await dispatch(createCongViec(data));
        }
        handleClose();
      } catch (e) {
        console.error("Submit error", e);
      }
    },
  });

  // Load danh sách nhóm việc và nhân viên khi mở dialog
  useEffect(() => {
    if (open) {
      dispatch(getMyNhomViecs());

      // Load danh sách nhân viên có thể giao việc (merge cả KPI + Giao_Viec)
      // Chỉ load nếu chưa có (tránh vòng lặp vô hạn)
      if (!nhanVienDuocQuanLy || nhanVienDuocQuanLy.length === 0) {
        dispatch(getNhanVienCoTheGiaoViec());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dispatch]); // Bỏ nhanVienDuocQuanLy khỏi dependency để tránh vòng lặp

  // Nếu mở dialog và chưa có NguoiChinh nhưng currentManager tồn tại, set mặc định
  useEffect(() => {
    if (open && !isEdit && !formik.values.NguoiChinh && currentNhanVienId) {
      formik.setFieldValue("NguoiChinh", currentNhanVienId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEdit, currentNhanVienId]);
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
      CoDuyetHoanThanh: congViec.CoDuyetHoanThanh ?? false,
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
    if (congViec.NguoiThamGia?.length) {
      const raw = normalize(congViec.NguoiThamGia);
      // Chỉ giữ người phối hợp (PHOI_HOP), loại người chính
      setNguoiThamGia(
        raw.filter(
          (nv) =>
            nv?._id && nv._id !== (congViec.NguoiChinhID || congViec.NguoiChinh)
        )
      );
    } else if (congViec._id && !skipGlobalDetailFetch) {
      (async () => {
        setLoadingParticipants(true);
        try {
          const detail = await dispatch(getCongViecDetail(congViec._id));
          if (detail?.NguoiThamGia) {
            const raw = normalize(detail.NguoiThamGia);
            setNguoiThamGia(
              raw.filter(
                (nv) =>
                  nv?._id &&
                  nv._id !==
                    (congViec.NguoiChinhID ||
                      congViec.NguoiChinh ||
                      formik.values.NguoiChinh)
              )
            );
          } else setNguoiThamGia([]);
        } finally {
          setLoadingParticipants(false);
        }
      })();
    } else if (congViec._id && skipGlobalDetailFetch) {
      // Fetch nhẹ chi tiết subtask nếu thiếu các field dài (MoTa) mà không dispatch vào store global
      (async () => {
        const needFetch = !congViec.MoTa || congViec.NguoiThamGia == null;
        if (!needFetch) return;
        setLoadingParticipants(true);
        try {
          const res = await apiService.get(
            `/workmanagement/congviec/detail/${congViec._id}`
          );
          const detail = res?.data?.data;
          if (detail?.MoTa && !congViec.MoTa) {
            formik.setFieldValue("MoTa", detail.MoTa);
          }
          if (Array.isArray(detail?.NguoiThamGia)) {
            const raw = normalize(detail.NguoiThamGia);
            setNguoiThamGia(
              raw.filter(
                (nv) =>
                  nv?._id &&
                  nv._id !==
                    (congViec.NguoiChinhID ||
                      congViec.NguoiChinh ||
                      formik.values.NguoiChinh)
              )
            );
          }
        } catch (_) {
          // ignore lightweight fetch errors
        } finally {
          setLoadingParticipants(false);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    open,
    isEdit,
    congViec,
    availableNhanViens,
    dispatch,
    skipGlobalDetailFetch,
  ]);

  // (Handlers cho select cũ đã bỏ; logic quản lý người phối hợp nằm trong Autocomplete multiple)
  const handleClose = () => {
    onClose();
    formik.resetForm();
    setNguoiThamGia([]);
    setLoadingParticipants(false);
  };

  // Derived preview + counters
  const duePreview = deriveDuePreview(
    formik.values.NgayBatDau,
    formik.values.NgayHetHan,
    formik.values.CanhBaoMode,
    formik.values.CanhBaoSapHetHanPercent,
    formik.values.NgayCanhBao
  );
  const titleLen = formik.values.TieuDe?.length || 0;
  const descLen = formik.values.MoTa?.length || 0;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <BottomSheetDialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullScreen={fullScreen}
        title={
          isEdit
            ? "Chỉnh sửa công việc"
            : parentId
            ? "Tạo công việc con"
            : "Tạo công việc mới"
        }
        actions={
          <>
            <Button onClick={handleClose} disabled={formik.isSubmitting}>
              Hủy
            </Button>
            <Button
              variant="contained"
              disabled={(() => {
                const hasBlockingErrors =
                  formik.touched.TieuDe && formik.errors.TieuDe;
                const missingRequired = !formik.values.NguoiChinh;
                return (
                  loading || assigning || hasBlockingErrors || missingRequired
                );
              })()}
              onClick={async () => {
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
              {loading
                ? "Đang lưu..."
                : isEdit
                ? "Cập nhật"
                : parentId
                ? "Tạo subtask"
                : "Tạo mới"}
            </Button>
          </>
        }
      >
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ position: "relative" }}>
            {(assigning || formik.isSubmitting) && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  bgcolor: "rgba(255,255,255,0.55)",
                  backdropFilter: "blur(1px)",
                  zIndex: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CircularProgress />
              </Box>
            )}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {errorNhanVien && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Không thể tải danh sách nhân viên: {errorNhanVien}
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
                    Mã công việc sẽ được tạo tự động khi lưu .
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tiêu đề"
                  name="TieuDe"
                  value={formik.values.TieuDe}
                  onChange={(e) =>
                    e.target.value.length <= 200 && formik.handleChange(e)
                  }
                  onBlur={formik.handleBlur}
                  error={formik.touched.TieuDe && Boolean(formik.errors.TieuDe)}
                  helperText={
                    (formik.touched.TieuDe && formik.errors.TieuDe) ||
                    `${titleLen}/200`
                  }
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
                  onChange={(e) =>
                    e.target.value.length <= 2000 && formik.handleChange(e)
                  }
                  onBlur={formik.handleBlur}
                  error={formik.touched.MoTa && Boolean(formik.errors.MoTa)}
                  helperText={
                    (formik.touched.MoTa && formik.errors.MoTa) ||
                    `${descLen}/2000`
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={mainOptions}
                  loading={loadingNhanVien}
                  value={
                    mainOptions.find(
                      (nv) => nv._id === formik.values.NguoiChinh
                    ) || null
                  }
                  onChange={(_, val) => {
                    formik.setFieldValue("NguoiChinh", val?._id || "");
                    // loại người chính khỏi danh sách phối hợp nếu trùng
                    if (val?._id) {
                      setNguoiThamGia((prev) =>
                        prev.filter((p) => p._id !== val._id)
                      );
                    }
                  }}
                  getOptionLabel={(o) => {
                    if (!o?.Ten) return "";
                    const dept = o.KhoaID?.TenKhoa || "Chưa có khoa";
                    const isCurrent =
                      currentNhanVienId && o._id === currentNhanVienId;
                    return `${o.Ten} - ${dept}${isCurrent ? " (Bạn)" : ""}`;
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Người thực hiện chính *"
                      error={
                        formik.touched.NguoiChinh &&
                        Boolean(formik.errors.NguoiChinh)
                      }
                      helperText={
                        formik.touched.NguoiChinh && formik.errors.NguoiChinh
                      }
                    />
                  )}
                  fullWidth
                  disableClearable={false}
                  isOptionEqualToValue={(o, v) => o._id === v._id}
                  noOptionsText={
                    loadingNhanVien
                      ? "Đang tải danh sách nhân viên..."
                      : availableNhanViens.length === 0
                      ? "Không có nhân viên nào. Vui lòng liên hệ quản trị viên."
                      : "Không có nhân viên"
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Mức độ ưu tiên
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  role="radiogroup"
                  aria-label="Mức độ ưu tiên"
                >
                  {priorityOptions.map((p) => {
                    const selected = formik.values.MucDoUuTien === p;
                    return (
                      <Chip
                        key={p}
                        label={p}
                        color={
                          selected
                            ? priorityColorMap[p] || "primary"
                            : undefined
                        }
                        variant={selected ? "filled" : "outlined"}
                        size={selected ? "medium" : "small"}
                        icon={
                          selected ? <CheckIcon fontSize="small" /> : undefined
                        }
                        onClick={() => formik.setFieldValue("MucDoUuTien", p)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            formik.setFieldValue("MucDoUuTien", p);
                          }
                        }}
                        role="radio"
                        aria-checked={selected}
                        sx={{
                          cursor: "pointer",
                          fontWeight: selected ? 600 : 400,
                          boxShadow: selected ? 2 : "none",
                          opacity: selected ? 1 : 0.6,
                          transition: "all .15s",
                        }}
                      />
                    );
                  })}
                </Stack>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.5, display: "block" }}
                >
                  Nhấn để chọn. Màu & dấu tick hiển thị mức được chọn.
                </Typography>
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

              <Grid item xs={12}>
                {duePreview && !duePreview.invalidRange && (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      alignItems: "center",
                      p: 1,
                      border: "1px dashed",
                      borderColor: "divider",
                      borderRadius: 1,
                      bgcolor: "background.default",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mr: 1 }}
                    >
                      Tình trạng hạn (dự kiến):
                    </Typography>
                    <Chip
                      size="small"
                      label={previewStatusChip[duePreview.status]?.label || "—"}
                      color={
                        previewStatusChip[duePreview.status]?.color || "default"
                      }
                      sx={{ fontWeight: 600 }}
                    />
                    {duePreview.warnAt && (
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`Cảnh báo: ${duePreview.warnAt.format(
                          "DD/MM HH:mm"
                        )}`}
                      />
                    )}
                    <Chip
                      size="small"
                      variant="outlined"
                      color={duePreview.hoursLeft < 0 ? "error" : "default"}
                      label={
                        duePreview.hoursLeft >= 0
                          ? `Còn ~${duePreview.hoursLeft.toFixed(1)}h`
                          : `Quá hạn ${Math.abs(duePreview.hoursLeft).toFixed(
                              1
                            )}h`
                      }
                    />
                  </Box>
                )}
                {duePreview?.invalidRange && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    Ngày kết thúc phải sau ngày bắt đầu để tính tình trạng hạn.
                  </Alert>
                )}
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
                    max={0.99}
                    step={0.01}
                    marks={[
                      { value: 0.5, label: "50%" },
                      { value: 0.8, label: "80%" },
                      { value: 0.95, label: "95%" },
                    ]}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                  />
                  {formik.values.NgayBatDau &&
                    formik.values.NgayHetHan &&
                    (() => {
                      const start = dayjs(formik.values.NgayBatDau);
                      const end = dayjs(formik.values.NgayHetHan);
                      const warnMoment = start.add(
                        end.diff(start) * formik.values.CanhBaoSapHetHanPercent,
                        "millisecond"
                      );
                      const hoursBefore = end
                        .diff(warnMoment, "hour", true)
                        .toFixed(1);
                      return (
                        <>
                          <Typography variant="caption" color="text.secondary">
                            Cảnh báo vào:{" "}
                            {warnMoment.format("DD/MM/YYYY HH:mm")} (còn ~
                            {hoursBefore} giờ tới hạn)
                          </Typography>
                          {formik.values.CanhBaoSapHetHanPercent >= 0.95 && (
                            <Alert severity="warning" sx={{ mt: 0.5 }}>
                              Cảnh báo quá sát hạn (≥95%). Nên chọn sớm hơn để
                              có thời gian xử lý.
                            </Alert>
                          )}
                        </>
                      );
                    })()}
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
              {formik.values.CanhBaoMode === "FIXED" &&
                formik.values.NgayCanhBao &&
                formik.values.NgayHetHan &&
                dayjs(formik.values.NgayCanhBao).isAfter(
                  dayjs(formik.values.NgayHetHan).subtract(2, "hour")
                ) && (
                  <Grid item xs={12}>
                    <Alert severity="warning">
                      Thời điểm cảnh báo đang quá sát hạn (&lt; 2 giờ trước hết
                      hạn). Nên đặt sớm hơn để có thời gian xử lý.
                    </Alert>
                  </Grid>
                )}
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.CoDuyetHoanThanh}
                      onChange={(e) =>
                        formik.setFieldValue(
                          "CoDuyetHoanThanh",
                          e.target.checked
                        )
                      }
                    />
                  }
                  label={
                    <Tooltip title="Nếu bật: khi người thực hiện hoàn thành, công việc sẽ chờ duyệt trước khi hoàn tất.">
                      <span>Yêu cầu duyệt khi hoàn thành</span>
                    </Tooltip>
                  }
                />
              </Grid>

              {isEdit && (
                <>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Trạng thái hiện tại
                    </Typography>
                    <Chip
                      label={formik.values.TrangThai}
                      color={statusColorMap[congViec?.TrangThai] || "default"}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Tiến độ
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Number(formik.values.TienDo) || 0}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ minWidth: 40 }}>
                        {(Number(formik.values.TienDo) || 0).toFixed(0)}%
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Tiến độ được cập nhật ở màn khác.
                    </Typography>
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Người phối hợp
                </Typography>
                <Autocomplete
                  multiple
                  options={availableNhanViens.filter(
                    (nv) => nv._id !== formik.values.NguoiChinh
                  )}
                  value={nguoiThamGia.filter(
                    (nv) => nv._id !== formik.values.NguoiChinh
                  )}
                  onChange={(_, vals) => {
                    setNguoiThamGia(vals);
                  }}
                  getOptionLabel={(o) =>
                    o?.Ten
                      ? `${o.Ten} - ${o.KhoaID?.TenKhoa || "Chưa có khoa"}`
                      : ""
                  }
                  isOptionEqualToValue={(o, v) => o._id === v._id}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Chọn người phối hợp" />
                  )}
                  noOptionsText="Không có nhân viên"
                  loading={loadingParticipants}
                  fullWidth
                />
                {loadingParticipants && (
                  <Typography variant="caption" color="text.secondary">
                    Đang tải người phối hợp...
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        </form>
      </BottomSheetDialog>
    </LocalizationProvider>
  );
};

export default CongViecFormDialog;
