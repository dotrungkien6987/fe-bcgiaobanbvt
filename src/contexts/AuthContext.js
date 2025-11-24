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
    case LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    case UPDATE_PROFILE:
      const {
        UserName,
        PassWord,
        PhanQuyen,
        KhoaID,
        HoTen,
        Email,
        KhoaTaiChinh,
      } = action.payload;
      return {
        ...state,
        user: {
          ...state.user,
          UserName,
          PassWord,
          PhanQuyen,
          KhoaID,
          HoTen,
          Email,
          KhoaTaiChinh,
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
  useEffect(() => {
    const initialize = async () => {
      try {
        const accessToken = window.localStorage.getItem("accessToken");
        console.log(`access Token in useEffect initial ${accessToken}`);
        if (accessToken && isValidToken(accessToken)) {
          setSecsion(accessToken);
          const response = await apiService.get("/user/me");
          const user = response.data.data;
          console.log(`user in useEfect initial`, user);
          dispatch({
            type: INITIALIZE,
            payload: { isAuthenticated: true, user },
          });
          // Load global color config after auth is ready
          reduxDispatch(fetchColorConfig());
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
    console.log("login");
    const response = await apiService.post("/auth/login", {
      UserName,
      PassWord,
    });
    const { user, accessToken } = response.data.data;

    console.log(user);
    setSecsion(accessToken);
    // console.log(`isAuth before dispatch login ${state.isAuthenticated}`);
    dispatch({
      type: LOGIN_SUCSESS,
      payload: { user },
    });
    // Ensure color config is loaded after login
    reduxDispatch(fetchColorConfig());
    // console.log(`isAuth after dispatch login ${state.isAuthenticated}`);
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
  const logout = (callback) => {
    setSecsion(null);
    dispatch({ type: LOGOUT });
    callback();
  };
  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
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
