import React from "react";
import { fetchTapSanNhanVienOptions } from "../services/nhanVienOptions.api";
import useDebounce from "hooks/useDebounce";

export default function useTapSanNhanVienOptions({
  enabled = true,
  limit = 1000,
  search = "",
  debounceMs = 300,
  initialOptions = [],
} = {}) {
  const debouncedSearch = useDebounce(String(search || "").trim(), debounceMs);
  const [nhanVienOptions, setNhanVienOptions] = React.useState([]);
  const [cachedOptions, setCachedOptions] = React.useState(initialOptions);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const requestIdRef = React.useRef(0);

  const mergeOptions = React.useCallback((currentItems, incomingItems) => {
    const byId = new Map((currentItems || []).map((item) => [item._id, item]));
    (incomingItems || []).forEach((item) => {
      if (item?._id) {
        byId.set(item._id, item);
      }
    });
    return Array.from(byId.values());
  }, []);

  React.useEffect(() => {
    if (initialOptions?.length) {
      setCachedOptions((prev) => mergeOptions(prev, initialOptions));
    }
  }, [initialOptions, mergeOptions]);

  const loadOptions = React.useCallback(async () => {
    if (!enabled) return [];
    const currentRequestId = requestIdRef.current + 1;
    requestIdRef.current = currentRequestId;

    try {
      setLoading(true);
      setError(null);
      const items = await fetchTapSanNhanVienOptions({
        limit,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      });
      if (requestIdRef.current !== currentRequestId) {
        return items;
      }
      setNhanVienOptions(items);
      setCachedOptions((prev) => mergeOptions(prev, items));
      return items;
    } catch (loadError) {
      if (requestIdRef.current !== currentRequestId) {
        return [];
      }
      setError(loadError);
      setNhanVienOptions([]);
      return [];
    } finally {
      if (requestIdRef.current === currentRequestId) {
        setLoading(false);
      }
    }
  }, [debouncedSearch, enabled, limit, mergeOptions]);

  React.useEffect(() => {
    if (enabled) {
      loadOptions();
    }
  }, [enabled, loadOptions]);

  const nhanVienById = React.useMemo(
    () => new Map(cachedOptions.map((item) => [item._id, item])),
    [cachedOptions],
  );

  return {
    nhanVienOptions,
    nhanVienById,
    debouncedSearch,
    isSearching: String(search || "").trim() !== debouncedSearch,
    loading,
    error,
    reload: loadOptions,
  };
}
