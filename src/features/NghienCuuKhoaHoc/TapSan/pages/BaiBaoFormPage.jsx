import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Stack,
  MenuItem,
  Breadcrumbs,
  Link,
  Alert,
  Paper,
  IconButton,
  Divider,
  Chip,
} from "@mui/material";
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Article as ArticleIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  createBaiBao as createBaiBaoThunk,
  updateBaiBao as updateBaiBaoThunk,
  fetchBaiBaoById,
  selectBaiBaoById,
} from "../slices/baiBaoSlice";
import { fetchTapSanById, selectTapSanById } from "../slices/tapSanSlice";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import FormProvider from "components/form/FormProvider";
import FTextField from "components/form/FTextField";
import FRadioGroup from "components/form/FRadioGroup";
import FAutocomplete from "components/form/FAutocomplete";
import { getDataFix } from "features/NhanVien/nhanvienSlice";
import { getAllNhanVien } from "features/NhanVien/nhanvienSlice";
import AuthorsSelectorDialog from "../components/AuthorsSelectorDialog";
import ReviewerSelectorDialog from "../components/ReviewerSelectorDialog";

export default function BaiBaoFormPage() {
  const { tapSanId, baiBaoId } = useParams();
  const navigate = useNavigate();
  const isEdit = !!baiBaoId;
  const dispatch = useDispatch();
  const baiBaoFromStore = useSelector((state) =>
    isEdit ? selectBaiBaoById(state, baiBaoId) : null
  );

  const tapSan = useSelector((state) => selectTapSanById(state, tapSanId));
  const [loading, setLoading] = React.useState(false);
  const [submitLoading, setSubmitLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [success, setSuccess] = React.useState(null);
  const nhanviens = useSelector((s) => s.nhanvien?.nhanviens || []);

  // DataFix lists
  const { LoaiHinhYHTH = [], ChuyenDeTTT = [] } = useSelector(
    (s) => s.nhanvien || {}
  );

  const schema = Yup.object().shape({
    LoaiTapSan: Yup.string().oneOf(["YHTH", "TTT"]).required(),
    TieuDe: Yup.string().required("Tiêu đề là bắt buộc"),
    TomTat: Yup.string().nullable(),
    // Loại hình: free text (nullable)
    LoaiHinh: Yup.string()
      .nullable()
      .transform((v) => (v === "" ? null : v))
      .notRequired(),
    // Nội dung chuyên đề: không bắt buộc (mới)
    NoiDungChuyenDe: Yup.string()
      .nullable()
      .transform((v) => (v === "" ? null : v))
      .notRequired(),
    // Nguồn tài liệu tham khảo: không bắt buộc; nếu nhập phải là URL hợp lệ
    // NguonTaiLieuThamKhao: Yup.string()
    //   .transform((v) => (v === "" ? null : v))
    //   .nullable()
    //   .notRequired()
    //   .url("Nguồn tài liệu phải là đường dẫn hợp lệ"),
    KhoiChuyenMon: Yup.mixed()
      .transform((v) => (v === "" ? null : v))
      .oneOf(["noi", "ngoai", "dieu-duong", "phong-ban", "can-lam-sang", null])
      .nullable()
      .notRequired(),
    SoThuTu: Yup.number()
      .typeError("Số thứ tự phải là số")
      .integer("Số thứ tự phải là số nguyên")
      .min(1, "Số thứ tự phải >= 1")
      .required("Số thứ tự là bắt buộc"),
    TacGiaLoai: Yup.string()
      .oneOf(["noi-vien", "ngoai-vien"])
      .required("Vui lòng chọn nguồn tác giả"),
    TacGiaChinhID: Yup.string().when("TacGiaLoai", {
      is: "noi-vien",
      then: (s) => s.required("Chọn tác giả chính"),
      otherwise: (s) => s.notRequired().nullable(),
    }),
    TacGiaNgoaiVien: Yup.string().when("TacGiaLoai", {
      is: "ngoai-vien",
      then: (s) => s.required("Nhập tên tác giả ngoại viện"),
      otherwise: (s) => s.notRequired().nullable(),
    }),
    NguoiThamDinhID: Yup.string().nullable(),
    DongTacGiaIDs: Yup.array()
      .of(Yup.string())
      .when("TacGiaLoai", {
        is: "noi-vien",
        then: (s) =>
          s.test(
            "no-dup-main",
            "Không được chọn trùng với tác giả chính",
            function (arr) {
              if (!arr || arr.length === 0) return true;
              const main = this.parent.TacGiaChinhID;
              return !arr.includes(main);
            }
          ),
        otherwise: (s) => s.transform(() => []).default([]),
      }),
    GhiChu: Yup.string().nullable(),
  });

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      LoaiTapSan: "",
      TieuDe: "",
      TomTat: "",
      LoaiHinh: "",
      NoiDungChuyenDe: "",
      NguonTaiLieuThamKhao: "",
      KhoiChuyenMon: "",
      SoThuTu: "",
      TacGiaLoai: "noi-vien",
      TacGiaChinhID: "",
      TacGiaNgoaiVien: "",
      NguoiThamDinhID: "",
      DongTacGiaIDs: [],
      GhiChu: "",
    },
  });
  const { handleSubmit, reset, watch, setValue } = methods;
  const values = watch();
  // sync LoaiTapSan from TapSan
  React.useEffect(() => {
    if (tapSan?.Loai) {
      setValue("LoaiTapSan", tapSan.Loai, { shouldValidate: true });
    }
  }, [tapSan, setValue]);
  const mainId = watch("TacGiaChinhID");
  const coIds = watch("DongTacGiaIDs");
  const [openAuthors, setOpenAuthors] = React.useState(false);
  const [openReviewer, setOpenReviewer] = React.useState(false);
  const getName = (id) => nhanviens.find((x) => x._id === id)?.Ten || id;

  const loadTapSan = React.useCallback(async () => {
    try {
      await dispatch(fetchTapSanById(tapSanId)).unwrap();
    } catch (error) {
      console.error("Error loading TapSan:", error);
      setError("Không thể tải thông tin tập san");
    }
  }, [tapSanId, dispatch]);

  const loadBaiBao = React.useCallback(async () => {
    if (!isEdit) return;

    try {
      setLoading(true);
      const data =
        baiBaoFromStore || (await dispatch(fetchBaiBaoById(baiBaoId)).unwrap());
      const getId = (v) => (v && typeof v === "object" && v._id ? v._id : v);
      // Do NOT derive LoaiTapSan here to avoid coupling with tapSan changes.
      // LoaiTapSan is synced via a separate effect from tapSan.
      reset({
        LoaiTapSan: methods.getValues("LoaiTapSan"),
        TieuDe: data.TieuDe || "",
        TomTat: data.TomTat || "",
        LoaiHinh: data.LoaiHinh || "",
        NoiDungChuyenDe: data.NoiDungChuyenDe || "",
        NguonTaiLieuThamKhao: data.NguonTaiLieuThamKhao || "",
        KhoiChuyenMon: data.KhoiChuyenMon || "",
        SoThuTu: data.SoThuTu || "",
        TacGiaLoai:
          data.TacGiaLoai || (data.TacGiaNgoaiVien ? "ngoai-vien" : "noi-vien"),
        TacGiaChinhID: getId(data.TacGiaChinhID) || "",
        TacGiaNgoaiVien: data.TacGiaNgoaiVien || "",
        NguoiThamDinhID: getId(data.NguoiThamDinhID) || "",
        DongTacGiaIDs: Array.isArray(data.DongTacGiaIDs)
          ? data.DongTacGiaIDs.map(getId)
          : [],
        GhiChu: data.GhiChu || "",
      });
    } catch (error) {
      console.error("Error loading BaiBao:", error);
      setError("Không thể tải thông tin bài báo");
    } finally {
      setLoading(false);
    }
  }, [isEdit, baiBaoId, dispatch, baiBaoFromStore, reset, methods]);

  // Fetch TapSan once per id change
  React.useEffect(() => {
    loadTapSan();
  }, [loadTapSan]);

  // Load BaiBao data (edit mode only)
  React.useEffect(() => {
    loadBaiBao();
  }, [loadBaiBao]);

  // Load NhanVien list once
  React.useEffect(() => {
    if (!nhanviens || nhanviens.length === 0) {
      dispatch(getAllNhanVien());
    }
    // Ensure DataFix is loaded for Autocomplete options
    if (!LoaiHinhYHTH?.length || !ChuyenDeTTT?.length) {
      dispatch(getDataFix());
    }
  }, [dispatch, nhanviens, LoaiHinhYHTH?.length, ChuyenDeTTT?.length]);

  const onSubmit = async (data) => {
    try {
      setSubmitLoading(true);
      setError(null);
      const normId = (v) => (v && typeof v === "object" && v._id ? v._id : v);
      const payloadRaw = { ...data, TapSanId: tapSanId };
      // Normalize payload by author mode and TapSan type for BE
      if (payloadRaw.TacGiaLoai === "ngoai-vien") {
        payloadRaw.TacGiaChinhID = undefined;
        payloadRaw.DongTacGiaIDs = [];
      } else {
        payloadRaw.TacGiaNgoaiVien = undefined;
        payloadRaw.TacGiaChinhID = normId(payloadRaw.TacGiaChinhID);
        payloadRaw.DongTacGiaIDs = Array.isArray(payloadRaw.DongTacGiaIDs)
          ? payloadRaw.DongTacGiaIDs.map(normId)
          : [];
      }
      payloadRaw.NguoiThamDinhID = payloadRaw.NguoiThamDinhID
        ? normId(payloadRaw.NguoiThamDinhID)
        : null;
      // Clean fields depending on TapSan type
      if (payloadRaw.LoaiTapSan === "TTT") {
        payloadRaw.LoaiHinh = undefined;
      } else if (payloadRaw.LoaiTapSan === "YHTH") {
        payloadRaw.NoiDungChuyenDe = undefined;
        // Cho phép NguonTaiLieuThamKhao đối với YHTH (không xóa)
      }
      // Normalize optional fields to null when empty
      if (!payloadRaw.KhoiChuyenMon) payloadRaw.KhoiChuyenMon = null;
      const { LoaiTapSan, ...payload } = payloadRaw; // remove helper field
      let result;
      if (isEdit) {
        result = await dispatch(
          updateBaiBaoThunk({ id: baiBaoId, payload })
        ).unwrap();
        setSuccess("Cập nhật bài báo thành công");
      } else {
        result = await dispatch(
          createBaiBaoThunk({ tapSanId, payload })
        ).unwrap();
        setSuccess("Tạo bài báo thành công");
      }
      setTimeout(() => {
        navigate(`/tapsan/${tapSanId}/baibao/${result._id || baiBaoId}`);
      }, 1200);
    } catch (error) {
      console.error("Error saving BaiBao:", error);
      setError(
        error?.response?.data?.message || "Có lỗi xảy ra khi lưu bài báo"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/tapsan/${tapSanId}/baibao`);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  const isTapSanReady = !!tapSan?.Loai;

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          color="inherit"
          href="/tapsan"
          onClick={(e) => {
            e.preventDefault();
            navigate("/tapsan");
          }}
        >
          Tập san
        </Link>
        <Link
          color="inherit"
          href={`/tapsan/${tapSanId}/baibao`}
          onClick={(e) => {
            e.preventDefault();
            navigate(`/tapsan/${tapSanId}/baibao`);
          }}
        >
          {tapSan?.TenTapSan || "Chi tiết tập san"}
        </Link>
        <Typography color="text.primary">
          {isEdit ? "Chỉnh sửa bài báo" : "Thêm bài báo"}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <IconButton onClick={handleCancel} color="primary">
          <ArrowBackIcon />
        </IconButton>
        <ArticleIcon color="primary" sx={{ fontSize: 32 }} />
        <Box>
          <Typography variant="h4" fontWeight="600">
            {isEdit ? "Chỉnh sửa bài báo" : "Thêm bài báo mới"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {tapSan?.Loai} {tapSan?.NamXuatBan} - Số {tapSan?.SoXuatBan}
          </Typography>
        </Box>
      </Stack>

      {/* Success Alert */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Form */}
      <FormProvider
        methods={methods}
        onSubmit={handleSubmit(onSubmit, (errs) => {
          const labels = {
            LoaiTapSan: "Loại tập san",
            TieuDe: "Tiêu đề bài báo",
            TomTat: "Tóm tắt",
            LoaiHinh: "Loại hình",
            NoiDungChuyenDe: "Nội dung chuyên đề",
            NguonTaiLieuThamKhao: "Nguồn tài liệu tham khảo (URL)",
            KhoiChuyenMon: "Khối chuyên môn",
            SoThuTu: "Số thứ tự",
            TacGiaLoai: "Nguồn tác giả",
            TacGiaChinhID: "Tác giả chính",
            TacGiaNgoaiVien: "Tác giả (ngoại viện)",
            NguoiThamDinhID: "Người thẩm định",
            DongTacGiaIDs: "Đồng tác giả",
            GhiChu: "Ghi chú",
          };
          const missing = Object.keys(errs || {}).map((k) => labels[k] || k);
          if (missing.length) {
            setError(`Thiếu/không hợp lệ: ${missing.join(", ")}`);
          } else {
            setError("Vui lòng kiểm tra các trường bắt buộc");
          }
        })}
      >
        <Paper sx={{ p: 3 }}>
          <Stack spacing={3}>
            {/* Basic Information */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Thông tin bài báo
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <FTextField
                  name="TieuDe"
                  label="Tiêu đề bài báo"
                  placeholder="Nhập tiêu đề bài báo"
                />

                <FTextField
                  name="TomTat"
                  label="Tóm tắt"
                  placeholder="Nhập tóm tắt (tối đa 2000 ký tự)"
                  multiline
                  rows={3}
                />

                {values.LoaiTapSan === "YHTH" && (
                  <FAutocomplete
                    name="LoaiHinh"
                    label="Loại hình"
                    options={
                      Array.isArray(LoaiHinhYHTH)
                        ? LoaiHinhYHTH.map((x) => x?.LoaiHinhYHTH).filter(
                            Boolean
                          )
                        : []
                    }
                    freeSolo
                    disableClearable={false}
                  />
                )}
                {values.LoaiTapSan === "TTT" && (
                  <FAutocomplete
                    name="NoiDungChuyenDe"
                    label="Nội dung chuyên đề"
                    options={
                      Array.isArray(ChuyenDeTTT)
                        ? ChuyenDeTTT.map((x) => x?.ChuyenDeTTT).filter(Boolean)
                        : []
                    }
                    freeSolo
                    disableClearable={false}
                  />
                )}

                <FTextField
                  name="NguonTaiLieuThamKhao"
                  label="Nguồn tài liệu tham khảo (URL)"
                  placeholder="https://..."
                />

                <FTextField select name="KhoiChuyenMon" label="Khối chuyên môn">
                  <MenuItem value="">
                    <em>Không chọn</em>
                  </MenuItem>
                  <MenuItem value="noi">Nội</MenuItem>
                  <MenuItem value="ngoai">Ngoại</MenuItem>
                  <MenuItem value="dieu-duong">Điều dưỡng</MenuItem>
                  <MenuItem value="phong-ban">Phòng ban</MenuItem>
                  <MenuItem value="can-lam-sang">Cận lâm sàng</MenuItem>
                </FTextField>

                <FTextField
                  name="SoThuTu"
                  label="Số thứ tự"
                  placeholder="Nhập số thứ tự trong tập san"
                  type="number"
                />

                {/* Tác giả: nội/ngoại viện */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Nguồn tác giả
                  </Typography>
                  <FRadioGroup
                    name="TacGiaLoai"
                    options={["noi-vien", "ngoai-vien"]}
                    getOptionLabel={["Nội viện", "Ngoại viện"]}
                  />
                </Box>

                {values.TacGiaLoai === "noi-vien" ? (
                  <>
                    {/* Preview selected authors */}
                    <Stack
                      direction="row"
                      spacing={1}
                      useFlexGap
                      flexWrap="wrap"
                    >
                      {mainId && (
                        <Chip
                          color="primary"
                          label={`Tác giả chính: ${getName(mainId)}`}
                        />
                      )}
                      {Array.isArray(coIds) &&
                        coIds.map((id) => (
                          <Chip
                            key={id}
                            label={`Đồng tác giả: ${getName(id)}`}
                            variant="outlined"
                            onDelete={() =>
                              setValue(
                                "DongTacGiaIDs",
                                coIds.filter((x) => x !== id),
                                { shouldValidate: true }
                              )
                            }
                          />
                        ))}
                    </Stack>
                    <Button
                      variant="outlined"
                      onClick={() => setOpenAuthors(true)}
                    >
                      Chọn tác giả từ danh sách
                    </Button>
                  </>
                ) : (
                  <FTextField
                    name="TacGiaNgoaiVien"
                    label="Tác giả (ngoại viện)"
                    placeholder="Nhập tên tác giả ngoại viện"
                  />
                )}

                {/* NguoiThamDinhID selector via CommonTable */}
                <Stack spacing={1}>
                  <Typography variant="subtitle2">
                    Người thẩm định (tùy chọn)
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    useFlexGap
                    flexWrap="wrap"
                  >
                    {methods.watch("NguoiThamDinhID") ? (
                      <Chip
                        color="info"
                        label={`Người thẩm định: ${getName(
                          methods.watch("NguoiThamDinhID")
                        )}`}
                        onDelete={() =>
                          setValue("NguoiThamDinhID", "", {
                            shouldValidate: true,
                          })
                        }
                      />
                    ) : (
                      <Chip
                        variant="outlined"
                        label="Chưa chọn người thẩm định"
                      />
                    )}
                    <Button
                      variant="outlined"
                      onClick={() => setOpenReviewer(true)}
                    >
                      Chọn người thẩm định
                    </Button>
                  </Stack>
                </Stack>

                <FTextField
                  name="GhiChu"
                  label="Ghi chú"
                  placeholder="Nhập ghi chú (tùy chọn)"
                  multiline
                  rows={2}
                />
              </Stack>
            </Box>

            {/* Action Buttons */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "flex-end",
                pt: 2,
              }}
            >
              <Button
                variant="outlined"
                onClick={handleCancel}
                startIcon={<CancelIcon />}
                disabled={submitLoading}
              >
                Hủy
              </Button>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={submitLoading}
                startIcon={<SaveIcon />}
                disabled={submitLoading || !isTapSanReady}
              >
                {isEdit ? "Cập nhật" : "Tạo mới"}
              </LoadingButton>
            </Box>
          </Stack>
        </Paper>
      </FormProvider>
      <AuthorsSelectorDialog
        open={openAuthors}
        onClose={() => setOpenAuthors(false)}
        value={{ TacGiaChinhID: mainId, DongTacGiaIDs: coIds || [] }}
        onChange={({ TacGiaChinhID, DongTacGiaIDs }) => {
          setValue("TacGiaChinhID", TacGiaChinhID, { shouldValidate: true });
          setValue("DongTacGiaIDs", DongTacGiaIDs, { shouldValidate: true });
        }}
      />
      <ReviewerSelectorDialog
        open={openReviewer}
        onClose={() => setOpenReviewer(false)}
        value={methods.watch("NguoiThamDinhID") || ""}
        onChange={(id) =>
          setValue("NguoiThamDinhID", id, { shouldValidate: true })
        }
      />
    </Box>
  );
}
