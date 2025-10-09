import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import apiService from "app/apiService";

// Initial state
const initialState = {
  // Data states
  danhGiaKPIs: [], // Danh sách đánh giá KPI
  danhGiaKPICurrent: null, // Đánh giá KPI đang xem/chỉnh sửa
  nhiemVuThuongQuys: [], // Danh sách nhiệm vụ thường quy của KPI hiện tại
  thongKeKPIs: [], // Thống kê KPI theo chu kỳ
  tieuChiDanhGias: [], // Danh sách tiêu chí đánh giá (TANG_DIEM/GIAM_DIEM)
  chuKyDanhGias: [], // Danh sách chu kỳ đánh giá
  selectedChuKyDanhGia: null, // Chu kỳ đánh giá đang xem chi tiết

  // UI states
  isLoading: false,
  error: null,
  isOpenFormDialog: false, // Dialog form tạo/sửa KPI
  isOpenDetailDialog: false, // Dialog xem chi tiết KPI
  formMode: "create", // "create" hoặc "edit"

  // Filter/Search states
  filterChuKyID: null, // Lọc theo chu kỳ
  filterNhanVienID: null, // Lọc theo nhân viên
  filterTrangThai: null, // Lọc theo trạng thái (CHUA_DUYET/DA_DUYET)
};

