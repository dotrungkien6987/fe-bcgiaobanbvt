// congViecSlice – v2 (2025-08-27)
// Chuẩn hoá: thêm helper buildUpdatePayload để tránh duplicated sanitize logic.
// Giữ nguyên hành vi đặc biệt: không loại bỏ NhiemVuThuongQuyID=null & FlagNVTQKhac=false khi update.
import { createSlice } from "@reduxjs/toolkit";
import apiService from "app/apiService";
import { toast } from "react-toastify";
import {
  WORK_ACTIONS,
  PERMISSION_ERROR_MESSAGES,
} from "./workActions.constants";

// Slice name
const name = "congViec";

// Initial state
const initialState = {
  isLoading: false,
  error: null,
  // Domain-specific state fields
  currentNhanVien: null, // Thông tin nhân viên hiện tại
  activeTab: "received", // 'received' | 'assigned'
  receivedCongViecs: [], // Công việc được giao (nhân viên là người xử lý chính)
  assignedCongViecs: [], // Công việc đã giao (nhân viên là người giao việc)
  receivedTotal: 0,
  assignedTotal: 0,
  receivedPages: 0,
  assignedPages: 0,
  // Step 2: Detail and form state
  congViecDetail: null, // Chi tiết công việc đang xem
  currentPage: {
    received: 1,
    assigned: 1,
  },
  filters: {
    received: {
      search: "",
      TrangThai: "",
      MucDoUuTien: "",
      NgayBatDau: null,
      NgayHetHan: null,
      MaCongViec: "",
      NguoiChinhID: "",
      TinhTrangHan: "", // Extended due status filter
    },
    assigned: {
      search: "",
      TrangThai: "",
      MucDoUuTien: "",
      NgayBatDau: null,
      NgayHetHan: null,
      MaCongViec: "",
      NguoiChinhID: "",
      TinhTrangHan: "",
    },
  },
  // Replies cache: parentCommentId -> { items, loading, loaded, error }
  repliesByParent: {},
  // Optimistic concurrency: store conflict info when 409 detected
  versionConflict: null, // { id, type: 'transition'|'update', action?, payload, timestamp }
  // Routine task list for current user
  myRoutineTasks: [],
  loadingRoutineTasks: false,
  myRoutineTasksLoaded: false,
  myRoutineTasksLastFetch: null,
  myRoutineTasksError: null,
  // Subtasks (Slim Plan) – parentId -> { ids:[], loading, loaded, error, lastFetch }
  subtasksByParent: {},
  // Store minimal subtask entities for quick detail linking
  subtaskEntities: {}, // id -> subtask DTO (subset from backend)
};

