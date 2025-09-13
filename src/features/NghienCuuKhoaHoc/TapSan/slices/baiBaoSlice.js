import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import {
  getBaiBaoByTapSan,
  getBaiBaoById,
  createBaiBao as apiCreate,
  updateBaiBao as apiUpdate,
  deleteBaiBao as apiDelete,
  getBaiBaoStats,
} from "../services/baibao.api";

const entitiesAdapter = createEntityAdapter({ selectId: (x) => x._id });

export const fetchBaiBaoListByTapSan = createAsyncThunk(
  "baiBao/fetchListByTapSan",
  async ({ tapSanId, page = 1, limit = 20, filters = {} }) => {
    const data = await getBaiBaoByTapSan(tapSanId, { page, limit, ...filters });
    // Expect { items, pagination, tapSan }
    return { tapSanId, ...data };
  }
);

export const fetchBaiBaoById = createAsyncThunk(
  "baiBao/fetchById",
  async (id) => {
    const data = await getBaiBaoById(id);
    return data; // normalized article
  }
);

export const fetchBaiBaoStats = createAsyncThunk(
  "baiBao/fetchStats",
  async (tapSanId) => {
    const data = await getBaiBaoStats(tapSanId);
    return { tapSanId, stats: data };
  }
);

export const createBaiBao = createAsyncThunk(
  "baiBao/create",
  async ({ tapSanId, payload }) => {
    const data = await apiCreate(tapSanId, payload);
    return data;
  }
);

export const updateBaiBao = createAsyncThunk(
  "baiBao/update",
  async ({ id, payload }) => {
    const data = await apiUpdate(id, payload);
    return data;
  }
);

export const deleteBaiBao = createAsyncThunk("baiBao/delete", async (id) => {
  await apiDelete(id);
  return id;
});

const initialByTapSan = () => ({
  ids: [],
  total: 0,
  page: 1,
  limit: 20,
  loading: false,
  error: null,
  stats: null,
});

const slice = createSlice({
  name: "baiBao",
  initialState: {
    entities: entitiesAdapter.getInitialState(),
    currentId: null,
    byTapSan: {}, // { [tapSanId]: { ids, total, page, limit, loading, error, stats } }
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrent(state) {
      state.currentId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBaiBaoListByTapSan.pending, (state, { meta }) => {
        const tapSanId = meta.arg.tapSanId;
        state.byTapSan[tapSanId] =
          state.byTapSan[tapSanId] || initialByTapSan();
        state.byTapSan[tapSanId].loading = true;
        state.byTapSan[tapSanId].error = null;
      })
      .addCase(
        fetchBaiBaoListByTapSan.fulfilled,
        (state, { payload, meta }) => {
          const tapSanId = meta.arg.tapSanId;
          const { items = [], pagination } = payload || {};
          entitiesAdapter.upsertMany(state.entities, items);
          const sub = state.byTapSan[tapSanId] || initialByTapSan();
          sub.ids = items.map((i) => i._id);
          sub.total = pagination?.total || items.length;
          sub.page = pagination?.page || meta.arg.page || 1;
          sub.limit = pagination?.limit || meta.arg.limit || 20;
          sub.loading = false;
          state.byTapSan[tapSanId] = sub;
        }
      )
      .addCase(fetchBaiBaoListByTapSan.rejected, (state, { error, meta }) => {
        const tapSanId = meta.arg.tapSanId;
        state.byTapSan[tapSanId] =
          state.byTapSan[tapSanId] || initialByTapSan();
        state.byTapSan[tapSanId].loading = false;
        state.byTapSan[tapSanId].error =
          error?.message || "Lỗi tải danh sách bài báo";
      })

      .addCase(fetchBaiBaoById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBaiBaoById.fulfilled, (state, { payload }) => {
        entitiesAdapter.upsertOne(state.entities, payload);
        state.currentId = payload._id;
        state.loading = false;
      })
      .addCase(fetchBaiBaoById.rejected, (state, { error }) => {
        state.loading = false;
        state.error = error?.message || "Lỗi tải chi tiết bài báo";
      })

      .addCase(fetchBaiBaoStats.fulfilled, (state, { payload }) => {
        const { tapSanId, stats } = payload;
        state.byTapSan[tapSanId] =
          state.byTapSan[tapSanId] || initialByTapSan();
        state.byTapSan[tapSanId].stats = stats;
      })

      .addCase(createBaiBao.fulfilled, (state, { payload }) => {
        entitiesAdapter.addOne(state.entities, payload);
        state.currentId = payload._id;
      })
      .addCase(updateBaiBao.fulfilled, (state, { payload }) => {
        entitiesAdapter.upsertOne(state.entities, payload);
        state.currentId = payload._id;
      })
      .addCase(deleteBaiBao.fulfilled, (state, { payload: id }) => {
        entitiesAdapter.removeOne(state.entities, id);
        if (state.currentId === id) state.currentId = null;
      });
  },
});

export const { clearCurrent } = slice.actions;
export default slice.reducer;

export const baiBaoEntitySelectors = entitiesAdapter.getSelectors(
  (state) => state.baiBao.entities
);
export const selectBaiBaoById = (state, id) =>
  baiBaoEntitySelectors.selectById(state, id);
export const selectBaiBaoListByTapSan = (state, tapSanId) => {
  const sub = state.baiBao.byTapSan[tapSanId];
  if (!sub) return [];
  return sub.ids
    .map((id) => baiBaoEntitySelectors.selectById(state, id))
    .filter(Boolean);
};
export const selectBaiBaoStatsByTapSan = (state, tapSanId) =>
  state.baiBao.byTapSan[tapSanId]?.stats || null;
export const selectBaiBaoListMeta = (state, tapSanId) => {
  const sub = state.baiBao.byTapSan[tapSanId] || {};
  return {
    page: sub.page || 1,
    limit: sub.limit || 20,
    total: sub.total || 0,
    loading: !!sub.loading,
    error: sub.error,
  };
};
