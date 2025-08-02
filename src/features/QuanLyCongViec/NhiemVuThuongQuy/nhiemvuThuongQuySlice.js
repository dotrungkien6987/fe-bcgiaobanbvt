import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../../app/apiService";
import { toast } from "react-toastify";

const initialState = {
  isLoading: false,
  error: null,
  nhiemVuThuongQuys: [],
  nhiemvuThuongQuyCurrent: {},
};

const slice = createSlice({
  name: "nhiemvuThuongQuy",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
      state.error = null;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getAllNhiemVuThuongQuySuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.nhiemVuThuongQuys = action.payload;
    },
    insertOneNhiemVuThuongQuySuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.nhiemVuThuongQuys.unshift(action.payload);
    },
    updateOneNhiemVuThuongQuySuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const index = state.nhiemVuThuongQuys.findIndex(
        (item) => item._id === action.payload._id
      );
      if (index !== -1) {
        state.nhiemVuThuongQuys[index] = action.payload;
      }
    },
    deleteOneNhiemVuThuongQuySuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.nhiemVuThuongQuys = state.nhiemVuThuongQuys.filter(
        (item) => item._id !== action.payload
      );
    },
  },
});

export default slice.reducer;

// Actions
export const getAllNhiemVuThuongQuy = () => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.get("/nhiemvu-thuongquy");
    dispatch(
      slice.actions.getAllNhiemVuThuongQuySuccess(
        response.data.data.nhiemVuThuongQuys
      )
    );
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const insertOneNhiemVuThuongQuy =
  (nhiemvuThuongQuy) => async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await apiService.post(
        "/nhiemvu-thuongquy",
        nhiemvuThuongQuy
      );
      dispatch(
        slice.actions.insertOneNhiemVuThuongQuySuccess(response.data.data)
      );
      toast.success("Thêm mới thành công");
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const updateOneNhiemVuThuongQuy =
  (nhiemvuThuongQuy) => async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await apiService.put("/nhiemvu-thuongquy", {
        nhiemvuThuongQuy,
      });
      dispatch(
        slice.actions.updateOneNhiemVuThuongQuySuccess(response.data.data)
      );
      toast.success("Cập nhật thành công");
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const deleteOneNhiemVuThuongQuy =
  (nhiemvuThuongQuyID) => async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      await apiService.delete(`/nhiemvu-thuongquy/${nhiemvuThuongQuyID}`);
      dispatch(
        slice.actions.deleteOneNhiemVuThuongQuySuccess(nhiemvuThuongQuyID)
      );
      toast.success("Xóa thành công");
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };
