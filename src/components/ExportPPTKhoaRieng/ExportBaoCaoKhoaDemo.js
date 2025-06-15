import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, Card, CardContent, Grid } from "@mui/material";
import { ExportBaoCaoKhoaButton } from "./index";
import { getDataBCNgay_Rieng } from "../../features/BaoCaoNgay/baocaongay_riengtheokhoaSlice";

/**
 * Component demo sử dụng ExportBaoCaoKhoaButton
 * Đây là ví dụ về cách tích hợp component vào trang báo cáo khoa
 */
const ExportBaoCaoKhoaDemo = () => {
  const dispatch = useDispatch();

  // Sample data
  const khoaInfo = {
    id: "KHOA_NOI_TM",
    tenKhoa: "Khoa Nội Tim Mạch",
    date: new Date().toISOString(),
  };

  const {
    bnTuVongs,
    bnChuyenViens,
    bnXinVes,
    bnNangs,
    bnPhauThuats,
    bnNgoaiGios,
    bnCanThieps,
    bnTheoDois,
    isLoading,
  } = useSelector((state) => state.baocaongay_riengtheokhoa);

  // Load data khi component mount
  useEffect(() => {
    dispatch(getDataBCNgay_Rieng(khoaInfo.date, khoaInfo.id));
  }, [dispatch, khoaInfo.date, khoaInfo.id]);

  // Tính tổng số bệnh nhân
  const tongSoBenhNhan = [
    bnTuVongs,
    bnChuyenViens,
    bnXinVes,
    bnNangs,
    bnPhauThuats,
    bnNgoaiGios,
    bnCanThieps,
    bnTheoDois,
  ].reduce((total, list) => total + list.length, 0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Báo cáo khoa {khoaInfo.tenKhoa}
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Thông tin báo cáo
              </Typography>
              <Typography variant="body1">Khoa: {khoaInfo.tenKhoa}</Typography>
              <Typography variant="body1">
                Ngày: {new Date(khoaInfo.date).toLocaleDateString("vi-VN")}
              </Typography>
              <Typography variant="body1">
                Tổng số bệnh nhân: {tongSoBenhNhan}
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                {/* Các variant khác nhau của button */}
                <ExportBaoCaoKhoaButton
                  khoaId={khoaInfo.id}
                  date={khoaInfo.date}
                  tenKhoa={khoaInfo.tenKhoa}
                  variant="contained"
                  size="medium"
                />

                <ExportBaoCaoKhoaButton
                  khoaId={khoaInfo.id}
                  date={khoaInfo.date}
                  tenKhoa={khoaInfo.tenKhoa}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Hiển thị thống kê */}
      <Grid container spacing={2}>
        {[
          { title: "Tử vong", count: bnTuVongs.length, color: "#f44336" },
          {
            title: "Chuyển viện",
            count: bnChuyenViens.length,
            color: "#ff9800",
          },
          { title: "Xin về", count: bnXinVes.length, color: "#2196f3" },
          { title: "Nặng", count: bnNangs.length, color: "#9c27b0" },
          { title: "Phẫu thuật", count: bnPhauThuats.length, color: "#4caf50" },
          { title: "Ngoài giờ", count: bnNgoaiGios.length, color: "#607d8b" },
          { title: "Can thiệp", count: bnCanThieps.length, color: "#795548" },
          { title: "Theo dõi", count: bnTheoDois.length, color: "#3f51b5" },
        ].map((item, index) => (
          <Grid item xs={6} sm={4} md={3} key={index}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography
                  variant="h4"
                  sx={{ color: item.color, fontWeight: "bold" }}
                >
                  {item.count}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {isLoading && (
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography>Đang tải dữ liệu...</Typography>
        </Box>
      )}

      {tongSoBenhNhan === 0 && !isLoading && (
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography color="text.secondary">
            Không có dữ liệu bệnh nhân
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ExportBaoCaoKhoaDemo;
