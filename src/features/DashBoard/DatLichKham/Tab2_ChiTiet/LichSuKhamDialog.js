import React, { useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Stack,
  Divider,
  Alert,
} from "@mui/material";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  timelineItemClasses,
} from "@mui/lab";
import {
  LocalHospital as HospitalIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";

/**
 * Phân tích lịch sử khám → gợi ý mãn tính
 * Logic: Cùng mã ICD chẩn đoán ra viện xuất hiện >= 3 lần/năm → nghi mãn tính
 */
function analyzeChronicHint(lichSu) {
  if (!lichSu || lichSu.length < 3) return null;

  const icdCount = {};
  lichSu.forEach((visit) => {
    const code = visit.chandoanravien_code;
    if (code) {
      icdCount[code] = (icdCount[code] || 0) + 1;
    }
  });

  const chronic = Object.entries(icdCount)
    .filter(([, count]) => count >= 3)
    .map(([code, count]) => ({ code, count }));

  return chronic.length > 0 ? chronic : null;
}

function LichSuKhamDialog({ open, onClose, patient }) {
  const patientname = patient?.patientname;
  const birthday = patient?.birthday;
  const lichsu_kham = patient?.lichsu_kham;
  const dangkykhamdate = patient?.dangkykhamdate;
  const chandoanravien = patient?.chandoanravien;
  const chandoanravien_code = patient?.chandoanravien_code;

  // Parse lichsu_kham if it's a string
  const lichSu = useMemo(() => {
    if (!lichsu_kham) return [];
    if (typeof lichsu_kham === "string") {
      try {
        return JSON.parse(lichsu_kham);
      } catch {
        return [];
      }
    }
    return Array.isArray(lichsu_kham) ? lichsu_kham : [];
  }, [lichsu_kham]);

  const chronicHints = useMemo(() => analyzeChronicHint(lichSu), [lichSu]);

  // Current visit date for highlighting
  const currentDate = dangkykhamdate
    ? dayjs(dangkykhamdate).format("YYYY-MM-DD")
    : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography variant="h6">Lịch sử khám — {patientname}</Typography>
            <Typography variant="body2" color="text.secondary">
              Ngày sinh:{" "}
              {birthday ? dayjs(birthday).format("DD/MM/YYYY") : "N/A"} | Số lần
              khám: {lichSu.length} lần/năm
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {/* Chronic hint alert */}
        {chronicHints && (
          <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              Nghi ngờ bệnh mãn tính:
            </Typography>
            {chronicHints.map((h) => (
              <Typography key={h.code} variant="body2">
                ICD <strong>{h.code}</strong> — xuất hiện {h.count} lần/năm
              </Typography>
            ))}
          </Alert>
        )}

        {/* Current visit info */}
        {chandoanravien && (
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              bgcolor: "primary.50",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "primary.200",
            }}
          >
            <Typography variant="body2" color="primary" fontWeight="bold">
              Lần khám hiện tại ({dayjs(dangkykhamdate).format("DD/MM/YYYY")}):
            </Typography>
            <Typography variant="body2">
              {chandoanravien_code && (
                <Chip label={chandoanravien_code} size="small" sx={{ mr: 1 }} />
              )}
              {chandoanravien}
            </Typography>
          </Box>
        )}

        {lichSu.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
            Không có lịch sử khám trong 1 năm qua
          </Typography>
        ) : (
          <Timeline
            sx={{
              [`& .${timelineItemClasses.root}:before`]: {
                flex: 0,
                padding: 0,
              },
              p: 0,
            }}
          >
            {lichSu.map((visit, idx) => {
              const visitDate = visit.vienphidate
                ? dayjs(visit.vienphidate).format("YYYY-MM-DD")
                : null;
              const isCurrent = currentDate && visitDate === currentDate;

              return (
                <TimelineItem key={idx}>
                  <TimelineSeparator>
                    <TimelineDot
                      color={isCurrent ? "primary" : "grey"}
                      variant={isCurrent ? "filled" : "outlined"}
                    >
                      <HospitalIcon sx={{ fontSize: 14 }} />
                    </TimelineDot>
                    {idx < lichSu.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography
                        variant="body2"
                        fontWeight={isCurrent ? "bold" : "normal"}
                        color={isCurrent ? "primary" : "text.primary"}
                      >
                        {visit.vienphidate
                          ? dayjs(visit.vienphidate).format("DD/MM/YYYY")
                          : "N/A"}
                      </Typography>
                      {isCurrent && (
                        <Chip
                          label="Lần này"
                          size="small"
                          color="primary"
                          variant="filled"
                        />
                      )}
                    </Stack>
                    <Box sx={{ mt: 0.5 }}>
                      {visit.chandoanravien_code && (
                        <Chip
                          label={visit.chandoanravien_code}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      )}
                      <Typography variant="body2" color="text.secondary">
                        {visit.chandoanravien || "Chưa có chẩn đoán"}
                      </Typography>
                      {visit.chandoanravien_kemtheo && (
                        <Typography variant="caption" color="text.disabled">
                          Kèm theo:{" "}
                          {visit.chandoanravien_kemtheo_code &&
                            `[${visit.chandoanravien_kemtheo_code}] `}
                          {visit.chandoanravien_kemtheo}
                        </Typography>
                      )}
                    </Box>
                    {idx < lichSu.length - 1 && <Divider sx={{ mt: 1 }} />}
                  </TimelineContent>
                </TimelineItem>
              );
            })}
          </Timeline>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}

export default LichSuKhamDialog;
