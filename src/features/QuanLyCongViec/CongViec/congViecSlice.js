import { createSlice } from "@reduxjs/toolkit";
import apiService from "app/apiService";
import { toast } from "react-toastify";

// Slice name
const name = "congViec";

// Initial state
const initialState = {
  isLoading: false,
  error: null,
  // Domain-specific state fields
  currentNhanVien: null, // Thông tin nhân viên hiện tại
  activeTab: "received", // 'received' | 'assigned'
  receivedCongViecs: [], // Công việc được giao (nhân viên là người xử lý chính)
  assignedCongViecs: [], // Công việc đã giao (nhân viên là người giao việc)
  receivedTotal: 0,
  assignedTotal: 0,
  receivedPages: 0,
  assignedPages: 0,
  // Step 2: Detail and form state
  congViecDetail: null, // Chi tiết công việc đang xem
  currentPage: {
    received: 1,
    assigned: 1,
  },
  filters: {
    received: {
      search: "",
      TrangThai: "",
      MucDoUuTien: "",
      NgayBatDau: null,
      NgayHetHan: null,
    },
    assigned: {
      search: "",
      TrangThai: "",
      MucDoUuTien: "",
      NgayBatDau: null,
      NgayHetHan: null,
    },
  },
};

// Create slice
const slice = createSlice({
  name,
  initialState,
  reducers: {
    startLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    hasError: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    getNhanVienSuccess: (state, action) => {
      state.isLoading = false;
      state.error = null;
      state.currentNhanVien = action.payload;
    },
    getReceivedCongViecsSuccess: (state, action) => {
      state.isLoading = false;
      state.error = null;
      const { CongViecs, totalItems, totalPages, currentPage } = action.payload;
      state.receivedCongViecs = CongViecs;
      state.receivedTotal = totalItems;
      state.receivedPages = totalPages;
      state.currentPage.received = currentPage;
    },
    getAssignedCongViecsSuccess: (state, action) => {
      state.isLoading = false;
      state.error = null;
      const { CongViecs, totalItems, totalPages, currentPage } = action.payload;
      state.assignedCongViecs = CongViecs;
      state.assignedTotal = totalItems;
      state.assignedPages = totalPages;
      state.currentPage.assigned = currentPage;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setFilters: (state, action) => {
      const { tab, filters } = action.payload;
      state.filters[tab] = { ...state.filters[tab], ...filters };
      state.currentPage[tab] = 1; // Reset page khi filter
    },
    resetFilters: (state, action) => {
      const tab = action.payload;
      state.filters[tab] = {
        search: "",
        TrangThai: "",
        MucDoUuTien: "",
        NgayBatDau: null,
        NgayHetHan: null,
      };
      state.currentPage[tab] = 1;
    },
    setCurrentPage: (state, action) => {
      const { tab, page } = action.payload;
      state.currentPage[tab] = page;
    },
    deleteCongViecSuccess: (state, action) => {
      state.isLoading = false;
      state.error = null;
      const deletedId = action.payload;
      // Remove from both arrays
      state.receivedCongViecs = state.receivedCongViecs.filter(
        (cv) => cv._id !== deletedId
      );
      state.assignedCongViecs = state.assignedCongViecs.filter(
        (cv) => cv._id !== deletedId
      );
    },
    clearState: (state) => {
      // Preserve UI state (activeTab, currentPage, filters) when clearing data
      const preservedState = {
        activeTab: state.activeTab,
        currentPage: state.currentPage,
        filters: state.filters,
      };
      return { ...initialState, ...preservedState };
    },
    // Step 2: Detail, Create, Update actions
    getCongViecDetailSuccess: (state, action) => {
      state.isLoading = false;
      state.error = null;
      state.congViecDetail = action.payload;
    },
    createCongViecSuccess: (state, action) => {
      state.isLoading = false;
      state.error = null;
      const newCongViec = action.payload;
      // Add to assigned list if current user is the creator
      state.assignedCongViecs.unshift(newCongViec);
      state.assignedTotal += 1;
    },
    updateCongViecSuccess: (state, action) => {
      state.isLoading = false;
      state.error = null;
      const updatedCongViec = action.payload;

      // Update in received list
      const receivedIndex = state.receivedCongViecs.findIndex(
        (cv) => cv._id === updatedCongViec._id
      );
      if (receivedIndex !== -1) {
        state.receivedCongViecs[receivedIndex] = updatedCongViec;
      }

      // Update in assigned list
      const assignedIndex = state.assignedCongViecs.findIndex(
        (cv) => cv._id === updatedCongViec._id
      );
      if (assignedIndex !== -1) {
        state.assignedCongViecs[assignedIndex] = updatedCongViec;
      }

      // Update detail if currently viewing
      if (
        state.congViecDetail &&
        state.congViecDetail._id === updatedCongViec._id
      ) {
        state.congViecDetail = updatedCongViec;
      }
    },
    addCommentSuccess: (state, action) => {
      state.isLoading = false;
      state.error = null;
      const { congViecId, comment } = action.payload;

      // Update detail if currently viewing
      if (state.congViecDetail && state.congViecDetail._id === congViecId) {
        state.congViecDetail.BinhLuans = state.congViecDetail.BinhLuans || [];
        state.congViecDetail.BinhLuans.push(comment);
      }
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
  startLoading,
  hasError,
  getNhanVienSuccess,
  getReceivedCongViecsSuccess,
  getAssignedCongViecsSuccess,
  setActiveTab,
  setFilters,
  resetFilters,
  setCurrentPage,
  deleteCongViecSuccess,
  clearState,
  // Step 2 actions
  getCongViecDetailSuccess,
  createCongViecSuccess,
  updateCongViecSuccess,
  addCommentSuccess,
} = slice.actions;

// API service methods
const congViecAPI = {
  getNhanVien: (nhanvienid) =>
    apiService.get(`/workmanagement/nhanvien/${nhanvienid}`),
  getReceived: (nhanvienid, params) =>
    apiService.get(`/workmanagement/congviec/${nhanvienid}/received`, {
      params,
    }),
  getAssigned: (nhanvienid, params) =>
    apiService.get(`/workmanagement/congviec/${nhanvienid}/assigned`, {
      params,
    }),
  delete: (id) => apiService.delete(`/workmanagement/congviec/${id}`),
  // Step 2: Detail, Create, Update APIs
  getDetail: (id) => apiService.get(`/workmanagement/congviec/detail/${id}`),
  create: (data) => apiService.post(`/workmanagement/congviec`, data),
  update: (id, data) => apiService.put(`/workmanagement/congviec/${id}`, data),
  addComment: (id, data) =>
    apiService.post(`/workmanagement/congviec/${id}/comment`, data),
};

// Manual thunks
export const getNhanVien = (nhanvienid) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await congViecAPI.getNhanVien(nhanvienid);
    dispatch(slice.actions.getNhanVienSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const getReceivedCongViecs =
  (nhanvienid, filters = {}) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      // Validate and sanitize params
      const sanitizedParams = {
        ...filters,
        page: Math.max(1, parseInt(filters.page) || 1),
        limit: Math.max(1, Math.min(100, parseInt(filters.limit) || 10)),
      };

      // Remove empty string filters to avoid interfering with backend cleaning logic
      Object.keys(sanitizedParams).forEach((k) => {
        if (sanitizedParams[k] === "" || sanitizedParams[k] == null) {
          delete sanitizedParams[k];
        }
      });

      console.log("Frontend sending params:", sanitizedParams);

      const response = await congViecAPI.getReceived(
        nhanvienid,
        sanitizedParams
      );
      dispatch(slice.actions.getReceivedCongViecsSuccess(response.data.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const getAssignedCongViecs =
  (nhanvienid, filters = {}) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      // Validate and sanitize params
      const sanitizedParams = {
        ...filters,
        page: Math.max(1, parseInt(filters.page) || 1),
        limit: Math.max(1, Math.min(100, parseInt(filters.limit) || 10)),
      };

      Object.keys(sanitizedParams).forEach((k) => {
        if (sanitizedParams[k] === "" || sanitizedParams[k] == null) {
          delete sanitizedParams[k];
        }
      });

      console.log("Frontend sending assigned params:", sanitizedParams);

      const response = await congViecAPI.getAssigned(
        nhanvienid,
        sanitizedParams
      );
      dispatch(slice.actions.getAssignedCongViecsSuccess(response.data.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const deleteCongViec = (id) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    await congViecAPI.delete(id);
    dispatch(slice.actions.deleteCongViecSuccess(id));
    toast.success("Xóa công việc thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

// Step 2: Detail, Create, Update thunks
export const getCongViecDetail = (id) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await congViecAPI.getDetail(id);
    dispatch(slice.actions.getCongViecDetailSuccess(response.data.data));
    return response.data.data;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
    throw error;
  }
};

export const createCongViec = (data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await congViecAPI.create(data);
    dispatch(slice.actions.createCongViecSuccess(response.data.data));
    toast.success("Tạo công việc thành công");
    return response.data.data;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
    throw error;
  }
};

export const updateCongViec =
  ({ id, data }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await congViecAPI.update(id, data);
      dispatch(slice.actions.updateCongViecSuccess(response.data.data));
      toast.success("Cập nhật công việc thành công");
      return response.data.data;
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
      throw error;
    }
  };

export const updateCongViecStatus =
  ({ congViecId, trangThai }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await congViecAPI.update(congViecId, {
        TrangThai: trangThai,
      });
      dispatch(slice.actions.updateCongViecSuccess(response.data.data));
      toast.success(`Đã cập nhật trạng thái: ${trangThai}`);
      return response.data.data;
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
      throw error;
    }
  };

export const addCongViecComment =
  ({ congViecId, noiDung }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await congViecAPI.addComment(congViecId, {
        NoiDung: noiDung,
      });
      dispatch(
        slice.actions.addCommentSuccess({
          congViecId,
          comment: response.data.data,
        })
      );
      toast.success("Đã thêm bình luận");
      return response.data.data;
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
      throw error;
    }
  };
