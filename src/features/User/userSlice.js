import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import apiService from "../../app/apiService";

const mapUserForList = (user = {}) => ({
  ...user,
  TenKhoa: user?.KhoaID?.TenKhoa || user?.TenKhoa || "",
});

const initialState = {
  isLoading: false,
  error: null,
  updatedProfile: null,
  selectedUser: null,
  users: [],
  totalUsers: 0,
  totalPages: 1,
  KhoaTaiChinhCurent: [],
  KhoaLichTrucCurent: [],
  NhanVienUserCurrent: {},
  userCurrent: {},
};

const slice = createSlice({
  name: "user",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },

    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    CreateUserSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      console.log("action payload", action.payload);
      state.users.unshift(mapUserForList(action.payload.user));
    },

    getUserSuccess(state, action) {
      state.isLoading = false;
      state.error = null;

      state.selectedUser = action.payload;
    },

    resetPassSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      console.log("payload reset success", action.payload);
    },

    getAllUsersSuccess(state, action) {
      state.isLoading = false;
      state.error = null;

      state.users = action.payload.users.map(mapUserForList);
    },
    getUsersSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      console.log("payload get users", action.payload);
      state.users = action.payload.users.map(mapUserForList);
      state.totalUsers = action.payload.count;
      state.totalPages = action.payload.totalPages;
    },

    updateUserProfileSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.users = state.users.map((user) => {
        if (String(user._id) === String(action.payload._id)) {
          return mapUserForList({
            ...user,
            ...action.payload,
          });
        }
        return user;
      });
    },

    deleteUserSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.users = state.users.filter(
        (user) => String(user._id) !== String(action.payload._id),
      );
    },
    setKhoaTaiChinhCurentSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.KhoaTaiChinhCurent = action.payload;
    },
    setKhoaLichTrucCurentSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.KhoaLichTrucCurent = action.payload;
    },
    setNhanVienUserCurrentSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const payload = action.payload;
      // Hỗ trợ cả 3 dạng: null/undefined, object, array
      if (Array.isArray(payload)) {
        if (payload.length > 0) {
          state.NhanVienUserCurrent = payload[0];
        } else {
          state.NhanVienUserCurrent = {};
        }
      } else if (payload && typeof payload === "object" && payload._id) {
        state.NhanVienUserCurrent = payload; // truyền trực tiếp object nhân viên
      } else {
        state.NhanVienUserCurrent = {}; // reset
      }
    },
    setUserCurentSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.userCurrent = action.payload;
    },
    resetUserFormStateSuccess(state) {
      state.isLoading = false;
      state.error = null;
      state.KhoaTaiChinhCurent = [];
      state.KhoaLichTrucCurent = [];
      state.NhanVienUserCurrent = {};
      state.userCurrent = {};
    },
  },
});

export default slice.reducer;

export const updateUserProfile =
  ({
    UserId,
    Email,
    HoTen,
    KhoaID,
    NhanVienID,
    PhanQuyen,
    UserName,
    KhoaTaiChinh,
    KhoaLichTruc,
    UserHis,
    DashBoard,
  }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const data = {
        Email,
        HoTen,
        KhoaID,
        NhanVienID,
        PhanQuyen,
        UserName,
        KhoaTaiChinh,
        KhoaLichTruc,
        UserHis,
        DashBoard,
      };

      const response = await apiService.put(`/user/${UserId}`, data);
      console.log("update user success", response.data.data);
      dispatch(slice.actions.updateUserProfileSuccess(response.data.data));
      toast.success("Cập nhật người dùng thành công");
      return true;
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
      return false;
    }
  };

export const resetPass =
  ({ UserId, PassWord }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const data = {
        PassWord,
      };

      const response = await apiService.put(`/user/resetpass/${UserId}`, data);
      console.log("update user success", response.data.data);
      dispatch(slice.actions.resetPassSuccess(response.data.data));
      toast.success("Đặt lại mật khẩu thành công");
      return true;
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
      return false;
    }
  };

export const resetPassMe =
  ({ UserName, PassWordOld, PassWordNew }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const data = {
        UserName,
        PassWordOld,
        PassWordNew,
      };
      console.log("data reset", data);
      const response = await apiService.put("user/me/resetpass", data);

      dispatch(slice.actions.resetPassSuccess(response.data.data));
      toast.success("Đổi mật khẩu thành công");
      return true;
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
      return false;
    }
  };

export const getUser = (id) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.get(`/users/${id}`);
    dispatch(slice.actions.getUserSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error));
    toast.error(error.message);
  }
};

export const getCurrentUserProfile = () => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.get("/users/me");
    dispatch(slice.actions.updateUserProfileSuccess(response.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error));
  }
};

export const getUsers =
  ({ filterName = "", page = 1, limit = 12 }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const params = { page, limit };
      if (filterName && filterName !== "") params.UserName = filterName;
      const response = await apiService.get(`/user`, { params });
      dispatch(slice.actions.getUsersSuccess(response.data.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
      toast.error(error.message);
    }
  };
export const getAllUsers = () => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.get(`/user/all`);
    dispatch(slice.actions.getAllUsersSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error));
    toast.error(error.message);
  }
};

export const CreateUser = (user) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.post("/user", {
      ...user,
    });
    dispatch(slice.actions.CreateUserSuccess(response.data.data));
    toast.success("Thêm tài khoản thành công");
    return true;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
    return false;
  }
};

export const deleteUser = (userId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.delete(`/user/${userId}`);
    dispatch(slice.actions.deleteUserSuccess(response.data.data));
    toast.success("Xóa người dùng thành công");
    return true;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
    return false;
  }
};
export const setKhoaTaiChinhCurent = (khoataichinh) => (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    dispatch(slice.actions.setKhoaTaiChinhCurentSuccess(khoataichinh));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const setKhoaLichTrucCurent = (khoalichtruc) => (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    dispatch(slice.actions.setKhoaLichTrucCurentSuccess(khoalichtruc));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const setUserCurent = (user) => (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    dispatch(slice.actions.setUserCurentSuccess(user));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const setNhanVienUserCurrent = (nhanvien) => (dispatch) => {
  // Đảm bảo gọi đúng startLoading() (trước đây thiếu ngoặc nên không chạy)
  dispatch(slice.actions.startLoading());
  try {
    dispatch(slice.actions.setNhanVienUserCurrentSuccess(nhanvien));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const resetUserFormState = () => (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    dispatch(slice.actions.resetUserFormStateSuccess());
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
