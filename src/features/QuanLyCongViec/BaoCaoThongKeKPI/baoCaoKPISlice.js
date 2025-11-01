import { createSlice } from "@reduxjs/toolkit";
import apiService from "app/apiService";
import { toast } from "react-toastify";

const initialState = {
  isLoading: false,
  error: null,

  // Thống kê data
  tongQuan: null,
  phanBoMucDiem: [],
  theoKhoa: [],
  topNhanVienXuatSac: [],
  nhanVienCanCaiThien: [],
  phanBoTrangThai: null,

  // Chi tiết data
  danhSachChiTiet: [],
  pagination: {
    total: 0,
    page: 0,
    limit: 10,
    totalPages: 0,
  },

  // Filters state
  filters: {
    chuKyId: "",
    khoaId: "",
  },
};

const slice = createSlice({
  name: "baoCaoKPI",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
      state.error = null;
    },

    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    getThongKeSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const data = action.payload;
      state.tongQuan = data.tongQuan;
      state.phanBoMucDiem = data.phanBoMucDiem;
      state.theoKhoa = data.theoKhoa;
      state.topNhanVienXuatSac = data.topNhanVienXuatSac;
      state.nhanVienCanCaiThien = data.nhanVienCanCaiThien;
      state.phanBoTrangThai = data.phanBoTrangThai;
    },

    getChiTietSuccess(state, action) {
      state.isLoading = false;
      state.danhSachChiTiet = action.payload.danhSach;
      state.pagination = action.payload.pagination;
    },

    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },

    resetFilters(state) {
      state.filters = initialState.filters;
    },

    resetBaoCao(state) {
      return initialState;
    },
  },
});

export default slice.reducer;

// ============================================
// ACTIONS
// ============================================

/**
 * Lấy thống kê tổng hợp KPI
 */
export const getThongKeKPI = (filters) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const params = {};
    if (filters.chuKyId) params.chuKyId = filters.chuKyId;
    if (filters.khoaId) params.khoaId = filters.khoaId;

    console.log("🔄 getThongKeKPI - Calling API with params:", params);

    const response = await apiService.get(
      "/workmanagement/kpi/bao-cao/thong-ke",
      { params }
    );

    console.log("✅ getThongKeKPI - API response:", response.data);

    // API response structure: { success: true, data: { tongQuan, phanBoMucDiem, ... } }
    const responseData = response.data.data || response.data;
    console.log("✅ getThongKeKPI - Dispatching data:", responseData);

    dispatch(slice.actions.getThongKeSuccess(responseData));
    toast.success("Tải dữ liệu thống kê thành công!");
  } catch (error) {
    console.error("❌ getThongKeKPI - Error:", error);
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

/**
 * Lấy danh sách chi tiết KPI (cho table)
 */
export const getChiTietKPI =
  (filters, page = 0, limit = 10, search = "") =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (filters.chuKyId) params.chuKyId = filters.chuKyId;
      if (filters.khoaId) params.khoaId = filters.khoaId;

      const response = await apiService.get(
        "/workmanagement/kpi/bao-cao/chi-tiet",
        { params }
      );

      const responseData = response.data.data || response.data;
      dispatch(slice.actions.getChiTietSuccess(responseData));
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

/**
 * Xuất báo cáo Excel
 */
export const exportExcelKPI = (filters) => async (dispatch) => {
  try {
    const params = {};
    if (filters.chuKyId) params.chuKyId = filters.chuKyId;
    if (filters.khoaId) params.khoaId = filters.khoaId;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;

    toast.info("Đang xuất báo cáo Excel...");

    const response = await apiService.get(
      "/workmanagement/kpi/bao-cao/export-excel",
      {
        params,
        responseType: "blob",
      }
    );

    // Download file
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `BaoCaoKPI_${Date.now()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    toast.success("Xuất báo cáo Excel thành công");
  } catch (error) {
    toast.error(error.message || "Lỗi xuất báo cáo Excel");
  }
};

/**
 * Xuất báo cáo PDF (Future implementation)
 */
export const exportPDFKPI = (filters) => async (dispatch) => {
  try {
    const params = {};
    if (filters.chuKyId) params.chuKyId = filters.chuKyId;
    if (filters.khoaId) params.khoaId = filters.khoaId;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;

    toast.info("Đang xuất báo cáo PDF...");

    const response = await apiService.get(
      "/workmanagement/kpi/bao-cao/export-pdf",
      {
        params,
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `BaoCaoKPI_${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    toast.success("Xuất báo cáo PDF thành công");
  } catch (error) {
    toast.error(error.message || "Lỗi xuất báo cáo PDF");
  }
};

// Export actions
export const { setFilters, resetFilters, resetBaoCao } = slice.actions;
