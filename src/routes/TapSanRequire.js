import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import useAuth from "../hooks/useAuth";

const TAPSAN_ALLOWED_ROLES = [
  "admin",
  "superadmin",
  "daotao",
  "manager",
  "nomal",
  "noibo",
];

function TapSanRequire({ children }) {
  const { isInitialize, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isInitialize) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!TAPSAN_ALLOWED_ROLES.includes((user?.PhanQuyen || "").toLowerCase())) {
    alert("Bạn không có quyền truy cập chức năng này");
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}

export default TapSanRequire;
