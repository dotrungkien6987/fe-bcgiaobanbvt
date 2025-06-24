import React, { useState, useEffect, useRef } from "react";
import {
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Input,
  Button,
  Box,
  Paper,
  useMediaQuery,
  useTheme,
  TableContainer,
  Container,
  Grid,
  Chip,
  Typography,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Alert,
  TextField,
  Autocomplete,
  Select,
  MenuItem,
  Divider,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import {
  getByNgayKhoa,
  updateOrInsertLichTruc,
  getKhoas,
} from "../Slice/lichtrucSlice";
import MainCard from "components/MainCard";
import useAuth from "../../hooks/useAuth";
import {
  SaveOutlined,
  CalendarMonthOutlined,
  ArrowForwardIos,
  ArrowBackIos,
  LockOutlined,
  TodayOutlined,
  ContentCopy as ContentCopyIcon,
  ContentPaste as ContentPasteIcon,
} from "@mui/icons-material";

function LichTrucTable() {
  // Initialize state for "Từ ngày" (fromDate) and "Đến ngày" (toDate)
  const [fromDate, setFromDate] = useState(
    dayjs().startOf("month").hour(7).minute(0).second(0).millisecond(0)
  );
  const [toDate, setToDate] = useState(
    dayjs().endOf("month").hour(7).minute(0).second(0).millisecond(0)
  );

  // State cho chọn nhanh tháng/năm
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1); // +1 vì dayjs tính tháng từ 0

  // State cho khoa được chọn
  const [selectedKhoaId, setSelectedKhoaId] = useState("");

  // Lấy thông tin người dùng hiện tại
  const { user } = useAuth();
  // Ngày hiện tại theo múi giờ Việt Nam
  const currentDate = dayjs().startOf("day");
  // Ngày hôm qua
  const yesterdayDate = dayjs().subtract(1, "day").startOf("day");

  // Lấy danh sách khoa và lịch trực từ Redux store
  const {
    lichTrucList: lichTrucs,
    khoas,
    isLoading,
    error,
  } = useSelector((state) => state.lichtruc);

  // Thêm state để theo dõi khả năng cuộn
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // State để chứa danh sách lịch trực
  const [lichTrucList, setLichTrucList] = useState([]);

  // Ref cho container bảng
  const tableContainerRef = useRef(null);

  // Danh sách các năm để chọn (5 năm trước và 5 năm sau năm hiện tại)
  const years = Array.from({ length: 5 }, (_, i) => dayjs().year() - 2 + i);

  // Danh sách các tháng để hiển thị
  const months = [
    { value: 1, label: "Tháng 1" },
    { value: 2, label: "Tháng 2" },
    { value: 3, label: "Tháng 3" },
    { value: 4, label: "Tháng 4" },
    { value: 5, label: "Tháng 5" },
    { value: 6, label: "Tháng 6" },
    { value: 7, label: "Tháng 7" },
    { value: 8, label: "Tháng 8" },
    { value: 9, label: "Tháng 9" },
    { value: 10, label: "Tháng 10" },
    { value: 11, label: "Tháng 11" },
    { value: 12, label: "Tháng 12" },
  ];

  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const { darkMode } = useSelector(
    (state) => state.mytheme || { darkMode: false }
  );

  // Fetch danh sách khoa khi component mount
  useEffect(() => {
    dispatch(getKhoas());
  }, [dispatch]); // Khi nhận được danh sách khoa và có thông tin người dùng, tự động chọn khoa của người dùng
  useEffect(() => {
    if (khoas.length > 0 && user && !selectedKhoaId) {
      let defaultKhoaId = null;

      // Ưu tiên chọn khoa của user (KhoaID) trước
      if (user.KhoaID) {
        const userKhoa = khoas.find((khoa) => khoa._id === user.KhoaID._id);
        if (userKhoa) {
          defaultKhoaId = user.KhoaID._id;
          console.log("Tự động chọn khoa của user:", userKhoa.TenKhoa);
        }
      }

      // Fallback: Nếu không có KhoaID, chọn khoa đầu tiên từ KhoaLichTruc
      if (
        !defaultKhoaId &&
        user.KhoaLichTruc &&
        Array.isArray(user.KhoaLichTruc) &&
        user.KhoaLichTruc.length > 0
      ) {
        const firstKhoa = khoas.find((khoa) =>
          user.KhoaLichTruc.includes(khoa.MaKhoa)
        );
        if (firstKhoa) {
          defaultKhoaId = firstKhoa._id;
          console.log("Tự động chọn khoa từ KhoaLichTruc:", firstKhoa.TenKhoa);
        }
      }

      if (defaultKhoaId) {
        setSelectedKhoaId(defaultKhoaId);
      }
    }
  }, [khoas, user, selectedKhoaId]);

  // Fetch dữ liệu lịch trực khi thay đổi khoảng thời gian và khoa
  useEffect(() => {
    if (selectedKhoaId) {
      console.log("Tải dữ liệu cho khoa ID:", selectedKhoaId);
      const fromDateISO = fromDate.toISOString();
      const toDateISO = toDate.toISOString();

      // Sử dụng API getByNgayKhoa thay vì getLichTrucByDateRange
      dispatch(getByNgayKhoa(fromDateISO, toDateISO, selectedKhoaId));
    }
  }, [fromDate, toDate, selectedKhoaId, dispatch]);

  // Khi lichTrucList thay đổi từ Redux, cập nhật state local
  useEffect(() => {
    if (lichTrucs) {
      setLichTrucList(lichTrucs);
    }
  }, [lichTrucs]);

  // Kiểm tra khả năng cuộn
  const checkScroll = () => {
    if (tableContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        tableContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5); // -5 là buffer nhỏ
    }
  };

  // Theo dõi sự kiện cuộn
  useEffect(() => {
    const container = tableContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      // Kiểm tra ban đầu
      checkScroll();

      // Thêm trình nghe cho resize window
      window.addEventListener("resize", checkScroll);

      return () => {
        container.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [lichTrucList]); // Chạy lại khi dữ liệu thay đổi

  // Xử lý khi người dùng chọn khoa
  const handleKhoaChange = (event, newValue) => {
    if (newValue) {
      setSelectedKhoaId(newValue._id);
    } else {
      setSelectedKhoaId("");
    }
  };

  const handleFromDateChange = (newDate) => {
    handleDateChange(newDate, setFromDate);
  };

  const handleToDateChange = (newDate) => {
    handleDateChange(newDate, setToDate);
  };

  const handleDateChange = (newDate, setDateFunction) => {
    if (newDate instanceof Date) {
      newDate.setHours(7, 0, 0, 0);
      setDateFunction(dayjs(newDate));
    } else if (dayjs.isDayjs(newDate)) {
      const updatedDate = newDate.hour(7).minute(0).second(0).millisecond(0);
      setDateFunction(updatedDate);
    }
  };

  // Xử lý khi người dùng chọn năm
  const handleYearChange = (event) => {
    const year = event.target.value;
    setSelectedYear(year);
    updateDateRangeByMonthYear(selectedMonth, year);
  };

  // Xử lý khi người dùng chọn tháng
  const handleMonthChange = (event) => {
    const month = event.target.value;
    setSelectedMonth(month);
    updateDateRangeByMonthYear(month, selectedYear);
  };

  // Cập nhật fromDate và toDate dựa trên tháng và năm
  const updateDateRangeByMonthYear = (month, year) => {
    // Cập nhật từ ngày (ngày đầu tháng)
    const firstDayOfMonth = dayjs()
      .year(year)
      .month(month - 1) // -1 vì dayjs tính tháng từ 0
      .startOf("month")
      .hour(7)
      .minute(0)
      .second(0)
      .millisecond(0);

    // Cập nhật đến ngày (ngày cuối tháng)
    const lastDayOfMonth = dayjs()
      .year(year)
      .month(month - 1)
      .endOf("month")
      .hour(7)
      .minute(0)
      .second(0)
      .millisecond(0);

    setFromDate(firstDayOfMonth);
    setToDate(lastDayOfMonth);
  };

  // Chọn tháng hiện tại
  const selectCurrentMonth = () => {
    const now = dayjs();
    setSelectedMonth(now.month() + 1);
    setSelectedYear(now.year());
    updateDateRangeByMonthYear(now.month() + 1, now.year());
  };

  // Hàm cuộn sang trái/phải
  const scrollLeft = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollLeft -= 100;
    }
  };

  const scrollRight = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollLeft += 100;
    }
  }; // Kiểm tra người dùng có quyền chỉnh sửa không
  const canEdit = () => {
    if (!user) return false;

    // Admin có thể chỉnh sửa tất cả
    if (user.PhanQuyen === "admin") return true;

    // Kiểm tra user có quyền sửa lịch trực của khoa được chọn không
    if (selectedKhoaId) {
      // Tìm khoa được chọn trong danh sách khoas
      const selectedKhoa = khoas.find((khoa) => khoa._id === selectedKhoaId);
      console.log("canEdit Debug:", {
        selectedKhoaId,
        selectedKhoa,
        userKhoaLichTruc: user.KhoaLichTruc,
        selectedKhoaMaKhoa: selectedKhoa?.MaKhoa,
      });
      if (selectedKhoa) {
        // Ưu tiên: Kiểm tra khoa của user (KhoaID) trước
        if (user.KhoaID && user.KhoaID._id === selectedKhoaId) {
          console.log("canEdit Result from KhoaID:", true);
          return true;
        }

        // Sau đó kiểm tra user có mảng KhoaLichTruc, kiểm tra MaKhoa có trong mảng không
        if (user.KhoaLichTruc && Array.isArray(user.KhoaLichTruc)) {
          const canEditResult = user.KhoaLichTruc.includes(selectedKhoa.MaKhoa);
          console.log("canEdit Result from KhoaLichTruc:", canEditResult);
          return canEditResult;
        }
      }
    }

    console.log("canEdit Result: false");
    return false;
  };

  // Kiểm tra người dùng có thể chỉnh sửa lịch trực của một ngày cụ thể không
  const canEditRow = (rowDate) => {
    if (!canEdit()) return false;

    // Admin có thể chỉnh sửa tất cả các ngày
    if (user.PhanQuyen === "admin") return true;

    // Người dùng thường chỉ có thể chỉnh sửa từ ngày hôm qua trở đi
    const rowDateObj = dayjs(rowDate).startOf("day");
    return (
      rowDateObj.isSame(yesterdayDate) || rowDateObj.isAfter(yesterdayDate)
    );
  };

  // Hàm alpha để điều chỉnh độ trong suốt của màu
  const alpha = (color, opacity) => {
    // Kiểm tra nếu color là undefined hoặc null
    if (!color) {
      return `rgba(0, 0, 0, ${opacity})`;
    }

    // Kiểm tra nếu color là chuỗi 'rgb' hoặc 'rgba'
    if (typeof color === "string" && color.startsWith("rgb")) {
      return color.replace("rgb", "rgba").replace(")", `, ${opacity})`);
    }

    // Nếu color là mã hex hoặc tên màu, sử dụng rgba trực tiếp
    return `rgba(${theme.palette.primary.main}, ${opacity})`;
  };

  // Xác định màu nền cho ngày cuối tuần
  const getWeekendColor = (date) => {
    const dayOfWeek = dayjs(date).day();
    return dayOfWeek === 0 || dayOfWeek === 6
      ? { backgroundColor: alpha(theme.palette.primary.lighter, 0.3) }
      : {};
  };

  // Hàm xử lý thay đổi dữ liệu khi chỉnh sửa
  const handleInputChange = (event, rowIndex, field) => {
    const value = event.target.value;
    const row = lichTrucList[rowIndex];

    // Chỉ cho phép chỉnh sửa nếu có quyền
    if (!canEditRow(row.Ngay)) {
      return;
    }

    setLichTrucList((prevLichTrucList) => {
      const newLichTrucList = [...prevLichTrucList];
      newLichTrucList[rowIndex] = {
        ...newLichTrucList[rowIndex],
        [field]: value,
      };
      return newLichTrucList;
    });
  };

  // Hàm xử lý khi người dùng nhấn nút Cập nhật
  const handleCapNhat = () => {
    // Sử dụng API updateOrInsertLichTruc
    dispatch(updateOrInsertLichTruc(lichTrucList));
  };

  // Định dạng thứ trong tuần
  const formatDayOfWeek = (date) => {
    const dayOfWeek = dayjs(date).day();
    switch (dayOfWeek) {
      case 0:
        return "Chủ Nhật";
      case 1:
        return "Thứ Hai";
      case 2:
        return "Thứ Ba";
      case 3:
        return "Thứ Tư";
      case 4:
        return "Thứ Năm";
      case 5:
        return "Thứ Sáu";
      case 6:
        return "Thứ Bảy";
      default:
        return "";
    }
  };

  const [selectedRow, setSelectedRow] = useState(null);

  // Hàm xử lý sao chép dữ liệu từ một dòng
  const handleCopyRow = (rowIndex) => {
    const row = lichTrucList[rowIndex];
    setSelectedRow({
      DieuDuong: row.DieuDuong || "",
      BacSi: row.BacSi || "",
      GhiChu: row.GhiChu || "",
    });
  };

  // Hàm xử lý dán dữ liệu vào một dòng
  const handlePasteRow = (rowIndex) => {
    if (!selectedRow) return;

    const row = lichTrucList[rowIndex];

    // Chỉ cho phép dán nếu có quyền chỉnh sửa dòng đó
    if (!canEditRow(row.Ngay)) {
      return;
    }

    setLichTrucList((prevLichTrucList) => {
      const newLichTrucList = [...prevLichTrucList];
      newLichTrucList[rowIndex] = {
        ...newLichTrucList[rowIndex],
        DieuDuong: selectedRow.DieuDuong,
        BacSi: selectedRow.BacSi,
        GhiChu: selectedRow.GhiChu,
      };
      return newLichTrucList;
    });
  };

  // Lấy danh sách khoa mà user có quyền chỉnh sửa
  const getUserEditableKhoas = () => {
    if (!user || user.PhanQuyen === "admin") return [];

    const editableKhoas = [];

    // Thêm khoa chính của user
    if (user.KhoaID) {
      const userKhoa = khoas.find((khoa) => khoa._id === user.KhoaID._id);
      if (userKhoa) {
        editableKhoas.push(userKhoa);
      }
    }

    // Thêm các khoa từ KhoaLichTruc (tránh trùng lặp)
    if (user.KhoaLichTruc && Array.isArray(user.KhoaLichTruc)) {
      const additionalKhoas = khoas.filter(
        (khoa) =>
          user.KhoaLichTruc.includes(khoa.MaKhoa) &&
          !editableKhoas.find((existingKhoa) => existingKhoa._id === khoa._id)
      );
      editableKhoas.push(...additionalKhoas);
    }

    return editableKhoas;
  };

  return (
    <MainCard title="Quản lý lịch trực khoa" sx={{ height: "100%" }}>
      <Container maxWidth={false} disableGutters sx={{ p: 0, height: "100%" }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper
              elevation={3}
              sx={{
                p: { xs: 1.5, sm: 2, md: 3 },
                borderRadius: 2,
                background: darkMode
                  ? theme.palette.background.default
                  : theme.palette.background.paper,
                mb: 3,
              }}
            >
              {/* Chọn khoa */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", sm: "center" }}
                justifyContent="space-between"
                mb={2}
              >
                {" "}
                <Autocomplete
                  id="khoa-autocomplete"
                  options={khoas}
                  getOptionLabel={(option) => option.TenKhoa || ""}
                  value={
                    khoas.find((khoa) => khoa._id === selectedKhoaId) || null
                  }
                  onChange={handleKhoaChange}
                  fullWidth
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Chọn khoa"
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        backgroundColor: theme.palette.background.paper,
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Typography variant="body2">{option.TenKhoa}</Typography>
                    </Box>
                  )}
                  noOptionsText="Không tìm thấy khoa"
                  loadingText="Đang tải..."
                  clearOnBlur={false}
                  clearOnEscape
                />
              </Stack>{" "}
              {/* Hiển thị danh sách khoa có quyền chỉnh sửa (chỉ cho user thường) */}
              {user &&
                user.PhanQuyen !== "admin" &&
                getUserEditableKhoas().length > 0 && (
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      mb: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      border: `1px solid ${alpha(
                        theme.palette.primary.main,
                        0.1
                      )}`,
                      borderRadius: 2,
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      mb={1.5}
                    >
                      <LockOutlined
                        sx={{
                          fontSize: 18,
                          color: theme.palette.primary.main,
                        }}
                      />
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: theme.palette.primary.main,
                          fontWeight: 600,
                        }}
                      >
                        Các khoa bạn có quyền chỉnh sửa (
                        {getUserEditableKhoas().length})
                      </Typography>
                    </Stack>
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      {getUserEditableKhoas().map((khoa, index) => {
                        const isMainKhoa =
                          user.KhoaID && user.KhoaID._id === khoa._id;
                        const isSelected = selectedKhoaId === khoa._id;

                        return (
                          <Chip
                            key={khoa._id}
                            label={
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.5}
                              >
                                <Typography
                                  variant="caption"
                                  fontWeight={isSelected ? 600 : 400}
                                >
                                  {khoa.TenKhoa}
                                </Typography>
                                {isMainKhoa && (
                                  <Tooltip title="Khoa chính của bạn" arrow>
                                    <LockOutlined
                                      sx={{ fontSize: "12px !important" }}
                                    />
                                  </Tooltip>
                                )}
                              </Stack>
                            }
                            size="small"
                            variant={isSelected ? "filled" : "outlined"}
                            color={isSelected ? "primary" : "default"}
                            clickable
                            onClick={() => setSelectedKhoaId(khoa._id)}
                            sx={{
                              mb: 0.5,
                              "&:hover": {
                                backgroundColor: isSelected
                                  ? theme.palette.primary.dark
                                  : theme.palette.action.hover,
                                transform: "translateY(-1px)",
                                boxShadow: theme.shadows[2],
                              },
                              transition: "all 0.2s ease-in-out",
                              ...(isMainKhoa && {
                                border: `2px solid ${theme.palette.primary.main}`,
                              }),
                            }}
                          />
                        );
                      })}
                    </Stack>
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 1,
                        color: theme.palette.text.secondary,
                        display: "block",
                        fontStyle: "italic",
                      }}
                    >
                      💡 Click vào chip để chuyển đổi nhanh giữa các khoa
                    </Typography>
                  </Paper>
                )}
              {/* Hiển thị thông báo nếu user không có quyền chỉnh sửa khoa đang xem */}
              {selectedKhoaId && !canEdit() && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Chế độ chỉ xem:</strong> Bạn đang xem lịch trực của
                    khoa khác. Bạn chỉ có thể chỉnh sửa lịch trực của các khoa
                    được phân quyền.
                  </Typography>
                </Alert>
              )}
              {/* Chọn nhanh tháng/năm */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", sm: "center" }}
                justifyContent="space-between"
                mb={2}
              >
                {/* Card container cho bộ lọc tháng/năm trên mobile */}
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: { xs: 1.5, md: 2 },
                    borderRadius: 1,
                    p: { xs: 1.5, md: 0 },
                    ...(isMobile && {
                      background:
                        theme.palette.mode === "dark"
                          ? alpha(theme.palette.primary.dark, 0.1)
                          : alpha(theme.palette.primary.lighter, 0.2),
                      border: "1px solid",
                      borderColor:
                        theme.palette.mode === "dark"
                          ? alpha(theme.palette.primary.main, 0.25)
                          : alpha(theme.palette.primary.main, 0.1),
                    }),
                  }}
                >
                  {/* Header text for mobile */}
                  {isMobile && (
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontWeight: "medium",
                        mb: 0.5,
                      }}
                    >
                      Chọn nhanh thời gian:
                    </Typography>
                  )}

                  {/* Bộ chọn tháng/năm */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "row", md: "row" },
                      gap: 1.5,
                      width: "100%",
                      flexWrap: { xs: "wrap", md: "nowrap" },
                      alignItems: "center",
                    }}
                  >
                    <FormControl
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        minWidth: { xs: "calc(50% - 0.75rem)", md: 120 },
                        flex: { xs: "1 0 auto", md: "0 0 auto" },
                      }}
                      variant={isMobile ? "outlined" : "outlined"}
                    >
                      <InputLabel>Tháng</InputLabel>
                      <Select
                        value={selectedMonth}
                        onChange={handleMonthChange}
                        label="Tháng"
                        sx={{
                          backgroundColor: theme.palette.background.paper,
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: isMobile
                              ? alpha(theme.palette.primary.main, 0.5)
                              : undefined,
                          },
                        }}
                      >
                        {months.map((month) => (
                          <MenuItem key={month.value} value={month.value}>
                            {month.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        minWidth: { xs: "calc(50% - 0.75rem)", md: 100 },
                        flex: { xs: "1 0 auto", md: "0 0 auto" },
                      }}
                      variant={isMobile ? "outlined" : "outlined"}
                    >
                      <InputLabel>Năm</InputLabel>
                      <Select
                        value={selectedYear}
                        onChange={handleYearChange}
                        label="Năm"
                        sx={{
                          backgroundColor: theme.palette.background.paper,
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: isMobile
                              ? alpha(theme.palette.primary.main, 0.5)
                              : undefined,
                          },
                        }}
                      >
                        {years.map((year) => (
                          <MenuItem key={year} value={year}>
                            {year}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Tooltip title="Hiển thị tháng hiện tại">
                      <Button
                        variant={isMobile ? "contained" : "outlined"}
                        color="primary"
                        size={isMobile ? "small" : "medium"}
                        onClick={selectCurrentMonth}
                        startIcon={<TodayOutlined />}
                        sx={{
                          flex: { xs: "1 1 100%", md: "0 0 auto" },
                          color: isMobile ? "#fff" : theme.palette.primary.main,
                          borderColor: theme.palette.primary.main,
                          boxShadow: isMobile ? 2 : 0,
                          "&:hover": {
                            backgroundColor: isMobile
                              ? theme.palette.primary.dark
                              : theme.palette.primary.lighter,
                            borderColor: theme.palette.primary.main,
                          },
                        }}
                      >
                        Tháng hiện tại
                      </Button>
                    </Tooltip>
                  </Box>
                </Box>
              </Stack>
              {/* Chọn ngày cụ thể */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", sm: "center" }}
                justifyContent="space-between"
              >
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  sx={{ width: { xs: "100%", sm: "auto" } }}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        gap: 2,
                        width: "100%",
                      }}
                    >
                      <DatePicker
                        label="Từ ngày"
                        value={fromDate}
                        onChange={handleFromDateChange}
                        format="DD-MM-YYYY"
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: isMobile ? "small" : "medium",
                            InputProps: {
                              startAdornment: (
                                <CalendarMonthOutlined
                                  sx={{
                                    color: theme.palette.primary.main,
                                    mr: 1,
                                  }}
                                />
                              ),
                            },
                          },
                        }}
                      />
                      <DatePicker
                        label="Đến ngày"
                        value={toDate}
                        onChange={handleToDateChange}
                        format="DD-MM-YYYY"
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: isMobile ? "small" : "medium",
                            InputProps: {
                              startAdornment: (
                                <CalendarMonthOutlined
                                  sx={{
                                    color: theme.palette.primary.main,
                                    mr: 1,
                                  }}
                                />
                              ),
                            },
                          },
                        }}
                      />
                    </Box>
                  </LocalizationProvider>
                </Stack>

                {/* Nút Cập Nhật */}
                {canEdit() && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveOutlined />}
                    onClick={handleCapNhat}
                    sx={{
                      minWidth: "120px",
                      py: { xs: 1, md: 1.5 },
                      alignSelf: { xs: "stretch", sm: "center" },
                    }}
                    disabled={!lichTrucList.some((row) => canEditRow(row.Ngay))}
                  >
                    Cập nhật
                  </Button>
                )}
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            {/* Hiển thị loading hoặc lỗi */}
            {isLoading && (
              <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
                <Typography>Đang tải dữ liệu...</Typography>
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Hiển thị thông báo khi chưa chọn khoa */}
            {!selectedKhoaId && !isLoading && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Vui lòng chọn khoa để xem lịch trực
              </Alert>
            )}

            {/* Hiển thị thông báo khi không có dữ liệu */}
            {selectedKhoaId && !isLoading && lichTrucList.length === 0 && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Không có dữ liệu lịch trực trong khoảng thời gian đã chọn
              </Alert>
            )}

            {selectedKhoaId && lichTrucList.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  mb: 1,
                  gap: 1,
                }}
              >
                <IconButton
                  size="small"
                  color="primary"
                  disabled={!canScrollLeft}
                  onClick={scrollLeft}
                  sx={{
                    display: {
                      xs: "flex",
                      md: canScrollLeft ? "flex" : "none",
                    },
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <ArrowBackIos fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color="primary"
                  disabled={!canScrollRight}
                  onClick={scrollRight}
                  sx={{
                    display: {
                      xs: "flex",
                      md: canScrollRight ? "flex" : "none",
                    },
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <ArrowForwardIos fontSize="small" />
                </IconButton>
              </Box>
            )}

            {selectedKhoaId && lichTrucList.length > 0 && (
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                }}
              >
                <TableContainer
                  ref={tableContainerRef}
                  component={Paper}
                  elevation={3}
                  sx={{
                    borderRadius: 2,
                    overflow: "auto",
                    mb: 3,
                    maxWidth: "100%",
                    "&::-webkit-scrollbar": {
                      height: "8px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? theme.palette.grey[700]
                          : theme.palette.grey[400],
                      borderRadius: "4px",
                    },
                    "&::-webkit-scrollbar-track": {
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? theme.palette.grey[900]
                          : theme.palette.grey[100],
                    },
                  }}
                >
                  <Table sx={{ minWidth: 750 }}>
                    <TableHead>
                      <TableRow
                        sx={{
                          backgroundColor: theme.palette.primary.main,
                          "& .MuiTableCell-root": {
                            color: "#fff",
                            fontWeight: "bold",
                            fontSize: { xs: "0.75rem", md: "0.875rem" },
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                          },
                        }}
                      >
                        <TableCell align="center" sx={{ minWidth: 100 }}>
                          Thứ
                        </TableCell>
                        <TableCell align="center" sx={{ minWidth: 120 }}>
                          Ngày
                        </TableCell>
                        <TableCell align="center" sx={{ minWidth: 180 }}>
                          Điều dưỡng trực
                        </TableCell>
                        <TableCell align="center" sx={{ minWidth: 180 }}>
                          Bác sĩ trực
                        </TableCell>
                        <TableCell align="center" sx={{ minWidth: 180 }}>
                          Ghi chú
                        </TableCell>
                        <TableCell align="center" sx={{ minWidth: 120 }}>
                          Tác vụ
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {lichTrucList.map((lichTruc, index) => (
                        <React.Fragment
                          key={`fragment-${lichTruc._id || index}`}
                        >
                          <TableRow
                            key={lichTruc._id || index}
                            sx={{
                              "&:hover": {
                                backgroundColor: alpha(
                                  theme.palette.primary.lighter,
                                  0.1
                                ),
                              },
                              ...getWeekendColor(lichTruc.Ngay),
                            }}
                          >
                            <TableCell
                              align="center"
                              sx={{
                                whiteSpace: "normal",
                                verticalAlign: "top",
                              }}
                            >
                              <Chip
                                label={formatDayOfWeek(lichTruc.Ngay)}
                                size={isMobile ? "small" : "medium"}
                                color={
                                  dayjs(lichTruc.Ngay).day() === 0
                                    ? "error"
                                    : "primary"
                                }
                                variant={
                                  dayjs(lichTruc.Ngay).day() === 0
                                    ? "filled"
                                    : "outlined"
                                }
                              />
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{
                                whiteSpace: "normal",
                                verticalAlign: "top",
                              }}
                            >
                              {dayjs(lichTruc.Ngay).format("DD-MM-YYYY")}
                            </TableCell>
                            <TableCell
                              sx={{ minHeight: "60px", verticalAlign: "top" }}
                            >
                              {canEditRow(lichTruc.Ngay) ? (
                                <TextField
                                  label="Điều dưỡng trực"
                                  value={lichTruc.DieuDuong || ""}
                                  onChange={(e) =>
                                    handleInputChange(e, index, "DieuDuong")
                                  }
                                  variant="outlined"
                                  size="small"
                                  fullWidth
                                  multiline
                                  InputLabelProps={{ shrink: true }}
                                  sx={{
                                    "& .MuiOutlinedInput-root": {
                                      fontSize: {
                                        xs: "0.75rem",
                                        md: "0.875rem",
                                      },
                                      backgroundColor:
                                        theme.palette.background.paper,
                                    },
                                    "& .MuiInputLabel-root": {
                                      fontSize: { xs: "0.7rem", md: "0.8rem" },
                                      color: theme.palette.primary.main,
                                      fontWeight: "medium",
                                    },
                                  }}
                                />
                              ) : (
                                <Tooltip title="Không thể chỉnh sửa dữ liệu của những ngày trước ngày hiện tại hoặc khoa khác">
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                      padding: "2px",
                                      fontSize: {
                                        xs: "0.75rem",
                                        md: "0.875rem",
                                      },
                                      color: theme.palette.text.disabled,
                                      whiteSpace: "pre-wrap",
                                      minHeight: "60px",
                                      border: "1px solid",
                                      borderColor: "divider",
                                      borderRadius: 1,
                                      p: 1,
                                    }}
                                  >
                                    <LockOutlined
                                      fontSize="small"
                                      color="disabled"
                                    />
                                    <Box sx={{ flexGrow: 1 }}>
                                      {lichTruc.DieuDuong || "(Chưa có)"}
                                    </Box>
                                  </Box>
                                </Tooltip>
                              )}
                            </TableCell>
                            <TableCell
                              sx={{ minHeight: "60px", verticalAlign: "top" }}
                            >
                              {canEditRow(lichTruc.Ngay) ? (
                                <TextField
                                  label="Bác sĩ trực"
                                  value={lichTruc.BacSi || ""}
                                  onChange={(e) =>
                                    handleInputChange(e, index, "BacSi")
                                  }
                                  variant="outlined"
                                  size="small"
                                  fullWidth
                                  multiline
                                  InputLabelProps={{ shrink: true }}
                                  sx={{
                                    "& .MuiOutlinedInput-root": {
                                      fontSize: {
                                        xs: "0.75rem",
                                        md: "0.875rem",
                                      },
                                      backgroundColor:
                                        theme.palette.background.paper,
                                    },
                                    "& .MuiInputLabel-root": {
                                      fontSize: { xs: "0.7rem", md: "0.8rem" },
                                      color: theme.palette.primary.main,
                                      fontWeight: "medium",
                                    },
                                  }}
                                />
                              ) : (
                                <Tooltip title="Không thể chỉnh sửa dữ liệu của những ngày trước ngày hiện tại hoặc khoa khác">
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                      padding: "2px",
                                      fontSize: {
                                        xs: "0.75rem",
                                        md: "0.875rem",
                                      },
                                      color: theme.palette.text.disabled,
                                      whiteSpace: "pre-wrap",
                                      minHeight: "60px",
                                      border: "1px solid",
                                      borderColor: "divider",
                                      borderRadius: 1,
                                      p: 1,
                                    }}
                                  >
                                    <LockOutlined
                                      fontSize="small"
                                      color="disabled"
                                    />
                                    <Box sx={{ flexGrow: 1 }}>
                                      {lichTruc.BacSi || "(Chưa có)"}
                                    </Box>
                                  </Box>
                                </Tooltip>
                              )}
                            </TableCell>
                            <TableCell
                              sx={{ minHeight: "60px", verticalAlign: "top" }}
                            >
                              {canEditRow(lichTruc.Ngay) ? (
                                <TextField
                                  label="Ghi chú"
                                  value={lichTruc.GhiChu || ""}
                                  onChange={(e) =>
                                    handleInputChange(e, index, "GhiChu")
                                  }
                                  variant="outlined"
                                  size="small"
                                  fullWidth
                                  multiline
                                  InputLabelProps={{ shrink: true }}
                                  sx={{
                                    "& .MuiOutlinedInput-root": {
                                      fontSize: {
                                        xs: "0.75rem",
                                        md: "0.875rem",
                                      },
                                      backgroundColor:
                                        theme.palette.background.paper,
                                    },
                                    "& .MuiInputLabel-root": {
                                      fontSize: { xs: "0.7rem", md: "0.8rem" },
                                      color: theme.palette.primary.main,
                                      fontWeight: "medium",
                                    },
                                  }}
                                />
                              ) : (
                                <Tooltip title="Không thể chỉnh sửa dữ liệu của những ngày trước ngày hiện tại hoặc khoa khác">
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                      padding: "2px",
                                      fontSize: {
                                        xs: "0.75rem",
                                        md: "0.875rem",
                                      },
                                      color: theme.palette.text.disabled,
                                      whiteSpace: "pre-wrap",
                                      minHeight: "60px",
                                      border: "1px solid",
                                      borderColor: "divider",
                                      borderRadius: 1,
                                      p: 1,
                                    }}
                                  >
                                    <LockOutlined
                                      fontSize="small"
                                      color="disabled"
                                    />
                                    <Box sx={{ flexGrow: 1 }}>
                                      {lichTruc.GhiChu || "(Không có)"}
                                    </Box>
                                  </Box>
                                </Tooltip>
                              )}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ minWidth: "120px", verticalAlign: "top" }}
                            >
                              <Stack
                                direction="row"
                                spacing={1}
                                justifyContent="center"
                              >
                                <Tooltip title="Sao chép thông tin dòng này">
                                  <IconButton
                                    color="primary"
                                    size="small"
                                    onClick={() => handleCopyRow(index)}
                                    sx={{
                                      border: "1px solid",
                                      borderColor: theme.palette.primary.main,
                                      "&:hover": {
                                        backgroundColor: alpha(
                                          theme.palette.primary.main,
                                          0.1
                                        ),
                                      },
                                    }}
                                  >
                                    <ContentCopyIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                {canEditRow(lichTruc.Ngay) && (
                                  <Tooltip
                                    title={
                                      selectedRow
                                        ? "Dán thông tin vào dòng này"
                                        : "Chưa có dữ liệu để dán"
                                    }
                                  >
                                    <IconButton
                                      color="success"
                                      size="small"
                                      onClick={() => handlePasteRow(index)}
                                      disabled={!selectedRow}
                                      sx={{
                                        border: "1px solid",
                                        borderColor: selectedRow
                                          ? theme.palette.success.main
                                          : theme.palette.action.disabled,
                                        "&:hover": {
                                          backgroundColor: selectedRow
                                            ? alpha(
                                                theme.palette.success.main,
                                                0.1
                                              )
                                            : undefined,
                                        },
                                      }}
                                    >
                                      <ContentPasteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Stack>
                            </TableCell>
                          </TableRow>
                          {dayjs(lichTruc.Ngay).day() === 0 && (
                            <TableRow>
                              <TableCell colSpan={6}>
                                <Divider
                                  sx={{
                                    height: "2px",
                                    backgroundColor:
                                      theme.palette.primary.light,
                                    opacity: 0.5,
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Hiển thị chỉ dẫn cuộn ngang trên mobile */}
            {selectedKhoaId &&
              lichTrucList.length > 0 &&
              isMobile &&
              (canScrollLeft || canScrollRight) && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    mb: 2,
                    color: theme.palette.text.secondary,
                    fontSize: "0.75rem",
                    fontStyle: "italic",
                  }}
                >
                  <ArrowBackIos fontSize="small" /> Vuốt ngang để xem đầy đủ
                  bảng <ArrowForwardIos fontSize="small" />
                </Box>
              )}
          </Grid>
        </Grid>
      </Container>
    </MainCard>
  );
}

export default LichTrucTable;
