import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';

import {
  Stack,
  Typography,
  Card,
  Box,
  TablePagination,
  Container,
  Button,
  RadioGroup,
} from "@mui/material";
// import SearchInput from '../../components/SearchInput';
import UserTable from '../features/User/UserTable';
import SearchInput from '../components/SearchInput';
import { getUsers } from '../features/User/userSlice';

import UserInsertForm from '../features/User/UserInsertForm';
import DSSuCoTable from '../features/BaoCaoSuCo/DSSuCoTable';
import { getBaoCaoSuCoForDataGrid, getBaoCaoSuCos } from '../features/BaoCaoSuCo/baocaosucoSlice';
import { useParams } from 'react-router-dom';
import DSSuCoDataGrid from '../features/BaoCaoSuCo/DSSuCoDataGrid';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { FRadioGroup, FormProvider } from '../components/form';
import { useForm } from 'react-hook-form';



// import UserTable from './UserTable';

function DanhSachSuCoDataGridPage() {
  const params = useParams();
  const sucoId = params.sucoId;
  const [fromdate, setFromdate] = useState(dayjs('2023-10-01').startOf('day'));
  const now = dayjs().tz("Asia/Ho_Chi_Minh");
  const [todate, setTodate] = useState(now);
  const {users} =useSelector((state)=>state.user)
  const [selectedTrangThai, setSelectedTrangThai] = useState("");

  const handleTodateChange = (newDate) => {
    // Chuyển đổi về múi giờ VN, kiểm tra đầu vào
    console.log("Chay day khong");
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

  useEffect(()=>{
if(sucoId) {
  
}
 })
const dispatch = useDispatch();
  useEffect(() => {
    console.log('dispatch getBaoCaoSuCoForDataGrid',fromdate.toISOString(),todate.toISOString(),selectedTrangThai)
    dispatch(getBaoCaoSuCoForDataGrid(fromdate.toISOString(),todate.toISOString(),selectedTrangThai));
  }, [fromdate,todate,selectedTrangThai,dispatch]);
const {totalSuCo} =useSelector((state)=>state.baocaosuco)
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

const defaultValues = {
  TrangThai:"Tất cả"
}
const methods = useForm({
  defaultValues,
});
const {
  handleSubmit,
  reset,
  setValue,
  formState: { isSubmitting },
} = methods;

useEffect(()=>{
  setSelectedTrangThai("Tất cả")
},[])
  return (
    <Stack>
      <Typography variant="h4" sx={{ mb: 3 }}  textAlign="center">
       Danh sách báo cáo sự cố y khoa
      </Typography>
      <Card sx={{ p: 3 }}>
        <Stack spacing={2} direction={'row'} mb={2} >
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

          <FormProvider methods={methods}>

          <FRadioGroup
                  name="TrangThai"
                  value={selectedTrangThai}
                  onChange={(e) =>
                    {

                      setSelectedTrangThai(e.target.value)
                      console.log('trangthia', selectedTrangThai)}
                    }
                  options={[
                    "Tất cả",
                    "Chưa tiếp nhận",
                    "Đã tiếp nhận",
                  ]}
                  // options={allOptions.slice(4)}

                  sx={{
                    "& .MuiSvgIcon-root": {
                      fontSize: 15,
                    },
                  }}
                />
          </FormProvider>

        </Stack>
        <Stack spacing={2}>
         
      <DSSuCoDataGrid />
        </Stack>
      </Card>
    </Stack>
  )
}

export default DanhSachSuCoDataGridPage