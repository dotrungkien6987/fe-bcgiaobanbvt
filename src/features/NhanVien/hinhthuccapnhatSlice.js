import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../app/apiService";
import { toast } from "react-toastify";

const initialState = {
  isLoading: false,
  error: null,
  
  HinhThucCapNhat:[],
};

const slice = createSlice({
  name: "hinhthuccapnhat",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    getAllHinhThucCapNhatSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.HinhThucCapNhat = action.payload;
    },
    insertOneHinhThucCapNhatSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.HinhThucCapNhat.unshift(action.payload);
    },
    deleteOneHinhThucCapNhatSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.HinhThucCapNhat = state.HinhThucCapNhat.filter(
        (nhanvien) => (nhanvien._id !== action.payload)
      );
    },
    updateOneHinhThucCapNhatSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
     state.HinhThucCapNhat = state.HinhThucCapNhat.map((hinhthuccapnhat) =>
        hinhthuccapnhat._id === action.payload._id ? action.payload : hinhthuccapnhat
      );
    },
    
  },
});

export default slice.reducer;

export const getAllHinhThucCapNhat = () => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.get("/hinhthuccapnhat");
    
    dispatch(slice.actions.getAllHinhThucCapNhatSuccess(response.data.data.hinhthuccapnhat));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
export const insertOneHinhThucCapNhat = (hinhthuccapnhat) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.post(`/hinhthuccapnhat`, hinhthuccapnhat);
    dispatch(slice.actions.insertOneHinhThucCapNhatSuccess(response.data.data));
    toast.success("Thêm mới thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
export const deleteOneHinhThucCapNhat = (hinhthuccapnhatID) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.delete(`/hinhthuccapnhat/${hinhthuccapnhatID}`);
console.log("repon delêt",response)
    dispatch(slice.actions.deleteOneHinhThucCapNhatSuccess(hinhthuccapnhatID));
    toast.success("Xoá thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
export const updateOneHinhThucCapNhat = (hinhthuccapnhat) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
   console.log('hinhthuccapnhat in update',hinhthuccapnhat)
    const response = await apiService.put(`/hinhthuccapnhat`,{hinhthuccapnhat} );
    console.log('hinhthuccapnhat in update',response.data)
    dispatch(slice.actions.updateOneHinhThucCapNhatSuccess(response.data.data));
    toast.success("Cập nhật  thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
