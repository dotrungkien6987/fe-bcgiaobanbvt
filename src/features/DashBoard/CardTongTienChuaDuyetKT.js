
import {
  
  Card,
  CardContent,
  Container,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";

function CardTongTienChuaDuyetKT({title,soluong,tongtien}) {
  
  const { chisosObj } = useSelector((state) => state.dashboard);
  return (
    <Card sx={{m:1}}>
     <Typography sx={{ textAlign: "center",fontSize:"1rem",color:"#1939B7",fontWeight:"bold" }}>{title}</Typography>
      <Card
        sx={{
          fontWeight: "bold",
          color: "#f2f2f2",
          backgroundColor: "#1939B7",
          // p: 1,
          boxShadow: 10,
          borderRadius: 3,
          m:1
        }}
      >
        <CardContent>
          
          <Typography sx={{ textAlign: "center",fontSize:"1rem" }}>Số lượng:  {soluong}</Typography>
          <Typography  sx={{ textAlign: "center" }}>
           Tổng tiền : {tongtien}
          </Typography>
        </CardContent>
      </Card>

    </Card>
  );
}

export default CardTongTienChuaDuyetKT;
