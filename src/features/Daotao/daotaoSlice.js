import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../app/apiService";
import { toast } from "react-toastify";
import QuanLyHocVienPage from "pages/QuanLyHocVienPage";
import { getAllHinhThucCapNhat } from "features/NhanVien/hinhthuccapnhatSlice";

const initialState = {
  isLoading: false,
  error: null,
  LopDaoTaos: [],
  lopdaotaoCurrent: {},
  vaitroquydoiCurents: [],
  hocvienCurrents: [],
  vaitroCurrent: {},
  lopdaotaonhanvienCurrent: [],
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
      state.LopDaoTaos.unshift(action.payload.data);
      state.lopdaotaoCurrent = action.payload.data;
      state.vaitroquydoiCurents = action.payload.vaitroquydoi;
      state.vaitroCurrent = state.vaitroquydoiCurents[0]?.VaiTro || {};
    },
    updateOneLopDaoTaoSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.LopDaoTaos = state.LopDaoTaos.map((item) =>
        item._id === action.payload.data._id ? action.payload.data : item
      );
      state.lopdaotaoCurrent = action.payload.data;
      state.vaitroquydoiCurents = action.payload.vaitroquydoi;
      state.vaitroCurrent = state.vaitroquydoiCurents[0]?.VaiTro || {};
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
      state.lopdaotaoCurrent = action.payload.data;
      state.vaitroquydoiCurents = action.payload.HinhThucCapNhat.find(
        (item) => item.Ma === state.lopdaotaoCurrent.MaHinhThucCapNhat
      )?.VaiTroQuyDoi || [];
      state.vaitroCurrent = state.vaitroquydoiCurents[0]?.VaiTro || {};
    },
    setVaiTroCurrentSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.vaitroCurrent = action.payload;
    },
    addselectedHocVienSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const hocviens = action.payload.map((item) => ({...item, VaiTro: state.vaitroCurrent?state.vaitroCurrent:''}));
      state.hocvienCurrents = state.hocvienCurrents.concat(hocviens);
    },
    removeHocVienFromHocVienCurrentsSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.hocvienCurrents = state.hocvienCurrents.filter(item=>item._id !== action.payload);
    },
    insertOrUpdateLopDaoTaoNhanVienSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      
    },
  },
});
export default slice.reducer;

export const insertOneLopDaoTao =
  ({ lopdaotaoData, vaitroquydoi }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading);
    try {
      const response = await apiService.post(`/lopdaotao`, { lopdaotaoData });
   
      dispatch(
        slice.actions.insertOneLopDaoTaoSuccess({
          data: response.data.data,
          vaitroquydoi,
        })
      );
      toast.success("Thêm mới thành công");
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const updateOneLopDaoTao =
  ({ lopdaotaoData, vaitroquydoi }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading);
    try {
      
      const response = await apiService.put(`/lopdaotao`, lopdaotaoData);
      dispatch(
        slice.actions.updateOneLopDaoTaoSuccess({
          data: response.data.data,
          vaitroquydoi,
        })
      );
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

export const getOneLopDaoTaoByID =
  (lopdaotaoID) => async (dispatch, getState) => {
    dispatch(slice.actions.startLoading);
    try {
      await Promise.all([
        dispatch(getAllHinhThucCapNhat()), // Gọi hành động để lấy tất cả HinhThucCapNhat
        apiService.get(`/lopdaotao/${lopdaotaoID}`) // Gọi API để lấy thông tin LopDaoTao
      ]);
      const response = await apiService.get(`/lopdaotao/${lopdaotaoID}`);
      const HinhThucCapNhat = await getState().hinhthuccapnhat.HinhThucCapNhat;
      console.log("HinhThucCapNhat", HinhThucCapNhat);
      dispatch(
        slice.actions.getOneLopDaoTaoByIDSuccess({
          data: response.data.data,
          HinhThucCapNhat,
        })
      );
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

export const setVaiTroCurrent = (vaitro) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    dispatch(slice.actions.setVaiTroCurrentSuccess(vaitro));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
export const addselectedHocVien = (hocviens) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    dispatch(slice.actions.addselectedHocVienSuccess(hocviens));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
export const removeHocVienFromHocVienCurrents = (id) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    dispatch(slice.actions.removeHocVienFromHocVienCurrentsSuccess(id));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
export const insertOrUpdateLopDaoTaoNhanVien =
  ({ lopdaotaonhanvienData,lopdaotaoID}) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading);
    try {
      const response = await apiService.post(`/lopdaotaonhanvien`, { lopdaotaonhanvienData,lopdaotaoID });
   
      dispatch(
        slice.actions.insertOrUpdateLopDaoTaoNhanVienSuccess({
          data: response.data.data,
         
        })
      );
      toast.success("Thêm mới thành công");
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };