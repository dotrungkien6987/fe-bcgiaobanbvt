/**
 * YeuCau (Ticket/Support Request) Redux Slice
 *
 * Quản lý state cho hệ thống yêu cầu hỗ trợ giữa các Khoa
 *
 * @version 1.0.0
 * @date 2024-12-01
 */
import { createSlice } from "@reduxjs/toolkit";
import apiService from "app/apiService";
import { toast } from "react-toastify";

// ============== CONSTANTS ==============
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

// ============== INITIAL STATE ==============
const initialState = {
  isLoading: false,
  error: null,

  // Danh sách yêu cầu
  yeuCauList: [],
  totalItems: 0,
  totalPages: 0,
  currentPage: 1,

  // Chi tiết yêu cầu đang xem
  yeuCauDetail: null,
  availableActions: [], // Actions khả dụng cho yêu cầu hiện tại
  detailLoading: false,

  // Dashboard metrics
  dashboardMetrics: null,
  dashboardLoading: false,

  // Bình luận
  binhLuanList: [],
  binhLuanLoading: false,

  // Tệp tin
  tepTinList: [],
  tepTinLoading: false,

  // Lịch sử
  lichSuList: [],
  lichSuLoading: false,

  // Filters
  filters: {
    search: "",
    KhoaTaoID: "",
    KhoaXuLyID: "",
    DanhMucYeuCauID: "",
    TrangThai: [],
    TuNgay: null,
    DenNgay: null,
    NhanVienTaoID: "",
    NhanVienXuLyID: "",
  },

  // Tab: 'sent' (tôi gửi) | 'received' (gửi đến khoa tôi)
  activeTab: "sent",

  // Action loading states
  actionLoading: false,
  actionType: null, // 'tiepNhan', 'tuChoi', 'hoanThanh', etc.

  // Master data
  danhMucList: [],
  danhMucLoading: false,
  lyDoTuChoiList: [],
  lyDoTuChoiLoading: false,
  cauHinhKhoa: null,
  cauHinhLoading: false,

  // Badge counts
  badgeCounts: {}, // { pageKey: { tabKey: count } }
  badgeCountsLoading: false,
};

