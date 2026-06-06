import React from "react";
import useAuth from "../hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";

function DashboardRequire({ children }) {
  const { isInitialize, isAuthenticated } = useAuth();
  const { user } = useAuth();
  const location = useLocation();
  // console.log(`isInitial in Authrequire ${isInitialize}`);
  if (!isInitialize) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  // console.log("isAuthenticated true");

  // Admin/superadmin luôn được phép
  const userRole = (user?.PhanQuyen || "").toLowerCase();
  const isAdminRole = ["admin", "superadmin"].includes(userRole);

  // Các user khác: phải có DashBoard không rỗng (quyền do admin cấu hình)
  const hasDashboardPermission =
    Array.isArray(user?.DashBoard) && user.DashBoard.length > 0;

  if (!isAdminRole && !hasDashboardPermission) {
    alert("Bạn không có quyền xem dashboard");
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}

export default DashboardRequire;
