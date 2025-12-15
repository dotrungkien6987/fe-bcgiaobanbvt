/**
 * YeuCau (Ticket) Constants
 *
 * Định nghĩa các hằng số dùng trong module Yêu cầu hỗ trợ
 */

// ============== TRẠNG THÁI ==============

export const TRANG_THAI = {
  MOI: "MOI",
  DANG_XU_LY: "DANG_XU_LY",
  DA_HOAN_THANH: "DA_HOAN_THANH",
  DA_DONG: "DA_DONG",
  TU_CHOI: "TU_CHOI",
};

export const TRANG_THAI_LABELS = {
  MOI: "Mới",
  DANG_XU_LY: "Đang xử lý",
  DA_HOAN_THANH: "Đã hoàn thành",
  DA_DONG: "Đã đóng",
  TU_CHOI: "Từ chối",
};

export const TRANG_THAI_COLORS = {
  MOI: "info",
  DANG_XU_LY: "warning",
  DA_HOAN_THANH: "success",
  DA_DONG: "default",
  TU_CHOI: "error",
};

export const TRANG_THAI_OPTIONS = Object.entries(TRANG_THAI_LABELS).map(
  ([value, label]) => ({
    value,
    label,
  })
);

// ============== LOẠI HÀNH ĐỘNG (Actions) ==============

export const HANH_DONG = {
  // Người tạo
  TAO: "TAO",
  SUA: "SUA",
  XOA: "XOA",
  YEU_CAU_XU_LY_TIEP: "YEU_CAU_XU_LY_TIEP",
  DANH_GIA: "DANH_GIA",
  DONG: "DONG",
  NHAC_LAI: "NHAC_LAI",
  BAO_QUAN_LY: "BAO_QUAN_LY",
  APPEAL: "APPEAL",

  // Khoa xử lý
  TIEP_NHAN: "TIEP_NHAN",
  TU_CHOI: "TU_CHOI",
  DIEU_PHOI: "DIEU_PHOI",
  GUI_VE_KHOA: "GUI_VE_KHOA",
  HOAN_THANH: "HOAN_THANH",
  HUY_TIEP_NHAN: "HUY_TIEP_NHAN",
  DOI_THOI_GIAN_HEN: "DOI_THOI_GIAN_HEN",
  MO_LAI: "MO_LAI",

  // Misc
  BINH_LUAN: "BINH_LUAN",
  TU_DONG_DONG: "TU_DONG_DONG",
};

export const HANH_DONG_LABELS = {
  // Backend enums (from LichSuYeuCau model)
  TAO_MOI: "Tạo yêu cầu",
  SUA_YEU_CAU: "Sửa yêu cầu",
  THEM_BINH_LUAN: "Bình luận",
  THEM_FILE: "Đính kèm file",

  // Frontend enums (kept for compatibility)
  TAO: "Tạo yêu cầu",
  SUA: "Sửa yêu cầu",
  XOA: "Xóa yêu cầu",
  YEU_CAU_XU_LY_TIEP: "Yêu cầu xử lý tiếp",
  DANH_GIA: "Đánh giá",
  DONG: "Đóng yêu cầu",
  NHAC_LAI: "Nhắc lại",
  BAO_QUAN_LY: "Báo quản lý",
  APPEAL: "Khiếu nại",
  TIEP_NHAN: "Tiếp nhận",
  TU_CHOI: "Từ chối",
  DIEU_PHOI: "Phân công",
  GUI_VE_KHOA: "Chuyển về khoa/phòng điều phối lại",
  HOAN_THANH: "Hoàn thành",
  HUY_TIEP_NHAN: "Hủy tiếp nhận",
  DOI_THOI_GIAN_HEN: "Đổi thời gian hẹn",
  MO_LAI: "Mở lại",
  BINH_LUAN: "Bình luận",
  TU_DONG_DONG: "Tự động đóng",
};

// ============== ĐƠN VỊ THỜI GIAN ==============

export const DON_VI_THOI_GIAN = {
  GIO: "GIO",
  NGAY: "NGAY",
};

export const DON_VI_THOI_GIAN_LABELS = {
  GIO: "Giờ",
  NGAY: "Ngày",
};

export const DON_VI_THOI_GIAN_OPTIONS = Object.entries(
  DON_VI_THOI_GIAN_LABELS
).map(([value, label]) => ({
  value,
  label,
}));

// ============== ROLE TRONG YÊU CẦU ==============

export const YEUCAU_ROLE = {
  NGUOI_TAO: "nguoiTao",
  QUAN_LY_KHOA: "quanLyKhoa",
  DIEU_PHOI: "dieuPhoi",
  NGUOI_XU_LY: "nguoiXuLy",
  ADMIN: "admin",
};

// ============== ĐIỂM ĐÁNH GIÁ ==============

export const DIEM_DANH_GIA = [1, 2, 3, 4, 5];

export const DIEM_DANH_GIA_LABELS = {
  1: "Rất không hài lòng",
  2: "Không hài lòng",
  3: "Bình thường",
  4: "Hài lòng",
  5: "Rất hài lòng",
};

// ============== CONFIG ==============

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Thời gian tự động đóng sau khi hoàn thành (ngày)
export const AUTO_CLOSE_DAYS = 3;

// Màu sắc cho biểu đồ dashboard
export const DASHBOARD_COLORS = {
  MOI: "#2196f3",
  DANG_XU_LY: "#ff9800",
  DA_HOAN_THANH: "#4caf50",
  DA_DONG: "#9e9e9e",
  TU_CHOI: "#f44336",
};
