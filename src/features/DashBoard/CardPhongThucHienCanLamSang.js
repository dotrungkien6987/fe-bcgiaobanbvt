import { useTheme } from "@emotion/react";
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import TwoLevelPieChart from "./TwoLevelPieChart";
import MyPieChart from "../../components/form/MyPieChart";
import CardChiTietBenhNhanPhongThucHien from "./CardChiTietBenhNhanPhongThucHien";
import CardPhongChiDinhPhongThucHien from "./CardPhongChiDinhPhongThucHien";

function CardPhongThucHienCanLamSang({
  phongthuchien,
  title1,
  data1,
  data2,
  data3,
}) {
  const theme = useTheme();
  const { darkMode } = useSelector((state) => state.mytheme);

  const {
    ChitietBN_PhongThucHien = [],
    ChitietBN_PhongThucHien_Cho_NgayTruoc = [],
    SoLuong_CanLamSang_PhongChiDinh_PhongThucHien = [],
  } = useSelector((state) => state.dashboard);

  const colors = [
    { color: "#FFBB28" },
    { color: "#A91FD4" },
    { color: "#44BAAE" },
    { color: "#eb99ff" },
    { color: "#660000" },
    { color: "#00661a" },
    { color: "#0033cc" },
    { color: "#00cc00" },
    { color: "#0088FE" },
    { color: "#FFBB28" },
    { color: "#2ABC28" },
  ];

  const TinhTongTheoTrangThai = (he, trangthai) => {
    return (
      phongthuchien[he]["BHYT"][trangthai] +
      phongthuchien[he]["VP"][trangthai] +
      phongthuchien[he]["YC"][trangthai] +
      phongthuchien[he]["BHYTYC"][trangthai]
    );
  };
  const data_ThucHienCLS_NoiTru = [
    {
      label: "Chờ thực hiện",
      value: TinhTongTheoTrangThai("noitru", "ChiDinh"),
      color: "#FFBB28",
    },
    {
      label: "Đã thực hiện",
      value: TinhTongTheoTrangThai("noitru", "DaThucHien"),
      color: "#A91FD4",
    },
    {
      label: "Đã trả KQ",
      value: TinhTongTheoTrangThai("noitru", "DaTraKQ"),
      color: "#44BAAE",
    },
  ];
  const data_TongHop_NoiTru_1 = [
    {
      label: "Yêu cầu",
      value:
        phongthuchien.noitru.YC.ChiDinh +
          phongthuchien.noitru.YC.DaTraKQ +
          phongthuchien.noitru.YC.DaThucHien || 0,
      color: "#1939B7",
    },
    {
      label: "Viện phí",
      value:
        phongthuchien.noitru.VP.ChiDinh +
          phongthuchien.noitru.VP.DaTraKQ +
          phongthuchien.noitru.VP.DaThucHien || 0,
      color: "#00cc00",
    },
    {
      label: "BHYT",
      value:
        phongthuchien.noitru.BHYT.ChiDinh +
          phongthuchien.noitru.BHYT.DaTraKQ +
          phongthuchien.noitru.BHYT.DaThucHien || 0,
      color: "#bb1515",
    },
    {
      label: "BH+YC",
      value:
        phongthuchien.noitru.BHYTYC.ChiDinh +
          phongthuchien.noitru.BHYTYC.DaTraKQ +
          phongthuchien.noitru.BHYTYC.DaThucHien || 0,
      color: "#3C3E09",
    },
  ];

  const data_TongHop_NoiTru_2 = [
    {
      label: "Yêu cầu-Chờ thực hiện",
      value: phongthuchien.noitru.YC.ChiDinh || 0,
      color: "#FFBB28",
    },
    {
      label: "Yêu cầu-Đã thực hiện",
      value: phongthuchien.noitru.YC.DaThucHien || 0,
      color: "#A91FD4",
    },
    {
      label: "Yêu cầu-Đã trả KQ",
      value: phongthuchien.noitru.YC.DaTraKQ || 0,
      color: "#44BAAE",
    },

    {
      label: "Viện phí-Chờ thực hiện",
      value: phongthuchien.noitru.VP.ChiDinh || 0,
      color: "#FFBB28",
    },
    {
      label: "Viện phí-Đã thực hiện",
      value: phongthuchien.noitru.VP.DaThucHien || 0,
      color: "#A91FD4",
    },
    {
      label: "Viện phí-Đã trả KQ",
      value: phongthuchien.noitru.VP.DaTraKQ || 0,
      color: "#44BAAE",
    },

    {
      label: "BHYT-Chờ thực hiện",
      value: phongthuchien.noitru.BHYT.ChiDinh || 0,
      color: "#FFBB28",
    },
    {
      label: "BHYT-Đã thực hiện",
      value: phongthuchien.noitru.BHYT.DaThucHien || 0,
      color: "#A91FD4",
    },
    {
      label: "BHYT-Đã trả KQ",
      value: phongthuchien.noitru.BHYT.DaTraKQ || 0,
      color: "#44BAAE",
    },

    {
      label: "(BHYT+YC)-Chờ thực hiện",
      value: phongthuchien.noitru.BHYTYC.ChiDinh || 0,
      color: "#FFBB28",
    },
    {
      label: "(BHYT+YC)-Đã thực hiện",
      value: phongthuchien.noitru.BHYTYC.DaThucHien || 0,
      color: "#A91FD4",
    },
    {
      label: "(BHYT+YC)-Đã trả KQ",
      value: phongthuchien.noitru.BHYTYC.DaTraKQ || 0,
      color: "#44BAAE",
    },
  ];

  const data_ThucHienCLS_NgoaiTru = [
    {
      label: "Chờ thực hiện",
      value: TinhTongTheoTrangThai("ngoaitru", "ChiDinh"),
      color: "#FFBB28",
    },
    {
      label: "Đã thực hiện",
      value: TinhTongTheoTrangThai("ngoaitru", "DaThucHien"),
      color: "#A91FD4",
    },
    {
      label: "Đã trả KQ",
      value: TinhTongTheoTrangThai("ngoaitru", "DaTraKQ"),
      color: "#44BAAE",
    },
  ];
  const data_TongHop_NgoaiTru_1 = [
    {
      label: "Yêu cầu",
      value:
        phongthuchien.ngoaitru.YC.ChiDinh +
          phongthuchien.ngoaitru.YC.DaTraKQ +
          phongthuchien.ngoaitru.YC.DaThucHien || 0,
      color: "#1939B7",
    },
    {
      label: "Viện phí",
      value:
        phongthuchien.ngoaitru.VP.ChiDinh +
          phongthuchien.ngoaitru.VP.DaTraKQ +
          phongthuchien.ngoaitru.VP.DaThucHien || 0,
      color: "#00cc00",
    },
    {
      label: "BHYT",
      value:
        phongthuchien.ngoaitru.BHYT.ChiDinh +
          phongthuchien.ngoaitru.BHYT.DaTraKQ +
          phongthuchien.ngoaitru.BHYT.DaThucHien || 0,
      color: "#bb1515",
    },
    {
      label: "BH+YC",
      value:
        phongthuchien.ngoaitru.BHYTYC.ChiDinh +
          phongthuchien.ngoaitru.BHYTYC.DaTraKQ +
          phongthuchien.ngoaitru.BHYTYC.DaThucHien || 0,
      color: "#3C3E09",
    },
  ];

  const data_TongHop_NgoaiTru_2 = [
    {
      label: "Yêu cầu-Chờ thực hiện",
      value: phongthuchien.ngoaitru.YC.ChiDinh || 0,
      color: "#FFBB28",
    },
    {
      label: "Yêu cầu-Đã thực hiện",
      value: phongthuchien.ngoaitru.YC.DaThucHien || 0,
      color: "#A91FD4",
    },
    {
      label: "Yêu cầu-Đã trả KQ",
      value: phongthuchien.ngoaitru.YC.DaTraKQ || 0,
      color: "#44BAAE",
    },

    {
      label: "Viện phí-Chờ thực hiện",
      value: phongthuchien.ngoaitru.VP.ChiDinh || 0,
      color: "#FFBB28",
    },
    {
      label: "Viện phí-Đã thực hiện",
      value: phongthuchien.ngoaitru.VP.DaThucHien || 0,
      color: "#A91FD4",
    },
    {
      label: "Viện phí-Đã trả KQ",
      value: phongthuchien.ngoaitru.VP.DaTraKQ || 0,
      color: "#44BAAE",
    },

    {
      label: "BHYT-Chờ thực hiện",
      value: phongthuchien.ngoaitru.BHYT.ChiDinh || 0,
      color: "#FFBB28",
    },
    {
      label: "BHYT-Đã thực hiện",
      value: phongthuchien.ngoaitru.BHYT.DaThucHien || 0,
      color: "#A91FD4",
    },
    {
      label: "BHYT-Đã trả KQ",
      value: phongthuchien.ngoaitru.BHYT.DaTraKQ || 0,
      color: "#44BAAE",
    },

    {
      label: "(BHYT+YC)-Chờ thực hiện",
      value: phongthuchien.ngoaitru.BHYTYC.ChiDinh || 0,
      color: "#FFBB28",
    },
    {
      label: "(BHYT+YC)-Đã thực hiện",
      value: phongthuchien.ngoaitru.BHYTYC.DaThucHien || 0,
      color: "#A91FD4",
    },
    {
      label: "(BHYT+YC)-Đã trả KQ",
      value: phongthuchien.ngoaitru.BHYTYC.DaTraKQ || 0,
      color: "#44BAAE",
    },
  ];

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={12} md={12} spacing={1} >
        {ChitietBN_PhongThucHien_Cho_NgayTruoc.filter(
          (row) =>
            row.phongthuchien === phongthuchien.phongthuchien 
        ).length > 0 && (
          <CardChiTietBenhNhanPhongThucHien
            databenhnhan={ChitietBN_PhongThucHien_Cho_NgayTruoc.filter(
              (row) =>
                row.phongthuchien === phongthuchien.phongthuchien 
            )}
            title={`Danh sách BN  ${phongthuchien.phongthuchien} chỉ định những ngày trước chưa thực hiện`}

            value={ChitietBN_PhongThucHien_Cho_NgayTruoc.filter(
              (row) =>
                row.phongthuchien === phongthuchien.phongthuchien 
            ).length}

            colorCardWarning={true}
          />
        )}
      </Grid>

      <Grid item xs={12} sm={12} md={6} spacing={1}>
        <Card
          sx={{
            fontWeight: "bold",
            color: "#f2f2f2",
            // backgroundColor: "#1939B7",
            // p: 1,
            boxShadow: 10,
            borderRadius: 1,
            m: 0.5,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={12} spacing={1}>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={12} md={12}>
                  <Card
                    sx={{
                      fontWeight: "bold",
                      color: "#f2f2f2",

                      boxShadow: 10,
                      borderRadius: 3,
                      m: 0.5,
                    }}
                  >
                    <Typography
                      textAlign={"center"}
                      sx={{ color: darkMode ? "#FFF" : "#1939B7" }}
                    >
                      {" "}
                      Tổng hợp ngoại trú
                    </Typography>
                    <CardContent>
                      <TwoLevelPieChart
                        data1={data_TongHop_NgoaiTru_1}
                        data2={data_TongHop_NgoaiTru_2}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={12} md={12}>
                  <Card
                    sx={{
                      fontWeight: "bold",
                      color: "#f2f2f2",

                      boxShadow: 10,
                      borderRadius: 3,
                      m: 0.5,
                    }}
                  >
                    <Typography
                      textAlign={"center"}
                      sx={{ color: darkMode ? "#FFF" : "#1939B7" }}
                    >
                      {" "}
                      Trạng thái thực hiện dịch vụ (ngoại trú)
                    </Typography>
                    <CardContent>
                      <MyPieChart
                        data={data_ThucHienCLS_NgoaiTru}
                        colors={colors}
                        other={{ height: 200 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={12} md={12}>
                  {SoLuong_CanLamSang_PhongChiDinh_PhongThucHien.filter(
                    (row) =>
                      row.phongthuchien === phongthuchien.phongthuchien &&
                      row.departmenttype === 2
                  ).length > 0 && (
                    <CardPhongChiDinhPhongThucHien
                      dataPhongChiDinh={SoLuong_CanLamSang_PhongChiDinh_PhongThucHien.filter(
                        (row) =>
                          row.phongthuchien === phongthuchien.phongthuchien &&
                          row.departmenttype === 2
                      )}
                      title={`Danh sách phòng ngoại trú chỉ định ${phongthuchien.phongthuchien}`}
                    />
                  )}
                </Grid>
                
                <Grid item xs={12} sm={12} md={12}>
                  {ChitietBN_PhongThucHien.filter(
                    (row) =>
                      row.phongthuchien === phongthuchien.phongthuchien &&
                      row.departmenttype === 2
                  ).length > 0 && (
                    <CardChiTietBenhNhanPhongThucHien
                      databenhnhan={ChitietBN_PhongThucHien.filter(
                        (row) =>
                          row.phongthuchien === phongthuchien.phongthuchien &&
                          row.departmenttype === 2
                      )}
                      title={`Danh sách BN ngoại trú ${phongthuchien.phongthuchien}`}
                    />
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Card>
      </Grid>

      <Grid item xs={12} sm={12} md={6} spacing={1}>
        <Card
          sx={{
            fontWeight: "bold",
            color: "#f2f2f2",
            // backgroundColor: "#1939B7",
            // p: 1,
            boxShadow: 10,
            borderRadius: 1,
            m: 0.5,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={12} spacing={1}>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={12} md={12}>
                  <Card
                    sx={{
                      fontWeight: "bold",
                      color: "#f2f2f2",

                      boxShadow: 10,
                      borderRadius: 3,
                      m: 0.5,
                    }}
                  >
                    <Typography
                      textAlign={"center"}
                      sx={{ color: darkMode ? "#FFF" : "#1939B7" }}
                    >
                      {" "}
                      Tổng hợp nội trú
                    </Typography>
                    <CardContent>
                      <TwoLevelPieChart
                        data1={data_TongHop_NoiTru_1}
                        data2={data_TongHop_NoiTru_2}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={12} md={12}>
                  <Card
                    sx={{
                      fontWeight: "bold",
                      color: "#f2f2f2",

                      boxShadow: 10,
                      borderRadius: 3,
                      m: 0.5,
                    }}
                  >
                    <Typography
                      textAlign={"center"}
                      sx={{ color: darkMode ? "#FFF" : "#1939B7" }}
                    >
                      {" "}
                      Trạng thái thực hiện dịch vụ (nội trú)
                    </Typography>
                    <CardContent>
                      <MyPieChart
                        data={data_ThucHienCLS_NoiTru}
                        colors={colors}
                        other={{ height: 200 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={12} md={12}>
                  {SoLuong_CanLamSang_PhongChiDinh_PhongThucHien.filter(
                    (row) =>
                      row.phongthuchien === phongthuchien.phongthuchien &&
                      row.departmenttype === 3
                  ).length > 0 && (
                    <CardPhongChiDinhPhongThucHien
                      dataPhongChiDinh={SoLuong_CanLamSang_PhongChiDinh_PhongThucHien.filter(
                        (row) =>
                          row.phongthuchien === phongthuchien.phongthuchien &&
                          row.departmenttype === 3
                      )}
                      title={`Danh sách phòng nội trú chỉ định ${phongthuchien.phongthuchien}`}
                    />
                  )}
                </Grid>

                <Grid item xs={12} sm={12} md={12}>
                  {ChitietBN_PhongThucHien.filter(
                    (row) =>
                      row.phongthuchien === phongthuchien.phongthuchien &&
                      row.departmenttype === 3
                  ).length > 0 && (
                    <CardChiTietBenhNhanPhongThucHien
                      databenhnhan={ChitietBN_PhongThucHien.filter(
                        (row) =>
                          row.phongthuchien === phongthuchien.phongthuchien &&
                          row.departmenttype === 3
                      )}
                      title={`Danh sách BN nội trú ${phongthuchien.phongthuchien}`}
                    />
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Card>
      </Grid>
    </Grid>
  );
}

export default CardPhongThucHienCanLamSang;
