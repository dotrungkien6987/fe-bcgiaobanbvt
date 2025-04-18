import React, { useEffect, useState } from "react";
import {
  
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
import {
  getDataNewestByNgay,
  getDataNewestByNgayChenhLech,
  getKhuyenCaoKhoaByThangNam,
} from "./dashboardSlice";
import DisplayChiSoDashBoard from "../../components/DisplayChiSoDashBoard";

import { formatDateTime } from "../../utils/formatTime";

import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import TableDoanhThuKPI from "./TableDoanhThuKPI";
import { FRadioGroup, FormProvider } from "../../components/form";
import { useForm } from "react-hook-form";

import BarGroupStackChart from "./BarGroupStachChart";
import {
  ConvertDoanhThuCanLamSang,
  ConvertDoanhThuKhoaThemTong,
  TongHopSoLieuChoRowTongDoanhThuKPI,
  calculateKhuyenCaoToanVien,
  calculateTotalForType,
} from "../../utils/heplFuntion";

import MyPieChartForMoney from "./MyPieChartForMoney";
import TableDoanhThuCanLamSang from "./TableDoanhThuCanLamSang";
import CardTongTienChuaDuyetKT from "./CardTongTienChuaDuyetKT";

const TaiChinh = () => {
  dayjs.tz.setDefault("Asia/Ho_Chi_Minh"); // Cấu hình múi giờ nếu cần

  // Khởi tạo trạng thái với ngày hôm qua
  const yesterday = dayjs().subtract(1, "day").tz("Asia/Ho_Chi_Minh");
  const [dateChenhLech, setDateChenhLech] = useState(yesterday);

  const now = dayjs().tz("Asia/Ho_Chi_Minh");
  const [date, setDate] = useState(now);

  const [isToday, setIsToday] = useState(true);
  const [thang, setThang] = useState();
  const [nam, setNam] = useState();
  const [ngay, setNgay] = useState();
  const {
    dashboadChiSoChatLuong,
    dashboad_NgayChenhLech,
    doanhthu_toanvien_theochidinh,
    doanhthu_toanvien_duyetketoan,
    doanhthu_toanvien_theochidinh_NgayChenhLech,
    doanhthu_toanvien_duyetketoan_NgayChenhLech,
    KPI_DuyetKeToan_With_ChenhLech,
    KPI_TheoChiDinh_With_ChenhLech,
    Pie_DoanhThu_DuyetKeToan,
    Pie_DoanhThu_DuyetKeToan_ChenhLech,
    Pie_DoanhThu_TheoChiDinh,
    Pie_DoanhThu_TheoChiDinh_ChenhLech,
    doanhthu_canlamsang_duyetketoan,
    doanhthu_canlamsang_theochidinh,
    doanhthu_canlamsang_theochidinh_NgayChenhLech,
    doanhthu_canlamsang_duyetketoan_NgayChenhLech,
    khuyencaokhoa,

    DoanhThu_ChuaDuyetKeToan_ThangHienTai_TheoKhoa,
    DoanhThu_ChuaDuyetKeToan_ThangTruoc_TheoKhoa,
    SoLuong_TongTien_ChuaDuyetKeToan_ThangTruoc,
    SoLuong_TongTien_ChuaDuyetKeToan_ThangHienTai,
    chisosObj,
    chisosObj_NgayChenhLech,
  } = useSelector((state) => state.dashboard);

  const DoanhThu_ChuaDuyetKeToan_ThangTruoc_TheoKhoa_RaVien_ThemTong =
    ConvertDoanhThuKhoaThemTong(
      DoanhThu_ChuaDuyetKeToan_ThangTruoc_TheoKhoa.filter(
        (e) => e.vienphistatus === 1
      ),
      SoLuong_TongTien_ChuaDuyetKeToan_ThangTruoc.find(
        (e) => e.vienphistatus === 1
      )?.soluong
    );
  const DoanhThu_ChuaDuyetKeToan_ThangTruoc_TheoKhoa_ChuaRaVien_ThemTong =
    ConvertDoanhThuKhoaThemTong(
      DoanhThu_ChuaDuyetKeToan_ThangTruoc_TheoKhoa.filter(
        (e) => e.vienphistatus === 0
      ),
      SoLuong_TongTien_ChuaDuyetKeToan_ThangTruoc.find(
        (e) => e.vienphistatus === 0
      )?.soluong
    );
  const DoanhThu_ChuaDuyetKeToan_ThangHienTai_TheoKhoa_ChuaRaVien_ThemTong =
    ConvertDoanhThuKhoaThemTong(
      DoanhThu_ChuaDuyetKeToan_ThangHienTai_TheoKhoa.filter(
        (e) => e.vienphistatus === 0
      ),
      SoLuong_TongTien_ChuaDuyetKeToan_ThangHienTai.find(
        (e) => e.vienphistatus === 0
      )?.soluong
    );
  const DoanhThu_ChuaDuyetKeToan_ThangHienTai_TheoKhoa_RaVien_ThemTong =
    ConvertDoanhThuKhoaThemTong(
      DoanhThu_ChuaDuyetKeToan_ThangHienTai_TheoKhoa.filter(
        (e) => e.vienphistatus === 1
      ),
      SoLuong_TongTien_ChuaDuyetKeToan_ThangHienTai.find(
        (e) => e.vienphistatus === 1
      )?.soluong
    );

  const CanLamSangDuyetKeToan = ConvertDoanhThuCanLamSang(
    doanhthu_canlamsang_duyetketoan,
    doanhthu_canlamsang_duyetketoan_NgayChenhLech
  );
  const CanLamSangTheoChiDinh = ConvertDoanhThuCanLamSang(
    doanhthu_canlamsang_theochidinh,
    doanhthu_canlamsang_theochidinh_NgayChenhLech
  );
  const VND = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });

  const congthutructiep=(dataPie)=>{
    return(dataPie[0]?.value+dataPie[1]?.value+dataPie[3]?.value)
  }
  let dataEx_DuyetKeToan = [];
  dataEx_DuyetKeToan.push({
    label: `MRI 1.5: ${VND.format(
      calculateTotalForType("MRI15", doanhthu_canlamsang_duyetketoan)
    )}`,
    value: 0,
    color: "white",
  });
  dataEx_DuyetKeToan.push({
    label: `CT 128: ${VND.format(
      calculateTotalForType("CLVT128", doanhthu_canlamsang_duyetketoan)
    )}`,
    value: 0,
    color: "white",
  });
  dataEx_DuyetKeToan.push({
    label: `CT 32: ${VND.format(
      calculateTotalForType("CLVT32", doanhthu_canlamsang_duyetketoan)
    )}`,
    value: 0,
    color: "white",
  });
  dataEx_DuyetKeToan.push({
    label: `CT 32 (phụ thu): ${VND.format(
      calculateTotalForType("CLVT32PHUTHU", doanhthu_canlamsang_duyetketoan)
    )}`,
    value: 0,
    color: "white",
  });
  dataEx_DuyetKeToan.push({
    label: `Cộng thu trực tiếp: ${VND.format(
      congthutructiep(Pie_DoanhThu_DuyetKeToan)
    )}`,
    value: 0,
    color: "white",
  });

  let dataEx_TheoChiDinh = [];
  dataEx_TheoChiDinh.push({
    label: `MRI 1.5: ${VND.format(
      calculateTotalForType("MRI15", doanhthu_canlamsang_theochidinh)
    )}`,
    value: 0,
    color: "white",
  });
  dataEx_TheoChiDinh.push({
    label: `CT 128: ${VND.format(
      calculateTotalForType("CLVT128", doanhthu_canlamsang_theochidinh)
    )}`,
    value: 0,
    color: "white",
  });
  dataEx_TheoChiDinh.push({
    label: `CT 32: ${VND.format(
      calculateTotalForType("CLVT32", doanhthu_canlamsang_theochidinh)
    )}`,
    value: 0,
    color: "white",
  });
  dataEx_TheoChiDinh.push({
    label: `CT 32 (phụ thu): ${VND.format(
      calculateTotalForType("CLVT32PHUTHU", doanhthu_canlamsang_theochidinh)
    )}`,
    value: 0,
    color: "white",
  });
  dataEx_TheoChiDinh.push({
    label: `Cộng thu trực tiếp: ${VND.format(
      congthutructiep(Pie_DoanhThu_TheoChiDinh)
    )}`,
    value: 0,
    color: "white",
  });

  let dataEx_ChenhLech_TheoChiDinh = [];
  dataEx_ChenhLech_TheoChiDinh.push({
    label: `MRI 1.5: ${VND.format(
      calculateTotalForType("MRI15", doanhthu_canlamsang_theochidinh) -
        calculateTotalForType(
          "MRI15",
          doanhthu_canlamsang_theochidinh_NgayChenhLech
        )
    )}`,
    value: 0,
    color: "white",
  });
  dataEx_ChenhLech_TheoChiDinh.push({
    label: `CT 128: ${VND.format(
      calculateTotalForType("CLVT128", doanhthu_canlamsang_theochidinh) -
        calculateTotalForType(
          "CLVT128",
          doanhthu_canlamsang_theochidinh_NgayChenhLech
        )
    )}`,
    value: 0,
    color: "white",
  });
  dataEx_ChenhLech_TheoChiDinh.push({
    label: `CT 32: ${VND.format(
      calculateTotalForType("CLVT32", doanhthu_canlamsang_theochidinh) -
        calculateTotalForType(
          "CLVT32",
          doanhthu_canlamsang_theochidinh_NgayChenhLech
        )
    )}`,
    value: 0,
    color: "white",
  });
  dataEx_ChenhLech_TheoChiDinh.push({
    label: `CT 32 (phụ thu): ${VND.format(
      calculateTotalForType("CLVT32PHUTHU", doanhthu_canlamsang_theochidinh) -
        calculateTotalForType(
          "CLVT32PHUTHU",
          doanhthu_canlamsang_theochidinh_NgayChenhLech
        )
    )}`,
    value: 0,
    color: "white",
  });
  dataEx_ChenhLech_TheoChiDinh.push({
    label: `Cộng thu trực tiếp: ${VND.format(
      congthutructiep(Pie_DoanhThu_TheoChiDinh_ChenhLech)
    )}`,
    value: 0,
    color: "white",
  });


  let dataEx_ChenhLech_DuyetKeToan = [];
  dataEx_ChenhLech_DuyetKeToan.push({
    label: `MRI 1.5: ${VND.format(
      calculateTotalForType("MRI15", doanhthu_canlamsang_duyetketoan) -
        calculateTotalForType(
          "MRI15",
          doanhthu_canlamsang_duyetketoan_NgayChenhLech
        )
    )}`,
    value: 0,
    color: "white",
  });
  dataEx_ChenhLech_DuyetKeToan.push({
    label: `CT 128: ${VND.format(
      calculateTotalForType("CLVT128", doanhthu_canlamsang_duyetketoan) -
        calculateTotalForType(
          "CLVT128",
          doanhthu_canlamsang_duyetketoan_NgayChenhLech
        )
    )}`,
    value: 0,
    color: "white",
  });
  dataEx_ChenhLech_DuyetKeToan.push({
    label: `CT 32: ${VND.format(
      calculateTotalForType("CLVT32", doanhthu_canlamsang_duyetketoan) -
        calculateTotalForType(
          "CLVT32",
          doanhthu_canlamsang_duyetketoan_NgayChenhLech
        )
    )}`,
    value: 0,
    color: "white",
  });
  dataEx_ChenhLech_DuyetKeToan.push({
    label: `CT 32 (phụ thu): ${VND.format(
      calculateTotalForType("CLVT32PHUTHU", doanhthu_canlamsang_duyetketoan) -
        calculateTotalForType(
          "CLVT32PHUTHU",
          doanhthu_canlamsang_duyetketoan_NgayChenhLech
        )
    )}`,
    value: 0,
    color: "white",
  });
  dataEx_ChenhLech_DuyetKeToan.push({
    label: `Cộng thu trực tiếp: ${VND.format(
      congthutructiep(Pie_DoanhThu_DuyetKeToan_ChenhLech)
    )}`,
    value: 0,
    color: "white",
  });
  const KhuyenCao_ToanVien = calculateKhuyenCaoToanVien(khuyencaokhoa);
  const Tong_DuyetKeToan = TongHopSoLieuChoRowTongDoanhThuKPI(
    doanhthu_toanvien_duyetketoan,
    doanhthu_toanvien_duyetketoan_NgayChenhLech,
    KhuyenCao_ToanVien,
    ngay
  );
  const Tong_TheoChiDinh = TongHopSoLieuChoRowTongDoanhThuKPI(
    doanhthu_toanvien_theochidinh,
    doanhthu_toanvien_theochidinh_NgayChenhLech,
    KhuyenCao_ToanVien,
    ngay
  );
  const dispatch = useDispatch();
  const { darkMode } = useSelector((state) => state.mytheme);
  //   useEffect(() => {
  //     const dateCurent = new Date().toISOString();

  //     dispatch(getDataNewestByNgay(dateCurent));
  //   }, []);

  const handleDateChange = (newDate) => {
    // Chuyển đổi về múi giờ VN, kiểm tra đầu vào

    if (newDate instanceof Date) {
      // newDate.setHours(7, 0, 0, 0);
      setDate(new Date(newDate));
    } else if (dayjs.isDayjs(newDate)) {
      console.log("newdate", newDate.toISOString());

      setDate(newDate);
      // setDate(updatedDate);
    }
    setIsToday(dayjs(newDate).isSame(now, "day"));
    // dispatch(getDataNewestByNgay(date.toISOString()));
  };
  const handleDateChenhLechChange = (newDate) => {
    // Chuyển đổi về múi giờ VN, kiểm tra đầu vào

    if (newDate instanceof Date) {
      // newDate.setHours(7, 0, 0, 0);
      setDateChenhLech(new Date(newDate));
    } else if (dayjs.isDayjs(newDate)) {
      console.log("newdate Chenh lech", newDate.toISOString());

      setDateChenhLech(newDate);
      // setDate(updatedDate);
    }
  };

  useEffect(() => {
    dispatch(getDataNewestByNgayChenhLech(dateChenhLech.toISOString(), ngay));
  }, [dispatch, dateChenhLech,ngay]);

  useEffect(() => {
    const fetchNewestData = () => {
      // Tính toán tháng và năm từ `date`
      const dateObj = new Date(date);

      // Tính toán tháng và năm từ `dateObj`
      const ngay = dateObj.getDate();
      const thang = dateObj.getMonth() + 1; // JavaScript đếm tháng từ 0

      const nam = dateObj.getFullYear();
      setThang(thang);
      setNam(nam);
      setNgay(ngay);
      // Gọi dispatch cho getKhuyenCaoKhoaByThangNam trước
      dispatch(getKhuyenCaoKhoaByThangNam(thang, nam));
      dispatch(getDataNewestByNgay(date.toISOString()));
      console.log("render lại");
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
  const [selectedTrangThai, setSelectedTrangThai] = useState("Duyệt kế toán");
  const defaultValues = {
    TrangThai: "Duyệt kế toán",
  };
  const methods = useForm({
    defaultValues,
  });
  const {
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = methods;

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
  return (
    <Stack>
      <AppBar position="static" sx={{ mb: 1 }}>
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
        <Grid item xs={12} sm={12} md={5} spacing={2}>
          <Card
            sx={{
              fontWeight: "bold",
              color: "#FFF",
              backgroundColor: darkMode ? "#1D1D1D" : "#1939B7",
              boxShadow: 10,
              p: 1,
              mb: 1,
            }}
          >
            <Typography variant="h6">Chưa duyệt kế toán tháng trước </Typography>

            <Grid container>
              <Grid item xs={12} sm={12} md={6} spacing={1}>
                <CardTongTienChuaDuyetKT
                  title={"Đã ra viện"}
                  soluong={
                    SoLuong_TongTien_ChuaDuyetKeToan_ThangTruoc.find(
                      (e) => e.vienphistatus === 1
                    )?.soluong
                  }
                  tongtien={VND.format(
                    SoLuong_TongTien_ChuaDuyetKeToan_ThangTruoc.find(
                      (e) => e.vienphistatus === 1
                    )?.tongtien
                  )}
                  bg={"#bb1515"}
                  data={
                    DoanhThu_ChuaDuyetKeToan_ThangTruoc_TheoKhoa_RaVien_ThemTong
                  }
                  titleMore={
                    "Doanh thu đã ra viện, chưa duyệt kế toán tháng trước"
                  }
                />
              </Grid>
              <Grid item xs={12} sm={12} md={6} spacing={1}>
                <CardTongTienChuaDuyetKT
                  title={"Chưa ra viện"}
                  soluong={
                    SoLuong_TongTien_ChuaDuyetKeToan_ThangTruoc.find(
                      (e) => e.vienphistatus === 0
                    )?.soluong
                  }
                  tongtien={VND.format(
                    SoLuong_TongTien_ChuaDuyetKeToan_ThangTruoc.find(
                      (e) => e.vienphistatus === 0
                    )?.tongtien
                  )}
                  bg={"#1939B7"}
                  data={
                    DoanhThu_ChuaDuyetKeToan_ThangTruoc_TheoKhoa_ChuaRaVien_ThemTong
                  }
                  titleMore={
                    "Doanh thu chưa ra viện, chưa duyệt kế toán tháng trước"
                  }
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12} sm={12} md={5} spacing={2}>
          <Card
            sx={{
              fontWeight: "bold",
              color: "#FFF",
              backgroundColor: darkMode ? "#1D1D1D" : "#1939B7",
              boxShadow: 10,
              p: 1,
              mb: 1,
            }}
          >
            <Typography variant="h6">
              Chưa duyệt kế toán tháng hiện tại
            </Typography>

            <Grid container>
              <Grid item xs={12} sm={12} md={6} spacing={1}>
                <CardTongTienChuaDuyetKT
                  title={"Đã ra viện"}
                  soluong={
                    SoLuong_TongTien_ChuaDuyetKeToan_ThangHienTai.find(
                      (e) => e.vienphistatus === 1
                    )?.soluong
                  }
                  tongtien={VND.format(
                    SoLuong_TongTien_ChuaDuyetKeToan_ThangHienTai.find(
                      (e) => e.vienphistatus === 1
                    )?.tongtien
                  )}
                  bg={"#bb1515"}
                  data={
                    DoanhThu_ChuaDuyetKeToan_ThangHienTai_TheoKhoa_RaVien_ThemTong
                  }
                  titleMore={
                    "Doanh thu đã ra viện, chưa duyệt kế toán tháng hiện tại"
                  }
                />
              </Grid>
              <Grid item xs={12} sm={12} md={6} spacing={1}>
                <CardTongTienChuaDuyetKT
                  title={"Chưa ra viện"}
                  soluong={
                    SoLuong_TongTien_ChuaDuyetKeToan_ThangHienTai.find(
                      (e) => e.vienphistatus === 0
                    )?.soluong
                  }
                  tongtien={VND.format(
                    SoLuong_TongTien_ChuaDuyetKeToan_ThangHienTai.find(
                      (e) => e.vienphistatus === 0
                    )?.tongtien
                  )}
                  bg={"#1939B7"}
                  data={
                    DoanhThu_ChuaDuyetKeToan_ThangHienTai_TheoKhoa_ChuaRaVien_ThemTong
                  }
                  titleMore={
                    "Doanh thu chưa ra viện, chưa duyệt kế toán tháng hiện tại"
                  }
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12} sm={12} md={2} spacing={1}>
          <Card
            sx={{
              fontWeight: "bold",
              color: "#FFF",
              backgroundColor: darkMode ? "#1D1D1D" : "#1939B7",
              boxShadow: 10,
              p: 1,
              minBlockSize: 1,
            }}
          >
            <Typography variant="h6">Thu ngân</Typography>
            <Card sx={{ m: 0.5 }}>
            <Typography
        sx={{
          textAlign: "center",
          fontSize: "1rem",
          color: "#1939B7",
          fontWeight: "bold",
        }}
      >
        Tổng tiền kế toán thu
      </Typography>
              <Card
                sx={{
                  fontWeight: "bold",
                  color: "#f2f2f2",
                  backgroundColor: '#1939B7',
                  // p: 1,
                  boxShadow: 10,
                  borderRadius: 3,
                  m: 1,
                  
                }}
              >
                 <CardContent>
          <Typography sx={{ textAlign: "center", fontSize: "1rem" }}>
            {VND.format(chisosObj?.thungan)}
          </Typography>
          {ngay !==1 &&(
 <Typography sx={{ textAlign: "center",fontSize: "0.9rem" }}>
 + {VND.format((chisosObj?.thungan-chisosObj_NgayChenhLech?.thungan))}
 </Typography>
          )}
         
        </CardContent>
              </Card>
            </Card>
          </Card>
        </Grid>
      </Grid>

      <Card
        sx={{
          fontWeight: "bold",
          color: "#f2f2f2",
          backgroundColor: "#1939B7",
          p: 1,
          boxShadow: 3,
          borderRadius: 3,
        }}
      >
        <Box>
          {dashboadChiSoChatLuong.Ngay && (
            <Stack sx={{ textAlign: "center" }}>
              <Typography variant="h6">
                {` DOANH THU KHOA TỪ 00:00  1/${thang}/${nam} ĐẾN ${formatDateTime(
                  dashboadChiSoChatLuong.Ngay
                )}`}{" "}
                {selectedTrangThai === "Duyệt kế toán"
                  ? `(ĐÃ DUYỆT KẾ TOÁN)`
                  : `(THEO CHỈ ĐỊNH)`}
              </Typography>
              <Typography
                variant="h7"
                sx={{ marginX: "auto", textAlign: "center" }}
              >
                {ngay === 1
                  ? `(Tính chênh lệch từ 00:00 1/${thang}/${nam} đến ${formatDateTime(
                      dashboadChiSoChatLuong.Ngay
                    )})`
                  : `(Tính chênh lệch từ ${formatDateTime(
                      dashboad_NgayChenhLech.Ngay
                    )} đến ${formatDateTime(dashboadChiSoChatLuong.Ngay)})`}
              </Typography>
            </Stack>
          )}
          {/* <Box sx={{ flexGrow: 1 }} /> */}
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12} md={12} spacing={1}>
            <Card
              sx={{
                fontWeight: "bold",
                color: darkMode ? "#FFF" : "#1939B7",
                backgroundColor: darkMode ? "#1D1D1D" : "#1939B7",
                boxShadow: 10,
              }}
            >
              <CardHeader
                title={""}
                sx={{ textAlign: "center", color: "#1939B7" }}
              />
              <CardContent>
                <Grid container spacing={1}>
                  {/* Grid items bên trong Card */}
                  <Grid item xs={12} sm={12} md={5.2}>
                    <Card
                      sx={{
                        fontWeight: "bold",
                        color: darkMode ? "#FFF" : "#1939B7",

                        boxShadow: 10,
                      }}
                    >
                      {`Doanh thu toàn viện (${selectedTrangThai})`}
                      {selectedTrangThai === "Duyệt kế toán" ? (
                        <MyPieChartForMoney
                          data={Pie_DoanhThu_DuyetKeToan}
                          colors={colors}
                          other={{ height: 320 }}
                          dataEx={dataEx_DuyetKeToan}
                        />
                      ) : (
                        <MyPieChartForMoney
                          data={Pie_DoanhThu_TheoChiDinh}
                          colors={colors}
                          other={{ height: 320 }}
                          dataEx={dataEx_TheoChiDinh}
                        />
                      )}
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={12} md={5.2}>
                    <Card
                      sx={{
                        fontWeight: "bold",
                        color: darkMode ? "#FFF" : "#1939B7",

                        boxShadow: 10,
                      }}
                    >
                      {`Tính chênh lệch doanh thu toàn viện (${selectedTrangThai})`}
                      {selectedTrangThai === "Duyệt kế toán" ? (
                        <MyPieChartForMoney
                          data={
                            ngay === 1
                              ? Pie_DoanhThu_DuyetKeToan
                              : Pie_DoanhThu_DuyetKeToan_ChenhLech
                          }
                          colors={colors}
                          other={{ height: 320 }}
                          dataEx={
                            ngay === 1
                              ? dataEx_DuyetKeToan
                              : dataEx_ChenhLech_DuyetKeToan
                          }
                        />
                      ) : (
                        <MyPieChartForMoney
                          data={
                            ngay === 1
                              ? Pie_DoanhThu_TheoChiDinh
                              : Pie_DoanhThu_TheoChiDinh_ChenhLech
                          }
                          colors={colors}
                          other={{ height: 320 }}
                          dataEx={
                            ngay === 1
                              ? dataEx_TheoChiDinh
                              : dataEx_ChenhLech_TheoChiDinh
                          }
                        />
                      )}
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={12} md={1.6}>
                    <Card
                      sx={{
                        fontWeight: "bold",
                        color: darkMode ? "#FFF" : "#1939B7",
                        height: 340,
                        boxShadow: 10,
                        alignItems: "center",
                      }}
                    >
                      Chọn tiêu chí:
                      <Card>
                        <FormProvider methods={methods}>
                          <FRadioGroup
                            name="TrangThai"
                            value={selectedTrangThai}
                            onChange={(e) => {
                              setSelectedTrangThai(e.target.value);
                              console.log("trangthia", selectedTrangThai);
                            }}
                            options={["Duyệt kế toán", "Theo chỉ định"]}
                            // options={allOptions.slice(4)}

                            sx={{
                              "& .MuiSvgIcon-root": {
                                fontSize: 50,
                                p: 2,
                              },
                            }}
                          />
                        </FormProvider>
                      </Card>
                      <Card sx={{ marginTop: 3 }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            sx={{ m: 1 }}
                            label="Ngày tính chênh lệch"
                            value={dateChenhLech}
                            onChange={handleDateChenhLechChange}
                          />
                        </LocalizationProvider>
                      </Card>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Card>
      {selectedTrangThai === "Duyệt kế toán" ? (
        <TableDoanhThuKPI
          doanhthu={KPI_DuyetKeToan_With_ChenhLech}
          doanhthutong={Tong_DuyetKeToan}
          khuyencaotoanvien={KhuyenCao_ToanVien}
          ngayhientai={ngay}
        />
      ) : (
        <TableDoanhThuKPI
          doanhthu={KPI_TheoChiDinh_With_ChenhLech}
          doanhthutong={Tong_TheoChiDinh}
          khuyencaotoanvien={KhuyenCao_ToanVien}
          ngayhientai={ngay}
        />
      )}

      <Grid item xs={12} sm={12} md={12}>
        <TableDoanhThuCanLamSang
          canlamsangDuyetKeToan={CanLamSangDuyetKeToan}
          canlamsangChiDinh={CanLamSangTheoChiDinh}
          ngayhientai={ngay}
        />
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={12} md={12} spacing={1}>
          <Card
            sx={{
              fontWeight: "bold",
              color: darkMode ? "#FFF" : "#1939B7",

              boxShadow: 10,
            }}
          >
            <CardContent>
              <Grid container spacing={1}>
                {/* Grid items bên trong Card */}
                <Grid item xs={12} sm={12} md={12}>
                  <Card
                    sx={{
                      fontWeight: "bold",
                      color: "#f2f2f2",
                      backgroundColor: "#1939B7",
                      p: 1,
                      boxShadow: 3,
                      borderRadius: 3,
                    }}
                  >
                    <Typography
                      sx={{ fontSize: "1.3rem", textAlign: "center" }}
                    >
                      {" "}
                      Biểu đồ doanh thu cận lâm sàng trong tháng
                    </Typography>
                  </Card>
                  <BarGroupStackChart
                    series={[
                      {
                        name: "BHYT (duyệt KT)",
                        group: "DuyetKeToan",
                        data: CanLamSangDuyetKeToan.bhyt,
                      },
                      {
                        name: "Đồng chi trả (Duyệt KT)",
                        group: "DuyetKeToan",
                        data: CanLamSangDuyetKeToan.dongchitra,
                      },
                      {
                        name: "NB tự trả (Duyệt KT)",
                        group: "DuyetKeToan",
                        data: CanLamSangDuyetKeToan.thutructiep,
                      },
                      {
                        name: "BHYT (Theo chỉ định)",
                        group: "TheoChiDinh",
                        data: CanLamSangTheoChiDinh.bhyt,
                      },
                      {
                        name: "Đồng chi trả (Theo chỉ định)",
                        group: "TheoChiDinh",
                        data: CanLamSangTheoChiDinh.dongchitra,
                      },
                      {
                        name: "NB tự trả (Theo chỉ định)",
                        group: "TheoChiDinh",
                        data: CanLamSangTheoChiDinh.thutructiep,
                      },
                    ]}
                    // categories={[]}
                    categories={CanLamSangDuyetKeToan.name}
                    formatter={(val) => VND.format(val)}
                    yaxis={{
                      reversed: false,
                    }}
                    type="tien"
                  />
                </Grid>
                <Grid item xs={12} sm={12} md={12}>
                  <Card
                    sx={{
                      fontWeight: "bold",
                      color: "#f2f2f2",
                      backgroundColor: "#1939B7",
                      p: 1,
                      boxShadow: 3,
                      borderRadius: 3,
                    }}
                  >
                    <Typography
                      sx={{ fontSize: "1.3rem", textAlign: "center" }}
                    >
                      {" "}
                      Biểu đồ số lượng cận lâm sàng trong tháng
                    </Typography>
                  </Card>
                  {CanLamSangDuyetKeToan && CanLamSangTheoChiDinh && (
                    <BarGroupStackChart
                      series={[
                        {
                          name: "Số lượng (duyệt KT)",
                          group: "DuyetKeToan",
                          data: CanLamSangDuyetKeToan.soluong,
                        },

                        {
                          name: "Số lượng (chỉ định)",
                          group: "TheoChiDinh",
                          data: CanLamSangTheoChiDinh.soluong,
                        },
                      ]}
                      categories={CanLamSangDuyetKeToan.name}
                      // categories={['Online advertising', 'Sales Training', 'Print advertising', 'Catalogs', 'Meetings']}
                      formatter={(val) => val}
                      yaxis={{
                        reversed: false,
                      }}
                    />
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default TaiChinh;
