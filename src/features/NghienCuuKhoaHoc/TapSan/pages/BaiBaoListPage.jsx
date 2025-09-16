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
    <GridToolbarContainer sx={{ p: 0 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ p: 2 }}>
        <Button
          startIcon={<AddIcon />}
          onClick={onAdd}
          variant="contained"
          size="small"
          sx={{
            borderRadius: 2,
            fontWeight: 600,
            boxShadow: "0 2px 8px rgba(25, 118, 210, 0.3)",
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: "0 4px 12px rgba(25, 118, 210, 0.4)",
            },
            transition: "all 0.2s ease",
          }}
        >
          Thêm bài báo
        </Button>
        <Button
          startIcon={<EditIcon />}
          onClick={onReorder}
          size="small"
          variant="outlined"
          sx={{
            borderRadius: 2,
            fontWeight: 500,
            "&:hover": {
              transform: "translateY(-1px)",
            },
            transition: "all 0.2s ease",
          }}
        >
          Sắp xếp STT
        </Button>
        <Button
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          size="small"
          variant="outlined"
          sx={{
            borderRadius: 2,
            fontWeight: 500,
            "&:hover": {
              transform: "translateY(-1px)",
            },
            transition: "all 0.2s ease",
          }}
        >
          Làm mới
        </Button>
      </Stack>
      <Box sx={{ flex: 1 }} />
      <Stack direction="row" spacing={1} sx={{ p: 2 }}>
        <GridToolbarFilterButton
          sx={{
            borderRadius: 2,
            fontWeight: 500,
          }}
        />
        <GridToolbarDensitySelector
          sx={{
            borderRadius: 2,
            fontWeight: 500,
          }}
        />
        <GridToolbarExport
          sx={{
            borderRadius: 2,
            fontWeight: 500,
          }}
        />
      </Stack>
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
  const [reviewerFilter, setReviewerFilter] = React.useState("");

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
          NguoiThamDinhID: reviewerFilter,
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
    reviewerFilter,
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
      field: "actions",
      type: "actions",
      headerName: "Thao tác",
      width: 120,
      pinned: "right", // Pin to right side
      getActions: (params) => [
        <GridActionsCellItem
          icon={
            <Tooltip title="Xem chi tiết">
              <ViewIcon />
            </Tooltip>
          }
          label="View"
          onClick={() => navigate(`/tapsan/${tapSanId}/baibao/${params.id}`)}
          sx={{
            color: "primary.main",
            "&:hover": {
              backgroundColor: "primary.50",
            },
          }}
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
          sx={{
            color: "info.main",
            "&:hover": {
              backgroundColor: "info.50",
            },
          }}
        />,
        <GridActionsCellItem
          icon={
            <Tooltip title="Xóa">
              <DeleteIcon />
            </Tooltip>
          }
          label="Delete"
          onClick={() => handleAskDelete(params.id)}
          sx={{
            color: "error.main",
            "&:hover": {
              backgroundColor: "error.50",
            },
          }}
        />,
      ],
    },
    {
      field: "TieuDe",
      headerName: "Tiêu đề",
      flex: 1,
      minWidth: 280,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            cursor: "pointer",
            "&:hover": { color: "primary.main" },
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          onClick={() =>
            navigate(`/tapsan/${tapSanId}/baibao/${params.row._id}`)
          }
        >
          {params.value}
        </Typography>
      ),
    },
    { field: "MaBaiBao", headerName: "Mã", width: 120 },
    { field: "SoThuTu", headerName: "STT", width: 70 },
    {
      field: "PhanLoai",
      headerName: "Phân loại",
      width: 180,
      valueGetter: (params) => {
        // If TTT: show Chuyên đề; else show Loại hình
        if (tapSan?.Loai === "TTT") return params.row.NoiDungChuyenDe;
        return params.row.LoaiHinh;
      },
      renderCell: (params) => {
        if (tapSan?.Loai === "TTT") {
          const labels = {
            "su-dung-thuoc-hop-ly": "Sử dụng thuốc hợp lý",
            "canh-bao-tac-dung-phu": "Cảnh báo tác dụng phụ",
            "tuong-tac-thuoc": "Tương tác thuốc",
            "cap-nhat-khuyen-cao": "Cập nhật khuyến cáo",
          };
          return (
            <Chip
              label={labels[params.value] || params.value || "—"}
              size="small"
              color="secondary"
              variant="outlined"
            />
          );
        }
        const colors = {
          "ky-thuat-moi": "info",
          "nghien-cuu-khoa-hoc": "success",
          "ca-lam-sang": "warning",
        };
        const labels = {
          "ky-thuat-moi": "Kỹ thuật mới",
          "nghien-cuu-khoa-hoc": "NCKH",
          "ca-lam-sang": "Ca lâm sàng",
        };
        return (
          <Chip
            label={labels[params.value] || params.value || "—"}
            size="small"
            color={colors[params.value] || "default"}
            variant="outlined"
          />
        );
      },
    },
    {
      field: "KhoiChuyenMon",
      headerName: "Khối",
      width: 100,
      renderCell: (params) => {
        const colors = {
          noi: "primary",
          ngoai: "secondary",
          "dieu-duong": "info",
          "phong-ban": "warning",
          "can-lam-sang": "success",
        };
        const labels = {
          noi: "Nội",
          ngoai: "Ngoại",
          "dieu-duong": "ĐD",
          "phong-ban": "PB",
          "can-lam-sang": "CLS",
        };
        return (
          <Chip
            label={labels[params.value] || params.value}
            size="small"
            color={colors[params.value] || "default"}
            variant="filled"
            sx={{
              fontWeight: 500,
              fontSize: "0.75rem",
            }}
          />
        );
      },
    },
    {
      field: "TacGia",
      headerName: "Tác giả",
      width: 220,
      valueGetter: (params) => {
        if (params.row.TacGiaLoai === "ngoai-vien") {
          return params.row.TacGiaNgoaiVien || "—";
        }
        const v = params.row.TacGiaChinhID;
        return v && typeof v === "object" ? v._id : v || null;
      },
      renderCell: (params) => {
        if (params.row.TacGiaLoai === "ngoai-vien") {
          return (
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {params.row.TacGiaNgoaiVien || "—"}
            </Typography>
          );
        }
        const v = params.row.TacGiaChinhID;
        if (v && typeof v === "object") {
          const ten = v.Ten;
          const ma = v.MaNhanVien;
          return (
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {ten ? `${ten}${ma ? ` (${ma})` : ""}` : "—"}
            </Typography>
          );
        }
        const nv = nhanviens.find((x) => x._id === params.value);
        return (
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
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
      width: 110,
      renderCell: (params) => (
        <Chip
          label={`${params.value?.length || 0} người`}
          size="small"
          color="info"
          variant="outlined"
        />
      ),
    },
    {
      field: "NguoiThamDinhID",
      headerName: "Người thẩm định",
      width: 180,
      valueGetter: (params) => {
        const v = params.row.NguoiThamDinhID;
        return v && typeof v === "object" ? v._id : v || null;
      },
      renderCell: (params) => {
        const v = params.row.NguoiThamDinhID;
        if (v && typeof v === "object") {
          const ten = v.Ten;
          const ma = v.MaNhanVien;
          return (
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {ten ? `${ten}${ma ? ` (${ma})` : ""}` : "—"}
            </Typography>
          );
        }
        const nv = nhanviens.find((x) => x._id === params.value);
        return (
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {nv
              ? `${nv.Ten}${nv.MaNhanVien ? ` (${nv.MaNhanVien})` : ""}`
              : "—"}
          </Typography>
        );
      },
    },
    {
      field: "TapTin",
      headerName: "Tệp bài báo",
      width: 240,
      sortable: false,
      renderCell: (params) => (
        <AttachmentLinksCell
          ownerType="TapSanBaiBao"
          ownerId={params.row._id}
          field="file"
        />
      ),
    },
    {
      field: "NgayTao",
      headerName: "Ngày tạo",
      width: 120,
      type: "dateTime",
      valueGetter: (params) => new Date(params.value),
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {new Date(params.value).toLocaleDateString("vi-VN")}
        </Typography>
      ),
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
                <ArticleIcon sx={{ fontSize: 40, color: "white" }} />
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
                  Quản lý bài báo
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    opacity: 0.9,
                    fontWeight: 400,
                  }}
                >
                  {tapSan?.Loai} {tapSan?.NamXuatBan} - Số {tapSan?.SoXuatBan}
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAdd}
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
                Thêm bài báo
              </Button>
            </Stack>
          </Box>
        </>
      )}

      {/* Stats Cards removed per new business rules */}

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
              placeholder="Tìm theo tiêu đề/Mã bài..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
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
            />
            <TextField
              select
              label="Khối chuyên môn"
              value={khoiFilter}
              onChange={(e) => setKhoiFilter(e.target.value)}
              size="small"
              sx={{
                minWidth: 180,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
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
              sx={{
                minWidth: 200,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="ky-thuat-moi">Kỹ thuật mới</MenuItem>
              <MenuItem value="nghien-cuu-khoa-hoc">
                Nghiên cứu khoa học
              </MenuItem>
              <MenuItem value="ca-lam-sang">Ca lâm sàng</MenuItem>
            </TextField>

            <TextField
              select
              label="Người thẩm định"
              value={reviewerFilter}
              onChange={(e) => setReviewerFilter(e.target.value)}
              size="small"
              sx={{
                minWidth: 220,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {nhanviens.map((nv) => (
                <MenuItem key={nv._id} value={nv._id}>
                  {nv.Ten}
                  {nv.MaNhanVien ? ` (${nv.MaNhanVien})` : ""}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {(meta?.error || localError) && (
        <Alert
          severity="error"
          sx={{
            mb: 4,
            borderRadius: 2,
            boxShadow: 2,
            border: "1px solid",
            borderColor: "error.200",
          }}
          onClose={() => setLocalError(null)}
        >
          {meta?.error || localError}
        </Alert>
      )}

      {/* Data Grid */}
      <Card
        elevation={6}
        sx={{
          borderRadius: 3,
          background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
          border: "1px solid",
          borderColor: "grey.200",
          overflow: "hidden",
        }}
      >
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
              "& .MuiDataGrid-root": {
                border: "none",
              },
              "& .MuiDataGrid-main": {
                borderRadius: 3,
              },
              "& .MuiDataGrid-columnHeaders": {
                background: "linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 100%)",
                borderBottom: "2px solid",
                borderColor: "primary.200",
                fontWeight: 600,
                fontSize: "0.875rem",
                color: "grey.800",
              },
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid",
                borderColor: "grey.100",
                "&:focus": {
                  outline: "none",
                },
              },
              "& .MuiDataGrid-row": {
                "&:hover": {
                  backgroundColor: "primary.50",
                  "& .MuiDataGrid-cell": {
                    borderColor: "primary.100",
                  },
                },
                "&:nth-of-type(even)": {
                  backgroundColor: "grey.25",
                },
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: "2px solid",
                borderColor: "grey.200",
                background: "linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%)",
              },
              "& .MuiDataGrid-toolbarContainer": {
                padding: "16px 24px",
                background: "linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%)",
                borderBottom: "1px solid",
                borderColor: "grey.200",
                "& .MuiButton-root": {
                  borderRadius: 2,
                  fontWeight: 500,
                },
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
