import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../app/apiService";
import { toast } from "react-toastify";

const initialState = {
  isLoading: false,
  error: null,
  nhomKhoaList: [],
  departmentIds: [],
  currentNhomKhoa: null
};

const slice = createSlice({
  name: "nhomKhoaSoThuTu",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    getAllNhomKhoaSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.nhomKhoaList = action.payload;
    },
    getNhomKhoaByIdSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.currentNhomKhoa = action.payload;
    },
    getDepartmentIdsSuccess(state, action) {
      state.isLoading = false; 
      state.error = null;
      state.departmentIds = action.payload.departmentIds;
    },
    insertOneNhomKhoaSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.nhomKhoaList.unshift(action.payload);
    },
    deleteOneNhomKhoaSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.nhomKhoaList = state.nhomKhoaList.filter(
        (nhomKhoa) => (nhomKhoa._id !== action.payload)
      );
    },
    updateOneNhomKhoaSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.nhomKhoaList = state.nhomKhoaList.map((nhomKhoa) =>
        nhomKhoa._id === action.payload._id ? action.payload : nhomKhoa
      );
    },
  },
});

export default slice.reducer;

// Selectors - Thêm selectors
export const selectNhomKhoaList = state => state.nhomKhoaSoThuTu.nhomKhoaList;
export const selectNhomKhoaLoading = state => state.nhomKhoaSoThuTu.isLoading;
export const selectNhomKhoaError = state => state.nhomKhoaSoThuTu.error;
export const selectCurrentNhomKhoa = state => state.nhomKhoaSoThuTu.currentNhomKhoa;
export const selectDepartmentIds = state => state.nhomKhoaSoThuTu.departmentIds;

export const getAllNhomKhoa = () => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.get("/nhomkhoasothutu/all");
    dispatch(slice.actions.getAllNhomKhoaSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const getNhomKhoaById = (id) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.get(`/nhomkhoasothutu/${id}`);
    dispatch(slice.actions.getNhomKhoaByIdSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const getDepartmentIds = () => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.get("/nhomkhoasothutu/departmentids");
    dispatch(slice.actions.getDepartmentIdsSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const insertOneNhomKhoa = (nhomKhoa) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    await apiService.post(`/nhomkhoasothutu`, nhomKhoa);
    
    // Thay vì cập nhật trực tiếp state từ response, gọi lại API để lấy danh sách đã populate
    const response = await apiService.get("/nhomkhoasothutu/all");
    dispatch(slice.actions.getAllNhomKhoaSuccess(response.data.data));
    
    toast.success("Thêm mới nhóm khoa thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const deleteOneNhomKhoa = (nhomKhoaId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    await apiService.delete(`/nhomkhoasothutu/${nhomKhoaId}`);
    dispatch(slice.actions.deleteOneNhomKhoaSuccess(nhomKhoaId));
    toast.success("Xóa nhóm khoa thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const updateOneNhomKhoa = (nhomKhoa) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    await apiService.put(`/nhomkhoasothutu/${nhomKhoa._id}`, nhomKhoa);
    
    // Thay vì cập nhật trực tiếp state từ response, gọi lại API để lấy danh sách đã populate
    const response = await apiService.get("/nhomkhoasothutu/all");
    dispatch(slice.actions.getAllNhomKhoaSuccess(response.data.data));
    
    toast.success("Cập nhật nhóm khoa thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};