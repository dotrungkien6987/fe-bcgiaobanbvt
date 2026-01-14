import { useState, useMemo, useCallback, useEffect } from "react";
import { debounce } from "lodash";

/**
 * Hook để xử lý search với debounce và highlight
 */
export function useMenuSearch(delay = 300) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounced function để update debouncedQuery
  const debouncedSetQuery = useMemo(
    () =>
      debounce((value) => {
        setDebouncedQuery(value);
      }, delay),
    [delay]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSetQuery.cancel();
    };
  }, [debouncedSetQuery]);

  // Handle query change
  const handleQueryChange = useCallback(
    (value) => {
      setQuery(value);
      debouncedSetQuery(value);
    },
    [debouncedSetQuery]
  );

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
    debouncedSetQuery.cancel();
  }, [debouncedSetQuery]);

  // Check if currently typing (debounce in progress)
  const isSearching = query !== debouncedQuery;

  return {
    query,
    debouncedQuery,
    setQuery: handleQueryChange,
    clearSearch,
    isSearching,
  };
}
