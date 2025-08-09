import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import apiService from "app/apiService";

// Initial state
const initialState = {
  // Data states
  giaoViecs: [], // Quan hệ giao việc của nhân viên hiện tại
  chamKPIs: [], // Quan hệ chấm KPI của nhân viên hiện tại
  currentNhanVienQuanLy: null, // Nhân viên đang quản lý

  // UI states
  isLoading: false,
  error: null,
  isOpenSelectDialog: false, // Dialog chọn nhân viên
  selectedLoaiQuanLy: null, // "Giao_Viec" hoặc "KPI"
  hasUnsavedChanges: false, // Có thay đổi chưa lưu không

  // Available data for selection
  availableNhanViens: [], // Nhân viên có thể được chọn (filter từ nhanvienSlice)
};

// Create slice
const slice = createSlice({
  name: "quanLyNhanVien",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    setGiaoViecsSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.giaoViecs = action.payload;
    },
    setChamKPIsSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.chamKPIs = action.payload;
    },
    setCurrentNhanVienQuanLy(state, action) {
      state.currentNhanVienQuanLy = action.payload;
    },
    setIsOpenSelectDialog(state, action) {
      state.isOpenSelectDialog = action.payload;
    },
    setSelectedLoaiQuanLy(state, action) {
      state.selectedLoaiQuanLy = action.payload;
    },
    removeQuanLyFromUI(state, action) {
      const quanLyId = action.payload;
      state.giaoViecs = state.giaoViecs.filter((item) => item._id !== quanLyId);
      state.chamKPIs = state.chamKPIs.filter((item) => item._id !== quanLyId);
    },
    revertRemoveQuanLy(state, action) {
      // Logic to revert optimistic update - sẽ implement sau nếu cần
    },
    clearError(state) {
      state.error = null;
    },
    clearQuanLyNhanVienState(state) {
      state.currentNhanVienQuanLy = null;
      state.giaoViecs = [];
      state.chamKPIs = [];
      state.hasUnsavedChanges = false;
      state.error = null;
      state.loading = false;
      state.isOpenSelectDialog = false;
      state.selectedLoaiQuanLy = "";
    },

    // Simple add/remove actions for temporary manipulation
    addNhanVienToList(state, action) {
      const { loaiQuanLy, nhanVien } = action.payload;

      // Create a temporary relation object
      const newRelation = {
        _id: `temp_${Date.now()}_${nhanVien._id}`, // Temporary ID
        NhanVienQuanLy: state.currentNhanVienQuanLy._id,
        NhanVienDuocQuanLy: nhanVien, // Full nhân viên object
        LoaiQuanLy: loaiQuanLy,
        isTemporary: true,
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      if (loaiQuanLy === "Giao_Viec") {
        state.giaoViecs.push(newRelation);
      } else if (loaiQuanLy === "KPI") {
        state.chamKPIs.push(newRelation);
      }

      state.hasUnsavedChanges = true;
    },

    removeNhanVienFromList(state, action) {
      const { relationId } = action.payload;

      // Remove from both arrays (in case of ID conflicts)
      state.giaoViecs = state.giaoViecs.filter(
        (item) => item._id !== relationId
      );
      state.chamKPIs = state.chamKPIs.filter((item) => item._id !== relationId);

      state.hasUnsavedChanges = true;
    },

    markSaved(state) {
      state.hasUnsavedChanges = false;
      // Remove temporary flags from all relations
      state.giaoViecs.forEach((item) => {
        delete item.isTemporary;
      });
      state.chamKPIs.forEach((item) => {
        delete item.isTemporary;
      });
    },

    // New reducers to replace async thunks
    getGiaoViecByNhanVienSuccess(state, action) {
      state.isLoading = false;
      state.error = null;

      // Preserve temporary items khi load fresh data từ DB
      const temporaryItems = state.giaoViecs.filter((item) => item.isTemporary);
      const dbItems = action.payload || [];

      // Merge DB data với temporary data
      state.giaoViecs = [...dbItems, ...temporaryItems];

      // Chỉ reset hasUnsavedChanges nếu không có temporary items
      if (temporaryItems.length === 0) {
        state.hasUnsavedChanges = false;
      }
    },

    getChamKPIByNhanVienSuccess(state, action) {
      state.isLoading = false;
      state.error = null;

      // Preserve temporary items khi load fresh data từ DB
      const temporaryItems = state.chamKPIs.filter((item) => item.isTemporary);
      const dbItems = action.payload || [];

      // Merge DB data với temporary data
      state.chamKPIs = [...dbItems, ...temporaryItems];

      // Chỉ reset hasUnsavedChanges nếu không có temporary items
      if (temporaryItems.length === 0) {
        state.hasUnsavedChanges = false;
      }
    },

    addBatchQuanLyNhanVienSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const newRelations = action.payload;
      newRelations.forEach((relation) => {
        if (relation.LoaiQuanLy === "Giao_Viec") {
          state.giaoViecs.push(relation);
        } else {
          state.chamKPIs.push(relation);
        }
      });
    },

    syncQuanLyNhanVienListSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const { relations, LoaiQuanLy } = action.payload;

      // Xử lý cả trường hợp có relations và relations rỗng
      if (relations && relations.length > 0) {
        const loaiQuanLy = relations[0].LoaiQuanLy;
        if (loaiQuanLy === "Giao_Viec") {
          state.giaoViecs = relations;
        } else {
          state.chamKPIs = relations;
        }
      } else {
        // Trường hợp xóa hết relations - sử dụng LoaiQuanLy từ request
        if (LoaiQuanLy === "Giao_Viec") {
          state.giaoViecs = [];
        } else if (LoaiQuanLy === "KPI") {
          state.chamKPIs = [];
        }
        console.log(`Cleared all ${LoaiQuanLy} relations`);
      }

      // Reset hasUnsavedChanges vì đã sync thành công
      state.hasUnsavedChanges = false;
    },

    updateLoaiQuanLySuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const updatedRelation = action.payload;

      // Remove from old array and add to new array
      state.giaoViecs = state.giaoViecs.filter(
        (item) => item._id !== updatedRelation._id
      );
      state.chamKPIs = state.chamKPIs.filter(
        (item) => item._id !== updatedRelation._id
      );

      if (updatedRelation.LoaiQuanLy === "Giao_Viec") {
        state.giaoViecs.push(updatedRelation);
      } else {
        state.chamKPIs.push(updatedRelation);
      }
    },

    getOneByNhanVienIDSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.currentNhanVienQuanLy = action.payload;
    },
  },
});

