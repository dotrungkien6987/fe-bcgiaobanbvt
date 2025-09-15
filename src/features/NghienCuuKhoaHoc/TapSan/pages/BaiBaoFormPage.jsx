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
import { TRANG_THAI_OPTIONS } from "../slices/baibao.constants";
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

  const schema = Yup.object().shape({
    TieuDe: Yup.string().required("Tiêu đề là bắt buộc"),
    TacGia: Yup.string().required("Tác giả là bắt buộc"),
    TomTat: Yup.string().required("Tóm tắt là bắt buộc"),
    NoiDung: Yup.string().required("Nội dung là bắt buộc"),
    TrangThai: Yup.string().required("Trạng thái là bắt buộc"),
    GhiChu: Yup.string().nullable(),
  });

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      TieuDe: "",
      TacGia: "",
      TomTat: "",
      NoiDung: "",
      TrangThai: TRANG_THAI_OPTIONS[0]?.value || "",
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
        TacGia: data.TacGia || "",
        TomTat: data.TomTat || "",
        NoiDung: data.NoiDung || "",
        TrangThai: data.TrangThai || TRANG_THAI_OPTIONS[0]?.value || "",
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
  }, [loadTapSan, loadBaiBao]);

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
        <Paper component="form" sx={{ p: 3 }}>
          <Stack spacing={3}>
            {/* Basic Information */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Thông tin cơ bản
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <FTextField
                  name="TieuDe"
                  label="Tiêu đề bài báo"
                  placeholder="Nhập tiêu đề bài báo"
                />

                <FTextField
                  name="TacGia"
                  label="Tác giả"
                  placeholder="Nhập tên tác giả"
                />

                <FTextField
                  name="TomTat"
                  label="Tóm tắt"
                  placeholder="Nhập tóm tắt nội dung bài báo"
                  multiline
                  rows={3}
                />
              </Stack>
            </Box>

            {/* Content */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Nội dung
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <FTextField
                name="NoiDung"
                label="Nội dung bài báo"
                placeholder="Nhập nội dung chi tiết của bài báo"
                multiline
                rows={10}
              />
            </Box>

            {/* Status and Notes */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Trạng thái và ghi chú
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <FTextField
                  select
                  name="TrangThai"
                  label="Trạng thái"
                  fullWidth
                >
                  {TRANG_THAI_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
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
