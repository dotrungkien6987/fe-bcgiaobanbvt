import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Paper,
  IconButton,
  Tooltip,
  Typography,
  TextField,
  InputAdornment,
  Stack,
  Box,
  Skeleton,
  Chip,
  Button,
  Alert,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  History as HistoryIcon,
  Close as CloseIcon,
  FileDownload as ExportIcon,
  DateRange as DateRangeIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { exportChiTietExcel } from "../utils/exportChiTietExcel";
import LichSuKhamDialog from "./LichSuKhamDialog";

function formatVND(num) {
  if (num == null) return "0";
  return Number(num).toLocaleString("vi-VN");
}

function parseLichSu(lichsu_kham) {
  if (!lichsu_kham) return [];
  if (typeof lichsu_kham === "string") {
    try {
      return JSON.parse(lichsu_kham);
    } catch {
      return [];
    }
  }
  return Array.isArray(lichsu_kham) ? lichsu_kham : [];
}

function getStatusChip(status, tongTien) {
  if (Number(status) !== 1) {
    return (
      <Chip label="Không khám" size="small" color="error" variant="outlined" />
    );
  }
  const tt = Number(tongTien);
  if (tt > 0) {
    return (
      <Chip label="Có khám có tiền" size="small" color="success" variant="filled" />
    );
  }
  return <Chip label="Khám 0₫" size="small" color="default" variant="filled" />;
}

const COLUMNS = [
  { id: "stt", label: "STT", align: "center", width: 50 },
  { id: "patientid", label: "Mã BN", width: 80 },
  { id: "patientid_old", label: "Mã BN cũ", width: 80 },
  { id: "dangkykhaminitdate", label: "Ngày đặt lịch", width: 100 },
  { id: "dangkykhamdate", label: "Ngày ĐK khám", width: 100 },
  { id: "patientname", label: "Bệnh nhân", width: 160 },
  { id: "birthday", label: "Ngày sinh", width: 90 },
  { id: "ten_ngt", label: "NGT", width: 140 },
  { id: "ngt_departmentgroupname", label: "Khoa NGT", width: 130 },
  { id: "status", label: "Trạng thái", align: "center", width: 130 },
  { id: "chandoanravien", label: "Chẩn đoán", width: 200 },
  { id: "makemtheo", label: "Mã kèm theo", width: 120 },
  { id: "vp_departmentgroupname", label: "Khoa khám", width: 130 },
  { id: "vp_departmentname", label: "Phòng khám", width: 130 },
  { id: "tong_tien", label: "Tổng tiền", align: "right", width: 110 },
  { id: "mantinh", label: "Mãn tính", align: "center", width: 80 },
  { id: "lichsu", label: "LS Khám", align: "center", width: 100 },
  { id: "ghichu", label: "Ghi chú", width: 200 },
];

