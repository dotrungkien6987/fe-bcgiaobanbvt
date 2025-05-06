// Component tập hợp tất cả các chip viết tắt
import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import AbbreviationChip from './AbbreviationChip';

/**
 * Component hiển thị tất cả các Chip viết tắt
 * @returns {JSX.Element} - Box chứa tất cả các Chip viết tắt
 */
const AbbreviationChips = () => {
  const theme = useTheme();
  
  // Danh sách các từ viết tắt và nghĩa đầy đủ
  const abbreviations = [
    { abbr: 'NB', fullText: 'Người Bệnh' },
    { abbr: 'STT', fullText: 'Số thứ tự' },
    { abbr: 'KQ', fullText: 'Kết quả' },
    { abbr: 'TH', fullText: 'Thực hiện' }
  ];
  
  return (
    <Box 
      sx={{
        
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        mt: 0.5,
        alignItems: 'center'
      }}
    >
      <Typography 
        variant="body2" 
        component="span"
        sx={{ 
          fontStyle: 'italic',
          color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
          fontSize: { xs: '0.75rem', sm: '0.8rem' }
        }}
      >
        Chú thích:
      </Typography>
      
      {abbreviations.map((item) => (
        <AbbreviationChip 
          key={item.abbr}
          abbreviation={item.abbr}
          fullText={item.fullText}
        />
      ))}
    </Box>
  );
};

export default AbbreviationChips;