import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Tab, Tabs, Typography, Container } from "@mui/material";
import {
  Assessment as AssessmentIcon,
  ListAlt as ListAltIcon,
  LocalHospital as LocalHospitalIcon,
} from "@mui/icons-material";

import DatLichKhamFilters from "./DatLichKhamFilters";
import DatLichKhamStatistics from "./DatLichKhamStatistics";
import BaoCaoTongHopTable from "./Tab1_TongHop/BaoCaoTongHopTable";
import ChiTietDatLichTable from "./Tab2_ChiTiet/ChiTietDatLichTable";
import ManTinhTable from "./Tab3_ManTinh/ManTinhTable";
import {
  fetchAllData,
  selectBaoCaoTongHop,
  selectChiTietDatLich,
  selectDanhSachManTinh,
  selectLoadingTongHop,
  selectLoadingChiTiet,
} from "./datLichKhamSlice";
import dayjs from "dayjs";

function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

function DatLichKhamDashboard() {
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = useState(0);
  const [fromDate, setFromDate] = useState(dayjs().startOf("month"));
  const [toDate, setToDate] = useState(dayjs().endOf("month"));
  const [filterNGT, setFilterNGT] = useState(null); // filter Tab2 by NGT

  const baoCaoTongHop = useSelector(selectBaoCaoTongHop);
  const chiTietDatLich = useSelector(selectChiTietDatLich);
  const danhSachManTinh = useSelector(selectDanhSachManTinh);
  const loadingTongHop = useSelector(selectLoadingTongHop);
  const loadingChiTiet = useSelector(selectLoadingChiTiet);

  const handleSearch = useCallback(() => {
    if (!fromDate || !toDate) return;
    dispatch(
      fetchAllData({
        fromDate: fromDate.format("YYYY-MM-DD HH:mm:ss"),
        toDate: toDate.format("YYYY-MM-DD HH:mm:ss"),
      }),
    );
  }, [dispatch, fromDate, toDate]);

  useEffect(() => {
    handleSearch();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Tính thống kê
  const thongKe = React.useMemo(() => {
    const tongDatLich = baoCaoTongHop.reduce(
      (s, r) => s + Number(r.tong_dat_lich || 0),
      0,
    );
    const coKham = baoCaoTongHop.reduce(
      (s, r) => s + Number(r.co_kham || 0),
      0,
    );
    const khongKham = baoCaoTongHop.reduce(
      (s, r) => s + Number(r.khong_kham || 0),
      0,
    );
    const vong1 = baoCaoTongHop.reduce(
      (s, r) => s + Number(r.co_kham_co_tien || 0),
      0,
    );
    const tongTien = baoCaoTongHop.reduce(
      (s, r) => s + Number(r.tong_tien || 0),
      0,
    );
    const soManTinh = Object.keys(danhSachManTinh).length;
    const hopLe = vong1 - soManTinh;

    return {
      tongDatLich,
      coKham,
      khongKham,
      vong1,
      soManTinh,
      hopLe,
      tongTien,
    };
  }, [baoCaoTongHop, danhSachManTinh]);

  // Click NGT row in Tab1 → switch to Tab2 filtered
  const handleViewNGTDetail = useCallback((nguoigioithieuid) => {
    setFilterNGT(nguoigioithieuid);
    setTabValue(1);
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        📊 Báo cáo đặt lịch khám qua App
      </Typography>

      <DatLichKhamFilters
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onSearch={handleSearch}
      />

      <DatLichKhamStatistics thongKe={thongKe} loading={loadingTongHop} />

      <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => {
            setTabValue(v);
            if (v !== 1) setFilterNGT(null);
          }}
        >
          <Tab
            icon={<AssessmentIcon />}
            iconPosition="start"
            label="Tổng hợp"
          />
          <Tab icon={<ListAltIcon />} iconPosition="start" label="Chi tiết" />
          <Tab
            icon={<LocalHospitalIcon />}
            iconPosition="start"
            label="Đánh dấu mãn tính"
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <BaoCaoTongHopTable
          data={baoCaoTongHop}
          danhSachManTinh={danhSachManTinh}
          loading={loadingTongHop}
          onViewDetail={handleViewNGTDetail}
          fromDate={fromDate}
          toDate={toDate}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <ChiTietDatLichTable
          data={chiTietDatLich}
          loading={loadingChiTiet}
          filterNGT={filterNGT}
          onClearFilterNGT={() => setFilterNGT(null)}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <ManTinhTable
          chiTietData={chiTietDatLich}
          danhSachManTinh={danhSachManTinh}
          loading={loadingChiTiet}
          fromDate={fromDate}
          toDate={toDate}
          onRefresh={handleSearch}
        />
      </TabPanel>
    </Container>
  );
}

export default DatLichKhamDashboard;
