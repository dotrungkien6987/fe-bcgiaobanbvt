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
  tinhChenhLech_DoanhThu_BacSi,
  tinhChenhlech_CanLamSang,
} from "../../../utils/heplFuntion";
import { useTheme } from "@emotion/react";
import { useSelector } from "react-redux";

function TableDoanhThuKhoaBacSi({ doanhthu_table, doanhthu_ChenhLech,ngayhientai }) {

 
  
  console.log("Doanh thu chenh lech", doanhthu_ChenhLech)
  const theme = useTheme();
  const hienthiChenhLech = ngayhientai!==1
  const { darkMode } = useSelector((state) => state.mytheme);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  let commonStyleReponsive = isSmallScreen
    ? { ...commonStyle, fontSize: "0.7rem", zIndex: 100 }
    : { ...commonStyle, fontSize: "0.95rem", zIndex: 100 };
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
      : { fontSize: "0.9rem", padding: "10px" },
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
              <TableCell style={commonStyleReponsive}>NB tự trả</TableCell>
              <TableCell style={commonStyleReponsive}>MRI 3.0</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {doanhthu_table && doanhthu_ChenhLech &&
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
                    style={{ backgroundColor: "#CDF5BC" }}
                  >
                    <TableCell style={commonStyleReponsive} colSpan={2}>
                      {row.username}
                    </TableCell>
                    <TableCell style={commonStyleReponsive}>
                      {VND.format(row.tongdoanhthu)}
                    {doanhthu_ChenhLech[index].tongdoanhthu !== 0 && hienthiChenhLech && (
                  <Typography
                      sx={{
                        fontSize: "0.8rem",
                        color:
                          doanhthu_ChenhLech[index].tongdoanhthu > 0 ? "green" : "red",
                        display: "block", // Đảm bảo giá trị được hiển thị trên một dòng mới
                      }}
                    >
                      {/* Kiểm tra giá trị chênh lệch để thêm dấu + hoặc - */}
                      {doanhthu_ChenhLech[index].tongdoanhthu > 0
                        ? `+${VND.format(doanhthu_ChenhLech[index].tongdoanhthu)}`
                        : VND.format(doanhthu_ChenhLech[index].tongdoanhthu)}
                    </Typography>
                  )}
                    </TableCell>
                    <TableCell style={commonStyleReponsive}>
                      {VND.format(row.bhyt)}
                      {doanhthu_ChenhLech[index].bhyt !== 0 && hienthiChenhLech && (
                  <Typography
                      sx={{
                        fontSize: "0.8rem",
                        color:
                          doanhthu_ChenhLech[index].bhyt > 0 ? "green" : "red",
                        display: "block", // Đảm bảo giá trị được hiển thị trên một dòng mới
                      }}
                    >
                      {/* Kiểm tra giá trị chênh lệch để thêm dấu + hoặc - */}
                      {doanhthu_ChenhLech[index].bhyt > 0
                        ? `+${VND.format(doanhthu_ChenhLech[index].bhyt)}`
                        : VND.format(doanhthu_ChenhLech[index].bhyt)}
                    </Typography>
                  )}
                      </TableCell>
                    <TableCell style={commonStyleReponsive}>
                      {VND.format(row.dongchitra)}
                      {doanhthu_ChenhLech[index].dongchitra !== 0 && hienthiChenhLech && (
                  <Typography
                      sx={{
                        fontSize: "0.8rem",
                        color:
                          doanhthu_ChenhLech[index].dongchitra > 0 ? "green" : "red",
                        display: "block", // Đảm bảo giá trị được hiển thị trên một dòng mới
                      }}
                    >
                      {/* Kiểm tra giá trị chênh lệch để thêm dấu + hoặc - */}
                      {doanhthu_ChenhLech[index].dongchitra > 0
                        ? `+${VND.format(doanhthu_ChenhLech[index].dongchitra)}`
                        : VND.format(doanhthu_ChenhLech[index].dongchitra)}
                    </Typography>
                  )}
                      </TableCell>
                    <TableCell style={commonStyleReponsive} >
                      {VND.format(row.thutructiep)}
                      {doanhthu_ChenhLech[index].thutructiep !== 0 && hienthiChenhLech && (
                  <Typography
                      sx={{
                        fontSize: "0.8rem",
                        color:
                          doanhthu_ChenhLech[index].thutructiep > 0 ? "green" : "red",
                        display: "block", // Đảm bảo giá trị được hiển thị trên một dòng mới
                      }}
                    >
                      {/* Kiểm tra giá trị chênh lệch để thêm dấu + hoặc - */}
                      {doanhthu_ChenhLech[index].thutructiep > 0
                        ? `+${VND.format(doanhthu_ChenhLech[index].thutructiep)}`
                        : VND.format(doanhthu_ChenhLech[index].thutructiep)}
                    </Typography>
                  )}
                      </TableCell>
                    <TableCell style={commonStyleReponsive}>
                      {VND.format(row.tienmri30)}
                      {doanhthu_ChenhLech[index].tienmri30 !== 0 && hienthiChenhLech && (
                  <Typography
                      sx={{
                        fontSize: "0.8rem",
                        color:
                          doanhthu_ChenhLech[index].tienmri30 > 0 ? "green" : "red",
                        display: "block", // Đảm bảo giá trị được hiển thị trên một dòng mới
                      }}
                    >
                      {/* Kiểm tra giá trị chênh lệch để thêm dấu + hoặc - */}
                      {doanhthu_ChenhLech[index].tienmri30 > 0
                        ? `+${VND.format(doanhthu_ChenhLech[index].tienmri30)}`
                        : VND.format(doanhthu_ChenhLech[index].tienmri30)}
                    </Typography>
                  )}</TableCell>
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
                    <TableCell style={commonStyleReponsive} sx={{ backgroundColor: "#ccffcc" }}>
                      {VND.format(row.tongdoanhthu)}
                      {doanhthu_ChenhLech[index]?.tongdoanhthu !== 0 && hienthiChenhLech && (
                  <Typography
                      sx={{
                        fontSize: "0.8rem",
                        color:
                          doanhthu_ChenhLech[index]?.tongdoanhthu > 0 ? "green" : "red",
                        display: "block", // Đảm bảo giá trị được hiển thị trên một dòng mới
                      }}
                      
                    >
                      {/* Kiểm tra giá trị chênh lệch để thêm dấu + hoặc - */}
                      {doanhthu_ChenhLech[index]?.tongdoanhthu > 0
                        ? `+${VND.format(doanhthu_ChenhLech[index]?.tongdoanhthu)}`
                        : VND.format(doanhthu_ChenhLech[index]?.tongdoanhthu)}
                    </Typography>
                  )}
                    </TableCell>
                  
                    <TableCell style={commonStyleReponsive} sx={{ backgroundColor: "#fff9c4" }}>
                      {VND.format(row.bhyt)}
                      {doanhthu_ChenhLech[index].bhyt !== 0 && hienthiChenhLech && (
                  <Typography
                      sx={{
                        fontSize: "0.8rem",
                        color:
                          doanhthu_ChenhLech[index].bhyt > 0 ? "green" : "red",
                        display: "block", // Đảm bảo giá trị được hiển thị trên một dòng mới
                      }}
                    >
                      {/* Kiểm tra giá trị chênh lệch để thêm dấu + hoặc - */}
                      {doanhthu_ChenhLech[index].bhyt > 0
                        ? `+${VND.format(doanhthu_ChenhLech[index].bhyt)}`
                        : VND.format(doanhthu_ChenhLech[index].bhyt)}
                    </Typography>
                  )}
                    </TableCell>
                    <TableCell style={commonStyleReponsive}  sx={{ backgroundColor: "#E2C4C4" }}>
                      {VND.format(row.dongchitra)}
                      {doanhthu_ChenhLech[index].dongchitra !== 0 && hienthiChenhLech && (
                  <Typography
                      sx={{
                        fontSize: "0.8rem",
                        color:
                          doanhthu_ChenhLech[index].dongchitra > 0 ? "green" : "red",
                        display: "block", // Đảm bảo giá trị được hiển thị trên một dòng mới
                      }}
                    >
                      {/* Kiểm tra giá trị chênh lệch để thêm dấu + hoặc - */}
                      {doanhthu_ChenhLech[index].dongchitra > 0
                        ? `+${VND.format(doanhthu_ChenhLech[index].dongchitra)}`
                        : VND.format(doanhthu_ChenhLech[index].dongchitra)}
                    </Typography>
                  )}
                    </TableCell>
                    <TableCell style={commonStyleReponsive} sx={{ backgroundColor: "#ccffcc" }}>
                      {VND.format(row.thutructiep)}
                      {doanhthu_ChenhLech[index].thutructiep !== 0 && hienthiChenhLech && (
                  <Typography
                      sx={{
                        fontSize: "0.8rem",
                        color:
                          doanhthu_ChenhLech[index].thutructiep > 0 ? "green" : "red",
                        display: "block", // Đảm bảo giá trị được hiển thị trên một dòng mới
                      }}
                    >
                      {/* Kiểm tra giá trị chênh lệch để thêm dấu + hoặc - */}
                      {doanhthu_ChenhLech[index].thutructiep > 0
                        ? `+${VND.format(doanhthu_ChenhLech[index].thutructiep)}`
                        : VND.format(doanhthu_ChenhLech[index].thutructiep)}
                    </Typography>
                  )}
                    </TableCell>
                    <TableCell style={commonStyleReponsive} sx={{ backgroundColor: "#f3e5f5" }}>
                      {VND.format(row.tienmri30)}
                      {doanhthu_ChenhLech[index].tienmri30 !== 0 && hienthiChenhLech && (
                  <Typography
                      sx={{
                        fontSize: "0.8rem",
                        color:
                          doanhthu_ChenhLech[index].tienmri30 > 0 ? "green" : "red",
                        display: "block", // Đảm bảo giá trị được hiển thị trên một dòng mới
                      }}
                    >
                      {/* Kiểm tra giá trị chênh lệch để thêm dấu + hoặc - */}
                      {doanhthu_ChenhLech[index].tienmri30 > 0
                        ? `+${VND.format(doanhthu_ChenhLech[index].tienmri30)}`
                        : VND.format(doanhthu_ChenhLech[index].tienmri30)}
                    </Typography>
                  )}
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
