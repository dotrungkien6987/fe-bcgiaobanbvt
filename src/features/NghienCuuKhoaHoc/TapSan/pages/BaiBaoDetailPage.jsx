import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  Breadcrumbs,
  Link,
  Alert,
  Paper,
  IconButton,
  Divider,
  Tab,
  Tabs,
  Grid,
  Skeleton,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Article as ArticleIcon,
  ArrowBack as ArrowBackIcon,
  AttachFile as AttachFileIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { getTrangThaiColor, getTrangThaiLabel } from "../services/baibao.api";
import {
  fetchBaiBaoById,
  deleteBaiBao as deleteBaiBaoThunk,
  selectBaiBaoById,
} from "../slices/baiBaoSlice";
import { getTapSanById } from "../services/tapsan.api";
import AttachmentSection from "../components/AttachmentSection";
import ConfirmDialog from "components/ConfirmDialog";
import useLocalSnackbar from "../hooks/useLocalSnackbar";

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function BaiBaoDetailPage() {
  const { tapSanId, baiBaoId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const baiBao = useSelector((state) => selectBaiBaoById(state, baiBaoId));

  const [tapSan, setTapSan] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [tabValue, setTabValue] = React.useState(0);
  const { showSuccess, showError, SnackbarElement } = useLocalSnackbar();
  const [confirm, setConfirm] = React.useState({ open: false, loading: false });

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
    try {
      setLoading(true);
      await dispatch(fetchBaiBaoById(baiBaoId)).unwrap();
    } catch (error) {
      console.error("Error loading BaiBao:", error);
      setError("Không thể tải thông tin bài báo");
    } finally {
      setLoading(false);
    }
  }, [baiBaoId, dispatch]);

  React.useEffect(() => {
    loadTapSan();
    loadBaiBao();
  }, [loadTapSan, loadBaiBao]);

  const handleAskDelete = () => {
    setConfirm({ open: true, loading: false });
  };

  const handleConfirmDelete = async () => {
    try {
      setConfirm((s) => ({ ...s, loading: true }));
      await dispatch(deleteBaiBaoThunk(baiBaoId)).unwrap();
      showSuccess("Đã xóa bài báo");
      navigate(`/tapsan/${tapSanId}/baibao`);
    } catch (error) {
      console.error("Error deleting article:", error);
      setError("Không thể xóa bài báo");
      showError("Không thể xóa bài báo");
    } finally {
      setConfirm({ open: false, loading: false });
    }
  };

  const handleEdit = () => {
    navigate(`/tapsan/${tapSanId}/baibao/${baiBaoId}/edit`);
  };

  const handleBack = () => {
    navigate(`/tapsan/${tapSanId}/baibao`);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width={300} height={36} />
            <Skeleton variant="text" width={200} />
          </Box>
          <Skeleton variant="rectangular" width={160} height={36} />
          <Skeleton variant="rectangular" width={120} height={36} />
        </Stack>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Skeleton variant="text" width={180} height={28} />
            <Skeleton variant="rectangular" height={180} sx={{ mt: 2 }} />
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!baiBao) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Không tìm thấy bài báo</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} color="inherit" to="/tapsan">
          Tập san
        </Link>
        <Link
          component={RouterLink}
          color="inherit"
          to={`/tapsan/${tapSanId}/baibao`}
        >
          {tapSan
            ? `${tapSan?.Loai} ${tapSan?.NamXuatBan} - Số ${tapSan?.SoXuatBan}`
            : "Chi tiết tập san"}
        </Link>
        <Typography color="text.primary">Chi tiết bài báo</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <IconButton onClick={handleBack} color="primary">
          <ArrowBackIcon />
        </IconButton>
        <ArticleIcon color="primary" sx={{ fontSize: 32 }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight="600">
            {baiBao.TieuDe}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={2} mt={1}>
            <Typography variant="body1" color="text.secondary">
              {baiBao.TacGia}
            </Typography>
            <Chip
              label={getTrangThaiLabel(baiBao.TrangThai)}
              color={getTrangThaiColor(baiBao.TrangThai)}
              size="small"
              variant="outlined"
            />
          </Stack>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            Chỉnh sửa
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleAskDelete}
          >
            Xóa
          </Button>
        </Stack>
      </Stack>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab icon={<InfoIcon />} label="Thông tin" />
          <Tab icon={<AttachFileIcon />} label="Tệp đính kèm" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Thông tin bài báo
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tiêu đề
                    </Typography>
                    <Typography variant="body1">{baiBao.TieuDe}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tác giả
                    </Typography>
                    <Typography variant="body1">{baiBao.TacGia}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tóm tắt
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                      {baiBao.TomTat}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Nội dung
                    </Typography>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        mt: 1,
                        maxHeight: 400,
                        overflow: "auto",
                        backgroundColor: "grey.50",
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{ whiteSpace: "pre-line" }}
                      >
                        {baiBao.NoiDung}
                      </Typography>
                    </Paper>
                  </Box>

                  {baiBao.GhiChu && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Ghi chú
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ whiteSpace: "pre-line" }}
                      >
                        {baiBao.GhiChu}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Metadata */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Thông tin khác
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tập san
                    </Typography>
                    <Typography variant="body1">
                      {tapSan ? `${tapSan?.Loai} ${tapSan?.NamXuatBan}` : ""}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tapSan ? `Số ${tapSan?.SoXuatBan}` : ""}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Trạng thái
                    </Typography>
                    <Chip
                      label={getTrangThaiLabel(baiBao.TrangThai)}
                      color={getTrangThaiColor(baiBao.TrangThai)}
                      size="small"
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Ngày tạo
                    </Typography>
                    <Typography variant="body1">
                      {new Date(baiBao.NgayTao).toLocaleString("vi-VN")}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Ngày cập nhật
                    </Typography>
                    <Typography variant="body1">
                      {new Date(baiBao.NgayCapNhat).toLocaleString("vi-VN")}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <AttachmentSection
          ownerType="TapSanBaiBao"
          ownerId={baiBaoId}
          field="file"
          title="Tệp đính kèm bài báo"
          subtitle="Tải lên các tài liệu, hình ảnh liên quan đến bài báo"
        />
      </TabPanel>

      {/* Snackbar */}
      {SnackbarElement}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, loading: false })}
        onConfirm={handleConfirmDelete}
        loading={confirm.loading}
        title="Xác nhận xóa bài báo"
        message="Thao tác này sẽ xóa vĩnh viễn bài báo. Bạn có chắc chắn muốn thực hiện?"
        confirmText="Xóa"
        confirmColor="error"
        severity="warning"
      />
    </Box>
  );
}