// Create slice
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
    getNhanVienSuccess: (state, action) => {
      state.isLoading = false;
      state.error = null;
      state.currentNhanVien = action.payload;
    },
    getReceivedCongViecsSuccess: (state, action) => {
      state.isLoading = false;
      state.error = null;
      const { CongViecs, totalItems, totalPages, currentPage } = action.payload;
      state.receivedCongViecs = CongViecs;
      state.receivedTotal = totalItems;
      state.receivedPages = totalPages;
      state.currentPage.received = currentPage;
    },
    getAssignedCongViecsSuccess: (state, action) => {
      state.isLoading = false;
      state.error = null;
      const { CongViecs, totalItems, totalPages, currentPage } = action.payload;
      state.assignedCongViecs = CongViecs;
      state.assignedTotal = totalItems;
      state.assignedPages = totalPages;
      state.currentPage.assigned = currentPage;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setFilters: (state, action) => {
      const { tab, filters } = action.payload;
      state.filters[tab] = { ...state.filters[tab], ...filters };
      state.currentPage[tab] = 1; // Reset page khi filter
    },
    resetFilters: (state, action) => {
      const tab = action.payload;
      state.filters[tab] = {
        search: "",
        TrangThai: "",
        MucDoUuTien: "",
        NgayBatDau: null,
        NgayHetHan: null,
        MaCongViec: "",
        NguoiChinhID: "",
        TinhTrangHan: "",
      };
      state.currentPage[tab] = 1;
    },
    setCurrentPage: (state, action) => {
      const { tab, page } = action.payload;
      state.currentPage[tab] = page;
    },
    deleteCongViecSuccess: (state, action) => {
      state.isLoading = false;
      state.error = null;
      const deletedId = action.payload;
      // Remove from both arrays
      state.receivedCongViecs = state.receivedCongViecs.filter(
        (cv) => cv._id !== deletedId
      );
      state.assignedCongViecs = state.assignedCongViecs.filter(
        (cv) => cv._id !== deletedId
      );
    },
    clearState: (state) => {
      // Preserve UI state (activeTab, currentPage, filters) when clearing data
      const preservedState = {
        activeTab: state.activeTab,
        currentPage: state.currentPage,
        filters: state.filters,
      };
      return { ...initialState, ...preservedState };
    },
    // Step 2: Detail, Create, Update actions
    getCongViecDetailSuccess: (state, action) => {
      state.isLoading = false;
      state.error = null;
      const cv = action.payload;
      if (Array.isArray(cv?.BinhLuans)) {
        cv.BinhLuans = [...cv.BinhLuans].sort((a, b) => {
          const da = new Date(a?.NgayBinhLuan || a?.createdAt || 0).getTime();
          const db = new Date(b?.NgayBinhLuan || b?.createdAt || 0).getTime();
          return db - da; // newest first
        });
      }
      state.congViecDetail = cv;
    },
    createCongViecSuccess: (state, action) => {
      state.isLoading = false;
      state.error = null;
      const newCongViec = action.payload;
      // Add to assigned list if current user is the creator
      state.assignedCongViecs.unshift(newCongViec);
      state.assignedTotal += 1;
    },
    updateCongViecSuccess: (state, action) => {
      state.isLoading = false;
      state.error = null;
      const updatedCongViec = action.payload;

      // Update in received list
      const receivedIndex = state.receivedCongViecs.findIndex(
        (cv) => cv._id === updatedCongViec._id
      );
      if (receivedIndex !== -1) {
        state.receivedCongViecs[receivedIndex] = updatedCongViec;
      }

      // Update in assigned list
      const assignedIndex = state.assignedCongViecs.findIndex(
        (cv) => cv._id === updatedCongViec._id
      );
      if (assignedIndex !== -1) {
        state.assignedCongViecs[assignedIndex] = updatedCongViec;
      }

      // Update detail if currently viewing
      if (
        state.congViecDetail &&
        state.congViecDetail._id === updatedCongViec._id
      ) {
        state.congViecDetail = updatedCongViec;
      }
    },
    updateHistoryNoteOptimistic: (state, action) => {
      const { congViecId, index, note } = action.payload;
      if (state.congViecDetail && state.congViecDetail._id === congViecId) {
        const list = state.congViecDetail.LichSuTrangThai;
        if (Array.isArray(list) && list[index]) {
          list[index].GhiChu = note;
        }
      }
    },
    updateHistoryNoteRevert: (state, action) => {
      const { congViecId, index, prev } = action.payload;
      if (state.congViecDetail && state.congViecDetail._id === congViecId) {
        const list = state.congViecDetail.LichSuTrangThai;
        if (Array.isArray(list) && list[index]) {
          list[index].GhiChu = prev;
        }
      }
    },
    // Progress history note optimistic update
    updateProgressHistoryNoteOptimistic: (state, action) => {
      const { congViecId, index, note } = action.payload;
      if (state.congViecDetail && state.congViecDetail._id === congViecId) {
        const list = state.congViecDetail.LichSuTienDo;
        if (Array.isArray(list) && list[index]) {
          list[index].GhiChu = note;
        }
      }
    },
    updateProgressHistoryNoteRevert: (state, action) => {
      const { congViecId, index, prev } = action.payload;
      if (state.congViecDetail && state.congViecDetail._id === congViecId) {
        const list = state.congViecDetail.LichSuTienDo;
        if (Array.isArray(list) && list[index]) {
          list[index].GhiChu = prev;
        }
      }
    },
    addCommentSuccess: (state, action) => {
      state.isLoading = false;
      state.error = null;
      const { congViecId, comment } = action.payload;
      const parentId = comment?.BinhLuanChaID || comment?.parentId;
      // Check if parentId is truthy string, not null/undefined
      if (parentId && parentId !== "null" && parentId !== "") {
        const existing = state.repliesByParent[parentId] || {
          items: [],
          loading: false,
          loaded: false,
          error: null,
        };
        const updated = {
          ...existing,
          items: [comment, ...(existing.items || [])],
          loaded: true,
          loading: false,
        };
        state.repliesByParent = {
          ...state.repliesByParent,
          [parentId]: updated,
        };
        // Also update RepliesCount in parent comment
        if (state.congViecDetail && state.congViecDetail._id === congViecId) {
          const parentComment = state.congViecDetail.BinhLuans?.find(
            (c) => c._id === parentId
          );
          if (parentComment) {
            parentComment.RepliesCount = (parentComment.RepliesCount || 0) + 1;
          }
        }
      } else if (
        state.congViecDetail &&
        state.congViecDetail._id === congViecId
      ) {
        state.congViecDetail.BinhLuans = state.congViecDetail.BinhLuans || [];
        // Insert newest comment at the beginning so it appears first
        state.congViecDetail.BinhLuans.unshift(comment);
      }
    },
    recallCommentSuccess: (state, action) => {
      state.isLoading = false;
      state.error = null;
      const { congViecId, binhLuanId } = action.payload;
      if (state.congViecDetail && state.congViecDetail._id === congViecId) {
        const list = state.congViecDetail.BinhLuans || [];
        const idx = list.findIndex((c) => c._id === binhLuanId);
        if (idx !== -1) {
          list[idx] = { ...list[idx], TrangThai: "DELETED", NoiDung: "" };
        }
        // also update if it is a reply
        for (const parentId of Object.keys(state.repliesByParent || {})) {
          const bucket = state.repliesByParent[parentId];
          const i = bucket?.items?.findIndex((c) => c._id === binhLuanId);
          if (i != null && i >= 0) {
            const newItems = [...bucket.items];
            newItems[i] = {
              ...newItems[i],
              TrangThai: "DELETED",
              NoiDung: "",
            };
            state.repliesByParent = {
              ...state.repliesByParent,
              [parentId]: { ...bucket, items: newItems },
            };
            break;
          }
        }
      }
    },
    // Thu hồi chỉ nội dung text của bình luận (giữ file)
    recallCommentTextSuccess: (state, action) => {
      state.isLoading = false;
      state.error = null;
      const { congViecId, binhLuanId } = action.payload;
      if (state.congViecDetail && state.congViecDetail._id === congViecId) {
        const list = state.congViecDetail.BinhLuans || [];
        const idx = list.findIndex((c) => c._id === binhLuanId);
        if (idx !== -1) {
          list[idx] = { ...list[idx], NoiDung: "" };
        }
        // also update replies
        for (const parentId of Object.keys(state.repliesByParent || {})) {
          const bucket = state.repliesByParent[parentId];
          const i = bucket?.items?.findIndex((c) => c._id === binhLuanId);
          if (i != null && i >= 0) {
            const newItems = [...bucket.items];
            newItems[i] = { ...newItems[i], NoiDung: "" };
            state.repliesByParent = {
              ...state.repliesByParent,
              [parentId]: { ...bucket, items: newItems },
            };
            break;
          }
        }
      }
    },
    // Đánh dấu 1 tệp trong Files của bình luận là DELETED để đồng bộ UI ngay
    markCommentFileDeleted: (state, action) => {
      const { congViecId, fileId } = action.payload;
      if (state.congViecDetail && state.congViecDetail._id === congViecId) {
        const comments = state.congViecDetail.BinhLuans || [];
        for (const c of comments) {
          if (!Array.isArray(c.Files)) continue;
          const idx = c.Files.findIndex((f) => f._id === fileId);
          if (idx !== -1) {
            c.Files[idx] = { ...c.Files[idx], TrangThai: "DELETED" };
            break;
          }
        }
        // also scan replies buckets
        for (const parentId of Object.keys(state.repliesByParent || {})) {
          const bucket = state.repliesByParent[parentId];
          let updated = false;
          const newItems = (bucket?.items || []).map((c) => {
            if (!Array.isArray(c.Files)) return c;
            const idx = c.Files.findIndex((f) => f._id === fileId);
            if (idx === -1) return c;
            const newFiles = [...c.Files];
            newFiles[idx] = { ...newFiles[idx], TrangThai: "DELETED" };
            updated = true;
            return { ...c, Files: newFiles };
          });
          if (updated) {
            state.repliesByParent = {
              ...state.repliesByParent,
              [parentId]: { ...bucket, items: newItems },
            };
          }
        }
      }
    },
    // Replies reducers
    fetchRepliesStart: (state, action) => {
      const parentId = action.payload;
      const existing = state.repliesByParent[parentId] || {
        items: [],
        loading: false,
        loaded: false,
        error: null,
      };
      const updated = { ...existing, loading: true, error: null };
      state.repliesByParent = {
        ...state.repliesByParent,
        [parentId]: updated,
      };
    },
    fetchRepliesSuccess: (state, action) => {
      const { parentId, items } = action.payload;
      const existing = state.repliesByParent[parentId] || {
        items: [],
        loading: false,
        loaded: false,
        error: null,
      };
      const updated = {
        ...existing,
        items,
        loading: false,
        loaded: true,
        error: null,
      };
      state.repliesByParent = {
        ...state.repliesByParent,
        [parentId]: updated,
      };
    },
    fetchRepliesError: (state, action) => {
      const { parentId, error } = action.payload;
      const existing = state.repliesByParent[parentId] || {
        items: [],
        loading: false,
        loaded: false,
        error: null,
      };
      const updated = { ...existing, loading: false, error };
      state.repliesByParent = {
        ...state.repliesByParent,
        [parentId]: updated,
      };
    },
    applyCongViecPatch: (state, action) => {
      const patch = action.payload || {};
      const id = patch._id;
      if (!id) return;
      const apply = (cv) => (cv && cv._id === id ? { ...cv, ...patch } : cv);
      state.receivedCongViecs = state.receivedCongViecs.map(apply);
      state.assignedCongViecs = state.assignedCongViecs.map(apply);
      if (state.congViecDetail && state.congViecDetail._id === id) {
        state.congViecDetail = { ...state.congViecDetail, ...patch };
      }
    },
    setVersionConflict: (state, action) => {
      state.versionConflict = action.payload;
    },
    clearVersionConflict: (state) => {
      state.versionConflict = null;
    },
    fetchMyRoutineTasksStart: (state) => {
      state.loadingRoutineTasks = true;
      state.myRoutineTasksError = null;
    },
    fetchMyRoutineTasksSuccess: (state, action) => {
      state.loadingRoutineTasks = false;
      state.myRoutineTasks = action.payload || [];
      state.myRoutineTasksLoaded = true;
      state.myRoutineTasksLastFetch = Date.now();
      state.myRoutineTasksError = null;
      // Sort tasks by name for consistent display
      if (state.myRoutineTasks.length > 0) {
        state.myRoutineTasks.sort((a, b) =>
          (a.Ten || "").localeCompare(b.Ten || "", "vi", {
            numeric: true,
            sensitivity: "base",
          })
        );
      }
    },
    fetchMyRoutineTasksError: (state, action) => {
      state.loadingRoutineTasks = false;
      state.myRoutineTasksError =
        action.payload || "Có lỗi khi tải danh sách nhiệm vụ thường quy";
    },
    appendProgressHistory: (state, action) => {
      const { congViecId, entry } = action.payload || {};
      if (!congViecId || !entry) return;
      if (state.congViecDetail && state.congViecDetail._id === congViecId) {
        const arr = state.congViecDetail.LichSuTienDo;
        if (Array.isArray(arr)) {
          arr.push(entry); // immer handles draft mutation
        } else {
          state.congViecDetail.LichSuTienDo = [entry];
        }
      }
    },
    // Subtasks reducers
    fetchSubtasksStart: (state, action) => {
      const parentId = action.payload;
      const bucket = state.subtasksByParent[parentId] || {
        ids: [],
        loading: false,
        loaded: false,
        error: null,
        lastFetch: null,
      };
      state.subtasksByParent[parentId] = {
        ...bucket,
        loading: true,
        error: null,
      };
    },
    fetchSubtasksSuccess: (state, action) => {
      const { parentId, items } = action.payload;
      const ids = [];
      (items || []).forEach((it) => {
        if (!it || !it._id) return;
        ids.push(it._id);
        state.subtaskEntities[it._id] = it;
      });
      state.subtasksByParent[parentId] = {
        ids,
        loading: false,
        loaded: true,
        error: null,
        lastFetch: Date.now(),
      };
    },
    fetchSubtasksError: (state, action) => {
      const { parentId, error } = action.payload;
      const bucket = state.subtasksByParent[parentId] || {
        ids: [],
        loaded: false,
        loading: false,
        error: null,
        lastFetch: null,
      };
      state.subtasksByParent[parentId] = {
        ...bucket,
        loading: false,
        error,
      };
    },
    createSubtaskSuccess: (state, action) => {
      const { parentId, subtask } = action.payload || {};
      if (!subtask || !subtask._id) return;
      state.subtaskEntities[subtask._id] = subtask;
      const bucket = state.subtasksByParent[parentId];
      if (bucket && bucket.loaded) {
        // prepend newest
        bucket.ids = [subtask._id, ...bucket.ids];
      } else {
        state.subtasksByParent[parentId] = {
          ids: [subtask._id],
          loading: false,
          loaded: true,
          error: null,
          lastFetch: Date.now(),
        };
      }
      // Update parent detail counts optimistically
      if (state.congViecDetail && state.congViecDetail._id === parentId) {
        const d = state.congViecDetail;
        d.ChildrenCount = (d.ChildrenCount || 0) + 1;
        if (d.ChildrenSummary) {
          d.ChildrenSummary.total = (d.ChildrenSummary.total || 0) + 1;
          d.ChildrenSummary.active = (d.ChildrenSummary.active || 0) + 1;
          d.ChildrenSummary.incomplete =
            (d.ChildrenSummary.incomplete || 0) + 1;
          d.ChildrenSummary.done = d.ChildrenSummary.done || 0; // unchanged
          d.AllChildrenDone = false;
        }
      }
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
  startLoading,
  hasError,
  getNhanVienSuccess,
  getReceivedCongViecsSuccess,
  getAssignedCongViecsSuccess,
  setActiveTab,
  setFilters,
  resetFilters,
  setCurrentPage,
  deleteCongViecSuccess,
  clearState,
  // Step 2 actions
  getCongViecDetailSuccess,
  createCongViecSuccess,
  updateCongViecSuccess,
  addCommentSuccess,
  recallCommentSuccess,
  recallCommentTextSuccess,
  markCommentFileDeleted,
  // replies
  fetchRepliesStart,
  fetchRepliesSuccess,
  fetchRepliesError,
  setVersionConflict,
  clearVersionConflict,
  fetchMyRoutineTasksStart,
  fetchMyRoutineTasksSuccess,
  fetchMyRoutineTasksError,
  appendProgressHistory,
  // Subtasks
  fetchSubtasksStart,
  fetchSubtasksSuccess,
  fetchSubtasksError,
  createSubtaskSuccess,
} = slice.actions;

// API service methods
const congViecAPI = {
  getNhanVien: (nhanvienid) =>
    apiService.get(`/workmanagement/nhanvien/${nhanvienid}`),
  getReceived: (nhanvienid, params) =>
    apiService.get(`/workmanagement/congviec/${nhanvienid}/received`, {
      params,
    }),
  getAssigned: (nhanvienid, params) =>
    apiService.get(`/workmanagement/congviec/${nhanvienid}/assigned`, {
      params,
    }),
  delete: (id) => apiService.delete(`/workmanagement/congviec/${id}`),
  // Step 2: Detail, Create, Update APIs
  getDetail: (id) => apiService.get(`/workmanagement/congviec/detail/${id}`),
  create: (data) => apiService.post(`/workmanagement/congviec`, data),
  update: (id, data) => apiService.put(`/workmanagement/congviec/${id}`, data),
  // Legacy flow APIs removed (use transition)
  transition: (id, data) =>
    apiService.post(`/workmanagement/congviec/${id}/transition`, data),
  addComment: (id, data) =>
    apiService.post(`/workmanagement/congviec/${id}/comment`, data),
  deleteComment: (id) => apiService.delete(`/workmanagement/binhluan/${id}`),
  recallCommentText: (id) =>
    apiService.patch(`/workmanagement/binhluan/${id}/text`),
  listReplies: (parentId) =>
    apiService.get(`/workmanagement/binhluan/${parentId}/replies`),
  getMyRoutineTasks: () =>
    apiService.get(`/workmanagement/nhiemvuthuongquy/my`),
  updateProgress: (id, data, config) =>
    apiService.post(
      `/workmanagement/congviec/${id}/progress?mode=patch`,
      data,
      config
    ),
  // Subtasks APIs
  createSubtask: (parentId, data) =>
    apiService.post(`/workmanagement/congviec/${parentId}/subtasks`, data),
  getChildren: (parentId, params) =>
    apiService.get(`/workmanagement/congviec/${parentId}/children`, {
      params,
    }),
};

// Helper: build payload cho updateCongViec (không dùng cho create – create vẫn bỏ null)
function buildUpdatePayload(data) {
  const composed = {
    ...data,
    CanhBaoMode: data?.CanhBaoMode || "PERCENT",
    CanhBaoSapHetHanPercent:
      typeof data?.CanhBaoSapHetHanPercent === "number" &&
      data.CanhBaoSapHetHanPercent >= 0.5 &&
      data.CanhBaoSapHetHanPercent <= 1
        ? data.CanhBaoSapHetHanPercent
        : 0.8,
  };
  const sanitized = Object.fromEntries(
    Object.entries(composed).filter(([k, v]) => {
      if (k === "NhiemVuThuongQuyID") return true; // giữ cả null để clear liên kết
      if (k === "FlagNVTQKhac") return true; // giữ cả false để backend phân biệt
      return v !== null && v !== undefined;
    })
  );
  if (sanitized.CanhBaoMode === "PERCENT" && "NgayCanhBao" in sanitized) {
    delete sanitized.NgayCanhBao;
  }
  return sanitized;
}

// Manual thunks
export const getNhanVien = (nhanvienid) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await congViecAPI.getNhanVien(nhanvienid);
    dispatch(slice.actions.getNhanVienSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const getReceivedCongViecs =
  (nhanvienid, filters = {}) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      // Validate and sanitize params
      const sanitizedParams = {
        ...filters,
        page: Math.max(1, parseInt(filters.page) || 1),
        limit: Math.max(1, Math.min(100, parseInt(filters.limit) || 10)),
      };

      // Remove empty string filters to avoid interfering with backend cleaning logic
      Object.keys(sanitizedParams).forEach((k) => {
        if (sanitizedParams[k] === "" || sanitizedParams[k] == null) {
          delete sanitizedParams[k];
        }
      });

      console.log("Frontend sending params:", sanitizedParams);

      const response = await congViecAPI.getReceived(
        nhanvienid,
        sanitizedParams
      );
      dispatch(slice.actions.getReceivedCongViecsSuccess(response.data.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const getAssignedCongViecs =
  (nhanvienid, filters = {}) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      // Validate and sanitize params
      const sanitizedParams = {
        ...filters,
        page: Math.max(1, parseInt(filters.page) || 1),
        limit: Math.max(1, Math.min(100, parseInt(filters.limit) || 10)),
      };

      Object.keys(sanitizedParams).forEach((k) => {
        if (sanitizedParams[k] === "" || sanitizedParams[k] == null) {
          delete sanitizedParams[k];
        }
      });

      console.log("Frontend sending assigned params:", sanitizedParams);

      const response = await congViecAPI.getAssigned(
        nhanvienid,
        sanitizedParams
      );
      dispatch(slice.actions.getAssignedCongViecsSuccess(response.data.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const deleteCongViec = (id) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const res = await congViecAPI.delete(id);
    const meta = res?.data?.data;
    dispatch(slice.actions.deleteCongViecSuccess(id));
    toast.success("Xóa công việc thành công");
    if (meta) {
      const { commentCount, fileCount } = meta;
      const parts = [];
      if (commentCount > 0) parts.push(`${commentCount} bình luận đã được ẩn`);
      if (fileCount > 0) parts.push(`${fileCount} tệp đã được ẩn`);
      if (parts.length > 0) toast.info(parts.join("; "));
    }
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

// Step 2: Detail, Create, Update thunks
export const getCongViecDetail = (id) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await congViecAPI.getDetail(id);
    dispatch(slice.actions.getCongViecDetailSuccess(response.data.data));
    // Lazy fetch subtasks if any (or always if Depth defined)
    const cv = response.data.data;
    if (cv && cv.ChildrenCount > 0) {
      // fire and forget; errors handled inside thunk
      try {
        dispatch(fetchSubtasks(cv._id));
      } catch (_) {}
    }
    return response.data.data;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
    throw error;
  }
};

export const createCongViec = (data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    // Sanitize payload: drop null/undefined; ensure defaults for warning config
    const sanitized = Object.fromEntries(
      Object.entries({
        ...data,
        CanhBaoMode: data?.CanhBaoMode || "PERCENT",
        CanhBaoSapHetHanPercent:
          typeof data?.CanhBaoSapHetHanPercent === "number" &&
          data.CanhBaoSapHetHanPercent >= 0.5 &&
          data.CanhBaoSapHetHanPercent <= 1
            ? data.CanhBaoSapHetHanPercent
            : 0.8,
      }).filter(([_, v]) => v !== null && v !== undefined)
    );
    // If mode is PERCENT, do not send NgayCanhBao to avoid conflicts
    if (sanitized.CanhBaoMode === "PERCENT" && "NgayCanhBao" in sanitized) {
      delete sanitized.NgayCanhBao;
    }
    // Debug log payload (dev only)
    console.log("Creating CongViec with payload:", sanitized);

    const response = await congViecAPI.create(sanitized);
    const cv = response.data.data;
    // capture version
    const version = cv?.updatedAt;
    if (version) cv.__version = version;
    dispatch(slice.actions.createCongViecSuccess(cv));
    toast.success(
      `Tạo công việc thành công${cv?.MaCongViec ? `: ${cv.MaCongViec}` : ""}`
    );
    return response.data.data;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
    throw error;
  }
};

export const updateCongViec =
  ({ id, data }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const sanitized = buildUpdatePayload(data);
      console.log("Updating CongViec with payload:", sanitized); // dev log

      const headers = sanitized?.expectedVersion
        ? { "If-Unmodified-Since": sanitized.expectedVersion }
        : undefined;
      const response = await congViecAPI.update(
        id,
        sanitized,
        headers ? { headers } : undefined
      );
      const cv = response.data.data;
      if (cv?.updatedAt) cv.__version = cv.updatedAt;
      dispatch(slice.actions.updateCongViecSuccess(cv));
      toast.success("Cập nhật công việc thành công");
      return cv;
    } catch (error) {
      // Detect optimistic concurrency version conflict
      if (error?.message === "VERSION_CONFLICT") {
        dispatch(
          slice.actions.setVersionConflict({
            id,
            type: "update",
            payload: { id, data },
            timestamp: Date.now(),
          })
        );
        toast.warning(
          "Công việc đã được cập nhật bởi người khác. Vui lòng tải lại trước khi sửa đổi."
        );
      } else {
        dispatch(slice.actions.hasError(error.message));
        toast.error(error.message);
      }
      throw error;
    }
  };

export const updateCongViecStatus =
  ({ congViecId, trangThai }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await congViecAPI.update(congViecId, {
        TrangThai: trangThai,
      });
      dispatch(slice.actions.updateCongViecSuccess(response.data.data));
      toast.success(`Đã cập nhật trạng thái: ${trangThai}`);
      return response.data.data;
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
      throw error;
    }
  };

// Legacy thunks (tiepNhan/hoanThanh/duyetHoanThanh/giaoViec) removed in Step 4.

// Unified transition thunk
export const transitionCongViec =
  ({ id, action, lyDo, ghiChu, extra }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const expectedVersion = extra?.expectedVersion;
      const body = {
        action,
        lyDo,
        ghiChu,
        ...extra,
        expectedVersion,
      };
      const res = await congViecAPI.transition(
        id,
        body,
        expectedVersion
          ? { headers: { "If-Unmodified-Since": expectedVersion } }
          : undefined
      );
      const data = res.data?.data;
      const patch = data?.patch;
      let full = data?.congViec || data?.congViecDetail;
      // If only patch returned, optimistically apply to detail & lists
      // If only patch and no full returned we'll optimistically apply via reducer below
      if (full) {
        if (full?.updatedAt) full.__version = full.updatedAt;
        dispatch(slice.actions.updateCongViecSuccess(full));
      } else if (patch) {
        if (patch?.updatedAt) patch.__version = patch.updatedAt;
        dispatch(applyCongViecPatch(patch));
        // Silent detail refresh to update history & derived fields not in patch
        try {
          dispatch(getCongViecDetail(id));
        } catch (_) {
          /* ignore */
        }
      }
      toast.success(`Đã thực hiện: ${action}`);
      return full || patch;
    } catch (error) {
      if (error?.message === "VERSION_CONFLICT") {
        dispatch(
          slice.actions.setVersionConflict({
            id,
            type: "transition",
            action,
            payload: { id, action, lyDo, ghiChu, extra },
            timestamp: Date.now(),
          })
        );
        toast.warning(
          "Xung đột phiên bản: công việc đã thay đổi. Tải lại để xem cập nhật."
        );
      } else {
        dispatch(slice.actions.hasError(error.message));
        const raw =
          error?.response?.data?.errors?.message ||
          error?.response?.data?.error?.message;
        const mapped = PERMISSION_ERROR_MESSAGES[raw] || raw;
        toast.error(mapped || error.message);
      }
      throw error;
    }
  };

