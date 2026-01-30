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
import { SearchNormal1, Eye, DocumentText1, ArrowLeft } from "iconsax-react";
import { getDistributedToMe } from "./quyTrinhISOSlice";
import { getISOKhoa } from "../Daotao/Khoa/khoaSlice";
import PDFQuickViewModal from "./components/PDFQuickViewModal";
import useAuth from "../../hooks/useAuth";
import dayjs from "dayjs";

function DistributedToMePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { distributedToMe, distributionLoading, distributionPagination } =
    useSelector((state) => state.quyTrinhISO);
  const { ISOKhoa: allKhoa } = useSelector((state) => state.khoa);

  const [search, setSearch] = useState("");
  const [khoaFilter, setKhoaFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pdfModal, setPdfModal] = useState({ open: false, file: null });

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

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <IconButton onClick={() => navigate("/quytrinh-iso")}>
          <ArrowLeft />
        </IconButton>
        <Box>
          <Typography variant="h4">📥 Quy Trình ISO Được Phân Phối</Typography>
          <Typography variant="body2" color="text.secondary">
            Khoa của bạn: <strong>{userKhoaName}</strong>
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
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography fontWeight="bold">{qt.MaQuyTrinh}</Typography>
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
                  <TableCell>{qt.KhoaXayDungID?.TenKhoa || "N/A"}</TableCell>
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
                          onClick={() => handleOpenPDF(qt._id)}
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

      {/* PDF Modal */}
      <PDFQuickViewModal
        open={pdfModal.open}
        onClose={() => setPdfModal({ open: false, file: null })}
        file={pdfModal.file}
      />
    </Container>
  );
}

export default DistributedToMePage;
