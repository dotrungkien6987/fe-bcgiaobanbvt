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
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { getDataNewestByNgay } from "./dashboardSlice";
import DisplayChiSoDashBoard from "../../components/DisplayChiSoDashBoard";
import CardThoiGian from "./CardThoiGian";
import TableCanLamSang from "./TableCanLamSang";
import StackBarTyLeTraDungCLS from "./StackBarTyLeTraDungCLS";
import { fDateTime, fDateTimeSuffix, formatDateTime } from "../../utils/formatTime";
import CustomTableComponent from "./CustomTableComponent/CustomTableComponent";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

// Hàm làm tròn số đến 2 chữ số thập phân
const roundToTwoDecimals = (value) => {
  if (typeof value !== 'number') return value;
  return Math.round(value * 10) / 10;
};


// Hàm định dạng để thay đổi màu chữ dựa trên điều kiện
const formatCell = (columnName, value, rowData) => {
  // Kiểm tra điều kiện và trả về style tương ứng
  if (columnName === 'thoi_gian_chotraketqua_lau_nhat' && value > 180) {
    return { color: "#bb1515" }; // Màu đỏ
  }
  
  if (columnName === 'thoi_gian_chotraketqua_trung_binh' && value > 180) {
    return { color: "#bb1515" }; // Màu đỏ
  }
  
  // Trường hợp khác giữ nguyên style mặc định
  return null;
};

const ChiSoChatLuong = () => {
  const now = dayjs().tz("Asia/Ho_Chi_Minh");
  const [date, setDate] = useState(now);
  const [isToday, setIsToday] = useState(true);
  
  const {
    dashboadChiSoChatLuong,
    thoigianchokhambenh,
    thoigiankhambenh,
    tongthoigian,
    canlamsangs,
    ThoiGian_NhomXetNghiem
  } = useSelector((state) => state.dashboard);
  const dispatch = useDispatch();

  const handleDateChange = (newDate) => {
    if (newDate instanceof Date) {
      setDate(new Date(newDate));
    } else if (dayjs.isDayjs(newDate)) {
      setDate(newDate);
    }
    setIsToday(dayjs(newDate).isSame(now, "day"));
  };

  useEffect(() => {
    const fetchNewestData = () => {
      dispatch(getDataNewestByNgay(date.toISOString()));
      console.log("Đang tải dữ liệu cho ngày:", date.format ? date.format("DD/MM/YYYY") : new Date(date).toLocaleDateString());
    };
    
    fetchNewestData();
    
    // Chỉ thiết lập interval nếu đang xem dữ liệu của ngày hôm nay
    if (isToday) {
      const intervalId = setInterval(fetchNewestData, 900000); // Làm mới sau mỗi 15 phút
      
      return () => {
        clearInterval(intervalId); // Dọn dẹp khi component unmount
      };
    }
    
    return undefined; // Không cần interval nếu xem dữ liệu lịch sử
  }, [dispatch, date, isToday]); // Chạy lại khi dispatch, date hoặc isToday thay đổi

  return (
    <Stack>
      <AppBar position="static" sx={{ mb: 3 }}>
        <Toolbar>
            {dashboadChiSoChatLuong.Ngay &&
          <Typography variant="h6" sx={{marginX:'auto',textAlign:'center'}}>CHỈ SỐ CHẤT LƯỢNG KHÁM BỆNH (Số liệu {formatDateTime(dashboadChiSoChatLuong.Ngay)})</Typography>
            }
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
        <Grid item xs={12} sm={12} md={6}>
          <CardThoiGian data={thoigianchokhambenh} typeCard ='thoigianchokham' />
          <CardThoiGian data={thoigiankhambenh} typeCard ='thoigiankhambenh'/>
          <CardThoiGian data={tongthoigian} typeCard ='tongthoigian'/>
       <StackBarTyLeTraDungCLS/>
        </Grid>
        <Grid item xs={12} sm={12} md={6}>
          <TableCanLamSang canlamsangs={canlamsangs} type={0} />
          <TableCanLamSang canlamsangs={canlamsangs} type={1} />
        </Grid>
        <Grid item xs={12} sm={12} md={12}>
          <CustomTableComponent
          data={ThoiGian_NhomXetNghiem}
          columns={[
            { header: "Tên Xét Nghiệm", name: "xetnghiemtype", rowSpan: 2 },
            { header: "Thời gian chờ lấy mẫu", colSpan: 4 },
            { header: "Thời gian chờ kết quả", colSpan: 4 },
            { header: "Đã lấy mẫu", name: "so_da_lay_mau" },
            { header: "Nhanh nhất (phút)", name: "thoi_gian_cholaymau_nhanh_nhat" },
            { header: "Trung bình (phút)", name: "thoi_gian_cholaymau_trung_binh" },
            { header: "Lâu nhất (phút)", name: "thoi_gian_cholaymau_lau_nhat" },
            { header: "Đã trả KQ", name: "so_da_traketqua" },
            { header: "Nhanh nhất (phút)", name: "thoi_gian_chotraketqua_nhanh_nhat" },
            { header: "Trung bình (phút)", name: "thoi_gian_chotraketqua_trung_binh" },
            { header: "Lâu nhất (phút)", name: "thoi_gian_chotraketqua_lau_nhat" },
          ]}
          titles={["Thời gian chờ theo nhóm xét nghiệm",]}
          roundingFunction={roundToTwoDecimals}
        formatFunction={formatCell}
          />
        </Grid>
      </Grid>
    </Stack>
  );
};

export default ChiSoChatLuong;
