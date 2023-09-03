import { createContext, useReducer, useEffect } from "react";
import apiService from "../app/apiService";
import { isValidToken } from "../utils/jwt";
import { useSelector } from "react-redux";

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
      const { UserName, PassWord, PhanQuyen, KhoaID, HoTen, Email } =
        action.payload;
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
  }, []);

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

export { AuthContext, AuthProvider };
