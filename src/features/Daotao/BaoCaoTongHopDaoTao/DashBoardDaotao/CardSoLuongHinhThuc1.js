import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';

const CardSoLuongHinhThuc1 = ({ code, name, organizationCount, memberCount }) => {
  return (
    <Paper
      sx={{
        padding: 2,
        backgroundColor: 'white',
        borderRadius: 2,
        boxShadow: 3,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          backgroundColor: '#1939B7',
          color: 'white',
          padding: 1,
          borderRadius: '8px 8px 0 0',
        }}
      >
        <Typography variant="h6">{code}</Typography>
      </Box>
      <Box sx={{ padding: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sx={{ marginBottom: 1 }}>
            <Typography sx={{ fontWeight: 'bold' }}>Tên:</Typography>
            <Typography>{name}</Typography>
          </Grid>
          <Grid item xs={12} sx={{ marginBottom: 1 }}>
            <Typography sx={{ fontWeight: 'bold' }}>Số lượng tổ chức:</Typography>
            <Typography sx={{ color: '#bb1515' }}>{organizationCount}</Typography>
          </Grid>
          <Grid item xs={12} sx={{ marginBottom: 1 }}>
            <Typography sx={{ fontWeight: 'bold' }}>Số lượt thành viên:</Typography>
            <Typography sx={{ color: '#bb1515' }}>{memberCount}</Typography>
          </Grid>
        </Grid>
      </Box>
      <Box
        sx={{
          marginTop: 2,
          padding: 1,
          backgroundColor: '#f0f0f0',
          borderRadius: '0 0 8px 8px',
          textAlign: 'center',
        }}
      >
        <Typography variant="body2">Chi tiết</Typography>
      </Box>
    </Paper>
  );
};

export default CardSoLuongHinhThuc1;
