import { useEffect, useState, useCallback } from "react";
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
  Autocomplete,
  Breadcrumbs,
  Link,
  Skeleton,
  Fab,
  useMediaQuery,
  useTheme,
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
  Home2,
  FolderOpen,
} from "iconsax-react";
import dayjs from "dayjs";
import useAuth from "../../hooks/useAuth";
import MainCard from "../../components/MainCard";
import { getQuyTrinhISOList, deleteQuyTrinhISO } from "./quyTrinhISOSlice";
import { getISOKhoa } from "../Daotao/Khoa/khoaSlice";
import NetworkError from "./components/NetworkError";

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
  const { khoaList } = useSelector((state) => state.khoa);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedKhoa, setSelectedKhoa] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isQLCL = ["qlcl", "admin", "superadmin"].includes(user?.PhanQuyen);

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
    const params = {
      page,
      size,
      search: search || undefined,
      KhoaXayDungID: selectedKhoa?._id || undefined,
    };
    dispatch(getQuyTrinhISOList(params));
  }, [dispatch, page, size, search, selectedKhoa]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(
      getQuyTrinhISOList({
        page: 1,
        size,
        search: search || undefined,
        KhoaXayDungID: selectedKhoa?._id || undefined,
      }),
    );
  };

  const handleKhoaChange = (_, newValue) => {
    setSelectedKhoa(newValue);
    // Update URL
    if (newValue) {
      searchParams.set("KhoaXayDungID", newValue._id);
    } else {
      searchParams.delete("KhoaXayDungID");
    }
    setSearchParams(searchParams);
    // Fetch with new filter
    dispatch(
      getQuyTrinhISOList({
        page: 1,
        size,
        search: search || undefined,
        KhoaXayDungID: newValue?._id || undefined,
      }),
    );
  };

  const handlePageChange = (_, newPage) => {
    dispatch(
      getQuyTrinhISOList({
        page: newPage + 1,
        size,
        search: search || undefined,
        KhoaXayDungID: selectedKhoa?._id || undefined,
      }),
    );
  };

  const handleRowsPerPageChange = (e) => {
    dispatch(
      getQuyTrinhISOList({
        page: 1,
        size: parseInt(e.target.value, 10),
        search: search || undefined,
        KhoaXayDungID: selectedKhoa?._id || undefined,
      }),
    );
  };

  const handleMenuClick = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleView = () => {
    if (selectedItem) {
      navigate(`/quytrinh-iso/${selectedItem._id}`);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedItem) {
      navigate(`/quytrinh-iso/${selectedItem._id}/edit`);
    }
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

  // Error state component
  const ErrorState = () => (
    <Box sx={{ py: 4 }}>
      <NetworkError message={error} onRetry={fetchData} />
    </Box>
  );

  // Empty state component
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

  // Loading skeleton
  const LoadingSkeleton = () => (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton width={80} />
          </TableCell>
          <TableCell>
            <Skeleton width={200} />
          </TableCell>
          <TableCell align="center">
            <Skeleton width={50} />
          </TableCell>
          <TableCell>
            <Skeleton width={120} />
          </TableCell>
          <TableCell align="center">
            <Skeleton width={80} />
          </TableCell>
          <TableCell align="center">
            <Skeleton width={80} />
          </TableCell>
          <TableCell align="center">
            <Skeleton width={30} />
          </TableCell>
        </TableRow>
      ))}
    </>
  );

  // Mobile Card Loading Skeleton
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

  // Mobile Card Component
  const MobileCard = ({ item }) => (
    <Card
      variant="outlined"
      sx={{
        cursor: "pointer",
        "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
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
            <Chip
              label={`v${item.PhienBan}`}
              size="small"
              color="primary"
              variant="outlined"
            />
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
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/quytrinh-iso/${item._id}/edit`);
                }}
              >
                <Edit size={16} />
              </IconButton>
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
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <>
      {/* Breadcrumb */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          underline="hover"
          color="inherit"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
        >
          <Home2 size={16} />
          Trang chủ
        </Link>
        <Typography color="text.secondary">Quản lý chất lượng</Typography>
        <Typography color="text.primary" fontWeight={500}>
          Danh sách quy trình
        </Typography>
      </Breadcrumbs>

      <MainCard title="Danh Sách Quy Trình ISO">
        <Stack spacing={3}>
          {/* Search & Filter Bar */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            spacing={2}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ flexGrow: 1 }}
            >
              <Box
                component="form"
                onSubmit={handleSearchSubmit}
                sx={{ flexGrow: 1, maxWidth: 350 }}
              >
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Tìm kiếm tên/mã quy trình..."
                  value={search}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchNormal1 size={18} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Autocomplete
                size="small"
                sx={{ minWidth: 200 }}
                options={khoaList || []}
                getOptionLabel={(opt) => opt.TenKhoa || ""}
                value={selectedKhoa}
                onChange={handleKhoaChange}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Lọc theo Khoa..." />
                )}
                isOptionEqualToValue={(opt, val) => opt._id === val?._id}
              />
            </Stack>

            {isQLCL && !isMobile && (
              <Button
                variant="contained"
                startIcon={<Add size={18} />}
                onClick={() => navigate("/quytrinh-iso/create")}
              >
                Thêm mới
              </Button>
            )}
          </Stack>

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

              {/* Mobile Pagination */}
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
            /* Desktop Table View */
            <Card>
              <CardContent sx={{ p: 0 }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Mã QT</TableCell>
                        <TableCell>Tên Quy Trình</TableCell>
                        <TableCell align="center">Phiên Bản</TableCell>
                        <TableCell>Khoa Xây Dựng</TableCell>
                        <TableCell align="center">Ngày Hiệu Lực</TableCell>
                        <TableCell align="center">Files</TableCell>
                        <TableCell align="center" width={60}></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {isLoading ? (
                        <LoadingSkeleton />
                      ) : error ? (
                        <TableRow>
                          <TableCell colSpan={7}>
                            <ErrorState />
                          </TableCell>
                        </TableRow>
                      ) : items.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7}>
                            <EmptyState />
                          </TableCell>
                        </TableRow>
                      ) : (
                        items.map((item) => (
                          <TableRow
                            key={item._id}
                            hover
                            sx={{ cursor: "pointer" }}
                            onClick={() =>
                              navigate(`/quytrinh-iso/${item._id}`)
                            }
                          >
                            <TableCell>
                              <Typography fontWeight={500}>
                                {item.MaQuyTrinh}
                              </Typography>
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
                                {item.TenQuyTrinh}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={`v${item.PhienBan}`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              {item.KhoaXayDungID?.TenKhoa || "-"}
                            </TableCell>
                            <TableCell align="center">
                              {dayjs(item.NgayHieuLuc).format("DD/MM/YYYY")}
                            </TableCell>
                            <TableCell align="center">
                              <Stack
                                direction="row"
                                spacing={0.5}
                                justifyContent="center"
                              >
                                {item._fileCounts?.pdf > 0 && (
                                  <Tooltip title="Có file PDF">
                                    <Chip
                                      icon={
                                        <DocumentDownload
                                          size={14}
                                          color="#2e7d32"
                                        />
                                      }
                                      label="PDF"
                                      size="small"
                                      sx={{
                                        borderColor: "#2e7d32",
                                        color: "#2e7d32",
                                        "& .MuiChip-icon": { color: "#2e7d32" },
                                      }}
                                      variant="outlined"
                                    />
                                  </Tooltip>
                                )}
                                {item._fileCounts?.word > 0 && (
                                  <Tooltip
                                    title={`${item._fileCounts.word} file Word`}
                                  >
                                    <Chip
                                      icon={
                                        <DocumentText1
                                          size={14}
                                          color="#ed6c02"
                                        />
                                      }
                                      label={item._fileCounts.word}
                                      size="small"
                                      sx={{
                                        borderColor: "#ed6c02",
                                        color: "#ed6c02",
                                        "& .MuiChip-icon": { color: "#ed6c02" },
                                      }}
                                      variant="outlined"
                                    />
                                  </Tooltip>
                                )}
                              </Stack>
                            </TableCell>
                            <TableCell
                              align="center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuClick(e, item)}
                              >
                                <More size={18} />
                              </IconButton>
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
              </CardContent>
            </Card>
          )}

          {/* Action Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleView}>
              <Eye size={18} style={{ marginRight: 8 }} />
              Xem chi tiết
            </MenuItem>
            {isQLCL && (
              <MenuItem onClick={handleEdit}>
                <Edit size={18} style={{ marginRight: 8 }} />
                Chỉnh sửa
              </MenuItem>
            )}
            {isQLCL && (
              <MenuItem
                onClick={handleDeleteClick}
                sx={{ color: "error.main" }}
              >
                <Trash size={18} style={{ marginRight: 8 }} />
                Xóa
              </MenuItem>
            )}
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
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDeleteCancel}>Hủy</Button>
              <Button onClick={handleDeleteConfirm} color="error" autoFocus>
                Xóa
              </Button>
            </DialogActions>
          </Dialog>
        </Stack>
      </MainCard>

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
