/**
 * Navigation Helper for QuanLyCongViec Module
 *
 * Centralized route management with programmatic navigation.
 * All routes prefixed with /quanlycongviec/*
 *
 * Usage:
 *   import { WorkRoutes } from 'utils/navigationHelper';
 *   navigate(WorkRoutes.congViecDetail(id));
 */

/**
 * WorkRoutes - Route builder functions for QuanLyCongViec module
 */
export const WorkRoutes = {
  // ==================== Root ====================
  root: () => "/quanlycongviec",

  // ==================== Dashboard ====================
  dashboard: () => "/quanlycongviec/dashboard",

  // ==================== Công Việc (CongViec) ====================
  congViecDashboard: () => "/quanlycongviec/congviec/dashboard",
  congViecList: (nhanVienId = ":nhanVienId") =>
    `/quanlycongviec/congviec/nhanvien/${nhanVienId}`,
  congViecDetail: (id = ":id") => `/quanlycongviec/congviec/${id}`,
  congViecCreate: () => "/quanlycongviec/congviec/create",
  congViecEdit: (id = ":id") => `/quanlycongviec/congviec/${id}/edit`,

  // ==================== KPI ====================
  kpiDashboard: () => "/quanlycongviec/kpi/dashboard",
  kpiList: () => "/quanlycongviec/kpi",
  kpiDetail: (id = ":id") => `/quanlycongviec/kpi/${id}`,
  kpiCreate: () => "/quanlycongviec/kpi/create",
  kpiEdit: (id = ":id") => `/quanlycongviec/kpi/${id}/edit`,
  kpiApprove: (id = ":id") => `/quanlycongviec/kpi/${id}/approve`,

  // Báo cáo KPI
  baoCaoKPI: () => "/quanlycongviec/kpi/bao-cao",
  baoCaoKPIByNhanVien: (nhanVienId = ":nhanVienId") =>
    `/quanlycongviec/kpi/bao-cao/nhanvien/${nhanVienId}`,
  baoCaoKPIByPhongBan: (phongBanId = ":phongBanId") =>
    `/quanlycongviec/kpi/bao-cao/phongban/${phongBanId}`,

  // ==================== Nhiệm Vụ Thường Quy ====================
  nhiemVuThuongQuyList: () => "/quanlycongviec/nhiemvu-thuongquy",
  nhiemVuThuongQuyDetail: (id = ":id") =>
    `/quanlycongviec/nhiemvu-thuongquy/${id}`,
  nhiemVuThuongQuyCreate: () => "/quanlycongviec/nhiemvu-thuongquy/create",
  nhiemVuThuongQuyEdit: (id = ":id") =>
    `/quanlycongviec/nhiemvu-thuongquy/${id}/edit`,

  // Giao nhiệm vụ
  giaoNhiemVu: () => "/quanlycongviec/giao-nhiemvu",
  giaoNhiemVuCreate: () => "/quanlycongviec/giao-nhiemvu/create",

  // ==================== Yêu Cầu / Tickets ====================
  yeuCauList: () => "/quanlycongviec/yeucau",
  yeuCauDetail: (id = ":id") => `/quanlycongviec/yeucau/${id}`,
  yeuCauCreate: () => "/quanlycongviec/yeucau/create",
  yeuCauEdit: (id = ":id") => `/quanlycongviec/yeucau/${id}/edit`,

  // ==================== Cấu Hình / Configuration ====================
  cauHinh: () => "/quanlycongviec/cau-hinh",

  // Chu Kỳ (Cycle)
  chuKyList: () => "/quanlycongviec/cau-hinh/chu-ky",
  chuKyDetail: (id = ":id") => `/quanlycongviec/cau-hinh/chu-ky/${id}`,
  chuKyCreate: () => "/quanlycongviec/cau-hinh/chu-ky/create",
  chuKyEdit: (id = ":id") => `/quanlycongviec/cau-hinh/chu-ky/${id}/edit`,

  // Tiêu Chí (Criteria)
  tieuChiList: () => "/quanlycongviec/cau-hinh/tieu-chi",
  tieuChiDetail: (id = ":id") => `/quanlycongviec/cau-hinh/tieu-chi/${id}`,
  tieuChiCreate: () => "/quanlycongviec/cau-hinh/tieu-chi/create",
  tieuChiEdit: (id = ":id") => `/quanlycongviec/cau-hinh/tieu-chi/${id}/edit`,

  // Phòng Ban (Department)
  phongBanList: () => "/quanlycongviec/cau-hinh/phong-ban",
  phongBanDetail: (id = ":id") => `/quanlycongviec/cau-hinh/phong-ban/${id}`,
  phongBanCreate: () => "/quanlycongviec/cau-hinh/phong-ban/create",
  phongBanEdit: (id = ":id") => `/quanlycongviec/cau-hinh/phong-ban/${id}/edit`,

  // ==================== Quản Lý Nhân Viên ====================
  nhanVienList: () => "/quanlycongviec/quan-ly-nhan-vien",
  nhanVienDetail: (id = ":id") => `/quanlycongviec/quan-ly-nhan-vien/${id}`,
  nhanVienCreate: () => "/quanlycongviec/quan-ly-nhan-vien/create",
  nhanVienEdit: (id = ":id") => `/quanlycongviec/quan-ly-nhan-vien/${id}/edit`,

  // ==================== Thông Báo ====================
  thongBaoList: () => "/quanlycongviec/thong-bao",
  thongBaoDetail: (id = ":id") => `/quanlycongviec/thong-bao/${id}`,
};

