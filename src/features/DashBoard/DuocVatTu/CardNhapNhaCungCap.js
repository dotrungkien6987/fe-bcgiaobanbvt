import { useTheme } from "@emotion/react";
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import React from "react";

import CardNhapNhaCungCapChiTiet from "./CardNhapNhaCungCapChiTiet";


function CardNhapNhaCungCap({khohienthi,dataNhapNhaCungCap, colorCardWarning}) {
 
  const VND = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });
  
  return (
    <Card sx={{ pl: 0, pr: 1 }}>
      <Grid container spacing={0.5} margin={0.2}>
        {khohienthi &&
          khohienthi.map((item, index) => (
            <Grid item xs={12} sm={12} md={6} key={index}>
             
                <CardNhapNhaCungCapChiTiet
                title={item.medicinestorename} 
                value ={item.tongtien}
                titleMore="Chi tiết"
                data={dataNhapNhaCungCap.filter((i) => i.medicinestoreid === item.medicinestoreid)}
                colorCardWarning={colorCardWarning}
                />
             
            </Grid>
          ))}
      </Grid>
    </Card>
  );
}

export default CardNhapNhaCungCap;
