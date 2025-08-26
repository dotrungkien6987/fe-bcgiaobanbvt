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
        variant="subtitle2"
        sx={{ fontWeight: 600, mb: 1, color: "text.secondary" }}
      >
        Cấu hình cảnh báo
      </Typography>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Chip
          size="small"
          variant="outlined"
          label={
            mode === "PERCENT"
              ? `Theo phần trăm (${percent}%)`
              : "Thời điểm cố định"
          }
        />
        {cv.NgayCanhBao && (
          <Chip
            size="small"
            variant="outlined"
            label={`Bắt đầu cảnh báo: ${dayjs(cv.NgayCanhBao).format(
              "DD/MM HH:mm"
            )}`}
          />
        )}
        {mode === "PERCENT" && (
          <Chip
            size="small"
            variant="outlined"
            label={`P = ${(rawPercent * 100).toFixed(0)}%`}
          />
        )}
        {warnTooLate && (
          <Chip size="small" color="warning" label="Cảnh báo quá muộn" />
        )}
        {fixedTooClose && (
          <Chip size="small" color="error" label="Sát hạn (<2h)" />
        )}
        {cv.CoDuyetHoanThanh && (
          <Chip size="small" color="info" label="Có bước duyệt" />
        )}
      </Box>
    </Box>
  );
};

export default WarningConfigBlock;
