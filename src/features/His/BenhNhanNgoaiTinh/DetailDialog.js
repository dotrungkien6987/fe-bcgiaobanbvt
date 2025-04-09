import {
  Dialog, DialogTitle, DialogContent, DialogActions, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, IconButton, Typography, useMediaQuery, useTheme,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState, useEffect, useMemo } from 'react';
import ValueProgressBar from './ValueProgressBar';


const DetailDialog = ({ 
  open, 
  title, 
  data = [], 
  onClose, 
  darkMode,
  Huyens = [], // Dữ liệu tất cả các huyện 
  Xas = [],    // Dữ liệu tất cả các xã
  isTinh = false, // Flag xác định data là của tỉnh
  isHuyen = false, // Flag xác định data là của huyện
  maTinh = null,  // Mã tỉnh đang xem
  maHuyen = null,  // Mã huyện đang xem
}) => {
  // Tính tổng số lượng
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const theme = useTheme();
  
  // Màu chính
  const mainColor = "#1939B7";

  // Lọc và map dữ liệu huyện theo maTinh
  const getHuyenData = () => {
    if (!isTinh || !maTinh || !Huyens.length) return data;
    
    return Huyens.filter(huyen => huyen.MaTinh === maTinh).map(huyen => {
      // Tìm dữ liệu bệnh nhân tương ứng
      const foundData = data.find(item => item.MaHuyen === huyen.MaHuyen);
      
      return {
        ...huyen,
        value: foundData ? foundData.value : 0,
        label: huyen.TenHuyen || `Huyện ${huyen.MaHuyen}`,
        // Đảm bảo các trường dữ liệu khác được giữ nguyên
        DienTich: huyen.DienTich,
        DanSo: huyen.DanSo,
        KhoangCach: huyen.KhoangCach
      };
    })
    .sort((a, b) => b.value - a.value); // Sắp xếp giảm dần theo value
  };

  // Lọc và map dữ liệu xã theo maTinh và maHuyen
  const getXaData = () => {
    if (!isHuyen || !maTinh || !maHuyen || !Xas.length) return data;
    
    return Xas.filter(xa => xa.MaTinh === maTinh && xa.MaHuyen === maHuyen).map(xa => {
      // Tìm dữ liệu bệnh nhân tương ứng
      const foundData = data.find(item => item.MaXa === xa.MaXa);
      
      return {
        ...xa,
        value: foundData ? foundData.value : 0,
        label: xa.TenXa || `Xã ${xa.MaXa}`,
        DienTich: xa.DienTich,
        DanSo: xa.DanSo,
        KhoangCach: xa.KhoangCach
      };
    })
    .sort((a, b) => b.value - a.value); // Sắp xếp giảm dần theo value
  };

  // Dữ liệu hiển thị dựa trên loại dữ liệu
  let displayData = [];
  if (isTinh) {
    displayData = getHuyenData();
  } else if (isHuyen) {
    displayData = getXaData();
  } else {
    // Trong trường hợp không phải tỉnh cũng không phải huyện, sắp xếp dữ liệu ban đầu
    displayData = [...data].sort((a, b) => b.value - a.value);
  }
  
  // Tính tổng cho dữ liệu hiển thị
  const displayTotal = displayData.reduce((sum, item) => sum + (item.value || 0), 0);

  // Tính giá trị max cho mỗi loại dữ liệu để làm chuẩn cho thanh tiến trình
  const maxDienTich = useMemo(() => {
    const max = Math.max(...displayData.map(item => Number(item.DienTich) || 0));
    return max > 0 ? max : 1; // Tránh chia cho 0
  }, [displayData]);

  const maxDanSo = useMemo(() => {
    const max = Math.max(...displayData.map(item => Number(item.DanSo) || 0));
    return max > 0 ? max : 1;
  }, [displayData]);

  const maxKhoangCach = useMemo(() => {
    const max = Math.max(...displayData.map(item => Number(item.KhoangCach) || 0));
    return max > 0 ? max : 1;
  }, [displayData]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={true}
    >
      <DialogTitle sx={{ 
    backgroundColor: mainColor,
    color: "#FFFFFF",
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 2,
    minHeight: '64px', // Đảm bảo chiều cao tiêu đề cố định
  }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          {title}
          {isTinh && " - Chi tiết theo huyện"}
          {isHuyen && " - Chi tiết theo xã"}
        </Typography>
        <IconButton onClick={onClose} size="medium" sx={{ color: '#FFFFFF' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent 
    dividers 
    sx={{ 
      padding: 3, 
      flex: 1, // Đây là thay đổi quan trọng - chiếm hết không gian còn lại
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden', // Ngăn double scrollbar
    }}
  >
     <TableContainer 
      component={Paper} 
      sx={{ 
        flex: 1, // Chiếm hết không gian của DialogContent
        boxShadow: 3,
        borderRadius: 2,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ 
                  fontWeight: 'bold', 
                  backgroundColor: darkMode ? mainColor : `${mainColor}22`,
                  color: darkMode ? '#FFFFFF' : mainColor,
                  fontSize: '1rem'
                }}>
                  {isTinh ? "Tên huyện" : (isHuyen ? "Tên xã" : "Tên")}
                </TableCell>
                <TableCell sx={{ 
      fontWeight: 'bold', 
      backgroundColor: darkMode ? mainColor : `${mainColor}22`,
      color: darkMode ? '#FFFFFF' : mainColor,
      fontSize: '1rem',
      
    }}>
      Số lượng bệnh nhân
    </TableCell>
                <TableCell sx={{ 
                  fontWeight: 'bold', 
                  backgroundColor: darkMode ? mainColor : `${mainColor}22`,
                  color: darkMode ? '#FFFFFF' : mainColor,
                  fontSize: '1rem'
                }} align="left">
                  Tỷ lệ (%)
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 'bold', 
                  backgroundColor: darkMode ? mainColor : `${mainColor}22`,
                  color: darkMode ? '#FFFFFF' : mainColor,
                  fontSize: '1rem',
                  minWidth: 150
                }}>
                  Diện tích (km²)
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 'bold', 
                  backgroundColor: darkMode ? mainColor : `${mainColor}22`,
                  color: darkMode ? '#FFFFFF' : mainColor,
                  fontSize: '1rem',
                  minWidth: 150
                }}>
                  Dân số 
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 'bold', 
                  backgroundColor: darkMode ? mainColor : `${mainColor}22`,
                  color: darkMode ? '#FFFFFF' : mainColor,
                  fontSize: '1rem',
                  minWidth: 150
                }}>
                  Khoảng cách (km)
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayData.map((row, index) => {
                // Tính phần trăm
                const percentage = displayTotal > 0 ? ((row.value / displayTotal) * 100).toFixed(1) : "0.0";
                
                return (
                  <TableRow 
                    key={index} 
                    hover
                    sx={{
                      '&:nth-of-type(odd)': {
                        backgroundColor: darkMode ? '#333' : `${mainColor}11`,
                      },
                      '&:hover': {
                        backgroundColor: darkMode ? '#444' : `${mainColor}22`,
                      },
                    }}
                  >
                    <TableCell component="th" scope="row">
                      {row.label}
                    </TableCell>
                    <TableCell align="right">
                    <Box 
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Typography
      sx={{
        fontWeight: 'bold',
        fontSize: '1.1rem',
        color: darkMode ? '#fff' : mainColor,
        backgroundColor: darkMode ? `${mainColor}40` : `${mainColor}15`,
        padding: '4px 12px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        border: `1px solid ${darkMode ? `${mainColor}70` : `${mainColor}30`}`,
        minWidth: '60px',
        textAlign: 'center',
      }}
    >
      {row.value.toLocaleString()}
    </Typography>
  </Box>
                    </TableCell>
                    
<TableCell align="left">
  <Typography
    sx={{
      fontWeight: 'medium',
      color: darkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
    }}
  >
    {percentage}%
  </Typography>
</TableCell>
                    
                    {/* Diện tích với thanh tiến trình */}
                    <TableCell>
                      {row.DienTich ? (
                        <ValueProgressBar
                          value={Number(row.DienTich)}
                          maxValue={maxDienTich}
                          unit="km²"
                          color={mainColor}
                          valueFormat={val => val.toFixed(0)}
                          height={8}
                        />
                      ) : "-"}
                    </TableCell>
                    
                    {/* Dân số với thanh tiến trình */}
                    <TableCell>
                      {row.DanSo ? (
                        <ValueProgressBar
                          value={Number(row.DanSo)}
                          maxValue={maxDanSo}
                          unit="nghìn"
                          color="#2e7d32" // Màu xanh lá
                          valueFormat={val => val.toLocaleString()}
                          height={8}
                        />
                      ) : "-"}
                    </TableCell>
                    
                    {/* Khoảng cách với thanh tiến trình */}
                    <TableCell>
                      {row.KhoangCach ? (
                        <ValueProgressBar
                          value={Number(row.KhoangCach)}
                          maxValue={maxKhoangCach}
                          unit="km"
                          color="#d32f2f" // Màu đỏ
                          valueFormat={val => val.toFixed(1)}
                          height={8}
                        />
                      ) : "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
              
              {/* Hàng tổng */}
              <TableRow sx={{ backgroundColor: darkMode ? `${mainColor}66` : `${mainColor}33` }}>
                <TableCell 
                  sx={{ 
                    fontWeight: 'bold',
                    color: darkMode ? '#FFFFFF' : mainColor,
                    fontSize: '1.05rem'
                  }} 
                  component="th" 
                  scope="row"
                >
                  Tổng cộng
                </TableCell>
                <TableCell>
  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
    <Typography
      sx={{
        fontWeight: 'bold',
        fontSize: '1.15rem',
        color: darkMode ? '#fff' : mainColor,
        backgroundColor: darkMode ? `${mainColor}60` : `${mainColor}20`,
        padding: '5px 14px',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
        border: `1px solid ${darkMode ? `${mainColor}80` : `${mainColor}40`}`,
        textAlign: 'center',
      }}
    >
      {displayTotal.toLocaleString()}
    </Typography>
  </Box>
</TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 'bold',
                    color: darkMode ? '#FFFFFF' : mainColor,
                    fontSize: '1.05rem'
                  }} 
                  align="right"
                >
                  100%
                </TableCell>
                <TableCell>
                  {/* Tổng diện tích */}
                  <Box sx={{ fontWeight: 'bold', color: darkMode ? '#FFFFFF' : mainColor }}>
                    {displayData.reduce((sum, item) => sum + (Number(item.DienTich) || 0), 0).toFixed(2)} km²
                  </Box>
                </TableCell>
                <TableCell>
                  {/* Tổng dân số */}
                  <Box sx={{ fontWeight: 'bold', color: darkMode ? '#FFFFFF' : mainColor }}>
                    {displayData.reduce((sum, item) => sum + (Number(item.DanSo) || 0), 0).toLocaleString()} nghìn
                  </Box>
                </TableCell>
                <TableCell>
                  {/* Không có tổng cho khoảng cách */}
                  <Box sx={{ fontWeight: 'bold', color: darkMode ? '#FFFFFF' : mainColor }}>
                    -
                  </Box>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      
      <DialogActions sx={{ 
    padding: 3, 
    justifyContent: 'flex-end',
    backgroundColor: darkMode ? '#222' : '#f8f8f8',
    minHeight: '80px', // Đảm bảo chiều cao cố định
  }}>
    <Button 
      variant="contained" 
      onClick={onClose}
      size="large"
      sx={{ 
        backgroundColor: mainColor,
        '&:hover': {
          backgroundColor: `${mainColor}dd`,
        },
        borderRadius: 2,
        paddingX: 4
      }}
    >
      Đóng
    </Button>
  </DialogActions>
    </Dialog>
  );
};

export default DetailDialog;