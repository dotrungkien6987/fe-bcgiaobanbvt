import { createContext, useReducer, useEffect, useContext } from "react";
import apiService from "../app/apiService";
import { isValidToken } from "../utils/jwt";
import { useDispatch as useReduxDispatch } from "react-redux";
import { fetchColorConfig } from "features/QuanLyCongViec/CongViec/colorConfigSlice";

const initialState = {
  isInitialize: false,
  isAuthenticated: false,
  user: null,
};
const INITIALIZE = "AUTH.INITIALIZE";
const LOGIN_SUCSESS = "AUTH.LOGIN_SUCSESS";
const REGISTER_SUCCESS = "AUTH.REGISTER_SUCCESS";
const LOGOUT = "AUTH.LOGOUT";
const UPDATE_PROFILE = "AUTH.UPDATE_PROFILE";
const SET_AUTH_USER = "AUTH.SET_AUTH_USER";

const reducer = (state, action) => {
  switch (action.type) {
    case INITIALIZE:
      const { isAuthenticated, user } = action.payload;
      return {
        ...state,
        isInitialize: true,
        isAuthenticated,
        user,
      };
    case LOGIN_SUCSESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
      };
    case REGISTER_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
      };
    case SET_AUTH_USER:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
      };
    case LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    case UPDATE_PROFILE:
      const {
        UserName,
        PhanQuyen,
        KhoaID,
        HoTen,
        Email,
        KhoaTaiChinh,
        mustChangePassword,
      } = action.payload;
      return {
        ...state,
        user: {
          ...state.user,
          UserName,
          PhanQuyen,
          KhoaID,
          HoTen,
          Email,
          KhoaTaiChinh,
          mustChangePassword,
        },
      };
    default:
      return state;
  }
};
const setSecsion = (accessToken) => {
  if (accessToken) {
    window.localStorage.setItem("accessToken", accessToken);
    apiService.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    window.localStorage.removeItem("accessToken");
    delete apiService.defaults.headers.common.Authorization;
  }
};
const AuthContext = createContext({ ...initialState });
function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const reduxDispatch = useReduxDispatch();
  // const updatedProfile = useSelector((state) => state.user.updatedProfile);

  const hydrateAuthenticatedUser = async (user) => {
    const nextUser = { ...user };

    if (nextUser.mustChangePassword) {
      nextUser.nhanVienInfo = null;
      return nextUser;
    }

    if (nextUser.NhanVienID) {
      try {
        const fullInfoRes = await apiService.get("/user/me/full");
        const { nhanVien, nhanVienKhoaId } = fullInfoRes.data.data;
        nextUser.nhanVienInfo = { nhanVien, khoaId: nhanVienKhoaId };
      } catch (error) {
        nextUser.nhanVienInfo = null;
      }
    } else {
      nextUser.nhanVienInfo = null;
    }

    return nextUser;
  };

  const refreshCurrentUser = async () => {
    const response = await apiService.get("/user/me");
    const user = await hydrateAuthenticatedUser(response.data.data);

    dispatch({
      type: SET_AUTH_USER,
      payload: { user },
    });

    if (!user.mustChangePassword) {
      reduxDispatch(fetchColorConfig());
    }

    return user;
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const accessToken = window.localStorage.getItem("accessToken");
        if (accessToken && isValidToken(accessToken)) {
          setSecsion(accessToken);
          const response = await apiService.get("/user/me");
          const user = await hydrateAuthenticatedUser(response.data.data);

          dispatch({
            type: INITIALIZE,
            payload: { isAuthenticated: true, user },
          });
          // Load global color config after auth is ready
          if (!user.mustChangePassword) {
            reduxDispatch(fetchColorConfig());
          }
        } else {
          setSecsion(null);
          dispatch({
            type: INITIALIZE,
            payload: { isAuthenticated: false, user: null },
          });
        }
      } catch (error) {
        setSecsion(null);
        dispatch({
          type: INITIALIZE,
          payload: { isAuthenticated: false, user: null },
        });
      }
    };
    initialize();
  }, [reduxDispatch]);

  // useEffect(() => {
  //   if (updatedProfile)
  //     dispatch({ type: UPDATE_PROFILE, payload: updatedProfile });
  // }, [updatedProfile]);

  const login = async ({ UserName, PassWord }, callback) => {
    const response = await apiService.post("/auth/login", {
      UserName,
      PassWord,
    });
    const { user, accessToken } = response.data.data;
    const hydratedUser = await hydrateAuthenticatedUser(user);
    setSecsion(accessToken);
    dispatch({
      type: LOGIN_SUCSESS,
      payload: { user: hydratedUser },
    });
    // Ensure color config is loaded after login
    if (!hydratedUser.mustChangePassword) {
      reduxDispatch(fetchColorConfig());
    }
    callback();
  };

  const register = async ({ name, email, password }, callback) => {
    const response = await apiService.post("/users", { name, email, password });
    const { user, accessToken } = response.data.data;

    setSecsion(accessToken);
    dispatch({
      type: REGISTER_SUCCESS,
      payload: { user },
    });
  };
  const logout = async (callback) => {
    try {
      await apiService.post("/auth/logout");
    } catch (error) {
      console.error("Logout API failed", error);
    } finally {
      setSecsion(null);
      dispatch({ type: LOGOUT });
      if (typeof callback === "function") {
        callback();
      }
    }
  };
  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, refreshCurrentUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use AuthContext
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthContext, AuthProvider, useAuth };
