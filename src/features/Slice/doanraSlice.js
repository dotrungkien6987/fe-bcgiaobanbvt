import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../app/apiService";
import { toast } from "react-toastify";

const initialState = {
  isLoading: false,
  error: null,
  doanRas: [],
  currentDoanRa: null,
  totalPages: 0,
  totalDocs: 0,
  statsCountry: [],
  statsMonth: [],
  filters: {
    page: 1,
    limit: 10,
    search: "",
    fromDate: null,
    toDate: null,
    quocGia: "",
  },
};

const slice = createSlice({
  name: "doanra",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Lấy danh sách đoàn ra
    getDoanRasSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.doanRas = action.payload.doanRas;
      state.totalPages = action.payload.totalPages;
      state.totalDocs = action.payload.totalDocs;
    },

    // Tạo mới đoàn ra
    createDoanRaSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.doanRas.unshift(action.payload);
      state.totalDocs += 1;
    },

    // Lấy chi tiết đoàn ra
    getDoanRaByIdSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.currentDoanRa = action.payload;
    },

    // Cập nhật đoàn ra
    updateDoanRaSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const index = state.doanRas.findIndex(
        (item) => item._id === action.payload._id
      );
      if (index !== -1) {
        state.doanRas[index] = action.payload;
      }
      if (
        state.currentDoanRa &&
        state.currentDoanRa._id === action.payload._id
      ) {
        state.currentDoanRa = action.payload;
      }
    },

    // Xóa đoàn ra
    deleteDoanRaSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.doanRas = state.doanRas.filter(
        (item) => item._id !== action.payload
      );
      state.totalDocs -= 1;
      if (state.currentDoanRa && state.currentDoanRa._id === action.payload) {
        state.currentDoanRa = null;
      }
    },

    // Thống kê theo quốc gia
    getDoanRaStatsByCountrySuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.statsCountry = action.payload.stats;
    },

    // Thống kê theo tháng
    getDoanRaStatsByMonthSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.statsMonth = action.payload.stats;
    },

    // Cập nhật filters
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Reset current đoàn ra
    resetCurrentDoanRa(state) {
      state.currentDoanRa = null;
    },

    // Clear error
    clearError(state) {
      state.error = null;
    },
  },
});

export default slice.reducer;

// Action creators
export const { setFilters, resetCurrentDoanRa, clearError } = slice.actions;

// Async actions
export const getDoanRas =
  (params = {}) =>
  async (dispatch, getState) => {
    dispatch(slice.actions.startLoading());
    try {
      const { filters } = getState().doanra;
      const queryParams = { ...filters, ...params };

      // Loại bỏ các tham số rỗng
      Object.keys(queryParams).forEach((key) => {
        if (queryParams[key] === "" || queryParams[key] === null) {
          delete queryParams[key];
        }
      });

      const response = await apiService.get("/doanra", { params: queryParams });
      dispatch(slice.actions.getDoanRasSuccess(response.data.data));
      dispatch(slice.actions.setFilters(queryParams));
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const createDoanRa = (doanRaData) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.post("/doanra", doanRaData);
    dispatch(slice.actions.createDoanRaSuccess(response.data.data));
    toast.success("Tạo thông tin đoàn ra thành công");
    return response.data.data;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
    throw error;
  }
};

export const getDoanRaById = (id) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.get(`/doanra/${id}`);
    dispatch(slice.actions.getDoanRaByIdSuccess(response.data.data));
    return response.data.data;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
    throw error;
  }
};

export const updateDoanRa = (id, updateData) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.put(`/doanra/${id}`, updateData);
    dispatch(slice.actions.updateDoanRaSuccess(response.data.data));
    toast.success("Cập nhật đoàn ra thành công");
    return response.data.data;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
    throw error;
  }
};

export const deleteDoanRa = (id) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    await apiService.delete(`/doanra/${id}`);
    dispatch(slice.actions.deleteDoanRaSuccess(id));
    toast.success("Xóa đoàn ra thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
    throw error;
  }
};

export const getDoanRaStatsByCountry = (year) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const params = year ? { year } : {};
    const response = await apiService.get("/doanra/stats/country", { params });
    dispatch(slice.actions.getDoanRaStatsByCountrySuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const getDoanRaStatsByMonth = (year) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const params = year ? { year } : {};
    const response = await apiService.get("/doanra/stats/month", { params });
    dispatch(slice.actions.getDoanRaStatsByMonthSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

// Selectors
export const selectDoanRa = (state) => state.doanra;
export const selectDoanRaList = (state) => state.doanra.doanRas;
export const selectCurrentDoanRa = (state) => state.doanra.currentDoanRa;
export const selectDoanRaLoading = (state) => state.doanra.isLoading;
export const selectDoanRaError = (state) => state.doanra.error;
export const selectDoanRaFilters = (state) => state.doanra.filters;
export const selectDoanRaStatsCountry = (state) => state.doanra.statsCountry;
export const selectDoanRaStatsMonth = (state) => state.doanra.statsMonth;
export const selectDoanRaPagination = (state) => ({
  totalPages: state.doanra.totalPages,
  totalDocs: state.doanra.totalDocs,
  currentPage: state.doanra.filters.page,
  limit: state.doanra.filters.limit,
});
