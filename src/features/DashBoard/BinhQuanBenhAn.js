import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Toolbar,
  Box,
  Stack,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Divider,
  TextField,
  InputAdornment,
  Button,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import FilterListIcon from "@mui/icons-material/FilterList";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { formatDateTime } from "../../utils/formatTime";
import {
  getDataNewestByNgay,
  getDataNewestByNgayChenhLech,
} from "./dashboardSlice";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz?.setDefault?.("Asia/Ho_Chi_Minh");

// Kiểu dữ liệu hàng
// {
//   departmentid: number,
//   departmentname: string,
//   departmentgroupid: number,
//   departmentgroupname: string,
//   vienphi_count: number,
//   total_money: number,
//   total_thuoc: number,
//   total_vattu: number,
//   avg_money_per_case: number,
//   ty_le_thuoc: number,
//   ty_le_vattu: number
// }

const VND = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const PCT = new Intl.NumberFormat("vi-VN", {
  style: "percent",
  maximumFractionDigits: 1,
});

function PercentageBar({ value = 0, color = "#1939B7" }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box sx={{ flexGrow: 1 }}>
        <LinearProgress
          variant="determinate"
          value={Math.max(0, Math.min(100, (value || 0) * 100))}
          sx={{
            height: 8,
            borderRadius: 5,
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "#2a2a2a" : "#E5EAF2",
            "& .MuiLinearProgress-bar": { bgcolor: color },
          }}
        />
      </Box>
      <Typography variant="caption" sx={{ color: "#1939B7" }}>
        {PCT.format(value || 0)}
      </Typography>
    </Stack>
  );
}

function TableToolbar({ search, setSearch, onReset, onExport }) {
  return (
    <Toolbar sx={{ px: 0, gap: 1, flexWrap: "wrap" }}>
      <TextField
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Tìm kiếm khoa..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
        sx={{ width: { xs: "100%", sm: 300 } }}
      />

      <Tooltip title="Đặt lại lọc">
        <span>
          <Button
            onClick={onReset}
            startIcon={<RefreshIcon />}
            variant="contained"
            color="inherit"
            size="small"
          >
            Đặt lại
          </Button>
        </span>
      </Tooltip>

      <Box flexGrow={1} />

      <Tooltip title="Xuất CSV">
        <span>
          <Button
            onClick={onExport}
            startIcon={<DownloadIcon />}
            variant="contained"
            size="small"
          >
            Xuất CSV
          </Button>
        </span>
      </Tooltip>
    </Toolbar>
  );
}

function descendingComparator(a, b, orderBy) {
  const va = a?.[orderBy];
  const vb = b?.[orderBy];
  if (vb < va) return -1;
  if (vb > va) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilized = array.map((el, index) => [el, index]);
  stabilized.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilized.map((el) => el[0]);
}

