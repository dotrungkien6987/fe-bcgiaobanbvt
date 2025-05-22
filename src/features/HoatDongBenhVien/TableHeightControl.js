import React from 'react';
import { Box, Slider, Typography } from '@mui/material';

/**
 * Component điều khiển chiều cao bảng dữ liệu
 * @param {Object} props - Component props
 * @param {number} props.tableHeight - Chiều cao hiện tại của bảng
 * @param {Function} props.onChange - Callback được gọi khi chiều cao thay đổi
 * @returns {JSX.Element} Component điều khiển chiều cao bảng
 */
const TableHeightControl = ({ tableHeight, onChange }) => {
  const handleChange = (event, newValue) => {
    if (onChange) {
      onChange(newValue);
    }
  };
  
  return (
    <Box sx={{ width: 300, p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Điều chỉnh chiều cao bảng
      </Typography>
      <Slider
        value={tableHeight}
        min={200}
        max={800}
        step={50}
        onChange={handleChange}
        valueLabelDisplay="auto"
        valueLabelFormat={(value) => `${value}px`}
        marks={[
          { value: 200, label: '200px' },
          { value: 500, label: '500px' },
          { value: 800, label: '800px' },
        ]}
      />
    </Box>
  );
};

export default TableHeightControl;
