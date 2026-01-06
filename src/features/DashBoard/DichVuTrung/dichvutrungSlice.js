/**
 * @fileoverview Redux slice cho Dịch Vụ Trùng (Duplicate Services Detection)
 * @module features/DashBoard/DichVuTrung/dichvutrungSlice
 */

import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../../app/apiService";
import { toast } from "react-toastify";

const initialState = {
  isLoading: false,
  error: null,

  // Filters
  filters: {
    fromDate: null, // dayjs object, set in component
    toDate: null, // dayjs object
    serviceTypes: ["04CDHA", "03XN", "05TDCN"], // Default all types
  },

  // Duplicate records với pagination
  duplicates: [],
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasMore: false,
  },

  // Statistics data
  statistics: {
    totalDuplicates: 0,
    affectedPatients: 0,
    totalCost: 0,
    topServices: [],
    topDepartments: [],
  },

  // Loading states for specific actions
  loadingStats: false,
  loadingDuplicates: false,
};

const slice = createSlice({
  name: "dichvutrung",
  initialState,
  reducers: {
    // Generic loading
    startLoading(state) {
      state.isLoading = true;
      state.error = null;
    },

    // Specific loading states
    startLoadingDuplicates(state) {
      state.loadingDuplicates = true;
      state.error = null;
    },

    startLoadingStats(state) {
      state.loadingStats = true;
      state.error = null;
    },

    hasError(state, action) {
      state.isLoading = false;
      state.loadingDuplicates = false;
      state.loadingStats = false;
      state.error = action.payload;
    },

    // Update filters
    updateFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Get duplicates success
    getDuplicatesSuccess(state, action) {
      state.loadingDuplicates = false;
      state.isLoading = false;
      state.error = null;
      state.duplicates = action.payload.duplicates;
      state.pagination = action.payload.pagination;
    },

    // Get statistics success
    getStatisticsSuccess(state, action) {
      state.loadingStats = false;
      state.isLoading = false;
      state.error = null;
      state.statistics = action.payload;
    },

    // Reset state
    resetDichVuTrung(state) {
      Object.assign(state, initialState);
    },
  },
});

export default slice.reducer;
export const {
  startLoading,
  startLoadingDuplicates,
  startLoadingStats,
  hasError,
  updateFilters,
  getDuplicatesSuccess,
  getStatisticsSuccess,
  resetDichVuTrung,
} = slice.actions;

// =============================================================================
// THUNKS (Async Actions)
// =============================================================================

/**
 * Lấy danh sách dịch vụ trùng lặp với phân trang
 *
 * @param {Object} params
 * @param {string} params.fromDate - YYYY-MM-DD
 * @param {string} params.toDate - YYYY-MM-DD
 * @param {string[]} params.serviceTypes - ['04CDHA', '03XN', '05TDCN']
 * @param {number} params.page - Trang hiện tại
 * @param {number} params.limit - Số bản ghi trên trang
 */
export const getDuplicateServices =
  ({
    fromDate,
    toDate,
    serviceTypes,
    page = 1,
    limit = 50,
    filterByService,
    filterByDepartment,
  }) =>
  async (dispatch) => {
    dispatch(startLoadingDuplicates());
    try {
      const response = await apiService.post("/his/dichvutrung/duplicates", {
        fromDate,
        toDate,
        serviceTypes,
        page,
        limit,
        filterByService,
        filterByDepartment,
      });

      dispatch(getDuplicatesSuccess(response.data.data));

      // Show success toast only if no duplicates found
      if (response.data.data.pagination.total === 0) {
        toast.success("✅ Không phát hiện dịch vụ trùng lặp");
      }
    } catch (error) {
      dispatch(hasError(error.message));
      toast.error(error.message);
    }
  };

/**
 * Lấy thống kê tổng quan dịch vụ trùng lặp
 *
 * @param {Object} params
 * @param {string} params.fromDate - YYYY-MM-DD
 * @param {string} params.toDate - YYYY-MM-DD
 * @param {string[]} params.serviceTypes - ['04CDHA', '03XN', '05TDCN']
 */
export const getStatistics =
  ({ fromDate, toDate, serviceTypes }) =>
  async (dispatch) => {
    dispatch(startLoadingStats());
    try {
      const response = await apiService.post("/his/dichvutrung/statistics", {
        fromDate,
        toDate,
        serviceTypes,
      });

      dispatch(getStatisticsSuccess(response.data.data));
    } catch (error) {
      dispatch(hasError(error.message));
      toast.error(error.message);
    }
  };

/**
 * Fetch both duplicates and statistics in parallel
 * (Thường được gọi khi user click "Xem Dữ Liệu")
 */
export const fetchAllData =
  ({
    fromDate,
    toDate,
    serviceTypes,
    page = 1,
    limit = 50,
    filterByService,
    filterByDepartment,
  }) =>
  async (dispatch) => {
    dispatch(startLoading());
    try {
      const [duplicatesRes, statsRes] = await Promise.all([
        apiService.post("/his/dichvutrung/duplicates", {
          fromDate,
          toDate,
          serviceTypes,
          page,
          limit,
          filterByService,
          filterByDepartment,
        }),
        apiService.post("/his/dichvutrung/statistics", {
          fromDate,
          toDate,
          serviceTypes,
        }),
      ]);

      dispatch(getDuplicatesSuccess(duplicatesRes.data.data));
      dispatch(getStatisticsSuccess(statsRes.data.data));

      if (duplicatesRes.data.data.pagination.total === 0) {
        toast.success("✅ Không phát hiện dịch vụ trùng lặp");
      }
    } catch (error) {
      dispatch(hasError(error.message));
      toast.error(error.message);
    }
  };

// =============================================================================
// SELECTORS
// =============================================================================

export const selectDuplicates = (state) => state.dichvutrung.duplicates;
export const selectPagination = (state) => state.dichvutrung.pagination;
export const selectStatistics = (state) => state.dichvutrung.statistics;
export const selectFilters = (state) => state.dichvutrung.filters;
export const selectIsLoading = (state) => state.dichvutrung.isLoading;
export const selectLoadingDuplicates = (state) =>
  state.dichvutrung.loadingDuplicates;
export const selectLoadingStats = (state) => state.dichvutrung.loadingStats;
export const selectError = (state) => state.dichvutrung.error;
