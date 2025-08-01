// Redux slice quản lý Đoàn Ra
import { createSlice } from "@reduxjs/toolkit";
import * as doanRaApi from "./api";
import { toast } from "react-toastify";

const initialState = {
  isLoading: false,
  error: null,
  doanRas: [],
  currentDoanRa: null,
};

const slice = createSlice({
  name: "doanra",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Lấy danh sách đoàn ra
    getDoanRasSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      // Đảm bảo luôn là mảng lấy từ action.payload.data
      state.doanRas = Array.isArray(action.payload?.data)
        ? action.payload.data
        : [];
    },

    // Tạo mới đoàn ra
    createDoanRaSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.doanRas.unshift(action.payload);
    },

    // Lấy chi tiết đoàn ra
    getDoanRaByIdSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.currentDoanRa = action.payload;
    },

    // Cập nhật đoàn ra
    updateDoanRaSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const index = state.doanRas.findIndex(
        (item) => item._id === action.payload._id
      );
      if (index !== -1) {
        state.doanRas[index] = action.payload;
      }
      if (
        state.currentDoanRa &&
        state.currentDoanRa._id === action.payload._id
      ) {
        state.currentDoanRa = action.payload;
      }
    },

    // Xóa đoàn ra
    deleteDoanRaSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.doanRas = state.doanRas.filter(
        (item) => item._id !== action.payload
      );
      if (state.currentDoanRa && state.currentDoanRa._id === action.payload) {
        state.currentDoanRa = null;
      }
    },

    // Thống kê theo quốc gia
    // (Bỏ các reducer thống kê, filter)

    // Reset current đoàn ra
    resetCurrentDoanRa(state) {
      state.currentDoanRa = null;
    },

    // Clear error
    clearError(state) {
      state.error = null;
    },
  },
});

export default slice.reducer;

// Action creators
export const { resetCurrentDoanRa, clearError } = slice.actions;

// Async actions
export const getDoanRas = () => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await doanRaApi.getAllDoanRa();
    dispatch(slice.actions.getDoanRasSuccess(response.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const createDoanRa = (doanRaData) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await doanRaApi.createDoanRa(doanRaData);
    dispatch(slice.actions.createDoanRaSuccess(response.data));
    toast.success("Tạo thông tin đoàn ra thành công");
    return response.data;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
    throw error;
  }
};

export const getDoanRaById = (id) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await doanRaApi.getDoanRaById(id);
    dispatch(slice.actions.getDoanRaByIdSuccess(response.data));
    return response.data;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
    throw error;
  }
};

export const updateDoanRa = (id, updateData) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await doanRaApi.updateDoanRa(id, updateData);
    dispatch(slice.actions.updateDoanRaSuccess(response.data));
    toast.success("Cập nhật đoàn ra thành công");
    return response.data;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
    throw error;
  }
};

export const deleteDoanRa = (id) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    await doanRaApi.deleteDoanRa(id);
    dispatch(slice.actions.deleteDoanRaSuccess(id));
    toast.success("Xóa đoàn ra thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
    throw error;
  }
};

// Selectors
export const selectDoanRa = (state) => state.doanra;
export const selectDoanRaList = (state) => state.doanra.doanRas;
export const selectCurrentDoanRa = (state) => state.doanra.currentDoanRa;
export const selectDoanRaLoading = (state) => state.doanra.isLoading;
export const selectDoanRaError = (state) => state.doanra.error;
