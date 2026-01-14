import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "menu_recent_items_v1";
const MAX_RECENT = 5;
const EXPIRY_DAYS = 7;

/**
 * Hook để track recent menu items
 * Lưu trữ trong localStorage với timestamp
 */
export function useRecentItems() {
  const [recentItems, setRecentItems] = useState([]);

  // Load recent items từ localStorage khi mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const now = Date.now();

        // Filter out expired items
        const validItems = parsed.filter(
          (item) =>
            item.timestamp &&
            now - item.timestamp < EXPIRY_DAYS * 24 * 60 * 60 * 1000
        );

        setRecentItems(validItems);

        // Update storage if items were filtered
        if (validItems.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(validItems));
        }
      }
    } catch (error) {
      console.error("Failed to load recent items:", error);
      setRecentItems([]);
    }
  }, []);

  // Track a new item visit
  const trackItem = useCallback((item) => {
    setRecentItems((prev) => {
      // Remove item if it already exists
      const filtered = prev.filter((i) => i.id !== item.id);

      // Add new item with timestamp at beginning
      // NOTE: Don't store icon - it's a React component and can't be serialized
      const newRecent = [
        {
          id: item.id,
          label: item.label,
          description: item.description,
          path: item.path,
          timestamp: Date.now(),
        },
        ...filtered,
      ].slice(0, MAX_RECENT); // Keep only MAX_RECENT items

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecent));
      } catch (error) {
        console.error("Failed to save recent items:", error);
      }

      return newRecent;
    });
  }, []);

  // Clear all recent items
  const clearRecent = useCallback(() => {
    setRecentItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear recent items:", error);
    }
  }, []);

  return {
    recentItems,
    trackItem,
    clearRecent,
  };
}
