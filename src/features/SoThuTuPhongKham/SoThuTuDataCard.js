import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  
  TableSortLabel,
  LinearProgress,
  Fade,
  Switch,
  FormControlLabel,
  Menu,
  MenuItem,
  Button,
  Checkbox,
  Divider,
  ListItemText,
  Slider,
  Popover,
  useMediaQuery,
  useTheme
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import HeightIcon from '@mui/icons-material/Height';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import StripedTableRow from './StripedTableRow';
import NextNumberDisplay from './NextNumberDisplay';
import EnhancedCellValue from './EnhancedCellValue';

// Import cấu hình hiển thị cột
import { generateInitialColumnVisibility, saveColumnVisibility, resetColumnVisibility } from './configs/columnConfig';

// Định nghĩa hàm getColumns ở bên ngoài component để tránh lỗi
const getColumnsDefinition = (type) => {
  // Cột chung cho tất cả các loại phòng, nhưng độ rộng có thể khác nhau dựa theo loại phòng
  const commonColumns = [
    { 
      id: 'departmentname', 
      label: 'Tên phòng', 
      minWidth: type === 'phongLayMau' ? 350 : 240, // Tăng độ rộng lên 300px cho phòng lấy mẫu
      align: 'left', 
      color: '#1939B7',
      // Thêm style trực tiếp để đảm bảo độ rộng được áp dụng
      style: type === 'phongLayMau' ? { width: '350px', minWidth: '350px' } : undefined
    }
  ];

  // Thêm cột STT tiếp theo ngay sau cột Tên phòng
  const nextNumberColumn = [
    { id: 'next_number', label: 'STT tiếp theo', minWidth: 80, align: 'center',
      getValue: (row) => row.sothutunumber_du_kien_tiep_theo, color: '#1939B7' }
  ];

  // Cột riêng cho từng loại phòng
  let typeColumns = [];
  
  if (type === 'phongKham') {
    // Type = 2: Phòng khám - theo thứ tự trong tài liệu
    typeColumns = [
      { id: 'max_number', label: 'STT lớn nhất', minWidth: 70, align: 'center',
        getValue: (row) => row.max_sothutunumber, color: '#1939B7' },
        { id: 'latest_checked', label: 'STT vừa gọi', minWidth: 70, align: 'center',
          getValue: (row) => row.latest_benh_nhan_da_kham, color: '#1939B7' },
      { id: 'total_patients', label: 'Tổng người bệnh', minWidth: 70, align: 'center',
        getValue: (row) => row.tong_benh_nhan, color: '#1939B7' },
      { id: 'waiting', label: 'Chưa khám', minWidth: 60, align: 'center',
        getValue: (row) => row.so_benh_nhan_chua_kham, color: '#1939B7' },
      { id: 'in_progress', label: 'Đang khám', minWidth: 60, align: 'center',
        getValue: (row) => row.so_benh_nhan_da_kham, color: '#1939B7' },
      { id: 'completed', label: 'Khám xong', minWidth: 70, align: 'center',
        getValue: (row) => row.so_benh_nhan_kham_xong, color: '#1939B7' },
      
      { id: 'max_checked', label: 'STT lớn nhất đã khám', minWidth: 90, align: 'center',
        getValue: (row) => row.max_sothutunumber_da_kham, color: '#1939B7' },
      
    ];
  } else if (type === 'phongThucHien') {
    // Type = 7: Phòng thực hiện - theo thứ tự trong tài liệu
    typeColumns = [
      { id: 'max_number', label: 'STT lớn nhất', minWidth: 70, align: 'center',
        getValue: (row) => row.max_sothutunumber, color: '#1939B7' },
        { id: 'latest_done', label: 'STT vừa gọi', minWidth: 90, align: 'center',
          getValue: (row) => row.latest_sothutunumber_da_thuc_hien, color: '#1939B7' },
      { id: 'total_cls', label: 'Tổng chỉ định', minWidth: 60, align: 'center',
        getValue: (row) => row.tong_mau_benh_pham, color: '#1939B7' },
      { id: 'total_patients', label: 'Tổng người bệnh', minWidth: 60, align: 'center',
        getValue: (row) => row.tong_benh_nhan, color: '#1939B7' },
      { id: 'waiting', label: 'Chưa thực hiện', minWidth: 60, align: 'center',
        getValue: (row) => row.so_ca_chua_thuc_hien, color: '#1939B7' },
      { id: 'pending_result', label: 'Chờ KQ', minWidth: 60, align: 'center',
        getValue: (row) => row.so_ca_da_thuc_hien_cho_ket_qua, color: '#1939B7' },
      { id: 'completed', label: 'Đã trả KQ', minWidth: 60, align: 'center',
        getValue: (row) => row.so_ca_da_tra_ket_qua, color: '#1939B7' },
      
      { id: 'max_done', label: 'STT lớn nhất đã TH', minWidth: 90, align: 'center',
        getValue: (row) => row.max_sothutunumber_da_thuc_hien, color: '#1939B7' },
     
    ];
  } else if (type === 'phongLayMau') {
    // Type = 38: Phòng lấy mẫu - theo thứ tự trong tài liệu
    // Giảm minWidth của các cột số liệu để có thể hiển thị nhiều cột hơn
    typeColumns = [
      { id: 'max_number', label: 'STT lớn nhất', minWidth: 65, align: 'center',
        getValue: (row) => row.max_sothutunumber, color: '#1939B7' },
        
      { id: 'latest_sampled', label: 'STT vừa gọi', minWidth: 75, align: 'center',
        getValue: (row) => row.latest_sothutunumber_da_lay_mau, color: '#1939B7' },
      { id: 'total_cls', label: 'Tổng số mẫu', minWidth: 60, align: 'center',
        getValue: (row) => row.tong_mau_benh_pham, color: '#1939B7' },
      { id: 'total_patients', label: 'Tổng NB', minWidth: 60, align: 'center',
        getValue: (row) => row.tong_benh_nhan, color: '#1939B7' },
      { id: 'cases_not_sampled', label: 'Số mẫu chưa lấy', minWidth: 60, align: 'center',
        getValue: (row) => row.so_ca_chua_lay_mau, color: '#1939B7' },
      { id: 'cases_sampled', label: 'Số mẫu đã lấy', minWidth: 60, align: 'center',
        getValue: (row) => row.so_ca_da_lay_mau, color: '#1939B7' },
      { id: 'patients_sampled', label: 'NB chờ KQ', minWidth: 60, align: 'center',
        getValue: (row) => row.so_benh_nhan_da_lay_mau, color: '#1939B7' },
      { id: 'patients_not_sampled', label: 'NB chưa lấy', minWidth: 60, align: 'center',
        getValue: (row) => row.so_benh_nhan_chua_lay_mau, color: '#1939B7' },
      { id: 'waiting', label: 'Mẫu chưa thực hiện', minWidth: 60, align: 'center',
        getValue: (row) => row.so_ca_chua_thuc_hien, color: '#1939B7' },
      { id: 'pending_result', label: 'Đợi KQ', minWidth: 60, align: 'center',
        getValue: (row) => row.so_ca_da_thuc_hien_cho_ket_qua, color: '#1939B7' },
      { id: 'completed', label: 'Số mẫu đã trả KQ', minWidth: 60, align: 'center',
        getValue: (row) => row.so_ca_da_tra_ket_qua, color: '#1939B7' },
      { id: 'max_sampled', label: 'STT lớn nhất đã lấy', minWidth: 75, align: 'center',
        getValue: (row) => row.max_sothutunumber_da_lay_mau, color: '#1939B7' },
      
    ];
  }

  return [...commonColumns, ...nextNumberColumn, ...typeColumns];
};

