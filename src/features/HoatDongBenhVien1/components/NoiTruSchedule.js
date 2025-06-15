import React from 'react';
import { Grid, Paper, Typography, Box, Divider, Tooltip } from '@mui/material';
import { useHoatDongBenhVien } from '../HoatDongBenhVienProvider';
import { DEPARTMENT_TYPES } from '../constants';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MedicationIcon from '@mui/icons-material/Medication';
import PersonIcon from '@mui/icons-material/Person';
import NoteIcon from '@mui/icons-material/Note';
import HighlightText from './HighlightText';

const NoiTruSchedule = ({ isCompactView }) => {
  const { getDepartmentsByType, schedules, searchTerm } = useHoatDongBenhVien();
  
  const noiTruDepartments = getDepartmentsByType(DEPARTMENT_TYPES.NOI_TRU);
  
  if (noiTruDepartments.length === 0) {
    return (
      <Grid item xs={12}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body1">Không có dữ liệu khoa nội trú</Typography>
        </Paper>
      </Grid>
    );
  }    return noiTruDepartments.map((department) => {
    const schedule = schedules[department.maKhoa] || {
      dieuDuong: '',
      bacSi: '',
      ghiChu: 'Không có thông tin'
    };
    
    // Xử lý chuỗi điều dưỡng và bác sĩ nếu có
    const dieuDuongArray = schedule.dieuDuong ? schedule.dieuDuong.split(',').map(item => item.trim()) : [];
    const bacSiArray = schedule.bacSi ? schedule.bacSi.split(',').map(item => item.trim()) : [];
    
    return (
      <Grid item xs={12} md={isCompactView ? 6 : 12} lg={isCompactView ? 4 : 12} key={department.id}>
        <Paper
          elevation={2}
          sx={{
            p: 2,
            height: '100%',
            borderTop: '4px solid #1976d2',
            display: 'flex',
            flexDirection: 'column'
          }}
        >          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            <HighlightText text={department.ten} searchTerm={searchTerm} />
          </Typography>
          
          <Divider sx={{ my: 1 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PersonIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2" component="span" fontWeight="medium">
              Điều dưỡng:
            </Typography>
          </Box>
          
          <Box sx={{ pl: 4, mb: 1.5 }}>            {dieuDuongArray.length > 0 ? (
              dieuDuongArray.map((nurse, index) => (
                <Typography key={index} variant="body2">
                  • <HighlightText text={nurse} searchTerm={searchTerm} />
                </Typography>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                Chưa phân công
              </Typography>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <MedicationIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2" component="span" fontWeight="medium">
              Bác sĩ:
            </Typography>
          </Box>
          
          <Box sx={{ pl: 4, mb: 1.5 }}>
            {bacSiArray.length > 0 ? (
              bacSiArray.map((doctor, index) => (
                <Typography key={index} variant="body2">
                  • {doctor}
                </Typography>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                Chưa phân công
              </Typography>
            )}
          </Box>
          
          {schedule.ghiChu && (
            <Box sx={{ mt: 'auto', pt: 1, display: 'flex', alignItems: 'flex-start' }}>
              <NoteIcon color="action" fontSize="small" sx={{ mr: 1, mt: 0.3 }} />
              <Typography variant="body2" color="text.secondary">
                {schedule.ghiChu}
              </Typography>
            </Box>
          )}
        </Paper>
      </Grid>
    );
  });
};

export default NoiTruSchedule;
