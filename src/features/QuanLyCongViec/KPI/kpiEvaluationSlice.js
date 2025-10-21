import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import apiService from "app/apiService";

/**
 * ✅ NEW KPI EVALUATION SLICE - SIMPLIFIED
 *
 * Purpose: Manage KPI evaluation workflow with cycle-based assignments
 *
 * Flow:
 * 1. Select cycle
 * 2. View employees list
 * 3. Click evaluate → Open dialog
 * 4. Enter scores → Save
 * 5. Calculate KPI
 */

const initialState = {
  // Cycles
  cycles: [],
  selectedCycleId: null,

  // Employees (managed by current user)
  employees: [],

  // Tasks for evaluation (current employee + cycle)
  tasksForEvaluation: [],
  currentEmployee: null,

  // KPI Scores
  kpiScores: {}, // { employeeId: { DiemKPI, XepLoai, ChiTiet, ... } }

  // UI States
  isLoading: false,
  isSaving: false,
  error: null,
};

const slice = createSlice({
  name: "kpiEvaluation",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
      state.error = null;
    },
    startSaving(state) {
      state.isSaving = true;
      state.error = null;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.isSaving = false;
      state.error = action.payload;
    },

    // Cycles
    getCyclesSuccess(state, action) {
      state.isLoading = false;
      state.cycles = action.payload;
    },
    setSelectedCycle(state, action) {
      state.selectedCycleId = action.payload;
      state.employees = []; // Reset employees when cycle changes
      state.tasksForEvaluation = [];
      state.currentEmployee = null;
    },

    // Employees
    getEmployeesSuccess(state, action) {
      state.isLoading = false;
      state.employees = action.payload;
    },

    // Tasks for evaluation
    getTasksForEvaluationSuccess(state, action) {
      state.isLoading = false;
      state.tasksForEvaluation = action.payload.tasks;
      state.currentEmployee = action.payload.employee;
    },

    // Save evaluation
    saveEvaluationSuccess(state, action) {
      state.isSaving = false;
      // Optionally update tasksForEvaluation with new scores
      toast.success("Lưu đánh giá thành công");
    },

    // Calculate KPI
    calculateKPISuccess(state, action) {
      state.isLoading = false;
      const { employeeId, result } = action.payload;
      state.kpiScores[employeeId] = result;
    },

    // Reset
    resetEvaluation(state) {
      state.tasksForEvaluation = [];
      state.currentEmployee = null;
    },
  },
});

export default slice.reducer;

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Get evaluation cycles (active + upcoming)
 */
export const getCycles = () => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.get("/workmanagement/chu-ky-danh-gia");

    // Handle response format: { danhSach: [...] } or direct array
    const cyclesData = response.data.data;
    let cycles = [];

    if (cyclesData && Array.isArray(cyclesData.danhSach)) {
      cycles = cyclesData.danhSach;
    } else if (Array.isArray(cyclesData)) {
      cycles = cyclesData;
    }

    dispatch(slice.actions.getCyclesSuccess(cycles));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error("Không thể tải danh sách chu kỳ");
  }
};

/**
 * Set selected cycle
 */
export const setSelectedCycle = (cycleId) => (dispatch) => {
  dispatch(slice.actions.setSelectedCycle(cycleId));
};

/**
 * Get employees managed by current user (for KPI evaluation)
 */
export const getEmployeesForEvaluation = (cycleId) => async (dispatch) => {
  if (!cycleId) {
    toast.error("Vui lòng chọn chu kỳ đánh giá");
    return;
  }

  dispatch(slice.actions.startLoading());
  try {
    // ✅ Use KPI dashboard API instead (includes danhGiaKPI data)
    const response = await apiService.get(
      `/workmanagement/kpi/dashboard/${cycleId}`
    );

    const { nhanVienList } = response.data.data || {};

    // Transform to match expected format with danhGiaKPI
    const employees = (nhanVienList || []).map((item) => ({
      employee: item.nhanVien,
      assignedCount: item.progress?.total || 0,
      totalDuties: item.progress?.total || 0,
      danhGiaKPI: item.danhGiaKPI || null,
    }));

    dispatch(slice.actions.getEmployeesSuccess(employees));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error("Không thể tải danh sách nhân viên");
  }
};

/**
 * ✅ NEW: Get tasks for evaluation (by employee + cycle)
 * API: GET /kpi/nhan-vien/:NhanVienID/nhiem-vu?chuKyId=xxx
 */
export const fetchTasksForEvaluation =
  (employeeId, cycleId) => async (dispatch) => {
    if (!cycleId) {
      toast.error("Vui lòng chọn chu kỳ đánh giá");
      return;
    }

    dispatch(slice.actions.startLoading());
    try {
      const response = await apiService.get(
        `/workmanagement/kpi/nhan-vien/${employeeId}/nhiem-vu?chuKyId=${cycleId}`
      );

      const { tasks, chuKy } = response.data.data;

      dispatch(
        slice.actions.getTasksForEvaluationSuccess({
          tasks,
          employee: { _id: employeeId }, // Minimal employee info
          cycle: chuKy,
        })
      );
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message || "Không thể tải danh sách nhiệm vụ");
    }
  };

/**
 * ✅ NEW: Save evaluation scores (batch upsert)
 * API: POST /kpi/nhan-vien/:NhanVienID/danh-gia
 */
export const saveEvaluation =
  (employeeId, cycleId, evaluations) => async (dispatch) => {
    if (!cycleId) {
      toast.error("Thiếu thông tin chu kỳ đánh giá");
      return;
    }

    if (!Array.isArray(evaluations) || evaluations.length === 0) {
      toast.error("Vui lòng nhập điểm đánh giá");
      return;
    }

    dispatch(slice.actions.startSaving());
    try {
      const response = await apiService.post(
        `/workmanagement/kpi/nhan-vien/${employeeId}/danh-gia`,
        { chuKyId: cycleId, evaluations }
      );

      dispatch(slice.actions.saveEvaluationSuccess(response.data.data));

      // Refresh tasks to show updated scores
      dispatch(fetchTasksForEvaluation(employeeId, cycleId));

      // Recalculate KPI
      dispatch(calculateKPI(employeeId, cycleId));
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message || "Không thể lưu đánh giá");
    }
  };

/**
 * ✅ NEW: Calculate KPI score
 * API: GET /kpi/nhan-vien/:NhanVienID/diem-kpi?chuKyId=xxx
 */
export const calculateKPI = (employeeId, cycleId) => async (dispatch) => {
  if (!cycleId) {
    toast.error("Vui lòng chọn chu kỳ đánh giá");
    return;
  }

  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.get(
      `/workmanagement/kpi/nhan-vien/${employeeId}/diem-kpi?chuKyId=${cycleId}`
    );

    const result = response.data.data;

    dispatch(
      slice.actions.calculateKPISuccess({
        employeeId,
        result,
      })
    );

    toast.success(`Điểm KPI: ${result.DiemKPI} - ${result.XepLoai}`);
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message || "Không thể tính điểm KPI");
  }
};

/**
 * Reset evaluation state
 */
export const resetEvaluation = () => (dispatch) => {
  dispatch(slice.actions.resetEvaluation());
};
