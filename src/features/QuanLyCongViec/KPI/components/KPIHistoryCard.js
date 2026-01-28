/**
 * KPIHistoryCard - Mobile card component for KPI history list
 *
 * Replaces table row on mobile view in XemKPIPage
 * Shows: Chu kỳ, status chip, điểm KPI, progress bar, ngày duyệt
 */

import React from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography,
  Chip,
  LinearProgress,
  Box,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  CalendarMonth as CalendarIcon,
  ArrowForwardIos as ArrowIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";

function KPIHistoryCard({ danhGiaKPI, chuKy, onClick, index }) {
  const score = danhGiaKPI?.TongDiemKPI || 0;
  const scorePercent = (score / 10) * 100;
  const isDaDuyet = danhGiaKPI?.TrangThai === "DA_DUYET";

  const getScoreColor = (percent) => {
    if (percent >= 80) return "success";
    if (percent >= 60) return "warning";
    return "error";
  };

  const scoreColor = getScoreColor(scorePercent);

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: isDaDuyet ? "success.light" : "warning.light",
        borderRadius: 2,
        overflow: "hidden",
        transition: "all 0.2s",
        "&:hover": {
          boxShadow: 2,
          borderColor: "primary.main",
        },
      }}
    >
      <CardActionArea onClick={() => onClick(danhGiaKPI)}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Stack spacing={1.5}>
            {/* Header: Chu kỳ + Status */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box flex={1}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {chuKy?.TenChuKy || "N/A"}
                </Typography>
                {chuKy && (
                  <Stack
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                    sx={{ mt: 0.5 }}
                  >
                    <CalendarIcon
                      sx={{ fontSize: 14, color: "text.secondary" }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {dayjs(chuKy.NgayBatDau || chuKy.TuNgay).format(
                        "DD/MM/YYYY",
                      )}{" "}
                      -{" "}
                      {dayjs(chuKy.NgayKetThuc || chuKy.DenNgay).format(
                        "DD/MM/YYYY",
                      )}
                    </Typography>
                  </Stack>
                )}
              </Box>

              <Chip
                label={isDaDuyet ? "Đã duyệt" : "Chưa duyệt"}
                color={isDaDuyet ? "success" : "warning"}
                size="small"
                icon={
                  isDaDuyet ? (
                    <CheckCircleIcon sx={{ fontSize: 16 }} />
                  ) : (
                    <HourglassEmptyIcon sx={{ fontSize: 16 }} />
                  )
                }
                sx={{ fontWeight: 600 }}
              />
            </Stack>

            {/* Score Section */}
            <Stack direction="row" spacing={2} alignItems="center">
              {/* Score Badge */}
              <Box
                sx={{
                  minWidth: 70,
                  textAlign: "center",
                  py: 1,
                  px: 1.5,
                  borderRadius: 2,
                  bgcolor: `${scoreColor}.lighter`,
                  border: "1px solid",
                  borderColor: `${scoreColor}.light`,
                }}
              >
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  color={`${scoreColor}.main`}
                >
                  {scorePercent.toFixed(0)}%
                </Typography>
              </Box>

              {/* Progress Bar */}
              <Box flex={1}>
                <Stack direction="row" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Điểm KPI
                  </Typography>
                  <Typography variant="caption" fontWeight={600}>
                    {score.toFixed(1)}/10
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(scorePercent, 100)}
                  color={scoreColor}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: "action.hover",
                  }}
                />
              </Box>

              {/* Arrow Indicator */}
              <ArrowIcon sx={{ fontSize: 16, color: "text.disabled" }} />
            </Stack>

            {/* Footer: Ngày duyệt */}
            {danhGiaKPI?.NgayDuyet && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", textAlign: "right" }}
              >
                Duyệt: {dayjs(danhGiaKPI.NgayDuyet).format("DD/MM/YYYY HH:mm")}
              </Typography>
            )}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

KPIHistoryCard.propTypes = {
  danhGiaKPI: PropTypes.shape({
    _id: PropTypes.string,
    TongDiemKPI: PropTypes.number,
    TrangThai: PropTypes.string,
    NgayDuyet: PropTypes.string,
    ChuKyDanhGiaID: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  }).isRequired,
  chuKy: PropTypes.shape({
    _id: PropTypes.string,
    TenChuKy: PropTypes.string,
    NgayBatDau: PropTypes.string,
    NgayKetThuc: PropTypes.string,
    TuNgay: PropTypes.string,
    DenNgay: PropTypes.string,
  }),
  onClick: PropTypes.func.isRequired,
  index: PropTypes.number,
};

export default KPIHistoryCard;
