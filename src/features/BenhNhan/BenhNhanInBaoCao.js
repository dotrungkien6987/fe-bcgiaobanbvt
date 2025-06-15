import React, { useState } from "react";

import {
  Typography,
  Divider,
  Paper,
  Container,
  Grid,
  ImageList,
  ImageListItem,
  useMediaQuery,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
// import Lightbox from 'react-image-lightbox';
// import 'react-image-lightbox/style.css'

import { getTextFromNumber } from "../../utils/heplFuntion";
import { useTheme } from "@emotion/react";
import { useSelector } from "react-redux";

// import useAuth from "../../hooks/useAuth";
// import ActionButton from "./ActionButton";

function BenhNhanInBaoCao({ benhnhan, tenkhoa, loaibenhnhan }) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const styleTextNomal = {
    color: "#1939B7",
    fontStyle: "italic",
    fontSize: "1.03rem",
  };
  let commonStyleTextNomalReponsive = isSmallScreen
    ? { ...styleTextNomal, fontSize: "0.8rem" }
    : { ...styleTextNomal };
  const { darkMode } = useSelector((state) => state.mytheme);
  commonStyleTextNomalReponsive = darkMode
    ? { ...commonStyleTextNomalReponsive, color: "#FFF" }
    : { ...commonStyleTextNomalReponsive };

  const {
    TenBenhNhan,
    Tuoi,
    DiaChi,
    LoaiBN,
    VaoVien,
    GioiTinh,
    LyDoVV,
    DienBien,
    ChanDoan,
    XuTri,
    HienTai,
    GhiChu,
    TenKhoa,

    Stt,
  } = benhnhan;
  const [isOpen, setIsOpen] = useState(false);
  // const [currentImageIndex, setCurrentImageIndex] = useState(0);

  return (
    <Container sx={{ my: 1 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* Tiêu đề */}
        <Typography
          variant="h6"
          align="center"
          sx={{
            fontSize: isSmallScreen ? "0.9rem" : "1.03rem",
            color: darkMode ? "#FFF" : "#1939B7",
            marginBottom: 1,
          }}
        >
          Bệnh nhân {getTextFromNumber(LoaiBN)}
        </Typography>

        {/* Đường phân tách */}
        <Divider sx={{ my: 1 }} />

        {/* Nội dung */}
        <Grid container spacing={1}>
          {/* Cột bên trái */}
          <Grid item xs={12} sm={1.2}>
            <Container
              variant="body2"
              sx={{
                fontSize: isSmallScreen ? "0.9rem" : "1.03rem",
                wordWrap: "break-word",
                color: darkMode ? "#FFF" : "#1939B7",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {TenKhoa}
            </Container>
          </Grid>

          {/* Đường phân tách dọc (chỉ hiển thị ở kích thước màn hình sm trở lên) */}
          <Divider
            orientation="vertical"
            flexItem
            sx={{ display: { xs: "none", sm: "block" } }}
          />

          {/* Cột bên phải */}
          <Grid item xs={12} sm={9.8}>
            <Typography
              variant="body2"
              sx={{
                color: "#bb1515",
                fontSize: isSmallScreen ? "0.8" : "1.03rem",
              }}
            >
              {Stt}. {TenBenhNhan} - {GioiTinh}- {Tuoi} tuổi - {DiaChi}
            </Typography>
            <Divider sx={{ my: 1 }} />
            {DienBien.trim() !== "" && (
              <Typography variant="body2" sx={commonStyleTextNomalReponsive}>
                - Vaò viện: {VaoVien}
              </Typography>
            )}

            {LyDoVV.trim() !== "" && (
              <Typography variant="body2" sx={commonStyleTextNomalReponsive}>
                - Lý do vào viện: {LyDoVV}
              </Typography>
            )}

            {DienBien.trim() !== "" && (
              <Typography variant="body2" sx={commonStyleTextNomalReponsive}>
                - Diễn biến: {DienBien}
              </Typography>
            )}

            {ChanDoan.trim() !== "" && (
              <Typography variant="body2" sx={commonStyleTextNomalReponsive}>
                - Chẩn đoán: {ChanDoan}
              </Typography>
            )}

            {XuTri.trim() !== "" && (
              <Typography variant="body2" sx={commonStyleTextNomalReponsive}>
                - Xử trí: {XuTri}
              </Typography>
            )}

            {HienTai.trim() !== "" && (
              <Typography variant="body2" sx={commonStyleTextNomalReponsive}>
                - Hiện tại: {HienTai}
              </Typography>
            )}

            {GhiChu.trim() !== "" && (
              <Typography variant="body2" sx={commonStyleTextNomalReponsive}>
                - {GhiChu}
              </Typography>
            )}
          </Grid>
        </Grid>
        <ImageList cols={2}>
          {benhnhan.Images.length > 0 &&
            benhnhan.Images.map((item, index) => (
              <ImageListItem key={index}>
                <img
                  src={`${item}?w=164&h=164&fit=crop&auto=format`}
                  srcSet={`${item}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                  alt={`Ảnh-${index}`}
                  loading="lazy"
                  // onClick={() => {
                  //   setCurrentImageIndex(index);
                  //   setIsOpen(true);
                  // }}
                />
              </ImageListItem>
            ))}
        </ImageList>
      </Paper>
      {/* {isOpen && (
        <Lightbox
          mainSrc={benhnhan.Images[currentImageIndex]}
          nextSrc={benhnhan.Images[(currentImageIndex + 1) % benhnhan.Images.length]}
          prevSrc={benhnhan.Images[(currentImageIndex + benhnhan.Images.length - 1) % benhnhan.Images.length]}
          onCloseRequest={() => setIsOpen(false)}
          onMovePrevRequest={() =>
            setCurrentImageIndex((currentImageIndex + benhnhan.Images.length - 1) % benhnhan.Images.length)
          }
          onMoveNextRequest={() =>
            setCurrentImageIndex((currentImageIndex + 1) % benhnhan.Images.length)
          }
        />
      )} */}
    </Container>
  );
}

export default BenhNhanInBaoCao;