function exportToCSV(rows) {
  const headers = [
    "departmentid",
    "departmentname",
    "departmentgroupid",
    "departmentgroupname",
    "vienphi_count",
    "total_money",
    "total_thuoc",
    "total_vattu",
    "avg_money_per_case",
    "ty_le_thuoc",
    "ty_le_vattu",
  ];
  const csv = [headers.join(",")]
    .concat(
      rows.map((r) =>
        [
          r.departmentid,
          `"${r.departmentname}"`,
          r.departmentgroupid,
          `"${r.departmentgroupname}"`,
          r.vienphi_count,
          r.total_money,
          r.total_thuoc,
          r.total_vattu,
          r.avg_money_per_case,
          r.ty_le_thuoc,
          r.ty_le_vattu,
        ].join(",")
      )
    )
    .join("\n");

  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `binh_quan_benh_an.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const BinhQuanBenhAn = () => {
  const dispatch = useDispatch();
  const { darkMode } = useSelector((state) => state.mytheme) || {};
  const {
    BinhQuanBenhAn: rowsFromStore,
    chisosObj,
    chisosObj_NgayChenhLech,
  } = useSelector((state) => state.dashboard) || {};
  const BLUE = "#1939B7";

  // Ngày đang xem + ngày tính chênh lệch (mặc định hôm qua)
  // Thời điểm tham chiếu hiện tại
  const [date, setDate] = useState(dayjs());
  const [dateChenhLech, setDateChenhLech] = useState(
    dayjs().subtract(1, "day")
  );
  const [isToday, setIsToday] = useState(true);
  const [thang, setThang] = useState();
  const [nam, setNam] = useState();
  const [ngay, setNgay] = useState();

  const [search, setSearch] = useState("");
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("total_money");

  // Dữ liệu nguồn: lấy từ Redux, bỏ qua các bản ghi chưa có thông tin khối
  const baseRows = useMemo(() => {
    const rows = Array.isArray(rowsFromStore) ? rowsFromStore : [];
    return rows.filter((r) => r && r.departmentgroupname && r.departmentname);
  }, [rowsFromStore]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return baseRows.filter((row) => {
      const matchesSearch = q
        ? row.departmentname.toLowerCase().includes(q) ||
          row.departmentgroupname.toLowerCase().includes(q)
        : true;
      return matchesSearch;
    });
  }, [baseRows, search]);

  const sorted = useMemo(() => {
    return stableSort(filtered, getComparator(order, orderBy));
  }, [filtered, order, orderBy]);

  const totals = useMemo(() => {
    const totalCases = filtered.reduce((s, r) => s + (r.vienphi_count || 0), 0);
    const totalMoney = filtered.reduce((s, r) => s + (r.total_money || 0), 0);
    const avgPerCase = totalCases ? totalMoney / totalCases : 0;
    return { totalCases, totalMoney, avgPerCase };
  }, [filtered]);

  // Gọi API theo ngày đang chọn
  useEffect(() => {
    const js = dayjs(date);
    const _now = dayjs();
    setIsToday(js.isSame(_now, "day"));
    setNgay(js.date());
    setThang(js.month() + 1);
    setNam(js.year());
    dispatch(getDataNewestByNgay(js.toISOString()));
  }, [date, dispatch]);

  // Gọi API cho ngày tính chênh lệch
  useEffect(() => {
    if (ngay == null) return;
    const js = dayjs(dateChenhLech);
    dispatch(getDataNewestByNgayChenhLech(js.toISOString(), ngay));
  }, [dateChenhLech, ngay, dispatch]);

  // Tự động refresh 15 phút khi xem hôm nay
  useEffect(() => {
    if (!isToday) return;
    const id = setInterval(() => {
      const js = dayjs(date);
      dispatch(getDataNewestByNgay(js.toISOString()));
    }, 15 * 60 * 1000);
    return () => clearInterval(id);
  }, [isToday, date, dispatch]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleReset = () => {
    setSearch("");
    setOrder("desc");
    setOrderBy("total_money");
  };

  return (
    <Stack spacing={2} sx={{ p: 1 }}>
      <Card
        sx={{
          fontWeight: "bold",
          color: "#f2f2f2",
          backgroundColor: darkMode ? "#1D1D1D" : BLUE,
          p: 1,
          boxShadow: 3,
          borderRadius: 3,
        }}
      >
        <Typography sx={{ fontSize: "1.3rem", textAlign: "center" }}>
          Bình quân bệnh án
        </Typography>
      </Card>

      {/* Chọn ngày + hiển thị thời gian số liệu */}
      <Card sx={{ p: 2, borderRadius: 2, boxShadow: 6 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <Typography variant="subtitle2" sx={{ color: BLUE, flexGrow: 1 }}>
            {chisosObj?.Ngay
              ? `Số liệu đến ${formatDateTime(chisosObj.Ngay)}`
              : "Đang tải số liệu..."}
          </Typography>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack direction="row" spacing={1}>
              <DatePicker
                label="Ngày"
                value={date}
                onChange={(v) => v && setDate(v)}
                slotProps={{ textField: { size: "small" } }}
              />
              <DatePicker
                label="Ngày tính chênh lệch"
                value={dateChenhLech}
                onChange={(v) => v && setDateChenhLech(v)}
                slotProps={{ textField: { size: "small" } }}
              />
            </Stack>
          </LocalizationProvider>
        </Stack>

        {(chisosObj?.Ngay || chisosObj_NgayChenhLech?.Ngay) && (
          <Typography variant="caption" sx={{ color: BLUE }}>
            {ngay === 1
              ? `Tính chênh lệch từ 00:00 1/${thang}/${nam} đến ${formatDateTime(
                  chisosObj?.Ngay
                )}`
              : `Tính chênh lệch từ ${formatDateTime(
                  chisosObj_NgayChenhLech?.Ngay
                )} đến ${formatDateTime(chisosObj?.Ngay)}`}
          </Typography>
        )}
      </Card>

      {/* Summary metrics with distinct brand colors */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <Card
          sx={{
            flex: 1,
            borderRadius: 2,
            boxShadow: 10,
            bgcolor: "#1939B7",
            color: "#FFF",
          }}
        >
          <CardContent>
            <Typography variant="overline" sx={{ opacity: 0.9 }}>
              Tổng số khoa
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {filtered.length}
            </Typography>
          </CardContent>
        </Card>
        <Card
          sx={{
            flex: 1,
            borderRadius: 2,
            boxShadow: 10,
            bgcolor: "#00C49F",
            color: "#FFF",
          }}
        >
          <CardContent>
            <Typography variant="overline" sx={{ opacity: 0.9, color: "#FFF" }}>
              Tổng ca viện phí
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {totals.totalCases.toLocaleString("vi-VN")}
            </Typography>
          </CardContent>
        </Card>
        <Card
          sx={{
            flex: 1,
            borderRadius: 2,
            boxShadow: 10,
            bgcolor: "#bb1515",
            color: "#FFF",
          }}
        >
          <CardContent>
            <Typography variant="overline" sx={{ opacity: 0.9 }}>
              Tổng doanh thu
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {VND.format(totals.totalMoney)}
            </Typography>
          </CardContent>
        </Card>
        <Card
          sx={{
            flex: 1,
            borderRadius: 2,
            boxShadow: 10,
            bgcolor: "#FFBB28",
            color: "#FFF",
          }}
        >
          <CardContent>
            <Typography variant="overline" sx={{ opacity: 0.9, color: "#FFF" }}>
              Bình quân/ca
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {VND.format(totals.avgPerCase)}
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      <Card elevation={3} sx={{ borderRadius: 2, boxShadow: 10 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <FilterListIcon fontSize="small" sx={{ color: BLUE }} />
            <Typography
              variant="subtitle2"
              color={darkMode ? "#FFF" : "text.secondary"}
            >
              Bộ lọc và xuất dữ liệu
            </Typography>
          </Stack>

          <TableToolbar
            search={search}
            setSearch={setSearch}
            onReset={handleReset}
            onExport={() => exportToCSV(filtered)}
          />

          <Divider sx={{ my: 2 }} />

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow
                  sx={{
                    "& th": {
                      bgcolor: darkMode ? "#1D1D1D" : BLUE,
                      color: "#FFF",
                      fontWeight: 700,
                      borderBottom: 0,
                    },
                  }}
                >
                  <TableCell
                    sortDirection={
                      orderBy === "departmentgroupname" ? order : false
                    }
                  >
                    <TableSortLabel
                      active={orderBy === "departmentgroupname"}
                      direction={
                        orderBy === "departmentgroupname" ? order : "asc"
                      }
                      onClick={() => handleRequestSort("departmentgroupname")}
                      hideSortIcon
                    >
                      Khối
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sortDirection={orderBy === "departmentname" ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === "departmentname"}
                      direction={orderBy === "departmentname" ? order : "asc"}
                      onClick={() => handleRequestSort("departmentname")}
                      hideSortIcon
                    >
                      Khoa/Phòng
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    align="right"
                    sortDirection={orderBy === "vienphi_count" ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === "vienphi_count"}
                      direction={orderBy === "vienphi_count" ? order : "desc"}
                      onClick={() => handleRequestSort("vienphi_count")}
                      hideSortIcon
                    >
                      Số ca
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    align="right"
                    sortDirection={orderBy === "total_money" ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === "total_money"}
                      direction={orderBy === "total_money" ? order : "desc"}
                      onClick={() => handleRequestSort("total_money")}
                      hideSortIcon
                    >
                      Doanh thu
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    align="right"
                    sortDirection={
                      orderBy === "avg_money_per_case" ? order : false
                    }
                  >
                    <TableSortLabel
                      active={orderBy === "avg_money_per_case"}
                      direction={
                        orderBy === "avg_money_per_case" ? order : "desc"
                      }
                      onClick={() => handleRequestSort("avg_money_per_case")}
                      hideSortIcon
                    >
                      BQ/ca
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">Thuốc</TableCell>
                  <TableCell align="right">Vật tư</TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ "& td": { color: BLUE } }}>
                {sorted.map((row) => (
                  <TableRow hover key={row.departmentid}>
                    <TableCell width={160}>
                      <Chip
                        label={row.departmentgroupname}
                        size="small"
                        variant="outlined"
                        sx={{ borderColor: BLUE, color: BLUE, fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, color: BLUE }}
                      >
                        {row.departmentname}
                      </Typography>
                      <Typography variant="caption" sx={{ color: BLUE }}>
                        ID: {row.departmentid}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {row.vienphi_count?.toLocaleString("vi-VN")}
                    </TableCell>
                    <TableCell align="right">
                      {VND.format(row.total_money || 0)}
                    </TableCell>
                    <TableCell align="right">
                      {VND.format(row.avg_money_per_case || 0)}
                    </TableCell>
                    <TableCell align="right" width={180}>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {VND.format(row.total_thuoc || 0)}
                        </Typography>
                        <PercentageBar
                          value={row.ty_le_thuoc}
                          color="#bb1515"
                        />
                      </Stack>
                    </TableCell>
                    <TableCell align="right" width={180}>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {VND.format(row.total_vattu || 0)}
                        </Typography>
                        <PercentageBar
                          value={row.ty_le_vattu}
                          color="#1939B7"
                        />
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Hàng tổng */}
                <TableRow selected>
                  <TableCell colSpan={2}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Tổng (sau lọc)
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {totals.totalCases.toLocaleString("vi-VN")}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {VND.format(totals.totalMoney)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {VND.format(totals.avgPerCase)}
                  </TableCell>
                  <TableCell align="right" colSpan={2}>
                    <Typography variant="caption" sx={{ color: BLUE }}>
                      Tỉ lệ dưới đây hiển thị theo từng khoa
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default BinhQuanBenhAn;
