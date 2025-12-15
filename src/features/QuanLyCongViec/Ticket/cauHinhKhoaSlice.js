/**
 * CauHinhThongBaoKhoa Redux Slice
 *
 * Quản lý cấu hình người điều phối + quản lý khoa
 */
import { createSlice } from "@reduxjs/toolkit";
import apiService from "app/apiService";
import { toast } from "react-toastify";

const BASE_URL = "/workmanagement/cau-hinh-thong-bao-khoa";

const initialState = {
  isLoading: false,
  error: null,
  cauHinhList: [], // Danh sách cấu hình của tất cả khoa (admin view)
  cauHinhHienTai: null, // Cấu hình của khoa đang xem
  selectedKhoaId: null,
  kiemTraResult: null, // { daCauHinh, coNguoiDieuPhoi }
  nhanVienTheoKhoa: [], // Danh sách nhân viên của khoa đang chọn
  myPermissions: null, // { isAdmin, quanLyKhoaList: [] }
};

const slice = createSlice({
  name: "cauHinhKhoa",
  initialState,
  reducers: {
    startLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    hasError: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Lấy tất cả cấu hình (admin)
    getAllSuccess: (state, action) => {
      state.isLoading = false;
      state.cauHinhList = action.payload;
    },

    // Lấy cấu hình theo khoa
    getCauHinhByKhoaSuccess: (state, action) => {
      state.isLoading = false;
      state.cauHinhHienTai = action.payload;
    },

    setSelectedKhoa: (state, action) => {
      state.selectedKhoaId = action.payload;
    },

    // Kiểm tra cấu hình
    kiemTraCauHinhSuccess: (state, action) => {
      state.isLoading = false;
      state.kiemTraResult = action.payload;
    },

    // Tạo cấu hình mới
    createCauHinhSuccess: (state, action) => {
      state.isLoading = false;
      state.cauHinhHienTai = action.payload;
      state.cauHinhList = [...state.cauHinhList, action.payload];
    },

    // Cập nhật cấu hình
    updateCauHinhSuccess: (state, action) => {
      state.isLoading = false;
      state.cauHinhHienTai = action.payload;
      state.cauHinhList = state.cauHinhList.map((item) =>
        item.KhoaID === action.payload.KhoaID ? action.payload : item
      );
    },

    // Thêm quản lý khoa
    addQuanLySuccess: (state, action) => {
      state.isLoading = false;
      state.cauHinhHienTai = action.payload;
    },

    // Xóa quản lý khoa
    removeQuanLySuccess: (state, action) => {
      state.isLoading = false;
      state.cauHinhHienTai = action.payload;
    },

    // Thêm người điều phối
    addDieuPhoiSuccess: (state, action) => {
      state.isLoading = false;
      state.cauHinhHienTai = action.payload;
    },

    // Xóa người điều phối
    removeDieuPhoiSuccess: (state, action) => {
      state.isLoading = false;
      state.cauHinhHienTai = action.payload;
    },

    clearCauHinhHienTai: (state) => {
      state.cauHinhHienTai = null;
      state.selectedKhoaId = null;
    },

    // Lấy nhân viên theo khoa
    getNhanVienTheoKhoaSuccess: (state, action) => {
      state.isLoading = false;
      state.nhanVienTheoKhoa = action.payload;
    },

    // Clear nhân viên khi đổi khoa
    clearNhanVienTheoKhoa: (state) => {
      state.nhanVienTheoKhoa = [];
    },

    // Lấy quyền của user hiện tại
    getMyPermissionsSuccess: (state, action) => {
      state.isLoading = false;
      state.myPermissions = action.payload;
    },
  },
});

export const {
  startLoading,
  hasError,
  getAllSuccess,
  getCauHinhByKhoaSuccess,
  setSelectedKhoa,
  kiemTraCauHinhSuccess,
  createCauHinhSuccess,
  updateCauHinhSuccess,
  addQuanLySuccess,
  removeQuanLySuccess,
  addDieuPhoiSuccess,
  removeDieuPhoiSuccess,
  clearCauHinhHienTai,
  getNhanVienTheoKhoaSuccess,
  clearNhanVienTheoKhoa,
  getMyPermissionsSuccess,
} = slice.actions;

// ============== THUNKS ==============

/**
 * Lấy tất cả cấu hình khoa (Admin only)
 */
export const getAllCauHinhKhoa = () => async (dispatch) => {
  dispatch(startLoading());
  try {
    const response = await apiService.get(BASE_URL);
    dispatch(getAllSuccess(response.data.data || []));
  } catch (error) {
    dispatch(hasError(error.message));
    toast.error(error.message || "Lỗi khi tải danh sách cấu hình");
  }
};

/**
 * Lấy cấu hình theo khoa
 */
export const getCauHinhByKhoa = (khoaId) => async (dispatch) => {
  dispatch(startLoading());
  dispatch(setSelectedKhoa(khoaId));
  try {
    const response = await apiService.get(`${BASE_URL}/by-khoa/${khoaId}`);
    dispatch(getCauHinhByKhoaSuccess(response.data.data));
  } catch (error) {
    dispatch(hasError(error.message));
    // Không toast error nếu chưa cấu hình
    if (!error.message?.includes("chưa được cấu hình")) {
      toast.error(error.message || "Lỗi khi tải cấu hình khoa");
    }
  }
};

