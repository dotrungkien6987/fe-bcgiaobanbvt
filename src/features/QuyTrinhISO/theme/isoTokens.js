/**
 * ISO Module Design Tokens
 * Single source of truth cho colors, gradients, spacing trong toàn module QuyTrinhISO
 */

// ─── Header Gradient ─────────────────────────────────────────────────────────
export const ISO_HEADER_GRADIENT =
  "linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)";

// Gradient cho các sub-pages (vẫn cùng tone xanh, thống nhất toàn module)
export const ISO_HEADER_GRADIENT_DARK =
  "linear-gradient(135deg, #0d47a1 0%, #01579b 100%)";

// ─── Status Config ────────────────────────────────────────────────────────────
export const STATUS_CONFIG = {
  DRAFT: {
    label: "Nháp",
    color: "default",
    chipSx: { bgcolor: "grey.200", color: "grey.700", fontWeight: 600 },
    dotColor: "#9e9e9e",
  },
  ACTIVE: {
    label: "Hiệu lực",
    color: "success",
    chipSx: { fontWeight: 600 },
    dotColor: "#2e7d32",
  },
  INACTIVE: {
    label: "Đã thu hồi",
    color: "warning",
    chipSx: { fontWeight: 600 },
    dotColor: "#ed6c02",
  },
};

// ─── File Type Colors ─────────────────────────────────────────────────────────
export const FILE_TYPE = {
  pdf: {
    color: "#1565c0", // primary blue (không còn đỏ)
    lightBg: "#e3f2fd",
    borderColor: "#1976d2",
    label: "PDF",
  },
  word: {
    color: "#e65100", // deep orange
    lightBg: "#fff3e0",
    borderColor: "#ed6c02",
    label: "Word",
  },
};

// ─── Glass Card Style ─────────────────────────────────────────────────────────
/** Card nổi trên gradient header (search bar, stats strip) */
export const glassCardSx = {
  background: "rgba(255,255,255,0.12)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  border: "1px solid rgba(255,255,255,0.22)",
  borderRadius: 2,
};

/** Card nổi nhẹ trên nền trắng */
export const elevatedCardSx = {
  boxShadow: "0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)",
  borderRadius: 2,
  transition: "box-shadow 0.2s ease, transform 0.2s ease",
  "&:hover": {
    boxShadow: "0 6px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08)",
    transform: "translateY(-2px)",
  },
};

// ─── Spacing ──────────────────────────────────────────────────────────────────
export const ISO_SPACING = {
  headerPt: { xs: 2, md: 2.5 },
  headerPb: { xs: 3, md: 3.5 },
  contentMt: { xs: 2, md: 3 },
  pagePb: { xs: 10, md: 4 }, // xs bottom pad for mobile FAB
};

// ─── Breadcrumb separator ────────────────────────────────────────────────────
export const BREADCRUMB_ITEMS = {
  home: { label: "Trang chủ", to: "/" },
  list: { label: "Quy trình ISO", to: "/quytrinh-iso" },
  dashboard: { label: "Tổng quan", to: "/quytrinh-iso/dashboard" },
  distributedToMe: {
    label: "Phân phối cho khoa tôi",
    to: "/quytrinh-iso/danh-sach-toi",
  },
  builtByMe: {
    label: "Do khoa tôi xây dựng",
    to: "/quytrinh-iso/khoa-toi-xay-dung",
  },
};
