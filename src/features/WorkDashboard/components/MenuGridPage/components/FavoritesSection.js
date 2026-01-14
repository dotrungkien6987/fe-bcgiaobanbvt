import React from "react";
import { Box, Typography, Grid, Chip, useTheme } from "@mui/material";
import { Star, History } from "@mui/icons-material";
import { motion } from "framer-motion";
import MenuItem from "./MenuItem";

/**
 * FavoritesSection Component
 *
 * Hiển thị starred items và recent items ở đầu menu
 */
function FavoritesSection({
  favoriteItems,
  recentItems,
  favorites,
  onToggleFavorite,
  onItemClick,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Don't render if no favorites and no recent items
  if (favoriteItems.length === 0 && recentItems.length === 0) {
    return null;
  }

  // Container animation
  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <Box sx={{ mb: 4 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2,
            pb: 1,
            borderBottom: "2px solid",
            borderColor: "primary.main",
          }}
        >
          <Star sx={{ color: "warning.main", fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Yêu Thích & Gần Đây
          </Typography>
        </Box>

        {/* Favorite Items */}
        {favoriteItems.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="caption"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                mb: 1,
                fontWeight: 600,
                color: "text.secondary",
              }}
            >
              <Star sx={{ fontSize: 14, color: "warning.main" }} />
              YÊU THÍCH ({favoriteItems.length})
            </Typography>
            <Grid container spacing={2}>
              {favoriteItems.map((item) => (
                <Grid item xs={6} sm={4} md={3} lg={2} key={item.id}>
                  <motion.div variants={itemVariants}>
                    <MenuItem
                      item={item}
                      onClick={() => onItemClick(item.path, item)}
                      isFavorite={true}
                      onToggleFavorite={onToggleFavorite}
                    />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Recent Items */}
        {recentItems.length > 0 && (
          <Box>
            <Typography
              variant="caption"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                mb: 1,
                fontWeight: 600,
                color: "text.secondary",
              }}
            >
              <History sx={{ fontSize: 14 }} />
              GẦN ĐÂY ({recentItems.length})
            </Typography>
            <Grid container spacing={2}>
              {recentItems
                .filter((item) => !favorites.includes(item.id)) // Don't show items already in favorites
                .map((item) => (
                  <Grid item xs={6} sm={4} md={3} lg={2} key={item.id}>
                    <motion.div variants={itemVariants}>
                      <Box sx={{ position: "relative" }}>
                        {/* Recent Badge */}
                        <Chip
                          icon={<History sx={{ fontSize: 12 }} />}
                          label="Gần đây"
                          size="small"
                          sx={{
                            position: "absolute",
                            top: -8,
                            left: 8,
                            zIndex: 3,
                            height: 20,
                            fontSize: "0.65rem",
                            fontWeight: 600,
                            backgroundColor: isDark
                              ? "info.dark"
                              : "info.light",
                            color: isDark ? "info.contrastText" : "info.dark",
                            "& .MuiChip-icon": {
                              fontSize: 12,
                            },
                          }}
                        />
                        <MenuItem
                          item={item}
                          onClick={() => onItemClick(item.path, item)}
                          isFavorite={favorites.includes(item.id)}
                          onToggleFavorite={onToggleFavorite}
                        />
                      </Box>
                    </motion.div>
                  </Grid>
                ))}
            </Grid>
          </Box>
        )}
      </Box>
    </motion.div>
  );
}

export default React.memo(FavoritesSection, (prev, next) => {
  return (
    prev.favoriteItems.length === next.favoriteItems.length &&
    prev.recentItems.length === next.recentItems.length &&
    prev.favorites.length === next.favorites.length
  );
});
