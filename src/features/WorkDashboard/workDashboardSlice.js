import { createSlice } from "@reduxjs/toolkit";
import apiService from "app/apiService";
import { toast } from "react-toastify";

const name = "workDashboard";

const initialState = {
  isLoading: false,
  error: null,

  // Summary data for 3 cards on Trang chủ
  congViecSummary: {
    total: 0,
    urgent: 0,
  },
  yeuCauSummary: {
    sent: 0,
    needAction: 0,
    inProgress: 0,
    completed: 0,
  },
  kpiSummary: {
    score: null,
    status: "CHUA_DUYET",
    cycleName: null,
    isDone: false,
    hasEvaluation: false,
  },

  // Loading states for individual cards
  loadingCongViec: false,
  loadingYeuCau: false,
  loadingKPI: false,

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

    // Công Việc Summary
    startLoadingCongViec(state) {
      state.loadingCongViec = true;
    },
    getCongViecSummarySuccess(state, action) {
      state.loadingCongViec = false;
      state.congViecSummary = action.payload;
    },
    getCongViecSummaryError(state, action) {
      state.loadingCongViec = false;
      state.error = action.payload;
    },

    // Yêu Cầu Summary
    startLoadingYeuCau(state) {
      state.loadingYeuCau = true;
    },
    getYeuCauSummarySuccess(state, action) {
      state.loadingYeuCau = false;
      state.yeuCauSummary = action.payload;
    },
    getYeuCauSummaryError(state, action) {
      state.loadingYeuCau = false;
      state.error = action.payload;
    },

    // KPI Summary
    startLoadingKPI(state) {
      state.loadingKPI = true;
    },
    getKPISummarySuccess(state, action) {
      state.loadingKPI = false;
      state.kpiSummary = action.payload;
    },
    getKPISummaryError(state, action) {
      state.loadingKPI = false;
      state.error = action.payload;
    },

    // Batch fetch all summaries
    fetchAllSummariesSuccess(state) {
      state.isLoading = false;
      state.lastFetchTime = new Date().toISOString();
    },
  },
});

export default slice.reducer;

// Actions
export const {
  startLoading,
  hasError,
  startLoadingCongViec,
  getCongViecSummarySuccess,
  getCongViecSummaryError,
  startLoadingYeuCau,
  getYeuCauSummarySuccess,
  getYeuCauSummaryError,
  startLoadingKPI,
  getKPISummarySuccess,
  getKPISummaryError,
  fetchAllSummariesSuccess,
} = slice.actions;

// Thunks

/**
 * Fetch Công Việc Summary
 * GET /api/workmanagement/congviec/summary/:nhanVienId
 */
export const fetchCongViecSummary = (nhanVienId) => async (dispatch) => {
  if (!nhanVienId) {
    return;
  }

  dispatch(startLoadingCongViec());
  try {
    const response = await apiService.get(
      `/workmanagement/congviec/summary/${nhanVienId}`
    );

    if (response.data.success) {
      dispatch(getCongViecSummarySuccess(response.data.data));
    }
  } catch (error) {
    dispatch(getCongViecSummaryError(error.message));
    console.error("Error fetching CongViec summary:", error);
  }
};

/**
 * Fetch Yêu Cầu Summary
 * GET /api/workmanagement/yeucau/summary/:nhanVienId
 */
export const fetchYeuCauSummary = (nhanVienId) => async (dispatch) => {
  if (!nhanVienId) {
    return;
  }

  dispatch(startLoadingYeuCau());
  try {
    const response = await apiService.get(
      `/workmanagement/yeucau/summary/${nhanVienId}`
    );

    if (response.data.success) {
      dispatch(getYeuCauSummarySuccess(response.data.data));
    }
  } catch (error) {
    dispatch(getYeuCauSummaryError(error.message));
    console.error("Error fetching YeuCau summary:", error);
  }
};

/**
 * Fetch KPI Summary
 * GET /api/workmanagement/kpi/summary/:nhanVienId
 */
export const fetchKPISummary = (nhanVienId) => async (dispatch) => {
  if (!nhanVienId) {
    return;
  }

  dispatch(startLoadingKPI());
  try {
    const response = await apiService.get(
      `/workmanagement/kpi/summary/${nhanVienId}`
    );

    if (response.data.success) {
      dispatch(getKPISummarySuccess(response.data.data));
    }
  } catch (error) {
    dispatch(getKPISummaryError(error.message));
    console.error("Error fetching KPI summary:", error);
  }
};

/**
 * Fetch all dashboard summaries in parallel
 * For Trang chủ (UnifiedDashboardPage)
 */
export const fetchAllDashboardSummaries = (nhanVienId) => async (dispatch) => {
  if (!nhanVienId) {
    toast.error("Không tìm thấy thông tin nhân viên");
    return;
  }

  dispatch(startLoading());

  try {
    // Parallel fetch for performance
    await Promise.all([
      dispatch(fetchCongViecSummary(nhanVienId)),
      dispatch(fetchYeuCauSummary(nhanVienId)),
      dispatch(fetchKPISummary(nhanVienId)),
    ]);

    dispatch(fetchAllSummariesSuccess());
  } catch (error) {
    dispatch(hasError(error.message));
    toast.error("Không thể tải dữ liệu dashboard");
  }
};
