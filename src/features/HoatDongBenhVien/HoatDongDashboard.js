import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Stack,
  Typography,
  Button,
  Alert,
  useTheme,
  Tooltip,
  Chip,
  Autocomplete,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Link
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import HotelOutlinedIcon from '@mui/icons-material/HotelOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';

import { 
  getAllNhomKhoa, 
  selectNhomKhoaList, 
  selectNhomKhoaLoading
} from '../Slice/nhomkhoasothutuSlice';

// Import redux actions và selectors từ soThuTuSlice
import {
  getSoThuTuPhongKham,
  getSoThuTuPhongThucHien,
  getSoThuTuPhongLayMau,
  getSoThuTuPhongNoiTru,
  resetSoThuTuState,
  selectSoThuTuPhongKham,
  selectSoThuTuPhongThucHien,
  selectSoThuTuPhongLayMau,
  selectSoThuTuPhongNoiTru,
  selectSoThuTuLoading,
  selectSoThuTuError
} from '../Slice/soThuTuSlice';

// Add lichtrucSlice imports for handling scheduling data
import {
  getLichTrucByDate,
  selectLichTrucList
} from '../Slice/lichtrucSlice';

// Import các thành phần của module HoatDongBenhVien
import HoatDongDataCard from './HoatDongDataCard';
import AbbreviationChips from './components/AbbreviationChips';
import SourceCountBadge from './components/SourceCountBadge';

// Configure dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('vi');

