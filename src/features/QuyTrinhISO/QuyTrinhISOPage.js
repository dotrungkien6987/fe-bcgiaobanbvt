import { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Skeleton,
  Fab,
  useMediaQuery,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Add,
  Eye,
  Edit,
  Trash,
  SearchNormal1,
  More,
  DocumentDownload,
  DocumentText1,
  FolderOpen,
} from "iconsax-react";
import dayjs from "dayjs";
import useAuth from "../../hooks/useAuth";
import { getQuyTrinhISOList, deleteQuyTrinhISO } from "./quyTrinhISOSlice";
import { getISOKhoa } from "../Daotao/Khoa/khoaSlice";
import NetworkError from "./components/NetworkError";
import ISOPageShell from "./components/ISOPageShell";
import ISOFilterBar from "./components/ISOFilterBar";
import ISOStatusChip from "./components/ISOStatusChip";
import { DistributionCount } from "./components/DistributionChips";
import DistributionDialogV2 from "./components/DistributionDialogV2";
import PDFQuickViewModal from "./components/PDFQuickViewModal";
import apiService from "../../app/apiService";

function QuyTrinhISOPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { items, total, page, size, isLoading, error } = useSelector(
    (state) => state.quyTrinhISO,
  );
  const { ISOKhoa: khoaList } = useSelector((state) => state.khoa);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedKhoa, setSelectedKhoa] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTrangThai, setSelectedTrangThai] = useState("");
  const [editDialog, setEditDialog] = useState({
    open: false,
    quyTrinh: null,
  });
  const [pdfModal, setPdfModal] = useState({ open: false, file: null });

  const isQLCL = ["qlcl", "admin", "superadmin"].includes(user?.PhanQuyen);

  // Column count for colSpan
  const colCount = isQLCL ? 10 : 7;

  // Build common params helper
  const buildParams = useCallback(
    (overrides = {}) => ({
      page,
      size,
      search: search || undefined,
      KhoaXayDungID: selectedKhoa?._id || undefined,
      TrangThai: selectedTrangThai || undefined,
      ...(isQLCL ? { includeDistribution: true } : {}),
      ...overrides,
    }),
    [page, size, search, selectedKhoa, selectedTrangThai, isQLCL],
  );

  // Fetch ISO Khoa list for filter
  useEffect(() => {
    dispatch(getISOKhoa());
  }, [dispatch]);

  // Set initial Khoa from URL param
  useEffect(() => {
    const khoaId = searchParams.get("KhoaXayDungID");
    if (khoaId && khoaList?.length > 0) {
      const found = khoaList.find((k) => k._id === khoaId);
      if (found) setSelectedKhoa(found);
    }
  }, [searchParams, khoaList]);

  const fetchData = useCallback(() => {
    dispatch(getQuyTrinhISOList(buildParams()));
  }, [dispatch, buildParams]);

  // Debounce search — wait 300ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(getQuyTrinhISOList(buildParams({ page: 1 })));
  };

  const handleKhoaChange = (_, newValue) => {
    setSelectedKhoa(newValue);
    if (newValue) {
      searchParams.set("KhoaXayDungID", newValue._id);
    } else {
      searchParams.delete("KhoaXayDungID");
    }
    setSearchParams(searchParams);
    dispatch(
      getQuyTrinhISOList(
        buildParams({ page: 1, KhoaXayDungID: newValue?._id || undefined }),
      ),
    );
  };

  const handleTrangThaiChange = (_, newValue) => {
    setSelectedTrangThai(newValue ?? "");
  };

  const handlePageChange = (_, newPage) => {
    dispatch(getQuyTrinhISOList(buildParams({ page: newPage + 1 })));
  };

  const handleRowsPerPageChange = (e) => {
    dispatch(
      getQuyTrinhISOList(
        buildParams({ page: 1, size: parseInt(e.target.value, 10) }),
      ),
    );
  };

  // Context menu handlers (non-QLCL)
  const handleMenuClick = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleView = () => {
    if (selectedItem) navigate(`/quytrinh-iso/${selectedItem._id}`);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    setAnchorEl(null);
  };

  const handleDeleteConfirm = async () => {
    if (selectedItem) {
      await dispatch(deleteQuyTrinhISO(selectedItem._id));
      setDeleteDialogOpen(false);
      setSelectedItem(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedItem(null);
  };

  // Distribution dialog handlers
  const handleEditDistribution = (item) => {
    setEditDialog({ open: true, quyTrinh: item });
  };

  const handleCloseEditDialog = () => {
    setEditDialog({ open: false, quyTrinh: null });
    fetchData();
  };

  // PDF quick view handler with cache
  const pdfCache = useRef({});
  const handleOpenPDF = async (quyTrinhId) => {
    if (pdfCache.current[quyTrinhId]) {
      setPdfModal({ open: true, file: pdfCache.current[quyTrinhId] });
      return;
    }
    try {
      const res = await apiService.get(`/quytrinhiso/${quyTrinhId}`);
      const pdfFile = res.data?.data?.files?.pdf?.[0];
      if (pdfFile) {
        pdfCache.current[quyTrinhId] = pdfFile;
        setPdfModal({ open: true, file: pdfFile });
      }
    } catch (err) {
      console.error("Error fetching PDF:", err);
    }
  };

  const handleClosePDF = () => {
    setPdfModal({ open: false, file: null });
  };

  // ── Sub-components ──────────────────────────────────────────

  const ErrorState = () => (
    <Box sx={{ py: 4 }}>
      <NetworkError message={error} onRetry={fetchData} />
    </Box>
  );

  const EmptyState = () => (
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
      <FolderOpen size={64} color="#9e9e9e" variant="Bulk" />
      <Typography variant="h6" color="text.secondary">
        Chưa có quy trình nào
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {selectedKhoa
          ? `Không tìm thấy quy trình cho khoa "${selectedKhoa.TenKhoa}"`
          : "Bắt đầu bằng cách thêm quy trình ISO đầu tiên"}
      </Typography>
      {isQLCL && (
        <Button
          variant="contained"
          startIcon={<Add size={18} />}
          onClick={() => navigate("/quytrinh-iso/create")}
          sx={{ mt: 1 }}
        >
          Thêm quy trình mới
        </Button>
      )}
    </Box>
  );

  const LoadingSkeleton = () => (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton width={80} />
          </TableCell>
          <TableCell>
            <Skeleton width="80%" />
          </TableCell>
          <TableCell align="center">
            <Skeleton width={50} />
          </TableCell>
          {isQLCL && (
            <TableCell align="center">
              <Skeleton width={70} />
            </TableCell>
          )}
          <TableCell>
            <Skeleton width={120} />
          </TableCell>
          <TableCell align="center">
            <Skeleton width={80} />
          </TableCell>
          {isQLCL && (
            <TableCell align="center">
              <Skeleton width={120} />
            </TableCell>
          )}
          <TableCell align="center">
            <Skeleton width={80} />
          </TableCell>
          <TableCell align="center">
            <Skeleton width={isQLCL ? 140 : 30} />
          </TableCell>
        </TableRow>
      ))}
    </>
  );

  const MobileLoadingSkeleton = () => (
    <Stack spacing={2}>
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} variant="outlined">
          <CardContent>
            <Stack spacing={1}>
              <Skeleton width="40%" height={24} />
              <Skeleton width="80%" />
              <Stack direction="row" spacing={1}>
                <Skeleton width={60} height={24} />
                <Skeleton width={100} height={24} />
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );

  const MobileCard = ({ item }) => (
    <Card
      variant="outlined"
      sx={{
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: "primary.main",
          bgcolor: "action.hover",
          transform: "translateY(-2px)",
          boxShadow: 4,
        },
      }}
      onClick={() => navigate(`/quytrinh-iso/${item._id}`)}
    >
      <CardContent sx={{ pb: "12px !important" }}>
        <Stack spacing={1}>
          {/* Header: Code + Version */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography fontWeight={600} color="primary.main">
              {item.MaQuyTrinh}
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Chip
                label={`v${item.PhienBan}`}
                size="small"
                color="primary"
                variant="outlined"
              />
              {isQLCL && <ISOStatusChip status={item.TrangThai} />}
            </Stack>
          </Stack>

          {/* Title */}
          <Typography
            variant="body2"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {item.TenQuyTrinh}
          </Typography>

          {/* Distribution (QLCL only) */}
          {isQLCL && (
            <Box onClick={(e) => e.stopPropagation()}>
              <DistributionCount
                count={item.KhoaPhanPhoi?.length || 0}
                onClick={() => handleEditDistribution(item)}
              />
            </Box>
          )}

          {/* Meta info */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={1}
          >
            <Typography variant="caption" color="text.secondary">
              {item.KhoaXayDungID?.TenKhoa || "-"} •{" "}
              {dayjs(item.NgayHieuLuc).format("DD/MM/YYYY")}
            </Typography>

            <Stack direction="row" spacing={0.5}>
              {item._fileCounts?.pdf > 0 && (
                <Chip
                  icon={<DocumentDownload size={12} color="#2e7d32" />}
                  label="PDF"
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: "0.7rem",
                    borderColor: "#2e7d32",
                    color: "#2e7d32",
                  }}
                  variant="outlined"
                />
              )}
              {item._fileCounts?.word > 0 && (
                <Chip
                  icon={<DocumentText1 size={12} color="#ed6c02" />}
                  label={item._fileCounts.word}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: "0.7rem",
                    borderColor: "#ed6c02",
                    color: "#ed6c02",
                  }}
                  variant="outlined"
                />
              )}
            </Stack>
          </Stack>

          {/* Actions row for QLCL */}
          {isQLCL && (
            <Stack
              direction="row"
              spacing={1}
              justifyContent="flex-end"
              sx={{ mt: 0.5 }}
            >
              {item._fileCounts?.pdf > 0 && (
                <Tooltip title="Xem PDF">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPDF(item._id);
                    }}
                  >
                    <DocumentText1 size={16} />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Chỉnh sửa">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/quytrinh-iso/${item._id}/edit`);
                  }}
                >
                  <Edit size={16} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Xóa">
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItem(item);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash size={16} />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );

  // ── Header search slot ──

  const searchSlot = (
    <Box component="form" onSubmit={handleSearchSubmit}>
      <TextField
        fullWidth
        placeholder="Tìm kiếm tên hoặc mã quy trình..."
        size="small"
        value={search}
        onChange={handleSearchChange}
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
    </Box>
  );

  // ── Table header cell style ──
  const thSx = {
    bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
    fontWeight: 700,
    fontSize: "0.8rem",
    whiteSpace: "nowrap",
    borderBottom: "2px solid",
    borderBottomColor: "primary.main",
  };

  return (
    <>
      <ISOPageShell
        title="Danh Sách Quy Trình ISO"
        subtitle={total > 0 ? `${total} quy trình` : "Quản lý quy trình ISO"}
        breadcrumbs={[
          { label: "Trang chủ", to: "/" },
          { label: "Quy trình ISO" },
        ]}
        maxWidth={false}
        headerActions={
          isQLCL && !isMobile ? (
            <Button
              variant="contained"
              startIcon={<Add size={18} />}
              onClick={() => navigate("/quytrinh-iso/create")}
              sx={{
                bgcolor: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(4px)",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "white",
                fontWeight: 600,
                "&:hover": { bgcolor: "rgba(255,255,255,0.28)" },
              }}
            >
              Thêm mới
            </Button>
          ) : null
        }
        searchSlot={searchSlot}
        subHeader={
          <ISOFilterBar
            showSearch={false}
            khoa={selectedKhoa}
            onKhoaChange={handleKhoaChange}
            khoaOptions={khoaList || []}
            trangThai={selectedTrangThai}
            onTrangThaiChange={handleTrangThaiChange}
            showTrangThai={isQLCL}
          />
        }
      >
        {/* Mobile Card View */}
        {isMobile ? (
          <>
            {isLoading ? (
              <MobileLoadingSkeleton />
            ) : error ? (
              <ErrorState />
            ) : items.length === 0 ? (
              <EmptyState />
            ) : (
              <Stack spacing={2}>
                {items.map((item) => (
                  <MobileCard key={item._id} item={item} />
                ))}
              </Stack>
            )}

            {items.length > 0 && (
              <TablePagination
                component="div"
                count={total}
                page={page - 1}
                onPageChange={handlePageChange}
                rowsPerPage={size}
                onRowsPerPageChange={handleRowsPerPageChange}
                rowsPerPageOptions={[10, 20, 50]}
                labelRowsPerPage=""
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} / ${count}`
                }
              />
            )}
          </>
        ) : (
          /* ── Desktop Table View ── */
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
                    <TableCell sx={{ ...thSx, width: 120 }}>Mã QT</TableCell>
                    <TableCell sx={thSx}>Tên Quy Trình</TableCell>
                    <TableCell align="center" sx={{ ...thSx, width: 90 }}>
                      Phiên Bản
                    </TableCell>
                    {isQLCL && (
                      <TableCell align="center" sx={{ ...thSx, width: 110 }}>
                        Trạng thái
                      </TableCell>
                    )}
                    <TableCell sx={{ ...thSx, width: 180 }}>
                      Khoa Xây Dựng
                    </TableCell>
                    <TableCell align="center" sx={{ ...thSx, width: 120 }}>
                      Ngày Hiệu Lực
                    </TableCell>
                    {isQLCL && (
                      <TableCell align="center" sx={{ ...thSx, width: 200 }}>
                        Phân Phối
                      </TableCell>
                    )}
                    <TableCell align="center" sx={{ ...thSx, width: 130 }}>
                      Files
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ ...thSx, width: isQLCL ? 140 : 60 }}
                    >
                      {isQLCL ? "Thao tác" : ""}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <LoadingSkeleton />
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={colCount}>
                        <ErrorState />
                      </TableCell>
                    </TableRow>
                  ) : items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={colCount}>
                        <EmptyState />
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow
                        key={item._id}
                        hover
                        sx={{
                          cursor: "pointer",
                          borderLeft: "4px solid transparent",
                          transition: "all 0.15s ease",
                          "&:nth-of-type(even)": {
                            bgcolor: (t) => alpha(t.palette.grey[500], 0.03),
                          },
                          "&:hover": {
                            borderLeftColor: "primary.main",
                            bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
                          },
                        }}
                        onClick={() => navigate(`/quytrinh-iso/${item._id}`)}
                      >
                        {/* Mã QT */}
                        <TableCell>
                          <Typography
                            fontWeight={600}
                            color="primary.main"
                            fontSize="0.85rem"
                          >
                            {item.MaQuyTrinh}
                          </Typography>
                        </TableCell>

                        {/* Tên Quy Trình */}
                        <TableCell>
                          <Typography
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.TenQuyTrinh}
                          </Typography>
                        </TableCell>

                        {/* Phiên Bản */}
                        <TableCell align="center">
                          <Chip
                            label={`v${item.PhienBan}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ height: 22, fontSize: "0.75rem" }}
                          />
                        </TableCell>

                        {/* Trạng thái (QLCL) */}
                        {isQLCL && (
                          <TableCell align="center">
                            <ISOStatusChip status={item.TrangThai} />
                          </TableCell>
                        )}

                        {/* Khoa Xây Dựng */}
                        <TableCell>
                          <Typography variant="body2">
                            {item.KhoaXayDungID?.TenKhoa || "-"}
                          </Typography>
                        </TableCell>

                        {/* Ngày Hiệu Lực */}
                        <TableCell align="center">
                          <Typography variant="body2">
                            {dayjs(item.NgayHieuLuc).format("DD/MM/YYYY")}
                          </Typography>
                        </TableCell>

                        {/* Phân Phối (QLCL) */}
                        {isQLCL && (
                          <TableCell
                            align="center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DistributionCount
                              count={item.KhoaPhanPhoi?.length || 0}
                              onClick={() => handleEditDistribution(item)}
                            />
                          </TableCell>
                        )}

                        {/* Files */}
                        <TableCell align="center">
                          <Stack
                            direction="row"
                            spacing={0.5}
                            justifyContent="center"
                          >
                            {item._fileCounts?.pdf > 0 && (
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
                            {item._fileCounts?.word > 0 && (
                              <Tooltip
                                title={`${item._fileCounts.word} file Word`}
                              >
                                <Chip
                                  label={`Word ×${item._fileCounts.word}`}
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

                        {/* Thao tác */}
                        <TableCell
                          align="center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {isQLCL ? (
                            <Stack
                              direction="row"
                              spacing={0.25}
                              justifyContent="center"
                            >
                              <Tooltip title="Xem chi tiết">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    navigate(`/quytrinh-iso/${item._id}`)
                                  }
                                >
                                  <Eye size={17} />
                                </IconButton>
                              </Tooltip>
                              {item._fileCounts?.pdf > 0 && (
                                <Tooltip title="Xem PDF nhanh">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenPDF(item._id)}
                                  >
                                    <DocumentText1 size={17} />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="Chỉnh sửa">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    navigate(`/quytrinh-iso/${item._id}/edit`)
                                  }
                                >
                                  <Edit size={17} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Xóa">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    setSelectedItem(item);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash size={17} />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          ) : (
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuClick(e, item)}
                            >
                              <More size={18} />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={total}
              page={page - 1}
              onPageChange={handlePageChange}
              rowsPerPage={size}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[10, 20, 50]}
              labelRowsPerPage="Hiển thị:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} của ${count}`
              }
            />
          </Paper>
        )}
      </ISOPageShell>

      {/* Context Menu (non-QLCL only) */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>
          <Eye size={18} style={{ marginRight: 8 }} />
          Xem chi tiết
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc muốn xóa quy trình{" "}
            <strong>
              {selectedItem?.MaQuyTrinh} - {selectedItem?.TenQuyTrinh}
            </strong>
            ? Hành động này không thể hoàn tác.
          </DialogContentText>
          {selectedItem?.KhoaPhanPhoi?.length > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Quy trình này đang được phân phối cho{" "}
              <strong>{selectedItem.KhoaPhanPhoi.length} khoa</strong>. Các bản
              ghi phân phối sẽ bị xóa cùng.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Hủy</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Distribution Dialog */}
      <DistributionDialogV2
        open={editDialog.open}
        onClose={handleCloseEditDialog}
        quyTrinh={editDialog.quyTrinh}
      />

      {/* PDF Quick View Modal */}
      <PDFQuickViewModal
        open={pdfModal.open}
        onClose={handleClosePDF}
        file={pdfModal.file}
      />

      {/* FAB for mobile */}
      {isQLCL && isMobile && (
        <Fab
          color="primary"
          aria-label="Thêm mới"
          onClick={() => navigate("/quytrinh-iso/create")}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
        >
          <Add size={24} />
        </Fab>
      )}
    </>
  );
}

export default QuyTrinhISOPage;
