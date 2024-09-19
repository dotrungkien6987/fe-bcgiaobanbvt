import * as React from 'react';
import { Box, Typography } from '@mui/material';
import { PieChart, pieArcClasses, pieArcLabelClasses } from '@mui/x-charts/PieChart';

function MyPieChartVertical({ data, colors, other }) {
  // Cập nhật nhãn và màu sắc cho các dữ liệu
  data = data.map((dt, index) => {
    let newLabel = `${dt.label}: ${dt.value}`;
    return { ...dt, label: newLabel, ...colors[index] };
  });

  const total = data.map((item) => Number(item.value)).reduce((a, b) => a + b, 0);
  const tongcong = { label: `Tổng cộng: ${total}`, value: 0, color: 'white' };
  data.push(tongcong);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {/* Biểu đồ PieChart */}
      <PieChart
       slotProps={{
      legend: {
        direction: 'column',
        position: { vertical: 'bottom', horizontal: 'middle' },
        // padding: 1,
      
      },
    }}
        series={[
          {
            data: data,
            highlightScope: { faded: "global", highlighted: "item" },
            faded: { innerRadius: 15, additionalRadius: -10 },
            cy: 95,
            cx:130,
            arcLabel: (params) => {
              const percent = params.value / total;
              if (percent === 0) {
                return "";
              } else {
                return `${(percent * 100).toFixed(0)}%`;
              }
            },
            arcLabelMinAngle: 10,
          },
        ]}
        sx={{
          [`& .${pieArcClasses.faded}`]: {
            fill: "gray",
          },
          [`& .${pieArcLabelClasses.root}`]: {
            fill: 'white',
          },
        }}
        {...other}
      />

    </Box>
  );
}

export default MyPieChartVertical;
