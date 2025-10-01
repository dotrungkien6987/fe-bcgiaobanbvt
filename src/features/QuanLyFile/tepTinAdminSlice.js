import { createSlice } from "@reduxjs/toolkit";
import apiService from "app/apiService";
import { toast } from "react-toastify";

const initialState = {
  isLoading: false,
  error: null,
  items: [],
  page: 1,
  size: 50,
  total: 0,
  stats: null,
  tree: null,
};

const slice = createSlice({
  name: "tepTinAdmin",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
      state.error = null;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload || "Có lỗi xảy ra";
    },
    listSuccess(state, action) {
      state.isLoading = false;
      const { items, page, size, total } = action.payload;
      state.items = items || [];
      state.page = page || 1;
      state.size = size || 50;
      state.total = total || 0;
    },
    statsSuccess(state, action) {
      state.isLoading = false;
      state.stats = action.payload;
    },
    treeSuccess(state, action) {
      state.isLoading = false;
      state.tree = action.payload;
    },
    updateOne(state, action) {
      const f = action.payload;
      const idx = state.items.findIndex((x) => x._id === f._id);
      if (idx >= 0) state.items[idx] = f;
    },
    removeOne(state, action) {
      state.items = state.items.filter((x) => x._id !== action.payload);
    },
  },
});

export default slice.reducer;

export const listFiles = (params) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const res = await apiService.get("/workmanagement/admin/files", { params });
    dispatch(slice.actions.listSuccess(res.data.data));
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
    toast.error(e.message);
  }
};

export const getStats = () => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const res = await apiService.get("/workmanagement/admin/files/stats");
    dispatch(slice.actions.statsSuccess(res.data.data));
  } catch (e) {
    dispatch(slice.actions.hasError(e.message));
  }
};

export const getTree =
  (by = "owner") =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const res = await apiService.get("/workmanagement/admin/files/tree", {
        params: { by },
      });
      dispatch(slice.actions.treeSuccess(res.data.data));
    } catch (e) {
      dispatch(slice.actions.hasError(e.message));
    }
  };

export const restoreFile = (id) => async (dispatch) => {
  try {
    const res = await apiService.patch(
      `/workmanagement/admin/files/${id}/restore`
    );
    dispatch(slice.actions.updateOne(res.data.data));
    toast.success("Phục hồi tệp thành công");
  } catch (e) {
    toast.error(e.message);
    throw e;
  }
};

export const softDeleteFile = (id) => async (dispatch) => {
  try {
    const res = await apiService.delete(`/workmanagement/admin/files/${id}`);
    dispatch(slice.actions.updateOne(res.data.data));
    toast.success("Đã xóa mềm tệp");
  } catch (e) {
    toast.error(e.message);
    throw e;
  }
};

export const forceDeleteFile = (id) => async (dispatch) => {
  try {
    await apiService.delete(`/workmanagement/admin/files/${id}`, {
      params: { force: 1 },
    });
    dispatch(slice.actions.removeOne(id));
    toast.success("Đã xóa vĩnh viễn");
  } catch (e) {
    toast.error(e.message);
    throw e;
  }
};

export const cleanup =
  (fix = false) =>
  async (dispatch) => {
    try {
      const res = await apiService.post(
        `/workmanagement/admin/files/cleanup`,
        null,
        { params: { fix: fix ? 1 : 0 } }
      );
      const d = res.data && res.data.data;
      toast.info(
        `Cleanup: total=${d?.total || 0}, missing=${
          d?.missingOnDisk || 0
        }, marked=${d?.markedDeleted || 0}`
      );
    } catch (e) {
      toast.error(e.message);
      throw e;
    }
  };
