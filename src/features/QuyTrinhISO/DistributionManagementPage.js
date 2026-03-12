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
import {
  SearchNormal1,
  Edit2,
  Eye,
  DocumentText1,
  ArrowLeft,
} from "iconsax-react";
import { getDistributionList } from "./quyTrinhISOSlice";
import { getISOKhoa } from "../Daotao/Khoa/khoaSlice";
import DistributionDialogV2 from "./components/DistributionDialogV2";
import DistributionChips from "./components/DistributionChips";
import PDFQuickViewModal from "./components/PDFQuickViewModal";
import ISOPageShell from "./components/ISOPageShell";
import ISOFilterBar from "./components/ISOFilterBar";
import useAuth from "../../hooks/useAuth";
import apiService from "../../app/apiService";

function DistributionManagementPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user } = useAuth();

  const { distributionList, distributionLoading, distributionPagination } =
    useSelector((state) => state.quyTrinhISO);
  const { ISOKhoa: allKhoa } = useSelector((state) => state.khoa);

  const [search, setSearch] = useState("");
  const [khoaFilter, setKhoaFilter] = useState("");
  const [page, setPage] = useState(1);
  const [editDialog, setEditDialog] = useState({ open: false, quyTrinh: null });
  const [pdfModal, setPdfModal] = useState({ open: false, file: null });

  // Check permission
  const isQLCL = ["qlcl", "admin", "superadmin"].includes(
    user?.PhanQuyen?.toLowerCase(),
  );

  const fetchData = useCallback(() => {
    dispatch(
      getDistributionList({
        page,
        search: search || undefined,
        khoaXayDungId: khoaFilter || undefined,
      }),
    );
  }, [dispatch, page, search, khoaFilter]);

  useEffect(() => {
    if (!isQLCL) {
      navigate("/quytrinh-iso");
      return;
    }
    fetchData();
  }, [isQLCL, navigate, fetchData]);

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

  const handleEditDistribution = (quyTrinh) => {
    setEditDialog({ open: true, quyTrinh });
  };

  const handleCloseEditDialog = () => {
    setEditDialog({ open: false, quyTrinh: null });
    fetchData(); // Refresh after edit
  };

  const handleViewDetail = (id) => {
    navigate(`/quytrinh-iso/${id}`);
  };

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

  if (!isQLCL) {
    return null;
  }

  return (
    <ISOPageShell
      title="Quản Lý Phân Phối Quy Trình ISO"
      subtitle="Quản lý phân phối quy trình cho các khoa/phòng ban"
      breadcrumbs={[
        { label: "Trang chủ", to: "/" },
        { label: "Quy trình ISO", to: "/quytrinh-iso" },
        { label: "Phân phối" },
      ]}
      subHeader={
        <ISOFilterBar
          search={search}
          onSearchChange={handleSearch}
          khoa={khoaFilter}
          onKhoaChange={(val) => {
            setKhoaFilter(val);
            setPage(1);
          }}
          khoaOptions={allKhoa || []}
          showTrangThai={false}
        />
      }
    >
      {/* Mobile: Card view */}
      {isMobile ? (
        <Stack spacing={2} sx={{ px: 1 }}>
          {distributionLoading ? (
            [...Array(5)].map((_, i) => (
              <Card key={i} sx={{ p: 2 }}>
                <Skeleton variant="text" width="40%" height={24} />
                <Skeleton variant="text" width="100%" height={20} />
                <Skeleton variant="text" width="60%" height={18} />
              </Card>
            ))
          ) : distributionList.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">
                Không có quy trình nào
              </Typography>
            </Paper>
          ) : (
            distributionList.map((qt) => (
              <Card key={qt._id} sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography fontWeight="bold" variant="subtitle2">
                      {qt.MaQuyTrinh}
                      <Chip
                        label={`v${qt.PhienBan}`}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                    <Stack direction="row" spacing={0.5}>
                      {qt._fileCounts?.pdf > 0 && (
                        <Chip
                          label={`${qt._fileCounts.pdf} PDF`}
                          size="small"
                          sx={{
                            bgcolor: "#e3f2fd",
                            color: "#1565c0",
                            fontWeight: 600,
                          }}
                        />
                      )}
                      {qt._fileCounts?.word > 0 && (
                        <Chip
                          label={`${qt._fileCounts.word} Word`}
                          size="small"
                          sx={{
                            bgcolor: "#fff3e0",
                            color: "#e65100",
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Stack>
                  </Stack>
                  <Typography variant="body2" noWrap>
                    {qt.TenQuyTrinh}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {qt.KhoaXayDungID?.TenKhoa || "N/A"}
                  </Typography>
                  <DistributionChips
                    khoaList={qt.KhoaPhanPhoi}
                    maxDisplay={3}
                  />
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <IconButton
                      size="small"
                      onClick={() => handleViewDetail(qt._id)}
                    >
                      <Eye size={18} />
                    </IconButton>
                    {qt._fileCounts?.pdf > 0 && (
                      <IconButton
                        size="small"
                        onClick={() => handleOpenPDF(qt._id)}
                      >
                        <DocumentText1 size={18} />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEditDistribution(qt)}
                    >
                      <Edit2 size={18} />
                    </IconButton>
                  </Stack>
                </Stack>
              </Card>
            ))
          )}
        </Stack>
      ) : (
        /* Desktop: Table view */
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell sx={{ fontWeight: 700 }}>Mã QT</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Tên Quy Trình</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Phiên bản</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Khoa Xây Dựng</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  Phân Phối
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  Files
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {distributionLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(7)].map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : distributionList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary" py={4}>
                      Không có quy trình nào
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                distributionList.map((qt) => (
                  <TableRow key={qt._id} hover>
                    <TableCell>
                      <Typography fontWeight="bold">{qt.MaQuyTrinh}</Typography>
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
                    <TableCell>{qt.KhoaXayDungID?.TenKhoa || "N/A"}</TableCell>
                    <TableCell align="center">
                      <DistributionChips
                        khoaList={qt.KhoaPhanPhoi}
                        maxDisplay={2}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack
                        direction="row"
                        spacing={0.5}
                        justifyContent="center"
                      >
                        {qt._fileCounts?.pdf > 0 && (
                          <Chip
                            label={`${qt._fileCounts.pdf} PDF`}
                            size="small"
                            sx={{
                              bgcolor: "#e3f2fd",
                              color: "#1565c0",
                              fontWeight: 600,
                            }}
                          />
                        )}
                        {qt._fileCounts?.word > 0 && (
                          <Chip
                            label={`${qt._fileCounts.word} Word`}
                            size="small"
                            sx={{
                              bgcolor: "#fff3e0",
                              color: "#e65100",
                              fontWeight: 600,
                            }}
                          />
                        )}
                      </Stack>
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
                        {qt._fileCounts?.pdf > 0 && (
                          <Tooltip title="Xem PDF">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenPDF(qt._id)}
                            >
                              <DocumentText1 size={18} />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Chỉnh sửa phân phối">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditDistribution(qt)}
                          >
                            <Edit2 size={18} />
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

      {/* Distribution Dialog */}
      <DistributionDialogV2
        open={editDialog.open}
        onClose={handleCloseEditDialog}
        quyTrinh={editDialog.quyTrinh}
      />

      {/* PDF Modal */}
      <PDFQuickViewModal
        open={pdfModal.open}
        onClose={() => setPdfModal({ open: false, file: null })}
        file={pdfModal.file}
      />
    </ISOPageShell>
  );
}

export default DistributionManagementPage;
