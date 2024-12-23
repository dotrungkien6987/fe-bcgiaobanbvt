import React, { useState, useEffect } from "react";
import {
  
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  
  Stack,
  Link,
  Card,
} from "@mui/material";

import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {  Link as RouterLink } from "react-router-dom";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { getDataBCNgay, getKhoas } from "./baocaongaySlice";

import BCKhoaKhamBenh from "./BCKhoaKhamBenh";
import useAuth from "../../hooks/useAuth";

import BCGayMeHS from "./BCGayMeHS";
import BCXetNghiemHH from "./BCXetNghiemHH";
import BCXetNghiemHS from "./BCXetNghiemHS";
import BCXetNghiemVS from "./BCXetNghiemVS";
import BCChanDoanHA from "./BCChanDoanHA";
import BCThamDoCN from "./BCThamDoCN";
import BCHuyetHocTM from "./BCHuyetHocTM";
import BCTrungTamCLC from "./BCTrungTamCLC";
import BCNgayLamSangNoi from "./BCNgayLamSangNoi";
import BCNgayLamSangNgoai from "./BCNgayLamSangNgoai";
import BCKhoaCapCuu from "./BCKhoaCapCuu";
import BCPhongKhamYeuCau from "./BCPhongKhamYeuCau";

function ControllerDisplay() {
  const { user } = useAuth();
  const { khoas } = useSelector((state) => state.baocaongay);
  // const [date, setDate] = useState(new Date());
  //   const [date, setDate] = useState((new Date()));

  // Lấy thời gian hiện tại theo múi giờ của Việt Nam
const now = dayjs().tz("Asia/Ho_Chi_Minh");

// Kiểm tra xem giờ hiện tại có >= 18 hay không
const isAfter18 = now.hour() >= 18;

// Thiết lập giá trị mặc định cho date dựa trên giờ hiện tại
const defaultDate = isAfter18
  ? now.hour(7).minute(0).second(0).millisecond(0)
  : now.subtract(1, "day").hour(7).minute(0).second(0).millisecond(0);

const [date, setDate] = useState(defaultDate);

  
  const [selectedDepartment, setSelectedDepartment] = useState(user.KhoaID._id);
  const [loaikhoa, setLoaikhoa] = useState("noi");
  const [makhoa, setMakhoa] = useState("");

  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(getKhoas());
  }, [dispatch]);

  useEffect(() => {
    //SetBaoCaoNgayInStore
    const dateISO = date.toISOString();
    if (selectedDepartment !== "")
      dispatch(getDataBCNgay(dateISO, selectedDepartment));
  }, [date, selectedDepartment, dispatch]);

  useEffect(() => {
    // Update selectedDepartment when khoas changes
    if (khoas && khoas.length > 0) {
      // setSelectedDepartment(khoas[0]._id);
      setSelectedDepartment(user.KhoaID._id);
      const loai_khoa = khoas.find(
        (khoa) => khoa._id === selectedDepartment
      )?.LoaiKhoa;
      const ma_khoa = khoas.find(
        (khoa) => khoa._id === selectedDepartment
      )?.MaKhoa;
  
      console.log("loaikhoa", loai_khoa);
      setLoaikhoa(loai_khoa);
      setMakhoa(ma_khoa)
    }

  }, [khoas,user.KhoaID._id]);

  const handleDateChange = (newDate) => {
    // Chuyển đổi về múi giờ VN, kiểm tra đầu vào
    console.log("Chay day khong");
    if (newDate instanceof Date) {
      newDate.setHours(7, 0, 0, 0);
      setDate(new Date(newDate));
    } else if (dayjs.isDayjs(newDate)) {
      console.log("newdate", newDate);
      const updatedDate = newDate.hour(7).minute(0).second(0).millisecond(0);
      console.log("updateDate", updatedDate);
      setDate(updatedDate);
    }
    
  };

  const handleSelectChange = (e) => {
    setSelectedDepartment(e.target.value);
    //setLoaikhoa de hien thi giao dien tuong ung
    const loai_khoa = khoas.find(
      (khoa) => khoa._id === e.target.value
    )?.LoaiKhoa;
    const ma_khoa = khoas.find(
      (khoa) => khoa._id === e.target.value
    )?.MaKhoa;

    console.log("loaikhoa", loai_khoa);
    setLoaikhoa(loai_khoa);
    setMakhoa(ma_khoa)
    
  };

  return (
    <Stack>
      <Card sx={{ p: 2 }}>
        <Stack direction="row" spacing={2}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker label="Ngày" value={date} onChange={handleDateChange} />
          </LocalizationProvider>
          <FormControl fullWidth>
            <InputLabel>Khoa</InputLabel>
            <Select value={selectedDepartment} onChange={handleSelectChange}>
              {khoas &&
                khoas.length > 0 &&
                khoas.map((department) => (
                  <MenuItem key={department._id} value={department._id}>
                    {department.TenKhoa}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <Link variant="subtitle2" component={RouterLink} to="/">
            Báo cáo toàn viện
          </Link>
        </Stack>{" "}
      </Card>
      <Card sx={{ my: 3, py: 3 }}>
        {(loaikhoa === "kkb") && <BCKhoaKhamBenh />}
        {(loaikhoa === "pkyc") && <BCPhongKhamYeuCau />}
        {(loaikhoa === "noi"&& makhoa !=="KCC" && makhoa !=="CDHA") && <BCNgayLamSangNoi/>}
        {(loaikhoa === "noi"&& makhoa ==="KCC") && <BCKhoaCapCuu/>}
        {(loaikhoa === "ngoai" && makhoa !=="GMHS") && <BCNgayLamSangNgoai/>}
        {(loaikhoa === "ngoai" && makhoa ==="GMHS") && <BCGayMeHS />}
        {loaikhoa === "xnhh" && <BCXetNghiemHH />}
        {loaikhoa === "xnhs" && <BCXetNghiemHS />}
        {loaikhoa === "xnvs" && <BCXetNghiemVS />}
        {(loaikhoa === "noi" && makhoa ==="CDHA") && <BCChanDoanHA />}
        {loaikhoa === "tdcn" && <BCThamDoCN />}
        {loaikhoa === "hhtm" && <BCHuyetHocTM />}
        {loaikhoa === "clc" && <BCTrungTamCLC />}
      </Card>
    </Stack>
  );
}

export default ControllerDisplay;
