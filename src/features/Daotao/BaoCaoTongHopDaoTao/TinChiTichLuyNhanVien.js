import {
    Card,
    CardHeader,
    Container,
    Grid,
    Stack,
    Typography,
  } from "@mui/material";
  
  import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
  import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
  import dayjs from "dayjs";
  import React, { useEffect, useState } from "react";
  
  
  import { useDispatch, useSelector } from "react-redux";
  
import MainCard from "components/MainCard";
import { getTongHopTinChiTichLuy } from "features/NhanVien/nhanvienSlice";
import TongHopTinChiTable from "./TongHopTinChiTable";
  
  function TinChiTichLuyNhanVien() {
   
    // Lấy thời gian hiện tại theo múi giờ của Việt Nam
    const now = dayjs().tz("Asia/Ho_Chi_Minh");
  
    const [todate, setTodate] = useState(now);
    // const [fromdate, setFromdate] = useState(dayjs().subtract(120, 'day').startOf('day'));
    // const [fromdate, setFromdate] = useState(dayjs().subtract(6, 'month').startOf('day'));
    const [fromdate, setFromdate] = useState(dayjs('2024-01-01').startOf('day'));
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
      dispatch(getTongHopTinChiTichLuy(fromDateISO, toDateISO));
     
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
    useEffect(()=>{
     getDataForTongHop()
    },[fromdate,todate,dispatch])
  
    return (
      <MainCard title ={'Tổng hợp tín chỉ tích lũy cán bộ'}>
        <Card sx={{ p: 0.5 }}>
          
          <Stack direction={"row"} my={5} spacing={3}>
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
          </Stack>
         <TongHopTinChiTable/>
        </Card>
  
      </MainCard>
    );
  }
  
  export default TinChiTichLuyNhanVien;
  