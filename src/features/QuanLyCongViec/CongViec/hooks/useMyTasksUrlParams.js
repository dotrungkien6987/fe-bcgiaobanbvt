import { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setFilters } from "../congViecSlice";

// Valid status list (constant outside component)
const VALID_STATUSES = [
  "ALL",
  "DA_GIAO",
  "DANG_THUC_HIEN",
  "CHO_DUYET",
  "HOAN_THANH",
  "TU_CHOI",
  "HUY",
];

/**
 * Custom hook to sync status tab with URL query params
 *
 * Features:
 * - Read status from URL (?status=DANG_LAM)
 * - Write status to URL when tab changes
 * - Sync status to Redux filters
 * - Browser back/forward navigation support
 * - Deep linking support
 *
 * @returns {Object} { status, updateStatus }
 *
 * @example
 * const { status, updateStatus } = useMyTasksUrlParams();
 * // status = 'ALL' | 'DA_GIAO' | 'DANG_LAM' | 'CHO_DUYET'
 * // updateStatus('DANG_LAM') -> URL becomes ?status=DANG_LAM
 */
function useMyTasksUrlParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  // Read status from URL (default to 'ALL' if not present)
  const status = searchParams.get("status") || "ALL";

  // Validate status (fallback to ALL if invalid)
  const validatedStatus = VALID_STATUSES.includes(status) ? status : "ALL";

  // Write status to URL
  const updateStatus = useCallback(
    (newStatus) => {
      // Validate new status
      if (!VALID_STATUSES.includes(newStatus)) {
        console.warn(`Invalid status: ${newStatus}. Defaulting to ALL.`);
        newStatus = "ALL";
      }

      // Update URL params
      const newParams = new URLSearchParams(searchParams);

      if (newStatus === "ALL") {
        // Remove status param for 'ALL' to keep URL clean
        newParams.delete("status");
      } else {
        newParams.set("status", newStatus);
      }

      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  // Sync status to Redux when URL changes
  useEffect(() => {
    // Dispatch filter update to Redux
    // TrangThai filter: empty string for ALL, status value for specific status
    dispatch(
      setFilters({
        tab: "received", // MyTasksPage uses "received" tab
        filters: {
          TrangThai: validatedStatus === "ALL" ? "" : validatedStatus,
        },
      })
    );
  }, [validatedStatus, dispatch]);

  return {
    status: validatedStatus,
    updateStatus,
  };
}

export default useMyTasksUrlParams;
