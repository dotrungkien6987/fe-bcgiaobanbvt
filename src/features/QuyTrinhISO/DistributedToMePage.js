import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Stack,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Pagination,
  Chip,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { SearchNormal1, Eye, DocumentText1, ArrowLeft } from "iconsax-react";
import { getDistributedToMe } from "./quyTrinhISOSlice";
import { getISOKhoa } from "../Daotao/Khoa/khoaSlice";
import PDFQuickViewModal from "./components/PDFQuickViewModal";
import ISOProcedureCard from "./components/ISOProcedureCard";
import DownloadBottomSheet from "./components/DownloadBottomSheet";
import useAuth from "../../hooks/useAuth";
import dayjs from "dayjs";
import apiService from "../../app/apiService";

function DistributedToMePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { distributedToMe, distributionLoading, distributionPagination } =
    useSelector((state) => state.quyTrinhISO);
  const { ISOKhoa: allKhoa } = useSelector((state) => state.khoa);

  const [search, setSearch] = useState("");
  const [khoaFilter, setKhoaFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pdfModal, setPdfModal] = useState({ open: false, file: null });
  const [downloadSheet, setDownloadSheet] = useState({
    open: false,
    quyTrinh: null,
  });

  const fetchData = useCallback(() => {
    dispatch(
      getDistributedToMe({
        page,
        search: search || undefined,
        khoaXayDungId: khoaFilter || undefined,
      }),
    );
  }, [dispatch, page, search, khoaFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!allKhoa || allKhoa.length === 0) {
      dispatch(getISOKhoa());
    }
  }, [dispatch, allKhoa]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleKhoaFilter = (e) => {
    setKhoaFilter(e.target.value);
    setPage(1);
  };

  const handleViewDetail = (id) => {
    navigate(`/quytrinh-iso/${id}`);
  };

  // Direct download helper
  const downloadFile = async (file) => {
    if (!file?._id) return;
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

  // Handle download button click
  const handleDownload = (quyTrinh) => {
    // If only PDF exists, download directly
    if (quyTrinh.FilePDF && !quyTrinh.FileWord) {
      downloadFile(quyTrinh.FilePDF);
      return;
    }
    // If both files exist, show bottom sheet
    if (quyTrinh.FilePDF || quyTrinh.FileWord) {
      setDownloadSheet({ open: true, quyTrinh });
    }
  };

  // Handle view PDF from card (uses FilePDF directly from list data)
  const handleViewPDFFromCard = (file) => {
    setPdfModal({ open: true, file });
  };

  // Legacy: fetch PDF from detail (for table view)
  const handleOpenPDF = async (quyTrinhId) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_API}/quytrinhiso/${quyTrinhId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      );
      const data = await res.json();
      const pdfFile = data.data?.files?.pdf?.[0];
      if (pdfFile) {
        setPdfModal({ open: true, file: pdfFile });
      }
    } catch (error) {
      console.error("Error fetching PDF:", error);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchData, page]);

  // Get user's department name
  const userKhoaName =
    allKhoa?.find((k) => k._id === user?.KhoaID)?.TenKhoa || "Khoa của bạn";

  // Calculate stats
  const totalCount = distributedToMe.length;
  const newCount = distributedToMe.filter((qt) => {
    const distributionDate = dayjs(qt.NgayPhanPhoi);
    return dayjs().diff(distributionDate, "day") <= 30;
  }).length;
  const uniqueKhoaCount = new Set(
    distributedToMe.map((qt) => qt.KhoaXayDung?._id),
  ).size;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "secondary.lighter",
        pb: { xs: 10, md: 0 },
      }}
    >
      {/* Gradient Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          pt: 2,
          pb: 3,
          px: 2,
        }}
      >
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <IconButton
              onClick={() => navigate("/quytrinh-iso")}
              sx={{
                color: "white",
                bgcolor: "rgba(255, 255, 255, 0.15)",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.25)" },
              }}
            >
              <ArrowLeft size={20} />
            </IconButton>
            <Box flex={1}>
              <Typography
                variant="h6"
                fontWeight={700}
                color="white"
                sx={{ fontSize: isMobile ? "1.1rem" : "1.5rem" }}
              >
                📥 QT ISO Được Phân Phối
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "0.8rem" }}
              >
                Khoa: <strong>{userKhoaName}</strong>
              </Typography>
            </Box>
          </Stack>

          {/* Integrated Search */}
          <TextField
            fullWidth
            placeholder="Tìm mã hoặc tên quy trình..."
            size="small"
            value={search}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchNormal1 size={18} />
                </InputAdornment>
              ),
            }}
            sx={{
              bgcolor: "white",
              borderRadius: 2,
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "transparent" },
              },
            }}
          />
        </Container>
      </Box>

      {/* Stats Bar - Mobile Only */}
      {isMobile && (
        <Box
          sx={{
            bgcolor: "background.paper",
            py: 2,
            mb: 1,
            borderTop: "1px solid",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ px: 2 }}>
            <Stack direction="row" spacing={2} justifyContent="space-around">
              <Box textAlign="center">
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  {totalCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Tổng số
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ color: "success.main" }}
                >
                  {newCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Mới (30d)
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ color: "info.main" }}
                >
                  {uniqueKhoaCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Khoa
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>
      )}

      {/* Filters - Desktop */}
      {!isMobile && (
        <Container maxWidth="xl" sx={{ mt: 3 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Khoa xây dựng</InputLabel>
                  <Select
                    value={khoaFilter}
                    onChange={handleKhoaFilter}
                    label="Khoa xây dựng"
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    {(allKhoa || []).map((khoa) => (
                      <MenuItem key={khoa._id} value={khoa._id}>
                        {khoa.TenKhoa}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      )}

      {/* Mobile Filter - Below Stats */}
      {isMobile && (
        <Box
          sx={{
            bgcolor: "background.paper",
            py: 2,
            mb: 1,
            borderTop: "1px solid",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ px: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Khoa xây dựng</InputLabel>
              <Select
                value={khoaFilter}
                onChange={handleKhoaFilter}
                label="Khoa xây dựng"
                sx={{ bgcolor: "white" }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {(allKhoa || []).map((khoa) => (
                  <MenuItem key={khoa._id} value={khoa._id}>
                    {khoa.TenKhoa}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      )}

      {/* Content Section */}
      <Box sx={{ px: { xs: 0, md: 3 }, maxWidth: "lg", mx: "auto" }}>
        {/* Mobile: Card List */}
        {isMobile ? (
          <Box
            sx={{
              bgcolor: "background.paper",
              py: 2,
              borderTop: "1px solid",
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack spacing={2} sx={{ px: 2 }}>
              {distributionLoading ? (
                // Loading skeletons
                [...Array(5)].map((_, i) => (
                  <Card key={i} sx={{ p: 2 }}>
                    <Skeleton variant="text" width="40%" height={24} />
                    <Skeleton variant="text" width="100%" height={20} />
                    <Skeleton variant="text" width="60%" height={18} />
                    <Stack direction="row" spacing={1} mt={2}>
                      <Skeleton variant="rounded" width="50%" height={44} />
                      <Skeleton variant="rounded" width="50%" height={44} />
                    </Stack>
                  </Card>
                ))
              ) : distributedToMe.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: "center" }}>
                  <Typography color="text.secondary">
                    Chưa có quy trình nào được phân phối cho khoa của bạn
                  </Typography>
                </Paper>
              ) : (
                distributedToMe.map((qt) => (
                  <ISOProcedureCard
                    key={qt._id}
                    quyTrinh={qt}
                    onViewPDF={handleViewPDFFromCard}
                    onDownload={handleDownload}
                    showDistributionDate={true}
                  />
                ))
              )}
            </Stack>
          </Box>
        ) : (
          /* Desktop: Table */
          <Container maxWidth="xl" sx={{ px: 3 }}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Mã QT</TableCell>
                    <TableCell>Tên Quy Trình</TableCell>
                    <TableCell>Phiên bản</TableCell>
                    <TableCell>Khoa Xây Dựng</TableCell>
                    <TableCell>Ngày Phân Phối</TableCell>
                    <TableCell align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {distributionLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(6)].map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : distributedToMe.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="text.secondary" py={4}>
                          Chưa có quy trình nào được phân phối cho khoa của bạn
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    distributedToMe.map((qt) => (
                      <TableRow key={qt._id} hover>
                        <TableCell>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            <Typography fontWeight="bold">
                              {qt.MaQuyTrinh}
                            </Typography>
                            {qt.isNew && (
                              <Chip
                                label="Mới"
                                size="small"
                                color="success"
                                sx={{ height: 20, fontSize: "0.7rem" }}
                              />
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography
                            sx={{
                              maxWidth: 300,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {qt.TenQuyTrinh}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={`v${qt.PhienBan}`} size="small" />
                        </TableCell>
                        <TableCell>
                          {qt.KhoaXayDungID?.TenKhoa || "N/A"}
                        </TableCell>
                        <TableCell>
                          {qt.NgayPhanPhoi
                            ? dayjs(qt.NgayPhanPhoi).format("DD/MM/YYYY")
                            : "N/A"}
                        </TableCell>
                        <TableCell align="center">
                          <Stack
                            direction="row"
                            spacing={0.5}
                            justifyContent="center"
                          >
                            <Tooltip title="Xem chi tiết">
                              <IconButton
                                size="small"
                                onClick={() => handleViewDetail(qt._id)}
                              >
                                <Eye size={18} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xem PDF">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  qt.FilePDF
                                    ? handleViewPDFFromCard(qt.FilePDF)
                                    : handleOpenPDF(qt._id)
                                }
                              >
                                <DocumentText1 size={18} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Container>
        )}

        {/* Pagination */}
        {distributionPagination.totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={distributionPagination.totalPages}
              page={page}
              onChange={(_, p) => setPage(p)}
              color="primary"
            />
          </Box>
        )}
      </Box>

      {/* PDF Modal */}
      <PDFQuickViewModal
        open={pdfModal.open}
        onClose={() => setPdfModal({ open: false, file: null })}
        file={pdfModal.file}
      />

      {/* Download Bottom Sheet */}
      <DownloadBottomSheet
        open={downloadSheet.open}
        onClose={() => setDownloadSheet({ open: false, quyTrinh: null })}
        filePDF={downloadSheet.quyTrinh?.FilePDF}
        fileWord={downloadSheet.quyTrinh?.FileWord}
        quyTrinhName={downloadSheet.quyTrinh?.TenQuyTrinh || ""}
      />
    </Box>
  );
}

export default DistributedToMePage;
