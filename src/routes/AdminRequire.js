import React from "react";
import useAuth from "../hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import { useSelector } from "react-redux";
function AdminRequire({ children }) {
  const { isInitialize, isAuthenticated } = useAuth();
  const { user } = useAuth();
  const location = useLocation();
  // console.log(`isInitial in Authrequire ${isInitialize}`);
  if (!isInitialize) {
    return <LoadingScreen />;
  }
  console.log("user adminrequire", user);
  // console.log(`isAuth = ${isAuthenticated}`);
  if (!isAuthenticated) {
    console.log("isAuthenticated false");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  // console.log("isAuthenticated true");
  if (
    !["admin", "superadmin"].includes((user?.PhanQuyen || "").toLowerCase())
  ) {
    alert("Bạn phải có quyền Admin");
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}

export default AdminRequire;
