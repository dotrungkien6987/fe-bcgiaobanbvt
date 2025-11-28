/**
 * Notification Template Redux Slice (Admin)
 * Manages notification templates for admin CRUD operations
 *
 * Features:
 * - List/search/filter templates
 * - Create/update/delete templates
 * - Test template notifications
 * - Statistics overview
 */

import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import apiService from "../../../app/apiService";

const initialState = {
  isLoading: false,
  error: null,
  templates: [],
  selectedTemplate: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  stats: {
    total: 0,
    autoCreated: 0,
    inactive: 0,
    byCategory: {},
    mostUsed: [],
  },
  filters: {
    category: "",
    isAutoCreated: "",
    search: "",
  },
};

const slice = createSlice({
  name: "notificationTemplate",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getTemplatesSuccess(state, action) {
      state.isLoading = false;
      state.templates = action.payload.templates;
      state.pagination = action.payload.pagination;
      if (action.payload.stats) {
        state.stats = {
          ...state.stats,
          ...action.payload.stats,
        };
      }
    },
    getTemplateSuccess(state, action) {
      state.isLoading = false;
      state.selectedTemplate = action.payload;
    },
    createTemplateSuccess(state, action) {
      state.isLoading = false;
      state.templates.unshift(action.payload);
      state.stats.total += 1;
    },
    updateTemplateSuccess(state, action) {
      state.isLoading = false;
      const index = state.templates.findIndex(
        (t) => t._id === action.payload._id
      );
      if (index !== -1) {
        state.templates[index] = action.payload;
      }
      if (state.selectedTemplate?._id === action.payload._id) {
        state.selectedTemplate = action.payload;
      }
    },
    deleteTemplateSuccess(state, action) {
      state.isLoading = false;
      // Soft delete just updates isActive
      const index = state.templates.findIndex(
        (t) => t._id === action.payload._id
      );
      if (index !== -1) {
        state.templates[index] = action.payload;
      }
    },
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    getStatsSuccess(state, action) {
      state.isLoading = false;
      state.stats = action.payload;
    },
    clearSelectedTemplate(state) {
      state.selectedTemplate = null;
    },
  },
});

export default slice.reducer;

// ============ THUNKS ============

/**
 * Get templates with pagination and filters
 */
export const getTemplates =
  (params = {}) =>
  async (dispatch, getState) => {
    dispatch(slice.actions.startLoading());
    try {
      const { filters, pagination } = getState().notificationTemplate;
      const queryParams = {
        page: params.page || pagination.page,
        limit: params.limit || pagination.limit,
        ...filters,
        ...params,
      };

      // Clean empty params
      Object.keys(queryParams).forEach((key) => {
        if (queryParams[key] === "" || queryParams[key] === undefined) {
          delete queryParams[key];
        }
      });

      const response = await apiService.get("/notification-templates", {
        params: queryParams,
      });
      dispatch(slice.actions.getTemplatesSuccess(response.data.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message || "Lỗi tải danh sách templates");
    }
  };

/**
 * Get single template by ID
 */
export const getTemplate = (id) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.get(`/notification-templates/${id}`);
    dispatch(slice.actions.getTemplateSuccess(response.data.data));
    return response.data.data;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message || "Lỗi tải template");
  }
};

/**
 * Create new template
 */
export const createTemplate = (data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.post("/notification-templates", data);
    dispatch(slice.actions.createTemplateSuccess(response.data.data));
    toast.success("Tạo template thành công");
    return response.data.data;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message || "Lỗi tạo template");
    throw error;
  }
};

/**
 * Update existing template
 */
export const updateTemplate = (id, data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.put(
      `/notification-templates/${id}`,
      data
    );
    dispatch(slice.actions.updateTemplateSuccess(response.data.data));
    toast.success("Cập nhật template thành công");
    return response.data.data;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message || "Lỗi cập nhật template");
    throw error;
  }
};

/**
 * Soft delete (deactivate) template
 */
export const deleteTemplate = (id) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.delete(`/notification-templates/${id}`);
    dispatch(slice.actions.deleteTemplateSuccess(response.data.data));
    toast.success("Đã vô hiệu hóa template");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message || "Lỗi xóa template");
    throw error;
  }
};

/**
 * Send test notification using template
 */
export const testTemplate = (id, testData) => async () => {
  try {
    const response = await apiService.post(
      `/notification-templates/${id}/test`,
      { data: testData }
    );
    toast.success("Đã gửi notification test!");
    return response.data.data;
  } catch (error) {
    toast.error(error.message || "Lỗi test template");
    throw error;
  }
};

/**
 * Get template statistics
 */
export const getStats = () => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.get("/notification-templates/stats");
    dispatch(slice.actions.getStatsSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
  }
};

/**
 * Set filters and refetch
 */
export const setFilters = (filters) => (dispatch) => {
  dispatch(slice.actions.setFilters(filters));
  dispatch(getTemplates({ page: 1 }));
};

/**
 * Clear selected template
 */
export const clearSelectedTemplate = () => (dispatch) => {
  dispatch(slice.actions.clearSelectedTemplate());
};