// ============== SLICE ==============
const slice = createSlice({
  name: "yeuCau",
  initialState,
  reducers: {
    // Loading states
    startLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    hasError: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // List
    getYeuCauListSuccess: (state, action) => {
      state.isLoading = false;
      const { items, totalItems, totalPages, currentPage } = action.payload;
      state.yeuCauList = items;
      state.totalItems = totalItems;
      state.totalPages = totalPages;
      state.currentPage = currentPage;
    },

    // Detail
    startDetailLoading: (state) => {
      state.detailLoading = true;
    },
    getYeuCauDetailSuccess: (state, action) => {
      state.detailLoading = false;
      // API trả về { yeuCau, availableActions } - tách riêng
      state.yeuCauDetail = action.payload.yeuCau;
      state.availableActions = action.payload.availableActions;
    },
    clearYeuCauDetail: (state) => {
      state.yeuCauDetail = null;
      state.availableActions = [];
      state.binhLuanList = [];
      state.tepTinList = [];
      state.lichSuList = [];
    },

    // Create/Update/Delete
    createYeuCauSuccess: (state, action) => {
      state.isLoading = false;
      state.yeuCauList = [action.payload, ...(state.yeuCauList || [])];
      state.totalItems += 1;
    },
    updateYeuCauSuccess: (state, action) => {
      state.isLoading = false;
      const updated = action.payload;
      state.yeuCauList = (state.yeuCauList || []).map((item) =>
        item._id === updated._id ? updated : item
      );
      if (state.yeuCauDetail?._id === updated._id) {
        state.yeuCauDetail = updated;
      }
    },
    deleteYeuCauSuccess: (state, action) => {
      state.isLoading = false;
      const deletedId = action.payload;
      state.yeuCauList = (state.yeuCauList || []).filter(
        (item) => item._id !== deletedId
      );
      state.totalItems -= 1;
    },

    // Actions (state transitions)
    startActionLoading: (state, action) => {
      state.actionLoading = true;
      state.actionType = action.payload;
    },
    actionSuccess: (state, action) => {
      state.actionLoading = false;
      state.actionType = null;
      const updated = action.payload;
      // Update in list
      state.yeuCauList = (state.yeuCauList || []).map((item) =>
        item._id === updated._id ? updated : item
      );
      // Update detail if viewing
      if (state.yeuCauDetail?._id === updated._id) {
        state.yeuCauDetail = updated;
      }
    },
    actionError: (state, action) => {
      state.actionLoading = false;
      state.actionType = null;
      state.error = action.payload;
    },

    // Bình luận
    startBinhLuanLoading: (state) => {
      state.binhLuanLoading = true;
    },
    getBinhLuanSuccess: (state, action) => {
      state.binhLuanLoading = false;
      state.binhLuanList = action.payload;
    },

    // Tệp tin
    startTepTinLoading: (state) => {
      state.tepTinLoading = true;
    },
    getTepTinSuccess: (state, action) => {
      state.tepTinLoading = false;
      state.tepTinList = action.payload;
    },

    // Lịch sử
    startLichSuLoading: (state) => {
      state.lichSuLoading = true;
    },
    getLichSuSuccess: (state, action) => {
      state.lichSuLoading = false;
      state.lichSuList = action.payload;
    },

    // Filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.currentPage = 1;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
      state.currentPage = 1;
    },
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },

    // Dashboard
    startDashboardLoading: (state) => {
      state.dashboardLoading = true;
    },
    getDashboardSuccess: (state, action) => {
      state.dashboardLoading = false;
      state.dashboardMetrics = action.payload;
    },

    // Master data
    startDanhMucLoading: (state) => {
      state.danhMucLoading = true;
    },
    getDanhMucSuccess: (state, action) => {
      state.danhMucLoading = false;
      state.danhMucList = action.payload;
    },
    startLyDoTuChoiLoading: (state) => {
      state.lyDoTuChoiLoading = true;
    },
    getLyDoTuChoiSuccess: (state, action) => {
      state.lyDoTuChoiLoading = false;
      state.lyDoTuChoiList = action.payload;
    },
    startCauHinhLoading: (state) => {
      state.cauHinhLoading = true;
    },
    getCauHinhSuccess: (state, action) => {
      state.cauHinhLoading = false;
      state.cauHinhKhoa = action.payload;
    },

    // Badge counts
    startBadgeCountsLoading: (state) => {
      state.badgeCountsLoading = true;
    },
    getBadgeCountsSuccess: (state, action) => {
      const { pageKey, counts } = action.payload;
      state.badgeCountsLoading = false;
      state.badgeCounts[pageKey] = counts;
    },
    badgeCountsError: (state) => {
      state.badgeCountsLoading = false;
    },
  },
});

// ============== ACTIONS (export reducer actions) ==============
export const {
  startLoading,
  hasError,
  getYeuCauListSuccess,
  startDetailLoading,
  getYeuCauDetailSuccess,
  clearYeuCauDetail,
  createYeuCauSuccess,
  updateYeuCauSuccess,
  deleteYeuCauSuccess,
  startActionLoading,
  actionSuccess,
  actionError,
  startBinhLuanLoading,
  getBinhLuanSuccess,
  startTepTinLoading,
  getTepTinSuccess,
  startLichSuLoading,
  getLichSuSuccess,
  setFilters,
  resetFilters,
  setActiveTab,
  setPage,
  startDashboardLoading,
  getDashboardSuccess,
  startDanhMucLoading,
  getDanhMucSuccess,
  startLyDoTuChoiLoading,
  getLyDoTuChoiSuccess,
  startCauHinhLoading,
  getCauHinhSuccess,
  startBadgeCountsLoading,
  getBadgeCountsSuccess,
  badgeCountsError,
} = slice.actions;

// ============== THUNKS ==============

const BASE_URL = "/workmanagement/yeucau";

/**
 * Lấy danh sách yêu cầu
 */
