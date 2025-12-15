/**
 * DanhMucYeuCau Redux Slice
 *
 * Quản lý danh mục loại yêu cầu theo Khoa
 */
import { createSlice } from "@reduxjs/toolkit";
import apiService from "app/apiService";
import { toast } from "react-toastify";

const BASE_URL = "/workmanagement/danh-muc-yeu-cau";

const initialState = {
  isLoading: false,
  error: null,
  danhMucList: [],
  selectedKhoaId: null,
};

const slice = createSlice({
  name: "danhMucYeuCau",
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
    getDanhMucSuccess: (state, action) => {
      state.isLoading = false;
      state.danhMucList = action.payload;
    },
    setSelectedKhoa: (state, action) => {
      state.selectedKhoaId = action.payload;
    },
    createDanhMucSuccess: (state, action) => {
      state.isLoading = false;
      state.danhMucList = [...state.danhMucList, action.payload];
    },
    updateDanhMucSuccess: (state, action) => {
      state.isLoading = false;
      const updated = action.payload;
      state.danhMucList = state.danhMucList.map((item) =>
        item._id === updated._id ? updated : item
      );
    },
    deleteDanhMucSuccess: (state, action) => {
      state.isLoading = false;
      const deletedId = action.payload;
      state.danhMucList = state.danhMucList.filter(
        (item) => item._id !== deletedId
      );
    },
  },
});

export const {
  startLoading,
  hasError,
  getDanhMucSuccess,
  setSelectedKhoa,
  createDanhMucSuccess,
  updateDanhMucSuccess,
  deleteDanhMucSuccess,
} = slice.actions;

// ============== THUNKS ==============

/**
 * Lấy danh mục theo khoa
 */
export const getDanhMucByKhoa =
  (khoaId, chiLayHoatDong = true) =>
  async (dispatch) => {
    dispatch(startLoading());
    try {
      const response = await apiService.get(
        `${BASE_URL}?khoaId=${khoaId}&chiLayHoatDong=${chiLayHoatDong}`
      );
      dispatch(getDanhMucSuccess(response.data.data));
      dispatch(setSelectedKhoa(khoaId));
    } catch (error) {
      dispatch(hasError(error.message));
      toast.error(error.message || "Lỗi khi tải danh mục yêu cầu");
    }
  };

/**
 * Tạo danh mục mới
 */
export const createDanhMuc = (data, callback) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const response = await apiService.post(BASE_URL, data);
    dispatch(createDanhMucSuccess(response.data.data));
    toast.success("Tạo danh mục thành công");
    if (callback) callback(response.data.data);
  } catch (error) {
    dispatch(hasError(error.message));
    toast.error(error.message || "Lỗi khi tạo danh mục");
  }
};

/**
 * Cập nhật danh mục
 */
export const updateDanhMuc = (id, data, callback) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const response = await apiService.put(`${BASE_URL}/${id}`, data);
    dispatch(updateDanhMucSuccess(response.data.data));
    toast.success("Cập nhật danh mục thành công");
    if (callback) callback(response.data.data);
  } catch (error) {
    dispatch(hasError(error.message));
    toast.error(error.message || "Lỗi khi cập nhật danh mục");
  }
};

/**
 * Xóa danh mục
 */
export const deleteDanhMuc = (id, callback) => async (dispatch) => {
  dispatch(startLoading());
  try {
    await apiService.delete(`${BASE_URL}/${id}`);
    dispatch(deleteDanhMucSuccess(id));
    toast.success("Xóa danh mục thành công");
    if (callback) callback();
  } catch (error) {
    dispatch(hasError(error.message));
    toast.error(error.message || "Lỗi khi xóa danh mục");
  }
};

/**
 * Sắp xếp lại thứ tự danh mục
 */
export const sapXepDanhMuc = (khoaId, items, callback) => async (dispatch) => {
  dispatch(startLoading());
  try {
    await apiService.put(`${BASE_URL}/sap-xep`, { khoaId, items });
    // Reload list
    dispatch(getDanhMucByKhoa(khoaId));
    toast.success("Sắp xếp danh mục thành công");
    if (callback) callback();
  } catch (error) {
    dispatch(hasError(error.message));
    toast.error(error.message || "Lỗi khi sắp xếp danh mục");
  }
};

// ============== SELECTORS ==============

export const selectDanhMucState = (state) => state.danhMucYeuCau;
export const selectDanhMucList = (state) => state.danhMucYeuCau.danhMucList;
export const selectSelectedKhoaId = (state) =>
  state.danhMucYeuCau.selectedKhoaId;

export default slice.reducer;