// Export actions
export const {
  startLoading,
  hasError,
  setGiaoViecsSuccess,
  setChamKPIsSuccess,
  setCurrentNhanVienQuanLy,
  setIsOpenSelectDialog,
  setSelectedLoaiQuanLy,
  removeQuanLyFromUI,
  revertRemoveQuanLy,
  clearError,
  clearQuanLyNhanVienState,
  addNhanVienToList,
  removeNhanVienFromList,
  markSaved,
  getGiaoViecByNhanVienSuccess,
  getChamKPIByNhanVienSuccess,
  addBatchQuanLyNhanVienSuccess,
  syncQuanLyNhanVienListSuccess,
  updateLoaiQuanLySuccess,
  getOneByNhanVienIDSuccess,
} = slice.actions;

// Selectors to get available nhân viên for selection
export const getAvailableNhanViensForGiaoViec = (state) => {
  const { nhanviens } = state.nhanvien;
  const { giaoViecs, currentNhanVienQuanLy } = state.quanLyNhanVien;

  return nhanviens.filter(
    (nv) =>
      nv._id !== currentNhanVienQuanLy?._id && // Không thể tự quản lý
      !giaoViecs.some((gv) => gv.NhanVienDuocQuanLy._id === nv._id) // Chưa được giao việc
  );
};

export const getAvailableNhanViensForChamKPI = (state) => {
  const { nhanviens } = state.nhanvien;
  const { chamKPIs, currentNhanVienQuanLy } = state.quanLyNhanVien;

  return nhanviens.filter(
    (nv) =>
      nv._id !== currentNhanVienQuanLy?._id && // Không thể tự quản lý
      !chamKPIs.some((ck) => ck.NhanVienDuocQuanLy._id === nv._id) // Chưa được chấm KPI
  );
};

export default slice.reducer;

// Action creators
export const getGiaoViecByNhanVien = (nhanVienId) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.get(
      `/workmanagement/quan-ly-nhan-vien/giaoviec/${nhanVienId}`
    );
    dispatch(slice.actions.getGiaoViecByNhanVienSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const getChamKPIByNhanVien = (nhanVienId) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.get(
      `/workmanagement/quan-ly-nhan-vien/chamkpi/${nhanVienId}`
    );
    dispatch(slice.actions.getChamKPIByNhanVienSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const addBatchQuanLyNhanVien = (data) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.post(
      "/workmanagement/quan-ly-nhan-vien/batch",
      data
    );
    dispatch(slice.actions.addBatchQuanLyNhanVienSuccess(response.data.data));
    toast.success("Thêm nhân viên thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const deleteBatchQuanLyNhanVien = (quanLyIds) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    await apiService.delete("/workmanagement/quan-ly-nhan-vien/batch", {
      data: { quanLyIds },
    });
    toast.success("Xóa thành công");
    // Có thể cần reload data sau khi xóa
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const syncQuanLyNhanVienList = (data) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    console.log("Redux slice - data to send:", data);

    const response = await apiService.post(
      "/workmanagement/quan-ly-nhan-vien/sync",
      data
    );

    // Thông báo kết quả
    const { added, deleted, total } = response.data.data.summary;
    const messages = [];
    if (added > 0) messages.push(`Thêm ${added} nhân viên`);
    if (deleted > 0) messages.push(`Xóa ${deleted} quan hệ`);
    messages.push(`Tổng cộng: ${total} quan hệ`);

    toast.success(`Cập nhật thành công: ${messages.join(", ")}`);

    // Thêm LoaiQuanLy vào response data để xử lý trường hợp relations rỗng
    const responseData = {
      ...response.data.data,
      LoaiQuanLy: data.LoaiQuanLy, // Truyền LoaiQuanLy từ request
    };

    dispatch(slice.actions.syncQuanLyNhanVienListSuccess(responseData));
    dispatch(slice.actions.markSaved());
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error("Có lỗi xảy ra khi cập nhật: " + error.message);
  }
};

export const updateLoaiQuanLy = (data) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const { quanLyId, LoaiQuanLy } = data;
    const response = await apiService.put(
      `/workmanagement/quan-ly-nhan-vien/${quanLyId}/loai`,
      {
        LoaiQuanLy,
      }
    );
    dispatch(slice.actions.updateLoaiQuanLySuccess(response.data.data));
    toast.success("Chuyển đổi loại quản lý thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error("Có lỗi xảy ra khi chuyển đổi loại quản lý: " + error.message);
  }
};

export const getOneByNhanVienID = (nhanvienID) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.get(`/nhanvien/simple/${nhanvienID}`);
    dispatch(slice.actions.getOneByNhanVienIDSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
