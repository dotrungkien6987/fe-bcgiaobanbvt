import React from "react";
import { Box, Paper, Typography, Grid } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { vi } from "date-fns/locale";
import {
  HoatDongBenhVienProvider,
  useHoatDongBenhVien,
} from "./HoatDongBenhVienProvider";
import FilterControls from "./components/FilterControls";
import DepartmentSchedules from "./components/DepartmentSchedules";
import ViewControls from "./components/ViewControls";
import SpecialDutyInfo from "./components/SpecialDutyInfo";
import { useSelector, useDispatch } from "react-redux";
import { getDataBCGiaoBanCurent } from "../BCGiaoBan/bcgiaobanSlice";

const HoatDongDashBoard1 = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
      <HoatDongBenhVienProvider>
        <DashboardContent />
      </HoatDongBenhVienProvider>
    </LocalizationProvider>
  );
};

const DashboardContent = () => {
  const { selectedDate } = useHoatDongBenhVien();
  const dispatch = useDispatch();
  const bcGiaoBanCurent = useSelector(
    (state) => state.bcgiaoban.bcGiaoBanCurent
  );

  React.useEffect(() => {
    if (selectedDate) {
      const dateStr =
        selectedDate instanceof Date
          ? selectedDate.toISOString().slice(0, 10)
          : selectedDate;
      dispatch(getDataBCGiaoBanCurent(dateStr));
    }
  }, [selectedDate, dispatch]);

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Hoạt Động Bệnh Viện
        </Typography>
        {/* Phần điều khiển lọc */}
        <Grid
          container
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
        >
          <Grid item xs={12} md={8}>
            <FilterControls />
          </Grid>
          <Grid item xs={12} md={4}>
            <ViewControls />
          </Grid>
        </Grid>
        {/* Hiển thị thông tin trực đặc biệt sau khi chọn ngày và có dữ liệu */}
        {selectedDate && bcGiaoBanCurent && bcGiaoBanCurent.Ngay && (
          <SpecialDutyInfo data={bcGiaoBanCurent} />
        )}
      </Paper>
      {/* Hiển thị lịch trực */}
      <DepartmentSchedules />
    </Box>
  );
};

export default HoatDongDashBoard1;
