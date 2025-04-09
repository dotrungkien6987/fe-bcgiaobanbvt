import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

const ValueProgressBar = ({ 
  value, 
  maxValue, 
  unit = '', 
  color = 'primary',
  showValue = true,
  height = 10,
  width = '100%',
  valueFormat = null,
}) => {
  // Tính phần trăm tiến trình
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  
  // Định dạng giá trị hiển thị
  const displayValue = valueFormat ? valueFormat(value) : value;

  return (
    <Box sx={{ width, display: 'flex', flexDirection: 'column' }}>
      {showValue && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" fontWeight="medium">
            {displayValue} {unit}
          </Typography>
          <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
            {Math.round(percentage)}%
          </Typography>
        </Box>
      )}
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height,
          borderRadius: height / 2,
          backgroundColor: theme => theme.palette.mode === 'dark' 
            ? 'rgba(255,255,255,0.12)' 
            : 'rgba(0,0,0,0.08)',
          '& .MuiLinearProgress-bar': {
            borderRadius: height / 2,
            backgroundColor: theme => color === 'primary' 
              ? theme.palette.primary.main 
              : color,
          }
        }}
      />
    </Box>
  );
};

export default ValueProgressBar;