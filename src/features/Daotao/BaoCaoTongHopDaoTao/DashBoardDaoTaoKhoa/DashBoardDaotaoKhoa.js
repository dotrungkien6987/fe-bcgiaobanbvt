import {
  Autocomplete,
  Button,
  Card,
  Chip,
  Stack,
  TextField,
} from "@mui/material";

import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import React, { useEffect, useState, useCallback } from "react";

import { useDispatch, useSelector } from "react-redux";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import MainCard from "components/MainCard";
import { getTongHopTinChiTichLuyByKhoa } from "features/NhanVien/nhanvienSlice";
import CoCauNguonNhanLuc from "../TongHopSoLuong/CoCauNguonNhanLuc";

import { getKhoas } from "features/BaoCaoNgay/baocaongaySlice";
import useAuth from "hooks/useAuth";
import TongHopTinChiTableTheoKhoa from "./TongHopTinChiTableTheoKhoa";
import { formatDate_getDate } from "utils/formatTime";

function DashBoardDaotaoKhoa() {
  const { user } = useAuth();
  const { khoas } = useSelector((state) => state.baocaongay);
  const [selectedKhoaID, setSelectedKhoaID] = useState(null);
  useEffect(() => {
    if (khoas && khoas.length > 0) return;
    dispatch(getKhoas());
  }, []);

  useEffect(() => {
    const khoa = khoas.find((khoa) => khoa._id === user.KhoaID._id);
    console.log("khoa", khoa);
    console.log("user", user);
    setSelectedKhoaID(khoa?._id);
  }, [khoas]);

  useEffect(() => {
    if (!selectedKhoaID) return;
    getDataForTongHop();
  }, [selectedKhoaID]);

  // Lấy thời gian hiện tại theo múi giờ của Việt Nam
  const now = dayjs().tz("Asia/Ho_Chi_Minh");

  const [sonamcanhbao, setSonamcanhbao] = useState(1);
  const [todate, setTodate] = useState(now);
  // const [fromdate, setFromdate] = useState(dayjs().subtract(120, 'day').startOf('day'));
  // const [fromdate, setFromdate] = useState(dayjs().subtract(6, 'month').startOf('day'));
  const [fromdate, setFromdate] = useState(dayjs("2024-01-01").startOf("day"));
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
    }
  };
  const dispatch = useDispatch();
  const getDataForTongHop = useCallback(() => {
    const fromDateISO = fromdate.toISOString();
    const toDateISO = todate.toISOString();
    console.log("user", user);
    console.log("selectedKhoaID", selectedKhoaID);
    if (!selectedKhoaID) return;
    dispatch(
      getTongHopTinChiTichLuyByKhoa(
        fromDateISO,
        toDateISO,
        sonamcanhbao * 24,
        selectedKhoaID
      )
    );
  }, [fromdate, todate, sonamcanhbao, selectedKhoaID, dispatch]);
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
    }
  };
  useEffect(() => {
    getDataForTongHop();
  }, [getDataForTongHop]);

  // Tự động tính "số năm cảnh báo" theo số năm trải qua (inclusive years)
  // Ví dụ: từ 01/01/2023 -> 01/01/2025 => trải qua các năm 2023,2024,2025 => 3 năm
  useEffect(() => {
    try {
      const start = dayjs.isDayjs(fromdate) ? fromdate : dayjs(fromdate);
      const end = dayjs.isDayjs(todate) ? todate : dayjs(todate);
      if (!start || !end) return;
      let yearsSpanned = end.year() - start.year() + 1;
      if (yearsSpanned < 1) yearsSpanned = 1;
      setSonamcanhbao((prev) => (prev === yearsSpanned ? prev : yearsSpanned));
    } catch (err) {
      // ignore
    }
  }, [fromdate, todate]);

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
              format="DD/MM/YYYY"
            />
          </LocalizationProvider>

          <TextField
            label="Chọn số năm cảnh báo"
            type="number"
            value={sonamcanhbao}
            onChange={(e) => setSonamcanhbao(Number(e.target.value) || 1)}
          />
          <Chip
            label={`Khuyến cáo : ${
              24 * sonamcanhbao
            } tín chỉ trong ${sonamcanhbao} năm`}
            size="large"
            color="error"
          />
          <Autocomplete
            options={khoas}
            getOptionLabel={(option) => option?.TenKhoa || ""} // Hiển thị TenKhoa
            value={khoas.find((khoa) => khoa._id === selectedKhoaID) || null} // So khớp value theo _id
            onChange={(event, newValue) => {
              setSelectedKhoaID(newValue ? newValue._id : null); // Lưu _id vào selectedKhoaID
            }}
            renderInput={(params) => (
              <TextField {...params} label="Chọn khoa" />
            )}
            sx={{ width: "25%" }}
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
      {selectedKhoaID && (
        <CoCauNguonNhanLuc
          fromDateISO={fromdate.toISOString()}
          toDateISO={todate.toISOString()}
          sonamcanhbao={sonamcanhbao}
          khoaID={selectedKhoaID}
        />
      )}

      <MainCard title="Chi tiết theo cán bộ">
        <TongHopTinChiTableTheoKhoa
          giatricanhbao={24 * sonamcanhbao}
          titleExcell={`Tổng hợp tín chỉ tích luỹ cho cán bộ từ ${formatDate_getDate(
            fromdate
          )} đến ${formatDate_getDate(todate)}`}
          titleKhuyenCao={`Khuyến cáo : ${
            24 * sonamcanhbao
          } tín chỉ trong ${sonamcanhbao} năm`}
        />
      </MainCard>
    </MainCard>
  );
}

export default DashBoardDaotaoKhoa;
