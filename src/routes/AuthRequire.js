import React from "react";
import useAuth from "../hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
function AuthRequire({ children }) {
  const { isInitialize, isAuthenticated, user } = useAuth();
  const location = useLocation();
  const mustChangePassword = Boolean(user?.mustChangePassword);
  const isForcePasswordChangeRoute =
    location.pathname === "/force-password-change";
  // console.log(`isInitial in Authrequire ${isInitialize}`);
  if (!isInitialize) {
    return <LoadingScreen />;
  }
  // console.log(location);
  // console.log(`isAuth = ${isAuthenticated}`);
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (mustChangePassword && !isForcePasswordChangeRoute) {
    return <Navigate to="/force-password-change" replace />;
  }

  if (!mustChangePassword && isForcePasswordChangeRoute) {
    return <Navigate to="/" replace />;
  }

  // console.log("isAuthenticated true");
  return children;
}

export default AuthRequire;
