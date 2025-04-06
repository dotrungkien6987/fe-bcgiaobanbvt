// src/components/VIPOutpatientClinic.js
import React from 'react';
import { Box, Typography, Paper, Grid, Divider, Chip } from '@mui/material';
import StatsCard from './StatsCard';

const VIPOutpatientClinic = ({ data }) => {
  // Calculate total stats
  const totalWaiting = data.reduce((sum, room) => sum + room.waiting, 0);
  const totalExamined = data.reduce((sum, room) => sum + room.examined, 0);
  const totalAdmitted = data.reduce((sum, room) => sum + room.admitted, 0);
  
  return (
    <Paper sx={{ p: 2, mb: 3, backgroundColor: 'rgba(245, 0, 87, 0.05)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" component="h2" color="secondary.main">
          Phòng Khám Yêu Cầu
        </Typography>
        <Box>
          <Chip 
            label={`Tổng chờ khám: ${totalWaiting}`} 
            color="primary" 
            sx={{ mr: 1 }} 
          />
          <Chip 
            label={`Đã khám: ${totalExamined}`} 
            color="success" 
            sx={{ mr: 1 }} 
          />
          <Chip 
            label={`Nhập viện: ${totalAdmitted}`} 
            color="secondary" 
          />
        </Box>
      </Box>
      <Divider sx={{ mb: 2 }} />
      
      <Grid container spacing={2}>
        {data.map((room, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <StatsCard 
              title={room.name}
              doctor={room.doctor}
              nurse={room.nurse}
              stats={[
                { label: 'Chờ khám', value: room.waiting, color: 'primary' },
                { label: 'Đã khám', value: room.examined, color: 'success' },
                { label: 'Nhập viện', value: room.admitted, color: 'secondary' },
              ]}
              elevation={2}
            />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default VIPOutpatientClinic;