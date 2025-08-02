import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../../app/apiService";
import { toast } from "react-toastify";

const initialState = {
  isLoading: false,
  error: null,
  nhomViecUsers: [],
  nhomViecUserCurrent: {},
};

const slice = createSlice({
  name: "nhomViecUser",
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

    getAllNhomViecUserSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.nhomViecUsers = action.payload;
    },

    insertOneNhomViecUserSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.nhomViecUsers.unshift(action.payload);
    },

    updateOneNhomViecUserSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const index = state.nhomViecUsers.findIndex(
        (item) => item._id === action.payload._id
      );
      if (index !== -1) {
        state.nhomViecUsers[index] = action.payload;
      }
    },

    deleteOneNhomViecUserSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.nhomViecUsers = state.nhomViecUsers.filter(
        (item) => item._id !== action.payload
      );
    },
  },
});

export default slice.reducer;

// Actions
export const getAllNhomViecUser = () => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.get("/nhomviec-user");
    dispatch(
      slice.actions.getAllNhomViecUserSuccess(response.data.data.nhomViecUsers)
    );
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const insertOneNhomViecUser = (nhomViecUser) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.post("/nhomviec-user", nhomViecUser);
    dispatch(slice.actions.insertOneNhomViecUserSuccess(response.data.data));
    toast.success("Thêm mới thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const updateOneNhomViecUser = (nhomViecUser) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.put("/nhomviec-user", { nhomViecUser });
    dispatch(slice.actions.updateOneNhomViecUserSuccess(response.data.data));
    toast.success("Cập nhật thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const deleteOneNhomViecUser = (nhomViecUserID) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    await apiService.delete(`/nhomviec-user/${nhomViecUserID}`);
    dispatch(slice.actions.deleteOneNhomViecUserSuccess(nhomViecUserID));
    toast.success("Xóa thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const getNhomViecUserByKhoaId = (khoaId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.get(`/nhomviec-user/khoa/${khoaId}`);
    dispatch(slice.actions.getAllNhomViecUserSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
