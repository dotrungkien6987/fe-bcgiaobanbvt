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
    
    // Thêm thông tin về phần trăm nếu có maxValue
    if (maxValue !== undefined && value !== undefined && value !== null) {
      const percent = (value / maxValue) * 100;
      content += `: ${percent.toFixed(1)}%`;
    }
    
    return content;
  };
  
  const tooltipContent = getTooltipContent();
  
  // Xác định kích thước dựa trên prop sx
  const isSmallSize = sx && sx.fontSize && sx.fontSize === '0.75rem';
  
  return (
    <Tooltip title={tooltipContent} arrow placement="top">
      <Box 
        sx={{ 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 'bold',
            color: color,
            fontSize: isSmallSize ? '0.75rem' : '0.9rem',
            position: 'relative',
            padding: isSmallSize ? '2px 4px' : '4px 8px',
            borderRadius: '4px',
            // Nền mờ với màu sắc tương ứng
            bgcolor: `${color}15`,
            // Thêm viền bên trái
            borderLeft: `3px solid ${color}`,
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: `${color}25`,
              transform: isSmallSize ? 'scale(1.03)' : 'scale(1.05)'
            },
            ...sx
          }}
        >
          {value !== undefined && value !== null ? value : '0'}
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default EnhancedCellValue;