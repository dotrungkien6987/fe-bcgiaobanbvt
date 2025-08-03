import React from "react";
import {  useSelector } from "react-redux";
import {
  
  Card,
  Typography,
  
  Divider,
  Stack,
 
} from "@mui/material";

function TongHopCLC() {
  const {
  
    clcBNTuvongs,
    clcBNChuyenViens,
    clcBNXinVes,
    clcBNNangs,
    clcBNCanThieps,
    clcBNTheoDois,
    hsccycBNNgoaiGios,
    noiycBNNgoaiGios,
    ngoaiycBNNgoaiGios,
    ngoaiycBNMoCCs,
    ngoaiycBNPhauThuats,
    chisoTong,
  } = useSelector((state) => state.bcgiaoban);

  return (
    <Card
      sx={{
        alignItems: "center",
        p: 3,
        boxShadow: 3,
        // backgroundColor: "#F9FAFB",
      }}
    >
      <Stack direction="row">
        <Typography
          variant="body2"
          sx={{ fontWeight: "bold", color: "primary.main" }}
        >
          TT KCB CLC
        </Typography>
      </Stack>

      <Divider sx={{mb:1}}/>

      <Typography
        variant="body2"
        // sx={{ color: "text.secondary", fontStyle: "italic" }}
      >
        Tổng NB: {chisoTong?.TongCLC||''}
      </Typography>
      <Typography
        variant="body2"
        // sx={{ color: "text.secondary", fontStyle: "italic" }}
      >
        BHYT: {chisoTong?.BHYTCLC||''}
      </Typography>
      <Typography
        variant="body2"
        // sx={{ color: "text.secondary", fontStyle: "italic" }}
      >
       Viện phí: {chisoTong?.VienPhiCLC||''}
      </Typography>
<Divider sx={{mb:1}}/>

      <Typography
        variant="body2"
        // sx={{ color: "text.secondary", fontStyle: "italic" }}
      >
        Vào viện: {hsccycBNNgoaiGios.length + noiycBNNgoaiGios.length + ngoaiycBNNgoaiGios.length}
      </Typography>

      <Typography
        variant="body2"
        // sx={{ color: "text.secondary", fontStyle: "italic" }}
      >
        Chuyển viện: {clcBNChuyenViens.length}
      </Typography>
      <Typography
        variant="body2"
        // sx={{ color: "text.secondary", fontStyle: "italic" }}
      >
        Tử vong: {clcBNTuvongs.length}
      </Typography>
      <Typography
        variant="body2"
        // sx={{ color: "text.secondary", fontStyle: "italic" }}
      >
        Nặng: {clcBNNangs.length}
      </Typography>
      <Typography
        variant="body2"
        // sx={{ color: "text.secondary", fontStyle: "italic" }}
      >
        Xin về: {clcBNXinVes.length}
      </Typography>
      <Typography
        variant="body2"
        // sx={{ color: "text.secondary", fontStyle: "italic" }}
      >
        PT CC trong giờ: {chisoTong?.MoCC_CLC || ""}
      </Typography>
      <Typography
        variant="body2"
        // sx={{ color: "text.secondary", fontStyle: "italic" }}
      >
        PT ngoài giờ: {ngoaiycBNPhauThuats.length}
      </Typography>
      <Typography
        variant="body2"
        // sx={{ color: "text.secondary", fontStyle: "italic" }}
      >
       Can thiệp: {clcBNCanThieps.length}
      </Typography>

      <Typography
        variant="body2"
        // sx={{ color: "text.secondary", fontStyle: "italic" }}
      >
       Theo dõi: {clcBNTheoDois.length}
      </Typography>
    </Card>
  );
}

export default TongHopCLC;
