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
      field: "actions",
      headerName: "Thao tác",
      width: 120,
      sortable: false,
      pinned: "right",
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Xem chi tiết">
            <IconButton
              size="small"
              onClick={() => nav(`/tapsan/${params.row._id}`)}
              sx={{
                color: "primary.main",
                "&:hover": {
                  backgroundColor: "primary.50",
                },
              }}
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <IconButton
              size="small"
              onClick={() => nav(`/tapsan/${params.row._id}/edit`)}
              sx={{
                color: "info.main",
                "&:hover": {
                  backgroundColor: "info.50",
                },
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
            <IconButton
              size="small"
              onClick={() => setDeleteDialog({ open: true, item: params.row })}
              sx={{
                color: "error.main",
                "&:hover": {
                  backgroundColor: "error.50",
                },
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
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
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value
            ? new Date(params.value).toLocaleDateString("vi-VN")
            : "—"}
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 3,
          p: 4,
          mb: 4,
          color: "white",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={3}
          sx={{ position: "relative", zIndex: 1 }}
        >
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BookIcon sx={{ fontSize: 40, color: "white" }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h3"
              fontWeight="700"
              sx={{
                mb: 1,
                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              Quản lý Tập san
            </Typography>
            <Typography
              variant="h6"
              sx={{
                opacity: 0.9,
                fontWeight: 400,
              }}
            >
              Quản lý tập san y học thực hành và thông tin thuốc
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => nav("/tapsan/new")}
            size="large"
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "white",
              fontWeight: 600,
              px: 3,
              py: 1.5,
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.3)",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Tạo Tập san
          </Button>
        </Stack>
      </Box>

      {/* Filters */}
      <Card
        elevation={4}
        sx={{
          mb: 4,
          borderRadius: 3,
          background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
          border: "1px solid",
          borderColor: "grey.200",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            background: "linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 100%)",
            px: 3,
            py: 2,
            borderBottom: "1px solid",
            borderColor: "grey.200",
          }}
        >
          <Typography
            variant="h6"
            fontWeight="600"
            sx={{
              color: "grey.800",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <SearchIcon color="primary" />
            Bộ lọc tìm kiếm
          </Typography>
        </Box>
        <CardContent sx={{ p: 3 }}>
          <Stack
            direction="row"
            spacing={3}
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
              sx={{
                minWidth: 320,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover fieldset": {
                    borderColor: "primary.main",
                  },
                },
              }}
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
              sx={{
                minWidth: 180,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
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
              sx={{
                width: 160,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
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
              sx={{
                width: 140,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
            <TextField
              select
              size="small"
              label="Trạng thái"
              value={filters.TrangThai}
              onChange={(e) =>
                setFilters((s) => ({ ...s, TrangThai: e.target.value }))
              }
              sx={{
                minWidth: 180,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="chua-hoan-thanh">Chưa hoàn thành</MenuItem>
              <MenuItem value="da-hoan-thanh">Đã hoàn thành</MenuItem>
            </TextField>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setPage(1)}
              sx={{
                borderRadius: 2,
                fontWeight: 500,
                "&:hover": {
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s ease",
              }}
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
              backgroundColor: "white",
              borderRadius: 2,
              boxShadow: (theme) => theme.shadows[2],
              "& .MuiDataGrid-root": {
                border: "none",
              },
              "& .MuiDataGrid-main": {
                borderRadius: 2,
              },
              "& .MuiDataGrid-columnHeaders": {
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                borderRadius: "8px 8px 0 0",
                fontWeight: 600,
                fontSize: "0.875rem",
                "& .MuiDataGrid-columnHeader": {
                  outline: "none",
                  "&:focus": {
                    outline: "none",
                  },
                  "&:focus-within": {
                    outline: "none",
                  },
                },
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontWeight: 600,
                },
                "& .MuiDataGrid-iconSeparator": {
                  color: "rgba(255, 255, 255, 0.7)",
                },
                "& .MuiDataGrid-sortIcon": {
                  color: "white",
                },
                "& .MuiDataGrid-menuIcon": {
                  color: "white",
                },
              },
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid #f0f2f5",
                "&:focus": {
                  outline: "none",
                },
                "&:focus-within": {
                  outline: "none",
                },
              },
              "& .MuiDataGrid-row": {
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "#f8fafc",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  transform: "translateY(-1px)",
                },
                "&.Mui-selected": {
                  backgroundColor: "#e3f2fd",
                  "&:hover": {
                    backgroundColor: "#bbdefb",
                  },
                },
              },
              "& .MuiDataGrid-footer": {
                backgroundColor: "#f8fafc",
                borderTop: "1px solid #e0e7ff",
                borderRadius: "0 0 8px 8px",
              },
              "& .MuiDataGrid-footerContainer": {
                backgroundColor: "transparent",
              },
              "& .MuiTablePagination-root": {
                color: "#64748b",
              },
              "& .MuiDataGrid-selectedRowCount": {
                color: "#475569",
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