// Cập nhật ghi chú lịch sử trạng thái (inline)
export const updateHistoryNote =
  ({ congViecId, index, note }) =>
  async (dispatch, getState) => {
    const state = getState();
    const prev =
      state.congViec.congViecDetail?.LichSuTrangThai?.[index]?.GhiChu || "";
    dispatch(
      slice.actions.updateHistoryNoteOptimistic({ congViecId, index, note })
    );
    try {
      await apiService.put(
        `/workmanagement/congviec/${congViecId}/history/${index}/note`,
        { note }
      );
      // Optionally refetch detail to ensure consistency (could be skipped to reduce load)
      try {
        dispatch(getCongViecDetail(congViecId));
      } catch (_) {}
    } catch (err) {
      dispatch(
        slice.actions.updateHistoryNoteRevert({ congViecId, index, prev })
      );
      toast.error("Không lưu được ghi chú");
    }
  };

// Cập nhật ghi chú lịch sử tiến độ (inline)
export const updateProgressHistoryNote =
  ({ congViecId, index, note }) =>
  async (dispatch, getState) => {
    const state = getState();
    const prev =
      state.congViec.congViecDetail?.LichSuTienDo?.[index]?.GhiChu || "";
    dispatch(
      slice.actions.updateProgressHistoryNoteOptimistic({
        congViecId,
        index,
        note,
      })
    );
    try {
      await apiService.put(
        `/workmanagement/congviec/${congViecId}/progress-history/${index}/note`,
        { note }
      );
      try {
        dispatch(getCongViecDetail(congViecId));
      } catch (_) {}
    } catch (err) {
      dispatch(
        slice.actions.updateProgressHistoryNoteRevert({
          congViecId,
          index,
          prev,
        })
      );
      toast.error("Không lưu được ghi chú tiến độ");
    }
  };

