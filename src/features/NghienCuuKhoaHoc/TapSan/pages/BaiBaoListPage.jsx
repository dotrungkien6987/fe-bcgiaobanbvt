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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Article as ArticleIcon,
} from "@mui/icons-material";
import {
  fetchBaiBaoListByTapSan,
  deleteBaiBao as deleteBaiBaoThunk,
  selectBaiBaoListByTapSan,
  selectBaiBaoListMeta,
} from "../slices/baiBaoSlice";
import { fetchTapSanById, selectTapSanById } from "../slices/tapSanSlice";
import useLocalSnackbar from "../hooks/useLocalSnackbar";
import ConfirmDialog from "components/ConfirmDialog";
import AttachmentLinksCell from "../components/AttachmentLinksCell";
import { getAllNhanVien } from "features/NhanVien/nhanvienSlice";
import { reorderBaiBao } from "../slices/baiBaoSlice";

function CustomToolbar({ onRefresh, onAdd, onReorder }) {
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
        startIcon={<EditIcon />}
        onClick={onReorder}
        size="small"
        sx={{ mr: 1 }}
      >
        Sắp xếp STT
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

export default function BaiBaoListPage({
  tapSanId: tapSanIdProp,
  embedded = false,
}) {
  const { tapSanId: tapSanIdFromRoute } = useParams();
  const tapSanId = tapSanIdProp || tapSanIdFromRoute;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const rows = useSelector((state) =>
    selectBaiBaoListByTapSan(state, tapSanId)
  );
  const meta = useSelector((state) => selectBaiBaoListMeta(state, tapSanId));
  const nhanviens = useSelector((s) => s.nhanvien?.nhanviens || []);

  const tapSan = useSelector((state) => selectTapSanById(state, tapSanId));
  const [localError, setLocalError] = React.useState(null);
  const { showSuccess, showError, SnackbarElement } = useLocalSnackbar();
  const [confirm, setConfirm] = React.useState({
    open: false,
    id: null,
    loading: false,
  });
  const [reorderOpen, setReorderOpen] = React.useState(false);
  const [reorderItems, setReorderItems] = React.useState([]);
  const [reorderLoading, setReorderLoading] = React.useState(false);
  const [reorderError, setReorderError] = React.useState("");

  // Pagination state
  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 20,
  });
  const [sortModel, setSortModel] = React.useState([
    { field: "SoThuTu", sort: "asc" },
  ]);

  // Filter state
  const [search, setSearch] = React.useState("");
  const [khoiFilter, setKhoiFilter] = React.useState("");
  const [loaiFilter, setLoaiFilter] = React.useState("");

  const loadTapSan = React.useCallback(async () => {
    try {
      await dispatch(fetchTapSanById(tapSanId)).unwrap();
    } catch (error) {
      console.error("Error loading TapSan:", error);
      setLocalError("Không thể tải thông tin tập san");
    }
  }, [tapSanId, dispatch]);

  const loadData = React.useCallback(async () => {
    try {
      const sort = sortModel?.[0]?.field || "NgayTao";
      const order = sortModel?.[0]?.sort || "desc";
      const params = {
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        filters: {
          search,
          khoiChuyenMon: khoiFilter,
          loaiHinh: loaiFilter,
          sort,
          order,
        },
      };
      await dispatch(fetchBaiBaoListByTapSan({ tapSanId, ...params }));
    } catch (error) {
      console.error("Error loading articles:", error);
      setLocalError("Không thể tải danh sách bài báo");
    }
  }, [
    tapSanId,
    paginationModel,
    sortModel,
    search,
    khoiFilter,
    loaiFilter,
    dispatch,
  ]);

  React.useEffect(() => {
    loadTapSan();
  }, [loadTapSan]);

  React.useEffect(() => {
    if (!nhanviens || nhanviens.length === 0) {
      dispatch(getAllNhanVien());
    }
  }, [nhanviens, dispatch]);

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
    } catch (error) {
      console.error("Error deleting article:", error);
      setConfirm({ open: false, id: null, loading: false });
      setLocalError("Không thể xóa bài báo");
      showError("Không thể xóa bài báo");
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleAdd = () => {
    navigate(`/tapsan/${tapSanId}/baibao/add`);
  };

  const openReorder = () => {
    // Prepare items from current rows (current page)
    const items = (rows || []).map((r) => ({
      id: r._id,
      TieuDe: r.TieuDe,
      current: r.SoThuTu,
      SoThuTu: r.SoThuTu,
    }));
    setReorderItems(items);
    setReorderError("");
    setReorderOpen(true);
  };

  const validateReorder = () => {
    const values = reorderItems.map((x) => Number(x.SoThuTu));
    if (values.some((v) => !Number.isInteger(v) || v <= 0)) {
      setReorderError("Số thứ tự phải là số nguyên dương");
      return false;
    }
    const setU = new Set(values);
    if (setU.size !== values.length) {
      setReorderError("Số thứ tự bị trùng trong danh sách");
      return false;
    }
    setReorderError("");
    return true;
  };

  const submitReorder = async () => {
    if (!validateReorder()) return;
    try {
      setReorderLoading(true);
      const items = reorderItems.map(({ id, SoThuTu }) => ({ id, SoThuTu }));
      await dispatch(reorderBaiBao({ tapSanId, items })).unwrap();
      showSuccess("Cập nhật thứ tự thành công");
      setReorderOpen(false);
      await loadData();
    } catch (e) {
      console.error(e);
      setReorderError(
        e?.response?.data?.message || "Không thể cập nhật thứ tự bài báo"
      );
      showError("Không thể cập nhật thứ tự bài báo");
    } finally {
      setReorderLoading(false);
    }
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
    { field: "MaBaiBao", headerName: "Mã", width: 140 },
    { field: "SoThuTu", headerName: "STT", width: 90 },
    {
      field: "LoaiHinh",
      headerName: "Loại hình",
      width: 160,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value === "ky-thuat-moi"
            ? "Kỹ thuật mới"
            : params.value === "nghien-cuu-khoa-hoc"
            ? "Nghiên cứu khoa học"
            : params.value === "ca-lam-sang"
            ? "Ca lâm sàng"
            : params.value}
        </Typography>
      ),
    },
    {
      field: "KhoiChuyenMon",
      headerName: "Khối",
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value === "noi"
            ? "Nội"
            : params.value === "ngoai"
            ? "Ngoại"
            : params.value === "dieu-duong"
            ? "Điều dưỡng"
            : params.value === "phong-ban"
            ? "Phòng ban"
            : params.value === "can-lam-sang"
            ? "Cận lâm sàng"
            : params.value}
        </Typography>
      ),
    },
    {
      field: "TacGiaChinhID",
      headerName: "Tác giả chính",
      width: 220,
      valueGetter: (params) => params.row.TacGiaChinhID,
      renderCell: (params) => {
        const nv = nhanviens.find((x) => x._id === params.value);
        return (
          <Typography variant="body2">
            {nv
              ? `${nv.Ten}${nv.MaNhanVien ? ` (${nv.MaNhanVien})` : ""}`
              : "—"}
          </Typography>
        );
      },
    },
    {
      field: "DongTacGiaIDs",
      headerName: "Đồng tác giả",
      width: 140,
      renderCell: (params) => (
        <Chip label={(params.value?.length || 0) + " người"} size="small" />
      ),
    },
    {
      field: "TapTin",
      headerName: "Tệp bài báo",
      width: 340,
      sortable: false,
      renderCell: (params) => (
        <AttachmentLinksCell
          ownerType="TapSanBaiBao"
          ownerId={params.row._id}
          field="file"
          wrap={false}
          sx={{ maxHeight: 96 }}
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
    <Box sx={{ p: embedded ? 0 : 3 }}>
      {!embedded && (
        <>
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
        </>
      )}

      {/* Stats Cards removed per new business rules */}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              placeholder="Tìm theo tiêu đề/Mã bài..."
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
              label="Khối"
              value={khoiFilter}
              onChange={(e) => setKhoiFilter(e.target.value)}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="noi">Nội</MenuItem>
              <MenuItem value="ngoai">Ngoại</MenuItem>
              <MenuItem value="dieu-duong">Điều dưỡng</MenuItem>
              <MenuItem value="phong-ban">Phòng ban</MenuItem>
              <MenuItem value="can-lam-sang">Cận lâm sàng</MenuItem>
            </TextField>
            <TextField
              select
              label="Loại hình"
              value={loaiFilter}
              onChange={(e) => setLoaiFilter(e.target.value)}
              size="small"
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="ky-thuat-moi">Kỹ thuật mới</MenuItem>
              <MenuItem value="nghien-cuu-khoa-hoc">
                Nghiên cứu khoa học
              </MenuItem>
              <MenuItem value="ca-lam-sang">Ca lâm sàng</MenuItem>
            </TextField>
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
            rowCount={meta.total || 0}
            paginationMode="server"
            sortingMode="server"
            sortModel={sortModel}
            onSortModelChange={setSortModel}
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
                onReorder: openReorder,
              },
            }}
            slots={{
              toolbar: CustomToolbar,
            }}
            slotProps={{
              toolbar: {
                onRefresh: handleRefresh,
                onAdd: handleAdd,
                onReorder: openReorder,
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

      {/* Reorder Dialog */}
      <Dialog
        open={reorderOpen}
        onClose={() => setReorderOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Sắp xếp số thứ tự (chỉ áp dụng cho danh sách hiện tại)
        </DialogTitle>
        <DialogContent>
          {reorderError && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setReorderError("")}
            >
              {reorderError}
            </Alert>
          )}
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={80}>STT mới</TableCell>
                <TableCell width={80}>STT hiện tại</TableCell>
                <TableCell>Tiêu đề</TableCell>
                <TableCell>Mã</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reorderItems.map((item, idx) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={item.SoThuTu}
                      onChange={(e) => {
                        const v = e.target.value;
                        setReorderItems((arr) =>
                          arr.map((it, i) =>
                            i === idx ? { ...it, SoThuTu: v } : it
                          )
                        );
                      }}
                      sx={{ width: 100 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={item.current} size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{item.TieuDe}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {rows.find((r) => r._id === item.id)?.MaBaiBao || "—"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setReorderOpen(false)}
            disabled={reorderLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={submitReorder}
            disabled={reorderLoading}
            variant="contained"
          >
            {reorderLoading ? "Đang lưu..." : "Lưu thứ tự"}
          </Button>
        </DialogActions>
      </Dialog>

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
