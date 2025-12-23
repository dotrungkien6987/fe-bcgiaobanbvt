/**
 * Notification Type Redux Slice (Admin)
 * CRUD for notification types via unified workmanagement endpoints
 */

import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import apiService from "../../../app/apiService";

const initialState = {
  isLoading: false,
  error: null,
  types: [],
  total: 0,
  filters: {
    isActive: "",
    Nhom: "",
    search: "",
  },
};

const slice = createSlice({
  name: "notificationType",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getTypesSuccess(state, action) {
      state.isLoading = false;
      state.types = action.payload.types;
      state.total = action.payload.total || action.payload.types?.length || 0;
    },
    createTypeSuccess(state, action) {
      state.isLoading = false;
      state.types = [action.payload, ...state.types].sort((a, b) =>
        (a.code || "").localeCompare(b.code || "")
      );
      state.total += 1;
    },
    updateTypeSuccess(state, action) {
      state.isLoading = false;
      const idx = state.types.findIndex((t) => t._id === action.payload._id);
      if (idx !== -1) state.types[idx] = action.payload;
      state.types = [...state.types].sort((a, b) =>
        (a.code || "").localeCompare(b.code || "")
      );
    },
    deleteTypeSuccess(state, action) {
      state.isLoading = false;
      const idx = state.types.findIndex((t) => t._id === action.payload._id);
      if (idx !== -1) state.types[idx] = action.payload;
    },
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
});

export default slice.reducer;

// ============ THUNKS ============

export const getTypes =
  (params = {}) =>
  async (dispatch, getState) => {
    dispatch(slice.actions.startLoading());
    try {
      const { filters } = getState().notificationType;
      const queryParams = {
        ...filters,
        ...params,
      };

      Object.keys(queryParams).forEach((k) => {
        if (queryParams[k] === "" || queryParams[k] === undefined) {
          delete queryParams[k];
        }
      });

      const response = await apiService.get(
        "/workmanagement/notifications/types",
        { params: queryParams }
      );
      dispatch(slice.actions.getTypesSuccess(response.data.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message || "Lỗi tải danh sách notification types");
    }
  };

export const createType = (data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.post(
      "/workmanagement/notifications/types",
      data
    );
    dispatch(slice.actions.createTypeSuccess(response.data.data.type));
    toast.success("Tạo notification type thành công");
    return response.data.data.type;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message || "Lỗi tạo notification type");
    throw error;
  }
};

export const updateType = (id, data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.put(
      `/workmanagement/notifications/types/${id}`,
      data
    );
    dispatch(slice.actions.updateTypeSuccess(response.data.data.type));
    toast.success("Cập nhật notification type thành công");
    return response.data.data.type;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message || "Lỗi cập nhật notification type");
    throw error;
  }
};

export const deleteType = (id) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.delete(
      `/workmanagement/notifications/types/${id}`
    );
    dispatch(slice.actions.deleteTypeSuccess(response.data.data.type));
    toast.success("Đã vô hiệu hóa notification type");
    return response.data.data.type;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message || "Lỗi xóa notification type");
    throw error;
  }
};

export const setFilters = (filters) => (dispatch) => {
  dispatch(slice.actions.setFilters(filters));
  dispatch(getTypes());
};
