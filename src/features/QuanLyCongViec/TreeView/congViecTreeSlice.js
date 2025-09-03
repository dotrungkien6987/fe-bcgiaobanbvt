import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import { getRootTree, getChildren, getFullTree } from "./congViecTreeApi";

// Entity adapter to store tasks by id
const tasksAdapter = createEntityAdapter({
  selectId: (task) => task._id,
});

// Thunks
export const fetchRootTree = createAsyncThunk(
  "congViecTree/fetchRoot",
  async (congViecId, { rejectWithValue }) => {
    try {
      const data = await getRootTree(congViecId);
      return data;
    } catch (e) {
      return rejectWithValue(e.message || "Lỗi tải cây công việc");
    }
  }
);

export const fetchChildren = createAsyncThunk(
  "congViecTree/fetchChildren",
  async ({ parentId }, { rejectWithValue }) => {
    try {
      const data = await getChildren(parentId);
      return data;
    } catch (e) {
      return rejectWithValue(e.message || "Lỗi tải con");
    }
  }
);

export const fetchFullTree = createAsyncThunk(
  "congViecTree/fetchFullTree",
  async (congViecId, { rejectWithValue }) => {
    try {
      const data = await getFullTree(congViecId);
      return data;
    } catch (e) {
      return rejectWithValue(e.message || "Lỗi tải cây đầy đủ");
    }
  }
);

// Tải toàn bộ subtree (đệ quy BFS) cho chế độ SUBTREE
export const loadEntireSubtree = createAsyncThunk(
  "congViecTree/loadEntireSubtree",
  async (rootId, { getState, dispatch }) => {
    if (!rootId) return { expandedIds: [] };
    const visited = new Set();
    const queue = [rootId];
    while (queue.length) {
      const currentId = queue.shift();
      if (visited.has(currentId)) continue;
      visited.add(currentId);
      const state = getState().congViecTree;
      const node = state.entities[currentId];
      if (!node) continue;
      const hasChildren = (node.ChildrenCount || 0) > 0;
      const loaded = state.childrenLoaded[currentId];
      if (hasChildren && !loaded) {
        try {
          await dispatch(fetchChildren({ parentId: currentId })).unwrap();
        } catch (_) {
          // bỏ qua lỗi từng nút, tiếp tục
        }
      }
      const latest = getState().congViecTree;
      // duyệt con trực tiếp
      Object.values(latest.entities).forEach((t) => {
        if (t && t.ParentID === currentId) queue.push(t._id);
      });
    }
    return { expandedIds: Array.from(visited) };
  }
);

