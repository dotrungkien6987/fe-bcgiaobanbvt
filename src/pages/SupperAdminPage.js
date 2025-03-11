import { Button, Card, Container } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteDashboardIsNotNewestByNgay,
  getLogEvents,
  insertLogEvent,
  updateLogEvent,
} from "../features/DashBoard/DashBoardKhoa/dashboardkhoaSlice";
import TestHookForm from "components/TestHookForm";
import AssetDetail from "features/QRCode/AssetDetail";
import FileUploadView from "components/FileUploadView";

function SupperAdminPage() {
  const { logevents } = useSelector((state) => state.dashboardkhoa);
  const now = dayjs().tz("Asia/Ho_Chi_Minh");
  const [date, setDate] = useState(now);
  const handleDateChange = (newDate) => {
    setDate(newDate);
    console.log("date", date.toISOString());
    console.log("newdate", newDate.toISOString());
  };
  const dispatch = useDispatch();
  const handleClearClick = () => {
    dispatch(deleteDashboardIsNotNewestByNgay(date.toISOString()));
    console.log("clear");
  };
  const handleClickTestGet = () => {
    dispatch(getLogEvents());
    console.log("logevents", logevents);
  };
  const handleClickTestInsert = () => {
    dispatch(insertLogEvent(logeventInsert));
    console.log("logevents", logevents);
  };
  const handleClickTestUpdate = () => {
    dispatch(updateLogEvent({logeventid :34782583,logEventData:logeventUpdate}));
    console.log("logevents", logevents);
  };
  
  const logeventInsert = {
    logapp: 'Web app', // Tên ứng dụng
  loguser: 'NguyenVanA', // Tên người dùng
  logform: 'LoginForm', // Tên form
  softversion: '1.2.3', // Phiên bản phần mềm
  logtime: new Date(),
  ipaddress: '192.168.1.100', // Địa chỉ IP
  computername: 'DESKTOP-123', // Tên máy tính
  patientid: 123, // ID bệnh nhân (nếu có)
  departmentgroupid: 456, // ID nhóm khoa (nếu có)
  departmentid : 234,
  logeventtype : 4,
  logeventcontent : 'logeventcontent',
  
  hosobenhanid: 6585,
  vienphiid: 1235,
  medicalrecordid: 65456 ,
  sothutuphongkhamid: 54646,
  maubenhphamid: null ,
  servicepriceid: null,
  
  version: null, 
  sync_flag: null, // Cờ đồng bộ
  update_flag: null, // Cờ cập nhật
  }

  const logeventUpdate = {
    logapp: 'Web app', // Tên ứng dụng
  loguser: 'NguyenVanUpdate', // Tên người dùng
  logform: 'LoginForm', // Tên form
  softversion: '1.2.3', // Phiên bản phần mềm
  logtime: new Date(),
  ipaddress: '192.168.1.100', // Địa chỉ IP
  computername: 'DESKTOP-123', // Tên máy tính
  patientid: 123, // ID bệnh nhân (nếu có)
  departmentgroupid: 456, // ID nhóm khoa (nếu có)
  departmentid : 234,
  logeventtype : 4,
  logeventcontent : 'logeventcontentUpdate',
  
  hosobenhanid: 6585,
  vienphiid: 1235,
  medicalrecordid: 65456 ,
  sothutuphongkhamid: 54646,
  maubenhphamid: null ,
  servicepriceid: null,
  
  version: null, 
  sync_flag: null, // Cờ đồng bộ
  update_flag: null, // Cờ cập nhật
  }

  return (
    <Container>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="Ngày"
          value={date}
          onChange={handleDateChange}
          format="DD/MM/YYYY"
        />
      </LocalizationProvider>

      <Button onClick={handleClearClick}>Clear</Button>

      <TestHookForm />
      <Button onClick={handleClickTestGet} variant="contained">
        Test Get
      </Button>
      <Button onClick={handleClickTestInsert} variant="contained">
        Test Insert
      </Button>
      <Button onClick={handleClickTestUpdate} variant="contained">
        Test Update
      </Button>
      <Button onClick={handleClickTestUpdate} variant="contained">
        Test Update123
      </Button>
      <AssetDetail />

      <Card>
        <h1>Upload file</h1>
        <FileUploadView />
      </Card>
    </Container>
  );
}

export default SupperAdminPage;