/**
 * Kiểm tra khoa đã cấu hình chưa
 */
export const kiemTraCauHinhKhoa = (khoaId) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const response = await apiService.get(`${BASE_URL}/check/${khoaId}`);
    dispatch(kiemTraCauHinhSuccess(response.data.data));
    return response.data.data;
  } catch (error) {
    dispatch(hasError(error.message));
    return null;
  }
};

/**
 * Tạo cấu hình mới cho khoa (Admin only)
 */
export const createCauHinhKhoa = (data, callback) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const response = await apiService.post(BASE_URL, data);
    dispatch(createCauHinhSuccess(response.data.data));
    toast.success("Tạo cấu hình khoa thành công");
    if (callback) callback(response.data.data);
  } catch (error) {
    dispatch(hasError(error.message));
    toast.error(error.message || "Lỗi khi tạo cấu hình khoa");
  }
};

/**
 * Thêm quản lý khoa
 */
export const addQuanLyKhoa =
  (khoaId, nhanVienId, callback) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const response = await apiService.post(
        `${BASE_URL}/by-khoa/${khoaId}/quan-ly`,
        {
          NhanVienID: nhanVienId,
        }
      );
      dispatch(addQuanLySuccess(response.data.data));
      toast.success("Thêm quản lý khoa thành công");
      if (callback) callback(response.data.data);
    } catch (error) {
      dispatch(hasError(error.message));
      toast.error(error.message || "Lỗi khi thêm quản lý khoa");
    }
  };

/**
 * Xóa quản lý khoa
 */
export const removeQuanLyKhoa =
  (khoaId, nhanVienId, callback) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const response = await apiService.delete(
        `${BASE_URL}/by-khoa/${khoaId}/quan-ly/${nhanVienId}`
      );
      dispatch(removeQuanLySuccess(response.data.data));
      toast.success("Xóa quản lý khoa thành công");
      if (callback) callback(response.data.data);
    } catch (error) {
      dispatch(hasError(error.message));
      toast.error(error.message || "Lỗi khi xóa quản lý khoa");
    }
  };

/**
 * Thêm người điều phối
 */
export const addNguoiDieuPhoi =
  (khoaId, nhanVienId, callback) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const response = await apiService.post(
        `${BASE_URL}/by-khoa/${khoaId}/dieu-phoi`,
        { NhanVienID: nhanVienId }
      );
      dispatch(addDieuPhoiSuccess(response.data.data));
      toast.success("Thêm người điều phối thành công");
      if (callback) callback(response.data.data);
    } catch (error) {
      dispatch(hasError(error.message));
      toast.error(error.message || "Lỗi khi thêm người điều phối");
    }
  };

/**
 * Xóa người điều phối
 */
export const removeNguoiDieuPhoi =
  (khoaId, nhanVienId, callback) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const response = await apiService.delete(
        `${BASE_URL}/by-khoa/${khoaId}/dieu-phoi/${nhanVienId}`
      );
      dispatch(removeDieuPhoiSuccess(response.data.data));
      toast.success("Xóa người điều phối thành công");
      if (callback) callback(response.data.data);
    } catch (error) {
      dispatch(hasError(error.message));
      toast.error(error.message || "Lỗi khi xóa người điều phối");
    }
  };

/**
 * Lấy danh sách nhân viên theo khoa (để chọn trong dialog)
 */
export const getNhanVienTheoKhoa = (khoaId) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const response = await apiService.get(`${BASE_URL}/nhanvien/${khoaId}`);
    dispatch(getNhanVienTheoKhoaSuccess(response.data.data || []));
  } catch (error) {
    dispatch(hasError(error.message));
    toast.error(error.message || "Lỗi khi tải danh sách nhân viên");
  }
};

/**
 * Lấy quyền của user hiện tại (Admin hoặc Quản lý Khoa)
 * Trả về: { isAdmin, quanLyKhoaList: [{ _id, TenKhoa, MaKhoa }] }
 */
export const getMyPermissions = () => async (dispatch) => {
  dispatch(startLoading());
  try {
    const response = await apiService.get(`${BASE_URL}/my-permissions`);
    dispatch(getMyPermissionsSuccess(response.data.data));
    return response.data.data;
  } catch (error) {
    dispatch(hasError(error.message));
    return null;
  }
};

// ============== SELECTORS ==============
export const selectCauHinhKhoaState = (state) => state.cauHinhKhoa;
export const selectCauHinhHienTai = (state) =>
  state.cauHinhKhoa?.cauHinhHienTai;
export const selectCauHinhList = (state) =>
  state.cauHinhKhoa?.cauHinhList || [];
export const selectSelectedKhoaId = (state) =>
  state.cauHinhKhoa?.selectedKhoaId;
export const selectKiemTraResult = (state) => state.cauHinhKhoa?.kiemTraResult;
export const selectCauHinhLoading = (state) => state.cauHinhKhoa?.isLoading;
export const selectNhanVienTheoKhoa = (state) =>
  state.cauHinhKhoa?.nhanVienTheoKhoa || [];
export const selectMyPermissions = (state) => state.cauHinhKhoa?.myPermissions;

export default slice.reducer;
