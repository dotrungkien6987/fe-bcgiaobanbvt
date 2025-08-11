import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../../app/apiService";
import { toast } from "react-toastify";

const initialState = {
  isLoading: false,
  error: null,
  managerId: null,
  managerInfo: null,

  employees: [],
  selectedEmployeeId: null,

  duties: [],
  assignments: [],
  totalsByEmployeeId: {},

  creating: false,
  deleting: false,
  lastBulkAssign: null,
};

const slice = createSlice({
  name: "giaoNhiemVu",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    setManagerId(state, action) {
      state.managerId = action.payload;
    },
    getManagerInfoSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.managerInfo = action.payload || null;
    },
    setSelectedEmployee(state, action) {
      state.selectedEmployeeId = action.payload;
    },

    getManagedEmployeesSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.employees = action.payload || [];
    },
    getDutiesByEmployeeSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.duties = action.payload || [];
    },
    getAssignmentsByEmployeeSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.assignments = action.payload || [];
    },
    getAssignmentTotalsSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const arr = action.payload || [];
      const map = {};
      arr.forEach((x) => {
        const id = x.NhanVienID || x._id || x?.nhanvien?._id;
        if (id) map[id] = x;
      });
      state.totalsByEmployeeId = { ...state.totalsByEmployeeId, ...map };
    },

    assignDutySuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const newItem = action.payload;
      if (!newItem) return;
      const idx = state.assignments.findIndex((x) => x._id === newItem._id);
      if (idx >= 0) {
        state.assignments[idx] = newItem;
      } else {
        state.assignments.unshift(newItem);
      }
    },
    unassignSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const payload = action.payload;
      // Support removing by id or by pair { employeeId, dutyId }
      if (typeof payload === "string") {
        state.assignments = state.assignments.filter((x) => x._id !== payload);
      } else if (payload && payload.employeeId && payload.dutyId) {
        state.assignments = state.assignments.filter(
          (x) =>
            !(
              (x.NhanVienID?._id || x.NhanVienID) === payload.employeeId &&
              (x.NhiemVuThuongQuyID?._id || x.NhiemVuThuongQuyID) ===
                payload.dutyId
            )
        );
      }
    },
    bulkAssignSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.lastBulkAssign = action.payload;
    },
  },
});

export default slice.reducer;

// Simple setters
export const setManagerId = (managerId) => async (dispatch) => {
  dispatch(slice.actions.setManagerId(managerId));
};

export const setSelectedEmployee = (employeeId) => async (dispatch) => {
  dispatch(slice.actions.setSelectedEmployee(employeeId));
};

