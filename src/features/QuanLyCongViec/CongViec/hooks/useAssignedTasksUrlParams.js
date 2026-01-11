import { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setFilters } from "../congViecSlice";

// Valid status list for Manager View (5 statuses)
const VALID_STATUSES = [
  "ALL",
  "TAO_MOI", // Chưa giao
  "DA_GIAO", // Đã giao
  "DANG_THUC_HIEN", // Đang làm
  "CHO_DUYET", // Chờ tôi duyệt
  "HOAN_THANH", // Hoàn thành
];

/**
 * Custom hook to sync status tab with URL query params for Manager View
 *
 * Features:
 * - Read status from URL (?status=TAO_MOI)
 * - Write status to URL when tab changes
 * - Sync status to Redux filters (assigned tab)
 * - Browser back/forward navigation support
 * - Deep linking support
 * - Supports 5 status tabs (vs 4 in employee view)
 *
 * @returns {Object} { status, updateStatus }
 *
 * @example
 * const { status, updateStatus } = useAssignedTasksUrlParams();
 * // status = 'ALL' | 'TAO_MOI' | 'DA_GIAO' | 'DANG_THUC_HIEN' | 'CHO_DUYET' | 'HOAN_THANH'
 * // updateStatus('TAO_MOI') -> URL becomes ?status=TAO_MOI
 */
function useAssignedTasksUrlParams() {
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
        tab: "assigned", // AssignedTasksPage uses "assigned" tab
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

export default useAssignedTasksUrlParams;