export const getYeuCauList =
  ({ page = 1, limit = 10, ...filters } = {}) =>
  async (dispatch) => {
    dispatch(startLoading());
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);

      // Map filter names từ frontend sang backend
      const filterMapping = {
        KhoaXuLyID: "khoaDichId",
        TrangThai: "trangThai",
        TuNgay: "tuNgay",
        DenNgay: "denNgay",
        search: "search",
        // Tab mapping: sent -> toi-gui, received -> can-xu-ly
        tab: "tab",
      };

      // Add filters với mapping
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          const mappedKey = filterMapping[key] || key;

          // Map tab values
          if (key === "tab") {
            const tabMapping = {
              sent: "toi-gui",
              received: "can-xu-ly",
            };
            value = tabMapping[value] || value;
          }

          if (Array.isArray(value) && value.length > 0) {
            value.forEach((v) => params.append(mappedKey, v));
          } else if (!Array.isArray(value)) {
            params.append(mappedKey, value);
          }
        }
      });

      const response = await apiService.get(`${BASE_URL}?${params.toString()}`);

      // Map response format từ backend sang frontend
      const backendData = response.data.data;
      const mappedData = {
        items: backendData.data || [],
        totalItems: backendData.pagination?.total || 0,
        totalPages: backendData.pagination?.totalPages || 0,
        currentPage: backendData.pagination?.page || 1,
      };

      dispatch(getYeuCauListSuccess(mappedData));
    } catch (error) {
      dispatch(hasError(error.message));
      toast.error(error.message || "Lỗi khi tải danh sách yêu cầu");
    }
  };

/**
 * Lấy chi tiết yêu cầu
 */
export const getYeuCauDetail = (id) => async (dispatch) => {
  dispatch(startDetailLoading());
  try {
    const response = await apiService.get(`${BASE_URL}/${id}`);
    dispatch(getYeuCauDetailSuccess(response.data.data));
  } catch (error) {
    dispatch(hasError(error.message));
    toast.error(error.message || "Lỗi khi tải chi tiết yêu cầu");
  }
};

/**
 * Tạo yêu cầu mới
 */
export const createYeuCau = (data, callback) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const response = await apiService.post(BASE_URL, data);
    dispatch(createYeuCauSuccess(response.data.data));
    toast.success("Tạo yêu cầu thành công");
    if (callback) callback(response.data.data);
  } catch (error) {
    dispatch(hasError(error.message));
    toast.error(error.message || "Lỗi khi tạo yêu cầu");
  }
};

/**
 * Cập nhật yêu cầu
 */
export const updateYeuCau = (id, data, callback) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const response = await apiService.put(`${BASE_URL}/${id}`, data);
    dispatch(updateYeuCauSuccess(response.data.data));
    toast.success("Cập nhật yêu cầu thành công");
    if (callback) callback(response.data.data);
  } catch (error) {
    dispatch(hasError(error.message));
    toast.error(error.message || "Lỗi khi cập nhật yêu cầu");
  }
};

/**
 * Xóa yêu cầu
 */
export const deleteYeuCau = (id, callback) => async (dispatch) => {
  dispatch(startLoading());
  try {
    await apiService.delete(`${BASE_URL}/${id}`);
    dispatch(deleteYeuCauSuccess(id));
    toast.success("Xóa yêu cầu thành công");
    if (callback) callback();
  } catch (error) {
    dispatch(hasError(error.message));
    toast.error(error.message || "Lỗi khi xóa yêu cầu");
  }
};

// ============== ACTION THUNKS (State Transitions) ==============

/**
 * Generic action executor
 */
const executeAction =
  (actionName, endpoint, successMessage) =>
  (id, data = {}, callback) =>
  async (dispatch) => {
    dispatch(startActionLoading(actionName));
    try {
      const response = await apiService.post(
        `${BASE_URL}/${id}/${endpoint}`,
        data
      );
      dispatch(actionSuccess(response.data.data));
      toast.success(successMessage);
      if (callback) callback(response.data.data);
    } catch (error) {
      dispatch(actionError(error.message));
      toast.error(error.message || `Lỗi khi ${successMessage.toLowerCase()}`);
    }
  };

