import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Container, Typography, Card, useMediaQuery } from '@mui/material';
import { commonStyle, commonStyleLeft } from '../../../utils/heplFuntion';
import { useTheme } from '@emotion/react';
import { useSelector } from 'react-redux';
import bcgiaobanSlice from '../bcgiaobanSlice';

function ThongKeHeNgoai({ baocaongays }){
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  let commonStyleReponsive = isSmallScreen ? {...commonStyle, fontSize: '0.8rem'} : {...commonStyle};
  let commonStyleLeftReponsive = isSmallScreen ? {...commonStyleLeft, fontSize: '0.8rem'} : {...commonStyleLeft};

  const {darkMode} = useSelector((state)=>state.mytheme)
  commonStyleReponsive = darkMode?{...commonStyleReponsive,color:"#FFF"}:{...commonStyleReponsive}
  commonStyleLeftReponsive = darkMode?{...commonStyleLeftReponsive,color:'#FFF'}:{...commonStyleLeftReponsive}

  const {bcGiaoBanCurent} = useSelector((state)=>state.bcgiaoban)
  const getRowData = () => {
    let totalRow = {
      TenKhoa: 'Tổng',
      BSTruc: '',
      'ls-TongNB': 0,
      'ls-NgoaiGio': 0,
      'ls-ChuyenVien': 0,
      'ls-TuVong': 0,
      'ls-Nang': 0,
      'ls-XinVe': 0,
      'ls-PhauThuat':0,
      'ls-MoCC':0,
    };

    const rows = baocaongays.map((entry) => {
      const row = {
        TenKhoa: entry.KhoaID.TenKhoa,
        BSTruc: entry.BSTruc,
      };

      ['ls-TongNB', 'ls-NgoaiGio', 'ls-ChuyenVien', 'ls-TuVong', 'ls-Nang', 'ls-XinVe','ls-PhauThuat','ls-MoCC'].forEach((code) => {
        row[code] = 0;
      });

      entry.ChiTietChiSo.forEach((chitiet) => {
        if (row.hasOwnProperty(chitiet.ChiSoCode)) {
          row[chitiet.ChiSoCode] = chitiet.SoLuong;
          totalRow[chitiet.ChiSoCode] += chitiet.SoLuong;
        }
      });

      return row;
    });

    rows.unshift(totalRow);

    return rows;
  };

  const rows = getRowData();

  return (
    <Container sx={{my:1}}  id='tongtruchengoai'>
     
     <TableContainer component={Paper}>
     <Card  sx={{ fontWeight: 'bold',color: '#f2f2f2',backgroundColor:'#1939B7', p:1,
        boxShadow: 3,borderRadius:3
       }}>
   <Typography sx={{fontSize: isSmallScreen?'1rem':'1.3rem'}} > Trực lãnh đạo:{bcGiaoBanCurent?.TrucLanhDao} </Typography>
   <Typography sx={{fontSize: isSmallScreen?'1rem':'1.3rem'}} > Tổng trực:{bcGiaoBanCurent?.TTHeNgoai}  </Typography>
   </Card>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell style={commonStyleReponsive}>Khoa</TableCell>
            <TableCell style={commonStyleReponsive}>Bác sĩ trực</TableCell>
            <TableCell style={commonStyleReponsive}>Tổng số</TableCell>
            <TableCell style={commonStyleReponsive}>Vào viện</TableCell>
            <TableCell style={commonStyleReponsive}>Chuyển viện</TableCell>
            <TableCell style={commonStyleReponsive}>Tử vong</TableCell>
            <TableCell style={commonStyleReponsive}>NB nặng</TableCell>
            <TableCell style={commonStyleReponsive}>Xin về</TableCell>
            <TableCell style={commonStyleReponsive}>PT ngoài giờ</TableCell>
            <TableCell style={commonStyleReponsive}>PT CC trong giờ</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              <TableCell style={commonStyleLeftReponsive}>{row.TenKhoa}</TableCell>
              <TableCell style={commonStyleLeftReponsive}>{row.BSTruc}</TableCell>
              <TableCell style={commonStyleReponsive}>{row['ls-TongNB']}</TableCell>
              <TableCell style={commonStyleReponsive}>{row['ls-NgoaiGio']}</TableCell>
              <TableCell style={commonStyleReponsive}>{row['ls-ChuyenVien']}</TableCell>
              <TableCell style={commonStyleReponsive}>{row['ls-TuVong']}</TableCell>
              <TableCell style={commonStyleReponsive}>{row['ls-Nang']}</TableCell>
              <TableCell style={commonStyleReponsive}>{row['ls-XinVe']}</TableCell>
              <TableCell style={commonStyleReponsive}>{row['ls-PhauThuat']}</TableCell>
              <TableCell style={commonStyleReponsive}>{row['ls-MoCC']}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </Container>
  );
};

export default ThongKeHeNgoai;
