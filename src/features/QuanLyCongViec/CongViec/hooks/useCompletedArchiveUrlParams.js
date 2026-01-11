import { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  setArchiveTab,
  setArchivePage,
  setArchiveRowsPerPage,
} from "../congViecSlice";

/**
 * Custom hook to sync archive tab, pagination with URL query params
 *
 * Features:
 * - Read tab from URL (?tab=my-completed | team-completed)
 * - Read pagination params (?page=2&rowsPerPage=20)
 * - Write params to URL when user changes tab/page
 * - Browser back/forward navigation support
 * - Deep linking support with all params preserved
 * - Clean URLs (remove default values)
 *
 * @returns {Object} { tab, page, rowsPerPage, updateTab, updatePage, updateRowsPerPage }
 *
 * @example
 * const { tab, updateTab } = useCompletedArchiveUrlParams();
 * updateTab('team-completed'); // URL becomes ?tab=team-completed
 */
function useCompletedArchiveUrlParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  // Valid values
  const VALID_TABS = ["my-completed", "team-completed"];
  const ALLOWED_ROWS_PER_PAGE = [5, 10, 20, 50, 100];

  // Read params from URL with defaults
  const tab = searchParams.get("tab") || "my-completed";
  const page = parseInt(searchParams.get("page") || "0", 10);
  const rowsPerPage = parseInt(searchParams.get("rowsPerPage") || "10", 10);

  // Validate tab
  const validatedTab = VALID_TABS.includes(tab) ? tab : "my-completed";

  // Validate page (must be >= 0)
  const validatedPage = page >= 0 ? page : 0;

  // Validate rowsPerPage
  const validatedRowsPerPage = ALLOWED_ROWS_PER_PAGE.includes(rowsPerPage)
    ? rowsPerPage
    : 10;

  // Helper to update URL params (clean - remove defaults)
  const updateUrlParams = useCallback(
    (updates) => {
      const newParams = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        // Remove param if it's default value (clean URL)
        if (
          value === null ||
          value === undefined ||
          (key === "tab" && value === "my-completed") ||
          (key === "page" && value === 0) ||
          (key === "rowsPerPage" && value === 10)
        ) {
          newParams.delete(key);
        } else {
          newParams.set(key, String(value));
        }
      });

      setSearchParams(newParams, { replace: false }); // Create new history entry
    },
    [searchParams, setSearchParams]
  );

  // Update tab (reset to page 0)
  const updateTab = useCallback(
    (newTab) => {
      if (!VALID_TABS.includes(newTab)) {
        console.warn(`Invalid tab: ${newTab}. Defaulting to my-completed.`);
        newTab = "my-completed";
      }
      updateUrlParams({ tab: newTab, page: 0 }); // Reset page when changing tab
    },
    [updateUrlParams]
  );

  // Update page
  const updatePage = useCallback(
    (newPage) => {
      const validPage = Math.max(0, newPage);
      updateUrlParams({ page: validPage });
    },
    [updateUrlParams]
  );

  // Update rows per page (reset to page 0)
  const updateRowsPerPage = useCallback(
    (newRowsPerPage) => {
      const validRowsPerPage = ALLOWED_ROWS_PER_PAGE.includes(newRowsPerPage)
        ? newRowsPerPage
        : 10;
      updateUrlParams({ rowsPerPage: validRowsPerPage, page: 0 }); // Reset page
    },
    [updateUrlParams]
  );

  // Sync URL params to Redux on mount and when URL changes
  useEffect(() => {
    // Dispatch tab change
    dispatch(setArchiveTab(validatedTab));

    // Dispatch page change for current tab
    dispatch(setArchivePage({ tab: validatedTab, page: validatedPage }));

    // Dispatch rows per page change for current tab
    dispatch(
      setArchiveRowsPerPage({
        tab: validatedTab,
        rowsPerPage: validatedRowsPerPage,
      })
    );
  }, [validatedTab, validatedPage, validatedRowsPerPage, dispatch]);

  return {
    tab: validatedTab,
    page: validatedPage,
    rowsPerPage: validatedRowsPerPage,
    updateTab,
    updatePage,
    updateRowsPerPage,
  };
}

export default useCompletedArchiveUrlParams;
