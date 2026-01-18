/**
 * DashboardMetricSection Component
 *
 * Section hiển thị metrics từ badge counts
 * Mobile: 2x2 grid cards
 * Desktop: 4 columns inline
 *
 * Props:
 * - title: string - Section title (e.g., "📤 Yêu cầu tôi gửi")
 * - icon: ReactNode - Section header icon (optional)
 * - metrics: Array<{ key, label, value, color?, urgent? }>
 * - onNavigate: () => void - Click header to navigate
 * - loading: boolean
 */
import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Skeleton,
  Stack,
} from "@mui/material";
import {
  ArrowForwardIos as NavigateIcon,
  Warning as UrgentIcon,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";

export default function DashboardMetricSection({
  title,
  icon,
  metrics = [],
  onNavigate,
  loading = false,
}) {
  // Color mapping
  const getColor = (color) => {
    const colorMap = {
      info: "info.main",
      warning: "warning.main",
      success: "success.main",
      error: "error.main",
      default: "text.secondary",
      primary: "primary.main",
    };
    return colorMap[color] || "primary.main";
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* Section Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          mb: 1.5,
          cursor: onNavigate ? "pointer" : "default",
          "&:hover": onNavigate
            ? {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                borderRadius: 1.5,
              }
            : {},
          px: { xs: 2, md: 0 },
          py: 1,
          borderRadius: 1.5,
          transition: "all 0.2s ease",
        }}
        onClick={onNavigate}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          {icon}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: { xs: "1rem", sm: "1.125rem" },
            }}
          >
            {title}
          </Typography>
        </Stack>
        {onNavigate && (
          <NavigateIcon
            sx={{
              fontSize: 16,
              color: "primary.main",
              transition: "transform 0.2s",
              ".MuiStack-root:hover &": {
                transform: "translateX(4px)",
              },
            }}
          />
        )}
      </Stack>

      {/* Metrics Grid */}
      {loading ? (
        <Grid container spacing={1.5}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={6} sm={6} md={3} key={i}>
              <Skeleton
                variant="rectangular"
                height={100}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={1.5}>
          {metrics.map((metric) => (
            <Grid item xs={6} sm={6} md={3} key={metric.key}>
              <Card
                onClick={metric.onClick}
                sx={{
                  height: "100%",
                  borderRadius: 2,
                  boxShadow: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  transition: "all 0.2s",
                  cursor: metric.onClick ? "pointer" : "default",
                  "&:hover": {
                    boxShadow: 3,
                    transform: metric.onClick ? "translateY(-2px)" : "none",
                  },
                  // Urgent highlight
                  ...(metric.urgent && {
                    borderColor: "error.main",
                    bgcolor: (theme) => alpha(theme.palette.error.main, 0.05),
                  }),
                }}
              >
                <CardContent
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    "&:last-child": { pb: { xs: 1.5, sm: 2 } },
                  }}
                >
                  <Stack spacing={1}>
                    {/* Label with urgent icon */}
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          fontWeight: 500,
                        }}
                      >
                        {metric.label}
                      </Typography>
                      {metric.urgent && (
                        <UrgentIcon
                          sx={{
                            fontSize: 16,
                            color: "error.main",
                          }}
                        />
                      )}
                    </Stack>

                    {/* Value */}
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: "1.75rem", sm: "2rem" },
                        color: getColor(metric.color),
                      }}
                    >
                      {metric.value ?? 0}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
