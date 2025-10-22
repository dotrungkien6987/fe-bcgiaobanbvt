import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import apiService from "app/apiService";

// Initial state
const initialState = {
  // Data states
  danhGiaKPIs: [], // Danh sách đánh giá KPI
  danhGiaKPICurrent: null, // Đánh giá KPI đang xem/chỉnh sửa
  nhiemVuThuongQuys: [], // Danh sách nhiệm vụ thường quy của KPI hiện tại
  // ✅ V2 list used by reducers approve/undo (avoid undefined.findIndex)
  danhSachDanhGiaKPI: [],
  thongKeKPIs: [], // Thống kê KPI theo chu kỳ
  tieuChiDanhGias: [], // Danh sách tiêu chí đánh giá (TANG_DIEM/GIAM_DIEM)
  chuKyDanhGias: [], // Danh sách chu kỳ đánh giá
  selectedChuKyDanhGia: null, // Chu kỳ đánh giá đang xem chi tiết
  nhanVienDuocQuanLy: [], // Danh sách nhân viên được quản lý (theo QuanLyNhanVien)

  // V2 Features - Auto-select & Dashboard
  autoSelectedChuKy: null, // Chu kỳ được auto-select (3-tier priority)
  dashboardData: {
    nhanVienList: [], // Array of { nhanVien, danhGiaKPI, progress }
    summary: {
      totalNhanVien: 0,
      completed: 0,
      inProgress: 0,
      notStarted: 0,
    },
  },

  // V2 Features - Chi tiết chấm điểm (khi mở dialog)
  currentDanhGiaKPI: null, // Unified: replace danhGiaKPICurrent
  currentNhiemVuList: [], // Unified: replace nhiemVuThuongQuys
  syncWarning: null, // ← NEW: Criteria change detection { hasChanges, added, removed, modified, canReset }

  // UI states
  isLoading: false,
  isSaving: false, // V2: separate saving state
  error: null,
  isOpenFormDialog: false, // Dialog form tạo/sửa KPI
  isOpenDetailDialog: false, // Dialog xem chi tiết KPI
  formMode: "create", // "create" hoặc "edit"

  // Filter/Search states
  filterChuKyID: null, // Lọc theo chu kỳ
  filterNhanVienID: null, // Lọc theo nhân viên
  filterTrangThai: null, // Lọc theo trạng thái (CHUA_DUYET/DA_DUYET)
  searchTerm: "", // V2: search in dashboard
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

    // Nhân viên được quản lý
    getNhanVienDuocQuanLySuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.nhanVienDuocQuanLy = action.payload;
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

    // ==================== V2 REDUCERS ====================

    startSaving(state) {
      state.isSaving = true;
    },
    stopSaving(state) {
      state.isSaving = false;
    },

    // Auto-select chu kỳ
    autoSelectChuKySuccess(state, action) {
      state.isLoading = false;
      state.autoSelectedChuKy = action.payload.chuKy;
      state.filterChuKyID = action.payload.chuKy?._id || null;
    },

    // Get dashboard data
    getDashboardDataSuccess(state, action) {
      state.isLoading = false;
      state.dashboardData = action.payload;
    },

    // Get chi tiết chấm điểm (V2 - replace getDanhGiaKPIDetailSuccess)
    getChamDiemDetailSuccess(state, action) {
      state.isLoading = false;
      state.currentDanhGiaKPI = action.payload.danhGiaKPI;
      // ✅ Ensure nhiemVuList has proper structure with ChiTietDiem array
      state.currentNhiemVuList = (action.payload.nhiemVuList || []).map(
        (nv) => ({
          ...nv,
          ChiTietDiem: nv.ChiTietDiem || [],
          TongDiemTieuChi: nv.TongDiemTieuChi || 0,
          DiemNhiemVu: nv.DiemNhiemVu || 0,
        })
      );
      state.syncWarning = action.payload.syncWarning || null; // ← NEW: Store sync warning
    },

    // Clear sync warning (when user dismisses the alert)
    clearSyncWarning(state) {
      state.syncWarning = null;
    },

    // Update điểm tiêu chí (local state, chưa save)
    // ✅ FIX: Changed from tieuChiId to tieuChiIndex
    // ✅ FIX: Find by _id, NhiemVuThuongQuyID._id, or index for rows without _id
    updateTieuChiScore(state, action) {
      const { nhiemVuId, tieuChiIndex, diemDat } = action.payload;

      // Try to find by _id first, then by NhiemVuThuongQuyID._id, then by index
      const nhiemVu = state.currentNhiemVuList.find((nv, idx) => {
        if (nv._id && String(nv._id) === String(nhiemVuId)) return true;
        if (
          nv.NhiemVuThuongQuyID?._id &&
          String(nv.NhiemVuThuongQuyID._id) === String(nhiemVuId)
        )
          return true;
        if (idx === nhiemVuId) return true; // fallback to index
        return false;
      });

      if (nhiemVu && nhiemVu.ChiTietDiem[tieuChiIndex]) {
        // Direct access by index (no more TieuChiID lookup)
        nhiemVu.ChiTietDiem[tieuChiIndex].DiemDat = diemDat;

        // Recalculate nhiệm vụ score (correct formula: all divide by 100)
        nhiemVu.TongDiemTieuChi = nhiemVu.ChiTietDiem.reduce((sum, tc) => {
          const score = (tc.DiemDat || 0) / 100;
          return sum + (tc.LoaiTieuChi === "GIAM_DIEM" ? -score : score);
        }, 0);

        nhiemVu.DiemNhiemVu = nhiemVu.TongDiemTieuChi * (nhiemVu.MucDoKho || 5);
      }

      // Recalculate tổng điểm KPI
      if (state.currentDanhGiaKPI) {
        state.currentDanhGiaKPI.TongDiemKPI = state.currentNhiemVuList.reduce(
          (sum, nv) => sum + (nv.DiemNhiemVu || 0),
          0
        );
      }
    },

    // Lưu điểm nhiệm vụ (backend response)
    saveDiemNhiemVuSuccess(state, action) {
      state.isSaving = false;
      const { nhiemVuUpdated, danhGiaKPIUpdated } = action.payload;

      // Update nhiệm vụ trong list
      const index = state.currentNhiemVuList.findIndex(
        (nv) => nv._id === nhiemVuUpdated._id
      );
      if (index !== -1) {
        state.currentNhiemVuList[index] = nhiemVuUpdated;
      }

      // Update tổng điểm KPI
      if (state.currentDanhGiaKPI) {
        state.currentDanhGiaKPI.TongDiemKPI = danhGiaKPIUpdated.TongDiemKPI;
      }

      // Update trong dashboard data
      const nvInDashboard = state.dashboardData.nhanVienList.find(
        (item) => item.danhGiaKPI?._id === danhGiaKPIUpdated._id
      );
      if (nvInDashboard) {
        nvInDashboard.danhGiaKPI = danhGiaKPIUpdated;
        nvInDashboard.progress = calculateProgress(state.currentNhiemVuList);
      }
    },

    // ✅ ENHANCED: Duyệt KPI success với update state đầy đủ
    approveKPISuccess(state, action) {
      state.isSaving = false;
      state.isLoading = false;

      const approvedKPI = action.payload.danhGiaKPI;

      // Update current DanhGiaKPI
      if (state.currentDanhGiaKPI) {
        state.currentDanhGiaKPI = approvedKPI;
      }

      // Update trong danh sách
      if (!Array.isArray(state.danhSachDanhGiaKPI)) {
        state.danhSachDanhGiaKPI = [];
      }
      const index = state.danhSachDanhGiaKPI.findIndex(
        (item) => item._id === approvedKPI._id
      );
      if (index !== -1) {
        state.danhSachDanhGiaKPI[index] = approvedKPI;
      }

      // Update trong dashboard
      const nvInDashboard = state.dashboardData.nhanVienList.find(
        (item) => item.danhGiaKPI?._id === approvedKPI._id
      );
      if (nvInDashboard) {
        nvInDashboard.danhGiaKPI = approvedKPI;
      }

      // Update summary
      updateDashboardSummary(state);
    },

    // ✅ NEW: Hủy duyệt KPI success
    undoApproveKPISuccess(state, action) {
      state.isLoading = false;
      state.isSaving = false;

      const undoneKPI = action.payload.danhGiaKPI;

      // Update current DanhGiaKPI
      if (state.currentDanhGiaKPI) {
        state.currentDanhGiaKPI = undoneKPI;
      }

      // Update trong danh sách
      if (!Array.isArray(state.danhSachDanhGiaKPI)) {
        state.danhSachDanhGiaKPI = [];
      }
      const index = state.danhSachDanhGiaKPI.findIndex(
        (item) => item._id === undoneKPI._id
      );
      if (index !== -1) {
        state.danhSachDanhGiaKPI[index] = undoneKPI;
      }

      // Update trong dashboard
      const nvInDashboard = state.dashboardData.nhanVienList.find(
        (item) => item.danhGiaKPI?._id === undoneKPI._id
      );
      if (nvInDashboard) {
        nvInDashboard.danhGiaKPI = undoneKPI;
      }

      // Update summary
      updateDashboardSummary(state);
    },

    // UI actions (V2)
    setSearchTerm(state, action) {
      state.searchTerm = action.payload;
    },
    clearCurrentChamDiem(state) {
      state.currentDanhGiaKPI = null;
      state.currentNhiemVuList = [];
    },
  },
});

