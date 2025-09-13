import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  Tooltip,
  TextField,
  MenuItem,
  InputAdornment,
  Alert,
  Breadcrumbs,
  Link,
  Skeleton,
} from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Article as ArticleIcon,
} from "@mui/icons-material";
import { TRANG_THAI_OPTIONS, getTrangThaiColor } from "../services/baibao.api";
import {
  fetchBaiBaoListByTapSan,
  fetchBaiBaoStats,
  deleteBaiBao as deleteBaiBaoThunk,
  selectBaiBaoListByTapSan,
  selectBaiBaoListMeta,
  selectBaiBaoStatsByTapSan,
} from "../slices/baiBaoSlice";
import { getTapSanById } from "../services/tapsan.api";
import useLocalSnackbar from "../hooks/useLocalSnackbar";
import ConfirmDialog from "components/ConfirmDialog";

function CustomToolbar({ onRefresh, onAdd }) {
  return (
    <GridToolbarContainer>
      <Button
        startIcon={<AddIcon />}
        onClick={onAdd}
        variant="contained"
        size="small"
        sx={{ mr: 1 }}
      >
        Thêm bài báo
      </Button>
      <Button
        startIcon={<RefreshIcon />}
        onClick={onRefresh}
        size="small"
        sx={{ mr: 1 }}
      >
        Làm mới
      </Button>
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

export default function BaiBaoListPage() {
  const { tapSanId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const rows = useSelector((state) =>
    selectBaiBaoListByTapSan(state, tapSanId)
  );
  const meta = useSelector((state) => selectBaiBaoListMeta(state, tapSanId));
  const stats = useSelector((state) =>
    selectBaiBaoStatsByTapSan(state, tapSanId)
  );

  const [tapSan, setTapSan] = React.useState(null);
  const [localError, setLocalError] = React.useState(null);
  const { showSuccess, showError, SnackbarElement } = useLocalSnackbar();
  const [confirm, setConfirm] = React.useState({
    open: false,
    id: null,
    loading: false,
  });

  // Pagination state
  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 20,
  });
  const [rowCount, setRowCount] = React.useState(0);

  // Filter state
  const [search, setSearch] = React.useState("");
  const [trangThaiFilter, setTrangThaiFilter] = React.useState("");
  const [tacGiaFilter, setTacGiaFilter] = React.useState("");

  const loadTapSan = React.useCallback(async () => {
    try {
      const data = await getTapSanById(tapSanId);
      setTapSan(data);
    } catch (error) {
      console.error("Error loading TapSan:", error);
      setLocalError("Không thể tải thông tin tập san");
    }
  }, [tapSanId]);

  const loadStats = React.useCallback(async () => {
    try {
      await dispatch(fetchBaiBaoStats(tapSanId));
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  }, [tapSanId, dispatch]);

  const loadData = React.useCallback(async () => {
    try {
      const params = {
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        search,
        trangThai: trangThaiFilter,
        tacGia: tacGiaFilter,
      };
      await dispatch(fetchBaiBaoListByTapSan({ tapSanId, ...params }));
      setRowCount((prev) => prev); // no-op to keep state hook; rowCount derives from selector below
    } catch (error) {
      console.error("Error loading articles:", error);
      setLocalError("Không thể tải danh sách bài báo");
    }
  }, [
    tapSanId,
    paginationModel,
    search,
    trangThaiFilter,
    tacGiaFilter,
    dispatch,
  ]);

  React.useEffect(() => {
    loadTapSan();
    loadStats();
  }, [loadTapSan, loadStats]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAskDelete = (id) => {
    setConfirm({ open: true, id, loading: false });
  };

  const handleConfirmDelete = async () => {
    const { id } = confirm;
    try {
      setConfirm((s) => ({ ...s, loading: true }));
      await dispatch(deleteBaiBaoThunk(id)).unwrap();
      setConfirm({ open: false, id: null, loading: false });
      showSuccess("Đã xóa bài báo");
      await loadData();
      await loadStats();
    } catch (error) {
      console.error("Error deleting article:", error);
      setConfirm({ open: false, id: null, loading: false });
      setLocalError("Không thể xóa bài báo");
      showError("Không thể xóa bài báo");
    }
  };

  const handleRefresh = () => {
    loadData();
    loadStats();
  };

  const handleAdd = () => {
    navigate(`/tapsan/${tapSanId}/baibao/add`);
  };

  const columns = [
    {
      field: "TieuDe",
      headerName: "Tiêu đề",
      flex: 1,
      minWidth: 300,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            cursor: "pointer",
            "&:hover": { color: "primary.main" },
          }}
          onClick={() =>
            navigate(`/tapsan/${tapSanId}/baibao/${params.row._id}`)
          }
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "TacGia",
      headerName: "Tác giả",
      width: 200,
    },
    {
      field: "TrangThai",
      headerName: "Trạng thái",
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getTrangThaiColor(params.value)}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: "NgayTao",
      headerName: "Ngày tạo",
      width: 150,
      type: "dateTime",
      valueGetter: (params) => new Date(params.value),
      renderCell: (params) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString("vi-VN")}
        </Typography>
      ),
    },
    {
      field: "NgayCapNhat",
      headerName: "Ngày cập nhật",
      width: 150,
      type: "dateTime",
      valueGetter: (params) => new Date(params.value),
      renderCell: (params) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString("vi-VN")}
        </Typography>
      ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Thao tác",
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          icon={
            <Tooltip title="Xem chi tiết">
              <ViewIcon />
            </Tooltip>
          }
          label="View"
          onClick={() => navigate(`/tapsan/${tapSanId}/baibao/${params.id}`)}
        />,
        <GridActionsCellItem
          icon={
            <Tooltip title="Chỉnh sửa">
              <EditIcon />
            </Tooltip>
          }
          label="Edit"
          onClick={() =>
            navigate(`/tapsan/${tapSanId}/baibao/${params.id}/edit`)
          }
        />,
        <GridActionsCellItem
          icon={
            <Tooltip title="Xóa">
              <DeleteIcon />
            </Tooltip>
          }
          label="Delete"
          onClick={() => handleAskDelete(params.id)}
          sx={{ color: "error.main" }}
        />,
      ],
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} color="inherit" to="/tapsan">
          Tập san
        </Link>
        <Typography color="text.primary">
          {tapSan ? (
            `${tapSan?.Loai} ${tapSan?.NamXuatBan} - Số ${tapSan?.SoXuatBan}`
          ) : (
            <Skeleton variant="text" width={160} />
          )}
        </Typography>
        <Typography color="text.primary">Bài báo</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <ArticleIcon color="primary" sx={{ fontSize: 32 }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight="600">
            Quản lý bài báo
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {tapSan?.Loai} {tapSan?.NamXuatBan} - Số {tapSan?.SoXuatBan}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          size="large"
        >
          Thêm bài báo
        </Button>
      </Stack>

      {/* Stats Cards */}
      {stats && (
        <Stack direction="row" spacing={2} mb={3}>
          <Card sx={{ minWidth: 120 }}>
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="h6" color="primary">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng bài báo
              </Typography>
            </CardContent>
          </Card>
          {stats.byStatus?.map((item) => (
            <Card key={item.status} sx={{ minWidth: 120 }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography
                  variant="h6"
                  color={getTrangThaiColor(item.status) + ".main"}
                >
                  {item.count}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.status}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              placeholder="Tìm kiếm theo tiêu đề, tác giả..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />
            <TextField
              select
              label="Trạng thái"
              value={trangThaiFilter}
              onChange={(e) => setTrangThaiFilter(e.target.value)}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {TRANG_THAI_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              placeholder="Tác giả"
              value={tacGiaFilter}
              onChange={(e) => setTacGiaFilter(e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {(meta?.error || localError) && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setLocalError(null)}
        >
          {meta?.error || localError}
        </Alert>
      )}

      {/* Data Grid */}
      <Card>
        <Box sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={!!meta.loading}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            rowCount={meta.total || rowCount}
            paginationMode="server"
            pageSizeOptions={[10, 20, 50, 100]}
            getRowId={(row) => row._id}
            // Hỗ trợ cả MUI X v5 (components) và v6 (slots)
            components={{
              Toolbar: CustomToolbar,
            }}
            componentsProps={{
              toolbar: {
                onRefresh: handleRefresh,
                onAdd: handleAdd,
              },
            }}
            slots={{
              toolbar: CustomToolbar,
            }}
            slotProps={{
              toolbar: {
                onRefresh: handleRefresh,
                onAdd: handleAdd,
              },
            }}
            disableRowSelectionOnClick
            sx={{
              "& .MuiDataGrid-cell:focus": {
                outline: "none",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "action.hover",
              },
            }}
          />
        </Box>
      </Card>

      {/* Snackbar */}
      {SnackbarElement}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null, loading: false })}
        onConfirm={handleConfirmDelete}
        loading={confirm.loading}
        title="Xác nhận xóa bài báo"
        message="Thao tác này sẽ xóa vĩnh viễn bài báo. Bạn có chắc chắn muốn thực hiện?"
        confirmText="Xóa"
        confirmColor="error"
        severity="warning"
      />
    </Box>
  );
}
