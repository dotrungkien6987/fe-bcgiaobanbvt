import React, { useState, useEffect, useRef } from "react";
import { 
  Stack, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  Input, 
  Divider, 
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { InsertOrUpdateBCGiaoBanByFromDateToDate, getDataBCGiaoBanByFromDateToDate } from "./bcgiaobanSlice";
import TrangThai from "./TrangThai";
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
  ContentPaste as ContentPasteIcon 
} from '@mui/icons-material';

function NgayTongTruc() {
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

  // Danh sách các năm để chọn (5 năm trước và 5 năm sau năm hiện tại)
  const years = Array.from(
    { length: 5 }, 
    (_, i) => dayjs().year() - 2 + i
  );

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
    { value: 12, label: "Tháng 12" }
  ];

  // Lấy thông tin người dùng hiện tại
  const { user } = useAuth();
  // Xác định người dùng là admin hay không
  const isAdmin = user?.PhanQuyen === 'admin';
  // Ngày hiện tại theo múi giờ Việt Nam
  const currentDate = dayjs().startOf('day');
  // Ngày hôm qua
  const yesterdayDate = dayjs().subtract(1, 'day').startOf('day');

  // Thêm state để theo dõi khả năng cuộn
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  // Ref cho container bảng
  const tableContainerRef = useRef(null);

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

  // Hàm xử lý khi thay đổi năm
  const handleYearChange = (event) => {
    const year = event.target.value;
    setSelectedYear(year);
    updateDateRangeByMonthYear(selectedMonth, year);
  };

  // Hàm xử lý khi thay đổi tháng
  const handleMonthChange = (event) => {
    const month = event.target.value;
    setSelectedMonth(month);
    updateDateRangeByMonthYear(month, selectedYear);
  };

  // Hàm cập nhật fromDate và toDate dựa trên tháng và năm
  const updateDateRangeByMonthYear = (month, year) => {
    // Cập nhật từ ngày (ngày đầu tháng)
    const firstDayOfMonth = dayjs()
      .year(year)
      .month(month - 1) // -1 vì dayjs tính tháng từ 0
      .startOf('month')
      .hour(7).minute(0).second(0).millisecond(0);
    
    // Cập nhật đến ngày (ngày cuối tháng)
    const lastDayOfMonth = dayjs()
      .year(year)
      .month(month - 1)
      .endOf('month')
      .hour(7).minute(0).second(0).millisecond(0);
    
    setFromDate(firstDayOfMonth);
    setToDate(lastDayOfMonth);
  };

  // Hàm chọn nhanh tháng hiện tại
  const selectCurrentMonth = () => {
    const now = dayjs();
    setSelectedMonth(now.month() + 1);
    setSelectedYear(now.year());
    updateDateRangeByMonthYear(now.month() + 1, now.year());
  };

  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { darkMode } = useSelector((state) => state.mytheme || { darkMode: false });

  useEffect(() => {
    const fromDateISO = fromDate.toISOString();
    const toDateISO = toDate.toISOString();
    dispatch(getDataBCGiaoBanByFromDateToDate(fromDateISO, toDateISO));
  }, [fromDate, toDate, dispatch]);
  
  const [tableData, setTableData] = useState([]);

  const { bcGiaoBans } = useSelector((state) => state.bcgiaoban);
  
  useEffect(() => {
    setTableData(bcGiaoBans);
  }, [bcGiaoBans]);

  // Kiểm tra khả năng cuộn
  const checkScroll = () => {
    if (tableContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tableContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5); // -5 là buffer nhỏ
    }
  };

  // Theo dõi sự kiện cuộn
  useEffect(() => {
    const container = tableContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      // Kiểm tra ban đầu
      checkScroll();
      
      // Thêm trình nghe cho resize window
      window.addEventListener('resize', checkScroll);
      
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [tableData]); // Chạy lại khi dữ liệu thay đổi
  
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
  };

  // Hàm kiểm tra có thể chỉnh sửa dòng không
  const canEditRow = (rowDate) => {
    if (!user) return false; // Chưa đăng nhập
    if (isAdmin) return true; // Admin có thể sửa tất cả
    
    // Đối với người dùng thường, chỉ có thể sửa dữ liệu từ ngày hôm qua trở đi
    const rowDateObj = dayjs(rowDate).startOf('day');
    return rowDateObj.isSame(yesterdayDate) || rowDateObj.isAfter(yesterdayDate);
  };

  const handleInputChange = (event, rowIndex, field) => {
    const value = event.target.value;
    const row = tableData[rowIndex];
    
    // Kiểm tra quyền chỉnh sửa
    if (!canEditRow(row.Ngay)) {
      return; // Không thể chỉnh sửa, bỏ qua
    }
    
    setTableData((prevTableData) => {
      const newTableData = [...prevTableData];
      newTableData[rowIndex] = { ...newTableData[rowIndex], [field]: value };
      return newTableData;
    });
  };
  
  const handleCapnhat = () => {
    dispatch(InsertOrUpdateBCGiaoBanByFromDateToDate(tableData));
  };

  const getWeekendColor = (thu) => {
    return thu === 'Chủ Nhật' || thu === 'Thứ Bảy' 
      ? { backgroundColor: alpha(theme.palette.primary.lighter, 0.3) }
      : {};
  };

  const alpha = (color, opacity) => {
    // Kiểm tra nếu color là undefined hoặc null
    if (!color) {
      return `rgba(0, 0, 0, ${opacity})`;
    }
    
    // Kiểm tra nếu color là chuỗi 'rgb' hoặc 'rgba'
    if (typeof color === 'string' && color.startsWith('rgb')) {
      return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
    }
    
    // Nếu color là mã hex hoặc tên màu, sử dụng rgba trực tiếp
    return `rgba(${theme.palette.primary.main}, ${opacity})`;
  };

  // State để lưu trữ dòng được sao chép
  const [selectedRow, setSelectedRow] = useState(null);

  // Hàm xử lý sao chép dữ liệu từ một dòng
  const handleCopyRow = (rowIndex) => {
    const row = tableData[rowIndex];
    setSelectedRow({
      TrucLanhDao: row.TrucLanhDao || '',
      TTHeNoi: row.TTHeNoi || '',
      TTHeNgoai: row.TTHeNgoai || '',
      DienNuoc: row.DienNuoc || '',
      LaiXe: row.LaiXe || ''
    });
  };

  // Hàm xử lý dán dữ liệu vào một dòng
  const handlePasteRow = (rowIndex) => {
    if (!selectedRow) return;
    
    const row = tableData[rowIndex];
    
    // Chỉ cho phép dán nếu có quyền chỉnh sửa dòng đó
    if (!canEditRow(row.Ngay)) {
      return;
    }
    
    setTableData(prevTableData => {
      const newTableData = [...prevTableData];
      newTableData[rowIndex] = { 
        ...newTableData[rowIndex], 
        TrucLanhDao: selectedRow.TrucLanhDao,
        TTHeNoi: selectedRow.TTHeNoi,
        TTHeNgoai: selectedRow.TTHeNgoai,
        DienNuoc: selectedRow.DienNuoc,
        LaiXe: selectedRow.LaiXe
      };
      return newTableData;
    });
  };

  return (
    <MainCard title="Lịch trực lãnh đạo - tổng trực" sx={{ height: '100%' }}>
      <Container maxWidth={false} disableGutters sx={{ p: 0, height: '100%' }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: { xs: 1.5, sm: 2, md: 3 },
                borderRadius: 2,
                background: darkMode ? theme.palette.background.default : theme.palette.background.paper,
                mb: 3
              }}
            >
              {/* Chọn nhanh tháng/năm */}
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                alignItems={{ xs: 'stretch', sm: 'center' }}
                justifyContent="space-between"
                mb={2}
              >
                {/* Card container cho bộ lọc tháng/năm trên mobile */}
                <Box 
                  sx={{ 
                    width: '100%',
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: { xs: 1.5, md: 2 },
                    borderRadius: 1,
                    p: { xs: 1.5, md: 0 },
                    ...(isMobile && {
                      background: theme.palette.mode === 'dark' 
                        ? alpha(theme.palette.primary.dark, 0.1)
                        : alpha(theme.palette.primary.lighter, 0.2),
                      border: '1px solid',
                      borderColor: theme.palette.mode === 'dark'
                        ? alpha(theme.palette.primary.main, 0.25)
                        : alpha(theme.palette.primary.main, 0.1)
                    })
                  }}
                >
                  {/* Header text for mobile */}
                  {isMobile && (
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        color: theme.palette.text.secondary,
                        fontWeight: 'medium',
                        mb: 0.5
                      }}
                    >
                      Chọn nhanh thời gian:
                    </Typography>
                  )}
                  
                  {/* Bộ chọn tháng/năm */}
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'row', md: 'row' }, 
                      gap: 1.5,
                      width: '100%',
                      flexWrap: { xs: 'wrap', md: 'nowrap' },
                      alignItems: 'center'
                    }}
                  >
                    <FormControl 
                      size={isMobile ? "small" : "medium"}
                      sx={{ 
                        minWidth: { xs: 'calc(50% - 0.75rem)', md: 120 },
                        flex: { xs: '1 0 auto', md: '0 0 auto' }
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
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: isMobile ? alpha(theme.palette.primary.main, 0.5) : undefined
                          }
                        }}
                      >
                        {months.map(month => (
                          <MenuItem key={month.value} value={month.value}>
                            {month.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <FormControl 
                      size={isMobile ? "small" : "medium"}
                      sx={{ 
                        minWidth: { xs: 'calc(50% - 0.75rem)', md: 100 },
                        flex: { xs: '1 0 auto', md: '0 0 auto' }
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
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: isMobile ? alpha(theme.palette.primary.main, 0.5) : undefined
                          }
                        }}
                      >
                        {years.map(year => (
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
                          flex: { xs: '1 1 100%', md: '0 0 auto' },
                          color: isMobile ? '#fff' : theme.palette.primary.main,
                          borderColor: theme.palette.primary.main,
                          boxShadow: isMobile ? 2 : 0,
                          '&:hover': {
                            backgroundColor: isMobile 
                              ? theme.palette.primary.dark 
                              : theme.palette.primary.lighter,
                            borderColor: theme.palette.primary.main
                          }
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
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                alignItems={{ xs: 'stretch', sm: 'center' }}
                justifyContent="space-between"
              >
                <Stack 
                  direction={{ xs: 'column', md: 'row' }} 
                  spacing={2} 
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', md: 'row' }, 
                      gap: 2,
                      width: '100%'
                    }}>
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
                                <CalendarMonthOutlined sx={{ color: theme.palette.primary.main, mr: 1 }} />
                              )
                            }
                          } 
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
                                <CalendarMonthOutlined sx={{ color: theme.palette.primary.main, mr: 1 }} />
                              )
                            }
                          } 
                        }}
                      />
                    </Box>
                  </LocalizationProvider>
                </Stack>

                <Button 
                  variant="contained" 
                  onClick={handleCapnhat} 
                  startIcon={<SaveOutlined />}
                  sx={{ 
                    minWidth: '120px',
                    py: { xs: 1, md: 1.5 },
                    alignSelf: { xs: 'stretch', sm: 'center' }
                  }}
                  // Vô hiệu hóa nút nếu người dùng không có quyền admin và không có dòng nào có thể chỉnh sửa
                  disabled={!isAdmin && !tableData.some(row => canEditRow(row.Ngay))}
                >
                  Cập nhật
                </Button>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            {/* Thêm nút điều hướng cuộn */}
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end',
                mb: 1,
                gap: 1
              }}
            >
              <IconButton
                size="small"
                color="primary"
                disabled={!canScrollLeft}
                onClick={scrollLeft}
                sx={{ 
                  display: { xs: 'flex', md: canScrollLeft ? 'flex' : 'none' },
                  border: '1px solid',
                  borderColor: 'divider'
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
                  display: { xs: 'flex', md: canScrollRight ? 'flex' : 'none' },
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <ArrowForwardIos fontSize="small" />
              </IconButton>
            </Box>
            
            {/* Điều chỉnh container bảng để hỗ trợ cuộn ngang */}
            <Box 
              sx={{ 
                position: 'relative',
                width: '100%'
              }}
            >
              <TableContainer 
                ref={tableContainerRef}
                component={Paper} 
                elevation={3}
                sx={{ 
                  borderRadius: 2,
                  overflow: 'auto',
                  mb: 3,
                  maxWidth: '100%',
                  '&::-webkit-scrollbar': {
                    height: '8px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? theme.palette.grey[700] 
                      : theme.palette.grey[400],
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? theme.palette.grey[900] 
                      : theme.palette.grey[100],
                  }
                }}
              >
                <Table sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow sx={{ 
                      backgroundColor: theme.palette.primary.main,
                      '& .MuiTableCell-root': {
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: { xs: '0.75rem', md: '0.875rem' },
                        whiteSpace: 'normal', // Cho phép xuống dòng ở header
                        wordBreak: 'break-word' // Ngắt từ khi cần thiết
                      }
                    }}>
                      <TableCell align="center" sx={{ minWidth: 100 }}>Thứ</TableCell>
                      <TableCell align="center" sx={{ minWidth: 120 }}>Ngày tháng</TableCell>
                      <TableCell align="center" sx={{ minWidth: 180 }}>Trực lãnh đạo</TableCell>
                      <TableCell align="center" sx={{ minWidth: 180 }}>Tổng trực hệ nội</TableCell>
                      <TableCell align="center" sx={{ minWidth: 180 }}>Tổng trực hệ ngoại</TableCell>
                      <TableCell align="center" sx={{ minWidth: 180 }}>Điện nước</TableCell>
                      <TableCell align="center" sx={{ minWidth: 180 }}>Lái xe</TableCell>
                      <TableCell align="center" sx={{ minWidth: 120 }}>Hành động</TableCell>
                      <TableCell align="center" sx={{ minWidth: 100 }}>Trạng thái</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tableData.map((row, index) => (
                      <React.Fragment key={`fragment-${index}`}>
                        <TableRow 
                          key={index} 
                          sx={{ 
                            '&:hover': { 
                              backgroundColor: alpha(theme.palette.primary.lighter, 0.1)
                            },
                            ...getWeekendColor(row.Thu)
                          }}
                        >
                          <TableCell align="center" sx={{ whiteSpace: 'normal', verticalAlign: 'top' }}>
                            <Chip 
                              label={row.Thu}
                              size={isMobile ? "small" : "medium"}
                              color={row.Thu === 'Chủ Nhật' ? "error" : "primary"}
                              variant={row.Thu === 'Chủ Nhật' ? "filled" : "outlined"}
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ whiteSpace: 'normal', verticalAlign: 'top' }}>
                            {dayjs(row.Ngay).format('DD-MM-YYYY')}
                          </TableCell>
                          <TableCell sx={{ minHeight: '60px', verticalAlign: 'top' }}>
                            {canEditRow(row.Ngay) ? (
                              <TextField
                                label="Trực lãnh đạo"
                                value={row.TrucLanhDao || ''}
                                onChange={(e) => handleInputChange(e, index, 'TrucLanhDao')}
                                variant="outlined"
                                size="small"
                                fullWidth
                                multiline
                                InputLabelProps={{ shrink: true }}
                                sx={{ 
                                  '& .MuiOutlinedInput-root': {
                                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                                    backgroundColor: theme.palette.background.paper,
                                  },
                                  '& .MuiInputLabel-root': {
                                    fontSize: { xs: '0.7rem', md: '0.8rem' },
                                    color: theme.palette.primary.main,
                                    fontWeight: 'medium',
                                  }
                                }}
                              />
                            ) : (
                              <Tooltip title="Không thể chỉnh sửa dữ liệu của những ngày trước ngày hiện tại">
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  gap: 1,
                                  padding: "2px",
                                  fontSize: { xs: '0.75rem', md: '0.875rem' },
                                  color: theme.palette.text.disabled,
                                  whiteSpace: 'pre-wrap',
                                  minHeight: '60px',
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  borderRadius: 1,
                                  p: 1
                                }}>
                                  <LockOutlined fontSize="small" color="disabled" />
                                  <Box sx={{ flexGrow: 1 }}>{row.TrucLanhDao || ''}</Box>
                                </Box>
                              </Tooltip>
                            )}
                          </TableCell>
                          <TableCell sx={{ minHeight: '60px', verticalAlign: 'top' }}>
                            {canEditRow(row.Ngay) ? (
                              <TextField
                                label="Tổng trực hệ nội"
                                value={row.TTHeNoi || ''}
                                onChange={(e) => handleInputChange(e, index, 'TTHeNoi')}
                                variant="outlined"
                                size="small"
                                fullWidth
                                multiline
                                InputLabelProps={{ shrink: true }}
                                sx={{ 
                                  '& .MuiOutlinedInput-root': {
                                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                                    backgroundColor: theme.palette.background.paper,
                                  },
                                  '& .MuiInputLabel-root': {
                                    fontSize: { xs: '0.7rem', md: '0.8rem' },
                                    color: theme.palette.primary.main,
                                    fontWeight: 'medium',
                                  }
                                }}
                              />
                            ) : (
                              <Tooltip title="Không thể chỉnh sửa dữ liệu của những ngày trước ngày hiện tại">
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  gap: 1,
                                  padding: "2px",
                                  fontSize: { xs: '0.75rem', md: '0.875rem' },
                                  color: theme.palette.text.disabled,
                                  whiteSpace: 'pre-wrap',
                                  minHeight: '60px',
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  borderRadius: 1,
                                  p: 1
                                }}>
                                  <LockOutlined fontSize="small" color="disabled" />
                                  <Box sx={{ flexGrow: 1 }}>{row.TTHeNoi || ''}</Box>
                                </Box>
                              </Tooltip>
                            )}
                          </TableCell>
                          <TableCell sx={{ minHeight: '60px', verticalAlign: 'top' }}>
                            {canEditRow(row.Ngay) ? (
                              <TextField
                                label="Tổng trực hệ ngoại"
                                value={row.TTHeNgoai || ''}
                                onChange={(e) => handleInputChange(e, index, 'TTHeNgoai')}
                                variant="outlined"
                                size="small"
                                fullWidth
                                multiline
                                InputLabelProps={{ shrink: true }}
                                sx={{ 
                                  '& .MuiOutlinedInput-root': {
                                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                                    backgroundColor: theme.palette.background.paper,
                                  },
                                  '& .MuiInputLabel-root': {
                                    fontSize: { xs: '0.7rem', md: '0.8rem' },
                                    color: theme.palette.primary.main,
                                    fontWeight: 'medium',
                                  }
                                }}
                              />
                            ) : (
                              <Tooltip title="Không thể chỉnh sửa dữ liệu của những ngày trước ngày hiện tại">
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  gap: 1,
                                  padding: "2px",
                                  fontSize: { xs: '0.75rem', md: '0.875rem' },
                                  color: theme.palette.text.disabled,
                                  whiteSpace: 'pre-wrap',
                                  minHeight: '60px',
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  borderRadius: 1,
                                  p: 1
                                }}>
                                  <LockOutlined fontSize="small" color="disabled" />
                                  <Box sx={{ flexGrow: 1 }}>{row.TTHeNgoai || ''}</Box>
                                </Box>
                              </Tooltip>
                            )}
                          </TableCell>
                          <TableCell sx={{ minHeight: '60px', verticalAlign: 'top' }}>
                            {canEditRow(row.Ngay) ? (
                              <TextField
                                label="Điện nước"
                                value={row.DienNuoc || ''}
                                onChange={(e) => handleInputChange(e, index, 'DienNuoc')}
                                variant="outlined"
                                size="small"
                                fullWidth
                                multiline
                                InputLabelProps={{ shrink: true }}
                                sx={{ 
                                  '& .MuiOutlinedInput-root': {
                                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                                    backgroundColor: theme.palette.background.paper,
                                  },
                                  '& .MuiInputLabel-root': {
                                    fontSize: { xs: '0.7rem', md: '0.8rem' },
                                    color: theme.palette.primary.main,
                                    fontWeight: 'medium',
                                  }
                                }}
                              />
                            ) : (
                              <Tooltip title="Không thể chỉnh sửa dữ liệu của những ngày trước ngày hiện tại">
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  gap: 1,
                                  padding: "2px",
                                  fontSize: { xs: '0.75rem', md: '0.875rem' },
                                  color: theme.palette.text.disabled,
                                  whiteSpace: 'pre-wrap',
                                  minHeight: '60px',
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  borderRadius: 1,
                                  p: 1
                                }}>
                                  <LockOutlined fontSize="small" color="disabled" />
                                  <Box sx={{ flexGrow: 1 }}>{row.DienNuoc || ''}</Box>
                                </Box>
                              </Tooltip>
                            )}
                          </TableCell>
                          <TableCell sx={{ minHeight: '60px', verticalAlign: 'top' }}>
                            {canEditRow(row.Ngay) ? (
                              <TextField
                                label="Lái xe"
                                value={row.LaiXe || ''}
                                onChange={(e) => handleInputChange(e, index, 'LaiXe')}
                                variant="outlined"
                                size="small"
                                fullWidth
                                multiline
                                InputLabelProps={{ shrink: true }}
                                sx={{ 
                                  '& .MuiOutlinedInput-root': {
                                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                                    backgroundColor: theme.palette.background.paper,
                                  },
                                  '& .MuiInputLabel-root': {
                                    fontSize: { xs: '0.7rem', md: '0.8rem' },
                                    color: theme.palette.primary.main,
                                    fontWeight: 'medium',
                                  }
                                }}
                              />
                            ) : (
                              <Tooltip title="Không thể chỉnh sửa dữ liệu của những ngày trước ngày hiện tại">
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  gap: 1,
                                  padding: "2px",
                                  fontSize: { xs: '0.75rem', md: '0.875rem' },
                                  color: theme.palette.text.disabled,
                                  whiteSpace: 'pre-wrap',
                                  minHeight: '60px',
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  borderRadius: 1,
                                  p: 1
                                }}>
                                  <LockOutlined fontSize="small" color="disabled" />
                                  <Box sx={{ flexGrow: 1 }}>{row.LaiXe || ''}</Box>
                                </Box>
                              </Tooltip>
                            )}
                          </TableCell>
                          <TableCell align="center" sx={{ minWidth: '120px', verticalAlign: 'top' }}>
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <Tooltip title="Sao chép thông tin dòng này">
                                <IconButton
                                  color="primary"
                                  size="small"
                                  onClick={() => handleCopyRow(index)}
                                  sx={{
                                    border: '1px solid',
                                    borderColor: theme.palette.primary.main,
                                    '&:hover': {
                                      backgroundColor: alpha(theme.palette.primary.main, 0.1)
                                    }
                                  }}
                                >
                                  <ContentCopyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {canEditRow(row.Ngay) && (
                                <Tooltip title={selectedRow ? "Dán thông tin vào dòng này" : "Chưa có dữ liệu để dán"}>
                                  <IconButton
                                    color="success"
                                    size="small"
                                    onClick={() => handlePasteRow(index)}
                                    disabled={!selectedRow}
                                    sx={{
                                      border: '1px solid',
                                      borderColor: selectedRow ? theme.palette.success.main : theme.palette.action.disabled,
                                      '&:hover': {
                                        backgroundColor: selectedRow ? alpha(theme.palette.success.main, 0.1) : undefined
                                      }
                                    }}
                                  >
                                    <ContentPasteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell align="center" sx={{ whiteSpace: 'normal', verticalAlign: 'top' }}>
                            <TrangThai trangthai={row.TrangThai} />
                          </TableCell>
                        </TableRow>
                        {row.Thu === 'Chủ Nhật' && (
                          <TableRow>
                            <TableCell colSpan={9}>
                              <Divider sx={{ 
                                height: '2px', 
                                backgroundColor: theme.palette.primary.light,
                                opacity: 0.5
                              }} />
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            
            {/* Hiển thị chỉ dẫn cuộn ngang trên mobile */}
            {isMobile && (canScrollLeft || canScrollRight) && (
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  mb: 2,
                  color: theme.palette.text.secondary,
                  fontSize: '0.75rem',
                  fontStyle: 'italic'
                }}
              >
                <ArrowBackIos fontSize="small" /> Vuốt ngang để xem đầy đủ bảng <ArrowForwardIos fontSize="small" />
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </MainCard>
  );
}

export default NgayTongTruc;
