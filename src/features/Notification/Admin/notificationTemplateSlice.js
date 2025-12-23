/**
 * Notification Template Redux Slice (Admin)
 * CRUD for notification templates via unified workmanagement endpoints
 */

import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import apiService from "../../../app/apiService";

const initialState = {
  isLoading: false,
  error: null,
  templates: [],
  total: 0,
  filters: {
    typeCode: "",
    isEnabled: "",
    search: "",
    Nhom: "",
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
      state.total =
        action.payload.total || action.payload.templates?.length || 0;
    },
    createTemplateSuccess(state, action) {
      state.isLoading = false;
      state.templates = [action.payload, ...state.templates].sort((a, b) => {
        const aKey = `${a.typeCode || ""}::${a.name || ""}`;
        const bKey = `${b.typeCode || ""}::${b.name || ""}`;
        return aKey.localeCompare(bKey);
      });
      state.total += 1;
    },
    updateTemplateSuccess(state, action) {
      state.isLoading = false;
      const index = state.templates.findIndex(
        (t) => t._id === action.payload._id
      );
      if (index !== -1) {
        state.templates[index] = action.payload;
      }
      state.templates = [...state.templates].sort((a, b) => {
        const aKey = `${a.typeCode || ""}::${a.name || ""}`;
        const bKey = `${b.typeCode || ""}::${b.name || ""}`;
        return aKey.localeCompare(bKey);
      });
    },
    deleteTemplateSuccess(state, action) {
      state.isLoading = false;
      // Soft delete just updates isEnabled
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
  },
});

export default slice.reducer;

// ============ THUNKS ============

/**
 * Get templates with filters
 */
export const getTemplates =
  (params = {}) =>
  async (dispatch, getState) => {
    dispatch(slice.actions.startLoading());
    try {
      const { filters } = getState().notificationTemplate;
      const queryParams = {
        ...filters,
        ...params,
      };

      // Clean empty params
      Object.keys(queryParams).forEach((key) => {
        if (queryParams[key] === "" || queryParams[key] === undefined) {
          delete queryParams[key];
        }
      });

      const response = await apiService.get(
        "/workmanagement/notifications/templates",
        {
          params: queryParams,
        }
      );

      const data = response.data.data;
      const templatesRaw = data.templates || [];
      const search = (queryParams.search || "").trim().toLowerCase();
      const templates = search
        ? templatesRaw.filter((t) => {
            const typeCode = (t.typeCode || "").toLowerCase();
            const name = (t.name || "").toLowerCase();
            return typeCode.includes(search) || name.includes(search);
          })
        : templatesRaw;

      dispatch(
        slice.actions.getTemplatesSuccess({
          templates,
          total: templates.length,
        })
      );
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message || "Lỗi tải danh sách templates");
    }
  };

/**
 * Create new template
 */
export const createTemplate = (data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.post(
      "/workmanagement/notifications/templates",
      data
    );
    dispatch(slice.actions.createTemplateSuccess(response.data.data.template));
    toast.success("Tạo template thành công");
    return response.data.data.template;
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
      `/workmanagement/notifications/templates/${id}`,
      data
    );
    dispatch(slice.actions.updateTemplateSuccess(response.data.data.template));
    toast.success("Cập nhật template thành công");
    return response.data.data.template;
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
    const response = await apiService.delete(
      `/workmanagement/notifications/templates/${id}`
    );
    dispatch(slice.actions.deleteTemplateSuccess(response.data.data.template));
    toast.success("Đã vô hiệu hóa template");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message || "Lỗi xóa template");
    throw error;
  }
};

/**
 * Preview template with sample data
 */
export const previewTemplate = (id, data) => async () => {
  try {
    const response = await apiService.post(
      `/workmanagement/notifications/templates/${id}/preview`,
      { data: data || {} }
    );
    return response.data.data;
  } catch (error) {
    toast.error(error.message || "Lỗi preview template");
    throw error;
  }
};

/**
 * Test-send notification (real send) using type + data
 */
export const testSendNotification = (typeCode, data) => async () => {
  try {
    const response = await apiService.post(
      "/workmanagement/notifications/test-send",
      {
        type: typeCode,
        data: data || {},
      }
    );
    toast.success("Đã gửi notification test!");
    return response.data.data;
  } catch (error) {
    toast.error(error.message || "Lỗi gửi notification test");
    throw error;
  }
};

/**
 * Set filters and refetch
 */
export const setFilters = (filters) => (dispatch) => {
  dispatch(slice.actions.setFilters(filters));
  dispatch(getTemplates());
};
