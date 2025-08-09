import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../../app/apiService";
import { toast } from "react-toastify";

const initialState = {
  isLoading: false,
  error: null,
  managerId: null,

  employees: [],
  selectedEmployeeId: null,

  duties: [],
  assignments: [],

  creating: false,
  deleting: false,
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
    setSelectedEmployee(state, action) {
      state.selectedEmployeeId = action.payload;
    },

    getManagedEmployeesSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.employees = action.payload;
    },
    getDutiesByEmployeeSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.duties = action.payload;
    },
    getAssignmentsByEmployeeSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.assignments = action.payload;
    },

    assignDutySuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.assignments.unshift(action.payload);
    },
    unassignSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const id = action.payload;
      state.assignments = state.assignments.filter((x) => x._id !== id);
    },
  },
});

export default slice.reducer;

export const setManagerId = (managerId) => async (dispatch) => {
  dispatch(slice.actions.setManagerId(managerId));
};

export const setSelectedEmployee = (employeeId) => async (dispatch) => {
  dispatch(slice.actions.setSelectedEmployee(employeeId));
};

export const fetchManagedEmployees =
  (managerId, loaiQuanLy) => async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const res = await apiService.get(
        `/workmanagement/giao-nhiem-vu/${managerId}/nhan-vien`,
        { params: { loaiQuanLy } }
      );
      dispatch(slice.actions.getManagedEmployeesSuccess(res.data.data));
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
    dispatch(slice.actions.getDutiesByEmployeeSuccess(res.data.data));
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
    dispatch(slice.actions.getAssignmentsByEmployeeSuccess(res.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const assignDuty =
  ({ employeeId, dutyId }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const res = await apiService.post(
        `/workmanagement/giao-nhiem-vu/assignments`,
        { NhanVienID: employeeId, NhiemVuThuongQuyID: dutyId }
      );
      dispatch(slice.actions.assignDutySuccess(res.data.data));
      
      // Kiểm tra xem có phải là khôi phục assignment hay không
      const assignment = res.data.data;
      if (assignment.NgayGan) {
        const assignedDate = new Date(assignment.NgayGan);
        const now = new Date();
        const diffMinutes = (now - assignedDate) / (1000 * 60);
        
        if (diffMinutes < 1) {
          // Vừa được gán -> có thể là tạo mới hoặc khôi phục
          toast.success("Gán nhiệm vụ thành công");
        } else {
          // Đã có từ trước -> khôi phục
          toast.success("Khôi phục nhiệm vụ thành công", {
            description: "Nhiệm vụ đã được gán trước đó và vừa được khôi phục"
          });
        }
      } else {
        toast.success("Gán nhiệm vụ thành công");
      }
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      if (error.message.includes("đã được gán")) {
        toast.error("Nhiệm vụ đã được gán cho nhân viên này");
      } else {
        toast.error(error.message);
      }
    }
  };

export const unassignById = (assignmentId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    await apiService.delete(
      `/workmanagement/giao-nhiem-vu/assignments/${assignmentId}`
    );
    dispatch(slice.actions.unassignSuccess(assignmentId));
    toast.success("Gỡ gán thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
