import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import apiService from "../../app/apiService";
import { cloudinaryUpload } from "../../utils/cloudinary";

const initialState = {
  isLoading: false,
  error: null,
  updatedProfile: null,
  selectedUser: null,
  users: [],
  totalPages: 1,
  KhoaTaiChinhCurent: [],
NhanVienUserCurrent:{},
  userCurrent:{}
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
      state.users.unshift({...action.payload.user,TenKhoa:action.payload.user.KhoaID.TenKhoa});
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

      state.users = action.payload.users.map((user) => ({
        ...user,
        TenKhoa: user.KhoaID ? user.KhoaID.TenKhoa : "",
      }));
    },
    getUsersSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      console.log("payload get users", action.payload);
      state.users = action.payload.users;
      state.totalUsers = action.payload.count;
      state.totalPages = action.payload.totalPages;
    },

    updateUserProfileSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.users = state.users.map((user) => {
        if (user._id === action.payload._id) {
          return {
            ...user,
            ...action.payload,
            TenKhoa: action.payload.KhoaID ? action.payload.KhoaID.TenKhoa : "",
          };
        }
        return user;
      });
    },

    deleteUserSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.users = state.users.filter(
        (user) => user._id !== action.payload._id
      );
    },

    setKhoaTaiChinhCurentSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.KhoaTaiChinhCurent = action.payload;
    },
    setNhanVienUserCurrentSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      if (action.payload.length > 0) {
        state.NhanVienUserCurrent = action.payload[0];
      }
      else {
        state.NhanVienUserCurrent = {};
      }
    },
    setUserCurentSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.userCurrent = action.payload;
    },
  },
});

export default slice.reducer;

export const updateUserProfile =
  ({ UserId, Email, HoTen, KhoaID,NhanVienID, PhanQuyen, UserName, KhoaTaiChinh,UserHis,DashBoard }) =>
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
        UserHis,
        DashBoard,
      };

      const response = await apiService.put(`/user/${UserId}`, data);
      console.log("update user success", response.data.data);
      dispatch(slice.actions.updateUserProfileSuccess(response.data.data));
      toast.success("Cập nhật người dùng thành công");
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
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
      toast.success("Reset Password successfully");
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
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
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
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
    toast.success("Thêm mới user thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const deleteUser = (userId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.delete(`/user/${userId}`);
    dispatch(slice.actions.deleteUserSuccess(response.data.data));
    toast.success("Xóa người dùng thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
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
export const setUserCurent = (user) => (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    dispatch(slice.actions.setUserCurentSuccess(user));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const setNhanVienUserCurrent = (nhanvien) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    dispatch(slice.actions.setNhanVienUserCurrentSuccess(nhanvien));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};