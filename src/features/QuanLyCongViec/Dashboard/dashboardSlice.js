/**
 * Dashboard Redux Slice
 *
 * Phase 2 Task 2.2 - Dashboard state management
 *
 * Manages:
 * - Unified dashboard summary (3 modules: CongViec, KPI, YeuCau)
 * - Loading states
 * - Error handling
 * - Last updated timestamp
 */

import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import apiService from "app/apiService";

// Initial state
const initialState = {
  // Summary data
  summary: {
    congViec: {
      totalReceived: 0,
      totalAssigned: 0,
      receivedPending: 0,
      receivedInProgress: 0,
      receivedCompleted: 0,
      receivedOverdue: 0,
      assignedPending: 0,
      assignedInProgress: 0,
    },
    kpi: {
      averageScore: 0,
      notEvaluated: 0,
      approved: 0,
      needsImprovement: 0,
      totalEvaluations: 0,
      currentCycleScore: 0,
    },
    yeuCau: {
      totalSent: 0,
      totalReceived: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      overdue: 0,
      rejected: 0,
    },
  },

  // Loading states
  isLoading: false,
  isRefreshing: false,

  // Error
  error: null,

  // Metadata
  lastUpdated: null,
  nhanVienId: null,
};

// Redux slice
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    // Start loading
    startLoading(state) {
      state.isLoading = true;
      state.error = null;
    },

    // Start refreshing (different from initial load)
    startRefreshing(state) {
      state.isRefreshing = true;
      state.error = null;
    },

    // Has error
    hasError(state, action) {
      state.isLoading = false;
      state.isRefreshing = false;
      state.error = action.payload;
    },

    // Get summary success
    getSummarySuccess(state, action) {
      state.isLoading = false;
      state.isRefreshing = false;
      state.summary = action.payload.summary;
      state.nhanVienId = action.payload.nhanVienId;
      state.lastUpdated = new Date().toISOString();
      state.error = null;
    },

    // Update CongViec summary (partial update)
    updateCongViecSummary(state, action) {
      state.summary.congViec = {
        ...state.summary.congViec,
        ...action.payload,
      };
      state.lastUpdated = new Date().toISOString();
    },

    // Update KPI summary (partial update)
    updateKpiSummary(state, action) {
      state.summary.kpi = {
        ...state.summary.kpi,
        ...action.payload,
      };
      state.lastUpdated = new Date().toISOString();
    },

    // Update YeuCau summary (partial update)
    updateYeuCauSummary(state, action) {
      state.summary.yeuCau = {
        ...state.summary.yeuCau,
        ...action.payload,
      };
      state.lastUpdated = new Date().toISOString();
    },

    // Reset state
    resetState(state) {
      return initialState;
    },
  },
});

// Export actions
export const {
  startLoading,
  startRefreshing,
  hasError,
  getSummarySuccess,
  updateCongViecSummary,
  updateKpiSummary,
  updateYeuCauSummary,
  resetState,
} = dashboardSlice.actions;

// Thunks

/**
 * Get dashboard summary
 * Fetches aggregated data from all 3 modules
 */
export const getDashboardSummary =
  (nhanVienId, options = {}) =>
  async (dispatch) => {
    const { refresh = false } = options;

    dispatch(refresh ? startRefreshing() : startLoading());

    try {
      // TODO: Replace with real API endpoint when backend is ready
      // const response = await apiService.get('/workmanagement/dashboard/summary', {
      //   params: { nhanVienId },
      // });

      // Mock data for now (realistic structure based on backend design)
      const mockResponse = {
        success: true,
        data: {
          summary: {
            congViec: {
              totalReceived: 12,
              totalAssigned: 5,
              receivedPending: 3,
              receivedInProgress: 7,
              receivedCompleted: 2,
              receivedOverdue: 1,
              assignedPending: 2,
              assignedInProgress: 3,
            },
            kpi: {
              averageScore: 85,
              notEvaluated: 3,
              approved: 8,
              needsImprovement: 1,
              totalEvaluations: 12,
              currentCycleScore: 87,
            },
            yeuCau: {
              totalSent: 6,
              totalReceived: 10,
              pending: 4,
              inProgress: 3,
              completed: 7,
              overdue: 2,
              rejected: 1,
            },
          },
          nhanVienId,
        },
      };

      dispatch(getSummarySuccess(mockResponse.data));

      if (refresh) {
        toast.success("Đã làm mới dữ liệu dashboard");
      }

      return mockResponse.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Lỗi khi tải dashboard";
      dispatch(hasError(errorMessage));
      toast.error(errorMessage);
      throw error;
    }
  };

/**
 * Refresh dashboard (pull-to-refresh)
 */
export const refreshDashboard = (nhanVienId) => async (dispatch) => {
  return dispatch(getDashboardSummary(nhanVienId, { refresh: true }));
};

/**
 * Get CongViec summary only (lightweight update)
 */
export const getCongViecSummary = (nhanVienId) => async (dispatch) => {
  try {
    // TODO: Replace with real API endpoint
    // const response = await apiService.get('/workmanagement/congviec/dashboard-summary', {
    //   params: { nhanVienId },
    // });

    const mockData = {
      totalReceived: 12,
      totalAssigned: 5,
      receivedPending: 3,
      receivedInProgress: 7,
      receivedCompleted: 2,
      receivedOverdue: 1,
    };

    dispatch(updateCongViecSummary(mockData));
    return mockData;
  } catch (error) {
    console.error("Error fetching CongViec summary:", error);
    throw error;
  }
};

/**
 * Get KPI summary only
 */
export const getKpiSummary = (nhanVienId) => async (dispatch) => {
  try {
    // TODO: Replace with real API endpoint
    const mockData = {
      averageScore: 85,
      notEvaluated: 3,
      approved: 8,
      needsImprovement: 1,
    };

    dispatch(updateKpiSummary(mockData));
    return mockData;
  } catch (error) {
    console.error("Error fetching KPI summary:", error);
    throw error;
  }
};

/**
 * Get YeuCau summary only
 */
export const getYeuCauSummary = (nhanVienId) => async (dispatch) => {
  try {
    // TODO: Replace with real API endpoint
    const mockData = {
      totalSent: 6,
      totalReceived: 10,
      pending: 4,
      inProgress: 3,
      completed: 7,
      overdue: 2,
    };

    dispatch(updateYeuCauSummary(mockData));
    return mockData;
  } catch (error) {
    console.error("Error fetching YeuCau summary:", error);
    throw error;
  }
};

// Selectors

/**
 * Get full dashboard summary
 */
export const selectDashboardSummary = (state) => state.workDashboard.summary;

/**
 * Get CongViec summary
 */
export const selectCongViecSummary = (state) =>
  state.workDashboard.summary.congViec;

/**
 * Get KPI summary
 */
export const selectKpiSummary = (state) => state.workDashboard.summary.kpi;

/**
 * Get YeuCau summary
 */
export const selectYeuCauSummary = (state) =>
  state.workDashboard.summary.yeuCau;

/**
 * Get loading state
 */
export const selectDashboardLoading = (state) => state.workDashboard.isLoading;

/**
 * Get refreshing state
 */
export const selectDashboardRefreshing = (state) =>
  state.workDashboard.isRefreshing;

/**
 * Get error
 */
export const selectDashboardError = (state) => state.workDashboard.error;

/**
 * Get last updated timestamp
 */
export const selectLastUpdated = (state) => state.workDashboard.lastUpdated;

// Export reducer
export default dashboardSlice.reducer;
