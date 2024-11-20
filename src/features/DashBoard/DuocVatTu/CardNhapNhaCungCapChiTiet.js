import {
  Box,
  
  Card,
  CardContent,
  
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  ThemeProvider,
  Typography,
  createTheme,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { commonStyle, commonStyleLeft, commonStyleTitle } from "utils/heplFuntion";


function CardNhapNhaCungCapChiTiet({
  data,
  title,
  value,
  colorCardWarning,
  titleMore,
}) {
  const darkTheme = createTheme({
    palette: {
      mode: "dark",
    },
  });

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

  let commonStyleTitleReponsive = isSmallScreen
    ? { ...commonStyleTitle, fontSize: "0.8rem" }
    : { ...commonStyleTitle };
  const rowStyle = {
    height: "35px", // Adjust the height as needed
    "& td, & th": { padding: "5px" }, // Adjust the padding as needed
  };

  const VND = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });

  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [isHovered, setHovered] = useState(false);

  const handleMouseOver = () => {
    setHovered(true);
  };

  const handleMouseOut = () => {
    setHovered(false);
  };

  return (
    <Box>
      {/* <Button variant="contained" color="secondary" onClick={handleOpen}>
            
           {khoaHienThis.length} khoa {type}
          </Button> */}

      <Card
        sx={{
          fontWeight: "bold",
          color: "#f2f2f2",
          // backgroundColor:((item.Name ==="Đơn cao nhất" && chisosObj.ngoaitru_max_donthuoc>chisosObj.ngoaitru_khuyencao
          // || (item.Name ==='Vượt khuyến cáo')
          // ||(item.Name ==='Bình quân đơn' && chisosObj.ngoaitru_binhquandon>chisosObj.ngoaitru_khuyencao)
          // ))
          // ?"#bb1515": "#1939B7",
          // p: 1,
          backgroundColor: colorCardWarning ? "#bb1515" : "#1939B7",
          boxShadow: 10,
          borderRadius: 3,

          ":hover": {
            filter: isHovered ? "brightness(1.5)" : "initial", // Tăng độ sáng lên 150%
            cursor: isHovered ? "pointer" : "initial",
          },
        }}
        onClick={handleOpen}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
      >
        <CardContent>
          <Typography sx={{ textAlign: "center", fontSize: "0.9rem" }}>
            {title}
          </Typography>
          <Typography variant="h6" sx={{ textAlign: "center" }}>
            {title==='Tổng tiền'?VND.format(value):Math.round(value)}
          </Typography>
        </CardContent>
      </Card>

      <ThemeProvider theme={darkTheme}>
        <div>
          <Modal open={open} onClose={handleClose}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "80vw",
                maxHeight: "80vh", // Giới hạn chiều cao tối đa
                overflowY: "auto", // Hiển thị thanh cuộn
                bgcolor: theme.palette.background.paper,
                boxShadow: 24,
                borderRadius: 2,
                p: 3,
              }}
            >
              <Typography
                variant={isSmallScreen ? "h6" : "h5"}
                gutterBottom
                align="center"
                color={darkMode ? "#FFF" : "#1939B7"}
              >
                {titleMore}
              </Typography>
        
              <Table>
                <TableHead>
                  <TableRow sx={rowStyle}>
                    <TableCell style={commonStyleReponsive}>
                     Tên kho
                    </TableCell>
                    
                    <TableCell style={commonStyleReponsive}>
                      Ngày nhập
                    </TableCell>
                    <TableCell style={commonStyleReponsive}>
                      Phiếu nhập
                    </TableCell>
                    <TableCell style={commonStyleReponsive}>Mã thuốc</TableCell>
                    <TableCell style={commonStyleReponsive}>Tên thuốc</TableCell>
                    <TableCell style={commonStyleReponsive}>Nhà cung cấp</TableCell>
                    <TableCell style={commonStyleReponsive}>Đơn vị</TableCell>
                    <TableCell style={commonStyleReponsive}>Số lượng</TableCell>
                    <TableCell style={commonStyleReponsive}>Đơn giá</TableCell>
                    <TableCell style={commonStyleReponsive}>Thành tiền</TableCell>
                    
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data &&
                    data.map((row, index) => (
                      <TableRow key={index} sx={rowStyle}>
                        <TableCell style={commonStyleLeftReponsive}>
                          {row.medicinestorename}
                        </TableCell>

                        <TableCell style={commonStyleLeftReponsive}>
                          {row.medicinedate}
                        </TableCell>

                        <TableCell style={commonStyleLeftReponsive}>
                          {row.medicinestorebillcode}
                        
                        </TableCell>

                        <TableCell style={commonStyleLeftReponsive}>
                          
                          {row.medicinestorebillcode}
                        </TableCell>

                        <TableCell style={commonStyleLeftReponsive}>{row.medicinename}</TableCell>
                        <TableCell style={commonStyleLeftReponsive}>{row.donvitinh}</TableCell>
                        <TableCell style={commonStyleLeftReponsive}>{row.soluong}</TableCell>
                        <TableCell style={commonStyleLeftReponsive}>{VND.format(row.giaban)}</TableCell>
                        <TableCell style={commonStyleLeftReponsive}>{VND.format(row.giaban*row.soluong)}</TableCell>
                       

                       
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Box>
          </Modal>
        </div>
      </ThemeProvider>
    </Box>
  );
}

export default CardNhapNhaCungCapChiTiet;
