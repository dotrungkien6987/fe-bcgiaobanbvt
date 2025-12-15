/**
 * QuanLyKhoaOrAdminRequire - Route Guard cho quyền Admin hoặc Quản lý Khoa
 *
 * Cho phép truy cập nếu:
 * 1. User là Admin (PhanQuyen === 'admin' hoặc 'superadmin')
 * 2. User là Quản lý Khoa của ít nhất 1 khoa (trong DanhSachQuanLyKhoa)
 */
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import useAuth from "../hooks/useAuth";
import LoadingScreen from "../components/LoadingScreen";
import {
  getMyPermissions,
  selectMyPermissions,
} from "../features/QuanLyCongViec/Ticket/cauHinhKhoaSlice";
import { Typography, Button, Paper, Container } from "@mui/material";
import {
  Block as BlockIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";

function QuanLyKhoaOrAdminRequire({ children }) {
  const { isInitialize, isAuthenticated, user } = useAuth();
  const location = useLocation();
  const dispatch = useDispatch();

  const myPermissions = useSelector(selectMyPermissions);
  const [isChecking, setIsChecking] = useState(true);

  // Kiểm tra quyền khi component mount
  useEffect(() => {
    const checkPermissions = async () => {
      if (isAuthenticated && user) {
        // Nếu là Admin, không cần gọi API
        if (user.PhanQuyen === "admin" || user.PhanQuyen === "superadmin") {
          setIsChecking(false);
          return;
        }

        // Không phải Admin, cần kiểm tra qua API
        if (!myPermissions) {
          try {
            await dispatch(getMyPermissions());
          } catch (error) {
            console.error("Error checking permissions:", error);
          }
        }
        setIsChecking(false);
      }
    };

    checkPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, dispatch]); // Bỏ myPermissions khỏi dependencies để tránh loop

  // Đang khởi tạo auth
  if (!isInitialize) {
    return <LoadingScreen />;
  }

  // Chưa đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Đang kiểm tra quyền
  if (isChecking) {
    return <LoadingScreen />;
  }

  // Kiểm tra quyền
  const isAdmin =
    user?.PhanQuyen === "admin" || user?.PhanQuyen === "superadmin";
  const isQuanLyKhoa =
    myPermissions?.isAdmin || myPermissions?.quanLyKhoaList?.length > 0;
  const hasAccess = isAdmin || isQuanLyKhoa;

  // Không có quyền
  if (!hasAccess) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 2,
          }}
        >
          <BlockIcon
            sx={{ fontSize: 80, color: "error.main", mb: 2, opacity: 0.7 }}
          />
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Không có quyền truy cập
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Bạn cần có quyền <strong>Admin</strong> hoặc{" "}
            <strong>Quản lý Khoa</strong> để truy cập trang này.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Nếu bạn cho rằng đây là lỗi, vui lòng liên hệ quản trị viên để được
            cấp quyền Quản lý Khoa.
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => window.history.back()}
          >
            Quay lại
          </Button>
        </Paper>
      </Container>
    );
  }

  return children;
}

export default QuanLyKhoaOrAdminRequire;
