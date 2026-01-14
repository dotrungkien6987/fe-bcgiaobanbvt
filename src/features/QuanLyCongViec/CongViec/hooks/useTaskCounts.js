import { useMemo } from "react";

/**
 * Custom hook to calculate task counts by status and deadline status
 *
 * @param {Array} tasks - Array of CongViec objects
 * @returns {Object} Counts object with structure:
 *   {
 *     ALL: number,           // Total count
 *     DA_GIAO: number,       // Count by status
 *     DANG_THUC_HIEN: number,
 *     CHO_DUYET: number,
 *     HOAN_THANH: number,
 *     TU_CHOI: number,
 *     HUY: number,
 *     deadlineStatus: {
 *       overdue: number,     // QUA_HAN count
 *       upcoming: number,    // SAP_QUA_HAN count
 *       onTrack: number      // DUNG_HAN count
 *     }
 *   }
 *
 * @example
 * const counts = useTaskCounts(receivedTasks);
 * // counts.ALL => 23
 * // counts.DANG_THUC_HIEN => 8
 * // counts.deadlineStatus.overdue => 2
 */
function useTaskCounts(tasks = []) {
  return useMemo(() => {
    // Initialize counts object
    const counts = {
      ALL: 0,
      TAO_MOI: 0,
      DA_GIAO: 0,
      DANG_THUC_HIEN: 0,
      CHO_DUYET: 0,
      HOAN_THANH: 0,
      deadlineStatus: {
        overdue: 0, // ⚠️ QUA_HAN
        upcoming: 0, // ⏰ SAP_QUA_HAN
        onTrack: 0, // ✅ DUNG_HAN
      },
      deadlineByStatus: {
        ALL: { overdue: 0, upcoming: 0, onTrack: 0 },
        TAO_MOI: { overdue: 0, upcoming: 0, onTrack: 0 },
        DA_GIAO: { overdue: 0, upcoming: 0, onTrack: 0 },
        DANG_THUC_HIEN: { overdue: 0, upcoming: 0, onTrack: 0 },
        CHO_DUYET: { overdue: 0, upcoming: 0, onTrack: 0 },
      },
    };

    // Return empty counts if no tasks
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return counts;
    }

    // Calculate counts
    tasks.forEach((task) => {
      // Count total
      counts.ALL++;

      // Count by status (TrangThai field)
      if (task.TrangThai) {
        const status = task.TrangThai;
        if (counts.hasOwnProperty(status)) {
          counts[status]++;
        }
      }

      // Count by deadline status (TinhTrangThoiHan virtual field from backend)
      if (task.TinhTrangThoiHan) {
        const deadlineStatus = task.TinhTrangThoiHan;
        const taskStatus = task.TrangThai;

        // Update total deadline counts
        switch (deadlineStatus) {
          case "QUA_HAN":
            counts.deadlineStatus.overdue++;
            break;
          case "SAP_QUA_HAN":
            counts.deadlineStatus.upcoming++;
            break;
          case "DUNG_HAN":
            counts.deadlineStatus.onTrack++;
            break;
          default:
            // Unknown deadline status - do nothing
            break;
        }

        // Update per-status deadline counts
        // ALL status gets all deadlines
        if (deadlineStatus === "QUA_HAN") {
          counts.deadlineByStatus.ALL.overdue++;
        } else if (deadlineStatus === "SAP_QUA_HAN") {
          counts.deadlineByStatus.ALL.upcoming++;
        } else if (deadlineStatus === "DUNG_HAN") {
          counts.deadlineByStatus.ALL.onTrack++;
        }

        // Individual statuses (DA_GIAO, DANG_THUC_HIEN, CHO_DUYET)
        if (counts.deadlineByStatus[taskStatus]) {
          if (deadlineStatus === "QUA_HAN") {
            counts.deadlineByStatus[taskStatus].overdue++;
          } else if (deadlineStatus === "SAP_QUA_HAN") {
            counts.deadlineByStatus[taskStatus].upcoming++;
          } else if (deadlineStatus === "DUNG_HAN") {
            counts.deadlineByStatus[taskStatus].onTrack++;
          }
        }
      }
    });

    return counts;
  }, [tasks]); // Memoize based on tasks array
}

export default useTaskCounts;
