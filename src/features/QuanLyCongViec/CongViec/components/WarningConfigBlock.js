import React from "react";
import { Box, Chip, Typography } from "@mui/material";
import dayjs from "dayjs";

/**
 * Hiển thị cấu hình cảnh báo của công việc.
 * Props:
 *  - cv: đối tượng công việc (có các field: CanhBaoMode, CanhBaoSapHetHanPercent, NgayCanhBao, NgayHetHan, CoDuyetHoanThanh)
 */
const WarningConfigBlock = ({ cv }) => {
  if (!cv) return null;
  const mode = cv.CanhBaoMode; // PERCENT | FIXED
  const rawPercent = cv.CanhBaoSapHetHanPercent || 0.8;
  const percent = mode === "PERCENT" ? Math.round(rawPercent * 100) : null;
  const warnTooLate = percent !== null && percent >= 95;
  const fixedTooClose =
    mode === "FIXED" &&
    cv.NgayCanhBao &&
    cv.NgayHetHan &&
    dayjs(cv.NgayCanhBao).isAfter(dayjs(cv.NgayHetHan).subtract(2, "hour"));

  return (
    <Box sx={{ mt: 3 }}>
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 700,
          mb: 1.5,
          color: "text.primary",
          fontSize: { xs: "1rem", sm: "1.1rem" },
        }}
      >
        Cấu hình cảnh báo
      </Typography>
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
        <Chip
          size="medium"
          variant="outlined"
          label={
            mode === "PERCENT"
              ? `Theo phần trăm (${percent}%)`
              : "Thời điểm cố định"
          }
          sx={{ fontSize: "0.9rem", fontWeight: 600 }}
        />
        {cv.NgayCanhBao && (
          <Chip
            size="medium"
            variant="outlined"
            label={`Bắt đầu cảnh báo: ${dayjs(cv.NgayCanhBao).format(
              "DD/MM HH:mm"
            )}`}
            sx={{ fontSize: "0.9rem", fontWeight: 600 }}
          />
        )}
        {mode === "PERCENT" && (
          <Chip
            size="medium"
            variant="outlined"
            label={`P = ${(rawPercent * 100).toFixed(0)}%`}
            sx={{ fontSize: "0.9rem", fontWeight: 600 }}
          />
        )}
        {warnTooLate && (
          <Chip
            size="medium"
            color="warning"
            label="Cảnh báo quá muộn"
            sx={{ fontSize: "0.9rem", fontWeight: 600 }}
          />
        )}
        {fixedTooClose && (
          <Chip
            size="medium"
            color="error"
            label="Sát hạn (<2h)"
            sx={{ fontSize: "0.9rem", fontWeight: 600 }}
          />
        )}
        {cv.CoDuyetHoanThanh && (
          <Chip
            size="medium"
            color="info"
            label="Có bước duyệt"
            sx={{ fontSize: "0.9rem", fontWeight: 600 }}
          />
        )}
      </Box>
    </Box>
  );
};

export default WarningConfigBlock;
