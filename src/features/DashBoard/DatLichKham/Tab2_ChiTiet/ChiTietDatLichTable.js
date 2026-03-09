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
} from "@mui/material";
import {
  Search as SearchIcon,
  History as HistoryIcon,
  Close as CloseIcon,
  FileDownload as ExportIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import LichSuKhamDialog from "./LichSuKhamDialog";

function formatVND(num) {
  if (num == null) return "0";
  return Number(num).toLocaleString("vi-VN");
}

function getStatusChip(status, tongTien) {
  if (status === 1 && Number(tongTien) > 0) {
    return (
      <Chip
        label="Có khám + tiền"
        size="small"
        color="success"
        variant="filled"
      />
    );
  }
  if (status === 1 && Number(tongTien) === 0) {
    return (
      <Chip label="Có khám, 0₫" size="small" color="warning" variant="filled" />
    );
  }
  return (
    <Chip label="Không khám" size="small" color="error" variant="outlined" />
  );
}

const COLUMNS = [
  { id: "stt", label: "STT", align: "center", width: 50 },
  { id: "dangkykhamdate", label: "Ngày ĐL", width: 100 },
  { id: "patientname", label: "Bệnh nhân", width: 160 },
  { id: "birthday", label: "Ngày sinh", width: 90 },
  { id: "ten_ngt", label: "NGT", width: 140 },
  { id: "ngt_departmentgroupname", label: "Khoa NGT", width: 130 },
  { id: "status", label: "Trạng thái", align: "center", width: 130 },
  { id: "chandoanravien", label: "Chẩn đoán", width: 200 },
  { id: "vp_departmentgroupname", label: "Khoa khám", width: 130 },
  { id: "tong_tien", label: "Tổng tiền", align: "right", width: 110 },
  { id: "lichsu", label: "LS Khám", align: "center", width: 70 },
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
}) {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("dangkykhamdate");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [search, setSearch] = useState("");
  const [lichSuPatient, setLichSuPatient] = useState(null);

  // Filter by NGT (from Tab1 click) and text search
  const filteredData = useMemo(() => {
    let result = data;

    // Filter by specific NGT
    if (filterNGT) {
      result = result.filter((r) => r.nguoigioithieuid === filterNGT);
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
          (r.ma_ngt || "").toLowerCase().includes(s),
      );
    }
    return result;
  }, [data, filterNGT, search]);

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
    const exportData = filteredData.map((r, i) => ({
      STT: i + 1,
      "Ngày ĐL": r.dangkykhamdate
        ? dayjs(r.dangkykhamdate).format("DD/MM/YYYY")
        : "",
      "Bệnh nhân": r.patientname,
      "Ngày sinh": r.birthday ? dayjs(r.birthday).format("DD/MM/YYYY") : "",
      "Giới tính": r.gioitinhname,
      NGT: r.ten_ngt,
      "Khoa NGT": r.ngt_departmentgroupname,
      "Trạng thái": r.dangkykhamstatus === 1 ? "Có khám" : "Không khám",
      "Mã HSBA": r.hosobenhancode,
      "Chẩn đoán": r.chandoanravien,
      "Mã ICD": r.chandoanravien_code,
      "Khoa khám": r.vp_departmentgroupname,
      "Tổng tiền": Number(r.tong_tien || 0),
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, "ChiTiet");
    XLSX.writeFile(wb, `BaoCao_DatLich_ChiTiet.xlsx`);
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

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
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
          sx={{ width: 320 }}
        />
        <Tooltip title="Xuất Excel">
          <IconButton color="success" onClick={handleExport}>
            <ExportIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      <TableContainer sx={{ maxHeight: 600 }}>
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
                  {col.id !== "stt" && col.id !== "lichsu" ? (
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
                  row.dangkykhamstatus === 1 && Number(row.tong_tien) > 0
                    ? "#e8f5e9"
                    : row.dangkykhamstatus === 1
                      ? "#fff8e1"
                      : "#ffebee";

                return (
                  <TableRow
                    key={row.dangkykhamid || idx}
                    hover
                    sx={{ bgcolor: statusColor }}
                  >
                    <TableCell align="center">
                      {page * rowsPerPage + idx + 1}
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
                    <TableCell>{row.vp_departmentgroupname || "—"}</TableCell>
                    <TableCell align="right">
                      {formatVND(row.tong_tien)} ₫
                    </TableCell>
                    <TableCell align="center">
                      {row.lichsu_kham ? (
                        <Tooltip title="Xem lịch sử khám">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => setLichSuPatient(row)}
                          >
                            <HistoryIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        "—"
                      )}
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
