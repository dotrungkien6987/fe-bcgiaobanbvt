import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Container,
  Typography,
  Card,
  useMediaQuery,
  Box,
} from "@mui/material";
import {
  ConvertDoanhThuBacSiKhoa,
  commonStyle,
  commonStyleLeft,
  tinhChenhlech_CanLamSang,
} from "../../../utils/heplFuntion";
import { useTheme } from "@emotion/react";
import { useSelector } from "react-redux";

function TableDoanhThuKhoaBacSi({ doanhthu, doanhthu_NgayChenhLech }) {

  const doanhthu_table = ConvertDoanhThuBacSiKhoa(doanhthu);
  const theme = useTheme();
  const { darkMode } = useSelector((state) => state.mytheme);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  let commonStyleReponsive = isSmallScreen
    ? { ...commonStyle, fontSize: "0.7rem", zIndex: 100 }
    : { ...commonStyle, fontSize: "0.85rem", zIndex: 100 };
  let commonStyleLeftReponsive = isSmallScreen
    ? { ...commonStyleLeft, fontSize: "0.7rem" }
    : { ...commonStyleLeft, fontSize: "0.85rem" };
  commonStyleReponsive = darkMode
    ? { ...commonStyleReponsive, color: "#FFF" }
    : { ...commonStyleReponsive };
  commonStyleLeftReponsive = darkMode
    ? { ...commonStyleLeftReponsive, color: "#FFF" }
    : { ...commonStyleLeftReponsive };

  const commonStyleLeftReponsiveRed = {
    ...commonStyleLeftReponsive,
    color: "#bb1515",
  };

  const VND = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });

  const styles = {
    stickyColumn: {
      position: "sticky",
      left: 0,
      background: "white",
      zIndex: 1,
    },
    stickyColumnSecond: {
      position: "sticky",
      left: 50, // Giả định rằng chiều rộng của cột đầu tiên là 50px
      background: "white",
      zIndex: 1,
    },
    tableContainer: {
      overflowX: "auto",
    },
    commonStyleReponsive: isSmallScreen
      ? { fontSize: "0.7rem", padding: "8px" }
      : { fontSize: "0.85rem", padding: "10px" },
  };

  styles.commonStyleReponsive = darkMode
    ? {
        ...styles.commonStyleReponsive,
        color: "#FFF",
        backgroundColor: "#424242",
      }
    : { ...styles.commonStyleReponsive, backgroundColor: "#f2f2f2" };

  return (
    <Box sx={{ my: 1 }}>
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
        <Typography
          sx={{
            fontSize: isSmallScreen ? "1rem" : "1.3rem",
            textAlign: "center",
          }}
        >
          {" "}
          Doanh thu khoa theo bác sĩ
        </Typography>
      </Card>
      <TableContainer component={Paper} style={styles.tableContainer}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={commonStyleReponsive}>STT</TableCell>
              <TableCell style={commonStyleReponsive}>Bác sĩ</TableCell>

              <TableCell style={commonStyleReponsive}>Tổng tiền</TableCell>
              
              <TableCell style={commonStyleReponsive}>BHYT</TableCell>
              <TableCell style={commonStyleReponsive}>Đồng chi trả</TableCell>
              <TableCell style={commonStyleReponsive}>Thu trực tiếp</TableCell>
              <TableCell style={commonStyleReponsive}>MRI 3.0</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {doanhthu_table &&
              doanhthu_table.map((row, index) => {

                if(index===0) {
                  return (
                    <TableRow
                    key={index}
                    sx={{
                      backgroundColor: darkMode
                        ? "#424242"
                        : "#f2f2f2", // Đặt màu nền cho dòng đầu tiên
                    }}
                  >
                    <TableCell style={commonStyleReponsive} colSpan={2}>
                      {row.username}
                    </TableCell>
                    <TableCell style={commonStyleReponsive}>{row.tongdoanhthu}</TableCell>
                    <TableCell style={commonStyleReponsive}>{row.bhyt}</TableCell>
                    <TableCell style={commonStyleReponsive}>{row.dongchitra}</TableCell>
                    <TableCell style={commonStyleReponsive}>{row.thutructiep}</TableCell>
                    <TableCell style={commonStyleReponsive}>{row.tienmri30}</TableCell>
                  </TableRow>
                  )
                }
                else {
                  return (
                    <TableRow
                    key={index}
                    sx={{
                      backgroundColor: darkMode
                        ? index % 2 === 0
                          ? "#424242"
                          : "#616161" // Màu cho chế độ tối
                        : index % 2 === 0
                        ? "#f2f2f2"
                        : "#e0e0e0", // Màu cho chế độ sáng
                    }}
                  >
                    <TableCell style={commonStyleReponsive}>
                      {index }
                    </TableCell>
                    <TableCell style={commonStyleReponsive}>
                      {row.username}
                    </TableCell>
                    <TableCell style={commonStyleReponsive}>
                      {row.tongdoanhthu}
                    </TableCell>
                  
                    <TableCell style={commonStyleReponsive}>
                      {row.bhyt}
                    </TableCell>
                    <TableCell style={commonStyleReponsive}>
                      {row.dongchitra}
                    </TableCell>
                    <TableCell style={commonStyleReponsive}>
                      {row.thutructiep}
                    </TableCell>
                    <TableCell style={commonStyleReponsive}>
                      {row.tienmri30}
                    </TableCell>
                   
                  </TableRow>
                  )
                }
                
})}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default TableDoanhThuKhoaBacSi;
