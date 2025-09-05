import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../../app/apiService";
import { toast } from "react-toastify";

const slice = createSlice({
  name: "loaichuyenmon",
  initialState: {
    isLoading: false,
    error: null,
    list: [],
  },
  reducers: {
    startLoading(state) {
      state.isLoading = true;
      state.error = null;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getAllSuccess(state, action) {
      state.isLoading = false;
      state.list = action.payload;
    },
    createSuccess(state, action) {
      state.isLoading = false;
      state.list = [action.payload, ...state.list];
    },
    updateSuccess(state, action) {
      state.isLoading = false;
      state.list = state.list.map((i) =>
        i._id === action.payload._id ? action.payload : i
      );
    },
    deleteSuccess(state, action) {
      state.isLoading = false;
      state.list = state.list.filter((i) => i._id !== action.payload);
    },
  },
});

export default slice.reducer;

export const getAllLoaiChuyenMon = () => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const res = await apiService.get("/loaichuyenmon");
    dispatch(slice.actions.getAllSuccess(res.data.data.loaichuyenmons || []));
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
  }
};

export const createLoaiChuyenMon = (data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const res = await apiService.post("/loaichuyenmon", data);
    dispatch(slice.actions.createSuccess(res.data.data.newLoaiChuyenMon));
    toast.success("Tạo thành công");
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
    toast.error(e.message);
  }
};

export const updateLoaiChuyenMon = (id, data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const res = await apiService.put(`/loaichuyenmon/${id}`, data);
    dispatch(slice.actions.updateSuccess(res.data.data.updatedLoaiChuyenMon));
    toast.success("Cập nhật thành công");
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
    toast.error(e.message);
  }
};

export const deleteLoaiChuyenMon = (id) => async (dispatch) => {
  if (!window.confirm("Xác nhận xóa?")) return;
  dispatch(slice.actions.startLoading());
  try {
    await apiService.delete(`/loaichuyenmon/${id}`);
    dispatch(slice.actions.deleteSuccess(id));
    toast.success("Đã xóa");
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
    toast.error(e.message);
  }
};
