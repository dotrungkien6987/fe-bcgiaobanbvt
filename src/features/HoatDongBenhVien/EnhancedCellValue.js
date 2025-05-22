import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';

// Component hiển thị số liệu với màu sắc tùy biến theo giá trị
const EnhancedCellValue = ({ value, type, label, maxValue, threshold, sx }) => {
  // Xác định màu sắc dựa trên loại và giá trị
  const getColorByValue = () => {
    // Nếu không có giá trị, hiển thị màu trung tính
    if (value === undefined || value === null) {
      return '#9e9e9e';
    }
    
    // Nếu có maxValue và threshold, sử dụng logic phần trăm
    if (maxValue !== undefined && threshold !== undefined) {
      const percent = (value / maxValue) * 100;
      
      if (percent >= threshold.high) {
        return '#d32f2f'; // Đỏ - cao
      } else if (percent >= threshold.medium) {
        return '#f57c00'; // Cam - trung bình
      } else {
        return '#388e3c'; // Xanh lá - thấp
      }
    }
    
    // Nếu không có threshold, sử dụng màu mặc định theo loại
    switch(type) {
      case 'waiting':
        return parseInt(value) > 0 ? '#f57c00' : '#9e9e9e';  // Cam nếu đang đợi
      case 'completed':
        return parseInt(value) > 0 ? '#388e3c' : '#9e9e9e';  // Xanh lá nếu hoàn thành
      case 'warning':
        return parseInt(value) > 0 ? '#d32f2f' : '#9e9e9e';  // Đỏ nếu cảnh báo
      case 'info':
        return parseInt(value) > 0 ? '#1976d2' : '#9e9e9e';  // Xanh dương cho thông tin
      case 'total':
        return parseInt(value) > 0 ? '#5c6bc0' : '#9e9e9e';  // Tím nhạt cho tổng
      default:
        return '#212121';  // Màu mặc định
    }
  };
  
  const color = getColorByValue();
  
  // Tạo tooltip content
  const getTooltipContent = () => {
    if (!label) return '';
    
    let content = label;
    
    // Thêm phần trăm nếu có maxValue
    if (maxValue !== undefined && maxValue > 0) {
      const percent = ((value / maxValue) * 100).toFixed(1);
      content += ` (${percent}%)`;
    }
    
    return content;
  };
  
  // Hàm format số
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '—';
    
    // Nếu là số nguyên, không hiển thị phần thập phân
    if (Number.isInteger(Number(num))) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    // Nếu là số thập phân, giữ 1 chữ số thập phân
    return parseFloat(num).toFixed(1).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Tạo Box đặc biệt để hiển thị giá trị với các hiệu ứng
  const ValueBox = styled(Box)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.08)' 
        : 'rgba(0, 0, 0, 0.04)',
      transform: 'translateY(-2px)'
    }
  }));
  
  // Nếu không có giá trị
  if (value === undefined || value === null) {
    return (
      <Typography
        variant="body2"
        component="div"
        sx={{
          color: '#9e9e9e',
          fontStyle: 'italic',
          ...sx
        }}
      >
        —
      </Typography>
    );
  }
  
  return (
    <Tooltip title={getTooltipContent()} arrow placement="top">
      <ValueBox>
        <Typography
          variant="body2"
          component="div"
          sx={{
            fontWeight: 'medium',
            color,
            ...sx
          }}
        >
          {formatNumber(value)}
        </Typography>
      </ValueBox>
    </Tooltip>
  );
};

export default EnhancedCellValue;
