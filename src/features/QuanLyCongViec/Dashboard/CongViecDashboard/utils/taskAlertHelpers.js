/**
 * Task Alert Helper Functions
 *
 * Utility functions for filtering and formatting task deadline alerts.
 * Used by CollapsibleAlertCard and dashboard components.
 *
 * @module taskAlertHelpers
 */

import dayjs from "dayjs";

/**
 * Filter tasks by overdue status
 * @param {Array} tasks - Array of CongViec objects
 * @returns {Array} - Overdue tasks sorted by oldest deadline first
 */
export function filterOverdueTasks(tasks) {
  if (!Array.isArray(tasks)) return [];

  return tasks
    .filter((task) => task.TinhTrangThoiHan === "QUA_HAN")
    .sort((a, b) => {
      const dateA = new Date(a.NgayHetHan);
      const dateB = new Date(b.NgayHetHan);
      return dateA - dateB; // Oldest first
    });
}

/**
 * Filter tasks by upcoming deadline status
 * @param {Array} tasks - Array of CongViec objects
 * @returns {Array} - Upcoming deadline tasks sorted by nearest deadline first
 */
export function filterUpcomingTasks(tasks) {
  if (!Array.isArray(tasks)) return [];

  return tasks
    .filter((task) => task.TinhTrangThoiHan === "SAP_QUA_HAN")
    .sort((a, b) => {
      const dateA = new Date(a.NgayHetHan);
      const dateB = new Date(b.NgayHetHan);
      return dateA - dateB; // Nearest first
    });
}

/**
 * Calculate days overdue
 * @param {string|Date} deadline - NgayHetHan
 * @returns {number} - Number of days overdue (positive integer)
 */
export function calculateDaysOverdue(deadline) {
  if (!deadline) return 0;

  const now = dayjs();
  const deadlineDate = dayjs(deadline);
  const diff = now.diff(deadlineDate, "day");

  return Math.max(0, diff);
}

/**
 * Calculate days until deadline
 * @param {string|Date} deadline - NgayHetHan
 * @returns {number} - Number of days until deadline (can be negative if overdue)
 */
export function calculateDaysUntilDeadline(deadline) {
  if (!deadline) return 0;

  const now = dayjs();
  const deadlineDate = dayjs(deadline);

  return deadlineDate.diff(now, "day");
}

/**
 * Format deadline text for display
 * @param {string|Date} deadline - NgayHetHan
 * @param {string} type - "overdue" or "upcoming"
 * @returns {string} - Formatted text like "Quá 5 ngày" or "Còn 2 ngày"
 */
export function formatDeadlineText(deadline, type = "overdue") {
  if (!deadline) return "";

  if (type === "overdue") {
    const days = calculateDaysOverdue(deadline);
    if (days === 0) return "Hôm nay";
    if (days === 1) return "Quá 1 ngày";
    return `Quá ${days} ngày`;
  }

  if (type === "upcoming") {
    const days = calculateDaysUntilDeadline(deadline);
    if (days === 0) return "Hôm nay";
    if (days === 1) return "Còn 1 ngày";
    if (days < 0) return "Quá hạn";
    return `Còn ${days} ngày`;
  }

  return "";
}

/**
 * Format deadline date for display
 * @param {string|Date} deadline - NgayHetHan
 * @returns {string} - Formatted date like "15/01/2026"
 */
export function formatDeadlineDate(deadline) {
  if (!deadline) return "";
  return dayjs(deadline).format("DD/MM/YYYY");
}

/**
 * Get priority badge color
 * @param {string} priority - MucDoUuTien value
 * @returns {string} - MUI color value
 */
export function getPriorityColor(priority) {
  const colorMap = {
    KHAN_CAP: "error",
    CAO: "warning",
    BINH_THUONG: "info",
    THAP: "default",
  };

  return colorMap[priority] || "default";
}

/**
 * Get priority label
 * @param {string} priority - MucDoUuTien value
 * @returns {string} - Vietnamese label
 */
export function getPriorityLabel(priority) {
  const labelMap = {
    KHAN_CAP: "Khẩn cấp",
    CAO: "Cao",
    BINH_THUONG: "Bình thường",
    THAP: "Thấp",
  };

  return labelMap[priority] || "";
}

/**
 * Get status label (Vietnamese)
 * @param {string} status - TrangThai value
 * @returns {string} - Vietnamese label
 */
export function getStatusLabel(status) {
  const labelMap = {
    TAO_MOI: "Tạo mới",
    DA_GIAO: "Đã giao",
    DANG_THUC_HIEN: "Đang thực hiện",
    CHO_DUYET: "Chờ duyệt",
    HOAN_THANH: "Hoàn thành",
    TU_CHOI: "Từ chối",
    HUY: "Hủy",
  };

  return labelMap[status] || status;
}
