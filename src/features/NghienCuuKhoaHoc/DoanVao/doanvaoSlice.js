import { createSlice } from "@reduxjs/toolkit";
import * as api from "./api";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { batchCountAttachments } from "shared/services/attachments.api";

const initialState = {
  isLoading: false,
  error: null,
  doanVaos: [],
  currentDoanVao: null,
  totalPages: 1,
  totalDocs: 0,
  attachmentsCount: {}, // { id: number }
};

const toVNDate = (d) => {
  if (!d) return null;
  const m = dayjs(d);
  return m.isValid() ? m.format("DD/MM/YYYY") : null;
};

const normalize = (item) => {
  if (!item || typeof item !== "object") return item;
  return {
    ...item,
    NgayKyVanBanFormatted: toVNDate(item.NgayKyVanBan || item.ngayKyVanBan),
    ThoiGianVaoLamViecFormatted: toVNDate(
      item.ThoiGianVaoLamViec || item.thoiGianVaoLamViec
    ),
  };
};

const slice = createSlice({
  name: "doanvao",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getListSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const {
        doanVaos = [],
        totalPages = 1,
        totalDocs = 0,
      } = action.payload?.data || action.payload || {};
      state.doanVaos = Array.isArray(doanVaos) ? doanVaos.map(normalize) : [];
      state.totalPages = totalPages;
      state.totalDocs = totalDocs;
    },
    getOneSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.currentDoanVao = normalize(action.payload?.data || action.payload);
    },
    createSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const created = normalize(action.payload?.data || action.payload);
      if (created) {
        state.doanVaos.unshift(created);
        state.currentDoanVao = created;
      }
    },
    updateSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const updated = normalize(action.payload?.data || action.payload);
      const idx = state.doanVaos.findIndex((x) => x._id === updated?._id);
      if (idx !== -1) state.doanVaos[idx] = updated;
      if (state.currentDoanVao?._id === updated?._id) {
        state.currentDoanVao = updated;
      }
    },
    deleteSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const id = action.payload;
      state.doanVaos = state.doanVaos.filter((x) => x._id !== id);
      if (state.currentDoanVao?._id === id) state.currentDoanVao = null;
    },
    attachmentsCountSuccess(state, action) {
      state.attachmentsCount = {
        ...state.attachmentsCount,
        ...(action.payload || {}),
      };
    },
  },
});

export default slice.reducer;
export const { attachmentsCountSuccess } = slice.actions;

export const getDoanVaos = (params) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const res = await api.getAllDoanVao(params);
    dispatch(slice.actions.getListSuccess(res.data));
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
    toast.error(e.message);
  }
};

export const getDoanVaoById = (id) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const res = await api.getDoanVaoById(id);
    dispatch(slice.actions.getOneSuccess(res.data));
    return res.data;
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
    toast.error(e.message);
    throw e;
  }
};

export const createDoanVao = (data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const res = await api.createDoanVao(data);
    dispatch(slice.actions.createSuccess(res.data));
    toast.success("Tạo Đoàn Vào thành công");
    return res.data;
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
    toast.error(e.message);
    throw e;
  }
};

export const updateDoanVao = (id, data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const res = await api.updateDoanVao(id, data);
    dispatch(slice.actions.updateSuccess(res.data));
    toast.success("Cập nhật Đoàn Vào thành công");
    return res.data;
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
    toast.error(e.message);
    throw e;
  }
};

export const deleteDoanVao = (id) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    await api.deleteDoanVao(id);
    dispatch(slice.actions.deleteSuccess(id));
    toast.success("Xóa Đoàn Vào thành công");
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
    toast.error(e.message);
    throw e;
  }
};

export const fetchDoanVaoAttachmentsCount = (ids) => async (dispatch) => {
  try {
    if (!Array.isArray(ids) || !ids.length) return;
    const data = await batchCountAttachments("DoanVao", "file", ids);
    dispatch(slice.actions.attachmentsCountSuccess(data));
  } catch (e) {
    console.warn("fetchDoanVaoAttachmentsCount error", e);
  }
};

export const refreshDoanVaoAttachmentCountOne = (id) => async (dispatch) => {
  try {
    if (!id) return;
    const data = await batchCountAttachments("DoanVao", "file", [id]);
    dispatch(slice.actions.attachmentsCountSuccess(data));
  } catch (e) {
    console.warn("refreshDoanVaoAttachmentCountOne error", e);
  }
};

export const selectDoanVao = (s) => s.doanvao;
export const selectDoanVaoList = (s) => s.doanvao.doanVaos;
export const selectCurrentDoanVao = (s) => s.doanvao.currentDoanVao;
export const selectDoanVaoAttachmentsCount = (s) => s.doanvao.attachmentsCount;
