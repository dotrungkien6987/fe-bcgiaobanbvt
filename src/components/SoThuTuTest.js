import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
} from '../features/Slice/soThuTuSlice';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert
} from '@mui/material';

const SoThuTuTest = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectSoThuTuLoading);
  const error = useSelector(selectSoThuTuError);
  const phongKhamData = useSelector(selectSoThuTuPhongKham);
  const phongThucHienData = useSelector(selectSoThuTuPhongThucHien);
  const phongLayMauData = useSelector(selectSoThuTuPhongLayMau);

  // Danh sách phòng ban mẫu (trong thực tế nên lấy từ API)
  const departmentOptions = [
    { id: '14', name: 'Phòng khám 1' },
    { id: '556', name: 'Phòng khám 2' },
    { id: '1181', name: 'Phòng khám 3' },
    { id: '92', name: 'Phòng khám 4' },
    { id: '28', name: 'Phòng khám 5' },
    { id: '398', name: 'Phòng thực hiện 1' },
    { id: '400', name: 'Phòng thực hiện 2' },
    { id: '402', name: 'Phòng thực hiện 2' },
    { id: '410', name: 'Phòng thực hiện 2' },
    { id: '920', name: 'Phòng thực hiện 2' },
    { id: '401', name: 'Phòng thực hiện 2' },
    { id: '406', name: 'Phòng lấy mẫu 1' },
    { id: '456', name: 'Phòng lấy mẫu 1' },
    { id: '405', name: 'Phòng lấy mẫu 1' },
    { id: '971', name: 'Phòng lấy mẫu 2' }
  ];

  // State cho form
  const [formState, setFormState] = useState({
    date: new Date().toISOString().split('T')[0], // Ngày hiện tại
    selectedDepartments: [],
    showAllData: false, // Option để hiển thị tất cả loại phòng
  });

  // Theo dõi các tab đang được hiển thị
  const [activeRoomTypes, setActiveRoomTypes] = useState({
    phongKham: true,
    phongThucHien: false,
    phongLayMau: false
  });

  // Xử lý thay đổi ngày
  const handleDateChange = (e) => {
    setFormState({
      ...formState,
      date: e.target.value
    });
  };

  // Xử lý chọn phòng ban
  const handleDepartmentChange = (e) => {
    setFormState({
      ...formState,
      selectedDepartments: e.target.value
    });
  };

  // Toggle hiển thị tất cả dữ liệu
  const handleShowAllDataChange = (e) => {
    setFormState({
      ...formState,
      showAllData: e.target.checked
    });
  };

  // Xử lý khi click vào tab loại phòng
  const handleRoomTypeChange = (roomType) => {
    if (formState.showAllData) return; // Nếu đang hiển thị tất cả dữ liệu thì không cần thay đổi tab

    const newActiveRoomTypes = {
      phongKham: false,
      phongThucHien: false,
      phongLayMau: false
    };
    
    newActiveRoomTypes[roomType] = true;
    setActiveRoomTypes(newActiveRoomTypes);
  };

  // Xử lý khi submit form
  const handleSubmit = () => {
    if (formState.selectedDepartments.length === 0) {
      alert('Vui lòng chọn ít nhất một phòng ban');
      return;
    }

    // Reset dữ liệu cũ
    dispatch(resetSoThuTuState());

    // Nếu hiển thị tất cả dữ liệu
    if (formState.showAllData) {
      dispatch(getAllSoThuTuStats(formState.date, formState.selectedDepartments));
      setActiveRoomTypes({
        phongKham: true,
        phongThucHien: true,
        phongLayMau: true
      });
      return;
    }

    // Nếu chỉ hiển thị một loại phòng
    if (activeRoomTypes.phongKham) {
      dispatch(getSoThuTuPhongKham(formState.date, formState.selectedDepartments));
    } else if (activeRoomTypes.phongThucHien) {
      dispatch(getSoThuTuPhongThucHien(formState.date, formState.selectedDepartments));
    } else if (activeRoomTypes.phongLayMau) {
      dispatch(getSoThuTuPhongLayMau(formState.date, formState.selectedDepartments));
    }
  };

  // Render bảng dữ liệu
  const renderDataTable = (data, title) => {
    if (!data || data.length === 0) {
      return (
        <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Không có dữ liệu cho {title}
          </Typography>
        </Box>
      );
    }

    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f0f7ff' }}>
              <TableCell><strong>STT</strong></TableCell>
              <TableCell><strong>Phòng ban</strong></TableCell>
              <TableCell align="right"><strong>Số lượng bệnh nhân</strong></TableCell>
              {/* Thêm các cột khác tùy theo cấu trúc dữ liệu trả về */}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.department_name || item.departmentName || 'N/A'}</TableCell>
                <TableCell align="right">{item.count || item.patientCount || 0}</TableCell>
                {/* Render các trường khác tùy theo cấu trúc dữ liệu */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Tính tổng số bệnh nhân
  const calculateTotal = (data) => {
    if (!data || data.length === 0) return 0;
    return data.reduce((total, item) => total + (item.count || item.patientCount || 0), 0);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Kiểm tra API Số Thứ Tự
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Form nhập dữ liệu */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Ngày"
              type="date"
              value={formState.date}
              onChange={handleDateChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="department-select-label">Phòng ban</InputLabel>
              <Select
                labelId="department-select-label"
                multiple
                value={formState.selectedDepartments}
                onChange={handleDepartmentChange}
                renderValue={(selected) => selected.join(', ')}
              >
                {departmentOptions.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    <Checkbox checked={formState.selectedDepartments.indexOf(dept.id) > -1} />
                    {dept.name} ({dept.id})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <FormGroup>
              <FormControlLabel 
                control={
                  <Checkbox 
                    checked={formState.showAllData} 
                    onChange={handleShowAllDataChange} 
                  />
                } 
                label="Hiển thị dữ liệu từ tất cả loại phòng" 
              />
            </FormGroup>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexDirection: 'row', mb: 2 }}>
              <Button 
                variant={activeRoomTypes.phongKham ? "contained" : "outlined"} 
                onClick={() => handleRoomTypeChange('phongKham')}
                disabled={formState.showAllData}
                sx={{ mr: 1 }}
              >
                Phòng khám (Type 2)
              </Button>
              <Button 
                variant={activeRoomTypes.phongThucHien ? "contained" : "outlined"} 
                onClick={() => handleRoomTypeChange('phongThucHien')}
                disabled={formState.showAllData}
                sx={{ mr: 1 }}
              >
                Phòng thực hiện (Type 7)
              </Button>
              <Button 
                variant={activeRoomTypes.phongLayMau ? "contained" : "outlined"} 
                onClick={() => handleRoomTypeChange('phongLayMau')}
                disabled={formState.showAllData}
                sx={{ mr: 1 }}
              >
                Phòng lấy mẫu (Type 38)
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSubmit}
              disabled={isLoading}
              startIcon={isLoading && <CircularProgress size={20} color="inherit" />}
              fullWidth
            >
              {isLoading ? 'Đang tải dữ liệu...' : 'Gửi yêu cầu API'}
            </Button>
          </Grid>
        </Grid>
        
        {/* Hiển thị lỗi nếu có */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* Hiển thị kết quả */}
        <Box sx={{ mt: 4 }}>
          {(activeRoomTypes.phongKham || formState.showAllData) && phongKhamData.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardHeader 
                title="Dữ liệu Phòng khám (Type 2)" 
                subheader={`Tổng số bệnh nhân: ${calculateTotal(phongKhamData)}`}
                sx={{ bgcolor: '#e3f2fd' }}
              />
              <CardContent>
                {renderDataTable(phongKhamData, 'Phòng khám')}
              </CardContent>
            </Card>
          )}
          
          {(activeRoomTypes.phongThucHien || formState.showAllData) && phongThucHienData.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardHeader 
                title="Dữ liệu Phòng thực hiện (Type 7)" 
                subheader={`Tổng số bệnh nhân: ${calculateTotal(phongThucHienData)}`}
                sx={{ bgcolor: '#e8f5e9' }}
              />
              <CardContent>
                {renderDataTable(phongThucHienData, 'Phòng thực hiện')}
              </CardContent>
            </Card>
          )}
          
          {(activeRoomTypes.phongLayMau || formState.showAllData) && phongLayMauData.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardHeader 
                title="Dữ liệu Phòng lấy mẫu (Type 38)" 
                subheader={`Tổng số bệnh nhân: ${calculateTotal(phongLayMauData)}`}
                sx={{ bgcolor: '#fff8e1' }}
              />
              <CardContent>
                {renderDataTable(phongLayMauData, 'Phòng lấy mẫu')}
              </CardContent>
            </Card>
          )}
          
          {!isLoading && 
           phongKhamData.length === 0 && 
           phongThucHienData.length === 0 && 
           phongLayMauData.length === 0 && (
            <Box sx={{ textAlign: 'center', p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
              <Typography variant="subtitle1">
                Nhập thông tin và nhấn "Gửi yêu cầu API" để xem dữ liệu
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default SoThuTuTest;