import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../app/apiService";
import { toast } from "react-toastify";
import { formatISO } from 'date-fns';

const initialState = {
  isLoading: false,
  error: null,
  phongKham: [],      // Type 2: Phòng khám (ngoại trú)
  phongThucHien: [],  // Type 7: Phòng thực hiện thủ thuật
  phongLayMau: [],    // Type 38: Phòng lấy mẫu xét nghiệm
  phongNoiTru: [],    // Type 3: Phòng nội trú
  allStats: {}        // Thống kê tổng hợp tất cả phòng
};

const slice = createSlice({  
  name: "soThuTu",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    resetState(state) {
      state.phongKham = [];
      state.phongThucHien = [];
      state.phongLayMau = [];
      state.phongNoiTru = [];
      state.allStats = {};
      state.error = null;
    },
    getPhongKhamSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.phongKham = action.payload;
    },
    getPhongThucHienSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.phongThucHien = action.payload;
    },
    getPhongLayMauSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.phongLayMau = action.payload;
    },
    getPhongNoiTruSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.phongNoiTru = action.payload;
    },   
     getAllStatsSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.allStats = action.payload;
    }
  }
});

export default slice.reducer;

// Selectors
export const selectSoThuTuLoading = state => state.soThuTu.isLoading;
export const selectSoThuTuError = state => state.soThuTu.error;
export const selectSoThuTuPhongKham = state => state.soThuTu.phongKham;
export const selectSoThuTuPhongThucHien = state => state.soThuTu.phongThucHien;
export const selectSoThuTuPhongLayMau = state => state.soThuTu.phongLayMau;
export const selectSoThuTuPhongNoiTru = state => state.soThuTu.phongNoiTru;
export const selectSoThuTuAllStats = state => state.soThuTu.allStats;

// Thunks
export const resetSoThuTuState = () => (dispatch) => {
  dispatch(slice.actions.resetState());
};

export const getSoThuTuPhongKham = (date, departmentIds) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.post("/his/sothutu/stats", {
      date,
      departmentIds,
      type: '2'  // Type 2 is for phongKham
    });
    dispatch(slice.actions.getPhongKhamSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message || "Không thể lấy dữ liệu phòng khám"));
    toast.error(error.message || "Không thể lấy dữ liệu phòng khám");
  }
};

export const getSoThuTuPhongThucHien = (date, departmentIds) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.post("/his/sothutu/stats", {
      date,
      departmentIds,
      type: '7'  // Type 7 is for phongThucHien
    });
    dispatch(slice.actions.getPhongThucHienSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message || "Không thể lấy dữ liệu phòng thực hiện"));
    toast.error(error.message || "Không thể lấy dữ liệu phòng thực hiện");
  }
};

export const getSoThuTuPhongLayMau = (date, departmentIds) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.post("/his/sothutu/stats", {
      date,
      departmentIds,
      type: '38'  // Type 38 is for phongLayMau
    });
    dispatch(slice.actions.getPhongLayMauSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message || "Không thể lấy dữ liệu phòng lấy mẫu"));
    toast.error(error.message || "Không thể lấy dữ liệu phòng lấy mẫu");
  }
};

export const getSoThuTuPhongNoiTru = (date, departmentIds) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.post("/his/sothutu/stats", {
      date,
      departmentIds,
      type: '3'  // Type 3 is for phongNoiTru
    });
    dispatch(slice.actions.getPhongNoiTruSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message || "Không thể lấy dữ liệu phòng nội trú"));
    toast.error(error.message || "Không thể lấy dữ liệu phòng nội trú");
  }
};

export const getAllSoThuTuStats = (date, departmentIds) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    // Sử dụng API mới để lấy tất cả dữ liệu trong một lần gọi
    const response = await apiService.post("/his/sothutu/all-stats", { date, departmentIds });
    
    // Update all states
    
    dispatch(slice.actions.getPhongKhamSuccess(response.data.data.phongKham));
    dispatch(slice.actions.getPhongThucHienSuccess(response.data.data.phongThucHien));
    dispatch(slice.actions.getPhongLayMauSuccess(response.data.data.phongLayMau));
    dispatch(slice.actions.getPhongNoiTruSuccess(response.data.data.phongDieuTri));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message || "Không thể lấy dữ liệu số thứ tự"));
    toast.error(error.message || "Không thể lấy dữ liệu số thứ tự");
  }
};