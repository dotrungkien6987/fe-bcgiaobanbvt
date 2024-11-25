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
  Autocomplete,
  TextField,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import {
  DatePicker,
  datePickerToolbarClasses,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

import { formatDate_getDate, formatDateTime } from "utils/formatTime";
import DisplayChiSoDashBoard from "components/DisplayChiSoDashBoard";

import { getDataNewestByNgay } from "../dashboardSlice";
import CardTonKho from "./CardTonKho";
import CardNhapNhaCungCap from "./CardNhapNhaCungCap";
import CardNhapXuat from "./CardNhapXuat";
import CardTonTheoKho from "./CardTonTheoKho";
import { da } from "date-fns/locale";

const DuocVatTu = () => {
  const now = dayjs().tz("Asia/Ho_Chi_Minh");
  const [date, setDate] = useState(now);
  const [selectedKhoDuocID, setSelectedKhoDuocID] = useState(30);
  const [selectedKhoVatTuID, setSelectedKhoVatTuID] = useState(168);
  const [isToday, setIsToday] = useState(true);
  const {
    dashboadChiSoChatLuong,

    ChiaKho_NhapNhaCungCap_TrongNgay,
    Duoc_NhapNhaCungCap_TrongNgay,

    Duoc_TongHop,
    Duoc_TonKho,
    Duoc_TonKho_HetHan,
    Duoc_NhapNhaCungCap,
    Duoc_VatTu_Sumary,
    ChiaKho_NhapNhaCungCap,
    Kho_Unique,
  } = useSelector((state) => state.dashboard);
  const dispatch = useDispatch();
  const { darkMode } = useSelector((state) => state.mytheme);

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
                      tonkho={Duoc_VatTu_Sumary.find(
                        (item) => item.loai === "duoc"
                      )}
                      dataTonKho={Duoc_TonKho.filter((item) =>
                        [2, 3, 8, 10].includes(item.medicinestoretype)
                      )}
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
                      tonkho={Duoc_VatTu_Sumary.find(
                        (item) => item.loai === "duochethan"
                      )}
                      dataTonKho={Duoc_TonKho_HetHan.filter((item) =>
                        [2, 3, 8, 10].includes(item.medicinestoretype)
                      )}
                      colorCardWarning={true}
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
                  
                      Nhập nhà cung cấp trong tháng
                   
                    <Typography sx={{ fontSize: "1rem" }}>
                      {`(Từ 00:00 01/${formatDate_getDate(
                        date.toISOString()
                      ).substring(3, 10)} đến ${formatDateTime(
                        dashboadChiSoChatLuong.Ngay
                      )})`}
                    </Typography>

                    <CardNhapNhaCungCap
                      khohienthi={ChiaKho_NhapNhaCungCap.filter(
                        (item) => item.medicinestoretype === 3
                      )}
                      dataNhapNhaCungCap={Duoc_NhapNhaCungCap}
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
                    Nhập nhà cung cấp trong ngày
                    <Typography sx={{ fontSize: "1rem" }}>
                      {`(Ngày ${formatDate_getDate(
                        dashboadChiSoChatLuong.Ngay
                      )})`}
                    </Typography>
                    <CardNhapNhaCungCap
                      khohienthi={ChiaKho_NhapNhaCungCap_TrongNgay.filter(
                        (item) => item.medicinestoretype === 3
                      )}
                      dataNhapNhaCungCap={Duoc_NhapNhaCungCap_TrongNgay}
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
                      Nhập xuất tồn trong tháng
                    </Typography>
                    <Autocomplete
                      options={Kho_Unique.filter((item) =>
                        [2, 3, 8, 4].includes(item.medicinestoretype)
                      )} // Sử dụng Khoa_Unique để lọc khoa theo loại
                      getOptionLabel={(option) =>
                        option?.medicinestorename || ""
                      } // Hiển thị TenKhoa
                      value={
                        Kho_Unique.find(
                          (khoa) => khoa.medicinestoreid === selectedKhoDuocID
                        ) || null
                      } // So khớp value theo _id
                      onChange={(event, newValue) => {
                        setSelectedKhoDuocID(
                          newValue ? newValue.medicinestoreid : null
                        ); // Lưu _id vào selectedKhoaID
                      }}
                      renderInput={(params) => (
                        <TextField {...params} label="Chọn khoa" />
                      )}
                      sx={{ width: "100%" }}
                    />
                    <Card
                      sx={{
                        fontWeight: "bold",
                        color: "#f2f2f2",
                        backgroundColor: "#1939B7",
                        p: 2,
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={12} md={4} spacing={1}>
                          <CardNhapXuat
                            dataNhapXuat={Duoc_TongHop.filter(
                              (item) =>
                                item.medicinestoreid === selectedKhoDuocID &&
                                item.nhapxuat === 1
                            )}
                            title="Nhập"
                          />
                        </Grid>
                        <Grid item xs={12} sm={12} md={4} spacing={1}>
                          <CardNhapXuat
                            dataNhapXuat={Duoc_TongHop.filter(
                              (item) =>
                                item.medicinestoreid === selectedKhoDuocID &&
                                item.nhapxuat === 2
                            )}
                            title="Xuất"
                          />
                        </Grid>
                        <Grid item xs={12} sm={12} md={4} spacing={1}>
                          <CardTonTheoKho
                            tonkho={Duoc_TonKho.find(
                              (item) =>
                                item.medicinestoreid === selectedKhoDuocID
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Card>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Hiển thị vat tu */}
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
                      tonkho={Duoc_VatTu_Sumary.find(
                        (item) => item.loai === "vattu"
                      )}
                      dataTonKho={Duoc_TonKho.filter((item) =>
                        [7, 9].includes(item.medicinestoretype)
                      )}
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
                      tonkho={Duoc_VatTu_Sumary.find(
                        (item) => item.loai === "vattuhethan"
                      )}
                      dataTonKho={Duoc_TonKho_HetHan.filter((item) =>
                        [7, 9].includes(item.medicinestoretype)
                      )}
                      colorCardWarning={true}
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
                     <Typography sx={{ fontSize: "1rem", fontWeight: "bold",}}>
                      Nhập nhà cung cấp trong tháng
                    </Typography>
                    <Typography sx={{ fontSize: "1rem" }}>
                      {`(Từ 00:00 01/${formatDate_getDate(
                        date.toISOString()
                      ).substring(3, 10)} đến ${formatDateTime(
                        dashboadChiSoChatLuong.Ngay
                      )})`}
                    </Typography>
                    <CardNhapNhaCungCap
                      khohienthi={ChiaKho_NhapNhaCungCap.filter(
                        (item) => item.medicinestoretype === 7
                      )}
                      dataNhapNhaCungCap={Duoc_NhapNhaCungCap}
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
                    Nhập nhà cung cấp trong ngày
                    <Typography sx={{ fontSize: "1rem" }}>
                      {`(Ngày ${formatDate_getDate(
                        dashboadChiSoChatLuong.Ngay
                      )})`}
                    </Typography>
                    <CardNhapNhaCungCap
                      khohienthi={ChiaKho_NhapNhaCungCap_TrongNgay.filter(
                        (item) => item.medicinestoretype === 7
                      )}
                      dataNhapNhaCungCap={Duoc_NhapNhaCungCap_TrongNgay}
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
                      Nhập xuất tồn trong tháng
                    </Typography>
                    <Autocomplete
                      options={Kho_Unique.filter((item) =>
                        [7, 9].includes(item.medicinestoretype)
                      )} // Sử dụng Khoa_Unique để lọc khoa theo loại
                      getOptionLabel={(option) =>
                        option?.medicinestorename || ""
                      } // Hiển thị TenKhoa
                      value={
                        Kho_Unique.find(
                          (khoa) => khoa.medicinestoreid === selectedKhoVatTuID
                        ) || null
                      } // So khớp value theo _id
                      onChange={(event, newValue) => {
                        setSelectedKhoVatTuID(
                          newValue ? newValue.medicinestoreid : null
                        ); // Lưu _id vào selectedKhoaID
                      }}
                      renderInput={(params) => (
                        <TextField {...params} label="Chọn khoa" />
                      )}
                      sx={{ width: "100%" }}
                    />
                    <Card
                      sx={{
                        fontWeight: "bold",
                        color: "#f2f2f2",
                        backgroundColor: "#1939B7",
                        p: 2,
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={12} md={4} spacing={1}>
                          <CardNhapXuat
                            dataNhapXuat={Duoc_TongHop.filter(
                              (item) =>
                                item.medicinestoreid === selectedKhoVatTuID &&
                                item.nhapxuat === 1
                            )}
                            title="Nhập"
                          />
                        </Grid>

                        <Grid item xs={12} sm={12} md={4} spacing={1}>
                          <CardNhapXuat
                            dataNhapXuat={Duoc_TongHop.filter(
                              (item) =>
                                item.medicinestoreid === selectedKhoVatTuID &&
                                item.nhapxuat === 2
                            )}
                            title="Xuất"
                          />
                        </Grid>

                        <Grid item xs={12} sm={12} md={4} spacing={1}>
                          <CardTonTheoKho
                            tonkho={Duoc_TonKho.find(
                              (item) =>
                                item.medicinestoreid === selectedKhoVatTuID
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Card>
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
