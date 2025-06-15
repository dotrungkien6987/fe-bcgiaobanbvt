import React from 'react';
import { Box, Paper, Typography, Grid, CircularProgress, Button } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { vi } from 'date-fns/locale';
import { HoatDongBenhVienProvider } from './HoatDongBenhVienProvider';
import FilterControls from './components/FilterControls';
import DepartmentSchedules from './components/DepartmentSchedules';
import ViewControls from './components/ViewControls';

const HoatDongDashBoard1 = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
      <HoatDongBenhVienProvider>
        <DashboardContent />
      </HoatDongBenhVienProvider>
    </LocalizationProvider>
  );
};

const DashboardContent = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Dashboard Hoạt Động Bệnh Viện
        </Typography>
        
        {/* Phần điều khiển lọc */}
        <Grid container spacing={2} justifyContent="space-between" alignItems="center">
          <Grid item xs={12} md={8}>
            <FilterControls />
          </Grid>
          <Grid item xs={12} md={4}>
            <ViewControls />
          </Grid>
        </Grid>
      </Paper>
      
      {/* Hiển thị lịch trực */}
      <DepartmentSchedules />
    </Box>
  );
};

export default HoatDongDashBoard1;
