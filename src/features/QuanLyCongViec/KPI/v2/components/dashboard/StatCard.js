import React from "react";
import { Card, CardContent, Typography, Box, Tooltip } from "@mui/material";

/**
 * StatCard - Reusable stat card component
 * @param {string} icon - Emoji icon
 * @param {string} label - Card label
 * @param {number|string} value - Main value to display
 * @param {string} subtitle - Optional subtitle (e.g., percentage, trend)
 * @param {string} color - Color indicator: 'success', 'warning', 'error', 'info'
 * @param {string} tooltip - Optional tooltip text for explanation
 */
function StatCard({ icon, label, value, subtitle, color = "info", tooltip }) {
  const colorMap = {
    success: { bg: "#d1fae5", border: "#10b981", text: "#065f46" },
    warning: { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" },
    error: { bg: "#fee2e2", border: "#ef4444", text: "#991b1b" },
    info: { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" },
    default: { bg: "#f3f4f6", border: "#9ca3af", text: "#374151" },
  };

  const colors = colorMap[color] || colorMap.default;

  const cardContent = (
    <Card
      sx={{
        height: "100%",
        borderLeft: `4px solid ${colors.border}`,
        bgcolor: colors.bg,
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
        },
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Typography variant="h5">{icon}</Typography>
          <Typography
            variant="caption"
            fontWeight={600}
            color="text.secondary"
            textTransform="uppercase"
          >
            {label}
          </Typography>
        </Box>
        <Typography
          variant="h4"
          fontWeight={700}
          color={colors.text}
          sx={{ mb: 0.5 }}
        >
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" fontWeight={600} color={colors.text}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  // Wrap in Tooltip if tooltip text is provided
  if (tooltip) {
    return (
      <Tooltip
        title={tooltip}
        arrow
        placement="top"
        enterDelay={300}
        sx={{
          "& .MuiTooltip-tooltip": {
            fontSize: "0.875rem",
            maxWidth: 320,
            textAlign: "center",
            lineHeight: 1.5,
          },
        }}
      >
        <Box sx={{ height: "100%" }}>{cardContent}</Box>
      </Tooltip>
    );
  }

  return cardContent;
}

export default StatCard;
