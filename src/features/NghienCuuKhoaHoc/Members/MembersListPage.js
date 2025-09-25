import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Stack,
  TextField,
  Button,
  Chip,
  Drawer,
  Typography,
  Card,
  CardContent,
  Avatar,
  Divider,
  IconButton,
  Fade,
  Paper,
  InputAdornment,
  Tooltip,
  Badge,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  FileDownload as DownloadIcon,
  Person as PersonIcon,
  Flight as FlightIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  Public as PublicIcon,
  Group as GroupIcon,
  LocationOn as LocationIcon,
  CreditCard as PassportIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { loadDoanRaMembers } from "features/NghienCuuKhoaHoc/DoanRa/doanRaMembersSlice";
import { loadDoanVaoMembers } from "features/NghienCuuKhoaHoc/DoanVao/doanVaoMembersSlice";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  fetchDoanRaMembers,
  fetchDoanVaoMembers,
} from "features/NghienCuuKhoaHoc/membersApi";
import { getDataFix } from "features/NhanVien/nhanvienSlice";
import apiService from "app/apiService";

export default function MembersListPage({ type = "doanra" }) {
  const dispatch = useDispatch();
  const state = useSelector((s) =>
    type === "doanra" ? s.doanRaMembers : s.doanVaoMembers
  );
  const { items, total, page, limit, isLoading } = state || {};

  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [hasPassport, setHasPassport] = useState("");
  const [drawer, setDrawer] = useState(null);
  const [quocGiaDen, setQuocGiaDen] = useState(""); // doanra
  const [mucDichXuatCanh, setMucDichXuatCanh] = useState(""); // doanra
  const [nguonKinhPhi, setNguonKinhPhi] = useState(""); // doanra
  const [optionsRa, setOptionsRa] = useState({
    MucDichXuatCanh: [],
    NguonKinhPhi: [],
  });
  const [donViGioiThieu, setDonViGioiThieu] = useState(""); // doanvao
  const [showFilters, setShowFilters] = useState(false);
  const { DonViGioiThieu: DonViGioiThieuList } = useSelector(
    (s) => s.nhanvien || {}
  );

  const title =
    type === "doanra"
      ? "Danh sách thành viên đoàn ra"
      : "Danh sách thành viên đoàn vào";
  const icon = type === "doanra" ? <FlightIcon /> : <GroupIcon />;

  // Sticky offset for top app bar (responsive)
  const STICKY_TOP = { xs: 56, sm: 64 };

  useEffect(() => {
    const action = type === "doanra" ? loadDoanRaMembers : loadDoanVaoMembers;
    dispatch(
      action({
        page: 1,
        limit: 20,
        search: "",
        fromDate: "",
        toDate: "",
        hasPassport: "",
        quocGiaDen: "",
        mucDichXuatCanh: "",
        donViGioiThieu: "",
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  useEffect(() => {
    if (!Array.isArray(DonViGioiThieuList) || DonViGioiThieuList.length === 0) {
      dispatch(getDataFix());
    }
  }, [dispatch, DonViGioiThieuList]);

  useEffect(() => {
    if (type === "doanra") {
      (async () => {
        try {
          const res = await apiService.get("/doanra/options");
          const data = res?.data?.data || {};
          setOptionsRa({
            MucDichXuatCanh: Array.isArray(data.MucDichXuatCanh)
              ? data.MucDichXuatCanh
              : [],
            NguonKinhPhi: Array.isArray(data.NguonKinhPhi)
              ? data.NguonKinhPhi
              : [],
          });
        } catch (e) {
          // silent fail; Autocomplete still allows freeSolo
        }
      })();
    }
  }, [type]);

  const handleFilter = () => {
    const action = type === "doanra" ? loadDoanRaMembers : loadDoanVaoMembers;
    const payload = {
      page: 1,
      limit,
      search,
      fromDate,
      toDate,
      hasPassport,
      quocGiaDen: type === "doanra" ? quocGiaDen : undefined,
      mucDichXuatCanh: type === "doanra" ? mucDichXuatCanh : undefined,
      nguonKinhPhi: type === "doanra" ? nguonKinhPhi : undefined,
      donViGioiThieu: type === "doanvao" ? donViGioiThieu : undefined,
    };
    dispatch(action(payload));
  };

  const handleExport = async () => {
    const params = {
      page: 1,
      limit: 50000,
      search,
      fromDate,
      toDate,
      hasPassport,
      quocGiaDen: type === "doanra" ? quocGiaDen : undefined,
      mucDichXuatCanh: type === "doanra" ? mucDichXuatCanh : undefined,
      nguonKinhPhi: type === "doanra" ? nguonKinhPhi : undefined,
      donViGioiThieu: type === "doanvao" ? donViGioiThieu : undefined,
    };
    const fetcher =
      type === "doanra" ? fetchDoanRaMembers : fetchDoanVaoMembers;
    const data = await fetcher(params);

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet(
      type === "doanra" ? "ThanhVienDoanRa" : "ThanhVienDoanVao"
    );

    const cols =
      type === "doanra"
        ? [
            { header: "Họ tên", key: "Ten", width: 26 },
            { header: "Ngày sinh", key: "NgaySinh", width: 14 },
            { header: "Giới tính", key: "GioiTinh", width: 10 },
            { header: "Chức vụ", key: "ChucVu", width: 18 },
            { header: "Khoa", key: "Khoa", width: 20 },
            {
              header: "Trình độ chuyên môn",
              key: "TrinhDoChuyenMon",
              width: 22,
            },
            { header: "Đảng viên", key: "DangVien", width: 12 },
            { header: "Số hộ chiếu", key: "SoHoChieu", width: 18 },
            { header: "Có báo cáo?", key: "CoBaoCao", width: 14 },
            { header: "Mục đích", key: "MucDichXuatCanh", width: 28 },
            { header: "Quốc gia đến", key: "QuocGiaDen", width: 20 },
            { header: "Nguồn kinh phí", key: "NguonKinhPhi", width: 20 },
            { header: "Số văn bản", key: "SoVanBanChoPhep", width: 16 },
            { header: "Từ ngày", key: "TuNgay", width: 14 },
            { header: "Đến ngày", key: "DenNgay", width: 14 },
          ]
        : [
            { header: "Họ tên", key: "Ten", width: 26 },
            { header: "Ngày sinh", key: "NgaySinh", width: 14 },
            { header: "Giới tính", key: "GioiTinh", width: 10 },
            { header: "Chức vụ", key: "ChucVu", width: 18 },
            { header: "Đơn vị công tác", key: "DonViCongTac", width: 24 },
            { header: "Quốc tịch", key: "QuocTich", width: 14 },
            { header: "Số hộ chiếu", key: "SoHoChieu", width: 18 },
            { header: "Mục đích", key: "MucDichXuatCanh", width: 28 },
            { header: "Số văn bản", key: "SoVanBanChoPhep", width: 16 },
            { header: "Từ ngày", key: "TuNgay", width: 14 },
            { header: "Đến ngày", key: "DenNgay", width: 14 },
            { header: "Đơn vị giới thiệu", key: "DonViGioiThieu", width: 24 },
            { header: "Có báo cáo?", key: "CoBaoCao", width: 14 },
          ];

    ws.columns = cols;
    (data.items || []).forEach((r) => {
      const row = {
        ...r,
        NgaySinh: r.NgaySinh ? dayjs(r.NgaySinh).format("DD/MM/YYYY") : "",
        GioiTinh:
          r.GioiTinh === 0 || r.GioiTinh === "0"
            ? "Nam"
            : r.GioiTinh === 1 || r.GioiTinh === "1"
            ? "Nữ"
            : "",
        TuNgay: r.TuNgay ? dayjs(r.TuNgay).format("DD/MM/YYYY") : "",
        DenNgay: r.DenNgay ? dayjs(r.DenNgay).format("DD/MM/YYYY") : "",
      };
      if (type === "doanra") {
        row.Khoa = r.TenKhoa || "";
        row.DangVien = r.isDangVien ? "Có" : "Không";
        row.CoBaoCao = r.CoBaoCao ? "Có" : "Không";
      }
      if (type === "doanvao") {
        row.CoBaoCao = r.CoBaoCao ? "Có" : "Không";
      }
      ws.addRow(row);
    });

    const buf = await wb.xlsx.writeBuffer();
    saveAs(
      new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      type === "doanra" ? "ThanhVien_DoanRa.xlsx" : "ThanhVien_DoanVao.xlsx"
    );
  };

  const clearFilters = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
    setHasPassport("");
    setQuocGiaDen("");
    setMucDichXuatCanh("");
    setNguonKinhPhi("");
    setDonViGioiThieu("");
  };

  const columns = useMemo(() => {
    const base = [
      {
        field: "Ten",
        headerName: "Họ tên",
        flex: 1,
        minWidth: 200,
        renderCell: (params) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: "primary.main",
                fontSize: 14,
              }}
            >
              {params.value?.charAt(0)?.toUpperCase() || "N"}
            </Avatar>
            <Typography variant="body2" fontWeight={500}>
              {params.value}
            </Typography>
          </Box>
        ),
      },
      {
        field: "NgaySinh",
        headerName: "Ngày sinh",
        width: 130,
        valueFormatter: ({ value }) =>
          value ? dayjs(value).format("DD/MM/YYYY") : "",
        renderCell: (params) => (
          <Chip
            label={params.formattedValue}
            size="small"
            variant="outlined"
            sx={{ bgcolor: "grey.50" }}
          />
        ),
      },
      {
        field: "GioiTinh",
        headerName: "Giới tính",
        width: 100,
        valueGetter: ({ value }) =>
          value === "0" || value === 0
            ? "Nam"
            : value === "1" || value === 1
            ? "Nữ"
            : "",
        renderCell: (params) => (
          <Chip
            label={params.value}
            size="small"
            color={params.value === "Nam" ? "primary" : "secondary"}
            variant="outlined"
          />
        ),
      },
      { field: "ChucVu", headerName: "Chức vụ", width: 160 },
      // Replace DonViCongTac with Khoa (TenKhoa)
      {
        field: type === "doanra" ? "TenKhoa" : "DonViCongTac",
        headerName: type === "doanra" ? "Khoa" : "Đơn vị công tác",
        flex: 1,
        minWidth: 180,
      },
      // Remove Quốc tịch for Đoàn ra per request
      ...(type === "doanra"
        ? []
        : [{ field: "QuocTich", headerName: "Quốc tịch", width: 130 }]),
      {
        field: "SoHoChieu",
        headerName: "Số hộ chiếu",
        width: 180,
        renderCell: (params) => (
          <Chip
            icon={<PassportIcon sx={{ fontSize: 16 }} />}
            label={params.value || "Chưa có"}
            size="small"
            variant={params.value ? "filled" : "outlined"}
            color={params.value ? "success" : "default"}
            sx={{ maxWidth: "100%" }}
          />
        ),
      },
    ];

    const parentRa = [
      {
        field: "TrinhDoChuyenMon",
        headerName: "Trình độ chuyên môn",
        minWidth: 180,
        flex: 1,
      },
      {
        field: "isDangVien",
        headerName: "Đảng viên",
        width: 120,
        renderCell: (params) => (
          <Chip
            label={params.value ? "Có" : "Không"}
            size="small"
            color={params.value ? "success" : "default"}
            variant={params.value ? "filled" : "outlined"}
          />
        ),
      },
      {
        field: "CoBaoCao",
        headerName: "Có báo cáo?",
        width: 140,
        renderCell: (params) => (
          <Chip
            label={params.value ? "Có" : "Không"}
            size="small"
            color={params.value ? "success" : "default"}
            variant={params.value ? "filled" : "outlined"}
          />
        ),
      },
      {
        field: "MucDichXuatCanh",
        headerName: "Mục đích",
        flex: 1,
        minWidth: 220,
      },
      {
        field: "QuocGiaDen",
        headerName: "Quốc gia đến",
        width: 180,
        renderCell: (params) => (
          <Chip
            icon={<PublicIcon sx={{ fontSize: 16 }} />}
            label={params.value || "Chưa xác định"}
            size="small"
            color="primary"
            variant="outlined"
          />
        ),
      },
      { field: "SoVanBanChoPhep", headerName: "Số văn bản", width: 160 },
      {
        field: "TuNgay",
        headerName: "Từ ngày",
        width: 130,
        valueFormatter: ({ value }) =>
          value ? dayjs(value).format("DD/MM/YYYY") : "",
        renderCell: (params) => (
          <Typography variant="body2" color="text.secondary">
            {params.formattedValue}
          </Typography>
        ),
      },
      {
        field: "DenNgay",
        headerName: "Đến ngày",
        width: 130,
        valueFormatter: ({ value }) =>
          value ? dayjs(value).format("DD/MM/YYYY") : "",
        renderCell: (params) => (
          <Typography variant="body2" color="text.secondary">
            {params.formattedValue}
          </Typography>
        ),
      },
      {
        field: "NguonKinhPhi",
        headerName: "Nguồn kinh phí",
        minWidth: 160,
        flex: 1,
      },
    ];

    const parentVao = [
      {
        field: "MucDichXuatCanh",
        headerName: "Mục đích",
        flex: 1,
        minWidth: 220,
      },
      { field: "SoVanBanChoPhep", headerName: "Số văn bản", width: 160 },
      {
        field: "TuNgay",
        headerName: "Từ ngày",
        width: 130,
        valueFormatter: ({ value }) =>
          value ? dayjs(value).format("DD/MM/YYYY") : "",
        renderCell: (params) => (
          <Typography variant="body2" color="text.secondary">
            {params.formattedValue}
          </Typography>
        ),
      },
      {
        field: "DenNgay",
        headerName: "Đến ngày",
        width: 130,
        valueFormatter: ({ value }) =>
          value ? dayjs(value).format("DD/MM/YYYY") : "",
        renderCell: (params) => (
          <Typography variant="body2" color="text.secondary">
            {params.formattedValue}
          </Typography>
        ),
      },
      {
        field: "DonViGioiThieu",
        headerName: "Đơn vị giới thiệu",
        width: 200,
        renderCell: (params) => (
          <Chip
            icon={<BusinessIcon sx={{ fontSize: 16 }} />}
            label={params.value || "Chưa có"}
            size="small"
            color="info"
            variant="outlined"
          />
        ),
      },
      {
        field: "CoBaoCao",
        headerName: "Có báo cáo?",
        width: 140,
        renderCell: (params) => (
          <Chip
            label={params.value ? "Có" : "Không"}
            size="small"
            color={params.value ? "success" : "default"}
            variant={params.value ? "filled" : "outlined"}
          />
        ),
      },
    ];

    return type === "doanra" ? [...base, ...parentRa] : [...base, ...parentVao];
  }, [type]);

  const filterCount = [
    search,
    fromDate,
    toDate,
    hasPassport,
    quocGiaDen,
    mucDichXuatCanh,
    donViGioiThieu,
  ].filter(Boolean).length;

  return (
    <Box
      sx={{
        p: 3,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Box
          sx={{
            position: "sticky",
            top: STICKY_TOP,
            zIndex: (t) => t.zIndex.appBar - 1,
            bgcolor: "background.paper",
            pt: 1,
            pb: 1.5,
            mb: 2,
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48 }}>
              {icon}
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={600} color="primary.main">
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Quản lý và tìm kiếm thông tin thành viên một cách dễ dàng
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Làm mới dữ liệu">
              <IconButton
                onClick={() => handleFilter()}
                sx={{ bgcolor: "action.hover" }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Badge badgeContent={filterCount} color="primary">
              <Button
                variant={showFilters ? "contained" : "outlined"}
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Bộ lọc
              </Button>
            </Badge>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              color="success"
            >
              Xuất Excel
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Fade in={showFilters}>
          <Card
            variant="outlined"
            sx={{ display: showFilters ? "block" : "none", mt: 2 }}
          >
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Tìm kiếm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    placeholder="Nhập tên, chức vụ, số hộ chiếu..."
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Từ ngày"
                    InputLabelProps={{ shrink: true }}
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Đến ngày"
                    InputLabelProps={{ shrink: true }}
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Có hộ chiếu?</InputLabel>
                    <Select
                      value={hasPassport}
                      onChange={(e) => setHasPassport(e.target.value)}
                      label="Có hộ chiếu?"
                    >
                      <MenuItem value="">Tất cả</MenuItem>
                      <MenuItem value="true">Có hộ chiếu</MenuItem>
                      <MenuItem value="false">Chưa có hộ chiếu</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  {type === "doanra" ? (
                    <TextField
                      fullWidth
                      size="small"
                      label="Quốc gia đến"
                      value={quocGiaDen}
                      onChange={(e) => setQuocGiaDen(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PublicIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  ) : (
                    <Autocomplete
                      options={
                        Array.isArray(DonViGioiThieuList)
                          ? DonViGioiThieuList.map(
                              (o) => o?.DonViGioiThieu
                            ).filter(Boolean)
                          : []
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Đơn vị giới thiệu"
                          size="small"
                          fullWidth
                        />
                      )}
                      value={donViGioiThieu || null}
                      onChange={(_, value) => setDonViGioiThieu(value || "")}
                      freeSolo
                    />
                  )}
                </Grid>
                {type === "doanra" && (
                  <>
                    <Grid item xs={12} md={2}>
                      <Autocomplete
                        options={optionsRa.MucDichXuatCanh}
                        value={mucDichXuatCanh || null}
                        onChange={(_, v) => setMucDichXuatCanh(v || "")}
                        freeSolo
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Mục đích xuất cảnh"
                            size="small"
                            fullWidth
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Autocomplete
                        options={optionsRa.NguonKinhPhi}
                        value={nguonKinhPhi || null}
                        onChange={(_, v) => setNguonKinhPhi(v || "")}
                        freeSolo
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Nguồn kinh phí"
                            size="small"
                            fullWidth
                          />
                        )}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  gap: 1,
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  variant="outlined"
                  onClick={clearFilters}
                  startIcon={<CloseIcon />}
                >
                  Xóa bộ lọc
                </Button>
                <Button
                  variant="contained"
                  onClick={handleFilter}
                  startIcon={<SearchIcon />}
                >
                  Áp dụng
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Paper>

      {/* Data Grid */}
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ height: 620, width: "100%" }}>
          <DataGrid
            rows={(items || []).map((r, idx) => ({
              id: `${r.DoanId || "parent"}-${idx}`,
              ...r,
            }))}
            columns={columns}
            rowCount={total}
            loading={isLoading}
            paginationMode="server"
            pageSizeOptions={[10, 20, 50, 100]}
            paginationModel={{ page: (page || 1) - 1, pageSize: limit || 20 }}
            onPaginationModelChange={(m) => {
              const next = {
                page: m.page + 1,
                limit: m.pageSize,
                search,
                fromDate,
                toDate,
                hasPassport,
                quocGiaDen: type === "doanra" ? quocGiaDen : undefined,
                mucDichXuatCanh:
                  type === "doanra" ? mucDichXuatCanh : undefined,
                nguonKinhPhi: type === "doanra" ? nguonKinhPhi : undefined,
                donViGioiThieu: type === "doanvao" ? donViGioiThieu : undefined,
              };
              const action =
                type === "doanra" ? loadDoanRaMembers : loadDoanVaoMembers;
              dispatch(action(next));
            }}
            onRowClick={(p) => setDrawer(p.row)}
            disableRowSelectionOnClick
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            sx={{
              border: "none",
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid rgba(224, 224, 224, 0.3)",
                fontSize: "0.875rem",
                padding: "12px 16px",
              },
              // Toolbar: no sticky to avoid overlapping first row
              "& .MuiDataGrid-toolbarContainer": {
                bgcolor: "background.paper",
                borderBottom: "1px solid rgba(224, 224, 224, 0.3)",
                padding: "8px 16px",
                "& .MuiButton-root": {
                  textTransform: "none",
                  fontWeight: 500,
                },
              },
              "& .MuiDataGrid-row": {
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  bgcolor: "rgba(102, 126, 234, 0.05)",
                  cursor: "pointer",
                  transform: "translateY(-1px)",
                  boxShadow: "0 2px 8px rgba(102, 126, 234, 0.1)",
                },
                "&:nth-of-type(even)": {
                  bgcolor: "rgba(0, 0, 0, 0.015)",
                },
              },
              // Column headers: modern styled sticky headers
              "& .MuiDataGrid-columnHeaders": {
                position: "sticky",
                top: 0,
                zIndex: 1,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderBottom: "3px solid #667eea",
                boxShadow: "0 2px 8px rgba(102, 126, 234, 0.15)",
                "& .MuiDataGrid-columnHeader": {
                  backgroundColor: "transparent",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  padding: "12px 16px",
                  borderRight: "1px solid rgba(255, 255, 255, 0.2)",
                  "&:last-child": {
                    borderRight: "none",
                  },
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                  "& .MuiDataGrid-columnHeaderTitle": {
                    fontWeight: 700,
                    color: "white",
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                  },
                  "& .MuiDataGrid-iconButtonContainer": {
                    color: "white",
                    "& .MuiIconButton-root": {
                      color: "white",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.15)",
                      },
                    },
                  },
                  "& .MuiDataGrid-sortIcon": {
                    color: "white",
                    opacity: 0.9,
                  },
                  "& .MuiDataGrid-menuIcon": {
                    color: "white",
                    opacity: 0.8,
                  },
                },
              },
            }}
          />
        </Box>
      </Paper>

      {/* Detail Drawer */}
      <Drawer
        anchor="right"
        open={!!drawer}
        onClose={() => setDrawer(null)}
        sx={{
          "& .MuiDrawer-paper": {
            width: 450,
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          },
        }}
      >
        {drawer && (
          <Box sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 3,
              }}
            >
              <Typography variant="h5" fontWeight={600} color="primary.main">
                Chi tiết thành viên
              </Typography>
              <IconButton onClick={() => setDrawer(null)}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Member Info Card */}
            <Card elevation={2} sx={{ mb: 3, borderRadius: 3 }}>
              <CardContent>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      bgcolor: "primary.main",
                      fontSize: 20,
                    }}
                  >
                    {drawer.Ten?.charAt(0)?.toUpperCase() || "N"}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {drawer.Ten}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {drawer.ChucVu}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={2}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CalendarIcon color="action" />
                    <Typography variant="body2" fontWeight={500}>
                      Ngày sinh:
                    </Typography>
                    <Typography variant="body2">
                      {drawer.NgaySinh
                        ? dayjs(drawer.NgaySinh).format("DD/MM/YYYY")
                        : "Chưa có"}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PersonIcon color="action" />
                    <Typography variant="body2" fontWeight={500}>
                      Giới tính:
                    </Typography>
                    <Chip
                      label={
                        drawer.GioiTinh === "0" || drawer.GioiTinh === 0
                          ? "Nam"
                          : drawer.GioiTinh === 1 || drawer.GioiTinh === "1"
                          ? "Nữ"
                          : "Chưa xác định"
                      }
                      size="small"
                      color={
                        drawer.GioiTinh === "1" || drawer.GioiTinh === 1
                          ? "primary"
                          : "secondary"
                      }
                    />
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <BusinessIcon color="action" />
                    <Typography variant="body2" fontWeight={500}>
                      {type === "doanra" ? "Khoa:" : "Đơn vị:"}
                    </Typography>
                    <Typography variant="body2">
                      {type === "doanra"
                        ? drawer.TenKhoa || "Chưa có"
                        : drawer.DonViCongTac || "Chưa có"}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PublicIcon color="action" />
                    <Typography variant="body2" fontWeight={500}>
                      Quốc tịch:
                    </Typography>
                    <Typography variant="body2">
                      {drawer.QuocTich || "Chưa có"}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PassportIcon color="action" />
                    <Typography variant="body2" fontWeight={500}>
                      Số hộ chiếu:
                    </Typography>
                    <Chip
                      label={drawer.SoHoChieu || "Chưa có"}
                      size="small"
                      color={drawer.SoHoChieu ? "success" : "default"}
                      variant={drawer.SoHoChieu ? "filled" : "outlined"}
                    />
                  </Box>

                  {type === "doanra" && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AssignmentIcon color="action" />
                      <Typography variant="body2" fontWeight={500}>
                        Có báo cáo?
                      </Typography>
                      <Chip
                        label={drawer.CoBaoCao ? "Có" : "Không"}
                        size="small"
                        color={drawer.CoBaoCao ? "success" : "default"}
                        variant={drawer.CoBaoCao ? "filled" : "outlined"}
                      />
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Group Info Card */}
            <Card elevation={2} sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  color="primary.main"
                  sx={{ mb: 2 }}
                >
                  {type === "doanra"
                    ? "Thông tin đoàn ra"
                    : "Thông tin đoàn vào"}
                </Typography>

                <Stack spacing={2}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AssignmentIcon color="action" />
                    <Typography variant="body2" fontWeight={500}>
                      Mục đích:
                    </Typography>
                    <Typography variant="body2">
                      {drawer.MucDichXuatCanh || "Chưa có"}
                    </Typography>
                  </Box>

                  {type === "doanra" && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LocationIcon color="action" />
                      <Typography variant="body2" fontWeight={500}>
                        Quốc gia đến:
                      </Typography>
                      <Chip
                        label={drawer.QuocGiaDen || "Chưa xác định"}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  )}

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AssignmentIcon color="action" />
                    <Typography variant="body2" fontWeight={500}>
                      Số văn bản:
                    </Typography>
                    <Typography variant="body2">
                      {drawer.SoVanBanChoPhep || "Chưa có"}
                    </Typography>
                  </Box>

                  {type === "doanra" && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AssignmentIcon color="action" />
                      <Typography variant="body2" fontWeight={500}>
                        Nguồn kinh phí:
                      </Typography>
                      <Typography variant="body2">
                        {drawer.NguonKinhPhi || "Chưa có"}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CalendarIcon color="action" />
                    <Typography variant="body2" fontWeight={500}>
                      Thời gian:
                    </Typography>
                    <Typography variant="body2">
                      {drawer.TuNgay
                        ? dayjs(drawer.TuNgay).format("DD/MM/YYYY")
                        : ""}
                      {drawer.TuNgay && drawer.DenNgay ? " - " : ""}
                      {drawer.DenNgay
                        ? dayjs(drawer.DenNgay).format("DD/MM/YYYY")
                        : ""}
                    </Typography>
                  </Box>

                  {type === "doanvao" && drawer.DonViGioiThieu && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <BusinessIcon color="action" />
                      <Typography variant="body2" fontWeight={500}>
                        Đơn vị giới thiệu:
                      </Typography>
                      <Typography variant="body2">
                        {drawer.DonViGioiThieu}
                      </Typography>
                    </Box>
                  )}
                  {type === "doanvao" && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AssignmentIcon color="action" />
                      <Typography variant="body2" fontWeight={500}>
                        Có báo cáo?
                      </Typography>
                      <Chip
                        label={drawer.CoBaoCao ? "Có" : "Không"}
                        size="small"
                        color={drawer.CoBaoCao ? "success" : "default"}
                        variant={drawer.CoBaoCao ? "filled" : "outlined"}
                      />
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}
