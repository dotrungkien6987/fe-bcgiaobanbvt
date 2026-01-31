/**
 * Section Metadata Configuration
 *
 * Provides visual styling and UI configuration for each menu section
 * Used by menuConfigAdapter.js to apply colors, icons, and expanded state
 *
 * This file defines metadata for:
 * - Main sections from menu-items
 * - Split sub-sections (from large sections like daotao)
 *
 * @author AI Assistant
 * @version 1.0.0
 */

// ============================================================================
// COLORS PALETTE
// ============================================================================

/**
 * Modern vibrant color palette for sections
 * Each color is carefully chosen for accessibility and visual hierarchy
 */
export const COLORS = {
  // Primary actions
  workManagement: "#2e7d32", // Green - Work/Tasks
  kpi: "#ed6c02", // Orange - KPI/Performance
  requests: "#9c27b0", // Purple - Requests

  // Training & Education (blue spectrum)
  training: "#0288d1", // Blue - Main training
  trainingStaff: "#01579b", // Dark blue - Staff info
  trainingInternal: "#0097a7", // Cyan - Internal training
  trainingPostgrad: "#00838f", // Teal - Postgraduate
  trainingExternal: "#006064", // Dark teal - External

  // Research & Quality
  research: "#7b1fa2", // Purple - Research
  quality: "#c2185b", // Pink - Quality management

  // Reports & Data
  reports: "#d32f2f", // Red - Reports

  // System & Admin
  notification: "#ff9800", // Amber - Notifications
  schedule: "#5d4037", // Brown - Schedule
  admin: "#616161", // Gray - Admin

  // Default
  default: "#757575", // Gray - Fallback
};

// ============================================================================
// SECTION METADATA
// ============================================================================

/**
 * Metadata configuration for each section
 * Key = group.id from menu-items
 */
export const SECTION_METADATA = {
  // ========================================
  // MAIN SECTIONS
  // ========================================

  // Quản lý công việc và KPI
  "group-pages": {
    displayId: "work-management",
    title: "Quản Lý Công Việc & KPI",
    color: COLORS.workManagement,
    defaultExpanded: true,
  },

  // Thông báo
  "group-notification": {
    displayId: "notification",
    title: "Thông Báo",
    color: COLORS.notification,
    defaultExpanded: false,
  },

  // Nghiên cứu khoa học (không split, giữ nguyên)
  "group-pages-nckh": {
    displayId: "research",
    title: "Nghiên Cứu Khoa Học",
    color: COLORS.research,
    defaultExpanded: false,
  },

  // Báo cáo
  "group-baocao": {
    displayId: "reports",
    title: "Báo Cáo",
    color: COLORS.reports,
    defaultExpanded: false,
  },

  // Quản lý chất lượng
  "group-quanlychatluong": {
    displayId: "quality",
    title: "Quản Lý Chất Lượng",
    color: COLORS.quality,
    defaultExpanded: false,
  },

  // Lịch trực
  "group-lichtruc": {
    displayId: "schedule",
    title: "Lịch Trực",
    color: COLORS.schedule,
    defaultExpanded: false,
  },

  // Admin
  "group-admin": {
    displayId: "admin",
    title: "Quản Trị Hệ Thống",
    color: COLORS.admin,
    defaultExpanded: false,
  },

  // ========================================
  // SPLIT SECTIONS - ĐÀO TẠO
  // (group-daotao được split thành 4 sections)
  // ========================================

  // Thông tin cán bộ
  "group-daotao-quanlycanbo": {
    displayId: "training-staff",
    title: "Thông Tin Cán Bộ",
    color: COLORS.trainingStaff,
    defaultExpanded: false,
  },

  // Đào tạo nội viện
  "group-daotao-daotaonoivien": {
    displayId: "training-internal",
    title: "Đào Tạo Nội Viện",
    color: COLORS.trainingInternal,
    defaultExpanded: false,
  },

  // Đào tạo sau đại học
  "group-daotao-daotaosaudaihoc": {
    displayId: "training-postgrad",
    title: "Đào Tạo Sau Đại Học",
    color: COLORS.trainingPostgrad,
    defaultExpanded: false,
  },

  // Đào tạo & Chỉ đạo tuyến
  "group-daotao-daotaongoaivien": {
    displayId: "training-external",
    title: "Đào Tạo & Chỉ Đạo Tuyến",
    color: COLORS.trainingExternal,
    defaultExpanded: false,
  },

  // ========================================
  // NGHIÊN CỨU KHOA HỌC (if split needed)
  // ========================================

  // Báo cáo NCKH
  "group-pages-baocao": {
    displayId: "research-reports",
    title: "Báo Cáo NCKH",
    color: COLORS.research,
    defaultExpanded: false,
  },

  // Nghiên cứu khoa học chính
  "group-pages-nghiencuukhoahoc": {
    displayId: "research-main",
    title: "Nghiên Cứu Khoa Học",
    color: COLORS.research,
    defaultExpanded: false,
  },

  // Hợp tác quốc tế
  "group-pages-hoptacquocte": {
    displayId: "research-international",
    title: "Hợp Tác Quốc Tế",
    color: "#4a148c", // Deep purple
    defaultExpanded: false,
  },

  // Danh mục NCKH
  "group-pages-danhmucnckh": {
    displayId: "research-config",
    title: "Danh Mục NCKH",
    color: "#6a1b9a",
    defaultExpanded: false,
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Default section color (fallback)
 */
export const DEFAULT_SECTION_COLOR = COLORS.default;

/**
 * Default expanded state
 */
export const DEFAULT_EXPANDED = false;

/**
 * Get metadata for a section ID
 * @param {string} sectionId - The section ID
 * @returns {Object} Metadata object or empty object
 */
export function getMetadata(sectionId) {
  return SECTION_METADATA[sectionId] || {};
}

/**
 * Get color for a section
 * @param {string} sectionId - The section ID
 * @returns {string} Color hex code
 */
export function getSectionColor(sectionId) {
  const metadata = SECTION_METADATA[sectionId];
  return metadata?.color || DEFAULT_SECTION_COLOR;
}

/**
 * Check if section should be expanded by default
 * @param {string} sectionId - The section ID
 * @returns {boolean} Whether section should be expanded
 */
export function isDefaultExpanded(sectionId) {
  const metadata = SECTION_METADATA[sectionId];
  return metadata?.defaultExpanded || DEFAULT_EXPANDED;
}

const sectionMetadataExports = {
  SECTION_METADATA,
  COLORS,
  DEFAULT_SECTION_COLOR,
  DEFAULT_EXPANDED,
  getMetadata,
  getSectionColor,
  isDefaultExpanded,
};

export default sectionMetadataExports;
