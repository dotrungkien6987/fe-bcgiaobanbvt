import React from "react";
import {
  
  Card,
  
  Grid,
  CardHeader,
} from "@mui/material";
import BenhNhanCardRieng from "./BenhNhanCardRieng";



// import useAuth from "../../hooks/useAuth";
// import ActionButton from "./ActionButton";

function ListBenhNhanCardRieng({ benhnhans,title }) {
  return (
    <Card sx={{mt:3,px:1}}>
      <CardHeader title={title} />
      <Grid container spacing={2} my={1}>
        {benhnhans.map((benhnhan) => (
          <Grid key={benhnhan.Stt} item xs={12} md={6}>
            <BenhNhanCardRieng benhnhan={benhnhan} />
          </Grid>
        ))}
      </Grid>
    </Card>
  );
}

export default ListBenhNhanCardRieng;
