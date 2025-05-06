// Component Chip nhỏ gọn hiển thị các từ viết tắt với định dạng in nghiêng
import React from 'react';
import { Chip, useTheme } from '@mui/material';

/**
 * Component hiển thị từ viết tắt dưới dạng Chip
 * @param {Object} props - Props của component
 * @param {string} props.abbreviation - Từ viết tắt (ví dụ: NB)
 * @param {string} props.fullText - Nghĩa đầy đủ của từ viết tắt (ví dụ: Người Bệnh)
 * @param {Object} props.sx - Style tùy chỉnh thêm (tuỳ chọn)
 * @returns {JSX.Element} - Chip hiển thị từ viết tắt
 */
const AbbreviationChip = ({ abbreviation, fullText, sx = {} }) => {
  const theme = useTheme();
  
  return (
    <Chip
      size="small"
      label={`${abbreviation}: ${fullText}`}
      sx={{
        fontStyle: 'italic',
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(25, 118, 210, 0.08)',
        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(25, 118, 210, 0.2)'}`,
        fontSize: '0.75rem',
        ...sx
      }}
    />
  );
};

export default AbbreviationChip;