
import {
  
  Card,
  
  Grid,
 
} from "@mui/material";
import React from "react";

import CardTonKhoChiTiet from "./CardTonKhoChiTiet";


function CardTonKho({tonkho,dataTonKho, colorCardWarning}) {
 
  const data = [];
  data.push({ Name: "Tổng tiền", Value: tonkho?.tongtien  ||0});
  data.push({ Name: "Tổng số lượng", Value: tonkho?.tongtonkho  ||0});
  data.push({ Name: "Tổng danh mục", Value: tonkho?.tongdanhmucthuoc  ||0});
  data.push({ Name: "Tổng số mã", Value:  tonkho?.tongsolo ||0});
  
  return (
    <Card sx={{ pl: 0, pr: 1 }}>
      <Grid container spacing={0.5} margin={0.2}>
        {data &&
          data.map((item, index) => (
            <Grid item xs={12} sm={12} md={6} key={index}>
              
                <CardTonKhoChiTiet
                title={item.Name} 
                value ={item.Value}
                titleMore="Chi tiết"
                data={dataTonKho}
                colorCardWarning={colorCardWarning}
                />
             
            </Grid>
          ))}
      </Grid>
    </Card>
  );
}

export default CardTonKho;
