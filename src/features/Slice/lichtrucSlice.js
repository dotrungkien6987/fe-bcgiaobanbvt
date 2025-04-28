import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../app/apiService";
import { toast } from "react-toastify";

const initialState = {
  isLoading: false,
  error: null,
  lichTrucList: [],
  currentLichTruc: null,
  filterOptions: {
    startDate: null,
    endDate: null,
    khoaId: null,
  },
  khoas: [],
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
    
    // Lấy danh sách lịch trực
    getLichTrucSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.lichTrucList = action.payload;
    },
    
    // Lấy chi tiết 1 lịch trực
    getSingleLichTrucSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.currentLichTruc = action.payload;
    },
    
    // Tạo mới lịch trực
    createLichTrucSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.lichTrucList.unshift(action.payload);
    },
    
    // Tạo nhiều lịch trực
    createMultipleLichTrucSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.lichTrucList = [...action.payload, ...state.lichTrucList];
    },
    
    // Cập nhật lịch trực
    updateLichTrucSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const updatedLichTruc = action.payload;
      const index = state.lichTrucList.findIndex(
        (lichTruc) => lichTruc._id === updatedLichTruc._id
      );
      if (index !== -1) {
        state.lichTrucList[index] = updatedLichTruc;
      }
      
      if (state.currentLichTruc && state.currentLichTruc._id === updatedLichTruc._id) {
        state.currentLichTruc = updatedLichTruc;
      }
    },
    
    // Xóa lịch trực
    deleteLichTrucSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const deletedId = action.payload;
      state.lichTrucList = state.lichTrucList.filter(
        (lichTruc) => lichTruc._id !== deletedId
      );
      
      if (state.currentLichTruc && state.currentLichTruc._id === deletedId) {
        state.currentLichTruc = null;
      }
    },
    
    // Cập nhật filter
    setFilterOptions(state, action) {
      state.filterOptions = {...state.filterOptions, ...action.payload};
    },
    
    // Lấy danh sách khoa
    getKhoasSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.khoas = action.payload;
    },
    
    // Reset state
    resetLichTruc(state) {
      state.currentLichTruc = null;
    },

    // Thêm reducers cho 2 endpoint mới
    getByNgayKhoaSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.lichTrucList = action.payload;
    },
    
    updateOrInsertLichTrucSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.lichTrucList = action.payload.updatedRecords;
    },
  },
});

export default slice.reducer;

// Thunk actions

// Lấy danh sách lịch trực
export const getLichTrucList = () => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.get("/lichtruc");
    dispatch(slice.actions.getLichTrucSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

// Lấy danh sách lịch trực theo khoa
export const getLichTrucByKhoa = (khoaId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.get(`/lichtruc/khoa/${khoaId}`);
    dispatch(slice.actions.getLichTrucSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

// Lấy danh sách lịch trực theo ngày
export const getLichTrucByDate = (date) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.get(`/lichtruc/ngay/${date}`);
    dispatch(slice.actions.getLichTrucSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

// Lấy danh sách lịch trực theo khoảng thời gian
export const getLichTrucByDateRange = (startDate, endDate, khoaId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (khoaId) params.khoaId = khoaId;
    
    const response = await apiService.get(`/lichtruc/range`, { params });
    dispatch(slice.actions.getLichTrucSuccess(response.data.data));
    
    // Cập nhật filter options
    dispatch(slice.actions.setFilterOptions({ startDate, endDate, khoaId }));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

// Lấy chi tiết một lịch trực
export const getSingleLichTruc = (id) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    // Giả sử API này tồn tại, nếu không thì cần phải lấy từ danh sách đã có
    const response = await apiService.get(`/lichtruc/${id}`);
    dispatch(slice.actions.getSingleLichTrucSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

// Tạo mới một lịch trực
export const createLichTruc = (lichTrucData) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.post("/lichtruc", lichTrucData);
    dispatch(slice.actions.createLichTrucSuccess(response.data.data));
    toast.success("Thêm lịch trực thành công");
    return response.data;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.response?.data?.message || error.message);
    throw error;
  }
};

// Tạo nhiều lịch trực cùng lúc
export const createMultipleLichTruc = (lichTrucList) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.post("/lichtruc/multiple", { lichTrucList });
    
    if (response.data.data.successList && response.data.data.successList.length > 0) {
      dispatch(slice.actions.createMultipleLichTrucSuccess(response.data.data.successList));
    }
    
    toast.success(response.data.message);
    return response.data;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.response?.data?.message || error.message);
    throw error;
  }
};

// Cập nhật lịch trực
export const updateLichTruc = (id, lichTrucData) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.put(`/lichtruc/${id}`, lichTrucData);
    dispatch(slice.actions.updateLichTrucSuccess(response.data.data));
    toast.success("Cập nhật lịch trực thành công");
    return response.data;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.response?.data?.message || error.message);
    throw error;
  }
};

// Xóa lịch trực
export const deleteLichTruc = (id) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    await apiService.delete(`/lichtruc/${id}`);
    dispatch(slice.actions.deleteLichTrucSuccess(id));
    toast.success("Xóa lịch trực thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.response?.data?.message || error.message);
    throw error;
  }
};

// Lấy danh sách khoa
export const getKhoas = () => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.get("/khoa");
    dispatch(slice.actions.getKhoasSuccess(response.data.data.khoas));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

// Reset state của lịch trực hiện tại
export const resetLichTruc = () => (dispatch) => {
  dispatch(slice.actions.resetLichTruc());
};

// Hàm cho endpoint get by ngày khoa (tương tự getDataBCGiaoBanByFromDateToDate)
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

// Hàm cho endpoint update or insert (tương tự InsertOrUpdateBCGiaoBanByFromDateToDate)
export const updateOrInsertLichTruc = (lichTrucs) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.post("/lichtruc/update-or-insert", lichTrucs);
    
    if (response.data.data.errors && response.data.data.errors.length > 0) {
      // Hiển thị thông báo lỗi nếu có
      response.data.data.errors.forEach(err => toast.error(err));
    }
    
    dispatch(slice.actions.updateOrInsertLichTrucSuccess(response.data.data));
    toast.success(`Cập nhật ${response.data.data.updatedRecords.length} lịch trực thành công`);
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};