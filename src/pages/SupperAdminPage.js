import { Button, Container } from '@mui/material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { deleteDashboardIsNotNewestByNgay } from '../features/DashBoard/DashBoardKhoa/dashboardkhoaSlice'
import TestHookForm from 'components/TestHookForm'

function SupperAdminPage() {
const now = dayjs().tz('Asia/Ho_Chi_Minh')
const [date,setDate] = useState(now)
const handleDateChange = (newDate)=>{
  setDate(newDate)
  console.log("date",date.toISOString())
  console.log("newdate",newDate.toISOString())
}
const dispatch = useDispatch()
const handleClearClick =()=>{
  dispatch(deleteDashboardIsNotNewestByNgay(date.toISOString()))
  console.log("clear")
}
  return (
    <Container >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
<DatePicker
label="Ngày"
value={date}
onChange={handleDateChange}
format="DD/MM/YYYY"
/>

      </LocalizationProvider>

      <Button onClick={handleClearClick}>Clear</Button>

      <TestHookForm/>
      </Container>
  )
}

export default SupperAdminPage