import {
  Button,
  Card,
  Stack,
  ButtonGroup,
  Typography,
  Divider,
  Grid,
  Box,
} from "@mui/material";

import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import SearchIcon from "@mui/icons-material/Search";
import MainCard from "components/MainCard";
import { getLogEvents } from "features/Slice/hisSlice"; // Giả định đường dẫn đến slice
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Cấu hình dayjs để sử dụng timezone
dayjs.extend(utc);
dayjs.extend(timezone);

function DateRangePicker() {
  // Lấy thời gian hiện tại theo múi giờ của Việt Nam
  const now = dayjs().tz("Asia/Ho_Chi_Minh");
  const [todate, setTodate] = useState(now);
  const [fromdate, setFromdate] = useState(now.subtract(7, 'day'));
  const [activePreset, setActivePreset] = useState('last7Days'); // Track active preset
  const dispatch = useDispatch();

  const handleFromDateChange = (newDate) => {
    if (dayjs.isDayjs(newDate)) {
      setFromdate(newDate);
      setActivePreset('custom');
    }
  };

  const handleToDateChange = (newDate) => {
    if (dayjs.isDayjs(newDate)) {
      setTodate(newDate);
      setActivePreset('custom');
    }
  };

  const handleViewLogs = () => {
    const fromDateISO = fromdate.toISOString();
    const toDateISO = todate.toISOString();
    console.log("Gọi API với fromdate-todate:", fromDateISO, toDateISO);
    dispatch(getLogEvents(fromDateISO, toDateISO));
  };

  // Date preset handlers
  const handleCurrentDay = () => {
    const today = dayjs().tz("Asia/Ho_Chi_Minh");
    const from = today.startOf('day');
    const to = today.endOf('day');
    setFromdate(from);
    setTodate(to);
    setActivePreset('today');
    dispatch(getLogEvents(from.toISOString(), to.toISOString()));
  };

  const handleLast7Days = () => {
    const today = dayjs().tz("Asia/Ho_Chi_Minh");
    const from = today.subtract(6, 'day').startOf('day');
    const to = today.endOf('day');
    setFromdate(from);
    setTodate(to);
    setActivePreset('last7Days');
    dispatch(getLogEvents(from.toISOString(), to.toISOString()));
  };

  const handleLast30Days = () => {
    const today = dayjs().tz("Asia/Ho_Chi_Minh");
    const from = today.subtract(29, 'day').startOf('day');
    const to = today.endOf('day');
    setFromdate(from);
    setTodate(to);
    setActivePreset('last30Days');
    dispatch(getLogEvents(from.toISOString(), to.toISOString()));
  };

  useEffect(() => {
    // Tải dữ liệu mặc định khi component được mount
    const fromDateISO = fromdate.toISOString();
    const toDateISO = todate.toISOString();
    dispatch(getLogEvents(fromDateISO, toDateISO));
  }, [dispatch]);

  useEffect(() => {
    fetch("http://192.168.5.5:7654/api/getProvince", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token: "6727D49BB586EE592FA91799D0FD510A" })
    })
      .then(response => response.json())
      .then(data => console.log("Data:", data))
      .catch(error => console.error("Error:", error));
  }, []);

  return (
    <Card sx={{ p: 2, boxShadow: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h6" color="primary">
          Chọn khoảng thời gian
        </Typography>
        <ButtonGroup variant="outlined" sx={{ alignSelf: "flex-start" }}>
  <Button 
    onClick={handleCurrentDay}
    variant={activePreset === 'today' ? 'contained' : 'outlined'}
    sx={{ 
      ...(activePreset === 'today' 
        ? { bgcolor: 'primary.main', color: 'white' } 
        : { color: 'text.primary', borderColor: 'rgba(0, 0, 0, 0.23)' })
    }}
  >
    Hôm nay
  </Button>
  <Button 
    onClick={handleLast7Days}
    variant={activePreset === 'last7Days' ? 'contained' : 'outlined'}
    sx={{ 
      ...(activePreset === 'last7Days' 
        ? { bgcolor: 'primary.main', color: 'white' } 
        : { color: 'text.primary', borderColor: 'rgba(0, 0, 0, 0.23)' })
    }}
  >
    7 ngày gần nhất
  </Button>
  <Button 
    onClick={handleLast30Days}
    variant={activePreset === 'last30Days' ? 'contained' : 'outlined'}
    sx={{ 
      ...(activePreset === 'last30Days' 
        ? { bgcolor: 'primary.main', color: 'white' } 
        : { color: 'text.primary', borderColor: 'rgba(0, 0, 0, 0.23)' })
    }}
  >
    30 ngày gần nhất
  </Button>
</ButtonGroup>
        <Divider>
          <Typography variant="body2" color="text.secondary">
            hoặc chọn khoảng thời gian tùy chỉnh
          </Typography>
        </Divider>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5} md={4}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Từ ngày:"
                value={fromdate}
                onChange={handleFromDateChange}
                format="DD/MM/YYYY"
                slotProps={{ textField: { fullWidth: true, size: "small" } }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={5} md={4}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Đến ngày:"
                value={todate}
                onChange={handleToDateChange}
                format="DD/MM/YYYY"
                slotProps={{ textField: { fullWidth: true, size: "small" } }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={2} md={4}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<SearchIcon />}
              onClick={handleViewLogs}
              size="medium"
            >
              Xem dữ liệu
            </Button>
          </Grid>
        </Grid>
      </Stack>
    </Card>
  );
}

export default DateRangePicker;