// Tiếp nhận yêu cầu
export const tiepNhanYeuCau = executeAction(
  "tiepNhan",
  "tiep-nhan",
  "Tiếp nhận yêu cầu thành công"
);

// Điều phối (phân công)
export const dieuPhoiYeuCau = executeAction(
  "dieuPhoi",
  "dieu-phoi",
  "Phân công xử lý thành công"
);

// Gửi về khoa khác
export const guiVeKhoaYeuCau = executeAction(
  "guiVeKhoa",
  "gui-ve-khoa",
  "Chuyển khoa thành công"
);

// Hoàn thành
export const hoanThanhYeuCau = executeAction(
  "hoanThanh",
  "hoan-thanh",
  "Báo hoàn thành thành công"
);

// Đánh giá
export const danhGiaYeuCau = executeAction(
  "danhGia",
  "danh-gia",
  "Đánh giá thành công"
);

// Đóng yêu cầu
export const dongYeuCau = executeAction(
  "dong",
  "dong",
  "Đóng yêu cầu thành công"
);

// Mở lại
export const moLaiYeuCau = executeAction(
  "moLai",
  "mo-lai",
  "Mở lại yêu cầu thành công"
);

// Yêu cầu xử lý tiếp
export const yeuCauXuLyTiep = executeAction(
  "yeuCauXuLyTiep",
  "yeu-cau-xu-ly-tiep",
  "Gửi yêu cầu xử lý tiếp thành công"
);

// Từ chối
export const tuChoiYeuCau = executeAction(
  "tuChoi",
  "tu-choi",
  "Từ chối yêu cầu thành công"
);

// Hủy tiếp nhận
export const huyTiepNhanYeuCau = executeAction(
  "huyTiepNhan",
  "huy-tiep-nhan",
  "Hủy tiếp nhận thành công"
);

// Đổi thời gian hẹn
export const doiThoiGianHenYeuCau = executeAction(
  "doiThoiGianHen",
  "doi-thoi-gian-hen",
  "Đổi thời gian hẹn thành công"
);

// Nhắc lại
export const nhacLaiYeuCau = executeAction(
  "nhacLai",
  "nhac-lai",
  "Đã gửi nhắc nhở"
);

// Báo quản lý (escalation)
export const baoQuanLyYeuCau = executeAction(
  "baoQuanLy",
  "bao-quan-ly",
  "Đã báo cáo lên quản lý"
);

// Khiếu nại
export const appealYeuCau = executeAction(
  "appeal",
  "appeal",
  "Gửi khiếu nại thành công"
);

// ============== ROUTINE TASK ASSIGNMENT ==============

/**
 * Gán nhiệm vụ thường quy cho yêu cầu
 */
export const assignRoutineTaskToYeuCau =
  ({ yeuCauId, nhiemVuThuongQuyID, isKhac }) =>
  async (dispatch) => {
    dispatch(startActionLoading("assignRoutineTask"));
    try {
      const payload = {
        nhiemVuThuongQuyID: nhiemVuThuongQuyID || null,
        isKhac: !!isKhac,
      };

      const response = await apiService.post(
        `/workmanagement/yeucau/${yeuCauId}/assign-routine-task`,
        payload
      );
      const yeuCau = response.data.data;

      dispatch(actionSuccess(yeuCau));
      toast.success("Gán nhiệm vụ thường quy thành công");
      return yeuCau;
    } catch (error) {
      dispatch(actionError(error.message));
      toast.error(error.message);
      throw error;
    }
  };

/**
 * Upload files cho yêu cầu (không kèm bình luận)
 */
export const uploadYeuCauFiles =
  ({ yeuCauId, files, moTa = "" }) =>
  async (dispatch) => {
    dispatch(startTepTinLoading());
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      if (moTa) formData.append("moTa", moTa);

      const response = await apiService.post(
        `/workmanagement/yeucau/${yeuCauId}/files`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Refresh file list
      dispatch(getTepTin(yeuCauId));
      toast.success("Tải tệp thành công");
      return response.data.data;
    } catch (error) {
      dispatch(hasError(error.message));
      toast.error(error.message);
      throw error;
    }
  };

