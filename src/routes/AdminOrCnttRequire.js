import React from "react";
import useAuth from "../hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";

function AdminOrCnttRequire({ children }) {
  const { isInitialize, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isInitialize) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (
    !["admin", "superadmin", "cntt"].includes(
      (user?.PhanQuyen || "").toLowerCase(),
    )
  ) {
    alert("Bạn không có quyền truy cập chức năng này");
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}

export default AdminOrCnttRequire;