export const applyCongViecPatch = (patch) => (dispatch) => {
  dispatch(slice.actions.applyCongViecPatch(patch));
};

// Action meta & availability helper
export const ACTION_META = {
  GIAO_VIEC: {
    label: "Giao việc",
    color: "primary",
    variant: "contained",
    confirm: true,
  },
  HUY_GIAO: {
    label: "Hủy giao",
    color: "warning",
    variant: "outlined",
    confirm: true,
    revert: true,
  },
  TIEP_NHAN: {
    label: "Tiếp nhận",
    color: "primary",
    variant: "contained",
    confirm: false,
  },
  HOAN_THANH_TAM: {
    label: "Hoàn thành (chờ duyệt)",
    color: "success",
    variant: "contained",
    confirm: true,
  },
  HUY_HOAN_THANH_TAM: {
    label: "Hủy hoàn thành tạm",
    color: "warning",
    variant: "outlined",
    confirm: true,
    revert: true,
  },
  DUYET_HOAN_THANH: {
    label: "Duyệt hoàn thành",
    color: "success",
    variant: "contained",
    confirm: true,
  },
  HOAN_THANH: {
    label: "Hoàn thành",
    color: "success",
    variant: "contained",
    confirm: true,
  },
  MO_LAI_HOAN_THANH: {
    label: "Mở lại",
    color: "secondary",
    variant: "outlined",
    confirm: true,
    revert: true,
  },
};

