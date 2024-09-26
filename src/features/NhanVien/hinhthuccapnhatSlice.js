import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../app/apiService";
import { toast } from "react-toastify";

const initialState = {
  isLoading: false,
  error: null,
  
  HinhThucCapNhat:[],
  HoiDong:[],
  
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
    
    // xu ly hoi dong
    
    getAllHoiDongSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.HoiDong = action.payload;
    },

    insertOneHoiDongSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.HoiDong.unshift(action.payload);
    },

    deleteOneHoiDongSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.HoiDong = state.HoiDong.filter(
        (hoidong) => (hoidong._id !== action.payload)
      );
    },

    updateOneHoiDongSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
     state.HoiDong = state.HoiDong.map((hoidong) =>
        hoidong._id === action.payload._id ? action.payload : hoidong
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


// Xu ly hoi dong


export const getAllHoiDong = () => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.get("/hoidong");
    
    dispatch(slice.actions.getAllHoiDongSuccess(response.data.data.hoidong));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};


export const insertOneHoiDong = (hoidong) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.post(`/hoidong`, hoidong);
    dispatch(slice.actions.insertOneHoiDongSuccess(response.data.data));
    toast.success("Thêm mới thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};


export const deleteOneHoiDong= (hoidongID) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.delete(`/hoidong/${hoidongID}`);
console.log("repon delêt",response)
    dispatch(slice.actions.deleteOneHoiDongSuccess(hoidongID));
    toast.success("Xoá thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};


export const updateOneHoiDong = (hoidong) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
   console.log('hoidong in update',hoidong)
    const response = await apiService.put(`/hoidong`,{hoidong} );
    console.log('hoidong in update',response.data)
    dispatch(slice.actions.updateOneHoiDongSuccess(response.data.data));
    toast.success("Cập nhật  thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

