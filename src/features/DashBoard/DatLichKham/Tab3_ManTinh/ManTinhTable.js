import React, { useMemo, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
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
  Checkbox,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import {
  Search as SearchIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import {
  createManTinh,
  deleteManTinh,
  batchCreateManTinh,
  batchDeleteManTinh,
  fetchDanhSachManTinh,
} from "../datLichKhamSlice";
import LichSuKhamDialog from "../Tab2_ChiTiet/LichSuKhamDialog";

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

function ManTinhTable({
  chiTietData = [],
  danhSachManTinh = {},
  loading = false,
  fromDate,
  toDate,
  onRefresh,
}) {
  const dispatch = useDispatch();

  const [filter, setFilter] = useState("all"); // all | marked | unmarked
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("soLanKham");
  const [selected, setSelected] = useState(new Set());
  const [lichSuPatient, setLichSuPatient] = useState(null);

  // Confirm dialog state for single toggle
  const [confirmDialog, setConfirmDialog] = useState(null); // { row, action: 'mark'|'unmark' }
  const [ghiChu, setGhiChu] = useState("");

  // Batch confirm dialog
  const [batchDialog, setBatchDialog] = useState(null); // { action: 'mark'|'unmark', count }

  // Only show Vòng 1 data: status === 1 AND tong_tien > 0
  const vong1Data = useMemo(() => {
    return chiTietData
      .filter((r) => r.dangkykhamstatus === 1 && Number(r.tong_tien) > 0)
      .map((r) => {
        const ls = parseLichSu(r.lichsu_kham);
        const isManTinh = Boolean(danhSachManTinh[r.dangkykhamid]);
        return {
          ...r,
          soLanKham: ls.length,
          isManTinh,
          manTinhDoc: danhSachManTinh[r.dangkykhamid] || null,
        };
      });
  }, [chiTietData, danhSachManTinh]);

  // Apply filter + search
  const filteredData = useMemo(() => {
    let result = vong1Data;

    if (filter === "marked") result = result.filter((r) => r.isManTinh);
    if (filter === "unmarked") result = result.filter((r) => !r.isManTinh);

    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(
        (r) =>
          (r.patientname || "").toLowerCase().includes(s) ||
          (r.ten_ngt || "").toLowerCase().includes(s) ||
          (r.chandoanravien || "").toLowerCase().includes(s) ||
          (r.chandoanravien_code || "").toLowerCase().includes(s),
      );
    }
    return result;
  }, [vong1Data, filter, search]);

  // Sort
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let valA = a[orderBy] ?? "";
      let valB = b[orderBy] ?? "";
      if (typeof valA === "boolean") {
        valA = valA ? 1 : 0;
        valB = valB ? 1 : 0;
      }
      if (valB < valA) return order === "desc" ? -1 : 1;
      if (valB > valA) return order === "desc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, order, orderBy]);

  // Paginated
  const paginatedData = useMemo(
    () =>
      sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sortedData, page, rowsPerPage],
  );

  // Selection handlers
  const handleSelectAll = useCallback(() => {
    if (selected.size === filteredData.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredData.map((r) => r.dangkykhamid)));
    }
  }, [filteredData, selected.size]);

  const handleSelect = useCallback((id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Single mark/unmark
  const handleToggleManTinh = useCallback((row) => {
    if (row.isManTinh) {
      setConfirmDialog({ row, action: "unmark" });
    } else {
      setConfirmDialog({ row, action: "mark" });
    }
    setGhiChu("");
  }, []);

  const confirmSingleAction = useCallback(async () => {
    if (!confirmDialog) return;
    const { row, action } = confirmDialog;

    if (action === "mark") {
      await dispatch(
        createManTinh({
          dangkykhamid: row.dangkykhamid,
          patientid_old: row.patientid_old,
          vienphiid: row.vienphiid,
          nguoigioithieuid: row.nguoigioithieuid,
          ghiChu,
          snapshot: {
            patientname: row.patientname,
            birthday: row.birthday,
            chandoanravien: row.chandoanravien,
            chandoanravien_code: row.chandoanravien_code,
            ten_ngt: row.ten_ngt,
            dangkykhamdate: row.dangkykhamdate,
          },
        }),
      );
    } else {
      await dispatch(deleteManTinh(row.dangkykhamid));
    }
    setConfirmDialog(null);
  }, [confirmDialog, dispatch, ghiChu]);

  // Batch actions
  const getSelectedRows = useCallback(() => {
    return filteredData.filter((r) => selected.has(r.dangkykhamid));
  }, [filteredData, selected]);

  const handleBatchMark = useCallback(() => {
    const rows = getSelectedRows().filter((r) => !r.isManTinh);
    if (rows.length === 0) return;
    setBatchDialog({ action: "mark", count: rows.length });
    setGhiChu("");
  }, [getSelectedRows]);

  const handleBatchUnmark = useCallback(() => {
    const rows = getSelectedRows().filter((r) => r.isManTinh);
    if (rows.length === 0) return;
    setBatchDialog({ action: "unmark", count: rows.length });
  }, [getSelectedRows]);

  const confirmBatchAction = useCallback(async () => {
    if (!batchDialog) return;
    const rows = getSelectedRows();

    if (batchDialog.action === "mark") {
      const items = rows
        .filter((r) => !r.isManTinh)
        .map((r) => ({
          dangkykhamid: r.dangkykhamid,
          patientid_old: r.patientid_old,
          vienphiid: r.vienphiid,
          nguoigioithieuid: r.nguoigioithieuid,
          ghiChu,
          snapshot: {
            patientname: r.patientname,
            birthday: r.birthday,
            chandoanravien: r.chandoanravien,
            chandoanravien_code: r.chandoanravien_code,
            ten_ngt: r.ten_ngt,
            dangkykhamdate: r.dangkykhamdate,
          },
        }));
      const ok = await dispatch(batchCreateManTinh(items));
      if (ok) {
        // Re-fetch mantinh list to sync state
        const allVong1Ids = vong1Data.map((r) => r.dangkykhamid);
        dispatch(fetchDanhSachManTinh(allVong1Ids));
      }
    } else {
      const ids = rows.filter((r) => r.isManTinh).map((r) => r.dangkykhamid);
      await dispatch(batchDeleteManTinh(ids));
    }

    setSelected(new Set());
    setBatchDialog(null);
  }, [batchDialog, getSelectedRows, dispatch, ghiChu, vong1Data]);

  const handleSort = (col) => {
    const isAsc = orderBy === col && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(col);
  };

  // Stats
  const stats = useMemo(() => {
    const total = vong1Data.length;
    const marked = vong1Data.filter((r) => r.isManTinh).length;
    return { total, marked, unmarked: total - marked };
  }, [vong1Data]);

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
      {/* Stats + Filter bar */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ px: 2, pt: 1.5 }}
        flexWrap="wrap"
        useFlexGap
        spacing={1}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2">
            Vòng 1: <strong>{stats.total}</strong> | Đã ĐD:{" "}
            <Chip
              label={stats.marked}
              size="small"
              color="secondary"
              sx={{ mx: 0.5 }}
            />{" "}
            | Chưa ĐD: <strong>{stats.unmarked}</strong>
          </Typography>
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={(_, v) => {
              if (v) {
                setFilter(v);
                setPage(0);
              }
            }}
            size="small"
          >
            <ToggleButton value="all">Tất cả</ToggleButton>
            <ToggleButton value="marked">Đã ĐD</ToggleButton>
            <ToggleButton value="unmarked">Chưa ĐD</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            size="small"
            placeholder="Tìm BN, NGT, chẩn đoán..."
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
            sx={{ width: 260 }}
          />
        </Stack>
      </Stack>

      {/* Batch action bar */}
      {selected.size > 0 && (
        <Alert severity="info" sx={{ mx: 2, mt: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2">
              Đã chọn <strong>{selected.size}</strong> bản ghi
            </Typography>
            <Button
              size="small"
              variant="contained"
              color="secondary"
              onClick={handleBatchMark}
              startIcon={<CheckIcon />}
            >
              Đánh dấu MT
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={handleBatchUnmark}
              startIcon={<CancelIcon />}
            >
              Bỏ đánh dấu
            </Button>
          </Stack>
        </Alert>
      )}

      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={{ width: 42 }}>
                <Checkbox
                  indeterminate={
                    selected.size > 0 && selected.size < filteredData.length
                  }
                  checked={
                    filteredData.length > 0 &&
                    selected.size === filteredData.length
                  }
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", width: 50 }}>
                STT
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", width: 100 }}>
                <TableSortLabel
                  active={orderBy === "dangkykhamdate"}
                  direction={orderBy === "dangkykhamdate" ? order : "asc"}
                  onClick={() => handleSort("dangkykhamdate")}
                >
                  Ngày ĐL
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", width: 160 }}>
                <TableSortLabel
                  active={orderBy === "patientname"}
                  direction={orderBy === "patientname" ? order : "asc"}
                  onClick={() => handleSort("patientname")}
                >
                  Bệnh nhân
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", width: 140 }}>NGT</TableCell>
              <TableCell sx={{ fontWeight: "bold", width: 200 }}>
                Chẩn đoán
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", width: 90 }}>
                <TableSortLabel
                  active={orderBy === "soLanKham"}
                  direction={orderBy === "soLanKham" ? order : "asc"}
                  onClick={() => handleSort("soLanKham")}
                >
                  LS Khám
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", width: 110 }}>
                Tổng tiền
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", width: 90 }}>
                <TableSortLabel
                  active={orderBy === "isManTinh"}
                  direction={orderBy === "isManTinh" ? order : "asc"}
                  onClick={() => handleSort("isManTinh")}
                >
                  Mãn tính
                </TableSortLabel>
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", width: 70 }}>
                TT
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    Không có dữ liệu Vòng 1
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, idx) => (
                <TableRow
                  key={row.dangkykhamid}
                  hover
                  selected={selected.has(row.dangkykhamid)}
                  sx={row.isManTinh ? { bgcolor: "#f3e5f5" } : {}}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selected.has(row.dangkykhamid)}
                      onChange={() => handleSelect(row.dangkykhamid)}
                    />
                  </TableCell>
                  <TableCell align="center">
                    {page * rowsPerPage + idx + 1}
                  </TableCell>
                  <TableCell>
                    {row.dangkykhamdate
                      ? dayjs(row.dangkykhamdate).format("DD/MM/YYYY")
                      : ""}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    <Box>
                      {row.patientname}
                      {row.birthday && (
                        <Typography
                          variant="caption"
                          display="block"
                          color="text.secondary"
                        >
                          {dayjs(row.birthday).format("DD/MM/YYYY")}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{row.ten_ngt}</TableCell>
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
                      <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>
                        {row.chandoanravien || "—"}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Stack
                      direction="row"
                      spacing={0.5}
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Chip
                        label={`${row.soLanKham} lần`}
                        size="small"
                        color={row.soLanKham >= 3 ? "warning" : "default"}
                        variant={row.soLanKham >= 3 ? "filled" : "outlined"}
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
                  <TableCell align="right">
                    {formatVND(row.tong_tien)} ₫
                  </TableCell>
                  <TableCell align="center">
                    {row.isManTinh ? (
                      <Tooltip
                        title={row.manTinhDoc?.ghiChu || "Đã đánh dấu mãn tính"}
                      >
                        <Chip label="Mãn tính" size="small" color="secondary" />
                      </Tooltip>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip
                      title={
                        row.isManTinh ? "Bỏ đánh dấu" : "Đánh dấu mãn tính"
                      }
                    >
                      <IconButton
                        size="small"
                        color={row.isManTinh ? "error" : "success"}
                        onClick={() => handleToggleManTinh(row)}
                      >
                        {row.isManTinh ? (
                          <CancelIcon fontSize="small" />
                        ) : (
                          <CheckIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
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

      {/* Single confirm dialog */}
      <Dialog
        open={Boolean(confirmDialog)}
        onClose={() => setConfirmDialog(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {confirmDialog?.action === "mark"
            ? "Đánh dấu mãn tính"
            : "Bỏ đánh dấu mãn tính"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Bệnh nhân: <strong>{confirmDialog?.row?.patientname}</strong>
            <br />
            Chẩn đoán: {confirmDialog?.row?.chandoanravien || "N/A"}
          </Typography>
          {confirmDialog?.action === "mark" && (
            <TextField
              fullWidth
              size="small"
              label="Ghi chú (tùy chọn)"
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              multiline
              rows={2}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(null)}>Hủy</Button>
          <Button
            variant="contained"
            color={confirmDialog?.action === "mark" ? "secondary" : "error"}
            onClick={confirmSingleAction}
          >
            {confirmDialog?.action === "mark" ? "Đánh dấu" : "Bỏ đánh dấu"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Batch confirm dialog */}
      <Dialog
        open={Boolean(batchDialog)}
        onClose={() => setBatchDialog(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {batchDialog?.action === "mark"
            ? "Đánh dấu hàng loạt"
            : "Bỏ đánh dấu hàng loạt"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Bạn sẽ {batchDialog?.action === "mark" ? "đánh dấu" : "bỏ đánh dấu"}{" "}
            <strong>{batchDialog?.count}</strong> bản ghi.
          </Typography>
          {batchDialog?.action === "mark" && (
            <TextField
              fullWidth
              size="small"
              label="Ghi chú chung (tùy chọn)"
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              multiline
              rows={2}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBatchDialog(null)}>Hủy</Button>
          <Button
            variant="contained"
            color={batchDialog?.action === "mark" ? "secondary" : "error"}
            onClick={confirmBatchAction}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lịch sử khám dialog */}
      <LichSuKhamDialog
        open={Boolean(lichSuPatient)}
        onClose={() => setLichSuPatient(null)}
        patient={lichSuPatient}
      />
    </Paper>
  );
}

export default ManTinhTable;
