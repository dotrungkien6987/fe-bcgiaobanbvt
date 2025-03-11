import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box, // Thay Container bằng Box
  Typography,
  Card,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@emotion/react";
import { useSelector } from "react-redux";
import { commonStyle, commonStyleLeft } from "utils/heplFuntion";

function CustomTableComponent({ 
  data, 
  columns, 
  titles, 
  roundingFunction = (value) => value, // Hàm làm tròn số mặc định giữ nguyên giá trị
  formatFunction = () => null // Hàm định dạng mặc định không thay đổi style
}) {
  const theme = useTheme();
  const { darkMode } = useSelector((state) => state.mytheme);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  let commonStyleReponsive = isSmallScreen
    ? { ...commonStyle, fontSize: "0.8rem" }
    : { ...commonStyle };
  let commonStyleLeftReponsive = isSmallScreen
    ? { ...commonStyleLeft, fontSize: "0.8rem" }
    : { ...commonStyleLeft };
  commonStyleReponsive = darkMode
    ? { ...commonStyleReponsive, color: "#FFF" }
    : { ...commonStyleReponsive };
  commonStyleLeftReponsive = darkMode
    ? { ...commonStyleLeftReponsive, color: "#FFF" }
    : { ...commonStyleLeftReponsive };

  const rowStyle = {
    height: "35px", // Adjust the height as needed
    "& td, & th": { padding: "5px", border: "1px solid #ddd" }, // Adjust the padding and border as needed
  };

  // Tách các cột có rowSpan và colSpan (header chính)
  const headerColumns = columns.filter(col => col.colSpan);
  // Tách các cột có rowSpan (cột dữ liệu chính)
  const mainDataColumns = columns.filter(col => col.rowSpan && col.name);
  // Tách các cột con (không có rowSpan, colSpan nhưng có name)
  const subColumns = columns.filter(col => !col.rowSpan && !col.colSpan && col.name);

  // Lọc ra các cột có thuộc tính name để hiển thị dữ liệu
  const dataColumns = columns.filter(col => col.name);

  return (
    <Box sx={{ my: 1, width: '100%' }} id="custom-table"> {/* Thay Container bằng Box */}
      <TableContainer component={Paper}>
        <Card
          sx={{
            fontWeight: "bold",
            color: "#f2f2f2",
            backgroundColor: "#1939B7",
            p: 1,
            boxShadow: 3,
            borderRadius: 3,
          }}
        >
          {titles.map((title, index) => (
            <Typography
              key={index}
              sx={{ textAlign: "center", fontSize: isSmallScreen ? "1rem" : "1.3rem" }}
            >
              {title}
            </Typography>
          ))}
        </Card>
        <Table>
          <TableHead>
            <TableRow sx={rowStyle}>
              {/* Hiển thị các cột có rowSpan (dữ liệu chính) */}
              {mainDataColumns.map((col, index) => (
                <TableCell
                  key={`main-${index}`}
                  style={commonStyleReponsive}
                  rowSpan={col.rowSpan || 1}
                >
                  {col.header}
                </TableCell>
              ))}
              {/* Hiển thị các cột header gộp */}
              {headerColumns.map((col, index) => (
                <TableCell
                  key={`header-${index}`}
                  style={commonStyleReponsive}
                  colSpan={col.colSpan || 1}
                >
                  {col.header}
                </TableCell>
              ))}
            </TableRow>
            <TableRow sx={rowStyle}>
              {/* Hiển thị các cột con */}
              {subColumns.map((col, index) => (
                <TableCell
                  key={`sub-${index}`}
                  style={commonStyleReponsive}
                >
                  {col.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex} sx={rowStyle}>
                {/* Chỉ hiển thị dữ liệu từ các cột có thuộc tính name */}
                {dataColumns.map((col, colIndex) => {
                  const rawValue = row[col.name];
                  // Áp dụng hàm làm tròn nếu giá trị là số
                  const value = typeof rawValue === 'number' 
                    ? roundingFunction(rawValue) 
                    : rawValue;
                  
                  // Lấy style tùy chỉnh từ hàm định dạng (nếu có)
                  const customStyle = formatFunction(col.name, value, row);
                  
                  // Kết hợp style mặc định với style tùy chỉnh
                  const cellStyle = {
                    ...commonStyleLeftReponsive,
                    ...(customStyle || {})
                  };
                  
                  return (
                    <TableCell key={colIndex} style={cellStyle}>
                      {value}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default CustomTableComponent;