export function getAvailableActions(cv, { isAssigner, isMain }) {
  if (!cv) return [];
  const st = cv.TrangThai;
  const coDuyet = !!cv.CoDuyetHoanThanh;
  const A = WORK_ACTIONS;
  const acts = [];
  if (st === "TAO_MOI" && isAssigner) acts.push(A.GIAO_VIEC);
  if (st === "DA_GIAO") {
    if (isMain) acts.push(A.TIEP_NHAN);
    if (isAssigner) acts.push(A.HUY_GIAO);
  }
  if (st === "DANG_THUC_HIEN") {
    if (coDuyet) {
      if (isMain) acts.push(A.HOAN_THANH_TAM);
    } else {
      // Sửa theo đặc tả mới: khi không yêu cầu duyệt chỉ người chính được hoàn thành
      if (isMain) acts.push(A.HOAN_THANH);
    }
  }
  if (st === "CHO_DUYET") {
    if (isMain) acts.push(A.HUY_HOAN_THANH_TAM);
    if (isAssigner) acts.push(A.DUYET_HOAN_THANH);
  }
  if (st === "HOAN_THANH" && isAssigner) acts.push(A.MO_LAI_HOAN_THANH);
  return acts;
}

export const addCongViecComment =
  ({ congViecId, noiDung }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await congViecAPI.addComment(congViecId, {
        NoiDung: noiDung,
      });
      dispatch(
        slice.actions.addCommentSuccess({
          congViecId,
          comment: response.data.data,
        })
      );
      toast.success("Đã thêm bình luận");
      return response.data.data;
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
      throw error;
    }
  };

