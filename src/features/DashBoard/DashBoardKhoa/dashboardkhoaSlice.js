import { createSlice } from "@reduxjs/toolkit";

import { toast } from "react-toastify";
import { da } from "date-fns/locale";
import apiService from "../../../app/apiService";

const initialState = {
  isLoading: false,
  error: null,
  chisokhoa: {},
  chisokhoa_NgayChenhLech: {},
};

const slice = createSlice({
  name: "dashboardkhoaSlice",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    getDataNewestByNgayKhoaSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.chisokhoa = action.payload;
    },

    getDataNewestByNgayKhoaChenhLechSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.chisokhoa_NgayChenhLech = action.payload;
    },

    getKhuyenCaoKhoaByThangNamSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.khuyencaokhoa = action.payload;
    },

    InsertOrUpdateKhuyenCaoKhoaSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.khuyencaokhoa = action.payload;
    },
  },
});
export default slice.reducer;

export const getDataNewestByNgayKhoa = (date, khoaid) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const params = {
      Ngay: date,
      KhoaID: khoaid,
    };
    console.log(`chi so dashboard khoa 0106 ${date,khoaid}`);
    const response = await apiService.get(`/dashboard/khoa`, { params });
    console.log("chi so dashboard khoa 0106", response.data.data.chisoKhoa);
    dispatch(
      slice.actions.getDataNewestByNgayKhoaSuccess(response.data.data.chisoKhoa)
    );
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const getDataNewestByNgayKhoaChenhLech = (date,khoaid) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const params = {
      Ngay: date,
      KhoaID:khoaid,
    };
    const response = await apiService.get(`/dashboard/khoa`, { params });
    console.log("chi so dashboard chenhlech", response.data.data.chisoKhoa);
    dispatch(
      slice.actions.getDataNewestByNgayKhoaChenhLechSuccess(
        response.data.data.chisoKhoa
      )
    );
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const getKhoas = () => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.get("/khoa");
    dispatch(slice.actions.getKhoasSuccess(response.data.data.khoas));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const getKhuyenCaoKhoaByThangNam = (Thang, Nam) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const params = {
      Thang: Thang,
      Nam: Nam,
    };
    const response = await apiService.get(`/khuyencaokhoa/getonebythangnam`, {
      params,
    });
    console.log("khuyencaokhoa", response.data);
    dispatch(
      slice.actions.getKhuyenCaoKhoaByThangNamSuccess(
        response.data.data.khuyencaokhoa.KhuyenCao
      )
    );
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const deleteDashboardIsNotNewestByNgay = (date) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const params = {
      Ngay: date,
    };
    const response = await apiService.delete(`/dashboard/delbyngay`, { params });
    console.log("dashboarddel", response.data);
    toast.success(`Xóa các ${response.data.data.deletedCount} dashboard không dùng thành công trong ngày ${date}`);
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};