import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

// Format date time for display
export const formatDateTime = (dateString) => {
  if (!dateString) return "Chưa xác định";
  return dayjs(dateString).format("DD/MM/YYYY HH:mm");
};

// Format date only
export const formatDate = (dateString) => {
  if (!dateString) return "Chưa xác định";
  return dayjs(dateString).format("DD/MM/YYYY");
};

// Format relative time
export const formatRelativeTime = (dateString) => {
  if (!dateString) return "Chưa xác định";
  return dayjs(dateString).fromNow();
};

// Check if date is overdue
export const isOverdue = (dueDateString) => {
  if (!dueDateString) return false;
  return dayjs().isAfter(dayjs(dueDateString));
};

// Màu hex cụ thể cho từng trạng thái
export const STATUS_COLOR_MAP = {
  // Backend codes
  TAO_MOI: "#2196F3", // Xanh nhạt - Trạng thái mới
  DA_GIAO: "#1939B7", // Xanh đậm brand - Đã giao chính thức
  DANG_THUC_HIEN: "#1976D2", // Xanh primary - Đang hoạt động
  CHO_DUYET: "#9C27B0", // Tím - Chờ phê duyệt
  HOAN_THANH: "#388E3C", // Xanh lá đậm - Hoàn thành
};

// Màu hex cho mức ưu tiên
export const PRIORITY_COLOR_MAP = {
  THAP: "#4CAF50", // Xanh lá - An toàn
  BINH_THUONG: "#2196F3", // Xanh - Bình thường
  CAO: "#FF9800", // Cam - Cảnh báo
  KHAN_CAP: "#F44336", // Đỏ - Khẩn cấp
};

// Nhãn hiển thị tiếng Việt cho từng trạng thái (theo code chuẩn hóa)
export const STATUS_LABEL_MAP = {
  TAO_MOI: "Tạo mới",
  DA_GIAO: "Đã giao",
  DANG_THUC_HIEN: "Đang thực hiện",
  CHO_DUYET: "Chờ duyệt",
  HOAN_THANH: "Hoàn thành",
};

// Nhãn hành động workflow / lịch sử – dùng chung cho UI (table, toast)
export const ACTION_LABEL_MAP = {
  CREATE: "Tạo",
  ASSIGN: "Giao việc",
  GIAO_VIEC: "Giao việc",
  HUY_GIAO: "Hủy giao",
  ACCEPT: "Chấp nhận",
  TIEP_NHAN: "Tiếp nhận",
  START: "Bắt đầu",
  SUBMIT: "Trình duyệt",
  APPROVE: "Duyệt",
  DUYET_HOAN_THANH: "Duyệt hoàn thành",
  COMPLETE: "Hoàn thành",
  HOAN_THANH: "Hoàn thành",
  HOAN_THANH_TAM: "Hoàn thành tạm",
  HUY_HOAN_THANH_TAM: "Hủy hoàn thành tạm",
  REOPEN: "Mở lại",
  MO_LAI_HOAN_THANH: "Mở lại",
  CANCEL: "Hủy",
  UPDATE: "Cập nhật",
};

// Nhãn hiển thị tiếng Việt cho mức ưu tiên (theo code chuẩn hóa)
export const PRIORITY_LABEL_MAP = {
  THAP: "Thấp",
  BINH_THUONG: "Bình thường",
  CAO: "Cao",
  KHAN_CAP: "Khẩn cấp",
};

// Helper function to normalize status
const normalizeStatus = (status) => {
  if (!status) return null;
  const normalized = status.toString().toUpperCase();

  // Map Vietnamese labels to codes
  const labelToCode = {
    MỚI: "TAO_MOI",
    "ĐÃ GIAO": "DA_GIAO",
    "ĐANG THỰC HIỆN": "DANG_THUC_HIEN",
    "CHỜ DUYỆT": "CHO_DUYET",
    "HOÀN THÀNH": "HOAN_THANH",
  };

  return labelToCode[normalized] || normalized;
};

// Helper function to normalize priority
const normalizePriority = (priority) => {
  if (!priority) return null;
  const normalized = priority.toString().toUpperCase();

  // Map Vietnamese labels to codes
  const labelToCode = {
    THẤP: "THAP",
    "BÌNH THƯỜNG": "BINH_THUONG",
    CAO: "CAO",
    "RẤT CAO": "KHAN_CAP",
    "KHẨN CẤP": "KHAN_CAP",
  };

  return labelToCode[normalized] || normalized;
};

// Get status color for MUI components - now returns hex color
export const getStatusColor = (status, overrides) => {
  const normalized = normalizeStatus(status);
  if (!normalized) return "#757575";
  const overrideColor = overrides?.[normalized];
  return overrideColor || STATUS_COLOR_MAP[normalized] || "#757575"; // default gray
};

// Get priority color for MUI components - now returns hex color
export const getPriorityColor = (priority, overrides) => {
  const normalized = normalizePriority(priority);
  if (!normalized) return "#757575";
  const overrideColor = overrides?.[normalized];
  return overrideColor || PRIORITY_COLOR_MAP[normalized] || "#757575"; // default gray
};

