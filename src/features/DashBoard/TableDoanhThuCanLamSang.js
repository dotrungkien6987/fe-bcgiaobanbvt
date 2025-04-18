import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  
  Typography,
  Card,
  useMediaQuery,
  Box,
} from "@mui/material";
import { commonStyle, commonStyleLeft } from "../../utils/heplFuntion";
import { useTheme } from "@emotion/react";
import { useSelector } from "react-redux";

function TableDoanhThuCanLamSang({ canlamsangDuyetKeToan, canlamsangChiDinh,ngayhientai}) {
  
  const theme = useTheme();
  const hienthiChenhLech = ngayhientai!==1
  const { darkMode } = useSelector((state) => state.mytheme);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  let commonStyleReponsive = isSmallScreen
    ? { ...commonStyle, fontSize: "0.7rem", zIndex: 100 }
    : { ...commonStyle, fontSize: "0.85rem",zIndex: 100 };
  let commonStyleLeftReponsive = isSmallScreen
    ? { ...commonStyleLeft, fontSize: "0.7rem" }
    : { ...commonStyleLeft, fontSize: "0.85rem" };
  commonStyleReponsive = darkMode
    ? { ...commonStyleReponsive, color: "#FFF" }
    : { ...commonStyleReponsive };
  commonStyleLeftReponsive = darkMode
    ? { ...commonStyleLeftReponsive, color: "#FFF" }
    : { ...commonStyleLeftReponsive };

  const VND = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });

  const styles = {
    stickyColumn: {
      position: 'sticky',
      left: 0,
      background: 'white',
      zIndex: 1,
    },
    stickyColumnSecond: {
      position: 'sticky',
      left: 50,  // Giả định rằng chiều rộng của cột đầu tiên là 50px
      background: 'white',
      zIndex: 1,
    },
    tableContainer: {
      overflowX: 'auto',
    },
    commonStyleReponsive: isSmallScreen
      ? { fontSize: "0.7rem", padding: "8px" }
      : { fontSize: "0.85rem", padding: "10px" },
  };

  styles.commonStyleReponsive = darkMode
  ? { ...styles.commonStyleReponsive, color: "#FFF", backgroundColor: "#424242" }
  : { ...styles.commonStyleReponsive, backgroundColor: "#f2f2f2" };

  return (
    <Box sx={{ my: 1 }}>
       <Card  sx={{ fontWeight: 'bold',color: '#f2f2f2',backgroundColor:'#1939B7', p:1,
        boxShadow: 3,borderRadius:3
       }}>
   <Typography sx={{fontSize:isSmallScreen?'1rem' :'1.3rem', textAlign:'center'}} > Tổng hợp cận lâm sàng trong tháng</Typography>
   
   </Card>
      <TableContainer component={Paper} style={styles.tableContainer} >
        <Table>
          <TableHead>
            <TableRow>
              {/* 2 cột đầu tiên chiếm 3 dòng */}
              <TableCell style={{ ...commonStyleReponsive, ...styles.stickyColumn }} rowSpan={3}>
                STT
              </TableCell>
              <TableCell style={{ ...commonStyleReponsive, ...styles.stickyColumnSecond }} rowSpan={3}>
                Nhóm cận lâm sàng
              </TableCell>

              {/* Ngoại tỉnh chiếm 1 dòng, sau đó chia làm 2 cột ở dòng tiếp theo */}
              <TableCell style={commonStyleReponsive} colSpan={5}>
                Đã duyệt kế toán
              </TableCell>
              <TableCell style={commonStyleReponsive} colSpan={5}>
               Theo chỉ định
              </TableCell>
            
            </TableRow>
            <TableRow>
              {/* Ngoại tỉnh: Ngoại trú, Nội trú */}
              <TableCell style={commonStyleReponsive}>
                Số lượng
              </TableCell>
              <TableCell style={commonStyleReponsive}>
                BHYT
              </TableCell>
              <TableCell style={commonStyleReponsive}>Đồng chi trả</TableCell>
              <TableCell style={commonStyleReponsive}>
               Thu trực tiếp
              </TableCell>
              <TableCell style={commonStyleReponsive}>
               Tổng Doanh thu (Duyệt kế toán)
              </TableCell>
              <TableCell style={commonStyleReponsive}>
               Tổng Doanh thu (Theo chỉ định)
              </TableCell>

              <TableCell style={commonStyleReponsive}>Số lượng</TableCell>
              <TableCell style={commonStyleReponsive}>
                BHYT
              </TableCell>
              <TableCell style={commonStyleReponsive}>Đồng chi trả</TableCell>
              <TableCell style={commonStyleReponsive}>
               Thu trực tiếp
              </TableCell>
             
            </TableRow>
            
          </TableHead>
          <TableBody>
            {canlamsangDuyetKeToan.name && canlamsangDuyetKeToan.name.map((row, index) => (
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
                <TableCell style={{...commonStyleReponsive,...styles.stickyColumn}}>{index+1}</TableCell>
                <TableCell style={{...commonStyleReponsive,...styles.stickyColumnSecond}}>
                  {row}
                </TableCell>
                <TableCell
                  style={commonStyleReponsive}
                  sx={{ backgroundColor: "#f3e5f5" }}
                >
                  <Typography>{canlamsangDuyetKeToan.soluong[index]}</Typography>
                  {canlamsangDuyetKeToan.soluong_chenhlech[index] !== 0 && hienthiChenhLech&& (
                    <Typography
                      sx={{
                        fontSize: "0.8rem",
                        color:
                          canlamsangDuyetKeToan.soluong_chenhlech[index] > 0 ? "green" : "red",
                        display: "block", // Đảm bảo giá trị được hiển thị trên một dòng mới
                      }}
                    >
                      {/* Kiểm tra giá trị chênh lệch để thêm dấu + hoặc - */}
                      {canlamsangDuyetKeToan.soluong_chenhlech[index] > 0
                        ? `+${canlamsangDuyetKeToan.soluong_chenhlech[index]}`
                        :canlamsangDuyetKeToan.soluong_chenhlech[index]}
                    </Typography>
                  )}
                </TableCell>
                <TableCell
                  style={commonStyleReponsive}
                  sx={{ backgroundColor: "#fff9c4" }}
                >
                  <Typography>{VND.format(canlamsangDuyetKeToan.bhyt[index])}</Typography>
                  {canlamsangDuyetKeToan.bhyt_chenhlech[index] !== 0 && hienthiChenhLech && hienthiChenhLech&&  (
                    <Typography
                      sx={{
                        fontSize: "0.8rem",
                        color:
                          canlamsangDuyetKeToan.bhyt_chenhlech[index] > 0 ? "green" : "red",
                        display: "block", // Đảm bảo giá trị được hiển thị trên một dòng mới
                      }}
                    >
                      {/* Kiểm tra giá trị chênh lệch để thêm dấu + hoặc - */}
                      {canlamsangDuyetKeToan.bhyt_chenhlech[index] > 0
                        ? `+${VND.format(canlamsangDuyetKeToan.bhyt_chenhlech[index])}`
                        : VND.format(canlamsangDuyetKeToan.bhyt_chenhlech[index])}
                    </Typography>
                  )}
                </TableCell>
                <TableCell
                  style={commonStyleReponsive}
                  sx={{ backgroundColor: "#E2C4C4" }}
                >
                  <Typography>{VND.format(canlamsangDuyetKeToan.dongchitra[index])}</Typography>
                  {canlamsangDuyetKeToan.dongchitra_chenhlech[index] !== 0 && hienthiChenhLech && (
                  <Typography
                      sx={{
                        fontSize: "0.8rem",
                        color:
                          canlamsangDuyetKeToan.dongchitra_chenhlech[index] > 0 ? "green" : "red",
                        display: "block", // Đảm bảo giá trị được hiển thị trên một dòng mới
                      }}
                    >
                      {/* Kiểm tra giá trị chênh lệch để thêm dấu + hoặc - */}
                      {canlamsangDuyetKeToan.dongchitra_chenhlech[index] > 0
                        ? `+${VND.format(canlamsangDuyetKeToan.dongchitra_chenhlech[index])}`
                        : VND.format(canlamsangDuyetKeToan.dongchitra_chenhlech[index])}
                    </Typography>
                  )}
                </TableCell>
                <TableCell
                  style={commonStyleReponsive}
                  sx={{ backgroundColor: "#ccffcc" }}
                >
                  <Typography>{VND.format(canlamsangDuyetKeToan.thutructiep[index])}</Typography>
                  {canlamsangDuyetKeToan.thutructiep_chenhlech[index] !== 0 && hienthiChenhLech && (
                  <Typography
                      sx={{
                        fontSize: "0.8rem",
                        color:
                          canlamsangDuyetKeToan.thutructiep_chenhlech[index] > 0 ? "green" : "red",
                        display: "block", // Đảm bảo giá trị được hiển thị trên một dòng mới
                      }}
                    >
                      {/* Kiểm tra giá trị chênh lệch để thêm dấu + hoặc - */}
                      {canlamsangDuyetKeToan.thutructiep_chenhlech[index] > 0
                        ? `+${VND.format(canlamsangDuyetKeToan.thutructiep_chenhlech[index])}`
                        : VND.format(canlamsangDuyetKeToan.thutructiep_chenhlech[index])}
                    </Typography>
                  )}
                </TableCell>

                <TableCell
                  style={commonStyleReponsive}
                  sx={{ backgroundColor: "#fff9c4" }}
                >
                  <Typography>{VND.format(canlamsangDuyetKeToan.tongdoanhthu[index])}</Typography>
                  {canlamsangDuyetKeToan.tongdoanhthu_chenhlech[index] !== 0 && hienthiChenhLech && (
                  <Typography
                      sx={{
                        fontSize: "0.8rem",
                        color:
                          canlamsangDuyetKeToan.tongdoanhthu_chenhlech[index] > 0 ? "green" : "red",
                        display: "block", // Đảm bảo giá trị được hiển thị trên một dòng mới
                      }}
                    >
                      {/* Kiểm tra giá trị chênh lệch để thêm dấu + hoặc - */}
                      {canlamsangDuyetKeToan.tongdoanhthu_chenhlech[index] > 0
                        ? `+${VND.format(canlamsangDuyetKeToan.tongdoanhthu_chenhlech[index])}`
                        : VND.format(canlamsangDuyetKeToan.tongdoanhthu_chenhlech[index])}
                    </Typography>
                  )}
                </TableCell>
                <TableCell
                  style={commonStyleReponsive}
                  sx={{ backgroundColor: "#ccffcc" }}
                >
                  <Typography>{VND.format(canlamsangChiDinh.tongdoanhthu[index])}</Typography>
                  {canlamsangChiDinh.tongdoanhthu_chenhlech[index] !== 0 && hienthiChenhLech && (
                  <Typography
                      sx={{
                        fontSize: "0.8rem",
                        color:
                          canlamsangChiDinh.tongdoanhthu_chenhlech[index] > 0 ? "green" : "red",
                        display: "block", // Đảm bảo giá trị được hiển thị trên một dòng mới
                      }}
                    >
                      {/* Kiểm tra giá trị chênh lệch để thêm dấu + hoặc - */}
                      {canlamsangChiDinh.tongdoanhthu_chenhlech[index] > 0
                        ? `+${VND.format(canlamsangChiDinh.tongdoanhthu_chenhlech[index])}`
                        : VND.format(canlamsangChiDinh.tongdoanhthu_chenhlech[index])}
                    </Typography>
                  )}
                </TableCell>
                <TableCell
                  style={commonStyleReponsive}
                  sx={{ backgroundColor: "#f3e5f5" }}
                >
                  <Typography>{canlamsangChiDinh.soluong[index]}</Typography>
                  {canlamsangChiDinh.soluong_chenhlech[index] !== 0 && hienthiChenhLech && (
                    <Typography
                      sx={{
                        fontSize: "0.8rem",
                        color:
                          canlamsangChiDinh.soluong_chenhlech[index] > 0 ? "green" : "red",
                        display: "block", // Đảm bảo giá trị được hiển thị trên một dòng mới
                      }}
                    >
                      {/* Kiểm tra giá trị chênh lệch để thêm dấu + hoặc - */}
                      {canlamsangChiDinh.soluong_chenhlech[index] > 0
                        ? `+${canlamsangChiDinh.soluong_chenhlech[index]}`
                        : canlamsangChiDinh.soluong_chenhlech[index]}
                    </Typography>
                  )}
                </TableCell>
                <TableCell
                  style={commonStyleReponsive}
                  sx={{ backgroundColor: "#fff9c4" }}
                >
                  <Typography>{VND.format(canlamsangChiDinh.bhyt[index])}</Typography>
                  {canlamsangChiDinh.bhyt_chenhlech[index] !== 0 && hienthiChenhLech && (
                  <Typography
                      sx={{
                        fontSize: "0.8rem",
                        color:
                          canlamsangChiDinh.bhyt_chenhlech[index] > 0 ? "green" : "red",
                        display: "block", // Đảm bảo giá trị được hiển thị trên một dòng mới
                      }}
                    >
                      {/* Kiểm tra giá trị chênh lệch để thêm dấu + hoặc - */}
                      {canlamsangChiDinh.bhyt_chenhlech[index] > 0
                        ? `+${VND.format(canlamsangChiDinh.bhyt_chenhlech[index])}`
                        : VND.format(canlamsangChiDinh.bhyt_chenhlech[index])}
                    </Typography>
                  )}
                </TableCell>
                <TableCell
                  style={commonStyleReponsive}
                  sx={{ backgroundColor: "#E2C4C4" }}
                >
                  <Typography>{VND.format(canlamsangChiDinh.dongchitra[index])}</Typography>
                  {canlamsangChiDinh.dongchitra_chenhlech[index] !== 0 && hienthiChenhLech && (
                  <Typography
                      sx={{
                        fontSize: "0.8rem",
                        color:
                          canlamsangChiDinh.dongchitra_chenhlech[index] > 0 ? "green" : "red",
                        display: "block", // Đảm bảo giá trị được hiển thị trên một dòng mới
                      }}
                    >
                      {/* Kiểm tra giá trị chênh lệch để thêm dấu + hoặc - */}
                      {canlamsangChiDinh.dongchitra_chenhlech[index] > 0
                        ? `+${VND.format(canlamsangChiDinh.dongchitra_chenhlech[index])}`
                        : VND.format(canlamsangChiDinh.dongchitra_chenhlech[index])}
                    </Typography>
                  )}
                </TableCell>
                <TableCell
                  style={commonStyleReponsive}
                  sx={{ backgroundColor: "#ccffcc" }}
                >
                  <Typography>{VND.format(canlamsangChiDinh.thutructiep[index])}</Typography>
                  {canlamsangChiDinh.thutructiep_chenhlech[index] !== 0 && hienthiChenhLech && (
                  <Typography
                      sx={{
                        fontSize: "0.8rem",
                        color:
                          canlamsangChiDinh.thutructiep_chenhlech[index] > 0 ? "green" : "red",
                        display: "block", // Đảm bảo giá trị được hiển thị trên một dòng mới
                      }}
                    >
                      {/* Kiểm tra giá trị chênh lệch để thêm dấu + hoặc - */}
                      {canlamsangChiDinh.thutructiep_chenhlech[index] > 0
                        ? `+${VND.format(canlamsangChiDinh.thutructiep_chenhlech[index])}`
                        : VND.format(canlamsangChiDinh.thutructiep_chenhlech[index])}
                    </Typography>
                  )}
                </TableCell>
               
                

              </TableRow>
            ))}

            {/* Row tong */}
           
            
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default TableDoanhThuCanLamSang;