/**
 * BreadcrumbConfig - Configuration for auto-generating breadcrumbs
 */
export const BreadcrumbConfig = {
  "/quanlycongviec": {
    label: "Quản lý công việc",
    icon: "work",
  },
  "/quanlycongviec/dashboard": {
    label: "Dashboard",
    icon: "dashboard",
  },

  // Công Việc
  "/quanlycongviec/congviec": {
    label: "Công việc",
    icon: "assignment",
  },
  "/quanlycongviec/congviec/dashboard": {
    label: "Dashboard công việc",
    icon: "dashboard",
  },
  "/quanlycongviec/congviec/nhanvien/:nhanVienId": {
    label: "Danh sách công việc",
    icon: "list",
    dynamic: true,
  },
  "/quanlycongviec/congviec/:id": {
    label: "Chi tiết công việc",
    icon: "description",
    dynamic: true,
    fetchLabel: async (id, apiService) => {
      try {
        const response = await apiService.get(`/workmanagement/congviec/${id}`);
        return response.data.data.TenCongViec || "Chi tiết công việc";
      } catch {
        return "Chi tiết công việc";
      }
    },
  },
  "/quanlycongviec/congviec/create": {
    label: "Tạo công việc mới",
    icon: "add",
  },
  "/quanlycongviec/congviec/:id/edit": {
    label: "Chỉnh sửa công việc",
    icon: "edit",
    dynamic: true,
  },

  // KPI
  "/quanlycongviec/kpi": {
    label: "Đánh giá KPI",
    icon: "assessment",
  },
  "/quanlycongviec/kpi/dashboard": {
    label: "Dashboard KPI",
    icon: "dashboard",
  },
  "/quanlycongviec/kpi/:id": {
    label: "Chi tiết KPI",
    icon: "description",
    dynamic: true,
  },
  "/quanlycongviec/kpi/create": {
    label: "Tạo đánh giá KPI",
    icon: "add",
  },
  "/quanlycongviec/kpi/bao-cao": {
    label: "Báo cáo KPI",
    icon: "bar_chart",
  },

  // Nhiệm Vụ Thường Quy
  "/quanlycongviec/nhiemvu-thuongquy": {
    label: "Nhiệm vụ thường quy",
    icon: "repeat",
  },
  "/quanlycongviec/nhiemvu-thuongquy/:id": {
    label: "Chi tiết nhiệm vụ",
    icon: "description",
    dynamic: true,
  },
  "/quanlycongviec/giao-nhiemvu": {
    label: "Giao nhiệm vụ",
    icon: "send",
  },

  // Yêu Cầu
  "/quanlycongviec/yeucau": {
    label: "Yêu cầu",
    icon: "help",
  },
  "/quanlycongviec/yeucau/:id": {
    label: "Chi tiết yêu cầu",
    icon: "description",
    dynamic: true,
  },

  // Cấu Hình
  "/quanlycongviec/cau-hinh": {
    label: "Cấu hình",
    icon: "settings",
  },
  "/quanlycongviec/cau-hinh/chu-ky": {
    label: "Chu kỳ",
    icon: "schedule",
  },
  "/quanlycongviec/cau-hinh/tieu-chi": {
    label: "Tiêu chí",
    icon: "checklist",
  },
  "/quanlycongviec/cau-hinh/phong-ban": {
    label: "Phòng ban",
    icon: "business",
  },

  // Quản Lý Nhân Viên
  "/quanlycongviec/quan-ly-nhan-vien": {
    label: "Quản lý nhân viên",
    icon: "people",
  },
  "/quanlycongviec/quan-ly-nhan-vien/:id": {
    label: "Thông tin nhân viên",
    icon: "person",
    dynamic: true,
  },

  // Thông Báo
  "/quanlycongviec/thong-bao": {
    label: "Thông báo",
    icon: "notifications",
  },
};

