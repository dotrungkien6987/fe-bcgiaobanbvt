import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../../app/apiService";
import { toast } from "react-toastify";

const initialState = {
  isLoading: false,
  error: null,
  khuyenCaoList: [],
  selectedKhuyenCao: null,
  currentYear: new Date().getFullYear(),
};

const slice = createSlice({
  name: "khuyenCaoKhoaBQBA",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
      state.error = null;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getAllSuccess(state, action) {
      state.isLoading = false;
      state.khuyenCaoList = action.payload.khuyenCaoList || [];
      state.currentYear = action.payload.nam || state.currentYear;
    },
    getByKhoaSuccess(state, action) {
      state.isLoading = false;
      state.selectedKhuyenCao = action.payload.khuyenCao;
    },
    createSuccess(state, action) {
      state.isLoading = false;
      state.khuyenCaoList.push(action.payload.khuyenCao);
    },
    updateSuccess(state, action) {
      state.isLoading = false;
      const index = state.khuyenCaoList.findIndex(
        (item) => item._id === action.payload.khuyenCao._id
      );
      if (index !== -1) {
        state.khuyenCaoList[index] = action.payload.khuyenCao;
      }
    },
    deleteSuccess(state, action) {
      state.isLoading = false;
      state.khuyenCaoList = state.khuyenCaoList.filter(
        (item) => item._id !== action.payload.id
      );
    },
    bulkCreateSuccess(state, action) {
      state.isLoading = false;
      // Sau khi bulk create, cần fetch lại danh sách
    },
    setCurrentYear(state, action) {
      state.currentYear = action.payload;
    },
  },
});

export default slice.reducer;

/**
 * Lấy tất cả khuyến cáo theo năm
 */
export const getAllKhuyenCao = (nam) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const year = nam || new Date().getFullYear();
    const response = await apiService.get(`/khuyen-cao-khoa-bqba?nam=${year}`);
    dispatch(slice.actions.getAllSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message || "Không thể tải danh sách khuyến cáo");
  }
};

/**
 * Lấy khuyến cáo của 1 khoa cụ thể
 */
export const getKhuyenCaoByKhoa =
  (khoaId, loaiKhoa, nam) => async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const year = nam || new Date().getFullYear();
      const response = await apiService.get(
        `/khuyen-cao-khoa-bqba/by-khoa/${khoaId}/${loaiKhoa}?nam=${year}`
      );
      dispatch(slice.actions.getByKhoaSuccess(response.data.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message || "Không thể tải khuyến cáo");
    }
  };

/**
 * Tạo mới khuyến cáo
 */
export const createKhuyenCao = (data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.post("/khuyen-cao-khoa-bqba", data);
    dispatch(slice.actions.createSuccess(response.data.data));
    toast.success("Tạo khuyến cáo thành công");
    return response.data.data;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message || "Không thể tạo khuyến cáo");
    throw error;
  }
};

/**
 * Cập nhật khuyến cáo
 */
export const updateKhuyenCao = (id, data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.put(`/khuyen-cao-khoa-bqba/${id}`, data);
    dispatch(slice.actions.updateSuccess(response.data.data));
    toast.success("Cập nhật khuyến cáo thành công");
    return response.data.data;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message || "Không thể cập nhật khuyến cáo");
    throw error;
  }
};

/**
 * Xóa khuyến cáo
 */
export const deleteKhuyenCao = (id) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    await apiService.delete(`/khuyen-cao-khoa-bqba/${id}`);
    dispatch(slice.actions.deleteSuccess({ id }));
    toast.success("Xóa khuyến cáo thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message || "Không thể xóa khuyến cáo");
    throw error;
  }
};

/**
 * Copy khuyến cáo từ năm trước
 */
export const bulkCreateKhuyenCao = (namGoc, namMoi) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.post(
      "/khuyen-cao-khoa-bqba/bulk-create",
      {
        namGoc,
        namMoi,
      }
    );
    dispatch(slice.actions.bulkCreateSuccess(response.data.data));
    toast.success(
      `Đã copy ${response.data.data.count} khuyến cáo từ năm ${namGoc} sang năm ${namMoi}`
    );
    // Fetch lại danh sách sau khi bulk create
    dispatch(getAllKhuyenCao(namMoi));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message || "Không thể copy khuyến cáo");
    throw error;
  }
};

/**
 * Đặt năm hiện tại
 */
export const setCurrentYear = (year) => (dispatch) => {
  dispatch(slice.actions.setCurrentYear(year));
  dispatch(getAllKhuyenCao(year));
};
