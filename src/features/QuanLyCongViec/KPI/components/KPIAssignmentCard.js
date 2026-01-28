/**
 * KPIAssignmentCard - Mobile-friendly self-evaluation card
 *
 * Touch-friendly card for TuDanhGiaKPIPage mobile view
 * Features: Task info, slider, quick score buttons, status indicators
 */

import React from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardContent,
  Stack,
  Typography,
  Chip,
  Box,
  Slider,
  TextField,
  ButtonGroup,
  Button,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";

// Quick score preset buttons
const QUICK_SCORES = [
  { label: "0", value: 0 },
  { label: "25", value: 25 },
  { label: "50", value: 50 },
  { label: "75", value: 75 },
  { label: "100", value: 100 },
];

function KPIAssignmentCard({
  assignment,
  currentScore,
  onScoreChange,
  canEdit,
  isSaving,
  index,
}) {
  const isSaved = (assignment.DiemTuDanhGia || 0) > 0;
  const hasChanged = currentScore !== (assignment.DiemTuDanhGia || 0);

  const getScoreColor = (score) => {
    if (score >= 80) return "success";
    if (score >= 50) return "warning";
    return "error";
  };

  const scoreColor = getScoreColor(currentScore);

  return (
    <Card
      elevation={0}
      sx={{
        border: "2px solid",
        borderColor: hasChanged
          ? "warning.main"
          : isSaved
            ? "success.light"
            : "divider",
        borderRadius: 3,
        transition: "all 0.2s",
        overflow: "visible",
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Stack spacing={2}>
          {/* Header: Index + Status Badges */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={`#${index + 1}`}
                size="small"
                color="primary"
                sx={{ fontWeight: 700 }}
              />
              <Chip
                label={`Độ khó: ${assignment.MucDoKho}`}
                size="small"
                variant="outlined"
                sx={{ height: 24 }}
              />
            </Stack>

            <Stack direction="row" spacing={0.5}>
              {hasChanged && (
                <Chip
                  label="Chưa lưu"
                  size="small"
                  color="warning"
                  sx={{ height: 24, fontWeight: 600 }}
                />
              )}
              {isSaved && !hasChanged && (
                <Chip
                  label="Đã lưu"
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ height: 24 }}
                />
              )}
            </Stack>
          </Stack>

          {/* Task Info */}
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <AssignmentIcon color="primary" sx={{ mt: 0.5 }} />
            <Box flex={1}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                {assignment.NhiemVuThuongQuyID?.TenNhiemVu || "N/A"}
              </Typography>
              {assignment.NhiemVuThuongQuyID?.MoTa && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {assignment.NhiemVuThuongQuyID.MoTa}
                </Typography>
              )}
            </Box>
          </Stack>

          {/* Score Display - Large and Centered */}
          <Box
            sx={{
              textAlign: "center",
              py: 2,
              px: 3,
              borderRadius: 2,
              bgcolor: `${scoreColor}.lighter`,
              border: "1px solid",
              borderColor: `${scoreColor}.light`,
            }}
          >
            <Typography
              variant="h2"
              fontWeight="bold"
              color={`${scoreColor}.main`}
            >
              {currentScore}
              <Typography
                component="span"
                variant="h5"
                color="text.secondary"
                sx={{ ml: 0.5 }}
              >
                %
              </Typography>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Mức độ hoàn thành
            </Typography>
          </Box>

          {/* Quick Score Buttons */}
          {canEdit && (
            <ButtonGroup
              fullWidth
              size="large"
              disabled={isSaving}
              sx={{
                "& .MuiButton-root": {
                  py: 1.5,
                  fontWeight: 600,
                },
              }}
            >
              {QUICK_SCORES.map((preset) => (
                <Button
                  key={preset.value}
                  onClick={() => onScoreChange(assignment._id, preset.value)}
                  variant={
                    currentScore === preset.value ? "contained" : "outlined"
                  }
                  color={
                    currentScore === preset.value
                      ? getScoreColor(preset.value)
                      : "inherit"
                  }
                >
                  {preset.label}
                </Button>
              ))}
            </ButtonGroup>
          )}

          {/* Slider for Fine Adjustment */}
          {canEdit && (
            <Stack direction="row" spacing={2} alignItems="center">
              <Box flex={1}>
                <Slider
                  value={currentScore}
                  onChange={(e, value) => onScoreChange(assignment._id, value)}
                  disabled={isSaving}
                  min={0}
                  max={100}
                  step={1}
                  valueLabelDisplay="auto"
                  color={scoreColor}
                  sx={{
                    height: 10,
                    "& .MuiSlider-thumb": {
                      width: 24,
                      height: 24,
                    },
                  }}
                />
              </Box>
              <TextField
                type="number"
                value={currentScore}
                onChange={(e) =>
                  onScoreChange(
                    assignment._id,
                    Math.min(100, Math.max(0, Number(e.target.value))),
                  )
                }
                disabled={!canEdit || isSaving}
                size="small"
                sx={{ width: 80 }}
                InputProps={{
                  sx: { fontWeight: 600 },
                  endAdornment: (
                    <Typography variant="caption" color="text.secondary">
                      %
                    </Typography>
                  ),
                }}
              />
            </Stack>
          )}

          {/* Read-only mode indicator */}
          {!canEdit && (
            <Typography
              variant="caption"
              color="text.secondary"
              textAlign="center"
            >
              Chu kỳ đã đóng - Chỉ xem, không thể chỉnh sửa
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

KPIAssignmentCard.propTypes = {
  assignment: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    MucDoKho: PropTypes.number,
    DiemTuDanhGia: PropTypes.number,
    NhiemVuThuongQuyID: PropTypes.shape({
      TenNhiemVu: PropTypes.string,
      MoTa: PropTypes.string,
    }),
  }).isRequired,
  currentScore: PropTypes.number.isRequired,
  onScoreChange: PropTypes.func.isRequired,
  canEdit: PropTypes.bool,
  isSaving: PropTypes.bool,
  index: PropTypes.number,
};

KPIAssignmentCard.defaultProps = {
  canEdit: true,
  isSaving: false,
  index: 0,
};

export default KPIAssignmentCard;
