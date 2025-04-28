import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../../app/apiService";
import { toast } from "react-toastify";

const initialState = {
  isLoading: false,
  error: null,
  lichTrucs: [],
  selectedKhoa: null,
};

const slice = createSlice({
  name: "lichTruc",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    getLichTrucByDateRangeSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.lichTrucs = action.payload;
    },
    
    setSelectedKhoa(state, action) {
      state.selectedKhoa = action.payload;
    },
    
    updateLichTrucSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const updatedLichTruc = action.payload;
      
      state.lichTrucs = state.lichTrucs.map((lichTruc) => 
        lichTruc._id === updatedLichTruc._id ? updatedLichTruc : lichTruc
      );
    },
    
    createMultipleLichTrucSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      
      // Thêm các lichTruc mới và cập nhật các temp records
      const newLichTrucs = action.payload;
      
      // Cập nhật lại state.lichTrucs từ newLichTrucs
      // Các bản ghi tạm sẽ được thay thế bằng bản ghi đã lưu thành công
      state.lichTrucs = state.lichTrucs.map(lichTruc => {
        if (lichTruc.isTemp) {
          // Tìm bản ghi mới có cùng ngày
          const ngayTemp = new Date(lichTruc.Ngay).toDateString();
          const newRecord = newLichTrucs.find(
            record => new Date(record.Ngay).toDateString() === ngayTemp
          );
          return newRecord || lichTruc;
        }
        return lichTruc;
      });
    },
    
    deleteLichTrucSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const deletedId = action.payload;
      state.lichTrucs = state.lichTrucs.filter(
        (lichTruc) => lichTruc._id !== deletedId
      );
    },

    getByNgayKhoaSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.lichTrucs = action.payload;
    },
    
    updateOrInsertSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.lichTrucs = action.payload.updatedRecords;
    },
  },
});

export default slice.reducer;

export const setSelectedKhoa = (khoa) => (dispatch) => {
  dispatch(slice.actions.setSelectedKhoa(khoa));
};

export const getLichTrucByDateRange = (fromDate, toDate, khoaId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const params = {
      fromDate,
      toDate,
      khoaId,
    };
    const response = await apiService.get("/lichtruc/by-date-range", { params });
    dispatch(slice.actions.getLichTrucByDateRangeSuccess(response.data.data.lichTrucs));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const createMultipleLichTruc = (lichTrucs) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.post("/lichtruc/multiple", { lichTrucs });
    
    const { createdLichTrucs, errors } = response.data.data;
    
    if (errors && errors.length > 0) {
      // Hiển thị thông báo lỗi nếu có
      errors.forEach(err => toast.error(err));
    }
    
    dispatch(slice.actions.createMultipleLichTrucSuccess(createdLichTrucs));
    
    if (createdLichTrucs.length > 0) {
      toast.success(`Đã thêm ${createdLichTrucs.length} lịch trực thành công`);
    }
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const updateLichTruc = (id, lichTrucData) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.put(`/lichtruc/${id}`, lichTrucData);
    dispatch(slice.actions.updateLichTrucSuccess(response.data.data.updatedLichTruc));
    toast.success("Cập nhật lịch trực thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const deleteLichTruc = (id) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    await apiService.delete(`/lichtruc/${id}`);
    dispatch(slice.actions.deleteLichTrucSuccess(id));
    toast.success("Xóa lịch trực thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const getByNgayKhoa = (fromDate, toDate, khoaId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const params = {
      fromDate,
      toDate,
      khoaId,
    };
    const response = await apiService.get("/lichtruc/by-ngay-khoa", { params });
    dispatch(slice.actions.getByNgayKhoaSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const updateOrInsertLichTruc = (lichTrucs) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.post("/lichtruc/update-or-insert", lichTrucs);
    
    if (response.data.data.errors && response.data.data.errors.length > 0) {
      // Hiển thị thông báo lỗi nếu có
      response.data.data.errors.forEach(err => toast.error(err));
    }
    
    dispatch(slice.actions.updateOrInsertSuccess(response.data.data));
    toast.success(`Cập nhật ${response.data.data.updatedRecords.length} lịch trực thành công`);
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};