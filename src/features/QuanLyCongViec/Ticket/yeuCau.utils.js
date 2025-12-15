/**
 * YeuCau (Ticket) Utilities
 *
 * Các hàm tiện ích cho module Yêu cầu hỗ trợ
 */
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

import {
  TRANG_THAI,
  TRANG_THAI_LABELS,
  TRANG_THAI_COLORS,
  HANH_DONG,
  HANH_DONG_LABELS,
  YEUCAU_ROLE,
  AUTO_CLOSE_DAYS,
} from "./yeuCau.constants";

// Setup dayjs
dayjs.extend(relativeTime);
dayjs.locale("vi");

// ============== FORMATTING ==============

/**
 * Format ngày giờ
 */
export function formatDateTime(date, format = "DD/MM/YYYY HH:mm") {
  if (!date) return "-";
  return dayjs(date).format(format);
}

/**
 * Format ngày
 */
export function formatDate(date, format = "DD/MM/YYYY") {
  if (!date) return "-";
  return dayjs(date).format(format);
}

/**
 * Format thời gian tương đối (vd: "2 giờ trước")
 */
export function formatRelativeTime(date) {
  if (!date) return "-";
  return dayjs(date).fromNow();
}

/**
 * Lấy label trạng thái
 */
export function getTrangThaiLabel(trangThai) {
  return TRANG_THAI_LABELS[trangThai] || trangThai;
}

/**
 * Lấy màu trạng thái (cho MUI Chip)
 */
export function getTrangThaiColor(trangThai) {
  return TRANG_THAI_COLORS[trangThai] || "default";
}

/**
 * Lấy label hành động
 */
export function getHanhDongLabel(hanhDong) {
  return HANH_DONG_LABELS[hanhDong] || hanhDong;
}

// ============== BUSINESS LOGIC ==============

/**
 * Kiểm tra yêu cầu có quá hạn không
 */
export function isQuaHan(yeuCau) {
  if (!yeuCau?.ThoiGianHen) return false;
  const trangThaiChoPhep = [TRANG_THAI.MOI, TRANG_THAI.DANG_XU_LY];
  if (!trangThaiChoPhep.includes(yeuCau.TrangThai)) return false;
  return dayjs().isAfter(dayjs(yeuCau.ThoiGianHen));
}

/**
 * Kiểm tra yêu cầu sắp hết hạn (trong vòng 24h)
 */
export function isSapHetHan(yeuCau, soGio = 24) {
  if (!yeuCau?.ThoiGianHen) return false;
  const trangThaiChoPhep = [TRANG_THAI.MOI, TRANG_THAI.DANG_XU_LY];
  if (!trangThaiChoPhep.includes(yeuCau.TrangThai)) return false;

  const now = dayjs();
  const deadline = dayjs(yeuCau.ThoiGianHen);
  const hoursLeft = deadline.diff(now, "hour");

  return hoursLeft > 0 && hoursLeft <= soGio;
}

/**
 * Tính số ngày còn lại trước khi tự động đóng
 */
export function getSoNgayConLaiTuDongDong(yeuCau) {
  if (yeuCau?.TrangThai !== TRANG_THAI.DA_HOAN_THANH) return null;
  if (!yeuCau?.NgayHoanThanh) return null;

  const ngayTuDongDong = dayjs(yeuCau.NgayHoanThanh).add(
    AUTO_CLOSE_DAYS,
    "day"
  );
  const now = dayjs();
  const daysLeft = ngayTuDongDong.diff(now, "day", true);

  return Math.max(0, Math.ceil(daysLeft));
}

/**
 * Tính thời gian xử lý (từ tiếp nhận đến hoàn thành)
 */
