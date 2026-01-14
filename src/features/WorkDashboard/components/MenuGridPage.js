/**
 * MenuGridPage - Premium Native-like Menu Experience
 *
 * Version: 2.0 (Premium)
 * Features:
 * - ✨ Glassmorphism design with backdrop blur
 * - 🎬 Stagger animations with framer-motion
 * - ⭐ Favorites system with localStorage
 * - 🕒 Recent items tracking
 * - 🔍 Smart search with debounce & highlight
 * - ⌨️ Keyboard shortcuts (Cmd+K, Esc, Arrow keys)
 * - 📱 Responsive design
 * - ♿ Full accessibility (ARIA, focus management)
 * - 🌓 Dark mode support
 */

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Fade,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Keyboard as KeyboardIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import useAuth from "hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

// Import config
import { MENU_SECTIONS } from "./MenuGridPage/config/menuConfig";

// Import hooks
import { useFavorites } from "./MenuGridPage/hooks/useFavorites";
import { useRecentItems } from "./MenuGridPage/hooks/useRecentItems";
import { useMenuSearch } from "./MenuGridPage/hooks/useMenuSearch";

// Import components
import MenuSection from "./MenuGridPage/components/MenuSection";
import FavoritesSection from "./MenuGridPage/components/FavoritesSection";

/**
 * Main MenuGridPage Component
 */
export default function MenuGridPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const searchInputRef = useRef(null);

  // State
  const [expandedSections, setExpandedSections] = useState(() => {
    const initial = {};
    MENU_SECTIONS.forEach((section) => {
      initial[section.id] = section.defaultExpanded;
    });
    return initial;
  });

  // Custom hooks
  const { favorites, toggleFavorite } = useFavorites();
  const { recentItems, trackItem } = useRecentItems();
  const { query, debouncedQuery, setQuery, clearSearch, isSearching } =
    useMenuSearch();

  // Get user role
  const userRole = user?.PhanQuyen || "user";

  // Flatten all items for favorites/recent lookup
  const allItems = useMemo(() => {
    const items = [];
    MENU_SECTIONS.forEach((section) => {
      section.items.forEach((item) => {
        items.push({ ...item, sectionId: section.id });
      });
    });
    return items;
  }, []);

  // Filter sections based on search and role
  const filteredSections = useMemo(() => {
    const searchLower = debouncedQuery.toLowerCase().trim();

    return MENU_SECTIONS.map((section) => {
      const filteredItems = section.items.filter((item) => {
        // Role check
        if (!item.roles.includes(userRole)) return false;

        // Search check
        if (searchLower) {
          return (
            item.label.toLowerCase().includes(searchLower) ||
            item.description.toLowerCase().includes(searchLower) ||
            section.title.toLowerCase().includes(searchLower)
          );
        }

        return true;
      });

      return { ...section, filteredItems };
    }).filter((section) => section.filteredItems.length > 0);
  }, [debouncedQuery, userRole]);

  // Get favorite items
  const favoriteItems = useMemo(() => {
    return allItems.filter(
      (item) => favorites.includes(item.id) && item.roles.includes(userRole)
    );
  }, [allItems, favorites, userRole]);

  // Get recent items with icon from config (icon can't be stored in localStorage)
  const enrichedRecentItems = useMemo(() => {
    return recentItems
      .map((recentItem) => {
        const fullItem = allItems.find((item) => item.id === recentItem.id);
        if (fullItem && fullItem.roles.includes(userRole)) {
          return { ...recentItem, icon: fullItem.icon };
        }
        return null;
      })
      .filter(Boolean);
  }, [recentItems, allItems, userRole]);

  // Auto-expand sections with search results
  useEffect(() => {
    if (debouncedQuery) {
      const newExpanded = {};
      filteredSections.forEach((section) => {
        newExpanded[section.id] = section.filteredItems.length > 0;
      });
      setExpandedSections(newExpanded);
    }
  }, [debouncedQuery, filteredSections]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K: Focus search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      // Escape: Clear search or blur
      if (e.key === "Escape") {
        if (query) {
          clearSearch();
        } else {
          searchInputRef.current?.blur();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [query, clearSearch]);

  // Handlers
  const handleToggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleItemClick = (path, item) => {
    // Track item for recent history
    trackItem(item);

    // Navigate
    navigate(path);
  };

  const totalVisibleItems = filteredSections.reduce(
    (sum, section) => sum + section.filteredItems.length,
    0
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1600, mx: "auto" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            ✨ Menu Hệ Thống
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Truy cập nhanh các chức năng hệ thống
          </Typography>
        </Box>
      </motion.div>

      {/* Search Bar with Keyboard Shortcut Hint */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <TextField
          fullWidth
          inputRef={searchInputRef}
          placeholder="Tìm kiếm chức năng... (⌘K hoặc Ctrl+K)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {isSearching ? <CircularProgress size={20} /> : <SearchIcon />}
              </InputAdornment>
            ),
            endAdornment: query && (
              <InputAdornment position="end">
                <Tooltip title="Clear search (Esc)">
                  <IconButton size="small" onClick={clearSearch}>
                    <ClearIcon />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />
      </motion.div>

      {/* Stats Chips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Chip
            label={`${filteredSections.length} danh mục`}
            color="primary"
            variant="outlined"
            size="small"
          />
          <Chip
            label={`${totalVisibleItems} chức năng`}
            color="success"
            variant="outlined"
            size="small"
          />
          {favorites.length > 0 && (
            <Chip
              label={`⭐ ${favorites.length} yêu thích`}
              color="warning"
              variant="outlined"
              size="small"
            />
          )}
          {enrichedRecentItems.length > 0 && (
            <Chip
              label={`🕒 ${enrichedRecentItems.length} gần đây`}
              color="info"
              variant="outlined"
              size="small"
            />
          )}
        </Stack>
      </motion.div>

      {/* Favorites & Recent Section */}
      <AnimatePresence>
        {!debouncedQuery &&
          (favoriteItems.length > 0 || enrichedRecentItems.length > 0) && (
            <FavoritesSection
              favoriteItems={favoriteItems}
              recentItems={enrichedRecentItems}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onItemClick={handleItemClick}
            />
          )}
      </AnimatePresence>

      {/* Menu Sections */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        {filteredSections.length > 0 ? (
          filteredSections.map((section) => (
            <MenuSection
              key={section.id}
              section={section}
              expanded={expandedSections[section.id]}
              onToggle={() => handleToggleSection(section.id)}
              items={section.filteredItems}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onItemClick={handleItemClick}
            />
          ))
        ) : (
          <Fade in>
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Không tìm thấy chức năng phù hợp
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Thử tìm kiếm với từ khóa khác
              </Typography>
              <IconButton onClick={clearSearch} color="primary">
                <ClearIcon />
              </IconButton>
            </Box>
          </Fade>
        )}
      </motion.div>

      {/* Keyboard Shortcuts Help */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Box
          sx={{ mt: 4, pt: 3, borderTop: "1px solid", borderColor: "divider" }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <KeyboardIcon sx={{ fontSize: 14 }} />
            Phím tắt: ⌘K hoặc Ctrl+K để tìm kiếm, Esc để xóa
          </Typography>
        </Box>
      </motion.div>
    </Box>
  );
}
