import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../app/apiService";
import { toast } from "react-toastify";

const initialState = {
  isLoading: false,
  error: null,
  isOpenDeleteNhanVien:false,
  isOpenUpdateNhanVien:false,
  nhanvienCurrent:{},
  lopdaotaotheoNhanVienCurrents: [],
  nghiencuukhoahoctheoNhanVienCurrents: [],
  tinchitichluyCurrents: [],

  nhanviens: [],
  datafix:{},
  VaiTro: [],
  ChucDanh:[],
  ChucVu:[],
  TrinhDoChuyenMon:[],  
  NguonKinhPhi:[],
  NoiDaoTao:[],
  DonVi:[],
  NhomHinhThucCapNhat:[],
  HinhThucDaoTao:[],
  DanToc:[],
  PhamViHanhNghe:[],
  
 
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
    setNhanVienCurentSuccess(state,action) {
      console.log('nhanvien action payload',action.payload)
      state.isLoading = false;
      state.error = null;
      state.nhanvienCurrent= action.payload;
    },
    getOneNhanVienByIDSuccess(state,action) {
     
      state.isLoading = false;
      state.error = null;
      state.nhanvienCurrent= action.payload.nhanvien;
      state.lopdaotaotheoNhanVienCurrents= action.payload.daotaos;
      state.nghiencuukhoahoctheoNhanVienCurrents= action.payload.nghiencuukhoahocs;
      state.tinchitichluyCurrents= action.payload.TinChiTichLuys;
    },
    setIsOpenUpdateNhanVienSuccess(state,action) {
      state.isLoading = false;
      state.error = null;
      state.isOpenUpdateNhanVien= action.payload;
    },
    getAllNhanVienSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.nhanviens = action.payload.map((nhanvien) => ({...nhanvien,TenKhoa:nhanvien.KhoaID.TenKhoa}));

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
     state.nhanviens = state.nhanviens.map((nhanvien) =>
        nhanvien._id === action.payload._id ? action.payload : nhanvien
      );
    },
    getDataFixSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
     state.datafix = action.payload;
     state.VaiTro = action.payload.VaiTro;
     state.DonVi = action.payload.DonVi;
     state.ChucDanh = action.payload.ChucDanh;
     state.ChucVu = action.payload.ChucVu;
     state.TrinhDoChuyenMon = action.payload.TrinhDoChuyenMon;
     state.NguonKinhPhi = action.payload.NguonKinhPhi;
     state.NoiDaoTao = action.payload.NoiDaoTao;
     state.NhomHinhThucCapNhat = action.payload.NhomHinhThucCapNhat;
     state.HinhThucDaoTao = action.payload.HinhThucDaoTao;
     state.DanToc = action.payload.DanToc;
     state.PhamViHanhNghe = action.payload.PhamViHanhNghe;
     
    },
    updateOrInsertDatafixSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
     state.datafix = action.payload;
     state.VaiTro = action.payload.VaiTro;
     state.DonVi = action.payload.DonVi;
     state.ChucDanh = action.payload.ChucDanh;
     state.ChucVu = action.payload.ChucVu;
     state.TrinhDoChuyenMon = action.payload.TrinhDoChuyenMon;
     state.NguonKinhPhi = action.payload.NguonKinhPhi;
     state.NoiDaoTao = action.payload.NoiDaoTao;
     state.NhomHinhThucCapNhat = action.payload.NhomHinhThucCapNhat;
     state.HinhThucDaoTao = action.payload.HinhThucDaoTao;
     state.DanToc = action.payload.DanToc;
     state.PhamViHanhNghe = action.payload.PhamViHanhNghe;
    },
    importNhanViensSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
     
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
export const getOneNhanVienByID = (nhanvienID) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    
    const response = await apiService.get(`/nhanvien/${nhanvienID}`);
    console.log("data nhanvien get one",response.data.data)
    dispatch(slice.actions.getOneNhanVienByIDSuccess(response.data.data));
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
    const response = await apiService.delete(`/nhanvien/${nhanvienID}`);
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
   
    const response = await apiService.put(`/nhanvien`,{nhanvien} );
    console.log('nhanvien in update',response.data)
    dispatch(slice.actions.updateOneNhanVienSuccess(response.data.data));
    toast.success("Cập nhật  thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
export const setNhanVienCurent = (nhanvien) =>  async(dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    
    dispatch(slice.actions.setNhanVienCurentSuccess(nhanvien));
   
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
export const setIsOpenUpdateNhanVien = (open) =>  async(dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    
    dispatch(slice.actions.setIsOpenUpdateNhanVienSuccess(open));
   
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
export const getDataFix = ()=> async (dispatch) =>{
  dispatch(slice.actions.startLoading)
  try {

    const response = await apiService.get("/datafix/getAll")
   
    dispatch(slice.actions.getDataFixSuccess(response.data.data.datafix[0]));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message))
    toast.error(error.message)
  }
}
export const importNhanViens = (jsonData) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.post(`/nhanvien/import`, {jsonData});
    dispatch(slice.actions.importNhanViensSuccess(response.data.data));
    dispatch(getAllNhanVien());
    toast.success("Import thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const updateOrInsertDatafix = (datafix) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
   
    const response = await apiService.post(`datafix/insertOrUpdate`,{datafix} );
    // console.log('datafix in update',response.data.data.datafixUpdate)
    dispatch(slice.actions.updateOrInsertDatafixSuccess(response.data.data.datafixUpdate));
    toast.success("Cập nhật  thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};