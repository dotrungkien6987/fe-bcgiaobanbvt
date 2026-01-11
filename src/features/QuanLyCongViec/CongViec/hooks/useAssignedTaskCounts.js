import { useMemo } from "react";

/**
 * Custom hook to calculate assigned task counts by status and deadline status
 * Designed for Manager View ("Việc tôi giao")
 *
 * @param {Array} tasks - Array of CongViec objects assigned by the manager
 * @returns {Object} Counts object with structure:
 *   {
 *     ALL: number,           // Total count (all active statuses)
 *     TAO_MOI: number,       // Chưa giao (created but not assigned)
 *     DA_GIAO: number,       // Đã giao (assigned to employee)
 *     DANG_THUC_HIEN: number, // Đang làm (in progress)
 *     CHO_DUYET: number,     // Chờ tôi duyệt (waiting for manager approval)
 *     HOAN_THANH: number,    // Hoàn thành (completed)
 *     deadlineStatus: {
 *       overdue: number,     // QUA_HAN count
 *       upcoming: number,    // SAP_QUA_HAN count
 *       onTrack: number      // DUNG_HAN count
 *     }
 *   }
 *
 * @example
 * const counts = useAssignedTaskCounts(assignedTasks);
 * // counts.ALL => 45
 * // counts.TAO_MOI => 3 (Chưa giao)
 * // counts.DANG_THUC_HIEN => 12 (Đang làm)
 * // counts.deadlineStatus.overdue => 5 (Quá hạn)
 */
function useAssignedTaskCounts(tasks = []) {
  return useMemo(() => {
    // Initialize counts object (5 active statuses for manager view)
    const counts = {
      ALL: 0, // Total active tasks (exclude completed/cancelled)
      TAO_MOI: 0, // Chưa giao
      DA_GIAO: 0, // Đã giao
      DANG_THUC_HIEN: 0, // Đang làm
      CHO_DUYET: 0, // Chờ tôi duyệt
      HOAN_THANH: 0, // Hoàn thành (not included in ALL)
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
      // Count by status (TrangThai field)
      const status = task.TrangThai;

      // Count active statuses for ALL
      if (
        status === "TAO_MOI" ||
        status === "DA_GIAO" ||
        status === "DANG_THUC_HIEN" ||
        status === "CHO_DUYET"
      ) {
        counts.ALL++;
      }

      // Count by specific status
      if (status && counts.hasOwnProperty(status)) {
        counts[status]++;
      }

      // Count by deadline status (TinhTrangThoiHan virtual field from backend)
      // Only count for active tasks (exclude HOAN_THANH)
      if (task.TinhTrangThoiHan && status !== "HOAN_THANH") {
        const deadlineStatus = task.TinhTrangThoiHan;

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
        // ALL status gets all active task deadlines
        if (deadlineStatus === "QUA_HAN") {
          counts.deadlineByStatus.ALL.overdue++;
        } else if (deadlineStatus === "SAP_QUA_HAN") {
          counts.deadlineByStatus.ALL.upcoming++;
        } else if (deadlineStatus === "DUNG_HAN") {
          counts.deadlineByStatus.ALL.onTrack++;
        }

        // Individual statuses (TAO_MOI, DA_GIAO, DANG_THUC_HIEN, CHO_DUYET)
        if (counts.deadlineByStatus[status]) {
          if (deadlineStatus === "QUA_HAN") {
            counts.deadlineByStatus[status].overdue++;
          } else if (deadlineStatus === "SAP_QUA_HAN") {
            counts.deadlineByStatus[status].upcoming++;
          } else if (deadlineStatus === "DUNG_HAN") {
            counts.deadlineByStatus[status].onTrack++;
          }
        }
      }
    });

    return counts;
  }, [tasks]); // Memoize based on tasks array
}

export default useAssignedTaskCounts;
