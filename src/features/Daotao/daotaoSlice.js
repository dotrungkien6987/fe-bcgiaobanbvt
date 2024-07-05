import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../app/apiService";
import { toast } from "react-toastify";

const initialState = {
  isLoading: false,
  error: null,
  danhsachcanbo: [],
  danhsachkhoa: [],
  datafix:{},
};

const slice = createSlice({
  name: "daotao",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    endLoading(state) {
      state.isLoading = false;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getDanhSachCanBo(state, action) {
      state.isLoading = false;
      state.error = null;
      state.danhsachcanbo = [...action.payload];
    },
    themCanBo(state, action) {
      state.danhsachcanbo.push(action.payload);
    },
    suaCanBo(state, action) {
      state.isLoading = false;
      state.error = null;
      state.danhsachcanbo = [
        ...state.danhsachcanbo.filter(
          (item) => item.MaCanBo !== action.payload.MaCanBo
        ),
        action.payload,
      ];
    },
    xoaCanBo(state, action) {
      state.isLoading = false;
      state.error = null;
      state.danhsachcanbo = [
        ...state.danhsachcanbo.filter(
          (item) => item.MaCanBo !== action.payload.MaCanBo
        ),
      ];
    },
    getDanhSachKhoa(state, action) {
      state.isLoading = false;
      state.error = null;
      state.danhsachkhoa = [...action.payload];
    },
  },
});
export default slice.reducer;

export const fn_AddCanBo = (data) => async (dispatch) => {
  try {
    const response = await apiService.post("/daotao/thongtincanbo/add", data);
    console.log(response.data);
  } catch (error) {
    dispatch(slice.hasError(error));
    console.log(error);
  }
};

export const fn_GetDanhSachCanBo = () => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.get("/daotao/thongtincanbo");
    dispatch(slice.actions.getDanhSachCanBo(response.data.data.data));
    console.log(response.data.data.data);
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const fn_getDanhSachKhoa = () => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.get("/khoa");
    dispatch(slice.actions.getDanhSachKhoa(response.data.data.khoas));
    console.log(response.data.data.khoas);
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