/**
 * Tạo bình luận kèm tệp đính kèm (atomic)
 */
export const addYeuCauCommentWithFiles =
  ({ yeuCauId, noiDung, files = [], parentId = null }) =>
  async (dispatch) => {
    dispatch(startBinhLuanLoading());
    try {
      const formData = new FormData();
      formData.append("noiDung", noiDung || "");
      if (parentId) formData.append("parentId", parentId);
      files.forEach((f) => formData.append("files", f));

      await apiService.post(
        `/workmanagement/yeucau/${yeuCauId}/comments`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Refetch danh sách bình luận sau khi thêm thành công
      await dispatch(getBinhLuan(yeuCauId));
      toast.success("Gửi bình luận thành công");
    } catch (error) {
      dispatch(hasError(error.message));
      toast.error(error.message);
      throw error;
    }
  };

/**
 * Lấy danh sách files theo yêu cầu
 */
export const listYeuCauFiles =
  ({ yeuCauId, page = 1, size = 50 }) =>
  async (dispatch) => {
    dispatch(startTepTinLoading());
    try {
      const response = await apiService.get(
        `/workmanagement/yeucau/${yeuCauId}/files`,
        {
          params: { page, size },
        }
      );
      dispatch(getTepTinSuccess(response.data.data));
    } catch (error) {
      dispatch(hasError(error.message));
      toast.error(error.message);
    }
  };

/**
 * Xóa file (soft delete)
 */
export const deleteYeuCauFile = (fileId) => async (dispatch, getState) => {
  dispatch(startTepTinLoading());
  try {
    await apiService.delete(`/workmanagement/files/${fileId}`);

    // Refresh file list if we're on detail page
    const { yeuCauDetail } = getState().yeuCau;
    if (yeuCauDetail?._id) {
      dispatch(getTepTin(yeuCauDetail._id));
    }

    toast.success("Xóa tệp thành công");
  } catch (error) {
    dispatch(hasError(error.message));
    toast.error(error.message);
    throw error;
  }
};

/**
 * Thu hồi bình luận (xóa cả nội dung và tệp)
 */
export const recallYeuCauComment =
  (yeuCauId, commentId) => async (dispatch) => {
    dispatch(startBinhLuanLoading());
    try {
      await apiService.delete(
        `/workmanagement/yeucau/${yeuCauId}/binh-luan/${commentId}`
      );

      // Refresh comment list
      dispatch(getBinhLuan(yeuCauId));
      toast.success("Thu hồi bình luận thành công");
    } catch (error) {
      dispatch(hasError(error.message));
      toast.error(error.message);
      throw error;
    }
  };

/**
 * Thu hồi nội dung bình luận (giữ tệp)
 */
export const recallYeuCauCommentText =
  (yeuCauId, commentId) => async (dispatch) => {
    dispatch(startBinhLuanLoading());
    try {
      await apiService.patch(
        `/workmanagement/yeucau/${yeuCauId}/binh-luan/${commentId}/text`
      );

      // Refresh comment list
      dispatch(getBinhLuan(yeuCauId));
      toast.success("Thu hồi nội dung bình luận thành công");
    } catch (error) {
      dispatch(hasError(error.message));
      toast.error(error.message);
      throw error;
    }
  };

// ============== COMMENT/FILE/HISTORY THUNKS ==============

/**
 * Lấy bình luận
 */
export const getBinhLuan = (yeuCauId) => async (dispatch) => {
  dispatch(startBinhLuanLoading());
  try {
    const response = await apiService.get(`${BASE_URL}/${yeuCauId}/binh-luan`);
    dispatch(getBinhLuanSuccess(response.data.data));
  } catch (error) {
    dispatch(hasError(error.message));
  }
};

/**
 * Lấy tệp tin
 */
export const getTepTin = (yeuCauId) => async (dispatch) => {
  dispatch(startTepTinLoading());
  try {
    const response = await apiService.get(`${BASE_URL}/${yeuCauId}/tep-tin`);
    dispatch(getTepTinSuccess(response.data.data));
  } catch (error) {
    dispatch(hasError(error.message));
  }
};

/**
 * Lấy lịch sử
 */
export const getLichSu = (yeuCauId) => async (dispatch) => {
  dispatch(startLichSuLoading());
  try {
    const response = await apiService.get(`${BASE_URL}/${yeuCauId}/lich-su`);
    dispatch(getLichSuSuccess(response.data.data));
  } catch (error) {
    dispatch(hasError(error.message));
  }
};

// ============== DASHBOARD THUNK ==============

/**
 * Lấy dashboard metrics
 */
export const getDashboardMetrics =
  (filters = {}) =>
  async (dispatch) => {
    dispatch(startDashboardLoading());
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await apiService.get(
        `${BASE_URL}/dashboard/metrics?${params.toString()}`
      );
      dispatch(getDashboardSuccess(response.data.data));
    } catch (error) {
      dispatch(hasError(error.message));
    }
  };

