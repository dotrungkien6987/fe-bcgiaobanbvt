/**
 * Ticket Module - Main exports
 */

// Redux slices
export { default as yeuCauReducer } from "./yeuCauSlice";
export { default as danhMucYeuCauReducer } from "./danhMucYeuCauSlice";
export { default as cauHinhKhoaReducer } from "./cauHinhKhoaSlice";
export { default as lyDoTuChoiAdminReducer } from "./LyDoTuChoi/lyDoTuChoiSlice";

// Selectively export actions/selectors to avoid conflicts
export {
  // Thunks
  getYeuCauList,
  getYeuCauDetail,
  createYeuCau,
  updateYeuCau,
  deleteYeuCau,
  tiepNhanYeuCau,
  tuChoiYeuCau,
  hoanThanhYeuCau,
  dongYeuCau,
  moLaiYeuCau,
  // Selectors
  selectYeuCauState,
  selectYeuCauList,
  selectYeuCauDetail,
  selectFilters,
  selectActiveTab,
  selectDashboardMetrics,
} from "./yeuCauSlice";

// DanhMuc slice exports (renamed to avoid conflicts)
export {
  getDanhMucByKhoa as getDanhMucYeuCauByKhoa,
  selectDanhMucList as selectDanhMucYeuCauList,
} from "./danhMucYeuCauSlice";

// CauHinhKhoa slice exports
export {
  getCauHinhByKhoa,
  createCauHinhKhoa,
  addQuanLyKhoa,
  removeQuanLyKhoa,
  addNguoiDieuPhoi,
  removeNguoiDieuPhoi,
  getNhanVienTheoKhoa,
  selectCauHinhHienTai,
  selectCauHinhList,
  selectCauHinhLoading,
  selectNhanVienTheoKhoa,
} from "./cauHinhKhoaSlice";

// Components
export * from "./components";

// Pages
export { default as YeuCauPage } from "./YeuCauPage";
export { default as YeuCauDetailPage } from "./YeuCauDetailPage";
export { default as CauHinhKhoaAdminPage } from "./CauHinhKhoaAdminPage";
export { default as DanhMucYeuCauAdminPage } from "./DanhMucYeuCauAdminPage";
export { default as LyDoTuChoiAdminPage } from "./LyDoTuChoi/LyDoTuChoiAdminPage";

// Role-based pages (New)
export { default as YeuCauToiGuiPage } from "./YeuCauToiGuiPage";
export { default as YeuCauXuLyPage } from "./YeuCauXuLyPage";
export { default as YeuCauDieuPhoiPage } from "./YeuCauDieuPhoiPage";
export { default as YeuCauQuanLyKhoaPage } from "./YeuCauQuanLyKhoaPage";
