import {
  Button,
  Card,
  CardHeader,
  Chip,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import MainCard from "components/MainCard";
import {
  getTongHopSoLuongHinhThucCapNhatThucHien,
  getTongHopSoLuongTheoKhoa,
  getTongHopTinChiTichLuy,
} from "features/NhanVien/nhanvienSlice";

import { useRowSelect } from "react-table";
import { formatDate_getDate } from "utils/formatTime";
import CoCauNguonNhanLuc from "../TongHopSoLuong/CoCauNguonNhanLuc";
import CardSoLuongHinhThuc from "./CardSoLuongHinhThuc";
import CardDisplayTest from "./CardDisplayTest";

function DashBoardDaotao() {
  // Lấy thời gian hiện tại theo múi giờ của Việt Nam

  const now = dayjs().tz("Asia/Ho_Chi_Minh");
  const { typeTongHop, phannhomTongHopSoLuongDaoTao } = useSelector(
    (state) => state.nhanvien
  );

  const [sonamcanhbao, setSonamcanhbao] = useState(1);
  const [todate, setTodate] = useState(now);
  // const [fromdate, setFromdate] = useState(dayjs().subtract(120, 'day').startOf('day'));
  // const [fromdate, setFromdate] = useState(dayjs().subtract(6, 'month').startOf('day'));
  const [fromdate, setFromdate] = useState(dayjs("2023-01-01").startOf("day"));
  const handleTodateChange = (newDate) => {
    // Chuyển đổi về múi giờ VN, kiểm tra đầu vào

    if (newDate instanceof Date) {
      //   newDate.setHours(7, 0, 0, 0);
      setTodate(new Date(newDate));
    } else if (dayjs.isDayjs(newDate)) {
      console.log("newdate", newDate);
      //   const updatedDate = newDate.hour(7).minute(0).second(0).millisecond(0);
      //   console.log("updateDate", updatedDate);
      setTodate(newDate);
      getDataForTongHop();
    }
  };
  const dispatch = useDispatch();
  const getDataForTongHop = () => {
    const fromDateISO = fromdate.toISOString();
    const toDateISO = todate.toISOString();
    console.log("fromdate -todate", fromDateISO, toDateISO);
    dispatch(
      getTongHopSoLuongTheoKhoa(fromDateISO, toDateISO, sonamcanhbao * 24)
    );
    dispatch(getTongHopSoLuongHinhThucCapNhatThucHien(fromDateISO, toDateISO));
  };
  const handleNgayBaoCaoChange = (newDate) => {
    // Chuyển đổi về múi giờ VN, kiểm tra đầu vào
    console.log("Chay day khong");
    if (newDate instanceof Date) {
      //   newDate.setHours(7, 0, 0, 0);
      setFromdate(new Date(newDate));
    } else if (dayjs.isDayjs(newDate)) {
      console.log("newdate", newDate);
      //   const updatedDate = newDate.hour(7).minute(0).second(0).millisecond(0);
      //   console.log("updateDate", updatedDate);
      setFromdate(newDate);
      getDataForTongHop();
    }
  };
  useEffect(() => {
    getDataForTongHop();
  }, [fromdate, todate, dispatch]);

  return (
    <MainCard title={"Tổng hợp tín chỉ tích lũy cán bộ"}>
      <Card sx={{ p: 0.5 }}>
        <Stack direction={"row"} my={1} spacing={3}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Từ ngày:"
              value={fromdate}
              onChange={handleNgayBaoCaoChange}
              //   ampm={false}
              //   format="HH:mm:ss"
              format="DD/MM/YYYY"
            />
          </LocalizationProvider>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Đến ngày:"
              value={todate}
              onChange={handleTodateChange}
              //   ampm={false}
              //   format="HH:mm:ss"
              format="DD/MM/YYYY"
            />
          </LocalizationProvider>

          <TextField
            label="Chọn số năm cảnh báo"
            type="number"
            value={sonamcanhbao}
            onChange={(e) => setSonamcanhbao(e.target.value)}
          />
          <Chip
            label={`Khuyến cáo : ${
              24 * sonamcanhbao
            } tín chỉ trong ${sonamcanhbao} năm`}
            size="large"
            color="error"
          />

          <Button
            variant="contained"
            startIcon={<CalendarMonthIcon />}
            onClick={getDataForTongHop}
          >
            Tổng hợp
          </Button>
        </Stack>
      </Card>

      <CoCauNguonNhanLuc
        fromDateISO={fromdate.toISOString()}
        toDateISO={todate.toISOString()}
        sonamcanhbao={sonamcanhbao}
      />
      <MainCard title={"Tổng hợp các nội dung thuộc đào tạo"}>
        <Grid container spacing={2}>
          {phannhomTongHopSoLuongDaoTao.dtKhac?.length > 0 &&
            phannhomTongHopSoLuongDaoTao.dtKhac.map((data) => (
              <Grid item xs={12} sm={6} md={6} lg={4}>
                <CardSoLuongHinhThuc data={data} />
              </Grid>
            ))}
        </Grid>
      </MainCard>
      <MainCard title={"Tổng hợp các nội dung thuộc nghiên cứu khoa học"}>
        <Grid container spacing={2}>
          {phannhomTongHopSoLuongDaoTao.nckh?.length > 0 &&
            phannhomTongHopSoLuongDaoTao.nckh.map((data) => (
              <Grid item xs={12} sm={6} md={6} lg={4}>
                <CardSoLuongHinhThuc data={data} />
              </Grid>
            ))}
        </Grid>
      </MainCard>
      <MainCard title={"Tổng hợp đào tạo sau đại học"}>
        <Grid container spacing={2}>
          {phannhomTongHopSoLuongDaoTao.saudaihoc?.length > 0 &&
            phannhomTongHopSoLuongDaoTao.saudaihoc.map((data) => (
              <Grid item xs={12} sm={6} md={6} lg={4}>
                <CardSoLuongHinhThuc data={data} />
              </Grid>
            ))}
        </Grid>
      </MainCard>
    </MainCard>
  );
}

export default DashBoardDaotao;