const HoatDongDashboard = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
    // Selectors cho việc lấy dữ liệu
  const nhomKhoaList = useSelector(selectNhomKhoaList);
  const nhomKhoaLoading = useSelector(selectNhomKhoaLoading);
  
  // Selectors cho dữ liệu số thứ tự
  const phongKhamData = useSelector(selectSoThuTuPhongKham);
  const phongThucHienData = useSelector(selectSoThuTuPhongThucHien);
  const phongLayMauData = useSelector(selectSoThuTuPhongLayMau);
  const phongNoiTruData = useSelector(selectSoThuTuPhongNoiTru);
  const isDataLoading = useSelector(selectSoThuTuLoading);
  const dataError = useSelector(selectSoThuTuError);  // Selector cho lịch trực - để hiển thị thông tin lịch trực theo khoa
  const lichTrucData = useSelector(selectLichTrucList) || [];
  // State cho các thành phần form
  const [selectedDate, setSelectedDate] = useState(dayjs().tz('Asia/Ho_Chi_Minh'));
  const [selectedNhomKhoa, setSelectedNhomKhoa] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activityTypes, setActivityTypes] = useState({
    chung: true,  // Hiển thị thông tin chung
    noiTru: true, // Phòng nội trú (Type 3)
    ngoaiTru: true, // Phòng khám (Type 2)
    thucHien: true, // Phòng thực hiện (Type 7)
    layMau: true   // Phòng lấy mẫu (Type 38)
  });
  const [departmentIds, setDepartmentIds] = useState([]);
  // Refs cho DataCards - để reset scroll
  const chungCardRef = useRef(null);
  const noiTruCardRef = useRef(null);
  const ngoaiTruCardRef = useRef(null);
  const thucHienCardRef = useRef(null);
  
  // State để kiểm soát tải dữ liệu và lỗi
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [layoutMode, setLayoutMode] = useState('compact'); // 'compact' hoặc 'expanded'
  
  // Khi component mount, lấy danh sách nhóm khoa
  useEffect(() => {
    dispatch(getAllNhomKhoa());
  }, [dispatch]);  // Hàm lấy dữ liệu hoạt động bệnh viện
  const fetchHoatDongBenhVien = useCallback(async () => {
    try {
      // Kiểm tra xem có điều kiện cần thiết để fetch không
      if (!(selectedNhomKhoa || departmentIds.length > 0)) {
        return; // Không fetch nếu không có nhóm khoa hoặc danh sách khoa
      }
      
      setIsLoading(true);
      setError(null);
      
      // Format ngày theo đúng định dạng yêu cầu của API
      const formattedDate = selectedDate.format('YYYY-MM-DD');
      
      // Reset state trước khi lấy dữ liệu mới
      dispatch(resetSoThuTuState());
      
      // Lấy dữ liệu lịch trực cho ngày được chọn - ưu tiên tải trước tiên
      // Sử dụng Promise để có thể đảm bảo việc tải lịch trực xong trước
      const lichTrucPromise = dispatch(getLichTrucByDate(formattedDate));
      
      // Đặt timeout dài hơn để đảm bảo lichTruc có thời gian được xử lý
      setTimeout(() => {
        // Tải các dữ liệu khác sau khi đã cho lichTruc khởi động trước
        if (activityTypes.ngoaiTru) {
          // Type 2: Phòng khám (Outpatient)
          dispatch(getSoThuTuPhongKham(formattedDate, departmentIds.length > 0 ? departmentIds : null));
        }
        
        if (activityTypes.noiTru) {
          // Type 3: Phòng nội trú (Inpatient)
          dispatch(getSoThuTuPhongNoiTru(formattedDate, departmentIds.length > 0 ? departmentIds : null));
        }
        
        if (activityTypes.thucHien) {
          // Type 7: Phòng thực hiện (Procedure)
          dispatch(getSoThuTuPhongThucHien(formattedDate, departmentIds.length > 0 ? departmentIds : null));
        }
        
        if (activityTypes.layMau) {
          // Type 38: Phòng lấy mẫu (Sample collection)
          dispatch(getSoThuTuPhongLayMau(formattedDate, departmentIds.length > 0 ? departmentIds : null));
        }
      }, 700); // Tăng lên 700ms để đảm bảo lichTruc được xử lý trước
      
      // Cập nhật thời gian lấy dữ liệu mới nhất
      setLastUpdated(dayjs().format('HH:mm:ss'));
    } catch (err) {
      console.error('Lỗi khi lấy dữ liệu hoạt động bệnh viện:', err);
      setError('Không thể lấy dữ liệu hoạt động bệnh viện. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, departmentIds, activityTypes, dispatch, selectedNhomKhoa]);
  // Cập nhật danh sách khoa khi chọn nhóm khoa - không gọi API
  useEffect(() => {
    if (selectedNhomKhoa && nhomKhoaList.length > 0) {
      const selectedGroup = nhomKhoaList.find(item => item._id === selectedNhomKhoa);
      if (selectedGroup) {
        // Extract department IDs from the selected group
        const ids = selectedGroup.DanhSachKhoa
          .filter(khoa => khoa.KhoaID && khoa.KhoaID.HisDepartmentID)
          .map(khoa => khoa.KhoaID.HisDepartmentID.toString());
        
        // Chỉ cập nhật departmentIds mà không gọi fetch
        setDepartmentIds(ids);
      }
    }
  }, [selectedNhomKhoa, nhomKhoaList]);
  
  // Dùng một flag để theo dõi xem có nên fetch dữ liệu hay không
  const [shouldFetchData, setShouldFetchData] = useState(false);
  
  // Đánh dấu cần fetch dữ liệu khi có điều kiện thay đổi
  useEffect(() => {
    // Chỉ đánh dấu cần fetch khi có nhóm khoa hoặc danh sách khoa cụ thể
    if (selectedNhomKhoa || departmentIds.length > 0) {
      setShouldFetchData(true);
    }
  }, [selectedDate, selectedNhomKhoa, departmentIds, activityTypes]);
  
  // Thực hiện fetch dữ liệu khi có flag và không đang trong quá trình loading
  useEffect(() => {
    if (shouldFetchData && !isLoading) {
      fetchHoatDongBenhVien();
      setShouldFetchData(false); // Reset flag sau khi đã fetch
    }
  }, [shouldFetchData, isLoading, fetchHoatDongBenhVien]);
    // Cập nhật state data khi redux data thay đổi
  useEffect(() => {
    // Cập nhật trạng thái loading và error từ Redux
    setIsLoading(isDataLoading);
    if (dataError) {
      setError(dataError);
    }
  }, [isDataLoading, dataError]);
  
  // Hàm xử lý khi thay đổi chế độ hiển thị
  const handleLayoutModeChange = (event, newMode) => {
    if (newMode !== null) {
      setLayoutMode(newMode);
    }
  };
    // Hàm xử lý khi thay đổi loại hoạt động
  const handleActivityTypeChange = (type) => {
    setActivityTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
    
    // Nếu đã có departmentIds hoặc nhóm khoa, kích hoạt fetch lại dữ liệu với loại hoạt động mới
    if (departmentIds.length > 0 || selectedNhomKhoa) {
      // Đợi để UI cập nhật trước khi fetch
      setTimeout(() => setShouldFetchData(true), 100);
    }
  };
    // Hàm xử lý khi thay đổi nhóm khoa
  const handleNhomKhoaChange = (event, newValue) => {
    if (newValue) {
      setSelectedNhomKhoa(newValue._id);
      console.log('Selected:', newValue.TenNhom);
    } else {
      setSelectedNhomKhoa('');
      setDepartmentIds([]);
    }
  };  // Không cần hàm này nữa vì chúng ta sử dụng nhóm khoa thay vì chọn khoa trực tiếp
  /* 
  // Hàm xử lý khi thay đổi danh sách khoa cụ thể
  const handleDepartmentChange = (event, newValue) => {
    const ids = newValue.map(item => item.KhoaID?.HisDepartmentID?.toString()).filter(Boolean);
    setDepartmentIds(ids);
  };
  */
    
  // Lưu trữ danh sách các khoa phòng từ nhóm khoa đã chọn (để hiển thị UI)
  // Không cần thiết gọi API, chỉ dùng để render UI
  const filteredDepartments = React.useMemo(() => {
    return selectedNhomKhoa ? 
      nhomKhoaList.find(group => group._id === selectedNhomKhoa)?.DanhSachKhoa || [] 
      : [];
  }, [selectedNhomKhoa, nhomKhoaList]);
    return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      {/* Thanh công cụ tìm kiếm */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 2, 
          mb: 2, 
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Chọn ngày */}
          <Grid item xs={12} sm={6} md={2}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
              <DatePicker
                label="Ngày"
                value={selectedDate}
                onChange={(newDate) => setSelectedDate(newDate)}
                renderInput={(params) => <TextField {...params} fullWidth />}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small"
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
            {/* Chọn nhóm khoa */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              bgcolor: 'background.paper', 
              borderRadius: 1, 
              p: 0.5,
              width: '100%'
            }}>
              <Autocomplete
                id="nhom-khoa-select"
                options={nhomKhoaList}
                getOptionLabel={(option) => option.TenNhom}
                value={nhomKhoaList.find(item => item._id === selectedNhomKhoa) || null}
                onChange={handleNhomKhoaChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Nhóm khoa"
                    variant="outlined"
                    size="small"
                    sx={{
                      bgcolor: 'background.paper',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: '2px',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        backgroundColor: 'background.paper',
                        px: 0.5,
                        color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.primary.main,
                        fontWeight: 500,
                        '&.Mui-focused': {
                          color: theme.palette.primary.main,
                          fontWeight: 600
                        }
                      }
                    }}
                  />
                )}
                loading={nhomKhoaLoading}
                loadingText="Đang tải..."
                noOptionsText="Không có nhóm khoa"
                disabled={nhomKhoaLoading}
                sx={{
                  width: '100%',
                  '& .MuiAutocomplete-endAdornment': {
                    color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit',
                  }
                }}
              />
            </Box>
          </Grid>            {/* Chọn khoa cụ thể */}
          <Grid item xs={12} sm={12} md={4}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              bgcolor: 'background.paper', 
              borderRadius: 1, 
              p: 0.5,
              width: '100%'
            }}>              <TextField
                id="search-bar"
                label="Tìm kiếm"
                variant="outlined"
                size="small"
                placeholder="Nhập từ khóa tìm kiếm..."
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                  )
                }}
                sx={{
                  bgcolor: 'background.paper',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: '2px',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    backgroundColor: 'background.paper',
                    px: 0.5,
                    color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.primary.main,
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: theme.palette.primary.main,
                      fontWeight: 600
                    }
                  }
                }}
              />
            </Box>
          </Grid>
          
          {/* Nút tìm kiếm và làm mới */}
          <Grid item xs={12} sm={12} md={3}>
            <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', md: 'flex-end' }}>              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={() => {
                  // Gọi trực tiếp fetch thay vì đặt flag
                  fetchHoatDongBenhVien();
                }}
                disabled={isLoading}
              >
                Xem dữ liệu
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => {
                  // Gọi trực tiếp fetch thay vì đặt flag
                  fetchHoatDongBenhVien();
                }}
                disabled={isLoading}
              >
                Làm mới
              </Button>
            </Stack>
          </Grid>        </Grid>
      </Paper>
      
      {/* Thông báo cập nhật gần nhất */}
      {lastUpdated && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <Typography variant="caption" color="textSecondary">
            Cập nhật lần cuối: {lastUpdated}
          </Typography>
        </Box>
      )}

      {/* Toolbar with Chip buttons for toggling activity types and layout controls */}      <Paper 
        elevation={0}
        sx={{ 
          p: 1, 
          mb: 2, 
          borderRadius: 2,
          backgroundColor: theme.palette.background.neutral,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip 
            label="Tổng quan"
            color={activityTypes.chung ? "primary" : "default"} 
            onClick={() => handleActivityTypeChange('chung')}
            variant={activityTypes.chung ? "filled" : "outlined"}
            icon={<LocalHospitalOutlinedIcon />}
          />
          <Chip 
            label="Ngoại trú (Type 2)" 
            color={activityTypes.ngoaiTru ? "success" : "default"} 
            onClick={() => handleActivityTypeChange('ngoaiTru')}
            variant={activityTypes.ngoaiTru ? "filled" : "outlined"}
            icon={<MeetingRoomOutlinedIcon />}
          />
          <Chip 
            label="Nội trú (Type 3)" 
            color={activityTypes.noiTru ? "secondary" : "default"} 
            onClick={() => handleActivityTypeChange('noiTru')}
            variant={activityTypes.noiTru ? "filled" : "outlined"}
            icon={<HotelOutlinedIcon />}
          />
          <Chip 
            label="Thực hiện (Type 7)" 
            color={activityTypes.thucHien ? "warning" : "default"} 
            onClick={() => handleActivityTypeChange('thucHien')}
            variant={activityTypes.thucHien ? "filled" : "outlined"}
            icon={<MedicalServicesOutlinedIcon />}
          />
          <Chip 
            label="Lấy mẫu (Type 38)" 
            color={activityTypes.layMau ? "info" : "default"} 
            onClick={() => handleActivityTypeChange('layMau')}
            variant={activityTypes.layMau ? "filled" : "outlined"}
            icon={<ScienceOutlinedIcon />}
          />
        </Box>
        
        <Box>
          <ToggleButtonGroup
            value={layoutMode}
            exclusive
            onChange={handleLayoutModeChange}
            size="small"
            aria-label="Chế độ hiển thị"
          >
            <ToggleButton value="compact" aria-label="Hiển thị dạng lưới">
              <Tooltip title="Hiển thị dạng lưới">
                <ViewCompactIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="expanded" aria-label="Hiển thị dạng mở rộng">
              <Tooltip title="Hiển thị dạng mở rộng">
                <ViewAgendaIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Paper>

      {/* Hiển thị lỗi nếu có */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}      {/* Hiển thị số lượng khoa phòng theo từng loại */}
      {(phongKhamData?.length > 0 || phongNoiTruData?.length > 0 || 
        phongThucHienData?.length > 0 || phongLayMauData?.length > 0) && (
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap' }}>
          <Typography variant="subtitle2" sx={{ mr: 1, mt: 0.5 }}>
            Số lượng khoa phòng: {filteredDepartments.length > 0 ? `(${filteredDepartments.length} khoa trong nhóm)` : ''}
          </Typography>
          <SourceCountBadge 
            label="Phòng khám" 
            count={phongKhamData?.length || 0} 
            color="primary"
            onClick={() => handleActivityTypeChange('ngoaiTru')}
          />
          <SourceCountBadge 
            label="Phòng nội trú" 
            count={phongNoiTruData?.length || 0} 
            color="secondary"
            onClick={() => handleActivityTypeChange('noiTru')}
          />
          <SourceCountBadge 
            label="Phòng thực hiện" 
            count={phongThucHienData?.length || 0} 
            color="error"
            onClick={() => handleActivityTypeChange('chung')}
          />
          <SourceCountBadge 
            label="Phòng lấy mẫu" 
            count={phongLayMauData?.length || 0} 
            color="warning"
            onClick={() => handleActivityTypeChange('chung')}
          />
        </Box>
      )}      {/* Phần hiển thị bảng dữ liệu */}
      <Grid container spacing={2}>
        {/* Phòng nội trú - Type 3 */}
        {activityTypes.noiTru && (
          <Grid item xs={12} md={layoutMode === 'compact' ? 4 : 12}>
            <HoatDongDataCard              ref={noiTruCardRef}
              title="Hoạt động nội trú (Type 3)"
              data={phongNoiTruData || []}
              lichTrucData={lichTrucData || []}
              type="noiTru"
              isLoading={isDataLoading}
              backgroundColor={theme.palette.background.paper}
            />
          </Grid>
        )}
        
        {/* Phòng khám - Type 2 */}
        {activityTypes.ngoaiTru && (
          <Grid item xs={12} md={layoutMode === 'compact' ? 4 : 12}>
            <HoatDongDataCard              ref={ngoaiTruCardRef}
              title="Hoạt động ngoại trú (Type 2)"
              data={phongKhamData || []}
              lichTrucData={lichTrucData || []}
              type="ngoaiTru"
              isLoading={isDataLoading}
              backgroundColor={theme.palette.background.paper}
            />
          </Grid>
        )}
          {/* Phòng thực hiện - Type 7 */}
        {activityTypes.thucHien && (
          <Grid item xs={12} md={layoutMode === 'compact' ? 4 : 12}>
            <HoatDongDataCard              ref={thucHienCardRef}
              title="Phòng thực hiện thủ thuật (Type 7)"
              data={phongThucHienData || []}
              lichTrucData={lichTrucData || []}
              type="thucHien"
              isLoading={isDataLoading}
              backgroundColor={theme.palette.background.paper}
            />
          </Grid>
        )}
          
        {/* Phòng lấy mẫu - Type 38 */}
        {activityTypes.layMau && (
          <Grid item xs={12} md={layoutMode === 'compact' ? 4 : 12}>
            <HoatDongDataCard              ref={chungCardRef}
              title="Phòng lấy mẫu xét nghiệm (Type 38)"
              data={phongLayMauData || []}
              lichTrucData={lichTrucData || []}
              type="layMau"
              isLoading={isDataLoading}
              backgroundColor={theme.palette.background.paper}
            />
          </Grid>
        )}
      </Grid>
        {/* Chú thích viết tắt */}
      <Box sx={{ mt: 2, borderTop: `1px solid ${theme.palette.divider}`, pt: 1 }}>
        <AbbreviationChips />
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Link component={RouterLink} to="/hoatdongbenhvien/schema" color="primary" underline="hover">
            Xem chi tiết cấu trúc dữ liệu
          </Link>
        </Box>
      </Box>
  </Box>
  );
};

export default HoatDongDashboard;