const congViecTreeSlice = createSlice({
  name: "congViecTree",
  initialState: tasksAdapter.getInitialState({
    rootId: null,
    loadingRoot: false,
    loadingChildren: {}, // parentId:boolean
    error: null,
    expanded: {}, // parentId:boolean (UI state)
    childrenLoaded: {}, // parentId:boolean
    viewMode: "SUBTREE", // SUBTREE | FULLTREE
    originalNodeId: null,
    // Cache để giữ subtree hiện tại khi chuyển sang FULLTREE
    subtreeCache: null, // { entities: {id:task}, childrenLoaded: {id:true}, rootId }
    fullSubtreeLoaded: false, // đã load hết tất cả descendants?
  }),
  reducers: {
    toggleExpanded(state, action) {
      const id = action.payload;
      state.expanded[id] = !state.expanded[id];
    },
    setExpandedBulk(state, action) {
      const { ids = [], value } = action.payload || {};
      ids.forEach((id) => {
        state.expanded[id] = !!value;
      });
    },
    resetTree(state) {
      // clear all cached nodes
      tasksAdapter.removeAll(state);
      state.rootId = null;
      state.loadingRoot = false;
      state.loadingChildren = {};
      state.error = null;
      state.expanded = {};
      state.childrenLoaded = {};
      state.viewMode = "SUBTREE";
      state.originalNodeId = null;
    },
    setViewMode(state, action) {
      const next = action.payload === "FULLTREE" ? "FULLTREE" : "SUBTREE";
      if (state.viewMode === "SUBTREE" && next === "FULLTREE") {
        // Lưu snapshot subtree trước khi load full tree
        state.subtreeCache = {
          entities: tasksAdapter
            .getSelectors()
            .selectAll(state)
            .reduce((acc, t) => {
              acc[t._id] = t;
              return acc;
            }, {}),
          childrenLoaded: { ...state.childrenLoaded },
          rootId: state.rootId,
        };
      }
      state.viewMode = next;
    },
    setOriginalNodeId(state, action) {
      state.originalNodeId = action.payload || null;
    },
  },
  extraReducers: (builder) => {
    builder
      // SUBTREE root fetch
      .addCase(fetchRootTree.pending, (state) => {
        state.loadingRoot = true;
        state.error = null;
        state.fullSubtreeLoaded = false;
      })
      .addCase(fetchRootTree.fulfilled, (state, action) => {
        state.loadingRoot = false;
        const { root, children } = action.payload;
        state.rootId = root._id;
        tasksAdapter.upsertOne(state, root);
        tasksAdapter.upsertMany(state, children);
        state.childrenLoaded[root._id] = true;
        state.expanded[root._id] = true;
        // root fetch chỉ load 1 cấp
      })
      .addCase(fetchRootTree.rejected, (state, action) => {
        state.loadingRoot = false;
        state.error = action.payload || action.error.message;
      })
      // FULLTREE fetch
      .addCase(fetchFullTree.pending, (state) => {
        state.loadingRoot = true;
        state.error = null;
        state.fullSubtreeLoaded = false;
      })
      .addCase(fetchFullTree.fulfilled, (state, action) => {
        state.loadingRoot = false;
        const { root, children } = action.payload;
        const cache = state.subtreeCache;
        tasksAdapter.removeAll(state);
        state.loadingChildren = {};
        state.expanded = {};
        state.childrenLoaded = {};
        state.rootId = root._id;
        tasksAdapter.upsertOne(state, root);
        tasksAdapter.upsertMany(state, children);
        state.childrenLoaded[root._id] = true;
        state.expanded[root._id] = true;
        // merge cached subtree
        if (cache) {
          Object.values(cache.entities || {}).forEach((t) => {
            if (!state.entities[t._id]) tasksAdapter.upsertOne(state, t);
          });
          Object.entries(cache.childrenLoaded || {}).forEach(([pid, val]) => {
            if (val) state.childrenLoaded[pid] = true;
          });
        }
        // mark childrenLoaded for all nodes with children count
        Object.values(state.entities).forEach((t) => {
          if (t && (t.ChildrenCount || 0) > 0)
            state.childrenLoaded[t._id] = true;
        });
        // expand ancestor chain of originalNodeId
        if (state.originalNodeId && state.entities[state.originalNodeId]) {
          let currentId = state.originalNodeId;
          state.expanded[currentId] = true;
          const visited = new Set();
          while (
            currentId &&
            currentId !== state.rootId &&
            !visited.has(currentId)
          ) {
            visited.add(currentId);
            const node = state.entities[currentId];
            if (!node) break;
            const parentId = node.ParentID;
            if (parentId) {
              state.expanded[parentId] = true;
              currentId = parentId;
            } else {
              break;
            }
          }
        }
        state.fullSubtreeLoaded = true; // full tree coi như đã đầy đủ
      })
      .addCase(fetchFullTree.rejected, (state, action) => {
        state.loadingRoot = false;
        state.error = action.payload || action.error.message;
      })
      // Children on-demand fetch
      .addCase(fetchChildren.pending, (state, action) => {
        const parentId = action.meta.arg.parentId;
        state.loadingChildren[parentId] = true;
      })
      .addCase(fetchChildren.fulfilled, (state, action) => {
        const { parentId, children } = action.payload;
        state.loadingChildren[parentId] = false;
        tasksAdapter.upsertMany(state, children);
        state.childrenLoaded[parentId] = true;
      })
      .addCase(fetchChildren.rejected, (state, action) => {
        const parentId = action.meta.arg.parentId;
        state.loadingChildren[parentId] = false;
        state.error = action.payload || action.error.message;
      })
      // Load entire subtree
      .addCase(loadEntireSubtree.fulfilled, (state, action) => {
        const { expandedIds = [] } = action.payload || {};
        expandedIds.forEach((id) => {
          state.expanded[id] = true;
        });
        state.fullSubtreeLoaded = true;
      });
  },
});

export const { reducer: congViecTreeReducer, actions: congViecTreeActions } =
  congViecTreeSlice;

// Selectors
const baseSelectors = tasksAdapter.getSelectors((state) => state.congViecTree);
export const selectRootTask = (state) => {
  const rootId = state.congViecTree.rootId;
  if (!rootId) return null;
  return baseSelectors.selectById(state, rootId);
};
export const selectTaskById = (state, id) =>
  baseSelectors.selectById(state, id);
export const selectChildrenOf = (state, parentId) => {
  const all = baseSelectors.selectAll(state);
  return all.filter((t) => t.ParentID === parentId);
};
export const selectExpanded = (state, id) => !!state.congViecTree.expanded[id];
export const selectChildrenLoaded = (state, id) =>
  !!state.congViecTree.childrenLoaded[id];
export const selectLoadingChildren = (state, id) =>
  !!state.congViecTree.loadingChildren[id];
export const selectRootLoading = (state) => state.congViecTree.loadingRoot;
export const selectTreeError = (state) => state.congViecTree.error;
export const selectViewMode = (state) => state.congViecTree.viewMode;
export const selectOriginalNodeId = (state) =>
  state.congViecTree.originalNodeId;
export const selectFullSubtreeLoaded = (state) =>
  state.congViecTree.fullSubtreeLoaded;

export default congViecTreeReducer;
