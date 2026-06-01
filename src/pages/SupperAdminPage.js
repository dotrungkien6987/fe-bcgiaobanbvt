import { Button, Card, Container } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteDashboardIsNotNewestByNgay,
  getLogEvents,
} from "../features/DashBoard/DashBoardKhoa/dashboardkhoaSlice";
import AssetDetail from "features/QRCode/AssetDetail";
import FileUploadView from "components/FileUploadView";
import DateRangePicker from "features/His/DateRangePicker";

function SupperAdminPage() {
  const { logevents } = useSelector((state) => state.dashboardkhoa);
  const now = dayjs().tz("Asia/Ho_Chi_Minh");
  const [date, setDate] = useState(now);
  const handleDateChange = (newDate) => {
    setDate(newDate);
  };
  const dispatch = useDispatch();
  const handleClearClick = () => {
    dispatch(deleteDashboardIsNotNewestByNgay(date.toISOString()));
  };
  const handleClickTestGet = () => {
    dispatch(getLogEvents());
  };

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

      <Button onClick={handleClickTestGet} variant="contained">
        Test Get
      </Button>
      <AssetDetail />

      <Card>
        <h1>Upload file</h1>
        <FileUploadView />
      </Card>

      <DateRangePicker />
    </Container>
  );
}

export default SupperAdminPage;

