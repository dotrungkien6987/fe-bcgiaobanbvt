import React, { useEffect, useState } from 'react';
import { Box, Typography, Chip, keyframes, styled } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import UpdateIcon from '@mui/icons-material/Update';

// Tạo hiệu ứng animation nhấp nháy
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.7);
    transform: scale(1);
  }
  
  70% {
    box-shadow: 0 0 0 6px rgba(25, 118, 210, 0);
    transform: scale(1.05);
  }
  
  100% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
    transform: scale(1);
  }
`;

// Tạo hiệu ứng số nhảy lên nhảy xuống
const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  
  50% {
    transform: translateY(-3px);
  }
`;

// Chip tùy chỉnh với animation - phiên bản mới với font lớn hơn và nổi bật hơn
const AnimatedNextNumberChip = styled(Chip)(({ theme }) => ({
  fontWeight: 'bold',
  animation: `${pulse} 2s infinite`,
  transition: 'all 0.3s ease',
  borderWidth: 2,
  padding: '8px 4px',
  height: 'auto',
  '&:hover': {
    transform: 'scale(1.1)',
  },
  '& .MuiChip-label': {
    animation: `${bounce} 2s infinite`,
    padding: '0 12px',
    fontSize: '1.25rem', // Tăng kích thước font
    lineHeight: '1.5',
    fontWeight: 'bold'
  },
  '& .MuiChip-icon': {
    fontSize: '1.25rem', // Tăng kích thước icon
  }
}));

// Số hiển thị độc lập với animation mạnh hơn
const NumberDisplayBox = styled(Box)(({ bgcolor, isSmallScreen }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: isSmallScreen ? '1px 6px' : '2px 8px',
  borderRadius: '12px',
  backgroundColor: bgcolor,
  color: '#ffffff',
  fontWeight: 'bold',
  fontSize: isSmallScreen ? '0.9rem' : '1.1rem',
  animation: `${pulse} 1.5s infinite`,
  boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
  margin: '0 3px',
}));

// Component hiển thị số thứ tự tiếp theo với animation
const NextNumberDisplay = ({ value, type, isSmallScreen = false }) => {
  const [isHighlighted, setIsHighlighted] = useState(false);
  
  // Xác định màu sắc dựa trên loại phòng
  const getColorByType = () => {
    switch(type) {
      case 'phongKham':
        return {
          bg: '#bb1515',
          // bg: '#1976d2',
          text: '#ffffff'
        };
      case 'phongThucHien':
        return {
          bg: '#bb1515',
          // bg: '#388e3c',
          text: '#ffffff'
        };
      case 'phongLayMau':
        return {
          bg: "#bb1515",
          text: '#ffffff'
        };
      default:
        return {
          bg: '#1976d2',
          text: '#ffffff'
        };
    }
  };
  
  const colors = getColorByType();
  
  // Tạo hiệu ứng nhấp nháy khi giá trị thay đổi
  useEffect(() => {
    setIsHighlighted(true);
    const timer = setTimeout(() => {
      setIsHighlighted(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [value]);
  
  // Hiển thị "Chưa có" nếu không có giá trị
  if (!value) {
    return (
      <Chip
        label="Không có"
        size={isSmallScreen ? "small" : "medium"}
        variant="outlined"
        color="default"
        sx={{ fontStyle: 'italic', fontSize: isSmallScreen ? '0.7rem' : 'inherit' }}
      />
    );
  }
  
  // Phiên bản mới hiển thị số lớn hơn và nổi bật hơn
  return (
    <Box sx={{ 
      display: 'flex',
      alignItems: 'center', 
      justifyContent: 'center',
      animation: isHighlighted ? `${bounce} 1s ease` : 'none',
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        backgroundColor: isHighlighted ? colors.bg : 'rgba(255,255,255,0.9)',
        borderRadius: '20px',
        padding: isSmallScreen ? '1px 6px' : '2px 8px',
        border: `2px solid ${colors.bg}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
      }}>
        <UpdateIcon 
          sx={{ 
            color: isHighlighted ? colors.text : colors.bg,
            mr: isSmallScreen ? 0.5 : 1,
            animation: `${bounce} 1.5s infinite`,
            fontSize: isSmallScreen ? '0.8rem' : '1rem'
          }} 
        />
        <NumberDisplayBox bgcolor={colors.bg} isSmallScreen={isSmallScreen}>
          {value}
        </NumberDisplayBox>
      </Box>
      {/* <ArrowForwardIosIcon 
        sx={{
          ml: isSmallScreen ? 0.5 : 1,
          color: colors.bg,
          animation: `${bounce} 1.5s infinite`,
          fontSize: isSmallScreen ? '0.9rem' : '1.25rem',
          fontWeight: 'bold'
        }}
      /> */}
    </Box>
  );
};

export default NextNumberDisplay;