import React from 'react';
import { Box, Grid, Paper, Typography, Divider, CircularProgress, Chip, Button, Alert } from '@mui/material';
import { useHoatDongBenhVien } from '../HoatDongBenhVienProvider';
import { DEPARTMENT_TYPES, VIEW_MODES } from '../constants';
import NoirTruSchedule from './NoiTruSchedule';
import NgoaiTruSchedule from './NgoaiTruSchedule';
import ThuThuatSchedule from './ThuThuatSchedule';
import LayMauSchedule from './LayMauSchedule';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import SyncIcon from '@mui/icons-material/Sync';

const DepartmentSchedules = () => {
  const { 
    loading, 
    loadingSoThuTu,
    visibleTypes, 
    viewMode,
    getDepartmentsByType,
    departments,
    searchTerm,
    setSearchTerm
  } = useHoatDongBenhVien();
    if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Show indicator for SoThuTu loading
  const renderSoThuTuLoadingIndicator = () => {
    return loadingSoThuTu && (
      <Paper 
        sx={{ 
          p: 1, 
          mb: 2, 
          display: 'flex', 
          alignItems: 'center',
          backgroundColor: 'rgba(25, 118, 210, 0.08)',
          border: '1px solid rgba(25, 118, 210, 0.2)'
        }}
      >
        <SyncIcon 
          sx={{ 
            color: 'primary.main', 
            mr: 1,
            animation: 'spin 1.5s linear infinite',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' }
            }
          }} 
          fontSize="small" 
        />
        <Typography variant="body2" color="primary.main">
          Đang tải dữ liệu số thứ tự...
        </Typography>
      </Paper>
    );
  };
  
  // Kiểm tra nếu không có kết quả tìm kiếm
  const hasNoResults = searchTerm && departments.length === 0;
  
  const renderSectionTitle = (title, count, showLoading = false) => (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center',
      mb: 2,
      mt: 3,
      borderBottom: '1px solid #eee',
      pb: 1
    }}>
      <Typography variant="h6" component="h2">
        {title}
      </Typography>
      <Chip 
        label={count} 
        size="small" 
        color="primary" 
        sx={{ ml: 1 }} 
      />
      {showLoading && loadingSoThuTu && (
        <CircularProgress size={16} sx={{ ml: 1 }} />
      )}
    </Box>
  );
    const isCompactView = viewMode === VIEW_MODES.COMPACT;
    // Hiển thị thông báo không có kết quả tìm kiếm
  if (hasNoResults) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', mt: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          mb: 2
        }}>
          <Box sx={{ 
            bgcolor: 'rgba(25, 118, 210, 0.08)', 
            borderRadius: '50%',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2
          }}>
            <SearchIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          </Box>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Không tìm thấy kết quả
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Không tìm thấy khoa phòng, điều dưỡng hoặc bác sĩ nào khớp với từ khóa
          </Typography>
          <Typography variant="body1" fontWeight="medium" color="primary" sx={{ mt: 1 }}>
            "{searchTerm}"
          </Typography>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => setSearchTerm('')} 
            sx={{ mt: 3 }}
            startIcon={<ClearIcon />}
          >
            Xóa tìm kiếm
          </Button>
        </Box>
      </Paper>
    );
  }
    return (
    <Box>
      {/* SoThuTu Loading Indicator */}
      {renderSoThuTuLoadingIndicator()}
      
      {/* Nội trú */}
      {visibleTypes.includes(DEPARTMENT_TYPES.NOI_TRU) && (
        <>
          {renderSectionTitle('Khoa Nội Trú', getDepartmentsByType(DEPARTMENT_TYPES.NOI_TRU).length)}
          <Grid container spacing={2}>
            <NoirTruSchedule isCompactView={isCompactView} />
          </Grid>
        </>
      )}
      
      {/* Ngoại trú */}
      {visibleTypes.includes(DEPARTMENT_TYPES.NGOAI_TRU) && (
        <>
          {renderSectionTitle('Khoa Ngoại Trú', getDepartmentsByType(DEPARTMENT_TYPES.NGOAI_TRU).length)}
          <Grid container spacing={2}>
            <NgoaiTruSchedule isCompactView={isCompactView} />
          </Grid>
        </>
      )}
        {/* Thủ thuật */}
      {visibleTypes.includes(DEPARTMENT_TYPES.THU_THUAT) && (
        <>
          {renderSectionTitle('Phòng Thủ Thuật', getDepartmentsByType(DEPARTMENT_TYPES.THU_THUAT).length, true)}
          <Grid container spacing={2}>
            <ThuThuatSchedule isCompactView={isCompactView} />
          </Grid>
        </>
      )}
      
      {/* Lấy mẫu */}
      {visibleTypes.includes(DEPARTMENT_TYPES.LAY_MAU) && (
        <>
          {renderSectionTitle('Phòng Lấy Mẫu', getDepartmentsByType(DEPARTMENT_TYPES.LAY_MAU).length, true)}
          <Grid container spacing={2}>
            <LayMauSchedule isCompactView={isCompactView} />
          </Grid>
        </>
      )}
    </Box>
  );
};

export default DepartmentSchedules;
