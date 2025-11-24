import { createSlice } from "@reduxjs/toolkit";
import apiService from "app/apiService";
import { toast } from "react-toastify";

const slice = createSlice({
  name: "colorConfig",
  initialState: {
    statusColors: null,
    priorityColors: null,
    dueStatusColors: null,
    loading: false,
    saving: false,
    error: null,
  },
  reducers: {
    startLoading(state) {
      state.loading = true;
      state.error = null;
    },
    hasError(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    setConfig(state, action) {
      state.loading = false;
      state.statusColors = action.payload?.statusColors || null;
      state.priorityColors = action.payload?.priorityColors || null;
      state.dueStatusColors = action.payload?.dueStatusColors || null;
    },
    startSaving(state) {
      state.saving = true;
      state.error = null;
    },
    setSaved(state, action) {
      state.saving = false;
      state.statusColors = action.payload?.statusColors || state.statusColors;
      state.priorityColors =
        action.payload?.priorityColors || state.priorityColors;
      state.dueStatusColors =
        action.payload?.dueStatusColors || state.dueStatusColors;
    },
    saveError(state, action) {
      state.saving = false;
      state.error = action.payload;
    },
  },
});

export default slice.reducer;
export const {
  startLoading,
  hasError,
  setConfig,
  startSaving,
  setSaved,
  saveError,
} = slice.actions;

const api = {
  get: () => apiService.get(`/workmanagement/colors`),
  put: (data) => apiService.put(`/workmanagement/colors`, data),
};

export const fetchColorConfig = () => async (dispatch) => {
  dispatch(startLoading());
  try {
    const res = await api.get();
    dispatch(setConfig(res.data.data));
  } catch (err) {
    dispatch(hasError(err.message));
  }
};

export const updateColorConfig = (payload) => async (dispatch) => {
  dispatch(startSaving());
  try {
    const res = await api.put(payload);
    dispatch(setSaved(res.data.data));
    toast.success("Đã lưu cấu hình màu");
  } catch (err) {
    dispatch(saveError(err.message));
    toast.error(err.message);
  }
};
