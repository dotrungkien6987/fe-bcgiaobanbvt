/**
 * YeuCauProgressIndicator - Smart progress indicator với SLA tracking
 *
 * Features:
 * - Visual workflow stepper (desktop) / compact chips (mobile)
 * - SLA deadline tracking với progress bar
 * - "Waiting for" person indicator
 * - Responsive design với breakpoints
 */
import React from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Chip,
  LinearProgress,
  Alert,
  Avatar,
  Stack,
  useMediaQuery,
} from "@mui/material";
import {
  AccessTime as ClockIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import dayjs from "dayjs";
import { TRANG_THAI, TRANG_THAI_LABELS } from "../yeuCau.constants";

const STEPS = [
  { value: TRANG_THAI.MOI, label: "Mới" },
  { value: TRANG_THAI.DANG_XU_LY, label: "Đang xử lý" },
  { value: TRANG_THAI.DA_HOAN_THANH, label: "Hoàn thành" },
  { value: TRANG_THAI.DA_DONG, label: "Đã đóng" },
];

/**
 * Calculate SLA metrics
 */
function calculateSLA(yeuCau) {
  if (!yeuCau.ThoiGianHen) return null;

  const now = dayjs();
  const deadline = dayjs(yeuCau.ThoiGianHen);
  const created = dayjs(yeuCau.createdAt);

  const totalTime = deadline.diff(created, "minute");
  const elapsed = now.diff(created, "minute");
  const remaining = deadline.diff(now, "minute");

  const percentUsed = totalTime > 0 ? (elapsed / totalTime) * 100 : 0;

  return {
    deadline,
    remaining,
    percentUsed,
    isOverdue: remaining < 0,
    isNearDeadline: remaining > 0 && remaining < 120, // 2 hours
    remainingText:
      remaining > 0
        ? `còn ${Math.floor(remaining / 60)}h ${remaining % 60}p`
        : `quá hạn ${Math.abs(Math.floor(remaining / 60))}h ${
            Math.abs(remaining) % 60
          }p`,
  };
}

/**
 * Get person who is blocking/waiting for action
 */
function getWaitingPerson(yeuCau) {
  const { TrangThai, NguoiXuLyID, NguoiDuocDieuPhoiID, NguoiYeuCauID } = yeuCau;

  if (TrangThai === TRANG_THAI.MOI) {
    if (NguoiDuocDieuPhoiID) {
      return {
        person: NguoiDuocDieuPhoiID,
        role: "Người được điều phối",
        action: "tiếp nhận",
      };
    }
    return {
      person: null,
      role: "Điều phối viên",
      action: "phân công",
    };
  }

  if (TrangThai === TRANG_THAI.DANG_XU_LY) {
    return {
      person: NguoiXuLyID,
      role: "Người xử lý",
      action: "hoàn thành",
    };
  }

  if (TrangThai === TRANG_THAI.DA_HOAN_THANH) {
    return {
      person: NguoiYeuCauID,
      role: "Người gửi",
      action: "đánh giá",
    };
  }

  return null;
}

/**
 * Main component with responsive variants
 */
export default function YeuCauProgressIndicator({ yeuCau, compact }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Auto-detect compact mode if not specified
  const isCompact = compact !== undefined ? compact : isMobile;

  if (!yeuCau) return null;

  const activeStep = STEPS.findIndex((s) => s.value === yeuCau.TrangThai);
  const sla = calculateSLA(yeuCau);
  const waiting = getWaitingPerson(yeuCau);

  // Skip for closed/rejected tickets
  if (
    yeuCau.TrangThai === TRANG_THAI.DA_DONG ||
    yeuCau.TrangThai === TRANG_THAI.TU_CHOI
  ) {
    return (
      <Box sx={{ mb: 2 }}>
        <Chip
          label={TRANG_THAI_LABELS[yeuCau.TrangThai]}
          size="small"
          color="default"
        />
      </Box>
    );
  }

  if (isCompact) {
    // Mobile compact view
    return (
      <Box sx={{ mb: 2 }}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ mb: 1 }}
          flexWrap="wrap"
        >
          <Chip
            label={TRANG_THAI_LABELS[yeuCau.TrangThai]}
            size="small"
            color={
              yeuCau.TrangThai === TRANG_THAI.DA_HOAN_THANH
                ? "success"
                : yeuCau.TrangThai === TRANG_THAI.DANG_XU_LY
                ? "warning"
                : "info"
            }
          />
          {sla && (
            <Chip
              icon={sla.isOverdue ? <WarningIcon /> : <ClockIcon />}
              label={sla.remainingText}
              size="small"
              color={
                sla.isOverdue
                  ? "error"
                  : sla.isNearDeadline
                  ? "warning"
                  : "default"
              }
            />
          )}
        </Stack>

        {sla && (
          <Box sx={{ mb: 1 }}>
            <LinearProgress
              variant="determinate"
              value={Math.min(sla.percentUsed, 100)}
              color={
                sla.isOverdue
                  ? "error"
                  : sla.percentUsed > 85
                  ? "warning"
                  : "primary"
              }
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        )}

        {waiting && waiting.person && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar src={waiting.person.Avatar} sx={{ width: 24, height: 24 }}>
              {waiting.person.HoTen?.charAt(0)}
            </Avatar>
            <Typography variant="caption" color="text.secondary">
              Chờ: {waiting.person.HoTen} ({waiting.role})
            </Typography>
          </Stack>
        )}
      </Box>
    );
  }

  // Desktop full view
  return (
    <Box sx={{ mb: 3 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {STEPS.map((step) => (
          <Step key={step.value}>
            <StepLabel>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {sla && (
        <Box sx={{ mt: 2 }}>
          {sla.isOverdue && (
            <Alert severity="error" icon={<WarningIcon />}>
              <strong>Quá hạn {sla.remainingText}</strong> - Cần xử lý ngay!
            </Alert>
          )}

          {!sla.isOverdue && sla.isNearDeadline && (
            <Alert severity="warning" icon={<ClockIcon />}>
              <strong>Sắp đến hạn</strong> - {sla.remainingText} (
              {Math.round(sla.percentUsed)}% thời gian đã qua)
            </Alert>
          )}

          {!sla.isOverdue && !sla.isNearDeadline && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Deadline: {sla.deadline.format("DD/MM/YYYY HH:mm")} (
                {sla.remainingText})
              </Typography>
              <LinearProgress
                variant="determinate"
                value={sla.percentUsed}
                color="primary"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          )}
        </Box>
      )}

      {waiting && (
        <Box sx={{ mt: 2, p: 2, bgcolor: "action.hover", borderRadius: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            {waiting.person ? (
              <Avatar src={waiting.person.Avatar}>
                {waiting.person.HoTen?.charAt(0)}
              </Avatar>
            ) : (
              <PersonIcon color="action" />
            )}
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {waiting.person
                  ? `Chờ ${waiting.person.HoTen} (${waiting.role})`
                  : `Chờ ${waiting.role}`}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Cần: {waiting.action}
              </Typography>
            </Box>
          </Stack>
        </Box>
      )}
    </Box>
  );
}