// Add a reply (text-only)
export const addReply =
  ({ congViecId, parentId, noiDung }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await congViecAPI.addComment(congViecId, {
        NoiDung: noiDung,
        parentId,
      });
      dispatch(
        slice.actions.addCommentSuccess({
          congViecId,
          comment: response.data.data,
        })
      );
      toast.success("Đã phản hồi bình luận");
      return response.data.data;
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
      throw error;
    }
  };

// Fetch replies for a parent comment
export const fetchReplies = (parentId) => async (dispatch, getState) => {
  const state = getState();
  const bucket = state.congViec?.repliesByParent?.[parentId];
  if (bucket?.loaded && !bucket?.error) return bucket.items; // already loaded
  dispatch(slice.actions.fetchRepliesStart(parentId));
  try {
    const res = await congViecAPI.listReplies(parentId);
    const items = res?.data?.data || [];
    dispatch(slice.actions.fetchRepliesSuccess({ parentId, items }));
    return items;
  } catch (error) {
    dispatch(
      slice.actions.fetchRepliesError({ parentId, error: error.message })
    );
    toast.error(error?.response?.data?.error?.message || error.message);
    throw error;
  }
};

// Fetch routine tasks of current user (for select)
export const fetchMyRoutineTasks =
  (opts = {}) =>
  async (dispatch, getState) => {
    const { force = false, maxAgeMs = 5 * 60 * 1000 } = opts; // default cache 5 phút
    const state = getState();
    const {
      loadingRoutineTasks,
      myRoutineTasksLoaded,
      myRoutineTasksLastFetch,
    } = state.congViec || {};
    if (loadingRoutineTasks) return;
    if (
      !force &&
      myRoutineTasksLoaded &&
      myRoutineTasksLastFetch &&
      Date.now() - myRoutineTasksLastFetch < maxAgeMs
    ) {
      return state.congViec.myRoutineTasks; // dùng cache
    }
    dispatch(slice.actions.fetchMyRoutineTasksStart());
    try {
      const res = await congViecAPI.getMyRoutineTasks();
      const items = res?.data?.data || [];
      dispatch(slice.actions.fetchMyRoutineTasksSuccess(items));
      return items;
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error?.message || error.message;
      dispatch(slice.actions.fetchMyRoutineTasksError(errorMessage));
      toast.error(errorMessage);
      throw error;
    }
  };

