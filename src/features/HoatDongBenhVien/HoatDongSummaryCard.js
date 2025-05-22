import React from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  useTheme,
  Avatar,
  Stack
} from '@mui/material';

// Material Icons
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import HotelOutlinedIcon from '@mui/icons-material/HotelOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';

const HoatDongSummaryCard = ({ 
  title, 
  count = 0, 
  subheader,
  icon, 
  color, 
  details = []
}) => {
  const theme = useTheme();
    // Map icon string to component
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'LocalHospitalOutlined':
        return <LocalHospitalOutlinedIcon />;
      case 'HotelOutlined':
        return <HotelOutlinedIcon />;
      case 'MeetingRoomOutlined':
        return <MeetingRoomOutlinedIcon />;      
      case 'MedicalServicesOutlined':
      case 'EmergencyOutlined': // Để tương thích ngược với mã cũ 
        return <MedicalServicesOutlinedIcon />;
      case 'MedicationOutlined':
        return <MedicationOutlinedIcon />;
      case 'ScienceOutlined':
        return <ScienceOutlinedIcon />;
      case 'EngineeringOutlined':
        return <EngineeringOutlinedIcon />;
      default:
        return <LocalHospitalOutlinedIcon />;
    }
  };
  return (
    <Card
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
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
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: details.length > 0 ? 1 : 0
        }}
      >
        <Box>
          <Typography 
            variant="body2" 
            sx={{ color: theme.palette.text.secondary, mb: 0.5 }}
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
          {subheader && (
            <Typography variant="caption" color="text.secondary">
              {subheader}
            </Typography>
          )}
        </Box>
        <Avatar
          sx={{
            backgroundColor: color ? `${color}20` : theme.palette.primary.light,
            color: color || theme.palette.primary.main,
            width: 56,
            height: 56,
          }}
        >
          {typeof icon === 'string' ? getIcon(icon) : icon}
        </Avatar>
      </Box>      {details.length > 0 && (
        <Box 
          sx={{ 
            borderTop: `1px dashed ${theme.palette.divider}`,
            pt: 1,
            mt: 'auto'
          }}
        >
          <Stack spacing={0.5}>
            {details.map((detail, index) => (
              <Box 
                key={index}
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {detail.label}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 'medium',
                    color: detail.color ? detail.color : 'text.primary'
                  }}
                >
                  {detail.value}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </Card>
  );
};

export default HoatDongSummaryCard;