const SoThuTuDataCard = forwardRef(({ title, data, type, backgroundColor, isLoading = false }, ref) => {
  const [orderBy, setOrderBy] = useState('departmentname');
  const [order, setOrder] = useState('asc');
  const [autoScroll, setAutoScroll] = useState(true);
  const [scrollSpeed, setScrollSpeed] = useState(2);
  const tableRef = useRef(null);
  const theme = useTheme();
  
  // Khả năng responsive - di chuyển các hooks này lên trước điều kiện return
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
  
  // State để quản lý độ cao của bảng
  const [tableHeight, setTableHeight] = useState(460);
  const [heightAdjustAnchor, setHeightAdjustAnchor] = useState(null);
  
  // Hàm xử lý mở/đóng popover điều chỉnh độ cao
  const handleOpenHeightAdjust = (event) => {
    setHeightAdjustAnchor(event.currentTarget);
  };

  const handleCloseHeightAdjust = () => {
    setHeightAdjustAnchor(null);
  };

  // Hàm xử lý thay đổi độ cao
  const handleHeightChange = (_, newValue) => {
    setTableHeight(newValue);
    console.log(`[${type}] Thay đổi độ cao bảng: ${newValue}px`);
  };
  
  // Thêm refs để theo dõi vị trí cuộn và tránh bị reset khi data thay đổi
  const currentPositionRef = useRef(0);
  const scrollIntervalRef = useRef(null);
  const dataRef = useRef(data);
  const isPausingRef = useRef(false);
  const dataNeedsRefreshRef = useRef(false);
  
  // Cập nhật state trong component chính
  const [visibleColumns, setVisibleColumns] = useState(() => {
    return generateInitialColumnVisibility(type);
  });
  
  // Xử lý việc lưu cấu hình cột khi thay đổi
  useEffect(() => {
    // Lưu cấu hình khi người dùng thay đổi
    saveColumnVisibility(type, visibleColumns);
  }, [visibleColumns, type]);
  
  // State và xử lý cho menu hiển thị/ẩn cột
  const [columnsMenuAnchor, setColumnsMenuAnchor] = useState(null);
  
  const handleOpenColumnsMenu = (event) => {
    setColumnsMenuAnchor(event.currentTarget);
  };
  
  const handleCloseColumnsMenu = () => {
    setColumnsMenuAnchor(null);
  };
  
  const toggleColumnVisibility = (columnId) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnId]: !prev[columnId]
    }));
  };
  
  const showAllColumns = () => {
    const allVisible = columns.reduce((acc, column) => {
      acc[column.id] = true;
      return acc;
    }, {});
    setVisibleColumns(allVisible);
    handleCloseColumnsMenu();
  };

  const hideAllColumns = () => {
    // Giữ lại cột tên phòng luôn hiển thị
    const allHidden = columns.reduce((acc, column) => {
      acc[column.id] = column.id === 'departmentname';
      return acc;
    }, {});
    setVisibleColumns(allHidden);
    handleCloseColumnsMenu();
  };

  // Func để bắt đầu cuộn
  const startScrolling = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
    }
    
    const calculateDimensions = () => {
      if (!tableRef.current) return { maxScroll: 0, needsScrolling: false };
      const scrollHeight = tableRef.current.scrollHeight;
      const containerHeight = tableRef.current.clientHeight;
      const maxScroll = scrollHeight - containerHeight;
      return { maxScroll, needsScrolling: scrollHeight > containerHeight };
    };
    
    const { maxScroll, needsScrolling } = calculateDimensions();
    
    if (!needsScrolling) return;
    
    // Tính khoảng thời gian tính bằng mili giây - đảo ngược so với giá trị thanh trượt
    // 1 = chậm (100ms), 5 = nhanh (20ms)
    const intervalTime = 110 - (scrollSpeed * 20); // 1->100ms, 2->80ms, 3->60ms, 4->40ms, 5->20ms
    
    // Bắt đầu cuộn từ vị trí hiện tại thay vì reset
    scrollIntervalRef.current = setInterval(() => {
      if (!tableRef.current) return;
      
      // Tạm dừng khi đang ở cuối danh sách
      if (isPausingRef.current) {
        return;
      }
      
      // Tăng vị trí cuộn và lưu vào ref để giữ giữa các lần cập nhật data
      currentPositionRef.current += 1;
      tableRef.current.scrollTop = currentPositionRef.current;
      
      // Xử lý khi cuộn đến cuối
      if (currentPositionRef.current >= maxScroll) {
        // Đánh dấu đang tạm dừng để không cập nhật dữ liệu ngay lúc này
        isPausingRef.current = true;
        
        // Tạm dừng ở cuối
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
        
        setTimeout(() => {
          if (tableRef.current) {
            // Reset về đầu nhưng giữ mượt mà
            tableRef.current.style.scrollBehavior = 'auto';
            currentPositionRef.current = 0;
            tableRef.current.scrollTop = 0;
            
            setTimeout(() => {
              if (tableRef.current) {
                // Bật lại animation
                tableRef.current.style.scrollBehavior = 'smooth';
                
                // Bật lại auto-scroll sau khi ở đầu
                isPausingRef.current = false;
                
                // Nếu data đã thay đổi trong lúc tạm dừng, cập nhật lại dataRef
                if (dataNeedsRefreshRef.current) {
                  dataRef.current = [...data];
                  dataNeedsRefreshRef.current = false;
                }
                
                // Bắt đầu lại auto-scroll
                startScrolling();
              }
            }, 100);
          }
        }, 2000); // Tạm dừng 2 giây ở cuối danh sách
      }
    }, intervalTime);
  };
  
  // Function để reset vị trí cuộn về đầu
  const resetScroll = () => {
    // Chỉ resetScroll khi đang không ở trạng thái pause
    if (!isPausingRef.current) {
      // Reset vị trí cuộn
      currentPositionRef.current = 0;
      if (tableRef.current) tableRef.current.scrollTop = 0;
      
      // Xóa interval hiện tại nếu có
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
      
      // Khởi động lại quá trình cuộn sau một chút độ trễ
      setTimeout(() => {
        if (autoScroll && !scrollIntervalRef.current) {
          startScrolling();
        }
      }, 300);
    }
  };
  
  // Cập nhật dataRef khi data thay đổi
  useEffect(() => {
    // So sánh dữ liệu mới và cũ để biết có thay đổi không
    const dataChanged = JSON.stringify(dataRef.current) !== JSON.stringify(data);
    
    if (dataChanged) {
      console.log(`[${type}] Dữ liệu thay đổi, cập nhật hiển thị`);
      
      if (isPausingRef.current) {
        // Nếu đang ở trạng thái pause, đánh dấu để cập nhật sau
        dataNeedsRefreshRef.current = true;
      } else {
        // Cập nhật ngay
        dataRef.current = [...data];
        
        // Khởi động lại quá trình cuộn nếu cần
        if (autoScroll && tableRef.current && data.length > 8) {
          resetScroll();
        }
      }
    }
  }, [data, autoScroll, type]);
  
  // Logic tự động cuộn tách biệt khỏi data
  useEffect(() => {
    if (!autoScroll || !tableRef.current || data.length <= 8) {
      // Nếu không bật autoScroll hoặc không đủ dữ liệu, dừng cuộn
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    } else {
      // Thỏa điều kiện để auto-scroll nhưng chưa có interval
      if (!scrollIntervalRef.current && !isPausingRef.current) {
        startScrolling();
      }
    }
    
    // Cleanup
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [autoScroll, data.length]);
  
  // Update cho scrollSpeed
  useEffect(() => {
    // Chỉ cập nhật tốc độ nếu đang có interval
    if (scrollIntervalRef.current && autoScroll && !isPausingRef.current) {
      // Restart để áp dụng tốc độ mới
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
      
      if (autoScroll) {
        startScrolling();
      }
    }
  }, [scrollSpeed, autoScroll]);
  
  // Cung cấp phương thức resetScroll cho component cha thông qua ref
  useImperativeHandle(ref, () => ({
    resetScroll
  }));

  // Xử lý khi component unmount
  useEffect(() => {
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, []);

  if (!data || data.length === 0) {
    return (
      <Card variant="outlined">
        <CardHeader sx={{ bgcolor: backgroundColor }} title={title} />
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Không có dữ liệu
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Các function hỗ trợ sắp xếp
  const descendingComparator = (a, b, orderBy) => {
    // Map orderBy với trường thích hợp trong data
    const fieldMap = {
      'waiting': type === 'phongKham' ? 'so_benh_nhan_chua_kham' : 
                type === 'phongThucHien' ? 'so_ca_chua_thuc_hien' : 'so_benh_nhan_chua_lay_mau',
      'processed': type === 'phongKham' ? 'so_benh_nhan_da_kham' : 
                  type === 'phongThucHien' ? 'so_ca_da_thuc_hien_cho_ket_qua' : 'so_benh_nhan_da_lay_mau',
      'completed': type === 'phongKham' ? 'so_benh_nhan_kham_xong' : 
                  type === 'phongThucHien' ? 'so_ca_da_tra_ket_qua' : 'so_ca_da_tra_ket_qua',
      'max_number': 'max_sothutunumber'
    };

    const field = fieldMap[orderBy] || orderBy;

    if (b[field] < a[field]) {
      return -1;
    }
    if (b[field] > a[field]) {
      return 1;
    }
    return 0;
  };

  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const sortData = (array, comparator) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const columns = getColumnsDefinition(type);
  const filteredColumns = columns.filter(column => visibleColumns[column.id]);
  const sortedData = sortData(data, getComparator(order, orderBy));

  // Calculate total counts
  const totalPatients = data.reduce((acc, row) => {
    const count = type === 'phongKham' ? row.tong_benh_nhan : 
                  type === 'phongThucHien' ? row.tong_benh_nhan : row.tong_benh_nhan;
    return acc + Number(count || 0);
  }, 0);

  return (
    <Card 
      elevation={2} 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {/* Loading indicator overlay - subtle linear progress at the top */}
      {isLoading && (
        <Fade in={isLoading}>
          <LinearProgress 
            sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              zIndex: 1
            }}
          />
        </Fade>
      )}

      <CardHeader 
        title={
          <Box display="flex" alignItems="center" flexWrap="wrap">
            <Typography 
              variant={isSmallScreen ? "subtitle1" : "h6"} 
              component="div" 
              color='#1939B7'
              sx={{ mr: 1 }}
            >
              {title}
            </Typography>
            <Chip 
              label={`${data.length} phòng`} 
              size="small" 
              color="secondary" 
              sx={{ 
                fontSize: isSmallScreen ? '0.7rem' : '0.75rem',
                height: isSmallScreen ? '22px' : '24px',
                mr: 1
              }} 
            />
            <Chip 
              label={`${totalPatients} ${type === 'phongThucHien' ? 'chỉ định' : 'bệnh nhân'}` } 
              size="small" 
              color="primary" 
              sx={{ 
                fontSize: isSmallScreen ? '0.7rem' : '0.75rem',
                height: isSmallScreen ? '22px' : '24px'
              }} 
            />
          </Box>
        }
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={autoScroll}
                    onChange={(e) => setAutoScroll(e.target.checked)}
                    size="small"
                  />
                }
                label={<Typography variant="caption" sx={{ fontSize: isSmallScreen ? '0.65rem' : '0.75rem' }}>Tự cuộn</Typography>}
                sx={{ ml: 1 }}
              />
              <Box sx={{ 
                ml: 2, 
                display: 'flex', 
                alignItems: 'center',
                ...(isSmallScreen && { display: 'none' })
              }}>
                <Typography variant="caption" sx={{ mr: 1, fontSize: isSmallScreen ? '0.65rem' : '0.75rem' }}>
                  Tốc độ
                </Typography>
                <Tooltip title="Điều chỉnh tốc độ cuộn">
                  <Box>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={scrollSpeed}
                      onChange={(e) => setScrollSpeed(Number(e.target.value))}
                      disabled={!autoScroll}
                      style={{ width: '60px' }}
                    />
                  </Box>
                </Tooltip>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: isSmallScreen ? 1 : 0 }}>
              <Tooltip title="Chi tiết số thứ tự theo phòng">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              {/* Nút quản lý cột */}
              <Tooltip title="Hiển thị/ẩn cột">
                <IconButton 
                  size="small" 
                  sx={{ ml: 1, color: theme => theme.palette.info.main }}
                  onClick={handleOpenColumnsMenu}
                >
                  <ViewColumnIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              {/* Nút điều chỉnh độ cao */}
              <Tooltip title="Điều chỉnh độ cao bảng">
                <IconButton 
                  size="small"
                  sx={{ ml: 1, color: theme => theme.palette.success.main }}
                  onClick={handleOpenHeightAdjust}
                  data-type={type} // Thêm thuộc tính data-type để dễ dàng xác định được loại phòng
                >
                  <HeightIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            
            {/* Popover điều chỉnh độ cao */}
            <Popover
              open={Boolean(heightAdjustAnchor)}
              anchorEl={heightAdjustAnchor}
              onClose={handleCloseHeightAdjust}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
              PaperProps={{
                sx: { p: 2, width: 280 }
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Điều chỉnh độ cao bảng {type === 'phongLayMau' ? '(Phòng lấy mẫu)' : 
                                       type === 'phongThucHien' ? '(Phòng thực hiện)' : 
                                       '(Phòng khám)'}
              </Typography>
              <Box sx={{ px: 1, pt: 1 }}>
                <Slider
                  value={tableHeight}
                  onChange={handleHeightChange}
                  min={200}
                  max={800}
                  step={20}
                  marks={[
                    { value: 200, label: '200px' },
                    { value: 440, label: '440px' },
                    { value: 600, label: '600px' },
                    { value: 800, label: '800px' }
                  ]}
                  valueLabelDisplay="auto"
                  aria-labelledby="table-height-slider"
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button 
                  size="small" 
                  onClick={() => {
                    setTableHeight(440); // Đặt lại giá trị mặc định
                    console.log(`[${type}] Đặt lại độ cao mặc định: 440px`);
                  }}
                  variant="contained"
                  color="secondary"
                  sx={{ 
                    fontWeight: 'bold'
                  }}
                >
                  Mặc định
                </Button>
                <Button 
                  size="small" 
                  onClick={handleCloseHeightAdjust}
                  variant="contained"
                  color="primary"
                >
                  Áp dụng
                </Button>
              </Box>
            </Popover>
            
            {/* Menu quản lý cột */}
            <Menu
              anchorEl={columnsMenuAnchor}
              open={Boolean(columnsMenuAnchor)}
              onClose={handleCloseColumnsMenu}
              PaperProps={{
                sx: { maxHeight: 300, width: 250 }
              }}
            >
              <Box sx={{ 
                p: 1.5, 
                display: 'flex', 
                flexDirection: 'column',
                gap: 1
              }}>
                <Button 
                  size="small" 
                  onClick={showAllColumns}
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ 
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    py: 0.8,
                    color: 'white'
                  }}
                >
                  Hiện tất cả
                </Button>
                <Button 
                  size="small" 
                  onClick={hideAllColumns}
                  variant="contained"
                  color="info"
                  fullWidth
                  sx={{ 
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    py: 0.8,
                    color: 'white'
                  }}
                >
                  Ẩn tất cả
                </Button>
                <Button 
                  size="small" 
                  onClick={() => {
                    // Reset cấu hình hiển thị cột về mặc định
                    resetColumnVisibility(type);
                    setVisibleColumns(generateInitialColumnVisibility(type));
                    handleCloseColumnsMenu();
                  }}
                  variant="contained"
                  color="secondary"
                  startIcon={<RestartAltIcon />}
                  fullWidth
                  sx={{ 
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    py: 0.8,
                    color: 'white'
                  }}
                >
                  Mặc định
                </Button>
              </Box>
              <Divider />
              {columns.map((column) => (
                <MenuItem 
                  key={column.id}
                  onClick={() => toggleColumnVisibility(column.id)}
                  dense
                  disabled={column.id === 'departmentname'} // Không cho phép ẩn cột tên phòng
                >
                  <Checkbox 
                    checked={visibleColumns[column.id]} 
                    size="small"
                    color="primary"
                  />
                  <ListItemText 
                    primary={column.label}
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      style: { 
                        fontWeight: visibleColumns[column.id] ? 'bold' : 'normal',
                        color: visibleColumns[column.id] ? undefined : '#666'
                      }
                    }} 
                  />
                </MenuItem>
              ))}
            </Menu>
          </Box>
        }
        sx={{ 
          bgcolor: backgroundColor,
          pb: 1,
          '& .MuiCardHeader-content': { display: 'flex' },
          opacity: isLoading ? 0.8 : 1,
          transition: 'opacity 0.3s ease',
          flexDirection: { xs: 'column', sm: 'row' },
          '& .MuiCardHeader-action': { 
            margin: 0, 
            alignSelf: 'flex-end',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-end', md: 'center' },
            mt: { xs: 1, sm: 0 }
          }
        }}
      />
      
      <CardContent sx={{ p: 0, flex: 1, overflow: 'auto' }}>
        <TableContainer 
          ref={tableRef} 
          component={Paper} 
          sx={{ 
            maxHeight: tableHeight, 
            boxShadow: 'none',
            // Thêm overflow-x để đảm bảo cuộn ngang khi có nhiều cột
            overflowX: 'auto',
            // Đảm bảo Phòng lấy mẫu với nhiều cột hiển thị đúng
            ...(type === 'phongLayMau' && {
              '& .MuiTable-root': {
                tableLayout: 'fixed',
                minWidth: filteredColumns.length * 100, // Đảm bảo bảng đủ rộng cho tất cả các cột
              }
            })
          }}
        >
          <Table stickyHeader size="small" aria-label={`${title} table`}>
            <TableHead>
              <TableRow>
                {filteredColumns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ 
                      minWidth: column.minWidth, 
                      fontWeight: 'bold', 
                      color: '#1939B7',
                      ...(isSmallScreen && { 
                        padding: '8px 4px', 
                        fontSize: '0.75rem' 
                      }),
                      ...(column.style || {}) // Thêm vào style từ định nghĩa cột
                    }}
                  >
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
                      IconComponent={orderBy === column.id ? 
                        (order === 'asc' ? ArrowUpwardIcon : ArrowDownwardIcon) : undefined}
                      sx={{
                        color: '#1939B7',
                        '&.MuiTableSortLabel-active': {
                          color: '#1939B7',
                        },
                        '& .MuiTableSortLabel-icon': {
                          color: '#1939B7 !important',
                        }
                      }}
                    >
                      {isSmallScreen ? 
                        (column.shortLabel || column.label) : 
                        column.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((row, index) => (
                <StripedTableRow
                  hover
                  key={index}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    opacity: isLoading ? 0.7 : 1,
                    transition: 'opacity 0.3s ease'
                  }}
                >
                  {filteredColumns.map((column) => {
                    const value = column.getValue ? column.getValue(row) : row[column.id];
                    // Tạo loại hiển thị khác nhau dựa vào ID của cột
                    if (column.id === 'departmentname') {
                      return (
                        <TableCell key={column.id} align={column.align}>
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              color: '#1939B7',
                              ...(isSmallScreen && { fontSize: '0.75rem' })
                            }}
                          >
                            {value}
                          </Typography>
                        </TableCell>
                      );
                    } else if (column.id === 'next_number') {
                      return (
                        <TableCell key={column.id} align={column.align}>
                          <NextNumberDisplay 
                            value={value} 
                            type={type} 
                            isSmallScreen={isSmallScreen}
                          />
                        </TableCell>
                      );
                    } else if (column.id === 'waiting' || column.id === 'cases_not_sampled' || column.id === 'patients_not_sampled') {
                      return (
                        <TableCell key={column.id} align={column.align}>
                          <EnhancedCellValue 
                            value={value} 
                            type="waiting" 
                            label={column.label} 
                            sx={{ 
                              color: '#1939B7',
                              ...(isSmallScreen && { fontSize: '0.75rem' })
                            }} 
                          />
                        </TableCell>
                      );
                    } else if (column.id === 'completed' || column.id === 'cases_sampled' || column.id === 'patients_sampled') {
                      return (
                        <TableCell key={column.id} align={column.align}>
                          <EnhancedCellValue 
                            value={value} 
                            type="completed" 
                            label={column.label} 
                            sx={{ 
                              color: '#1939B7',
                              ...(isSmallScreen && { fontSize: '0.75rem' })
                            }} 
                          />
                        </TableCell>
                      );
                    } else if (column.id === 'pending_result' || column.id === 'in_progress') {
                      return (
                        <TableCell key={column.id} align={column.align}>
                          <EnhancedCellValue 
                            value={value} 
                            type="info" 
                            label={column.label} 
                            sx={{ 
                              color: '#1939B7',
                              ...(isSmallScreen && { fontSize: '0.75rem' })
                            }} 
                          />
                        </TableCell>
                      );
                    } else if (column.id === 'total_patients' || column.id === 'total_cls') {
                      return (
                        <TableCell key={column.id} align={column.align}>
                          <EnhancedCellValue 
                            value={value} 
                            type="total" 
                            label={column.label} 
                            sx={{ 
                              color: '#1939B7',
                              ...(isSmallScreen && { fontSize: '0.75rem' })
                            }} 
                          />
                        </TableCell>
                      );
                    } else if (column.id.includes('max_') || column.id.includes('latest_')) {
                      // Các cột STT lớn nhất hoặc gần nhất
                      return (
                        <TableCell key={column.id} align={column.align}>
                          <EnhancedCellValue 
                            value={value} 
                            type="info" 
                            label={column.label} 
                            sx={{ 
                              color: '#1939B7',
                              ...(isSmallScreen && { fontSize: '0.75rem' })
                            }} 
                          />
                        </TableCell>
                      );
                    } else {
                      return (
                        <TableCell 
                          key={column.id} 
                          align={column.align} 
                          sx={{ 
                            color: '#1939B7',
                            ...(isSmallScreen && { 
                              padding: '8px 4px', 
                              fontSize: '0.75rem' 
                            })
                          }}
                        >
                          {value}
                        </TableCell>
                      );
                    }
                  })}
                </StripedTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
});

export default SoThuTuDataCard;