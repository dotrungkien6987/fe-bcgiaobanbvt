// Centralized permission helpers for CongViec
// Purpose: keep FE logic aligned with BE authorization rules

export const canDeleteCongViec = ({
  congViec,
  currentUserRole,
  currentUserNhanVienId,
}) => {
  if (!congViec) return false;
  const isAdmin = currentUserRole === "admin";
  const isManager = currentUserRole === "manager";
  const isOwner =
    currentUserNhanVienId &&
    congViec?.NguoiGiaoViecID &&
    String(currentUserNhanVienId) === String(congViec.NguoiGiaoViecID);
  const completed = congViec.TrangThai === "HOAN_THANH";
  if (completed && !isAdmin) return false; // only admin may delete completed
  return isAdmin || isManager || isOwner;
};

export const canEditCongViec = ({
  congViec,
  currentUserRole,
  currentUserNhanVienId,
}) => {
  if (!congViec) return false;
  const isAdmin = currentUserRole === "admin";
  const isManager = currentUserRole === "manager";
  const isInvolved =
    currentUserNhanVienId &&
    [congViec.NguoiGiaoViecID, congViec.NguoiChinhID]
      .filter(Boolean)
      .map(String)
      .includes(String(currentUserNhanVienId));
  return isAdmin || isManager || isInvolved;
};
