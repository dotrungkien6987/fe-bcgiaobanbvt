// filepath: d:\project\webBV\fe-bcgiaobanbvt\src\features\HoatDongBenhVien\HoatDongDataCard.js
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
import EnhancedCellValue from './EnhancedCellValue';

// Import cấu hình hiển thị cột
import { generateInitialColumnVisibility, saveColumnVisibility, resetColumnVisibility } from './configs/columnConfig';

// Định nghĩa hàm getColumns ở bên ngoài component để tránh lỗi
const getColumnsDefinition = (type) => {
  // Cột chung cho tất cả các loại hoạt động
  const commonColumns = [
    { 
      id: 'TenKhoa', 
      label: 'Tên khoa phòng', 
      minWidth: 240,
      align: 'left', 
      color: '#1939B7',
    },
    {
      id: 'DieuDuong',
      label: 'Điều dưỡng trực',
      minWidth: 150,
      align: 'left',
      color: '#1939B7',
    },
    {
      id: 'BacSi',
      label: 'Bác sĩ trực',
      minWidth: 150,
      align: 'left',
      color: '#1939B7',
    },
    {
      id: 'GhiChu',
      label: 'Ghi chú',
      minWidth: 180,
      align: 'left',
      color: '#1939B7',
    }
  ];

  // Cột riêng cho từng loại hoạt động
  let typeColumns = [];
  
  if (type === 'noiTru') {
    // Type 3: Phòng nội trú
    typeColumns = [
      { id: 'total_count', label: 'Tổng số bệnh nhân', minWidth: 70, align: 'center',
        getValue: (row) => row.total_count, color: '#1939B7' },
      { id: 'bhyt_count', label: 'BN BHYT', minWidth: 70, align: 'center',
        getValue: (row) => row.bhyt_count, color: '#1939B7' },
      { id: 'vienphi_count', label: 'BN viện phí', minWidth: 70, align: 'center',
        getValue: (row) => row.vienphi_count, color: '#1939B7' },
      { id: 'yeucau_count', label: 'BN yêu cầu', minWidth: 70, align: 'center',
        getValue: (row) => row.yeucau_count, color: '#1939B7' },
      { id: 'dang_dieu_tri', label: 'Đang điều trị', minWidth: 70, align: 'center',
        getValue: (row) => row.dang_dieu_tri, color: '#1939B7' },
      { id: 'dieu_tri_ket_hop', label: 'Điều trị kết hợp', minWidth: 70, align: 'center',
        getValue: (row) => row.dieu_tri_ket_hop, color: '#1939B7' },
      { id: 'benh_nhan_ra_vien', label: 'BN ra viện', minWidth: 70, align: 'center',
        getValue: (row) => row.benh_nhan_ra_vien, color: '#1939B7' },
    ];
  } else if (type === 'ngoaiTru') {
    // Type 2: Phòng khám (Ngoại trú)
    typeColumns = [
      { id: 'tong_benh_nhan', label: 'Tổng BN', minWidth: 70, align: 'center',
        getValue: (row) => row.tong_benh_nhan, color: '#1939B7' },
      { id: 'so_benh_nhan_chua_kham', label: 'BN chưa khám', minWidth: 70, align: 'center',
        getValue: (row) => row.so_benh_nhan_chua_kham, color: '#1939B7' },
      { id: 'so_benh_nhan_da_kham', label: 'BN đã khám', minWidth: 70, align: 'center',
        getValue: (row) => row.so_benh_nhan_da_kham, color: '#1939B7' },
      { id: 'so_benh_nhan_kham_xong', label: 'BN khám xong', minWidth: 70, align: 'center',
        getValue: (row) => row.so_benh_nhan_kham_xong, color: '#1939B7' },
      { id: 'max_sothutunumber', label: 'STT lớn nhất', minWidth: 70, align: 'center',
        getValue: (row) => row.max_sothutunumber, color: '#1939B7' },
      { id: 'max_sothutunumber_da_kham', label: 'STT đã khám', minWidth: 70, align: 'center',
        getValue: (row) => row.max_sothutunumber_da_kham, color: '#1939B7' },
      { id: 'latest_benh_nhan_da_kham', label: 'STT gần nhất', minWidth: 70, align: 'center',
        getValue: (row) => row.latest_benh_nhan_da_kham, color: '#1939B7' },
    ];
  } else if (type === 'thucHien') {
    // Type 7: Phòng thực hiện thủ thuật
    typeColumns = [
      { id: 'tong_mau_benh_pham', label: 'Tổng CLS', minWidth: 70, align: 'center',
        getValue: (row) => row.tong_mau_benh_pham, color: '#1939B7' },
      { id: 'tong_benh_nhan', label: 'Tổng BN', minWidth: 70, align: 'center',
        getValue: (row) => row.tong_benh_nhan, color: '#1939B7' },
      { id: 'so_ca_chua_thuc_hien', label: 'Chưa thực hiện', minWidth: 70, align: 'center',
        getValue: (row) => row.so_ca_chua_thuc_hien, color: '#1939B7' },
      { id: 'so_ca_da_thuc_hien_cho_ket_qua', label: 'Đợi kết quả', minWidth: 70, align: 'center',
        getValue: (row) => row.so_ca_da_thuc_hien_cho_ket_qua, color: '#1939B7' },
      { id: 'so_ca_da_tra_ket_qua', label: 'Đã trả KQ', minWidth: 70, align: 'center',
        getValue: (row) => row.so_ca_da_tra_ket_qua, color: '#1939B7' },
      { id: 'max_sothutunumber', label: 'STT lớn nhất', minWidth: 70, align: 'center',
        getValue: (row) => row.max_sothutunumber, color: '#1939B7' },
      { id: 'max_sothutunumber_da_thuc_hien', label: 'STT đã thực hiện', minWidth: 90, align: 'center',
        getValue: (row) => row.max_sothutunumber_da_thuc_hien, color: '#1939B7' },
    ];
  } else if (type === 'layMau') {
    // Type 38: Phòng lấy mẫu
    typeColumns = [
      { id: 'tong_mau_benh_pham', label: 'Tổng CLS', minWidth: 70, align: 'center',
        getValue: (row) => row.tong_mau_benh_pham, color: '#1939B7' },
      { id: 'tong_benh_nhan', label: 'Tổng BN', minWidth: 70, align: 'center',
        getValue: (row) => row.tong_benh_nhan, color: '#1939B7' },
      { id: 'so_ca_chua_lay_mau', label: 'Chưa lấy mẫu', minWidth: 70, align: 'center',
        getValue: (row) => row.so_ca_chua_lay_mau, color: '#1939B7' },
      { id: 'so_ca_da_lay_mau', label: 'Đã lấy mẫu', minWidth: 70, align: 'center',
        getValue: (row) => row.so_ca_da_lay_mau, color: '#1939B7' },
      { id: 'so_ca_da_tra_ket_qua', label: 'Đã trả KQ', minWidth: 70, align: 'center',
        getValue: (row) => row.so_ca_da_tra_ket_qua, color: '#1939B7' },
      { id: 'max_sothutunumber', label: 'STT lớn nhất', minWidth: 70, align: 'center',
        getValue: (row) => row.max_sothutunumber, color: '#1939B7' },
      { id: 'max_sothutunumber_da_lay_mau', label: 'STT đã lấy mẫu', minWidth: 90, align: 'center',
        getValue: (row) => row.max_sothutunumber_da_lay_mau, color: '#1939B7' },
    ];
  }

  return [...commonColumns, ...typeColumns];
};

