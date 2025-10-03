import React from "react";
import { Stack, Card, CardContent, Typography, Box } from "@mui/material";
import { VND } from "../constants";

function SummaryCards({
  totals,
  filteredLength,
  loaiKhoa,
  thongKeCount,
  thongKeCount_diff,
}) {
  const renderDifferenceText = (diff) => {
    if (!diff || diff === 0) return null;
    const diffColor = diff >= 0 ? "#00C49F" : "#bb1515";
    const diffSymbol = diff >= 0 ? "+" : "";

    return (
      <Typography
        variant="caption"
        sx={{
          color: diffColor,
          fontWeight: 600,
          fontSize: { xs: "0.65rem", sm: "0.75rem" },
          display: "block",
          mt: 0.3,
        }}
      >
        {diff >= 0 ? "▲" : "▼"} {diffSymbol}
        {Math.abs(diff).toLocaleString("vi-VN")} BN
      </Typography>
    );
  };

  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ mb: 1.5 }}>
      <Card
        sx={{
          flex: 1,
          borderRadius: 2,
          boxShadow: 4,
          bgcolor: "#1939B7",
          color: "#FFF",
        }}
      >
        <CardContent sx={{ p: { xs: 0.8, sm: 1 }, textAlign: "center" }}>
          <Typography
            variant="overline"
            sx={{
              opacity: 0.9,
              fontSize: { xs: "0.55rem", sm: "0.6rem" },
            }}
          >
            {loaiKhoa === "noitru" ? "Tổng số khoa" : "Tổng số phòng khám"}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "0.85rem", sm: "1rem" },
            }}
          >
            {filteredLength}
          </Typography>
        </CardContent>
      </Card>

      <Card
        sx={{
          flex: 1,
          borderRadius: 2,
          boxShadow: 4,
          bgcolor: "#1939B7",
          color: "#FFF",
        }}
      >
        <CardContent sx={{ p: { xs: 0.8, sm: 1 }, textAlign: "center" }}>
          <Typography
            variant="overline"
            sx={{
              opacity: 0.9,
              color: "#FFF",
              fontSize: { xs: "0.55rem", sm: "0.6rem" },
            }}
          >
            {loaiKhoa === "noitru" ? "Nội trú" : "Ngoại trú"}
          </Typography>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "0.85rem", sm: "1rem" },
              }}
            >
              {(thongKeCount || 0).toLocaleString("vi-VN")} BN
            </Typography>
            {renderDifferenceText(thongKeCount_diff)}
          </Box>
        </CardContent>
      </Card>

      <Card
        sx={{
          flex: 1,
          borderRadius: 2,
          boxShadow: 4,
          bgcolor: "#bb1515",
          color: "#FFF",
        }}
      >
        <CardContent sx={{ p: { xs: 0.8, sm: 1 }, textAlign: "center" }}>
          <Typography
            variant="overline"
            sx={{
              opacity: 0.9,
              fontSize: { xs: "0.55rem", sm: "0.6rem" },
            }}
          >
            Tổng doanh thu
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "0.8rem", sm: "1rem" },
            }}
          >
            {VND.format(totals.totalMoney)}
          </Typography>
        </CardContent>
      </Card>

      <Card
        sx={{
          flex: 1,
          borderRadius: 2,
          boxShadow: 4,
          bgcolor: "#1939B7",
          color: "#FFF",
        }}
      >
        <CardContent sx={{ p: { xs: 0.8, sm: 1 }, textAlign: "center" }}>
          <Typography
            variant="overline"
            sx={{
              opacity: 0.9,
              color: "#FFF",
              fontSize: { xs: "0.55rem", sm: "0.6rem" },
            }}
          >
            Bình quân HSBA
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "0.8rem", sm: "1rem" },
            }}
          >
            {VND.format(totals.avgPerCase)}
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default SummaryCards;
