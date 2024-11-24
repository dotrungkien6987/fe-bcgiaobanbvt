import { Card, CardContent, Grid, Typography } from "@mui/material";
import React from "react";

function CardNhapXuat({ dataNhapXuat,title ='' }) {
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
        {title}
      </Typography>
      <Grid container spacing={0.5} margin={0.2}>
        {dataNhapXuat &&
          dataNhapXuat.map((item, index) => (
            <Grid item xs={12} sm={12} md={12} key={index}>
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
                    {item.loai}
                  </Typography>
                  <Typography sx={{ textAlign: "center", fontSize: "1.1rem" }}>
                    {VND.format(item.tongtien)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>
    </Card>
  );
}

export default CardNhapXuat;
