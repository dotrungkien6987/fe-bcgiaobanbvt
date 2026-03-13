import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  Stack,
  TextField,
  InputAdornment,
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
  Typography,
  useMediaQuery,
  useTheme,
  alpha,
} from "@mui/material";
import { SearchNormal1, Eye, DocumentText1 } from "iconsax-react";
import { getBuiltByMyDept } from "./quyTrinhISOSlice";
import { getISOKhoa } from "../Daotao/Khoa/khoaSlice";
import DistributionChips from "./components/DistributionChips";
import PDFQuickViewModal from "./components/PDFQuickViewModal";
import ISOProcedureCard from "./components/ISOProcedureCard";
import DownloadBottomSheet from "./components/DownloadBottomSheet";
import ISOPageShell from "./components/ISOPageShell";
import useAuth from "../../hooks/useAuth";
import apiService from "../../app/apiService";
import dayjs from "dayjs";

function BuiltByMyDeptPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { builtByMyDept, distributionLoading, distributionPagination } =
    useSelector((state) => state.quyTrinhISO);
  const { ISOKhoa: allKhoa } = useSelector((state) => state.khoa);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pdfModal, setPdfModal] = useState({ open: false, file: null });
  const [downloadSheet, setDownloadSheet] = useState({
    open: false,
    quyTrinh: null,
  });

  const fetchData = useCallback(() => {
    dispatch(
      getBuiltByMyDept({
        page,
        search: search || undefined,
      }),
    );
  }, [dispatch, page, search]);

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
      const res = await apiService.get(`/quytrinhiso/${quyTrinhId}`);
      const pdfFile = res.data?.data?.files?.pdf?.[0];
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
  const totalCount = builtByMyDept.length;
  const totalDistributions = builtByMyDept.reduce(
    (sum, qt) => sum + (qt.KhoaPhanPhoi?.length || 0),
    0,
  );
  const newCount = builtByMyDept.filter((qt) => {
    const createdDate = dayjs(qt.createdAt);
    return dayjs().diff(createdDate, "day") <= 30;
  }).length;

  return (
    <ISOPageShell
      title="QT ISO Khoa Xây Dựng"
      subtitle={`Quy trình của: ${userKhoaName}`}
      breadcrumbs={[
        { label: "Trang chủ", to: "/" },
        { label: "Quy trình ISO", to: "/quytrinh-iso" },
        { label: "Khoa xây dựng" },
      ]}
      searchSlot={
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
      }
      subHeader={
        <Box sx={{ px: 2, py: 1.5 }}>
          <Stack direction="row" spacing={4} justifyContent="space-around">
            <Box textAlign="center">
              <Typography variant="h6" fontWeight={700} color="primary.main">
                {totalCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tổng QT
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ color: "info.main" }}
              >
                {totalDistributions}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Phân phối
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
          </Stack>
        </Box>
      }
    >
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
              ) : builtByMyDept.length === 0 ? (
                <Box
                  sx={{
                    py: 8,
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <DocumentText1 size={64} color="#9e9e9e" variant="Bulk" />
                  <Typography variant="h6" color="text.secondary">
                    Chưa có quy trình nào
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {userKhoaName} chưa xây dựng quy trình ISO nào. Liên hệ QLCL
                    để được hướng dẫn.
                  </Typography>
                </Box>
              ) : (
                builtByMyDept.map((qt) => (
                  <ISOProcedureCard
                    key={qt._id}
                    quyTrinh={qt}
                    onViewPDF={handleViewPDFFromCard}
                    onDownload={handleDownload}
                    showDistributionCount={true}
                  />
                ))
              )}
            </Stack>
          </Box>
        ) : (
          <Paper
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
            }}
          >
            <TableContainer>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {[
                      { label: "Mã QT" },
                      { label: "Tên Quy Trình" },
                      { label: "Phiên bản", width: 90, align: "center" },
                      { label: "Phân Phối Cho", width: 200, align: "center" },
                      { label: "Files", width: 130, align: "center" },
                      { label: "Thao tác", width: 100, align: "center" },
                    ].map((col) => (
                      <TableCell
                        key={col.label}
                        align={col.align || "left"}
                        sx={{
                          bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
                          fontWeight: 700,
                          fontSize: "0.8rem",
                          whiteSpace: "nowrap",
                          borderBottom: "2px solid",
                          borderBottomColor: "primary.main",
                          ...(col.width && { width: col.width }),
                        }}
                      >
                        {col.label}
                      </TableCell>
                    ))}
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
                  ) : builtByMyDept.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Box
                          sx={{
                            py: 6,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <DocumentText1
                            size={52}
                            color="#9e9e9e"
                            variant="Bulk"
                          />
                          <Typography variant="h6" color="text.secondary">
                            Chưa có quy trình nào
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {userKhoaName} chưa xây dựng quy trình ISO nào.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    builtByMyDept.map((qt, idx) => (
                      <TableRow
                        key={qt._id}
                        hover
                        sx={{
                          cursor: "pointer",
                          borderLeft: "4px solid transparent",
                          transition: "all 0.15s ease",
                          ...(idx % 2 === 1 && {
                            bgcolor: (t) => alpha(t.palette.grey[500], 0.03),
                          }),
                          "&:hover": {
                            borderLeftColor: "primary.main",
                            bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
                          },
                        }}
                        onClick={() => handleViewDetail(qt._id)}
                      >
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          <Typography
                            fontWeight={600}
                            color="primary.main"
                            fontSize="0.85rem"
                            noWrap
                          >
                            {qt.MaQuyTrinh}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {qt.TenQuyTrinh}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`v${qt.PhienBan}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ height: 22, fontSize: "0.75rem" }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <DistributionChips
                            khoaList={qt.KhoaPhanPhoi}
                            maxDisplay={3}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Stack
                            direction="row"
                            spacing={0.5}
                            justifyContent="center"
                          >
                            {qt.FilePDF && (
                              <Tooltip title="Có file PDF">
                                <Chip
                                  label="PDF"
                                  size="small"
                                  sx={{
                                    bgcolor: "#e3f2fd",
                                    color: "#1565c0",
                                    fontWeight: 600,
                                    height: 22,
                                    fontSize: "0.7rem",
                                  }}
                                />
                              </Tooltip>
                            )}
                            {qt.FileWord && (
                              <Tooltip title="Có file Word">
                                <Chip
                                  label="Word"
                                  size="small"
                                  sx={{
                                    bgcolor: "#fff3e0",
                                    color: "#e65100",
                                    fontWeight: 600,
                                    height: 22,
                                    fontSize: "0.7rem",
                                  }}
                                />
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          <Stack
                            direction="row"
                            spacing={0.25}
                            justifyContent="center"
                          >
                            <Tooltip title="Xem chi tiết">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetail(qt._id);
                                }}
                              >
                                <Eye size={18} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xem PDF">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  qt.FilePDF
                                    ? handleViewPDFFromCard(qt.FilePDF)
                                    : handleOpenPDF(qt._id);
                                }}
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
          </Paper>
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
    </ISOPageShell>
  );
}

export default BuiltByMyDeptPage;
