import React from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  TextField,
  MenuItem,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Skeleton,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  MenuBook as BookIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTapSanList,
  deleteTapSan as deleteTapSanThunk,
  selectTapSanList,
  selectTapSanListMeta,
} from "../slices/tapSanSlice";
import { useNavigate } from "react-router-dom";
import AttachmentLinksCell from "../components/AttachmentLinksCell";

export default function TapSanListPage() {
  const nav = useNavigate();
  const dispatch = useDispatch();
  const items = useSelector(selectTapSanList);
  const meta = useSelector(selectTapSanListMeta);
  const [page, setPage] = React.useState(1);
  const [size, setSize] = React.useState(20);
  const [total] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [deleteDialog, setDeleteDialog] = React.useState({
    open: false,
    item: null,
  });
  const [filters, setFilters] = React.useState({
    Loai: "",
    NamXuatBan: "",
    SoXuatBan: "",
    TrangThai: "",
  });

  const getLoaiDisplay = (loai) => {
    switch (loai) {
      case "YHTH":
        return "Y học thực hành";
      case "TTT":
        return "Thông tin thuốc";
      default:
        return loai;
    }
  };

  const getTrangThaiDisplay = (trangThai) => {
    switch (trangThai) {
      case "chua-hoan-thanh":
        return "Chưa hoàn thành";
      case "da-hoan-thanh":
        return "Đã hoàn thành";
      default:
        return trangThai;
    }
  };

  const fetchData = React.useCallback(async () => {
    try {
      await dispatch(
        fetchTapSanList({
          page,
          size,
          search: searchTerm,
          includeCounts: 1,
          ...filters,
        })
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [page, size, searchTerm, filters, dispatch]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteConfirm = async () => {
    if (deleteDialog.item) {
      try {
        await dispatch(deleteTapSanThunk(deleteDialog.item._id)).unwrap();
        await fetchData();
        setDeleteDialog({ open: false, item: null });
      } catch (error) {
        console.error("Error deleting:", error);
      }
    }
  };

  const columns = [
    {
      field: "Loai",
      headerName: "Loại tập san",
      width: 180,
      renderCell: (params) => (
        <Chip
          label={getLoaiDisplay(params.value)}
          color={params.value === "YHTH" ? "primary" : "secondary"}
          variant="filled"
          size="small"
          icon={<BookIcon />}
        />
      ),
    },
    {
      field: "NamXuatBan",
      headerName: "Năm xuất bản",
      width: 130,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "SoXuatBan",
      headerName: "Số xuất bản",
      width: 120,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Chip label={`Số ${params.value}`} variant="outlined" size="small" />
      ),
    },
    {
      field: "TrangThai",
      headerName: "Trạng thái",
      width: 150,
      renderCell: (params) => (
        <Chip
          label={getTrangThaiDisplay(params.value)}
          color={params.value === "da-hoan-thanh" ? "success" : "warning"}
          variant="outlined"
          size="small"
        />
      ),
    },
    {
      field: "GhiChu",
      headerName: "Ghi chú",
      width: 200,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={params.value || ""}
        >
          {params.value || "—"}
        </Typography>
      ),
    },
    {
      field: "BaiBaoCount",
      headerName: "Số bài báo",
      width: 130,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Chip
          label={typeof params.value === "number" ? params.value : "0"}
          color={params.value > 0 ? "primary" : "default"}
          size="small"
          variant={params.value > 0 ? "filled" : "outlined"}
        />
      ),
      sortable: false,
    },
    {
      field: "KeHoach",
      headerName: "Kế hoạch",
      width: 220,
      sortable: false,
      renderCell: (params) => (
        <AttachmentLinksCell
          ownerType="TapSan"
          ownerId={params.row._id}
          field="kehoach"
        />
      ),
    },
    {
      field: "TapTin",
      headerName: "File tạp san",
      width: 240,
      sortable: false,
      renderCell: (params) => (
        <AttachmentLinksCell
          ownerType="TapSan"
          ownerId={params.row._id}
          field="file"
        />
      ),
    },
    {
      field: "updatedAt",
      headerName: "Cập nhật",
      width: 150,
      renderCell: (params) =>
        params.value ? new Date(params.value).toLocaleDateString("vi-VN") : "—",
    },
    {
      field: "actions",
      headerName: "Thao tác",
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Xem chi tiết">
            <IconButton
              size="small"
              onClick={() => nav(`/tapsan/${params.row._id}`)}
              color="info"
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <IconButton
              size="small"
              onClick={() => nav(`/tapsan/${params.row._id}/edit`)}
              color="primary"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
            <IconButton
              size="small"
              onClick={() => setDeleteDialog({ open: true, item: params.row })}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3, bgcolor: "grey.50", minHeight: "100vh" }}>
      {/* Header */}
      <Card elevation={0} sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Box>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                📚 Quản lý Tập san
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Quản lý tập san y học thực hành và thông tin thuốc
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => nav("/tapsan/new")}
              size="large"
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1.5,
                boxShadow: 2,
                "&:hover": { boxShadow: 4 },
              }}
            >
              Tạo Tập san
            </Button>
          </Stack>

          {/* Filters */}
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            flexWrap="wrap"
          >
            <TextField
              placeholder="Tìm kiếm tập san..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
              size="small"
            />
            <TextField
              select
              size="small"
              label="Loại tập san"
              value={filters.Loai}
              onChange={(e) =>
                setFilters((s) => ({ ...s, Loai: e.target.value }))
              }
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="YHTH">Y học thực hành</MenuItem>
              <MenuItem value="TTT">Thông tin thuốc</MenuItem>
            </TextField>
            <TextField
              size="small"
              label="Năm xuất bản"
              placeholder="2025"
              value={filters.NamXuatBan}
              onChange={(e) =>
                setFilters((s) => ({ ...s, NamXuatBan: e.target.value }))
              }
              sx={{ width: 140 }}
            />
            <TextField
              size="small"
              label="Số xuất bản"
              type="number"
              placeholder="1"
              value={filters.SoXuatBan}
              onChange={(e) =>
                setFilters((s) => ({ ...s, SoXuatBan: e.target.value }))
              }
              sx={{ width: 120 }}
            />
            <TextField
              select
              size="small"
              label="Trạng thái"
              value={filters.TrangThai}
              onChange={(e) =>
                setFilters((s) => ({ ...s, TrangThai: e.target.value }))
              }
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="chua-hoan-thanh">Chưa hoàn thành</MenuItem>
              <MenuItem value="da-hoan-thanh">Đã hoàn thành</MenuItem>
            </TextField>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setPage(1)}
              sx={{ borderRadius: 2 }}
            >
              Lọc
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Data Grid */}
      <Card elevation={1} sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <DataGrid
            rows={items}
            columns={columns}
            loading={!!meta.loading}
            paginationMode="server"
            page={page - 1}
            pageSize={size}
            rowCount={meta.total || total}
            onPageChange={(newPage) => setPage(newPage + 1)}
            onPageSizeChange={(newPageSize) => setSize(newPageSize)}
            pageSizeOptions={[10, 20, 50]}
            disableSelectionOnClick
            autoHeight
            getRowId={(row) => row._id}
            sx={{
              border: "none",
              "& .MuiDataGrid-columnHeaders": {
                bgcolor: "grey.50",
                borderRadius: 0,
              },
              "& .MuiDataGrid-row:hover": {
                bgcolor: "action.hover",
              },
            }}
            slots={{
              noRowsOverlay: () => (
                <Stack
                  height="300px"
                  alignItems="center"
                  justifyContent="center"
                  spacing={2}
                >
                  <BookIcon sx={{ fontSize: 64, color: "grey.400" }} />
                  <Typography variant="h6" color="text.secondary">
                    Chưa có tập san nào
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hãy tạo tập san đầu tiên của bạn
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => nav("/tapsan/new")}
                  >
                    Tạo Tập san
                  </Button>
                </Stack>
              ),
              loadingOverlay: () => (
                <Stack height="300px" spacing={1} p={2}>
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} height={60} />
                  ))}
                </Stack>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, item: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" color="error.main">
            Xác nhận xóa tập san
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Bạn có chắc chắn muốn xóa tập san này không?
          </Alert>
          {deleteDialog.item && (
            <Typography>
              <strong>Loại:</strong> {deleteDialog.item.Loai} <br />
              <strong>Năm:</strong> {deleteDialog.item.NamXuatBan} <br />
              <strong>Số:</strong> {deleteDialog.item.SoXuatBan}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, item: null })}>
            Hủy
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