export function getThoiGianXuLy(yeuCau) {
  if (!yeuCau?.NgayTiepNhan) return null;
  const endDate = yeuCau.NgayHoanThanh || yeuCau.NgayDong || new Date();
  const start = dayjs(yeuCau.NgayTiepNhan);
  const end = dayjs(endDate);

  const hours = end.diff(start, "hour");
  if (hours < 24) {
    return `${hours} giờ`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (remainingHours === 0) {
    return `${days} ngày`;
  }
  return `${days} ngày ${remainingHours} giờ`;
}

// ============== PERMISSIONS / ACTIONS ==============

/**
 * Xác định role của user với yêu cầu cụ thể
 * @param {Object} yeuCau - Yêu cầu
 * @param {Object} user - Current user (có NhanVienID, KhoaID, PhanQuyen)
 * @param {Object} cauHinhKhoa - Cấu hình khoa xử lý (từ API check)
 * @returns {Array<string>} Danh sách roles
 */
export function getUserRoles(yeuCau, user, cauHinhKhoa) {
  const roles = [];
  if (!yeuCau || !user) return roles;

  const nhanVienId = user.NhanVienID?.toString();
  const phanQuyen = (user.PhanQuyen || "").toLowerCase();

  // Admin
  if (["admin", "superadmin"].includes(phanQuyen)) {
    roles.push(YEUCAU_ROLE.ADMIN);
  }

  // Người tạo
  const nguoiTaoId =
    yeuCau.NguoiTaoID?._id?.toString() || yeuCau.NguoiTaoID?.toString();
  if (nhanVienId && nguoiTaoId === nhanVienId) {
    roles.push(YEUCAU_ROLE.NGUOI_TAO);
  }

  // Người xử lý
  const nguoiXuLyId =
    yeuCau.NguoiXuLyID?._id?.toString() || yeuCau.NguoiXuLyID?.toString();
  if (nhanVienId && nguoiXuLyId === nhanVienId) {
    roles.push(YEUCAU_ROLE.NGUOI_XU_LY);
  }

  // Quản lý khoa / Điều phối (từ cauHinhKhoa)
  if (cauHinhKhoa) {
    if (cauHinhKhoa.isQuanLyKhoa) {
      roles.push(YEUCAU_ROLE.QUAN_LY_KHOA);
    }
    if (cauHinhKhoa.isDieuPhoi) {
      roles.push(YEUCAU_ROLE.DIEU_PHOI);
    }
  }

  return roles;
}

/**
 * Xác định các action có thể thực hiện dựa trên trạng thái và role
 * @param {Object} yeuCau - Yêu cầu
 * @param {Array<string>} roles - Roles của user
 * @returns {Array<string>} Danh sách action codes
 */
export function getAvailableActions(yeuCau, roles = []) {
  if (!yeuCau) return [];

  const actions = [];
  const { TrangThai } = yeuCau;

  const isNguoiTao = roles.includes(YEUCAU_ROLE.NGUOI_TAO);
  const isQuanLy = roles.includes(YEUCAU_ROLE.QUAN_LY_KHOA);
  const isDieuPhoi = roles.includes(YEUCAU_ROLE.DIEU_PHOI);
  const isNguoiXuLy = roles.includes(YEUCAU_ROLE.NGUOI_XU_LY);
  const isAdmin = roles.includes(YEUCAU_ROLE.ADMIN);
  const canTiepNhan = isQuanLy || isDieuPhoi || isAdmin;

  switch (TrangThai) {
    case TRANG_THAI.MOI:
      // Người tạo: sửa, xóa
      if (isNguoiTao || isAdmin) {
        actions.push(HANH_DONG.SUA, HANH_DONG.XOA);
      }
      // Khoa xử lý: tiếp nhận, từ chối, gửi về khoa khác
      if (canTiepNhan) {
        actions.push(
          HANH_DONG.TIEP_NHAN,
          HANH_DONG.TU_CHOI,
          HANH_DONG.GUI_VE_KHOA
        );
      }
      // Người tạo: nhắc lại nếu quá hạn
      if (isNguoiTao && isQuaHan(yeuCau)) {
        actions.push(HANH_DONG.NHAC_LAI);
      }
      break;

    case TRANG_THAI.DANG_XU_LY:
      // Khoa xử lý: điều phối, đổi thời gian hẹn, hủy tiếp nhận
      if (canTiepNhan) {
        actions.push(
          HANH_DONG.DIEU_PHOI,
          HANH_DONG.DOI_THOI_GIAN_HEN,
          HANH_DONG.HUY_TIEP_NHAN
        );
      }
      // Người xử lý: hoàn thành
      if (isNguoiXuLy || canTiepNhan) {
        actions.push(HANH_DONG.HOAN_THANH);
      }
      // Người tạo: nhắc lại nếu quá hạn, báo quản lý
      if (isNguoiTao) {
        if (isQuaHan(yeuCau)) {
          actions.push(HANH_DONG.NHAC_LAI);
        }
        actions.push(HANH_DONG.BAO_QUAN_LY);
      }
      break;

    case TRANG_THAI.DA_HOAN_THANH:
      // Người tạo: đánh giá, đóng, yêu cầu xử lý tiếp
      if (isNguoiTao || isAdmin) {
        actions.push(
          HANH_DONG.DANH_GIA,
          HANH_DONG.DONG,
          HANH_DONG.YEU_CAU_XU_LY_TIEP
        );
      }
      // Khoa xử lý: mở lại (nếu cần sửa)
      if (canTiepNhan) {
        actions.push(HANH_DONG.MO_LAI);
      }
      break;

    case TRANG_THAI.TU_CHOI:
      // Người tạo: khiếu nại
      if (isNguoiTao) {
        actions.push(HANH_DONG.APPEAL);
      }
      break;

    case TRANG_THAI.DA_DONG:
      // Không có action - trạng thái cuối
      break;

    default:
      break;
  }

  // Bình luận - có thể thực hiện ở mọi trạng thái (trừ đã đóng)
  if (TrangThai !== TRANG_THAI.DA_DONG) {
    actions.push(HANH_DONG.BINH_LUAN);
  }

  return actions;
}

/**
 * Kiểm tra user có quyền xem yêu cầu không
 */
export function canViewYeuCau(yeuCau, user, cauHinhKhoa) {
  if (!yeuCau || !user) return false;

  const roles = getUserRoles(yeuCau, user, cauHinhKhoa);

  // Admin luôn xem được
  if (roles.includes(YEUCAU_ROLE.ADMIN)) return true;

  // Người tạo
  if (roles.includes(YEUCAU_ROLE.NGUOI_TAO)) return true;

  // Người của khoa xử lý
  const userKhoaId = user.KhoaID?._id?.toString() || user.KhoaID?.toString();
  const khoaXuLyId =
    yeuCau.KhoaXuLyID?._id?.toString() || yeuCau.KhoaXuLyID?.toString();
  if (userKhoaId && khoaXuLyId === userKhoaId) return true;

  // Quản lý, điều phối, người xử lý
  if (
    roles.includes(YEUCAU_ROLE.QUAN_LY_KHOA) ||
    roles.includes(YEUCAU_ROLE.DIEU_PHOI) ||
    roles.includes(YEUCAU_ROLE.NGUOI_XU_LY)
  ) {
    return true;
  }

  return false;
}

// ============== VALIDATION ==============

/**
 * Validate dữ liệu tạo yêu cầu
 */
export function validateYeuCauData(data) {
  const errors = {};

  if (!data.TieuDe?.trim()) {
    errors.TieuDe = "Tiêu đề không được để trống";
  } else if (data.TieuDe.length > 200) {
    errors.TieuDe = "Tiêu đề không được vượt quá 200 ký tự";
  }

  if (!data.MoTa?.trim()) {
    errors.MoTa = "Mô tả không được để trống";
  }

  if (!data.KhoaXuLyID) {
    errors.KhoaXuLyID = "Vui lòng chọn khoa xử lý";
  }

  if (!data.DanhMucYeuCauID) {
    errors.DanhMucYeuCauID = "Vui lòng chọn loại yêu cầu";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// ============== SORTING/FILTERING ==============

/**
 * Sắp xếp danh sách yêu cầu
 */
export function sortYeuCauList(list, sortBy = "NgayTao", sortOrder = "desc") {
  return [...list].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    // Handle dates
    if (sortBy.startsWith("Ngay") || sortBy.startsWith("ThoiGian")) {
      aVal = aVal ? new Date(aVal).getTime() : 0;
      bVal = bVal ? new Date(bVal).getTime() : 0;
    }

    // Handle strings
    if (typeof aVal === "string") {
      aVal = aVal.toLowerCase();
      bVal = (bVal || "").toLowerCase();
    }

    if (sortOrder === "desc") {
      return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
    }
    return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
  });
}

/**
 * Lọc danh sách yêu cầu theo text search
 */
export function filterYeuCauBySearch(list, searchText) {
  if (!searchText?.trim()) return list;

  const search = searchText.toLowerCase().trim();
  return list.filter((item) => {
    return (
      item.MaYeuCau?.toLowerCase().includes(search) ||
      item.TieuDe?.toLowerCase().includes(search) ||
      item.MoTa?.toLowerCase().includes(search)
    );
  });
}

// ============== DISPLAY HELPERS ==============

/**
 * Lấy tên người (từ populated object hoặc string)
 */
export function getTenNguoi(nguoi) {
  if (!nguoi) return "-";
  if (typeof nguoi === "string") return nguoi;
  return nguoi.HoTen || nguoi.Ten || nguoi.MaNhanVien || "-";
}

/**
 * Lấy tên khoa (từ populated object hoặc string)
 */
export function getTenKhoa(khoa) {
  if (!khoa) return "-";
  if (typeof khoa === "string") return khoa;
  return khoa.TenKhoa || khoa.Ten || "-";
}

/**
 * Tạo mô tả chi tiết cho timeline action (hiển thị người liên quan, thời gian, v.v.)
 * @param {Object} historyItem - LichSuYeuCau entry with populated DenGiaTri/TuGiaTri
 * @returns {string} Vietnamese description
 */
export function getEnhancedDescription(historyItem) {
  const baseLabel = getHanhDongLabel(historyItem.HanhDong);
  const denGiaTri = historyItem.DenGiaTri || {};
  const tuGiaTri = historyItem.TuGiaTri || {};

  switch (historyItem.HanhDong) {
    case "TAO_MOI":
      // "Tạo yêu cầu đến khoa X" hoặc "Tạo yêu cầu đến Y (Cá nhân)"
      if (denGiaTri.LoaiNguoiNhan === "KHOA" && denGiaTri.KhoaDichID) {
        return `${baseLabel} đến ${getTenKhoa(denGiaTri.KhoaDichID)}`;
      }
      if (denGiaTri.LoaiNguoiNhan === "CA_NHAN" && denGiaTri.NguoiNhanID) {
        return `${baseLabel} đến ${getTenNguoi(
          denGiaTri.NguoiNhanID
        )} (Cá nhân)`;
      }
      return baseLabel;

    case "DIEU_PHOI":
      // "Phân công cho Nguyễn Văn A"
      if (denGiaTri.NguoiDuocDieuPhoiID) {
        return `${baseLabel} cho ${getTenNguoi(denGiaTri.NguoiDuocDieuPhoiID)}`;
      }
      return baseLabel;

    case "TIEP_NHAN":
      // "Tiếp nhận (hẹn 15/12/2025 10:00)"
      if (denGiaTri.ThoiGianHen) {
        return `${baseLabel} (hẹn ${formatDateTime(denGiaTri.ThoiGianHen)})`;
      }
      return baseLabel;

    case "GUI_VE_KHOA":
      // "Chuyển về khoa X để điều phối lại"
      if (denGiaTri.KhoaDichID) {
        return `${baseLabel} ${getTenKhoa(denGiaTri.KhoaDichID)}`;
      }
      return baseLabel;

    case "DOI_THOI_GIAN_HEN":
      // "Đổi thời gian hẹn: 14/12 10:00 → 15/12 14:00"
      if (tuGiaTri.ThoiGianHen && denGiaTri.ThoiGianHen) {
        return `${baseLabel}: ${formatDateTime(
          tuGiaTri.ThoiGianHen
        )} → ${formatDateTime(denGiaTri.ThoiGianHen)}`;
      }
      if (denGiaTri.ThoiGianHen) {
        return `${baseLabel} (${formatDateTime(denGiaTri.ThoiGianHen)})`;
      }
      return baseLabel;

    case "SUA_YEU_CAU":
      // "Sửa yêu cầu (TieuDe, MoTa)"
      const changedFields = [];
      if (tuGiaTri.TieuDe !== denGiaTri.TieuDe && denGiaTri.TieuDe) {
        changedFields.push("Tiêu đề");
      }
      if (tuGiaTri.MoTa !== denGiaTri.MoTa) {
        changedFields.push("Mô tả");
      }
      if (changedFields.length > 0) {
        return `${baseLabel} (${changedFields.join(", ")})`;
      }
      return baseLabel;

    case "HUY_TIEP_NHAN":
      // "Hủy tiếp nhận (trả về khoa)"
      return `${baseLabel} (trả về khoa)`;

    case "YEU_CAU_XU_LY_TIEP":
      // "Yêu cầu xử lý tiếp (chưa hài lòng)"
      return `${baseLabel} (chưa hài lòng)`;

    default:
      // Các action khác: giữ nguyên label cơ bản
      // GhiChu đã được compose tốt từ backend (TU_CHOI, DANH_GIA, v.v.)
      return baseLabel;
  }
}

/**
 * Tạo summary text cho yêu cầu
 */
export function getYeuCauSummary(yeuCau) {
  if (!yeuCau) return "";

  const parts = [`#${yeuCau.MaYeuCau}`, getTrangThaiLabel(yeuCau.TrangThai)];

  if (isQuaHan(yeuCau)) {
    parts.push("⚠️ Quá hạn");
  } else if (isSapHetHan(yeuCau)) {
    parts.push("⏰ Sắp hết hạn");
  }

  return parts.join(" • ");
}
