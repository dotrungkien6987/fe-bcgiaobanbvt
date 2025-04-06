import {
    Button,
    Card,
    Stack,
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
    const [fromdate, setFromdate] = useState(now.subtract(7, 'day')); // Mặc định từ 7 ngày trước
    const dispatch = useDispatch();
  
    const handleFromDateChange = (newDate) => {
      if (dayjs.isDayjs(newDate)) {
        setFromdate(newDate);
      }
    };
  
    const handleToDateChange = (newDate) => {
      if (dayjs.isDayjs(newDate)) {
        setTodate(newDate);
      }
    };
  
    const handleViewLogs = () => {
      const fromDateISO = fromdate.toISOString();
      const toDateISO = todate.toISOString();
      console.log("Gọi API với fromdate-todate:", fromDateISO, toDateISO);
      dispatch(getLogEvents(fromDateISO, toDateISO));
    };
  
    useEffect(() => {
      // Tải dữ liệu mặc định khi component được mount
      const fromDateISO = fromdate.toISOString();
      const toDateISO = todate.toISOString();
      dispatch(getLogEvents(fromDateISO, toDateISO));
    }, [dispatch]);
  
    useEffect(() => {
        fetch("http:/192.168.5.5:7654/api/getProvince", {
            method: "GET", // Nếu API yêu cầu POST
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
    
        <Card sx={{ p: 0.5 }}>
          <Stack direction={"row"} my={1} spacing={3}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Từ ngày:"
                value={fromdate}
                onChange={handleFromDateChange}
                format="DD/MM/YYYY"
              />
            </LocalizationProvider>
  
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Đến ngày:"
                value={todate}
                onChange={handleToDateChange}
                format="DD/MM/YYYY"
              />
            </LocalizationProvider>
  
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleViewLogs}
            >
              Xem
            </Button>
          </Stack>
        </Card>
       
    );
  }
  
  export default DateRangePicker;