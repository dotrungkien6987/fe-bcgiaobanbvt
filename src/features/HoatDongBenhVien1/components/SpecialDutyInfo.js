import React from "react";
import { Grid, Paper, Typography, Box, Card, CardContent } from "@mui/material";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import GroupIcon from "@mui/icons-material/Group";
import ElectricalServicesIcon from "@mui/icons-material/ElectricalServices";
import DriveEtaIcon from "@mui/icons-material/DriveEta";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

function formatDateVN(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

const SpecialDutyInfo = ({ data }) => {
  if (!data) return null;
  // Khối 1: Thời gian
  const thu = data.Thu || "Chưa xác định";
  const ngay = data.Ngay ? formatDateVN(data.Ngay) : "";
  // Khối 2: Trực lãnh đạo, tổng trực hệ nội, tổng trực hệ ngoại
  const mainDuty = [
    {
      label: "Trực lãnh đạo",
      name: data.TrucLanhDao || "Chưa cập nhật",
      icon: <SupervisorAccountIcon color="primary" fontSize="medium" />,
      bgcolor: "#e3f2fd",
    },
    {
      label: "Tổng trực hệ nội",
      name: data.TTHeNoi || "Chưa cập nhật",
      icon: <LocalHospitalIcon color="secondary" fontSize="medium" />,
      bgcolor: "#f3e5f5",
    },
    {
      label: "Tổng trực hệ ngoại",
      name: data.TTHeNgoai || "Chưa cập nhật",
      icon: <GroupIcon sx={{ color: "#f57c00" }} fontSize="medium" />,
      bgcolor: "#fff3e0",
    },
  ];
  // Khối 3: Điện nước, Lái xe (hỗ trợ)
  const supportDuty = [
    {
      label: "Điện nước",
      name: data.DienNuoc || "Chưa cập nhật",
      icon: (
        <ElectricalServicesIcon sx={{ color: "#388e3c" }} fontSize="small" />
      ),
      bgcolor: "#f5f5f5",
    },
    {
      label: "Lái xe",
      name: data.LaiXe || "Chưa cập nhật",
      icon: <DriveEtaIcon sx={{ color: "#d81b60" }} fontSize="small" />,
      bgcolor: "#f5f5f5",
    },
  ];
  return (
    <Card elevation={2} sx={{ mb: 2, borderRadius: 3 }}>
      <CardContent>
        {/* Khối 1: Thời gian */}
        <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
          <CalendarTodayIcon color="info" sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ color: "primary.main" }}
          >
            {thu}
            {ngay ? `, ${ngay}` : ""}
          </Typography>
        </Box>
        {/* Khối 2: Trực lãnh đạo, tổng trực hệ nội, tổng trực hệ ngoại */}
        <Grid container spacing={2} sx={{ mb: 1 }} alignItems="stretch">
          {mainDuty.map((duty) => (
            <Grid item xs={12} sm={4} key={duty.label}>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  bgcolor: duty.bgcolor,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  minHeight: 80,
                }}
              >
                <Box sx={{ mr: 2, display: "flex", alignItems: "center" }}>
                  {duty.icon}
                </Box>
                <Box>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    sx={{ mb: 0.5 }}
                  >
                    {duty.label}
                  </Typography>
                  <Typography variant="body2" color="text.primary">
                    {duty.name}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
        {/* Khối 3: Trực hỗ trợ */}
        <Card
          elevation={0}
          sx={{
            mt: 2,
            borderRadius: 2,
            border: "1.5px dashed #bdbdbd",
            bgcolor: "#fafafa",
            p: 1,
          }}
        >
          <Typography
            variant="subtitle2"
            fontWeight={600}
            sx={{ mb: 1, color: "text.secondary" }}
          >
            Trực hỗ trợ
          </Typography>
          <Grid container spacing={2} alignItems="stretch">
            {supportDuty.map((duty) => (
              <Grid item xs={12} sm={6} key={duty.label}>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: duty.bgcolor,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    minHeight: 60,
                  }}
                >
                  <Box
                    sx={{
                      mr: 1,
                      display: "flex",
                      alignItems: "center",
                      opacity: 0.7,
                    }}
                  >
                    {duty.icon}
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      color="text.secondary"
                    >
                      {duty.label}
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      {duty.name}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Card>
      </CardContent>
    </Card>
  );
};

export default SpecialDutyInfo;
