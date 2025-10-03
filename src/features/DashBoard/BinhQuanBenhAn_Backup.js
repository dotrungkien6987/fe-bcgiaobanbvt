import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Stack, Card, Typography, Tabs, Tab } from "@mui/material";
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

// Import components và utilities từ thư mục refactored
import {
  TableToolbar,
  SummaryCards,
  TabPanel,
  DataTable,
  getComparator,
  stableSort,
  exportToCSV,
} from "./BinhQuanBenhAn";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz?.setDefault?.("Asia/Ho_Chi_Minh");

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
  const [date, setDate] = useState(dayjs());
  const [dateChenhLech, setDateChenhLech] = useState(
    dayjs().subtract(1, "day")
  );
  const [isToday, setIsToday] = useState(true);
  const [thang, setThang] = useState();
  const [nam, setNam] = useState();
  const [ngay, setNgay] = useState();

  // State quản lý tab
  const [currentTab, setCurrentTab] = useState(0);

  // State cho 2 bảng riêng biệt
  const [searchNoiTru, setSearchNoiTru] = useState("");
  const [searchNgoaiTru, setSearchNgoaiTru] = useState("");
  const [orderNoiTru, setOrderNoiTru] = useState("desc");
  const [orderByNoiTru, setOrderByNoiTru] = useState("total_money");
  const [orderNgoaiTru, setOrderNgoaiTru] = useState("desc");
  const [orderByNgoaiTru, setOrderByNgoaiTru] = useState("total_money");

  // Dữ liệu nguồn: lấy từ Redux, bỏ qua các bản ghi chưa có thông tin
  const baseRows = useMemo(() => {
    const rows = Array.isArray(rowsFromStore) ? rowsFromStore : [];
    return rows.filter((r) => r && r.TenKhoa && r.KhoaID);
  }, [rowsFromStore]);

  // Tách dữ liệu theo LoaiKhoa
  const rowsNoiTru = useMemo(() => {
    return baseRows.filter((r) => r.LoaiKhoa === "noitru");
  }, [baseRows]);

  const rowsNgoaiTru = useMemo(() => {
    return baseRows.filter((r) => r.LoaiKhoa === "ngoaitru");
  }, [baseRows]);

  // Lọc và sắp xếp cho Nội trú
  const filteredNoiTru = useMemo(() => {
    const q = searchNoiTru.trim().toLowerCase();
    return rowsNoiTru.filter((row) => {
      return q ? row.TenKhoa.toLowerCase().includes(q) : true;
    });
  }, [rowsNoiTru, searchNoiTru]);

  const sortedNoiTru = useMemo(() => {
    return stableSort(
      filteredNoiTru,
      getComparator(orderNoiTru, orderByNoiTru)
    );
  }, [filteredNoiTru, orderNoiTru, orderByNoiTru]);

  const totalsNoiTru = useMemo(() => {
    const totalCases = filteredNoiTru.reduce(
      (s, r) => s + (r.vienphi_count || 0),
      0
    );
    const totalMoney = filteredNoiTru.reduce(
      (s, r) => s + (r.total_money || 0),
      0
    );
    const avgPerCase = totalCases ? totalMoney / totalCases : 0;
    return { totalCases, totalMoney, avgPerCase };
  }, [filteredNoiTru]);

  // Lọc và sắp xếp cho Ngoại trú
  const filteredNgoaiTru = useMemo(() => {
    const q = searchNgoaiTru.trim().toLowerCase();
    return rowsNgoaiTru.filter((row) => {
      return q ? row.TenKhoa.toLowerCase().includes(q) : true;
    });
  }, [rowsNgoaiTru, searchNgoaiTru]);

  const sortedNgoaiTru = useMemo(() => {
    return stableSort(
      filteredNgoaiTru,
      getComparator(orderNgoaiTru, orderByNgoaiTru)
    );
  }, [filteredNgoaiTru, orderNgoaiTru, orderByNgoaiTru]);

  const totalsNgoaiTru = useMemo(() => {
    const totalCases = filteredNgoaiTru.reduce(
      (s, r) => s + (r.vienphi_count || 0),
      0
    );
    const totalMoney = filteredNgoaiTru.reduce(
      (s, r) => s + (r.total_money || 0),
      0
    );
    const avgPerCase = totalCases ? totalMoney / totalCases : 0;
    return { totalCases, totalMoney, avgPerCase };
  }, [filteredNgoaiTru]);

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

  const handleRequestSortNoiTru = (property) => {
    const isAsc = orderByNoiTru === property && orderNoiTru === "asc";
    setOrderNoiTru(isAsc ? "desc" : "asc");
    setOrderByNoiTru(property);
  };

  const handleRequestSortNgoaiTru = (property) => {
    const isAsc = orderByNgoaiTru === property && orderNgoaiTru === "asc";
    setOrderNgoaiTru(isAsc ? "desc" : "asc");
    setOrderByNgoaiTru(property);
  };

  const handleResetNoiTru = () => {
    setSearchNoiTru("");
    setOrderNoiTru("desc");
    setOrderByNoiTru("total_money");
  };

  const handleResetNgoaiTru = () => {
    setSearchNgoaiTru("");
    setOrderNgoaiTru("desc");
    setOrderByNgoaiTru("total_money");
  };

  // Component render bảng
  const renderTable = (
    sorted,
    totals,
    order,
    orderBy,
    handleRequestSort,
    loaiKhoa
  ) => (
    <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow
            sx={{
              "& th": {
                bgcolor: darkMode ? "#1D1D1D" : BLUE,
                color: "#FFF",
                fontWeight: 700,
                borderBottom: 0,
                fontSize: { xs: "0.7rem", sm: "0.875rem" },
              },
            }}
          >
            <TableCell
              sx={{
                position: "sticky",
                left: 0,
                zIndex: 3,
                bgcolor: darkMode ? "#1D1D1D" : BLUE,
                minWidth: { xs: 40, sm: 50 },
              }}
            >
              STT
            </TableCell>
            <TableCell
              sortDirection={orderBy === "TenKhoa" ? order : false}
              sx={{
                position: "sticky",
                left: { xs: 40, sm: 50 },
                zIndex: 3,
                bgcolor: darkMode ? "#1D1D1D" : BLUE,
                minWidth: { xs: 120, sm: 200 },
              }}
            >
              <TableSortLabel
                active={orderBy === "TenKhoa"}
                direction={orderBy === "TenKhoa" ? order : "asc"}
                onClick={() => handleRequestSort("TenKhoa")}
                hideSortIcon
                sx={{
                  fontSize: { xs: "0.7rem", sm: "0.875rem" },
                }}
              >
                Tên Khoa
              </TableSortLabel>
            </TableCell>
            <TableCell
              align="right"
              sortDirection={orderBy === "vienphi_count" ? order : false}
              sx={{ minWidth: { xs: 60, sm: 80 } }}
            >
              <TableSortLabel
                active={orderBy === "vienphi_count"}
                direction={orderBy === "vienphi_count" ? order : "desc"}
                onClick={() => handleRequestSort("vienphi_count")}
                hideSortIcon
                sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
              >
                Số ca
              </TableSortLabel>
            </TableCell>
            <TableCell
              align="right"
              sortDirection={orderBy === "total_money" ? order : false}
              sx={{ minWidth: { xs: 80, sm: 120 } }}
            >
              <TableSortLabel
                active={orderBy === "total_money"}
                direction={orderBy === "total_money" ? order : "desc"}
                onClick={() => handleRequestSort("total_money")}
                hideSortIcon
                sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
              >
                Doanh thu
              </TableSortLabel>
            </TableCell>
            <TableCell
              align="right"
              sortDirection={orderBy === "avg_money_per_case" ? order : false}
              sx={{ minWidth: { xs: 80, sm: 100 } }}
            >
              <TableSortLabel
                active={orderBy === "avg_money_per_case"}
                direction={orderBy === "avg_money_per_case" ? order : "desc"}
                onClick={() => handleRequestSort("avg_money_per_case")}
                hideSortIcon
                sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
              >
                BQ/ca
              </TableSortLabel>
            </TableCell>
            <TableCell align="right" sx={{ minWidth: { xs: 100, sm: 140 } }}>
              Thuốc
            </TableCell>
            <TableCell align="right" sx={{ minWidth: { xs: 100, sm: 140 } }}>
              Vật tư
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody
          sx={{
            "& td": { color: BLUE, fontSize: { xs: "0.7rem", sm: "0.875rem" } },
          }}
        >
          {sorted.map((row, index) => (
            <TableRow hover key={row.KhoaID}>
              <TableCell
                sx={{
                  position: "sticky",
                  left: 0,
                  zIndex: 2,
                  bgcolor: darkMode ? "#1D1D1D" : "#FFF",
                }}
              >
                {index + 1}
              </TableCell>
              <TableCell
                sx={{
                  position: "sticky",
                  left: { xs: 40, sm: 50 },
                  zIndex: 2,
                  bgcolor: darkMode ? "#1D1D1D" : "#FFF",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: BLUE,
                    fontSize: { xs: "0.7rem", sm: "0.875rem" },
                  }}
                >
                  {row.TenKhoa}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: BLUE,
                    fontSize: { xs: "0.6rem", sm: "0.75rem" },
                  }}
                >
                  ID: {row.KhoaID}
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
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      fontSize: { xs: "0.65rem", sm: "0.875rem" },
                    }}
                  >
                    {VND.format(row.total_thuoc || 0)}
                  </Typography>
                  <PercentageBar value={row.ty_le_thuoc} color="#bb1515" />
                </Stack>
              </TableCell>
              <TableCell align="right" width={180}>
                <Stack spacing={0.5}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      fontSize: { xs: "0.65rem", sm: "0.875rem" },
                    }}
                  >
                    {VND.format(row.total_vattu || 0)}
                  </Typography>
                  <PercentageBar value={row.ty_le_vattu} color="#1939B7" />
                </Stack>
              </TableCell>
            </TableRow>
          ))}

          {/* Hàng tổng */}
          <TableRow selected>
            <TableCell
              colSpan={2}
              sx={{
                position: "sticky",
                left: 0,
                zIndex: 2,
                bgcolor: darkMode ? "#2a2a2a" : "#f5f5f5",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "0.7rem", sm: "0.875rem" },
                }}
              >
                Tổng (sau lọc)
              </Typography>
            </TableCell>
            <TableCell
              align="right"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "0.7rem", sm: "0.875rem" },
              }}
            >
              {totals.totalCases.toLocaleString("vi-VN")}
            </TableCell>
            <TableCell
              align="right"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "0.7rem", sm: "0.875rem" },
              }}
            >
              {VND.format(totals.totalMoney)}
            </TableCell>
            <TableCell
              align="right"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "0.7rem", sm: "0.875rem" },
              }}
            >
              {VND.format(totals.avgPerCase)}
            </TableCell>
            <TableCell align="right" colSpan={2}>
              <Typography
                variant="caption"
                sx={{
                  color: BLUE,
                  fontSize: { xs: "0.6rem", sm: "0.75rem" },
                }}
              >
                Tỉ lệ dưới đây hiển thị theo từng khoa
              </Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Stack spacing={2} sx={{ p: { xs: 0.5, sm: 1 } }}>
      <Card
        sx={{
          fontWeight: "bold",
          color: "#f2f2f2",
          backgroundColor: darkMode ? "#1D1D1D" : BLUE,
          p: { xs: 0.5, sm: 1 },
          boxShadow: 3,
          borderRadius: 3,
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: "1rem", sm: "1.3rem" },
            textAlign: "center",
          }}
        >
          Bình quân bệnh án
        </Typography>
      </Card>

      {/* Chọn ngày + hiển thị thời gian số liệu */}
      <Card sx={{ p: { xs: 1, sm: 2 }, borderRadius: 2, boxShadow: 6 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              color: BLUE,
              flexGrow: 1,
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
            }}
          >
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
                slotProps={{
                  textField: {
                    size: "small",
                    sx: { fontSize: { xs: "0.75rem", sm: "0.875rem" } },
                  },
                }}
              />
              <DatePicker
                label="Ngày tính chênh lệch"
                value={dateChenhLech}
                onChange={(v) => v && setDateChenhLech(v)}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: { fontSize: { xs: "0.75rem", sm: "0.875rem" } },
                  },
                }}
              />
            </Stack>
          </LocalizationProvider>
        </Stack>

        {(chisosObj?.Ngay || chisosObj_NgayChenhLech?.Ngay) && (
          <Typography
            variant="caption"
            sx={{
              color: BLUE,
              fontSize: { xs: "0.65rem", sm: "0.75rem" },
            }}
          >
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

      {/* Tabs cho Nội trú và Ngoại trú */}
      <Card elevation={3} sx={{ borderRadius: 2, boxShadow: 10 }}>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: darkMode ? "#1D1D1D" : "#f5f5f5",
            "& .MuiTab-root": {
              fontSize: { xs: "0.8rem", sm: "1rem" },
              fontWeight: 600,
              minHeight: { xs: 48, sm: 60 },
              px: { xs: 1, sm: 2 },
            },
            "& .Mui-selected": {
              color: BLUE,
            },
          }}
        >
          <Tab
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography
                  variant="h6"
                  sx={{ fontSize: { xs: "0.85rem", sm: "1.1rem" } }}
                >
                  🏥 Nội trú
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    bgcolor: "#00C49F",
                    color: "#FFF",
                    px: { xs: 0.5, sm: 1 },
                    py: { xs: 0.25, sm: 0.5 },
                    borderRadius: 1,
                    fontSize: { xs: "0.65rem", sm: "0.75rem" },
                  }}
                >
                  {rowsNoiTru.length} khoa
                </Typography>
              </Stack>
            }
          />
          <Tab
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography
                  variant="h6"
                  sx={{ fontSize: { xs: "0.85rem", sm: "1.1rem" } }}
                >
                  🏥 Ngoại trú
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    bgcolor: "#FFBB28",
                    color: "#FFF",
                    px: { xs: 0.5, sm: 1 },
                    py: { xs: 0.25, sm: 0.5 },
                    borderRadius: 1,
                    fontSize: { xs: "0.65rem", sm: "0.75rem" },
                  }}
                >
                  {rowsNgoaiTru.length} khoa
                </Typography>
              </Stack>
            }
          />
        </Tabs>

        {/* Tab Panel - Nội trú */}
        {currentTab === 0 && (
          <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
            {/* Summary Cards - Nội trú */}
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              sx={{ mb: 3 }}
            >
              <Card
                sx={{
                  flex: 1,
                  borderRadius: 2,
                  boxShadow: 10,
                  bgcolor: "#1939B7",
                  color: "#FFF",
                }}
              >
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Typography
                    variant="overline"
                    sx={{
                      opacity: 0.9,
                      fontSize: { xs: "0.65rem", sm: "0.75rem" },
                    }}
                  >
                    Tổng số khoa
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "1.25rem", sm: "1.5rem" },
                    }}
                  >
                    {filteredNoiTru.length}
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
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Typography
                    variant="overline"
                    sx={{
                      opacity: 0.9,
                      color: "#FFF",
                      fontSize: { xs: "0.65rem", sm: "0.75rem" },
                    }}
                  >
                    Tổng ca viện phí
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "1.25rem", sm: "1.5rem" },
                    }}
                  >
                    {totalsNoiTru.totalCases.toLocaleString("vi-VN")}
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
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Typography
                    variant="overline"
                    sx={{
                      opacity: 0.9,
                      fontSize: { xs: "0.65rem", sm: "0.75rem" },
                    }}
                  >
                    Tổng doanh thu
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "1.1rem", sm: "1.5rem" },
                    }}
                  >
                    {VND.format(totalsNoiTru.totalMoney)}
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
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Typography
                    variant="overline"
                    sx={{
                      opacity: 0.9,
                      color: "#FFF",
                      fontSize: { xs: "0.65rem", sm: "0.75rem" },
                    }}
                  >
                    Bình quân/ca
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "1.1rem", sm: "1.5rem" },
                    }}
                  >
                    {VND.format(totalsNoiTru.avgPerCase)}
                  </Typography>
                </CardContent>
              </Card>
            </Stack>

            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 1 }}
            >
              <FilterListIcon fontSize="small" sx={{ color: BLUE }} />
              <Typography
                variant="subtitle2"
                color={darkMode ? "#FFF" : "text.secondary"}
                sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
              >
                Bộ lọc và xuất dữ liệu - Nội trú
              </Typography>
            </Stack>

            <TableToolbar
              search={searchNoiTru}
              setSearch={setSearchNoiTru}
              onReset={handleResetNoiTru}
              onExport={() => exportToCSV(filteredNoiTru, "noitru")}
              loaiKhoa="noitru"
            />

            <Divider sx={{ my: 2 }} />

            {renderTable(
              sortedNoiTru,
              totalsNoiTru,
              orderNoiTru,
              orderByNoiTru,
              handleRequestSortNoiTru,
              "noitru"
            )}
          </Box>
        )}

        {/* Tab Panel - Ngoại trú */}
        {currentTab === 1 && (
          <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
            {/* Summary Cards - Ngoại trú */}
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              sx={{ mb: 3 }}
            >
              <Card
                sx={{
                  flex: 1,
                  borderRadius: 2,
                  boxShadow: 10,
                  bgcolor: "#1939B7",
                  color: "#FFF",
                }}
              >
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Typography
                    variant="overline"
                    sx={{
                      opacity: 0.9,
                      fontSize: { xs: "0.65rem", sm: "0.75rem" },
                    }}
                  >
                    Tổng số khoa
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "1.25rem", sm: "1.5rem" },
                    }}
                  >
                    {filteredNgoaiTru.length}
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
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Typography
                    variant="overline"
                    sx={{
                      opacity: 0.9,
                      color: "#FFF",
                      fontSize: { xs: "0.65rem", sm: "0.75rem" },
                    }}
                  >
                    Tổng ca viện phí
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "1.25rem", sm: "1.5rem" },
                    }}
                  >
                    {totalsNgoaiTru.totalCases.toLocaleString("vi-VN")}
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
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Typography
                    variant="overline"
                    sx={{
                      opacity: 0.9,
                      fontSize: { xs: "0.65rem", sm: "0.75rem" },
                    }}
                  >
                    Tổng doanh thu
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "1.1rem", sm: "1.5rem" },
                    }}
                  >
                    {VND.format(totalsNgoaiTru.totalMoney)}
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
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Typography
                    variant="overline"
                    sx={{
                      opacity: 0.9,
                      color: "#FFF",
                      fontSize: { xs: "0.65rem", sm: "0.75rem" },
                    }}
                  >
                    Bình quân/ca
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "1.1rem", sm: "1.5rem" },
                    }}
                  >
                    {VND.format(totalsNgoaiTru.avgPerCase)}
                  </Typography>
                </CardContent>
              </Card>
            </Stack>

            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 1 }}
            >
              <FilterListIcon fontSize="small" sx={{ color: BLUE }} />
              <Typography
                variant="subtitle2"
                color={darkMode ? "#FFF" : "text.secondary"}
                sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
              >
                Bộ lọc và xuất dữ liệu - Ngoại trú
              </Typography>
            </Stack>

            <TableToolbar
              search={searchNgoaiTru}
              setSearch={setSearchNgoaiTru}
              onReset={handleResetNgoaiTru}
              onExport={() => exportToCSV(filteredNgoaiTru, "ngoaitru")}
              loaiKhoa="ngoaitru"
            />

            <Divider sx={{ my: 2 }} />

            {renderTable(
              sortedNgoaiTru,
              totalsNgoaiTru,
              orderNgoaiTru,
              orderByNgoaiTru,
              handleRequestSortNgoaiTru,
              "ngoaitru"
            )}
          </Box>
        )}
      </Card>
    </Stack>
  );
};

export default BinhQuanBenhAn;
