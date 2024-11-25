import { Card, CardContent, Grid, Typography } from "@mui/material";
import React from "react";

function CardTonTheoKho({ tonkho ={} }) {
  const VND = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });

  return (
    <Card sx={{ pl: 0, pr: 1, boxShadow: 10, borderRadius: 3, p: 1 }}>
      <Typography
        sx={{
          textAlign: "center",
          fontSize: "1rem",
          fontWeight: "bold",
          color: "#1939B7",
        }}
      >
       Tồn
      </Typography>
      <Grid container spacing={0.5} margin={0.2}>
        
            <Grid item xs={12} sm={12} md={12}>
              <Card
                sx={{
                  fontWeight: "bold",
                  color: "#f2f2f2",
                  backgroundColor: "#1939B7",
                  // p: 1,
                  boxShadow: 10,
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Typography sx={{ textAlign: "center", fontSize: "0.7rem" }}>
                    Tổng tiền
                  </Typography>
                  <Typography sx={{ textAlign: "center", fontSize: "1.1rem" }}>
                    {VND.format(tonkho.tongtien)}
                  </Typography>
                 
                </CardContent>
              </Card>
            </Grid>
          
            <Grid item xs={12} sm={12} md={12}>
              <Card
                sx={{
                  fontWeight: "bold",
                  color: "#f2f2f2",
                  backgroundColor: "#1939B7",
                  // p: 1,
                  boxShadow: 10,
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Typography sx={{ textAlign: "center", fontSize: "0.7rem" }}>
                    Tổng danh mục
                  </Typography>
                  <Typography sx={{ textAlign: "center", fontSize: "1.1rem" }}>
                    {tonkho.tongdanhmucthuoc}
                  </Typography>
                 
                </CardContent>
              </Card>
            </Grid>
          
            <Grid item xs={12} sm={12} md={12}>
              <Card
                sx={{
                  fontWeight: "bold",
                  color: "#f2f2f2",
                  backgroundColor: "#1939B7",
                  // p: 1,
                  boxShadow: 10,
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Typography sx={{ textAlign: "center", fontSize: "0.7rem" }}>
                    Tổng số lô
                  </Typography>
                  <Typography sx={{ textAlign: "center", fontSize: "1.1rem" }}>
                  {tonkho.tongsolo}
                  </Typography>
                 
                </CardContent>
              </Card>
            </Grid>
          
            <Grid item xs={12} sm={12} md={12}>
              <Card
                sx={{
                  fontWeight: "bold",
                  color: "#f2f2f2",
                  backgroundColor: "#1939B7",
                  // p: 1,
                  boxShadow: 10,
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Typography sx={{ textAlign: "center", fontSize: "0.7rem" }}>
                    Tổng số lượng
                  </Typography>
                  <Typography sx={{ textAlign: "center", fontSize: "1.1rem" }}>
                  {tonkho.tongtonkho}
                  </Typography>
                 
                </CardContent>
              </Card>
            </Grid>
          
      </Grid>
    </Card>
  );
}

export default CardTonTheoKho;
