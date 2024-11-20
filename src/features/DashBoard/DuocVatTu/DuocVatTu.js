import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  AppBar,
  Toolbar,
  Stack,
  Box,
  CardHeader,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

import { formatDateTime } from "utils/formatTime";
import DisplayChiSoDashBoard from "components/DisplayChiSoDashBoard";

import CardTheoDoiBNVip from "../CardTheoDoiBNVip";
import CardPhongThucHienCanLamSang from "../CardPhongThucHienCanLamSang";
import { getDataNewestByNgay } from "../dashboardSlice";
import CardTonKho from "./CardTonKho";

const data1 = [
  { label: "Group A", value: 400, color: "#1939B7" },
  { label: "Group B", value: 300, color: "#bb1515" },
  { label: "Group C", value: 300, color: "#00cc00" },
  { label: "Group D", value: 200 },
];

const data3 = data1;
const data2 = [
  { label: "A1", value: 0, color: "#1939B7" },
  { label: "A2", value: 300, color: "#bb1515" },
  { label: "B1", value: 100, color: "#1939B7" },
  { label: "B2", value: 80 },
  { label: "B3", value: 40, color: "#1939B7" },
  { label: "B4", value: 30, color: "#bb1515" },
  { label: "B5", value: 50, color: "#bb1515" },
  { label: "C1", value: 100, color: "#1939B7" },
  { label: "C2", value: 200, color: "#bb1515" },
  { label: "D1", value: 150, color: "#1939B7" },
  { label: "D2", value: 50, color: "#bb1515" },
];
const DuocVatTu = () => {
  const now = dayjs().tz("Asia/Ho_Chi_Minh");
  const [date, setDate] = useState(now);
  const [isToday, setIsToday] = useState(true);
  const {
    dashboadChiSoChatLuong,
    
    CanLamSang_PhongThucHien,
   
    chisosObj,
    Duoc_TongHop,
    Duoc_TonKho,
    Duoc_TonKho_HetHan,
    Duoc_NhapNhaCungCap,
    Duoc_VatTu_Sumary,
  } = useSelector((state) => state.dashboard);
  const dispatch = useDispatch();
  const { darkMode } = useSelector((state) => state.mytheme);
  //   useEffect(() => {
  //     const dateCurent = new Date().toISOString();

  //     dispatch(getDataNewestByNgay(dateCurent));
  //   }, []);
  const dataCLSNoiTru = [];
  dataCLSNoiTru.push(chisosObj.xn_noitru);
  dataCLSNoiTru.push(chisosObj.xq_noitru);
  dataCLSNoiTru.push(chisosObj.ct32_noitru);
  dataCLSNoiTru.push(chisosObj.ct128_noitru);
  dataCLSNoiTru.push(chisosObj.ct128_noitru_bhyt);
  dataCLSNoiTru.push(chisosObj.mri30_noitru);
  dataCLSNoiTru.push(chisosObj.mri15_noitru);
  dataCLSNoiTru.push(chisosObj.sa_noitru);
  dataCLSNoiTru.push(chisosObj.cnhh_noitru);
  dataCLSNoiTru.push(chisosObj.mdlx_noitru);
  dataCLSNoiTru.push(chisosObj.ns_noitru);
  dataCLSNoiTru.push(chisosObj.dn_noitru);
  dataCLSNoiTru.push(chisosObj.dt_noitru);

  const dataCLSNgoaiTru = [];
  dataCLSNgoaiTru.push(chisosObj.xn_ngoaitru);
  dataCLSNgoaiTru.push(chisosObj.xq_ngoaitru);
  dataCLSNgoaiTru.push(chisosObj.ct32_ngoaitru);
  dataCLSNgoaiTru.push(chisosObj.ct128_ngoaitru);
  dataCLSNgoaiTru.push(chisosObj.ct128_ngoaitru_bhyt);
  dataCLSNgoaiTru.push(chisosObj.mri30_ngoaitru);
  dataCLSNgoaiTru.push(chisosObj.mri15_ngoaitru);
  dataCLSNgoaiTru.push(chisosObj.sa_ngoaitru);
  dataCLSNgoaiTru.push(chisosObj.cnhh_ngoaitru);
  dataCLSNgoaiTru.push(chisosObj.mdlx_ngoaitru);
  dataCLSNgoaiTru.push(chisosObj.ns_ngoaitru);
  dataCLSNgoaiTru.push(chisosObj.dn_ngoaitru);
  dataCLSNgoaiTru.push(chisosObj.dt_ngoaitru);

  const handleDateChange = (newDate) => {
    
    if (newDate instanceof Date) {
      // newDate.setHours(7, 0, 0, 0);
      setDate(new Date(newDate));
      console.log("newdate", newDate);
    } else if (dayjs.isDayjs(newDate)) {
      console.log("newdate", newDate);
     
      setDate(newDate);
     
    }
    setIsToday(dayjs(newDate).isSame(now, "day"));
    
  };

  useEffect(() => {
    const fetchNewestData = () => {
      console.log("newdate truyen  dispatch", date.toISOString());
      dispatch(getDataNewestByNgay(date.toISOString()));
      console.log("render lại");
      console.log("canlamsangphongthuchien", CanLamSang_PhongThucHien);
    };
    fetchNewestData();
    // Kiểm tra nếu ngày là ngày hiện tại mới chạy setInterval
    if (isToday) {
      // Gọi khi component mount

      const intervalId = setInterval(fetchNewestData, 900000); // Gọi lại sau mỗi 15 phút

      return () => {
        clearInterval(intervalId); // Dọn dẹp khi component unmount
      };
    }

    return undefined; // Nếu không phải ngày hiện tại, không chạy setInterval
  }, [dispatch, date, isToday]); // Chỉ rerun khi dispatch, date, hoặc isToday thay đổi

  return (
    <Stack>
      <AppBar position="static" sx={{ mb: 3 }}>
        <Toolbar>
          {dashboadChiSoChatLuong.Ngay && (
            <Typography
              variant="h6"
              sx={{ marginX: "auto", textAlign: "center" }}
            >
              (Số liệu {formatDateTime(dashboadChiSoChatLuong.Ngay)})
            </Typography>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <Card sx={{ m: 1 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                sx={{ m: 1 }}
                label="Ngày"
                value={date}
                onChange={handleDateChange}
              />
            </LocalizationProvider>
          </Card>
          <DisplayChiSoDashBoard
            ChiSoDashBoard={dashboadChiSoChatLuong.ChiSoDashBoard}
          />
        </Toolbar>
      </AppBar>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={12} md={6} spacing={1}>
          <Card sx={{ backgroundColor: darkMode ? "#1D1D1D" : "#1939B7" }}>
            <CardHeader
              title={"Dược"}
              sx={{ textAlign: "center", color: "#FFF" }}
            />
            <CardContent>
              <Grid container spacing={1}>
                {/* Grid items bên trong Card */}
                <Grid item xs={12} sm={12} md={6}>
                  <Card
                    sx={{
                      fontWeight: "bold",
                      color: darkMode ? "#FFF" : "#1939B7",

                      boxShadow: 10,
                    }}
                  >
                    Tồn kho 
                    <CardTonKho 
                    tonkho ={Duoc_VatTu_Sumary.find(item=>item.loai=== 'duoc')}
                    dataTonKho={Duoc_TonKho.filter(item=>[2,3,8,10].includes(item.medicinestoretype))}
                    />
                  </Card>
                </Grid>

                <Grid item xs={12} sm={12} md={6}>
                <Card
                    sx={{
                      fontWeight: "bold",
                      color: darkMode ? "#FFF" : "#1939B7",

                      boxShadow: 10,
                    }}
                  >
                    Hết hạn
                    <CardTonKho 
                    tonkho ={Duoc_VatTu_Sumary.find(item=>item.loai=== 'duochethan')}
                    dataTonKho={Duoc_TonKho_HetHan.filter(item=>[2,3,8,10].includes(item.medicinestoretype))}
                    colorCardWarning={true}
                    />
                  </Card>
                </Grid>

                <Grid item xs={12} sm={12} md={12}>
                  <Card
                    sx={{
                      fontWeight: "bold",
                      color: darkMode ? "#FFF" : "#1939B7",

                      boxShadow: 10,
                    }}
                  >
                    <Typography sx={{ fontSize: "1.2rem" }}>
                     Nhập nhà cung cấp
                    </Typography>
                  
                  </Card>
                </Grid>

                <Grid item xs={12} sm={12} md={12}>
                  <Card sx={{ p: 1 }}>
                    <Typography
                      sx={{
                        fontSize: "1.3rem",
                        color: darkMode ? "#FFF" : "#1939B7",
                      }}
                    >
                      Bệnh nhân đặc biệt đang điều trị
                    </Typography>
                    {/* <CardDonThuocNgoaiTru /> */}
                    <CardTheoDoiBNVip />
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Hiển thị nội trú */}
        <Grid item xs={12} sm={12} md={6} spacing={1}>
          <Card sx={{ backgroundColor: darkMode ? "#1D1D1D" : "#1939B7" }}>
            <CardHeader
              title={"Vật tư"}
              sx={{ textAlign: "center", color: "#FFF" }}
            />
            <CardContent>
            <Grid container spacing={1}>
                {/* Grid items bên trong Card */}
                <Grid item xs={12} sm={12} md={6}>
                  <Card
                    sx={{
                      fontWeight: "bold",
                      color: darkMode ? "#FFF" : "#1939B7",

                      boxShadow: 10,
                    }}
                  >
                    Tồn kho 
                    <CardTonKho 
                    tonkho ={Duoc_VatTu_Sumary.find(item=>item.loai=== 'vattu')}
                    dataTonKho={Duoc_TonKho.filter(item=>[7,9].includes(item.medicinestoretype))}
                    />
                  </Card>
                </Grid>

                <Grid item xs={12} sm={12} md={6}>
                <Card
                    sx={{
                      fontWeight: "bold",
                      color: darkMode ? "#FFF" : "#1939B7",

                      boxShadow: 10,
                    }}
                  >
                    Hết hạn
                    <CardTonKho 
                    tonkho ={Duoc_VatTu_Sumary.find(item=>item.loai=== 'vattuhethan')}
                    dataTonKho={Duoc_TonKho_HetHan.filter(item=>[7,9].includes(item.medicinestoretype))}
                    colorCardWarning = {true}
                    />
                  </Card>
                </Grid>

                <Grid item xs={12} sm={12} md={12}>
                  <Card
                    sx={{
                      fontWeight: "bold",
                      color: darkMode ? "#FFF" : "#1939B7",

                      boxShadow: 10,
                    }}
                  >
                    <Typography sx={{ fontSize: "1.2rem" }}>
                      Nhập nhà cung cấp
                    </Typography>
                  
                  </Card>
                </Grid>

                <Grid item xs={12} sm={12} md={12}>
                  <Card sx={{ p: 1 }}>
                    <Typography
                      sx={{
                        fontSize: "1.3rem",
                        color: darkMode ? "#FFF" : "#1939B7",
                      }}
                    >
                      Bệnh nhân đặc biệt đang điều trị
                    </Typography>
                    {/* <CardDonThuocNgoaiTru /> */}
                    <CardTheoDoiBNVip />
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
       
      </Grid>

    </Stack>
  );
};

export default DuocVatTu;
