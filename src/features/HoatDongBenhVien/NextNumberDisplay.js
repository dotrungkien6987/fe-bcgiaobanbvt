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
  }
}));

// Component hiển thị số thứ tự tiếp theo
const NextNumberDisplay = ({ value, lastUpdated, type = 'default' }) => {
  const [animateKey, setAnimateKey] = useState(0);
  
  // Mỗi khi value thay đổi, tạo một key mới để kích hoạt animation từ đầu
  useEffect(() => {
    setAnimateKey(prevKey => prevKey + 1);
  }, [value]);
  
  // Hiệu ứng và màu sắc khác nhau cho các loại phòng
  const getChipProps = () => {
    // Màu sắc mặc định cho phòng khám
    let color = 'primary';
    let borderColor = 'primary.main';
    let textColor = 'primary.contrastText';
    let backgroundColor = 'primary.light';
    
    // Điều chỉnh màu sắc dựa trên type
    if (type === 'phongThucHien') {
      color = 'secondary';
      borderColor = 'secondary.main';
      backgroundColor = 'secondary.light';
      textColor = 'secondary.contrastText';
    } else if (type === 'phongLayMau') {
      color = 'success';
      borderColor = 'success.main';
      backgroundColor = 'success.light';
      textColor = 'success.contrastText';
    }
    
    return {
      color,
      sx: {
        border: 2,
        borderColor,
        backgroundColor,
        color: textColor,
      }
    };
  };
  
  return (
    <Box 
      key={animateKey}
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {value ? (
        <>
          <AnimatedNextNumberChip
            icon={<ArrowForwardIosIcon />}
            label={value}
            {...getChipProps()}
          />
          
          {lastUpdated && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <UpdateIcon sx={{ fontSize: '0.875rem', opacity: 0.7, mr: 0.5 }} />
              <Typography 
                variant="caption" 
                sx={{ 
                  opacity: 0.7,
                  fontSize: '0.7rem',
                  fontStyle: 'italic'
                }}
              >
                {lastUpdated}
              </Typography>
            </Box>
          )}
        </>
      ) : (
        <Chip 
          label="—" 
          {...getChipProps()} 
          sx={{ 
            ...getChipProps().sx,
            opacity: 0.5,
          }}
        />
      )}
    </Box>
  );
};

export default NextNumberDisplay;