export const recallComment = (congViecId, binhLuanId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    await congViecAPI.deleteComment(binhLuanId);
    dispatch(slice.actions.recallCommentSuccess({ congViecId, binhLuanId }));
    toast.success("Đã thu hồi bình luận");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error?.response?.data?.error?.message || error.message);
    throw error;
  }
};

export const recallCommentText =
  (congViecId, binhLuanId) => async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      await congViecAPI.recallCommentText(binhLuanId);
      dispatch(
        slice.actions.recallCommentTextSuccess({ congViecId, binhLuanId })
      );
      toast.success("Đã thu hồi nội dung bình luận");
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error?.response?.data?.error?.message || error.message);
      throw error;
    }
  };

// Cập nhật tiến độ với confirm dialog ngoài UI
export const updateProgress =
  ({ id, value, ghiChu, expectedVersion }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const body = { value, ghiChu, expectedVersion };
      const headers = expectedVersion
        ? { headers: { "If-Unmodified-Since": expectedVersion } }
        : undefined;
      const res = await congViecAPI.updateProgress(id, body, headers);
      const payload = res?.data?.data;
      // If server returned full object (full=1) -> update directly
      if (payload && payload._id) {
        const cv = payload;
        if (cv?.updatedAt) cv.__version = cv.updatedAt;
        dispatch(slice.actions.updateCongViecSuccess(cv));
        if (cv?._progressAutoCompleted) {
          toast.success("Tiến độ đạt 100% – tự động chuyển Hoàn thành");
        } else {
          toast.success("Đã cập nhật tiến độ");
        }
        return cv;
      }
      // Otherwise we received { patch, lastProgressEntry, autoCompleted }
      const { patch, lastProgressEntry, autoCompleted } = payload || {};
      if (patch && patch._id) {
        // Apply patch to lists & detail
        dispatch(applyCongViecPatch(patch));
        // Append last progress entry to detail history if present
        if (lastProgressEntry) {
          dispatch(
            slice.actions.appendProgressHistory({
              congViecId: patch._id,
              entry: lastProgressEntry,
            })
          );
        }
        if (autoCompleted) {
          toast.success("Tiến độ đạt 100% – tự động chuyển Hoàn thành");
        } else {
          toast.success("Đã cập nhật tiến độ");
        }
      } else {
        toast.success("Đã cập nhật tiến độ");
      }
      return payload;
    } catch (error) {
      if (error?.message === "VERSION_CONFLICT") {
        dispatch(
          slice.actions.setVersionConflict({
            id,
            type: "progress",
            payload: { id, value, ghiChu, expectedVersion },
            timestamp: Date.now(),
          })
        );
        toast.warning(
          "Xung đột phiên bản: công việc đã thay đổi. Tải lại trước khi cập nhật tiến độ."
        );
      } else {
        dispatch(slice.actions.hasError(error.message));
        toast.error(
          error?.response?.data?.error?.message ||
            error.message ||
            "Lỗi cập nhật tiến độ"
        );
      }
      throw error;
    }
  };

