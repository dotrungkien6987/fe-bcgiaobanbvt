import React from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  useTheme,
  Avatar
} from '@mui/material';

// Material Icons
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import BiotechOutlinedIcon from '@mui/icons-material/BiotechOutlined';

const SoThuTuSummaryCard = ({ title, count, icon, color }) => {
  const theme = useTheme();
  
  // Map icon string to component
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'MedicationOutlined':
        return <MedicationOutlinedIcon />;
      case 'ScienceOutlined':
        return <ScienceOutlinedIcon />;
      case 'BiotechOutlined':
        return <BiotechOutlinedIcon />;
      default:
        return <MedicationOutlinedIcon />;
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        display: 'flex',
        p: 2,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s',
        '&:hover': {
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexGrow: 1
        }}
      >
        <Typography 
          variant="body2" 
          sx={{ color: theme.palette.text.secondary, mb: 1 }}
        >
          {title}
        </Typography>
        <Typography 
          variant="h4" 
          component="div" 
          sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}
        >
          {count}
        </Typography>
      </Box>
      <Avatar
        sx={{
          backgroundColor: color ? `${color}20` : theme.palette.primary.light,
          color: color || theme.palette.primary.main,
          width: 56,
          height: 56,
          ml: 2
        }}
      >
        {getIcon(icon)}
      </Avatar>
    </Card>
  );
};

export default SoThuTuSummaryCard;