const HoatDongDataCard = forwardRef(({ title, data, lichTrucData = [], type, backgroundColor, isLoading = false }, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State cho sắp xếp dữ liệu
  const [orderBy, setOrderBy] = useState('departmentname');
  const [order, setOrder] = useState('asc');
  
  // State cho hiển thị/ẩn cột
  const [columns, setColumns] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnMenuAnchorEl, setColumnMenuAnchorEl] = useState(null);
  
  // State để theo dõi việc tải nhanh các thông tin lịch trực
  const [fastLoadData, setFastLoadData] = useState([]);
  const [isLichTrucLoaded, setIsLichTrucLoaded] = useState(false);
  const [fastLoadVisible, setFastLoadVisible] = useState(true); // State mới để điều khiển hiển thị dữ liệu nhanh
  
  // State cho điều chỉnh chiều cao bảng
  const [tableHeight, setTableHeight] = useState(500); // Chiều cao mặc định
  const [heightMenuAnchorEl, setHeightMenuAnchorEl] = useState(null);
  
  // Ref để scroll bảng lên đầu khi dữ liệu thay đổi
  const tableContainerRef = useRef(null);

  // Tạo và cập nhật fastLoadData ngay khi có lichTrucData
  useEffect(() => {
    if (!lichTrucData || !Array.isArray(lichTrucData)) return;
    
    // Đánh dấu là đã tải lịch trực, ngay cả khi mảng rỗng
    setIsLichTrucLoaded(true);
    
    if (lichTrucData.length === 0) {
      // Nếu không có dữ liệu, đặt mảng rỗng
      setFastLoadData([]);
      setFastLoadVisible(false);
      return;
    }
    
    // Tạo bản đồ nhanh dựa trên lichTrucData
    const newFastLoadData = [];
    lichTrucData.forEach(lichTruc => {
      if (lichTruc?.KhoaID?.HisDepartmentID) {
        const departmentId = lichTruc.KhoaID.HisDepartmentID.toString();
        const departmentName = lichTruc.KhoaID.TenKhoa || '';
        
        // Xử lý dữ liệu DieuDuong và BacSi để hiển thị đúng
        let dieuDuongValue = '-';
        if (lichTruc?.DieuDuong) {
          dieuDuongValue = Array.isArray(lichTruc.DieuDuong) 
            ? lichTruc.DieuDuong.join(', ') 
            : lichTruc.DieuDuong;
        }
        
        let bacSiValue = '-';
        if (lichTruc?.BacSi) {
          bacSiValue = Array.isArray(lichTruc.BacSi)
            ? lichTruc.BacSi.join(', ') 
            : lichTruc.BacSi;
        }
        
        newFastLoadData.push({
          departmentId: departmentId,
          departmentname: departmentName,
          DieuDuong: dieuDuongValue,
          BacSi: bacSiValue,
          GhiChu: lichTruc?.GhiChu || '-'
        });
      }
    });
    
    setFastLoadData(newFastLoadData);
    // Hiển thị dữ liệu nhanh
    setFastLoadVisible(true);
    
  }, [lichTrucData]);
  
  // Ẩn dữ liệu nhanh khi có dữ liệu đầy đủ
  useEffect(() => {
    if (data && data.length > 0) {
      // Chờ một chút rồi ẩn dữ liệu nhanh
      const timer = setTimeout(() => {
        setFastLoadVisible(false);
      }, 300); // Tăng thời gian lên 300ms để đảm bảo dữ liệu đầy đủ được hiển thị
      return () => clearTimeout(timer);
    }
  }, [data]);

  // Khởi tạo cấu hình cột
  useEffect(() => {
    const cols = getColumnsDefinition(type);
    setColumns(cols);
    
    // Lấy trạng thái hiển thị cột từ localStorage, hoặc tạo mới nếu chưa có
    const visibility = generateInitialColumnVisibility(type, cols);
    
    // Luôn hiển thị các cột lịch trực
    if (visibility) {
      const updatedVisibility = {
        ...visibility,
        'departmentname': true, // Tên khoa
        'DieuDuong': true,      // Điều dưỡng trực
        'BacSi': true,          // Bác sĩ trực
        'GhiChu': true          // Ghi chú
      };
      setColumnVisibility(updatedVisibility);
    } else {
      setColumnVisibility(visibility);
    }
  }, [type]);

  // Enhance the data with lichTruc information
  const enhancedData = React.useMemo(() => {
    if (!data || !data.length) return [];
    
    // Ensure lichTrucData is always an array
    const trueListData = Array.isArray(lichTrucData) ? lichTrucData : [];
    
    // Thêm log để debug dữ liệu trong môi trường development
    if (process.env.NODE_ENV === 'development') {
      console.log('Tổng số lịch trực:', trueListData.length);
      if (trueListData.length > 0) {
        console.log('Mẫu dữ liệu lịch trực đầu tiên:', trueListData[0]);
      }
    }
    
    // Đánh dấu là đã tải xong dữ liệu lịch trực
    if (trueListData.length > 0) {
      setIsLichTrucLoaded(true);
    }
    
    // Tạo dữ liệu kết hợp
    return data.map(row => {
      const departmentId = row.departmentid?.toString();  
      
      // Find matching lichTruc entry for this department
      const lichTruc = trueListData.find(item => 
        item?.KhoaID && item.KhoaID.HisDepartmentID?.toString() === departmentId
      );
      
      // Xử lý dữ liệu DieuDuong, BacSi, và GhiChu
      let dieuDuongValue = '-';
      if (lichTruc?.DieuDuong) {
        dieuDuongValue = Array.isArray(lichTruc.DieuDuong) 
          ? lichTruc.DieuDuong.join(', ') 
          : lichTruc.DieuDuong;
      }
      
      let bacSiValue = '-';
      if (lichTruc?.BacSi) {
        bacSiValue = Array.isArray(lichTruc.BacSi) 
          ? lichTruc.BacSi.join(', ') 
          : lichTruc.BacSi;
      }
      
      return {
        ...row,
        // Add lichTruc data if available
        DieuDuong: dieuDuongValue,
        BacSi: bacSiValue, 
        GhiChu: lichTruc?.GhiChu || '-'
      };
    });
  }, [data, lichTrucData]);
  
  // Expose scrollToTop function to parent components
  useImperativeHandle(ref, () => ({
    scrollToTop: () => {
      if (tableContainerRef.current) {
        tableContainerRef.current.scrollTop = 0;
      }
    }
  }));
  
  // Handler cho việc sắp xếp dữ liệu
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    
    // Scroll lên đầu khi thay đổi sắp xếp
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
  };
  
  // Handler cho việc mở/đóng menu cấu hình cột
  const handleColumnMenuOpen = (event) => {
    setColumnMenuAnchorEl(event.currentTarget);
  };
  
  const handleColumnMenuClose = () => {
    setColumnMenuAnchorEl(null);
  };
  
  // Handler cho việc mở/đóng menu điều chỉnh chiều cao
  const handleHeightMenuOpen = (event) => {
    setHeightMenuAnchorEl(event.currentTarget);
  };
  
  const handleHeightMenuClose = () => {
    setHeightMenuAnchorEl(null);
  };
  
  // Handler cho việc thay đổi trạng thái hiển thị của cột
  const handleToggleColumn = (columnId) => {
    const newColumnVisibility = {
      ...columnVisibility,
      [columnId]: !columnVisibility[columnId]
    };
    setColumnVisibility(newColumnVisibility);
    saveColumnVisibility(type, newColumnVisibility);
  };
  
  // Handler cho việc reset cấu hình cột về mặc định
  const handleResetColumnVisibility = () => {
    const defaultVisibility = resetColumnVisibility(type, columns);
    setColumnVisibility(defaultVisibility);
    handleColumnMenuClose();
  };
  
  // Handler cho việc thay đổi chiều cao bảng
  const handleTableHeightChange = (event, newValue) => {
    setTableHeight(newValue);
  };
  
  // Sắp xếp dữ liệu
  const sortedData = React.useMemo(() => {
    if (!enhancedData || !enhancedData.length) return [];
    
    return [...enhancedData].sort((a, b) => {
      // Tìm cột cần sắp xếp
      const column = columns.find(col => col.id === orderBy);
      
      // Nếu cột có hàm getValue, sử dụng nó để lấy giá trị
      let aValue = column && column.getValue ? column.getValue(a) : a[orderBy];
      let bValue = column && column.getValue ? column.getValue(b) : b[orderBy];
      
      // Nếu giá trị là số, convert sang số để so sánh
      if (!isNaN(aValue) && !isNaN(bValue)) {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }
      
      // So sánh NULL và undefined giá trị
      if (aValue == null) return order === 'asc' ? -1 : 1;
      if (bValue == null) return order === 'asc' ? 1 : -1;
      
      // So sánh các giá trị thông thường
      if (order === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
      }
    });
  }, [enhancedData, orderBy, order, columns]);
  
  // Danh sách cột đang hiển thị (đã lọc theo columnVisibility)
  const visibleColumns = columns.filter(column => columnVisibility[column.id]);
  
  return (
    <Card 
      sx={{ 
        borderRadius: 2,
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: backgroundColor || 'background.paper'
      }}
    >
      <CardHeader
        title={
          <Typography variant="h6" component="div" sx={{ fontWeight: 'medium' }}>
            {title}
          </Typography>
        }
        action={
          <Box sx={{ display: 'flex' }}>
            {/* Nút cấu hình hiển thị cột */}
            <Tooltip title="Tùy chỉnh hiển thị cột">
              <IconButton
                size="small"
                onClick={handleColumnMenuOpen}
                sx={{ mr: 1 }}
              >
                <ViewColumnIcon />
              </IconButton>
            </Tooltip>
            
            {/* Nút điều chỉnh chiều cao bảng */}
            <Tooltip title="Điều chỉnh chiều cao bảng">
              <IconButton
                size="small"
                onClick={handleHeightMenuOpen}
              >
                <HeightIcon />
              </IconButton>
            </Tooltip>
          </Box>
        }
        sx={{
          bgcolor: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(0, 0, 0, 0.02)',
          borderBottom: `1px solid ${theme.palette.divider}`,
          p: 2
        }}
      />
      
      {/* Menu cấu hình hiển thị cột */}
      <Menu
        anchorEl={columnMenuAnchorEl}
        open={Boolean(columnMenuAnchorEl)}
        onClose={handleColumnMenuClose}
        PaperProps={{
          style: {
            maxHeight: 300,
            width: 250,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2">Hiển thị cột</Typography>
          <Tooltip title="Khôi phục mặc định">
            <IconButton size="small" onClick={handleResetColumnVisibility}>
              <RestartAltIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Divider />
        {columns.map((column) => (
          <MenuItem key={column.id} dense onClick={() => handleToggleColumn(column.id)}>
            <Checkbox
              checked={!!columnVisibility[column.id]}
              color="primary"
              size="small"
            />
            <ListItemText primary={column.label} />
          </MenuItem>
        ))}
      </Menu>
      
      {/* Menu điều chỉnh chiều cao bảng */}
      <Popover
        anchorEl={heightMenuAnchorEl}
        open={Boolean(heightMenuAnchorEl)}
        onClose={handleHeightMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ p: 2, width: 300 }}>
          <Typography variant="subtitle2" gutterBottom>
            Điều chỉnh chiều cao bảng
          </Typography>
          <Slider
            value={tableHeight}
            min={200}
            max={800}
            step={50}
            onChange={handleTableHeightChange}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}px`}
            marks={[
              { value: 200, label: '200px' },
              { value: 500, label: '500px' },
              { value: 800, label: '800px' },
            ]}
          />
        </Box>
      </Popover>
      
      <CardContent 
        sx={{ 
          p: 0, 
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        {/* Loading indicator */}
        {isLoading && (
          <Box sx={{ width: '100%', position: 'absolute', top: 0, zIndex: 2 }}>
            <Fade in={isLoading} timeout={300}>
              <LinearProgress color="primary" />
            </Fade>
          </Box>
        )}
        
        {/* Bảng dữ liệu */}
        <TableContainer 
          ref={tableContainerRef}
          component={Paper}
          elevation={0}
          sx={{ 
            height: tableHeight,
            maxHeight: '100%',
            overflow: 'auto',
            flexGrow: 1,
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.2)' 
                : 'rgba(0, 0, 0, 0.2)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(0, 0, 0, 0.05)',
            },
          }}
        >
          <Table stickyHeader aria-label="hoạt động bệnh viện table" size="small">
            <TableHead>
              <TableRow>
                {visibleColumns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ 
                      minWidth: column.minWidth,
                      ...column.style
                    }}
                    sortDirection={orderBy === column.id ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
                      IconComponent={orderBy === column.id ? 
                        (order === 'asc' ? ArrowUpwardIcon : ArrowDownwardIcon) : undefined}
                    >
                      <Typography 
                        variant="subtitle2" 
                        component="div"
                        noWrap
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: isMobile ? '0.7rem' : '0.8rem',
                          color: column.color || 'inherit'
                        }}
                      >
                        {column.label}
                      </Typography>
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Hiển thị dữ liệu đầy đủ khi đã tải xong */}
              {!isLoading && sortedData && sortedData.length > 0 ? (
                sortedData.map((row, index) => (
                  <StripedTableRow key={row.id || index}>
                    {visibleColumns.map((column) => {
                      // Tên khoa phòng hiển thị đặc biệt
                      if (column.id === 'departmentname') {
                        return (
                          <TableCell 
                            key={column.id} 
                            align={column.align}
                            sx={{ 
                              pl: 2,
                              fontWeight: 'medium',
                              color: column.color || 'inherit'
                            }}
                          >
                            <Typography 
                              variant="body2" 
                              component="div"
                              noWrap
                              sx={{ 
                                fontWeight: 'bold',
                                fontSize: isMobile ? '0.7rem' : '0.8rem',
                                color: column.color || 'inherit'
                              }}
                            >
                              {row[column.id]}
                            </Typography>
                          </TableCell>
                        );
                      }
                      
                      // Hiển thị trực tiếp các trường DieuDuong, BacSi, GhiChu
                      if (column.id === 'DieuDuong' || column.id === 'BacSi' || column.id === 'GhiChu') {
                        return (
                          <TableCell 
                            key={column.id} 
                            align={column.align}
                          >
                            <Typography 
                              variant="body2" 
                              component="div"
                              sx={{ 
                                fontSize: isMobile ? '0.7rem' : '0.75rem',
                                color: column.color || 'inherit'
                              }}
                            >
                              {row[column.id]}
                            </Typography>
                          </TableCell>
                        );
                      }
                      
                      // Lấy giá trị từ hàm getValue nếu có
                      const value = column.getValue 
                        ? column.getValue(row) 
                        : row[column.id];
                      
                      return (
                        <TableCell 
                          key={column.id} 
                          align={column.align}
                        >
                          <EnhancedCellValue 
                            value={value} 
                            type={'info'}
                            label={column.label}
                          />
                        </TableCell>
                      );
                    })}
                  </StripedTableRow>
                ))
              ) : null}
              
              {/* Hiển thị dữ liệu tải nhanh khi đang tải dữ liệu đầy đủ */}
              {((isLoading || !sortedData || sortedData.length === 0) && fastLoadData.length > 0 && fastLoadVisible) && (
                <>
                  <TableRow>
                    <TableCell 
                      colSpan={visibleColumns.length}
                      align="center"
                      sx={{ 
                        py: 1,
                        backgroundColor: 'rgba(25, 118, 210, 0.08)'
                      }}
                    >
                      <Typography variant="caption" color="primary">
                        Hiển thị dữ liệu lịch trực nhanh trong khi chờ tải dữ liệu đầy đủ...
                      </Typography>
                    </TableCell>
                  </TableRow>
                  {fastLoadData.map((row, index) => (
                    <StripedTableRow key={`fast-${index}`}>
                      {/* Hiển thị các cột cơ bản */}
                      {visibleColumns.map((column, colIndex) => {
                        // Hiển thị tên khoa phòng
                        if (column.id === 'departmentname') {
                          return (
                            <TableCell 
                              key={`fast-${column.id}`}
                              align="left"
                              sx={{ 
                                pl: 2,
                                fontWeight: 'medium',
                                color: '#1939B7'
                              }}
                            >
                              <Typography 
                                variant="body2" 
                                component="div"
                                noWrap
                                sx={{ 
                                  fontWeight: 'bold',
                                  fontSize: isMobile ? '0.7rem' : '0.8rem',
                                  color: '#1939B7'
                                }}
                              >
                                {row.departmentname}
                              </Typography>
                            </TableCell>
                          );
                        }
                        
                        // Hiển thị DieuDuong, BacSi, GhiChu
                        if (column.id === 'DieuDuong' || column.id === 'BacSi' || column.id === 'GhiChu') {
                          return (
                            <TableCell 
                              key={`fast-${column.id}`}
                              align="left"
                            >
                              <Typography 
                                variant="body2" 
                                component="div"
                                sx={{ 
                                  fontSize: isMobile ? '0.7rem' : '0.75rem',
                                  color: '#1939B7'
                                }}
                              >
                                {row[column.id]}
                              </Typography>
                            </TableCell>
                          );
                        }
                        
                        // Các cột khác hiển thị "Đang tải..."
                        return (
                          <TableCell 
                            key={`fast-loading-${colIndex}`}
                            align="center"
                          >
                            <Typography variant="caption" color="text.secondary" fontStyle="italic">
                              Đang tải...
                            </Typography>
                          </TableCell>
                        );
                      })}
                    </StripedTableRow>
                  ))}
                </>
              )}
              
              {/* Hiển thị thông báo khi không có dữ liệu */}
              {!isLoading && (!sortedData || sortedData.length === 0) && fastLoadData.length === 0 && (
                <TableRow>
                  <TableCell 
                    colSpan={visibleColumns.length}
                    align="center"
                    sx={{ py: 3 }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Không có dữ liệu
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              
              {/* Hiển thị thông báo đang tải khi không có cả dữ liệu đầy đủ và dữ liệu nhanh */}
              {isLoading && fastLoadData.length === 0 && (
                <TableRow>
                  <TableCell 
                    colSpan={visibleColumns.length}
                    align="center"
                    sx={{ py: 3 }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Đang tải dữ liệu...
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
});

export default HoatDongDataCard;