// Get progress color based on percentage and due date
export const getProgressColor = (progress, dueDate) => {
  const isTaskOverdue = isOverdue(dueDate);

  if (progress >= 100) return "success";
  if (isTaskOverdue) return "error";
  if (progress >= 75) return "success";
  if (progress >= 50) return "warning";
  if (progress >= 25) return "info";
  return "error";
};

// Calculate days until due date
export const getDaysUntilDue = (dueDateString) => {
  if (!dueDateString) return null;
  const dueDate = dayjs(dueDateString);
  const now = dayjs();
  return dueDate.diff(now, "day");
};

// Get status text for display
export const getStatusText = (status) => {
  const code = normalizeStatus(status);
  if (!code) return "";
  return STATUS_LABEL_MAP[code] || status || "";
};

// Lấy nhãn hành động tiếng Việt chuẩn hóa
export const getActionLabel = (action) => {
  if (!action) return "";
  const up = action.toString().toUpperCase();
  const label = ACTION_LABEL_MAP[up];
  if (label) return label;
  // fallback: chuyển underscore thành space, viết hoa chữ đầu mỗi từ
  return up
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
};

// Due status helpers
// Legacy (simple) due status maps (kept for backward compatibility)
export const DUE_LABEL_MAP = {
  SAP_QUA_HAN: "Sắp quá hạn",
  QUA_HAN: "Quá hạn",
};

export const DUE_COLOR_MAP = {
  SAP_QUA_HAN: "#FB8C00", // orange
  QUA_HAN: "#D32F2F", // red
};

// Extended due status (flow v2)
// DUNG_HAN | SAP_QUA_HAN | QUA_HAN | HOAN_THANH_TRE_HAN | HOAN_THANH_DUNG_HAN
export const EXT_DUE_LABEL_MAP = {
  DUNG_HAN: "Đúng hạn",
  SAP_QUA_HAN: "Sắp quá hạn",
  QUA_HAN: "Quá hạn",
  HOAN_THANH_TRE_HAN: "Hoàn thành trễ hạn",
  HOAN_THANH_DUNG_HAN: "Hoàn thành đúng hạn",
};

export const EXT_DUE_COLOR_MAP = {
  DUNG_HAN: "#2E7D32", // green
  SAP_QUA_HAN: "#FB8C00", // orange
  QUA_HAN: "#D32F2F", // red
  HOAN_THANH_TRE_HAN: "#8E24AA", // purple
  HOAN_THANH_DUNG_HAN: "#0277BD", // blue
};

// New extended computation (fallback when BE chưa trả TinhTrangThoiHan)
export const computeExtendedDueStatus = (cv) => {
  if (!cv) return null;
  const now = dayjs();
  const hetHan = cv.NgayHetHan ? dayjs(cv.NgayHetHan) : null;
  const canhBao = cv.NgayCanhBao ? dayjs(cv.NgayCanhBao) : null;
  const isCompleted = cv.TrangThai === "HOAN_THANH";
  const ngayHoanThanh = cv.NgayHoanThanh ? dayjs(cv.NgayHoanThanh) : null;
  if (isCompleted) {
    if (ngayHoanThanh && hetHan && ngayHoanThanh.isAfter(hetHan)) {
      return "HOAN_THANH_TRE_HAN";
    }
    return "HOAN_THANH_DUNG_HAN";
  }
  if (hetHan && now.isAfter(hetHan)) return "QUA_HAN";
  if (
    canhBao &&
    hetHan &&
    (now.isAfter(canhBao) || now.isSame(canhBao)) &&
    now.isBefore(hetHan)
  )
    return "SAP_QUA_HAN";
  return "DUNG_HAN";
};

// Legacy simple getter (kept for old UI pieces still referencing it)
export const getDueStatus = (cv) => {
  if (!cv || cv.TrangThai === "HOAN_THANH") return null;
  const status = computeExtendedDueStatus(cv);
  // Only surface legacy codes for non-completed tasks
  if (["SAP_QUA_HAN", "QUA_HAN"].includes(status)) return status;
  return null;
};

// Unified accessor preferring BE field (TinhTrangThoiHan) else fallback
export const getExtendedDueStatus = (cv) => {
  if (!cv) return null;
  return cv.TinhTrangThoiHan || computeExtendedDueStatus(cv);
};

// Alias (more concise name) for UI usage / future refactor
export const computeDueStatus = computeExtendedDueStatus;

// Compute số giờ trễ (dùng khi quá hạn hoặc hoàn thành trễ)
export const computeSoGioTre = (cv) => {
  if (!cv) return 0;
  const ext = getExtendedDueStatus(cv);
  const hetHan = cv.NgayHetHan ? dayjs(cv.NgayHetHan) : null;
  if (!hetHan) return 0;
  if (ext === "QUA_HAN") {
    return Math.max(0, dayjs().diff(hetHan, "hour"));
  }
  if (ext === "HOAN_THANH_TRE_HAN") {
    const done = cv.NgayHoanThanh ? dayjs(cv.NgayHoanThanh) : null;
    if (done) return Math.max(0, done.diff(hetHan, "hour"));
  }
  return 0;
};