function descendingComparator(a, b, orderBy) {
  const valA = a[orderBy] ?? "";
  const valB = b[orderBy] ?? "";
  if (valB < valA) return -1;
  if (valB > valA) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function ChiTietDatLichTable({
  data = [],
  loading = false,
  filterNGT,
  onClearFilterNGT,
  danhSachManTinh = {},
  fromDate,
  toDate,
}) {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("dangkykhamdate");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [search, setSearch] = useState("");
  const [lichSuPatient, setLichSuPatient] = useState(null);
  const [filterTrungNgay, setFilterTrungNgay] = useState(false);
  const [filterTrangThai, setFilterTrangThai] = useState("");
  const [filterManTinh, setFilterManTinh] = useState("");

  // Filter by NGT (from Tab1 click) and text search
  const filteredData = useMemo(() => {
    let result = data;

    // Filter by specific NGT
    if (filterNGT) {
      result = result.filter((r) => r.nguoigioithieuid === filterNGT);
    }

    // Filter trùng ngày
    if (filterTrungNgay) {
      result = result.filter(
        (r) =>
          r.dangkykhaminitdate &&
          r.dangkykhamdate &&
          dayjs(r.dangkykhaminitdate).format("YYYY-MM-DD") ===
            dayjs(r.dangkykhamdate).format("YYYY-MM-DD"),
      );
    }

    // Filter trạng thái khám (phân cấp, loại trừ nhau)
    if (filterTrangThai === "co_kham_co_tien") {
      result = result.filter(
        (r) => Number(r.dangkykhamstatus) === 1 && Number(r.tong_tien) <= 0,
      );
    } else if (filterTrangThai === "khong_kham") {
      result = result.filter((r) => Number(r.dangkykhamstatus) !== 1);
    }

    // Filter mãn tính
    if (filterManTinh === "mantinh") {
      result = result.filter((r) => danhSachManTinh[r.dangkykhamid]);
    } else if (filterManTinh === "khong_mantinh") {
      result = result.filter((r) => !danhSachManTinh[r.dangkykhamid]);
    }

    // Text search
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(
        (r) =>
          (r.patientname || "").toLowerCase().includes(s) ||
          (r.ten_ngt || "").toLowerCase().includes(s) ||
          (r.chandoanravien || "").toLowerCase().includes(s) ||
          (r.hosobenhancode || "").includes(s) ||
          (r.ma_ngt || "").toLowerCase().includes(s) ||
          String(r.patientid || "").includes(s) ||
          String(r.patientid_old || "").includes(s),
      );
    }
    return result;
  }, [
    data,
    filterNGT,
    filterTrungNgay,
    filterTrangThai,
    filterManTinh,
    danhSachManTinh,
    search,
  ]);

  // Sort
  const sortedData = useMemo(
    () => [...filteredData].sort(getComparator(order, orderBy)),
    [filteredData, order, orderBy],
  );

  // Paginated
  const paginatedData = useMemo(
    () =>
      sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sortedData, page, rowsPerPage],
  );

  // Active NGT name for filter banner
  const filterNGTName = useMemo(() => {
    if (!filterNGT || data.length === 0) return null;
    const found = data.find((r) => r.nguoigioithieuid === filterNGT);
    return found ? found.ten_ngt : filterNGT;
  }, [filterNGT, data]);

  const handleSort = (col) => {
    const isAsc = orderBy === col && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(col);
  };

  const handleExport = () => {
    exportChiTietExcel({
      data: filteredData,
      danhSachManTinh,
      fromDate,
      toDate,
    });
  };

  if (loading) {
    return (
      <Box>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} height={40} sx={{ my: 0.5 }} />
        ))}
      </Box>
    );
  }

  return (
    <Paper variant="outlined">
      {/* Filter NGT banner */}
      {filterNGT && (
        <Alert
          severity="info"
          sx={{ borderRadius: 0 }}
          action={
            <Button
              size="small"
              startIcon={<CloseIcon />}
              onClick={onClearFilterNGT}
            >
              Bỏ lọc
            </Button>
          }
        >
          Đang lọc theo NGT: <strong>{filterNGTName}</strong> (
          {filteredData.length} bản ghi)
        </Alert>
      )}

      {/* Active filters banner */}
      {(filterTrungNgay || filterTrangThai || filterManTinh) && (
        <Alert
          severity="warning"
          sx={{ borderRadius: 0 }}
          action={
            <Button
              size="small"
              startIcon={<CloseIcon />}
              onClick={() => {
                setFilterTrungNgay(false);
                setFilterTrangThai("");
                setFilterManTinh("");
              }}
            >
              Xóa bộ lọc
            </Button>
          }
        >
          Bộ lọc:{" "}
          {[
            filterTrungNgay && "Trùng ngày",
            filterTrangThai === "khong_kham" && "Không khám",
            filterTrangThai === "co_kham_0dong" && "Có khám 0₫",
            filterTrangThai === "co_kham_co_tien" && "Có khám + tiền",
            filterManTinh === "mantinh" && "Mãn tính",
            filterManTinh === "khong_mantinh" && "Chưa mãn tính",
          ]
            .filter(Boolean)
            .join(" • ")}{" "}
          — <strong>{filteredData.length}</strong> bản ghi
        </Alert>
      )}

      <Stack
        direction="row"
        alignItems="center"
        spacing={0.5}
        flexWrap="wrap"
        useFlexGap
        sx={{ px: 2, pt: 1.5 }}
      >
        <TextField
          size="small"
          placeholder="Tìm bệnh nhân, NGT, chẩn đoán..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ width: 280 }}
        />

        <Divider orientation="vertical" flexItem />

        <Chip
          icon={<DateRangeIcon />}
          label="Trùng ngày"
          size="small"
          clickable
          color={filterTrungNgay ? "warning" : "default"}
          variant={filterTrungNgay ? "filled" : "outlined"}
          onClick={() => {
            setFilterTrungNgay((prev) => !prev);
            setPage(0);
          }}
        />

        <Divider orientation="vertical" flexItem />

        <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
          Trạng thái:
        </Typography>
        <Chip
          label="Không khám"
          size="small"
          clickable
          color={filterTrangThai === "khong_kham" ? "error" : "default"}
          variant={filterTrangThai === "khong_kham" ? "filled" : "outlined"}
          onClick={() => {
            setFilterTrangThai((prev) =>
              prev === "khong_kham" ? "" : "khong_kham",
            );
            setPage(0);
          }}
        />
        <Chip
          label="Có khám 0₫"
          size="small"
          clickable
          color={filterTrangThai === "co_kham_0dong" ? "info" : "default"}
          variant={filterTrangThai === "co_kham_0dong" ? "filled" : "outlined"}
          onClick={() => {
            setFilterTrangThai((prev) =>
              prev === "co_kham_0dong" ? "" : "co_kham_0dong",
            );
            setPage(0);
          }}
        />
        <Chip
          label="Có khám + tiền"
          size="small"
          clickable
          color={filterTrangThai === "co_kham_co_tien" ? "success" : "default"}
          variant={
            filterTrangThai === "co_kham_co_tien" ? "filled" : "outlined"
          }
          onClick={() => {
            setFilterTrangThai((prev) =>
              prev === "co_kham_co_tien" ? "" : "co_kham_co_tien",
            );
            setPage(0);
          }}
        />

        <Divider orientation="vertical" flexItem />

        <Chip
          label="Mãn tính"
          size="small"
          clickable
          color={filterManTinh === "mantinh" ? "secondary" : "default"}
          variant={filterManTinh === "mantinh" ? "filled" : "outlined"}
          onClick={() => {
            setFilterManTinh((prev) => (prev === "mantinh" ? "" : "mantinh"));
            setPage(0);
          }}
        />
        <Chip
          label="Chưa mãn tính"
          size="small"
          clickable
          color={filterManTinh === "khong_mantinh" ? "info" : "default"}
          variant={filterManTinh === "khong_mantinh" ? "filled" : "outlined"}
          onClick={() => {
            setFilterManTinh((prev) =>
              prev === "khong_mantinh" ? "" : "khong_mantinh",
            );
            setPage(0);
          }}
        />

        <Box sx={{ flex: 1 }} />

        <Tooltip title="Xuất Excel">
          <IconButton color="success" onClick={handleExport}>
            <ExportIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      <TableContainer sx={{ maxHeight: "calc(100vh - 340px)" }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {COLUMNS.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align || "left"}
                  sx={{
                    fontWeight: "bold",
                    width: col.width,
                    whiteSpace: "nowrap",
                  }}
                >
                  {col.id !== "stt" &&
                  col.id !== "lichsu" &&
                  col.id !== "mantinh" ? (
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={orderBy === col.id ? order : "asc"}
                      onClick={() => handleSort(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={COLUMNS.length}
                  align="center"
                  sx={{ py: 4 }}
                >
                  <Typography color="text.secondary">
                    Không có dữ liệu
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, idx) => {
                const statusColor =
                  Number(row.dangkykhamstatus) !== 1
                    ? "#ffebee"
                    : Number(row.tong_tien) > 0
                      ? "#e8f5e9"
                      : "#f5f5f5";

                return (
                  <TableRow
                    key={row.dangkykhamid || idx}
                    hover
                    sx={{ bgcolor: statusColor }}
                  >
                    <TableCell align="center">
                      {page * rowsPerPage + idx + 1}
                    </TableCell>
                    <TableCell>{row.patientid || "—"}</TableCell>
                    <TableCell>{row.patientid_old || "—"}</TableCell>
                    <TableCell>
                      {row.dangkykhaminitdate
                        ? dayjs(row.dangkykhaminitdate).format("DD/MM/YYYY")
                        : ""}
                    </TableCell>
                    <TableCell>
                      {row.dangkykhamdate
                        ? dayjs(row.dangkykhamdate).format("DD/MM/YYYY")
                        : ""}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {row.patientname}
                    </TableCell>
                    <TableCell>
                      {row.birthday
                        ? dayjs(row.birthday).format("DD/MM/YYYY")
                        : ""}
                    </TableCell>
                    <TableCell>{row.ten_ngt}</TableCell>
                    <TableCell>{row.ngt_departmentgroupname}</TableCell>
                    <TableCell align="center">
                      {getStatusChip(row.dangkykhamstatus, row.tong_tien)}
                    </TableCell>
                    <TableCell>
                      <Stack>
                        {row.chandoanravien_code && (
                          <Chip
                            label={row.chandoanravien_code}
                            size="small"
                            variant="outlined"
                            sx={{ width: "fit-content", mb: 0.5 }}
                          />
                        )}
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ maxWidth: 200 }}
                        >
                          {row.chandoanravien || "—"}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="caption"
                        sx={{
                          maxWidth: 120,
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontFamily: "monospace",
                        }}
                        title={row.chandoanravien_kemtheo_code || ""}
                      >
                        {row.chandoanravien_kemtheo_code || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>{row.vp_departmentgroupname || "—"}</TableCell>
                    <TableCell>{row.vp_departmentname || "—"}</TableCell>
                    <TableCell align="right">
                      {formatVND(row.tong_tien)} ₫
                    </TableCell>
                    <TableCell align="center">
                      {danhSachManTinh[row.dangkykhamid] ? (
                        <Chip label="Mãn tính" size="small" color="secondary" />
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Stack
                        direction="row"
                        spacing={0.5}
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Chip
                          label={`${parseLichSu(row.lichsu_kham).length} lần`}
                          size="small"
                          color={
                            parseLichSu(row.lichsu_kham).length >= 3
                              ? "warning"
                              : "default"
                          }
                          variant={
                            parseLichSu(row.lichsu_kham).length >= 3
                              ? "filled"
                              : "outlined"
                          }
                        />
                        {row.lichsu_kham && (
                          <Tooltip title="Xem lịch sử">
                            <IconButton
                              size="small"
                              onClick={() => setLichSuPatient(row)}
                            >
                              <HistoryIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="caption"
                        sx={{
                          maxWidth: 200,
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={danhSachManTinh[row.dangkykhamid]?.ghiChu || ""}
                      >
                        {danhSachManTinh[row.dangkykhamid]?.ghiChu || "—"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredData.length}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[10, 25, 50, 100]}
        labelRowsPerPage="Dòng/trang"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
      />

      {/* Lịch sử khám dialog */}
      <LichSuKhamDialog
        open={Boolean(lichSuPatient)}
        onClose={() => setLichSuPatient(null)}
        patient={lichSuPatient}
      />
    </Paper>
  );
}

export default ChiTietDatLichTable;
