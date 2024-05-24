import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  commonStyle,
  commonStyleLeft,
  commonStyleTitle,
} from "../../utils/heplFuntion";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { formatDateTime } from "../../utils/formatTime";

function CardTongTienChuaDuyetKT({
  title,
  soluong,
  tongtien,
  bg,
  data,
  titleMore,
  CanHovered = true,
  isXemToanVien = true,
  isKhongHienChiTiet= false,
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
    setHovered(CanHovered);
  };

  const handleMouseOut = () => {
    setHovered(false);
  };

  return (
    <Card sx={{ m: 1 }}>
      <Typography
        sx={{
          textAlign: "center",
          fontSize: "1rem",
          color: "#1939B7",
          fontWeight: "bold",
        }}
      >
        {title}
      </Typography>
      <Card
        sx={{
          fontWeight: "bold",
          color: "#f2f2f2",
          backgroundColor: bg,
          // p: 1,
          boxShadow: 10,
          borderRadius: 3,
          m: 1,
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
          <Typography sx={{ textAlign: "center", fontSize: "1rem" }}>
            Số lượng: {soluong}
          </Typography>
          <Typography sx={{ textAlign: "center" }}>
            Tổng tiền : {tongtien}
          </Typography>
        </CardContent>
      </Card>

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
            color={"#1939B7"}
          >
            {titleMore}
          </Typography>

{isKhongHienChiTiet?(
  <Table>
            <TableHead>
              
                <TableRow sx={rowStyle}>
                  
                  <TableCell style={commonStyleReponsive}>Số lượng</TableCell>
                  <TableCell style={commonStyleReponsive}>Tổng tiền</TableCell>
                  <TableCell style={commonStyleReponsive}>BHYT</TableCell>
                  <TableCell style={commonStyleReponsive}>
                    Cộng thu trực tiếp
                  </TableCell>
                  <TableCell style={commonStyleReponsive}>
                    Đồng chi trả
                  </TableCell>
                  <TableCell style={commonStyleReponsive}>
                    NB tự chi trả
                  </TableCell>
                  <TableCell style={commonStyleReponsive}>MRI 3.0</TableCell>
                </TableRow>
             
            </TableHead>
            <TableBody>
            {data && data.map((row, index) => (
                    <TableRow key={index} sx={rowStyle}>
                    
                      <TableCell style={commonStyleLeftReponsive}>
                        {row.soluong}
                      </TableCell>

                      <TableCell style={commonStyleLeftReponsive}>
                        {VND.format(row.tongtien)}
                      </TableCell>

                      <TableCell style={commonStyleLeftReponsive}>
                        {VND.format(row.bhyt)}
                      </TableCell>
                      <TableCell style={commonStyleLeftReponsive}>
                        {VND.format(
                          row.dongchitra + row.thutructiep + row.tienmri30
                        )}
                      </TableCell>
                      <TableCell style={commonStyleLeftReponsive}>
                        {VND.format(row.dongchitra)}
                      </TableCell>
                      <TableCell style={commonStyleLeftReponsive}>
                        {VND.format(row.thutructiep)}
                      </TableCell>
                      <TableCell style={commonStyleLeftReponsive}>
                        {VND.format(row.tienmri30)}
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
):(
<Table>
            <TableHead>
              {isXemToanVien ? (
                <TableRow sx={rowStyle}>
                  <TableCell style={commonStyleReponsive}>Khoa</TableCell>

                  <TableCell style={commonStyleReponsive}>Số lượng</TableCell>
                  <TableCell style={commonStyleReponsive}>Tổng tiền</TableCell>
                  <TableCell style={commonStyleReponsive}>BHYT</TableCell>
                  <TableCell style={commonStyleReponsive}>
                    Cộng thu trực tiếp
                  </TableCell>
                  <TableCell style={commonStyleReponsive}>
                    Đồng chi trả
                  </TableCell>
                  <TableCell style={commonStyleReponsive}>
                    NB tự chi trả
                  </TableCell>
                  <TableCell style={commonStyleReponsive}>MRI 3.0</TableCell>
                </TableRow>
              ) : (
                <TableRow sx={rowStyle}>
                  <TableCell style={commonStyleReponsive}>vienphiid</TableCell>

                  <TableCell style={commonStyleReponsive}>Mã BN</TableCell>
                  <TableCell style={commonStyleReponsive}>Tên BN</TableCell>
                  <TableCell style={commonStyleReponsive}>
                    Khám/Vào viện
                  </TableCell>
                  <TableCell style={commonStyleReponsive}>Tổng tiền</TableCell>
                  <TableCell style={commonStyleReponsive}>BHYT</TableCell>
                  <TableCell style={commonStyleReponsive}>
                    Cộng thu trực tiếp
                  </TableCell>
                  <TableCell style={commonStyleReponsive}>
                    Đồng chi trả
                  </TableCell>
                  <TableCell style={commonStyleReponsive}>
                    NB tự chi trả
                  </TableCell>
                  <TableCell style={commonStyleReponsive}>MRI 3.0</TableCell>
                </TableRow>
              )}
            </TableHead>
            <TableBody>
              {isXemToanVien
                ? data &&
                  data.map((row, index) => (
                    <TableRow key={index} sx={rowStyle}>
                      <TableCell style={commonStyleLeftReponsive}>
                        {row.tenkhoa}
                      </TableCell>

                      <TableCell style={commonStyleLeftReponsive}>
                        {row.soluong}
                      </TableCell>

                      <TableCell style={commonStyleLeftReponsive}>
                        {VND.format(row.tongtien)}
                      </TableCell>

                      <TableCell style={commonStyleLeftReponsive}>
                        {VND.format(row.bhyt)}
                      </TableCell>
                      <TableCell style={commonStyleLeftReponsive}>
                        {VND.format(
                          row.dongchitra + row.thutructiep + row.tienmri30
                        )}
                      </TableCell>
                      <TableCell style={commonStyleLeftReponsive}>
                        {VND.format(row.dongchitra)}
                      </TableCell>
                      <TableCell style={commonStyleLeftReponsive}>
                        {VND.format(row.thutructiep)}
                      </TableCell>
                      <TableCell style={commonStyleLeftReponsive}>
                        {VND.format(row.tienmri30)}
                      </TableCell>
                    </TableRow>
                  ))
                : data &&
                  data.map((row, index) =>
                    index === 0 ? (
                      //row tổng
                      <TableRow key={index} sx={rowStyle}>
                        <TableCell
                          colSpan={4}
                          style={{
                            ...commonStyleLeftReponsive,
                            textAlign: "right",
                          }}
                        >
                          {row.patientname}
                        </TableCell>

                        <TableCell style={commonStyleLeftReponsive}>
                          {VND.format(row.tongtien)}
                        </TableCell>

                        <TableCell style={commonStyleLeftReponsive}>
                          {VND.format(row.bhyt)}
                        </TableCell>
                        <TableCell style={commonStyleLeftReponsive}>
                          {VND.format(
                            row.dongchitra + row.thutructiep + row.tienmri30
                          )}
                        </TableCell>
                        <TableCell style={commonStyleLeftReponsive}>
                          {VND.format(row.dongchitra)}
                        </TableCell>
                        <TableCell style={commonStyleLeftReponsive}>
                          {VND.format(row.thutructiep)}
                        </TableCell>
                        <TableCell style={commonStyleLeftReponsive}>
                          {VND.format(row.tienmri30)}
                        </TableCell>
                      </TableRow>
                    ) : (
                      //Các row chi tiết
                      <TableRow key={index} sx={rowStyle}>
                        <TableCell style={commonStyleLeftReponsive}>
                          {row.vienphiid}
                        </TableCell>

                        <TableCell style={commonStyleLeftReponsive}>
                          {row.patientid}
                        </TableCell>
                        <TableCell style={commonStyleLeftReponsive}>
                          {row.patientname}
                        </TableCell>
                        <TableCell style={commonStyleLeftReponsive}>
                          {formatDateTime(row.vienphidate)}
                        </TableCell>

                        <TableCell style={commonStyleLeftReponsive}>
                          {VND.format(row.tongtien)}
                        </TableCell>

                        <TableCell style={commonStyleLeftReponsive}>
                          {VND.format(row.bhyt)}
                        </TableCell>
                        <TableCell style={commonStyleLeftReponsive}>
                          {VND.format(
                            row.dongchitra + row.thutructiep + row.tienmri30
                          )}
                        </TableCell>
                        <TableCell style={commonStyleLeftReponsive}>
                          {VND.format(row.dongchitra)}
                        </TableCell>
                        <TableCell style={commonStyleLeftReponsive}>
                          {VND.format(row.thutructiep)}
                        </TableCell>
                        <TableCell style={commonStyleLeftReponsive}>
                          {VND.format(row.tienmri30)}
                        </TableCell>
                      </TableRow>
                    )
                  )}
            </TableBody>
          </Table>
)}
         
        </Box>
      </Modal>
    </Card>
  );
}

export default CardTongTienChuaDuyetKT;
