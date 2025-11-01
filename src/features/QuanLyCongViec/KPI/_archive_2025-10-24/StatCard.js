import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

/**
 * StatCard - Card hiển thị thống kê
 *
 * Props:
 * - title: Tiêu đề (VD: "Tổng nhân viên")
 * - value: Giá trị số
 * - color: "success" | "warning" | "error" | "info" | "primary"
 * - icon: React Icon component (optional)
 * - trend: "up" | "down" (optional)
 * - subtitle: Text phụ (optional)
 */
function StatCard({
  title,
  value,
  color = "primary",
  icon: Icon,
  trend,
  subtitle,
}) {
  const colorMap = {
    success: "#4caf50",
    warning: "#ff9800",
    error: "#f44336",
    info: "#2196f3",
    primary: "#1976d2",
  };

  const bgColorMap = {
    success: "#e8f5e9",
    warning: "#fff3e0",
    error: "#ffebee",
    info: "#e3f2fd",
    primary: "#e3f2fd",
  };

  return (
    <Card
      sx={{
        height: "100%",
        borderLeft: 4,
        borderColor: colorMap[color] || colorMap.primary,
        transition: "all 0.3s",
        "&:hover": {
          boxShadow: 6,
          transform: "translateY(-4px)",
        },
      }}
    >
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box flex={1}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>

            <Typography variant="h3" fontWeight="bold" color={colorMap[color]}>
              {value}
            </Typography>

            {subtitle && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          {Icon && (
            <Box
              sx={{
                backgroundColor: bgColorMap[color] || bgColorMap.primary,
                borderRadius: 2,
                p: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon sx={{ fontSize: 32, color: colorMap[color] }} />
            </Box>
          )}
        </Box>

        {trend && (
          <Box display="flex" alignItems="center" mt={1}>
            {trend === "up" ? (
              <TrendingUpIcon
                sx={{ fontSize: 16, color: "success.main", mr: 0.5 }}
              />
            ) : (
              <TrendingDownIcon
                sx={{ fontSize: 16, color: "error.main", mr: 0.5 }}
              />
            )}
            <Typography
              variant="caption"
              color={trend === "up" ? "success.main" : "error.main"}
            >
              So với tháng trước
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default StatCard;
