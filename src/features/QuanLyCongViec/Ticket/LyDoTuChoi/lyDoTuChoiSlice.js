/**
 * LyDoTuChoi Redux Slice (Admin CRUD)
 *
 * Quản lý danh mục Lý do từ chối (global)
 */
import { createSlice } from "@reduxjs/toolkit";
import apiService from "app/apiService";
import { toast } from "react-toastify";

const BASE_URL = "/workmanagement/ly-do-tu-choi";

const initialState = {
  isLoading: false,
  error: null,
  list: [],
};

const slice = createSlice({
  name: "lyDoTuChoiAdmin",
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
    getListSuccess: (state, action) => {
      state.isLoading = false;
      state.list = action.payload;
    },
    createSuccess: (state, action) => {
      state.isLoading = false;
      state.list = [...state.list, action.payload].sort(
        (a, b) => (a.ThuTu || 0) - (b.ThuTu || 0)
      );
    },
    updateSuccess: (state, action) => {
      state.isLoading = false;
      const updated = action.payload;
      state.list = state.list
        .map((item) => (item._id === updated._id ? updated : item))
        .sort((a, b) => (a.ThuTu || 0) - (b.ThuTu || 0));
    },
    deleteSuccess: (state, action) => {
      state.isLoading = false;
      const deletedId = action.payload;
      state.list = state.list.filter((item) => item._id !== deletedId);
    },
  },
});

export const {
  startLoading,
  hasError,
  getListSuccess,
  createSuccess,
  updateSuccess,
  deleteSuccess,
} = slice.actions;

// ============== THUNKS ==============

/**
 * Lấy danh sách lý do từ chối
 * - Admin page: chiLayHoatDong=false để xem cả NGUNG_HOAT_DONG
 */
export const getLyDoTuChoiList =
  ({ chiLayHoatDong = false } = {}) =>
  async (dispatch) => {
    dispatch(startLoading());
    try {
      const response = await apiService.get(
        `${BASE_URL}?chiLayHoatDong=${chiLayHoatDong}`
      );
      dispatch(getListSuccess(response.data.data || []));
    } catch (error) {
      dispatch(hasError(error.message));
      toast.error(error.message || "Lỗi khi tải lý do từ chối");
    }
  };

export const createLyDoTuChoi = (data, callback) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const response = await apiService.post(BASE_URL, data);
    dispatch(createSuccess(response.data.data));
    toast.success("Tạo lý do từ chối thành công");
    if (callback) callback(response.data.data);
  } catch (error) {
    dispatch(hasError(error.message));
    toast.error(error.message || "Lỗi khi tạo lý do từ chối");
  }
};

export const updateLyDoTuChoi = (id, data, callback) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const response = await apiService.put(`${BASE_URL}/${id}`, data);
    dispatch(updateSuccess(response.data.data));
    toast.success("Cập nhật lý do từ chối thành công");
    if (callback) callback(response.data.data);
  } catch (error) {
    dispatch(hasError(error.message));
    toast.error(error.message || "Lỗi khi cập nhật lý do từ chối");
  }
};

export const deleteLyDoTuChoi = (id, callback) => async (dispatch) => {
  dispatch(startLoading());
  try {
    await apiService.delete(`${BASE_URL}/${id}`);
    dispatch(deleteSuccess(id));
    toast.success("Xóa lý do từ chối thành công");
    if (callback) callback();
  } catch (error) {
    dispatch(hasError(error.message));
    toast.error(error.message || "Lỗi khi xóa lý do từ chối");
  }
};

// ============== SELECTORS ==============

export const selectLyDoTuChoiAdminState = (state) => state.lyDoTuChoiAdmin;
export const selectLyDoTuChoiAdminList = (state) =>
  state.lyDoTuChoiAdmin?.list || [];

export default slice.reducer;
