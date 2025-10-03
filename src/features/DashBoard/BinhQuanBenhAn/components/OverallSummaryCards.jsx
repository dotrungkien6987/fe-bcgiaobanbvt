import React from "react";
import { Stack, Card, CardContent, Typography, Box } from "@mui/material";

function OverallSummaryCards({
  totalAll,
  totalAll_diff,
  ngoaitruKhongNhapVien,
  ngoaitruKhongNhapVien_diff,
}) {
  const renderCard = (label, value, diff, bgColor) => {
    const diffColor = diff >= 0 ? "#00C49F" : "#bb1515";
    const diffSymbol = diff >= 0 ? "+" : "";

    return (
      <Card
        sx={{
          flex: 1,
          borderRadius: 2,
          boxShadow: 4,
          bgcolor: bgColor,
          color: "#FFF",
          minWidth: { xs: "100%", sm: "200px" },
        }}
      >
        <CardContent sx={{ p: { xs: 0.8, sm: 1.2 }, textAlign: "center" }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            justifyContent="center"
          >
            <Typography sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}>
              🏥
            </Typography>
            <Typography
              variant="overline"
              sx={{
                opacity: 0.95,
                fontWeight: 600,
                fontSize: { xs: "0.6rem", sm: "0.65rem" },
                lineHeight: 1.2,
              }}
            >
              {label}
            </Typography>
          </Stack>

          <Box sx={{ mt: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1rem", sm: "1.1rem" },
                lineHeight: 1.2,
              }}
            >
              {value.toLocaleString("vi-VN")} BN
            </Typography>

            {diff !== 0 && (
              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  color: diffColor,
                  fontWeight: 600,
                  fontSize: { xs: "0.65rem", sm: "0.7rem" },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.5,
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>
                  {diff >= 0 ? "▲" : "▼"}
                </span>
                {diffSymbol}
                {Math.abs(diff).toLocaleString("vi-VN")} BN
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }}>
      {renderCard("Toàn viện", totalAll, totalAll_diff, "#1939B7")}
      {renderCard(
        "Chỉ khám ngoại trú",
        ngoaitruKhongNhapVien,
        ngoaitruKhongNhapVien_diff,
        "#bb1515"
      )}
    </Stack>
  );
}

export default OverallSummaryCards;