// Helper functions for V2
function calculateProgress(nhiemVuList) {
  const total = nhiemVuList.length;
  const scored = nhiemVuList.filter((nv) => nv.TongDiemTieuChi > 0).length;
  return { scored, total, percentage: total > 0 ? (scored / total) * 100 : 0 };
}

function updateDashboardSummary(state) {
  const { nhanVienList } = state.dashboardData;
  const completed = nhanVienList.filter(
    (item) => item.danhGiaKPI?.TrangThai === "DA_DUYET"
  ).length;
  const inProgress = nhanVienList.filter(
    (item) =>
      item.danhGiaKPI?.TrangThai === "CHUA_DUYET" && item.progress?.scored > 0
  ).length;
  const notStarted = nhanVienList.filter(
    (item) => !item.danhGiaKPI || item.progress?.scored === 0
  ).length;

  state.dashboardData.summary = {
    totalNhanVien: nhanVienList.length,
    completed,
    inProgress,
    notStarted,
  };
}

export default slice.reducer;

// ====================
// ACTIONS - Đánh giá KPI
// ====================

// ✅ Helper: Safe extraction of danhGiaKPI from API response
function pickDanhGiaKPI(res) {
  return (
    res?.data?.data?.danhGiaKPI ||
    res?.data?.danhGiaKPI ||
    res?.danhGiaKPI ||
    null
  );
}

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

      // ✅ FIX: Thêm prefix /workmanagement
      const response = await apiService.get(
        `/workmanagement/kpi?${queryParams.toString()}`
      );
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
    // ✅ FIX: Thêm prefix /workmanagement
    const response = await apiService.get(
      `/workmanagement/kpi/${danhGiaKPIId}`
    );
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
    // ✅ FIX: Thêm prefix /workmanagement
    const response = await apiService.post("/workmanagement/kpi", data);
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
    // ✅ FIX: Thêm prefix /workmanagement
    const response = await apiService.put(
      `/workmanagement/kpi/${danhGiaKPIId}`,
      data
    );
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
    // ✅ FIX: Thêm prefix /workmanagement
    await apiService.delete(`/workmanagement/kpi/${danhGiaKPIId}`);
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
    // ✅ FIX: Route backend là /nhiem-vu/:id, không phải /cham-diem/:id
    const response = await apiService.put(
      `/workmanagement/kpi/nhiem-vu/${nhiemVuId}`,
      data
    );
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
    // ✅ FIX: Thêm prefix /workmanagement
    const response = await apiService.put(
      `/workmanagement/kpi/${danhGiaKPIId}/duyet`
    );
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
    // ✅ FIX: Thêm prefix /workmanagement
    const response = await apiService.put(
      `/workmanagement/kpi/${danhGiaKPIId}/huy-duyet`
    );
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
    // ✅ FIX: Thêm prefix /workmanagement
    const response = await apiService.get(
      `/workmanagement/kpi/thong-ke/${chuKyDanhGiaId}`
    );
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
 * @param {Object} data - { TenTieuChi, MoTa, LoaiTieuChi, GiaTriMin, GiaTriMax, DonVi }
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
 * @param {Object} data - { TenTieuChi, MoTa, LoaiTieuChi, GiaTriMin, GiaTriMax, DonVi }
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
 * @param {Object} data - { TenChuKy, Thang, Nam, NgayBatDau, NgayKetThuc, MoTa, TieuChiCauHinh }
 */
