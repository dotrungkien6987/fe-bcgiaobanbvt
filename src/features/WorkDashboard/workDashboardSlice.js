/**
 * workDashboardSlice.js - Redux slice cho Trang chủ (Simplified v2)
 *
 * Removed: KPI (không cần cho daily use)
 * Added: Mixed urgent items (CongViec + YeuCau)
 * Added: Mixed recent activities (CongViec + YeuCau)
 */

import { createSlice } from "@reduxjs/toolkit";
import apiService from "app/apiService";
import { toast } from "react-toastify";

const name = "workDashboard";

const initialState = {
  isLoading: false,
  error: null,

  // Home summary from single API call
  homeSummary: {
    congViec: {
      dangLam: 0,
      toiGiao: 0,
      gap: 0,
      quaHan: 0,
    },
    yeuCau: {
      toiGui: 0,
      canXuLy: 0,
      quaHan: 0,
    },
    alert: null, // { hasUrgent, message, type }
  },

  // Urgent items (mixed CongViec + YeuCau)
  urgentItems: {
    items: [],
    total: 0,
    isLoading: false,
  },

  // Recent activities (mixed CongViec + YeuCau)
  recentActivities: {
    items: [],
    isLoading: false,
  },

  lastFetchTime: null,
};

const slice = createSlice({
  name,
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

    // Home Summary
    getHomeSummarySuccess(state, action) {
      state.isLoading = false;
      state.homeSummary = action.payload;
      state.lastFetchTime = new Date().toISOString();
    },

    // Urgent Items
    startLoadingUrgentItems(state) {
      state.urgentItems.isLoading = true;
    },
    getUrgentItemsSuccess(state, action) {
      state.urgentItems.isLoading = false;
      state.urgentItems.items = action.payload.items || [];
      state.urgentItems.total = action.payload.total || 0;
    },
    getUrgentItemsError(state, action) {
      state.urgentItems.isLoading = false;
      state.error = action.payload;
    },

    // Recent Activities
    startLoadingRecentActivities(state) {
      state.recentActivities.isLoading = true;
    },
    getRecentActivitiesSuccess(state, action) {
      state.recentActivities.isLoading = false;
      state.recentActivities.items = action.payload || [];
    },
    getRecentActivitiesError(state, action) {
      state.recentActivities.isLoading = false;
      state.error = action.payload;
    },
  },
});

export default slice.reducer;

// Actions
export const {
  startLoading,
  hasError,
  getHomeSummarySuccess,
  startLoadingUrgentItems,
  getUrgentItemsSuccess,
  getUrgentItemsError,
  startLoadingRecentActivities,
  getRecentActivitiesSuccess,
  getRecentActivitiesError,
} = slice.actions;

// ========== THUNKS ==========

/**
 * Fetch Home Summary - Single API for all summary data
 * GET /api/workmanagement/home/summary/:nhanVienId
 */
export const fetchHomeSummary = (nhanVienId) => async (dispatch) => {
  if (!nhanVienId) {
    return;
  }

  dispatch(startLoading());
  try {
    const response = await apiService.get(
      `/workmanagement/home/summary/${nhanVienId}`,
    );

    if (response.data.success) {
      dispatch(getHomeSummarySuccess(response.data.data));
    }
  } catch (error) {
    dispatch(hasError(error.message));
    console.error("Error fetching home summary:", error);
  }
};

/**
 * Fetch Urgent Items (mixed CongViec + YeuCau)
 * GET /api/workmanagement/home/urgent/:nhanVienId
 */
export const fetchUrgentItems =
  (nhanVienId, limit = 5) =>
  async (dispatch) => {
    if (!nhanVienId) return;

    dispatch(startLoadingUrgentItems());
    try {
      const response = await apiService.get(
        `/workmanagement/home/urgent/${nhanVienId}?limit=${limit}`,
      );

      if (response.data.success) {
        dispatch(getUrgentItemsSuccess(response.data.data));
      }
    } catch (error) {
      dispatch(getUrgentItemsError(error.message));
      console.error("Error fetching urgent items:", error);
    }
  };

/**
 * Fetch Recent Activities (mixed CongViec + YeuCau)
 * GET /api/workmanagement/home/activities/:nhanVienId
 */
export const fetchRecentActivities =
  (nhanVienId, limit = 5) =>
  async (dispatch) => {
    if (!nhanVienId) return;

    dispatch(startLoadingRecentActivities());
    try {
      const response = await apiService.get(
        `/workmanagement/home/activities/${nhanVienId}?limit=${limit}`,
      );

      if (response.data.success) {
        dispatch(getRecentActivitiesSuccess(response.data.data.activities));
      }
    } catch (error) {
      dispatch(getRecentActivitiesError(error.message));
      console.error("Error fetching recent activities:", error);
    }
  };

/**
 * Fetch all home data in parallel
 * For Trang chủ
 */
export const fetchAllHomeData = (nhanVienId) => async (dispatch) => {
  if (!nhanVienId) {
    toast.error("Không tìm thấy thông tin nhân viên");
    return;
  }

  try {
    // Parallel fetch for performance
    await Promise.all([
      dispatch(fetchHomeSummary(nhanVienId)),
      dispatch(fetchUrgentItems(nhanVienId, 5)),
      dispatch(fetchRecentActivities(nhanVienId, 5)),
    ]);
  } catch (error) {
    console.error("Error fetching home data:", error);
    toast.error("Không thể tải dữ liệu trang chủ");
  }
};
