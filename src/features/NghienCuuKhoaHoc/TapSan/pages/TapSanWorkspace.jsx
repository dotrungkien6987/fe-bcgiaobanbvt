import React from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Stack,
  Tabs,
  Tab,
  Button,
  Typography,
  Card,
  CardContent,
  Chip,
  Skeleton,
  TextField,
  MenuItem,
  InputAdornment,
  Grid,
} from "@mui/material";
import { Article as ArticleIcon, Edit as EditIcon } from "@mui/icons-material";
import { fetchTapSanById, selectTapSanById } from "../slices/tapSanSlice";
import AttachmentSection from "../components/AttachmentSection";
import { DataGrid } from "@mui/x-data-grid";
import {
  fetchBaiBaoListByTapSan,
  fetchBaiBaoById as fetchBaiBaoByIdThunk,
  deleteBaiBao as deleteBaiBaoThunk,
  selectBaiBaoListByTapSan,
  selectBaiBaoListMeta,
  selectBaiBaoById,
} from "../slices/baiBaoSlice";
import {
  TRANG_THAI_OPTIONS,
  getTrangThaiColor,
} from "../slices/baibao.constants";
import ConfirmDialog from "components/ConfirmDialog";
import useLocalSnackbar from "../hooks/useLocalSnackbar";

function CommandBar({ onAddBaiBao, onEditTapSan, onOpenBaibao }) {
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{
        p: 1.5,
        borderBottom: "1px solid",
        borderColor: "divider",
        position: "sticky",
        top: 0,
        bgcolor: "background.paper",
        zIndex: 10,
      }}
    >
      <Button
        variant="contained"
        startIcon={<ArticleIcon />}
        onClick={onAddBaiBao}
      >
        Thêm bài báo
      </Button>
      <Button
        variant="outlined"
        startIcon={<EditIcon />}
        onClick={onEditTapSan}
      >
        Sửa tập san
      </Button>
      <Button startIcon={<ArticleIcon />} onClick={onOpenBaibao}>
        Quản lý bài báo
      </Button>
    </Stack>
  );
}

