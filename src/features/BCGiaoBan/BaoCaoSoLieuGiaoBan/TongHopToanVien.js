import React from "react";
import {  useSelector } from "react-redux";
import {
 
  Card,
  Typography,
 
  Divider,
  Stack,
 
} from "@mui/material";

function TongHopToanVien() {
  const {
    noiBNTuvongs,
    noiBNChuyenViens,
    noiBNXinVes,
    noiBNNangs,
    noiBNCanThieps,
    noiBNTheoDois,
    noiBNNgoaiGios,

    ngoaiBNTuvongs,
    ngoaiBNChuyenViens,
    ngoaiBNXinVes,
    ngoaiBNNangs,
    ngoaiBNPhauThuats,
    ngoaiBNTheoDois,
    ngoaiBNNgoaiGios,

    chisoTong,
  } = useSelector((state) => state.bcgiaoban);

  return (
    <Card
      sx={{
        alignItems: "center",
        p: 3,
        boxShadow: 3,
        // backgroundColor: "#F9FAFB",
        backgroundColor: "primary.secondary",
      }}
    >
      <Stack direction="row">
        <Typography
          variant="body2"
          sx={{ fontWeight: "bold", color: "primary.main" }}
        >
         Toàn viện 
        </Typography>
      </Stack>

      <Divider sx={{mb:1}}/>
      
      <Typography
        variant="body2"
        // sx={{ color: "text.secondary", fontStyle: "italic" }}
      >
        Tổng NB: {chisoTong?.TongToanVien||''}
      </Typography>
      <Typography
        variant="body2"
        // sx={{ color: "text.secondary", fontStyle: "italic" }}
      >
        BHYT: {chisoTong?.BHYTToanVien||''}
      </Typography>
      <Typography
        variant="body2"
        // sx={{ color: "text.secondary", fontStyle: "italic" }}
      >
       Viện phí: {chisoTong?.VienPhiToanVien||''}
      </Typography>
<Divider sx={{mb:1}}/>
      <Typography
        variant="body2"
        // sx={{ color: "text.secondary", fontStyle: "italic" }}
      >
        Vào viện: {noiBNNgoaiGios.length +ngoaiBNNgoaiGios.length}
      </Typography>

      <Typography
        variant="body2"
        // sx={{ color: "text.secondary", fontStyle: "italic" }}
      >
        Chuyển viện: {noiBNChuyenViens.length +ngoaiBNChuyenViens.length}
      </Typography>
      <Typography
        variant="body2"
        // sx={{ color: "text.secondary", fontStyle: "italic" }}
      >
        Tử vong: {noiBNTuvongs.length + ngoaiBNTuvongs.length}
      </Typography>
      

      <Typography
        variant="body2"
        // sx={{ color: "text.secondary", fontStyle: "italic" }}
      >
        Nặng: {noiBNNangs.length + ngoaiBNNangs.length}
      </Typography>
      <Typography
        variant="body2"
        // sx={{ color: "text.secondary", fontStyle: "italic" }}
      >
        Xin về: {noiBNXinVes.length +ngoaiBNXinVes.length}
      </Typography>
      <Typography
        variant="body2"
        // sx={{ color: "text.secondary", fontStyle: "italic" }}
      >
        Phẫu thuật: {ngoaiBNPhauThuats.length}
      </Typography>

      <Typography
        variant="body2"
        // sx={{ color: "text.secondary", fontStyle: "italic" }}
      >
        Can thiệp: {noiBNCanThieps.length}
      </Typography>

      <Typography
        variant="body2"
        // sx={{ color: "text.secondary", fontStyle: "italic" }}
      >
        Theo dõi: {noiBNTheoDois.length + ngoaiBNTheoDois.length}
      </Typography>
    </Card>
  );
}

export default TongHopToanVien;