// Fetch subtasks for a parent (with simple cache)
export const fetchSubtasks =
  (parentId, opts = {}) =>
  async (dispatch, getState) => {
    const { force = false, maxAgeMs = 30 * 1000 } = opts;
    const state = getState();
    const bucket = state.congViec?.subtasksByParent?.[parentId];
    if (!force && bucket && bucket.loaded) {
      const age = Date.now() - (bucket.lastFetch || 0);
      if (age < maxAgeMs)
        return bucket.ids.map((id) => state.congViec.subtaskEntities[id]);
    }
    dispatch(slice.actions.fetchSubtasksStart(parentId));
    try {
      const res = await congViecAPI.getChildren(parentId, { limit: 100 });
      const items = res?.data?.data || [];
      dispatch(slice.actions.fetchSubtasksSuccess({ parentId, items }));
      return items;
    } catch (error) {
      dispatch(
        slice.actions.fetchSubtasksError({ parentId, error: error.message })
      );
      toast.error(
        error?.response?.data?.error?.message ||
          error.message ||
          "Không tải được công việc con"
      );
      throw error;
    }
  };

// Create subtask
export const createSubtask = (parentId, data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const res = await congViecAPI.createSubtask(parentId, data);
    const subtask = res?.data?.data;
    if (subtask?.updatedAt) subtask.__version = subtask.updatedAt;
    dispatch(slice.actions.createSubtaskSuccess({ parentId, subtask }));
    toast.success("Đã tạo công việc con");
    return subtask;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error?.response?.data?.error?.message || error.message);
    throw error;
  }
};
