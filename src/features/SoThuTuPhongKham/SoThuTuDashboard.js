import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
  CircularProgress,
  Button,
  Alert,
  useTheme,
  Tooltip,
  Chip,
  IconButton,
  AppBar,
  Toolbar
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import RefreshIcon from '@mui/icons-material/Refresh';
import AutorenewIcon from '@mui/icons-material/Autorenew';

import { 
  getAllNhomKhoa, 
  selectNhomKhoaList, 
  selectNhomKhoaLoading
} from '../Slice/nhomkhoasothutuSlice';
import {
  getSoThuTuPhongKham,
  getSoThuTuPhongThucHien,
  getSoThuTuPhongLayMau,
  getAllSoThuTuStats,
  selectSoThuTuPhongKham,
  selectSoThuTuPhongThucHien,
  selectSoThuTuPhongLayMau,
  selectSoThuTuLoading,
  selectSoThuTuError,
  resetSoThuTuState
} from '../Slice/soThuTuSlice';

import SoThuTuDataCard from './SoThuTuDataCard';
import SoThuTuSummaryCard from './SoThuTuSummaryCard';

// Configure dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('vi');

const AUTO_REFRESH_INTERVAL = 60000; // 1 phút

const SoThuTuDashboard = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  // Selectors for data fetching
  const nhomKhoaList = useSelector(selectNhomKhoaList);
  const nhomKhoaLoading = useSelector(selectNhomKhoaLoading);
  const phongKhamData = useSelector(selectSoThuTuPhongKham);
  const phongThucHienData = useSelector(selectSoThuTuPhongThucHien);
  const phongLayMauData = useSelector(selectSoThuTuPhongLayMau);
  const isLoading = useSelector(selectSoThuTuLoading);
  const error = useSelector(selectSoThuTuError);

  // State hooks for form elements
  const [selectedDate, setSelectedDate] = useState(dayjs().tz('Asia/Ho_Chi_Minh'));
  const [selectedNhomKhoa, setSelectedNhomKhoa] = useState('');
  const [roomTypes, setRoomTypes] = useState({
    phongKham: true,
    phongThucHien: true,
    phongLayMau: true
  });
  const [departmentIds, setDepartmentIds] = useState([]);
  
  // State để lưu trữ dữ liệu cũ khi đang tải dữ liệu mới
  const [cachedData, setCachedData] = useState({
    phongKham: [],
    phongThucHien: [],
    phongLayMau: []
  });
  
  // State để theo dõi thời gian cập nhật dữ liệu
  const [lastUpdatedTime, setLastUpdatedTime] = useState(null);
  const [nextUpdateTime, setNextUpdateTime] = useState(null);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(AUTO_REFRESH_INTERVAL / 1000);
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(true);
  const [isCurrentDate, setIsCurrentDate] = useState(true); // Trạng thái để kiểm tra xem đang xem ngày hiện tại hay không
  
  // Ref để giữ timer ID
  const autoRefreshTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);
  const isInitialFetchRef = useRef(true);

  // Fetch initial data
  useEffect(() => {
    dispatch(getAllNhomKhoa());
  }, [dispatch]);

  // Handle changes when selecting a different group
  useEffect(() => {
    if (selectedNhomKhoa && nhomKhoaList.length > 0) {
      const selectedGroup = nhomKhoaList.find(item => item._id === selectedNhomKhoa);
      if (selectedGroup) {
        // Extract department IDs from the selected group
        const ids = selectedGroup.DanhSachKhoa
          .filter(khoa => khoa.KhoaID && khoa.KhoaID.HisDepartmentID)
          .map(khoa => khoa.KhoaID.HisDepartmentID.toString());
        
        setDepartmentIds(ids);

        // Automatically load data if we have department IDs
        if (ids.length > 0) {
          fetchData(true);
        }
      }
    }
  }, [selectedNhomKhoa, nhomKhoaList]);

  // Cập nhật cache khi có dữ liệu mới
  useEffect(() => {
    if (!isLoading) {
      // Chỉ cập nhật cache nếu có dữ liệu mới
      const newCache = { ...cachedData };
      
      if (phongKhamData && phongKhamData.length > 0) {
        newCache.phongKham = phongKhamData;
      }
      
      if (phongThucHienData && phongThucHienData.length > 0) {
        newCache.phongThucHien = phongThucHienData;
      }
      
      if (phongLayMauData && phongLayMauData.length > 0) {
        newCache.phongLayMau = phongLayMauData;
      }
      
      setCachedData(newCache);
      
      // Cập nhật timestamp
      if (!isInitialFetchRef.current && (phongKhamData.length > 0 || phongThucHienData.length > 0 || phongLayMauData.length > 0)) {
        setLastUpdatedTime(new Date());
        const nextTime = new Date();
        nextTime.setTime(nextTime.getTime() + AUTO_REFRESH_INTERVAL);
        setNextUpdateTime(nextTime);
      } else {
        isInitialFetchRef.current = false;
      }
    }
  }, [isLoading, phongKhamData, phongThucHienData, phongLayMauData]);

  // Thiết lập auto refresh timer
  useEffect(() => {
    const setupAutoRefresh = () => {
      // Chỉ thiết lập auto-refresh nếu isAutoRefreshEnabled=true VÀ đang xem ngày hiện tại VÀ có departmentIds
      if (isAutoRefreshEnabled && isCurrentDate && departmentIds.length > 0) {
        // Xóa timer cũ nếu có
        if (autoRefreshTimerRef.current) {
          clearInterval(autoRefreshTimerRef.current);
        }
        
        // Thiết lập timer mới
        autoRefreshTimerRef.current = setInterval(() => {
          fetchData(false);
        }, AUTO_REFRESH_INTERVAL);
        
        // Thiết lập timer đếm ngược
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
        }
        
        setSecondsUntilRefresh(AUTO_REFRESH_INTERVAL / 1000);
        countdownTimerRef.current = setInterval(() => {
          setSecondsUntilRefresh(prev => {
            if (prev <= 1) {
              return AUTO_REFRESH_INTERVAL / 1000;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        // Hủy timer nếu auto refresh bị tắt HOẶC không phải ngày hiện tại
        if (autoRefreshTimerRef.current) {
          clearInterval(autoRefreshTimerRef.current);
          autoRefreshTimerRef.current = null;
        }
        
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
      }
    };
    
    setupAutoRefresh();
    
    // Cleanup khi component unmount
    return () => {
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [isAutoRefreshEnabled, departmentIds, isCurrentDate]);

  // Fetch data based on current selections
  const fetchData = (resetData = true) => {
    if (!selectedDate || departmentIds.length === 0) return;
    
    // Reset previous data only if requested
    if (resetData) {
      dispatch(resetSoThuTuState());
    }

    const date = selectedDate.format('YYYY-MM-DD');
    
    // Either fetch all room types or specific ones based on roomTypes state
    if (roomTypes.phongKham && roomTypes.phongThucHien && roomTypes.phongLayMau) {
      dispatch(getAllSoThuTuStats(date, departmentIds));
    } else {
      if (roomTypes.phongKham) {
        dispatch(getSoThuTuPhongKham(date, departmentIds));
      }
      if (roomTypes.phongThucHien) {
        dispatch(getSoThuTuPhongThucHien(date, departmentIds));
      }
      if (roomTypes.phongLayMau) {
        dispatch(getSoThuTuPhongLayMau(date, departmentIds));
      }
    }
  };

  // Handle date change
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    
    // Kiểm tra xem ngày được chọn có phải là ngày hiện tại không
    const today = dayjs().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    const selectedDay = newDate.format('YYYY-MM-DD');
    const isToday = today === selectedDay;
    
    // Cập nhật trạng thái
    setIsCurrentDate(isToday);
    
    // Nếu không phải ngày hiện tại thì tắt auto-refresh
    if (!isToday) {
      setIsAutoRefreshEnabled(false);
    }
    
    // Khi thay đổi ngày, cần cập nhật dữ liệu
    if (departmentIds.length > 0) {
      fetchData(true);
    }
  };

  // Handle nhom khoa change
  const handleNhomKhoaChange = (e) => {
    setSelectedNhomKhoa(e.target.value);
  };

  // Toggle auto refresh
  const toggleAutoRefresh = () => {
    // Chỉ cho phép bật auto-refresh khi đang xem ngày hiện tại
    if (!isCurrentDate && !isAutoRefreshEnabled) {
      return; // Không cho phép bật auto-refresh khi không phải ngày hiện tại
    }
    setIsAutoRefreshEnabled(!isAutoRefreshEnabled);
  };

  // Manual refresh button handler
  const handleManualRefresh = () => {
    fetchData(false);
    // Reset countdown timer
    setSecondsUntilRefresh(AUTO_REFRESH_INTERVAL / 1000);
  };

  // Calculate total patient count for a data set
  const calculateTotal = (data) => {
    if (!data || data.length === 0) return 0;
    return data.reduce((total, item) => total + (Number(item.tong_benh_nhan) || 
                                               Number(item.patientCount) || 
                                               Number(item.tong_ca) || 
                                               Number(item.count) || 0), 0);
  };
  
  // Format time function
  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Quyết định hiển thị dữ liệu từ cache hoặc từ state
  const displayData = {
    phongKham: isLoading && cachedData.phongKham.length > 0 ? cachedData.phongKham : phongKhamData,
    phongThucHien: isLoading && cachedData.phongThucHien.length > 0 ? cachedData.phongThucHien : phongThucHienData,
    phongLayMau: isLoading && cachedData.phongLayMau.length > 0 ? cachedData.phongLayMau : phongLayMauData
  };

  return (
    <Box 
      sx={{ 
        height: '100vh', 
        width: '100%', 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* AppBar with Toolbar - Contains date picker and group selector */}
      <AppBar position="static" sx={{ boxShadow: theme.shadows[2] }}>
        <Toolbar sx={{ padding: '4px 16px', height: 'auto', minHeight: '72px' }}>
          <Typography 
            variant="h6" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              flexGrow: 0, 
              mr: 2,
              whiteSpace: 'nowrap'
            }}
          >
           Dữ liệu các phòng
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            bgcolor: 'background.paper', 
            borderRadius: 1, 
            p: 0.5,
            mr: 2,
            width: 240,
            flexShrink: 0
          }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Ngày"
                value={selectedDate}
                onChange={handleDateChange}
                slotProps={{ 
                  textField: { 
                    fullWidth: true,
                    variant: 'outlined',
                    size: 'small',
                    sx: { bgcolor: 'background.paper', borderRadius: 1 }
                  } 
                }}
              />
            </LocalizationProvider>
          </Box>
          
          <Box sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            alignItems: 'center',
            bgcolor: 'background.paper', 
            borderRadius: 1, 
            p: 0.5,
            minWidth: 300,
            maxWidth: 450,
            flexShrink: 0
          }}>
            <FormControl 
              fullWidth 
              variant="outlined" 
              size="small"
            >
              <InputLabel id="nhom-khoa-select-label" 
                sx={{ 
                  color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.primary.main, 
                  fontWeight: 500,
                  '&.Mui-focused': {
                    color: theme.palette.primary.main,
                    fontWeight: 600
                  }
                }}
              >
                Nhóm Khoa
              </InputLabel>
              <Select
                labelId="nhom-khoa-select-label"
                value={selectedNhomKhoa}
                onChange={handleNhomKhoaChange}
                label="Nhóm Khoa"
                disabled={nhomKhoaLoading}
                sx={{
                  color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit',
                  '.MuiSelect-icon': {
                    color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: '2px',
                  }
                }}
              >
                {nhomKhoaList.map((nhomKhoa) => (
                  <MenuItem key={nhomKhoa._id} value={nhomKhoa._id}>
                    {nhomKhoa.TenNhom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', ml: 2 }}>
            {lastUpdatedTime && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mr: 1,
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                borderRadius: '8px',
                padding: '4px 10px',
                border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : 'none',
              }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    mr: 1, 
                    fontWeight: 600, 
                    color: '#fff',
                    textShadow: '0px 1px 1px rgba(0,0,0,0.3)',
                    letterSpacing: '0.5px',
                    fontSize: '0.75rem'
                  }}
                >
                  Cập nhật: {formatTime(lastUpdatedTime)}
                </Typography>
                
                <Tooltip title={isAutoRefreshEnabled ? "Tự động cập nhật mỗi phút" : "Đã tắt tự động cập nhật"}>
                  <Chip 
                    size="small"
                    icon={
                      <AutorenewIcon 
                        fontSize="small" 
                        sx={{ 
                          color: isAutoRefreshEnabled ? '#0d6f0d' : '#fff',
                          animation: isAutoRefreshEnabled ? 'spin 4s linear infinite' : 'none',
                          '@keyframes spin': {
                            '0%': { transform: 'rotate(0deg)' },
                            '100%': { transform: 'rotate(360deg)' }
                          }
                        }} 
                      />
                    }
                    label={isAutoRefreshEnabled ? `${secondsUntilRefresh}s` : "Tắt"}
                    onClick={toggleAutoRefresh}
                    sx={{ 
                      cursor: 'pointer', 
                      fontWeight: 'bold',
                      backgroundColor: isAutoRefreshEnabled 
                        ? theme.palette.mode === 'dark' ? '#1b5e20' : '#e8f5e9' 
                        : theme.palette.mode === 'dark' ? '#b71c1c' : '#f44336',
                      color: isAutoRefreshEnabled 
                        ? theme.palette.mode === 'dark' ? '#ffffff' : '#0d6f0d' 
                        : '#fff',
                      border: isAutoRefreshEnabled 
                        ? theme.palette.mode === 'dark' ? '1px solid #4caf50' : '1px solid #81c784' 
                        : 'none',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: isAutoRefreshEnabled 
                          ? theme.palette.mode === 'dark' ? '#2e7d32' : '#c8e6c9' 
                          : theme.palette.mode === 'dark' ? '#d32f2f' : '#ef5350',
                        transform: 'scale(1.05)'
                      }
                    }}
                  />
                </Tooltip>
              </Box>
            )}
            
            <Tooltip title="Cập nhật dữ liệu ngay">
              <IconButton 
                onClick={handleManualRefresh} 
                disabled={isLoading || !departmentIds.length}
                sx={{ 
                  color: '#fff',
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(25, 118, 210, 0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  ml: 1,
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(25, 118, 210, 0.3)',
                    transform: 'scale(1.05)'
                  },
                  '&.Mui-disabled': {
                    color: 'rgba(255,255,255,0.4)',
                    backgroundColor: 'rgba(255,255,255,0.05)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {isLoading ? (
                  <CircularProgress size={20} thickness={4} sx={{ color: '#fff' }} />
                ) : (
                  <RefreshIcon />
                )}
              </IconButton>
            </Tooltip>
            
            {error && (
              <Tooltip title={error}>
                <Chip
                  label="Lỗi"
                  color="error"
                  size="small"
                  variant="outlined"
                  sx={{ 
                    ml: 1, 
                    fontWeight: 'bold',
                    border: '1px solid #f44336',
                    color: '#fff',
                    backgroundColor: 'rgba(244, 67, 54, 0.7)',
                    '&:hover': {
                      backgroundColor: 'rgba(244, 67, 54, 0.9)',
                    }
                  }}
                />
              </Tooltip>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Display error if any */}
      {error && (
        <Alert severity="error" sx={{ borderRadius: 0 }}>
          {error}
        </Alert>
      )}
      
      {/* Main Content Area - with Scrolling */}
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto',
        p: 2,
        bgcolor: theme.palette.background.default
      }}>
        {/* Loading indicator - Small badge when refreshing with cached data */}
        {isLoading && cachedData.phongKham.length + cachedData.phongThucHien.length + cachedData.phongLayMau.length > 0 && (
          <Box sx={{ 
            position: 'absolute', 
            top: 80, 
            right: 20, 
            zIndex: 1000, 
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            p: 0.5,
            borderRadius: 1,
            boxShadow: 1
          }}>
            <CircularProgress size={16} />
            <Typography variant="caption" sx={{ ml: 1 }}>
              Đang cập nhật...
            </Typography>
          </Box>
        )}
        
        {/* Detailed data cards */}
        <Grid container spacing={2}>
          {/* Phòng khám data */}
          {roomTypes.phongKham && displayData.phongKham.length > 0 && (
            <Grid item xs={12} lg={roomTypes.phongThucHien || roomTypes.phongLayMau ? 6 : 12}>
              <SoThuTuDataCard
                title="Dữ liệu Phòng khám (Type 2)"
                data={displayData.phongKham}
                type="phongKham"
                backgroundColor="#e3f2fd"
                isLoading={isLoading && cachedData.phongKham.length === 0}
              />
            </Grid>
          )}
          
          {/* Phòng thực hiện data */}
          {roomTypes.phongThucHien && displayData.phongThucHien.length > 0 && (
            <Grid item xs={12} lg={roomTypes.phongKham || roomTypes.phongLayMau ? 6 : 12}>
              <SoThuTuDataCard
                title="Dữ liệu Phòng thực hiện (Type 7)"
                data={displayData.phongThucHien}
                type="phongThucHien"
                backgroundColor="#e8f5e9"
                isLoading={isLoading && cachedData.phongThucHien.length === 0}
              />
            </Grid>
          )}
          
          {/* Phòng lấy mẫu data */}
          {roomTypes.phongLayMau && displayData.phongLayMau.length > 0 && (
            <Grid item xs={12} lg={roomTypes.phongKham || roomTypes.phongThucHien ? 6 : 12}>
              <SoThuTuDataCard
                title="Dữ liệu Phòng lấy mẫu (Type 38)"
                data={displayData.phongLayMau}
                type="phongLayMau"
                backgroundColor="#fff8e1"
                isLoading={isLoading && cachedData.phongLayMau.length === 0}
              />
            </Grid>
          )}
          
          {/* Empty state */}
          {!isLoading && 
          displayData.phongKham.length === 0 && 
          displayData.phongThucHien.length === 0 && 
          displayData.phongLayMau.length === 0 && (
            <Grid item xs={12}>
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  p: 6, 
                  bgcolor: theme.palette.background.paper, 
                  borderRadius: 2,
                  border: `1px dashed ${theme.palette.divider}`
                }}
              >
                <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
                  Chọn Nhóm Khoa để xem thông tin
                </Typography>
              </Box>
            </Grid>
          )}
          
          {/* First-time Loading state */}
          {isLoading && 
          cachedData.phongKham.length === 0 && 
          cachedData.phongThucHien.length === 0 && 
          cachedData.phongLayMau.length === 0 && (
            <Grid item xs={12}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  p: 6 
                }}
              >
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>
                  Đang tải dữ liệu...
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default SoThuTuDashboard;