// Get priority text for display
export const getPriorityText = (priority) => {
  const code = normalizePriority(priority);
  if (!code) return "";
  return PRIORITY_LABEL_MAP[code] || priority || "";
};

// Validate work data
export const validateCongViec = (data) => {
  const errors = {};

  if (!data.TieuDe?.trim()) {
    errors.TieuDe = "Tiêu đề là bắt buộc";
  } else if (data.TieuDe.length > 200) {
    errors.TieuDe = "Tiêu đề không được quá 200 ký tự";
  }

  if (data.MoTa && data.MoTa.length > 2000) {
    errors.MoTa = "Mô tả không được quá 2000 ký tự";
  }

  if (!data.NgayBatDau) {
    errors.NgayBatDau = "Ngày bắt đầu là bắt buộc";
  }

  if (!data.NgayHetHan) {
    errors.NgayHetHan = "Ngày hết hạn là bắt buộc";
  } else if (
    data.NgayBatDau &&
    dayjs(data.NgayHetHan).isBefore(dayjs(data.NgayBatDau))
  ) {
    errors.NgayHetHan = "Ngày hết hạn phải sau ngày bắt đầu";
  }

  if (!data.NguoiChinh) {
    errors.NguoiChinh = "Người thực hiện chính là bắt buộc";
  }

  if (!data.MucDoUuTien) {
    errors.MucDoUuTien = "Mức độ ưu tiên là bắt buộc";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Sort work items by priority and due date
export const sortCongViecs = (
  congViecs,
  sortBy = "NgayHetHan",
  sortOrder = "asc"
) => {
  return [...congViecs].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case "NgayHetHan":
        aValue = dayjs(a.NgayHetHan);
        bValue = dayjs(b.NgayHetHan);
        break;
      case "NgayTao":
        aValue = dayjs(a.NgayTao);
        bValue = dayjs(b.NgayTao);
        break;
      case "MucDoUuTien":
        const priorityOrder = {
          "Rất cao": 4,
          Cao: 3,
          "Bình thường": 2,
          Thấp: 1,
        };
        aValue = priorityOrder[a.MucDoUuTien] || 0;
        bValue = priorityOrder[b.MucDoUuTien] || 0;
        break;
      case "TienDo":
        aValue = a.TienDo || 0;
        bValue = b.TienDo || 0;
        break;
      default:
        aValue = a[sortBy] || "";
        bValue = b[sortBy] || "";
    }

    if (sortOrder === "desc") {
      return bValue > aValue ? 1 : -1;
    }
    return aValue > bValue ? 1 : -1;
  });
};

// Filter work items
export const filterCongViecs = (congViecs, filters) => {
  return congViecs.filter((item) => {
    // Status filter
    if (filters.trangThai && item.TrangThai !== filters.trangThai) {
      return false;
    }

    // Priority filter
    if (filters.mucDoUuTien && item.MucDoUuTien !== filters.mucDoUuTien) {
      return false;
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const searchFields = [
        item.TieuDe,
        item.MoTa,
        item.NguoiGiaoViec?.HoTen,
        item.NguoiChinh?.HoTen,
        ...(item.Tags || []),
      ].filter(Boolean);

      const hasMatch = searchFields.some((field) =>
        field.toLowerCase().includes(searchLower)
      );

      if (!hasMatch) return false;
    }

    // Date range filter
    if (filters.tuNgay) {
      const tuNgay = dayjs(filters.tuNgay).startOf("day");
      const ngayBatDau = dayjs(item.NgayBatDau);
      if (ngayBatDau.isBefore(tuNgay)) return false;
    }

    if (filters.denNgay) {
      const denNgay = dayjs(filters.denNgay).endOf("day");
      const ngayHetHan = dayjs(item.NgayHetHan);
      if (ngayHetHan.isAfter(denNgay)) return false;
    }

    // Overdue filter
    if (filters.quaHan === true && !isOverdue(item.NgayHetHan)) {
      return false;
    }
    if (filters.quaHan === false && isOverdue(item.NgayHetHan)) {
      return false;
    }

    return true;
  });
};

// Get work statistics
export const getCongViecStats = (congViecs) => {
  const stats = {
    total: congViecs.length,
    new: 0,
    inProgress: 0,
    paused: 0,
    completed: 0,
    cancelled: 0,
    overdue: 0,
    highPriority: 0,
  };

  congViecs.forEach((item) => {
    switch (item.TrangThai) {
      case "Mới":
        stats.new++;
        break;
      case "Đang thực hiện":
        stats.inProgress++;
        break;
      case "Tạm dừng":
        stats.paused++;
        break;
      case "Hoàn thành":
        stats.completed++;
        break;
      case "Hủy":
        stats.cancelled++;
        break;
      default:
        // Không làm gì cho trạng thái không xác định
        break;
    }

    if (isOverdue(item.NgayHetHan) && item.TrangThai !== "Hoàn thành") {
      stats.overdue++;
    }

    if (["Cao", "Rất cao"].includes(item.MucDoUuTien)) {
      stats.highPriority++;
    }
  });

  return stats;
};
