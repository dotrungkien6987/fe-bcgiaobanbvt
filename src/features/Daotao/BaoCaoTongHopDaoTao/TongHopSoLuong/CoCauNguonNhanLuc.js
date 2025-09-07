import { Card, CardHeader, Grid } from "@mui/material";

import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import {
  getCoCauNguonNhanLucByKhoa,
  getCoCauNguonNhanLucToanVien,
  getTongHopSoLuongTheoKhoa,
} from "features/NhanVien/nhanvienSlice";

import MyPieChart from "components/form/MyPieChart";
import LoadingScreen from "components/LoadingScreen";

function CoCauNguonNhanLuc({ fromDateISO, toDateISO, sonamcanhbao, khoaID }) {
  const { isLoading, CoCauNguonNhanLuc, pieChartDatKhuyenCao } = useSelector(
    (state) => state.nhanvien
  );
  const dispatch = useDispatch();
  const colors = [
    { color: "#1939B7" },
    { color: "#bb1515" },
    { color: "#00C49F" },
    { color: "##eb99ff" },
    { color: "#660000" },
    { color: "#00661a" },
    { color: "#0033cc" },
    { color: "#00cc00" },
    { color: "#0088FE" },
    { color: "#FFBB28" },
    // { color: "#2ABC28" },
    // { color: "#0088FE" },
    // { color: "#FFBB27" },
    // { color: "#2ABC26" },
    // { color: "#2ABC28" },
    // { color: "#0088FE" },
  ];
  const size1 = {
    height: 200,
  };
  useEffect(() => {
    if (!khoaID)
      dispatch(
        getTongHopSoLuongTheoKhoa(fromDateISO, toDateISO, sonamcanhbao * 24)
      );
  }, []);

  useEffect(() => {
    if (khoaID) {
      dispatch(getCoCauNguonNhanLucByKhoa(khoaID));
    } else dispatch(getCoCauNguonNhanLucToanVien());
  }, [khoaID]);

  return isLoading ? (
    <LoadingScreen />
  ) : (
    <Card sx={{ backgroundColor: "#1939B7", p: 2 }}>
      <Grid container spacing={3} my={1}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title={"1.Cơ cấu nguồn nhân lực chung"} />
            {CoCauNguonNhanLuc.cocauChung && (
              <MyPieChart
                data={CoCauNguonNhanLuc.cocauChung.filter(
                  (item) => item.value > 0
                )}
                colors={colors}
                other={{ ...size1 }}
              />
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title={"1.Cơ cấu theo bác sĩ"} />
            {CoCauNguonNhanLuc.cocauBacSi && (
              <MyPieChart
                data={CoCauNguonNhanLuc.cocauBacSi.filter(
                  (item) => item.value > 0
                )}
                colors={colors}
                other={{ ...size1 }}
              />
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title={"Cơ cấu theo Điều dưỡng"} />
            {CoCauNguonNhanLuc.cocauDieuDuong && (
              <MyPieChart
                data={CoCauNguonNhanLuc.cocauDieuDuong.filter(
                  (item) => item.value > 0
                )}
                colors={colors}
                other={{ ...size1 }}
              />
            )}
          </Card>
        </Grid>

        {/* Additional breakdowns: Dược sĩ, Điều dưỡng, KTV (3-up layout) */}
        <Grid item xs={12} md={3.5}>
          <Card>
            <CardHeader title={"Cơ cấu theo Dược sĩ"} />
            {CoCauNguonNhanLuc.cocauDuocSi && (
              <MyPieChart
                data={CoCauNguonNhanLuc.cocauDuocSi.filter(
                  (item) => item.value > 0
                )}
                colors={colors}
                other={{ ...size1 }}
              />
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={3.5}>
          <Card>
            <CardHeader title={"Cơ cấu theo kỹ thuật viên"} />
            {CoCauNguonNhanLuc.cocauKTV && (
              <MyPieChart
                data={CoCauNguonNhanLuc.cocauKTV.filter(
                  (item) => item.value > 0
                )}
                colors={colors}
                other={{ ...size1 }}
              />
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card>
            <CardHeader title={"Cơ cấu theo chuyên môn khác"} />
            {CoCauNguonNhanLuc.cocauKhac && (
              <MyPieChart
                data={CoCauNguonNhanLuc.cocauKhac.filter(
                  (item) => item.value > 0
                )}
                colors={colors}
                other={{ ...size1 }}
              />
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title={"2. Cơ cấu nguồn nhân lực theo chứng chỉ hành nghề"}
            />
            {CoCauNguonNhanLuc.resultChungChiHanhNghe && (
              <MyPieChart
                data={CoCauNguonNhanLuc.resultChungChiHanhNghe}
                colors={colors}
                other={{ ...size1 }}
              />
            )}
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title={
                "1.Tỷ lệ đạt tín chỉ khuyến cáo (Trên tổng số cán bộ có CCHN)"
              }
            />
            {pieChartDatKhuyenCao && (
              <MyPieChart
                data={pieChartDatKhuyenCao}
                colors={colors}
                other={{ ...size1 }}
              />
            )}
          </Card>
        </Grid>
      </Grid>
    </Card>
  );
}

export default CoCauNguonNhanLuc;
