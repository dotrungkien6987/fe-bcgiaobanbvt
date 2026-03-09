import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../../app/apiService";
import { toast } from "react-toastify";

const initialState = {
  // Tab 1: Tổng hợp
  baoCaoTongHop: [],
  loadingTongHop: false,

  // Tab 2: Chi tiết + lịch sử
  chiTietDatLich: [],
  loadingChiTiet: false,

  // Tab 3: Mãn tính (Map dangkykhamid → document)
  danhSachManTinh: {},
  loadingManTinh: false,

  error: null,
};

const slice = createSlice({
  name: "datLichKham",
  initialState,
  reducers: {
    startLoadingTongHop(state) {
      state.loadingTongHop = true;
      state.error = null;
    },
    startLoadingChiTiet(state) {
      state.loadingChiTiet = true;
      state.error = null;
    },
    startLoadingManTinh(state) {
      state.loadingManTinh = true;
      state.error = null;
    },
    hasError(state, action) {
      state.loadingTongHop = false;
      state.loadingChiTiet = false;
      state.loadingManTinh = false;
      state.error = action.payload;
    },

    getTongHopSuccess(state, action) {
      state.loadingTongHop = false;
      state.baoCaoTongHop = action.payload;
    },

    getChiTietSuccess(state, action) {
      state.loadingChiTiet = false;
      state.chiTietDatLich = action.payload;
    },

    getManTinhSuccess(state, action) {
      state.loadingManTinh = false;
      // Convert array → Map keyed by dangkykhamid
      const map = {};
      action.payload.forEach((doc) => {
        map[doc.dangkykhamid] = doc;
      });
      state.danhSachManTinh = map;
    },

    addManTinhSuccess(state, action) {
      state.loadingManTinh = false;
      const doc = action.payload;
      state.danhSachManTinh[doc.dangkykhamid] = doc;
    },

    removeManTinhSuccess(state, action) {
      state.loadingManTinh = false;
      const dangkykhamid = action.payload;
      delete state.danhSachManTinh[dangkykhamid];
    },

    batchAddManTinhSuccess(state, action) {
      state.loadingManTinh = false;
      // action.payload = array of new docs (from server after insert)
      // Re-fetch is more reliable, but optimistically add if available
    },

    batchRemoveManTinhSuccess(state, action) {
      state.loadingManTinh = false;
      const ids = action.payload;
      ids.forEach((id) => delete state.danhSachManTinh[id]);
    },

    resetDatLichKham() {
      return initialState;
    },
  },
});

export default slice.reducer;

// ═══════════════════════════════════════
// THUNKS
// ═══════════════════════════════════════

/**
 * Fetch báo cáo tổng hợp theo NGT
 */
export const fetchBaoCaoTongHop =
  ({ fromDate, toDate }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoadingTongHop());
    try {
      const res = await apiService.post("/his/datlichkham/tonghop", {
        fromDate,
        toDate,
      });
      dispatch(slice.actions.getTongHopSuccess(res.data.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

/**
 * Fetch chi tiết + lịch sử khám
 */
export const fetchChiTietVoiLichSu =
  ({ fromDate, toDate }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoadingChiTiet());
    try {
      const res = await apiService.post("/his/datlichkham/chitiet-lichsu", {
        fromDate,
        toDate,
      });
      dispatch(slice.actions.getChiTietSuccess(res.data.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

/**
 * Fetch danh sách mãn tính theo danh sách dangkykhamids
 */
export const fetchDanhSachManTinh = (dangkykhamids) => async (dispatch) => {
  dispatch(slice.actions.startLoadingManTinh());
  try {
    const res = await apiService.post("/his/datlichkham/mantinh/list", {
      dangkykhamids,
    });
    dispatch(slice.actions.getManTinhSuccess(res.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

/**
 * Fetch all: tổng hợp + chi tiết + mãn tính (parallel)
 */
export const fetchAllData =
  ({ fromDate, toDate }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoadingTongHop());
    dispatch(slice.actions.startLoadingChiTiet());
    try {
      const [tongHopRes, chiTietRes] = await Promise.all([
        apiService.post("/his/datlichkham/tonghop", { fromDate, toDate }),
        apiService.post("/his/datlichkham/chitiet-lichsu", {
          fromDate,
          toDate,
        }),
      ]);

      dispatch(slice.actions.getTongHopSuccess(tongHopRes.data.data));
      dispatch(slice.actions.getChiTietSuccess(chiTietRes.data.data));

      // Extract dangkykhamids vòng 1 (có khám + có tiền) → fetch mãn tính
      const vong1Ids = chiTietRes.data.data
        .filter((r) => r.dangkykhamstatus === 1 && Number(r.tong_tien) > 0)
        .map((r) => r.dangkykhamid);

      if (vong1Ids.length > 0) {
        dispatch(slice.actions.startLoadingManTinh());
        const manTinhRes = await apiService.post(
          "/his/datlichkham/mantinh/list",
          {
            dangkykhamids: vong1Ids,
          },
        );
        dispatch(slice.actions.getManTinhSuccess(manTinhRes.data.data));
      } else {
        dispatch(slice.actions.getManTinhSuccess([]));
      }
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

/**
 * Đánh dấu mãn tính
 */
export const createManTinh = (data) => async (dispatch) => {
  dispatch(slice.actions.startLoadingManTinh());
  try {
    const res = await apiService.post("/his/datlichkham/mantinh", data);
    dispatch(slice.actions.addManTinhSuccess(res.data.data));
    toast.success("Đánh dấu mãn tính thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

/**
 * Bỏ đánh dấu mãn tính (hard delete)
 */
export const deleteManTinh = (dangkykhamid) => async (dispatch) => {
  dispatch(slice.actions.startLoadingManTinh());
  try {
    await apiService.delete(`/his/datlichkham/mantinh/${dangkykhamid}`);
    dispatch(slice.actions.removeManTinhSuccess(dangkykhamid));
    toast.success("Bỏ đánh dấu mãn tính thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

/**
 * Batch đánh dấu mãn tính
 */
export const batchCreateManTinh = (items) => async (dispatch) => {
  dispatch(slice.actions.startLoadingManTinh());
  try {
    await apiService.post("/his/datlichkham/mantinh/batch", { items });
    dispatch(slice.actions.batchAddManTinhSuccess(items));
    toast.success(`Đánh dấu ${items.length} bản ghi thành công`);
    return true; // signal to refetch
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
    return false;
  }
};

/**
 * Batch bỏ đánh dấu
 */
export const batchDeleteManTinh = (dangkykhamids) => async (dispatch) => {
  dispatch(slice.actions.startLoadingManTinh());
  try {
    await apiService.delete("/his/datlichkham/mantinh/batch", {
      data: { dangkykhamids },
    });
    dispatch(slice.actions.batchRemoveManTinhSuccess(dangkykhamids));
    toast.success(`Bỏ đánh dấu ${dangkykhamids.length} bản ghi thành công`);
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

// ═══════════════════════════════════════
// SELECTORS
// ═══════════════════════════════════════

export const selectBaoCaoTongHop = (state) => state.datLichKham.baoCaoTongHop;
export const selectChiTietDatLich = (state) => state.datLichKham.chiTietDatLich;
export const selectDanhSachManTinh = (state) =>
  state.datLichKham.danhSachManTinh;
export const selectLoadingTongHop = (state) => state.datLichKham.loadingTongHop;
export const selectLoadingChiTiet = (state) => state.datLichKham.loadingChiTiet;
export const selectLoadingManTinh = (state) => state.datLichKham.loadingManTinh;
export const selectError = (state) => state.datLichKham.error;
