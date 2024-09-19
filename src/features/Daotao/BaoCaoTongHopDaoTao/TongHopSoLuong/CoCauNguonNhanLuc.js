import {
  Button,
  Card,
  CardHeader,
  Chip,
  Grid,
  Stack,
  TextField,
} from "@mui/material";

import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import MainCard from "components/MainCard";
import {
  getCoCauNguonNhanLucToanVien,
  getTongHopSoLuongHinhThucCapNhatThucHien,
  getTongHopTinChiTichLuy,
} from "features/NhanVien/nhanvienSlice";

import { formatDate_getDate } from "utils/formatTime";
import TongHopSoLuongThucHienTable from "./TongHopSoLuongThucHienTable";
import MyPieChart from "components/form/MyPieChart";
import LoadingScreen from "components/LoadingScreen";

function CoCauNguonNhanLuc() {
  const { isLoading, CoCauNguonNhanLuc } = useSelector((state) => state.nhanvien);
  const dispatch = useDispatch();
  const colors = [
    { color: "#1939B7" },
    { color: "#bb1515" },
    { color: "#00C49F" },
    { color: "##eb99ff" },
    { color: "#660000" },
    { color: "#00661a" },
    { color: "#0033cc" },
    { color: "#00cc00" },
    { color: "#0088FE" },
    { color: "#FFBB28" },
    // { color: "#2ABC28" },
    // { color: "#0088FE" },
    // { color: "#FFBB27" },
    // { color: "#2ABC26" },
    // { color: "#2ABC28" },
    // { color: "#0088FE" },
  ];
  const size1 = {
    height: 250,
  };
  useEffect(() => {
    dispatch(getCoCauNguonNhanLucToanVien());
  }, []);

  return (
    isLoading ? (<LoadingScreen/>) : (
      <Card sx={{ backgroundColor:"#1939B7", p:2 }}>
      <Grid container spacing={3} my={1}>
        <Grid item xs={12} md={4.5}>
          <Card>
            <CardHeader title={"1.Cơ cấu nguồn nhân lực chung"} />
            {CoCauNguonNhanLuc.resultQuyDoi1 && (
              <MyPieChart
                data={CoCauNguonNhanLuc.resultQuyDoi1}
                colors={colors}
                other={{ ...size1 }}
              />
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={7.5}>
          <Card>
            <CardHeader title={"1.Cơ cấu nguồn nhân lực theo trình độ chuyên môn"} />
            {CoCauNguonNhanLuc.resultQuyDoi1 && (
              <MyPieChart
                data={CoCauNguonNhanLuc.resultQuyDoi2}
                colors={colors}
                other={{ ...size1 }}
              />
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title={"2. Cơ cấu nguồn nhân lực theo chứng chỉ hành nghề"} />
            {CoCauNguonNhanLuc.resultQuyDoi1 && (
              <MyPieChart
                data={CoCauNguonNhanLuc.resultChungChiHanhNghe}
                colors={colors}
                other={{ ...size1 }}
              />
            )}
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title={"1.Tỷ lệ đạt tín chỉ khuyến cáo"} />
            {CoCauNguonNhanLuc.resultQuyDoi1 && (
              <MyPieChart
                data={CoCauNguonNhanLuc.resultChungChiHanhNghe}
                colors={colors}
                other={{ ...size1 }}
              />
            )}
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title={"1.Cơ cấu nguồn nhân lực chi tiết"} />
            {CoCauNguonNhanLuc.resultQuyDoi1 && (
              <MyPieChart
                data={CoCauNguonNhanLuc.resultChungChiHanhNghe}
                colors={colors}
                other={{ ...size1 }}
              />
            )}
          </Card>
        </Grid>
      </Grid>
    </Card>
    )
    
  );
}

export default CoCauNguonNhanLuc;
