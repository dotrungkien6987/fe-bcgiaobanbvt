import React from 'react';
import { Grid, Paper, Typography, Box, Divider, Chip, CircularProgress } from '@mui/material';
import { useHoatDongBenhVien } from '../HoatDongBenhVienProvider';
import { DEPARTMENT_TYPES } from '../constants';
import MedicationIcon from '@mui/icons-material/Medication';
import PersonIcon from '@mui/icons-material/Person';
import NoteIcon from '@mui/icons-material/Note';
import BiotechIcon from '@mui/icons-material/Biotech';

const LayMauSchedule = ({ isCompactView }) => {
  const { getDepartmentsByType, schedules, visibleTypes, loadingSoThuTu } = useHoatDongBenhVien();
  
  const layMauDepartments = visibleTypes.includes(DEPARTMENT_TYPES.LAY_MAU)
    ? getDepartmentsByType(DEPARTMENT_TYPES.LAY_MAU)
    : [];
  
  if (layMauDepartments.length === 0) {
    return (
      <Grid item xs={12}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body1">Không có dữ liệu phòng lấy mẫu</Typography>
        </Paper>
      </Grid>
    );
  }
  
  return layMauDepartments.map((department) => {
    const schedule = schedules[department.maKhoa] || {
      dieuDuong: '',
      bacSi: '',
      ghiChu: 'Không có thông tin'
    };
    
    // Xử lý chuỗi điều dưỡng và bác sĩ nếu có
    const dieuDuongArray = schedule.dieuDuong ? schedule.dieuDuong.split(',').map(item => item.trim()) : [];
    const bacSiArray = schedule.bacSi ? schedule.bacSi.split(',').map(item => item.trim()) : [];
    
    const color = '#9c27b0'; // Màu tím cho phòng lấy mẫu
    
    return (
      <Grid item xs={12} md={isCompactView ? 6 : 12} lg={isCompactView ? 4 : 12} key={department.id}>
        <Paper
          elevation={2}
          sx={{
            p: 2,
            height: '100%',
            borderTop: `4px solid ${color}`,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}
        >
          {loadingSoThuTu && (
            <Box sx={{ 
              position: 'absolute', 
              top: 10, 
              right: 10, 
              display: 'flex',
              alignItems: 'center'
            }}>
              <CircularProgress size={16} />
            </Box>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              {department.ten}
            </Typography>
            <Chip 
              icon={<BiotechIcon fontSize="small" />}
              label="Lấy mẫu" 
              size="small"
              sx={{ 
                bgcolor: `${color}20`,
                color: color,
                borderColor: color,
                fontWeight: 'medium'
              }}
              variant="outlined"
            />
          </Box>
          
          <Divider sx={{ my: 1 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PersonIcon sx={{ mr: 1, color: color }} fontSize="small" />
            <Typography variant="body2" component="span" fontWeight="medium">
              Điều dưỡng:
            </Typography>
          </Box>
          <Box sx={{ pl: 4, mb: 1.5 }}>
            {dieuDuongArray.length > 0 ? (
              dieuDuongArray.map((nurse, index) => (
                <Typography key={index} variant="body2">
                  • {nurse}
                </Typography>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                Chưa phân công
              </Typography>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <MedicationIcon sx={{ mr: 1, color: color }} fontSize="small" />
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

export default LayMauSchedule;
