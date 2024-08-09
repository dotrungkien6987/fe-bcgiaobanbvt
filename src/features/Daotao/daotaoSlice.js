import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../app/apiService";
import { toast } from "react-toastify";

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

  hocvientamCurrents: [],
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
    updateTrangThaiLopDaoTaoSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.LopDaoTaos = state.LopDaoTaos.map((item) =>
        item._id === action.payload.lopdaotaoID ? {
          ...item,
          TrangThai: action.payload.TrangThai
        } : item
      );
      state.lopdaotaoCurrent.TrangThai = action.payload.TrangThai;
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
      console.log("resetLopDaoTaoCurrentSuccess");
      state.lopdaotaoCurrent = {};
      state.hocvienCurrents = [];
      state.vaitroquydoiCurents = [];
      state.lopdaotaonhanvienCurrent = [];
      state.vaitroCurrent = {};
    },
    getOneLopDaoTaoByIDSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.lopdaotaoCurrent = action.payload.lopdaotao;
      state.vaitroquydoiCurents =
        action.payload.HinhThucCapNhat.find(
          (item) => item.Ma === state.lopdaotaoCurrent.MaHinhThucCapNhat
        )?.VaiTroQuyDoi || [];
      state.vaitroCurrent = state.vaitroquydoiCurents[0]?.VaiTro || {};

      if(!action.payload.tam) {

        state.hocvienCurrents = action.payload.lopdaotaonhanvien.map((item) => {
          const diemdanhSections = item.DiemDanh.reduce((acc, diemdanh, index) => {
            acc[`section ${index + 1}`] = diemdanh;
            return acc;
          }, {});
      const vaitroquydoi = state.vaitroquydoiCurents.find((vtqd) => vtqd.VaiTro === item.VaiTro);
      const soluong = item.DiemDanh.filter((item) => item === true).length;
      const tinhtudong = vaitroquydoi.QuyDoi * soluong;
          return {
            ...item.NhanVienID,
  
            ...item,
            NhanVienID: item.NhanVienID._id,
            TenKhoa:item.NhanVienID.KhoaID.TenKhoa,
            Sex:item.NhanVienID.GioiTinh===0?"Nam":"Nữ",
            DonVi:vaitroquydoi.DonVi,
            QuyDoi: vaitroquydoi.QuyDoi,
            SoLuong:soluong,
            TuDong:tinhtudong,
            ...diemdanhSections
          };
        });
      } else {
        state.hocvienCurrents = action.payload.lopdaotaonhanvien.map((item) => {
      
          return {
            ...item.NhanVienID,
  
            ...item,
            NhanVienID: item.NhanVienID._id,
            TenKhoa:item.NhanVienID.KhoaID.TenKhoa,
            Sex:item.NhanVienID.GioiTinh===0?"Nam":"Nữ",
          
          };
        });
      }
    },
    setVaiTroCurrentSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.vaitroCurrent = action.payload;
    },
    addselectedHocVienSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const hocviens = action.payload.map((item) => ({
        ...item,
        NhanVienID: item._id,
        VaiTro: state.vaitroCurrent ? state.vaitroCurrent : "",
     
      }));
      state.hocvienCurrents = state.hocvienCurrents.concat(hocviens);
    },
    removeHocVienFromHocVienCurrentsSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.hocvienCurrents = state.hocvienCurrents.filter(
        (item) => item._id !== action.payload
      );
    },
    insertOrUpdateLopDaoTaoNhanVienSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
    },
    updateLopDaoTaoNhanVienDiemDanhSuccess(state, action) {
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

export const updateTrangThaiLopDaoTao =
  ({ TrangThai, lopdaotaoID }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading);
    try {
      const response = await apiService.put(`/lopdaotao/trangthai`, { TrangThai, lopdaotaoID });
      dispatch(
        slice.actions.updateTrangThaiLopDaoTaoSuccess({ TrangThai, lopdaotaoID })
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
  ({lopdaotaoID,tam,userID}) => async (dispatch, getState) => {
    dispatch(slice.actions.startLoading);
    const params = {lopdaotaoID,tam,userID}
    try {
      
     const [_,response] = await Promise.all([
        dispatch(getAllHinhThucCapNhat()), // Gọi hành động để lấy tất cả HinhThucCapNhat
        apiService.get(`/lopdaotao/getextra`,{params}), // Gọi API để lấy thông tin LopDaoTao
      ]);
      console.log("response getbylopdaotaoid", response.data.data);
      const HinhThucCapNhat = await getState().hinhthuccapnhat.HinhThucCapNhat;
      console.log("tam", tam);
      dispatch(
        slice.actions.getOneLopDaoTaoByIDSuccess({
          lopdaotao: response.data.data.lopdaotao,
          lopdaotaonhanvien: response.data.data.lopdaotaonhanvien,
          HinhThucCapNhat,
          tam,
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
    return Promise.resolve(); // Đảm bảo trả về một Promise
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
    return Promise.reject(error);
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
  ({ lopdaotaonhanvienData, lopdaotaoID,tam=false,userID }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading);
    let response;
    try {
      if(!tam){
       response = await apiService.post(`/lopdaotaonhanvien`, {
        lopdaotaonhanvienData,
        lopdaotaoID,
        
      });
    } else {
      response = await apiService.post(`/lopdaotaonhanvientam`, {
        lopdaotaonhanvienData,
        lopdaotaoID,
        userID,
       
      });
    }
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
  
export const updateLopDaoTaoNhanVienDiemDanh =
  (lopdaotaonhanvienDiemDanhData) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading);
    try {
      const response = await apiService.put(`/lopdaotaonhanvien`, {
        lopdaotaonhanvienDiemDanhData,
       
      });

      dispatch(
        slice.actions.updateLopDaoTaoNhanVienDiemDanhSuccess({
          data: response.data.data,
        })
      );
      toast.success("Cập nhật thành công");
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };
