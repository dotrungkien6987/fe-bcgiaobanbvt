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
import useAuth from "../../hooks/useAuth";

function DistributionManagementPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
    // Fetch detail to get PDF file
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

  if (!isQLCL) {
    return null;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <IconButton onClick={() => navigate("/quytrinh-iso")}>
          <ArrowLeft />
        </IconButton>
        <Box>
          <Typography variant="h4">
            🎯 Quản Lý Phân Phối Quy Trình ISO
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý phân phối quy trình cho các khoa/phòng ban
          </Typography>
        </Box>
      </Stack>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              placeholder="Tìm mã/tên quy trình..."
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
              sx={{ minWidth: 300 }}
            />
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

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã QT</TableCell>
              <TableCell>Tên Quy Trình</TableCell>
              <TableCell>Phiên bản</TableCell>
              <TableCell>Khoa Xây Dựng</TableCell>
              <TableCell align="center">Phân Phối</TableCell>
              <TableCell align="center">Files</TableCell>
              <TableCell align="center">Thao tác</TableCell>
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
                          label={`📄 ${qt._fileCounts.pdf}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {qt._fileCounts?.word > 0 && (
                        <Chip
                          label={`📝 ${qt._fileCounts.word}`}
                          size="small"
                          variant="outlined"
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
    </Container>
  );
}

export default DistributionManagementPage;
