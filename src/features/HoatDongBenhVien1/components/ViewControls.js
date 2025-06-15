import React from 'react';
import { Box, ToggleButtonGroup, ToggleButton, FormGroup, FormControlLabel, Checkbox, Typography } from '@mui/material';
import { useHoatDongBenhVien } from '../HoatDongBenhVienProvider';
import { DEPARTMENT_TYPES, VIEW_MODES } from '../constants';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';

const ViewControls = () => {
  const { 
    viewMode, 
    toggleViewMode, 
    visibleTypes, 
    toggleDepartmentType 
  } = useHoatDongBenhVien();
  
  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      toggleViewMode();
    }
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'flex-end', alignItems: 'center' }}>
      <Typography variant="body2" sx={{ mr: 2 }}>Loại hoạt động:</Typography>
      
      <FormGroup row>
        <FormControlLabel
          control={
            <Checkbox 
              checked={visibleTypes.includes(DEPARTMENT_TYPES.NOI_TRU)}
              onChange={() => toggleDepartmentType(DEPARTMENT_TYPES.NOI_TRU)}
              size="small"
            />
          }
          label="Nội trú"
        />
        <FormControlLabel
          control={
            <Checkbox 
              checked={visibleTypes.includes(DEPARTMENT_TYPES.NGOAI_TRU)}
              onChange={() => toggleDepartmentType(DEPARTMENT_TYPES.NGOAI_TRU)}
              size="small"
            />
          }
          label="Ngoại trú"
        />
        <FormControlLabel
          control={
            <Checkbox 
              checked={visibleTypes.includes(DEPARTMENT_TYPES.THU_THUAT) || visibleTypes.includes(DEPARTMENT_TYPES.LAY_MAU)}
              onChange={() => {
                toggleDepartmentType(DEPARTMENT_TYPES.THU_THUAT);
                toggleDepartmentType(DEPARTMENT_TYPES.LAY_MAU);
              }}
              size="small"
            />
          }
          label="Thủ thuật/Lấy mẫu"
        />
      </FormGroup>
      
      <Box sx={{ ml: { xs: 0, md: 2 }, mt: { xs: 1, md: 0 } }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
        >
          <ToggleButton value={VIEW_MODES.COMPACT} aria-label="compact view">
            <ViewModuleIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value={VIEW_MODES.EXPANDED} aria-label="expanded view">
            <ViewListIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Box>
  );
};

export default ViewControls;
