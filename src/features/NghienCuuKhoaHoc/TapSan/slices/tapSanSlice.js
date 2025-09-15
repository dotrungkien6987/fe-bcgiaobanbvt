import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import api from "app/apiService";

// Entity adapter for TapSan
const entitiesAdapter = createEntityAdapter({ selectId: (x) => x._id });

// Normalize server error into business-friendly shape
function normalizeTapSanError(error, payload) {
  const res = error?.response;
  const data = res?.data || {};
  const msg =
    data?.message ||
    data?.error?.message ||
    error?.message ||
    "Đã có lỗi xảy ra";

  const isDup =
    res?.status === 409 ||
    msg?.toLowerCase?.().includes("duplicate key") ||
    msg?.includes("E11000");

  if (isDup) {
    const loai = payload?.Loai ? ` (${payload.Loai})` : "";
    return {
      code: "DUPLICATE_TAPSAN",
      message: `Tập san Năm ${payload?.NamXuatBan} - Số ${payload?.SoXuatBan}${loai} đã tồn tại. Vui lòng chọn Số khác hoặc chỉnh sửa bản hiện có.`,
      fieldErrors: {
        NamXuatBan: "Năm đã trùng với bản ghi hiện có",
        SoXuatBan: "Số xuất bản đã trùng với bản ghi hiện có",
      },
    };
  }

  return {
    code: data?.error?.code || res?.status || "UNKNOWN",
    message: msg,
  };
}

// Thunks
export const fetchTapSanList = createAsyncThunk(
  "tapSan/fetchList",
  async (params = {}) => {
    const res = await api.get("tapsan", { params });
    // Expect { items, total, page, size } or similar shape
    return res.data?.data || { items: [], total: 0, page: 1, size: 20 };
  }
);

export const fetchTapSanById = createAsyncThunk(
  "tapSan/fetchById",
  async (id) => {
    const res = await api.get(`tapsan/${id}`);
    return res.data?.data;
  }
);

export const createTapSan = createAsyncThunk(
  "tapSan/create",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("tapsan", payload);
      return res.data?.data;
    } catch (error) {
      return rejectWithValue(normalizeTapSanError(error, payload));
    }
  }
);

export const updateTapSan = createAsyncThunk(
  "tapSan/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`tapsan/${id}`, payload);
      return res.data?.data;
    } catch (error) {
      return rejectWithValue(normalizeTapSanError(error, payload));
    }
  }
);

export const deleteTapSan = createAsyncThunk("tapSan/delete", async (id) => {
  await api.delete(`tapsan/${id}`);
  return id;
});

export const restoreTapSan = createAsyncThunk("tapSan/restore", async (id) => {
  const res = await api.patch(`tapsan/${id}/restore`);
  return res.data?.data;
});

const initialListMeta = {
  page: 1,
  size: 20,
  total: 0,
  loading: false,
  error: null,
  params: {},
  ids: [],
};

const slice = createSlice({
  name: "tapSan",
  initialState: {
    entities: entitiesAdapter.getInitialState(),
    list: initialListMeta,
    currentId: null,
    currentLoading: false,
    currentError: null,
  },
  reducers: {
    clearCurrent(state) {
      state.currentId = null;
      state.currentError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // List
      .addCase(fetchTapSanList.pending, (state, { meta }) => {
        state.list.loading = true;
        state.list.error = null;
        state.list.params = meta.arg || {};
      })
      .addCase(fetchTapSanList.fulfilled, (state, { payload, meta }) => {
        const { items = [], total = 0 } = payload || {};
        entitiesAdapter.upsertMany(state.entities, items);
        state.list.ids = items.map((it) => it._id);
        state.list.total = total;
        state.list.page = meta.arg?.page || 1;
        state.list.size = meta.arg?.size || meta.arg?.limit || 20;
        state.list.loading = false;
      })
      .addCase(fetchTapSanList.rejected, (state, { error }) => {
        state.list.loading = false;
        state.list.error = error?.message || "Lỗi tải danh sách tập san";
      })
      // Detail
      .addCase(fetchTapSanById.pending, (state) => {
        state.currentLoading = true;
        state.currentError = null;
      })
      .addCase(fetchTapSanById.fulfilled, (state, { payload }) => {
        if (payload) {
          entitiesAdapter.upsertOne(state.entities, payload);
          state.currentId = payload._id;
        }
        state.currentLoading = false;
      })
      .addCase(fetchTapSanById.rejected, (state, { error }) => {
        state.currentLoading = false;
        state.currentError = error?.message || "Lỗi tải chi tiết tập san";
      })
      // Create/Update/Delete
      .addCase(createTapSan.fulfilled, (state, { payload }) => {
        if (payload) {
          entitiesAdapter.addOne(state.entities, payload);
          state.currentId = payload._id;
        }
      })
      .addCase(updateTapSan.fulfilled, (state, { payload }) => {
        if (payload) {
          entitiesAdapter.upsertOne(state.entities, payload);
          state.currentId = payload._id;
        }
      })
      .addCase(deleteTapSan.fulfilled, (state, { payload: id }) => {
        entitiesAdapter.removeOne(state.entities, id);
        state.list.ids = state.list.ids.filter((x) => x !== id);
        if (state.currentId === id) state.currentId = null;
      })
      .addCase(restoreTapSan.fulfilled, (state, { payload }) => {
        if (payload) {
          entitiesAdapter.upsertOne(state.entities, payload);
        }
      });
  },
});

export const { clearCurrent } = slice.actions;
export default slice.reducer;

// Selectors
export const tapSanEntitySelectors = entitiesAdapter.getSelectors(
  (state) => state.tapSan.entities
);

export const selectTapSanById = (state, id) =>
  tapSanEntitySelectors.selectById(state, id);

export const selectTapSanList = (state) =>
  (state.tapSan.list.ids || [])
    .map((id) => tapSanEntitySelectors.selectById(state, id))
    .filter(Boolean);

export const selectTapSanListMeta = (state) => state.tapSan.list;
