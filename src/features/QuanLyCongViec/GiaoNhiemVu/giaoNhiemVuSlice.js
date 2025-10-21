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
  lastBatchUpdate: null,
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

    // Optimistic patch: update totals for a specific employee immediately
    setTotalsForEmployee(state, action) {
      const { employeeId, assignments, totalMucDoKho } = action.payload || {};
      if (!employeeId) return;
      const current = state.totalsByEmployeeId[employeeId] || {};
      state.totalsByEmployeeId[employeeId] = {
        ...current,
        NhanVienID: employeeId,
        assignments:
          typeof assignments === "number"
            ? assignments
            : current.assignments || 0,
        totalMucDoKho:
          typeof totalMucDoKho === "number"
            ? totalMucDoKho
            : current.totalMucDoKho || 0,
      };
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
    batchUpdateSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.lastBatchUpdate = action.payload;
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
      // Cache-busting to avoid 304 affecting Axios error flow
      params._ = Date.now();
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
  (
    { employeeId, dutyId, mucDoKho = null } // ✅ SLICE 1: Accept mucDoKho
  ) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const payload = {
        NhanVienID: employeeId,
        NhiemVuThuongQuyID: dutyId,
      };

      // ✅ SLICE 1: Add MucDoKho if provided
      if (mucDoKho !== null && mucDoKho !== undefined) {
        payload.MucDoKho = mucDoKho;
      }

      const res = await apiService.post(
        `/workmanagement/giao-nhiem-vu/assignments`,
        payload
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

// NEW: Batch update assignments for single employee
export const batchUpdateAssignments =
  ({ employeeId, dutyIds }) =>
  async (dispatch, getState) => {
    dispatch(slice.actions.startLoading());
    try {
      const res = await apiService.put(
        `/workmanagement/giao-nhiem-vu/nhan-vien/${employeeId}/assignments`,
        { dutyIds }
      );
      const data = res?.data?.data;

      const message = `Thêm: ${data?.added || 0} | Khôi phục: ${
        data?.restored || 0
      } | Xóa: ${data?.removed || 0} | Giữ nguyên: ${data?.unchanged || 0}`;
      toast.success(message);

      // Optimistic update totals for this employee so the table reflects immediately
      try {
        const state = getState();
        const duties = state?.giaoNhiemVu?.duties || [];
        const totalMucDoKho = (duties || [])
          .filter((d) => dutyIds.includes(d._id))
          .reduce((sum, d) => sum + (d.MucDoKho || 0), 0);
        dispatch(
          slice.actions.setTotalsForEmployee({
            employeeId,
            assignments: Array.isArray(dutyIds) ? dutyIds.length : 0,
            totalMucDoKho,
          })
        );
      } catch (e) {
        // no-op; fallback to server refresh below
      }

      // Refresh data (server-source-of-truth)
      await dispatch(fetchAssignmentsByEmployee(employeeId));
      await dispatch(fetchDutiesByEmployee(employeeId));
      await dispatch(fetchAssignmentTotals([employeeId]));

      dispatch(slice.actions.hasError(null));
      return data;
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message || "Cập nhật thất bại");
      throw error;
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

// Remove all assignments for a single employee (using batch update with empty array)
export const removeAllAssignments = (employeeId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    // Use batch update with empty dutyIds to remove all
    const res = await apiService.put(
      `/workmanagement/giao-nhiem-vu/nhan-vien/${employeeId}/assignments`,
      { dutyIds: [] }
    );
    const data = res?.data?.data;

    // Optimistic update: set totals to zero immediately
    dispatch(
      slice.actions.setTotalsForEmployee({
        employeeId,
        assignments: 0,
        totalMucDoKho: 0,
      })
    );

    const removed = data?.removed || 0;
    toast.success(`Đã gỡ tất cả ${removed} nhiệm vụ`);

    // Refresh data to sync with server
    try {
      await dispatch(fetchAssignmentsByEmployee(employeeId));
      await dispatch(fetchAssignmentTotals([employeeId]));
    } catch (refreshErr) {
      toast.warn(
        "Gỡ thành công nhưng tải lại dữ liệu thất bại. Vui lòng refresh trang."
      );
    }

    dispatch(slice.actions.hasError(null));
    return data;
  } catch (error) {
    const serverMsg = error?.response?.data?.message;
    dispatch(slice.actions.hasError(serverMsg || error?.message));
    toast.error(serverMsg || "Không thể gỡ tất cả nhiệm vụ");
    throw error;
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

// Copy assignments from source employee to target employee (same department only)
export const copyAssignments =
  ({ sourceEmployeeId, targetEmployeeId }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      // Step 1: Fetch source employee's assignments
      const sourceRes = await apiService.get(
        `/workmanagement/giao-nhiem-vu/assignments`,
        { params: { NhanVienID: sourceEmployeeId } }
      );
      const sourceAssignments = sourceRes?.data?.data || [];

      if (sourceAssignments.length === 0) {
        toast.warning("Nhân viên nguồn không có nhiệm vụ nào để sao chép");
        dispatch(slice.actions.hasError("No assignments to copy"));
        return;
      }

      // Extract duty IDs from source assignments
      const dutyIds = sourceAssignments
        .map((assignment) => {
          const dutyId =
            assignment.NhiemVuThuongQuyID?._id || assignment.NhiemVuThuongQuyID;
          return dutyId;
        })
        .filter(Boolean);

      if (dutyIds.length === 0) {
        toast.warning("Không tìm thấy nhiệm vụ hợp lệ để sao chép");
        dispatch(slice.actions.hasError("No valid duties to copy"));
        return;
      }

      // Step 2: Use batch update to replace target employee's assignments
      let data;
      try {
        const res = await apiService.put(
          `/workmanagement/giao-nhiem-vu/nhan-vien/${targetEmployeeId}/assignments`,
          { dutyIds }
        );
        data = res?.data?.data || {};
      } catch (error) {
        const status = error?.response?.status;
        const serverMsg = error?.response?.data?.message;
        const friendly =
          serverMsg ||
          (status === 403
            ? "Bạn không có quyền thực hiện thao tác này"
            : status === 400
            ? "Không thể sao chép - hai nhân viên phải cùng khoa"
            : error?.message || "Không thể sao chép nhiệm vụ");
        dispatch(slice.actions.hasError(serverMsg || error?.message));
        toast.error(friendly);
        return; // Dừng lại nếu copy thất bại
      }

      // Compute stats defensively (backend may return either 'statistics' or flat counts)
      const stats = data.statistics || {
        added: data.added,
        removed: data.removed,
        unchanged: data.unchanged,
        restored: data.restored,
      };

      dispatch(slice.actions.batchUpdateSuccess(data));

      const added = stats?.added || 0;
      const removed = stats?.removed || 0;
      const unchanged = stats?.unchanged || 0;

      toast.success(
        `Sao chép thành công! Thêm mới: ${added}, Gỡ bỏ: ${removed}, Giữ nguyên: ${unchanged}`
      );

      // Refresh data (không làm hỏng flow sao chép nếu refresh lỗi)
      try {
        await dispatch(fetchAssignmentsByEmployee(targetEmployeeId));
        await dispatch(fetchAssignmentTotals([targetEmployeeId]));
      } catch (refreshErr) {
        // Không spam toast lỗi lớn; chỉ cảnh báo nhẹ nhàng
        toast.warn(
          "Sao chép xong nhưng tải lại dữ liệu thất bại. Vui lòng refresh trang."
        );
      }
    } catch (error) {
      const status = error?.response?.status;
      const serverMsg = error?.response?.data?.message;
      dispatch(slice.actions.hasError(serverMsg || error?.message));

      const friendly =
        serverMsg ||
        (status === 403
          ? "Bạn không có quyền thực hiện thao tác này"
          : status === 400
          ? "Không thể sao chép - hai nhân viên phải cùng khoa"
          : error?.message || "Không thể sao chép nhiệm vụ");
      toast.error(friendly);
    }
  };
