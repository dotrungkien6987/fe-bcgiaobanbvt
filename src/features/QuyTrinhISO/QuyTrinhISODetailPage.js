import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, Link as RouterLink } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogContent,
  DialogTitle,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Breadcrumbs,
  Link,
  useMediaQuery,
  useTheme,
  Divider,
  Paper,
  Alert,
  Box,
} from "@mui/material";
import {
  ArrowLeft,
  DocumentDownload,
  DocumentText1,
  Eye,
  Edit,
  CloseCircle,
  Calendar,
  Building,
  Clock,
  Category2,
  AddCircle,
  Home2,
} from "iconsax-react";
import CreateVersionDialog from "./components/CreateVersionDialog";
import NetworkError from "./components/NetworkError";
import DistributionChips from "./components/DistributionChips";
import PermissionDenied from "./components/PermissionDenied";
import dayjs from "dayjs";
import MainCard from "../../components/MainCard";
import {
  getQuyTrinhISODetail,
  getQuyTrinhISOVersions,
} from "./quyTrinhISOSlice";
import useAuth from "../../hooks/useAuth";
import { downloadUrl } from "../../shared/services/attachments.api";
import apiService from "../../app/apiService";

function QuyTrinhISODetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentItem, currentFiles, versions, isLoading, error } = useSelector(
    (state) => state.quyTrinhISO,
  );
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [createVersionOpen, setCreateVersionOpen] = useState(false);

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

  const handleViewPdf = async (file) => {
    setPdfLoading(true);
    setPdfViewerOpen(true);
    try {
      const res = await apiService.get(
        `/attachments/files/${file._id}/inline`,
        {
          responseType: "blob",
        },
      );
      const blobUrl = URL.createObjectURL(res.data);
      setSelectedPdf({
        ...file,
        blobUrl,
        downloadUrl: downloadUrl(file),
      });
    } catch (error) {
      console.error("Error loading PDF:", error);
      setSelectedPdf(null);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleClosePdfViewer = () => {
    if (selectedPdf?.blobUrl) {
      URL.revokeObjectURL(selectedPdf.blobUrl);
    }
    setPdfViewerOpen(false);
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

  // Handle permission denied error
  if (error?.includes("403") || error?.includes("không có quyền")) {
    return (
      <MainCard title="Chi Tiết Quy Trình ISO">
        <PermissionDenied />
      </MainCard>
    );
  }

  // Handle network error
  if (error && !isLoading) {
    return (
      <MainCard title="Chi Tiết Quy Trình ISO">
        <NetworkError message={error} onRetry={fetchData} />
      </MainCard>
    );
  }

  if (!currentItem || currentItem._id !== id) {
    return (
      <MainCard title="Chi Tiết Quy Trình ISO">
        <Typography>Đang tải...</Typography>
      </MainCard>
    );
  }

  // Get files from state (already destructured from useSelector above)
  const filesPDF = currentFiles?.pdf || [];
  const filesWord = currentFiles?.word || [];

  return (
    <>
      {/* Breadcrumb Navigation */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component={RouterLink}
          to="/"
          underline="hover"
          color="inherit"
          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
        >
          <Home2 size={16} />
          Trang chủ
        </Link>
        <Link
          component={RouterLink}
          to="/quytrinh-iso"
          underline="hover"
          color="inherit"
        >
          Quy trình ISO
        </Link>
        <Typography color="text.primary">{currentItem.TenQuyTrinh}</Typography>
      </Breadcrumbs>

      <MainCard
        title={
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h5">
              {currentItem.MaQuyTrinh} - Phiên bản {currentItem.PhienBan}
            </Typography>
            <Chip
              label={
                currentItem.TrangThai === "ACTIVE" ? "Hiệu lực" : "Hết hiệu lực"
              }
              color={currentItem.TrangThai === "ACTIVE" ? "success" : "default"}
              size="small"
            />
          </Stack>
        }
        secondary={
          <Stack direction="row" spacing={1}>
            {isQLCL && (
              <>
                <Button
                  startIcon={<AddCircle size={18} />}
                  variant="contained"
                  color="success"
                  onClick={() => setCreateVersionOpen(true)}
                >
                  Tạo phiên bản mới
                </Button>
                <Button
                  startIcon={<Edit size={18} />}
                  variant="outlined"
                  onClick={() => navigate(`/quytrinh-iso/${id}/edit`)}
                >
                  Chỉnh sửa
                </Button>
              </>
            )}
            <Button
              startIcon={<ArrowLeft size={18} />}
              onClick={() => navigate("/quytrinh-iso")}
            >
              Quay lại
            </Button>
          </Stack>
        }
      >
        <Stack spacing={3}>
          {/* Basic Info */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Thông Tin Chung
              </Typography>

              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 500, width: 200 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Category2 size={18} color="#9e9e9e" />
                          <span>Tên Quy Trình</span>
                        </Stack>
                      </TableCell>
                      <TableCell>{currentItem.TenQuyTrinh}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 500 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Building size={18} color="#9e9e9e" />
                          <span>Khoa Xây Dựng</span>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {currentItem.KhoaXayDungID?.TenKhoa || "-"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 500 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Calendar size={18} color="#9e9e9e" />
                          <span>Ngày Hiệu Lực</span>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {currentItem.NgayHieuLuc
                          ? dayjs(currentItem.NgayHieuLuc).format("DD/MM/YYYY")
                          : "-"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 500 }}>Ghi Chú</TableCell>
                      <TableCell>
                        {currentItem.GhiChu || (
                          <Typography variant="body2" color="text.secondary">
                            Không có ghi chú
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
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
              borderColor: "error.main",
              bgcolor: "#fff5f5",
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Box
                  sx={{
                    bgcolor: "error.main",
                    color: "white",
                    p: 1.5,
                    borderRadius: 2,
                    display: "flex",
                  }}
                >
                  <DocumentDownload size={32} />
                </Box>
                <Box flex={1}>
                  <Typography variant="h6" fontWeight={600} color="error">
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
                    bgcolor: "error.main",
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
                                color="error"
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
              borderColor: "primary.main",
              bgcolor: "#f0f7ff",
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
                  <DocumentText1 size={32} />
                </Box>
                <Box flex={1}>
                  <Typography variant="h6" fontWeight={600} color="primary">
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
                    bgcolor: "primary.main",
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
                  {versions.map((ver) => (
                    <ListItem
                      key={ver._id}
                      button
                      onClick={() => navigate(`/quytrinh-iso/${ver._id}`)}
                      sx={{
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <ListItemText
                        primary={`Phiên bản ${ver.PhienBan}`}
                        secondary={
                          <>
                            Ngày hiệu lực:{" "}
                            {dayjs(ver.NgayHieuLuc).format("DD/MM/YYYY")} •{" "}
                            Khoa: {ver.KhoaXayDungID?.TenKhoa || "N/A"}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Stack>
      </MainCard>

      {/* PDF Viewer Dialog */}
      <Dialog
        open={pdfViewerOpen}
        onClose={handleClosePdfViewer}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{ sx: isMobile ? {} : { height: "90vh" } }}
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">
              {selectedPdf?.TenGoc || selectedPdf?.TenFile}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Tải xuống">
                <IconButton
                  onClick={() =>
                    selectedPdf?.downloadUrl &&
                    window.open(selectedPdf.downloadUrl, "_blank")
                  }
                >
                  <DocumentDownload size={20} />
                </IconButton>
              </Tooltip>
              <IconButton onClick={handleClosePdfViewer}>
                <CloseCircle size={20} />
              </IconButton>
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {pdfLoading ? (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              height={400}
            >
              <Typography color="text.secondary">Đang tải PDF...</Typography>
            </Box>
          ) : selectedPdf?.blobUrl ? (
            <iframe
              src={`${selectedPdf.blobUrl}#toolbar=0&navpanes=0`}
              title={selectedPdf.TenGoc || selectedPdf.TenFile}
              width="100%"
              height="100%"
              style={{ border: "none" }}
            />
          ) : (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              height={400}
            >
              <Typography color="text.secondary">
                Không thể hiển thị file PDF
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>

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
