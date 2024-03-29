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
import CardBenhNhanThoiGianKham from "./CardBenhNhanThoiGianKham";

function CardThoiGian({ data, typeCard }) {
  const theme = useTheme();
  const { darkMode } = useSelector((state) => state.mytheme);
  const { bnthoigianchokhammax,bnthoigiankhammax} = useSelector((state) => state.dashboard);
  return (
    <Card sx={{ m: 1.5, pr: 8 }}>
      <Typography
        variant="h6"
        sx={{ textAlign: "center", color: darkMode ? "#FFF" : "#1939B7" }}
      >
        {data.Title}
      </Typography>
      <Typography
        sx={{ textAlign: "center", color: darkMode ? "#FFF" : "#1939B7" }}
      >
        {data.GhiChu}
      </Typography>

      <Grid container spacing={3} margin={1}>
        {data.ChiSos &&
          data.ChiSos.map((item, index) => (
            <Grid item xs={12} sm={12} md={4} key={index}>
              {item.Name !== "Lâu nhất" ? (
                <Card
                  sx={{
                    fontWeight: "bold",
                    color: "#f2f2f2",
                    backgroundColor:
                      item.Name === "Lâu nhất" ? "#bb1515" : "#1939B7",
                    // p: 1,
                    boxShadow: 10,
                    borderRadius: 3,
                  }}
                >
                  <CardContent>
                    <Typography sx={{ textAlign: "center" }}>
                      {item.Name}
                    </Typography>
                    <Typography variant="h4" sx={{ textAlign: "center" }}>
                      {item.Value} phút
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <CardBenhNhanThoiGianKham type={typeCard} 
                title={item.Name}
                value={item.Value}
                databenhnhan={typeCard==='thoigianchokham'?bnthoigianchokhammax:bnthoigiankhammax}
                titleMore = {typeCard==='thoigianchokham'?'Bệnh nhân có thời gian chờ khám lâu nhất':'Bệnh nhân có thời gian khám lâu nhất'}
                />

              )}
            </Grid>
          ))}
      </Grid>
    </Card>
  );
}

export default CardThoiGian;
