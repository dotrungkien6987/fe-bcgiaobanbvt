import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../../app/apiService";
import { toast } from "react-toastify";

const initialState = {
  isLoading: false,
  error: null,

  // Current context
  employeeId: null,
  employee: null,
  selectedChuKyId: null,

  // Data for current cycle
  assignedTasks: [],
  availableDuties: [],

  // UI states
  isSaving: false,
  isCopying: false,
};

const slice = createSlice({
  name: "cycleAssignment",
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

    setEmployee(state, action) {
      state.employeeId = action.payload;
    },
    setSelectedChuKy(state, action) {
      state.selectedChuKyId = action.payload;
    },

    getAssignmentsByCycleSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.assignedTasks = action.payload.assignedTasks || [];
      state.availableDuties = action.payload.availableDuties || [];
      state.employee = action.payload.employee || null;
    },

    startSaving(state) {
      state.isSaving = true;
    },
    batchUpdateSuccess(state, action) {
      state.isSaving = false;
      state.assignedTasks = action.payload.assignedTasks || [];
      state.availableDuties = action.payload.availableDuties || [];
    },

    startCopying(state) {
      state.isCopying = true;
    },
    copyFromCycleSuccess(state, action) {
      state.isCopying = false;
      // After copy, we need to refetch to get the updated list
    },

    // Local state updates for optimistic UI
    addTaskLocally(state, action) {
      const { duty, mucDoKho } = action.payload;
      // Remove from available
      state.availableDuties = state.availableDuties.filter(
        (d) => d._id !== duty._id
      );
      // Add to assigned (optimistic - will be confirmed by server)
      state.assignedTasks.push({
        NhiemVuThuongQuyID: duty,
        MucDoKho: mucDoKho,
        _id: `temp-${Date.now()}`, // Temporary ID
      });
    },

    removeTaskLocally(state, action) {
      const dutyId = action.payload;
      const removed = state.assignedTasks.find(
        (t) => t.NhiemVuThuongQuyID._id === dutyId
      );
      if (removed) {
        // Remove from assigned
        state.assignedTasks = state.assignedTasks.filter(
          (t) => t.NhiemVuThuongQuyID._id !== dutyId
        );
        // Add back to available
        state.availableDuties.push(removed.NhiemVuThuongQuyID);
        // Sort available duties
        state.availableDuties.sort((a, b) =>
          a.TenNhiemVu.localeCompare(b.TenNhiemVu)
        );
      }
    },

    updateDifficultyLocally(state, action) {
      const { dutyId, mucDoKho } = action.payload;
      const task = state.assignedTasks.find(
        (t) => t.NhiemVuThuongQuyID._id === dutyId
      );
      if (task) {
        task.MucDoKho = mucDoKho;
      }
    },
  },
});

export default slice.reducer;

// Actions
export const {
  setEmployee,
  setSelectedChuKy,
  addTaskLocally,
  removeTaskLocally,
  updateDifficultyLocally,
} = slice.actions;

// Thunks
export const getAssignmentsByCycle =
  (employeeId, chuKyId) => async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const params = chuKyId ? { chuKyId } : {};
      const response = await apiService.get(
        `/workmanagement/giao-nhiem-vu/nhan-vien/${employeeId}/by-cycle`,
        { params }
      );
      dispatch(slice.actions.getAssignmentsByCycleSuccess(response.data.data));
      dispatch(slice.actions.setEmployee(employeeId));
      dispatch(slice.actions.setSelectedChuKy(chuKyId));
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const batchUpdateCycleAssignments =
  (employeeId, chuKyId, tasks) => async (dispatch) => {
    dispatch(slice.actions.startSaving());
    try {
      const response = await apiService.put(
        `/workmanagement/giao-nhiem-vu/nhan-vien/${employeeId}/cycle-assignments`,
        { chuKyId, tasks }
      );
      dispatch(slice.actions.batchUpdateSuccess(response.data.data));
      toast.success("Cập nhật nhiệm vụ thành công");
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const copyFromPreviousCycle =
  (employeeId, fromChuKyId, toChuKyId) => async (dispatch) => {
    dispatch(slice.actions.startCopying());
    try {
      const response = await apiService.post(
        `/workmanagement/giao-nhiem-vu/nhan-vien/${employeeId}/copy-cycle`,
        { fromChuKyId, toChuKyId }
      );
      toast.success(
        `Đã copy ${response.data.data.copiedCount} nhiệm vụ từ chu kỳ trước`
      );
      dispatch(slice.actions.copyFromCycleSuccess(response.data.data));
      // Refetch to get updated list
      dispatch(getAssignmentsByCycle(employeeId, toChuKyId));
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };
