
  import MainCard from "components/MainCard";
 
import DateRangePicker from "../DateRangePicker";
import { AppBar, Box, Card, CardContent, CardHeader, Grid, Stack, Toolbar, Typography } from "@mui/material";
import MyPieChart from "components/form/MyPieChart";
import { useSelector } from "react-redux";
  
  function BenhNhanNgoaiTinh() {
   const { darkMode } = useSelector((state) => state.mytheme);
    const {
       dashboadChiSoChatLuong,
      
       CanLamSang_PhongThucHien,
       khambenhngoaitru,
       dangdieutrinoitru,
       chisosObj,
       giuongconglap,
       giuongyeucau,
     } = useSelector((state) => state.dashboard);
    return (
      <Stack >
        <AppBar position="static" sx={{ mb: 3 }}>
                <Toolbar>
                  {dashboadChiSoChatLuong.Ngay && (
                    <Typography
                      variant="h6"
                      sx={{ marginX: "auto", textAlign: "center" }}
                    >
                      BỆNH NHÂN NGOẠI TỈNH
                    </Typography>
                  )}
                  <Box sx={{ flexGrow: 1 }} />
                 
                </Toolbar>
              </AppBar>
        <DateRangePicker/>
        <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={12} md={6} spacing={1}>
          <Card sx={{ backgroundColor: darkMode ? "#1D1D1D" : "#1939B7" }}>
            <CardHeader
              title={"Ngoại trú"}
              sx={{ textAlign: "center", color: "#FFF" }}
            />
            <CardContent>
              <Grid container spacing={1}>
                {/* Grid items bên trong Card */}
                <Grid item xs={12} sm={12} md={12}>
                  <Card
                    sx={{
                      fontWeight: "bold",
                      color: darkMode ? "#FFF" : "#1939B7",

                      boxShadow: 10,
                    }}
                  >
                    Đăng ký khám
                    MyPieChart
                      
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
                      Cận lâm sàng ngoại trú
                    </Typography>
                    {darkMode ? (
                      'BarApexChartDarkMode'
                        
                      
                    ) : (
                      'BarAPexChart'
                    )}
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
                   
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={12} md={6} spacing={1}>
          <Card sx={{ backgroundColor: darkMode ? "#1D1D1D" : "#1939B7" }}>
            <CardHeader
              title={"Nội trú"}
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
                    Đang điều trị nội trú
                  PIE
                  </Card>
                </Grid>

                <Grid item xs={12} sm={12} md={6}>
                  CardXuTriNoiTru 
                </Grid>

                <Grid item xs={12} sm={12} md={12}>
                  <Card
                    sx={{
                      fontWeight: "bold",
                      color: darkMode ? "#FFF" : "#1939B7",

                      boxShadow: 10,
                    }}
                  >
                    {/* <CardHeader title={"Cận lâm sàng nội trú"} sx={{fontSize:'0.5rem'}} /> */}
                    <Typography sx={{ fontSize: "1.2rem" }}>
                      Cận lâm sàng nội trú
                    </Typography>
                   bAR
                  </Card>
                </Grid>

                <Grid item xs={12} sm={12} md={12}>
                  <Card sx={{ p: 1 }}>
                    <Typography
                      sx={{
                        fontSize: "1.2rem",
                        color: darkMode ? "#FFF" : "#1939B7",
                      }}
                    >
                      Tình hình sử dụng giường
                    </Typography>
                    <Grid container spacing={1}>
                      {/* Grid items bên trong Card */}
                      <Grid item xs={12} sm={12} md={6}>
                        <Card sx={{ boxShadow: 15 }}>
                          <Typography
                            sx={{ color: darkMode ? "#FFF" : "#1939B7" }}
                          >
                            Giường công lập
                          </Typography>
                          <Typography sx={{ color: "#bb1515" }}>
                            (BN đang nằm:{" "}
                            {chisosObj.giuongconglap_sudung_tongbn})
                          </Typography>
                         PIE
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={12} md={6}>
                        <Card sx={{ boxShadow: 15 }}>
                          <Typography
                            sx={{ color: darkMode ? "#FFF" : "#1939B7" }}
                          >
                            Giường yêu cầu
                          </Typography>
                          <Typography sx={{ color: "#bb1515" }}>
                            (BN đang nằm: {chisosObj.giuongyeucau_sudung_tongbn}
                            )
                          </Typography>
                          PIE
                        </Card>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
           
        </Grid>
         
      </Stack>
    );
  }
  
  export default BenhNhanNgoaiTinh;