// ============== MASTER DATA THUNKS ==============

/**
 * Lấy danh mục yêu cầu theo khoa
 */
export const getDanhMucByKhoa = (khoaId) => async (dispatch) => {
  dispatch(startDanhMucLoading());
  try {
    const response = await apiService.get(
      `/workmanagement/danh-muc-yeu-cau?khoaId=${khoaId}`
    );
    dispatch(getDanhMucSuccess(response.data.data));
  } catch (error) {
    dispatch(hasError(error.message));
  }
};

/**
 * Lấy lý do từ chối
 */
export const getLyDoTuChoi = () => async (dispatch) => {
  dispatch(startLyDoTuChoiLoading());
  try {
    const response = await apiService.get(`/workmanagement/ly-do-tu-choi`);
    dispatch(getLyDoTuChoiSuccess(response.data.data));
  } catch (error) {
    dispatch(hasError(error.message));
  }
};

/**
 * Lấy cấu hình khoa (check quyền tiếp nhận)
 */
export const getCauHinhKhoa = (khoaId) => async (dispatch) => {
  dispatch(startCauHinhLoading());
  try {
    const response = await apiService.get(
      `/workmanagement/cau-hinh-thong-bao-khoa/check/${khoaId}`
    );
    dispatch(getCauHinhSuccess(response.data.data));
  } catch (error) {
    dispatch(hasError(error.message));
  }
};

/**
 * Lấy badge counts cho tabs trong page
 */
export const getBadgeCounts = (pageKey) => async (dispatch) => {
  dispatch(startBadgeCountsLoading());
  try {
    const response = await apiService.get(
      `/workmanagement/yeucau/badge-counts-page?pageKey=${pageKey}`
    );
    dispatch(
      getBadgeCountsSuccess({
        pageKey,
        counts: response.data.data,
      })
    );
  } catch (error) {
    dispatch(badgeCountsError());
    // Không toast error - badge counts không critical
    console.error("Failed to load badge counts:", error);
  }
};

// ============== SELECTORS ==============

export const selectYeuCauState = (state) => state.yeuCau;
export const selectYeuCauList = (state) => state.yeuCau.yeuCauList;
export const selectYeuCauDetail = (state) => state.yeuCau.yeuCauDetail;
export const selectAvailableActions = (state) => state.yeuCau.availableActions;
export const selectFilters = (state) => state.yeuCau.filters;
export const selectActiveTab = (state) => state.yeuCau.activeTab;
export const selectDashboardMetrics = (state) => state.yeuCau.dashboardMetrics;
export const selectDanhMucList = (state) => state.yeuCau.danhMucList;
export const selectLyDoTuChoiList = (state) => state.yeuCau.lyDoTuChoiList;
export const selectLichSuList = (state) => state.yeuCau.lichSuList;
export const selectLichSuLoading = (state) => state.yeuCau.lichSuLoading;
export const selectCauHinhKhoa = (state) => state.yeuCau.cauHinhKhoa;
export const selectBadgeCounts = (pageKey) => (state) =>
  state.yeuCau.badgeCounts[pageKey] || {};

export default slice.reducer;