/**
 * Helper function to get breadcrumb items for a given pathname
 * @param {string} pathname - Current URL pathname
 * @returns {Array} Array of breadcrumb items
 */
export function getBreadcrumbs(pathname) {
  const paths = pathname.split("/").filter(Boolean);
  const breadcrumbs = [
    {
      label: "Trang chủ",
      path: "/",
      icon: "home",
    },
  ];

  let currentPath = "";
  for (let i = 0; i < paths.length; i++) {
    currentPath += `/${paths[i]}`;

    // Find matching config (exact or pattern match)
    let config = BreadcrumbConfig[currentPath];

    // If not found, try pattern matching for dynamic segments
    if (!config) {
      const patternKeys = Object.keys(BreadcrumbConfig).filter((key) =>
        key.includes(":")
      );
      for (const patternKey of patternKeys) {
        const pattern = patternKey.split("/").filter(Boolean);
        const current = currentPath.split("/").filter(Boolean);

        if (pattern.length === current.length) {
          let matches = true;
          for (let j = 0; j < pattern.length; j++) {
            if (pattern[j].startsWith(":")) continue;
            if (pattern[j] !== current[j]) {
              matches = false;
              break;
            }
          }
          if (matches) {
            config = BreadcrumbConfig[patternKey];
            break;
          }
        }
      }
    }

    if (config) {
      breadcrumbs.push({
        label: config.label,
        path: currentPath,
        icon: config.icon,
        dynamic: config.dynamic,
        fetchLabel: config.fetchLabel,
      });
    }
  }

  return breadcrumbs;
}

/**
 * Helper function to navigate programmatically
 * @param {Function} navigate - React Router navigate function
 * @param {string} path - Destination path
 * @param {Object} options - Navigation options (replace, state, etc.)
 */
export function navigateTo(navigate, path, options = {}) {
  navigate(path, options);
}

/**
 * Helper function to go back
 * @param {Function} navigate - React Router navigate function
 * @param {string} fallbackPath - Fallback path if history is empty
 */
export function goBack(navigate, fallbackPath = "/quanlycongviec") {
  if (window.history.length > 1) {
    navigate(-1);
  } else {
    navigate(fallbackPath);
  }
}

/**
 * Get query params from current URL
 * @param {Object} searchParams - URLSearchParams from useSearchParams
 * @returns {Object} Query parameters as object
 */
export function getQueryParams(searchParams) {
  const params = {};
  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }
  return params;
}

/**
 * Build URL with query params
 * @param {string} basePath - Base path
 * @param {Object} params - Query parameters
 * @returns {string} Complete URL with query string
 */
export function buildUrlWithParams(basePath, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

const navigationHelpers = {
  WorkRoutes,
  BreadcrumbConfig,
  getBreadcrumbs,
  navigateTo,
  goBack,
  getQueryParams,
  buildUrlWithParams,
};

export default navigationHelpers;
