import React from "react";
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Divider,
} from "@mui/material";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";

/**
 * InsightsPanel - Collapsible advanced metrics panel
 * @param {Object} timeMetrics - Time performance data
 * @param {Object} collaboration - Collaboration metrics
 * @param {Array} priorityDistribution - Priority breakdown
 */
function InsightsPanel({
  timeMetrics = {},
  collaboration = {},
  priorityDistribution = [],
}) {
  const formatHours = (hours) => (hours ? `${hours.toFixed(1)} giờ` : "—");

  const formatDays = (days) => (days ? `${days.toFixed(1)} ngày` : "—");

  const formatNumber = (num) =>
    num !== undefined && num !== null ? num.toFixed(1) : "—";

  const priorityLabels = {
    THAP: "Thấp",
    TRUNG_BINH: "Trung bình",
    CAO: "Cao",
    RAT_CAO: "Rất cao",
  };

  return (
    <Accordion defaultExpanded={false}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle1" fontWeight={700}>
          💡 Chi tiết phân tích
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={3}>
          {/* Time Performance */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: "#f9fafb" }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                ⏱️ Hiệu suất thời gian
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              <Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    Tỷ lệ hoàn thành đúng hạn:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {timeMetrics.onTimeCount || 0}/
                    {(timeMetrics.onTimeCount || 0) +
                      (timeMetrics.lateCount || 0)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    Trung bình giờ trễ (khi trễ):
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="error">
                    {formatHours(timeMetrics.avgLateHours)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    Giờ trễ tối đa:
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="error">
                    {formatHours(timeMetrics.maxLateHours)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Thời gian hoàn thành TB:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatDays(timeMetrics.avgCompletionDays)}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Collaboration Metrics */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: "#f9fafb" }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                👥 Cộng tác & Tương tác
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              <Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    Số người TB mỗi công việc:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatNumber(collaboration.avgTeamSize)} người
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    Trung bình bình luận:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatNumber(collaboration.avgComments)} BL
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    Số CV nhiều người:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {collaboration.multiPersonTasks || 0}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Tỷ lệ phối hợp:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {collaboration.multiPersonRate
                      ? `${collaboration.multiPersonRate.toFixed(1)}%`
                      : "—"}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Priority Distribution */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: "#f9fafb" }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                🎯 Phân tích theo độ ưu tiên
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              {priorityDistribution.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Không có dữ liệu
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {priorityDistribution.map((item) => (
                    <Grid item xs={6} sm={3} key={item.priority}>
                      <Box
                        sx={{
                          p: 1.5,
                          border: "1px solid #e5e7eb",
                          borderRadius: 1,
                          textAlign: "center",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {priorityLabels[item.priority] || item.priority}
                        </Typography>
                        <Typography variant="h6" fontWeight={700}>
                          {item.total || 0}
                        </Typography>
                        <Box
                          display="flex"
                          justifyContent="space-around"
                          mt={0.5}
                        >
                          <Typography variant="caption" color="success.main">
                            ✓ {item.completed || 0}
                          </Typography>
                          <Typography variant="caption" color="warning.main">
                            ⚡ {item.active || 0}
                          </Typography>
                          <Typography variant="caption" color="error.main">
                            🔴 {item.late || 0}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}

export default InsightsPanel;
