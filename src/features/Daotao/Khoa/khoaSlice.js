import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../../app/apiService";
import { toast } from "react-toastify";

const initialState = {
  isLoading: false,
  error: null,
  Khoa: [],
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
    insertOneKhoaSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.Khoa.unshift(action.payload);
    },
    deleteOneKhoaSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.Khoa = state.Khoa.filter(
        (khoa) => (khoa._id !== action.payload)
      );
    },
    updateOneKhoaSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
     state.Khoa = state.Khoa.map((khoa) =>
        khoa._id === action.payload._id ? action.payload : khoa
      );
    },
  },
});

export default slice.reducer;

export const getAllKhoa = () => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.get("/khoa");
    
    dispatch(slice.actions.getAllKhoaSuccess(response.data.data.khoas));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const insertOneKhoa = (khoa) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.post(`/khoa`, khoa);
    dispatch(slice.actions.insertOneKhoaSuccess(response.data.data));
    toast.success("Thêm mới thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const deleteOneKhoa = (khoaID) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.delete(`/khoa/${khoaID}`);
    dispatch(slice.actions.deleteOneKhoaSuccess(khoaID));
    toast.success("Xóa thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const updateOneKhoa = (khoa) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.put(`/khoa`, {khoa});
    dispatch(slice.actions.updateOneKhoaSuccess(response.data.data));
    toast.success("Cập nhật thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};