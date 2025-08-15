import { createSlice } from "@reduxjs/toolkit";
import apiService from "app/apiService";
import { toast } from "react-toastify";

// Slice name
const name = "nhanvienManagement";

// Initial state
const initialState = {
  isLoading: false,
  error: null,
  // Thông tin nhân viên quản lý hiện tại
  currentManager: null,
  // Danh sách nhân viên được quản lý (có thể giao việc)
  managedEmployees: [],
  totalManagedEmployees: 0,
  // Thông tin tổng quan
  managementInfo: null,
};

// Slice
const slice = createSlice({
  name,
  initialState,
  reducers: {
    startLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    hasError: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Lấy thông tin quản lý thành công
    getManagementInfoSuccess: (state, action) => {
      state.isLoading = false;
      state.error = null;
      state.managementInfo = action.payload;
      state.currentManager = action.payload.nhanVienQuanLy;
      state.managedEmployees = action.payload.nhanVienDuocQuanLy;
      state.totalManagedEmployees = action.payload.tongSoNhanVienQuanLy;
    },

    // Lấy danh sách nhân viên được quản lý thành công
    getManagedEmployeesSuccess: (state, action) => {
      state.isLoading = false;
      state.error = null;
      state.managedEmployees = action.payload;
      state.totalManagedEmployees = action.payload.length;
    },

    // Thêm quan hệ quản lý thành công
    addRelationSuccess: (state, action) => {
      state.isLoading = false;
      state.error = null;
      // Có thể reload lại danh sách sau khi thêm
      toast.success("Thêm quan hệ quản lý thành công");
    },

    // Xóa quan hệ quản lý thành công
    removeRelationSuccess: (state, action) => {
      state.isLoading = false;
      state.error = null;
      // Loại bỏ nhân viên khỏi danh sách
      const removedId = action.payload;
      state.managedEmployees = state.managedEmployees.filter(
        (emp) => emp._id !== removedId
      );
      state.totalManagedEmployees = state.managedEmployees.length;
      toast.success("Xóa quan hệ quản lý thành công");
    },

    // Clear state
    clearState: (state) => {
      state.currentManager = null;
      state.managedEmployees = [];
      state.totalManagedEmployees = 0;
      state.managementInfo = null;
      state.error = null;
    },
  },
});

// Export actions
const {
  startLoading,
  hasError,
  getManagementInfoSuccess,
  getManagedEmployeesSuccess,
  addRelationSuccess,
  removeRelationSuccess,
  clearState,
} = slice.actions;

// API service methods
const nhanvienManagementAPI = {
  getManagementInfo: (nhanvienId) =>
    apiService.get(`/workmanagement/quanlynhanvien/${nhanvienId}/info`),

  getManagedEmployees: (nhanvienId) =>
    apiService.get(`/workmanagement/quanlynhanvien/${nhanvienId}/managed`),

  addRelation: (nhanvienId, data) =>
    apiService.post(
      `/workmanagement/quanlynhanvien/${nhanvienId}/add-relation`,
      data
    ),

  removeRelation: (nhanvienId, managedId) =>
    apiService.delete(
      `/workmanagement/quanlynhanvien/${nhanvienId}/${managedId}`
    ),
};

// Thunks
export const getManagementInfo = (nhanvienId) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const response = await nhanvienManagementAPI.getManagementInfo(nhanvienId);
    dispatch(getManagementInfoSuccess(response.data.data));
  } catch (error) {
    dispatch(hasError(error.message));
    toast.error(`Lỗi khi lấy thông tin quản lý: ${error.message}`);
  }
};

export const getManagedEmployees = (nhanvienId) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const response = await nhanvienManagementAPI.getManagedEmployees(
      nhanvienId
    );
    dispatch(getManagedEmployeesSuccess(response.data.data));
  } catch (error) {
    dispatch(hasError(error.message));
    toast.error(`Lỗi khi lấy danh sách nhân viên: ${error.message}`);
  }
};

export const addManagementRelation =
  (nhanvienId, relationData) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const response = await nhanvienManagementAPI.addRelation(
        nhanvienId,
        relationData
      );
      dispatch(addRelationSuccess(response.data.data));
      // Reload danh sách nhân viên sau khi thêm
      dispatch(getManagedEmployees(nhanvienId));
    } catch (error) {
      dispatch(hasError(error.message));
      toast.error(`Lỗi khi thêm quan hệ quản lý: ${error.message}`);
    }
  };

export const removeManagementRelation =
  (nhanvienId, managedId) => async (dispatch) => {
    dispatch(startLoading());
    try {
      await nhanvienManagementAPI.removeRelation(nhanvienId, managedId);
      dispatch(removeRelationSuccess(managedId));
    } catch (error) {
      dispatch(hasError(error.message));
      toast.error(`Lỗi khi xóa quan hệ quản lý: ${error.message}`);
    }
  };

// Export actions for external use
export { clearState };

// Export reducer
export default slice.reducer;
