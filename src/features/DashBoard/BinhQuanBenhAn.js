import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Stack, Card, Typography, Tabs, Tab } from "@mui/material";
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
import { getAllKhuyenCao } from "./BinhQuanBenhAn/khuyenCaoKhoaBQBASlice";

// Import components và utilities từ thư mục refactored
import {
  TableToolbar,
  SummaryCards,
  OverallSummaryCards,
  TabPanel,
  DataTable,
  getComparator,
  stableSort,
  exportToCSV,
  calculateDifference,
} from "./BinhQuanBenhAn/";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz?.setDefault?.("Asia/Ho_Chi_Minh");

const BinhQuanBenhAn = () => {
  const dispatch = useDispatch();
  const { darkMode } = useSelector((state) => state.mytheme) || {};
  const {
    BinhQuanBenhAn: rowsFromStore,
    BinhQuanBenhAn_NgayChenhLech: rowsChenhLech,
    ThongKe_VienPhi_DuyetKeToan,
    ThongKe_VienPhi_DuyetKeToan_NgayChenhLech,
    dashboadChiSoChatLuong,
    dashboad_NgayChenhLech,
  } = useSelector((state) => state.dashboard) || {};
  const { khuyenCaoList } =
    useSelector((state) => state.khuyenCaoKhoaBQBA) || {};
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
  // Tính chênh lệch với ngày trước
  const baseRows = useMemo(() => {
    const rows = Array.isArray(rowsFromStore) ? rowsFromStore : [];
    const prevRows = Array.isArray(rowsChenhLech) ? rowsChenhLech : [];
    const validRows = rows.filter((r) => r && r.TenKhoa && r.KhoaID);

    // Tính chênh lệch
    const rowsWithDiff = calculateDifference(validRows, prevRows, ngay);

    // Merge khuyến cáo vào từng row
    return rowsWithDiff.map((row) => {
      const khuyenCao = khuyenCaoList?.find(
        (kc) =>
          kc.KhoaID === row.KhoaID &&
          kc.LoaiKhoa === row.LoaiKhoa &&
          kc.Nam === nam
      );

      return {
        ...row,
        KhuyenCaoBinhQuanHSBA: khuyenCao?.KhuyenCaoBinhQuanHSBA || null,
        KhuyenCaoTyLeThuocVatTu: khuyenCao?.KhuyenCaoTyLeThuocVatTu || null,
      };
    });
  }, [rowsFromStore, rowsChenhLech, ngay, khuyenCaoList, nam]);

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
    const totalThuoc = filteredNoiTru.reduce(
      (s, r) => s + (r.total_thuoc || 0),
      0
    );
    const totalVattu = filteredNoiTru.reduce(
      (s, r) => s + (r.total_vattu || 0),
      0
    );
    const avgPerCase = totalCases ? totalMoney / totalCases : 0;

    // Tính chênh lệch
    const totalCases_diff = filteredNoiTru.reduce(
      (s, r) => s + (r.vienphi_count_diff || 0),
      0
    );
    const totalMoney_diff = filteredNoiTru.reduce(
      (s, r) => s + (r.total_money_diff || 0),
      0
    );
    const totalThuoc_diff = filteredNoiTru.reduce(
      (s, r) => s + (r.total_thuoc_diff || 0),
      0
    );
    const totalVattu_diff = filteredNoiTru.reduce(
      (s, r) => s + (r.total_vattu_diff || 0),
      0
    );

    // Tính avgPerCase chênh lệch
    const prevTotalCases = totalCases - totalCases_diff;
    const prevTotalMoney = totalMoney - totalMoney_diff;
    const prevAvgPerCase = prevTotalCases ? prevTotalMoney / prevTotalCases : 0;
    const avgPerCase_diff = avgPerCase - prevAvgPerCase;

    return {
      totalCases,
      totalMoney,
      totalThuoc,
      totalVattu,
      avgPerCase,
      totalCases_diff,
      totalMoney_diff,
      totalThuoc_diff,
      totalVattu_diff,
      avgPerCase_diff,
    };
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
    const totalThuoc = filteredNgoaiTru.reduce(
      (s, r) => s + (r.total_thuoc || 0),
      0
    );
    const totalVattu = filteredNgoaiTru.reduce(
      (s, r) => s + (r.total_vattu || 0),
      0
    );
    const avgPerCase = totalCases ? totalMoney / totalCases : 0;

    // Tính chênh lệch
    const totalCases_diff = filteredNgoaiTru.reduce(
      (s, r) => s + (r.vienphi_count_diff || 0),
      0
    );
    const totalMoney_diff = filteredNgoaiTru.reduce(
      (s, r) => s + (r.total_money_diff || 0),
      0
    );
    const totalThuoc_diff = filteredNgoaiTru.reduce(
      (s, r) => s + (r.total_thuoc_diff || 0),
      0
    );
    const totalVattu_diff = filteredNgoaiTru.reduce(
      (s, r) => s + (r.total_vattu_diff || 0),
      0
    );

    // Tính avgPerCase chênh lệch
    const prevTotalCases = totalCases - totalCases_diff;
    const prevTotalMoney = totalMoney - totalMoney_diff;
    const prevAvgPerCase = prevTotalCases ? prevTotalMoney / prevTotalCases : 0;
    const avgPerCase_diff = avgPerCase - prevAvgPerCase;

    return {
      totalCases,
      totalMoney,
      totalThuoc,
      totalVattu,
      avgPerCase,
      totalCases_diff,
      totalMoney_diff,
      totalThuoc_diff,
      totalVattu_diff,
      avgPerCase_diff,
    };
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

  // Fetch khuyến cáo theo năm
  useEffect(() => {
    if (nam) {
      dispatch(getAllKhuyenCao(nam));
    }
  }, [nam, dispatch]);

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

  const handleRequestSortNoiTru = (event, property) => {
    const isAsc = orderByNoiTru === property && orderNoiTru === "asc";
    setOrderNoiTru(isAsc ? "desc" : "asc");
    setOrderByNoiTru(property);
  };

  const handleRequestSortNgoaiTru = (event, property) => {
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

  const handleExportNoiTru = () => {
    exportToCSV(sortedNoiTru, "noitru");
  };

  const handleExportNgoaiTru = () => {
    exportToCSV(sortedNgoaiTru, "ngoaitru");
  };

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
      <Card
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderRadius: 2,
          boxShadow: 6,
          background: "linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)",
        }}
      >
        {/* Phần chọn ngày */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "center" }}
          sx={{ mb: 1.5 }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ flexGrow: 1 }}
          >
            <Typography sx={{ fontSize: { xs: "1rem", sm: "1.2rem" } }}>
              📅
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: BLUE,
                fontWeight: 600,
                fontSize: { xs: "0.8rem", sm: "0.95rem" },
              }}
            >
              {dashboadChiSoChatLuong?.Ngay
                ? formatDateTime(dashboadChiSoChatLuong.Ngay)
                : "Đang tải..."}
            </Typography>
          </Stack>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <DatePicker
                label="Ngày xem"
                value={date}
                onChange={(v) => v && setDate(v)}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: {
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      minWidth: { xs: "100%", sm: "140px" },
                    },
                  },
                }}
              />
              <DatePicker
                label="Ngày so sánh"
                value={dateChenhLech}
                onChange={(v) => v && setDateChenhLech(v)}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: {
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      minWidth: { xs: "100%", sm: "140px" },
                    },
                  },
                }}
              />
            </Stack>
          </LocalizationProvider>
        </Stack>

        {/* Phần thông tin chênh lệch và ghi chú */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 1, md: 2 }}
          sx={{
            p: { xs: 1, sm: 1.5 },
            borderRadius: 1.5,
            bgcolor: "rgba(25, 57, 183, 0.05)",
            border: "1px solid rgba(25, 57, 183, 0.1)",
          }}
        >
          {/* Thông tin chênh lệch */}
          {(dashboadChiSoChatLuong?.Ngay || dashboad_NgayChenhLech?.Ngay) && (
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              sx={{ flex: 1 }}
            >
              <Typography sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}>
                📊
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: BLUE,
                  fontWeight: 500,
                  fontSize: { xs: "0.7rem", sm: "0.8rem" },
                  lineHeight: 1.4,
                }}
              >
                <strong>Chênh lệch:</strong>{" "}
                {ngay === 1
                  ? `Từ 00:00 ngày 1/${thang}/${nam}`
                  : `${formatDateTime(dashboad_NgayChenhLech?.Ngay)}`}
                {" → "}
                {formatDateTime(dashboadChiSoChatLuong?.Ngay)}
              </Typography>
            </Stack>
          )}

          {/* Ghi chú */}
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{
              flex: 1,
              borderLeft: {
                xs: "none",
                md: "2px solid rgba(25, 57, 183, 0.2)",
              },
              borderTop: { xs: "2px solid rgba(25, 57, 183, 0.2)", md: "none" },
              pl: { xs: 0, md: 2 },
              pt: { xs: 1, md: 0 },
            }}
          >
            <Typography sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}>
              ℹ️
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "#666",
                fontStyle: "italic",
                fontSize: { xs: "0.65rem", sm: "0.75rem" },
                lineHeight: 1.4,
              }}
            >
              Số liệu thống kê theo tiêu chí bệnh nhân đã duyệt kế toán
            </Typography>
          </Stack>
        </Stack>
      </Card>

      {/* Overall Summary Cards - Toàn viện */}
      <OverallSummaryCards
        totalAll={ThongKe_VienPhi_DuyetKeToan?.total_all || 0}
        totalAll_diff={
          (ThongKe_VienPhi_DuyetKeToan?.total_all || 0) -
          (ThongKe_VienPhi_DuyetKeToan_NgayChenhLech?.total_all || 0)
        }
        ngoaitruKhongNhapVien={
          ThongKe_VienPhi_DuyetKeToan?.ngoaitru_khong_nhapvien || 0
        }
        ngoaitruKhongNhapVien_diff={
          (ThongKe_VienPhi_DuyetKeToan?.ngoaitru_khong_nhapvien || 0) -
          (ThongKe_VienPhi_DuyetKeToan_NgayChenhLech?.ngoaitru_khong_nhapvien ||
            0)
        }
      />

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
        <TabPanel value={currentTab} index={0}>
          <SummaryCards
            totals={totalsNoiTru}
            filteredLength={filteredNoiTru.length}
            loaiKhoa="noitru"
            thongKeCount={ThongKe_VienPhi_DuyetKeToan?.noitru || 0}
            thongKeCount_diff={
              (ThongKe_VienPhi_DuyetKeToan?.noitru || 0) -
              (ThongKe_VienPhi_DuyetKeToan_NgayChenhLech?.noitru || 0)
            }
          />

          <TableToolbar
            search={searchNoiTru}
            setSearch={setSearchNoiTru}
            onReset={handleResetNoiTru}
            onExport={handleExportNoiTru}
            loaiKhoa="noitru"
          />

          <DataTable
            sorted={sortedNoiTru}
            totals={totalsNoiTru}
            order={orderNoiTru}
            orderBy={orderByNoiTru}
            onRequestSort={handleRequestSortNoiTru}
            darkMode={darkMode}
            loaiKhoa="noitru"
          />
        </TabPanel>

        {/* Tab Panel - Ngoại trú */}
        <TabPanel value={currentTab} index={1}>
          <SummaryCards
            totals={totalsNgoaiTru}
            filteredLength={filteredNgoaiTru.length}
            loaiKhoa="ngoaitru"
            thongKeCount={ThongKe_VienPhi_DuyetKeToan?.ngoaitru || 0}
            thongKeCount_diff={
              (ThongKe_VienPhi_DuyetKeToan?.ngoaitru || 0) -
              (ThongKe_VienPhi_DuyetKeToan_NgayChenhLech?.ngoaitru || 0)
            }
          />

          <TableToolbar
            search={searchNgoaiTru}
            setSearch={setSearchNgoaiTru}
            onReset={handleResetNgoaiTru}
            onExport={handleExportNgoaiTru}
            loaiKhoa="ngoaitru"
          />

          <DataTable
            sorted={sortedNgoaiTru}
            totals={totalsNgoaiTru}
            order={orderNgoaiTru}
            orderBy={orderByNgoaiTru}
            onRequestSort={handleRequestSortNgoaiTru}
            darkMode={darkMode}
            loaiKhoa="ngoaitru"
          />
        </TabPanel>
      </Card>
    </Stack>
  );
};

export default BinhQuanBenhAn;
