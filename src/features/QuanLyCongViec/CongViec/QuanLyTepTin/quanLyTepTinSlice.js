import { createSlice } from "@reduxjs/toolkit";
import apiService from "app/apiService";
import { toast } from "react-toastify";
import { addCommentSuccess } from "../congViecSlice";

const initialState = {
  byTask: {}, // congViecId -> { items, total, loading, error }
  counts: {}, // congViecId -> number
};

const slice = createSlice({
  name: "quanLyTepTin",
  initialState,
  reducers: {
    startLoadingByTask: (state, action) => {
      const id = action.payload;
      state.byTask[id] = state.byTask[id] || { items: [], total: 0 };
      state.byTask[id].loading = true;
      state.byTask[id].error = null;
    },
    hasErrorByTask: (state, action) => {
      const { id, error } = action.payload;
      state.byTask[id] = state.byTask[id] || { items: [], total: 0 };
      state.byTask[id].loading = false;
      state.byTask[id].error = error;
    },
    setFilesByTask: (state, action) => {
      const { id, items, total } = action.payload;
      state.byTask[id] = state.byTask[id] || { items: [], total: 0 };
      state.byTask[id].items = items;
      state.byTask[id].total = total;
      state.byTask[id].loading = false;
      state.byTask[id].error = null;
    },
    upsertFilesToTask: (state, action) => {
      const { id, items } = action.payload;
      state.byTask[id] = state.byTask[id] || { items: [], total: 0 };
      // prepend new items
      state.byTask[id].items = [...items, ...(state.byTask[id].items || [])];
      state.byTask[id].total += items.length;
    },
    removeFileFromTask: (state, action) => {
      const { id, fileId } = action.payload;
      if (state.byTask[id]?.items) {
        state.byTask[id].items = state.byTask[id].items.filter(
          (f) => f._id !== fileId
        );
        state.byTask[id].total = Math.max(0, (state.byTask[id].total || 0) - 1);
      }
    },
    updateFileMetaInTask: (state, action) => {
      const { id, file } = action.payload;
      const idx = state.byTask[id]?.items?.findIndex((f) => f._id === file._id);
      if (idx != null && idx >= 0) state.byTask[id].items[idx] = file;
    },
    setCountForTask: (state, action) => {
      const { id, total } = action.payload;
      state.counts[id] = total;
    },
  },
});

export default slice.reducer;
export const {
  startLoadingByTask,
  hasErrorByTask,
  setFilesByTask,
  upsertFilesToTask,
  removeFileFromTask,
  updateFileMetaInTask,
  setCountForTask,
} = slice.actions;

// API helpers
const filesAPI = {
  uploadToTask: (congViecId, formData, onUploadProgress) =>
    apiService.post(`/workmanagement/congviec/${congViecId}/files`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress,
    }),
  createCommentWithFiles: (congViecId, formData, onUploadProgress) =>
    apiService.post(
      `/workmanagement/congviec/${congViecId}/comments`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress,
      }
    ),
  listByTask: (congViecId, params) =>
    apiService.get(`/workmanagement/congviec/${congViecId}/files`, { params }),
  countByTask: (congViecId) =>
    apiService.get(`/workmanagement/congviec/${congViecId}/files/count`),
  deleteFile: (fileId) => apiService.delete(`/workmanagement/files/${fileId}`),
  renameFile: (fileId, body) =>
    apiService.patch(`/workmanagement/files/${fileId}`, body),
};

// Thunks
export const fetchFilesByTask =
  (congViecId, { page = 1, size = 50 } = {}) =>
  async (dispatch) => {
    dispatch(startLoadingByTask(congViecId));
    try {
      const res = await filesAPI.listByTask(congViecId, { page, size });
      dispatch(
        setFilesByTask({
          id: congViecId,
          items: res.data.data.items,
          total: res.data.data.total,
        })
      );
    } catch (err) {
      dispatch(hasErrorByTask({ id: congViecId, error: err.message }));
      toast.error(err.message);
    }
  };

export const countFilesByTask = (congViecId) => async (dispatch) => {
  try {
    const res = await filesAPI.countByTask(congViecId);
    dispatch(setCountForTask({ id: congViecId, total: res.data.data.total }));
  } catch (err) {
    // silent fail
  }
};

export const uploadFilesForTask =
  (congViecId, files, { moTa } = {}, onUploadProgress) =>
  async (dispatch) => {
    try {
      const form = new FormData();
      (files || []).forEach((f) => form.append("files", f));
      if (moTa) form.append("moTa", moTa);
      const res = await filesAPI.uploadToTask(
        congViecId,
        form,
        onUploadProgress
      );
      dispatch(upsertFilesToTask({ id: congViecId, items: res.data.data }));
      dispatch(countFilesByTask(congViecId));
      toast.success("Tải tệp thành công");
      return res.data.data;
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

export const deleteFile = (congViecId, fileId) => async (dispatch) => {
  try {
    await filesAPI.deleteFile(fileId);
    dispatch(removeFileFromTask({ id: congViecId, fileId }));
    dispatch(countFilesByTask(congViecId));
    toast.success("Đã xóa tệp");
  } catch (err) {
    toast.error(err?.response?.data?.error?.message || err.message);
    throw err;
  }
};

export const renameFile = (congViecId, fileId, body) => async (dispatch) => {
  try {
    const res = await filesAPI.renameFile(fileId, body);
    dispatch(updateFileMetaInTask({ id: congViecId, file: res.data.data }));
    toast.success("Đã cập nhật tệp");
    return res.data.data;
  } catch (err) {
    toast.error(err.message);
    throw err;
  }
};

export const createCommentWithFiles =
  (congViecId, { noiDung, parentId }, files, onUploadProgress) =>
  async (dispatch) => {
    try {
      const form = new FormData();
      form.append("noiDung", noiDung);
      if (parentId) form.append("parentId", parentId);
      (files || []).forEach((f) => form.append("files", f));
      const res = await filesAPI.createCommentWithFiles(
        congViecId,
        form,
        onUploadProgress
      );
      const comment = res.data.data;
      dispatch(addCommentSuccess({ congViecId, comment }));
      // update file list/count too
      dispatch(fetchFilesByTask(congViecId));
      dispatch(countFilesByTask(congViecId));
      toast.success("Đã gửi bình luận kèm tệp");
      return comment;
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };
