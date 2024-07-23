import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../app/apiService";
import { toast } from "react-toastify";

const initialState = {
  isLoading: false,
  error: null,
  LopDaoTaos: [],
 lopdaotaoCurrent:{},
};

const slice = createSlice({
  name: "daotao",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    insertOneLopDaoTaoSuccess(state, action) {
      state.isLoading = false;
      state.error = action.payload;
      state.LopDaoTaos.unshift(action.payload);
    },
   
    getAllLopDaoTaoSuccess(state, action) {
      state.isLoading = false;
      state.error = action.payload;
      state.LopDaoTaos= action.payload
    },
   
  },
});
export default slice.reducer;

export const insertOneLopDaoTao = (lopdaotao) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.post(`/lopdaotao`, lopdaotao);
    
    dispatch(slice.actions.insertOneLopDaoTaoSuccess(response.data.data));
    toast.success("Thêm mới thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const updateOneLopDaoTao = (lopdaotao) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.post(`/lopdaotao`, lopdaotao);
    dispatch(slice.actions.insertOneLopDaoTaoSuccess(response.data.data));
    toast.success("Thêm mới thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const getAllLopDaoTao = () => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.get("/lopdaotao");
    console.log("LopDaoTaos",response.data)
    dispatch(slice.actions.getAllLopDaoTaoSuccess(response.data.data.lopdaotaos));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};