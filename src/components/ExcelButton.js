import React from 'react';
import { Button, Container } from '@mui/material';
import * as XLSX from 'xlsx';
import { useDispatch } from 'react-redux';
import { importNhanViens } from 'features/NhanVien/nhanvienSlice';

const ExcelButton = () => {
  const dispatch = useDispatch();
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    } 
    const reader = new FileReader();

    reader.onload = (e) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      dispatch(importNhanViens(jsonData))
      console.log(jsonData);
      // jsonData.forEach((item) => {
      //   console.log(item);
      // });
    };

    reader.readAsBinaryString(file);
  };

  const handleClick = () => {
    document.getElementById('fileInput').click();
  };

  return (
    <Container>
      <input
        type="file"
        id="fileInput"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept=".xlsx, .xls"
      />
      <Button variant="contained" color="primary" onClick={handleClick}>
        Nhập từ Excel
      </Button>
    </Container>
  );
};

export default ExcelButton;