export default function TapSanWorkspace() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();
  const tab = sp.get("tab") || "overview";

  const tapSan = useSelector((state) => selectTapSanById(state, id));
  const [loading, setLoading] = React.useState(!tapSan);
  const rows = useSelector((state) => selectBaiBaoListByTapSan(state, id));
  const meta = useSelector((state) => selectBaiBaoListMeta(state, id));
  const [selectedId, setSelectedId] = React.useState(null);
  const selectedBaiBao = useSelector((state) =>
    selectedId ? selectBaiBaoById(state, selectedId) : null
  );
  const { showSuccess, showError, SnackbarElement } = useLocalSnackbar();

  // Filters and pagination for BaiBao list
  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 20,
  });
  const [search, setSearch] = React.useState("");
  const [trangThaiFilter, setTrangThaiFilter] = React.useState("");
  const [tacGiaFilter, setTacGiaFilter] = React.useState("");
  const [confirm, setConfirm] = React.useState({ open: false, loading: false });

  React.useEffect(() => {
    let active = true;
    if (!tapSan) {
      setLoading(true);
      dispatch(fetchTapSanById(id))
        .unwrap()
        .finally(() => active && setLoading(false));
    }
    return () => {
      active = false;
    };
  }, [id, tapSan, dispatch]);

  const onTabChange = (_, v) => setSp({ tab: v });

  const onAddBaiBao = () => setSp({ tab: "baibao", action: "add" });
  const onEditTapSan = () => navigate(`/tapsan/${id}/edit`);
  const onOpenBaibao = () => navigate(`/tapsan/${id}/baibao`);

  // Load BaiBao list when tab is active
  const loadBaiBaoList = React.useCallback(async () => {
    if (tab !== "baibao") return;
    const params = {
      page: paginationModel.page + 1,
      limit: paginationModel.pageSize,
      filters: {
        search,
        trangThai: trangThaiFilter,
        tacGia: tacGiaFilter,
      },
    };
    await dispatch(fetchBaiBaoListByTapSan({ tapSanId: id, ...params }));
  }, [
    tab,
    id,
    paginationModel,
    search,
    trangThaiFilter,
    tacGiaFilter,
    dispatch,
  ]);

  React.useEffect(() => {
    loadBaiBaoList();
  }, [loadBaiBaoList]);

  // Auto-select first row when list loads
  React.useEffect(() => {
    if (tab !== "baibao") return;
    if (!rows?.length) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !rows.find((r) => r._id === selectedId)) {
      setSelectedId(rows[0]._id);
    }
  }, [rows, tab, selectedId]);

  // Ensure detail is loaded for selected
  React.useEffect(() => {
    if (tab !== "baibao" || !selectedId) return;
    dispatch(fetchBaiBaoByIdThunk(selectedId));
  }, [tab, selectedId, dispatch]);

  const handleDeleteSelected = async () => {
    if (!selectedId) return;
    try {
      setConfirm((s) => ({ ...s, loading: true }));
      await dispatch(deleteBaiBaoThunk(selectedId)).unwrap();
      setConfirm({ open: false, loading: false });
      showSuccess("Đã xóa bài báo");
      await loadBaiBaoList();
      setSelectedId(null);
    } catch (e) {
      setConfirm({ open: false, loading: false });
      showError("Không thể xóa bài báo");
    }
  };

  return (
    <Box>
      <CommandBar
        onAddBaiBao={onAddBaiBao}
        onEditTapSan={onEditTapSan}
        onOpenBaibao={onOpenBaibao}
      />

      <Tabs value={tab} onChange={onTabChange} sx={{ px: 1.5 }}>
        <Tab label="Tổng quan" value="overview" />
        <Tab label="Bài báo" value="baibao" />
        <Tab label="Đính kèm" value="attachments" />
      </Tabs>

      <Box sx={{ p: 2 }}>
        {loading ? (
          <Card>
            <CardContent>
              <Skeleton variant="text" width={240} height={36} />
              <Skeleton variant="rectangular" height={160} sx={{ mt: 2 }} />
            </CardContent>
          </Card>
        ) : (
          <>
            {tab === "overview" && (
              <Card>
                <CardContent>
                  <Typography variant="h5" sx={{ mb: 2 }}>
                    {tapSan?.Loai === "YHTH"
                      ? "Y học thực hành"
                      : "Thông tin thuốc"}{" "}
                    - Năm {tapSan?.NamXuatBan} - Số {tapSan?.SoXuatBan}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={`Trạng thái: ${
                        tapSan?.TrangThai === "da-hoan-thanh"
                          ? "Đã hoàn thành"
                          : "Chưa hoàn thành"
                      }`}
                      color={
                        tapSan?.TrangThai === "da-hoan-thanh"
                          ? "success"
                          : "warning"
                      }
                    />
                  </Stack>
                </CardContent>
              </Card>
            )}

            {tab === "baibao" && (
              <Grid container spacing={2} alignItems="stretch">
                {/* Left: List and Filters */}
                <Grid item xs={12} md={7} lg={8}>
                  <Card sx={{ height: "100%" }}>
                    <CardContent>
                      <Stack
                        direction="row"
                        spacing={2}
                        mb={2}
                        alignItems="center"
                      >
                        <TextField
                          placeholder="Tìm tiêu đề, tác giả..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          size="small"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <ArticleIcon fontSize="small" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ minWidth: 240 }}
                        />
                        <TextField
                          select
                          label="Trạng thái"
                          value={trangThaiFilter}
                          onChange={(e) => setTrangThaiFilter(e.target.value)}
                          size="small"
                          sx={{ minWidth: 180 }}
                        >
                          <MenuItem value="">Tất cả</MenuItem>
                          {TRANG_THAI_OPTIONS.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </MenuItem>
                          ))}
                        </TextField>
                        <TextField
                          placeholder="Tác giả"
                          value={tacGiaFilter}
                          onChange={(e) => setTacGiaFilter(e.target.value)}
                          size="small"
                          sx={{ minWidth: 160 }}
                        />
                        <Button
                          variant="outlined"
                          onClick={() =>
                            setPaginationModel({ ...paginationModel, page: 0 })
                          }
                        >
                          Lọc
                        </Button>
                        <Box sx={{ flex: 1 }} />
                        <Button
                          variant="contained"
                          onClick={() => navigate(`/tapsan/${id}/baibao/add`)}
                        >
                          Thêm bài báo
                        </Button>
                      </Stack>

                      <div style={{ width: "100%" }}>
                        <DataGrid
                          autoHeight
                          rows={rows || []}
                          getRowId={(r) => r._id}
                          columns={[
                            {
                              field: "TieuDe",
                              headerName: "Tiêu đề",
                              flex: 1,
                              minWidth: 220,
                            },
                            {
                              field: "TacGia",
                              headerName: "Tác giả",
                              width: 180,
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
                          ]}
                          loading={!!meta.loading}
                          paginationModel={paginationModel}
                          onPaginationModelChange={setPaginationModel}
                          rowCount={meta?.total || 0}
                          paginationMode="server"
                          pageSizeOptions={[10, 20, 50]}
                          onRowClick={(p) => setSelectedId(p.id)}
                          sx={{
                            "& .MuiDataGrid-row:hover": {
                              backgroundColor: "action.hover",
                            },
                            cursor: "pointer",
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Right: Detail */}
                <Grid item xs={12} md={5} lg={4}>
                  <Card sx={{ height: "100%" }}>
                    <CardContent>
                      {!selectedId ? (
                        <Typography color="text.secondary">
                          Chọn một bài báo để xem chi tiết
                        </Typography>
                      ) : !selectedBaiBao ? (
                        <>
                          <Skeleton variant="text" width={260} height={28} />
                          <Skeleton variant="text" width={180} />
                          <Skeleton
                            variant="rectangular"
                            height={120}
                            sx={{ mt: 1 }}
                          />
                        </>
                      ) : (
                        <>
                          <Typography variant="h6" sx={{ mb: 1 }}>
                            {selectedBaiBao.TieuDe}
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ mb: 1 }}
                          >
                            <Chip
                              label={selectedBaiBao.TrangThai}
                              color={getTrangThaiColor(
                                selectedBaiBao.TrangThai
                              )}
                              size="small"
                            />
                            {selectedBaiBao.TacGia && (
                              <Chip
                                label={`Tác giả: ${selectedBaiBao.TacGia}`}
                                size="small"
                              />
                            )}
                          </Stack>
                          {selectedBaiBao.TomTat && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ whiteSpace: "pre-wrap", mb: 2 }}
                            >
                              {selectedBaiBao.TomTat}
                            </Typography>
                          )}
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() =>
                                navigate(`/tapsan/${id}/baibao/${selectedId}`)
                              }
                            >
                              Xem chi tiết
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() =>
                                navigate(
                                  `/tapsan/${id}/baibao/${selectedId}/edit`
                                )
                              }
                            >
                              Chỉnh sửa
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              onClick={() =>
                                setConfirm({ open: true, loading: false })
                              }
                            >
                              Xóa
                            </Button>
                          </Stack>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {tab === "attachments" && (
              <Stack spacing={2}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      Tệp kế hoạch
                    </Typography>
                    <AttachmentSection
                      ownerType="TapSan"
                      ownerId={id}
                      field="kehoach"
                      title="Tệp kế hoạch"
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      Tệp tập san
                    </Typography>
                    <AttachmentSection
                      ownerType="TapSan"
                      ownerId={id}
                      field="file"
                      title="Tệp tập san"
                    />
                  </CardContent>
                </Card>
              </Stack>
            )}
          </>
        )}
      </Box>
      {SnackbarElement}
      <ConfirmDialog
        open={confirm.open}
        loading={confirm.loading}
        onClose={() => setConfirm({ open: false, loading: false })}
        onConfirm={handleDeleteSelected}
        title="Xóa bài báo"
        message="Bạn có chắc chắn muốn xóa bài báo này không?"
      />
    </Box>
  );
}
