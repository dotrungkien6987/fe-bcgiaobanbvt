import React from 'react';
import { styled } from '@mui/material/styles';
import { TableRow } from '@mui/material';

// StripedTableRow component: tạo hiệu ứng sọc cho các dòng bảng
const StripedTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(0, 0, 0, 0.02)',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(0, 0, 0, 0.04)',
    }
  },
  '&:nth-of-type(even)': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(0, 0, 0, 0.1)' 
      : 'rgba(255, 255, 255, 0)',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(0, 0, 0, 0.2)' 
        : 'rgba(0, 0, 0, 0.04)',
    }
  },
  // Hiệu ứng khi hover
  transition: 'background-color 0.2s ease',
}));

export default StripedTableRow;
