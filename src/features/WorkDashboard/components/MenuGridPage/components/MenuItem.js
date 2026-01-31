import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  useTheme,
  Chip,
} from "@mui/material";
import {
  Star,
  StarBorder,
  Dashboard as DefaultIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";

const MotionCard = motion(Card);

/**
 * Render icon dynamically - supports both MUI icons and iconsax-react icons
 *
 * @param {Component|null} icon - Icon component (MUI or iconsax)
 * @param {number} size - Icon size in pixels
 * @returns {ReactElement} Rendered icon
 */
function renderIcon(icon, size = 20) {
  if (!icon) {
    return <DefaultIcon sx={{ fontSize: size }} />;
  }

  // If it's a React component function (MUI or iconsax)
  if (typeof icon === "function") {
    const IconComponent = icon;

    // Check if it's an iconsax icon (they accept 'size' prop)
    // iconsax icons are functional components that accept size as number
    try {
      // Try to render with iconsax style (size prop)
      return <IconComponent size={size} variant="Bold" />;
    } catch {
      // Fallback to MUI style (sx prop)
      return <IconComponent sx={{ fontSize: size }} />;
    }
  }

  // If it's already a React element
  if (React.isValidElement(icon)) {
    return React.cloneElement(icon, { size, sx: { fontSize: size } });
  }

  // Fallback
  return <DefaultIcon sx={{ fontSize: size }} />;
}

/**
 * MenuItem Component với Glassmorphism & Animations
 *
 * Features:
 * - Glassmorphism effect (backdrop blur)
 * - Hover animations (scale + lift)
 * - Tap animation
 * - Star favorite button
 * - Dark mode support
 * - Support both MUI and iconsax-react icons
 */
function MenuItem({ item, onClick, isFavorite, onToggleFavorite }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const handleStarClick = (e) => {
    e.stopPropagation();
    onToggleFavorite(item.id);
  };

  return (
    <MotionCard
      whileHover={{
        scale: 1.05,
        y: -4,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${item.label}: ${item.description}`}
      onKeyPress={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      sx={{
        height: "100%",
        position: "relative",
        cursor: "pointer",
        border: "1px solid",
        borderRadius: 2,
        overflow: "visible",

        // Glassmorphism effect
        background: isDark
          ? "rgba(30, 30, 30, 0.7)"
          : "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(10px)",
        borderColor: isDark
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(0, 0, 0, 0.08)",
        boxShadow: isDark
          ? "0 8px 32px 0 rgba(0, 0, 0, 0.37)"
          : "0 8px 32px 0 rgba(31, 38, 135, 0.15)",

        transition: "all 0.3s ease",

        "&:hover": {
          background: isDark
            ? "rgba(50, 50, 50, 0.8)"
            : "rgba(255, 255, 255, 0.9)",
          borderColor: theme.palette.primary.main,
          boxShadow: isDark
            ? `0 12px 40px 0 rgba(0, 0, 0, 0.5), 0 0 0 1px ${theme.palette.primary.main}40`
            : `0 12px 40px 0 rgba(31, 38, 135, 0.25), 0 0 0 1px ${theme.palette.primary.main}40`,
        },

        "&:focus-visible": {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
      }}
    >
      {/* Favorite Star Button */}
      <IconButton
        size="small"
        onClick={handleStarClick}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        sx={{
          position: "absolute",
          top: 4,
          right: 4,
          zIndex: 2,
          padding: 0.5,
          transition: "all 0.2s",
          "&:hover": {
            transform: "scale(1.2) rotate(15deg)",
            backgroundColor: "transparent",
          },
        }}
      >
        {isFavorite ? (
          <Star sx={{ fontSize: 18, color: "warning.main" }} />
        ) : (
          <StarBorder sx={{ fontSize: 18, color: "text.secondary" }} />
        )}
      </IconButton>

      <CardContent sx={{ p: 1.5, pb: "12px !important" }}>
        {/* Icon & Label */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 0.5,
            pr: 2, // Space for star button
          }}
        >
          <Box
            sx={{
              color: "primary.main",
              mr: 1,
              display: "flex",
              alignItems: "center",
              "& > svg": {
                fontSize: 20,
              },
            }}
          >
            {renderIcon(item.icon, 20)}
          </Box>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              fontSize: "0.875rem",
              flex: 1,
              wordWrap: "break-word",
              lineHeight: 1.3,
            }}
          >
            {item.label}
          </Typography>
          {/* Chip badge (e.g., "MỚI") */}
          {item.chip && (
            <Chip
              label={item.chip.label}
              color={item.chip.color || "primary"}
              size="small"
              sx={{
                height: 18,
                fontSize: "0.65rem",
                ml: 0.5,
              }}
            />
          )}
        </Box>

        {/* Description */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {item.description}
        </Typography>
      </CardContent>
    </MotionCard>
  );
}

export default React.memo(MenuItem, (prev, next) => {
  return prev.item.id === next.item.id && prev.isFavorite === next.isFavorite;
});
