import React, { useState } from 'react';
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
  Pagination,
  Stack,
  TableSortLabel,
  LinearProgress,
  Fade
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const SoThuTuDataCard = ({ title, data, type, backgroundColor, isLoading = false }) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState('departmentname');
  const [order, setOrder] = useState('asc');

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

  // Sort function
  const sortData = (array, comparator) => {
    return [...array].sort(comparator);
  };

  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const descendingComparator = (a, b, orderBy) => {
    // Field name differences based on API structure
    const fieldMap = {
      'departmentname': 'departmentname',
      'patient_count': type === 'phongKham' ? 'tong_benh_nhan' : 
                        type === 'phongThucHien' ? 'tong_benh_nhan' : 'tong_benh_nhan',
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Column definition based on room type
  const getColumns = () => {
    const commonColumns = [
      { id: 'departmentname', label: 'Tên phòng', minWidth: 150 },
      { id: 'patient_count', label: 'Số bệnh nhân', minWidth: 100, align: 'right', 
        getValue: (row) => type === 'phongKham' ? row.tong_benh_nhan : 
                          (type === 'phongThucHien' ? row.tong_benh_nhan : row.tong_benh_nhan) },
      { id: 'max_number', label: 'STT lớn nhất', minWidth: 100, align: 'right',
        getValue: (row) => row.max_sothutunumber }
    ];

    // Type specific columns
    let typeColumns = [];
    
    if (type === 'phongKham') {
      typeColumns = [
        { id: 'waiting', label: 'Chưa khám', minWidth: 100, align: 'right',
          getValue: (row) => row.so_benh_nhan_chua_kham },
        { id: 'processed', label: 'Đang khám', minWidth: 100, align: 'right',
          getValue: (row) => row.so_benh_nhan_da_kham },
        { id: 'completed', label: 'Đã khám', minWidth: 100, align: 'right',
          getValue: (row) => row.so_benh_nhan_kham_xong }
      ];
    } else if (type === 'phongThucHien') {
      typeColumns = [
        { id: 'waiting', label: 'Chưa thực hiện', minWidth: 100, align: 'right',
          getValue: (row) => row.so_ca_chua_thuc_hien },
        { id: 'processed', label: 'Chờ kết quả', minWidth: 100, align: 'right',
          getValue: (row) => row.so_ca_da_thuc_hien_cho_ket_qua },
        { id: 'completed', label: 'Đã trả KQ', minWidth: 100, align: 'right',
          getValue: (row) => row.so_ca_da_tra_ket_qua }
      ];
    } else if (type === 'phongLayMau') {
      typeColumns = [
        { id: 'waiting', label: 'Chưa lấy mẫu', minWidth: 100, align: 'right',
          getValue: (row) => row.so_benh_nhan_chua_lay_mau },
        { id: 'processed', label: 'Đã lấy mẫu', minWidth: 100, align: 'right',
          getValue: (row) => row.so_benh_nhan_da_lay_mau },
        { id: 'completed', label: 'Đã trả KQ', minWidth: 100, align: 'right',
          getValue: (row) => row.so_ca_da_tra_ket_qua }
      ];
    }

    return [...commonColumns, ...typeColumns];
  };

  const columns = getColumns();
  const sortedData = sortData(data, getComparator(order, orderBy));

  // Pagination
  const paginatedData = sortedData.slice(
    (page - 1) * rowsPerPage,
    (page - 1) * rowsPerPage + rowsPerPage
  );

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
          <Box display="flex" alignItems="center">
            <Typography variant="h6" component="div">
              {title}
            </Typography>
            <Chip 
              label={`${totalPatients} bệnh nhân`} 
              size="small" 
              color="primary" 
              sx={{ ml: 2 }}
            />
            <Tooltip title="Chi tiết số thứ tự theo phòng">
              <IconButton size="small" sx={{ ml: 1 }}>
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        }
        sx={{ 
          bgcolor: backgroundColor,
          pb: 1,
          '& .MuiCardHeader-content': { display: 'flex' },
          opacity: isLoading ? 0.8 : 1,
          transition: 'opacity 0.3s ease'
        }}
      />
      <CardContent sx={{ p: 0, flex: 1, overflow: 'auto' }}>
        <TableContainer component={Paper} sx={{ maxHeight: 440, boxShadow: 'none' }}>
          <Table stickyHeader size="small" aria-label={`${title} table`}>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth, fontWeight: 'bold' }}
                  >
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
                      IconComponent={orderBy === column.id ? 
                        (order === 'asc' ? ArrowUpwardIcon : ArrowDownwardIcon) : undefined}
                    >
                      {column.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row, index) => (
                <TableRow
                  hover
                  key={index}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    opacity: isLoading ? 0.7 : 1,
                    transition: 'opacity 0.3s ease'
                  }}
                >
                  {columns.map((column) => {
                    const value = column.getValue ? column.getValue(row) : row[column.id];
                    return (
                      <TableCell key={column.id} align={column.align}>
                        {value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <Stack spacing={2}>
          <Pagination
            count={Math.ceil(data.length / rowsPerPage)}
            page={page}
            onChange={handleChangePage}
            size="small"
            showFirstButton
            showLastButton
          />
        </Stack>
      </Box>
    </Card>
  );
};

export default SoThuTuDataCard;