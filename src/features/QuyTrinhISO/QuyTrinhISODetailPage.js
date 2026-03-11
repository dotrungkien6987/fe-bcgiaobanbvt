import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Divider,
  Paper,
  Alert,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import {
  ArrowLeft,
  DocumentDownload,
  DocumentText1,
  Eye,
  Edit,
  Calendar,
  Building,
  Clock,
  Category2,
  AddCircle,
} from "iconsax-react";
import CreateVersionDialog from "./components/CreateVersionDialog";
import NetworkError from "./components/NetworkError";
import DistributionChips from "./components/DistributionChips";
import PermissionDenied from "./components/PermissionDenied";
import PDFQuickViewModal from "./components/PDFQuickViewModal";
import ISOPageShell from "./components/ISOPageShell";
import ISOStatusChip from "./components/ISOStatusChip";
import dayjs from "dayjs";
import {
  getQuyTrinhISODetail,
  getQuyTrinhISOVersions,
  activateQuyTrinh,
  deactivateQuyTrinh,
} from "./quyTrinhISOSlice";
import useAuth from "../../hooks/useAuth";
import apiService from "../../app/apiService";

// Shared breadcrumbs for this page
const DETAIL_BREADCRUMBS_BASE = [
  { label: "Trang chủ", to: "/" },
  { label: "Quy trình ISO", to: "/quytrinh-iso" },
];

// Simple info row component for metadata display
function InfoRow({ icon, label, children }) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        py: 1.25,
        borderBottom: "1px solid",
        borderColor: "divider",
        "&:last-child": { borderBottom: "none" },
      }}
    >
      <Box sx={{ color: "text.disabled", flexShrink: 0, pt: 0.15, width: 20 }}>
        {icon}
      </Box>
      <Typography
        variant="body2"
        color="text.secondary"
        fontWeight={500}
        sx={{ minWidth: 150, flexShrink: 0 }}
      >
        {label}
      </Typography>
      <Box sx={{ flex: 1 }}>
        {typeof children === "string" ? (
          <Typography variant="body2">{children || "-"}</Typography>
        ) : (
          children
        )}
      </Box>
    </Box>
  );
}

function QuyTrinhISODetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentItem, currentFiles, versions, isLoading, error, errorStatus } =
    useSelector((state) => state.quyTrinhISO);

  const [selectedPdf, setSelectedPdf] = useState(null);
  const [createVersionOpen, setCreateVersionOpen] = useState(false);
  const [lifecycleAction, setLifecycleAction] = useState(null); // "activate" | "deactivate"
  const [lifecycleLoading, setLifecycleLoading] = useState(false);

  const isQLCL =
    user?.PhanQuyen === "qlcl" ||
    user?.PhanQuyen === "admin" ||
    user?.PhanQuyen === "superadmin";

  // Fetch data
  const fetchData = () => {
    if (id) {
      dispatch(getQuyTrinhISODetail(id));
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Fetch versions when data loads
  useEffect(() => {
    if (currentItem?.MaQuyTrinh) {
      dispatch(getQuyTrinhISOVersions(currentItem._id));
    }
  }, [currentItem?.MaQuyTrinh, currentItem?._id, dispatch]);

  const handleViewPdf = (file) => {
    setSelectedPdf(file);
  };

  const handleClosePdfViewer = () => {
    setSelectedPdf(null);
  };

  const handleDownload = async (file) => {
    try {
      const res = await apiService.get(
        `/attachments/files/${file._id}/download`,
        { responseType: "blob" },
      );
      const blobUrl = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = file.TenGoc || file.TenFile || "download";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const handleLifecycleConfirm = async () => {
    setLifecycleLoading(true);
    try {
      if (lifecycleAction === "activate") {
        await dispatch(activateQuyTrinh(id));
      } else {
        await dispatch(deactivateQuyTrinh(id));
      }
      setLifecycleAction(null);
      fetchData();
    } finally {
      setLifecycleLoading(false);
    }
  };

  const shellBase = (
    <ISOPageShell
      title="Chi Tiết Quy Trình ISO"
      breadcrumbs={DETAIL_BREADCRUMBS_BASE}
    />
  );

  // Handle permission denied error
  if (errorStatus === 403 || error?.includes("không có quyền")) {
    return (
      <ISOPageShell
        title="Chi Tiết Quy Trình ISO"
        breadcrumbs={DETAIL_BREADCRUMBS_BASE}
      >
        <PermissionDenied />
      </ISOPageShell>
    );
  }

  // Handle network error
  if (error && !isLoading) {
    return (
      <ISOPageShell
        title="Chi Tiết Quy Trình ISO"
        breadcrumbs={DETAIL_BREADCRUMBS_BASE}
      >
        <NetworkError message={error} onRetry={fetchData} />
      </ISOPageShell>
    );
  }

  if (!currentItem || currentItem._id !== id) {
    return (
      <ISOPageShell
        title="Chi Tiết Quy Trình ISO"
        breadcrumbs={DETAIL_BREADCRUMBS_BASE}
      >
        <Typography>Đang tải...</Typography>
      </ISOPageShell>
    );
  }

  // Get files from state (already destructured from useSelector above)
  const filesPDF = currentFiles?.pdf || [];
  const filesWord = currentFiles?.word || [];

  return (
    <>
      <ISOPageShell
        title={`${currentItem.MaQuyTrinh} — Phên Bản ${currentItem.PhienBan}`}
        subtitle={currentItem.TenQuyTrinh}
        breadcrumbs={[
          ...DETAIL_BREADCRUMBS_BASE,
          { label: currentItem.MaQuyTrinh },
        ]}
        headerActions={
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
          >
            <ISOStatusChip status={currentItem.TrangThai} />
            {isQLCL && (
              <>
                {currentItem.TrangThai === "DRAFT" && (
                  <Button
                    variant="contained"
                    size="small"
                    color="success"
                    onClick={() => setLifecycleAction("activate")}
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "white",
                      borderColor: "rgba(255,255,255,0.4)",
                      border: 1,
                      "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                    }}
                  >
                    Phát hành
                  </Button>
                )}
                {currentItem.TrangThai === "ACTIVE" && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setLifecycleAction("deactivate")}
                    sx={{
                      color: "rgba(255,255,255,0.9)",
                      borderColor: "rgba(255,255,255,0.4)",
                      "&:hover": { borderColor: "white" },
                    }}
                  >
                    Thu hồi
                  </Button>
                )}
                {currentItem.TrangThai === "INACTIVE" && (
                  <Button
                    variant="contained"
                    size="small"
                    color="success"
                    onClick={() => setLifecycleAction("activate")}
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "white",
                      border: 1,
                      borderColor: "rgba(255,255,255,0.4)",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                    }}
                  >
                    Phát hành lại
                  </Button>
                )}
              </>
            )}
          </Stack>
        }
      >
        {/* Action strip */}
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ mb: 3, flexWrap: "wrap", gap: 1 }}
        >
          <Button
            startIcon={<ArrowLeft size={18} />}
            onClick={() => navigate("/quytrinh-iso")}
            variant="outlined"
            size="small"
          >
            Quay lại
          </Button>
          {isQLCL && (
            <>
              <Button
                startIcon={<AddCircle size={18} />}
                variant="contained"
                color="primary"
                size="small"
                onClick={() => setCreateVersionOpen(true)}
              >
                Tạo phiên bản mới
              </Button>
              <Button
                startIcon={<Edit size={18} />}
                variant="outlined"
                size="small"
                onClick={() => navigate(`/quytrinh-iso/${id}/edit`)}
              >
                Chỉnh sửa
              </Button>
            </>
          )}
        </Stack>

        <Stack spacing={3}>
          {/* Basic Info */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                Thông Tin Chung
              </Typography>

              <InfoRow icon={<Category2 size={17} />} label="Tên Quy Trình">
                <Typography variant="body2" fontWeight={500}>
                  {currentItem.TenQuyTrinh}
                </Typography>
              </InfoRow>
              <InfoRow icon={<Building size={17} />} label="Khoa Xây Dựng">
                {currentItem.KhoaXayDungID?.TenKhoa || "-"}
              </InfoRow>
              <InfoRow icon={<Calendar size={17} />} label="Ngày Hiệu Lực">
                {currentItem.NgayHieuLuc
                  ? dayjs(currentItem.NgayHieuLuc).format("DD/MM/YYYY")
                  : "-"}
              </InfoRow>
              <InfoRow icon={<Category2 size={17} />} label="Trạng Thái">
                <ISOStatusChip status={currentItem.TrangThai} />
              </InfoRow>
              {currentItem.GhiChu && (
                <InfoRow icon={<Category2 size={17} />} label="Ghi Chú">
                  {currentItem.GhiChu}
                </InfoRow>
              )}
              {currentItem.createdAt && (
                <InfoRow icon={<Clock size={17} />} label="Ngày Tạo">
                  {dayjs(currentItem.createdAt).format("DD/MM/YYYY HH:mm")}
                </InfoRow>
              )}
              {currentItem.updatedAt &&
                currentItem.updatedAt !== currentItem.createdAt && (
                  <InfoRow icon={<Clock size={17} />} label="Cập Nhật Lần Cuối">
                    {dayjs(currentItem.updatedAt).format("DD/MM/YYYY HH:mm")}
                  </InfoRow>
                )}
            </CardContent>
          </Card>

          {/* Distribution */}
          {currentItem.KhoaPhanPhoi?.length > 0 && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  Phân Phối Cho Các Khoa ({currentItem.KhoaPhanPhoi.length})
                </Typography>
                <DistributionChips
                  khoaList={currentItem.KhoaPhanPhoi}
                  maxDisplay={999}
                />
              </CardContent>
            </Card>
          )}

          {/* PDF Files - Main Process Document */}
          <Card
            sx={{
              border: "2px solid",
              borderColor: "primary.main",
              bgcolor: "#e3f2fd",
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Box
                  sx={{
                    bgcolor: "primary.main",
                    color: "white",
                    p: 1.5,
                    borderRadius: 2,
                    display: "flex",
                  }}
                >
                  <DocumentDownload size={32} />
                </Box>
                <Box flex={1}>
                  <Typography variant="h6" fontWeight={600} color="primary">
                    File Quy Trình Chính (PDF)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tài liệu chính thức mô tả quy trình ISO
                  </Typography>
                </Box>
                <Chip
                  icon={<DocumentDownload size={16} />}
                  label={`${filesPDF.length} file`}
                  sx={{
                    bgcolor: "primary.main",
                    color: "white",
                    "& .MuiChip-icon": { color: "white" },
                  }}
                  size="small"
                />
              </Stack>

              <Divider sx={{ mb: 2 }} />

              {filesPDF.length === 0 ? (
                <Alert severity="warning">Chưa có file PDF quy trình</Alert>
              ) : (
                <List disablePadding>
                  {filesPDF.map((file, index) => (
                    <Paper
                      key={file._id}
                      elevation={0}
                      sx={{
                        border: 1,
                        borderColor: "error.light",
                        borderRadius: 2,
                        mb: 1,
                        overflow: "hidden",
                      }}
                    >
                      <ListItem>
                        <ListItemIcon>
                          <DocumentDownload size={28} color="#c62828" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" fontWeight={600}>
                              {file.TenFile}
                            </Typography>
                          }
                          secondary={
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              mt={0.5}
                            >
                              <Chip
                                label={`${(file.KichThuoc / 1024 / 1024).toFixed(2)} MB`}
                                size="small"
                                sx={{ height: 20 }}
                              />
                              <Chip
                                label="PDF"
                                size="small"
                                color="primary"
                                sx={{ height: 20 }}
                              />
                            </Stack>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Xem PDF">
                              <IconButton
                                onClick={() => handleViewPdf(file)}
                                color="primary"
                                sx={{
                                  bgcolor: "primary.lighter",
                                  "&:hover": { bgcolor: "primary.light" },
                                }}
                              >
                                <Eye size={20} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Tải xuống">
                              <IconButton
                                onClick={() => handleDownload(file)}
                                sx={{
                                  bgcolor: "grey.100",
                                  "&:hover": { bgcolor: "grey.200" },
                                }}
                              >
                                <DocumentDownload size={20} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </Paper>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          {/* Word Files - Supporting Templates */}
          <Card
            sx={{
              border: "2px solid",
              borderColor: "#ed6c02",
              bgcolor: "#fff3e0",
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Box
                  sx={{
                    bgcolor: "#ed6c02",
                    color: "white",
                    p: 1.5,
                    borderRadius: 2,
                    display: "flex",
                  }}
                >
                  <DocumentText1 size={32} />
                </Box>
                <Box flex={1}>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    sx={{ color: "#e65100" }}
                  >
                    Biểu Mẫu Đi Kèm (Word)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Các biểu mẫu, mẫu đơn hỗ trợ thực hiện quy trình
                  </Typography>
                </Box>
                <Chip
                  icon={<DocumentText1 size={16} />}
                  label={`${filesWord.length} file`}
                  sx={{
                    bgcolor: "#ed6c02",
                    color: "white",
                    "& .MuiChip-icon": { color: "white" },
                  }}
                  size="small"
                />
              </Stack>

              <Divider sx={{ mb: 2 }} />

              {filesWord.length === 0 ? (
                <Alert severity="info">Chưa có biểu mẫu Word đi kèm</Alert>
              ) : (
                <List disablePadding>
                  {filesWord.map((file, index) => (
                    <Paper
                      key={file._id}
                      elevation={0}
                      sx={{
                        border: 1,
                        borderColor: "primary.light",
                        borderRadius: 2,
                        mb: 1,
                        overflow: "hidden",
                      }}
                    >
                      <ListItem>
                        <ListItemIcon>
                          <DocumentText1 size={28} color="#1565c0" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" fontWeight={600}>
                              {file.TenFile}
                            </Typography>
                          }
                          secondary={
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              mt={0.5}
                            >
                              <Chip
                                label={`${(file.KichThuoc / 1024).toFixed(1)} KB`}
                                size="small"
                                sx={{ height: 20 }}
                              />
                              <Chip
                                label="Word"
                                size="small"
                                color="primary"
                                sx={{ height: 20 }}
                              />
                            </Stack>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Tooltip title="Tải xuống">
                            <IconButton
                              onClick={() => handleDownload(file)}
                              sx={{
                                bgcolor: "grey.100",
                                "&:hover": { bgcolor: "grey.200" },
                              }}
                            >
                              <DocumentDownload size={20} />
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </Paper>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          {/* Version History */}
          {versions && versions.length > 0 && (
            <Card variant="outlined">
              <CardContent>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ mb: 2 }}
                >
                  <Clock size={20} color="#9e9e9e" />
                  <Typography variant="subtitle1" fontWeight={600}>
                    Lịch Sử Phiên Bản
                  </Typography>
                </Stack>

                <List disablePadding>
                  {versions.map((ver, index) => {
                    const isCurrent = ver._id === id;
                    const isLatest = index === 0;
                    return (
                      <ListItem
                        key={ver._id}
                        button
                        onClick={() =>
                          !isCurrent && navigate(`/quytrinh-iso/${ver._id}`)
                        }
                        sx={{
                          border: 1,
                          borderColor: isCurrent ? "primary.main" : "divider",
                          borderRadius: 1,
                          mb: 1,
                          bgcolor: isCurrent ? "primary.50" : "transparent",
                          cursor: isCurrent ? "default" : "pointer",
                        }}
                      >
                        <ListItemText
                          primary={
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Typography fontWeight={isCurrent ? 700 : 400}>
                                Phiên bản {ver.PhienBan}
                              </Typography>
                              {isCurrent && (
                                <Chip
                                  label="Hiện tại"
                                  size="small"
                                  color="primary"
                                  sx={{ height: 20, fontSize: "0.7rem" }}
                                />
                              )}
                              {isLatest && (
                                <Chip
                                  label="Mới nhất"
                                  size="small"
                                  color="success"
                                  sx={{ height: 20, fontSize: "0.7rem" }}
                                />
                              )}
                            </Stack>
                          }
                          secondary={
                            <>
                              Ngày hiệu lực:{" "}
                              {dayjs(ver.NgayHieuLuc).format("DD/MM/YYYY")} •{" "}
                              Khoa: {ver.KhoaXayDungID?.TenKhoa || "N/A"}
                            </>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </CardContent>
            </Card>
          )}
        </Stack>
      </ISOPageShell>

      {/* Lifecycle Confirmation Dialog */}
      <Dialog
        open={!!lifecycleAction}
        onClose={() => !lifecycleLoading && setLifecycleAction(null)}
      >
        <DialogTitle>
          {lifecycleAction === "activate"
            ? "Xác nhận phát hành"
            : "Xác nhận thu hồi"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {lifecycleAction === "activate"
              ? `Phát hành quy trình "${currentItem.TenQuyTrinh}" (v${currentItem.PhienBan})? Các phiên bản khác cùng mã sẽ tự động chuyển sang "Đã thu hồi".`
              : `Thu hồi quy trình "${currentItem.TenQuyTrinh}" (v${currentItem.PhienBan})? Người dùng sẽ không còn thấy tài liệu này.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setLifecycleAction(null)}
            disabled={lifecycleLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleLifecycleConfirm}
            variant="contained"
            color={lifecycleAction === "activate" ? "success" : "warning"}
            disabled={lifecycleLoading}
            startIcon={
              lifecycleLoading ? (
                <CircularProgress size={16} color="inherit" />
              ) : null
            }
            autoFocus
          >
            {lifecycleAction === "activate" ? "Phát hành" : "Thu hồi"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* PDF Viewer — unified with PDFQuickViewModal */}
      <PDFQuickViewModal
        open={!!selectedPdf}
        onClose={handleClosePdfViewer}
        file={selectedPdf}
      />

      {/* Create Version Dialog */}
      <CreateVersionDialog
        currentItem={currentItem}
        open={createVersionOpen}
        onClose={() => setCreateVersionOpen(false)}
      />
    </>
  );
}

export default QuyTrinhISODetailPage;
