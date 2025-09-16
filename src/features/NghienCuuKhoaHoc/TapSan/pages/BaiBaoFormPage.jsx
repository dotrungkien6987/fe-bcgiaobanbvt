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
import { getAllNhanVien } from "features/NhanVien/nhanvienSlice";

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

  const schema = Yup.object().shape({
    TieuDe: Yup.string().required("Tiêu đề là bắt buộc"),
    TomTat: Yup.string().nullable(),
    LoaiHinh: Yup.mixed()
      .oneOf(["ky-thuat-moi", "nghien-cuu-khoa-hoc", "ca-lam-sang"])
      .required("Loại hình là bắt buộc"),
    KhoiChuyenMon: Yup.mixed()
      .oneOf(["noi", "ngoai", "dieu-duong", "phong-ban", "can-lam-sang"])
      .required("Khối chuyên môn là bắt buộc"),
    SoThuTu: Yup.number()
      .typeError("Số thứ tự phải là số")
      .integer("Số thứ tự phải là số nguyên")
      .min(1, "Số thứ tự phải >= 1")
      .required("Số thứ tự là bắt buộc"),
    TacGiaChinhID: Yup.string().required("Chọn tác giả chính"),
    DongTacGiaIDs: Yup.array()
      .of(Yup.string())
      .test(
        "no-dup-main",
        "Không được chọn trùng với tác giả chính",
        function (arr) {
          if (!arr || arr.length === 0) return true;
          const main = this.parent.TacGiaChinhID;
          return !arr.includes(main);
        }
      ),
    GhiChu: Yup.string().nullable(),
  });

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      TieuDe: "",
      TomTat: "",
      LoaiHinh: "",
      KhoiChuyenMon: "",
      SoThuTu: "",
      TacGiaChinhID: "",
      DongTacGiaIDs: [],
      GhiChu: "",
    },
  });
  const { handleSubmit, reset } = methods;

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
      reset({
        TieuDe: data.TieuDe || "",
        TomTat: data.TomTat || "",
        LoaiHinh: data.LoaiHinh || "",
        KhoiChuyenMon: data.KhoiChuyenMon || "",
        SoThuTu: data.SoThuTu || "",
        TacGiaChinhID: data.TacGiaChinhID || "",
        DongTacGiaIDs: data.DongTacGiaIDs || [],
        GhiChu: data.GhiChu || "",
      });
    } catch (error) {
      console.error("Error loading BaiBao:", error);
      setError("Không thể tải thông tin bài báo");
    } finally {
      setLoading(false);
    }
  }, [isEdit, baiBaoId, dispatch, baiBaoFromStore, reset]);

  React.useEffect(() => {
    loadTapSan();
    loadBaiBao();
    if (!nhanviens || nhanviens.length === 0) {
      dispatch(getAllNhanVien());
    }
  }, [loadTapSan, loadBaiBao, nhanviens, dispatch]);

  const onSubmit = async (data) => {
    try {
      setSubmitLoading(true);
      setError(null);
      const payload = { ...data, TapSanId: tapSanId };
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
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
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

                <FTextField select name="LoaiHinh" label="Loại hình">
                  <MenuItem value="ky-thuat-moi">Kỹ thuật mới</MenuItem>
                  <MenuItem value="nghien-cuu-khoa-hoc">
                    Nghiên cứu khoa học
                  </MenuItem>
                  <MenuItem value="ca-lam-sang">Ca lâm sàng</MenuItem>
                </FTextField>

                <FTextField select name="KhoiChuyenMon" label="Khối chuyên môn">
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

                <FTextField select name="TacGiaChinhID" label="Tác giả chính">
                  {nhanviens.map((nv) => (
                    <MenuItem key={nv._id} value={nv._id}>
                      {nv.Ten}
                      {nv.MaNhanVien ? ` (${nv.MaNhanVien})` : ""}
                    </MenuItem>
                  ))}
                </FTextField>

                <FTextField
                  select
                  SelectProps={{ multiple: true }}
                  name="DongTacGiaIDs"
                  label="Đồng tác giả"
                >
                  {nhanviens.map((nv) => (
                    <MenuItem key={nv._id} value={nv._id}>
                      {nv.Ten}
                      {nv.MaNhanVien ? ` (${nv.MaNhanVien})` : ""}
                    </MenuItem>
                  ))}
                </FTextField>

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
              >
                {isEdit ? "Cập nhật" : "Tạo mới"}
              </LoadingButton>
            </Box>
          </Stack>
        </Paper>
      </FormProvider>
    </Box>
  );
}
