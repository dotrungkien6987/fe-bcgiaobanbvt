import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../app/apiService";
import { toast } from "react-toastify";

const initialState = {
  isLoading: false,
  error: null,
  items: [],
  total: 0,
  page: 1,
  size: 20,
  currentItem: null,
  currentFiles: { pdf: [], word: [] },
  versions: [],
  statistics: null,
  // Distribution Management
  distributionList: [],
  distributedToMe: [],
  builtByMyDept: [],
  distributionLoading: false,
  distributionPagination: { page: 1, total: 0, totalPages: 1 },
};

const slice = createSlice({
  name: "quyTrinhISO",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
      state.error = null;
    },
    startDistributionLoading(state) {
      state.distributionLoading = true;
      state.error = null;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.distributionLoading = false;
      state.error = action.payload;
    },
    getListSuccess(state, action) {
      state.isLoading = false;
      state.items = action.payload.items;
      state.total = action.payload.total;
      state.page = action.payload.page;
      state.size = action.payload.size;
    },
    getDetailSuccess(state, action) {
      state.isLoading = false;
      // Backend returns { quyTrinh, files: { pdf, word }, danhSachKhoaPhanPhoi }
      const { quyTrinh, files } = action.payload;
      state.currentItem = quyTrinh;
      state.currentFiles = files || { pdf: [], word: [] };
    },
    getVersionsSuccess(state, action) {
      state.isLoading = false;
      state.versions = action.payload.versions;
    },
    getStatisticsSuccess(state, action) {
      state.isLoading = false;
      state.statistics = action.payload;
    },
    createSuccess(state) {
      state.isLoading = false;
    },
    updateSuccess(state) {
      state.isLoading = false;
    },
    deleteSuccess(state, action) {
      state.isLoading = false;
      state.items = state.items.filter((item) => item._id !== action.payload);
    },
    clearCurrentItem(state) {
      state.currentItem = null;
      state.currentFiles = { pdf: [], word: [] };
    },
    // Distribution Management reducers
    getDistributionListSuccess(state, action) {
      state.distributionLoading = false;
      state.distributionList = action.payload.items;
      state.distributionPagination = {
        page: action.payload.page,
        total: action.payload.total,
        totalPages: action.payload.totalPages,
      };
    },
    getDistributedToMeSuccess(state, action) {
      state.distributionLoading = false;
      state.distributedToMe = action.payload.items;
      state.distributionPagination = {
        page: action.payload.page,
        total: action.payload.total,
        totalPages: action.payload.totalPages,
      };
    },
    getBuiltByMyDeptSuccess(state, action) {
      state.distributionLoading = false;
      state.builtByMyDept = action.payload.items;
      state.distributionPagination = {
        page: action.payload.page,
        total: action.payload.total,
        totalPages: action.payload.totalPages,
      };
    },
    updateDistributionSuccess(state, action) {
      state.distributionLoading = false;
      const updated = action.payload;
      const idx = state.distributionList.findIndex(
        (qt) => qt._id === updated.quyTrinh._id,
      );
      if (idx !== -1) {
        state.distributionList[idx] = {
          ...state.distributionList[idx],
          KhoaPhanPhoi: updated.KhoaPhanPhoi,
        };
      }
    },
  },
});

export default slice.reducer;

// ==================== THUNKS ====================

export const getQuyTrinhISOList = (params) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const res = await apiService.get("/quytrinhiso", { params });
    dispatch(slice.actions.getListSuccess(res.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const getQuyTrinhISODetail = (id) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const res = await apiService.get(`/quytrinhiso/${id}`);
    dispatch(slice.actions.getDetailSuccess(res.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const getQuyTrinhISOVersions = (id) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const res = await apiService.get(`/quytrinhiso/${id}/versions`);
    dispatch(slice.actions.getVersionsSuccess(res.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
  }
};

export const getQuyTrinhISOStatistics = () => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const res = await apiService.get("/quytrinhiso/statistics");
    dispatch(slice.actions.getStatisticsSuccess(res.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
  }
};

export const createQuyTrinhISO = (data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const res = await apiService.post("/quytrinhiso", data);
    dispatch(slice.actions.createSuccess());
    toast.success(res.data.message);
    return res.data.data.quyTrinh; // Return để redirect
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
    throw error;
  }
};

export const updateQuyTrinhISO = (id, data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const res = await apiService.put(`/quytrinhiso/${id}`, data);
    dispatch(slice.actions.updateSuccess());
    toast.success(res.data.message);
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
    throw error;
  }
};

export const deleteQuyTrinhISO = (id) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    await apiService.delete(`/quytrinhiso/${id}`);
    dispatch(slice.actions.deleteSuccess(id));
    toast.success("Đã xóa quy trình");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
    throw error;
  }
};

export const copyFilesFromVersion = (targetId, sourceId, field) => async () => {
  try {
    const url = `/quytrinhiso/${targetId}/copy-files-from/${sourceId}${
      field ? `?field=${field}` : ""
    }`;
    const res = await apiService.post(url);
    toast.success(res.data.message);
    return res.data.data;
  } catch (error) {
    toast.error(error.message);
    throw error;
  }
};

// ==================== DISTRIBUTION MANAGEMENT THUNKS ====================

export const getDistributionList = (params) => async (dispatch) => {
  dispatch(slice.actions.startDistributionLoading());
  try {
    const res = await apiService.get("/quytrinhiso/distribution", { params });
    dispatch(slice.actions.getDistributionListSuccess(res.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const updateDistribution = (id, khoaPhanPhoiIds) => async (dispatch) => {
  dispatch(slice.actions.startDistributionLoading());
  try {
    const res = await apiService.put(`/quytrinhiso/${id}/distribution`, {
      khoaPhanPhoiIds,
    });
    dispatch(slice.actions.updateDistributionSuccess(res.data.data));
    toast.success("Cập nhật phân phối thành công");
    return { success: true };
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
    return { success: false };
  }
};

export const getDistributedToMe = (params) => async (dispatch) => {
  dispatch(slice.actions.startDistributionLoading());
  try {
    const res = await apiService.get("/quytrinhiso/distributed-to-me", {
      params,
    });
    dispatch(slice.actions.getDistributedToMeSuccess(res.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const getBuiltByMyDept = (params) => async (dispatch) => {
  dispatch(slice.actions.startDistributionLoading());
  try {
    const res = await apiService.get("/quytrinhiso/built-by-my-dept", {
      params,
    });
    dispatch(slice.actions.getBuiltByMyDeptSuccess(res.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const { clearCurrentItem } = slice.actions;
