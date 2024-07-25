import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../app/apiService";
import { toast } from "react-toastify";
import QuanLyHocVienPage from "pages/QuanLyHocVienPage";

const initialState = {
  isLoading: false,
  error: null,
  LopDaoTaos: [],
  lopdaotaoCurrent: {},
  hocvienCurrents:[],
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
      state.error = null;
      state.LopDaoTaos.unshift(action.payload);
      state.lopdaotaoCurrent = action.payload;
      
    },
    updateOneLopDaoTaoSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.LopDaoTaos = state.LopDaoTaos.map((item) =>
        item._id === action.payload._id ? action.payload : item
      );
      state.lopdaotaoCurrent = action.payload;
    },
    deleteOneLopDaoTaoSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.LopDaoTaos = state.LopDaoTaos.filter(
        (item) => item._id !== action.payload
      );
    },

    getAllLopDaoTaoSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.LopDaoTaos = action.payload;
    },
    resetLopDaoTaoCurrentSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.lopdaotaoCurrent = {};
    },
    getOneLopDaoTaoByIDSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.lopdaotaoCurrent = action.payload;
    },
  },
});
export default slice.reducer;

export const insertOneLopDaoTao = (lopdaotao) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.post(`/lopdaotao`, lopdaotao);
    console.log("response kien", response.data.data);
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
    const response = await apiService.put(`/lopdaotao`, { lopdaotao });
    dispatch(slice.actions.updateOneLopDaoTaoSuccess(response.data.data));
    toast.success("Cập nhật thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const deleteOneLopDaoTao = (lopdaotaoID) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.delete(`/lopdaotao/${lopdaotaoID}`);
    dispatch(slice.actions.deleteOneLopDaoTaoSuccess(lopdaotaoID));
    toast.success("Xóa thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const getOneLopDaoTaoByID = (lopdaotaoID) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.get(`/lopdaotao/${lopdaotaoID}`);

    dispatch(slice.actions.getOneLopDaoTaoByIDSuccess(response.data.data));

  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
export const resetLopDaoTaoCurrent = () => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    dispatch(slice.actions.resetLopDaoTaoCurrentSuccess());
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const getAllLopDaoTao = () => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.get("/lopdaotao");
    console.log("LopDaoTaos", response.data);
    dispatch(
      slice.actions.getAllLopDaoTaoSuccess(response.data.data.lopdaotaos)
    );
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
