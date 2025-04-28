import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../../app/apiService";
import { toast } from "react-toastify";

const initialState = {
  isLoading: false,
  error: null,
  lichTrucList: [],
  khoas: [],
  selectedLichTruc: null,
};

const slice = createSlice({
  name: "lichtruc",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    // Reducers cho danh sách lịch trực
    getLichTrucByDateRangeSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.lichTrucList = action.payload;
    },
    
    // Reducers cho thêm/sửa/xóa lịch trực
    createLichTrucSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.lichTrucList.push(action.payload);
    },
    
    updateLichTrucSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.lichTrucList = state.lichTrucList.map(item => 
        item._id === action.payload._id ? action.payload : item
      );
    },
    
    deleteLichTrucSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.lichTrucList = state.lichTrucList.filter(item => item._id !== action.payload);
    },
    
    // Reducers cho danh sách khoa
    getKhoasSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.khoas = action.payload;
    },
  },
});

export default slice.reducer;

// Thunk action để lấy danh sách lịch trực theo khoảng thời gian và khoa
export const getLichTrucByDateRange = (fromDate, toDate, khoaId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const params = {
      fromDate,
      toDate,
      khoaId
    };
    const response = await apiService.get("/lichtruc/by-date-range", { params });
    dispatch(slice.actions.getLichTrucByDateRangeSuccess(response.data.data.lichTrucs));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

// Thunk action để thêm nhiều lịch trực cùng lúc
export const createMultipleLichTruc = (lichTrucs) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.post("/lichtruc/multiple", { lichTrucs });
    
    // Thêm mỗi lịch trực vào state
    response.data.data.createdLichTrucs.forEach(lichTruc => {
      dispatch(slice.actions.createLichTrucSuccess(lichTruc));
    });
    
    toast.success("Thêm lịch trực thành công");
    return response.data.data;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
    throw error;
  }
};

// Thunk action để cập nhật lịch trực
export const updateLichTruc = (id, data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.put(`/lichtruc/${id}`, data);
    dispatch(slice.actions.updateLichTrucSuccess(response.data.data.updatedLichTruc));
    toast.success("Cập nhật lịch trực thành công");
    return response.data.data;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
    throw error;
  }
};

// Thunk action để xóa lịch trực
export const deleteLichTruc = (id) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    await apiService.delete(`/lichtruc/${id}`);
    dispatch(slice.actions.deleteLichTrucSuccess(id));
    toast.success("Xóa lịch trực thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
    throw error;
  }
};

// Thunk action để lấy danh sách khoa
export const getKhoas = () => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.get("/khoa/all");
    dispatch(slice.actions.getKhoasSuccess(response.data.data.khoas));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};