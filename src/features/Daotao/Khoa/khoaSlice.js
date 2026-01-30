import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../../app/apiService";
import { toast } from "react-toastify";

const initialState = {
  isLoading: false,
  error: null,
  Khoa: [],
  ISOKhoa: [], // ISO-relevant departments only
};

const slice = createSlice({
  name: "khoa",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    getAllKhoaSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.Khoa = action.payload;
    },
    getISOKhoaSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.ISOKhoa = action.payload;
    },
    insertOneKhoaSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.Khoa.unshift(action.payload);
    },
    deleteOneKhoaSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.Khoa = state.Khoa.filter((khoa) => khoa._id !== action.payload);
    },
    updateOneKhoaSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.Khoa = state.Khoa.map((khoa) =>
        khoa._id === action.payload._id ? action.payload : khoa,
      );
    },
    bulkUpdateISOSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      // Update both Khoa and ISOKhoa arrays
      const updatedKhoas = action.payload;
      updatedKhoas.forEach((updatedKhoa) => {
        const khoaIndex = state.Khoa.findIndex(
          (k) => k._id === updatedKhoa._id,
        );
        if (khoaIndex !== -1) {
          state.Khoa[khoaIndex] = updatedKhoa;
        }
      });
      // Refresh ISOKhoa array - filter from Khoa
      state.ISOKhoa = state.Khoa.filter((k) => k.IsISORelevant);
    },
  },
});

export default slice.reducer;

export const getAllKhoa = () => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.get("/khoa/all");

    dispatch(slice.actions.getAllKhoaSuccess(response.data.data.khoas));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const getISOKhoa = () => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.get("/khoa/iso");

    dispatch(slice.actions.getISOKhoaSuccess(response.data.data.khoas));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const insertOneKhoa = (khoa) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.post(`/khoa`, khoa);
    dispatch(slice.actions.insertOneKhoaSuccess(response.data.data.newKhoa));
    toast.success("Thêm mới thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const deleteOneKhoa = (khoaID) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    await apiService.delete(`/khoa/${khoaID}`);
    dispatch(slice.actions.deleteOneKhoaSuccess(khoaID));
    toast.success("Xóa thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const updateOneKhoa = (khoa) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.put(`/khoa/${khoa._id}`, khoa);
    dispatch(
      slice.actions.updateOneKhoaSuccess(response.data.data.updatedKhoa),
    );
    toast.success("Cập nhật thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const bulkUpdateISO = (khoaIds, isISORelevant) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.put("/khoa/bulk-update-iso", {
      khoaIds,
      isISORelevant,
    });
    dispatch(slice.actions.bulkUpdateISOSuccess(response.data.data.khoas));
    toast.success(response.data.message || "Cập nhật hàng loạt thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