export const createChuKyDanhGia = (data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    console.log("🚀 Creating ChuKy with payload:", data); // DEBUG
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
 * @param {Object} payload - { id, data } - data includes TieuChiCauHinh
 */
export const updateChuKyDanhGia =
  ({ id, data }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      console.log("🔄 Updating ChuKy:", id, "with payload:", data); // DEBUG
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
 * Lấy tiêu chí từ chu kỳ trước để copy
 */
export const getPreviousCriteria = () => async (dispatch) => {
  try {
    const response = await apiService.get(
      "/workmanagement/chu-ky-danh-gia/previous-criteria"
    );
    toast.success(`Đã copy tiêu chí từ "${response.data.data.chuKyName}"`);
    return response.data.data.tieuChi;
  } catch (error) {
    toast.error(error.message || "Không tìm thấy chu kỳ trước có tiêu chí");
    return [];
  }
};

/**
 * Xóa chu kỳ đánh giá (soft delete với validation cascade)
 * @param {String} chuKyId
 *
 * Business Rules:
 * - Không cho xóa chu kỳ đã hoàn thành (isDong = true)
 * - Kiểm tra có DanhGiaKPI liên quan không
 * - Nếu có đánh giá → Backend reject với message chi tiết
 */
export const deleteChuKyDanhGia = (chuKyId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.delete(
      `/workmanagement/chu-ky-danh-gia/${chuKyId}`
    );
    dispatch(slice.actions.deleteChuKyDanhGiaSuccess(chuKyId));
    toast.success("Xóa chu kỳ đánh giá thành công");
    return response.data.data; // Return data for component
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    // Error message từ backend rất chi tiết, ví dụ:
    // "Không thể xóa chu kỳ đánh giá vì đã có 5 bản đánh giá liên quan..."
    toast.error(error.message);
    throw error; // Throw để component catch được
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

/**
 * Lấy danh sách nhân viên mà current user được phép quản lý
 * Dùng cho KPI/Giao việc - Dựa vào bảng QuanLyNhanVien
 *
 * @param {String} loaiQuanLy - "KPI" hoặc "Giao_Viec"
 */
export const getNhanVienDuocQuanLy =
  (loaiQuanLy = "KPI") =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await apiService.get(
        "/workmanagement/quan-ly-nhan-vien/nhan-vien-duoc-quan-ly",
        { params: { LoaiQuanLy: loaiQuanLy } }
      );
      dispatch(
        slice.actions.getNhanVienDuocQuanLySuccess(response.data.data.nhanviens)
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

// ====================
// V2 THUNK ACTIONS - Dashboard & Auto-select
// ====================

/**
 * Auto-select chu kỳ phù hợp nhất
 * Logic: 3-tier priority
 * 1. Chu kỳ ACTIVE (today trong khoảng [TuNgay, DenNgay])
 * 2. Chu kỳ GẦN NHẤT (trong vòng 5 ngày)
 * 3. Chu kỳ MỚI NHẤT (fallback)
 */
export const autoSelectChuKy = () => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.get(
      "/workmanagement/chu-ky-danh-gia/auto-select"
    );

    const { chuKy, suggestion, info } = response.data.data;

    if (chuKy) {
      // Log selection reason for debugging
      if (info?.selectionReason) {
        console.log(`✅ Auto-select chu kỳ: ${info.message}`, {
          reason: info.selectionReason,
          chuKy: chuKy.TenChuKy,
        });
      }

      dispatch(slice.actions.autoSelectChuKySuccess({ chuKy }));
    } else {
      // Không tìm thấy chu kỳ nào
      dispatch(
        slice.actions.hasError(
          suggestion?.message || "Không tìm thấy chu kỳ đánh giá"
        )
      );
      toast.warning(suggestion?.message || "Không tìm thấy chu kỳ đánh giá", {
        autoClose: 5000,
      });
    }
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

/**
 * Lấy dashboard data cho chu kỳ cụ thể
 * Trả về: Danh sách nhân viên + điểm KPI + progress
 */
export const getDashboardData = (chuKyId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.get(
      `/workmanagement/kpi/dashboard/${chuKyId}`
    );
    dispatch(slice.actions.getDashboardDataSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

/**
 * Lấy chi tiết để chấm điểm
 * V2 - Gọi endpoint /cham-diem-tieu-chi (auto-create nếu chưa có)
 * Trả về: DanhGiaKPI + DanhGiaNhiemVuThuongQuy[] với ChiTietDiem từ TieuChiCauHinh
 */
export const getChamDiemDetail = (chuKyId, nhanVienId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    // Gọi endpoint mới - Criteria-based KPI evaluation
    const response = await apiService.get(
      "/workmanagement/kpi/cham-diem-tieu-chi",
      {
        params: { chuKyId, nhanVienId },
      }
    );

    dispatch(
      slice.actions.getChamDiemDetailSuccess({
        danhGiaKPI: response.data.data.danhGiaKPI,
        nhiemVuList: response.data.data.danhGiaNhiemVuList,
        syncWarning: null, // Can add criteria sync detection later if needed
      })
    );
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

/**
 * Lưu điểm nhiệm vụ (V2 - optimized endpoint)
 */
export const saveDiemNhiemVu = (nhiemVuId, chiTietDiem) => async (dispatch) => {
  dispatch(slice.actions.startSaving());
  try {
    const response = await apiService.put(
      `/workmanagement/kpi/nhiem-vu/${nhiemVuId}/cham-diem`,
      { ChiTietDiem: chiTietDiem }
    );

    dispatch(slice.actions.saveDiemNhiemVuSuccess(response.data.data));
    toast.success("Đã lưu điểm nhiệm vụ");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

/**
 * ✅ ENHANCED: Lưu nháp tất cả điểm nhiệm vụ (batch save)
 * - Filter nhiệm vụ có điểm
 * - Better error messages
 * - Show progress count
 */
export const saveAllNhiemVu = () => async (dispatch, getState) => {
  dispatch(slice.actions.startSaving());

  try {
    const { currentNhiemVuList, currentDanhGiaKPI } = getState().kpi;

    if (!currentDanhGiaKPI?._id) {
      throw new Error("Không tìm thấy thông tin đánh giá KPI");
    }

    // Filter: Chỉ gửi nhiệm vụ có điểm
    const nhiemVuWithScores = currentNhiemVuList.filter((nv) => {
      const hasScore = nv.ChiTietDiem?.some((cd) => cd.DiemDat > 0);
      return hasScore;
    });

    if (nhiemVuWithScores.length === 0) {
      toast.warning("Vui lòng chấm điểm ít nhất 1 nhiệm vụ trước khi lưu");
      dispatch(slice.actions.stopSaving());
      return;
    }

    // Prepare payload
    const payload = {
      nhiemVuList: nhiemVuWithScores.map((nv) => ({
        NhiemVuThuongQuyID:
          typeof nv.NhiemVuThuongQuyID === "object"
            ? nv.NhiemVuThuongQuyID._id
            : nv.NhiemVuThuongQuyID,
        MucDoKho: nv.MucDoKho,
        ChiTietDiem: nv.ChiTietDiem.map((cd) => ({
          TenTieuChi: cd.TenTieuChi,
          LoaiTieuChi: cd.LoaiTieuChi,
          DiemDat: cd.DiemDat || 0,
          GiaTriMin: cd.GiaTriMin,
          GiaTriMax: cd.GiaTriMax,
          DonVi: cd.DonVi,
          MoTa: cd.MoTa,
          GhiChu: cd.GhiChu,
        })),
        GhiChu: nv.GhiChu || "",
      })),
    };

    const response = await apiService.post(
      `/workmanagement/kpi/luu-tat-ca/${currentDanhGiaKPI._id}`,
      payload
    );

    // Update state với data mới từ backend
    dispatch(
      slice.actions.getChamDiemDetailSuccess({
        danhGiaKPI: response.data.data.danhGiaKPI,
        nhiemVuList: response.data.data.danhGiaNhiemVuList,
      })
    );

    dispatch(slice.actions.stopSaving());

    // ✅ ENHANCED: Better success message with count
    toast.success(
      `✅ Đã lưu nháp ${nhiemVuWithScores.length} nhiệm vụ thành công!`
    );

    // ✅ NEW: Reload employees list to update table
    const cycleId = currentDanhGiaKPI.ChuKyID?._id || currentDanhGiaKPI.ChuKyID;
    if (cycleId) {
      // Import dynamically to avoid circular dependency
      const { getEmployeesForEvaluation } = await import(
        "./kpiEvaluationSlice"
      );
      dispatch(getEmployeesForEvaluation(cycleId));
    }
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(`❌ Lỗi lưu nháp: ${error.message}`);
  }
};

/**
 * ✅ ENHANCED: Duyệt KPI với transaction atomic
 * - Validate tất cả nhiệm vụ có điểm
 * - Gửi payload đầy đủ cho batch upsert
 * - Backend xử lý trong transaction
 */
export const approveKPI = (danhGiaKPIId) => async (dispatch, getState) => {
  dispatch(slice.actions.startSaving());

  try {
    const { currentNhiemVuList } = getState().kpi;

    // Validate: Tất cả nhiệm vụ phải có điểm
    const allScored = currentNhiemVuList.every((nv) => nv.TongDiemTieuChi > 0);

    if (!allScored) {
      const unscoredCount = currentNhiemVuList.filter(
        (nv) => nv.TongDiemTieuChi === 0
      ).length;
      toast.error(
        `Còn ${unscoredCount} nhiệm vụ chưa chấm điểm. Vui lòng hoàn thành trước khi duyệt KPI.`
      );
      dispatch(slice.actions.stopSaving());
      return;
    }

    // Prepare payload - Tất cả nhiệm vụ với điểm đầy đủ
    const payload = {
      nhiemVuList: currentNhiemVuList.map((nv) => ({
        _id: nv._id,
        NhiemVuThuongQuyID:
          typeof nv.NhiemVuThuongQuyID === "object"
            ? nv.NhiemVuThuongQuyID._id
            : nv.NhiemVuThuongQuyID,
        MucDoKho: nv.MucDoKho,
        ChiTietDiem: nv.ChiTietDiem.map((cd) => ({
          TenTieuChi: cd.TenTieuChi,
          LoaiTieuChi: cd.LoaiTieuChi,
          DiemDat: cd.DiemDat,
          GiaTriMin: cd.GiaTriMin,
          GiaTriMax: cd.GiaTriMax,
          DonVi: cd.DonVi,
          MoTa: cd.MoTa,
          GhiChu: cd.GhiChu,
        })),
        TongDiemTieuChi: nv.TongDiemTieuChi,
        DiemNhiemVu: nv.DiemNhiemVu,
      })),
    };

    // Call approve endpoint với transaction
    const response = await apiService.post(
      `/workmanagement/kpi/duyet-kpi-tieu-chi/${danhGiaKPIId}`,
      payload
    );

    const dg = pickDanhGiaKPI(response);
    if (!dg) {
      throw new Error("Phản hồi không hợp lệ: thiếu dữ liệu danhGiaKPI");
    }

    dispatch(slice.actions.approveKPISuccess({ danhGiaKPI: dg }));

    // ✅ ENHANCED: Success message với tổng điểm
    const tongDiem = dg.TongDiemKPI || 0;
    toast.success(`✅ Duyệt KPI thành công! Tổng điểm: ${tongDiem.toFixed(1)}`);

    // ✅ NEW: Reload employees list to update table
    const { currentDanhGiaKPI } = getState().kpi;
    const cycleId =
      currentDanhGiaKPI?.ChuKyID?._id || currentDanhGiaKPI?.ChuKyID;
    if (cycleId) {
      // Import dynamically to avoid circular dependency
      const { getEmployeesForEvaluation } = await import(
        "./kpiEvaluationSlice"
      );
      dispatch(getEmployeesForEvaluation(cycleId));
    }
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

/**
 * ✅ NEW: Hủy duyệt KPI
 * @param {Object} payload - { danhGiaKPIId: String, lyDo: String }
 */
export const undoApproveKPI = (payload) => async (dispatch, getState) => {
  dispatch(slice.actions.startSaving());
  try {
    const { danhGiaKPIId, lyDo } = payload;

    const response = await apiService.post(
      `/workmanagement/kpi/huy-duyet-kpi/${danhGiaKPIId}`,
      { lyDo }
    );

    const dg = pickDanhGiaKPI(response);
    if (!dg) {
      throw new Error("Phản hồi không hợp lệ: thiếu dữ liệu danhGiaKPI");
    }

    dispatch(slice.actions.undoApproveKPISuccess({ danhGiaKPI: dg }));

    toast.success("✅ Đã hủy duyệt KPI thành công! Có thể chỉnh sửa lại điểm.");

    // ✅ NEW: Reload employees list to update table
    const { currentDanhGiaKPI } = getState().kpi;
    const cycleId =
      currentDanhGiaKPI?.ChuKyID?._id || currentDanhGiaKPI?.ChuKyID;
    if (cycleId) {
      // Import dynamically to avoid circular dependency
      const { getEmployeesForEvaluation } = await import(
        "./kpiEvaluationSlice"
      );
      dispatch(getEmployeesForEvaluation(cycleId));
    }
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(`❌ Lỗi hủy duyệt KPI: ${error.message}`);
  }
};

/**
 * Local update điểm tiêu chí (chưa save backend)
 * Dùng cho real-time feedback khi user nhập điểm
 * ✅ FIX: Changed from tieuChiId to tieuChiIndex (no more TieuChiID references)
 */
export const updateTieuChiScoreLocal =
  (nhiemVuId, tieuChiIndex, diemDat) => (dispatch) => {
    dispatch(
      slice.actions.updateTieuChiScore({ nhiemVuId, tieuChiIndex, diemDat })
    );
  };

/**
 * Reset ChiTietDiem to match ChuKy.TieuChiCauHinh
 * V2 - Soft merge: preserve DiemDat + GhiChu where TenTieuChi matches
 */
export const resetCriteria = (danhGiaKPIId) => async (dispatch) => {
  dispatch(slice.actions.startSaving());
  try {
    const response = await apiService.post(
      "/workmanagement/kpi/reset-criteria",
      { danhGiaKPIId }
    );

    const { chuKyId, nhanVienId } = response.data.data;

    // ✅ FIX: Fetch lại data mới sau khi reset
    const refreshResponse = await apiService.get(
      "/workmanagement/kpi/cham-diem",
      {
        params: { chuKyId, nhanVienId },
      }
    );

    // Update with fresh data (syncWarning should be null if successful)
    dispatch(
      slice.actions.getChamDiemDetailSuccess({
        danhGiaKPI: refreshResponse.data.data.danhGiaKPI,
        nhiemVuList: refreshResponse.data.data.nhiemVuList,
        syncWarning: null, // Clear warning after successful sync
      })
    );

    toast.success(
      "Đã đồng bộ tiêu chí thành công. Điểm đã chấm được giữ nguyên."
    );
  } catch (error) {
    dispatch(slice.actions.stopSaving());
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

// V2 UI helpers
export const setSearchTerm = (term) => (dispatch) => {
  dispatch(slice.actions.setSearchTerm(term));
};

export const clearCurrentChamDiem = () => (dispatch) => {
  dispatch(slice.actions.clearCurrentChamDiem());
};

export const clearSyncWarning = () => (dispatch) => {
  dispatch(slice.actions.clearSyncWarning());
};
