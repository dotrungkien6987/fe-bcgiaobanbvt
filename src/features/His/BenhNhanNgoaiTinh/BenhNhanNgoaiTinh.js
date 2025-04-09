import { AppBar, Box, Card, CardContent, CardHeader, Grid, Stack, Toolbar, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import DateRangePicker from "../DateRangePicker";

import ChartCard from "./ChartCard";
import DetailDialog from "./DetailDialog";
import { getDataFix } from "features/NhanVien/nhanvienSlice";

const colors = [
  { color: "#1939B7" },
  { color: "#bb1515" },
  { color: "#00C49F" },
  { color: "#eb99ff" },
  { color: "#660000" },
  { color: "#00661a" },
  { color: "#0033cc" },
  { color: "#00cc00" },
  { color: "#0088FE" },
  { color: "#FFBB28" },
  { color: "#2ABC28" },
];

function BenhNhanNgoaiTinh() {
  const { darkMode } = useSelector((state) => state.mytheme);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogData, setDialogData] = useState([]);
  const [dialogIsTinh, setDialogIsTinh] = useState(false);
  const [dialogIsHuyen, setDialogIsHuyen] = useState(false);
  const [dialogMaTinh, setDialogMaTinh] = useState(null);
  const [dialogMaHuyen, setDialogMaHuyen] = useState(null);
  // Hàm mở dialog với tiêu đề và dữ liệu tương ứng
  // Hàm mở dialog với tiêu đề và dữ liệu tương ứng
  const handleOpenDetail = (title, data, isTinh = false, isHuyen = false, maTinh = null, maHuyen = null) => {
    setDialogTitle(title);
    setDialogData(data);
    setDialogIsTinh(isTinh);
    setDialogIsHuyen(isHuyen);
    setDialogMaTinh(maTinh);
    setDialogMaHuyen(maHuyen);
    setOpenDialog(true);
  };

  // Hàm đóng dialog
  const handleCloseDetail = () => {
    setOpenDialog(false);
  };

  const {
    PieChartBenhNhanNgoaiTinhNgoaiTru,
    PieChartBenhNhanNgoaiTinhNoiTru,
    PieChartVinhPhucNgoaiTru,
    PieChartVinhPhucNoiTru,
    PieChartHoaBinhNgoaiTru,
    PieChartHoaBinhNoiTru,
    PieChartTuyenQuangNgoaiTru,
    PieChartTuyenQuangNoiTru,
    PieChartYenBaiNgoaiTru,
    PieChartYenBaiNoiTru,
    PieChartBaViNgoaiTru,
    PieChartBaViNoiTru,
  } = useSelector((state) => state.his);

  const dispatch = useDispatch();
    useEffect(() => {
      dispatch(getDataFix());
    }, [dispatch]);
    const { Tinh,Huyen,Xa } = useSelector(
      (state) => state.nhanvien
    );

    // Xác định xem dữ liệu đang xem là của tỉnh, huyện hay khác
    const handleViewDetail = (title, data) => {
      // Xác định loại dữ liệu từ tiêu đề
      const isTinh = title.includes("Vĩnh Phúc") || 
                    title.includes("Hòa Bình") || 
                    title.includes("Tuyên Quang") || 
                    title.includes("Yên Bái");
                    
      const isHuyen = title.includes("Ba Vì");
      let maTinh = null;
      
      // Xác định mã tỉnh dựa vào title
      if (title.includes("Vĩnh Phúc")) maTinh = "26";
      else if (title.includes("Hòa Bình")) maTinh = "17";
      else if (title.includes("Tuyên Quang")) maTinh = "08";
      else if (title.includes("Yên Bái")) maTinh = "15";
      else if (title.includes("Ba Vì")) maTinh = "01"; // Thêm mã tỉnh cho Ba Vì (01 là mã của Hà Nội)
      
      // Mã huyện cho Ba Vì
      const maHuyen = isHuyen ? "17" : null;
      
      // Mở dialog với các thông số phù hợp
      handleOpenDetail(title, data, isTinh, isHuyen, maTinh, maHuyen);
    };


  return (
    <Stack>
      <AppBar position="static" sx={{ mb: 3 }}>
        <Toolbar>
          <Typography
            variant="h6"
            sx={{ marginX: "auto", textAlign: "center" }}
          >
            BỆNH NHÂN NGOẠI TỈNH
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
        </Toolbar>
      </AppBar>
      
      <DateRangePicker />
      
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {/* Cột Ngoại Trú */}
        <Grid item xs={12} sm={12} md={6} spacing={1}>
          <Card sx={{ backgroundColor: darkMode ? "#1D1D1D" : "#1939B7" }}>
            <CardHeader
              title={"Ngoại trú"}
              sx={{ textAlign: "center", color: "#FFF" }}
            />
            <CardContent>
              <Grid container spacing={1}>
                {/* Ngoại tỉnh ngoại trú */}
                <Grid item xs={12} sm={12} md={12}>
                  <ChartCard 
                    title="Tổng hợp BN ngoại tỉnh ngoại trú" 
                    data={PieChartBenhNhanNgoaiTinhNgoaiTru} 
                    colors={colors}
                    darkMode={darkMode}
                    onViewDetail={handleOpenDetail}
                  />
                </Grid>

                {/* Vĩnh Phúc ngoại trú */}
                <Grid item xs={12} sm={12} md={12}>
                  <ChartCard 
          title="Vĩnh Phúc ngoại trú" 
          data={PieChartVinhPhucNgoaiTru} 
          colors={colors}
          darkMode={darkMode}
          onViewDetail={handleViewDetail}
        />
                </Grid>

                {/* Hòa Bình ngoại trú */}
                <Grid item xs={12} sm={12} md={12}>
                  <ChartCard 
                    title="Hòa Bình ngoại trú" 
                    data={PieChartHoaBinhNgoaiTru} 
                    colors={colors}
                    darkMode={darkMode}
                    onViewDetail={handleViewDetail}
                  />
                </Grid>

                {/* Tuyên Quang ngoại trú */}
                <Grid item xs={12} sm={12} md={12}>
                  <ChartCard 
                    title="Tuyên Quang ngoại trú" 
                    data={PieChartTuyenQuangNgoaiTru} 
                    colors={colors}
                    darkMode={darkMode}
                    onViewDetail={handleViewDetail}
                  />
                </Grid>

                {/* Yên Bái ngoại trú */}
                <Grid item xs={12} sm={12} md={12}>
                  <ChartCard 
                    title="Yên Bái ngoại trú" 
                    data={PieChartYenBaiNgoaiTru} 
                    colors={colors}
                    darkMode={darkMode}
                    onViewDetail={handleViewDetail}
                  />
                </Grid>

                {/* Ba Vì ngoại trú */}
                <Grid item xs={12} sm={12} md={12}>
                  <ChartCard 
                    title="Ba Vì ngoại trú" 
                    data={PieChartBaViNgoaiTru} 
                    colors={colors}
                    darkMode={darkMode}
                    onViewDetail={handleViewDetail}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cột Nội Trú */}
        <Grid item xs={12} sm={12} md={6} spacing={1}>
          <Card sx={{ backgroundColor: darkMode ? "#1D1D1D" : "#1939B7" }}>
            <CardHeader
              title={"Nội trú"}
              sx={{ textAlign: "center", color: "#FFF" }}
            />
            <CardContent>
              <Grid container spacing={1}>
                {/* Ngoại tỉnh nội trú */}
                <Grid item xs={12} sm={12} md={12}>
                  <ChartCard 
                    title="Tổng hợp BN ngoại tỉnh nội trú" 
                    data={PieChartBenhNhanNgoaiTinhNoiTru} 
                    colors={colors}
                    darkMode={darkMode}
                    onViewDetail={handleViewDetail}
                  />
                </Grid>

                {/* Vĩnh Phúc nội trú */}
                <Grid item xs={12} sm={12} md={12}>
                  <ChartCard 
                    title="Vĩnh Phúc nội trú" 
                    data={PieChartVinhPhucNoiTru} 
                    colors={colors}
                    darkMode={darkMode}
                    onViewDetail={handleViewDetail}
                  />
                </Grid>

                {/* Hòa Bình nội trú */}
                <Grid item xs={12} sm={12} md={12}>
                  <ChartCard 
                    title="Hòa Bình nội trú" 
                    data={PieChartHoaBinhNoiTru} 
                    colors={colors}
                    darkMode={darkMode}
                    onViewDetail={handleViewDetail}
                  />
                </Grid>

                {/* Tuyên Quang nội trú */}
                <Grid item xs={12} sm={12} md={12}>
                  <ChartCard 
                    title="Tuyên Quang nội trú" 
                    data={PieChartTuyenQuangNoiTru} 
                    colors={colors}
                    darkMode={darkMode}
                    onViewDetail={handleViewDetail}
                  />
                </Grid>

                {/* Yên Bái nội trú */}
                <Grid item xs={12} sm={12} md={12}>
                  <ChartCard 
                    title="Yên Bái nội trú" 
                    data={PieChartYenBaiNoiTru} 
                    colors={colors}
                    darkMode={darkMode}
                    onViewDetail={handleViewDetail}
                  />
                </Grid>

                {/* Ba Vì nội trú */}
                <Grid item xs={12} sm={12} md={12}>
                  <ChartCard 
                    title="Ba Vì nội trú" 
                    data={PieChartBaViNoiTru} 
                    colors={colors}
                    darkMode={darkMode}
                    onViewDetail={handleViewDetail}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog hiển thị chi tiết */}
      <DetailDialog
          open={openDialog}
          title={dialogTitle}
          data={dialogData}
          onClose={handleCloseDetail}
          darkMode={darkMode}
          Huyens={Huyen || []}
          Xas={Xa || []}
          isTinh={dialogIsTinh}
          isHuyen={dialogIsHuyen}
          maTinh={dialogMaTinh}
          maHuyen={dialogMaHuyen}
      />
    </Stack>
  );
}

export default BenhNhanNgoaiTinh;