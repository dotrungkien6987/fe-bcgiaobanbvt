import React from "react";
import { Box, Chip, Typography } from "@mui/material";
import dayjs from "dayjs";

/**
 * Hiển thị các chỉ số SLA/lead/response.
 * Props:
 *  - cv: công việc
 *  - extDue: tình trạng hạn mở rộng
 *  - soGioTre: số giờ trễ (>=0)
 */
const MetricsBlock = ({ cv, extDue, soGioTre }) => {
  if (!cv) return null;
  const hasFinish = !!cv.NgayHoanThanh;
  const lead =
    hasFinish && cv.NgayTiepNhanThucTe
      ? dayjs(cv.NgayHoanThanh).diff(dayjs(cv.NgayTiepNhanThucTe), "hour", true)
      : null;
  const response =
    cv.NgayGiaoViec && cv.NgayTiepNhanThucTe
      ? dayjs(cv.NgayTiepNhanThucTe).diff(dayjs(cv.NgayGiaoViec), "hour", true)
      : null;
  const slaOk =
    extDue === "HOAN_THANH_DUNG_HAN" ||
    (hasFinish && soGioTre <= 0 && extDue?.includes("DUNG_HAN"));

  return (
    <Box sx={{ mt: 3 }}>
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 600, mb: 1, color: "text.secondary" }}
      >
        Chỉ số
      </Typography>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {lead !== null && (
          <Chip size="small" label={`Lead: ${lead.toFixed(1)}h`} />
        )}
        {response !== null && (
          <Chip size="small" label={`Response: ${response.toFixed(1)}h`} />
        )}
        {hasFinish && typeof soGioTre === "number" && (
          <Chip
            size="small"
            color={slaOk ? "success" : soGioTre > 0 ? "error" : "success"}
            label={soGioTre > 0 ? `Trễ ${soGioTre}h` : "Đúng hạn"}
          />
        )}
      </Box>
    </Box>
  );
};

export default MetricsBlock;
