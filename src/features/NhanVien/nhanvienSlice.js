import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../app/apiService";
import { toast } from "react-toastify";

const initialState = {
  isLoading: false,
  error: null,
  nhanviens: [],
};

const slice = createSlice({
  name: "nhanvien",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getAllNhanVienSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.nhanviens = action.payload;
    },
    insertOneNhanVienSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.nhanviens.unshift(action.payload);
    },
    deleteOneNhanVienSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.nhanviens = state.nhanviens.filter(
        (nhanvien) => (nhanvien._id !== action.payload)
      );
    },
    updateOneNhanVienSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.nhanviens.map((nhanvien) =>
        nhanvien._id === action.payload._id ? action.payload : nhanvien
      );
    },
  },
});

export default slice.reducer;

export const getAllNhanVien = () => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.get("/nhanvien");
    console.log("nhanviens",response.data)
    dispatch(slice.actions.getAllNhanVienSuccess(response.data.data.nhanviens));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
export const insertOneNhanVien = (nhanvien) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.post(`/nhanvien`, nhanvien);
    dispatch(slice.actions.insertOneNhanVienSuccess(response.data.data));
    toast.success("Thêm mới thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
export const deleteOneNhanVien = (nhanvienID) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.delete(`/nhanvien`, nhanvienID);
    dispatch(slice.actions.deleteOneNhanVienSuccess(nhanvienID));
    toast.success("Xoá thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
export const updateOneNhanVien = (nhanvien) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.put(`/nhanvien`,nhanvien );
    dispatch(slice.actions.updateOneNhanVienSuccess(response.data.nhanviens));
    toast.success("Cập nhật  thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
