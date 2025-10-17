import React, { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Button,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import SaveIcon from "@mui/icons-material/Save";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import TieuChiGrid from "./TieuChiGrid";

/**
 * NhiemVuAccordion - Accordion hiển thị 1 nhiệm vụ thường quy
 *
 * Props:
 * - nhiemVu: Object DanhGiaNhiemVuThuongQuy
 *   - _id
 *   - NhiemVuThuongQuyID { TenNhiemVu, MoTa }
 *   - MucDoKho (1-10)
 *   - ChiTietDiem []
 *   - TongDiemTieuChi
 *   - DiemNhiemVu
 * - onScoreChange: (tieuChiId, newScore) => void
 * - onSave: () => void
 * - isSaving: Boolean
 * - defaultExpanded: Boolean
 */
function NhiemVuAccordion({
  nhiemVu,
  onScoreChange,
  onSave,
  isSaving = false,
  defaultExpanded = false,
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const isScored = nhiemVu.TongDiemTieuChi > 0;
  const mucDoKho = nhiemVu.MucDoKho || 5;
  const diemNhiemVu = nhiemVu.DiemNhiemVu || 0;

  // Color coding based on score
  const getScoreColor = (score) => {
    if (score >= 8) return "success";
    if (score >= 6) return "warning";
    if (score > 0) return "error";
    return "default";
  };

  const getMucDoKhoColor = (level) => {
    if (level >= 8) return "error";
    if (level >= 6) return "warning";
    return "info";
  };

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  return (
    <Accordion
      expanded={expanded}
      onChange={handleToggle}
      sx={{
        mb: 2,
        border: 1,
        borderColor: isScored ? "success.main" : "divider",
        borderLeft: 4,
        borderLeftColor: isScored ? "success.main" : "warning.main",
        "&:before": { display: "none" },
        boxShadow: expanded ? 4 : 1,
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          backgroundColor: isScored ? "success.lighter" : "background.paper",
          "&:hover": {
            backgroundColor: isScored ? "success.light" : "action.hover",
          },
        }}
      >
        <Box display="flex" alignItems="center" width="100%" gap={2}>
          {/* Status Icon */}
          {isScored ? (
            <CheckCircleIcon color="success" sx={{ fontSize: 28 }} />
          ) : (
            <RadioButtonUncheckedIcon color="warning" sx={{ fontSize: 28 }} />
          )}

          {/* Tên nhiệm vụ */}
          <Box flex={1}>
            <Typography variant="subtitle1" fontWeight="bold">
              {nhiemVu.NhiemVuThuongQuyID?.TenNhiemVu || "Nhiệm vụ"}
            </Typography>
            {nhiemVu.NhiemVuThuongQuyID?.MoTa && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block" }}
              >
                {nhiemVu.NhiemVuThuongQuyID.MoTa}
              </Typography>
            )}
          </Box>

          {/* Mức độ khó */}
          <Chip
            label={`Độ khó: ${mucDoKho}/10`}
            size="small"
            color={getMucDoKhoColor(mucDoKho)}
            icon={<TrendingUpIcon />}
          />

          {/* Điểm nhiệm vụ */}
          <Box sx={{ minWidth: 100, textAlign: "right" }}>
            <Typography
              variant="h6"
              fontWeight="bold"
              color={getScoreColor(diemNhiemVu / 10)}
            >
              {diemNhiemVu.toFixed(1)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              điểm
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails>
        {/* Công việc liên quan - Placeholder for Phase 2 */}
        {/* <Box mb={2}>
          <Typography variant="subtitle2" gutterBottom>
            📋 Công việc liên quan (Xây dựng sau)
          </Typography>
          <Alert severity="info" sx={{ mt: 1 }}>
            Tính năng hiển thị công việc liên quan sẽ được phát triển trong Phase 2
          </Alert>
        </Box>

        <Divider sx={{ my: 2 }} /> */}

        {/* Thông tin mức độ khó */}
        <Box mb={2}>
          <Typography variant="subtitle2" gutterBottom>
            Mức độ khó: {mucDoKho}/10
          </Typography>
          <LinearProgress
            variant="determinate"
            value={mucDoKho * 10}
            sx={{ height: 8, borderRadius: 4 }}
            color={getMucDoKhoColor(mucDoKho)}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 0.5 }}
          >
            Điểm nhiệm vụ = Tổng điểm tiêu chí × (Mức độ khó / 10)
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Chấm điểm tiêu chí */}
        <Typography variant="subtitle2" gutterBottom>
          Chấm điểm tiêu chí
        </Typography>

        <TieuChiGrid
          chiTietDiem={nhiemVu.ChiTietDiem}
          onChange={(tieuChiId, newScore) => {
            if (onScoreChange) {
              onScoreChange(nhiemVu._id, tieuChiId, newScore);
            }
          }}
        />

        {/* Tổng điểm nhiệm vụ */}
        <Box
          sx={{
            mt: 3,
            p: 2,
            backgroundColor: "primary.main",
            color: "primary.contrastText",
            borderRadius: 2,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="subtitle2">Điểm nhiệm vụ</Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                = {nhiemVu.TongDiemTieuChi?.toFixed(1) || 0} × ({mucDoKho}/10)
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {diemNhiemVu.toFixed(1)}
            </Typography>
          </Box>
        </Box>

        {/* Save button */}
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={onSave}
            disabled={isSaving}
            color={isScored ? "success" : "primary"}
          >
            {isSaving ? "Đang lưu..." : isScored ? "Cập nhật" : "Lưu điểm"}
          </Button>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}

export default NhiemVuAccordion;
