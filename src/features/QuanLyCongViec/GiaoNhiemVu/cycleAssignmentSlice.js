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
  selectedChuKy: null, // ✅ NEW: Full cycle info (with isDong)
  kpiStatus: null, // ✅ NEW: "CHUA_DUYET" | "DA_DUYET" | null
  managerScoresMap: {}, // ✅ NEW: { [nhiemVuId]: DanhGiaNhiemVuThuongQuy }

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
      state.selectedChuKy = action.payload.selectedChuKy || null; // ✅ NEW
      state.kpiStatus = action.payload.kpiStatus || null; // ✅ NEW
      state.managerScoresMap = action.payload.managerScoresMap || {}; // ✅ NEW: For pre-validation
    },

    startSaving(state) {
      state.isSaving = true;
    },
    stopSaving(state) {
      state.isSaving = false; // ✅ NEW: Fix loading stuck bug
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

      // ✅ NEW: Load thêm KPI status, cycle info, và manager scores
      let kpiStatus = null;
      let selectedChuKy = null;
      let managerScoresMap = {};

      if (chuKyId) {
        // Load cycle info
        try {
          const chuKyResponse = await apiService.get(
            `/workmanagement/chu-ky-danh-gia/${chuKyId}`
          );
          selectedChuKy = chuKyResponse.data.data;
        } catch (err) {
          console.warn("Could not load cycle info:", err);
        }

        // Load KPI status
        try {
          const kpiResponse = await apiService.get(`/workmanagement/kpi`, {
            params: { ChuKyDanhGiaID: chuKyId, NhanVienID: employeeId },
          });
          const kpiList =
            kpiResponse.data.data?.danhGiaKPIs || kpiResponse.data.data;
          console.log("🔍 KPI status response:", kpiResponse.data);
          console.log("🔍 KPI list:", kpiList);
          if (kpiList && kpiList.length > 0) {
            kpiStatus = kpiList[0].TrangThai; // "CHUA_DUYET" or "DA_DUYET"
            console.log("✅ KPI Status:", kpiStatus);
          } else {
            console.log("⚠️ No KPI found for this employee and cycle");
          }
        } catch (err) {
          console.error("❌ Error loading KPI status:", err);
        }

        // ✅ NEW: Load manager scores (điểm quản lý đã chấm)
        try {
          const scoresResponse = await apiService.get(
            `/workmanagement/kpi/danh-gia-nhiem-vu`,
            {
              params: { nhanVienId: employeeId, chuKyId },
            }
          );
          const scoresList = scoresResponse.data.data || [];
          console.log("🔍 Manager scores loaded:", scoresList);

          // Build map: { [nhiemVuId]: score }
          managerScoresMap = scoresList.reduce((acc, score) => {
            const nhiemVuId =
              typeof score.NhiemVuThuongQuyID === "object"
                ? score.NhiemVuThuongQuyID._id
                : score.NhiemVuThuongQuyID;
            acc[nhiemVuId] = score;
            return acc;
          }, {});

          console.log("🔍 Manager scores map built:", managerScoresMap);
        } catch (err) {
          console.warn("Could not load manager scores:", err);
        }
      }

      dispatch(
        slice.actions.getAssignmentsByCycleSuccess({
          ...response.data.data,
          kpiStatus,
          selectedChuKy,
          managerScoresMap, // ✅ NEW
        })
      );
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
      dispatch(slice.actions.stopSaving()); // ✅ FIX: Reset loading state
      dispatch(slice.actions.hasError(error.message));
      // Don't toast here - let component handle specific errors
      throw error; // ✅ Re-throw for component to catch
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
