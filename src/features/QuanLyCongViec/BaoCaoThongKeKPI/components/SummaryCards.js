import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  LinearProgress,
} from "@mui/material";
import { useSelector } from "react-redux";
import {
  People as PeopleIcon,
  CheckCircle as CheckIcon,
  TrendingUp as TrendIcon,
  PieChart as PieIcon,
} from "@mui/icons-material";

function SummaryCards() {
  const { tongQuan, isLoading, error } = useSelector(
    (state) => state.baoCaoKPI
  );

  // Debug log
  React.useEffect(() => {
    console.log("SummaryCards - isLoading:", isLoading);
    console.log("SummaryCards - tongQuan:", tongQuan);
    console.log("SummaryCards - error:", error);
  }, [isLoading, tongQuan, error]);

  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Stack spacing={2}>
                  <LinearProgress />
                  <Typography variant="body2">Đang tải...</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (error) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ backgroundColor: "error.lighter" }}>
            <CardContent>
              <Typography variant="body2" color="error">
                ❌ Lỗi: {error}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }

  if (!tongQuan) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
                ℹ️ Chưa có dữ liệu thống kê. Vui lòng chọn bộ lọc hoặc kiểm tra
                dữ liệu KPI.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }

  const cards = [
    {
      title: "Tổng số nhân viên",
      value: tongQuan.tongSoNhanVien,
      subtitle: `${tongQuan.tongSoDanhGia} đánh giá`,
      icon: <PeopleIcon />,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "#667eea",
    },
    {
      title: "Tỷ lệ hoàn thành",
      value: `${tongQuan.tyLeHoanThanh?.toFixed(1) || 0}%`,
      subtitle: `${tongQuan.daDuyet}/${tongQuan.tongSoDanhGia} đã duyệt`,
      icon: <CheckIcon />,
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      color: "#43e97b",
    },
    {
      title: "Điểm trung bình",
      value: tongQuan.diemTrungBinh?.toFixed(2) || 0,
      subtitle: `Cao nhất: ${tongQuan.diemCaoNhat?.toFixed(2) || 0}`,
      icon: <TrendIcon />,
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      color: "#f093fb",
    },
    {
      title: "Số khoa tham gia",
      value: tongQuan.soKhoaThamGia || 0,
      subtitle: `Thấp nhất: ${tongQuan.diemThapNhat?.toFixed(2) || 0}`,
      icon: <PieIcon />,
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      color: "#4facfe",
    },
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card
            sx={{
              height: "100%",
              background: card.gradient,
              color: "white",
              position: "relative",
              overflow: "hidden",
              "&:hover": {
                transform: "translateY(-4px)",
                transition: "transform 0.3s ease",
                boxShadow: 4,
              },
            }}
          >
            <CardContent>
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography
                    variant="body2"
                    sx={{ opacity: 0.9, fontWeight: 500 }}
                  >
                    {card.title}
                  </Typography>
                  <Box
                    sx={{
                      backgroundColor: "rgba(255,255,255,0.2)",
                      borderRadius: "50%",
                      p: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {React.cloneElement(card.icon, { sx: { fontSize: 28 } })}
                  </Box>
                </Stack>

                <Typography variant="h3" fontWeight={700}>
                  {card.value}
                </Typography>

                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {card.subtitle}
                </Typography>
              </Stack>

              {/* Decorative circle */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.1)",
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default SummaryCards;
