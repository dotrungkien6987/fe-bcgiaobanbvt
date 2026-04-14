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
  CircularProgress,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Search as SearchIcon,
  FileDownload as ExportIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { exportTongHopExcel } from "../utils/exportTongHopExcel";
import {
  buildManTinhClassificationByNGT,
  calculateHopLeThirdUnits,
  thirdUnitsToNumber,
} from "../utils/tongHopMetrics";

function isTrungNgay(row) {
  if (!row.dangkykhaminitdate || !row.dangkykhamdate) return false;
  return (
    dayjs(row.dangkykhaminitdate).format("YYYY-MM-DD") ===
    dayjs(row.dangkykhamdate).format("YYYY-MM-DD")
  );
}

function formatVND(num) {
  if (num == null) return "0";
  return Number(num).toLocaleString("vi-VN");
}

function formatDecimal(num) {
  return Number(num || 0).toLocaleString("vi-VN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const COLUMNS = [
  { id: "stt", label: "STT", align: "center", width: 50 },
  { id: "ma_ngt", label: "Mã NGT", width: 90 },
  { id: "ten_ngt", label: "Tên người giới thiệu", width: 180 },
  { id: "dien_thoai", label: "ĐT", width: 110 },
  { id: "departmentgroupname", label: "Khoa", width: 160 },
  { id: "tong_dat_lich", label: "Tổng ĐL", align: "right", width: 80 },
  { id: "co_kham", label: "Có khám", align: "right", width: 80 },
  { id: "khong_kham", label: "Không khám", align: "right", width: 90 },
  { id: "co_kham_co_tien", label: "CK có tiền", align: "right", width: 90 },
  { id: "so_man_tinh", label: "Mãn tính", align: "right", width: 80 },
  {
    id: "man_tinh_dung_tuyen",
    label: "Mãn tính đúng tuyến",
    align: "right",
    width: 140,
  },
  {
    id: "man_tinh_chuyen_tuyen",
    label: "Mãn tính chuyển tuyến",
    align: "right",
    width: 150,
  },
  { id: "hop_le", label: "Hợp lệ", align: "right", width: 90 },
  { id: "trung_ngay", label: "Trùng ngày", align: "right", width: 90 },
  { id: "tong_tien", label: "Tổng tiền", align: "right", width: 120 },
  { id: "actions", label: "", width: 50 },
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

function BaoCaoTongHopTable({
  data = [],
  danhSachManTinh = {},
  chiTietDatLich = [],
  loading = false,
  onViewDetail,
  fromDate,
  toDate,
}) {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("departmentgroupname");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);

  // Enrich data with mãn tính count + trùng ngày count per NGT
  const enrichedData = useMemo(() => {
    const { byNGT } = buildManTinhClassificationByNGT({
      danhSachManTinh,
      chiTietDatLich,
    });

    // Group trùng ngày by nguoigioithieuid
    const trungNgayByNGT = {};
    chiTietDatLich.forEach((r) => {
      if (isTrungNgay(r) && r.nguoigioithieuid) {
        trungNgayByNGT[r.nguoigioithieuid] =
          (trungNgayByNGT[r.nguoigioithieuid] || 0) + 1;
      }
    });

    return data.map((row) => {
      const manTinhMetrics = byNGT[String(row.nguoigioithieuid)] ||
        byNGT[row.nguoigioithieuid] || {
          so_man_tinh: 0,
          man_tinh_dung_tuyen: 0,
          man_tinh_chuyen_tuyen: 0,
        };
      const hopLeThirdUnits = calculateHopLeThirdUnits({
        coKhamCoTien: row.co_kham_co_tien,
        manTinhDungTuyen: manTinhMetrics.man_tinh_dung_tuyen,
        manTinhChuyenTuyen: manTinhMetrics.man_tinh_chuyen_tuyen,
      });

      return {
        ...row,
        ...manTinhMetrics,
        hop_le_third_units: hopLeThirdUnits,
        hop_le: thirdUnitsToNumber(hopLeThirdUnits),
        trung_ngay: trungNgayByNGT[row.nguoigioithieuid] || 0,
      };
    });
  }, [data, danhSachManTinh, chiTietDatLich]);

  // Filter by search
  const filteredData = useMemo(() => {
    if (!search.trim()) return enrichedData;
    const s = search.toLowerCase();
    return enrichedData.filter(
      (r) =>
        (r.ten_ngt || "").toLowerCase().includes(s) ||
        (r.ma_ngt || "").toLowerCase().includes(s) ||
        (r.departmentgroupname || "").toLowerCase().includes(s) ||
        (r.dien_thoai || "").includes(s),
    );
  }, [enrichedData, search]);

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

  // Footer totals
  const totals = useMemo(() => {
    const t = {
      tong_dat_lich: 0,
      co_kham: 0,
      khong_kham: 0,
      co_kham_co_tien: 0,
      so_man_tinh: 0,
      man_tinh_dung_tuyen: 0,
      man_tinh_chuyen_tuyen: 0,
      hop_le_third_units: 0,
      hop_le: 0,
      trung_ngay: 0,
      tong_tien: 0,
    };
    filteredData.forEach((r) => {
      t.tong_dat_lich += Number(r.tong_dat_lich || 0);
      t.co_kham += Number(r.co_kham || 0);
      t.khong_kham += Number(r.khong_kham || 0);
      t.co_kham_co_tien += Number(r.co_kham_co_tien || 0);
      t.so_man_tinh += Number(r.so_man_tinh || 0);
      t.man_tinh_dung_tuyen += Number(r.man_tinh_dung_tuyen || 0);
      t.man_tinh_chuyen_tuyen += Number(r.man_tinh_chuyen_tuyen || 0);
      t.hop_le_third_units += Number(r.hop_le_third_units || 0);
      t.trung_ngay += Number(r.trung_ngay || 0);
      t.tong_tien += Number(r.tong_tien || 0);
    });
    t.hop_le = thirdUnitsToNumber(t.hop_le_third_units);
    return t;
  }, [filteredData]);

  const handleSort = (col) => {
    const isAsc = orderBy === col && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(col);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportTongHopExcel({ data: filteredData, fromDate, toDate });
    } finally {
      setExporting(false);
    }
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
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ px: 2, pt: 1.5 }}
      >
        <TextField
          size="small"
          placeholder="Tìm kiếm NGT, khoa..."
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
          sx={{ width: 300 }}
        />
        <Tooltip title={exporting ? "Đang xuất Excel" : "Xuất Excel"}>
          <span>
            <IconButton
              color="success"
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <ExportIcon />
              )}
            </IconButton>
          </span>
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
                  {col.id !== "stt" && col.id !== "actions" ? (
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
              paginatedData.map((row, idx) => (
                <TableRow
                  key={row.nguoigioithieuid || idx}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => onViewDetail?.(row.nguoigioithieuid)}
                >
                  <TableCell align="center">
                    {page * rowsPerPage + idx + 1}
                  </TableCell>
                  <TableCell>{row.ma_ngt}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{row.ten_ngt}</TableCell>
                  <TableCell>{row.dien_thoai}</TableCell>
                  <TableCell>{row.departmentgroupname}</TableCell>
                  <TableCell align="right">
                    {formatVND(row.tong_dat_lich)}
                  </TableCell>
                  <TableCell align="right">{formatVND(row.co_kham)}</TableCell>
                  <TableCell align="right">
                    {formatVND(row.khong_kham)}
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={formatVND(row.co_kham_co_tien)}
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {row.so_man_tinh > 0 ? (
                      <Chip
                        label={row.so_man_tinh}
                        size="small"
                        color="secondary"
                      />
                    ) : (
                      "0"
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {row.man_tinh_dung_tuyen > 0 ? (
                      <Chip
                        label={row.man_tinh_dung_tuyen}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    ) : (
                      "0"
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {row.man_tinh_chuyen_tuyen > 0 ? (
                      <Chip
                        label={row.man_tinh_chuyen_tuyen}
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    ) : (
                      "0"
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      fontWeight="bold"
                      color={row.hop_le > 0 ? "primary" : "text.secondary"}
                    >
                      {formatDecimal(row.hop_le)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {row.trung_ngay > 0 ? (
                      <Chip
                        label={row.trung_ngay}
                        size="small"
                        color="warning"
                      />
                    ) : (
                      "0"
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {formatVND(row.tong_tien)} ₫
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Xem chi tiết">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetail?.(row.nguoigioithieuid);
                        }}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}

            {/* Footer totals */}
            {filteredData.length > 0 && (
              <TableRow sx={{ bgcolor: "action.hover" }}>
                <TableCell
                  colSpan={5}
                  align="center"
                  sx={{ fontWeight: "bold" }}
                >
                  TỔNG CỘNG ({filteredData.length} NGT)
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  {formatVND(totals.tong_dat_lich)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  {formatVND(totals.co_kham)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  {formatVND(totals.khong_kham)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  {formatVND(totals.co_kham_co_tien)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  {formatVND(totals.so_man_tinh)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  {formatVND(totals.man_tinh_dung_tuyen)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  {formatVND(totals.man_tinh_chuyen_tuyen)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  {formatDecimal(totals.hop_le)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  {formatVND(totals.trung_ngay)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  {formatVND(totals.tong_tien)} ₫
                </TableCell>
                <TableCell />
              </TableRow>
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
    </Paper>
  );
}

export default BaoCaoTongHopTable;
