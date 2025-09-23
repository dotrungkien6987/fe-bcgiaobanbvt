import { createSlice } from "@reduxjs/toolkit";
import { fetchDoanVaoMembers } from "features/NghienCuuKhoaHoc/membersApi";
import { toast } from "react-toastify";

const slice = createSlice({
  name: "doanVaoMembers",
  initialState: {
    isLoading: false,
    error: null,
    items: [],
    total: 0,
    page: 1,
    limit: 20,
    filters: {},
  },
  reducers: {
    startLoading(state) {
      state.isLoading = true;
      state.error = null;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getSuccess(state, action) {
      state.isLoading = false;
      state.items = action.payload.items;
      state.total = action.payload.total;
      state.page = action.payload.page;
      state.limit = action.payload.limit;
      state.filters = action.payload.filters || state.filters;
    },
  },
});

export const {
  actions: doanVaoMembersActions,
  reducer: doanVaoMembersReducer,
} = slice;

export const loadDoanVaoMembers = (filters) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const data = await fetchDoanVaoMembers(filters);
    dispatch(slice.actions.getSuccess({ ...data, filters }));
  } catch (err) {
    dispatch(slice.actions.hasError(err.message));
    toast.error(err.message);
  }
};
