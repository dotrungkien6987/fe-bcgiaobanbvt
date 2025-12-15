/**
 * useYeuCauRoles - Hook kiểm tra vai trò của user trong hệ thống Yêu Cầu
 *
 * Xác định:
 * - Có phải người điều phối không
 * - Có phải quản lý khoa không
 * - Có yêu cầu cần xử lý không
 */
import { useEffect, useState } from "react";
import useAuth from "hooks/useAuth";

export function useYeuCauRoles() {
  const { user } = useAuth();
  const [roles, setRoles] = useState({
    isNguoiDieuPhoi: false,
    isQuanLyKhoa: false,
    khoaID: null,
    tenKhoa: null,
    danhSachKhoaDieuPhoi: [],
    isAdmin: false,
    loading: true,
  });

  useEffect(() => {
    const loadPermissions = async () => {
      if (!user?.NhanVienID) {
        setRoles((prev) => ({ ...prev, loading: false }));
        return;
      }

      try {
        const apiService = require("app/apiService").default;
        const response = await apiService.get(
          "/workmanagement/yeucau/my-permissions"
        );

        if (response.data.success) {
          const permissions = response.data.data;
          setRoles({
            isNguoiDieuPhoi: permissions.isNguoiDieuPhoi,
            isQuanLyKhoa: permissions.isQuanLyKhoa,
            khoaID: permissions.khoaID,
            tenKhoa: permissions.tenKhoa,
            danhSachKhoaDieuPhoi: permissions.danhSachKhoaDieuPhoi || [],
            isAdmin: ["admin", "superadmin"].includes(
              user?.PhanQuyen?.toLowerCase()
            ),
            loading: false,
          });
        }
      } catch (error) {
        console.error("Error loading permissions:", error);
        setRoles((prev) => ({ ...prev, loading: false }));
      }
    };

    loadPermissions();
  }, [user?.NhanVienID, user?.PhanQuyen]);

  return roles;
}

/**
 * Hook tính toán badge counts cho menu với API polling
 */
export function useYeuCauBadgeCounts() {
  const { user } = useAuth();
  const nhanVienId = user?.NhanVienID;
  const [badgeCounts, setBadgeCounts] = useState({
    toiGui: 0,
    xuLy: 0,
    dieuPhoi: 0,
    quanLyKhoa: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!nhanVienId) {
      setLoading(false);
      return;
    }

    let intervalId;

    const fetchBadgeCounts = async () => {
      try {
        const apiService = require("app/apiService").default;
        const response = await apiService.get(
          "/workmanagement/yeucau/badge-counts"
        );
        if (response.data.success) {
          setBadgeCounts(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching badge counts:", error);
      } finally {
        setLoading(false);
      }
    };

    // Load immediately
    fetchBadgeCounts();

    // Poll every 30 seconds
    intervalId = setInterval(fetchBadgeCounts, 30000);

    // Cleanup on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [nhanVienId]);

  return {
    ...badgeCounts,
    loading,
  };
}
