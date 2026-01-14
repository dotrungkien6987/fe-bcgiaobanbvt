import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Grid,
  useTheme,
} from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import MenuItem from "./MenuItem";

/**
 * MenuSection Component với Spring Animations
 *
 * Features:
 * - Gradient header background
 * - Spring physics collapse/expand
 * - Stagger children animation
 * - Hover effects on header
 */
function MenuSection({
  section,
  expanded,
  onToggle,
  items,
  favorites,
  onToggleFavorite,
  onItemClick,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const SectionIconComponent = section.icon;

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05, // 50ms delay between items
      },
    },
  };

  // Item animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* Section Header with Gradient */}
      <Box
        onClick={onToggle}
        role="button"
        aria-expanded={expanded}
        aria-controls={`section-${section.id}`}
        aria-label={`${section.title}, ${items.length} items`}
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          p: 1.5,
          cursor: "pointer",
          borderRadius: 2,

          // Gradient background
          background: isDark
            ? `linear-gradient(135deg, ${section.color}60, ${section.color}30)`
            : `linear-gradient(135deg, ${section.color}DD, ${section.color}55)`,
          backdropFilter: "blur(10px)",

          transition: "all 0.3s ease",

          "&:hover": {
            background: isDark
              ? `linear-gradient(135deg, ${section.color}80, ${section.color}50)`
              : `linear-gradient(135deg, ${section.color}FF, ${section.color}77)`,
            transform: "translateX(4px)",
            boxShadow: isDark
              ? `0 4px 20px 0 ${section.color}40`
              : `0 4px 20px 0 ${section.color}60`,
          },

          "&:focus-visible": {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: 2,
          },
        }}
      >
        {/* Left side: Icon + Title + Count */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {/* Section Icon */}
          <Box
            sx={{
              color: isDark ? "#fff" : "#000",
              display: "flex",
              alignItems: "center",
              "& > svg": {
                fontSize: 24,
                filter: isDark
                  ? "drop-shadow(0 0 8px rgba(255,255,255,0.3))"
                  : "none",
              },
            }}
          >
            {SectionIconComponent && <SectionIconComponent />}
          </Box>

          {/* Title */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: isDark ? "#fff" : "#000",
              textShadow: isDark ? "0 2px 8px rgba(0,0,0,0.5)" : "none",
            }}
          >
            {section.title}
          </Typography>

          {/* Item Count Chip */}
          <Chip
            label={items.length}
            size="small"
            sx={{
              height: 20,
              fontSize: "0.75rem",
              fontWeight: 600,
              backgroundColor: isDark
                ? "rgba(255,255,255,0.2)"
                : "rgba(0,0,0,0.1)",
              color: isDark ? "#fff" : "#000",
              "& .MuiChip-label": {
                px: 1,
              },
            }}
          />
        </Box>

        {/* Right side: Expand/Collapse Icon */}
        <IconButton
          size="small"
          sx={{
            color: isDark ? "#fff" : "#000",
            transform: expanded ? "rotate(0deg)" : "rotate(0deg)",
            transition: "transform 0.3s",
          }}
        >
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      {/* Animated Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            id={`section-${section.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              opacity: { duration: 0.2 },
            }}
            style={{ overflow: "hidden" }}
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <Grid container spacing={2}>
                {items.map((item, index) => (
                  <Grid item xs={6} sm={4} md={3} lg={2} key={item.id}>
                    <motion.div variants={itemVariants}>
                      <MenuItem
                        item={item}
                        onClick={() => onItemClick(item.path, item)}
                        isFavorite={favorites.includes(item.id)}
                        onToggleFavorite={onToggleFavorite}
                      />
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}

export default React.memo(MenuSection, (prev, next) => {
  return (
    prev.section.id === next.section.id &&
    prev.expanded === next.expanded &&
    prev.items.length === next.items.length &&
    prev.favorites.length === next.favorites.length
  );
});