// Manager info
export const fetchManagerInfo = (managerId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const res = await apiService.get(`/nhanvien/simple/${managerId}`);
    dispatch(slice.actions.getManagerInfoSuccess(res?.data?.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

// Fetchers
export const fetchManagedEmployees =
  (managerId, loaiQuanLy) => async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const res = await apiService.get(
        `/workmanagement/giao-nhiem-vu/${managerId}/nhan-vien`,
        { params: { loaiQuanLy } }
      );
      dispatch(slice.actions.getManagedEmployeesSuccess(res?.data?.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const fetchDutiesByEmployee = (employeeId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const res = await apiService.get(
      `/workmanagement/giao-nhiem-vu/nhan-vien/${employeeId}/nhiem-vu`
    );
    dispatch(slice.actions.getDutiesByEmployeeSuccess(res?.data?.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const fetchAssignmentsByEmployee = (employeeId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const res = await apiService.get(
      `/workmanagement/giao-nhiem-vu/assignments`,
      { params: { NhanVienID: employeeId } }
    );
    dispatch(slice.actions.getAssignmentsByEmployeeSuccess(res?.data?.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

// Fetch totals for one or many employees
export const fetchAssignmentTotals =
  (employeeIds, selectedOnly = false) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const params = {};
      if (Array.isArray(employeeIds) && employeeIds.length > 0)
        params.NhanVienIDs = employeeIds.join(",");
      if (selectedOnly) params.selectedOnly = true;
      const res = await apiService.get(
        `/workmanagement/giao-nhiem-vu/assignments/totals`,
        { params }
      );
      dispatch(slice.actions.getAssignmentTotalsSuccess(res?.data?.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      // optional toast suppressed to avoid noise
    }
  };

// Mutations
export const assignDuty =
  ({ employeeId, dutyId }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const res = await apiService.post(
        `/workmanagement/giao-nhiem-vu/assignments`,
        {
          NhanVienID: employeeId,
          NhiemVuThuongQuyID: dutyId,
        }
      );
      const assignment = res?.data?.data || res?.data;
      dispatch(slice.actions.assignDutySuccess(assignment));
      // Ensure sync for restored assignments
      await dispatch(fetchAssignmentsByEmployee(employeeId));
      await dispatch(fetchAssignmentTotals([employeeId]));
      toast.success("Đã gán nhiệm vụ");
    } catch (error) {
      const status = error?.response?.status;
      const serverMsg = error?.response?.data?.message;
      dispatch(slice.actions.hasError(serverMsg || error.message));
      const friendly =
        serverMsg ||
        (status === 409
          ? "Nhiệm vụ đã được gán cho nhân viên này"
          : status === 403
          ? "Bạn không có quyền thao tác với nhân viên này"
          : status === 400
          ? "Nhiệm vụ không cùng khoa với nhân viên"
          : "Không thể gán nhiệm vụ");
      toast.error(friendly);
    }
  };

export const unassignById = (assignmentId) => async (dispatch, getState) => {
  dispatch(slice.actions.startLoading());
  try {
    await apiService.delete(
      `/workmanagement/giao-nhiem-vu/assignments/${assignmentId}`
    );
    dispatch(slice.actions.unassignSuccess(assignmentId));
    const employeeId = getState()?.giaoNhiemVu?.selectedEmployeeId;
    if (employeeId) await dispatch(fetchAssignmentsByEmployee(employeeId));
    if (employeeId) await dispatch(fetchAssignmentTotals([employeeId]));
    toast.success("Đã gỡ gán nhiệm vụ");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

// Unassign by pair (NhanVienID + NhiemVuThuongQuyID)
export const unassignByPair =
  ({ employeeId, dutyId }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      await apiService.delete(`/workmanagement/giao-nhiem-vu/assignments`, {
        params: { NhanVienID: employeeId, NhiemVuThuongQuyID: dutyId },
      });
      dispatch(slice.actions.unassignSuccess({ employeeId, dutyId }));
      await dispatch(fetchAssignmentsByEmployee(employeeId));
      toast.success("Đã gỡ gán nhiệm vụ");
    } catch (error) {
      const serverMsg = error?.response?.data?.message;
      dispatch(slice.actions.hasError(serverMsg || error.message));
      toast.error(serverMsg || "Không thể gỡ gán nhiệm vụ");
    }
  };

// Bulk assign multiple duties to multiple employees
export const bulkAssign =
  ({ employeeIds, dutyIds }) =>
  async (dispatch, getState) => {
    dispatch(slice.actions.startLoading());
    try {
      const res = await apiService.post(
        `/workmanagement/giao-nhiem-vu/assignments/bulk`,
        {
          NhanVienIDs: employeeIds,
          NhiemVuThuongQuyIDs: dutyIds,
        }
      );
      const data = res?.data?.data || res?.data || {};
      const created = data?.created ?? data?.count?.created ?? 0;
      const restored = data?.restored ?? data?.count?.restored ?? 0;
      const skipped = data?.skipped ?? data?.count?.skipped ?? 0;
      dispatch(slice.actions.bulkAssignSuccess({ created, restored, skipped }));

      const empId = getState()?.giaoNhiemVu?.selectedEmployeeId;
      if (empId) await dispatch(fetchAssignmentsByEmployee(empId));
      if (empId) await dispatch(fetchAssignmentTotals([empId]));

      toast.success(
        `Gán nhiệm vụ: tạo mới ${created}, khôi phục ${restored}, bỏ qua ${skipped}`
      );
    } catch (error) {
      const status = error?.response?.status;
      const serverMsg = error?.response?.data?.message;
      dispatch(slice.actions.hasError(serverMsg || error.message));
      const friendly =
        serverMsg ||
        (status === 409
          ? "Nhiệm vụ đã được gán cho một số nhân viên"
          : status === 403
          ? "Bạn không có quyền thực hiện thao tác này"
          : status === 400
          ? "Dữ liệu không hợp lệ hoặc khác khoa"
          : "Không thể gán hàng loạt");
      toast.error(friendly);
    }
  };
