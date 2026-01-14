import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
  useTheme,
  alpha,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

/**
 * SummaryCard - Reusable dashboard card component
 *
 * @param {string} title - Card title
 * @param {React.ReactNode} icon - Icon component
 * @param {Array} stats - Array of {label, value, color?}
 * @param {string} variant - 'compact' | 'detailed'
 * @param {string} color - Primary color (hex or theme color)
 * @param {string} navigateTo - Route path to navigate on click
 * @param {boolean} loading - Show loading skeleton
 * @param {string} subtitle - Optional subtitle below title
 */
function SummaryCard({
  title,
  icon,
  stats = [],
  variant = "compact",
  color = "primary",
  navigateTo,
  loading = false,
  subtitle,
}) {
  const theme = useTheme();
  const navigate = useNavigate();

  // Resolve color from theme if needed
  const resolvedColor =
    color && color.startsWith("#")
      ? color
      : theme.palette[color]?.main || theme.palette.primary.main;

  const handleClick = () => {
    if (navigateTo) {
      navigate(navigateTo);
    }
  };

  if (loading) {
    return (
      <Card
        sx={{
          height: "100%",
          cursor: navigateTo ? "pointer" : "default",
          transition: "all 0.3s ease",
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Skeleton
              variant="circular"
              width={40}
              height={40}
              sx={{ mr: 2 }}
            />
            <Skeleton variant="text" width="60%" height={32} />
          </Box>
          {variant === "compact" ? (
            <>
              <Skeleton variant="text" width="40%" height={40} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="50%" height={24} />
            </>
          ) : (
            <>
              <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
              <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
              <Skeleton variant="rectangular" height={60} />
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      onClick={handleClick}
      sx={{
        height: "100%",
        cursor: navigateTo ? "pointer" : "default",
        transition: "all 0.3s ease",
        "&:hover": navigateTo && {
          transform: "translateY(-4px)",
          boxShadow: theme.shadows[8],
        },
        borderLeft: `4px solid ${resolvedColor}`,
      }}
    >
      <CardContent>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={2}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: 2,
              backgroundColor: alpha(resolvedColor, 0.1),
              color: resolvedColor,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Box flexGrow={1}>
            <Typography variant="h6" fontWeight={600}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Stats */}
        {variant === "compact" ? (
          // Compact mode: Show main stat prominently
          <Box>
            {stats[0] && (
              <>
                <Typography variant="h3" fontWeight={700} color={resolvedColor}>
                  {stats[0].value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stats[0].label}
                </Typography>
              </>
            )}
            {stats.length > 1 && (
              <Box mt={1} display="flex" gap={2}>
                {stats.slice(1).map((stat, index) => (
                  <Box key={index}>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      color={stat.color || "text.primary"}
                    >
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        ) : (
          // Detailed mode: Show all stats in rows
          <Box display="flex" flexDirection="column" gap={1.5}>
            {stats.map((stat, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                p={1.5}
                sx={{
                  backgroundColor: alpha(stat.color || resolvedColor, 0.05),
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" fontWeight={500}>
                  {stat.label}
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  color={stat.color || resolvedColor}
                >
                  {stat.value}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default SummaryCard;
