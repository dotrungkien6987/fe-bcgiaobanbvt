import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "menu_favorites_v1";

/**
 * Hook để quản lý favorites menu items
 * Lưu trữ trong localStorage
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState([]);

  // Load favorites từ localStorage khi mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFavorites(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error("Failed to load favorites:", error);
      setFavorites([]);
    }
  }, []);

  // Toggle favorite status của một item
  const toggleFavorite = useCallback((itemId) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId];

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
      } catch (error) {
        console.error("Failed to save favorites:", error);
      }

      return newFavorites;
    });
  }, []);

  // Check if item is favorited
  const isFavorite = useCallback(
    (itemId) => {
      return favorites.includes(itemId);
    },
    [favorites]
  );

  // Clear all favorites
  const clearFavorites = useCallback(() => {
    setFavorites([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear favorites:", error);
    }
  }, []);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
  };
}
