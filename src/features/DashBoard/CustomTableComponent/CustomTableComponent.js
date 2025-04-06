import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Card,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@emotion/react";
import { useSelector } from "react-redux";
import { commonStyle, commonStyleLeft } from "utils/heplFuntion";

function CustomTableComponent({ 
  data = [], // Đặt giá trị mặc định là mảng rỗng
  columns = [], // Đặt giá trị mặc định là mảng rỗng
  titles = [], // Đặt giá trị mặc định là mảng rỗng
  roundingFunction = (value) => value,
  formatFunction = () => null
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
    height: "35px",
    "& td, & th": { padding: "5px", border: "1px solid #ddd" },
  };

  // Đảm bảo columns không phải là null trước khi filter
  const safeColumns = columns || [];
  
  // Tách các cột có rowSpan và colSpan (header chính)
  const headerColumns = safeColumns.filter(col => col.colSpan);
  // Tách các cột có rowSpan (cột dữ liệu chính)
  const mainDataColumns = safeColumns.filter(col => col.rowSpan && col.name);
  // Tách các cột con (không có rowSpan, colSpan nhưng có name)
  const subColumns = safeColumns.filter(col => !col.rowSpan && !col.colSpan && col.name);

  // Lọc ra các cột có thuộc tính name để hiển thị dữ liệu
  const dataColumns = safeColumns.filter(col => col.name);

  return (
    <Box sx={{ my: 1, width: '100%' }} id="custom-table">
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
          {/* Kiểm tra titles trước khi map */}
          {(titles || []).map((title, index) => (
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
              {/* Kiểm tra mainDataColumns trước khi map */}
              {(mainDataColumns || []).map((col, index) => (
                <TableCell
                  key={`main-${index}`}
                  style={commonStyleReponsive}
                  rowSpan={col.rowSpan || 1}
                >
                  {col.header}
                </TableCell>
              ))}
              {/* Kiểm tra headerColumns trước khi map */}
              {(headerColumns || []).map((col, index) => (
                <TableCell
                  key={`header-${index}`}
                  style={commonStyleReponsive}
                  colSpan={col.colSpan || 1}
                >
                  {col.header}
                </TableCell>
              ))}
            </TableRow>
            {subColumns.length > 0 && (
              <TableRow sx={rowStyle}>
                {/* Kiểm tra subColumns trước khi map */}
                {subColumns.map((col, index) => (
                  <TableCell
                    key={`sub-${index}`}
                    style={commonStyleReponsive}
                  >
                    {col.header}
                  </TableCell>
                ))}
              </TableRow>
            )}
          </TableHead>
          <TableBody>
            {/* Kiểm tra data trước khi map */}
            {(data || []).map((row, rowIndex) => (
              <TableRow key={rowIndex} sx={rowStyle}>
                {/* Kiểm tra dataColumns trước khi map */}
                {(dataColumns || []).map((col, colIndex) => {
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