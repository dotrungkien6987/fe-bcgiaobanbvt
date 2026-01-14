/**
 * StatusCardItem - Shared status card component
 *
 * Reusable card component for displaying task status metrics
 * Used in ReceivedDashboardSection and AssignedDashboardSection
 *
 * @component
 */

import React from "react";
import { Card, CardContent, Typography, Stack, useTheme } from "@mui/material";

export default function StatusCardItem({
  label,
  subtext,
  count,
  color,
  icon: Icon,
  onClick,
}) {
  const theme = useTheme();
  const colorValue = theme.palette[color]?.main || theme.palette.grey[500];

  return (
    <Card
      sx={{
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s",
        "&:hover": onClick
          ? {
              transform: "translateY(-2px)",
              boxShadow: 3,
            }
          : {},
      }}
      onClick={onClick}
    >
      <CardContent>
        <Stack spacing={1} alignItems="center">
          <Icon size={32} color={colorValue} variant="Bold" />
          <Typography variant="h4" fontWeight={600}>
            {count ?? 0}
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {label}
          </Typography>
          {subtext && (
            <Typography
              variant="caption"
              color="text.secondary"
              textAlign="center"
            >
              {subtext}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
