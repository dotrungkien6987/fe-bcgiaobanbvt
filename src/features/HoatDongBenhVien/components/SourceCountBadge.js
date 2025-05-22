import React from 'react';
import { Badge, Chip, Typography, Box, useTheme } from '@mui/material';

/**
 * Component hiển thị badge đếm số lượng khoa phòng cho từng nguồn dữ liệu
 * 
 * @param {Object} props
 * @param {string} props.label - Nhãn hiển thị
 * @param {number} props.count - Số lượng khoa phòng
 * @param {string} props.color - Màu sắc của badge (primary, secondary, success, warning, error, info)
 * @param {string} props.icon - Tên icon (optional)
 * @param {function} props.onClick - Hàm xử lý khi nhấp vào (optional)
 */
const SourceCountBadge = ({ label, count, color = 'primary', onClick }) => {
  const theme = useTheme();

  // Xác định màu sắc dựa trên prop color
  const getColor = () => {
    switch(color) {
      case 'primary': return theme.palette.primary.main;
      case 'secondary': return theme.palette.secondary.main;
      case 'success': return theme.palette.success.main;
      case 'warning': return theme.palette.warning.main;
      case 'error': return theme.palette.error.main;
      case 'info': return theme.palette.info.main;
      default: return color; // Cho phép truyền mã màu trực tiếp
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'inline-flex', 
        alignItems: 'center',
        m: 0.5,
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={onClick}
    >
      <Chip
        label={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" component="span">
              {label}
            </Typography>
            <Badge
              badgeContent={count}
              color={color}
              sx={{ 
                '& .MuiBadge-badge': {
                  right: -10,
                  top: -5,
                  border: `2px solid ${theme.palette.background.paper}`,
                  padding: '0 4px',
                  minWidth: 20,
                  height: 20
                }
              }}
            />
          </Box>
        }
        sx={{ 
          fontWeight: 'medium',
          backgroundColor: `${getColor()}20`,  // 20% transparency
          color: getColor(),
          border: `1px solid ${getColor()}40`,  // 40% transparency
          '&:hover': onClick ? {
            backgroundColor: `${getColor()}30`,  // 30% transparency on hover
          } : {},
          px: 1
        }}
      />
    </Box>
  );
};

export default SourceCountBadge;
