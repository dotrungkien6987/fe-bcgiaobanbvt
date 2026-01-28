/**
 * KPIEmployeeCard - Mobile-friendly employee card for KPI Evaluation
 *
 * Replaces table row on mobile with card showing:
 * - Name, department, employee code
 * - Progress bar (scored/assigned tasks)
 * - KPI score (if approved)
 * - Status chip + approval date
 * - Action buttons (Evaluate/View)
 */
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";

function KPIEmployeeCard({ employee, onEvaluate, onViewKPI, index }) {
  const emp = employee?.employee || {};
  const danhGiaKPI = employee?.danhGiaKPI || null;
  const isApproved = danhGiaKPI?.TrangThai === "DA_DUYET";

  const progress = employee?.progress || {};
  const assignedCount = progress.assigned ?? progress.total ?? 0;
  const scoredCount = progress.scored ?? 0;
  const progressPercentage =
    assignedCount > 0 ? Math.round((scoredCount / assignedCount) * 100) : 0;

  const getScoreColor = (score) => {
    if (score >= 90) return "success";
    if (score >= 80) return "info";
    if (score >= 70) return "warning";
    return "error";
  };

  const progressColor =
    progressPercentage === 100 && assignedCount > 0
      ? "success"
      : progressPercentage > 0
        ? "primary"
        : "error";

  return (
    <Card
      sx={{
        border: 1,
        borderColor: "divider",
        "&:hover": { boxShadow: 2 },
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          {/* Header: Name + Avatar */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight={600} noWrap>
                {emp.Ten || "N/A"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {emp.MaNhanVien || "N/A"}
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36 }}>
              <PersonIcon fontSize="small" />
            </Avatar>
          </Stack>

          {/* Department */}
          <Typography variant="body2" color="text.secondary" noWrap>
            🏥 {emp.KhoaID?.TenKhoa || "—"}
          </Typography>

          {/* Progress */}
          <Box>
            <Stack direction="row" justifyContent="space-between" mb={0.5}>
              <Typography variant="body2" color="text.secondary">
                📊 {scoredCount}/{assignedCount} nhiệm vụ
              </Typography>
              <Typography
                variant="body2"
                fontWeight={600}
                color={`${progressColor}.main`}
              >
                {progressPercentage}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Math.min(progressPercentage, 100)}
              color={progressColor}
              sx={{ height: 6, borderRadius: 1 }}
            />
          </Box>

          {/* Score (if approved) */}
          {isApproved && danhGiaKPI?.TongDiemKPI != null && (
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                px: 1.5,
                py: 0.75,
                borderRadius: 1.5,
                bgcolor: `${getScoreColor(danhGiaKPI.TongDiemKPI)}.lighter`,
                alignSelf: "flex-start",
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                color={`${getScoreColor(danhGiaKPI.TongDiemKPI)}.dark`}
              >
                💯 {danhGiaKPI.TongDiemKPI.toFixed(1)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                điểm KPI
              </Typography>
            </Box>
          )}

          {/* Status */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
          >
            {isApproved ? (
              <Chip
                icon={<CheckCircleIcon />}
                label="Đã duyệt"
                color="success"
                size="small"
                sx={{ fontWeight: 600 }}
              />
            ) : (
              <Chip
                icon={<HourglassEmptyIcon />}
                label="Chưa duyệt"
                color="warning"
                size="small"
                sx={{ fontWeight: 600 }}
              />
            )}
            {danhGiaKPI?.NgayDuyet && (
              <Typography variant="caption" color="text.secondary">
                {dayjs(danhGiaKPI.NgayDuyet).format("DD/MM/YYYY HH:mm")}
              </Typography>
            )}
          </Stack>

          {/* Actions */}
          <Stack direction="row" spacing={1} sx={{ pt: 0.5 }}>
            <Tooltip
              title={
                assignedCount === 0
                  ? "Nhân viên chưa được phân công nhiệm vụ"
                  : ""
              }
            >
              <span style={{ flex: 1 }}>
                <Button
                  variant="contained"
                  onClick={() => onEvaluate(employee)}
                  disabled={assignedCount === 0}
                  fullWidth
                  size="small"
                  sx={{ fontWeight: 600 }}
                >
                  {isApproved ? "Chỉnh sửa" : "Đánh giá"}
                </Button>
              </span>
            </Tooltip>
            <Tooltip
              title={
                assignedCount === 0
                  ? "Nhân viên chưa được phân công nhiệm vụ"
                  : ""
              }
            >
              <span style={{ flex: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => onViewKPI(employee)}
                  disabled={assignedCount === 0}
                  fullWidth
                  size="small"
                >
                  Xem KPI
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default KPIEmployeeCard;
