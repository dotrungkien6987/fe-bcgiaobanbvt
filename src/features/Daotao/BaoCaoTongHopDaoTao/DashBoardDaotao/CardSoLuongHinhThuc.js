import React from "react";
import { Card, CardContent, Typography, Grid, Box } from "@mui/material";

// Component hiển thị thông tin Dashboard với màu sắc tùy chỉnh
const CardSoLuongHinhThuc = ({ data }) => {
  return (
    <Card
      sx={{
        minWidth: 275,
        mt: 1,
        boxShadow: 3,
        background: '#1939B7' , // Gradient 2 tông màu
        // background: `linear-gradient(135deg, #1939B7 30%, #bb1515 100%)`, // Gradient 2 tông màu
        color: "#fff", // Màu chữ trắng nổi bật trên nền
        borderRadius: "50px",
      }}
    >
      <CardContent>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={6} md={7}>
            <Typography variant="subtitle1" color="inherit" fontWeight="bold" align="center">
              {data.MaHinhThucCapNhat}
            </Typography>
            <Typography variant="h5"  align="center">
              {data.Ten}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" color="inherit" fontWeight="bold" align="center">
              Số lượng
            </Typography>
            <Typography variant="h3" fontWeight="bold" align="center">
              {data.lopDaoTaoCount}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" color="inherit" fontWeight="bold" align="center">
             Thành viên:
            </Typography>
            <Typography variant="h3" fontWeight="bold" align="center">
              {data.totalSoThanhVien}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// Dữ liệu mẫu
const dashboardData = {
  ma: "DDT06",
  ten: "Đang tham gia đào tạo thạc sĩ",
  soLuongToChuc: 167,
  soLuotThanhVien: 3456,
};

export default CardSoLuongHinhThuc;

