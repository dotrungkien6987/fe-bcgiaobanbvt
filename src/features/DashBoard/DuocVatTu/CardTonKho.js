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
import { useSelector } from "react-redux";
import CardBenhNhanChuyenVien from "../CardBenhNhanChuyenVien";
import CardCT128BHYT from "../CardCT128BHYT";
import CardTonKhoChiTiet from "./CardTonKhoChiTiet";


function CardTonKho({tonkho,dataTonKho, colorCardWarning}) {
 
  const VND = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });
  
  const data = [];
  data.push({ Name: "Tổng tiền", Value: tonkho?.tongtien  ||0});
  data.push({ Name: "Tổng số lượng", Value: tonkho?.tongtonkho  ||0});
  data.push({ Name: "Tổng danh mục", Value: tonkho?.tongdanhmucthuoc  ||0});
  data.push({ Name: "Tổng số lô", Value:  tonkho?.tongsolo ||0});
  
  return (
    <Card sx={{ pl: 0, pr: 1 }}>
      <Grid container spacing={0.5} margin={0.2}>
        {data &&
          data.map((item, index) => (
            <Grid item xs={12} sm={12} md={6} key={index}>
              {item.Name === "Chuyển viện" ? (
                <CardBenhNhanChuyenVien
                databenhnhan={[]}
                title={item.Name} value ={item.Value} 
                    titleMore="Bệnh nhân ngoại trú chuyển viện"
                    type ="ngoai tru"
                />
              ) :item.Name === "CT128 (BH)"?(
                <CardCT128BHYT
                title={item.Name} value ={item.Value} 
                databenhnhan={[]}
                titleMore="Chỉ định dịch vụ  CT 128 ngoại trú BHYT "
                type ="clvt"
                />
              ): (
                // <Card
                //   sx={{
                //     fontWeight: "bold",
                //     color: "#f2f2f2",
                //     backgroundColor: "#1939B7",
                //     // p: 1,
                //     boxShadow: 10,
                //     borderRadius: 3,
                //   }}
                // >
                //   <CardContent>
                //     <Typography
                //       sx={{ textAlign: "center", fontSize: "0.8rem" }}
                //     >
                //       {item.Name}
                //     </Typography>
                //     <Typography variant="h6" sx={{ textAlign: "center" }}>
                //       {item.Name==="Tổng tiền"?VND.format(item.Value):item.Value}
                      
                //     </Typography>
                //   </CardContent>
                // </Card>
                <CardTonKhoChiTiet
                title={item.Name} 
                value ={item.Value}
                titleMore="Chi tiết"
                data={dataTonKho}
                colorCardWarning={colorCardWarning}
                />
              )}
            </Grid>
          ))}
      </Grid>
    </Card>
  );
}

export default CardTonKho;
