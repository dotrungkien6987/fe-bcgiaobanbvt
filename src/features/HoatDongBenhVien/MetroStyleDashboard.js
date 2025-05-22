import React from 'react';
import { 
  Grid, 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  useTheme, 
  useMediaQuery,
  Paper
} from '@mui/material';
import HotelOutlinedIcon from '@mui/icons-material/HotelOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

/**
 * Component hiển thị dashboard kiểu Metro với các ô thông tin trực quan
 * @param {Object} props - Props component
 * @param {Object} props.summaryData - Dữ liệu tổng hợp hiển thị trên dashboard
 * @param {function} props.onTileClick - Hàm xử lý khi click vào một ô
 * @returns {JSX.Element} Metro style dashboard
 */
const MetroStyleDashboard = ({ summaryData, onTileClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Danh sách các ô thông tin
  const tiles = [
    {
      id: 'total_patients',
      title: 'Tổng bệnh nhân',
      value: summaryData?.totalPatients || 0,
      icon: <LocalHospitalOutlinedIcon fontSize="large" />,
      color: '#1976d2',
      size: 2
    },
    {
      id: 'inpatients',
      title: 'Nội trú',
      value: summaryData?.totalInpatients || 0,
      icon: <HotelOutlinedIcon fontSize="large" />,
      color: '#8250df',
      size: 1
    },
    {
      id: 'outpatients',
      title: 'Ngoại trú',
      value: summaryData?.totalOutpatients || 0,
      icon: <MeetingRoomOutlinedIcon fontSize="large" />,
      color: '#2e7d32',
      size: 1
    },
    {      id: 'emergency',
      title: 'Cấp cứu',
      value: summaryData?.totalEmergency || 0,
      icon: <MedicalServicesOutlinedIcon fontSize="large" />,
      color: '#d32f2f',
      size: 1
    },
    {
      id: 'surgeries',
      title: 'Phẫu thuật',
      value: summaryData?.totalSurgeries || 0,
      icon: <MedicationOutlinedIcon fontSize="large" />,
      color: '#ed6c02',
      size: 1
    },
    {
      id: 'procedures',
      title: 'Thủ thuật',
      value: summaryData?.totalProcedures || 0,
      icon: <EngineeringOutlinedIcon fontSize="large" />,
      color: '#0288d1',
      size: 1
    },
    {
      id: 'more',
      title: 'Xem thêm',
      icon: <AddCircleOutlineIcon fontSize="large" />,
      color: '#757575',
      size: 1,
      isAction: true
    }
  ];
  
  // Tạo danh sách các ô cho grid
  const renderTiles = () => {
    return tiles.map((tile) => (
      <Grid 
        item 
        xs={6} 
        md={tile.size * 2} 
        lg={tile.size} 
        key={tile.id}
      >
        <Card
          onClick={() => onTileClick && onTileClick(tile.id)}
          sx={{
            height: '100%',
            bgcolor: `${tile.color}15`,
            borderLeft: `4px solid ${tile.color}`,
            transition: 'all 0.3s',
            cursor: 'pointer',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 4px 20px 0 ${tile.color}30`,
              bgcolor: `${tile.color}25`,
            }
          }}
        >
          <CardContent sx={{ height: '100%', p: 2 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: tile.size > 1 ? 'row' : 'column',
                justifyContent: 'space-between',
                alignItems: tile.size > 1 ? 'center' : 'flex-start',
                height: '100%'
              }}
            >
              <Box>
                <Typography 
                  variant="h6" 
                  component="div" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: tile.color,
                    mb: 0.5
                  }}
                >
                  {tile.title}
                </Typography>
                
                {!tile.isAction && (
                  <Typography 
                    variant={tile.size > 1 ? "h3" : "h4"} 
                    component="div"
                    sx={{ 
                      fontWeight: 'bold',
                      color: theme.palette.text.primary
                    }}
                  >
                    {tile.value.toLocaleString()}
                  </Typography>
                )}
              </Box>
              
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: tile.color,
                  mt: tile.size > 1 ? 0 : 'auto'
                }}
              >
                {tile.icon}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    ));
  };
  
  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 2, 
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      <Typography 
        variant="h6" 
        component="div" 
        sx={{ 
          mb: 2,
          fontWeight: 'medium'
        }}
      >
        Tổng quan hoạt động bệnh viện
      </Typography>
      
      <Grid container spacing={2}>
        {renderTiles()}
      </Grid>
    </Paper>
  );
};

export default MetroStyleDashboard;
