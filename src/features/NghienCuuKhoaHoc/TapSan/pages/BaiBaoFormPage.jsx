import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Stack,
  TextField,
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
import { TRANG_THAI_OPTIONS } from "../services/baibao.api";
import {
  createBaiBao as createBaiBaoThunk,
  updateBaiBao as updateBaiBaoThunk,
  fetchBaiBaoById,
  selectBaiBaoById,
} from "../slices/baiBaoSlice";
import { getTapSanById } from "../services/tapsan.api";

export default function BaiBaoFormPage() {
  const { tapSanId, baiBaoId } = useParams();
  const navigate = useNavigate();
  const isEdit = !!baiBaoId;
  const dispatch = useDispatch();
  const baiBaoFromStore = useSelector((state) =>
    isEdit ? selectBaiBaoById(state, baiBaoId) : null
  );

  const [tapSan, setTapSan] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [submitLoading, setSubmitLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [success, setSuccess] = React.useState(null);

  const [formData, setFormData] = React.useState({
    TieuDe: "",
    TacGia: "",
    TomTat: "",
    NoiDung: "",
    TrangThai: "Dự thảo",
    GhiChu: "",
  });

  const [errors, setErrors] = React.useState({});

  const loadTapSan = React.useCallback(async () => {
    try {
      const data = await getTapSanById(tapSanId);
      setTapSan(data);
    } catch (error) {
      console.error("Error loading TapSan:", error);
      setError("Không thể tải thông tin tập san");
    }
  }, [tapSanId]);

  const loadBaiBao = React.useCallback(async () => {
    if (!isEdit) return;

    try {
      setLoading(true);
      const data =
        baiBaoFromStore || (await dispatch(fetchBaiBaoById(baiBaoId)).unwrap());
      setFormData({
        TieuDe: data.TieuDe || "",
        TacGia: data.TacGia || "",
        TomTat: data.TomTat || "",
        NoiDung: data.NoiDung || "",
        TrangThai: data.TrangThai || "Nháp",
        GhiChu: data.GhiChu || "",
      });
    } catch (error) {
      console.error("Error loading BaiBao:", error);
      setError("Không thể tải thông tin bài báo");
    } finally {
      setLoading(false);
    }
  }, [isEdit, baiBaoId, dispatch, baiBaoFromStore]);

  React.useEffect(() => {
    loadTapSan();
    loadBaiBao();
  }, [loadTapSan, loadBaiBao]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.TieuDe.trim()) {
      newErrors.TieuDe = "Tiêu đề là bắt buộc";
    }

    if (!formData.TacGia.trim()) {
      newErrors.TacGia = "Tác giả là bắt buộc";
    }

    if (!formData.TomTat.trim()) {
      newErrors.TomTat = "Tóm tắt là bắt buộc";
    }

    if (!formData.NoiDung.trim()) {
      newErrors.NoiDung = "Nội dung là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      setError("Vui lòng kiểm tra lại thông tin");
      return;
    }

    try {
      setSubmitLoading(true);
      setError(null);

      const payload = {
        ...formData,
        TapSanId: tapSanId,
      };

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

      // Redirect to detail page after success
      setTimeout(() => {
        navigate(`/tapsan/${tapSanId}/baibao/${result._id || baiBaoId}`);
      }, 1500);
    } catch (error) {
      console.error("Error saving BaiBao:", error);
      setError(
        error.response?.data?.message || "Có lỗi xảy ra khi lưu bài báo"
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
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Basic Information */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Thông tin cơ bản
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Stack spacing={2}>
              <TextField
                label="Tiêu đề bài báo"
                value={formData.TieuDe}
                onChange={handleInputChange("TieuDe")}
                error={!!errors.TieuDe}
                helperText={errors.TieuDe}
                fullWidth
                required
                placeholder="Nhập tiêu đề bài báo"
              />

              <TextField
                label="Tác giả"
                value={formData.TacGia}
                onChange={handleInputChange("TacGia")}
                error={!!errors.TacGia}
                helperText={errors.TacGia}
                fullWidth
                required
                placeholder="Nhập tên tác giả"
              />

              <TextField
                label="Tóm tắt"
                value={formData.TomTat}
                onChange={handleInputChange("TomTat")}
                error={!!errors.TomTat}
                helperText={errors.TomTat}
                fullWidth
                multiline
                rows={3}
                required
                placeholder="Nhập tóm tắt nội dung bài báo"
              />
            </Stack>
          </Box>

          {/* Content */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Nội dung
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <TextField
              label="Nội dung bài báo"
              value={formData.NoiDung}
              onChange={handleInputChange("NoiDung")}
              error={!!errors.NoiDung}
              helperText={errors.NoiDung}
              fullWidth
              multiline
              rows={10}
              required
              placeholder="Nhập nội dung chi tiết của bài báo"
            />
          </Box>

          {/* Status and Notes */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Trạng thái và ghi chú
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Stack spacing={2}>
              <TextField
                select
                label="Trạng thái"
                value={formData.TrangThai}
                onChange={handleInputChange("TrangThai")}
                fullWidth
                required
              >
                {TRANG_THAI_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Ghi chú"
                value={formData.GhiChu}
                onChange={handleInputChange("GhiChu")}
                fullWidth
                multiline
                rows={2}
                placeholder="Nhập ghi chú (tùy chọn)"
              />
            </Stack>
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{ display: "flex", gap: 2, justifyContent: "flex-end", pt: 2 }}
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
    </Box>
  );
}
