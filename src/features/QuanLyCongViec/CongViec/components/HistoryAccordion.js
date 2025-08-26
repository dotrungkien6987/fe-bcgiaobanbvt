import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Chip,
  Stack,
  Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function formatDate(dt) {
  if (!dt) return "—";
  try {
    return new Date(dt).toLocaleString("vi-VN");
  } catch {
    return "—";
  }
}

const actionLabel = (a) => a || "";

export default function HistoryAccordion({ history = [] }) {
  if (!Array.isArray(history) || !history.length) return null;
  const ordered = [...history].sort(
    (a, b) => new Date(b.ThoiGian) - new Date(a.ThoiGian)
  );
  return (
    <Accordion sx={{ mt: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle1">
          Lịch sử trạng thái ({ordered.length})
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={1}>
          {ordered.map((h, i) => {
            const revert = h.IsRevert;
            const snap = h.Snapshot;
            return (
              <Stack
                key={i}
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
              >
                <Chip
                  size="small"
                  label={actionLabel(h.HanhDong)}
                  color={revert ? "warning" : "primary"}
                  variant={revert ? "outlined" : "filled"}
                />
                <Typography variant="body2">
                  {h.TuTrangThai} → {h.DenTrangThai}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {formatDate(h.ThoiGian)}
                </Typography>
                {revert && h.ResetFields?.length ? (
                  <Tooltip title={"Reset: " + h.ResetFields.join(", ")}>
                    <Chip
                      size="small"
                      label="Revert"
                      color="warning"
                      variant="outlined"
                    />
                  </Tooltip>
                ) : null}
                {snap ? (
                  <Tooltip
                    title={`SLA: ${snap.SoGioTre}h ${
                      snap.HoanThanhTreHan ? "Trễ" : "Đúng hạn"
                    }`}
                  >
                    <Chip
                      size="small"
                      label={`Snapshot ${snap.SoGioTre}h`}
                      color={snap.HoanThanhTreHan ? "error" : "success"}
                    />
                  </Tooltip>
                ) : null}
                {h.GhiChu ? (
                  <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                    {h.GhiChu}
                  </Typography>
                ) : null}
              </Stack>
            );
          })}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