// Create slice
const slice = createSlice({
  name: "kpi",
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

    // Đánh giá KPI CRUD
    getDanhGiaKPIsSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.danhGiaKPIs = action.payload;
    },
    getDanhGiaKPIDetailSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.danhGiaKPICurrent = action.payload.danhGiaKPI;
      state.nhiemVuThuongQuys = action.payload.nhiemVuThuongQuys || [];
    },
    createDanhGiaKPISuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.danhGiaKPIs.unshift(action.payload);
      state.danhGiaKPICurrent = action.payload;
    },
    updateDanhGiaKPISuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const index = state.danhGiaKPIs.findIndex(
        (item) => item._id === action.payload._id
      );
      if (index !== -1) {
        state.danhGiaKPIs[index] = action.payload;
      }
      state.danhGiaKPICurrent = action.payload;
    },
    deleteDanhGiaKPISuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.danhGiaKPIs = state.danhGiaKPIs.filter(
        (item) => item._id !== action.payload
      );
      if (state.danhGiaKPICurrent?._id === action.payload) {
        state.danhGiaKPICurrent = null;
        state.nhiemVuThuongQuys = [];
      }
    },

    // Chấm điểm nhiệm vụ thường quy
    chamDiemNhiemVuSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const { nhiemVuUpdated, danhGiaKPIUpdated } = action.payload;

      // Cập nhật nhiemVuThuongQuys list
      const nvIndex = state.nhiemVuThuongQuys.findIndex(
        (item) => item._id === nhiemVuUpdated._id
      );
      if (nvIndex !== -1) {
        state.nhiemVuThuongQuys[nvIndex] = nhiemVuUpdated;
      }

      // Cập nhật danhGiaKPICurrent với TongDiemKPI mới
      if (state.danhGiaKPICurrent?._id === danhGiaKPIUpdated._id) {
        state.danhGiaKPICurrent = danhGiaKPIUpdated;
      }

      // Cập nhật trong danh sách danhGiaKPIs
      const kpiIndex = state.danhGiaKPIs.findIndex(
        (item) => item._id === danhGiaKPIUpdated._id
      );
      if (kpiIndex !== -1) {
        state.danhGiaKPIs[kpiIndex] = danhGiaKPIUpdated;
      }
    },

    // Duyệt/hủy duyệt KPI
    duyetDanhGiaKPISuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const updatedKPI = action.payload;

      // Cập nhật danhGiaKPICurrent
      if (state.danhGiaKPICurrent?._id === updatedKPI._id) {
        state.danhGiaKPICurrent = updatedKPI;
      }

      // Cập nhật trong danh sách
      const index = state.danhGiaKPIs.findIndex(
        (item) => item._id === updatedKPI._id
      );
      if (index !== -1) {
        state.danhGiaKPIs[index] = updatedKPI;
      }
    },

    // Thống kê KPI
    getThongKeKPIsSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.thongKeKPIs = action.payload;
    },

    // Tiêu chí đánh giá
    getTieuChiDanhGiasSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.tieuChiDanhGias = action.payload;
    },
    createTieuChiDanhGiaSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.tieuChiDanhGias.unshift(action.payload);
    },
    updateTieuChiDanhGiaSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const index = state.tieuChiDanhGias.findIndex(
        (item) => item._id === action.payload._id
      );
      if (index !== -1) {
        state.tieuChiDanhGias[index] = action.payload;
      }
    },
    deleteTieuChiDanhGiaSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      // Soft delete: Cập nhật isDeleted = true thay vì xóa khỏi array
      const index = state.tieuChiDanhGias.findIndex(
        (item) => item._id === action.payload
      );
      if (index !== -1) {
        state.tieuChiDanhGias[index].isDeleted = true;
      }
    },

    // Chu kỳ đánh giá
    getChuKyDanhGiasSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.chuKyDanhGias = action.payload;
    },
    createChuKyDanhGiaSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.chuKyDanhGias.unshift(action.payload);
    },
    updateChuKyDanhGiaSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const index = state.chuKyDanhGias.findIndex(
        (item) => item._id === action.payload._id
      );
      if (index !== -1) {
        state.chuKyDanhGias[index] = action.payload;
      }
    },
    deleteChuKyDanhGiaSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      // Soft delete: set isDeleted = true
      const index = state.chuKyDanhGias.findIndex(
        (item) => item._id === action.payload
      );
      if (index !== -1) {
        state.chuKyDanhGias[index].isDeleted = true;
      }
    },
    dongChuKySuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const index = state.chuKyDanhGias.findIndex(
        (item) => item._id === action.payload._id
      );
      if (index !== -1) {
        state.chuKyDanhGias[index] = action.payload;
      }
    },
    moChuKySuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const index = state.chuKyDanhGias.findIndex(
        (item) => item._id === action.payload._id
      );
      if (index !== -1) {
        state.chuKyDanhGias[index] = action.payload;
      }
    },
    getChuKyDanhGiaByIdSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.selectedChuKyDanhGia = action.payload;
    },

    // UI state management
    setIsOpenFormDialog(state, action) {
      state.isOpenFormDialog = action.payload;
    },
    setIsOpenDetailDialog(state, action) {
      state.isOpenDetailDialog = action.payload;
    },
    setFormMode(state, action) {
      state.formMode = action.payload;
    },
    setFilterChuKyID(state, action) {
      state.filterChuKyID = action.payload;
    },
    setFilterNhanVienID(state, action) {
      state.filterNhanVienID = action.payload;
    },
    setFilterTrangThai(state, action) {
      state.filterTrangThai = action.payload;
    },
    clearDanhGiaKPICurrent(state) {
      state.danhGiaKPICurrent = null;
      state.nhiemVuThuongQuys = [];
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export default slice.reducer;

// ====================
// ACTIONS - Đánh giá KPI
// ====================

/**
 * Lấy danh sách đánh giá KPI với filter
 * @param {Object} filters - { ChuKyDanhGiaID, NhanVienID, TrangThai }
 */
export const getDanhGiaKPIs =
  (filters = {}) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const queryParams = new URLSearchParams();
      if (filters.ChuKyDanhGiaID)
        queryParams.append("ChuKyDanhGiaID", filters.ChuKyDanhGiaID);
      if (filters.NhanVienID)
        queryParams.append("NhanVienID", filters.NhanVienID);
      if (filters.TrangThai) queryParams.append("TrangThai", filters.TrangThai);

      const response = await apiService.get(`/kpi?${queryParams.toString()}`);
      dispatch(
        slice.actions.getDanhGiaKPIsSuccess(response.data.data.danhGiaKPIs)
      );
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

/**
 * Lấy chi tiết đánh giá KPI kèm nhiệm vụ thường quy
 * @param {String} danhGiaKPIId
 */
export const getDanhGiaKPIDetail = (danhGiaKPIId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.get(`/kpi/${danhGiaKPIId}`);
    dispatch(slice.actions.getDanhGiaKPIDetailSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

/**
 * Tạo mới đánh giá KPI
 * @param {Object} data - { ChuKyDanhGiaID, NhanVienID }
 */
export const createDanhGiaKPI = (data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.post("/kpi", data);
    dispatch(
      slice.actions.createDanhGiaKPISuccess(response.data.data.danhGiaKPI)
    );
    toast.success("Tạo đánh giá KPI thành công");
    return response.data.data.danhGiaKPI;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
    throw error;
  }
};

/**
 * Cập nhật thông tin đánh giá KPI (ví dụ: GhiChu)
 * @param {String} danhGiaKPIId
 * @param {Object} data - { GhiChu }
 */
export const updateDanhGiaKPI = (danhGiaKPIId, data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.put(`/kpi/${danhGiaKPIId}`, data);
    dispatch(
      slice.actions.updateDanhGiaKPISuccess(response.data.data.danhGiaKPI)
    );
    toast.success("Cập nhật đánh giá KPI thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

/**
 * Xóa đánh giá KPI (soft delete)
 * @param {String} danhGiaKPIId
 */
export const deleteDanhGiaKPI = (danhGiaKPIId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    await apiService.delete(`/kpi/${danhGiaKPIId}`);
    dispatch(slice.actions.deleteDanhGiaKPISuccess(danhGiaKPIId));
    toast.success("Xóa đánh giá KPI thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

/**
 * Chấm điểm nhiệm vụ thường quy
 * @param {String} nhiemVuId
 * @param {Object} data - { MucDoKho, ChiTietDiem: [{ TieuChiDanhGiaID, DiemDat, GhiChu }] }
 */
export const chamDiemNhiemVu = (nhiemVuId, data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.put(`/kpi/cham-diem/${nhiemVuId}`, data);
    dispatch(slice.actions.chamDiemNhiemVuSuccess(response.data.data));
    toast.success("Chấm điểm nhiệm vụ thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

/**
 * Duyệt đánh giá KPI
 * @param {String} danhGiaKPIId
 */
export const duyetDanhGiaKPI = (danhGiaKPIId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.put(`/kpi/${danhGiaKPIId}/duyet`);
    dispatch(
      slice.actions.duyetDanhGiaKPISuccess(response.data.data.danhGiaKPI)
    );
    toast.success("Duyệt đánh giá KPI thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

/**
 * Hủy duyệt đánh giá KPI
 * @param {String} danhGiaKPIId
 */
export const huyDuyetDanhGiaKPI = (danhGiaKPIId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.put(`/kpi/${danhGiaKPIId}/huy-duyet`);
    dispatch(
      slice.actions.duyetDanhGiaKPISuccess(response.data.data.danhGiaKPI)
    );
    toast.success("Hủy duyệt đánh giá KPI thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

/**
 * Lấy thống kê KPI theo chu kỳ
 * @param {String} chuKyDanhGiaId
 */
export const getThongKeKPITheoChuKy = (chuKyDanhGiaId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.get(`/kpi/thong-ke/${chuKyDanhGiaId}`);
    dispatch(slice.actions.getThongKeKPIsSuccess(response.data.data.thongKe));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

// ====================
// ACTIONS - Tiêu chí đánh giá
// ====================

/**
 * Lấy danh sách tiêu chí đánh giá
 * @param {Object} filters - { LoaiTieuChi: "TANG_DIEM" | "GIAM_DIEM" }
 */
export const getTieuChiDanhGias =
  (filters = {}) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const queryParams = new URLSearchParams();
      if (filters.LoaiTieuChi)
        queryParams.append("LoaiTieuChi", filters.LoaiTieuChi);

      const response = await apiService.get(
        `/workmanagement/tieu-chi-danh-gia?${queryParams.toString()}`
      );
      dispatch(
        slice.actions.getTieuChiDanhGiasSuccess(response.data.data.tieuChis)
      );
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

/**
 * Tạo tiêu chí đánh giá
 * @param {Object} data - { TenTieuChi, MoTa, LoaiTieuChi, DiemToiDa, TrongSo }
 */
export const createTieuChiDanhGia = (data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.post(
      "/workmanagement/tieu-chi-danh-gia",
      data
    );
    dispatch(
      slice.actions.createTieuChiDanhGiaSuccess(response.data.data.tieuChi)
    );
    toast.success("Tạo tiêu chí đánh giá thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

/**
 * Cập nhật tiêu chí đánh giá
 * @param {String} tieuChiId
 * @param {Object} data - { TenTieuChi, MoTa, LoaiTieuChi, DiemToiDa, TrongSo }
 */
export const updateTieuChiDanhGia = (tieuChiId, data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.put(
      `/workmanagement/tieu-chi-danh-gia/${tieuChiId}`,
      data
    );
    dispatch(
      slice.actions.updateTieuChiDanhGiaSuccess(response.data.data.tieuChi)
    );
    toast.success("Cập nhật tiêu chí đánh giá thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

/**
 * Xóa tiêu chí đánh giá
 * @param {String} tieuChiId
 */
export const deleteTieuChiDanhGia = (tieuChiId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    await apiService.delete(`/workmanagement/tieu-chi-danh-gia/${tieuChiId}`);
    dispatch(slice.actions.deleteTieuChiDanhGiaSuccess(tieuChiId));
    toast.success("Xóa tiêu chí đánh giá thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

// ====================
// ACTIONS - Chu kỳ đánh giá
// ====================

/**
 * Lấy danh sách chu kỳ đánh giá
 * @param {Object} filters - { isDong, thang, nam }
 */
export const getChuKyDanhGias =
  (filters = {}) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const queryParams = new URLSearchParams();
      if (filters.isDong !== undefined)
        queryParams.append("isDong", filters.isDong);
      if (filters.thang) queryParams.append("thang", filters.thang);
      if (filters.nam) queryParams.append("nam", filters.nam);

      const response = await apiService.get(
        `/workmanagement/chu-ky-danh-gia?${queryParams.toString()}`
      );
      dispatch(
        slice.actions.getChuKyDanhGiasSuccess(response.data.data.danhSach)
      );
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

/**
 * Tạo chu kỳ đánh giá
 * @param {Object} data - { TenChuKy, Thang, Nam, NgayBatDau, NgayKetThuc, MoTa }
 */
export const createChuKyDanhGia = (data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.post(
      "/workmanagement/chu-ky-danh-gia",
      data
    );
    dispatch(slice.actions.createChuKyDanhGiaSuccess(response.data.data.chuKy));
    toast.success("Tạo chu kỳ đánh giá thành công");
    return response.data.data.chuKy;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
    throw error; // Throw lại để component biết có lỗi
  }
};

/**
 * Cập nhật chu kỳ đánh giá
 * @param {Object} payload - { id, data }
 */
export const updateChuKyDanhGia =
  ({ id, data }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await apiService.put(
        `/workmanagement/chu-ky-danh-gia/${id}`,
        data
      );
      dispatch(
        slice.actions.updateChuKyDanhGiaSuccess(response.data.data.chuKy)
      );
      toast.success("Cập nhật chu kỳ đánh giá thành công");
      return response.data.data.chuKy;
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
      throw error;
    }
  };

/**
 * Xóa chu kỳ đánh giá (soft delete)
 * @param {String} chuKyId
 */
export const deleteChuKyDanhGia = (chuKyId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    await apiService.delete(`/workmanagement/chu-ky-danh-gia/${chuKyId}`);
    dispatch(slice.actions.deleteChuKyDanhGiaSuccess(chuKyId));
    toast.success("Xóa chu kỳ đánh giá thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
    throw error;
  }
};

/**
 * Đóng chu kỳ đánh giá
 * @param {String} chuKyId
 */
export const dongChuKy = (chuKyId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.put(
      `/workmanagement/chu-ky-danh-gia/${chuKyId}/dong`
    );
    dispatch(slice.actions.dongChuKySuccess(response.data.data.chuKy));
    toast.success("Đóng chu kỳ đánh giá thành công");
    return response.data.data.chuKy;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
    throw error;
  }
};

/**
 * Mở lại chu kỳ đánh giá
 * @param {String} chuKyId
 */
export const moChuKy = (chuKyId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.put(
      `/workmanagement/chu-ky-danh-gia/${chuKyId}/mo`
    );
    dispatch(slice.actions.moChuKySuccess(response.data.data.chuKy));
    toast.success("Mở lại chu kỳ đánh giá thành công");
    return response.data.data.chuKy;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
    throw error;
  }
};

/**
 * Lấy chi tiết chu kỳ đánh giá theo ID
 * @param {String} chuKyId
 */
export const getChuKyDanhGiaById = (chuKyId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.get(
      `/workmanagement/chu-ky-danh-gia/${chuKyId}`
    );
    dispatch(
      slice.actions.getChuKyDanhGiaByIdSuccess(response.data.data.chuKy)
    );
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

// ====================
// UI Helper Actions
// ====================

export const openFormDialog =
  (mode = "create", item = null) =>
  (dispatch) => {
    dispatch(slice.actions.setFormMode(mode));
    if (mode === "edit" && item) {
      dispatch(
        slice.actions.getDanhGiaKPIDetailSuccess({
          danhGiaKPI: item,
          nhiemVuThuongQuys: [],
        })
      );
    }
    dispatch(slice.actions.setIsOpenFormDialog(true));
  };

export const closeFormDialog = () => (dispatch) => {
  dispatch(slice.actions.setIsOpenFormDialog(false));
  dispatch(slice.actions.clearDanhGiaKPICurrent());
};

export const openDetailDialog = (danhGiaKPIId) => async (dispatch) => {
  await dispatch(getDanhGiaKPIDetail(danhGiaKPIId));
  dispatch(slice.actions.setIsOpenDetailDialog(true));
};

export const closeDetailDialog = () => (dispatch) => {
  dispatch(slice.actions.setIsOpenDetailDialog(false));
  dispatch(slice.actions.clearDanhGiaKPICurrent());
};

// ====================
// Filter Actions
// ====================

export const setFilterChuKyID = (chuKyId) => (dispatch) => {
  dispatch(slice.actions.setFilterChuKyID(chuKyId));
};

export const setFilterNhanVienID = (nhanVienId) => (dispatch) => {
  dispatch(slice.actions.setFilterNhanVienID(nhanVienId));
};

export const setFilterTrangThai = (trangThai) => (dispatch) => {
  dispatch(slice.actions.setFilterTrangThai(trangThai));
};
