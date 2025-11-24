// Centralized permission helpers for CongViec
// Purpose: keep FE logic aligned with BE authorization rules

export const canDeleteCongViec = ({
  congViec,
  currentUserRole,
  currentUserNhanVienId,
}) => {
  if (!congViec) return false;
  const isAdmin =
    currentUserRole === "admin" || currentUserRole === "superadmin";
  const isOwner =
    currentUserNhanVienId &&
    congViec?.NguoiGiaoViecID &&
    String(currentUserNhanVienId) === String(congViec.NguoiGiaoViecID);
  const completed = congViec.TrangThai === "HOAN_THANH";

  if (completed && !isAdmin) return false; // only admin may delete completed
  return isAdmin || isOwner;
};

export const canEditCongViec = ({
  congViec,
  currentUserRole,
  currentUserNhanVienId,
}) => {
  if (!congViec) return false;
  const isAdmin =
    currentUserRole === "admin" || currentUserRole === "superadmin";
  const isOwner =
    currentUserNhanVienId &&
    congViec?.NguoiGiaoViecID &&
    String(currentUserNhanVienId) === String(congViec.NguoiGiaoViecID);

  // CHỈ Owner hoặc Admin mới được mở CongViecFormDialog
  return isAdmin || isOwner;
};

// NEW: Hàm trả về thông báo tooltip khi không có quyền edit
export const getEditDisabledReason = ({
  congViec,
  currentUserRole,
  currentUserNhanVienId,
}) => {
  if (!congViec) return "Không tìm thấy công việc";

  const isAdmin =
    currentUserRole === "admin" || currentUserRole === "superadmin";
  const isOwner =
    currentUserNhanVienId &&
    congViec?.NguoiGiaoViecID &&
    String(currentUserNhanVienId) === String(congViec.NguoiGiaoViecID);

  if (isAdmin || isOwner) return null; // có quyền, không cần hiển thị lý do

  return "Chỉ người giao việc hoặc quản trị viên mới có quyền chỉnh sửa cấu hình công việc";
};

// NEW: Hàm trả về thông báo tooltip khi không có quyền delete
export const getDeleteDisabledReason = ({
  congViec,
  currentUserRole,
  currentUserNhanVienId,
}) => {
  if (!congViec) return "Không tìm thấy công việc";

  const isAdmin =
    currentUserRole === "admin" || currentUserRole === "superadmin";
  const isOwner =
    currentUserNhanVienId &&
    congViec?.NguoiGiaoViecID &&
    String(currentUserNhanVienId) === String(congViec.NguoiGiaoViecID);
  const completed = congViec.TrangThai === "HOAN_THANH";

  // Kiểm tra công việc đã hoàn thành
  if (completed && !isAdmin) {
    return "Chỉ quản trị viên mới có quyền xóa công việc đã hoàn thành";
  }

  // Kiểm tra quyền sở hữu
  if (!(isAdmin || isOwner)) {
    return "Chỉ người giao việc hoặc quản trị viên mới có quyền xóa";
  }

  return null; // có quyền, không cần hiển thị lý do
};
