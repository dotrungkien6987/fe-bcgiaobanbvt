import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import api from "app/apiService";

const entitiesAdapter = createEntityAdapter({ selectId: (x) => x._id });

export const fetchBaiBaoListByTapSan = createAsyncThunk(
  "baiBao/fetchListByTapSan",
  async ({ tapSanId, page = 1, limit = 20, filters = {} }) => {
    const params = { page, limit, ...filters };
    const resp = await api.get(`/tapsan/${tapSanId}/baibao`, { params });
    const data = resp.data?.data;
    // Expect { items, pagination, tapSan }
    return { tapSanId, ...data };
  }
);

export const fetchBaiBaoById = createAsyncThunk(
  "baiBao/fetchById",
  async (id) => {
    const resp = await api.get(`/tapsan/baibao/${id}`);
    return resp.data?.data; // normalized article
  }
);

export const createBaiBao = createAsyncThunk(
  "baiBao/create",
  async ({ tapSanId, payload }) => {
    const resp = await api.post(`/tapsan/${tapSanId}/baibao`, payload);
    return resp.data?.data;
  }
);

export const updateBaiBao = createAsyncThunk(
  "baiBao/update",
  async ({ id, payload }) => {
    const resp = await api.put(`/tapsan/baibao/${id}`, payload);
    return resp.data?.data;
  }
);

export const deleteBaiBao = createAsyncThunk("baiBao/delete", async (id) => {
  await api.delete(`/tapsan/baibao/${id}`);
  return id;
});

export const reorderBaiBao = createAsyncThunk(
  "baiBao/reorder",
  async ({ tapSanId, items }) => {
    const resp = await api.patch(`/tapsan/${tapSanId}/baibao/reorder`, items);
    return { tapSanId, ok: resp.data?.success };
  }
);

const initialByTapSan = () => ({
  ids: [],
  total: 0,
  page: 1,
  limit: 20,
  loading: false,
  error: null,
  sort: { field: "SoThuTu", order: "asc" },
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
      })
      .addCase(reorderBaiBao.fulfilled, (state, { payload }) => {
        // nothing to do locally; components should refetch list
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
