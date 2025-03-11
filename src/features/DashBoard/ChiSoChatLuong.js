import React, { useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  AppBar,
  Toolbar,
  Stack,
  Box,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { getDataNewestByNgay } from "./dashboardSlice";
import DisplayChiSoDashBoard from "../../components/DisplayChiSoDashBoard";
import CardThoiGian from "./CardThoiGian";
import TableCanLamSang from "./TableCanLamSang";
import StackBarTyLeTraDungCLS from "./StackBarTyLeTraDungCLS";
import { fDateTime, fDateTimeSuffix, formatDateTime } from "../../utils/formatTime";
import CustomTableComponent from "./CustomTableComponent/CustomTableComponent";

// Hàm làm tròn số đến 2 chữ số thập phân
const roundToTwoDecimals = (value) => {
  if (typeof value !== 'number') return value;
  return Math.round(value * 10) / 10;
};


// Hàm định dạng để thay đổi màu chữ dựa trên điều kiện
const formatCell = (columnName, value, rowData) => {
  // Kiểm tra điều kiện và trả về style tương ứng
  if (columnName === 'thoi_gian_chotraketqua_lau_nhat' && value > 180) {
    return { color: "#bb1515" }; // Màu đỏ
  }
  
  if (columnName === 'thoi_gian_chotraketqua_trung_binh' && value > 180) {
    return { color: "#bb1515" }; // Màu đỏ
  }
  
  // Trường hợp khác giữ nguyên style mặc định
  return null;
};

const ChiSoChatLuong = () => {
  const {
    dashboadChiSoChatLuong,
    thoigianchokhambenh,
    thoigiankhambenh,
    tongthoigian,
    canlamsangs,
    ThoiGian_NhomXetNghiem
  } = useSelector((state) => state.dashboard);
  const dispatch = useDispatch();
  //   useEffect(() => {
  //     const dateCurent = new Date().toISOString();

  //     dispatch(getDataNewestByNgay(dateCurent));
  //   }, []);

  useEffect(() => {
    const fetchNewestData = () => {
      const dateCurent = new Date().toISOString();
      dispatch(getDataNewestByNgay(dateCurent));
      console.log("render lại");
    };

    fetchNewestData(); // Gọi khi component mount

    const intervalId = setInterval(fetchNewestData, 900000); // Gọi lại sau mỗi 1 phút

    return () => {
      clearInterval(intervalId); // Dọn dẹp khi component unmount
    };
  }, [dispatch]); // Chỉ rerun khi dispatch thay đổi

  return (
    <Stack>
      <AppBar position="static" sx={{ mb: 3 }}>
        <Toolbar>
            {dashboadChiSoChatLuong.Ngay &&
          <Typography variant="h6" sx={{marginX:'auto',textAlign:'center'}}>CHỈ SỐ CHẤT LƯỢNG KHÁM BỆNH (Số liệu {formatDateTime(dashboadChiSoChatLuong.Ngay)})</Typography>
            }
          <Box sx={{ flexGrow: 1 }} />
          <DisplayChiSoDashBoard
            ChiSoDashBoard={dashboadChiSoChatLuong.ChiSoDashBoard}
          />
        </Toolbar>
      </AppBar>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={12} md={6}>
          <CardThoiGian data={thoigianchokhambenh} typeCard ='thoigianchokham' />
          <CardThoiGian data={thoigiankhambenh} typeCard ='thoigiankhambenh'/>
          <CardThoiGian data={tongthoigian} typeCard ='tongthoigian'/>
       <StackBarTyLeTraDungCLS/>
        </Grid>
        <Grid item xs={12} sm={12} md={6}>
          <TableCanLamSang canlamsangs={canlamsangs} type={0} />
          <TableCanLamSang canlamsangs={canlamsangs} type={1} />
        </Grid>
        <Grid item xs={12} sm={12} md={12}>
          <CustomTableComponent
          data={ThoiGian_NhomXetNghiem}
          columns={[
            { header: "Tên Xét Nghiệm", name: "xetnghiemtype", rowSpan: 2 },
            // { header: "Chỉ định", name: "tong_so_trong_nhom", rowSpan: 2 },
            { header: "Thời gian chờ lấy mẫu", colSpan: 4 },
            { header: "Thời gian chờ kết quả", colSpan: 4 },
            { header: "Đã lấy mẫu", name: "so_da_lay_mau" },
            { header: "Nhanh nhất (phút)", name: "thoi_gian_cholaymau_nhanh_nhat" },
            { header: "Trung bình (phút)", name: "thoi_gian_cholaymau_trung_binh" },
            { header: "Lâu nhất (phút)", name: "thoi_gian_cholaymau_lau_nhat" },
            { header: "Đã trả KQ", name: "so_da_traketqua" },
            { header: "Nhanh nhất (phút)", name: "thoi_gian_chotraketqua_nhanh_nhat" },
            { header: "Trung bình (phút)", name: "thoi_gian_chotraketqua_trung_binh" },
            { header: "Lâu nhất (phút)", name: "thoi_gian_chotraketqua_lau_nhat" },
          ]}
          titles={["Thời gian chờ theo nhóm xét nghiệm",]}
          roundingFunction={roundToTwoDecimals}
        formatFunction={formatCell}
          />
        </Grid>
      </Grid>
    </Stack>
  );
};

export default ChiSoChatLuong;
