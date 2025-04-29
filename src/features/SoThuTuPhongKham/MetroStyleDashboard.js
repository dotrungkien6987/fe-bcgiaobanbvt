import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Divider,
  Stack,
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

// Icons
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import FullscreenIcon from '@mui/icons-material/Fullscreen';

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Styled components
const TileContainer = styled(Paper)(({ theme, color = 'primary', size = 'medium', animate = false }) => ({
  position: 'relative',
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette[color].main, 0.15),
  border: `1px solid ${alpha(theme.palette[color].main, 0.3)}`,
  borderLeft: `5px solid ${theme.palette[color].main}`,
  height: size === 'large' ? 180 : size === 'medium' ? 120 : 80,
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  transition: 'all 0.3s ease-in-out',
  overflow: 'hidden',
  animation: animate ? `${fadeIn} 0.5s ease-in-out` : 'none',
  '&:hover': {
    boxShadow: `0 5px 15px ${alpha(theme.palette[color].main, 0.4)}`,
    transform: 'translateY(-5px)',
    '& .highlight-icon': {
      transform: 'scale(1.2)'
    }
  }
}));

const NextNumberContainer = styled(Paper)(({ theme, color = 'secondary' }) => ({
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette[color].main, 0.9),
  color: theme.palette.getContrastText(theme.palette[color].main),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: theme.shape.borderRadius,
  position: 'relative',
  overflow: 'hidden',
  minWidth: 150,
  height: 120,
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.2)} 0%, transparent 50%, transparent 100%)`,
    zIndex: 1
  },
  '& .number': {
    animation: `${pulse} 2s infinite ease-in-out`,
    fontWeight: 'bold',
    fontSize: '2.5rem',
    lineHeight: 1,
    zIndex: 2
  },
  '& .arrow-icon': {
    animation: `${rotate} 6s infinite linear`,
    marginRight: theme.spacing(1),
    zIndex: 2
  }
}));

const StatValue = styled(Typography)(({ theme, color, size = 'default' }) => ({
  fontWeight: 'bold',
  color: color ? theme.palette[color].main : 'inherit',
  fontSize: size === 'large' ? '2.5rem' : size === 'medium' ? '1.8rem' : '1.2rem',
  lineHeight: 1.2,
  display: 'flex',
  alignItems: 'center'
}));

const HighlightIcon = styled(Box)(({ theme, color = 'primary' }) => ({
  position: 'absolute',
  right: theme.spacing(2),
  bottom: theme.spacing(2),
  opacity: 0.2,
  transform: 'scale(1)',
  transition: 'transform 0.3s ease',
  '& svg': {
    fontSize: '3.5rem',
    color: theme.palette[color].main
  }
}));

const ProgressCircle = styled(Box)(({ theme, color = 'primary', value = 0 }) => ({
  position: 'absolute',
  right: theme.spacing(2),
  top: theme.spacing(2),
  '& .MuiCircularProgress-colorPrimary': {
    color: theme.palette[color].main
  },
  '& .circle-background': {
    color: alpha(theme.palette[color].main, 0.2)
  }
}));

// Main Component
const MetroStyleDashboard = ({ data, type }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [sortedData, setSortedData] = useState([]);
  
  // Sort data by department name
  useEffect(() => {
    if (data && data.length > 0) {
      const sorted = [...data].sort((a, b) => 
        a.departmentname.localeCompare(b.departmentname)
      );
      setSortedData(sorted);
    }
  }, [data]);

  // Determine color by type
  const getTypeColor = () => {
    switch(type) {
      case 'phongKham': return 'primary';
      case 'phongThucHien': return 'success';
      case 'phongLayMau': return 'warning';
      default: return 'primary';
    }
  };
  
  const typeColor = getTypeColor();
  
  // Calculate progress percentage for each department
  const calculateProgress = (item) => {
    if (!item) return 0;
    
    if (type === 'phongKham') {
      const total = parseInt(item.tong_benh_nhan) || 0;
      const completed = parseInt(item.so_benh_nhan_kham_xong) || 0;
      return total > 0 ? Math.round((completed / total) * 100) : 0;
    } else if (type === 'phongThucHien') {
      const total = parseInt(item.tong_mau_benh_pham) || 0;
      const completed = parseInt(item.so_ca_da_tra_ket_qua) || 0;
      return total > 0 ? Math.round((completed / total) * 100) : 0;
    } else if (type === 'phongLayMau') {
      const total = parseInt(item.tong_mau_benh_pham) || 0;
      const completed = parseInt(item.so_ca_da_tra_ket_qua) || 0;
      return total > 0 ? Math.round((completed / total) * 100) : 0;
    }
    return 0;
  };
  
  // Get main stats for a department
  const getDepartmentStats = (item) => {
    if (type === 'phongKham') {
      return [
        { 
          label: 'Chưa khám', 
          value: item.so_benh_nhan_chua_kham, 
          color: 'warning',
          icon: <HourglassEmptyIcon fontSize="inherit" />
        },
        { 
          label: 'Đã khám', 
          value: item.so_benh_nhan_da_kham, 
          color: 'info',
          icon: <AccessTimeIcon fontSize="inherit" />
        },
        { 
          label: 'Khám xong', 
          value: item.so_benh_nhan_kham_xong, 
          color: 'success',
          icon: <CheckCircleIcon fontSize="inherit" />
        }
      ];
    } else if (type === 'phongThucHien') {
      return [
        { 
          label: 'Chưa TH', 
          value: item.so_ca_chua_thuc_hien, 
          color: 'warning',
          icon: <HourglassEmptyIcon fontSize="inherit" />
        },
        { 
          label: 'Đợi KQ', 
          value: item.so_ca_da_thuc_hien_cho_ket_qua, 
          color: 'info',
          icon: <AccessTimeIcon fontSize="inherit" />
        },
        { 
          label: 'Đã trả KQ', 
          value: item.so_ca_da_tra_ket_qua, 
          color: 'success',
          icon: <CheckCircleIcon fontSize="inherit" />
        }
      ];
    } else if (type === 'phongLayMau') {
      return [
        { 
          label: 'Chưa lấy', 
          value: item.so_ca_chua_lay_mau, 
          color: 'warning',
          icon: <HourglassEmptyIcon fontSize="inherit" />
        },
        { 
          label: 'Đã lấy', 
          value: item.so_ca_da_lay_mau, 
          color: 'success',
          icon: <CheckCircleIcon fontSize="inherit" />
        },
        { 
          label: 'Đợi KQ', 
          value: item.so_ca_da_thuc_hien_cho_ket_qua, 
          color: 'info',
          icon: <AccessTimeIcon fontSize="inherit" />
        }
      ];
    }
    return [];
  };

  // Get next number info for department
  const getNextNumber = (item) => {
    return {
      value: item.sothutunumber_du_kien_tiep_theo || '?',
      label: 'STT TIẾP THEO',
      max: type === 'phongKham' ? item.max_sothutunumber : 
           type === 'phongThucHien' ? item.max_sothutunumber : 
           item.max_sothutunumber
    };
  };
  
  // Get total count for department
  const getTotalCount = (item) => {
    if (type === 'phongKham') {
      return {
        label: 'Tổng BN',
        value: item.tong_benh_nhan || 0,
        icon: <PeopleAltIcon />,
        color: typeColor
      };
    } else if (type === 'phongThucHien' || type === 'phongLayMau') {
      return {
        label: 'Tổng CLS',
        value: item.tong_mau_benh_pham || 0,
        icon: <MedicalServicesIcon />,
        color: typeColor
      };
    }
    return { label: '', value: 0, icon: null, color: 'primary' };
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={2}>
        {sortedData.map((item, index) => {
          const stats = getDepartmentStats(item);
          const nextNumber = getNextNumber(item);
          const totalData = getTotalCount(item);
          const progress = calculateProgress(item);
          
          return (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Box sx={{ position: 'relative' }}>
                <Grid container spacing={1}>
                  {/* Hiển thị STT tiếp theo đầu tiên */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <NextNumberContainer color={typeColor} elevation={3} sx={{ width: '100%' }}>
                        <ArrowCircleRightIcon fontSize="large" className="arrow-icon" />
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" sx={{ opacity: 0.8 }}>
                            {nextNumber.label}
                          </Typography>
                          <Typography variant="h3" className="number">
                            {nextNumber.value}
                          </Typography>
                        </Box>
                      </NextNumberContainer>
                    </Box>
                  </Grid>
                  
                  {/* Tên phòng */}
                  <Grid item xs={12}>
                    <TileContainer 
                      color={typeColor} 
                      size="medium"
                      animate={true}
                      elevation={3}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography 
                          variant="h6" 
                          component="div" 
                          sx={{ 
                            color: theme.palette.text.primary,
                            mb: 0.5,
                            position: 'relative',
                            zIndex: 2
                          }}
                        >
                          {item.departmentname}
                        </Typography>
                        
                        <Tooltip title="Hiển thị chi tiết" placement="top">
                          <IconButton 
                            size="small" 
                            sx={{ 
                              backgroundColor: alpha(theme.palette[typeColor].main, 0.1),
                              color: theme.palette[typeColor].main
                            }}
                          >
                            <FullscreenIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      
                      <ProgressCircle color={typeColor} value={progress}>
                        <Tooltip title={`Hoàn thành: ${progress}%`}>
                          <Box sx={{ position: 'relative' }}>
                            <CircularProgress
                              variant="determinate"
                              value={100}
                              size={40}
                              thickness={4}
                              className="circle-background"
                            />
                            <CircularProgress
                              variant="determinate"
                              value={progress}
                              size={40}
                              thickness={4}
                              color="primary"
                              sx={{ position: 'absolute', top: 0, left: 0 }}
                            />
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Typography
                                variant="caption"
                                component="div"
                                sx={{ fontWeight: 'bold' }}
                              >
                                {`${progress}%`}
                              </Typography>
                            </Box>
                          </Box>
                        </Tooltip>
                      </ProgressCircle>
                      
                      <HighlightIcon color={typeColor} className="highlight-icon">
                        <AnalyticsIcon />
                      </HighlightIcon>
                      
                      <Grid container spacing={1} sx={{ position: 'relative', zIndex: 2 }}>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {totalData.icon}
                            <Typography variant="subtitle2" sx={{ ml: 1, mr: 1 }}>
                              {totalData.label}:
                            </Typography>
                            <StatValue color={totalData.color}>
                              {totalData.value}
                            </StatValue>
                          </Box>
                        </Grid>
                      </Grid>
                    </TileContainer>
                  </Grid>

                  {/* Các số liệu */}
                  <Grid item xs={12}>
                    <Grid container spacing={1}>
                      {stats.map((stat, statIndex) => (
                        <Grid item xs={4} key={statIndex}>
                          <TileContainer color={stat.color} size="small" elevation={2}>
                            <Typography variant="caption" sx={{ mb: 0.5 }}>
                              {stat.label}
                            </Typography>
                            <StatValue color={stat.color}>
                              {stat.value || 0} {stat.icon}
                            </StatValue>
                          </TileContainer>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default MetroStyleDashboard;